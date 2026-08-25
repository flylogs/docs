# Aircraft Reports

Manage aircraft technical reports (defects, observations, maintenance actions, servicing, restrictions). Requires **premium** or **unlimited** subscription plan.

## List Reports

<mark style="color:green;">`POST`</mark> `/maintenance/aircraft_reports/index.json`

Retrieve a paginated list of aircraft reports for the company fleet.

#### Request Body (optional filters)

| Parameter | Type | Description |
|-----------|------|-------------|
| aircraft | number | Filter by aircraft ID |
| flight | string | Filter by flight UUID |
| type | string | Filter by report type (`DEFECT`, `OBSERVATION`, `MAINTENANCE_ACTION`, `SERVICING`, `RESTRICTION`, `INFO`) |
| status | string | Filter by status (`OPEN`, `DEFERRED`, `CLOSED`). Accepts a comma separated list, e.g. `OPEN,DEFERRED` |
| severity | string | Filter by severity (`LOW`, `MEDIUM`, `HIGH`, `CRITICAL`) |
| wc | string | Search in title and description |
| job | string | Only reports attached to this maintenance job UUID |
| linked | string | `no` returns reports not attached to any maintenance job, `yes` only those that are |
| limit | number | Page size, default 50, capped at 500 |

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

#### Request Body

| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| AircraftReport[aircraft_id] | number | yes | Aircraft ID |
| AircraftReport[type] | string | yes | `DEFECT`, `OBSERVATION`, `MAINTENANCE_ACTION`, `SERVICING`, `RESTRICTION`, `INFO` |
| AircraftReport[title] | string | yes | Report title (max 180 chars) |
| AircraftReport[description] | string | no | Detailed description |
| AircraftReport[ata_chapter] | string | no | ATA chapter code (max 10 chars) |
| AircraftReport[system] | string | no | Aircraft system / ATA description (max 120 chars) |
| AircraftReport[severity] | string | no | `LOW` (default), `MEDIUM`, `HIGH`, `CRITICAL` |
| AircraftReport[aircraft_status] | string | no | `FLYABLE` (default), `GROUNDED` |
| AircraftReport[dispatch_condition] | string | no | `NONE` (default), `GROUNDED`, `MEL`, `CDL`, `MONITOR` |
| AircraftReport[status] | string | no | `OPEN` (default), `DEFERRED`, `CLOSED` |
| AircraftReport[flight_id] | string | no | Associated flight UUID |
| AircraftReport[hours] | number | no | Aircraft hours at time of report |
| AircraftReport[cycles] | number | no | Aircraft cycles/landings at time of report |
| AircraftReport[deferred_until] | number | no | Unix timestamp — deferred expiry date |
| AircraftReport[deferred_reference] | string | no | MEL/CDL reference number (max 120 chars) |

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

#### Path Parameters

| Parameter | Type | Description |
|-----------|------|-------------|
| id | string | Report UUID |

#### Request Body

Same fields as **Create Report**. Only include the fields you want to update — the
request is a partial update and omitted fields keep their stored value.

The following fields are **read-only after creation** and are ignored if posted:
`aircraft_id`, `flight_id`, `user_id`, `created`, `closed`, `closed_by`.

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
| `DEFECT` | Technical defect requiring maintenance action |
| `OBSERVATION` | Observation logged for awareness |
| `MAINTENANCE_ACTION` | Record of a maintenance action performed |
| `SERVICING` | Servicing entry (fluid, tyre, etc.) |
| `RESTRICTION` | Operational restriction applied to aircraft |
| `INFO` | Informational entry |

#### Severity

| Value | Description |
|-------|-------------|
| `LOW` | Low impact — no operational effect |
| `MEDIUM` | Moderate impact — monitor required |
| `HIGH` | Significant impact — action required soon |
| `CRITICAL` | Immediate action required |

#### Aircraft Status

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
