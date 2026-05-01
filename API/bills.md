# Bills

Billing and wallet management. Requires a **non-free** company plan. Pilots need `billing: true` on their user record to appear in billing operations.

---

## List Bills (Pilot Wallet)

<mark style="color:blue;">`GET`</mark> `/bills/index.json`

<mark style="color:blue;">`GET`</mark> `/bills/index/{userId}.json`

<mark style="color:blue;">`GET`</mark> `/bills/index/{userId}/{offset}.json`

List wallet movement records for a pilot. Managers can view any pilot's bills; regular users (`user_group_id ≥ 150`) see only their own. Linked flight info is included if the flight is not deleted.

#### Query Parameters

| Parameter | Type | Description |
|-----------|------|-------------|
| limit | number | Records per page (default: 10) |

#### Response

```json
{
  "bills": [
    {
      "UserBill": {
        "id": "xyz789",
        "user_id": "100",
        "company_id": "42",
        "flight_id": "5678",
        "name": "2025-01-10 LEBL-LEMD",
        "price": "-120.00",
        "total": "-120.00",
        "receipt": false,
        "created": "2025-01-10 15:00:00"
      },
      "Flight": {
        "callsign": "EC-ABC",
        "rules": "IFR",
        "offblocks_time": "1736505000",
        "block_time": "6900",
        "deleted": false
      }
    }
  ],
  "total": 42
}
```

---

## View Bill

<mark style="color:blue;">`GET`</mark> `/bills/view/{id}.json`

Full detail for a single bill including client info, company billing settings, and linked flight. Access does not require authentication (allowed in `beforeFilter`).

#### Path Parameters

| Parameter | Type | Description |
|-----------|------|-------------|
| id | UUID | Bill ID |

#### Response

```json
{
  "bill": {
    "UserBill": {
      "id": "xyz789",
      "n_id": 12,
      "name": "2025-01-10 LEBL-LEMD",
      "price": -120.00,
      "price_hour": -60.00,
      "airport": 0.0,
      "fuel": 0.0,
      "handling": 0.0,
      "others": 0.0,
      "collected_tax": 0.0,
      "subtotal": -120.00,
      "total": -120.00,
      "packaged": 0.0,
      "packaged_time": 0.0,
      "billed_time": 2.0,
      "balance": -120.00,
      "receipt": false
    },
    "Flight": {
      "date": "2025-01-10",
      "callsign": "EC-ABC",
      "departure_airport": "LEBL",
      "landing_airport": "LEMD",
      "flight_time": "6900",
      "block_time": "6900",
      "rules": "IFR",
      "landings": 1
    },
    "Client": {
      "id": "100",
      "UserDetail": { "name": "John", "surname": "Doe", "passport": "AB123456", "phone": "+34600000000", "address": "...", "city": "Barcelona", "pc": "08001", "Country": { "name": "Spain" } },
      "Company": {
        "name": "My FTO",
        "CompanyDetail": { "Country": { "name": "Spain" } },
        "CompanyBillingSetting": { "tax": "21", "billed_person": "pilot", "send_notification": true }
      }
    },
    "Creator": {
      "id": "50",
      "UserDetail": { "name": "Admin", "surname": "User" }
    },
    "UserBillPackageFlight": []
  }
}
```

---

## Create Manual Bill

<mark style="color:green;">`POST`</mark> `/bills/create.json`

Create a manual wallet transaction for one or more pilots. If `id` is provided, updates an existing record. `user_id` can be a single UUID, an array of UUIDs, or a pilot group UUID (group members are expanded automatically). Restricted to `user_group_id ≤ 145`.

#### Request Body

| Field | Type | Required | Description |
|-------|------|----------|-------------|
| user_id | string \| array | Yes (new) | Pilot UUID(s) or pilot group UUID |
| price | number | Yes (new) | Amount (negative = charge, positive = credit) |
| name | string | Yes | Transaction description |
| created | string | No | Transaction date (defaults to now) |
| receipt | boolean | No | Mark as a receipt |
| id | UUID | No | Existing bill ID to update |

#### Response

```json
{
  "result": true,
  "new": true,
  "UserBills": [
    {
      "id": "xyz789",
      "user_id": "100",
      "name": "Manual adjustment",
      "price": "-50.00",
      "creator": "Admin User",
      "client": "John Doe"
    }
  ],
  "errors": []
}
```

---

## Bill a Flight

<mark style="color:blue;">`GET`</mark> `/bills/flight.json?id={flightId}`

<mark style="color:green;">`POST`</mark> `/bills/flight.json?id={flightId}`

Retrieve flight billing data (GET) or create/update a flight bill (POST). Flight must be confirmed and not deleted.

#### Query Parameters

| Parameter | Type | Description |
|-----------|------|-------------|
| id | UUID | Flight ID |

