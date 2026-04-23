# Aircraft

## List Aircraft

<mark style="color:blue;">`GET`</mark> `/aircraft/index.json?limit=5000`

Retrieve the full fleet list. Used for dropdowns and aircraft selection.

#### Response

```json
[
  {
    "id": "45",
    "registration": "EC-ABC",
    "model": "C172",
    "multipilot": false,
    "active": true,
    "order": "1"
  }
]
```

---

## My Aircraft

<mark style="color:blue;">`GET`</mark> `/aircraft/my_aircraft.json`

Retrieve aircraft attributed to the authenticated user.

#### Response

```json
{
  "aircraft": [
    {
      "id": "45",
      "active": true,
      "title": "EC-ABC",
      "photo": "https://...",
      "manufacturer": "Cessna",
      "model": "C172"
    }
  ]
}
```

---

## View Aircraft

<mark style="color:blue;">`GET`</mark> `/aircraft/view/{id}.json`

Retrieve full details for a single aircraft, including maintenance, rates, and logbook reference.

#### Path Parameters

| Parameter | Type | Description |
|-----------|------|-------------|
| id | string | Aircraft ID |

#### Response

```json
{
  "Aircraft": {
    "id": "45",
    "active": true,
    "company_id": "42",
    "base_id": "5",
    "billing": true,
    "auto_bill": false,
    "serial": "172-12345",
    "registration": "EC-ABC",
    "photo": "https://...",
    "multiengine": false,
    "multipilot": false,
    "simulator": false,
    "hobbs": true,
    "tach": false,
    "adsb": "ABC123",
    "self_schedule": true,
    "maintenance": "enabled",
    "fuel_tracking": true,
    "oil_tracking": false,
    "hours": "12500",
    "landings": "8900",
    "flight_count": "4500",
    "airworthiness_exp": "2026-06-15",
    "insurance_exp": "2025-12-31",
    "radio_exp": "2026-03-01",
    "weight_exp": null,
    "avionics_exp": null,
    "registration_exp": "2026-09-30",
    "created": "2020-01-15 10:00:00",
    "modified": "2025-03-01 14:00:00"
  },
  "AircraftModel": {
    "id": "10",
    "name": "C172",
    "icao": "C172",
    "aircraft_manufacturer_id": "1",
    "AircraftManufacturer": { "name": "Cessna" }
  },
  "AircraftLogReference": {
    "total_time": "12000",
    "landings": "8500",
    "created": "2020-01-15"
  },
  "Base": { "name": "Madrid Base", "id": "5", "airport_id": "100" },
  "User": {
    "id": "123",
    "UserDetail": { "name": "John", "surname": "Doe", "id": "123" }
  },
  "DefaultRate": {
    "name": "Standard Rate",
    "hourly_price": "150.00",
    "id": "10"
  },
  "Rate": [
    {
      "id": "10",
      "company_id": "42",
      "deleted": false,
      "name": "Standard Rate",
      "description": "Per flight hour",
      "hourly_price": "150.00",
      "pack": false,
      "hours": null,
      "AircraftRate": { "id": "1", "rate_id": "10", "aircraft_id": "45", "created": "2020-01-15" }
    }
  ],
  "Maintenance": {
    "past": [],
    "future": [
      {
        "Job": {
          "id": "200",
          "name": "100h Inspection",
          "type": "hours",
          "completed": false,
          "hours_now": "12500",
          "hours_added": "100",
          "expiration": null
        }
      }
    ],
    "next": null
  }
}
```

#### Expiration Date Fields

All `*_exp` fields use `YYYY-MM-DD` format. `null` means no expiration set.

| Field | Description |
|-------|-------------|
| airworthiness_exp | Airworthiness certificate expiration |
| insurance_exp | Insurance expiration |
| radio_exp | Radio station license expiration |
| weight_exp | Weight & balance check expiration |
| avionics_exp | Avionics check expiration |
| registration_exp | Aircraft registration expiration |

---

## Aircraft Logbook

<mark style="color:blue;">`GET`</mark> `/aircraft/logbook/{aircraftId}/limit:{limit}/page:{page}.json`

Retrieve the aircraft technical logbook with pagination.

#### Path Parameters

| Parameter | Type | Description |
|-----------|------|-------------|
| aircraftId | string | Aircraft ID |
| limit | number | Records per page (default: 10) |
| page | number | Page number |

#### Response

