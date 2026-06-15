# Flylogs API

The Flylogs API provides programmatic access to your flight operations, crew management, training, safety, and billing data. It follows REST conventions and returns JSON responses.

## Base URL

```
https://fmc.flylogs.com/v1
```

## Authentication

All endpoints (except public ones) require an **API key** as a Bearer token in the `Authorization` header:

```
Authorization: Bearer flk_3pQ8XnX...Zr
```

API keys are long-lived, revocable secrets created by a Company Administrator under **Company Settings → API**. A key authenticates as the user it is bound to and inherits that user's permissions. There is no login step. See [API Keys](api-keys.md) to create one, and [Authentication](authentication.md) for how to send it.

## Request Format

| Method | Content-Type |
|--------|-------------|
| GET | No body — parameters in URL path |
| POST | `application/json` (unless noted as `multipart/form-data`) |

## Response Format

All responses return JSON. Successful responses typically contain the requested data directly. Error responses include a `message` field:

```json
{
  "message": "Descriptive error message"
}
```

## HTTP Status Codes

| Code | Meaning |
|------|---------|
| 200 | Success |
| 400 | Bad request — invalid parameters |
| 401 | Unauthorized — missing or invalid token |
| 403 | Forbidden — insufficient permissions |
| 404 | Resource not found |
| 429 | Rate limited — too many requests |

## Rate Limiting

API usage is throttled. Excessive requests will result in an automatic 14-day ban. Design your integration to cache responses and avoid unnecessary polling.

## Quick Links

| Section | Description |
|---------|-------------|
| [Quick Start](quick-start.md) | Get up and running in minutes |
| [Authentication](authentication.md) | Authenticating requests with an API key |
| [API Keys](api-keys.md) | Creating, listing and revoking API keys |
| [Users](users.md) | User profiles, sessions, account settings |
| [Company](company.md) | Company settings, permissions, organizations |
| [Flights](flights.md) | Flight records, filtering, audit trail |
| [Aircraft](aircraft.md) | Fleet management, logbooks, ADSB tracking |
| [Pilots](pilots.md) | Pilot records, certificates, currency |
| [Schedules](schedules.md) | Flight schedules, availability, calendar |
| [Messages](messages.md) | Internal messaging system |
| [Trainings](trainings.md) | Training courses, students, exams |
| [Safety Reports](safety-reports.md) | SMS reports, risk matrix |
| [Documents](documents.md) | Document library, folders, file uploads |
| [News](news.md) | Company news and announcements |
| [Reports](reports.md) | Flight hours, statistics |
