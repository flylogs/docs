# Reports

## Flight Hours by Month

<mark style="color:blue;">`GET`</mark> `/reports/flight_hours_by_month/{months}.json`

Retrieve monthly flight hour totals for the authenticated user.

<mark style="color:blue;">`GET`</mark> `/reports/flight_hours_by_month/{months}/{userId}.json`

Retrieve monthly flight hour totals for a specific user.

#### Path Parameters

| Parameter | Type | Description |
|-----------|------|-------------|
| months | number | Number of months to retrieve |
| userId | string | User ID (optional — omit for authenticated user) |

#### Response

```json
[
  {
    "timestamp": "2025 Mar",
    "seconds": "18000",
    "flights": "5",
    "landings": 12
  },
  {
    "timestamp": "2025 Feb",
    "seconds": "25200",
    "flights": "7",
    "landings": 18
  }
]
```

| Field | Type | Description |
|-------|------|-------------|
| timestamp | string | Month label (e.g. `"2025 Mar"`) |
| seconds | string \| number | Total flight time in seconds |
| flights | string \| number | Number of flights |
| landings | number | Number of landings |

---

## Flight Hours by Month (Aircraft)

<mark style="color:blue;">`GET`</mark> `/reports/flight_hours_by_month/{months}/null/{aircraftId}.json`

Retrieve monthly flight hour totals for a specific aircraft.

#### Path Parameters

| Parameter | Type | Description |
|-----------|------|-------------|
| months | number | Number of months to retrieve |
| aircraftId | string | Aircraft ID |

#### Response

Same structure as user flight hours above.

---

## Flight Type Statistics

<mark style="color:blue;">`GET`</mark> `/reports/stats_flight_types.json`

Retrieve flight hour breakdown by flight type for the authenticated user.

<mark style="color:blue;">`GET`</mark> `/reports/stats_flight_types/{userId}.json`

Retrieve flight type statistics for a specific user.

#### Path Parameters

| Parameter | Type | Description |
|-----------|------|-------------|
| userId | string | User ID |

#### Response

```json
{
  "types": [
    {
      "id": "1",
      "name": "Training",
      "color": "#3498db",
      "total": "45000"
    },
    {
      "id": "2",
      "name": "Charter",
      "color": "#e74c3c",
      "total": "120000"
    }
  ],
  "total": "165000"
}
```

| Field | Type | Description |
|-------|------|-------------|
| types | array | Breakdown per flight type |
| total | string | Total flight time in seconds |

Each type entry:

| Field | Type | Description |
|-------|------|-------------|
| id | string | Flight type ID |
| name | string | Flight type name |
| color | string | Display color (hex) |
| total | string | Total time in seconds for this type |

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
