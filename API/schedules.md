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

Each `ScheduleHistory` row carries a `reason`. Alongside the manual reasons (weather, maintenance, pilot, etc.), `NOT_FLOWN` marks a booking that the system auto-cancelled because it was scheduled but never dispatched or logged past the company's not-flown grace window. Its `user_id` is the PIC (attribution), so it counts against the PIC in the cancellation analytics.

---

## Dispatch Schedule

<mark style="color:blue;">`GET`</mark> `/schedules/flight/{scheduleId}.json`

Create a flight record from a schedule (dispatch function). Converts the schedule entry into an actual flight.

#### Path Parameters

| Parameter | Type | Description |
|-----------|------|-------------|
| scheduleId | string | Schedule ID to dispatch |

#### Flight Risk Assessment (FRAT)

When the company setting `schedule_dispatch_frat` is enabled **and** the authenticated user is a crew member of the schedule (PIC, SIC or Supervisor), a completed FRAT is **mandatory**. In that case call this endpoint with <mark style="color:green;">`POST`</mark> and include the FRAT fields below; the dispatch is rejected (`result: false`) if they are missing. When the setting is off, or the dispatcher is not crew, the `GET` form is sufficient.

The FRAT result is stored per flight and per user (one row per crew member).

| Field | Type | Description |
|-------|------|-------------|
| frat_score | integer | Total weighted risk score |
| frat_band | string | Risk band: `LOW`, `MEDIUM` or `HIGH` |
| frat_data | string | JSON map of question id → chosen answer value |

> A `HIGH` band may only be dispatched by a Supervisor. Plans: Club, Premium, Unlimited.

#### MEL/CDL hard block

