# Schedules

## List Schedules

<mark style="color:blue;">`GET`</mark> `/schedules.json`

Retrieve upcoming schedule records and status definitions.

#### Response

```json
{
  "future": [
    {
      "Schedule": {
        "id": "789",
        "status": "confirmed",
        "title": "Training Flight",
        "departure_airport": "LEMD",
        "landing_airport": "LEMD",
        "start": "2025-03-15 08:00:00",
        "end": "2025-03-15 10:00:00",
        "notes": "Circuit training",
        "aircraft_id": "45",
        "pic_id": "123",
        "sic_id": null,
        "supervisor_id": null,
        "flight_type_id": "1",
        "flight_id": null,
        "pic_status": "accepted",
        "sic_status": "pending",
        "user_status": "accepted",
        "notified": true,
        "borderColor": "#3498db"
      },
      "Pic": {
        "id": "123",
        "email": "john@example.com",
        "user_group_id": "110",
        "UserGroup": { "name": "Pilot" },
        "UserDetail": { "name": "John", "surname": "Doe", "id": "123" }
      },
      "Sic": null,
      "Supervisor": null,
      "Flight": null,
      "Aircraft": {
        "registration": "EC-ABC",
        "photo": "https://...",
        "aircraft_model_id": "10",
        "AircraftModel": {
          "id": "10",
          "icao": "C172",
          "name": "C172",
          "type": "SEP",
          "AircraftManufacturer": { "name": "Cessna" }
        }
      },
      "FlightType": { "name": "Training", "color": "#3498db" },
      "PicTrainingFlight": null,
      "SicTrainingFlight": null
    }
  ],
  "canCreate": true,
  "status": {
    "confirmed": { "color": "#2ecc71", "class": "success", "name": "Confirmed" },
    "pending": { "color": "#f39c12", "class": "warning", "name": "Pending" },
    "cancelled": { "color": "#e74c3c", "class": "danger", "name": "Cancelled" }
  },
  "crewstatus": {
    "accepted": { "color": "#2ecc71", "class": "success", "name": "Accepted" },
    "pending": { "color": "#f39c12", "class": "warning", "name": "Pending" },
    "declined": { "color": "#e74c3c", "class": "danger", "name": "Declined" }
  }
}
```

---

## View Schedule

<mark style="color:blue;">`GET`</mark> `/schedules/view/{id}.json`

Retrieve full details for a single schedule record, including history.

Users with `user_group_id > 170` may only view schedules they are involved in (creator, PIC, SIC, supervisor, or owner of the aircraft). Otherwise returns `403 Forbidden`.

#### Path Parameters

| Parameter | Type | Description |
|-----------|------|-------------|
| id | string | Schedule ID |

#### Response

Same structure as a single item in the `future` array, plus:

```json
{
  "event": { "Schedule": {...}, "Pic": {...}, ... },
  "ScheduleHistory": [
    {
      "id": "100",
      "schedule_id": "789",
      "action": "created",
      "user_id": "123",
      "reason": null,
      "text": null,
      "created": "2025-03-10 14:00:00",
      "User": {
        "id": "123",
        "UserDetail": { "name": "John", "surname": "Doe" }
      }
    }
  ],
  "status": {...},
  "crewstatus": {...}
}
```

---

## Dispatch Schedule

<mark style="color:blue;">`GET`</mark> `/schedules/flight/{scheduleId}.json`

Create a flight record from a schedule (dispatch function). Converts the schedule entry into an actual flight.

#### Path Parameters

| Parameter | Type | Description |
|-----------|------|-------------|
| scheduleId | string | Schedule ID to dispatch |

---

## Availability

### Get Availability

<mark style="color:blue;">`GET`</mark> `/schedules/get_availability.json`

Retrieve pilot availability records within a date range.

#### Query Parameters

| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| start | string | Yes | Start date (YYYY-MM-DD) |
| end | string | Yes | End date (YYYY-MM-DD) |
| timeZone | string | Yes | IANA timezone name (e.g. `Europe/Madrid`) |

#### Response

```json
[
  {
    "id": "500",
    "title": "Available",
    "color": "#2ecc71",
    "type": "AVAILABLE",
    "start": 1710489600,
    "end": 1710518400
  }
]
```

#### Availability Types

| Type | Description |
|------|-------------|
| `AVAILABLE` | Pilot is available for scheduling |
| `UNAVAILABLE` | Pilot is not available |
| `MAYBE` | Pilot may be available (conditional) |
| `ALWAYS` | Pilot is always available (default) |

### Add Availability

<mark style="color:green;">`POST`</mark> `/schedules/add_availability.json`

Create a new availability record.

#### Request Body

| Field | Type | Required | Description |
|-------|------|----------|-------------|
| start | string | Yes | Start datetime |
| end | string | Yes | End datetime |
| type | string | Yes | `AVAILABLE`, `UNAVAILABLE`, or `MAYBE` |

### Edit Availability

<mark style="color:green;">`POST`</mark> `/schedules/edit_availability.json`

Update an existing availability record.

#### Request Body

| Field | Type | Required | Description |
|-------|------|----------|-------------|
| id | string | Yes | Availability record ID |
| start | string | Yes | Start datetime |
| end | string | Yes | End datetime |
| type | string | Yes | `AVAILABLE`, `UNAVAILABLE`, or `MAYBE` |

### Delete Availability

<mark style="color:blue;">`GET`</mark> `/schedules/delete_availability/{id}.json`

Delete a specific availability record.

### Delete All Availability

<mark style="color:blue;">`GET`</mark> `/schedules/delete_availability/all.json`

Delete all availability records for the authenticated user.

### Delete "Always Available"

<mark style="color:blue;">`GET`</mark> `/schedules/delete_availability/always.json`

Remove the "always available" default setting.

---

## Calendar Events

<mark style="color:blue;">`GET`</mark> `/events/calendar.json`

Retrieve calendar events (schedules, classes, exams) within a date range.

#### Query Parameters

| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| start | string | Yes | Start date |
| end | string | Yes | End date |
| timeZone | string | Yes | IANA timezone name |

#### Response

```json
[
  {
    "id": "789",
    "title": "Training Flight - EC-ABC",
    "details": "Circuit training with John Doe",
    "start": 1710489600,
    "end": 1710496800,
    "eventType": "schedule",
    "color": "#3498db",
    "resourceId": "45",
    "location": "LEMD",
    "url": "/schedules/view/789",
    "status": "confirmed",
    "modified": 1710460800
  }
]
```

---

## Events Index

<mark style="color:blue;">`GET`</mark> `/events/index.json`

Retrieve events for the dashboard view.

#### Query Parameters

| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| start | string | Yes | Start date |
| end | string | Yes | End date |

---

## Event Reason Totals

<mark style="color:blue;">`GET`</mark> `/schedules/reports_event_reasons/{action}/{year}/{month}.json`

Aggregate counts of `ScheduleHistory.reason` for a given action within a month, scoped to the authenticated user's company.

#### Path Parameters

| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| action | string | Yes | History action, e.g. `CANCELED`, `REJECTED`, `ACCEPTED` |
| year | int | Yes | Year |
| month | int | Yes | Month (1-12) |

#### Response

```json
{
  "totals": [
    { "name": "weather", "color": "#1f77b4", "total": "12" },
    { "name": "maintenance", "color": "#d62728", "total": "3" }
  ]
}
```

Rows with `null` reason are omitted. `totals` is always a zero-indexed JSON array.
