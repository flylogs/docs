# Refuelings

Fuel uplifts, what they cost, and the excise duty inside that cost.

**Access:** every endpoint below requires `user_group_id ≤ 130` (Financial Manager and above) and a **non-free** company plan. Anything else receives `404`. All results are scoped to the caller's own company.

**Derived values are server-side.** `quantity_l`, `net_amount`, `vat_amount`, `total_amount`, `excise_amount` and `status` are computed on save and ignored if posted. Do not recompute them in a client: the unit conversion needs the fuel's density, and two implementations of the same tax arithmetic will eventually disagree.

**`unit_price` is the pump price** — excluding VAT, **including** excise duty. `excise_amount` is therefore a component *of* `net_amount`, never a line added on top of it. `net_amount + vat_amount == total_amount` always holds.

---

## List Refuelings

<mark style="color:blue;">`GET`</mark> `/manager/refuelings/index.json`

Returns a page of uplifts plus totals and a per-airport rollup. **The totals and the rollup cover the whole filtered set, not the current page.**

#### Query Parameters

| Parameter | Type | Description |
|-----------|------|-------------|
| from | date | `YYYY-MM-DD`, inclusive |
| to | date | `YYYY-MM-DD`, inclusive |
| aircraft_id | number | |
| airport | string | Airport ident, exact match |
| supplier | string | Exact match |
| fuel_type | string | `AVGAS100LL`, `JETA1`, `JETA`, `MOGAS`, `SAF`, `OTHER` |
| status | string | `PENDING` (needs pricing) or `PRICED` |
| page | number | Default 1 |
| limit | number | Default 25, maximum 1000 |

#### Response

```json
{
  "refuelings": [
    {
      "Refueling": {
        "id": "8f1c…",
        "company_id": "5ef1…",
        "aircraft_id": "48",
        "flight_id": "0000f43c-…",
        "date": "2026-06-01",
        "airport": "LELL",
        "supplier": "Repsol",
        "fuel_type": "AVGAS100LL",
        "quantity": "1000.000",
        "unit": "l",
        "quantity_l": "1000.000",
        "currency": "EUR",
        "unit_price": "2.1000",
        "net_amount": "2100.00",
        "excise_amount": "406.20",
        "vat_rate": "21.00",
        "vat_amount": "441.00",
        "total_amount": "2541.00",
        "excise_recoverable": "1",
        "excise_reclaimed_on": null,
        "invoice_ref": "F-2026-0431",
        "notes": null,
        "status": "PRICED",
        "source": "FLIGHT"
      },
      "Aircraft": { "id": "48", "registration": "EC-KMH" },
      "Flight": { "id": "0000f43c-…", "date": "2026-06-01", "departure_airport": "LELL", "landing_airport": "LELL" }
    }
  ],
  "pagination": { "page": 1, "current": 25, "count": 412, "pageCount": 17, "limit": 25, "nextPage": true, "prevPage": false },
  "totals": [
    { "currency": "EUR", "uplifts": 412, "pending": 30, "litres": 305373.3,
      "net": 641283.93, "vat": 134669.62, "excise": 124042.63, "total": 775953.55,
      "price_per_litre": 2.1000 }
  ],
  "locations": [
    { "airport": "LELL", "currency": "EUR", "uplifts": 380, "litres": 285039.3,
      "net": 598582.53, "excise": 115783.96, "total": 724284.86, "price_per_litre": 2.1000 }
  ],
  "filter": { "from": "2026-01-01", "to": null, "aircraft_id": null, "airport": null, "supplier": null, "fuel_type": null, "status": null }
}
```

`totals` and `locations` carry **one entry per currency**. Amounts are never converted between currencies — there is no exchange rate source, and a fabricated rate inside a tax figure would be worse than separate subtotals.

`quantity_l` is `null` when the quantity cannot be converted: a `kgs` or `lbs` uplift on an aircraft with no `fuel_type`. Such a row gets no automatic duty either. Fix it by setting `fuel_type` on the aircraft.

