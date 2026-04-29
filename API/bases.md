# Bases

Manage operational bases — physical locations where aircraft, crew, and maintenance are organized.

## List Bases

<mark style="color:blue;">`GET`</mark> `/bases/index.json`

List all bases for the company, ordered by name.

#### Response

```json
{
  "bases": [
    {
      "Base": {
        "id": "5",
        "name": "Madrid Base",
        "default": true,
        "airport_id": "100",
        "company_id": "c1d2e3f4-a5b6-7890-abcd-ef1234567890"
      }
    },
    {
      "Base": {
        "id": "6",
        "name": "Barcelona Base",
        "default": false,
        "airport_id": "101",
        "company_id": "c1d2e3f4-a5b6-7890-abcd-ef1234567890"
      }
    }
  ]
}
```

---

## View Base

<mark style="color:blue;">`GET`</mark> `/bases/view/{id}.json`

Retrieve full details for a single base, including assigned aircraft, pilots, mechanics, and airport info.

If `{id}` is omitted (`/bases/view.json`), returns the company's default base.

#### Path Parameters

| Parameter | Type | Description |
|-----------|------|-------------|
| id | number | Base ID (omit for default base) |

#### Response

```json
{
  "base": {
    "Base": {
      "id": "5",
      "name": "Madrid Base",
      "default": true,
      "airport_id": "100"
    },
    "Airport": {
      "id": "100",
      "name": "Adolfo Suárez Madrid–Barajas",
      "AirportRunway": [
        { "id": "1", "name": "18L/36R", "length": "4400", "surface": "ASP" }
      ],
      "AirportFrequency": [
        { "id": "1", "type": "TWR", "description": "Tower", "frequency": "118.100" }
      ]
    },
    "Aircraft": [
      {
        "id": "45",
        "registration": "EC-ABC",
        "AircraftModel": {
          "name": "C172",
          "AircraftManufacturer": { "name": "Cessna" }
        }
      }
    ],
    "Pilot": [
      {
        "id": "123",
        "user_group_id": "110",
        "UserGroup": { "name": "Pilot" },
        "UserDetail": { "name": "John", "surname": "Doe", "photo": null }
      }
    ],
    "Mechanic": [
      {
        "id": "456",
        "user_group_id": "300",
        "UserDetail": { "name": "Jane", "surname": "Smith", "photo": null }
      }
    ],
    "User": [
      {
        "id": "789",
        "UserGroup": { "name": "Manager", "role": "manager" },
        "UserDetail": { "name": "Bob", "surname": "Johnson", "photo": null }
      }
    ]
  }
}
```

---

## Create Base

<mark style="color:green;">`POST`</mark> `/bases/add.json`

Create a new base. Requires **premium** or **unlimited** subscription plan.

#### Request Body

| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| name | string | yes | Base name (converted to Title Case server-side) |
| airport_id | number | no | Associated airport ID |
| default | boolean | no | Set as company default base (unsets previous default) |

#### Response

```json
{
  "result": true,
  "message": "",
  "errors": []
}
```

On failure, `result` is `false` and `errors` contains field validation errors.

---

## Edit Base

<mark style="color:green;">`POST`</mark> `/bases/edit/{id}.json`

Update an existing base.

#### Path Parameters

| Parameter | Type | Description |
|-----------|------|-------------|
| id | number | Base ID |

#### Request Body

Same fields as **Create Base**. Only include fields to update.

#### Response

```json
{
  "result": true,
  "message": "",
  "errors": []
}
```

---

## Delete Base

<mark style="color:green;">`POST`</mark> `/bases/delete/{id}.json`

Delete a base.

{% hint style="warning" %}
A base cannot be deleted if it has associated flight records. Returns 400 with message `"Cannot delete this base because it has associated flights"`.
{% endhint %}

#### Path Parameters

| Parameter | Type | Description |
|-----------|------|-------------|
| id | number | Base ID |

#### Response

```json
{
  "result": true,
  "message": ""
}
```

---

## Crew

<mark style="color:blue;">`GET`</mark> `/bases/crew/{id}.json`

Get the list of active pilots assigned to a base, formatted for calendar display.

#### Path Parameters

| Parameter | Type | Description |
|-----------|------|-------------|
| id | number | Base ID |

#### Response

```json
{
  "crew": [
    {
      "id": "123",
      "title": "John Doe",
      "eventColor": "#3788d8"
    }
  ]
}
```

| Field | Description |
|-------|-------------|
| id | Pilot user ID |
| title | Full name (name + surname) |
| eventColor | Hex color for calendar events; defaults to `#3788d8` if unset |

---

## Base Schedules

<mark style="color:blue;">`GET`</mark> `/bases/schedule/{id}.json`

Get all schedules (duty assignments) for a base with pilot details.

#### Path Parameters

| Parameter | Type | Description |
|-----------|------|-------------|
| id | number | Base ID |

#### Response

```json
{
  "schedules": [
    {
      "BaseSchedule": {
        "id": "a1b2c3d4-e5f6-7890-abcd-ef1234567890",
        "base_id": "5",
        "pilot_id": "123",
        "type": "DUTY",
        "start": "1714003200",
        "end": "1714089600"
      },
      "Pilot": {
        "UserDetail": { "name": "John", "surname": "Doe" }
      }
    }
  ]
}
```

---

## Add Schedule

<mark style="color:green;">`POST`</mark> `/bases/add_schedule.json`

Assign a pilot to a base for a time period. Backdated entries (both start and end in the past) are rejected.

#### Request Body

| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| base | number | yes | Base ID |
| pilot | number | yes | Pilot user ID |
| start | number | yes | Start unix timestamp |
| end | number | yes | End unix timestamp |
| type | string | no | Schedule type (`DUTY` default, `AVAILABLE`, `UNAVAILABLE`, `MAYBE`, `ALWAYS`) |

#### Response

Returns the saved `BaseSchedule` record.

---

## Edit Schedule

<mark style="color:green;">`POST`</mark> `/bases/edit_schedule.json`

Update an existing schedule entry. Cannot edit past records.

#### Request Body

| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| id | string | yes | BaseSchedule UUID |
| start | number | yes | New start unix timestamp |
| end | number | yes | New end unix timestamp |
| type | string | no | `AVAILABLE`, `UNAVAILABLE`, `MAYBE`, `ALWAYS` |

#### Response

```json
{ "result": { "BaseSchedule": { "id": "...", "start": "1714003200", "end": "1714089600" } }, "errors": [] }
```

---

## Delete Schedule

<mark style="color:blue;">`GET`</mark> `/bases/delete_schedule/{id}.json`

Delete a schedule entry or group of entries.

#### Path Parameters

| Parameter | Type | Description |
|-----------|------|-------------|
| id | string | Schedule UUID, `all` (all future entries for current user), or `always` (always-available entries) |

#### Response

```json
{ "result": true }
```
