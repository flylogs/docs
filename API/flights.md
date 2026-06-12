# Flights

## List Flights

<mark style="color:blue;">`GET`</mark> `/flights/load/page:{page}/from:{from}/to:{to}/aircraft:{aircraftId}/pilot:{pilotId}/base:{baseId}/flight_type:{typeId}/.json`

Retrieve a paginated list of flight records with optional filters.

#### Path Parameters

All filter parameters are optional — use empty string to skip a filter.

| Parameter | Type | Description |
|-----------|------|-------------|
| page | number | Page number (starts at 1) |
| from | string | Start date filter (YYYY-MM-DD) |
| to | string | End date filter (YYYY-MM-DD) |
| aircraft | string | Aircraft ID filter |
| pilot | string | Pilot user ID filter |
| base | string | Base ID filter |
| flight_type | string | Flight type ID filter |
| limit | number | Records per page (optional, default 20, max 20000) |

#### Example

```
GET /flights/load/page:1/from:2025-01-01/to:2025-03-31/aircraft:/pilot:/base:/flight_type:/.json
```

#### Response

```json
{
  "flights": [
    {
      "Flight": {
        "id": "5678",
        "date": "2025-03-10",
        "draft": false,
        "callsign": "EC-ABC",
        "departure_airport": "LEMD",
        "landing_airport": "LEBL",
        "offblocks_time": "08:00:00",
        "takeoff_time": "08:15:00",
        "landing_time": "09:15:00",
        "onblocks_time": "09:25:00",
        "block_time": "5100",
        "flight_time": "3600",
        "rules": "VFR",
        "landings": "1",
        "engine_starts": "1",
        "pax": "2",
        "oil": "0.5",
        "fuel": "45",
        "cargo": "0",
        "night_flight_time": "0",
        "ifr_flight_time": "0"
      },
      "Base": {
        "id": "5",
        "name": "Madrid Base"
      },
      "Aircraft": {
        "id": "45",
        "registration": "EC-ABC",
        "multiengine": false,
        "multipilot": false,
        "simulator": false,
        "AircraftModel": {
          "name": "C172",
          "icao": "C172",
          "AircraftManufacturer": { "name": "Cessna" }
        }
      },
      "FlightType": {
        "id": "1",
        "name": "Training",
        "color": "#3498db",
        "pic_flight_time": "pic",
        "sic_flight_time": "none",
        "supervisor_flight_time": "none"
      },
      "Pic": {
        "id": "123",
        "user_group_id": "110",
        "UserDetail": {
          "name": "John",
          "surname": "Doe",
          "id": "123"
        }
      },
      "Sic": null
    }
  ],
  "paginate": {
    "page": 1,
    "current": 1,
    "count": 156,
    "prevPage": false,
    "nextPage": true,
    "pageCount": 7,
    "limit": 25
  },
  "time": "1.23"
}
```

#### Pagination

| Field | Type | Description |
|-------|------|-------------|
| page | number | Requested page |
| current | number | Current page |
| count | number | Total number of records |
| prevPage | boolean | Whether a previous page exists |
| nextPage | boolean | Whether a next page exists |
| pageCount | number | Total number of pages |
| limit | number | Records per page |

#### Time Fields

Flight times (`block_time`, `flight_time`, `night_flight_time`, `ifr_flight_time`) are returned in **seconds**.

---

## View Flight

<mark style="color:blue;">`GET`</mark> `/flights/view/{id}.json`

Retrieve full details for a single flight, including crew, airports, audit trail, and permissions.

Users with `user_group_id > 170` may only view flights they are involved in (creator, PIC, SIC, supervisor, or owner of the aircraft). Otherwise returns `403 Forbidden`.

#### Path Parameters

| Parameter | Type | Description |
|-----------|------|-------------|
| id | string | Flight ID |

#### Response

