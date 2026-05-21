# Pilots

## Pilots List (Dropdown)

<mark style="color:blue;">`GET`</mark> `/pilots/list[/active:{1|0|all}][/pilot:{1|0|all}].json`

Minimal, non-paginated list of users in the caller's company. Designed for dropdowns / selection fields. Soft-deleted users (`deleted=1`) are always excluded.

#### Named Parameters

| Parameter | Type | Default | Description |
|-----------|------|---------|-------------|
| active | `1` \| `0` \| `all` | `1` | `1` only active; `0` only inactive; `all` both |
| pilot  | `1` \| `0` \| `all` | `1` | `1` only flying users; `0` only non-flying; `all` both |

#### Response

```json
{
  "pilots": [
    { "id": "123", "name": "John", "surname": "Doe", "user_group_id": "150", "active": true, "pilot": true },
    { "id": "124", "name": "Jane", "surname": "Smith", "user_group_id": "190", "active": true, "pilot": true }
  ]
}
```

Sorted by `User.user_group_id ASC, UserDetail.name ASC, UserDetail.surname ASC` — managers first, then instructors, then pilots, then students.

Use this in preference to `/pilots/index` when you only need `{id, name, surname}` for dropdowns: it is a single non-paginated query and is much cheaper than walking the paginated index. Examples:

- `/pilots/list.json` — active flying users (audit-grade dropdown, default)
- `/pilots/list/active:all.json` — all flying users including inactive (logbook audit pilot filter)
- `/pilots/list/pilot:all.json` — all active users including non-flying (e.g. crew pickers that must include instructors with `pilot=0`)

---

## Pilots Index (Paginated)

<mark style="color:blue;">`GET`</mark> `/pilots/index/page:{page}/search:{search}/user_group_id:{groupId}/pilot_group:{groupId}/base_id:{baseId}/active:{active}/pilot:{pilot}/limit:{limit}.json`

Retrieve a paginated, filterable list of pilots with full details. Must be a JSON or AJAX request unless `excel:1` is set.

#### Path Parameters

All filter parameters are optional — use empty string to skip.

| Parameter | Type | Description |
|-----------|------|-------------|
| page | number | Page number (starts at 1) |
| search | string | Matches name, surname, name+surname, surname+name, `companyid`, `passport`, email prefix, or exact `User.id` |
| user_group_id | string | Filter by user group/role. `150` is treated as `<= 150` (all managers) |
| pilot_group | string | Filter by pilot group ID |
| base_id | string | Filter by base |
| active | boolean | Filter active/inactive users (`active:false` to include only inactive) |
| pilot | boolean | Filter pilot vs non-pilot accounts |
| limit | number | Page size (default `50`, max `100000`) |
| excel | boolean | Render the XLS export view (limit forced to `100000`) |

#### Permissions & Field Visibility

- Viewers with `user_group_id > 170` (e.g. students) get a reduced field set and the result is restricted to users with `user_group_id <= 170` (i.e. they cannot see other students/clients).
- Billing fields (`User.billing`, `UserBill`, `UserBillPackage`) are only included when the company plan is **not** `free` and billing is enabled. They are flattened into `UserDetail.billing_balance` and `UserDetail.package_balance`.

#### Response

```json
{
  "pilots": [
    {
      "User": {
        "id": "123",
        "active": true,
        "pilot": true,
        "email": "john@example.com",
        "email_status": "confirmed",
        "user_group_id": "110",
        "created": "2023-01-15",
        "billing": true
      },
      "UserDetail": {
        "name": "John",
        "surname": "Doe",
        "photo": "https://...",
        "phone": "600123456",
        "passport": "AB123456",
        "city": "Madrid",
        "address": "123 Airport Road",
        "pc": "28001",
        "companyid": "EMP-001",
        "Country": { "name": "Spain" },
        "billing_balance": 125.50,
        "package_balance": 300.00
      },
      "UserGroup": { "name": "Pilot" },
      "Base": { "id": "5", "name": "Madrid Base", "airport_id": "100" },
      "PilotGroup": { "#3498db": "Instructors" }
    }
  ],
  "paginate": {
    "page": 1,
    "current": 1,
    "count": 45,
    "prevPage": false,
    "nextPage": true,
    "pageCount": 2,
    "limit": 50
  }
}
```