#### Request Body (POST)

| Field | Type | Required | Description |
|-------|------|----------|-------------|
| user_id | UUID | Yes | Pilot to bill |
| price_hour | number | Yes | Hourly rate |
| price | number | Yes | Total flight price |
| airport | number | No | Airport fees |
| fuel | number | No | Fuel charges |
| handling | number | No | Handling charges |
| others | number | No | Other charges |
| rate_id | UUID | No | Rate record to use |
| notify | boolean | No | Send notification email to pilot |
| use_packages | boolean | No | Deduct from pilot's package balance |
| created | string | No | Bill date (defaults to onblocks_time) |

#### Response

```json
{
  "defaults": { "tax": "21", "default_airport": "0", ... },
  "payment": { "UserBill": { ... } },
  "flight": { "Flight": { ... }, "Aircraft": { ... }, "UserBill": { ... } },
  "errors": null
}
```

---

## Delete Bill

<mark style="color:green;">`POST`</mark> `/bills/delete.json`

Delete a bill and recalculate the pilot's balance.

#### Request Body

| Field | Type | Required | Description |
|-------|------|----------|-------------|
| bill | UUID | Yes | Bill ID to delete |

#### Response

```json
{
  "result": true,
  "balance": -240.00,
  "bill": { "UserBill": { "id": "xyz789", "name": "...", "total": "-120.00" } }
}
```

---

## Auto-Bill a Flight

<mark style="color:blue;">`GET`</mark> `/bills/autobill/{flightId}.json`

<mark style="color:blue;">`GET`</mark> `/bills/autobill/{flightId}/{userId}.json`

<mark style="color:green;">`POST`</mark> `/bills/autobill.json`

Automatically generate a bill for a flight using the aircraft's default rate. Any existing bill for the flight is replaced. Optionally override which pilot to bill.

#### Request Body (POST)

| Field | Type | Required | Description |
|-------|------|----------|-------------|
| flight | UUID | Yes | Flight ID |
| user | UUID | No | Override pilot to bill |

#### Response

```json
{
  "bill": { "UserBill": { ... } }
}
```

---

## Get Pilot Balance

<mark style="color:blue;">`GET`</mark> `/bills/balance.json`

<mark style="color:blue;">`GET`</mark> `/bills/balance/{userId}.json`

Returns the current wallet balance for a pilot. Managers can query any billable pilot. Regular users see only their own balance.

#### Response

```json
{
  "balance": -240.50
}
```

---

## Create Stripe Payment Intent

<mark style="color:blue;">`GET`</mark> `/bills/pay.json`

<mark style="color:green;">`POST`</mark> `/bills/pay.json`

Initiate a Stripe Checkout session to allow a pilot to pay their balance. Requires Stripe to be enabled and configured for the company.

#### Request Body (POST)

| Field | Type | Required | Description |
|-------|------|----------|-------------|
| amount | number | No | Amount to pay (defaults to current balance) |

#### Response

```json
{
  "result": true,
  "message": "Payment intent created, redirecting to Stripe checkout.",
  "redirect_url": "https://checkout.stripe.com/..."
}
```

---

## Complete Stripe Checkout

<mark style="color:blue;">`GET`</mark> `/bills/checkout/{token}.json`

Process a completed Stripe Checkout session. Called automatically via the Stripe `success_url` redirect. Verifies payment status, records the credit, and notifies company managers.

#### Path Parameters

| Parameter | Type | Description |
|-----------|------|-------------|
| token | string | Stripe Checkout session ID |

#### Response

```json
{
  "result": true,
  "message": "Payment received, thank you!"
}
```

---

## Download Bills (XLS)

<mark style="color:blue;">`GET`</mark> `/bills/download.json`

<mark style="color:blue;">`GET`</mark> `/bills/download/{userId}.json`

Download all bills as an Excel file. Regular users see only their own. Requires token query param.

---

## List Rates

<mark style="color:blue;">`GET`</mark> `/bills/rates.json`

<mark style="color:blue;">`GET`</mark> `/bills/rates/true.json`

List all billing rates for the company. Pass `true` to return only package rates.

#### Response

```json
{
  "rates": [
    {
      "Rate": {
        "id": "r1",
        "company_id": "42",
        "name": "C172 Standard",
        "hourly_price": "120.00",
        "pack": false,
        "deleted": false
      },
      "Aircraft": [
        { "id": "45", "registration": "EC-ABC" }
      ]
    }
  ]
}
```

---

## View Rate

<mark style="color:blue;">`GET`</mark> `/bills/rate/{id}.json`

Retrieve a single rate with linked aircraft.

---

## Get Rates for Aircraft

<mark style="color:blue;">`GET`</mark> `/bills/aircraft/{aircraftId}.json`

List all rates configured for a specific aircraft.

---