---

## Form Options

<mark style="color:blue;">`GET`</mark> `/manager/refuelings/form_options.json`

Aircraft, and the supplier and airport values already in use, for filters and the add form.

```json
{
  "options": {
    "aircraft": [ { "Aircraft": { "id": "48", "registration": "EC-KMH", "fuel_tracking": "l", "fuel_type": "AVGAS100LL", "active": "1" } } ],
    "suppliers": ["Repsol", "Shell"],
    "airports": ["LELL", "LEPP"],
    "fuel_types": ["AVGAS100LL", "JETA1", "JETA", "MOGAS", "SAF", "OTHER"],
    "units": ["l", "usgal", "impgal"],
    "currency": "EUR"
  }
}
```

---

## Create or Update a Refueling

<mark style="color:red;">`POST`</mark> `/manager/refuelings/edit.json`

Form-encoded. Include `data[Refueling][id]` to update; omit it to create.

| Field | Notes |
|-------|-------|
| aircraft_id | Required on create. Must belong to your company. |
| date | `YYYY-MM-DD`. Defaults to today on create. |
| airport | Airport ident |
| supplier | |
| quantity | Required, greater than zero, in the aircraft's own unit |
| currency | Defaults to the company currency on create |
| unit_price | Ex-VAT, duty-inclusive |
| vat_rate | Percentage, e.g. `21.0` |
| excise_amount | Omit to take it from the duty rate table. Rejected if larger than the net amount. |
| excise_recoverable | `1` or `0` |
| excise_reclaimed_on | `YYYY-MM-DD`, for tracking what you have already filed |
| invoice_ref | |
| notes | |

**`fuel_type` and `unit` are not accepted.** Both are inherited from the aircraft and snapshotted onto the row when it is created, so that a fleet's units are stated in exactly one place and changing an aircraft later never re-interprets historic quantities.

```json
{ "result": true, "message": "The changes were saved!", "id": "8f1c…", "errors": [] }
```

---

## Bulk Price

<mark style="color:red;">`POST`</mark> `/manager/refuelings/bulk_price.json`

Applies one invoice's figures to many uplifts at once.

| Field | Notes |
|-------|-------|
| data[Refueling][ids][] | Repeat per refuelling. Required. |
| data[Refueling][unit_price] | |
| data[Refueling][vat_rate] | |
| data[Refueling][supplier] | |
| data[Refueling][invoice_ref] | |
| data[Refueling][currency] | |

Fields you omit are left unchanged on every row. Each row is saved individually, so litres, VAT, duty and status are derived exactly as on a single edit.

```json
{ "result": true, "message": "38 refuellings updated", "updated": 38 }
```

---

## Delete a Refueling

<mark style="color:red;">`POST`</mark> `/manager/refuelings/delete.json`

Send `data[Refueling][id]`.

A refuelling seeded from a flight will reappear the next time that flight is saved — the flight still says fuel went in. To remove it permanently, clear the fuel quantity on the flight instead.

---

## Duty Rates

Excise is a fixed amount per litre set by the country of purchase, never a percentage. Rates are effective-dated, and saving one **does not** restate the duty already stored on past uplifts.

<mark style="color:blue;">`GET`</mark> `/manager/refuelings/rates.json`

```json
{
  "rates": [
    { "FuelDutyRate": { "id": "a1…", "company_id": "5ef1…", "country": "ES",
      "fuel_type": "AVGAS100LL", "amount_per_litre": "0.40620", "currency": "EUR",
      "valid_from": "2026-01-01", "valid_to": null } }
  ]
}
```

<mark style="color:red;">`POST`</mark> `/manager/refuelings/rate_edit.json`

| Field | Notes |
|-------|-------|
| country | ISO code of the airport's country. Blank = company-wide fallback. |
| fuel_type | Required |
| amount_per_litre | Required, not negative |
| currency | |
| valid_from | Required, `YYYY-MM-DD` |
| valid_to | Blank = open-ended |