`PilotGroup` is reshaped to `{ color: name }`. `email_status` reflects `User.checkConfirmedEmail` outcomes (e.g. `confirmed`, `pending`).

---

## Create Pilot

<mark style="color:green;">`POST`</mark> `/pilots/create.json`

Create a new pilot account. Restricted to `user_group_id` ∈ {1, 100, 105, 110, 120, 150}.

The free plan is capped at 100 pilots — additional pilots return `400`.

#### Request Body

```json
{
  "User": {
    "user_group_id": "190",
    "email": "newpilot@example.com",
    "active": true,
    "send_email": true
  },
  "UserDetail": {
    "name": "Alex",
    "surname": "Rivera"
  }
}
```

- `User.user_group_id` defaults to `190` if omitted; values below `150` are rejected.
- `User.company_id` is forced from the session; do not send.
- `UserDetail.timezone_id` defaults to the requesting user's timezone.
- If `User.email` is provided, `email_status` is computed via `User.checkConfirmedEmail`. When the email is set, the user is `active`, and `send_email` is true, a `newstaff` confirmation mail is sent.
- `UserDetail.name` and `UserDetail.surname` are required.

#### Response

```json
{
  "id": "456",
  "result": true,
  "validation": null
}
```

On failure: `result = false`, `validation` contains `User.invalidFields()`.

---

## My Pilot View

<mark style="color:blue;">`GET`</mark> `/pilots/view.json`

Retrieve the authenticated user's own pilot profile. Same payload as [View Pilot](#view-pilot) below.

> Note: passing `userId = 3` is treated as "view self" for legacy reasons.

---

## View Pilot

<mark style="color:blue;">`GET`</mark> `/pilots/view/{id}.json`

Retrieve full pilot details including certificates, pilot groups, attributed aircraft, and flight types. Scoped to the viewer's company.

#### Path Parameters

| Parameter | Type | Description |
|-----------|------|-------------|
| id | string | User ID |

#### Permissions & Field Visibility

- Viewer `user_group_id > 150` viewing another pilot: `User.email`, `User.user_group_id`, `User.user_login_count`, `User.email_status`, `User.expiration`, `UserDetail.phone`, and the entire `UserCertificate` array are stripped.
- Viewer `user_group_id > 150`: `UserDetail.notes` and `UserDetail.billing_balance` are always stripped.
- Viewer `user_group_id < 151`: gets `UserDetail.notes`, `address`, `pc`, `city`, `emergency_contact`, latest `UserLogin`, and (when billing is enabled) `billing_balance` / `package_balance`.

#### Response

