# Reports

Statistics, flight aggregates, landings, and weather (METAR/TAF) endpoints exposed by `ReportsController`.

All responses are JSON. All endpoints require authentication unless noted.

---

## Pilot Airports

<mark style="color:blue;">`GET`</mark> `/reports/pilots_airports.json`

Retrieve unique route pairs (departure → landing) flown by the authenticated user.

<mark style="color:blue;">`GET`</mark> `/reports/pilots_airports/{userId}.json`

Retrieve unique route pairs for a specific user. Falls back to the authenticated user when `userId` is omitted or when the caller's `user_group_id` is greater than 170.

#### Path Parameters

| Parameter | Type | Description |
|-----------|------|-------------|
| userId | string | User ID (optional) |

#### Response

```json
{
  "airports": [
    {
      "Flight": {
        "departure_airport": "LEMD",
        "landing_airport": "LEBL"
      },
      "DepartureAirport": {
        "lat": "40.4936",
        "lon": "-3.5668"
      },
      "LandingAirport": {
        "lat": "41.2971",
        "lon": "2.0785"
      }
    }
  ]
}
```

| Field | Type | Description |
|-------|------|-------------|
| Flight.departure_airport | string | Departure ICAO code |
| Flight.landing_airport | string | Landing ICAO code |
| DepartureAirport.lat / lon | string | Departure airport coordinates |
| LandingAirport.lat / lon | string | Landing airport coordinates |

#### Errors

- `404 Not Found` — user does not exist in the caller's company.

---

## Flight Rules Statistics

<mark style="color:blue;">`GET`</mark> `/reports/stats_rules.json`

<mark style="color:blue;">`GET`</mark> `/reports/stats_rules/{userId}.json`

Aggregate flight time and flight count grouped by flight rule (`VFR`, `IFR`, ...).

#### Path Parameters

| Parameter | Type | Description |
|-----------|------|-------------|
| userId | string | User ID (optional) |

---

## Total Flights

<mark style="color:blue;">`GET`</mark> `/reports/total_flights/{userId}.json`

Return total block time and flight count for a user.

#### Path Parameters

| Parameter | Type | Description |
|-----------|------|-------------|
| userId | string | User ID (required) |

---

## Flight Type Statistics

<mark style="color:blue;">`GET`</mark> `/reports/stats_flight_types.json`

Retrieve flight hour breakdown by flight type for the authenticated user's company.

<mark style="color:blue;">`GET`</mark> `/reports/stats_flight_types/{userId}.json`

Retrieve flight type statistics scoped to a specific user (matches PIC or SIC).

#### Path Parameters

| Parameter | Type | Description |
|-----------|------|-------------|
| userId | string | User ID (optional) |

#### Response

```json
{
  "types": [
    {
      "id": "1",
      "name": "Training",
      "color": "#3498db",
      "total": 45000
    },
    {
      "id": "2",
      "name": "Charter",
      "color": "#e74c3c",
      "total": 120000
    }
  ],
  "total": 165000
}
```

| Field | Type | Description |
|-------|------|-------------|
| types | array | Breakdown per flight type |
| total | number | Total flight time in seconds across all types |

Each type entry:

| Field | Type | Description |
|-------|------|-------------|
| id | string | Flight type ID |
| name | string | Flight type name |
| color | string | Display color (hex) |
| total | number | Total time in seconds for this type |

Cached for 1 hour (private cache).

---

## Flight Hours by Month

<mark style="color:blue;">`GET`</mark> `/reports/flight_hours_by_month/{months}.json`

Monthly flight time / flight count / landings totals for the authenticated user's company.

<mark style="color:blue;">`GET`</mark> `/reports/flight_hours_by_month/{months}/{userId}.json`

Scoped to a single user (matches PIC or SIC).

<mark style="color:blue;">`GET`</mark> `/reports/flight_hours_by_month/{months}/{userId}/{aircraftId}.json`

Scoped to a user **and** aircraft. Pass `null` for `userId` to scope by aircraft only.

#### Path Parameters

| Parameter | Type | Description |
|-----------|------|-------------|
| months | number | Number of months back from current month (clamped to ≥ 0) |
| userId | string \| `null` | User ID (optional) |
| aircraftId | string | Aircraft ID (optional) |

