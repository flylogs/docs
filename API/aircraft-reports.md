# Aircraft Reports

Manage aircraft technical reports — defects, informational notes, maintenance actions,
servicing entries, and **MEL** (Minimum Equipment List) / **CDL** (Configuration Deviation
List) items. Requires **premium** or **unlimited** subscription plan.

{% hint style="info" %}
The `type` values `OBSERVATION` and `RESTRICTION` were removed. Existing rows were
reclassified once, automatically (`OBSERVATION` → `INFO`, `RESTRICTION` → `DEFECT`). A
client that still posts either of the old values is not rejected: the API silently
remaps it the same way before validation, so older installed clients keep working.
{% endhint %}

## List Reports

<mark style="color:green;">`POST`</mark> `/maintenance/aircraft_reports/index.json`

Retrieve a paginated list of aircraft reports for the company fleet.

#### Request Body (optional filters)

| Parameter | Type | Description |
|-----------|------|-------------|
| aircraft | number | Filter by aircraft ID |
| flight | string | Filter by flight UUID |
| type | string | Filter by report type (`DEFECT`, `INFO`, `MEL`, `CDL`, `MAINTENANCE_ACTION`, `SERVICING`). Accepts a comma separated list, e.g. `MEL,CDL` |
| status | string | Filter by status (`OPEN`, `DEFERRED`, `CLOSED`). Accepts a comma separated list, e.g. `OPEN,DEFERRED` |
| severity | string | Filter by severity (`LOW`, `MEDIUM`, `HIGH`, `CRITICAL`) |
| category | string | Filter by MEL category (`A`, `B`, `C`, `D`) — matches on the linked `MelItem`, so it only has any effect combined with `type=MEL` (a `CDL` item usually has no category) |
| wc | string | Search in title and description |
| job | string | Only reports attached to this maintenance job UUID |
| linked | string | `no` returns reports not attached to any maintenance job, `yes` only those that are |
| limit | number | Page size, default 50, capped at 500 |