```json
{
  "user": {
    "User": {
      "id": "123",
      "user_group_id": "110",
      "email": "john@example.com",
      "email_status": "confirmed",
      "billing": true,
      "pilot": true,
      "active": true,
      "api": false,
      "expiration": null,
      "user_login_count": "42",
      "created": "2023-01-15"
    },
    "UserDetail": {
      "id": "123",
      "name": "John",
      "surname": "Doe",
      "photo": "https://...",
      "dob": "1990-05-20",
      "passport": "AB123456",
      "phone": "600123456",
      "phone2": "600654321",
      "address": "123 Airport Road",
      "city": "Madrid",
      "pc": "28001",
      "country_id": "195",
      "birthcountry_id": "195",
      "nationality": "Spanish",
      "companyid": "EMP-001",
      "color": "#3498db",
      "public_phone": true,
      "notes": null,
      "emergency_contact": null,
      "billing_balance": 125.50,
      "package_balance": 300.00,
      "Country": { "name": "Spain" },
      "Timezone": { "name": "Europe/Madrid" },
      "CountryOfBirth": { "name": "Spain" }
    },
    "UserGroup": { "name": "Pilot" },
    "Company": { "name": "Acme Flight School" },
    "Base": { "id": "5", "name": "Madrid Base", "airport_id": "100" },
    "Supervisor": {
      "id": "101",
      "UserDetail": { "name": "Maria", "surname": "Garcia" }
    },
    "UserCertificate": [
      {
        "id": "300",
        "user_id": "123",
        "type": "medical_class_1",
        "name": "Class 1 Medical",
        "issue": "2024-06-01",
        "expiration": "2025-06-01",
        "comments": "",
        "Upload": {
          "id": "501",
          "filename": "med_class1_2024.pdf",
          "type": "document",
          "mime": "application/pdf",
          "size": "245678"
        }
      }
    ],
    "PilotGroup": [
      { "id": "1", "name": "Instructors", "color": "#3498db" }
    ],
    "AttributedAircraft": { "45": "EC-ABC", "46": "EC-DEF" },
    "FlightType": [],
    "UserLogin": [
      { "id": "9001", "modified": "2026-04-30 08:12:11" }
    ]
  }
}
```

Returns `404` if the pilot is not in the viewer's company.

---

## Edit Pilot

<mark style="color:green;">`POST`</mark> `/pilots/edit.json`

Update pilot profile details. Restricted to `user_group_id` ∈ {1, 100, 105, 110, 120, 150}.

#### Request Body

```json
{
  "User": {
    "id": "123",
    "user_group_id": "190",
    "email": "newemail@example.com",
    "active": true,
    "send_email": true
  },
  "UserDetail": {
    "name": "John",
    "surname": "Doe"
  },
  "AttributedAircraft": { "45": true, "46": true },
  "FlightType": { "1": true, "2": true },
  "PilotGroup": { "3": true }
}
```

- `User.id` is required.
- `AttributedAircraft`, `FlightType`, and `PilotGroup` are passed as `{ id: truthy }` maps; only the keys are used. Existing pilot ↔ aircraft / flight-type / pilot-group joins are wiped before re-saving.
- A `user_group_id` change to `< 150` requires the editor to have `user_group_id <= 120`.
- Self-edits cannot demote yourself away from `user_group_id = 100` or below.
- When `email` changes, `email_status` is recomputed and a `confirm` mail is sent if the user is active and `send_email` is true.

#### Response

```json
{
  "id": "123",
  "result": true,
  "errors": []
}
```

On failure, `errors` is the flattened `User.invalidFields()`.

---

## Pilot Totals

<mark style="color:blue;">`GET`</mark> `/pilots/totals/{userId}.json`

Cumulative flight hour totals (in seconds) for a pilot, broken down by function and rule.

#### Path Parameters

| Parameter | Type | Description |
|-----------|------|-------------|
| userId | string | User ID. Defaults to the authenticated user. |

#### Response

```json
{
  "user": {
    "id": "123",
    "previous_time": 36000,
    "other_companies": 7200
  },
  "average": 5400,
  "total_time": 540000,
  "flight_time": 504000,
  "flight_types": { "Training": 180000, "Charter": 90000 },
  "functions": {
    "FI":      { "icon": "fa fa-user-tie",      "time": 72000 },
    "PIC":     { "icon": "fa fa-user-astronaut","time": 360000 },
    "DUAL":    { "icon": "fa fa-user-friends",  "time": 90000 },
    "COPILOT": { "icon": "fa fa-people-carry",  "time": 36000 }
  },
  "rules": {
    "VFR":          { "icon": "fa fa-sun",        "time": 432000 },
    "IFR":          { "icon": "fa fa-compass",    "time": 72000 },
    "SIM":          { "icon": "fa fa-keyboard",   "time": 36000 },
    "Cross Country":{ "icon": "fa fa-map",        "time": 180000 },
    "Night":        { "icon": "fa fa-moon",       "time": 18000 },
    "Multi Engine": { "icon": "fa fa-ellipsis-h", "time": 90000 }
  }
}
```

