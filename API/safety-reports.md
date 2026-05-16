# Safety Reports

Requires a **premium** or **unlimited** company plan.

---

## Enumerations

### Severity

| Value | Name | Color |
|-------|------|-------|
| `information` | Information | `#1f6ac4` |
| `incident` | Incident | `#fcd319` |
| `accident` | Accident | `#ff260a` |
| `hazard` | Hazard | `#fc19c3` |

### Status

| Value | Name | Color |
|-------|------|-------|
| `open` | Open | `#ff9900` |
| `reviewed` | Reviewed | `#ffcc00` |
| `closed` | Closed | `#999999` |
| `published` | Published | `#34eb77` |

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
| `likely` | 1 Frequent |
| `probable` | 2 Occasional |
| `possible` | 3 Remote |
| `improbable` | 4 Improbable |
| `remote` | 5 Extremely Improbable |

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
| 111–150 | View all reports, edit own / crew reports |
| > 150 | View only own reports and `published` reports |

---

## List Safety Reports

<mark style="color:blue;">`GET`</mark> `/safety_reports/index.json`

<mark style="color:blue;">`GET`</mark> `/safety_reports/index/{flightId}.json`

List safety reports for the company. Only top-level reports (no `parent_id`) are returned. Users with `user_group_id > 150` see only reports where they are the reporter, PIC, SIC, supervisor, or the report is `published`. Results are paginated (default 25).

#### Path Parameters

| Parameter | Type | Description |
|-----------|------|-------------|
| flightId | UUID | Optional. Filter reports linked to a specific flight. |

#### Named Parameters

| Parameter | Example | Description |
|-----------|---------|-------------|
| status | `status:open` | Filter by status value |
| report_category | `report_category:3` | Filter by category ID |
| severity | `severity:incident` | Filter by severity value |
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
      "ChildSafetyReport": []
    }
  ],
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
      "reported": true,
      "parent_id": null,
      "flight_type_id": "1",
      "status": "open",
      "severity": "incident",
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

> `allowEdit` is `true` for managers (`user_group_id < 111`), the report creator, or any flight crew member, provided the report is not deleted.

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

Create a new safety report. Status is always set to `open`. Severity is derived automatically from `damages` and `personal_damages`. An `idn` is auto-generated (`YYYY/NNNNN`); child reports get `parentIdn-N`.

On creation, the system sends notifications to crew members listed in `crew` and to all company managers/safety officers.

#### Request Body

| Field | Type | Required | Description |
|-------|------|----------|-------------|
| SafetyReport.name | string | Yes | Short event name |
| SafetyReport.datetime | string | Yes | Event date/time (ISO 8601) |
| SafetyReport.location | string | Yes | Event location (ICAO or free text) |
| SafetyReport.events | string | Yes | Description of what happened |
| SafetyReport.flight_phase | string | Yes | Flight phase code (see enumerations) |
| SafetyReport.safety_report_category_id | number | Yes | Category ID |
| SafetyReport.anonymous | boolean | No | If `true`, reporter identity is not stored |
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

#### Severity Auto-derivation

| Condition | Derived Severity |
|-----------|-----------------|
| `damages` = `minimal` | `incident` |
| `damages` in `important`, `catastrophic` | `accident` |
| `personal_damages` = `injuries` (and not already `accident`) | `incident` |
| `personal_damages` in `serious`, `casualties` | `accident` |
| None of the above | `information` |

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

Edit permission follows the same rules as `allowEdit` in the view endpoint. If the editing user is not the original report creator, the `events` and `actions` fields are protected and cannot be changed.

On save, managers and the report owner are notified. If the status changed, the notification includes the old and new status.

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

## Delete Safety Report

<mark style="color:red;">`GET`</mark> `/safety_reports/delete/{id}.json`

Soft-delete a safety report and all its child reports (sets `deleted = true`). Restricted to managers (`user_group_id ≤ 110`).

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
