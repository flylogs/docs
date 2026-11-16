# Currency Items

Manager-defined **aerodrome and custom currency items**: for example "at least 1 IFR approach and 1 IFR departure at LSGS within 12 months". Flylogs evaluates them from each pilot's confirmed flights. See [Pilots settings](../../company-management/company-settings/pilots.md#aerodrome-and-custom-currency) for the concepts.

> Role names and `user_group_id` values are listed in [User groups](users.md#user-groups).

{% hint style="info" %}
**Plan:** the management endpoints need a plan with the `currency_items` feature (Premium and Unlimited, trial included); otherwise they return `400`. They are open to user groups **110 and below** (Company Managers); a higher group gets `403`.
{% endhint %}

***

## List Items

<mark style="color:blue;">`GET`</mark> `/currency_items.json`

The company's items, ordered by `sort`, then `name`.

#### Response

```json
{
  "items": [
    {
      "id": "e4c4c6ab-287b-42a7-9c4c-cb7be6b8bd88",
      "name": "LSGS airport qualification approach",
      "group_label": "Sion (LSGS)",
      "event": "APPROACH",
      "airport": "LSGS",
      "rules": "IFR",
      "role": "ANY",
      "period_days": 365,
      "min_count": 1,
      "round_month_end": 1,
      "lapse_days": null,
      "warn_days": 30,
      "active": 1,
      "sort": 0
    }
  ]
}
```

***

## Save an Item

<mark style="color:green;">`POST`</mark> `/currency_items/save.json`

Creates an item, or replaces it when `id` is sent. The body is JSON (or a `data[CompanyCurrencyItem]` form). `company_id` is never read from the request. An `id` that is not your company's returns `404`.

| Field | Type | Required | Notes |
| --- | --- | --- | --- |
| `id` | uuid | no | Send to update; omit to create |
| `name` | string | yes | 1 to 100 characters |
| `group_label` | string | no | Up to 100 characters. Items sharing a label form one qualification: every item must be met and the worst status wins |
| `event` | string | yes | `APPROACH`, `DEPARTURE`, `LANDING` or `SECTOR` |
| `airport` | string | no | ICAO, up to 15 characters, uppercased. Empty or null = any aerodrome |
| `rules` | string | no | `ANY` (default), `IFR` or `VFR` |
| `role` | string | no | `ANY` (default: PIC, SIC or supervisor), `PIC` or `SIC` |
| `period_days` | integer | yes | 1 to 999 |
| `min_count` | integer | no | 1 to 99, default 1 |
| `round_month_end` | boolean | no | Default `0`. Validity ends the last second of the month, in the company timezone |
| `lapse_days` | integer | no | 1 to 1999 and greater than `period_days`. Adds the Restricted and Lost statuses |
| `warn_days` | integer | no | 0 to 365, default 30 |
| `active` | boolean | no | Default `1` |
| `sort` | integer | no | 0 to 65535, default 0 |

How events are counted:

| `event` | Counts |
| --- | --- |
| `DEPARTURE` | Sectors that departed from `airport` |
| `APPROACH` | Sectors that landed at `airport` (missed approaches and approach type are not recorded) |
| `LANDING` | The `landings` logged on sectors that landed at `airport` |
| `SECTOR` | Sectors that departed from or landed at `airport` |

Only confirmed flights count, the pilot's seat (PIC, SIC or supervisor) must match `role`, and the last 2,000 days are searched. A company can hold at most **50** items.

#### Response

```json
{ "result": true, "item": { "id": "...", "name": "...", "event": "APPROACH" } }
```

`item` has the same fields as in the list.

#### Validation errors

A rejected save returns `result: false` and an `errors` object keyed by field:

```json
{ "result": false, "errors": { "period_days": "range", "lapse_days": "lapse_le_period" } }
```

| Code | Meaning |
| --- | --- |
| `required` | Missing mandatory field (`name`, `event`, `period_days`) |
| `range` | Number out of range, or text too long |
| `invalid` | Not an accepted value (for example an unknown `event`, or a non-integer) |
| `lapse_le_period` | `lapse_days` is not greater than `period_days` |
| `max_items` | The company already has 50 items (key `_`) |

***

## Delete an Item

<mark style="color:green;">`POST`</mark> `/currency_items/delete/{id}.json`

Deletes one of the company's items and its expiry alerts. Returns `{"result": true}`, or `404` when the item is not your company's.

***

## Pilot Status

<mark style="color:blue;">`GET`</mark> `/pilots/currency_items/{userId}.json`

The evaluated items and qualification groups of one pilot. User groups 170 and below may ask for any user of their company (`404` otherwise). **User groups above 170 always receive their own data**, whatever `userId` is sent. On a plan without the feature the arrays are empty, not an error.

#### Response

```json
{
  "user_id": 306,
  "items": [
    {
      "id": "e4c4c6ab-287b-42a7-9c4c-cb7be6b8bd88",
      "name": "LSGS airport qualification approach",
      "group_label": "Sion (LSGS)",
      "event": "APPROACH",
      "airport": "LSGS",
      "period_days": 365,
      "min_count": 1,
      "status": "EXPIRING",
      "valid_until": 1796083199,
      "last_event": 1763636123,
      "count_in_period": 1,
      "required": 1
    }
  ],
  "groups": [
    { "label": "Sion (LSGS)", "status": "EXPIRING", "valid_until": 1796083199, "item_ids": ["e4c4c6ab-287b-42a7-9c4c-cb7be6b8bd88"] }
  ]
}
```

`valid_until` and `last_event` are Unix timestamps (`null` when not qualified or no event). `status` is one of:

| Status | Meaning |
| --- | --- |
| `VALID` | Requirement met |
| `EXPIRING` | Within `warn_days` of `valid_until` |
| `RESTRICTED` | Past `valid_until`, within `lapse_days` of the last qualifying event |
| `EXPIRED` | Past `valid_until`, no `lapse_days` configured |
| `LOST` | Past the `lapse_days` limit |
| `NOT_QUALIFIED` | Fewer than `min_count` events on record |

In `groups`, the worst member status wins and `valid_until` is the earliest member value (`null` if any member is `NOT_QUALIFIED`).

***

## Blocking

When the company setting **Block pilots that do not meet established currency** is on, `Expired`, `Lost` and `Not qualified` items for the aerodromes of a booking or flight (together with the three company currency levels) make the PIC fail currency. `POST /schedules/edit.json` and the flight confirmation then refuse the request, with a message naming the pilot and each failed requirement. A supervisor on the booking or flight (different from the PIC) exempts it. Staff in user group 149 and below can still confirm a flight that took place. Confirmations made offline are judged the same way when they sync; a refused one stays unconfirmed. `Expiring` and `Restricted` never block.