`other_companies` aggregates time from other companies that share the same email. `previous_time` is `UserDetail.flight_hours * 3600`. All times are in **seconds**. `flight_time = total_time − rules.SIM.time`. PIC includes FI time.

---

## Pilot Currency

<mark style="color:blue;">`GET`</mark> `/pilots/get_currency/{userId}/{d1}/{d2}/{d3}.json`

Check pilot landings/hours within rolling day windows against the company-configured currency requirements.

#### Path Parameters

| Parameter | Type | Description |
|-----------|------|-------------|
| userId | string | User ID. Forced to the authenticated user when null or when caller `user_group_id > 170`. |
| d1 | number | First window in days (default `30`, max `999`). |
| d2 | number | Second window in days (default `90`, max `999`). |
| d3 | number | Third window in days (default `null`/disabled). |

#### Response

```json
{
  "result": {
    "day": {
      "landings1": 8, "landings2": 21, "landings3": 0,
      "hours1": 14400, "hours2": 36000, "hours3": 0
    },
    "night": {
      "landings1": 1, "landings2": 4, "landings3": 0,
      "hours1": 1800, "hours2": 7200, "hours3": 0
    },
    "ifr": {
      "landings1": 2, "landings2": 9, "landings3": 0,
      "hours1": 3600, "hours2": 18000, "hours3": 0
    },
    "requirements": {
      "hours1": 0, "hours2": 0, "hours3": 0,
      "landings1": 3, "landings2": 6, "landings3": null
    }
  }
}
```

Hours are in seconds. `requirements` mirrors `CompanySetting.currency{1,2,3}_{flighttime,landings}`.

---

## Pilot Time Limits

<mark style="color:green;">`POST`</mark> `/pilots/get_time_limits.json`

Monthly breakdown plus month/year totals of block flight time and duty time for a given user, anchored to a Unix timestamp.

#### Request Body

| Field | Type | Required | Description |
|-------|------|----------|-------------|
| timestamp | number | Yes | Unix timestamp anchoring the month/year |
| user_id | number | Yes | Target user ID |

Both fields must be numeric and non-empty.

#### Response

```json
{
  "timestamp": 1714521600,
  "flight": {
    "month": { "2026-04-01": 4.5, "2026-04-02": 3.0 },
    "totals": { "month": "42.50", "year": "210.75" }
  },
  "duty": {
    "month": { "2026-04-01": 6.0, "2026-04-02": 5.5 },
    "totals": { "month": "78.00", "year": "412.50" }
  }
}
```

Flight totals are in **hours** (formatted strings). Duty `totals` come from `PilotDutyRecord::__total`. Daily values are summed by date.

---

## Duty Records

<mark style="color:blue;">`GET`</mark> `/pilots/duty/{days}/{user}.json`

<mark style="color:green;">`POST`</mark> `/pilots/duty/{days}/{user}.json`

#### GET — last N days of duty records

| Parameter | Type | Description |
|-----------|------|-------------|
| days | number | Number of trailing days to return (default `3`) |
| user | string | Target user ID. Forced to self when caller `user_group_id > 170` or null. |

```json
{
  "duty": [
    {
      "date": "2026-05-03",
      "label": "03 May",
      "id": "910",
      "in_duty": "08:00:00",
      "out_duty": "16:30:00",
      "in_work": "08:30:00",
      "out_work": "16:00:00"
    }
  ]
}
```

#### POST — bulk save duty records

Body is a numerically-indexed array of `PilotDutyRecord` objects (flat, no model alias). Each record needs `date`; `in_duty`/`out_duty`/`in_work`/`out_work`/`in_flight`/`out_flight` are optional time fields (`HH:MM` or `HH:MM:SS`). `user_id` and `company_id` are auto-filled from the session when omitted. Existing row for `(company, user, date)` is replaced.

