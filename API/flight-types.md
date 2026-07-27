# Flight Types

Company-specific flight type definitions. Used to classify flights by purpose and determine logbook time allocation.

---

## Flight Classification Values

| Value | Description | Logbook rollup |
|-------|-------------|----------------|
| `pic` | Pilot in Command | PIC total |
| `picus` | Pilot in Command Under Supervision | Counts toward **PIC** total; also reported separately |
| `sic` | Second in Command | SIC total — **only counts on multipilot aircraft** |
| `fi` | Flight Instructor | Counts toward **PIC and FI** totals; also reported separately |
| `dual` | Dual Received | DUAL total |
| `cri` | Class Rating Instructor | Counts toward **PIC and FI** totals; also reported separately |
| `iri` | Instrument Rating Instructor | Counts toward **PIC and FI** totals; also reported separately |
| `fifi` | Flight Instructor of Flight Instructors | Counts toward **PIC and FI** totals; also reported separately |
| `sfi` | Synthetic Flight Instructor | Counts toward **PIC and FI** totals; also reported separately |
| `tri` | Type Rating Instructor | Counts toward **PIC and FI** totals; also reported separately |
| `tre` | Examiner | Counts toward **PIC and FI** totals; also reported separately |
| `sup` | Supervisor | Reported separately only — **not** rolled into PIC or FI |
| `none` | None | Not logged |

These values apply to `pic_flight_time`, `sic_flight_time`, and `supervisor_flight_time`, which determine how logbook time is allocated to the flight's PIC (`pic_id`), SIC (`sic_id`), and Supervisor (`supervisor_id`) respectively.

> **Migration note:** `copic` (Copilot) is **deprecated and removed**. All existing `copic` configurations were migrated to `sic`. To preserve the original semantics, `sic` time is only credited on **multipilot** aircraft (`Aircraft.multipilot = true`); on single-pilot aircraft `sic` time is not logged. Do not send `copic` — it is no longer accepted as a classification key.

> **PIC / FI rollup:** `picus`, `cri`, `iri`, `fifi`, `sfi`, `tri`, `tre` all count toward a pilot's **PIC total time**. The instructor/examiner classes (`cri`, `iri`, `fifi`, `sfi`, `tri`, `tre`) additionally count toward the **FI total time** — `picus` does not (it is PIC time only). Each is also exposed as its own line in pilot statistics so the time worked in each function can be seen separately. `sup` is the exception: it is reported separately only and never rolled into PIC or FI.

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

#### Required certificates (optional)

A flight type can require certificates **per seat** (`pic` / `sic` / `supervisor`) — for example a training type where the PIC must hold a licence, a class-1 medical and a single-engine rating, while the student SIC only needs a medical. Each seat is independent; an empty list means no requirement for that seat.

A required entry references a **certificate type key** from `UserCertificate.$types` (e.g. `licence`, `sep_land_rating`, `medical_class_1`) — the same catalog returned by `GET /pilots/certificate_types.json`.

To set them, send the following alongside the `FlightType` fields (applies to both `manager_add` and `manager_edit`):

| Field | Type | Required | Description |
|-------|------|----------|-------------|
| syncRequiredCertificates | boolean | No | Opt-in flag. When present (`1`) the request **owns** the requirements: the posted `RequiredCertificate` list fully replaces the existing one (an empty list clears them). When absent, existing requirements are left untouched. |
| RequiredCertificate[N].role | string | — | Seat the requirement gates: `pic`, `sic` or `supervisor`. |
| RequiredCertificate[N].certificate_type | string | — | A certificate type key (e.g. `medical_class_1`). |

Invalid roles/types and duplicate `(role, certificate_type)` pairs are ignored server-side.

Example (form-encoded):

```
data[FlightType][name]=Dual
data[syncRequiredCertificates]=1
data[RequiredCertificate][0][role]=pic
data[RequiredCertificate][0][certificate_type]=licence
data[RequiredCertificate][1][role]=pic
data[RequiredCertificate][1][certificate_type]=medical_class_1
data[RequiredCertificate][2][role]=sic
data[RequiredCertificate][2][certificate_type]=medical_class_2
```

#### Response

```json
{
  "result": true,
  "flightClassification": {
    "pic": "Pilot in Command",
    "picus": "Pilot in Command Under Supervision",
    "sic": "Second in Command",
    "fi": "Flight Instructor",
    "dual": "Dual Received",
    "cri": "Class Rating Instructor",
    "iri": "Instrument Rating Instructor",
    "fifi": "Flight Instructor of Flight Instructors",
    "sfi": "Synthetic Flight Instructor",
    "tri": "Type Rating Instructor",
    "tre": "Examiner",
    "sup": "Supervisor",
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

`requiredCertificates` is the flat list of the flight type's per-seat requirements (see [Required certificates](#required-certificates-optional) above).

```json
{
  "flights": 42,
  "flightClassification": { ... },
  "requiredCertificates": [
    { "role": "pic", "certificate_type": "licence" },
    { "role": "pic", "certificate_type": "medical_class_1" },
    { "role": "sic", "certificate_type": "medical_class_2" }
  ]
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

---

## Certificate Compliance

<mark style="color:blue;">`GET`</mark> `/flight_types/compliance/{id}.json`

Report whether a user holds the required certificates to occupy each seat (`pic` / `sic` / `supervisor`) of a flight type. Uses the flight type's [required certificates](#required-certificates-optional); a seat with no requirements is always compliant.

A required type is satisfied when the user holds **at least one** certificate of that exact type that is valid at the evaluated time — issue date empty or in the past, expiration empty or in the future (same rule as the licence-validity check used across the app).

#### Path Parameters

| Parameter | Type | Description |
|-----------|------|-------------|
| id | number | Flight type ID |

#### Query Parameters

| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| user_id | number | No | Target pilot. Defaults to the authenticated user. Allowed for **staff** (`user_group_id ≤ 170` — managers, instructors, dispatchers); a regular pilot/student (group > 170) passing another user's id gets `403 Forbidden`. The target must belong to the caller's company. |
| at | number | No | Unix seconds at which to evaluate certificate validity. Defaults to now. Pass a future time (e.g. a planned flight start) so forward scheduling reflects validity **at that moment**. |

#### Response

Per-seat breakdown. For each seat: `compliant` is `false` when any required type is `missing` (not held) or `expired` (held but none currently valid); `ok` lists the satisfied types. `required` is the full list configured for that seat. `limit` is the earliest unix time the seat stops being compliant — the soonest expiration among the satisfied required certs — or `null` when the seat has no requirements or a required certificate never expires. Combined with a future `at`, this lets callers warn when a certificate expires before a planned flight.

```json
{
  "result": {
    "flight_type_id": "5",
    "flight_type": "Dual",
    "user_id": "123",
    "at": 1785000000,
    "compliance": {
      "pic": {
        "compliant": false,
        "required": ["licence", "medical_class_1", "sep_land_rating"],
        "ok": ["licence", "sep_land_rating"],
        "missing": [],
        "expired": ["medical_class_1"],
        "limit": 1788220800
      },
      "sic": {
        "compliant": true,
        "required": ["medical_class_2"],
        "ok": ["medical_class_2"],
        "missing": [],
        "expired": [],
        "limit": 1790000000
      },
      "supervisor": {
        "compliant": true,
        "required": [],
        "ok": [],
        "missing": [],
        "expired": [],
        "limit": null
      }
    }
  }
}
```

#### Errors

| Status | When |
|--------|------|
| 404 | Flight type not found in the caller's company, or `user_id` is not a member of the company |
| 403 | A user with `user_group_id > 170` passed a `user_id` other than their own |