Every returned row is contained with its `MelItem` (and that item's `MelItemLimitation`
rows) when one exists — see [MEL and CDL items](#mel-and-cdl-items) below for its shape.

#### Response

```json
{
  "reports": [
    {
      "AircraftReport": {
        "id": "a1b2c3d4-e5f6-7890-abcd-ef1234567890",
        "aircraft_id": "45",
        "user_id": "123",
        "type": "DEFECT",
        "title": "Nose gear shimmy above 80kt",
        "description": "Noticeable shimmy on landing roll and takeoff above 80 knots.",
        "ata_chapter": "32",
        "system": "Landing Gear",
        "severity": "MEDIUM",
        "aircraft_status": "FLYABLE",
        "dispatch_condition": "MONITOR",
        "status": "OPEN",
        "hours": "12500.300",
        "cycles": "8900",
        "deferred_until": null,
        "deferred_reference": null,
        "closed_by": null,
        "closed": null,
        "created": "1714003200",
        "maintenance_job_id": null
      },
      "Job": {
        "id": null,
        "name": null,
        "n_id": null,
        "completed": null
      },
      "Aircraft": {
        "id": "45",
        "registration": "EC-ABC"
      },
      "User": {
        "id": "123",
        "UserDetail": {
          "name": "John",
          "surname": "Doe"
        }
      }
    }
  ],
  "paginate": {
    "page": 1,
    "current": 10,
    "count": 34,
    "prevPage": false,
    "nextPage": true,
    "pageCount": 4,
    "limit": 50
  }
}
```

---

## View Report

<mark style="color:blue;">`GET`</mark> `/maintenance/aircraft_reports/view/{id}.json`

Retrieve full details for a single aircraft report.

#### Path Parameters

| Parameter | Type | Description |
|-----------|------|-------------|
| id | string | Report UUID |

#### Response

```json
{
  "report": {
    "AircraftReport": {
      "id": "a1b2c3d4-e5f6-7890-abcd-ef1234567890",
      "aircraft_id": "45",
      "user_id": "123",
      "type": "DEFECT",
      "title": "Nose gear shimmy above 80kt",
      "description": "Noticeable shimmy on landing roll and takeoff above 80 knots.",
      "ata_chapter": "32",
      "system": "Landing Gear",
      "severity": "MEDIUM",
      "aircraft_status": "FLYABLE",
      "dispatch_condition": "MONITOR",
      "status": "DEFERRED",
      "hours": "12500.300",
      "cycles": "8900",
      "deferred_until": "1717200000",
      "deferred_reference": "MEL-32-01",
      "closed_by": null,
      "closed": null,
      "created": "1714003200"
    },
    "Aircraft": {
      "id": "45",
      "registration": "EC-ABC",
      "AircraftModel": {
        "name": "C172",
        "AircraftManufacturer": {
          "name": "Cessna"
        }
      }
    },
    "User": {
      "id": "123",
      "UserDetail": {
        "name": "John",
        "surname": "Doe"
      }
    },
    "ClosedByUser": {
      "id": null,
      "UserDetail": {
        "name": null,
        "surname": null
      }
    },
    "Job": {
      "id": "b2c3d4e5-f6a7-8901-bcde-f12345678901",
      "name": "100h Inspection",
      "status": null,
      "crs": null,
      "start": "1714003200",
      "end": "1714089600"
    }
  }
}
```

---

## Create Report

<mark style="color:green;">`POST`</mark> `/maintenance/aircraft_reports/create.json`

Create a new aircraft report. The authenticated user is automatically set as the reporter and the creation timestamp is set server-side.

After a successful save, an in-app notification is sent to all active company staff (admins, managers, pilots, and mechanics) except the reporter. The notification includes the report title, severity, and aircraft status (FLYABLE / GROUNDED).

{% hint style="warning" %}
**`type` of `MEL` or `CDL` is role-gated.** Creating a report of type `MEL` or `CDL`
requires `user_group_id` in `(1, 100, 105, 110, 300)` — Flylogs Administrator, Company
Administrator, Operations Manager, Compliance & Safety Manager, or Mechanic — **or** the
requesting user must be the pilot the target aircraft is currently assigned to
(`Aircraft.user_id`). Anyone else posting `type=MEL` or `type=CDL` gets a `404 Not Found`.
All other `type` values have no such restriction.
{% endhint %}

#### Request Body

| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| AircraftReport[aircraft_id] | number | yes | Aircraft ID |
| AircraftReport[type] | string | yes | `DEFECT`, `INFO`, `MEL`, `CDL`, `MAINTENANCE_ACTION`, `SERVICING` |
| AircraftReport[title] | string | yes | Report title (max 180 chars) |
| AircraftReport[description] | string | no | Detailed description |
| AircraftReport[ata_chapter] | string | no | ATA chapter code (max 10 chars) |
| AircraftReport[system] | string | no | Aircraft system / ATA description (max 120 chars) |
| AircraftReport[severity] | string | no | `LOW` (default), `MEDIUM`, `HIGH`, `CRITICAL` |
| AircraftReport[aircraft_status] | string | no | `FLYABLE` (default), `GROUNDED` |
| AircraftReport[dispatch_condition] | string | no | `NONE` (default), `GROUNDED`, `MEL`, `CDL`, `MONITOR`. Automatically forced to match `type` when `type` is `MEL` or `CDL` |
| AircraftReport[status] | string | no | `OPEN` (default), `DEFERRED`, `CLOSED` |
| AircraftReport[flight_id] | string | no | Associated flight UUID |
| AircraftReport[hours] | number | no | Aircraft hours at time of report |
| AircraftReport[cycles] | number | no | Aircraft cycles/landings at time of report |
| AircraftReport[deferred_until] | number | no | Unix timestamp — deferred expiry date |
| AircraftReport[deferred_reference] | string | no | MEL/CDL reference number (max 120 chars) |

#### MEL / CDL block (only when `AircraftReport[type]` is `MEL` or `CDL`)

Include a sibling `MelItem` block (and optionally `MelItemLimitation`) in the same request.
When `type` is `MEL` and `MelItem` fails to save (e.g. missing `category`), the whole
request is rolled back — the `AircraftReport` row is deleted rather than left as a MEL/CDL
report with no detail row.

| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| MelItem[category] | string | required for `MEL`, ignored for `CDL` | `A`, `B`, `C`, `D` |
| MelItem[interval_type] | string | no | `NEXT_FLIGHT`, `CALENDAR_DAYS`, `FLIGHTS`, `FLIGHT_DAYS`, `CYCLES`. Defaults from `category` when omitted — `A` → `NEXT_FLIGHT`; `B`/`C`/`D` → `CALENDAR_DAYS` with `interval_value` 3/10/120 |
| MelItem[interval_value] | number | no | Only meaningful with a non-`NEXT_FLIGHT` interval type — e.g. a Remarks-column override for Category A expressed in flights/flight days/cycles |
| MelItem[mel_reference] | string | no | MEL/CDL item reference, e.g. `28-22-01` (max 60 chars) |
| MelItem[released_by] | number | **yes** | User ID of the releaser — see [Releasers](#releasers) for who qualifies |
| MelItemLimitation[][code] | string | yes (per row) | One of the [limitation codes](#limitation-code) |
| MelItemLimitation[][value] | string | no | Free value for the code, e.g. an altitude or a passenger count (max 60 chars) |
| MelItemLimitation[][note] | string | no | Free-text note (max 255 chars) |

The rectification window (`starts`/`expires`) and, for flight/cycle-counted intervals, the
`baseline_flights`/`baseline_cycles` snapshot are all computed server-side at creation and
cannot be posted directly.

#### Response

```json
{
  "data": {
    "aircraft_id": "45",
    "type": "DEFECT",
    "title": "Nose gear shimmy above 80kt",
    "description": "Noticeable shimmy on landing roll and takeoff above 80 knots.",
    "ata_chapter": "32",
    "system": "Landing Gear",
    "severity": "MEDIUM",
    "aircraft_status": "FLYABLE",
    "dispatch_condition": "MONITOR",
    "hours": "12500.300",
    "cycles": "8900",
    "user_id": "123",
    "created": "1714003200"
  },
  "result": {
    "AircraftReport": {
      "id": "a1b2c3d4-e5f6-7890-abcd-ef1234567890",
      "aircraft_id": "45",
      "type": "DEFECT",
      "title": "Nose gear shimmy above 80kt"
    }
  },
  "message": null
}
```

On validation failure, `result` is `false` and `message` contains field errors:

```json
{
  "data": { ... },
  "result": false,
  "message": {
    "title": ["Title is required"],
    "type": ["Invalid type"]
  }
}
```

---

## Edit Report

<mark style="color:green;">`POST`</mark> `/maintenance/aircraft_reports/edit/{id}.json`

Update an existing aircraft report.

{% hint style="warning" %}
**Editing a report whose `type` is `MEL` or `CDL` is role-gated**, unlike editing any
other report type: only `user_group_id` in `(1, 100, 105, 110, 300)` may call this
endpoint on a MEL/CDL report — the "assigned pilot may raise" exception on **Create**
does **not** carry over to **Edit**. Anyone else gets a `404 Not Found`.
{% endhint %}

#### Path Parameters

| Parameter | Type | Description |
|-----------|------|-------------|
| id | string | Report UUID |

#### Request Body

Same fields as **Create Report**. Only include the fields you want to update — the
request is a partial update and omitted fields keep their stored value.

The following fields are **read-only after creation** and are ignored if posted:
`aircraft_id`, `flight_id`, `user_id`, `created`, `closed`, `closed_by`.

#### MEL / CDL block (only when the report's `type` is `MEL` or `CDL`)

A much narrower set of `MelItem` fields can be changed after creation — category,
interval and the computed window are fixed at creation time and cannot be edited:

| Parameter | Type | Description |
|-----------|------|-------------|
| MelItem[mel_reference] | string | MEL/CDL item reference (max 60 chars) |
| MelItem[placard_fitted] | boolean | Whether a placard has been fitted |
| MelItem[procedures] | string | `M` (maintenance), `O` (operations), or both |
| MelItem[released_by] | number | Change the releaser — must still be a valid releaser (see [Releasers](#releasers)) |

If `MelItemLimitation[]` is present in the request, it **fully replaces** the item's
existing limitations (all previous rows are deleted, then the posted rows are inserted) —
it is not a partial patch. Omit the key entirely to leave existing limitations untouched.

Closure is derived from `status`, never taken from the request:

| Posted `status` | Server behaviour |
|-----------------|------------------|
| `CLOSED`, report currently open | stamps `closed` with the current timestamp and `closed_by` with the authenticated user |
| `CLOSED`, report already closed | leaves the existing stamp untouched |
| `OPEN` or `DEFERRED` | clears `closed` and `closed_by` |

#### Response

```json
{
  "data": {
    "id": "a1b2c3d4-e5f6-7890-abcd-ef1234567890",
    "status": "CLOSED",
    "closed_by": "456",
    "closed": "1714608000"
  },
  "result": {
    "AircraftReport": {
      "id": "a1b2c3d4-e5f6-7890-abcd-ef1234567890",
      "status": "CLOSED"
    }
  },
  "message": null
}
```

---

## Delete Report

<mark style="color:blue;">`GET`</mark> `/maintenance/aircraft_reports/delete/{id}.json`

Delete an aircraft report.

#### Path Parameters

| Parameter | Type | Description |
|-----------|------|-------------|
| id | string | Report UUID |

#### Response

```json
{
  "result": true,
  "report": {
    "AircraftReport": {
      "id": "a1b2c3d4-e5f6-7890-abcd-ef1234567890",
      "title": "Nose gear shimmy above 80kt"
    },
    "Aircraft": {
      "id": "45",
      "registration": "EC-ABC"
    }
  }
}
```

---

## MEL and CDL items

A report of type `MEL` or `CDL` is always paired 1:1 with a `MelItem` row (contained as
`MelItem` on **List Reports** and **View Report**, with its `MelItemLimitation` rows
nested inside it). The fields below are the shape of that contained `MelItem`:

| Field | Type | Description |
|-------|------|-------------|
| id | string | MelItem UUID |
| aircraft_report_id | string | Parent report UUID |
| mel_reference | string \| null | MEL/CDL item reference, e.g. `28-22-01` |
| category | string \| null | `A`, `B`, `C`, `D`, or `null` for a category-less CDL item |
| interval_type | string \| null | `NEXT_FLIGHT`, `CALENDAR_DAYS`, `FLIGHTS`, `FLIGHT_DAYS`, `CYCLES` |
| interval_value | number \| null | Day/flight/cycle count for the interval, when applicable |
| starts | number \| null | Unix timestamp — midnight, company timezone, the day after the item was raised |
| expires | number \| null | Unix timestamp — end of the rectification window; `null` for a counter-based interval (`FLIGHTS`/`NEXT_FLIGHT`/`CYCLES`/`FLIGHT_DAYS`) or a category-less CDL |
| baseline_flights | number \| null | Aircraft's `flight_count` at the moment the item was raised (only set for `FLIGHTS`/`NEXT_FLIGHT`) |
| baseline_cycles | number \| null | Aircraft's cycle count at the moment the item was raised (only set for `CYCLES`) |
| placard_fitted | boolean | Whether a placard has been fitted |
| procedures | string \| null | `M`, `O`, or both |
| released_by | number | User ID of the releaser |
| released | number | Unix timestamp the item was released |
| extended | boolean | Whether the one-time extension has been used |
| extended_by | number \| null | User ID who granted the extension |
| extended_until | number \| null | New deadline after extension |
| extension_reason | string \| null | Free-text reason given for the extension |
| MelItemLimitation | array | Nested list of `{ id, code, value, note, created }` |

`starts`/`expires`/the baseline snapshot are all computed once, at creation, from the
regulatory intervals: Category A defaults to "before next flight"; B/C/D default to 3/10/120
calendar days. The rectification clock starts at midnight, company timezone, the day
**after** the item was raised.

None of the four endpoints below return a derived `status` on their own row — that is
computed by the two endpoints further down (**Aircraft Status**, **Mel Summary**) that are
built for exactly that purpose, and mirrored client-side for display (never trust a
client-computed status for a dispatch decision — the server is authoritative).

---

### Releasers

<mark style="color:blue;">`GET`</mark> `/maintenance/aircraft_reports/releasers.json`

Lists the users of the company eligible to be the `released_by` on a MEL/CDL item, for
populating the releaser picker on the report form.

#### Response

```json
{
  "releasers": [
    {
      "User": { "id": "123", "user_group_id": "300" },
      "UserDetail": { "name": "John", "surname": "Doe" }
    }
  ]
}
```

**Eligibility:** `user_group_id` in `(1, 100, 105, 110, 300)`, **or** the authenticated
user themselves — except that a **Student Pilot (`user_group_id` 200)** calling this
endpoint never sees themselves in the list, only the five manager/mechanic groups. A
student can raise a MEL/CDL item as an assigned pilot, but can never be its releaser.

---

### Extend

<mark style="color:green;">`POST`</mark> `/maintenance/aircraft_reports/extend/{id}.json`

Grants the one-time extension on the MEL/CDL item linked to aircraft report `{id}`.

**Access:** `user_group_id` in `(1, 100, 105, 110, 300)` only — `404 Not Found` otherwise.

#### Path Parameters

| Parameter | Type | Description |
|-----------|------|-------------|
| id | string | Aircraft report UUID (the report, not the MelItem) |

#### Request Body

| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| extended_until | number | yes | New deadline, unix timestamp |
| reason | string | no | Free-text reason for the extension |

#### Response

```json
{ "result": true, "message": null }
```

Rejected (`result: false`) when:
* The item is Category A, already closed, or already extended once — `"This item cannot be extended."`
* `extended_until` is missing, or later than `expires` + one full original interval — `"Requested extension exceeds the one-time limit allowed for this category."`

---

### Aircraft Status

<mark style="color:blue;">`GET`</mark> `/maintenance/aircraft_reports/aircraft_status.json?aircraft_id={id}`

Everything the pre-dispatch window needs for one aircraft: its open MEL/CDL items (with a
computed `status` on each) plus upcoming, not-yet-completed maintenance jobs, plus a
top-level `blocked` flag. This is the endpoint the dispatch modal calls before a flight is
dispatched.

#### Query Parameters

| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| aircraft_id | number | yes | Aircraft ID |

#### Response

```json
{
  "items": [
    {
      "AircraftReport": { "id": "a1b2...", "type": "MEL", "ata_chapter": "32", "title": "Nose gear shimmy" },
      "MelItem": { "category": "C", "expires": 1717200000, "status": "EXPIRED" },
      "Aircraft": { "id": "45", "registration": "EC-ABC" }
    }
  ],
  "upcomingMaintenance": [
    { "Job": { "id": "b2c3...", "name": "100h Inspection", "ata": "05", "expiration": 1719878400 } }
  ],
  "blocked": true,
  "blockReason": "ATA 32 blocks dispatch — MEL Category C expired"
}
```

`MelItem.status` is one of `OPEN`, `EXPIRING_SOON` (within 3 days of the deadline),
`EXPIRED`, or `CLOSED`, computed server-side at request time. `blocked` is `true` as soon
as **any** item in `items` is `EXPIRED`; `blockReason` names the first one found.

---

### Mel Summary

<mark style="color:blue;">`GET`</mark> `/maintenance/aircraft_reports/mel_summary.json`

Company-wide open and expiring-soon MEL/CDL counts, for a dashboard tile.

#### Response

```json
{ "openCount": 4, "expiringSoonCount": 1 }
```

---

## Role gating on MEL/CDL actions

| Action | Endpoint | `user_group_id` allowed |
|--------|----------|--------------------------|
| Raise a MEL or CDL item | `POST create.json` with `type=MEL\|CDL` | `1, 100, 105, 110, 300`, **or** the aircraft's assigned pilot (`Aircraft.user_id`) |
| Edit a MEL or CDL item | `POST edit/{id}.json` on a `MEL`/`CDL` report | `1, 100, 105, 110, 300` only — the assigned-pilot exception does **not** apply |
| Extend a MEL or CDL item | `POST extend/{id}.json` | `1, 100, 105, 110, 300` only |
| Close a MEL or CDL item | `POST edit/{id}.json` with `status=CLOSED` | `1, 100, 105, 110, 300` only (same gate as edit) |
| Be listed/accepted as releaser (`released_by`) | `GET releasers.json`, enforced by `create`/`edit` | `1, 100, 105, 110, 300`, or the requesting user themselves — **never** `user_group_id 200` (Student Pilot) |
| View reports, an aircraft's MEL/CDL status, or the company-wide summary | `index.json`, `view.json`, `aircraft_status.json`, `mel_summary.json` | Any user of a company on a premium/unlimited plan — no MEL-specific restriction |

`1` = Flylogs Administrator, `100` = Company Administrator, `105` = Operations Manager,
`110` = Compliance & Safety Manager, `300` = Mechanic, `200` = Student Pilot.

---

## Grouping reports into a maintenance job

A maintenance job can clear **several** aircraft reports at once. This matches how
defects are worked in practice: a blown navigation light or an inoperative ADF does
not ground a VFR flight, so reports accumulate while the aircraft keeps flying and
are all resolved at the next scheduled visit.

The link lives on `aircraft_reports.maintenance_job_id`, so a report belongs to at
most one job while a job can hold any number of reports. Signing the job's CRS
closes every report attached to it.

Three ways to create the link:

| Situation | Call |
|-----------|------|
| Create a job from a batch of reports | `POST /maintenance/jobs/create.json` with `Job[aircraft_report_ids][]` |
| Attach reports to a job that already exists | `POST /maintenance/jobs/link_reports.json` |
| Detach a report from its job | `POST /maintenance/jobs/unlink_report.json` |

Both linking endpoints are documented in [maintenance-jobs.md](maintenance-jobs.md).
Reports are only accepted when they belong to the **same aircraft** as the job, and
neither endpoint works once the job's CRS has been signed.

To list the reports still waiting to be grouped for one aircraft:

```
POST /maintenance/aircraft_reports/index.json
{ "aircraft": 45, "status": "OPEN,DEFERRED", "linked": "no" }
```

---

## Enumerations Reference

#### Type

| Value | Description |
|-------|-------------|
| `DEFECT` | Technical defect requiring maintenance action (also the target of the removed `RESTRICTION` value) |
| `INFO` | Informational entry (also the target of the removed `OBSERVATION` value) |
| `MEL` | Minimum Equipment List item — see [MEL and CDL items](#mel-and-cdl-items) |
| `CDL` | Configuration Deviation List item — see [MEL and CDL items](#mel-and-cdl-items) |
| `MAINTENANCE_ACTION` | Record of a maintenance action performed |
| `SERVICING` | Servicing entry (fluid, tyre, etc.) |

#### Severity

| Value | Description |
|-------|-------------|
| `LOW` | Low impact — no operational effect |
| `MEDIUM` | Moderate impact — monitor required |
| `HIGH` | Significant impact — action required soon |
| `CRITICAL` | Immediate action required |

#### `aircraft_status` field

| Value | Description |
|-------|-------------|
| `FLYABLE` | Aircraft remains airworthy |
| `GROUNDED` | Aircraft grounded until resolved |

#### Dispatch Condition

| Value | Description |
|-------|-------------|
| `NONE` | No dispatch condition |
| `GROUNDED` | Aircraft may not dispatch |
| `MEL` | Dispatched under Minimum Equipment List |
| `CDL` | Dispatched under Configuration Deviation List |
| `MONITOR` | Dispatched with monitoring requirement |

#### Status

| Value | Description |
|-------|-------------|
| `OPEN` | Report is open and active |
| `DEFERRED` | Report deferred with reference |
| `CLOSED` | Report resolved and closed |

#### MEL Category

| Value | Description | Standard interval |
|-------|-------------|--------------------|
| `A` | Rectify before next flight (unless the Remarks column gives a flights/flight-days/cycles interval) | `NEXT_FLIGHT` |
| `B` | | 3 calendar days |
| `C` | | 10 calendar days |
| `D` | | 120 calendar days |

`category` may also be `null` on a CDL item — a category-less CDL item never expires.

#### MEL Interval Type

| Value | Description |
|-------|-------------|
| `NEXT_FLIGHT` | Expires on the next flight (Category A default) |
| `CALENDAR_DAYS` | Expires a fixed number of calendar days after the item is raised (`B`/`C`/`D` default) |
| `FLIGHTS` | Expires after a number of flights (Remarks-column override for `A`) |
| `FLIGHT_DAYS` | Expires after a number of calendar days on which the aircraft has flown at least once |
| `CYCLES` | Expires after a number of cycles/landings |

#### Limitation Code

| Value | Description |
|-------|-------------|
| `NO_ETOPS` | No ETOPS |
| `NO_RVSM` | No RVSM |
| `NO_RNP_AR` | No RNP AR |
| `NO_ICING` | No flight into known icing |
| `NO_IFR` | No IFR |
| `NO_NIGHT` | No night operations |
| `DAY_VFR_ONLY` | Day VFR only |
| `MAX_ALTITUDE` | Maximum altitude (put the figure in `value`) |
| `MAX_PAX` | Maximum passengers (put the figure in `value`) |
| `MAX_SPEED` | Maximum speed (put the figure in `value`) |
| `MAX_TIME_ABOVE_FL100` | Maximum time above FL100 (put the figure in `value`) |
| `PERF_PENALTY` | Performance penalty |
| `OTHER` | Free-text limitation — use `value` and/or `note` |

---

## ATA Chapters

<mark style="color:blue;">`GET`</mark> `/maintenance/aircraft_reports/ata_chapters.json`

Retrieve the full list of ATA chapter codes and their descriptions, for use when filing reports.

#### Response

```json
{
  "ata_chapters": {
    "05": "Time Limits / Maintenance Checks",
    "06": "Dimensions and Areas",
    "07": "Lifting and Shoring",
    "12": "Servicing",
    "21": "Air Conditioning",
    "22": "Auto Flight",
    "23": "Communications",
    "24": "Electrical Power",
    "25": "Equipment / Furnishings",
    "26": "Fire Protection",
    "27": "Flight Controls",
    "28": "Fuel",
    "29": "Hydraulic Power",
    "30": "Ice and Rain Protection",
    "31": "Indicating / Recording Systems",
    "32": "Landing Gear",
    "33": "Lights",
    "34": "Navigation",
    "35": "Oxygen",
    "49": "APU",
    "51": "Standard Practices – Structures",
    "52": "Doors",
    "53": "Fuselage",
    "71": "Powerplant",
    "72": "Engine",
    "73": "Engine Fuel / Control",
    "74": "Ignition",
    "79": "Oil",
    "80": "Starting"
  }
}
```