Each record is validated and saved independently in a loop; an invalid record does not block the rest.

```json
{
  "save": [true, true, true, false, true],
  "errors": {
    "3": {
      "in_work": ["Must be a valid time"],
      "out_work": ["Must be a valid time"]
    }
  }
}
```

- `save[i]` — `true` if record `i` was persisted, `false` if it failed validation.
- `errors[i]` — per-field validation errors for failed records.

Valid time strings only. Literal `"null"` is rejected; send an empty string or omit the field to clear/leave unchanged. Empty string overwrites the existing column with `NULL`.

---

## Certificates

### Certificate Types

<mark style="color:blue;">`GET`</mark> `/pilots/certificate_types.json`

Returns the canonical certificate type catalogue used across the app.

#### Response

```json
{
  "certificateTypes": {
    "licence": {
      "type": "licence", "validity": null, "name": "Licence", "abbr": "LIC",
      "icon": "fa fa-id-card",
      "requires_expiration": false, "requires_issue": true,
      "mandatory": true, "order": 10, "group_role": "pilot"
    },
    "medical_class_1": {
      "type": "medical", "validity": 12, "name": "Medical Class 1", "abbr": "M1",
      "icon": "fa fa-heartbeat",
      "requires_expiration": true, "requires_issue": true,
      "mandatory": true, "order": 30, "group_role": "pilot"
    }
  }
}
```

| Field | Type | Description |
|-------|------|-------------|
| type | string | Category — one of `licence`, `rating`, `medical`, `training`, `document` |
| validity | number \| null | Default validity window in **months**. `null` = no expiry. |
| name | string | Display name |
| abbr | string | Short code for compact tables |
| icon | string | Font Awesome class |
| requires_expiration | boolean | Whether an expiration date should be required at input |
| requires_issue | boolean | Whether an issue date should be required at input |
| mandatory | boolean | Counts toward the `valid` certificate result |
| order | number | Display sort order |
| group_role | string | `pilot` \| `all` — restricts which user roles see this type |

### List Certificates

<mark style="color:blue;">`GET`</mark> `/pilots/certificates/{userId}.json`

Retrieve all certificates for a pilot plus the validity summary. JSON-only.

#### Response

```json
{
  "UserCertificate": [
    {
      "id": "300",
      "user_id": "123",
      "type": "medical_class_1",
      "name": "Class 1 Medical",
      "issue": "2024-06-01",
      "expiration": "2025-06-01",
      "Uploads": [
        { "id": "501", "filename": "...", "type": "document", "mime": "application/pdf", "size": "245678" }
      ]
    }
  ],
  "valid": {
    "result": true,
    "licence": true,
    "rating": true,
    "medical": true,
    "training": true,
    "sep_land_rating": null,
    "sep_sea_rating": null,
    "mep_rating": null,
    "set_rating": null,
    "type_rating": null,
    "night_rating": null,
    "ir_rating": null,
    "medical_class_1": null,
    "medical_class_2": null,
    "medical_class_3": null,
    "limit": 1735689600
  }
}
```

#### Validity Check

`valid` is produced by `UserCertificate::checkValidLicence($userGroupId, $UserCertificate)`:

| Field | Type | Description |
|-------|------|-------------|
| result | boolean | Overall validity. `true` iff licence + rating + medical + training are all valid (or, for ground roles, just the relevant subset — see below). |
| licence | boolean \| null | At least one valid licence cert. |
| rating | boolean \| null | All rating certs valid (any single invalid rating fails). |
| medical | boolean \| null | At least one valid medical cert. |
| training | boolean \| null | All training certs valid. |
| limit | number \| null | Earliest expiry timestamp (epoch seconds) across all certs with an expiration. |

