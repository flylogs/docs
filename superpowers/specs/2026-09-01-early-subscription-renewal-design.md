# Early subscription renewal + admin subscription visibility

Date: 2026-09-01

## Problem

Revolut native subscriptions (yearly premium plans) currently auto-charge
at the exact moment the paid access period ends (`PaymentSubscription.next_charge`
== `Company.expiration`). If that charge fails — expired card, insufficient
funds, a webhook hiccup like the one that just caused a real client
(Akagera Aviation) to get silently downgraded despite having paid — there is
zero runway: the company is already at or past expiration by the time
anyone finds out.

Separately, admins have no visibility into subscription status (auto-renew
on/off, active/past_due/pending, next charge date) from the company list or
detail pages — the Akagera incident took a support conversation plus manual
log/DB digging to diagnose, when the right admin screen should have shown it
at a glance.

## Goals

- Move the real renewal charge ~2 months earlier than expiration (1 month
  minimum acceptable), so a failure leaves weeks of runway instead of zero.
- Give admins a heads up + a manual fallback before things go wrong — never
  let a subscription silently ride to the last day again.
- Surface subscription status on `/admin/companies` (list) and the company
  detail page.
- Yearly plans only. Monthly subscriptions renew every 4 weeks already;
  a 2-month lead makes no sense against a 1-month cycle. Monthly is
  untouched by this spec.

## Non-goals

- No change to monthly billing.
- No change to the existing `-60/-30/-15/-2` day expiration notification
  cascade in `CronsController::checkExpiringSubscriptions()` — it keeps
  running exactly as it does today, for every company (autoRenew or not).
  This spec only adds a new tier *before* it.
- Not attempting to fix Revolut's own retry/dunning behavior on `overdue`
  subscriptions (undocumented, out of our control) — we build our own
  explicit retry instead of relying on it.

## Background: what Revolut's Merchant API actually allows

Verified against the real OpenAPI spec (`revolut-engineering/revolut-openapi`,
version `2024-09-01` — the version this codebase already pins in
`RevolutSubscriptionService.php:65`), not docs-site prose:

- `POST /subscriptions/{id}/change-renewal-date` — reschedules the *current*
  cycle's end date, but **only later than the current renewal date; earlier
  dates are rejected** by Revolut. Cannot be used to pull a live subscription's
  charge earlier.
- `POST /subscriptions/{id}/change-plan` — schedules a plan-variation switch
  that **takes effect `at_cycle_end`**: the current cycle runs to its
  original date under the old variation; only the *next* cycle uses the new
  variation. Free of charge, but not instantaneous — this is why existing
  subscriptions need an explicit bridge (below), not just a plan swap.
- Plan variation `cycle_duration` is ISO 8601 duration and accepts arbitrary
  values (`P10M` is valid, not just `P1M`/`P1Y`).
- `Saved-Payment-Method.initiator: "merchant"` — Revolut supports headless,
  merchant-initiated one-time charges against a customer's saved payment
  method, no customer redirect required. This is what the bridge (part 3)
  uses.

## Design

### 1. Structural fix — shorten the native cycle for future renewals

`RevolutSubscriptionService::createPlanVariation()`
(`app/Lib/Payment/RevolutSubscriptionService.php:99-100`) currently maps:

```php
$cycle = ($interval === 'month') ? 'P1M' : 'P1Y';
```

Change the `year` case to `P10M`. Nothing else about the function changes.
This affects only *newly created* plan variations (new signups, and the
migration in part 2) — a variation's `cycle_duration` is immutable once
created at Revolut.

`bookCycleInvoice()` / `finalizeSetupOrder()` keep extending
`Company.expiration` by a full `YEAR` on every successful charge — the
customer still gets 12 months of access per charge, Revolut just bills 2
months before that access runs out instead of the moment it runs out.

A new shared catalogue variation is created once (same shape as the
existing `premium`/`year` catalogue variation, just `P10M`), and
`Configure::read('revolut.plan_variations.premium.year')` is repointed at
it so all new signups get the new cadence automatically.

### 2. Migrating existing subscriptions

One-time script (run once, by hand — not a recurring cron): for every
`PaymentSubscription` row with `billing_interval = 'year'` and
`status IN ('active','past_due')`:

- If the company is on the shared catalogue price → `change-plan()` to the
  new shared `P10M` variation.
