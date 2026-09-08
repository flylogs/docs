# Maintenance Jobs

Manage maintenance jobs for aircraft. Requires a **club**, **premium** or **unlimited** subscription plan; every action in this plugin 404s on any other plan.

## Access control

| Action | Allowed |
|--------|---------|
| List / view (`index`, `view`, `history`, `forecasts`) | Any authenticated company user on a club/premium/unlimited plan. The Flylogs NEO interface shows maintenance sections to `user_group_id <= 170` and `>= 250` |
| Create / edit / sign CRS / duplicate / delete | `user_group_id` in **1, 100, 105, 110, 300** (administrators, managers and mechanics), or the aircraft owner |
| Attach / detach aircraft reports (`link_reports`, `unlink_report`) | Same as create: `user_group_id` in **1, 100, 105, 110, 300**, or the aircraft owner. Groups 120–200 are denied at ACL level |

## Next maintenance forecast

Answers, per aircraft, where the next maintenance stands: the job the shop has **booked**, and — only useful when nothing is booked — an **estimate** of when the running intervals will come due.

Batched for the whole fleet in a handful of queries, so a calendar can ask once for every aircraft rather than once per aircraft.

<mark style="color:blue;">`GET`</mark> `/maintenance/jobs/forecasts.json`

#### Query parameters

| Parameter | Type | Description |
|-----------|------|-------------|
| ids | string | Optional. Comma-separated aircraft ids, e.g. `?ids=8,10,14`. Ids outside the session company are dropped, not answered. Omit for the whole active fleet |

#### Response

Keyed by aircraft id. `planned` is the soonest open, dated job that has not finished yet; `forecast` is `null` when the aircraft has no running interval or no utilisation to project from.

```json
{
  "forecasts": {
    "8": {
      "planned": null,
      "forecast": {
        "status": "due",
        "basis": "history",
        "date": 1791100800,
        "band": { "early": 1789804800, "late": 1794124800 },
        "trigger": "hours",
        "job": { "ref": "585", "name": "Rev 100 h", "plan_id": null },
        "note": "Rev 100 h at the blended 90/365-day utilisation.",
        "remaining_hours": 42.5,
        "remaining_landings": null,
        "due_hours": 11767.1,
        "projected": { "hours": 11767.1, "landings": 10062 },
        "rate": {
          "hours_per_day": 1.575, "landings_per_day": 1.1,
          "short": 1.42, "long": 1.73, "short_hours": 127.8, "long_hours": 631.5
        }
      }
    },
    "48": {
      "planned": { "ref": "612", "name": "Rev 200 h", "start": 1789171200, "finish": 1789344000 },
      "forecast": { "status": "due", "date": 1789689600, "…": "…" }
    }
  }
}
```

| Field | Description |
|-------|-------------|
| planned | Booked work: `ref`, `name`, `start`, `finish` (unix seconds; `finish` may be `null`). `null` when nothing is booked. An open job with no `start` is a wish-list item, not a booking, and is not reported here |
| forecast.basis | `history` — projected from this aircraft's own signed-off intervals. `first_maintenance` — the aircraft has **no** maintenance history, so a nominal first check is offered instead: the sooner of the next 50 flight hours, the next 50 sectors, or 12 months out for an aircraft with no rate. `job.name` is `null` in that case, and clients MUST label it as a starting suggestion rather than a tracked interval |
| forecast.status | `due`, `overdue`, `beyond_horizon` (further out than 400 days), `no_interval` (the open jobs carry no hours/landings/calendar interval), `no_rate` (not flown recently enough to project), `no_jobs` |
| forecast.date | Unix seconds. `null` for `beyond_horizon`, `no_interval`, `no_rate` and `no_jobs`; for `overdue` it is the date the counter actually crossed the limit |
| forecast.band | Calibrated P10–P90 window in unix seconds, `null` when overdue. Measured coverage against real fleet history is ~84% |
| forecast.trigger | Which limit comes first: `hours`, `landings` or `calendar` |
| forecast.job | `ref` is the anchoring job's `n_id`; `name` is the plan action where a plan drove the forecast, otherwise the job's own name; `plan_id` is the `maintenance_plans.id` behind it, or `null`. A client raising a job from the forecast should use `name` and `plan_id` as-is — jobs are matched back to their plan by name, so renaming breaks the next forecast |
| forecast.remaining_hours | Negative when overdue |
| forecast.projected | Airframe reading expected **on `date`** — not the aircraft's reading today. For an `hours` trigger it is the due reading exactly; for `calendar` and `landings` triggers the counter is flown forward at the blended rate. An overdue aircraft projects its current reading, since the job would be raised now. `null` whenever `date` is `null` |

