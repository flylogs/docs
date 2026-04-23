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
    "date_format": "DD-MM-YYYY",
    "time_format": "24",
    "duration_format": "time",
    "aoc": false,
    "extracrew": false,
    "cabincrew": false,
    "max_duty_hours": "14",
    "max_flight_hours_year": "900"
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
| aoc | boolean | Air Operator Certificate holder |
| extracrew | boolean | Extra crew member tracking enabled |
| cabincrew | boolean | Cabin crew tracking enabled |

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

Retrieve active alerts and notifications for the company dashboard (expiring certificates, overdue maintenance, etc.).

#### Response

```json
[
  {
    "type": "certificate",
    "icon": "fa-id-card",
    "class": "text-danger",
    "link": "/pilots/view/123",
    "name": "Medical Certificate - John Doe",
    "date": "2025-03-15",
    "details": "Expires in 5 days"
  },
  {
    "type": "maintenance",
    "icon": "fa-wrench",
    "class": "text-warning",
    "link": "/aircraft/view/45",
    "name": "100h Check - EC-ABC",
    "date": 1710460800,
    "details": "Due in 12 flight hours"
  }
]
```

#### Alert Classes

| Class | Meaning |
|-------|---------|
| `text-danger` | Critical — requires immediate attention |
| `text-warning` | Warning — approaching deadline |
| `text-muted` | Informational |
