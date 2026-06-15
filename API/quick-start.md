# Quick Start

Get up and running with the Flylogs API in three steps.

## 1. Get API Access

API access must be activated by the Flylogs team:

1. Contact [Flylogs Support](https://www.flylogs.com/home/contact) to request API activation
2. You need a **Premium** or **Unlimited** account
3. Once activated, a Company Administrator can create API keys (see next step)

## 2. Create an API Key

Integrations authenticate with an **API key** — a long-lived secret you send on every request. There is no login step.

A Company Administrator creates one in the Flylogs app under **Company Settings → API → API keys → New key**:

1. Give the key a **name** (e.g. `Ops dashboard`).
2. Choose the **user** the key acts as — the key inherits that user's permissions. Use a dedicated, least-privilege user where possible.
3. Optionally set an **expiry** date. Leave it empty for a key that never expires.

The full key (starting with `flk_`) is shown **once** on creation. Copy it immediately — it cannot be displayed again.

{% hint style="info" %}
Also add your server's IP address under **Company Settings → API → Api Ip Whitelist** if your company requires it for API access.
{% endhint %}

See [API Keys](api-keys.md) for full details on managing keys.

## 3. Make Your First Request

Send the key as a Bearer token to fetch your user profile:

```bash
curl https://fmc.flylogs.com/v1/users/view.json \
  -H "Authorization: Bearer flk_3pQ8XnX...Zr"
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
  -H "Authorization: Bearer <api-key>"
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
https://fmc.flylogs.com/v1/safety_reports/view/150/pdf:true?token=<api-key>
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
| 401 | API key missing, invalid, expired or revoked |
| 403 | Insufficient permissions for this endpoint |
| 429 | Rate limited — reduce request frequency |