- If the company has a custom price (`Company.price` set,
  `_startSubscription`'s `isCustom` case) → `createPlanVariation()` a new
  per-company `P10M` variation at their existing price, then `change-plan()`
  to it.

Per Revolut's own semantics this takes effect `at_cycle_end` — the
company's *current*, already-running cycle is unaffected and still
completes at its original date. This is why part 3 exists: without it,
every currently-live subscription would ride one more "last day" renewal
before the new cadence protects it, which is the exact failure mode this
spec exists to close.

### 3. The bridge — early charge for subscriptions already inside their window

New cron leg in `CronsController`, `checkEarlyRenewals()`, called from the
same dispatch point as `checkExpiringSubscriptions()`. Runs daily.

**Selection:** `Company.plan <> 'free'`, `Company.expiration` between
`+83` and `+90` days out (mirrors the existing `checkExpiringSubscriptions`
window pattern), `PaymentSubscription.billing_interval = 'year'`,
`status IN ('active','past_due')`.

**Schema addition** — two nullable columns on `payment_subscriptions`:

- `early_renewal_attempts` (tinyint, default 0)
- `early_renewal_started_at` (int unix timestamp, null)

Both reset to `NULL`/`0` whenever a cycle successfully books (add the reset
to `bookCycleInvoice()` and `finalizeSetupOrder()` alongside their existing
`PaymentSubscription->save(...)` calls) or when the subscription is
canceled (`applyLifecycleEvent()`).

**Attempt logic**, once per selected company per cron run:

- If `early_renewal_started_at` is null → this is attempt 1: set
  `early_renewal_started_at = now()`, `early_renewal_attempts = 1`, send the
  "we'll attempt to renew in the coming days" email (recipients:
  `user_group_id IN (100, 130)` only — not 1, per explicit ask), then fire
  the charge attempt below.
- Else if `now() - early_renewal_started_at < 7 days` and
  `early_renewal_attempts < 3` → retry: increment `early_renewal_attempts`,
  fire the charge attempt again. Target spacing day 0 / +2 / +5 (the cron's
  own daily selection window naturally enforces this — it just skips days
  where the gap hasn't elapsed).
- Else if still not resolved after 3 attempts / 7 days → send the "auto-renew
  failed, please renew manually" email (same `100,130` recipients), and stop
  (no more attempts this cycle — `-60` day cascade in
  `checkExpiringSubscriptions()` takes over from here as today).

**The charge attempt itself** (new method on `RevolutSubscriptionService`,
e.g. `chargeCustomerNow($customerId, $paymentMethodId, $amountMinor, ...)`):
create a one-time `Order` against the company's `revolut_customer_id`
(stored on `CompanyDetail`) using a saved payment method
(`GET /customers/{id}/payment-methods`, most recent) with
`initiator: "merchant"`. Price/VAT computed the same way
`admin_subscription()` already does (`Country.vat_liable`, `vat_valid`,
`apiSurcharge`).

- **On success:** book the payment (same shape as
  `finalizeSetupOrder`/`bookCycleInvoice` — atomic n_id, invoice email),
  extend `Company.expiration` by a year, then on the *existing* (still-`P1Y`)
  subscription: `change-renewal-date()` to push its current cycle's end date
  out to match the new expiration (Revolut only allows moving later — this
  is exactly that case, preventing a duplicate charge when the old cycle
  would otherwise still fire near its original date), and `change-plan()`
  it onto the new `P10M` variation so future cycles are on the new cadence
  too. One company touched once, fully migrated in the same pass as being
  rescued.
- **On failure:** no state change beyond the attempt counter — the old
  `P1Y` subscription is left exactly as it was, so it still might succeed on
  its own at its original date (status quo today, no regression). The
  manual-renewal email is the safety net.

### 4. Notification handoff

- `-90`..`-83` days: this spec's new tier (part 3), silent unless the
  company has `billing_interval='year'` and an active/past_due native
  subscription. Recipients `100,130`.
- `-60/-30/-15/-2` days: unchanged, existing `checkExpiringSubscriptions()`,
  recipients `1,100,130` as today, `autoRenew`/`pastDue` aware.

### 5. Admin UI — subscription status visibility

**Backend**, `admin_index()` (`CompaniesController.php:2597`): add a bulk
`PaymentSubscription` lookup for the `premium` bucket only (demo/free
companies can't have one), same guarded-try/catch pattern already used in
`checkExpiringSubscriptions()` so a missing table can't break the page.
Serialize `status`, `next_charge`, `billing_interval` per company.

**Backend**, `admin_view()` (`CompaniesController.php:2742`): add the full
`PaymentSubscription` row (status, `revolut_subscription_id`, `next_charge`,
`early_renewal_attempts`) to the existing `company` payload.

**Frontend**, `AdminCompaniesPage.tsx`: status badge/column next to plan
(active / past_due / pending / no subscription — i.e. manual/free).

**Frontend**, `AdminCompanyViewPage.tsx`: dedicated subscription info block
— status, next charge date, renewal-attempt count if mid-bridge-retry.

## Migration / rollout order

1. Ship the `createPlanVariation` cycle change + schema migration
   (`early_renewal_attempts`, `early_renewal_started_at` columns) — inert
   until wired up.
2. Ship `checkEarlyRenewals()` + `chargeCustomerNow()` + notification
   templates + admin UI. Verify against a test company before enabling for
   real ones.
3. Run the one-time existing-subscription migration script (part 2).
4. Monitor first real bridge attempts closely (this is the same billing
   surface as the Akagera incident) before considering this hands-off.

## Open questions for implementation planning

- Exact email templates for the two new notification variants (reuse
  `admin/premium_expiration` with new view vars, or new templates?).
- Whether `chargeCustomerNow` needs its own idempotency key beyond the
  attempt-counter gating, to survive a cron double-run safely.
- Payment-method selection when a customer has more than one saved method
  on file — "most recent" is the working assumption; confirm that's what
  `GET /customers/{id}/payment-methods` orders by, or pick explicitly.