Lookup order: a rate for the airport's own country wins over the company-wide fallback; among equally specific rates, the most recently effective one wins.

<mark style="color:red;">`POST`</mark> `/manager/refuelings/rate_delete.json`

Send `data[FuelDutyRate][id]`.

---

## Excise Reclaim Report

<mark style="color:blue;">`GET`</mark> `/manager/refuelings/reclaim.json`

How much of the excise duty paid in a period is recoverable.

Excise is recoverable by **use**, not by purchase. The duty each aircraft paid is apportioned by that aircraft's share of block time flown on flight types where `fuel_duty_recoverable = 1`:

```
reclaimable(aircraft) = duty_paid × (qualifying_seconds ÷ total_seconds)
```

Both sides of the ratio are per aircraft, so the aircraft's own consumption rate cancels out — no rate weighting is applied or needed.

Only `LANDED` flights count. A flight with no flight type counts as **qualifying**, matching the column default: treating unknown as non-qualifying would silently shrink a claim, which is the more damaging of the two mistakes.

{% hint style="warning" %}
**Cash basis.** This is duty on fuel *bought* in the period, not fuel *burned* in it — fuel still in the tanks at a period boundary is not carried over. It matches the invoices a tax authority asks for, but it is not a burn calculation. Present it as such in any client.
{% endhint %}

#### Query Parameters

| Parameter | Type | Description |
|-----------|------|-------------|
| from | date | `YYYY-MM-DD`, inclusive. Defaults to 1 January of the current year. |
| to | date | `YYYY-MM-DD`, inclusive. Defaults to today. |

#### Response

```json
{
  "period": { "from": "2026-01-01", "to": "2026-12-31" },
  "aircraft": [
    {
      "aircraft_id": "8",
      "registration": "EC-JMZ",
      "currency": "EUR",
      "uplifts": 40,
      "litres": 1097.9,
      "duty_paid": 445.99,
      "duty_excluded": 0,
      "vat": 504.94,
      "qualifying_seconds": 2630520,
      "total_seconds": 2630520,
      "share": 1,
      "reclaimable": 445.99,
      "no_hours": false
    }
  ],
  "totals": [
    { "currency": "EUR", "duty_paid": 445.99, "duty_excluded": 0,
      "vat": 504.94, "reclaimable": 445.99, "litres": 1097.9 }
  ],
  "by_flight_type": [
    { "flight_type_id": "312", "name": "SOLO", "recoverable": true, "flights": 1204, "seconds": 7217640 }
  ],
  "warnings": { "unpriced": 2231, "missing_litres": 0, "missing_duty": 2, "missing_airport": 0 }
}
```

`aircraft` is sorted by `reclaimable` descending, and only includes aircraft that bought fuel in the period.

| Field | Meaning |
|-------|---------|
| `duty_excluded` | Duty on uplifts with `excise_recoverable = 0`. Reported separately so a deliberate exclusion stays distinguishable from a missing figure. |
| `share` | `qualifying_seconds / total_seconds`, or `null` when the aircraft did not fly. |
| `no_hours` | The aircraft bought fuel but flew nothing in the period, so nothing is reclaimable against it. `reclaimable` is `0`, never a division by zero. |
| `vat` | Reference only. **Never** part of `reclaimable` — VAT is recovered through a different mechanism entirely. |

`warnings` counts everything that makes the figure *understate* the real claim. Each entry can only make the reclaim smaller, never larger:

| Warning | Meaning |
|---------|---------|
| `unpriced` | Refuelings still `PENDING`, so they carry no duty |
| `missing_litres` | `quantity_l` is null — a mass uplift on an aircraft with no `fuel_type` |
| `missing_duty` | Priced and converted, but no `excise_amount` — usually no matching duty rate |
| `missing_airport` | No airport, so no country to match a rate against |

---

## Consumption Cross-check

<mark style="color:blue;">`GET`</mark> `/manager/refuelings/consumption.json`

