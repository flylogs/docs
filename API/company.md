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

Retrieve active alerts and notifications for the company dashboard. Returns items expiring within 3 months, sorted by date ascending.

Results vary by role: managers receive all alerts; instructors receive only their own aircraft documents and their students' certificates.

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
    "type": "Aircraft",
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
| `Aircraft` + plane icon | Aircraft document expiration (insurance, airworthiness, registration, W&B, radio, avionics) | Manufacturer + model |
| `Aircraft` + wrench icon | Scheduled maintenance job due | Job name |
| `AircraftUpload` | Uploaded aircraft document expiration | Manufacturer + model |
| `Document` | Company document expiration | Folder name |

#### Alert Classes

| Class | Meaning |
|-------|---------|
| `text-danger` | Expired |
| `text-warning` | Expires within 1 month |
| `text-muted` | Expires within 3 months |
