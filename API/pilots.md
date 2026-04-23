# Pilots

## Pilots List (Dropdown)

<mark style="color:blue;">`GET`</mark> `/pilots/list.json`

Retrieve a simplified list of all pilots. Useful for dropdowns and selection fields.

#### Response

```json
[
  { "id": "123", "name": "John", "surname": "Doe" },
  { "id": "124", "name": "Jane", "surname": "Smith", "user_group_id": 110, "pilot": true, "active": true }
]
```

---

## Pilots Index (Paginated)

<mark style="color:blue;">`GET`</mark> `/pilots/index/page:{page}/search:{search}/user_group_id:{groupId}/pilot_group:{groupId}/base_id:{baseId}/active:{active}/pilot:{pilot}/.json`

Retrieve a paginated, filterable list of pilots with full details.

#### Path Parameters

All filter parameters are optional — use empty string to skip.

| Parameter | Type | Description |
|-----------|------|-------------|
| page | number | Page number (starts at 1) |
| search | string | Search by name or email |
| user_group_id | string | Filter by user group/role |
| pilot_group | string | Filter by pilot group |
| base_id | string | Filter by base |
| active | boolean | Filter active/inactive users |
| pilot | boolean | Filter pilot vs non-pilot accounts |

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
        "country_id": "195",
        "Country": { "name": "Spain" }
      },
      "UserGroup": { "id": "110", "name": "Pilot" },
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
    "limit": 25
  }
}
```

---

## My Pilot View

<mark style="color:blue;">`GET`</mark> `/pilots/view.json`

Retrieve the authenticated user's own pilot profile.

#### Response

Same structure as [Pilot View](#view-pilot) below.

---

## View Pilot

<mark style="color:blue;">`GET`</mark> `/pilots/view/{id}.json`

Retrieve full pilot details including certificates, recent flights, pilot groups, and attributed aircraft.

#### Path Parameters

| Parameter | Type | Description |
|-----------|------|-------------|
| id | string | User ID |

#### Response

```json
{
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
    "address": "123 Airport Road",
    "city": "Madrid",
    "pc": "28001",
    "country_id": "195",
    "nationality": "Spanish",
    "companyid": "EMP-001",
    "color": "#3498db",
    "timezone_id": "85",
    "notes": null,
    "Country": { "name": "Spain" },
    "Timezone": { "name": "Europe/Madrid" },
    "CountryOfBirth": { "name": "Spain" }
  },
  "UserGroup": { "name": "Pilot", "id": "110" },
  "Company": { "name": "Acme Flight School", "id": "42" },
  "Base": { "id": "5", "name": "Madrid Base", "airport_id": "100" },
  "Supervisor": {
    "id": "101",
    "UserDetail": { "id": "101", "name": "Maria", "surname": "Garcia" }
  },
  "UserCertificate": [
    {
      "id": "300",
      "user_id": "123",
      "type": "medical",
      "status": "valid",
      "name": "Class 1 Medical",
      "issue": "2024-06-01",
      "expiration": "2025-06-01",
      "comments": "",
      "notified": false
    }
  ],
  "PilotGroup": [
    { "id": "1", "name": "Instructors", "color": "#3498db" }
  ],
  "AttributedAircraft": { "45": "EC-ABC", "46": "EC-DEF" },
  "FlightType": [],
  "certificateTypes": {
    "medical": "Medical Certificate",
    "licence": "Pilot Licence",
    "rating": "Type Rating",
    "training": "Recurrent Training"
  },
  "valid": {
    "result": true,
    "licence": true,
    "rating": true,
    "medical": true,
    "training": null,
    "limit": null
  }
}
```

#### Validity Check

The `valid` object indicates whether the pilot's certificates are current:

| Field | Type | Description |
|-------|------|-------------|
| result | boolean | Overall validity — all required certificates current |
| licence | boolean \| null | Pilot licence valid (`null` = not required) |
| rating | boolean \| null | Type rating valid |
| medical | boolean \| null | Medical certificate valid |
| training | boolean \| null | Recurrent training valid |
| limit | number \| null | Flight hour limit remaining |

---

## Edit Pilot

<mark style="color:green;">`POST`</mark> `/pilots/edit.json`

Update pilot profile details.

---

## Certificates

### List Certificates

<mark style="color:blue;">`GET`</mark> `/pilots/certificates/{userId}.json`

Retrieve all certificates for a pilot.

#### Response

```json
{
  "certificates": [...],
  "certificateTypes": {
    "medical": "Medical Certificate",
    "licence": "Pilot Licence",
    "rating": "Type Rating"
  },
  "valid": {
    "result": true,
    "licence": true,
    "medical": true,
    "rating": null,
    "training": null
  }
}
```

### View Certificate

<mark style="color:blue;">`GET`</mark> `/pilots/certificate/{certId}.json`

Retrieve a single certificate with attached files.

### Add Certificate

<mark style="color:green;">`POST`</mark> `/pilots/add_certificate.json`

Upload a new certificate. Uses `multipart/form-data` for file attachments.

---

## Pilot Currency

<mark style="color:blue;">`GET`</mark> `/pilots/get_currency/{userId}/{c1}/{c2}/{c3}/currency.json`

Check pilot currency status against configured currency rules.

#### Path Parameters

| Parameter | Type | Description |
|-----------|------|-------------|
| userId | string | User ID |
| c1 | string | Currency check parameter 1 |
| c2 | string | Currency check parameter 2 |
| c3 | string | Currency check parameter 3 |

---

## Pilot Totals

<mark style="color:blue;">`GET`</mark> `/pilots/totals/{userId}.json`

Retrieve cumulative flight hour totals for a pilot.

#### Path Parameters

| Parameter | Type | Description |
|-----------|------|-------------|
| userId | string | User ID |

---

## Pilot Groups

<mark style="color:blue;">`GET`</mark> `/manager/pilot_groups.json`

List all pilot groups configured for the company.

#### Response

```json
[
  { "id": "1", "name": "Instructors", "color": "#3498db" },
  { "id": "2", "name": "Examiners", "color": "#e74c3c" }
]
```

---

## Resend Activation

<mark style="color:green;">`POST`</mark> `/pilots/reminder.json`

Resend the activation email to a user.

#### Request Body

| Field | Type | Required | Description |
|-------|------|----------|-------------|
| user | string | Yes | User ID |
