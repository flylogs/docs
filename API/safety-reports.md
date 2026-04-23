# Safety Reports

## List Safety Reports

<mark style="color:blue;">`GET`</mark> `/safety_reports/index/limit:{limit}/from:{from}/to:{to}/status:{status}/report_category:{category}/severity:{severity}.json`

Retrieve safety reports with filters.

#### Path Parameters

All filter parameters are optional — use empty string to skip.

| Parameter | Type | Description |
|-----------|------|-------------|
| limit | number | Max records to return (default: 25) |
| from | string | Start date filter (YYYY-MM-DD) |
| to | string | End date filter (YYYY-MM-DD) |
| status | string | Status filter |
| report_category | string | Category ID filter |
| severity | string | Severity filter |

#### Response

```json
{
  "reports": [
    {
      "SafetyReport": {
        "id": "150",
        "company_id": "42",
        "deleted": false,
        "user_id": "123",
        "flight_id": "5678",
        "idn": "SR-2025-042",
        "safety_report_category_id": "3",
        "reported": true,
        "parent_id": null,
        "flight_type_id": "1",
        "status": "open",
        "severity": "minor",
        "name": "Bird strike on approach",
        "datetime": "2025-03-10 09:15:00",
        "location": "LEMD",
        "air_space": "CTR Madrid",
        "flight_phase": "approach",
        "events": "Single bird strike on left wing during ILS approach RWY 32L",
        "actions": "Continued approach, reported to ATC",
        "result": "No damage found on post-flight inspection",
        "corrective_measures": "Area wildlife management notified",
        "met_conditions": "CAVOK",
        "damages": "None",
        "personal_damages": "None",
        "risk_probability": "3",
        "mitigated_risk_probability": "2",
        "risk_severity": "2",
        "mitigated_risk_severity": "1",
        "anonymous": false,
        "created": "2025-03-10 12:00:00",
        "modified": "2025-03-10 14:30:00"
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
    "open": { "name": "Open", "icon": "fa-folder-open", "color": "#f39c12" },
    "closed": { "name": "Closed", "icon": "fa-check-circle", "color": "#2ecc71" },
    "under_review": { "name": "Under Review", "icon": "fa-search", "color": "#3498db" }
  },
  "severity": {
    "minor": { "name": "Minor", "icon": "fa-info-circle", "color": "#3498db" },
    "major": { "name": "Major", "icon": "fa-exclamation-triangle", "color": "#f39c12" },
    "hazardous": { "name": "Hazardous", "icon": "fa-times-circle", "color": "#e74c3c" }
  },
  "reportTypes": { "3": "Operational", "4": "Maintenance", "5": "Ground" },
  "severities": { "minor": "Minor", "major": "Major", "hazardous": "Hazardous" },
  "statuses": { "open": "Open", "closed": "Closed", "under_review": "Under Review" }
}
```

---

## View Safety Report

<mark style="color:blue;">`GET`</mark> `/safety_reports/view/{id}.json`

Retrieve full details for a single safety report, including linked flight, aircraft, and risk matrix data.

#### Path Parameters

| Parameter | Type | Description |
|-----------|------|-------------|
| id | string | Safety report ID |

#### Response

```json
{
  "allowEdit": true,
  "status": { ... },
  "severity": { ... },
  "flightPhase": {
    "takeoff": "Take-off",
    "climb": "Climb",
    "cruise": "Cruise",
    "descent": "Descent",
    "approach": "Approach",
    "landing": "Landing",
    "taxi": "Taxi",
    "parking": "Parking"
  },
  "report": {
    "SafetyReport": { ... },
    "ParentSafetyReport": { "idn": null, "ParentSafetyReport": [] },
    "Flight": {
      "id": "5678",
      "date": "2025-03-10",
      "callsign": "EC-ABC",
      "departure_airport": "LEBL",
      "landing_airport": "LEMD",
      "offblocks_time": "07:30:00",
      "onblocks_time": "09:25:00",
      "block_time": "6900",
      "rules": "IFR",
      "Pic": {
        "id": "123",
        "UserDetail": { "name": "John", "surname": "Doe", "id": "123" }
      },
      "Sic": null
    },
    "FlightType": { "name": "Training" },
    "SafetyReportCategory": { "id": "3", "short": "OPS", "name": "Operational" },
    "User": {
      "id": "123",
      "UserDetail": { "name": "John", "surname": "Doe", "id": "123" },
      "UserGroup": { "name": "Pilot" }
    },
    "Aircraft": [
      {
        "id": "45",
        "registration": "EC-ABC",
        "photo": "https://...",
        "AircraftModel": {
          "name": "C172",
          "AircraftManufacturer": { "name": "Cessna" }
        }
      }
    ]
  }
}
```

#### ICAO Risk Matrix Fields

| Field | Type | Description |
|-------|------|-------------|
| risk_probability | string | Initial risk probability (1-5 scale) |
| risk_severity | string | Initial risk severity (1-5 scale) |
| mitigated_risk_probability | string | Mitigated risk probability after corrective measures |
| mitigated_risk_severity | string | Mitigated risk severity after corrective measures |

---

## Export Safety Report (PDF)

<mark style="color:blue;">`GET`</mark> `/safety_reports/view/{id}/pdf:true`

Download a safety report as PDF. Token passed as query parameter: `?token=<token>`

---

## Export Safety Reports (XLS)

<mark style="color:blue;">`GET`</mark> `/safety_reports/index/limit:{limit}/from:{from}/to:{to}/status:{status}/report_category:{category}/severity:{severity}/excel:true`

Download filtered safety reports as Excel. Same filters as the list endpoint with `excel:true` appended. Token as query parameter.