An **expired** MEL or CDL item on the schedule's aircraft is a hard block on dispatch —
unlike editing/creating a schedule (see [MEL and CDL warnings on save](#mel-and-cdl-warnings-on-save)
below), which only warns. The dispatch call returns `result: false` with a message naming
the ATA chapter and category:

```json
{
  "result": false,
  "message": "ATA 32 blocks dispatch — MEL Category C expired."
}
```

This is evaluated fresh on every dispatch attempt (open MEL/CDL items + current flight
count vs. the item's baseline), so a schedule that carried a warning yesterday can still
dispatch cleanly today if the item was rectified or extended in the meantime — and
conversely, a schedule that was fine at booking time can be blocked at dispatch time if an
item expired in between.

---

## FRAT Prefill

<mark style="color:blue;">`GET`</mark> `/schedules/frat_prefill/{scheduleId}.json`

Returns objective signals computed from the **authenticated user's** own flight history, used to pre-answer the data-backed FRAT questions. Scoped to the caller and their company.

#### Path Parameters

| Parameter | Type | Description |
|-----------|------|-------------|
| scheduleId | string | Schedule ID the assessment is for |

#### Response

| Field | Type | Description |
|-------|------|-------------|
| hours_90 | number | Block hours flown (as PIC or SIC) in the last 90 days |
| model_hours | number | Block hours on this schedule's aircraft model in the last 12 months |
| model_known | boolean | Whether the schedule's aircraft has a known model |
| night_hours | number | Night flight hours in the last 12 months |
| departure_flown | boolean \| null | Whether the user has flown to/from the departure airport before (`null` if unknown) |
| landing_flown | boolean \| null | Whether the user has flown to/from the destination airport before (`null` if unknown) |

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

Rows with `null` reason are omitted. `totals` is always a zero-indexed JSON array. For `action = CANCELED`, the `NOT_FLOWN` ("Not flown") reason appears for bookings the system auto-cancelled as no-shows, attributed to the PIC.

---

## Find Slots

<mark style="color:green;">`POST`</mark> `/schedules/find_slot.json`

Finds bookable slots for a date and aircraft. The `pic` parameter is optional — when omitted (student self-bookings) pilot availability is not checked and only the aircraft, maintenance, CRS expiry and the requesting user's own schedule are considered.

Each result carries an `available` marker:

* `available: true` — the slot is fully free and can be booked directly.
* `available: false` — the slot is blocked **only** by a `PENDING` booking (a student booking still waiting for a Flight Instructor). The PENDING record may be auto-canceled later, so the slot is still returned: the frontend shows it in yellow and offers to add it to the watchlist. Slots blocked by a confirmed booking, maintenance, an expired CRS or the user's own schedule are not returned at all.

Cancelled records (`status = CANCELED`, whether cancelled manually or auto-cancelled as `NOT_FLOWN`) are excluded from the search, so their time frame is offered again for new bookings.

Slots are generated inside the operating-hours windows configured for the **aircraft's base** on that date (see [company operating hours](company.md#operating-hours)). A day may hold several windows, and slots are generated per window, so no slot ever spans the closed stretch between two of them. When the base keeps no hours on the requested date the response carries `closed: true` with an empty `results` array — that is "the field is shut that day", which is a different answer from an open day whose slots are all taken.

#### Body Parameters

| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| date | string | Yes | Day to search (`YYYY-MM-DD`) |
| aircraft | int | Yes | Aircraft id |
| pic | int | No | Pilot id — when omitted, availability is not checked |

#### Response

```json
{
  "results": [
    { "start": 1750000000, "end": 1750003600, "available": true },
    { "start": 1750003600, "end": 1750007200, "available": false }
  ],
  "futureAvailabilities": null,
  "closed": false,
  "melBlocked": false
}
```

`closed` is `true` when the aircraft's base has no operating hours on the requested date; `results` is then always empty.

`melBlocked` is `true` when the aircraft has an **expired** MEL/CDL item. It never removes
or filters `results` — an expired item does not block *scheduling*, only *dispatch* (see
[Dispatch Schedule](#dispatch-schedule)) — it is only a flag the frontend can use to warn the
person booking the slot ahead of time.

---

## Available Flight Instructor (student self-booking)

<mark style="color:green;">`POST`</mark> `/schedules/available_fi.json`

Returns the Flight Instructor the system would auto-assign as PIC for a student self-booking, or `null` when none is available (the booking would then be stored with the `PENDING` status).

Selection rules: the FI must have `user_group_id <= 170`, `pilot = true`, `active = true`; an availability record of type `AVAILABLE` or `ALWAYS` (never `MAYBE`/`UNAVAILABLE`) covering the full time frame; no conflicting schedule or onsite class; the aircraft within their aircraft attributions (empty list = all aircraft); and the flight type within their flight type attributions (empty list = all flight types). The student's assigned FI (training supervisor) has priority over other available FIs.

#### Body Parameters

| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| start | int | Yes | Slot start (unix timestamp) |
| end | int | Yes | Slot end (unix timestamp) |
| aircraft | int | Yes | Aircraft id |
| flight_type | string | No | Flight type id |

#### Response

```json
{ "fi": { "id": "456", "name": "Jane Smith" } }
```

`fi` is `null` when no instructor is available.

---

## Flight Instructor Availabilities

<mark style="color:blue;">`GET`</mark> `/schedules/fi_availabilities.json?start={unix}&end={unix}`

Weekly availability of all Flight Instructors (`user_group_id <= 170` and `pilot = true`) of the company.

**Access control:** managers (`user_group_id <= 150`) always; FIs (`user_group_id` 151–170 with `pilot = true`) only when the **ALLOW FI SCHEDULE MANAGEMENT** company setting (`schedule_allow_fi_management`) is enabled. All other users receive `403 Forbidden`.

#### Response

```json
{
  "instructors": [
    {
      "User": { "id": "456", "user_group_id": "170" },
      "UserDetail": { "name": "Jane", "surname": "Smith", "photo": null },
      "ScheduleAvailability": [
        { "id": "a1", "type": "AVAILABLE", "start": 1750000000, "end": 1750028800 }
      ]
    }
  ],
  "start": 1749945600,
  "end": 1750550400
}
```

---

## My Slot Watchlist

<mark style="color:blue;">`GET`</mark> `/schedules/watchlist.json`

Lists the authenticated user's future slot watchlist entries. When a booking overlapping a watched slot is canceled or deleted, the watcher is notified (push notification + message) so they can grab the freed slot. Past entries are removed by the night cron.

#### Response

```json
{
  "watchlists": [
    {
      "ScheduleWatchlist": { "id": "w1", "aircraft_id": "45", "start": 1750000000, "end": 1750014400, "available": false, "created": 1749900000 },
      "Aircraft": { "id": "45", "registration": "EC-ABC" }
    }
  ]
}
```

`available` is set to `true` when an overlapping booking was canceled or deleted after the watch was created — the slot is now free and the entry is highlighted in green in the Schedules page widget.

---

## Watch a Slot

<mark style="color:green;">`POST`</mark> `/schedules/watchlist_add.json`

Adds an aircraft + time frame to the authenticated user's watchlist. Only active pilots (`pilot = true`, `active = true`) can watch slots; other users receive `403 Forbidden`. Overlapping entries for the same aircraft are merged.

If no active booking overlaps the requested time frame, the slot is already free: **no record is created** and the response carries `slotAvailable: true` so the client can tell the user to book right away.

#### Body Parameters

| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| aircraft_id | int | Yes | Aircraft id (must be active and belong to the company) |
| start | int | Yes | Watch start (unix timestamp) |
| end | int | Yes | Watch end (unix timestamp, must be in the future) |

#### Response

```json
{ "result": true, "slotAvailable": false }
```

---

## Remove a Watchlist Entry

<mark style="color:green;">`POST`</mark> `/schedules/watchlist_delete/{id}.json`

Removes one of the authenticated user's watchlist entries. Users can only delete their own entries.

#### Response

```json
{ "result": true }
```

---

## Self-booking role behaviour (`/schedules/edit.json`)

The schedule create/edit endpoint applies these role rules to self-bookings (`self_schedule = 1`):

| User group | Behaviour |
|-----------|-----------|
| Students (`user_group_id > 190`) | Can never be PIC. Stored as SIC (`sic_status ACCEPTED`). The system auto-assigns an available FI as PIC (`pic_status PENDING`, status `SCHEDULED`). When no FI is available, the booking is saved with status **`PENDING`** and an empty PIC. Students are exempt from the certificate gate below. |
| Pilots (`user_group_id` 171–190) | Unchanged: the user making the reservation is the PIC. |
| FIs / staff (`user_group_id <= 170`, `pilot = true`) | Fly as PIC. May pass another pilot in `pic_id`: it is stored as SIC with the instructor as PIC, saved directly as `SCHEDULED`. |

`PENDING` bookings are auto-assigned when a matching FI publishes `AVAILABLE`/`ALWAYS` availability (`/schedules/add_availability.json`, `/schedules/edit_availability.json` — response field `assignedPending`), and auto-canceled by the cron when `start - schedule_flight_cancellation_min_time` (hours) is reached.

### Certificate gate on self-bookings

A self-booking (`self_schedule = 1`) is rejected on the pilot's own certificates only when **both** company settings line up:

```
require_pic_docs = 1  AND  schedule_self_allow_nodocs = 0
```

`schedule_self_allow_nodocs` is the self-booking override: when it is `1`, a pilot whose licence, rating or medical is missing or expired can still create the booking. Both settings are returned by `GET /companies/settings.json` under `CompanySetting`.

The gate applies to pilots with `pilot = true` and `149 < user_group_id <= 190`. Managers (`user_group_id <= 149`), students (`> 190`) and non-pilots are never gated. Validity is evaluated with the same rule as `checkValidLicence` (a certificate is valid when `issue` is empty or past and `expiration` is empty or future).

When the gate rejects the booking:

```
HTTP 400 Bad Request
{ "message": "Self scheduled is blocked because you lack the required pilot certificates. Please contact your administrator." }
```

{% hint style="info" %}
`block_pic_without_docs` does **not** apply here — it gates manager schedule edits and flight dispatch, not self-bookings.
{% endhint %}

Clients should mirror this rule rather than blocking on certificate state alone: warn the pilot whenever documents are invalid, but keep the booking action available unless `require_pic_docs = 1` and `schedule_self_allow_nodocs = 0`. The same applies to the per-seat flight-type requirements returned by `GET /flight_types/compliance/{id}.json` — a non-compliant seat is a warning, and only that setting combination makes it a hard stop.

### MEL and CDL warnings on save

Saving a schedule (create or edit, via `/schedules/edit.json`) never fails because of a MEL
or CDL item — an expired item on the schedule's aircraft only adds an entry to a
`melWarnings` array in the response. The save itself still succeeds (`result: true`).

```json
{
  "result": true,
  "edit": { "Schedule": { "id": "789", "..." : "..." } },
  "melWarnings": [
    {
      "aircraft_registration": "EC-ABC",
      "report_id": "a1b2c3d4-e5f6-7890-abcd-ef1234567890",
      "ata_chapter": "32",
      "category": "C",
      "expires": 1717200000,
      "expired": true
    }
  ]
}
```

`melWarnings` is only ever populated with items that are currently **EXPIRED** — an item
that is merely expiring soon does not appear here. `melWarnings` is empty (`[]`) whenever
the schedule's aircraft has no expired MEL/CDL item, including when the request has no
`aircraft_id` at all. Note that this is purely advisory: the same expired item is a **hard
block** the moment someone actually tries to dispatch this schedule into a flight — see the
MEL/CDL hard block note under [Dispatch Schedule](#dispatch-schedule) above.
