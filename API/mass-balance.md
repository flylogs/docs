# Mass & Balance

> Role names and `user_group_id` values are listed in [User groups](users.md#user-groups).

Aircraft Mass & Balance profiles and per-flight loadsheets. All endpoints are JSON and company-scoped: the aircraft or flight must belong to the authenticated user's `company_id`, otherwise `404`.

The server always recalculates a loadsheet itself; results sent by a client are never trusted.

## Units and conventions

* A profile uses one unit system: `mass_unit` (`kg` | `lb`) and `arm_unit` (`m` | `mm` | `cm` | `in`). Values are never converted.
* Fuel is given as a **volume** in the station's `fuel_unit` (`l` | `usgal` | `impgal`) and converted to mass with `fuel_density` (profile mass unit per volume unit).
* Envelope limits are `[mass, arm]` points. The limit is linear between points and constant below the first / above the last point.

## Access control

| Endpoint | Allowed |
|----------|---------|
| `aircraft` (GET) | Any company user. ACL grants for groups 180, 240, 250 |
| `aircraft_save`, `aircraft_delete` | Aircraft owner (`Aircraft.user_id`) or `user_group_id` in **1, 100, 105, 110, 150, 300** (Company Administrators, Operations Managers, Compliance & Safety Managers, Chief Pilots and Mechanics) → otherwise `403` |
| `loadsheet` (GET) | Same rule as `GET /flights/view`: `user_group_id` 171–249 (Captains, Pilots, Student Pilots and Cabin Crew) only when creator, PIC, SIC, supervisor or aircraft owner → otherwise `403` |
| `loadsheet_save`, `loadsheet_delete` | Creator, PIC, SIC, supervisor, aircraft owner, or `user_group_id` in **1, 100, 105, 110, 145, 150, 170** (Company Administrators, Operations Managers, Compliance & Safety Managers, Flight Dispatchers, Chief Pilots and Flight Instructors). Never on `CANCELED` / `DELETED` flights → `403` |
| `loadsheet_sign` | PIC or supervisor (creator when the flight has no PIC). Requires the user's password |

Groups 240 (Cabin Crew) and 250 (Auditor) have ACL access to the two read endpoints only.

## Get aircraft profile

<mark style="color:blue;">`GET`</mark> `/mass_balance/aircraft/{aircraftId}.json`

```json
{
  "result": true,
  "can_edit": true,
  "aircraft": { "id": "136", "registration": "FL-YME", "aircraft_model_id": "6367", "aircraft_model": "Seneca", "icao": "PA34", "weight_exp": null },
  "profile": {
    "id": "0f6c…",
    "aircraft_id": 136,
    "template_key": "PA34-220T-V",
    "mass_unit": "kg",
    "arm_unit": "m",
    "basic_empty_mass": 1590,
    "basic_empty_arm": 2.19,
    "weighed_on": "2026-03-02",
    "weighing_reference": "WR-2026-01",
    "max_ramp_mass": 2165,
    "max_takeoff_mass": 2155,
    "max_landing_mass": 2047,
    "max_zero_fuel_mass": 2031,
    "stations": [
      { "key": "front", "name": "Front seats", "type": "seat", "arm": 2.16, "max_mass": null, "fuel_unit": null, "fuel_density": null, "fuel_capacity": null },
      { "key": "fuel", "name": "Fuel", "type": "fuel", "arm": 2.39, "max_mass": null, "fuel_unit": "l", "fuel_density": 0.72, "fuel_capacity": 462 }
    ],
    "envelope": { "forward": [[1542, 2.083], [1928, 2.202], [2155, 2.301]], "aft": [[2155, 2.403]] },
    "landing_envelope": null,
    "notes": null,
    "edited_by": { "id": 3, "name": "Flylogs Support" },
    "modified": 1789588600
  }
}
```

`profile` is `null` when the aircraft has none.

## Save aircraft profile

<mark style="color:green;">`POST`</mark> `/mass_balance/aircraft_save/{aircraftId}.json`

Form-encoded. Creates or fully replaces the profile.

| Parameter | Type | Description |
|-----------|------|-------------|
| profile | string (JSON) | **Required.** `mass_unit`, `arm_unit`, `basic_empty_mass`, `basic_empty_arm`, `max_takeoff_mass`, optional `max_landing_mass`, `max_zero_fuel_mass`, `max_ramp_mass`, `stations[]`, `envelope`, optional `landing_envelope` |
| weighed_on | string | `YYYY-MM-DD` or empty |
| weighing_reference | string | Max 100 characters |
| notes | string | |
| template_key | string | Informational |

Station fields: `key` (`[A-Za-z0-9_-]`, unique), `name`, `type` (`seat` | `baggage` | `fuel` | `other`), `arm`, `max_mass`; fuel stations also `fuel_unit`, `fuel_density` (required, > 0), `fuel_capacity`. Maximum 40 stations and 20 points per envelope limit.

Validation failure returns `result: false` with field errors:

```json
{
  "result": false,
  "message": "Please correct the highlighted fields.",
  "errors": [
    { "field": "basic_empty_mass", "code": "REQUIRED_POSITIVE" },
    { "field": "stations.3.fuel_density", "code": "REQUIRED_POSITIVE" },
    { "field": "envelope", "code": "INVALID" }
  ]
}
```

Codes: `REQUIRED`, `REQUIRED_POSITIVE`, `POSITIVE`, `NOT_BELOW_MAX_TAKEOFF`, `TOO_MANY`, `DUPLICATE`, `INVALID` (for an envelope: a forward limit at or behind the aft limit at some point).

## Delete aircraft profile

<mark style="color:green;">`POST`</mark> `/mass_balance/aircraft_delete/{aircraftId}.json`

Loadsheets already saved keep their own profile copy.

## Get flight loadsheet

<mark style="color:blue;">`GET`</mark> `/mass_balance/loadsheet/{flightId}.json`

```json
{
  "result": true,
  "flight": { "id": "e733…", "date": "2026-08-27", "status": "LANDED", "callsign": "FL-BLY", "departure_airport": "CYYG", "landing_airport": "CYSU", "aircraft_id": "136", "registration": "FL-YME", "aircraft_model": "Seneca" },
  "crew": [{ "role": "PIC", "user_id": 490, "name": "Martha Smith" }],
  "passengers": [],
  "profile": { "…": "current aircraft profile, as above, or null" },
  "loadsheet": {
    "id": "7b1d…",
    "aircraft_id": 136,
    "profile": { "…": "copy of the profile used" },
    "inputs": { "loads": { "front": 160, "middle": 170 }, "fuel": { "fuel": { "takeoff": 200, "taxi": 5, "burn": 100 } }, "labels": {} },
    "results": {
      "zero_fuel": { "mass": 1920, "moment": 4341.1, "arm": 2.261 },
      "ramp":      { "mass": 2067.6, "moment": 4693.9, "arm": 2.2702 },
      "takeoff":   { "mass": 2064, "moment": 4685.3, "arm": 2.27 },
      "landing":   { "mass": 1992, "moment": 4513.2, "arm": 2.2657 },
      "issues": [],
      "within_limits": true
    },
    "within_limits": true,
    "calculated_by": { "id": 490, "name": "Martha Smith" },
    "signed": { "user": { "id": 490, "name": "Martha Smith" }, "at": 1789588652, "valid": true },
    "stale": false,
    "created": 1789588500,
    "modified": 1789588652
  },
  "can_edit": true,
  "can_sign": true,
  "can_edit_profile": false
}
```

* `stale`: the flight's aircraft or its profile changed after the loadsheet was calculated.
* `signed.valid`: the stored signature still matches the stored numbers.

### Issue codes

`STATION_OVER_MAX`, `FUEL_OVER_CAPACITY`, `BURN_EXCEEDS_FUEL`, `NEGATIVE_INPUT`, `UNKNOWN_STATION`, `ZERO_FUEL_OVER_MAX`, `RAMP_OVER_MAX`, `TAKEOFF_OVER_MAX`, `LANDING_OVER_MAX`, `CG_FORWARD`, `CG_AFT`, `PROFILE_INCOMPLETE`. Issues carry `station`, `condition` (`zero_fuel` | `takeoff` | `landing`), `value` and `limit` where relevant.

## Save flight loadsheet

<mark style="color:green;">`POST`</mark> `/mass_balance/loadsheet_save/{flightId}.json`

| Parameter | Type | Description |
|-----------|------|-------------|
| inputs | string (JSON) | `{ "loads": { stationKey: mass }, "fuel": { stationKey: { "takeoff": vol, "taxi": vol, "burn": vol } }, "labels": { stationKey: text } }` |

Calculated with the aircraft's **current** profile (`400` if the flight has no aircraft or the aircraft has no profile). Unknown station keys are dropped. Saving different numbers clears any signature; saving identical numbers keeps it. Returns `{ result, message, loadsheet }`.

## Sign flight loadsheet

<mark style="color:green;">`POST`</mark> `/mass_balance/loadsheet_sign/{flightId}.json`

| Parameter | Type | Description |
|-----------|------|-------------|
| pass | string | **Required.** The signing user's password |

Refused with `400` when there is no saved loadsheet, the aircraft or profile changed since it was saved, the loadsheet is outside limits, or the password is wrong. Returns `{ result, message, loadsheet }`.

## Delete flight loadsheet

<mark style="color:green;">`POST`</mark> `/mass_balance/loadsheet_delete/{flightId}.json`
