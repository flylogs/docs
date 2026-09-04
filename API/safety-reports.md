# Safety Reports

Requires a **premium** or **unlimited** company plan.

---

## Enumerations

### Severity

Severity is **scoped to the report's `type`** (see below): an Occurrence is always `incident` or `accident`; Safety Information is always `information` or `hazard`.

| Value | Name | Color | Belongs to type |
|-------|------|-------|-----------------|
| `incident` | Incident | `#fcd319` | `OCCURRENCE` |
| `accident` | Accident | `#ff260a` | `OCCURRENCE` |
| `information` | Information | `#1f6ac4` | `INFORMATION` |
| `hazard` | Hazard | `#fc19c3` | `INFORMATION` |

### Status

| Value | Name | Color |
|-------|------|-------|
| `draft` | Draft | `#64748b` |
| `open` | Open | `#ff9900` |
| `reviewed` | Reviewed | `#ffcc00` |
| `closed` | Closed | `#999999` |
| `published` | Published | `#34eb77` |

> **`draft` is private to its author.** A draft report is returned **only** to the user who created it (matched on `SafetyReport.user_id`) — it is hidden from every other user, **including managers**, in the list and view endpoints, and it is excluded from every analytics/stats/register aggregate. A draft carries **no `idn`** (the sequence number is assigned when it is submitted) and sends **no notifications**. See [Drafts](#drafts) below.

### Type (ICAO Annex 19 classification)

Chosen by the reporter when the report is created. Orthogonal to `severity` — it records *what kind of report* this is, per ICAO Annex 19, which distinguishes safety occurrences (events) from safety information (broader data/knowledge).

| Value | Name | Description |
|-------|------|-------------|
| `OCCURRENCE` | Safety Occurrence | A specific event or condition that happened (or could happen) and affects aviation safety — accidents, serious incidents, incidents, hazards that materialised. |
| `INFORMATION` | Safety Information | Broader safety data/knowledge used to improve safety (FDM/FOQA, audits, surveys, SPIs, bulletins, ADs...). May or may not describe an occurrence. |

Defaults to `OCCURRENCE`. Existing reports created before this field was introduced are `OCCURRENCE`.

### Flight Phase

| Code | Name |
|------|------|
| `APR` | Approach |
| `EMG` | Emergency Descent |
| `ENR` | En Route |
| `ICL` | Initial Climb |
| `LDG` | Landing |
| `MNV` | Maneuvering |
| `PIM` | Post-Impact |
| `PBT` | Pushback/Towing |
| `STD` | Standing |
| `TOF` | Takeoff |
| `TXI` | Taxi |
| `UND` | Uncontrolled Descent |
| `UNK` | Unknown |

### Risk Probability

| Value | Label |
|-------|-------|
| `likely` | 5 Frequent |
| `probable` | 4 Occasional |
| `possible` | 3 Remote |
| `improbable` | 2 Improbable |
| `remote` | 1 Extremely Improbable |

Numbering follows the ICAO Doc 9859 probability scale: 5 is the most likely (`Frequent`), 1 the least (`Extremely Improbable`).

### Risk Severity

| Value | Label |
|-------|-------|
| `catastrophic` | A Catastrophic |
| `hazardous` | B Hazardous |
| `critical` | C Major |
| `marginal` | D Minor |
| `negligible` | E Negligible |

### Damages

| Value | Description |
|-------|-------------|
| `none` | None |
| `minimal` | Minimal |
| `important` | Important |
| `catastrophic` | Aircraft destroyed |

### Personal Damages

| Value | Description |
|-------|-------------|
| `none` | No Injuries |
| `injuries` | Light injuries, no hospitalization |
| `serious` | Serious injuries |
| `casualties` | Loss of Life |

---

## Access Control

| user_group_id | Access |
|--------------|--------|
| ≤ 110 | Full access: view all reports, edit any, delete |
| 111–150 | View all reports, edit own reports and reports they are the assigned reviewer of |
| > 150 | View only own reports, reports of flights they crewed, and `published` reports; edit only own reports and reports they are the assigned reviewer of |

> Regardless of `user_group_id`, a `draft` report is visible **only to its author**. Drafts never appear in another user's list or view, nor in any analytics/stats endpoint.

> The [change history](#change-history) is manager-only (`user_group_id < 111`). It is omitted from the view payload for everyone else — including the report's author and its assigned reviewer.

---

## List Safety Reports

<mark style="color:blue;">`GET`</mark> `/safety_reports/index.json`

<mark style="color:blue;">`GET`</mark> `/safety_reports/index/{flightId}.json`

List safety reports for the company. Only top-level reports (no `parent_id`) are returned. Users with `user_group_id > 150` see only reports where they are the reporter, PIC, SIC, supervisor, or the report is `published`. Results are paginated: default page size 25, maximum 100. Use the `limit` and `page` named parameters to navigate; the response includes a `paginate` object with the total count and page information.

#### Path Parameters

| Parameter | Type | Description |
|-----------|------|-------------|
| flightId | UUID | Optional. Filter reports linked to a specific flight. |

#### Named Parameters

| Parameter | Example | Description |
|-----------|---------|-------------|
| limit | `limit:50` | Page size (default 25, max 100) |
| page | `page:2` | Page number (default 1) |
| status | `status:open` | Filter by status value |
| report_category | `report_category:3` | Filter by category ID |
| severity | `severity:incident` | Filter by severity value |
| department | `department:2` | Filter by department ID |
| from | `from:2025-01-01` | Reports on or after this date |
| to | `to:2025-12-31` | Reports on or before this date |
| excel | `excel:true` | Download as Excel (requires token query param) |

#### Response

```json
{
  "reports": [
    {
      "SafetyReport": {
        "id": "150",
        "idn": "2025/00042",
        "name": "Bird strike on approach",
        "severity": "incident",
        "type": "OCCURRENCE",
        "status": "open",
        "datetime": "2025-03-10 09:15:00",
        "location": "LEMD",
        "air_space": "controlled",
        "flight_phase": "APR"
      },
      "Flight": {
        "user_id": "123",
        "pic_id": "123",
        "sic_id": null,
        "supervisor_id": null
      },
      "SafetyReportCategory": {
        "id": "3",
        "short": "OPS",
        "name": "Operational"
      },
      "SafetyReportDepartment": {
        "id": "2",
        "name": "Flight Operations - ATO"
      },
      "ChildSafetyReport": []
    }
  ],
  "paginate": {
    "page": 1,
    "current": 25,
    "count": 132,
    "prevPage": false,
    "nextPage": true,
    "pageCount": 6,
    "limit": 25
  },
  "status": {
    "open":      { "name": "Open",      "icon": "fa fa-envelope-open",      "color": "#ff9900" },
    "reviewed":  { "name": "Reviewed",  "icon": "fa fa-envelope-open-text", "color": "#ffcc00" },
    "closed":    { "name": "Closed",    "icon": "fa fa-envelope",           "color": "#999999" },
    "published": { "name": "Published", "icon": "fa fa-newspaper",          "color": "#34eb77" }
  },
  "severity": {
    "information": { "name": "Information", "icon": "fa fa-info-circle",         "color": "#1f6ac4" },
    "incident":    { "name": "Incident",    "icon": "fa fa-exclamation-circle",  "color": "#fcd319" },
    "accident":    { "name": "Accident",    "icon": "fa fa-exclamation-triangle","color": "#ff260a" },
    "hazard":      { "name": "Hazard",      "icon": "fa fa-bolt",               "color": "#fc19c3" }
  },
  "reportTypes": { "3": "Operational", "4": "Maintenance" },
  "reportKinds": {
    "OCCURRENCE":  { "name": "Safety Occurrence",  "icon": "fa fa-flag",        "color": "#0d9488" },
    "INFORMATION": { "name": "Safety Information",  "icon": "fa fa-circle-info", "color": "#1f6ac4" }
  },
  "severities":  { "information": "Information", "incident": "Incident", "accident": "Accident", "hazard": "Hazard" },
  "statuses":    { "open": "Open", "reviewed": "Reviewed", "closed": "Closed", "published": "Published" }
}
```

---

## View Safety Report

<mark style="color:blue;">`GET`</mark> `/safety_reports/view/{id}.json`

Full details for a single report including flight, aircraft, and reporter.

> `created` and `modified` are unix timestamps (integers, seconds since epoch). `datetime` is a `YYYY-MM-DD HH:MM:SS` string.

#### Path Parameters

| Parameter | Type | Description |
|-----------|------|-------------|
| id | UUID | Safety report ID |

#### Response

```json
{
  "allowEdit": true,
  "report": {
    "SafetyReport": {
      "id": "150",
      "company_id": "42",
      "user_id": "123",
      "flight_id": "5678",
      "idn": "2025/00042",
      "safety_report_category_id": "3",
      "safety_report_department_id": "2",
      "reported": true,
      "parent_id": null,
      "flight_type_id": "1",
      "status": "open",
      "severity": "incident",
      "type": "OCCURRENCE",
      "name": "Bird strike on approach",
      "datetime": "2025-03-10 09:15:00",
      "location": "LEMD",
      "air_space": "controlled",
      "flight_phase": "APR",
      "events": "Single bird strike on left wing during ILS approach RWY 32L",
      "actions": "Continued approach, reported to ATC",
      "result": "No damage found on post-flight inspection",
      "corrective_measures": "Area wildlife management notified",
      "met_conditions": "CAVOK",
      "damages": "none",
      "personal_damages": "none",
      "risk_probability": "possible",
      "mitigated_risk_probability": "improbable",
      "risk_severity": "marginal",
      "mitigated_risk_severity": "negligible",
      "anonymous": false,
      "created": 1741608000,
      "modified": 1741617000
    },
    "Reporter": {
      "id": "123",
      "UserDetail": { "name": "John", "surname": "Doe", "id": "123" },
      "UserGroup": { "name": "Pilot" }
    },
    "SafetyReportCategory": { "id": "3", "short": "OPS", "name": "Operational" },
    "SafetyReportDepartment": { "id": "2", "name": "Flight Operations - ATO" },
    "ParentSafetyReport": { "idn": null, "ParentSafetyReport": [] },
    "FlightType": { "name": "Training" },
    "Aircraft": [
      {
        "id": "45",
        "registration": "EC-ABC",
        "photo": "https://...",
        "AircraftModel": {
          "name": "C172",
          "AircraftManufacturer": { "name": "Cessna", "Country": { "name": "United States" } }
        }
      }
    ],
    "Flight": {
      "id": "5678",
      "date": "2025-03-10",
      "user_id": "123",
      "callsign": "EC-ABC",
      "departure_airport": "LEBL",
      "landing_airport": "LEMD",
      "offblocks_time": "07:30:00",
      "onblocks_time": "09:25:00",
      "block_time": "6900",
      "rules": "IFR",
      "Pic": { "id": "123", "UserDetail": { "name": "John", "surname": "Doe", "id": "123" } },
      "Sic": null,
      "AircraftLog": []
    },
    "ChildSafetyReport": []
  }
}
```

> `allowEdit` is `true` for managers (`user_group_id < 111`), the report creator, and the assigned reviewer (`reviewer_id`), provided the report is not deleted.
>
> Being crew of the reported flight grants **view** access but not edit: the crew of a flight are the subjects of a report about it, not its owners. (Crew used to be listed as editors here, but only `view` ever applied it — `edit` rejected the save with `You are not authorized to edit this report`. The two now share one rule and the stricter reading won.)

> For managers (`user_group_id < 111`) the response also carries `report.SafetyReportChange` — the report's change history. The key is **omitted entirely** for every other user; see [Change History](#change-history).

---

## Export Safety Report (PDF)

<mark style="color:blue;">`GET`</mark> `/safety_reports/view/{id}/pdf:true?token=<token>`

Download a safety report as PDF.

---

## Export Safety Reports (XLS)

<mark style="color:blue;">`GET`</mark> `/safety_reports/index/from:{from}/to:{to}/status:{status}/report_category:{category}/severity:{severity}/excel:true?token=<token>`

Download filtered safety reports as Excel. Same named params as the list endpoint.

---

## Create Safety Report

<mark style="color:green;">`POST`</mark> `/safety_reports/create.json`

<mark style="color:green;">`POST`</mark> `/safety_reports/create/{flightId}.json`

Create a new safety report. By default the report is filed as `open`. Pass `status=draft` to save it privately as a **draft** instead (see [Drafts](#drafts)). Severity is derived automatically from `damages` and `personal_damages`. For a filed (`open`) report an `idn` is auto-generated (`YYYY/NNNNN`, child reports get `parentIdn-N`); a draft receives **no `idn`** until it is submitted.

On creation of an `open` report, the system sends notifications to crew members listed in `crew` and to all company managers/safety officers. **A draft sends no notifications.**

#### Request Body

| Field | Type | Required | Description |
|-------|------|----------|-------------|
| SafetyReport.name | string | Yes | Short event name |
| SafetyReport.status | string | No | `open` (default — files the report) or `draft` (saves it privately, no `idn`, no notifications) |
| SafetyReport.type | string | No | ICAO Annex 19 classification: `OCCURRENCE` (default) or `INFORMATION` |
| SafetyReport.severity | string | No | Only for `type` = `INFORMATION`: `information` (default) or `hazard`. Ignored for Occurrences (derived from damages). |
| SafetyReport.datetime | string | Yes | Event date/time (ISO 8601) |
| SafetyReport.location | string | Yes | Event location (ICAO or free text) |
| SafetyReport.events | string | Yes | Description of what happened |
| SafetyReport.flight_phase | string | Yes | Flight phase code (see enumerations) |
| SafetyReport.safety_report_category_id | number | Yes | Category ID |
| SafetyReport.safety_report_department_id | number | No | Department ID (see [Form Options](#form-options-bulk)) |
| SafetyReport.user_id | string | No | Reporter. **Not client-controlled**: the reporter is always the authenticated user. The only value that changes anything is an **empty string**, which files the report anonymously (`user_id` stored as `NULL`). Any other value is ignored. |
| SafetyReport.flight_id | UUID | No | Linked flight ID |
| SafetyReport.flight_type_id | number | No | Flight type ID |
| SafetyReport.parent_id | UUID | No | Parent report ID (creates a child/related report) |
| SafetyReport.damages | string | No | Aircraft damages (see enumerations) |
| SafetyReport.personal_damages | string | No | Personal damages (see enumerations) |
| SafetyReport.air_space | string | No | `controlled` or `uncontrolled` |
| SafetyReport.actions | string | No | Immediate actions taken |
| SafetyReport.result | string | No | Outcome |
| SafetyReport.corrective_measures | string | No | Corrective measures |
| SafetyReport.met_conditions | string | No | Meteorological conditions |
| SafetyReport.risk_probability | string | No | Risk probability key (see enumerations) |
| SafetyReport.risk_severity | string | No | Risk severity key (see enumerations) |
| SafetyReport.mitigated_risk_probability | string | No | Mitigated probability key |
| SafetyReport.mitigated_risk_severity | string | No | Mitigated severity key |
| SafetyReport.Aircraft | array | No | Array of `{"id": "..."}` objects for linked aircraft (HABTM) |
| SafetyReport.crew | array | No | Array of user IDs to notify and request related reports from |

#### Severity derivation

Severity is determined by `type`:

**When `type` = `OCCURRENCE`** — derived server-side from damages; the posted `severity` is ignored.

| Condition | Derived Severity |
|-----------|-----------------|
| `damages` in `important`, `catastrophic` | `accident` |
| `personal_damages` in `serious`, `casualties` | `accident` |
| Otherwise (incl. `minimal` damage or `injuries`) | `incident` |

**When `type` = `INFORMATION`** — taken from the posted `severity`: `hazard` if the reporter marks it as a hazard, otherwise `information`. Damages do not affect it.

#### Response

```json
{
  "report": {
    "SafetyReport": {
      "id": "151",
      "idn": "2025/00043",
      "status": "open",
      "severity": "information"
    },
    "Aircraft": []
  }
}
```

---

## Edit Safety Report

<mark style="color:green;">`POST`</mark> `/safety_reports/edit/{id}.json`

<mark style="color:orange;">`PUT`</mark> `/safety_reports/edit/{id}.json`

Update an existing safety report. The `id` can also be supplied in the request body as `SafetyReport.id`.

Edit permission follows the same rules as `allowEdit` in the view endpoint — the two are decided by the same code, so a report the view endpoint reports as editable can always be saved. If the editing user is not the original report creator, the `events` and `actions` fields are protected and cannot be changed.

**Event date/time.** As on create, `date` is accepted as an alias for `datetime` — post either. (Before this was fixed, `edit` accepted `date` and silently discarded it, so the event time could not be changed from the edit form.)

**Immutable columns.** `user_id`, `company_id`, `idn`, `created`, `deleted` and `reported` are stripped from the request before the save. The reporter is fixed when the report is filed and no edit can move it — including the anonymity choice, which is a create-time decision. Posting any of these fields is not an error; they are silently ignored.

On save of a non-draft report, managers and the report owner are notified. If the status changed, the notification includes the old and new status.

**Submitting a draft (`draft → open`).** The draft's author may promote their own draft to `open` by posting `status=open`. On this transition the report is assigned its `idn` and the same "new safety report" notifications a direct creation sends are fired **once**. Editing a draft that stays a draft, or any change to a draft, remains silent. A non-manager can only make the `draft → open` transition on their **own** draft; managers are unrestricted.

#### Request Body

Same fields as create (all optional on edit), wrapped under `SafetyReport`.

#### Response

```json
{
  "result": true,
  "message": "The safety report has been saved."
}
```

---

## Drafts

A report saved with `status=draft` is a private working copy of its author:

- **Visibility:** returned only to the author (`SafetyReport.user_id`) in the [list](#list-safety-reports) and [view](#view-safety-report) endpoints, and excluded from every analytics/stats endpoint. Hidden from all other users, **including managers** — a non-author requesting a draft's `view` receives `404`.
- **No `idn`:** the yearly sequence number is assigned only when the draft is submitted, so abandoned drafts never consume a number.
- **Silent:** creating or editing a draft sends no notifications.
- **Submitting:** the author posts `status=open` to [Edit](#edit-safety-report); the report becomes `open`, receives its `idn`, and notifies crew/managers/involved individuals once.

Drafts are also what the neo client stores when a report is created offline: the queued report is replayed to `create.json` with its chosen `status` (`draft` or `open`) once connectivity returns.

---

## Change History

Every write against a safety report is appended to an audit trail. The trail is
**read-only** — there is no endpoint that edits or removes a row, and nothing in
the application updates one.

**Access.** The history is returned as `report.SafetyReportChange` on
[View Safety Report](#view-safety-report), and **only** to managers
(`user_group_id < 111` — the same bar `allowEdit` uses for "manager"). For every
other user, including the report's own author and an assigned reviewer, the key
is absent from the payload altogether. There is no separate endpoint.

> Reports created before this feature shipped have no history: there was nothing
> to reconstruct a trail from. A manager viewing one gets `"SafetyReportChange": []`.

#### Logged actions

| `action` | Written when |
|----------|--------------|
| `create` | The report is filed (or saved as a draft). Its diff is the opening state. |
| `submit` | A draft is promoted to `open`. Logged after the `idn` is assigned, so the row carries it. |
| `edit` | Any field change — the edit endpoint, the investigation modal and the management modal all land here. A save that moves no tracked field writes **no** row. |
| `delete` | The report is soft-deleted (also written for each child report). |
| `attachment_add` | A file is attached to the report (any upload path: direct-to-S3 `complete`, `confirm`, or the legacy multipart endpoint). `comments` holds the file name. |
| `attachment_remove` | An attached file is deleted. `comments` holds the file name. |
| `comment_add` | A comment is posted on the report. `comments` holds the comment text. |
| `comment_remove` | A comment is deleted. |

#### Response shape

```json
"SafetyReportChange": [
  {
    "id": "412",
    "action": "edit",
    "label": "Modified",
    "icon": "fa fa-pen-to-square",
    "class": "warning",
    "comments": null,
    "created": 1756636800,
    "user": { "id": "123", "name": "John", "surname": "Doe" },
    "fields": [
      {
        "field": "status",
        "label": "Status",
        "from": "open",
        "to": "closed",
        "from_label": "Open",
        "to_label": "Closed"
      },
      {
        "field": "events",
        "label": "Description of events",
        "kind": "text",
        "from": 412,
        "to": 508,
        "from_label": "412 characters",
        "to_label": "508 characters"
      },
      {
        "field": "involved_users",
        "label": "Involved individuals",
        "kind": "set",
        "from": ["12", "18"],
        "to": ["12"],
        "from_label": "Ann Lee, Bob Ray",
        "to_label": "Ann Lee"
      }
    ]
  }
]
```

Rows are ordered newest first. `user` is `null` when the actor could not be
resolved (a deleted account, or a change made outside a session).

#### Field entries

| Key | Description |
|-----|-------------|
| `field` | Column name, or `involved_users` / `aircraft` for the two association sets |
| `label` | English field name; localise from `field` if you have translations |
| `kind` | Absent for a plain value; `text` for a narrative column; `set` for an association |
| `from` / `to` | Raw stored values. For `kind: "text"` these are **character counts**, not content. For `kind: "set"` they are id arrays. |
| `from_label` / `to_label` | Display strings **resolved at write time** — see below. `—` marks an absent value. |

**Labels are historical.** `from_label` and `to_label` were resolved when the
change was made and are stored with the row. A pilot who is later renamed or
deleted, or a category that is later renamed, does not change what an old row
says. Render them as they arrive; do not re-resolve the ids.

**Narrative fields are not copied.** `events`, `actions`, `result`,
`corrective_measures` and `met_conditions` are logged as a size change only
(`kind: "text"`). Their comparison ignores markup, so a Quill re-wrap of
identical text writes no row.

#### Tracked fields

`idn`, `type`, `status`, `severity`, `name`, `datetime`, `location`,
`safety_report_department_id`, `safety_report_category_id`, `flight_phase`,
`air_space`, `damages`, `personal_damages`, `immediate_consequences`,
`flight_id`, `flight_type_id`, `parent_id`, `user_id`, `reviewer_id`,
`reviewer_outcome`, `risk_probability`, `risk_severity`,
`mitigated_risk_probability`, `mitigated_risk_severity`, `events`, `actions`,
`result`, `corrective_measures`, `met_conditions`, plus the `involved_users` and
`aircraft` sets.

`modified`, `company_id` and `deleted` are not tracked — the first is noise and
the other two never move on an edit.

---

## Delete Safety Report

<mark style="color:red;">`GET`</mark> `/safety_reports/delete/{id}.json`

Soft-delete a safety report and all its child reports (sets `deleted = true`). Restricted to managers (`user_group_id ≤ 110`). The deletion is appended to the [change history](#change-history) of the report **and of every child** it cascades to.

#### Path Parameters

| Parameter | Type | Description |
|-----------|------|-------------|
| id | UUID | Safety report ID |

#### Response

```json
{
  "result": true,
  "message": "The safety report has been deleted."
}
```

---

## Stats

<mark style="color:blue;">`GET`</mark> `/safety_reports/stats.json`

Returns reference data for building statistics views: status, severity, flight phase, damages, and personal damages enumerations.

#### Response

```json
{
  "status": { ... },
  "severity": { ... },
  "flightPhase": {
    "APR": "Approach",
    "EMG": "Emergency Descent",
    "ENR": "En Route",
    "ICL": "Initial Climb",
    "LDG": "Landing",
    "MNV": "Maneuvering",
    "PIM": "Post-Impact",
    "PBT": "Pushback/Towing",
    "STD": "Standing",
    "TOF": "Takeoff",
    "TXI": "Taxi",
    "UND": "Uncontrolled Descent",
    "UNK": "Unknown"
  },
  "damages": {
    "none": "None",
    "minimal": "Minimal",
    "important": "Important",
    "catastrophic": "Aircraft destroyed"
  },
  "personalDamages": {
    "none": "No Injuries",
    "injuries": "Light injuries, no hospitalization.",
    "serious": "Serious injuries",
    "casualties": "Loss of Life"
  }
}
```

---

## Reports by Month

<mark style="color:blue;">`GET`</mark> `/safety_reports/reports_by_month/{months}.json`

Report counts per month, broken down by severity. Default: last 6 months.

#### Path Parameters

| Parameter | Type | Description |
|-----------|------|-------------|
| months | number | Number of past months to include (default: 6) |

#### Response

```json
{
  "data": [
    {
      "timestamp": "2025 Jan",
      "total": 12,
      "accidents": 1,
      "incidents": 4,
      "inforepos": 6,
      "hazards": 1
    }
  ]
}
```

---

## Reports by Flight Type

<mark style="color:blue;">`GET`</mark> `/safety_reports/reports_by_flight_type.json`

<mark style="color:blue;">`GET`</mark> `/safety_reports/reports_by_flight_type/year:{year}.json`

Report counts grouped by flight type.

#### Named Parameters

| Parameter | Example | Description |
|-----------|---------|-------------|
| year | `year:2025` | Filter by year |

#### Response

```json
{
  "totals": [
    { "name": "Training", "color": "#3498db", "total": 8 },
    { "name": "Revenue",  "color": "#2ecc71", "total": 3 }
  ]
}
```

---

## Reports by Category

<mark style="color:blue;">`GET`</mark> `/safety_reports/reports_by_category.json`

<mark style="color:blue;">`GET`</mark> `/safety_reports/reports_by_category/year:{year}.json`

Report counts grouped by safety report category.

#### Named Parameters

| Parameter | Example | Description |
|-----------|---------|-------------|
| year | `year:2025` | Filter by year |

#### Response

```json
{
  "totals": [
    { "name": "Operational", "color": "#a1b2c3", "total": 10 },
    { "name": "Maintenance", "color": "#d4e5f6", "total": 4 }
  ]
}
```

---

## Reports by Severity

<mark style="color:blue;">`GET`</mark> `/safety_reports/reports_by_severity.json`

<mark style="color:blue;">`GET`</mark> `/safety_reports/reports_by_severity/year:{year}.json`

Report counts grouped by severity level.

#### Named Parameters

| Parameter | Example | Description |
|-----------|---------|-------------|
| year | `year:2025` | Filter by year |

#### Response

```json
{
  "totals": [
    { "name": "Information", "color": "#1f6ac4", "total": 18 },
    { "name": "Incident",    "color": "#fcd319", "total": 5 },
    { "name": "Accident",    "color": "#ff260a", "total": 1 },
    { "name": "Hazard",      "color": "#fc19c3", "total": 2 }
  ]
}
```

---

## Reports by Flight Phase

<mark style="color:blue;">`GET`</mark> `/safety_reports/reports_by_flight_phase.json`

<mark style="color:blue;">`GET`</mark> `/safety_reports/reports_by_flight_phase/year:{year}.json`

Report counts grouped by flight phase.

#### Named Parameters

| Parameter | Example | Description |
|-----------|---------|-------------|
| year | `year:2025` | Filter by year |

#### Response

```json
{
  "totals": [
    { "name": "Approach", "color": "#a1b2c3", "total": 7 },
    { "name": "Landing",  "color": "#d4e5f6", "total": 4 }
  ]
}
```

---

## Reports by Department

<mark style="color:blue;">`GET`</mark> `/safety_reports/reports_by_department.json`

<mark style="color:blue;">`GET`</mark> `/safety_reports/reports_by_department/year:{year}.json`

Report counts grouped by department. Reports with no department assigned are excluded.

#### Named Parameters

| Parameter | Example | Description |
|-----------|---------|-------------|
| year | `year:2025` | Filter by year |

#### Response

```json
{
  "totals": [
    { "name": "Flight Operations - AOC", "total": 12 },
    { "name": "Maintenance & Engineering - CAMO", "total": 5 },
    { "name": "Cabin Crew", "total": 3 }
  ]
}
```

---

## Form Options (bulk)

<mark style="color:blue;">`GET`</mark> `/safety_reports/form_options.json`

Returns the departments available **to the authenticated user's company**, with their categories nested, in a single payload. This is the single source for the safety-report create form's dropdowns: a client caches the whole department/category tree in one request — used by the neo app at login so the form works **offline**.

**Filtered by company type.** `safety_report_department` is one global taxonomy shared by every company, so the list is narrowed here against `companies.type`:

| `companies.type` | Departments returned |
|------------------|----------------------|
| `school` | All except `Flight Operations - AOC` (1), `Flight Operations - SPO` (3) and `Cabin Crew` (5) — a training organisation has none of them |
| `gen`, `aoc`, `spo`, unset | The full list |

The filter is on the offered list only: it never rejects a `safety_report_department_id` on create or edit, and a report already filed under a now-hidden department keeps it. A client that renders a stored department should not assume its id is present in this response.

#### Response

```json
{
  "departments": [
    {
      "id": "12",
      "name": "Flight Operations",
      "categories": [
        { "id": "131", "name": "Hazard Report" },
        { "id": "133", "name": "Near Miss" }
      ]
    },
    {
      "id": "13",
      "name": "Maintenance",
      "categories": [
        { "id": "142", "name": "Equipment Failure" }
      ]
    }
  ]
}
```
