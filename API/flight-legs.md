# Flight legs

> Role names and `user_group_id` values are listed in [User groups](users.md#user-groups).

A **leg** is one sortie inside a flight record: a skydiving lift, a banner or glider tow, a survey run. A flight can hold up to **99** legs, in the order they were recorded. Legs are detail under the flight: they never change the flight's own block times, landings, fuel fields or remarks, and the [Create or Update Flight](flights.md#create-or-update-flight) endpoint never reads or writes them. The fuel **uplifted** after a leg (`fuel`) is added to the flight's refuelling (see [Fuel](#fuel)).

Legs are listed as `FlightLeg` (ordered by `sequence`) in the flight's view payload (see [View Flight](flights.md#view-flight)) and in every row of the flight lists `GET /flights/index/…json` and `GET /manager/flights/audit.json`. In the lists each leg carries only `id, flight_id, sequence, start_time, end_time, altitude, altitude_unit, persons, fuel, fuel_start, fuel_end, notes`, and `Aircraft` carries `fuel_tracking` and `fuel_type` for the fuel arithmetic; the uplift unit is the company's `CompanySetting.fuel_uplift_unit`.

## Access

Both endpoints check, in this order:

1. **Plan:** the company's plan must include flight legs. That is every paid plan (Club, Premium, Unlimited) and the 30-day trial. **Not the Free plan** (`code: "plan_blocked"`).
2. **Flight:** the flight must belong to the caller's company and must not be cancelled or deleted (`code: "not_found"`).
3. **Edit rights:** whoever may edit the flight may edit its legs (`code: "edit_not_allowed"` otherwise):
   * Company Administrator, Operations Manager or Compliance & Safety Manager (`user_group_id <= 110`): always.
   * **Unconfirmed flight** (draft, scheduled, dispatched): the **Flight.create** permission, and being the flight's PIC or creator or holding **Flight.edit**.
   * **Confirmed flight:** the **Flight.edit** permission, or the flight's PIC or creator within **12 hours** of off-blocks.

Refusals answer **HTTP 200** with `result: false`:

```json
{ "result": false, "code": "edit_not_allowed", "message": "You are not allowed to edit this flight" }
```

| `code` | Meaning |
|---|---|
| `plan_blocked` | The company is on the Free plan. |
| `not_found` | No such flight in your company, or it is cancelled / deleted. |
| `edit_not_allowed` | You may not edit this flight (rules above). |
| `invalid` | `id` is not a UUID, `flight_id` is missing, or the leg `id` already belongs to another flight. |
| `limit` | The flight already has 99 legs. |

Branch on `code`, never on `message`.

## Fields

| Field | Type | Description |
|---|---|---|
| id | string | **Client-generated UUID** (v4). The same `id` updates the same leg, so a retried request never creates a duplicate. |
| flight_id | string | The flight the leg belongs to. |
| sequence | number | Recorded order, assigned by the server (next number on create). **Read-only.** |
| start_time | number \| null | Unix seconds. |
| end_time | number \| null | Unix seconds. Airborne time is `end_time − start_time`; it is not stored. |
| altitude | number \| null | Feet, or the flight level number when `altitude_unit` is `FL` (`120` = FL120). 0–99999. |
| altitude_unit | string | `FT` or `FL`. Anything else is stored as `FT`. FL is kept as FL, never converted to feet. |
| persons | number \| null | People for this leg (e.g. jumpers dropped). 0–9999. |
| fuel | number \| null | Fuel **uplifted after** this leg, in the uplift unit (`CompanySetting.fuel_uplift_unit`, or the aircraft's `fuel_tracking` when that is null). Two decimals. Until November 2026 this field was documented as fuel used; its values are kept and read as uplifts. |
| fuel_start | number \| null | Fuel on board at the leg's start, in the aircraft's **gauge** unit (`Aircraft.fuel_tracking`). Two decimals. |
| fuel_end | number \| null | Fuel on board at the leg's end, gauge unit. Two decimals. |
| notes | string \| null | Up to 500 characters. |
| company_id, created_by, modified_by, created, modified | | Set by the server. **Read-only.** |

Every leg field except `id` and `flight_id` is optional: send what you have, the rest stays empty. Blank, negative, non-numeric or out-of-range numbers are stored as empty.

Fuel used is **not a field**: it is worked out from the fields above, see [Fuel](#fuel).

---

## Save a leg

<mark style="color:green;">`POST`</mark> `/flight_legs/save.json`

Creates the leg, or updates it when a leg with this `id` already exists on the same flight. Sends the **whole leg** each time: a field left out is stored as empty — except `fuel_start` and `fuel_end`, which keep their stored value when left out (clients built before they existed do not send them).

#### Request Body

| Name | Type | Description |
|---|---|---|
| data[FlightLeg][id] | string | UUID (required) |
| data[FlightLeg][flight_id] | string | Flight id (required) |
| data[FlightLeg][start_time] | number | Unix seconds |
| data[FlightLeg][end_time] | number | Unix seconds |
| data[FlightLeg][altitude] | number | |
| data[FlightLeg][altitude_unit] | string | `FT` or `FL` |
| data[FlightLeg][persons] | number | |
| data[FlightLeg][fuel] | number | Uplifted after the leg, uplift unit |
| data[FlightLeg][fuel_start] | number | On board at start, gauge unit. Left out = unchanged |
| data[FlightLeg][fuel_end] | number | On board at end, gauge unit. Left out = unchanged |
| data[FlightLeg][notes] | string | |

#### Response

```json
{
  "result": true,
  "leg": {
    "id": "5f0c2a3e-8b1d-4c6e-9a7f-1b2c3d4e5f60",
    "company_id": "…",
    "flight_id": "84f4d019-ed4b-498f-b109-f29969bbb6d6",
    "sequence": "3",
    "start_time": "1793099700",
    "end_time": "1793101260",
    "altitude": "120",
    "altitude_unit": "FL",
    "persons": "12",
    "fuel_start": "1500.00",
    "fuel_end": "1300.00",
    "fuel": "400.00",
    "notes": null,
    "created_by": "618",
    "modified_by": "618",
    "created": "1793545503",
    "modified": "1793545510"
  }
}
```

Saving a leg exactly as it is already stored changes nothing and returns the stored leg.

## Delete a leg

<mark style="color:green;">`POST`</mark> `/flight_legs/delete/{id}.json`

Deletes one leg. Deleting a leg that does not exist (already deleted, or never saved) also answers `{ "result": true }`, so a retry is always safe. The remaining legs keep their `sequence`; clients number them by position.

## Fuel

Two fuel units are in play: the aircraft's `fuel_tracking` is the **gauge** unit (fuel on board), and the company's `CompanySetting.fuel_uplift_unit` the unit fuel is **uplifted** in, for the whole fleet; `null` = each aircraft's gauge unit. See [Aircraft](aircraft.md#fuel-units) and [Company](company.md).

* **Flight fuel used** = `Flight.fuel_start` + uplifts between legs − `Flight.fuel_end`, in the uplift unit. "Between legs" is the `fuel` of every leg but the last (in `sequence` order); the uplift after the last leg is outside the start…end window. When `Flight.fuel_start` / `fuel_end` is null, the first leg's `fuel_start` / the last leg's `fuel_end` is used. `Flight.fuel` (uplift before or after the flight) is not part of it.
* **Leg fuel used** = `fuel_start − fuel_end` of that leg, converted to the uplift unit.
* Converting between a weight (`kgs`, `lbs`) and a volume (`l`, `usgal`, `impgal`) uses the density of `Aircraft.fuel_type` (AVGAS100LL 0.72, JETA1/JETA 0.804, MOGAS 0.745, SAF 0.80 kg/l). With no density (no type, or `OTHER`) the figure cannot be worked out: show that, never a guess.
* **Billing:** saving or deleting a leg whose `fuel` changes re-seeds the flight's refuelling (see [Refuelings](refuelings.md)): its quantity is `Flight.fuel` + the sum of the legs' `fuel`.

Fuel used is never stored; NEO works it out on the flight form and page, the flight PDF and the logbook export.

## Change history

On a **confirmed** flight, every leg added, updated or deleted is recorded in the flight's change history (`flight.FlightChange`, `action: "legs"`), with one line per change in `comments`, for example:

```
Leg 1 added
Leg 1 updated: end, persons
Leg 2 deleted
```

Changes by the same user within 30 minutes are grouped into one entry. Legs of unconfirmed flights are not logged.