**Maintenance plans take precedence.** Where the aircraft is linked to a `maintenance_plan`, each plan action is anchored to the latest completed job belonging to it — matched on `maintenance_plan_id`, falling back to a case-insensitive name match, since only a handful of jobs carry the link — and the plan's `hours_interval`, `landings_interval` and `repeat` are counted forward from there. All three are offered and the soonest wins. A plan's calendar arm is never discarded for being stale: a monthly check nobody has done in a year is reported as overdue, not hidden. Jobs consumed by a plan no longer contribute an interval of their own, so an aircraft on an annual plan that also runs job-recorded 50 h checks keeps both.

Use `projected` — never the aircraft's current reading — when raising a job against a forecast. A job carries the reading it was created at and its next interval is measured from there, so today's counter would start the following cycle short by everything flown between now and the check.

**Consumers must treat `planned` as authoritative and the forecast as advisory.** A client that lets an estimate block a booking or fail a save is wrong: the estimate is a planning aid, not a limit.

Older deployments answer `Maintenance.next` on `/aircraft/view.json` with a bare unix timestamp instead of the object above; clients should accept both.

## Recurring jobs

Jobs carry a `repeat` field with one of: `NEVER`, `DAY`, `WEEK`, `MONTH`, `QUARTER`, `SEMESTER`, `YEAR`. When a job is marked complete (`completed = true`) and its `repeat` is not `NEVER`, the system automatically clones the job into the future:

- `start` is shifted by the repeat interval (e.g. `SEMESTER` adds 6 months).
- `finish` preserves the original duration.
- `expiration` preserves the original offset from `start` if it was set.
- `completed` is reset to `false`; `hours_now` and `landings_now` are reset to `0`.
- All linked `WorkOrder` rows are duplicated with `status = pending`.

Cloning is idempotent: a successor with the same `aircraft_id`, `name` and computed `start` will not be created twice. A console command `Console/cake maintenance recurring [companyId]` runs the same scan for jobs that completed before this feature was deployed and is safe to schedule via cron.

## Completion signature

When a job transitions from `completed = false` to `completed = true`, the server stamps a `signature` JSON column with the authenticated user and timestamp:

```json
{ "user_id": 123, "signed_at": 1778485469 }
```

The signature is captured **only on the false → true transition**; re-saving an already-completed job will not overwrite the original signature. The field is `NULL` for jobs that have never been completed.

## Inspection signature

After the CRS has been signed, a job can additionally be **inspected**. The inspection is stored as a `JobChange` event with `action = INSPECT` (user + timestamp) and printed in the **Inspected By** signature box of the job card PDF. In the Flylogs NEO interface the inspector confirms with their account password and the same certification disclaimer as the CRS signature; re-signing the CRS invalidates the previous inspection (a new INSPECT event after the latest SIGN is required).

<mark style="color:green;">`POST`</mark> `/maintenance/jobs/inspect.json`

#### Request Body

| Parameter | Type | Description |
|-----------|------|-------------|
| data[Job][id] | string | **Required.** Job UUID. The job must belong to the company and have `completed = true`, otherwise a 400/404 is returned |

#### Response

```json
{
  "result": true,
  "inspection": { "user_id": 3, "created": 1781141714 }
}
```

## Job card PDF signature boxes

The job card PDF prints three signature boxes, filled from the job's change history:

| Box | Source |
|-----|--------|
| Performed By | The user that **created** the maintenance job (oldest `ADD` event) |
| Inspected By | The latest `INSPECT` event recorded after the current CRS signature |
| Approved By | The user that **signed the CRS** (latest `SIGN` event) |

## List Jobs

<mark style="color:green;">`POST`</mark> `/maintenance/jobs/index.json`

Retrieve a paginated list of maintenance jobs for the company fleet.

#### Request Body (optional filters)

| Parameter | Type | Description |
|-----------|------|-------------|
| aircraft | number | Filter by aircraft ID |
| from | string | Start date filter (parseable date string) |
| to | string | End date filter (parseable date string) |
| wc | string | Search in job ID number and name |

#### Response