Special cases:
- `user_group_id == 200` (student): `result` only requires `medical`.
- `user_group_id == 300` (admin / non-pilot): `result` only requires `licence`.

### View Certificate

<mark style="color:blue;">`GET`</mark> `/pilots/certificate/{certId}.json`

Retrieve a single certificate with up to 5 attached uploads.

```json
{
  "cert": {
    "UserCertificate": { "id": "300", "name": "Class 1 Medical", "...": "..." },
    "Uploads": [
      { "id": "501", "filename": "...", "type": "document", "mime": "application/pdf", "size": "245678" }
    ]
  }
}
```

### Add Certificate

<mark style="color:green;">`POST`</mark> `/pilots/add_certificate.json`

Create a new certificate. Uses `multipart/form-data` for the optional file attachment.

#### Request Body

```
UserCertificate[user_id]=123
UserCertificate[type]=medical_class_1
UserCertificate[name]=Class 1 Medical
UserCertificate[issue]=2024-06-01
UserCertificate[expiration]=2025-06-01
UserCertificate[photo]=@/path/to/scan.pdf
```

- For callers with `user_group_id > 150`, `user_id` is forced to the authenticated user.
- For managers, the target user must belong to the same company.
- `issue` and `expiration` must parse as `Y-m-d` or they are silently dropped.
- If `photo` is present and uploads cleanly, an `Upload` record is created (`type` is `photo`/`video`/`document` based on MIME) and the file is sent to S3.

#### Response

```json
{
  "result": { "UserCertificate": { "id": "301", "...": "..." }, "Upload": { "id": "502" } },
  "errors": []
}
```

`errors` is populated on validation failure or upload errors.

### Delete Certificate

<mark style="color:green;">`POST`</mark> `/pilots/delete_certificate/{id}.json`

Delete a certificate. Callers with `user_group_id > 150` can only delete their own certificates; managers can delete any certificate within their company.

```json
{ "result": true }
```

Returns `404` if the certificate is not found in the caller's scope.

### Attributions

<mark style="color:blue;">`GET`</mark> `/pilots/attributions/{userId}.json`

Returns the aircraft and flight types attributed to a pilot. `{userId}` is optional; when omitted, the authenticated user is used. Callers with `user_group_id > 170` can only query themselves.

For each category, the response is an `id => label` map of the pilot's explicit attributions. If the pilot has no attribution set for a given category, the full active company list for that category is returned instead.

```json
{
  "attributions": {
    "aircraft": {
      "12": "EC-ABC",
      "15": "EC-XYZ"
    },
    "flight_types": {
      "3": "Private",
      "7": "Training"
    }
  }
}
```

Returns `404` if the pilot is not in the caller's company and `403` when a non-manager queries another user.

---

## Manager-only Endpoints

### Save Pilot Notes

<mark style="color:green;">`POST`</mark> `/manager/pilots/notes.json`

Persist a private (manager-only) note onto a pilot's `UserDetail.notes`. Requires `user_group_id <= 170`.

#### Request Body

| Field | Type | Required | Description |
|-------|------|----------|-------------|
| pilot | string | Yes | Pilot user ID |
| notes | string | Yes | Note body |

```json
{ "result": true }
```

### Delete Pilot

<mark style="color:green;">`POST`</mark> `/manager/pilots/delete/{id}.json`

Soft-delete a pilot. The caller cannot delete themselves.

```json
{ "result": true }
```

### Recalculate Duties

<mark style="color:blue;">`GET`</mark> `/manager/pilots/recalculate_duties/{date}.json`

Re-runs `PilotDutyRecord::autoCalc` for every PIC/SIC/Supervisor on flights logged on `{date}` (format `YYYY-MM-DD`). Existing duty rows for that date are cleared first. Up to 100 flights are processed per call.

```json
{
  "date": "2026-05-03",
  "pilots": [/* autoCalc results */]
}
```

### FI Assignments Tree

