# Flight Types

Company-specific flight type definitions. Used to classify flights by purpose and determine logbook time allocation.

---

## Flight Classification Values

| Value | Description |
|-------|-------------|
| `pic` | Pilot in Command |
| `copic` | Copilot |
| `fi` | Flight Instructor |
| `dual` | Dual |
| `none` | None |

These values apply to `pic_flight_time`, `sic_flight_time`, and `supervisor_flight_time`, which determine how logbook time is allocated to the flight's PIC (`pic_id`), SIC (`sic_id`), and Supervisor (`supervisor_id`) respectively.

---

## List Flight Types

<mark style="color:blue;">`GET`</mark> `/flight_types/index.json`

<mark style="color:blue;">`GET`</mark> `/flight_types/index/true.json`

List active (non-deleted) flight types for the company, ordered by `order` field. Pass `true` to filter only types with `booking: true`.

#### Response

```json
{
  "flightTypes": [
    {
      "FlightType": {
        "id": "5",
        "company_id": "42",
        "name": "Training",
        "color": "#3498db",
        "booking": true,
        "order": "0",
        "deleted": false
      }
    }
  ]
}
```

---

## List Flight Types (Manager)

<mark style="color:blue;">`GET`</mark> `/flight_types/manager_index.json`

List all flight types including soft-deleted ones. Intended for management views.

#### Response

Same structure as `index`, includes all records regardless of `deleted` status.

---

## View Flight Type

<mark style="color:blue;">`GET`</mark> `/flight_types/view/{id}.json`

Retrieve a single flight type by ID.

#### Path Parameters

| Parameter | Type | Description |
|-----------|------|-------------|
| id | number | Flight type ID |

#### Response

```json
{
  "result": {
    "FlightType": {
      "id": "5",
      "company_id": "42",
      "name": "Training",
      "color": "#3498db",
      "booking": true,
      "order": "0",
      "deleted": false
    }
  }
}
```

---

## Create Flight Type

<mark style="color:green;">`POST`</mark> `/flight_types/manager_add.json`

Create a new flight type. Also returns the `flightClassification` reference data.

#### Request Body

| Field | Type | Required | Description |
|-------|------|----------|-------------|
| FlightType.name | string | Yes | Display name |
| FlightType.color | string | No | Hex color code |
| FlightType.booking | boolean | No | Available for booking scheduling |
| FlightType.pic_flight_time | string | No | PIC time classification key |
| FlightType.sic_flight_time | string | No | SIC time classification key |
| FlightType.supervisor_flight_time | string | No | Supervisor time classification key. Defaults to `none` |

#### Response

```json
{
  "result": true,
  "flightClassification": {
    "pic": "Pilot in Command",
    "copic": "Copilot",
    "fi": "Flight Instructor",
    "dual": "Dual",
    "none": "None"
  }
}
```

---

## Edit Flight Type

<mark style="color:green;">`POST`</mark> `/flight_types/manager_edit/{id}.json`

<mark style="color:orange;">`PUT`</mark> `/flight_types/manager_edit/{id}.json`

Update a flight type. A `GET` to this endpoint returns the current record data plus usage count.

#### Path Parameters

| Parameter | Type | Description |
|-----------|------|-------------|
| id | number | Flight type ID |

#### Request Body (POST/PUT)

Same fields as create, wrapped under `FlightType`.

#### Response (POST/PUT)

```json
{
  "result": true,
  "message": "The flight type has been saved."
}
```

#### Response (GET)

```json
{
  "flights": 42,
  "flightClassification": { ... }
}
```

---

## Delete Flight Type

<mark style="color:green;">`POST`</mark> `/flight_types/manager_delete/{id}.json`

<mark style="color:red;">`DELETE`</mark> `/flight_types/manager_delete/{id}.json`

Soft-delete a flight type (sets `deleted = 1`). Only flight types belonging to the authenticated company can be deleted.

#### Path Parameters

| Parameter | Type | Description |
|-----------|------|-------------|
| id | number | Flight type ID |

#### Response

```json
{
  "result": true
}
```

---

## Reorder Flight Types

<mark style="color:green;">`POST`</mark> `/flight_types/manager_reorder.json`

Set the display order of flight types. Restricted to managers (`user_group_id ≤ 110`).

#### Request Body

| Field | Type | Required | Description |
|-------|------|----------|-------------|
| items | array | Yes | Array of flight type IDs in desired display order |

#### Response

```json
{
  "result": true
}
```
