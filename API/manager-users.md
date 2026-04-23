# Manager Users

Administrative endpoints for managing user accounts. Requires manager or administrator role.

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
      "created": "2023-01-15"
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

---

## Create User

<mark style="color:green;">`POST`</mark> `/manager/users/create.json`

Create a new user account.

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

---

## Edit User

<mark style="color:green;">`POST`</mark> `/manager/users/edit.json`

Update an existing user account.

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
