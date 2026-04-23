# Quick Start

Get up and running with the Flylogs API in three steps.

## 1. Get API Access

API access must be activated by the Flylogs team:

1. Contact [Flylogs Support](https://www.flylogs.com/home/contact) to request API activation
2. You need a **Premium** or **Unlimited** account
3. Once activated, use your existing Flylogs user credentials

## 2. Authenticate

Obtain a session token by logging in:

```bash
curl -X POST https://fmc.flylogs.com/v1/login.json \
  -H "Content-Type: application/json" \
  -d '{
    "email": "your@email.com",
    "password": "your-password"
  }'
```

#### Response

```json
{
  "response": {
    "result": true,
    "token": "kub0bmm3immamk6q1brojrq527",
    "user_id": 1234,
    "two_factor": "OFF"
  }
}
```

Save the `token` value — you'll need it for all subsequent requests.

{% hint style="info" %}
**2FA:** If `two_factor` is not `"OFF"`, the server will send a verification code. Make a second login request with the `code` field included.
{% endhint %}

## 3. Make Your First Request

Use the token to fetch your user profile:

```bash
curl https://fmc.flylogs.com/v1/users/view.json \
  -H "Authorization: Bearer kub0bmm3immamk6q1brojrq527"
```

#### Response

```json
{
  "User": {
    "id": "1234",
    "email": "your@email.com",
    "active": true,
    "pilot": true
  },
  "UserDetail": {
    "name": "John",
    "surname": "Doe"
  },
  "UserGroup": {
    "name": "Pilot",
    "id": "110"
  }
}
```

## Common Patterns

### Pagination

List endpoints (flights, pilots) return paginated results:

```bash
# Page 1 of flights
curl https://fmc.flylogs.com/v1/flights/load/page:1/from:/to:/aircraft:/pilot:/base:/flight_type:/.json \
  -H "Authorization: Bearer <token>"
```

Check `paginate.nextPage` in the response to know if more pages exist.

### Filters in URL Path

Many endpoints encode filters in the URL path rather than query parameters:

```
/flights/load/page:1/from:2025-01-01/to:2025-03-31/aircraft:45/pilot:/base:/flight_type:/.json
```

Use empty string for filters you want to skip.

### File Downloads

Export endpoints (XLS, PDF) require the token as a query parameter:

```
https://fmc.flylogs.com/v1/safety_reports/view/150/pdf:true?token=<token>
```

### Error Handling

All errors return a JSON response with a `message` field:

```json
{
  "message": "Unauthorized"
}
```

| Status | Action |
|--------|--------|
| 401 | Token expired or invalid — re-authenticate |
| 403 | Insufficient permissions for this endpoint |
| 429 | Rate limited — reduce request frequency |
