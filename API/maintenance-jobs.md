# Maintenance Jobs

Manage maintenance jobs for aircraft. Requires **premium** or **unlimited** subscription plan.

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
        "created": "1714003200"
      }
    ]
  }
}
```

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