```json
{
  "maintenances": [
    {
      "Job": {
        "id": "a1b2c3d4-e5f6-7890-abcd-ef1234567890",
        "company_id": "c1d2e3f4-a5b6-7890-abcd-ef1234567890",
        "aircraft_id": "45",
        "user_id": "123",
        "n_id": "42",
        "name": "100h Inspection",
        "start": "1714003200",
        "finish": "1714089600",
        "hours_now": "1250.5",
        "hours_added": "10.0",
        "landings_now": "890",
        "landings_added": null,
        "expiration": null,
        "description": "Scheduled 100-hour inspection per manufacturer guidelines.",
        "created": "1714003200"
      },
      "Aircraft": {
        "registration": "EC-ABC",
        "Base": {
          "name": "LEBL"
        }
      },
      "WorkOrder": [
        {
          "id": "b2c3d4e5-f6a7-8901-bcde-f12345678901",
          "name": "Oil change",
          "ata": "79",
          "status": "completed"
        }
      ],
      "CompletedWorkOrder": [
        {
          "id": "b2c3d4e5-f6a7-8901-bcde-f12345678901",
          "name": "Oil change",
          "ata": "79",
          "status": "completed"
        }
      ]
    }
  ],
  "paginate": {
    "page": 1,
    "current": 10,
    "count": 42,
    "prevPage": false,
    "nextPage": true,
    "pageCount": 5,
    "limit": 50
  }
}
```

---

## View Job

<mark style="color:blue;">`GET`</mark> `/maintenance/jobs/view/{id}.json`

Retrieve full details for a single maintenance job, including work orders and file uploads.

#### Path Parameters

| Parameter | Type | Description |
|-----------|------|-------------|
| id | string | Job UUID |

#### Response

```json
{
  "maintenance": {
    "Job": {
      "id": "a1b2c3d4-e5f6-7890-abcd-ef1234567890",
      "company_id": "c1d2e3f4-a5b6-7890-abcd-ef1234567890",
      "aircraft_id": "45",
      "user_id": "123",
      "n_id": "42",
      "name": "100h Inspection",
      "start": "1714003200",
      "finish": "1714089600",
      "hours_now": "1250.5",
      "hours_added": "10.0",
      "landings_now": "890",
      "landings_added": null,
      "expiration": null,
      "description": "Scheduled 100-hour inspection per manufacturer guidelines.",
      "created": "1714003200"
    },
    "Uploads": [],
    "Aircraft": {
      "id": "45",
      "registration": "EC-ABC",
      "active": true,
      "maintenance": true,
      "flight_count": "1200",
      "AircraftModel": {
        "name": "C172",
        "AircraftManufacturer": {
          "name": "Cessna"
        }
      }
    },
    "WorkOrder": [
      {
        "id": "b2c3d4e5-f6a7-8901-bcde-f12345678901",
        "status": "pending",
        "name": "Oil change",
        "created": "1714003200"
      }
    ],
    "AircraftReport": [
      {
        "id": "a1b2c3d4-e5f6-7890-abcd-ef1234567890",
        "title": "Nose gear shimmy above 80kt",
        "type": "DEFECT",
        "severity": "MEDIUM",
        "status": "CLOSED",
        "aircraft_status": "FLYABLE",
        "ata_chapter": "32",
        "system": "Landing Gear",
        "dispatch_condition": "MONITOR",
        "created": "1714003200"
      },
      {
        "id": "b2c3d4e5-f6a7-8901-bcde-f23456789012",
        "title": "Left navigation light u/s",
        "type": "DEFECT",
        "severity": "LOW",
        "status": "CLOSED",
        "aircraft_status": "FLYABLE",
        "ata_chapter": "33",
        "system": "Lights",
        "dispatch_condition": "MEL",
        "created": "1714089600"
      }
    ]
  }
}
```

