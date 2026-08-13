# Company

## Company Settings

<mark style="color:blue;">`GET`</mark> `/companies/settings.json`

Retrieve the full company profile, theme, operational settings, and billing configuration.

#### Response

```json
{
  "Company": {
    "id": "42",
    "name": "Acme Flight School",
    "disabled": false,
    "api": true,
    "plan": "premium",
    "type": "flight_school"
  },
  "CompanyTheme": {
    "logo": "https://...",
    "color": "#3498db",
    "id": "42"
  },
  "CompanyDetail": {
    "id": "42",
    "currency": "EUR",
    "icao": "LEMD",
    "timezone_id": "85",
    "country_id": "195",
    "zip": "28001",
    "Timezone": {
      "id": "85",
      "name": "Europe/Madrid",
      "description": "Central European Time",
      "offset_hours": "1",
      "offset": "+01:00",
      "country_iso": "ES"
    },
    "Country": {
      "name": "Spain",
      "iso2": "ES"
    }
  },
  "CompanySetting": {
    "id": "42",
    "company_id": "42",
    "flight_timezone_id": "90",
    "date_format": "DD-MM-YYYY",
    "time_format": "24",
    "duration_format": "time",
    "aoc": false,
    "extracrew": false,
    "cabincrew": false,
    "max_duty_hours": "14",
    "max_flight_hours_year": "900",
    "FlightTimezone": {
      "id": "90",
      "name": "Atlantic/Canary",
      "description": "Western European Time",
      "offset_hours": "0",
      "offset": "+00:00",
      "country_iso": "ES"
    }
  },
  "CompanyBillingSetting": {
    "id": "42",
    "company_id": "42",
    "enabled": true,
    "billed_person": "PIC",
    "tax": "21",
    "send_notification": true,
    "stripe_public_key": "pk_..."
  }
}
```

#### Key Settings Fields

| Field | Values | Description |
|-------|--------|-------------|
| date_format | `YYYY-MM-DD`, `DD-MM-YYYY`, `MM-DD-YYYY` | Display format for dates |
| time_format | `12`, `24` | 12-hour or 24-hour time |
| duration_format | `decimal`, `time` | Flight time as `1.5` or `1:30` |
| flight_timezone_id | timezone id or `null` | Timezone used **only** for flight times (list, view, form). `null` = use the company timezone (`CompanyDetail.timezone_id`). |
| aoc | boolean | Air Operator Certificate holder |
| extracrew | boolean | Extra crew member tracking enabled |
| cabincrew | boolean | Cabin crew tracking enabled |

{% hint style="info" %}
**Flight timezone.** When `flight_timezone_id` is set, the resolved `CompanySetting.FlightTimezone` object is returned (same shape as `CompanyDetail.Timezone`). Flight wall-clock times (`offblocks_time`, `takeoff_time`, `landing_time`, `onblocks_time`) and the flight `date` in the [Flights API](flights.md) are interpreted and formatted in this zone; when it is `null`/absent, the company timezone is used. Schedules and trainings always use the company timezone.
{% endhint %}

---

## Manager Company Settings

<mark style="color:blue;">`GET`</mark> `/manager/companies/settings.json`

Retrieve company settings from the manager perspective (admin access required).

#### Response

Same structure as `/companies/settings.json` with additional administrative fields.

---

## Operating Hours

<mark style="color:blue;">`GET`</mark> `/manager/companies/operating_hours.json`

The company's opening windows: the recurring weekly rows for every scope (the company default and each base) plus the date overrides between 7 days ago and 365 days ahead. Manager access required — the same ACL permission as `/manager/companies/settings.json`.

Kept out of `/companies/settings.json` on purpose: overrides accumulate indefinitely and that payload is cached client-side on every login.

#### Response

