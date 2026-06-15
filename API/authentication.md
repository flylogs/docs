# Authentication

The Flylogs API authenticates with **API keys**. An API key is a long-lived secret, created by a Company Administrator, that you send on every request. There is **no login step** for API access — you do not exchange an email and password for a token.

```
Authorization: Bearer flk_3pQ8XnX...Zr
```

```bash
curl https://fmc.flylogs.com/v1/users/view.json \
  -H "Authorization: Bearer flk_3pQ8XnX...Zr"
```

A key authenticates **as the user it is bound to** and inherits that user's permissions. It remains valid until it is revoked, or until its optional expiry date passes — it is not affected by inactivity or logout.

{% hint style="info" %}
Don't have a key yet? See **[API Keys](api-keys.md)** for how a Company Administrator creates, lists and revokes them under **Company Settings → API**.
{% endhint %}

## Authenticating a request

| | |
|---|---|
| Header | `Authorization: Bearer <api-key>` |
| Key format | Begins with `flk_` |
| Lifetime | Until revoked, or the optional expiry date |
| Permissions | Inherited from the user the key is bound to |

For file-download endpoints that open in a new window (XLS, PDF), the key may also be supplied as a `?token=` query parameter:

```
https://fmc.flylogs.com/v1/safety_reports/view/150/pdf:true?token=<api-key>
```

## Error responses

| Status | Meaning |
|--------|---------|
| 401 | API key missing, invalid, expired or revoked |
| 403 | The bound user lacks permission for this endpoint |
| 429 | Rate limited — reduce request frequency |

```json
{
  "message": "Invalid, expired or revoked API key"
}
```

---

## Account management endpoints

The endpoints below relate to **interactive user accounts** in the Flylogs app, not to API-key authentication. They are documented here for completeness; a typical server-to-server integration does not need them.

### Password Recovery

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

### Confirm Email

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

### Reset Password

#### Get Reset Context

<mark style="color:blue;">`GET`</mark> `/users/new_password/{userId}/{secretCode}.json`

Validate a password reset link. **No authentication required.**

| Parameter | Type | Description |
|-----------|------|-------------|
| userId | string | User ID |
| secretCode | string | Secret code from the recovery email |

#### Submit New Password

<mark style="color:green;">`POST`</mark> `/users/new_password/{userId}/{secretCode}.json`

Submit the new password. **No authentication required.**

| Field | Type | Required | Description |
|-------|------|----------|-------------|
| password | string | Yes | New password |
| newpassword | string | Yes | Confirm new password |