```json
{
  "logbook": [
    {
      "AircraftLog": {
        "id": "1000",
        "user_id": "123",
        "aircraft_id": "45",
        "time": "3600",
        "total_time": "12500",
        "landings": "1",
        "total_landings": "8900",
        "type": "flight",
        "foreign_key": "5678",
        "created": "2025-03-10 09:30:00",
        "modified": "2025-03-10 09:30:00"
      },
      "Flight": {
        "id": "5678",
        "date": "2025-03-10",
        "callsign": "EC-ABC",
        "departure_airport": "LEMD",
        "landing_airport": "LEBL",
        "offblocks_time": "08:00:00",
        "onblocks_time": "09:25:00",
        "rules": "VFR",
        "landings": "1",
        "Pic": {
          "id": "123",
          "UserDetail": { "name": "John", "surname": "Doe" }
        }
      }
    }
  ],
  "paging": {
    "page": 1,
    "current": 1,
    "count": 4500,
    "prevPage": false,
    "nextPage": true,
    "pageCount": 450,
    "limit": 10
  }
}
```

---

## Export Logbook (XLS)

<mark style="color:blue;">`GET`</mark> `/aircraft/logbook/{aircraftId}/limit:10000/logbook.xls`

Download the aircraft logbook as an Excel file. Token passed as query parameter: `?token=<token>`

---

## Fuel & Oil Consumptions

<mark style="color:blue;">`GET`</mark> `/aircraft/consumptions/{id}.json`

Retrieve monthly average fuel and oil consumption rates.

#### Path Parameters

| Parameter | Type | Description |
|-----------|------|-------------|
| id | string | Aircraft ID |

#### Response

```json
[
  {
    "month_unix": 1709251200,
    "month": "2025-03",
    "avg_fuel_per_block_hour": 32.5,
    "avg_oil_per_block_hour": 0.2
  }
]
```

---

## Fleet ADSB Positions

<mark style="color:blue;">`GET`</mark> `/aircraft/adsb.json`

Retrieve real-time ADSB positions for all aircraft in the fleet with ADSB transponders configured.

#### Response

```json
[
  {
    "Aircraft": {
      "id": "45",
      "adsb": "ABC123",
      "registration": "EC-ABC",
      "hours": "12500",
      "landings": "8900"
    },
    "AircraftModel": {
      "name": "C172",
      "icao": "C172",
      "manufacturer": "Cessna"
    },
    "AircraftPosition": [
      {
        "id": "9999",
        "aircraft_id": "45",
        "lat": "40.4719",
        "lon": "-3.5626",
        "speed": "120",
        "alt": "5500",
        "ground": false,
        "track": "090",
        "created": "2025-03-10 12:00:00"
      }
    ],
    "lastKnownPosition": [
      {
        "AircraftPosition": {
          "id": "9999",
          "lat": "40.4719",
          "lon": "-3.5626",
          "speed": "120",
          "alt": "5500",
          "ground": false,
          "track": "090",
          "created": "2025-03-10 12:00:00"
        }
      }
    ]
  }
]
```

---

## Aircraft ADSB History

<mark style="color:blue;">`GET`</mark> `/aircraft/adsb/{aircraftId}/{start}/{end}.json`

Retrieve ADSB position history for a specific aircraft within a date range.

#### Path Parameters

| Parameter | Type | Description |
|-----------|------|-------------|
| aircraftId | string | Aircraft ID |
| start | string | Start date (YYYY-MM-DD) |
| end | string | End date (YYYY-MM-DD) |

---

## Manufacturers

<mark style="color:blue;">`GET`</mark> `/aircraft/manufacturers.json`

List all aircraft manufacturers.

---

## Models by Manufacturer

<mark style="color:blue;">`GET`</mark> `/aircraft/model/{manufacturerId}.json?q={search}`

Search aircraft models by manufacturer.

#### Query Parameters

| Parameter | Type | Description |
|-----------|------|-------------|
| q | string | Search query for model name |

---

## Create Aircraft

<mark style="color:green;">`POST`</mark> `/aircraft/add.json`

Add a new aircraft to the fleet. Admin access required.

---

## Edit Aircraft

<mark style="color:green;">`POST`</mark> `/aircraft/edit.json`

Update aircraft details. Admin access required.

---

## Delete Aircraft

<mark style="color:blue;">`GET`</mark> `/aircraft/delete/{id}.json`

Remove an aircraft from the fleet. Admin access required.

#### Path Parameters

| Parameter | Type | Description |
|-----------|------|-------------|
| id | string | Aircraft ID |