Two data-quality checks: uplift rate against each aircraft's own baseline, and fuel bought against fuel billed on.

#### Query Parameters

| Parameter | Type | Description |
|-----------|------|-------------|
| from | date | Defaults to 1 January of the current year |
| to | date | Defaults to today |

The baseline is the **twelve months immediately before `from`**, so the period under examination never contributes to the figure it is judged against.

```json
{
  "period": { "from": "2026-01-01", "to": "2026-12-31" },
  "baseline": { "from": "2025-01-01", "to": "2025-12-31" },
  "threshold": 0.25,
  "aircraft": [
    { "aircraft_id": "8", "registration": "EC-JMZ", "litres": 12912, "hours": 730.7,
      "rate": 17.67, "baseline_rate": 11.62, "baseline_hours": 787.7,
      "variance": 0.5210, "flagged": true, "comparable": true }
  ],
  "billing": [
    { "aircraft_id": "8", "registration": "EC-JMZ",
      "purchases": [ { "currency": "EUR", "paid": 2354.10, "litres": 1097.9 } ],
      "billed": 1980.00, "difference": -374.10, "recovery": 0.8411, "mixed_currency": false }
  ]
}
```

`flagged` is `|variance| >= threshold`, but only for aircraft with at least 10 block hours in the period — below that the ratio is dominated by whether a fill happened to land inside the window. `comparable` is false when there are too few hours or no baseline.

The threshold of `0.25` was measured against real fleet data rather than picked: at `0.15` it flagged seven aircraft in eleven, which nobody reads.

{% hint style="info" %}
A flag most often means an uplift was **missed or mis-keyed**, not that consumption changed. An under-recorded uplift is under-reclaimed duty, so it is worth surfacing either way.
{% endhint %}

In `billing`, `difference` and `recovery` are `null` when `mixed_currency` is true — there is no exchange rate available to compare purchases across currencies. `billed` sums `user_bills.fuel` for flights of that aircraft in the period and has no currency dimension of its own.

---

## Import a Fuel Card Statement

<mark style="color:red;">`POST`</mark> `/manager/refuelings/import.json`

**JSON body**, not form-encoded:

```json
{
  "rows": [
    { "aircraft": "EC-KMH", "date": "2026-06-01", "quantity": "120.50",
      "airport": "LELL", "supplier": "Repsol", "unit_price": "2.1000",
      "vat_rate": "21", "invoice_ref": "F-2026-0431" }
  ]
}
```

Rows are expected to be already parsed and column-mapped — supplier statements share no common format, so the mapping belongs where a human can see the file rather than in a server-side guess. Numbers must be normalised to a plain decimal point before sending; `120,50` will be rejected as a bad quantity.

| Field | Notes |
|-------|-------|
| aircraft | Registration. Matched ignoring case and separators, so `EC-KMH`, `ECKMH` and `ec kmh` all resolve. |
| aircraft_id | Alternative to `aircraft`, and takes precedence. |
| date | Anything `strtotime` understands; stored as `Y-m-d`. |
| quantity | Required, greater than zero, in the **aircraft's own unit**. |
| airport, supplier, unit_price, vat_rate, excise_amount, currency, invoice_ref | Optional |

`fuel_type` and `unit` are inherited from the aircraft, exactly as on every other creation path. Rows are created with `source: "IMPORT"`.

Maximum **2000 rows** per request.

#### Response

```json
{ "result": true, "imported": 118, "duplicates": 12,
  "errors": [ { "line": 7, "reason": "unknown_aircraft", "value": "G-ABCD" } ] }
```

A row matching an existing refueling on **aircraft + date + quantity + invoice reference** is counted in `duplicates` and skipped, so re-importing the same statement never doubles a fuel bill.

`reason` is one of `unknown_aircraft`, `bad_date`, `bad_quantity` or `save_failed`. Bad rows are reported with their line number rather than silently dropped; the rest of the import still applies.
