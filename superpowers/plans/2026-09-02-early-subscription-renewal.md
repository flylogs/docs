# Early Subscription Renewal Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Move the real Revolut renewal charge for yearly premium subscriptions ~2 months earlier than expiration (with a one-time bridge for subscriptions already inside that window), notify managers before and after each attempt, and surface subscription status in the admin panel.

**Architecture:** Backend (flylogs, CakePHP): shorten the native Revolut billing cycle to `P10M` for new/renewing subscriptions, add a `checkEarlyRenewals()` cron leg that fires a merchant-initiated one-time charge for subscriptions already inside the `-90..-83` day window (with its own retry/notify state machine), and expose `PaymentSubscription` in the two admin JSON endpoints. Frontend (neo, React/TS): a small pure status-label helper (TDD'd), a list-page column, and a detail-page card.

**Tech Stack:** CakePHP 1.x (flylogs), Revolut Merchant API `2024-09-01` (curl via `RevolutSubscriptionService`), React + TypeScript + Vite (neo), `bun:test` for frontend unit tests, MySQL.

**Spec:** `docs/superpowers/specs/2026-09-01-early-subscription-renewal-design.md`

## Global Constraints

- Yearly plans only (`billing_interval = 'year'`). Monthly is untouched — do not add early-renewal logic to any monthly code path.
- Never call `change-renewal-date` with a date earlier than the subscription's current renewal date — Revolut rejects it (`subscription_cycle_end_date_too_early`). Only ever push it later.
- Notification recipients for the two new email variants are `user_group_id IN (100, 130)` only — NOT `1`, unlike the existing `-60/-30/-15/-2` day cascade which uses `(1, 100, 130)`.
- Before writing or running any SQL migration, verify the live `payment_subscriptions` schema with `SHOW CREATE TABLE payment_subscriptions;` first — do not assume column names/types from the CakePHP model (per this repo's standing rule: no schema dump in-repo, live DB is the source of truth).
- No PHP test framework exists in this codebase for this domain (verified: 3 stray files under `app/`, no CakeTestCase suite for controllers/services). PHP tasks are verified by manual/curl/log inspection against the dev environment, not unit tests. The one frontend logic module this plan adds gets a real `bun:test` unit test, mirroring the existing `attendanceStatus.ts` / `attendanceStatus.test.ts` pattern — that convention exists and applies here.
- All new i18n keys go in all 7 locale files (`en/de/es/fr/it/pt/pl`) — `en` is `fallbackLng`, a key missing from it leaks the raw dotted key into every language.
- Never commit or push. Every task ends with an explicit note of what changed — the user runs git themselves.

---

## File Structure

**flylogs (backend):**
- `migrations/payment_subscription_early_renewal_migration.sql` — new columns (Task 1)
- `app/Lib/Payment/RevolutSubscriptionService.php` — cycle change, reset hooks, new `attemptEarlyRenewal()` orchestrator + its Revolut API helpers (Tasks 2, 3)
- `app/View/Emails/text/admin/early_renewal_attempt.ctp`, `.../early_renewal_failed.ctp` (+ `html/` equivalents) — new (Task 4)
- `app/Controller/CronsController.php` — new `checkEarlyRenewals()` private method + `day()` wiring (Task 5)
- `app/Console/Command/RevolutPlansShell.php` — new `migrateEarlyRenewal()` command (Task 6)
- `app/Controller/CompaniesController.php` — `admin_index()` (:2597) and `admin_view()` (:2742) gain `PaymentSubscription` data (Task 7)

**neo (frontend):**
- `src/web/lib/subscriptionStatus.ts` + `subscriptionStatus.test.ts` — new (Task 8)
- `src/web/pages/admin/companies/AdminCompaniesPage.tsx` — new column (Task 9)
- `src/web/pages/admin/companies/AdminCompanyViewPage.tsx` — new subscription card (Task 9)
- `src/web/i18n/locales/{en,de,es,fr,it,pt,pl}.json` — new keys (Task 9)

---

### Task 1: Database migration — early-renewal tracking columns

**Files:**
- Create: `flylogs/migrations/payment_subscription_early_renewal_migration.sql`

**Interfaces:**
- Produces: `payment_subscriptions.early_renewal_attempts` (tinyint unsigned, default 0), `payment_subscriptions.early_renewal_started_at` (int unsigned, nullable) — every later PHP task that touches `PaymentSubscription` reads/writes these two exact column names.

- [ ] **Step 1: Verify the live schema before writing the migration**

Run against the local dev DB (per `flylogs/docker/`, `mysqldb` root/flylogs):

```bash
docker exec -it <mysql-container> mysql -uroot -pflylogs -e "SHOW CREATE TABLE payment_subscriptions;" flylogs
```

Confirm `last_error` is a real column (it's read/written throughout `RevolutSubscriptionService.php` — `bookCycleInvoice()`, `finalizeSetupOrder()`, `reconcileSubscriptionPrices()` in `CronsController.php` — so it should exist). If the live table differs from what those call sites assume, stop and reconcile before writing the `ALTER TABLE` — do not guess.

- [ ] **Step 2: Write the migration**

```sql
-- payment_subscription_early_renewal_migration.sql
-- Tracks the -90-day bridge's attempt state (spec: docs/superpowers/specs/2026-09-01-early-subscription-renewal-design.md, part 3).
-- Both columns reset to their defaults on a successful renewal or cancellation.

ALTER TABLE `payment_subscriptions`
  ADD COLUMN `early_renewal_attempts` TINYINT UNSIGNED NOT NULL DEFAULT 0 AFTER `last_error`,
  ADD COLUMN `early_renewal_started_at` INT UNSIGNED NULL DEFAULT NULL AFTER `early_renewal_attempts`;
```

(Adjust the `AFTER` anchor if Step 1 found a different real column name in that position — the goal is valid SQL against the *actual* table, not this exact text.)

- [ ] **Step 3: Run it against local dev and verify**

```bash
docker exec -it <mysql-container> mysql -uroot -pflylogs flylogs < flylogs/migrations/payment_subscription_early_renewal_migration.sql
docker exec -it <mysql-container> mysql -uroot -pflylogs -e "DESCRIBE payment_subscriptions;" flylogs | grep early_renewal
```

Expected: both columns listed, `early_renewal_attempts` type `tinyint(3) unsigned`, default `0`; `early_renewal_started_at` type `int(10) unsigned`, nullable, default `NULL`.

- [ ] **Step 4: Note what changed**

This is a new migration file plus a schema change applied to the local dev DB only — per [[feedback_never_push]] and [[feedback_migrations_folder]], leave it uncommitted and do NOT run it against prod; that happens separately when the user is ready (matches every other pending migration already sitting in this file's siblings).

---

### Task 2: RevolutSubscriptionService — shorten the native cycle, reset hooks

**Files:**
- Modify: `flylogs/app/Lib/Payment/RevolutSubscriptionService.php:100` (`createPlanVariation`), `:350` (`bookCycleInvoice`'s `PaymentSubscription->save()`), `:474` (`finalizeSetupOrder`'s `PaymentSubscription->save()`), `:505` (`applyLifecycleEvent`'s cancel-path `PaymentSubscription->save()`)

**Interfaces:**
- Consumes: Task 1's `early_renewal_attempts` / `early_renewal_started_at` columns.
- Produces: `createPlanVariation($name, $amount, 'year', $currency)` now creates a `P10M`-cycle variation (was `P1Y`); every successful-renewal or cancellation code path resets the two new columns to their defaults, so Task 3/5's state machine always starts clean after a real renewal.

- [ ] **Step 1: Change the cycle mapping**

In `createPlanVariation()`:

```php
// before
$cycle = ($interval === 'month') ? 'P1M' : 'P1Y';

// after
$cycle = ($interval === 'month') ? 'P1M' : 'P10M';
```

- [ ] **Step 2: Reset the tracking columns on every successful renewal and on cancellation**

In `bookCycleInvoice()`, the existing call:

```php
$this->PaymentSubscription->save(array('id' => $ps['id'], 'status' => 'active', 'next_charge' => $newExpiration, 'last_error' => null));
```

becomes:

```php
$this->PaymentSubscription->save(array(
    'id' => $ps['id'], 'status' => 'active', 'next_charge' => $newExpiration, 'last_error' => null,
    'early_renewal_attempts' => 0, 'early_renewal_started_at' => null
));
```

Apply the identical addition to the matching `PaymentSubscription->save()` call inside `finalizeSetupOrder()`.

In `applyLifecycleEvent()`'s cancel branch:

```php
// before
$this->PaymentSubscription->save(array('id' => $id, 'status' => 'canceled', 'next_charge' => null));

// after
$this->PaymentSubscription->save(array(
    'id' => $id, 'status' => 'canceled', 'next_charge' => null,
    'early_renewal_attempts' => 0, 'early_renewal_started_at' => null
));
```

- [ ] **Step 3: Verify against the Revolut sandbox**

Run the existing one-off shell (Task 6 will add a sibling command, but this step verifies Task 2 in isolation first):

```bash
cd flylogs && ./cake RevolutPlans setup
```

Expected: the printed variation ids succeed same as before; inspect one via `getOrder`-adjacent debugging or the Revolut sandbox dashboard's Subscriptions → Plans screen and confirm the new `premium`/`year` variation shows a 10-month billing cycle (not 12). Do NOT paste these ids into `app/Config/revolut.php` yet — Task 6 needs to run first so the *existing* catalogue variation id it reads is still the old `P1Y` one.

- [ ] **Step 4: Note what changed**

`RevolutSubscriptionService.php` edited (cycle mapping + 3 reset call sites). Not committed.

---

### Task 3: RevolutSubscriptionService — the early-renewal charge engine

**Files:**
- Modify: `flylogs/app/Lib/Payment/RevolutSubscriptionService.php` (append new methods after `applyLifecycleEvent()`)

**Interfaces:**
- Consumes: Task 2's `P10M`-producing `createPlanVariation()`; `Configure::read('revolut.plan_variations.premium.year')`; `Company.plans` array (`Company->plans`, already used elsewhere in this class and in `CompaniesController::admin_subscription()`); `apiSurcharge($plan, $apiEnabled)` (existing `Company` method, already used in `admin_subscription()` at `CompaniesController.php:3089`).
- Produces: `public function attemptEarlyRenewal($paymentSubscriptionId)` → `array('success' => bool, 'payment_id' => string|null, 'error' => string|null)`. This is the ONLY method Task 5's cron leg calls — it does the full charge-and-book-or-fail cycle in one call, mirroring how `bookCycleInvoice()`/`finalizeSetupOrder()` already own their entire booking transaction rather than splitting it across caller and service.

Revolut API shape used here (verified against `revolut-openapi` `2024-09-01`, not guessed — see spec's "Background" section):
- `GET /customers/{id}/payment-methods` → `{"payment_methods": [{"type": "card"|"revolut_pay"|"sepa_direct_debit", "id": "...", ...}]}`
- `POST /orders` → `{amount, currency, customer: {id}, description}` → `{"id": "...", "state": "pending", ...}`
- `POST /orders/{order_id}/payments` → `{saved_payment_method: {type, id, initiator: "merchant"}}` → `{"state": "completed"|..., ...}` (no `environment` field needed — the spec's note is explicit: `environment` is "Only required if `initiator: customer`")
- `POST /subscriptions/{id}/change-renewal-date` → `{renewal_date: "<ISO 8601 UTC>"}` → `204` on success
- `POST /subscriptions/{id}/change-plan` → `{plan_variation_id: "..."}` → success on `< 300`

- [ ] **Step 1: Add the four small Revolut API wrappers**

Append to `RevolutSubscriptionService.php`, after `applyLifecycleEvent()`:

```php
	/* --------------------------------------------------- early renewal */

	/**
	 * getCustomerPaymentMethods function.
	 *
	 * @param string $customerId
	 * @return array list of {type, id, ...} — empty array on failure or none saved
	 */
	public function getCustomerPaymentMethods($customerId){
		$res = $this->request('GET', '/customers/'.$customerId.'/payment-methods');
		if($res['status'] >= 300 || empty($res['body']['payment_methods']))
			return array();
		return $res['body']['payment_methods'];
	}

	/**
	 * changeRenewalDate function.
	 *
	 * Push a subscription's current cycle end date LATER (Revolut rejects any
	 * date earlier than the current renewal date).
	 *
	 * @param string $subscriptionId
	 * @param string $isoDateTime UTC, e.g. '2027-06-01T00:00:00Z'
	 * @return bool
	 */
	public function changeRenewalDate($subscriptionId, $isoDateTime){
		$res = $this->request('POST', '/subscriptions/'.$subscriptionId.'/change-renewal-date', array(
			'renewal_date' => $isoDateTime
		));
		if($res['status'] >= 300)
			CakeLog::write('payments','REVOLUT EARLY RENEWAL change-renewal-date failed for '.$subscriptionId.': '.json_encode($res['body']));
		return $res['status'] < 300;
	}

	/**
	 * changePlan function.
	 *
	 * Schedules a plan-variation switch, effective at_cycle_end per Revolut's
	 * own semantics (not immediate).
	 *
	 * @param string $subscriptionId
	 * @param string $planVariationId
	 * @return bool
	 */
	public function changePlan($subscriptionId, $planVariationId){
		$res = $this->request('POST', '/subscriptions/'.$subscriptionId.'/change-plan', array(
			'plan_variation_id' => $planVariationId
		));
		if($res['status'] >= 300)
			CakeLog::write('payments','REVOLUT EARLY RENEWAL change-plan failed for '.$subscriptionId.': '.json_encode($res['body']));
		return $res['status'] < 300;
	}

	/**
	 * chargeCustomerNow function.
	 *
	 * Merchant-initiated (no customer redirect) one-time charge against a
	 * saved payment method: create the order, then pay it.
	 *
	 * @param string $customerId
	 * @param string $paymentMethodType 'card' | 'revolut_pay' | 'sepa_direct_debit'
	 * @param string $paymentMethodId
	 * @param int    $amountMinor minor currency units (cents)
	 * @param string $currency
	 * @param string $description
	 * @param string|null &$error out: Revolut error/state code on failure
	 * @return string|null the completed order id, or null on failure
	 */
	public function chargeCustomerNow($customerId, $paymentMethodType, $paymentMethodId, $amountMinor, $currency, $description, &$error = null){
		$order = $this->request('POST', '/orders', array(
			'amount'      => (int)$amountMinor,
			'currency'    => $currency,
			'customer'    => array('id' => $customerId),
			'description' => $description
		));
		if($order['status'] >= 300 || empty($order['body']['id'])){
			$error = isset($order['body']['code']) ? $order['body']['code'] : 'order_create_failed';
			CakeLog::write('payments','REVOLUT EARLY RENEWAL order create failed: '.json_encode($order['body']));
			return null;
		}
		$orderId = $order['body']['id'];

		$pay = $this->request('POST', '/orders/'.$orderId.'/payments', array(
			'saved_payment_method' => array(
				'type'      => $paymentMethodType,
				'id'        => $paymentMethodId,
				'initiator' => 'merchant'
			)
		));
		$state = isset($pay['body']['state']) ? $pay['body']['state'] : null;
		if($pay['status'] >= 300 || $state !== 'completed'){
			$error = isset($pay['body']['code']) ? $pay['body']['code'] : ($state ?: 'payment_failed');
			CakeLog::write('payments','REVOLUT EARLY RENEWAL charge failed for order '.$orderId.': '.json_encode($pay['body']));
			return null;
		}
		return $orderId;
	}
```

- [ ] **Step 2: Add the orchestrator**

Append directly after:

```php
	/**
	 * attemptEarlyRenewal function.
	 *
	 * The bridge for a company already inside its -90-day window on a
	 * still-P1Y subscription (see spec part 3): fires one merchant-initiated
	 * charge attempt. On success, books the payment, extends expiration by a
	 * year, pushes the OLD subscription's cycle out so it can't also fire
	 * (change-renewal-date only allows moving later — exactly this case),
	 * migrates it onto the new P10M variation, and clears the attempt
	 * counters. On failure, touches nothing but the caller's counters — the
	 * old subscription is untouched and may still succeed on its own later,
	 * same as today.
	 *
	 * @param string $paymentSubscriptionId
	 * @return array ('success' => bool, 'payment_id' => string|null, 'error' => string|null)
	 */
	public function attemptEarlyRenewal($paymentSubscriptionId){

		$sub = $this->PaymentSubscription->find('first', array(
			'conditions' => array('PaymentSubscription.id' => $paymentSubscriptionId)
		));
		if(empty($sub))
			return array('success' => false, 'payment_id' => null, 'error' => 'subscription_not_found');
		$ps = $sub['PaymentSubscription'];

		$company = $this->Company->find('first', array(
			'conditions' => array('Company.id' => $ps['company_id']),
			'fields' => array('id','name','plan','price','expiration','api'),
			'contain' => array(
				'CompanyDetail' => array(
					'revolut_id','address','city','zip','country_id','vat_valid','vat_number',
					'Country.vat_liable'
				)
			)
		));
		if(empty($company) || empty($company['CompanyDetail']['revolut_id']))
			return array('success' => false, 'payment_id' => null, 'error' => 'no_revolut_customer');

		$customerId = $company['CompanyDetail']['revolut_id'];

		$methods = $this->getCustomerPaymentMethods($customerId);
		if(empty($methods))
			return array('success' => false, 'payment_id' => null, 'error' => 'no_payment_method');
		// Most-recently-added method first is the working assumption for the
		// order the Merchant API returns these in (spec's open question) —
		// there's exactly one candidate in practice today (one card per
		// customer), so this doesn't yet need to be smarter.
		$method = $methods[0];

		// Same price/VAT computation as CompaniesController::admin_subscription().
		$price = $this->Company->plans[$ps['plan']]['pricing'];
		if(!empty($company['Company']['price'])) $price = $company['Company']['price'];
		$price += $this->Company->apiSurcharge($ps['plan'], !empty($company['Company']['api']));

		$taxRate = Configure::read('tax');
		if(
			!$company['CompanyDetail']['Country']['vat_liable'] ||
			($company['CompanyDetail']['vat_valid'] && $company['CompanyDetail']['country_id'] != 199)
		){
			$taxRate = 0;
		}
		$tax   = number_format(ceil(($price*(1+($taxRate/100))-$price)*100)/100, 2, '.', '');
		$total = number_format($price+$tax, 2, '.', '');
		$amountMinor = (int)round($total * 100);

		$error = null;
		$orderId = $this->chargeCustomerNow(
			$customerId, $method['type'], $method['id'], $amountMinor, 'EUR',
			'Flylogs '.ucwords($ps['plan']).' - 1 year (early renewal)', $error
		);
		if(empty($orderId))
			return array('success' => false, 'payment_id' => null, 'error' => $error ?: 'charge_failed');

		$order = $this->getOrder($orderId);
		$paidGross = isset($order['amount']) ? $order['amount'] / 100 : (float)$total;

		$prev = $this->Payment->find('first', array(
			'conditions' => array('Payment.company_id' => $company['Company']['id'], 'Payment.status' => 'succeeded'),
			'order' => 'Payment.created desc',
			'contain' => false
		));
		$snap = !empty($prev) ? $prev['Payment'] : array();

		$data = array(
			'company_id'      => $company['Company']['id'],
			'user_id'         => isset($snap['user_id']) ? $snap['user_id'] : null,
			'plan'            => $ps['plan'],
			'period'          => 'year',
			'company_name'    => $company['Company']['name'],
			'company_vat'     => $company['CompanyDetail']['vat_number'],
			'company_address' => $company['CompanyDetail']['address'],
			'company_city'    => $company['CompanyDetail']['city'],
			'zip'             => $company['CompanyDetail']['zip'],
			'country_id'      => $company['CompanyDetail']['country_id'],
			'name'            => 'Flylogs '.ucwords($ps['plan']).' - 1 year (early renewal)',
			'method'          => 'revolut',
			'amount'          => $price,
			'tax_rate'        => $taxRate,
			'tax'             => $tax,
			'total'           => $paidGross,
			'paid'            => $paidGross,
			'tx_id'           => $orderId,
			'intent_id'       => $ps['revolut_subscription_id'],
			'start'           => date('Y-m-d'),
			'end'             => date('Y-m-d', strtotime('+1 year')),
			'status'          => 'succeeded'
		);

		$saved = $this->Payment->assignNextIdNumber($data);
		if(empty($saved))
			return array('success' => false, 'payment_id' => null, 'error' => 'payment_save_failed');
		$paymentId = $saved['Payment']['id'];
		$nId       = $saved['Payment']['n_id'];

		$hash = Security::hash(time().$paymentId.$nId.$paidGross.$ps['plan'], 'sha256', true);
		$this->Payment->save(array('id' => $paymentId, 'hash' => $hash));

		$expiration = (empty($company['Company']['expiration']) || $company['Company']['expiration'] < time())
			? time() : $company['Company']['expiration'];
		$newExpiration = $expiration + YEAR;
		$this->Company->save(array('id' => $company['Company']['id'], 'expiration' => $newExpiration));

		// Push the OLD subscription's cycle out so it can't also fire near its
		// original date (change-renewal-date only allows moving later).
		$this->changeRenewalDate($ps['revolut_subscription_id'], gmdate('Y-m-d\TH:i:s\Z', $newExpiration));

		// Migrate it onto the new P10M cadence for future cycles.
		$isCustom = !empty($company['Company']['price']) && (float)$company['Company']['price'] > 0
			&& (float)$company['Company']['price'] != (float)$this->Company->plans[$ps['plan']]['pricing'];
		if($isCustom){
			$label = 'Flylogs '.ucfirst($ps['plan']).' yearly ('.$company['Company']['id'].')';
			$newVariationId = $this->createPlanVariation($label, (int)round($total * 100), 'year');
		}else{
			$newVariationId = Configure::read('revolut.plan_variations.'.$ps['plan'].'.year');
		}
		if(!empty($newVariationId))
			$this->changePlan($ps['revolut_subscription_id'], $newVariationId);

		$this->PaymentSubscription->save(array(
			'id' => $ps['id'], 'status' => 'active', 'next_charge' => $newExpiration, 'last_error' => null,
			'early_renewal_attempts' => 0, 'early_renewal_started_at' => null,
			'plan_variation_id' => !empty($newVariationId) ? $newVariationId : $ps['plan_variation_id']
		));

		$this->Payment->notifyAdministrators($paymentId);

		App::uses('InvoiceMailer','Lib/Payment');
		try {
			$mailer = new InvoiceMailer();
			$mailer->sendForPayment($paymentId);
		} catch (\Exception $e) {
			CakeLog::write('payments','INVOICE email failed (early renewal) '.$paymentId.': '.$e->getMessage());
		}

		CakeLog::write('payments','REVOLUT EARLY RENEWAL booked: company '.$company['Company']['id'].' n_id '.$nId.' gross '.$paidGross.' new expiration '.date('Y-m-d',$newExpiration));

		return array('success' => true, 'payment_id' => $paymentId, 'error' => null);
	}
```

- [ ] **Step 3: Verify against the Revolut sandbox with a real dev company**

Pick a dev company with an active native subscription and a saved card (e.g. re-use the Akagera-style test data from this session, or any company that completed the Task-2-verified sandbox checkout). From `cake console` or a scratch script:

```php
App::uses('RevolutSubscriptionService', 'Lib/Payment');
$service = new RevolutSubscriptionService();
$result = $service->attemptEarlyRenewal('<payment_subscription_id>');
var_dump($result);
```

Expected: `array('success' => true, 'payment_id' => '<uuid>', 'error' => null)`. Then confirm in the DB: `SELECT expiration, price FROM companies WHERE id = '<company_id>';` shows the extended expiration, and `SELECT * FROM payment_subscriptions WHERE id = '<payment_subscription_id>';` shows `early_renewal_attempts = 0`, `early_renewal_started_at IS NULL`, and a new `plan_variation_id`. Check the `payments` log (`CakeLog`) for the `REVOLUT EARLY RENEWAL booked` line.

Also test the failure path once (temporarily point `getCustomerPaymentMethods` at a customer with no saved method, or a customer id that 404s) and confirm `array('success' => false, ...)` with a populated `error`, and that `companies.expiration` and `payment_subscriptions` are untouched.

- [ ] **Step 4: Note what changed**

`RevolutSubscriptionService.php` gained 5 new public methods. Not committed.

---

### Task 4: Email templates — attempt notice and manual-renewal-needed notice

**Files:**
- Create: `flylogs/app/View/Emails/text/admin/early_renewal_attempt.ctp`
- Create: `flylogs/app/View/Emails/html/admin/early_renewal_attempt.ctp`
- Create: `flylogs/app/View/Emails/text/admin/early_renewal_failed.ctp`
- Create: `flylogs/app/View/Emails/html/admin/early_renewal_failed.ctp`

**Interfaces:**
- Consumes: view vars `$user` (recipient, shape matches `admin/premium_expiration.ctp`'s usage: `$user['UserDetail']['name']`, `$user['UserDetail']['surname']`, `$user['Company']['name']`), `$expiration` (unix timestamp, the *current* expiration before this cycle's extension — i.e. the date the manual fallback needs to beat).
- Produces: template names `admin/early_renewal_attempt` and `admin/early_renewal_failed`, passed to `FlylogsEmail->template()` by Task 5.

- [ ] **Step 1: Text templates**

```php
<?php
// early_renewal_attempt.ctp (text)
$expirationDate = date('d-m-Y', $expiration);
?>
Hello <?php echo $user['UserDetail']['name'].' '.$user['UserDetail']['surname'];?>

We are about to attempt the automatic renewal of the Flylogs Premium subscription for <?php echo $user['Company']['name'];?>, ahead of its <?php echo $expirationDate;?> expiration.

No action is needed right now. We will charge your saved payment method over the next few days and email you the invoice once it succeeds. If we are unable to process the payment, we will follow up so you can renew manually before the subscription actually expires.

--


*** Flylogs Premium ***


--


If this email is not expected or you think there is any error, please let us know at support@flylogs.com so we can help.

------------------

Flylogs Support team
```

```php
<?php
// early_renewal_failed.ctp (text)
$expirationDate = date('d-m-Y', $expiration);
?>
Hello <?php echo $user['UserDetail']['name'].' '.$user['UserDetail']['surname'];?>

We were unable to automatically renew the Flylogs Premium subscription for <?php echo $user['Company']['name'];?> after several attempts.

Your subscription is still active until <?php echo $expirationDate;?>, but auto-renewal did not go through. Please renew manually from your account before that date to avoid any interruption.

https://neo.flylogs.com/manager/companies/services

--


*** Flylogs Premium ***


--


If this email is not expected or you think there is any error, please let us know at support@flylogs.com so we can help.

------------------

Flylogs Support team
```

- [ ] **Step 2: HTML templates**

```php
<?php
// early_renewal_attempt.ctp (html)
$expirationDate = date('M jS Y', $expiration);
?>
<p style="margin:0 0 24px;">Dear <?php echo $user['UserDetail']['name'].' '.$user['UserDetail']['surname'];?>,</p>

<div style="background:#eff6ff;border-left:4px solid #3b82f6;padding:16px 20px;border-radius:0 8px 8px 0;margin:24px 0;">
	<p style="margin:0;font-size:15px;">
		We are about to attempt the automatic renewal of the <strong>Flylogs Premium</strong> subscription for <strong><?php echo $user['Company']['name'];?></strong>, ahead of its <strong><?php echo $expirationDate;?></strong> expiration.
	</p>
</div>

<p style="color:#4b5563;"><strong>No action is needed right now.</strong> We will charge your saved payment method over the next few days and email you the invoice once it succeeds. If we are unable to process the payment, we will follow up so you can renew manually before the subscription actually expires.</p>

<p style="color:#4b5563;font-size:14px;">Questions? Contact us at <a href="mailto:support@flylogs.com" style="color:#2563eb;">support@flylogs.com</a>.</p>

<p style="color:#4b5563;">Flylogs Support team</p>
```

```php
<?php
// early_renewal_failed.ctp (html)
$expirationDate = date('M jS Y', $expiration);
?>
<p style="margin:0 0 24px;">Dear <?php echo $user['UserDetail']['name'].' '.$user['UserDetail']['surname'];?>,</p>

<div style="background:#fee2e2;border-left:4px solid #ef4444;padding:16px 20px;border-radius:0 8px 8px 0;margin:24px 0;">
	<p style="margin:0;font-size:15px;">
		We were unable to automatically renew the <strong>Flylogs Premium</strong> subscription for <strong><?php echo $user['Company']['name'];?></strong> after several attempts.
	</p>
</div>

<p style="color:#4b5563;">Your subscription is still active until <strong><?php echo $expirationDate;?></strong>, but auto-renewal did not go through. Please renew manually from your account before that date to avoid any interruption.</p>

<p style="text-align:center;margin:32px 0;">
	<a style="color:#ffffff;font-weight:600;display:inline-block;text-align:center;padding:14px 32px;text-decoration:none;font-size:16px;background:#2563eb;border-radius:8px;line-height:1.4;" href="https://neo.flylogs.com/manager/companies/services">Renew now</a>
</p>

<p style="color:#4b5563;font-size:14px;">Questions? Contact us at <a href="mailto:support@flylogs.com" style="color:#2563eb;">support@flylogs.com</a>.</p>

<p style="color:#4b5563;">Flylogs Support team</p>
```

- [ ] **Step 3: Verify by sending a test copy**

Using a scratch script or `cake console`:

```php
App::uses('FlylogsEmail', 'Lib/Email');
$email = new FlylogsEmail('default');
$email->company('<a dev company id>')
    ->template('admin/early_renewal_attempt', 'default')
    ->from(array(WEB_EMAIL => TITLE))
    ->subject('Test: early renewal attempt')
    ->to(array('you@example.com' => 'Test'))
    ->viewVars(array('user' => array('UserDetail' => array('name' => 'Test', 'surname' => 'User'), 'Company' => array('name' => 'Test Co')), 'expiration' => strtotime('+90 days')));
$email->send();
```

Expected: email arrives, renders correctly in both text and HTML clients, no PHP notices in the log for undefined `$user`/`$expiration` keys. Repeat for `admin/early_renewal_failed`.

- [ ] **Step 4: Note what changed**

4 new template files. Not committed.

---

### Task 5: CronsController — the `-90` day bridge cron leg

**Files:**
- Modify: `flylogs/app/Controller/CronsController.php` (new private method after `checkExpiringSubscriptions()`, and one new line in `day()` at `:552-564`)

**Interfaces:**
- Consumes: Task 3's `attemptEarlyRenewal($paymentSubscriptionId)`; Task 4's two template names; `payment_subscriptions.early_renewal_attempts` / `early_renewal_started_at` (Task 1).
- Produces: `checkEarlyRenewals()` returns an int (count of companies processed this run), matching the return-count convention of every sibling method in this file (`checkExpiringSubscriptions()` returns `count($companies)`).

- [ ] **Step 1: Add the method**

Insert after `checkExpiringSubscriptions()` (after its closing brace, before `reconcileSubscriptionPrices()`):

```php
	/**
	 * checkEarlyRenewals function.
	 *
	 * The -90-day bridge (spec: docs/superpowers/specs/2026-09-01-early-subscription-renewal-design.md,
	 * part 3) for yearly subscriptions still on the old P1Y cadence and
	 * already inside their -90..-83 day window. First run: notify + attempt.
	 * Subsequent runs within 7 days / 3 attempts: retry silently. After that:
	 * notify "renew manually" and stop — the -60 day cascade in
	 * checkExpiringSubscriptions() takes over from there as it does today.
	 *
	 * @return int companies processed this run
	 */
	private function checkEarlyRenewals(){

		$this->loadModel('Company');
		$this->loadModel('PaymentSubscription');

		$companies = $this->Company->find('all', array(
			'conditions' => array(
				'active' => true,
				'disabled' => false,
				'plan <>' => 'free',
				'expiration <>' => NULL,
				'expiration <' => strtotime('+90 days'),
				'expiration >' => strtotime('+83 days')
			),
			'fields' => array('id','name','expiration'),
			'contain' => array(
				'User' => array(
					'fields' => array('email'),
					'conditions' => array(
						'active' => TRUE,
						'api' => FALSE,
						'deleted' => FALSE,
						'user_group_id IN' => array(100, 130)
					),
					'UserDetail.name',
					'UserDetail.surname'
				)
			)
		));

		if(empty($companies)) return 0;

		App::uses('RevolutSubscriptionService','Lib/Payment');
		$service = new RevolutSubscriptionService();

		$processed = 0;

		foreach($companies as $company){

			$sub = $this->PaymentSubscription->find('first', array(
				'conditions' => array(
					'PaymentSubscription.company_id' => $company['Company']['id'],
					'PaymentSubscription.billing_interval' => 'year',
					'PaymentSubscription.status' => array('active','past_due')
				)
			));
			if(empty($sub)) continue; // no native yearly subscription -> not this bridge's concern
			$ps = $sub['PaymentSubscription'];

			$now = time();
			$isFirstAttempt = empty($ps['early_renewal_started_at']);
			$withinWindow = !$isFirstAttempt && ($now - $ps['early_renewal_started_at']) < (7 * DAY);
			$attemptsLeft = !$isFirstAttempt && (int)$ps['early_renewal_attempts'] < 3;

			if(!$isFirstAttempt && !($withinWindow && $attemptsLeft)){
				// Exhausted: notify "renew manually" once, then stop touching it
				// here — checkExpiringSubscriptions()'s -60 day tier picks it up.
				if((int)$ps['early_renewal_attempts'] >= 3 || !$withinWindow){
					if((int)$ps['early_renewal_attempts'] > 0){ // only notify once, not every day after
						foreach($company['User'] as $user){
							$user['Company'] = $company['Company'];
							$this->_sendEarlyRenewalEmail($user, $company['Company']['expiration'], 'admin/early_renewal_failed', '⚠️ Flylogs Premium — auto-renew failed, please renew manually');
						}
						$this->PaymentSubscription->save(array('id' => $ps['id'], 'early_renewal_attempts' => (int)$ps['early_renewal_attempts'] + 1));
					}
				}
				continue;
			}

			if($isFirstAttempt){
				foreach($company['User'] as $user){
					$user['Company'] = $company['Company'];
					$this->_sendEarlyRenewalEmail($user, $company['Company']['expiration'], 'admin/early_renewal_attempt', 'Flylogs Premium — auto-renewal starting soon');
				}
				$this->PaymentSubscription->save(array(
					'id' => $ps['id'], 'early_renewal_started_at' => $now, 'early_renewal_attempts' => 1
				));
			}else{
				$this->PaymentSubscription->save(array('id' => $ps['id'], 'early_renewal_attempts' => (int)$ps['early_renewal_attempts'] + 1));
			}

			$result = $service->attemptEarlyRenewal($ps['id']);
			if($result['success']){
				CakeLog::write('payments','EARLY RENEWAL bridge succeeded company '.$company['Company']['id'].' payment '.$result['payment_id']);
			}else{
				CakeLog::write('payments','EARLY RENEWAL bridge attempt failed company '.$company['Company']['id'].': '.$result['error']);
			}

			$processed++;
		}

		return $processed;
	}

	/**
	 * _sendEarlyRenewalEmail function.
	 *
	 * Shared send for the two new early-renewal notification variants.
	 *
	 * @param array  $user shape: ['email'=>..., 'UserDetail'=>['name','surname'], 'Company'=>[...]]
	 * @param int    $expiration unix timestamp — the current pre-renewal expiration
	 * @param string $template   e.g. 'admin/early_renewal_attempt'
	 * @param string $subject
	 * @return void
	 */
	private function _sendEarlyRenewalEmail($user, $expiration, $template, $subject){
		App::uses('FlylogsEmail', 'Lib/Email');
		$email = new FlylogsEmail('default');
		$email->company($user['Company']['id'])
			->template($template, 'default')
			->from(array(WEB_EMAIL => TITLE))
			->subject($subject)
			->to(array($user['email'] => $user['UserDetail']['name'].' '.$user['UserDetail']['surname']))
			->viewVars(array('user' => $user, 'expiration' => $expiration));
		$email->send();
	}
```

- [ ] **Step 2: Wire it into `day()`**

```php
// before, CronsController.php:549-556
$checkExpiringUploads = $this->checkExpiringUploads();
$checkExpiringAccounts = $this->emailExpiringAccounts();

$checkExpiringSubscriptions = $this->checkExpiringSubscriptions();
$reconcileSubscriptionPrices = $this->reconcileSubscriptionPrices();
$deleteExpiredFlightUploads = $this->deleteExpiredFlightUploads();
$flagGoodToDeleteCompanies = $this->flagGoodToDeleteCompanies();

// after
$checkExpiringUploads = $this->checkExpiringUploads();
$checkExpiringAccounts = $this->emailExpiringAccounts();

$checkEarlyRenewals = $this->checkEarlyRenewals();
$checkExpiringSubscriptions = $this->checkExpiringSubscriptions();
$reconcileSubscriptionPrices = $this->reconcileSubscriptionPrices();
$deleteExpiredFlightUploads = $this->deleteExpiredFlightUploads();
$flagGoodToDeleteCompanies = $this->flagGoodToDeleteCompanies();
```

And add `'checkEarlyRenewals' => $checkEarlyRenewals,` to the `$result` array a few lines below it (matching the existing `'checkExpiringSubscriptions' => $checkExpiringSubscriptions,` line).

- [ ] **Step 3: Verify with a scratch dev row**

Set up a dev `payment_subscriptions` row with `billing_interval='year'`, `status='active'`, and a matching `companies.expiration` between `+83` and `+90` days from now (`UPDATE companies SET expiration = UNIX_TIMESTAMP() + 86*86400 WHERE id = '<test company>';`). Trigger the cron:

```bash
curl -sk "https://dev.flylogs.local:8443/crons/day.json"
```

Expected: the `payments` log shows the `early_renewal_attempt` email send and either `EARLY RENEWAL bridge succeeded` or `...failed` depending on whether that dev company has a working saved payment method. `SELECT early_renewal_attempts, early_renewal_started_at FROM payment_subscriptions WHERE id = '<id>';` shows `1` and a non-null timestamp after this first run (or `0`/`NULL` again if `attemptEarlyRenewal` succeeded and reset them). Run it again immediately and confirm attempt 2 does NOT re-send the "starting soon" email (only the state changes).

- [ ] **Step 4: Note what changed**

`CronsController.php` gained one new private method, one new private email helper, and 2 lines in `day()`. Not committed.

---

### Task 6: One-off migration — move existing subscriptions onto the new cadence

**Files:**
- Modify: `flylogs/app/Console/Command/RevolutPlansShell.php` (new `migrateEarlyRenewal()` command)

**Interfaces:**
- Consumes: Task 2's `P10M`-producing `createPlanVariation()`; `RevolutSubscriptionService::changePlan()` (Task 3); `Configure::read('revolut.plan_variations.premium.year')` (must already point at a `P10M` variation — this command assumes that config was updated after Task 2 landed, per spec part 1 and part 2).

- [ ] **Step 1: Add the command**

```php
	/**
	 * migrateEarlyRenewal function.
	 *
	 * One-off (run once, by hand): move every existing yearly PaymentSubscription
	 * onto the new P10M cadence via change-plan(). Per Revolut's own semantics
	 * this takes effect at_cycle_end — the current cycle is untouched, only
	 * future cycles use the new variation. Companies already inside their
	 * -90-day window get rescued separately by CronsController::checkEarlyRenewals().
	 *
	 *   cake RevolutPlans migrate_early_renewal
	 */
	public function migrateEarlyRenewal(){
		$this->loadModel('PaymentSubscription');
		$this->loadModel('Company');
		$service = new RevolutSubscriptionService();

		$standardVariationId = Configure::read('revolut.plan_variations.premium.year');
		if(empty($standardVariationId)){
			$this->out('<error>No revolut.plan_variations.premium.year configured — run `cake RevolutPlans setup` first and update app/Config/revolut.php.</error>');
			return;
		}

		$subs = $this->PaymentSubscription->find('all', array(
			'conditions' => array(
				'PaymentSubscription.billing_interval' => 'year',
				'PaymentSubscription.status' => array('active','past_due')
			)
		));

		$this->out('Found '.count($subs).' yearly subscriptions to migrate.');

		foreach($subs as $row){
			$ps = $row['PaymentSubscription'];

			$company = $this->Company->find('first', array(
				'conditions' => array('Company.id' => $ps['company_id']),
				'fields' => array('id','name','plan','price')
			));
			if(empty($company)){
				$this->out("<warning>skip {$ps['id']}: company not found</warning>");
				continue;
			}

			$isCustom = !empty($company['Company']['price']) && (float)$company['Company']['price'] > 0
				&& (float)$company['Company']['price'] != (float)$this->Company->plans[$company['Company']['plan']]['pricing'];

			if($isCustom){
				$label = 'Flylogs '.ucfirst($company['Company']['plan']).' yearly ('.$company['Company']['id'].')';
				$variationId = $service->createPlanVariation($label, (int)round($company['Company']['price'] * 100), 'year');
				if(empty($variationId)){
					$this->out("<error>FAILED</error> {$company['Company']['name']}: could not create custom P10M variation");
					continue;
				}
			}else{
				$variationId = $standardVariationId;
			}

			$ok = $service->changePlan($ps['revolut_subscription_id'], $variationId);
			if($ok){
				$this->PaymentSubscription->save(array('id' => $ps['id'], 'plan_variation_id' => $variationId));
				$this->out("<success>OK</success> {$company['Company']['name']} ({$ps['revolut_subscription_id']}) -> {$variationId}");
			}else{
				$this->out("<error>FAILED</error> {$company['Company']['name']} ({$ps['revolut_subscription_id']}) — see payments log");
			}
		}
	}
```

- [ ] **Step 2: Verify on dev with the earlier scratch subscription**

```bash
cd flylogs && ./cake RevolutPlans migrate_early_renewal
```

Expected: one line per active yearly subscription in the dev DB, `OK` for each, `FAILED` lines named clearly enough to investigate individually. Spot-check one company's `payment_subscriptions.plan_variation_id` changed to the new id, and confirm via the Revolut sandbox dashboard that its subscription shows a scheduled plan change (not yet active — `at_cycle_end`).

- [ ] **Step 3: Note what changed**

`RevolutPlansShell.php` gained one new command. Not committed, not run against prod — this is the "run once, by hand" step from the spec's rollout order, done only when the user is ready.

---

### Task 7: Admin backend — expose subscription status in the two JSON endpoints

**Files:**
- Modify: `flylogs/app/Controller/CompaniesController.php:2597` (`admin_index()`), `:2742` (`admin_view()`)

**Interfaces:**
- Produces: `admin_index()`'s `premium` array items gain a `PaymentSubscription` key (`null` when none): `{status, next_charge, billing_interval}`. `admin_view()`'s `company` payload gains the same key with two extra fields: `{status, next_charge, billing_interval, revolut_subscription_id, early_renewal_attempts}`. Task 9's frontend types consume exactly these field names.

- [ ] **Step 1: `admin_index()` — bulk lookup for the `premium` bucket**

After the existing `$premium = $this->Company->find(...)` block (`CompaniesController.php:2671-2678`) and before `$free = ...`, add:

```php
		// Bulk PaymentSubscription lookup, guarded so a table hiccup can't break
		// the whole admin list — same pattern as CronsController::checkExpiringSubscriptions().
		$subsByCompany = array();
		if(!empty($premium)){
			try {
				$this->loadModel('PaymentSubscription');
				$subs = $this->PaymentSubscription->find('all', array(
					'conditions' => array('PaymentSubscription.company_id' => Hash::extract($premium, '{n}.Company.id')),
					'fields' => array('company_id','status','next_charge','billing_interval'),
					'contain' => false
				));
				foreach($subs as $s)
					$subsByCompany[$s['PaymentSubscription']['company_id']] = $s['PaymentSubscription'];
			} catch (\Exception $e) {
				CakeLog::write('debug', 'admin_index: PaymentSubscription lookup failed: '.$e->getMessage());
			}
		}
		foreach($premium as &$row){
			$row['PaymentSubscription'] = isset($subsByCompany[$row['Company']['id']]) ? $subsByCompany[$row['Company']['id']] : null;
		}
		unset($row);
```

- [ ] **Step 2: `admin_view()` — full row for the detail page**

After the existing `$plan = $this->Company->plans[$company['Company']['plan']];` line (`CompaniesController.php:2779`), add:

```php
		$this->loadModel('PaymentSubscription');
		$subscription = $this->PaymentSubscription->find('first', array(
			'conditions' => array('PaymentSubscription.company_id' => $id),
			'fields' => array('status','next_charge','billing_interval','revolut_subscription_id','early_renewal_attempts')
		));
		$company['PaymentSubscription'] = !empty($subscription) ? $subscription['PaymentSubscription'] : null;
```

- [ ] **Step 3: Verify with curl**

```bash
curl -sk "https://dev.flylogs.local:8443/admin/companies/index.json" -H "Authorization: Bearer <manager token>" | python3 -m json.tool | grep -A5 PaymentSubscription | head -20
curl -sk "https://dev.flylogs.local:8443/admin/companies/view/<company id with a subscription>.json" -H "Authorization: Bearer <manager token>" | python3 -m json.tool | grep -A7 '"PaymentSubscription"'
```

Expected: `index.json`'s `premium` array items each show a `PaymentSubscription` key (object or `null`); `view.json`'s `company.PaymentSubscription` shows all 5 fields for a company that has one, `null` for one that doesn't (e.g. a manually-upgraded company with no native Revolut subscription).

- [ ] **Step 4: Note what changed**

`CompaniesController.php` — two additions, no existing behavior changed. Not committed.

---

### Task 8: Frontend — subscription status helper (TDD)

**Files:**
- Create: `neo/src/web/lib/subscriptionStatus.ts`
- Create: `neo/src/web/lib/subscriptionStatus.test.ts`

**Interfaces:**
- Produces: `SubscriptionStatus` type, `subscriptionStatusLabelKey(status)`, `subscriptionStatusColors(status)` — Task 9's two page components import both.

- [ ] **Step 1: Write the failing test**

```typescript
// subscriptionStatus.test.ts
import { expect, test } from "bun:test";
import { subscriptionStatusLabelKey, subscriptionStatusColors } from "./subscriptionStatus";

test("known statuses map to their own i18n key", () => {
  expect(subscriptionStatusLabelKey("active")).toBe("admin.subscriptionStatus.active");
  expect(subscriptionStatusLabelKey("past_due")).toBe("admin.subscriptionStatus.past_due");
  expect(subscriptionStatusLabelKey("pending")).toBe("admin.subscriptionStatus.pending");
  expect(subscriptionStatusLabelKey("canceled")).toBe("admin.subscriptionStatus.canceled");
});

test("no subscription (null/undefined) maps to the manual-plan key, not a status key", () => {
  expect(subscriptionStatusLabelKey(null)).toBe("admin.noSubscription");
  expect(subscriptionStatusLabelKey(undefined)).toBe("admin.noSubscription");
});

test("active gets a distinct green from past_due's red and pending's amber", () => {
  const active = subscriptionStatusColors("active");
  const pastDue = subscriptionStatusColors("past_due");
  const pending = subscriptionStatusColors("pending");
  expect(active.fg).not.toBe(pastDue.fg);
  expect(active.fg).not.toBe(pending.fg);
  expect(pastDue.fg).not.toBe(pending.fg);
});

test("no subscription gets the same neutral grey as an unrecognized status", () => {
  expect(subscriptionStatusColors(null)).toEqual(subscriptionStatusColors("something_unexpected" as never));
});
```

- [ ] **Step 2: Run it to verify it fails**

```bash
cd neo && bun test src/web/lib/subscriptionStatus.test.ts
```

Expected: FAIL — `Cannot find module './subscriptionStatus'`.

- [ ] **Step 3: Implement**

```typescript
// subscriptionStatus.ts
/**
 * subscriptionStatus.ts
 *
 * Presentation helpers for PaymentSubscription.status, mirroring the pattern
 * in attendanceStatus.ts: pure functions returning i18n KEYS (not translated
 * strings) plus badge colors, so callers apply t() themselves.
 */

export type SubscriptionStatus = "active" | "past_due" | "pending" | "canceled";

/** i18n key for a status label. null/undefined (no native subscription) is a distinct "manual plan" state. */
export function subscriptionStatusLabelKey(status: SubscriptionStatus | string | null | undefined): string {
  if (!status) return "admin.noSubscription";
  return `admin.subscriptionStatus.${status}`;
}

/** Badge colors for each status. null/undefined and any unrecognized status share the same neutral grey. */
export function subscriptionStatusColors(status: SubscriptionStatus | string | null | undefined): { fg: string; bg: string } {
  switch (status) {
    case "active":
      return { fg: "#16a34a", bg: "#f0fdf4" };
    case "past_due":
      return { fg: "#dc2626", bg: "#fef2f2" };
    case "pending":
      return { fg: "#b45309", bg: "#fef3c7" };
    case "canceled":
      return { fg: "#6b7280", bg: "#f1f5f9" };
    default:
      return { fg: "#6b7280", bg: "#f1f5f9" };
  }
}
```

- [ ] **Step 4: Run it to verify it passes**

```bash
cd neo && bun test src/web/lib/subscriptionStatus.test.ts
```

Expected: PASS, 4 tests.

- [ ] **Step 5: Note what changed**

2 new files. Not committed.

---

### Task 9: Frontend — admin list column, detail card, i18n

**Files:**
- Modify: `neo/src/web/pages/admin/companies/AdminCompaniesPage.tsx:55-70` (`CompanyItem` interface), `:416-436` (table header), `:466-476` (table row), `:481` (`colSpan`)
- Modify: `neo/src/web/pages/admin/companies/AdminCompanyViewPage.tsx:67-109` (`CompanyData` interface), insert new card after `:797`
- Modify: `neo/src/web/i18n/locales/{en,de,es,fr,it,pt,pl}.json`

**Interfaces:**
- Consumes: Task 7's `PaymentSubscription` field on both endpoints' JSON; Task 8's `subscriptionStatusLabelKey()` / `subscriptionStatusColors()`.

- [ ] **Step 1: i18n — add the 8 new keys to all 7 locale files**

Insert immediately after the `"createBillForSubscription"` line in the `admin` section of each file (present in all 7 already, confirmed):

```json
    "subscription": "Subscription",
    "noSubscription": "No subscription (manual)",
    "subscriptionStatus": {
      "active": "Active",
      "past_due": "Past Due",
      "pending": "Pending",
      "canceled": "Canceled"
    },
    "nextCharge": "Next Charge",
    "earlyRenewalAttempts": "Early Renewal Attempts",
```

(`en.json` — the English text above, verbatim.)

`de.json`:
```json
    "subscription": "Abonnement",
    "noSubscription": "Kein Abonnement (manuell)",
    "subscriptionStatus": {
      "active": "Aktiv",
      "past_due": "Überfällig",
      "pending": "Ausstehend",
      "canceled": "Gekündigt"
    },
    "nextCharge": "Nächste Abbuchung",
    "earlyRenewalAttempts": "Verlängerungsversuche",
```

`es.json`:
```json
    "subscription": "Suscripción",
    "noSubscription": "Sin suscripción (manual)",
    "subscriptionStatus": {
      "active": "Activa",
      "past_due": "Atrasada",
      "pending": "Pendiente",
      "canceled": "Cancelada"
    },
    "nextCharge": "Próximo cobro",
    "earlyRenewalAttempts": "Intentos de renovación",
```

`fr.json`:
```json
    "subscription": "Abonnement",
    "noSubscription": "Pas d'abonnement (manuel)",
    "subscriptionStatus": {
      "active": "Actif",
      "past_due": "En retard",
      "pending": "En attente",
      "canceled": "Annulé"
    },
    "nextCharge": "Prochain prélèvement",
    "earlyRenewalAttempts": "Tentatives de renouvellement",
```

`it.json`:
```json
    "subscription": "Abbonamento",
    "noSubscription": "Nessun abbonamento (manuale)",
    "subscriptionStatus": {
      "active": "Attivo",
      "past_due": "In ritardo",
      "pending": "In attesa",
      "canceled": "Annullato"
    },
    "nextCharge": "Prossimo addebito",
    "earlyRenewalAttempts": "Tentativi di rinnovo",
```

`pt.json`:
```json
    "subscription": "Subscrição",
    "noSubscription": "Sem subscrição (manual)",
    "subscriptionStatus": {
      "active": "Ativa",
      "past_due": "Em atraso",
      "pending": "Pendente",
      "canceled": "Cancelada"
    },
    "nextCharge": "Próxima cobrança",
    "earlyRenewalAttempts": "Tentativas de renovação",
```

`pl.json`:
```json
    "subscription": "Subskrypcja",
    "noSubscription": "Brak subskrypcji (ręczna)",
    "subscriptionStatus": {
      "active": "Aktywna",
      "past_due": "Zaległa",
      "pending": "Oczekująca",
      "canceled": "Anulowana"
    },
    "nextCharge": "Następne obciążenie",
    "earlyRenewalAttempts": "Próby odnowienia",
```

Verify each file is still valid JSON after editing:

```bash
for f in en de es fr it pt pl; do python3 -m json.tool "neo/src/web/i18n/locales/$f.json" > /dev/null && echo "$f OK" || echo "$f BROKEN"; done
```

Expected: `OK` for all 7.

- [ ] **Step 2: `AdminCompaniesPage.tsx` — list column**

Add to `CompanyItem` (after `created: string;` inside `Company`, i.e. as a sibling of `Company` since it's the same nested shape the backend now returns):

```typescript
interface CompanyItem {
  Company: {
    id: string;
    name: string;
    active: boolean;
    good_to_delete: boolean;
    user_count: string;
    type: string;
    price: string | null;
    plan: string;
    expiration: string | null;
    created: string;
  };
  Country: { name: string };
  "0": { aircraft_count: string; comment_count: string };
  PaymentSubscription: { status: string; next_charge: string | null; billing_interval: string } | null;
}
```

Add the import at the top:

```typescript
import { subscriptionStatusLabelKey, subscriptionStatusColors } from "../../../lib/subscriptionStatus";
```

Add a header cell after the `plan` header (`:422`):

```typescript
                      ["plan", t("admin.plan")],
```
becomes
```typescript
                      ["plan", t("admin.plan")],
```
(unchanged — the new column is intentionally NOT sortable, so it's added as a plain `<th>` outside the `.map()` block, immediately after the closing `))}` of the sortable headers, still inside the same `<tr>`:)

```typescript
                    ))}
                    <th style={{ fontWeight: 600, color: "#475569", padding: "10px 14px", borderBottom: "1px solid #e5e7eb" }}>
                      {t("admin.subscription")}
                    </th>
                  </tr>
```

Add the cell in the row, right after the plan `<td>` (`:466-470`):

```typescript
                        <td style={{ padding: "10px 14px" }}>
                          <span style={{ background: pc.bg, color: pc.fg, padding: "2px 8px", borderRadius: 4, fontSize: "0.72rem", fontWeight: 600 }}>
                            {planLabel}
                          </span>
                        </td>
                        <td style={{ padding: "10px 14px" }}>
                          {(() => {
                            const sc = subscriptionStatusColors(item.PaymentSubscription?.status);
                            return (
                              <span style={{ background: sc.bg, color: sc.fg, padding: "2px 8px", borderRadius: 4, fontSize: "0.72rem", fontWeight: 600 }}>
                                {t(subscriptionStatusLabelKey(item.PaymentSubscription?.status))}
                              </span>
                            );
                          })()}
                        </td>
```

Bump `colSpan={8}` to `colSpan={9}` in the empty-state row (`:481`).

- [ ] **Step 3: `AdminCompanyViewPage.tsx` — detail card**

Add to `CompanyData` (as a new top-level sibling of `CompanyTheme?`/`CompanyDetail?`, `:86-102`):

```typescript
  PaymentSubscription?: {
    status: string;
    next_charge: string | null;
    billing_interval: string;
    revolut_subscription_id: string;
    early_renewal_attempts: string;
  } | null;
```

Add the import at the top:

```typescript
import { subscriptionStatusLabelKey, subscriptionStatusColors } from "../../../lib/subscriptionStatus";
```

Insert a new card between the Users Table's closing `</div>` (`:797`) and the `{/* Billing / Payments */}` comment (`:799`):

```typescript
      {/* Subscription */}
      {data.company?.PaymentSubscription !== undefined && (
        <div className="card border-0 mb-4" style={{ borderRadius: 12, boxShadow: "0 2px 10px rgba(0,0,0,0.06)", overflow: "hidden" }}>
          <div style={{ padding: "14px 18px", borderBottom: "1px solid #f1f5f9", display: "flex", alignItems: "center", gap: 8 }}>
            <div style={{ width: 28, height: 28, borderRadius: 7, background: "#eff6ff", display: "flex", alignItems: "center", justifyContent: "center" }}>
              <i className="fa fa-sync" style={{ fontSize: "0.78rem", color: "#3b82f6" }} />
            </div>
            <span style={{ fontWeight: 700, fontSize: "0.85rem", color: "#212529" }}>{t("admin.subscription")}</span>
          </div>
          {data.company.PaymentSubscription ? (
            <div style={{ padding: "14px 18px", display: "flex", flexWrap: "wrap", gap: 24 }}>
              <div>
                <div style={{ fontSize: "0.7rem", color: "#9ca3af", fontWeight: 600, textTransform: "uppercase" }}>{t("common.status")}</div>
                {(() => {
                  const sc = subscriptionStatusColors(data.company!.PaymentSubscription!.status);
                  return (
                    <span style={{ background: sc.bg, color: sc.fg, padding: "2px 8px", borderRadius: 4, fontSize: "0.78rem", fontWeight: 600, display: "inline-block", marginTop: 2 }}>
                      {t(subscriptionStatusLabelKey(data.company!.PaymentSubscription!.status))}
                    </span>
                  );
                })()}
              </div>
              <div>
                <div style={{ fontSize: "0.7rem", color: "#9ca3af", fontWeight: 600, textTransform: "uppercase" }}>{t("admin.nextCharge")}</div>
                <div style={{ fontWeight: 600 }}>{formatUnix(data.company.PaymentSubscription.next_charge)}</div>
              </div>
              <div>
                <div style={{ fontSize: "0.7rem", color: "#9ca3af", fontWeight: 600, textTransform: "uppercase" }}>{t("admin.earlyRenewalAttempts")}</div>
                <div style={{ fontWeight: 600 }}>{data.company.PaymentSubscription.early_renewal_attempts}</div>
              </div>
            </div>
          ) : (
            <div style={{ padding: "14px 18px", color: "#6b7280", fontSize: "0.82rem" }}>{t("admin.noSubscription")}</div>
          )}
        </div>
      )}

```

(The `data.company?.PaymentSubscription !== undefined` guard hides the whole card only while the page is still loading — Task 7's backend always includes the key, `null` or populated, so once loaded this reads as: subscription row present → full card, `null` → the "no subscription" line.)

- [ ] **Step 4: Verify by running the dev app**

```bash
cd neo && bun run dev
```

Log in as a manager dev account, navigate to `/admin/companies`, confirm the new "Subscription" column renders a colored badge for companies that have one and the neutral "No subscription" state for ones that don't (matching what Task 7's curl check showed). Open one company with a subscription via `/admin/companies/view/<id>` and confirm the new card shows status/next charge/attempts; open one without and confirm it shows the "No subscription (manual)" line instead of an empty card.

- [ ] **Step 5: Type-check**

```bash
cd neo && bunx tsc -p tsconfig.app.json --noEmit
```

Expected: no NEW errors introduced by this task (the project has 32 pre-existing errors per [[project_neo_typecheck_noop]] — `bun run check` itself is a no-op, don't rely on it).

- [ ] **Step 6: Note what changed**

`AdminCompaniesPage.tsx`, `AdminCompanyViewPage.tsx`, and all 7 locale files edited. Not committed.

---

## Self-Review

**Spec coverage:**
- Part 1 (shorten native cycle) → Task 2.
- Part 2 (migrate existing subscriptions) → Task 6.
- Part 3 (the bridge: charge + retry + change-renewal-date + change-plan) → Tasks 3 + 5.
- Part 4 (notification handoff, `100,130` recipients, `-60` cascade untouched) → Task 5 (recipients baked into the `contain` conditions), Task 4 (templates).
- Part 5 (admin UI) → Tasks 7, 8, 9.
- Rollout order (schema/service inert first, then cron+UI, then one-off migration, then monitor) → matches this plan's task ordering (1→2→3→4→5→7→8→9 before 6's one-off migration is actually *run*, even though Task 6 as a *code change* sits earlier in the file for narrative flow — Step 3 of Task 6 explicitly says "not run against prod").

**Placeholder scan:** No TBD/TODO; every code step has real, complete code; every verification step has an actual command and an expected concrete result.

**Type consistency:** `attemptEarlyRenewal()` (Task 3) return shape `{success, payment_id, error}` matches exactly how Task 5 destructures `$result['success']` / `$result['payment_id']` / `$result['error']`. `PaymentSubscription` JSON field names from Task 7 (`status`, `next_charge`, `billing_interval`, `revolut_subscription_id`, `early_renewal_attempts`) match Task 9's TypeScript interfaces field-for-field. `subscriptionStatusLabelKey`/`subscriptionStatusColors` signatures from Task 8 match their call sites in Task 9 exactly (same two functions, same import path from both page files).
