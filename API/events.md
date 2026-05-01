# Events

Company calendar events. The `calendar` endpoint is publicly accessible (no authentication required when called with a user token).

---

## Event Types

| ID | Name | Color |
|----|------|-------|
| 1 | Meetings | `#907630` |
| 2 | Audit | `#904a30` |
| 3 | Party | `#902b4c` |
| 4 | Press Conference | `#90398c` |
| 5 | Sport Events | `#4f3b90` |
| 6 | Operations start | `#345090` |
| 7 | Operations finish | `#3b7790` |

---

## Get Event Types

<mark style="color:blue;">`GET`</mark> `/events/types.json`

Returns the full list of event type definitions.

#### Response

```json
{
  "eventTypes": {
    "1": { "name": "Meetings", "color": "#907630" },
    "2": { "name": "Audit", "color": "#904a30" }
  }
}
```

---

## List Events

<mark style="color:blue;">`GET`</mark> `/events/index.json`

Returns events for the authenticated user's company. Users with `user_group_id > 120` see only events they are a recipient of (by user ID or user group). Accepts date range via query string.

#### Query Parameters

| Parameter | Type | Description |
|-----------|------|-------------|
| start | string | Start datetime filter. Events with `start >` this value. Defaults to 1 month ago. |
| end | string | End datetime filter. Events with `start <` this value. |
| base_id | string (named param) | Filter events by base ID |
| course_id | string (named param) | Filter events by course ID |

#### Response

Returns a flat array of event objects. Timestamps are in **milliseconds**.

```json
{
  "data": [
    {
      "id": "e1",
      "title": "Safety Briefing",
      "details": "Safety Briefing",
      "start": 1736505600000,
      "end": 1736509200000,
      "eventType": "Meetings",
      "color": "#907630",
      "url": "/events/view/e1",
      "base": "LEBL",
      "user": "John Doe"
    }
  ]
}
```

---

## View Event

<mark style="color:blue;">`GET`</mark> `/events/view/{id}.json`

Full details for a single event including recipients. Users with `user_group_id > 140` can only view events they are a recipient of; their `EventRecipient` list is cleared in the response.

#### Path Parameters

| Parameter | Type | Description |
|-----------|------|-------------|
| id | UUID | Event ID |

#### Response

```json
{
  "event": {
    "Event": {
      "id": "e1",
      "name": "Safety Briefing",
      "details": "Monthly safety meeting",
      "start": 1736505600,
      "end": 1736509200,
      "all_day": false,
      "company_id": "42",
      "user_id": "50",
      "base_id": "b1",
      "modified": "2025-01-10 08:00:00"
    },
    "Base": { "name": "LEBL" },
    "EventType": { "name": "Meetings" },
    "EventRecipient": [
      {
        "UserGroup": { "name": "Pilot" },
        "User": [
          { "id": "100", "UserDetail": { "name": "John", "surname": "Doe" } }
        ]
      }
    ]
  }
}
```

---

## Create / Edit Event

<mark style="color:green;">`POST`</mark> `/events/edit.json`

Create or update a calendar event. If `Event.id` is provided and found, it updates the existing event. Recipients are replaced entirely on each save.

#### Request Body

| Field | Type | Required | Description |
|-------|------|----------|-------------|
| Event.id | UUID | No | Existing event ID to update |
| Event.name | string | Yes | Event name |
| Event.start | number | Yes | Start time (Unix timestamp) |
| Event.end | number | No | End time (Unix timestamp) |
| Event.all_day | boolean | No | All-day event flag |
| Event.details | string | No | Event description |
| Event.base_id | UUID | No | Base/location ID |
| Event.foreign_id | UUID | No | Related entity ID (base or course) |
| EventRecipient.user_group_id | array | No | User group IDs that receive this event |
| EventRecipient.user_id | array | No | Specific user IDs that receive this event |

#### Response

```json
{
  "result": true,
  "errors": null
}
```

---

## Delete Event

<mark style="color:blue;">`GET`</mark> `/events/delete/{id}.json`

Delete a calendar event. Event must belong to the authenticated user's company.

#### Path Parameters

| Parameter | Type | Description |
|-----------|------|-------------|
| id | UUID | Event ID |

#### Response

```json
{
  "id": "e1"
}
```

---

## Full Calendar Feed

<mark style="color:blue;">`GET`</mark> `/events/calendar.json`

<mark style="color:blue;">`GET`</mark> `/events/calendar/{userId}.json`

<mark style="color:blue;">`GET`</mark> `/events/calendar/{userId}/{created}.json`

Returns a unified calendar feed combining events, flights, scheduled flights, and training classes for the target user. Accepts date range via query string.

**Authentication modes:**
- No params: authenticated user's own calendar.
- `userId` only: managers (`user_group_id < 171`) may view other users' calendars.
- `userId` + `created` (user's created timestamp): unauthenticated access — used for external calendar feed URLs.

Returns JSON when called as a JSON request, or `text/calendar` (iCal) otherwise.

#### Query Parameters

| Parameter | Type | Description |
|-----------|------|-------------|
| start | string | Filter events starting after this date. Defaults to 1 month ago. |
| end | string | Filter events starting before this date. |
| base_id | string (named) | Filter events by base ID |
| course_id | string (named) | Filter events by course ID |

#### Response

Flat array of calendar items. Event timestamps are **Unix seconds** (unlike the `index` endpoint which uses milliseconds).

```json
{
  "data": [
    {
      "id": "e1",
      "title": "Safety Briefing",
      "details": "Safety Briefing",
      "start": 1736505600,
      "end": 1736509200,
      "eventType": "Meetings",
      "color": "#907630",
      "resourceId": "",
      "location": "",
      "url": "/events/view/e1",
      "modified": "2025-01-10 08:00:00"
    },
    {
      "id": "f1",
      "title": "EC-ABC LEBL LEMD",
      "details": "EC-ABC IFR Training\nJohn Doe",
      "start": 1736505000,
      "end": 1736511900,
      "eventType": "Flight",
      "color": "#ba9ac1",
      "resourceId": "45",
      "location": "LEBL LEMD",
      "url": "/flights/view/f1",
      "modified": "2025-01-10 15:00:00"
    },
    {
      "id": "sc1",
      "title": "EC-ABC LEBL LEMD",
      "details": "Training 0800-1000Z\n[LEBL -> LEMD]\nAC EC-ABC (C172)\nPIC John Doe +34600000000",
      "start": 1736503200,
      "end": 1736510400,
      "eventType": "Scheduled Flight",
      "color": "#2ecc71",
      "resourceId": "45",
      "location": "LEBL LEMD",
      "url": "/schedules/view/sc1",
      "status": "CONFIRMED",
      "modified": 1736500000
    },
    {
      "id": "lc1",
      "title": "Meteorology - Weather Systems",
      "details": "THEORETICAL TRAINING - Lesson",
      "start": 1736460000,
      "end": 1736467200,
      "eventType": "THEORETICAL TRAINING - Lesson",
      "color": "#3498db",
      "resourceId": "lc1",
      "location": "Classroom A",
      "url": "/trainings/onsite/class/lc1",
      "modified": "2025-01-08 09:00:00"
    }
  ]
}
```
