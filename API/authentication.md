# Authentication

## Login

<mark style="color:green;">`POST`</mark> `/login.json`

Authenticate a user and obtain a session token. This must be the first call before using any other endpoint.

**No authentication required.**

#### Request Body

| Field | Type | Required | Description |
|-------|------|----------|-------------|
| email | string | Yes | Email address of an existing user |
| password | string | Yes | User password |
| code | string | No | 2FA verification code (when 2FA is enabled) |

#### Response

```json
{
  "response": {
    "result": true,
    "api": true,
    "two_factor": "OFF",
    "message": null,
    "url": "/users",
    "confirmed": true,
    "user_id": 1234,
    "active": true,
    "token": "kub0bmm3immamk6q1brojrq527"
  }
}
```

#### Response Fields

| Field | Type | Description |
|-------|------|-------------|
| result | boolean | Whether login was successful |
| api | boolean \| string | Whether API access is enabled for this account |
| two_factor | string | 2FA status: `"OFF"`, `"EMAIL"`, or `"TOTP"` |
| message | string \| null | Error message on failure |
| confirmed | boolean | Whether the user's email is confirmed |
| user_id | number | The authenticated user's ID |
| active | boolean | Whether the user account is active |
| token | string | Session token — use in `Authorization: Bearer` header |

{% hint style="info" %}
**2FA Flow:** On the first request, check the `two_factor` field. If it is `"EMAIL"` or `"TOTP"`, the server generates a code and sends it to the user. Make a second login request including the `code` parameter. The response will have `result: true` and `two_factor: "EMAIL"` or `"TOTP"` when both password and 2FA code are correct.
{% endhint %}

#### Error Response (401)

```json
{
  "response": {
    "result": false,
    "message": "Incorrect email or password",
    "url": null
  }
}
```

#### Example

```bash
curl -X POST https://fmc.flylogs.com/v1/login.json \
  -H "Content-Type: application/json" \
  -d '{"email": "pilot@example.com", "password": "secret"}'
```

---

## Logout

<mark style="color:green;">`POST`</mark> `/users/logout.json`

Destroy the current session token.

#### Headers

| Header | Value |
|--------|-------|
| Authorization | Bearer `<token>` |

#### Response

Empty response with status 200 on success.

#### Example

```bash
curl -X POST https://fmc.flylogs.com/v1/users/logout.json \
  -H "Authorization: Bearer <token>"
```

---

## Password Recovery

<mark style="color:green;">`POST`</mark> `/users/password_recover.json`

Request a password reset email. **No authentication required.**

#### Request Body

| Field | Type | Required | Description |
|-------|------|----------|-------------|
| email | string | Yes | Email address of the account |

#### Example

```bash
curl -X POST https://fmc.flylogs.com/v1/users/password_recover.json \
  -H "Content-Type: application/json" \
  -d '{"email": "pilot@example.com"}'
```

---

## Confirm Email

<mark style="color:blue;">`GET`</mark> `/users/confirmation/{userId}/{code}/email.json`

Confirm a user's email address using the verification link sent during registration. **No authentication required.**

#### Path Parameters

| Parameter | Type | Description |
|-----------|------|-------------|
| userId | string | User ID |
| code | string | Confirmation code from the email |

#### Response

```json
{
  "result": true,
  "message": "Email confirmed"
}
```

---

## Reset Password

### Get Reset Context

<mark style="color:blue;">`GET`</mark> `/users/new_password/{userId}/{secretCode}.json`

Validate a password reset link. **No authentication required.**

#### Path Parameters

| Parameter | Type | Description |
|-----------|------|-------------|
| userId | string | User ID |
| secretCode | string | Secret code from the recovery email |

### Submit New Password

<mark style="color:green;">`POST`</mark> `/users/new_password/{userId}/{secretCode}.json`

Submit the new password. **No authentication required.**

#### Request Body

| Field | Type | Required | Description |
|-------|------|----------|-------------|
| password | string | Yes | New password |
| newpassword | string | Yes | Confirm new password |

---

## Token Lifecycle

- Tokens are generated on successful login
- A new login invalidates the previous token
- Tokens expire after **14 days** of inactivity
- Tokens are destroyed on logout
- API sessions can be viewed and terminated via the [User Sessions](users.md#active-sessions) endpoints