## List Packages (Pilot)

<mark style="color:blue;">`GET`</mark> `/bills/packages/{userId}.json`

<mark style="color:blue;">`GET`</mark> `/bills/packages/{userId}/true.json`

List flight-hour packages for a pilot. Pass `true` to return only valid packages (non-expired with remaining balance).

#### Response

```json
{
  "packages": [
    {
      "UserBillPackage": {
        "id": "pkg1",
        "user_id": "100",
        "total": "50.00",
        "balance": "32.50",
        "expiration": "2026-12-31",
        "created": "2025-01-01 10:00:00"
      },
      "Rate": [{ "id": "r1", "name": "C172 Standard", "hourly_price": "120.00" }]
    }
  ]
}
```

---

## View Package

<mark style="color:blue;">`GET`</mark> `/bills/package/{id}.json`

Full details for a package including the pilot, creator, linked rate, bills, and associated flights.

---

## Create / Update Package

<mark style="color:green;">`POST`</mark> `/bills/manager_purchase_package.json`

Create or update a flight-hour package for a pilot. Optionally creates a debit bill for the package cost.

#### Request Body

| Field | Type | Required | Description |
|-------|------|----------|-------------|
| user_id | UUID | Yes (new) | Pilot to assign the package to |
| rate_id | array | Yes | Array of rate UUIDs to include |
| total | number | Yes | Total hours in the package |
| id | UUID | No | Existing package ID to update |
| expiration | string \| timestamp | No | Package expiry date |
| bill | string | No | `1` to also create a debit bill for the package cost |

#### Response

```json
{
  "new": true,
  "package": { "UserBillPackage": { "id": "pkg1", "balance": "50.00", ... } },
  "bill": "xyz789",
  "errors": null
}
```

---

## Delete Package

<mark style="color:green;">`POST`</mark> `/bills/manager_delete_package.json`

Delete a package and its associated bill (if any). Recalculates the pilot's balance.

#### Request Body

| Field | Type | Required | Description |
|-------|------|----------|-------------|
| id | UUID | Yes | Package ID |

---

## Manager: List All Bills

<mark style="color:blue;">`GET`</mark> `/bills/manager_index.json`

<mark style="color:blue;">`GET`</mark> `/bills/manager_index/{type}.json`

Paginated list of all company bills. `type` is `transactions` (default, non-flight bills) or `flights` (flight-linked bills).

#### Named Parameters / POST Filters

| Parameter | Description |
|-----------|-------------|
| from | Start date filter |
| to | End date filter |
| pilot | Filter by pilot user ID |
| excel | Append `excel:true` for XLS download (requires token) |

---

## Manager: List Billable Pilots

<mark style="color:blue;">`GET`</mark> `/bills/manager_pilots.json`

<mark style="color:blue;">`GET`</mark> `/bills/manager_pilots/{aircraftId}.json`

List all active, non-deleted pilots with `billing: true`. If an aircraft ID is provided, also returns each pilot's configured hourly price for that aircraft.

#### Response

```json
{
  "pilots": [
    { "id": "100", "name": "John Doe", "group": "170", "groupname": "Pilot", "price": "120.00" }
  ]
}
```

---

## Manager: List All Packages

<mark style="color:blue;">`GET`</mark> `/bills/manager_packages.json`

Paginated list of all packages across all company pilots.

---

## Manager: Billable Flights

<mark style="color:blue;">`GET`</mark> `/bills/manager_flights.json`

Paginated list of flights on billing-enabled aircraft. Supports named parameter filters:

| Named Param | Description |
|-------------|-------------|
| pilot | Filter by PIC or SIC user ID |
| status | `billed` or `notbilled` |
| base | Filter by base ID |
| flight_type | Filter by flight type ID |
| flight_rules | Filter by rules (`IFR`, `VFR`) |
| from | Filter from date |
| to | Filter to date |
| excel | Append `excel:true` for XLS download |

---

## Manager: Create / Update Rate

<mark style="color:green;">`POST`</mark> `/bills/manager_rate_edit.json`

Create or update a billing rate and assign aircraft.

#### Request Body

| Field | Type | Required | Description |
|-------|------|----------|-------------|
| Rate.id | UUID | No | Existing rate ID to update |
| Rate.name | string | Yes | Rate name |
| Rate.hourly_price | number | Yes | Price per hour |
| Rate.pack | boolean | No | Is this a package rate |
| Rate.aircraft_id | array | No | Aircraft UUIDs to link |

---

## Manager: Delete Rate

<mark style="color:green;">`POST`</mark> `/bills/manager_rate_delete.json`

Soft-delete a rate and remove all aircraft-rate associations.

#### Request Body

| Field | Type | Required | Description |
|-------|------|----------|-------------|
| rateId | UUID | Yes | Rate ID to delete |