```json
{
  "rows": [
    { "id": "…", "base_id": null, "weekday": "0", "override_date": null, "closed": false, "start_minute": "480", "end_minute": "720" },
    { "id": "…", "base_id": null, "weekday": "0", "override_date": null, "closed": false, "start_minute": "840", "end_minute": "1140" },
    { "id": "…", "base_id": null, "weekday": "6", "override_date": null, "closed": true,  "start_minute": "0",   "end_minute": "0" },
    { "id": "…", "base_id": "17", "weekday": null, "override_date": "2026-12-25", "closed": true, "start_minute": "0", "end_minute": "0" }
  ],
  "bases": [{ "id": "17", "name": "Valencia Airport", "default": "1" }],
  "range": { "from": "2026-08-06", "to": "2027-08-13" }
}
```

#### Row fields

| Field | Description |
|-------|-------------|
| base_id | `null` = company default scope; otherwise the base these hours belong to |
| weekday | `0` = Monday … `6` = Sunday on a recurring row; `null` on a date override |
| override_date | `YYYY-MM-DD` on a date override; `null` on a recurring row |
| closed | `true` = shut that day; the minute fields carry no meaning |
| start_minute / end_minute | Minutes from midnight in company-timezone wall clock, `0`–`1440`, always multiples of 15. `1440` is midnight at end of day |

A window never crosses midnight: an overnight operation is two rows (`1320–1440` on one day, `0–120` on the next).

#### How rows resolve

For a given base and date:

1. A **date override** for that base wins.
2. Otherwise a **company date override** for that date wins — so a company holiday closes every base unless the base overrides the date itself.
3. Otherwise the **weekly** rows apply. Base scope is all-or-nothing: a base with any weekly row of its own owns its whole week, and a weekday it does not define is **closed** there rather than inherited. A base with no rows at all follows the company week entirely.

A day with no resulting windows is closed. A company with no rows at all is treated as open around the clock.

---

## Save Operating Hours

<mark style="color:green;">`POST`</mark> `/manager/companies/save_operating_hours.json`

Replaces the **entire** row set of one scope. The posted rows become the complete truth for that scope, so a window is removed by leaving it out, and posting no rows at all for a base clears its customisation and drops it back to inheriting the company week. Manager access required.

The whole set is validated before anything is deleted, and the replacement runs in a transaction: a rejected save leaves the stored hours untouched.

#### Body Parameters

| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| data[base_id] | string | No | Empty or absent = company default scope. A base id must belong to the calling company, or the request 404s |
| data[rows][n][weekday] | int | Either this or `override_date` | `0` = Monday … `6` = Sunday |
| data[rows][n][override_date] | string | Either this or `weekday` | `YYYY-MM-DD` |
| data[rows][n][closed] | int | Yes | `1` shuts the day, `0` opens it |
| data[rows][n][start_minute] | int | Yes when not closed | `0`–`1440`, multiple of 15 |
| data[rows][n][end_minute] | int | Yes when not closed | `0`–`1440`, multiple of 15, greater than `start_minute` |

#### Response

```json
{ "result": true }
```

On rejection:

```json
{ "result": false, "errors": { "start_minute": ["Times must fall on a 15-minute step"] } }
```

Rejections cover a row that sets both `weekday` and `override_date` (or neither), a closing time at or before its opening time, times off the 15-minute grid, and two windows overlapping on the same day (`{"rows": ["Overlapping windows on 0"]}`).

> **Replaced settings.** These endpoints supersede the old `schedule_self_block_start` / `schedule_self_block_end` fields on company settings, which have been removed. A single start/end pair could not express several windows a day, different hours per weekday, per-base hours or holidays.

---

## Company Permissions

<mark style="color:blue;">`GET`</mark> `/companies/permissions.json`

Retrieve permission flags for the authenticated user within the current company.

#### Response

Returns a flat map of permission keys to boolean values:

```json
{
  "Flight.create": true,
  "Flight.confirm": true,
  "Flight.edit": false,
  "Schedule.create": true,
  "Schedule.edit": true
}
```

Missing keys should be treated as `false`.

---

## Company Alerts

<mark style="color:blue;">`GET`</mark> `/companies/alerts.json`

Retrieve active alerts and notifications for the company dashboard. By default returns items expiring within ~3 months (some sources also look back ~30 days), sorted by date ascending.

