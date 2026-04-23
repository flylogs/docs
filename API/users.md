# Users

## User Profile

<mark style="color:blue;">`GET`</mark> `/users/view.json`

Retrieve the authenticated user's profile, including personal details and user group.

#### Response

```json
{
  "User": {
    "id": "123",
    "active": true,
    "pilot": true,
    "billing": true,
    "user_group_id": "110",
    "base_id": "5",
    "supervisor_id": null,
    "email": "pilot@example.com",
    "language": "en",
    "api": true,
    "two_factor": "OFF",
    "newsletter": true,
    "alerts": true,
    "message_alerts": true,
    "created": "2023-01-15 10:30:00",
    "expiration": null
  },
  "UserDetail": {
    "id": "123",
    "name": "John",
    "surname": "Doe",
    "passport": "AB123456",
    "companyid": "EMP-001",
    "dob": "1990-05-20",
    "phonecode": "+34",
    "phone": "600123456",
    "phonecode2": null,
    "phone2": "",
    "emergency_contact": "Jane Doe +34600654321",
    "public_phone": "",
    "address": "123 Airport Road",
    "pc": "28001",
    "city": "Madrid",
    "country_id": "195",
    "timezone_id": "85",
    "nationality": "Spanish",
    "birthcountry_id": "195",
    "photo": "https://...",
    "flight_hours": "1250.5",
    "color": "#3498db",
    "modified": "2025-03-10 14:22:00"
  },
  "UserGroup": {
    "name": "Pilot",
    "id": "110"
  }
}
```

---

## Edit Profile

<mark style="color:green;">`POST`</mark> `/users/edit.json`

Update the authenticated user's profile.

#### Request Body

```json
{
  "UserDetail": {
    "name": "John",
    "surname": "Doe",
    "phone": "600123456",
    "address": "456 New Street",
    "city": "Barcelona",
    "country_id": "195",
    "timezone_id": "85"
  },
  "User": {
    "email": "john.doe@example.com",
    "language": "en",
    "newsletter": true,
    "alerts": true,
    "message_alerts": true,
    "two_factor": "EMAIL"
  }
}
```

All fields are optional — only include fields you want to update.

#### Response

Returns the updated `UserProfileResponse` (same shape as GET `/users/view.json`).

---

## Change Password

<mark style="color:green;">`POST`</mark> `/users/password.json`

Change the authenticated user's password.

#### Request Body

| Field | Type | Required | Description |
|-------|------|----------|-------------|
| password | string | Yes | Current password |
| newpassword | string | Yes | New password |
| newpasswordrepeat | string | Yes | Confirm new password |

#### Response

```json
{
  "result": true,
  "message": "Password changed successfully"
}
```

---

## Login History

<mark style="color:blue;">`GET`</mark> `/users/logins.json`

Retrieve recent sign-in history and active sessions.

#### Response

```json
{
  "logins": [
    {
      "UserLogin": {
        "id": "456",
        "city": "Madrid",
        "browser": "Chrome 120",
        "country": "Spain",
        "provider": "Google",
        "ip": "192.168.1.1",
        "modified": "2025-03-10 08:00:00"
      }
    }
  ],
  "sessions": [
    {
      "UserSession": {
        "id": "abc123token",
        "api": false,
        "device": "Chrome / macOS",
        "ip": "192.168.1.1",
        "expires": "2025-03-24 08:00:00",
        "modified": "2025-03-10 08:00:00"
      }
    }
  ],
  "currentSession": "abc123token"
}
```

#### Fields

| Field | Type | Description |
|-------|------|-------------|
| logins | array | Recent sign-in audit entries |
| sessions | array | Currently active sessions |
| currentSession | string | Session ID matching the current token |

---

## Close Session

<mark style="color:green;">`POST`</mark> `/users/closesession/{sessionId}.json`

Terminate a specific active session (remote logout).

#### Path Parameters

| Parameter | Type | Description |
|-----------|------|-------------|
| sessionId | string | Session ID to terminate |

---

## User Groups

<mark style="color:blue;">`GET`</mark> `/users/user_groups.json`

List all user groups (roles) in the company.

<mark style="color:blue;">`GET`</mark> `/users/user_groups/1.json`

List staff-only user groups.

#### Response

```json
[
  { "id": "100", "name": "Administrator" },
  { "id": "105", "name": "Manager" },
  { "id": "110", "name": "Pilot" },
  { "id": "120", "name": "Student" }
]
```

---

## Countries

<mark style="color:blue;">`GET`</mark> `/users/countries.json`

List all countries. Returns a map of `id → name`.

#### Response

```json
{
  "1": "Afghanistan",
  "195": "Spain",
  "230": "United States"
}
```

---

## Timezones

<mark style="color:blue;">`GET`</mark> `/users/timezones.json`

List all timezones. Returns a map of `id → IANA timezone name`.

#### Response

```json
{
  "1": "Pacific/Midway",
  "85": "Europe/Madrid",
  "160": "America/New_York"
}
```

---

## Organizations

<mark style="color:blue;">`GET`</mark> `/users/organizations.json`

List all companies/organizations the authenticated user belongs to.

#### Response

Returns a map keyed by company ID:

```json
{
  "42": {
    "id": "42",
    "company_id": "42",
    "active": true,
    "group": "premium",
    "name": "Acme Flight School",
    "color": "#3498db",
    "logo": "https://..."
  }
}
```

---

## Switch Organization

<mark style="color:blue;">`GET`</mark> `/users/switch/{companyId}.json`

Switch the active company context. Returns a new session token for the target company.

#### Path Parameters

| Parameter | Type | Description |
|-----------|------|-------------|
| companyId | string | Target company ID |

#### Response

```json
{
  "result": true,
  "company_id": "42",
  "token": "new_session_token_here",
  "message": null
}
```

{% hint style="warning" %}
After switching, you must use the **new token** for all subsequent requests. The previous token is invalidated.
{% endhint %}