```json
{
  "flight": {
    "Flight": {
      "id": "5678",
      "date": "2025-03-10",
      "draft": false,
      "deleted": false,
      "callsign": "EC-ABC",
      "departure_airport": "LEMD",
      "landing_airport": "LEBL",
      "offblocks_time": "08:00:00",
      "takeoff_time": "08:15:00",
      "landing_time": "09:15:00",
      "onblocks_time": "09:25:00",
      "block_time": "5100",
      "flight_time": "3600",
      "night_flight_time": "0",
      "ifr_flight_time": "0",
      "rules": "VFR",
      "crosscountry": true,
      "multiengine": false,
      "landings": "1",
      "fuel": "45.5",
      "oil": null,
      "pax": "1",
      "cargo": null,
      "route": "LEMD DCT LEBL",
      "remarks": "",
      "pf": "PIC",
      "pic_id": "123",
      "sic_id": null
    },
    "Base": { "id": "5", "name": "Madrid Base", "airport_id": "100" },
    "Aircraft": {
      "id": "45",
      "registration": "EC-ABC",
      "photo": "https://...",
      "adsb": "ABC123",
      "multipilot": false,
      "active": true,
      "AircraftModel": {
        "name": "C172",
        "icao": "C172",
        "AircraftManufacturer": { "name": "Cessna" }
      },
      "hours": "12500",
      "landings": "8900"
    },
    "FlightType": {
      "id": "1",
      "name": "Training",
      "color": "#3498db",
      "description": "Training flights"
    },
    "Pic": {
      "id": "123",
      "active": true,
      "pilot": true,
      "deleted": false,
      "user_group_id": "110",
      "UserGroup": { "role": "pilot", "name": "Pilot" },
      "UserDetail": { "name": "John", "surname": "Doe", "photo": null, "id": "123" }
    },
    "Sic": null,
    "DepartureAirport": {
      "id": "100",
      "name": "Adolfo Suárez Madrid–Barajas",
      "lat": "40.4719",
      "lon": "-3.5626"
    },
    "LandingAirport": {
      "id": "101",
      "name": "Josep Tarradellas Barcelona–El Prat",
      "lat": "41.2971",
      "lon": "2.0785"
    },
    "FlightChange": [
      {
        "id": "890",
        "flight_id": "5678",
        "user_id": "123",
        "action": "created",
        "fields": null,
        "comments": null,
        "created": "2025-03-10 09:30:00",
        "User": {
          "id": "123",
          "UserDetail": { "name": "John", "surname": "Doe", "id": "123" },
          "UserGroup": { "role": "pilot" }
        }
      }
    ],
    "Upload": [],
    "SafetyReport": []
  },
  "distance": 267,
  "canConfirm": true,
  "canEdit": true,
  "canCreate": true,
  "canDelete": true,
  "changeNames": {
    "created": { "icon": "fa-plus", "name": "Created", "class": "text-success" },
    "confirmed": { "icon": "fa-check", "name": "Confirmed", "class": "text-primary" },
    "edited": { "icon": "fa-pencil", "name": "Edited", "class": "text-warning" }
  }
}
```

#### Permission Flags

| Field | Type | Description |
|-------|------|-------------|
| canConfirm | boolean | User can confirm/approve this flight |
| canEdit | boolean | User can edit this flight |
| canCreate | boolean | User can create new flights |
| canDelete | boolean | User can delete this flight |

---

## Cancel Flight

<mark style="color:green;">`POST`</mark> `/flights/cancel.json`

Cancel (soft-delete) a flight record. The flight is marked as deleted and a `cancel` entry is added to its change history. There is **no date restriction** — a flight can be cancelled at any time, including flights dated in the past.

#### Request Body

| Field | Type | Required | Description |
|-------|------|----------|-------------|
| id | string | Yes | Flight ID to cancel |
| reason | string | Yes | Reason for cancellation |
| text | string | No | Free-text note stored with the cancellation |
| notify | string | No | `"true"` to notify the other crew (in-app message + WhatsApp where available) |

#### Authorization

The caller must satisfy **at least one** of the following, otherwise the request returns `400 Not authorized`:

* Has the **Flight.create**, **Flight.edit**, or **Flight.confirm** company permission, or
* Is a crew member of the flight — the **PIC** (`pic_id`), **SIC** (`sic_id`), or **Supervisor** (`supervisor_id`), or
* Is the user who created the flight (`user_id`).

Company Administrators, Operations Managers, and Compliance & Safety Managers hold these permissions by default. Note that the front-end only surfaces the Cancel action for **draft** flights; the endpoint itself does not restrict by draft/confirmed state.

---

## Export Flights (XLS)

The server-side `xls:1` export has been removed. The logbook Excel file is now generated client-side by the NEO web app: it pulls the flights from the **List Flights** endpoint above (using the `limit` parameter to fetch all matching rows) and builds the XLSX in the browser.

---

## Flight Types

<mark style="color:blue;">`GET`</mark> `/flight_types.json`

List all flight types configured for the company.

#### Response

```json
[
  { "id": "1", "name": "Training", "color": "#3498db" },
  { "id": "2", "name": "Charter", "color": "#e74c3c" },
  { "id": "3", "name": "Private", "color": "#2ecc71" }
]
```

---

## Bases

<mark style="color:blue;">`GET`</mark> `/bases/index.json`

List all operational bases.

#### Response

```json
[
  { "id": "5", "name": "Madrid Base", "airport_id": "100" },
  { "id": "6", "name": "Barcelona Base", "airport_id": "101" }
]
```
