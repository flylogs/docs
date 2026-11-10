# Airports

Airport lookup and sun/night-time calculations. The `search` and `view` endpoints are publicly accessible (no authentication required).

---

## Search Airports

<mark style="color:blue;">`GET`</mark> `/airports/search.json?q={query}`

Search airports by ICAO code, name, or city. First attempts an ICAO prefix match; if no results, falls back to name/city prefix match. Returns up to 10 results.

#### Query Parameters

| Parameter | Type | Description |
|-----------|------|-------------|
| q | string | Search query (ICAO code, airport name, or city name) |

#### Response

```json
{
  "airports": [
    {
      "Airport": {
        "id": "LEBL",
        "name": "Barcelona El Prat",
        "lat": "41.2971",
        "lon": "2.0785"
      },
      "Country": { "id": "ES", "name": "Spain" },
      "Timezone": { "id": "1", "name": "Europe/Madrid" }
    }
  ]
}
```

---

## View Airport

<mark style="color:blue;">`GET`</mark> `/airports/view/{airport}.json`

<mark style="color:blue;">`GET`</mark> `/airports/view/{airport}/{date}.json`

Retrieve full airport details including country and timezone. Optionally pass a date (Unix timestamp or date string) to get sunrise/sunset data for that day.

#### Path Parameters

| Parameter | Type | Description |
|-----------|------|-------------|
| airport | string | ICAO airport code |
| date | string \| number | Optional. Date for sun data (Unix timestamp or date string). Defaults to now. |

#### Response

```json
{
  "airport": {
    "Airport": {
      "id": "LEBL",
      "name": "Barcelona El Prat",
      "lat": "41.2971",
      "lon": "2.0785",
      "city": "Barcelona",
      "elevation": "12",
      "SunInfo": {
        "sunrise": 1736490000,
        "sunset": 1736530000,
        "civil_twilight_begin": 1736488200,
        "civil_twilight_end": 1736531800
      }
    },
    "Country": { "id": "ES", "name": "Spain" },
    "Timezone": { "id": "1", "name": "Europe/Madrid" }
  }
}
```

---

## Calculate Night Time

<mark style="color:blue;">`GET`</mark> `/airports/night_time/{departure}/{arrival}/{dTime}/{aTime}.json`

Calculate the night flying time for a given flight leg based on official sunrise/sunset at departure and arrival airports.

Times can be Unix timestamps or date-time strings. The calculation accounts for all scenarios: day flights, night flights, flights crossing sunrise/sunset, and multi-day flights.

#### Path Parameters

| Parameter | Type | Description |
|-----------|------|-------------|
| departure | string | ICAO code of departure airport |
| arrival | string | ICAO code of arrival airport |
| dTime | string \| number | Departure time (Unix timestamp or date string) |
| aTime | string \| number | Arrival time (Unix timestamp or date string) |

#### Response

```json
{
  "data": {
    "seconds": 3600,
    "departure": {
      "sunrise": 1736490000,
      "sunset": 1736530000,
      "civil_twilight_begin": 1736488200,
      "civil_twilight_end": 1736531800
    },
    "arrival": {
      "sunrise": 1736490600,
      "sunset": 1736530600,
      "civil_twilight_begin": 1736488800,
      "civil_twilight_end": 1736532200
    }
  }
}
```

> `seconds` is the total night flying time in seconds. Returns `0` if the entire flight is in daylight.