Results vary by role: managers (`user_group_id < 150`) receive all alerts; instructors receive only their own aircraft documents and their students' certificates.

#### Query parameters

All parameters are optional. Called with none (the dashboard widget's usage) the endpoint behaves exactly as before.

| Parameter | Type | Description |
|-----------|------|-------------|
| `from` | integer \| string | Lower bound — unix seconds or `YYYY-MM-DD`. When supplied it **overrides** each source's baked window, so the range can reach past 3 months or into history. |
| `to` | integer \| string | Upper bound — unix seconds or `YYYY-MM-DD`. |
| `types` | string | Comma-separated subset of the type values (`Aircraft,Maintenance,AircraftUpload,Document,UserCertificate`). Only the requested sources are queried. Omitted/empty → all types. |
| `user_id` | integer | Narrow to one person's alerts: their pilot certificates plus documents for aircraft they own. Aircraft certificates/maintenance and company documents are excluded. |

**Date-window behaviour (hybrid):** with no `from`/`to`, each source keeps its default window (backward-compatible). Supplying an explicit range lifts the per-source caps and the range fully drives which items return.

**`user_id` access control:** the requested id is clamped to the caller's role-allowed set. Managers may query any company user; non-managers are restricted to themselves and their supervised students — passing another user's id returns no foreign certificates rather than leaking them.

#### Response

Array of alert objects, sorted by `date` ascending.

```json
[
  {
    "type": "UserCertificate",
    "icon": "fa fa-certificate",
    "class": "text-danger",
    "link": "/pilots/view/42",
    "name": "Medical Certificate",
    "date": 1751328000,
    "details": "Jane Smith"
  },
  {
    "type": "Aircraft",
    "icon": "fa fa-plane",
    "class": "text-warning",
    "link": "/aircraft/view/7/EC-ABC",
    "name": "EC-ABC Insurance",
    "date": 1753920000,
    "details": "Airbus H125"
  },
  {
    "type": "Maintenance",
    "icon": "fa fa-wrench",
    "class": "text-muted",
    "link": "/aircraft/view/7/EC-ABC",
    "name": "EC-ABC maintenance",
    "date": 1756598400,
    "details": "100h Check"
  },
  {
    "type": "AircraftUpload",
    "icon": "fa fa-file-pdf",
    "class": "text-muted",
    "link": "/aircraft/view/7/EC-ABC",
    "name": "EC-ABC Weight & Balance",
    "date": 1759276800,
    "details": "Airbus H125"
  },
  {
    "type": "Document",
    "icon": "fa fa-file-pdf",
    "class": "text-muted",
    "link": "/documents/view/d1e2f3...",
    "name": "Operations Manual",
    "date": 1759276800,
    "details": "Compliance"
  }
]
```

#### Fields

| Field | Type | Description |
|-------|------|-------------|
| `type` | string | Alert source — see table below |
| `icon` | string | FontAwesome CSS class |
| `class` | string | Urgency CSS class — see table below |
| `link` | string | Relative URL to the affected resource |
| `name` | string | Short label for the alert |
| `date` | integer | Unix timestamp of the expiration or due date |
| `details` | string | Secondary context (pilot name, aircraft model, folder, job name) |

#### Alert Types

| `type` | Source | `details` content |
|--------|--------|-------------------|
| `UserCertificate` | Pilot certificate expiration | Pilot first + last name |
| `Aircraft` | Aircraft certificate expiration (insurance, airworthiness, registration, W&B, radio, avionics) | Manufacturer + model |
| `Maintenance` | Scheduled maintenance job due | Job name |
| `AircraftUpload` | Uploaded aircraft document expiration | Manufacturer + model |
| `Document` | Company document expiration | Folder name |

> **Note:** Maintenance alerts were previously emitted as `type: "Aircraft"` with a wrench icon. They now use their own `type: "Maintenance"` so they can be filtered independently.

#### Alert Classes

| Class | Meaning |
|-------|---------|
| `text-danger` | Expired |
| `text-warning` | Expires within 1 month |
| `text-muted` | Expires within 3 months |