#### Response

```json
[
  {
    "timestamp": "2026 Apr",
    "seconds": 18000,
    "flights": 5,
    "landings": 12
  },
  {
    "timestamp": "2026 Mar",
    "seconds": 25200,
    "flights": 7,
    "landings": 18
  }
]
```

| Field | Type | Description |
|-------|------|-------------|
| timestamp | string | Month label (e.g. `"2026 Apr"`) |
| seconds | number | Total block time in seconds |
| flights | number | Number of flights |
| landings | number | Total landings in the month |

Buckets are returned newest-first and include zero-fill for months without flights. Cached for 12 hours (private cache).

---

## Total Hours

<mark style="color:blue;">`GET`</mark> `/reports/total_hours.json`

<mark style="color:blue;">`GET`</mark> `/reports/total_hours/{userId}.json`

Return total block time for the authenticated user's company, optionally scoped to a single user. When `userId` is omitted, defaults to the authenticated user's ID.

#### Path Parameters

| Parameter | Type | Description |
|-----------|------|-------------|
| userId | string | User ID (optional) |

---

## Total Landings

<mark style="color:blue;">`GET`</mark> `/reports/total_landings.json`

<mark style="color:blue;">`GET`</mark> `/reports/total_landings/{userId}/{aircraftId}/{since}/{to}.json`

Total landings for the authenticated user's company, optionally filtered by user, aircraft, and time window.

#### Path Parameters

| Parameter | Type | Description |
|-----------|------|-------------|
| userId | string | User ID (optional) |
| aircraftId | string | Aircraft ID (optional) |
| since | number | Unix timestamp — filter `offblocks_time > since` (default `0`) |
| to | number | Unix timestamp — filter `onblocks_time < to` (optional) |

#### Response

```json
{
  "landings": 248
}
```

| Field | Type | Description |
|-------|------|-------------|
| landings | number | Total landings matching the filters |

Cached for 1 hour (private cache).

---

## METAR

<mark style="color:blue;">`GET`</mark> `/reports/metar/{airport}.json`

Retrieve the current METAR for an airport.

<mark style="color:blue;">`GET`</mark> `/reports/metar/{airport}/{date}.json`

Retrieve the historical METAR closest to `date` (within ±45 minutes).

#### Path Parameters

| Parameter | Type | Description |
|-----------|------|-------------|
| airport | string | 4-letter ICAO code (validated against `^[A-Z]{2}[A-Z0-9]{2}$`) |
| date | number | Unix timestamp; ignored if greater than current time |

#### Response

```json
{
  "metar": [
    "LEMD 271830Z 22008KT 9999 FEW040 18/05 Q1018 NOSIG"
  ]
}
```

If no METAR is available, the array contains a single `"NIL"` entry:

```json
{ "metar": ["NIL"] }
```

#### Errors

- `404 Not Found` — `airport` empty or fails ICAO format check.

#### Behavior

- Results are cached server-side via the `Metar` model. A cache hit short-circuits the upstream fetch.
- Current METAR is fetched from `aviationweather.gov`.
- Historical METAR is fetched from Iowa Environmental Mesonet (IEM) ASOS service, picking the observation with smallest delta to `date`.
- Response cache header: 5 minutes (private).

---

## TAF

<mark style="color:blue;">`GET`</mark> `/reports/taf/{airport}.json`

Retrieve the current TAF for an airport.

#### Path Parameters

| Parameter | Type | Description |
|-----------|------|-------------|
| airport | string | 4-letter ICAO code (validated against `^[A-Z]{2}[A-Z0-9]{2}$`) |

#### Response

```json
{
  "taf": "TAF LEMD 271700Z 2718/2824 23010KT 9999 SCT040 ..."
}
```

If no TAF is available:

```json
{ "taf": "" }
```

#### Errors

- `404 Not Found` — `airport` empty or fails ICAO format check.

Fetched from `aviationweather.gov`. Response cache header: 5 minutes (private).

---

## FMC Version

<mark style="color:blue;">`GET`</mark> `/home/version.json`

Retrieve the API server version. **No authentication required.**

#### Response

```json
{
  "vnum": "4.2.1",
  "build": "20250310",
  "server": "fmc-eu-1",
  "db": "ok"
}
```