`AircraftReport` holds **every** report this job clears, oldest first. Use
[link_reports](#attach-aircraft-reports) to add more and
[unlink_report](#detach-an-aircraft-report) to remove one.

---

## Create Job

<mark style="color:green;">`POST`</mark> `/maintenance/jobs/create.json`

Create a new maintenance job. The authenticated user must be a manager or the aircraft's assigned user. An auto-incremented `n_id` is assigned server-side.

#### Request Body

| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| Job[aircraft_id] | number | yes | Aircraft ID |
| Job[name] | string | yes | Job name / title |
| Job[start] | string | yes | Start date (parseable date string) |
| Job[finish] | string | no | Finish date (defaults to start date) |
| Job[hours_now] | number | yes | Aircraft total hours at time of job (decimal or HH:MM) |
| Job[hours_added] | number | no | Hours added during job |
| Job[landings_now] | number | no | Aircraft total landings at time of job |
| Job[landings_added] | number | no | Landings added during job |
| Job[hours_checkbox] | string | no | Set to non-zero to require `hours_added` |
| Job[expiration_checkbox] | string | no | Set to non-zero to enable expiration date |
| Job[expiration] | string | no | Expiration date (parseable date string, required if checkbox enabled) |
| Job[description] | string | no | Job description |
| Job[crs] | string | no | Certificate of Release to Service — set to any truthy value to mark the job complete and automatically close all linked open aircraft reports |
| Job[aircraft_report_id] | string | no | Aircraft report UUID to attach to the new job (single, legacy form) |
| Job[aircraft_report_ids][] | string[] | no | Several aircraft report UUIDs to attach to the new job. Reports of another aircraft are silently skipped |
| Job[attachment] | file | no | File upload (image, video, or document) |

#### Response

```json
{
  "data": {
    "aircraft_id": "45",
    "name": "100h Inspection",
    "start": "1714003200",
    "finish": "1714089600",
    "hours_now": "1250.5",
    "user_id": "123",
    "company_id": "c1d2e3f4-a5b6-7890-abcd-ef1234567890"
  },
  "result": {
    "Job": {
      "id": "a1b2c3d4-e5f6-7890-abcd-ef1234567890",
      "n_id": "42",
      "name": "100h Inspection"
    }
  },
  "attachment": null,
  "message": null
}
```

On validation failure, `result` is `false`, `job` is `null` and `message` is a map of field → error messages, e.g.:

```json
{
  "result": false,
  "job": null,
  "attachment": null,
  "message": {
    "aircraft_id": ["Aircraft cannot be empty"],
    "name": ["Maintenance name cannot be empty"]
  }
}
```

If the save fails without producing field-level errors (e.g. a DB or `beforeSave` abort), `message` falls back to the string `"Unable to save the maintenance job"`.

---

## Attach aircraft reports

<mark style="color:green;">`POST`</mark> `/maintenance/jobs/link_reports.json`

Attach one or more **existing** aircraft reports to an **existing** job, so a batch
of defects reported over several flights is cleared in a single intervention.

A report belongs to at most one job; attaching it to a second job moves it. Signing
the job's CRS closes every report attached to it, which is why the endpoint refuses
to touch a job that is already signed.

#### Request Body

| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| Job[id] | string | yes | Maintenance job UUID |
| Job[aircraft_report_ids][] | string[] | yes | Aircraft report UUIDs. `Job[aircraft_report_id]` (singular) and a comma separated string are also accepted |

Reports are accepted only when they belong to the **same aircraft** as the job.
Ones that do not are skipped rather than failing the whole call; the `linked` array
in the response says which were actually attached.

#### Response

```json
{
  "result": true,
  "linked": [
    "a1b2c3d4-e5f6-7890-abcd-ef1234567890",
    "b2c3d4e5-f6a7-8901-bcde-f23456789012"
  ],
  "message": null
}
```

When no supplied report matches the job's aircraft, `result` is `false`, `linked` is
empty and `message` reads `"No matching aircraft report found for this aircraft"`.

#### Errors

| Status | Cause |
|--------|-------|
| 400 | `Job[id]` missing, no report ids supplied, or the job's CRS is already signed |
| 404 | Job not found in the company, or the user may not work on this aircraft |

---

## Detach an aircraft report

<mark style="color:green;">`POST`</mark> `/maintenance/jobs/unlink_report.json`

Detach a report from its maintenance job. The report keeps its own status and stays
open, so it can be grouped into a different job.

#### Request Body

| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| Job[aircraft_report_id] | string | yes | Aircraft report UUID |

#### Response

```json
{ "result": true }
```

#### Errors

| Status | Cause |
|--------|-------|
| 400 | Parameter missing, the report is not attached to any job, or the job's CRS is already signed |
| 404 | Report not found in the company, or the user may not work on this aircraft |

---

## Delete Job

<mark style="color:blue;">`GET`</mark> `/maintenance/jobs/delete/{id}.json`

Delete a maintenance job and all associated work orders. The authenticated user must be a manager or the aircraft's assigned user.

#### Path Parameters

| Parameter | Type | Description |
|-----------|------|-------------|
| id | string | Job UUID |

#### Response

```json
{
  "result": true,
  "maintenance": {
    "Job": {
      "id": "a1b2c3d4-e5f6-7890-abcd-ef1234567890",
      "name": "100h Inspection"
    },
    "Aircraft": {
      "id": "45",
      "registration": "EC-ABC"
    }
  }
}
```
