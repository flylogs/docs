# Maintenance Jobs

Manage maintenance jobs for aircraft. Requires **premium** or **unlimited** subscription plan.

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
        "name": "Oil change",
        "User": {
          "id": "123",
          "UserDetail": {
            "name": "John",
            "surname": "Doe"
          }
        }
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

On validation failure, `result` is `false` and `message` contains field errors.

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
