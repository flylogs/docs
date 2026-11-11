# Manager Users

> Role names and `user_group_id` values are listed in [User groups](users.md#user-groups).

Administrative endpoints for managing user accounts. Requires manager or administrator role.

{% hint style="info" %}
**Requests made by an External Auditor (`user_group_id` 250 — Auditor)** have `email`, `phone`, `phone2`, `address`, `city`, `pc` and `passport` stripped (returned as `null`) from every `User`/`UserDetail` object in the response, except the auditor's own record. This applies to every endpoint on this page — list, view, everything — automatically, based on the **caller's** role, not the target user's.
{% endhint %}

## List Users

<mark style="color:blue;">`GET`</mark> `/manager/users.json`

Retrieve all users in the company.

#### Response

```json
[
  {
    "User": {
      "id": "123",
      "active": true,
      "email_status": "confirmed",
      "pilot": true,
      "two_factor": "OFF",
      "api": false,
      "email": "john@example.com",
      "user_group_id": "110",
      "expiration": null
    },
    "UserDetail": {
      "name": "John",
      "surname": "Doe",
      "photo": "https://..."
    },
    "UserGroup": {
      "name": "Pilot",
      "id": "110"
    }
  }
]
```

---

## Users List (Simplified)

<mark style="color:blue;">`GET`</mark> `/manager/users/list.json`

Retrieve a simplified user list (ID to name mapping). Useful for dropdowns.

#### Response

```json
{
  "123": { "name": "John Doe" },
  "124": { "name": "Jane Smith" }
}
```

---

## View User

<mark style="color:blue;">`GET`</mark> `/manager/users/view/{id}.json`

Retrieve full user details including login history and company context.

#### Path Parameters

| Parameter | Type | Description |
|-----------|------|-------------|
| id | string | User ID |

#### Response

```json
{
  "user": {
    "User": {
      "id": "123",
      "base_id": "5",
      "user_group_id": "110",
      "active": true,
      "pilot": true,
      "api": false,
      "email_status": "confirmed",
      "email": "john@example.com",
      "expiration": null,
      "user_login_count": "42",
      "created": "2023-01-15",
      "two_factor": "TOTP"
    },
    "UserDetail": {
      "id": "123",
      "name": "John",
      "surname": "Doe",
      "color": "#3498db",
      "photo": "https://...",
      "dob": "1990-05-20",
      "address": "123 Airport Road",
      "city": "Madrid",
      "pc": "28001",
      "phone": "600123456",
      "passport": "AB123456",
      "companyid": "EMP-001",
      "country_id": "195",
      "timezone_id": "85"
    },
    "UserGroup": { "id": "110", "name": "Pilot" },
    "Company": { "name": "Acme Flight School", "id": "42" },
    "UserLogin": [
      {
        "id": "999",
        "user_id": "123",
        "city": "Madrid",
        "country": "Spain",
        "provider": "Chrome",
        "browser": "Chrome 120",
        "ip": "192.168.1.1",
        "modified": "2025-03-10 08:00:00"
      }
    ]
  },
  "mycompany": {
    "Company": {
      "id": "42",
      "name": "Acme Flight School",
      "plan": "premium",
      "type": "flight_school",
      "user_count": "50",
      "expiration": "2026-01-01"
    }
  },
  "languages": { "en": "English", "es": "Español" },
  "bases": { "5": "Madrid Base", "6": "Barcelona Base" }
}
```

`User.two_factor` is the second sign-in step of the user's login: `OFF`, `EMAIL`, `TOTP` (authenticator app) or `PASSKEY`. The authenticator secret is never returned.

---

## Create User

<mark style="color:green;">`POST`</mark> `/manager/users/create.json`

Create a new user account. This is also how pilot and student accounts are created (the NEO **Add Pilot** form and **Import** both post here).

#### Permissions

* Restricted to `user_group_id` ∈ {1, 100, 105, 110, 120} (Company Administrators, Operations Managers, Compliance & Safety Managers and Human Resources Managers). Every other group, including Chief Pilots (`150`), gets `403` `"You are not allowed to create users"`.
* `User.user_group_id` is required and must be between `100` and `300`; it can never be more senior (lower) than the caller's own group.
* On the `free` plan, creating a pilot (`user_group_id` 151–299) is refused with `400` once the company has more than 100 pilots.

#### Request Body

Fields should match the user and user detail structure (email, name, surname, user_group_id, etc.).

#### Response

```json
{
  "success": true,
  "result": true,
  "user_id": "125",
  "message": "User created successfully"
}
```

#### Validation Errors

```json
{
  "success": false,
  "errors": {
    "email": ["This email is already registered"],
    "UserDetail": {
      "country_id": ["Country is required"]
    }
  }
}
```

#### External Auditor accounts (`user_group_id: 250`)

Auditor accounts are always temporary, external, read-only. These rules are enforced server-side on both create and edit — they cannot be bypassed by the client:

* `pilot` is forced to `false`. Auditors never have flying privileges.
* `expiration` is **required** and must be no more than 90 days from the time of the request. Validation errors: `"Auditor accounts must have an expiration date"`, `"Expiration date must be in the future"`, `"Auditor accounts cannot be granted for more than 90 days from today"`.
* Two-factor authentication is forced to `EMAIL` — an auditor's credential can never be switched to `TOTP` or `OFF`, regardless of which endpoint attempts it.

```json
{
  "success": false,
  "errors": {
    "expiration": ["Auditor accounts cannot be granted for more than 90 days from today"]
  }
}
```

---

## Edit User

<mark style="color:green;">`POST`</mark> `/manager/users/edit.json`

Update an existing user account. The same External Auditor account validation described under **Create User** above applies here too.

#### Crew code (`UserDetail.crew_code`)

Both **Create User** and **Edit User** accept `UserDetail.crew_code`, the operator's 3-letter crew code (3LC) printed in the [technical log](aircraft.md#technical-log-day) instead of the person's initials.

* 2 or 3 letters or digits. It is trimmed and stored in upper case (`"pkl"` is saved as `"PKL"`); anything else fails with `"The crew code must be 2 or 3 letters or digits."`.
* An empty string clears it, and the technical log goes back to the initials.
* Only these manager endpoints and [`POST /pilots/edit.json`](pilots.md#edit-pilot) write it. A user can never set their own code from `POST /users/edit.json`.
* Codes are not checked for uniqueness: two people can be given the same code.
* Changes are recorded in the account history under the `crew_code` field.

---

## Delete User

<mark style="color:green;">`POST`</mark> `/manager/users/delete/{id}.json`

Delete a user account. Requires confirmation.

#### Path Parameters

| Parameter | Type | Description |
|-----------|------|-------------|
| id | string | User ID |

#### Request Body

| Field | Type | Required | Description |
|-------|------|----------|-------------|
| confirm | boolean | Yes | Must be `true` to confirm deletion |

---

## Reset Two-Factor to Email

<mark style="color:green;">`POST`</mark> `/manager/users/reset_2fa.json`

Recovery for a user who lost the device holding their authenticator app (or passkey). Switches the user's sign-in back to emailed codes so they can log in and set up a new authenticator from their own profile.

What a reset does:

* Clears the authenticator app from the login and sets `two_factor` to `EMAIL`. The secret is never returned. Registered passkeys are kept, and the user can revoke them from their profile.
* Ends every session of that login on every device, including API sessions. The session making the call is kept.
* Emails the user that their two-factor authentication was reset, and by whom.
* Records `2fa_reset_email` in the user's account history.

The login is shared by every company the email address belongs to, so the reset applies to all of them.

#### Permissions

* Caller: **Company Administrator (100), Operations Manager (105), Compliance & Safety Manager (110), Human Resources Manager (120) or Chief Pilot (150)**. Anyone else gets `403`.
* Target: a user of the caller's own company who does **not outrank** the caller (`user_group_id` greater than or equal to the caller's). Otherwise `403`.
* A manager nobody in their company can reset contacts Flylogs support.

#### Request Body

| Field | Type | Required | Description |
|-------|------|----------|-------------|
| User.id | string | Yes | User ID |

```json
{ "User": { "id": "123" } }
```

#### Response

```json
{ "result": true }
```

| Status | When |
|--------|------|
| 400 | Not a `POST`/`PUT`, or `User.id` missing |
| 403 | Caller's role not allowed, or the target outranks the caller |
| 404 | No such user in the caller's company |

---

## Resend Activation

<mark style="color:green;">`POST`</mark> `/pilots/reminder.json`

Resend the activation/welcome email to a user.

#### Request Body

| Field | Type | Required | Description |
|-------|------|----------|-------------|
| user | string | Yes | User ID |

---

## Billing Pilots

<mark style="color:blue;">`GET`</mark> `/manager/bills/pilots.json`

Retrieve pilot list for billing operations.

#### Response

Same structure as pilot list endpoint.
