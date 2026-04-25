# Work Orders

Manage work orders within maintenance jobs. Requires **premium** or **unlimited** subscription plan.

## View Work Order

<mark style="color:blue;">`GET`</mark> `/maintenance/workorder/view/{id}.json`

Retrieve full details for a single work order, including related inventory units and the parent maintenance job.

#### Path Parameters

| Parameter | Type | Description |
|-----------|------|-------------|
| id | string | Work order UUID |

#### Response

```json
{
  "workorder": {
    "WorkOrder": {
      "id": "b2c3d4e5-f6a7-8901-bcde-f12345678901",
      "job_id": "a1b2c3d4-e5f6-7890-abcd-ef1234567890",
      "user_id": "123",
      "n_id": "3",
      "name": "Oil change",
      "ata": "79",
      "description": "Engine oil and filter replacement.",
      "time": "1.5",
      "status": "completed",
      "created": "1714003200"
    },
    "InventoryUnit": [
      {
        "Inventory": {
          "id": "d4e5f6a7-b8c9-0123-defg-h12345678901",
          "name": "Oil filter",
          "part_number": "CH48110-1"
        }
      }
    ],
    "User": {
      "id": "123",
      "UserDetail": {
        "name": "John",
        "surname": "Doe"
      }
    },
    "Job": {
      "Aircraft": {
        "id": "45",
        "company_id": "c1d2e3f4-a5b6-7890-abcd-ef1234567890",
        "registration": "EC-ABC",
        "AircraftModel": {
          "name": "C172",
          "AircraftManufacturer": {
            "name": "Cessna"
          }
        }
      }
    }
  }
}
```

---

## Edit Work Order

<mark style="color:green;">`POST`</mark> `/maintenance/workorder/edit.json`

Create or update a work order. The parent maintenance job must belong to the authenticated user's company.

#### Request Body

| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| WorkOrder[id] | string | no | Work order UUID (omit to create new) |
| WorkOrder[job_id] | string | yes | Parent maintenance job UUID |
| WorkOrder[name] | string | yes | Work order name |
| WorkOrder[status] | string | yes | `pending`, `open`, `completed`, `accomplished`, `closed` |
| WorkOrder[ata] | string | no | ATA chapter code |
| WorkOrder[description] | string | no | Work description |
| WorkOrder[time] | number | no | Time spent (decimal or HH:MM) |
| WorkOrder[user_id] | number | no | Assigned user ID |

#### Response

```json
{
  "result": {
    "WorkOrder": {
      "id": "b2c3d4e5-f6a7-8901-bcde-f12345678901",
      "job_id": "a1b2c3d4-e5f6-7890-abcd-ef1234567890",
      "name": "Oil change",
      "status": "completed"
    }
  },
  "message": "Work order saved",
  "errors": []
}
```

On validation failure:

```json
{
  "result": false,
  "message": "Could not save work order due to validation errors",
  "errors": {
    "name": ["Please enter a name"],
    "status": ["Invalid status"]
  }
}
```

---

## Delete Work Order

<mark style="color:green;">`POST`</mark> `/maintenance/workorder/delete.json`

Delete a work order. The parent maintenance job must belong to the authenticated user's company.

#### Request Body

| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| id | string | yes | Work order UUID |

#### Response

```json
{
  "result": true,
  "job": {
    "WorkOrder": {
      "id": "b2c3d4e5-f6a7-8901-bcde-f12345678901"
    },
    "Job": {
      "id": "a1b2c3d4-e5f6-7890-abcd-ef1234567890"
    }
  }
}
```

---

## Enumerations Reference

#### Status

| Value | Description |
|-------|-------------|
| `pending` | Work order created but not started |
| `open` | Work in progress |
| `completed` | Work completed, awaiting review |
| `accomplished` | Work accomplished and verified |
| `closed` | Work order closed |
