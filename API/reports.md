# Reports

Statistics, flight aggregates, landings, and weather (METAR/TAF) endpoints exposed by `ReportsController`.

All responses are JSON. All endpoints require authentication unless noted.

---

## Pilot Airports

<mark style="color:blue;">`GET`</mark> `/reports/pilots_airports.json`

Retrieve unique route pairs (departure → landing) flown by the authenticated user, including airport coordinates and per-route flight counts. Designed for plotting a pilot's route map.

<mark style="color:blue;">`GET`</mark> `/reports/pilots_airports/{userId}.json`

Retrieve routes for a specific user. Falls back to the authenticated user when `userId` is omitted or when the caller's `user_group_id` is greater than 170.

#### Path Parameters

| Parameter | Type | Description |
|-----------|------|-------------|
| userId | string | User ID (optional) |

#### Response

```json
{
  "routes": [
    {
      "from": "LEMD",
      "to": "LEBL",
      "from_lat": 40.4936,
      "from_lon": -3.5668,
      "to_lat": 41.2971,
      "to_lon": 2.0785,
      "flights": 12
    }
  ]
}
```

| Field | Type | Description |
|-------|------|-------------|
| from | string | Departure ICAO code |
| to | string | Landing ICAO code |
| from_lat / from_lon | number | Departure airport coordinates (decimal degrees) |
| to_lat / to_lon | number | Landing airport coordinates (decimal degrees) |
| flights | number | Number of flights along this exact route |

Routes missing either airport's coordinates are dropped server-side. Results are ordered by `flights` descending. Only flights belonging to the authenticated user's company are counted.

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

<mark style="color:blue;">`GET`</mark> `/reports/taf/{airport}/{date}.json`

Retrieve the historical TAF closest to `date` (within ±6 hours). Only available for the last 30 days.

#### Path Parameters

| Parameter | Type | Description |
|-----------|------|-------------|
| airport | string | 4-letter ICAO code (validated against `^[A-Z]{2}[A-Z0-9]{2}$`) |
| date | number | Unix timestamp; ignored if greater than current time |

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

#### Behavior

- Results are cached server-side via the `Tafor` model. A cache hit short-circuits the upstream fetch.
- Both current and historical TAFs are fetched from `aviationweather.gov` (historical uses its `date` param, available up to 30 days back).
- Response cache header: 5 minutes (private).

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

## Flight Remark Findings

<mark style="color:blue;">`GET`</mark> `/reports/remark_digests.json`

Findings mined from free-text `flights.remarks`, one digest per company per day.

A background job reads each finished day's remarks and records anything that looks
like an unreported defect or a safety-relevant event. **It creates nothing** — no
aircraft report, no safety report, no maintenance job, no notification. This endpoint
is read-only over what that job stored.

{% hint style="warning" %}
**Managers only.** The caller's `user_group_id` must be **110 or below**; anyone else
gets `403`. These are crew-written remarks returned with an automated reading attached,
so they are not a pilot-facing resource. Digests are scoped to the caller's company.
{% endhint %}

#### Query Parameters

| Parameter | Type | Description |
|-----------|------|-------------|
| limit | number | Digests to return, newest first. Default 12, clamped to 1–60. |

#### Response

| Field | Type | Description |
|-------|------|-------------|
| digests | array | `FlightRemarkDigest` rows, newest period first |
| flights | object | Flights cited by any finding, keyed by flight id, so the list needs no follow-up requests |

Each `FlightRemarkDigest`:

| Field | Type | Description |
|-------|------|-------------|
| period_start / period_end | date | The day covered. Equal for daily digests; older rows may span a range |
| remarks_total | number | Every non-empty remark on confirmed flights that day |
| remarks_read | number | How many were actually read. Routine entries (`5T`, `NIL`, a repeated label) are filtered out before anything is read, so this is usually lower — it is what stops a digest implying coverage it did not have |
| findings_count | number | Findings in this digest |
| findings | array | See below |
| tallies | object | `by_aircraft` and `by_type` counts, computed from the records, not generated |
| model | string | The model that produced it, for traceability |
| error | string | Set when the day was only partly read (for example the provider was unreachable mid-run) |

Each finding:

| Field | Type | Description |
|-------|------|-------------|
| flight_id | string | Always a flight that was actually read — findings citing anything else are discarded before storage |
| type | string | `defect`, `safety` or `other` |
| quote | string | **Verbatim** substring of the remark. A quote that is not literally present in the remark is discarded rather than returned, so it can be trusted as the pilot's own words |
| note | string | One line on why it stood out |
| confidence | number | 0.0–1.0 |

```json
{
  "digests": [
    {
      "FlightRemarkDigest": {
        "id": "7",
        "period_start": "2026-08-23",
        "period_end": "2026-08-23",
        "remarks_total": 3,
        "remarks_read": 3,
        "findings_count": 2,
        "findings": [
          {
            "flight_id": "38b51b9a-dc40-4ea0-90af-bb8b9e7b502b",
            "type": "defect",
            "quote": "Nosewheel shimmy on the landing roll, got worse above 40 kt.",
            "note": "Pilot reported a nosewheel shimmy that worsened during the landing roll.",
            "confidence": 0.95
          }
        ],
        "tallies": { "by_aircraft": { "FL-BLY": 2 }, "by_type": { "defect": 1, "safety": 1 } },
        "model": "deepseek-v4-pro",
        "error": null
      }
    }
  ],
  "flights": {
    "38b51b9a-dc40-4ea0-90af-bb8b9e7b502b": { "id": "38b51b9a-...", "date": "2026-08-23", "aircraft": "FL-BLY" }
  }
}
```

#### Errors

| Code | Meaning |
|------|---------|
| 403 | `user_group_id` above 110 |

An installation with no AI provider configured simply has no digests; the endpoint
still answers `200` with an empty list.