<mark style="color:blue;">`GET`</mark> `/manager/pilots/fi_assignments.json`

Returns instructor → supervised-pilot trees for the company in a tree-view friendly shape (icon, color, href, text, nodes). Branches with more than 6 supervised pilots are flagged with `backColor = "#ff9900"`.

For caller `user_group_id <= 150`, also returns `unAssignedStudents` — students whose `supervisor_id` is empty or points to an inactive instructor.

```json
{
  "pilots": [
    {
      "icon": "fa fa-user-graduate",
      "text": "Maria Garcia",
      "backColor": "#fff",
      "tags": [3],
      "nodes": [
        { "icon": "fa fa-user-graduate", "color": "#339966", "href": "/pilots/view/200", "text": "Alex Rivera (Student)", "selectable": false }
      ],
      "selectable": false
    }
  ],
  "unAssignedStudents": [
    { "User": { "id": "201" }, "UserDetail": { "name": "Sam", "surname": "Lee" } }
  ]
}
```

### Audit

<mark style="color:blue;">`GET`</mark> `/manager/pilots/audit/from:{from}/to:{to}/group:{group}/pilot_group:{pilot_group}/pilot:{pilot}/all_certs:{all_certs}.json`

Paginated audit view of pilots and instructors with their latest flight, training status, certificates, and supervisor.

#### Path Parameters

| Parameter | Description |
|-----------|-------------|
| from | Lower bound on `latest_flight_date` (`YYYY-MM-DD` or epoch seconds) |
| to | Upper bound on `latest_flight_date` |
| group | `user_group_id` (or `150` for `<= 150`) |
| pilot | Truthy to restrict to pilots only |
| pilot_group | Pilot group ID |
| all_certs | If absent or false, certificates are filtered to `licence`, `rating`, `medical` only |

JSON or AJAX requests return:

```json
{
  "pilots": [/* paginated User rows with UserDetail, UserGroup, PilotGroup, Supervisor, UserCertificate, MyFlight, Training */],
  "filters": { "from": "", "to": "", "groups": [], "user_types": [] }
}
```

The HTML version of this endpoint also returns `userGroups` and `pilotGroups` for filter dropdowns.

### Monthly Duties Report

<mark style="color:blue;">`GET`</mark> `/manager/pilots/duties/month:{month}/year:{year}/group:{group}/data:{data}.json`

Per-pilot daily breakdown of duty / FDP / work time for a single month. **Premium and unlimited plans only**; lower plans return the upgrade view.

| Parameter | Description |
|-----------|-------------|
| month | 1–12 (default current month) |
| year | YYYY (default current year) |
| group | `user_group_id` (`150` for `<= 150`) |
| data | `duty` (default), `flight`, or `work` — selects which `in_*`/`out_*` columns drive the totals |

```json
{
  "pilots": [
    {
      "User": { "id": "123", "email": "..." },
      "UserDetail": { "name": "John", "surname": "Doe" },
      "PilotDutyRecord": [
        { "date": "2026-05-01", "start": "08:00:00", "end": "16:00:00", "total": 28800 }
      ],
      "Flight": { "block_time": 54000 }
    }
  ],
  "type": "Duty"
}
```

`Flight.block_time` is total block time in seconds for the selected month, computed via `Flight->__getPilotFlightTime()` (respects company `FlightType` PIC/SIC rules).

`/manager/pilots/duties/{export}.json` with a truthy `export` segment renders the XLS view instead.

### Manager — Pilot Duty PDF

<mark style="color:blue;">`GET`</mark> `/manager/pilots/duty/{user}/{year}/{month}`

Renders a duty/flight report as a PDF (not JSON). Listed here for completeness.

---

## Notes on Removed Endpoints

`POST /pilots/reminder.json` (resend activation email) was **removed**. Use the standard email-confirmation flow triggered automatically by `create` / `edit` when `send_email = true` and the email changes or the account is newly activated.
