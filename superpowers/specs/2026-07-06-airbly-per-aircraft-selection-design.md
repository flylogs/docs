# Airbly Per-Aircraft Selection

**Date:** 2026-07-06  
**Status:** Approved

## Overview

Add per-aircraft control to the Airbly integration. Managers can choose which of their aircraft participate in automated flight imports. When the integration is first enabled all active aircraft are enrolled by default; the manager can then narrow the selection.

## Database

Table `airbly_aircraft` already created in production.

```sql
CREATE TABLE airbly_aircraft (
  id          int(11) unsigned NOT NULL AUTO_INCREMENT,
  company_id  char(36) NOT NULL,
  aircraft_id int(11) unsigned NOT NULL,
  created     int(11) unsigned NOT NULL,
  modified    int(11) unsigned NOT NULL,
  PRIMARY KEY (id),
  UNIQUE KEY uq (company_id, aircraft_id)
);
```

"All aircraft ON" is a **computed** state: the set of IDs in `airbly_aircraft` covers every active non-deleted aircraft for the company. No extra boolean column is needed.

## Backend

### New model: `AirblyAircraft`

Thin CakePHP model over `airbly_aircraft`. `belongsTo` Aircraft and Company. No extra validation beyond the unique key the DB enforces.

### `AirblyImport::resolveAircraft()` (already updated: no auto-create, active-only)

Add a third check after matching by registration+active+deleted: verify the resolved `aircraft_id` has a row in `airbly_aircraft` for the company. If not, return null and log as before.

### `CompaniesController` — settings save hook

When `airbly_enabled` is saved as `true` and was previously falsy, bulk-insert all active non-deleted company aircraft into `airbly_aircraft` using INSERT IGNORE (safe to re-run; skips rows already present).

### `CompaniesController` — two new endpoints

**`GET /manager/companies/airbly_aircraft.json`**  
Returns all company aircraft (active and inactive, non-deleted) with an `airbly_enabled` boolean per row derived from a LEFT JOIN against `airbly_aircraft`.

```json
{
  "aircraft": [
    { "id": 12, "registration": "EC-ABC", "model": "C172", "active": true,  "airbly_enabled": true },
    { "id": 17, "registration": "EC-XYZ", "model": "PA28", "active": false, "airbly_enabled": false }
  ]
}
```

**`POST /manager/companies/airbly_aircraft.json`**  
Accepts `{ "aircraft_ids": [12, 34] }`. Replaces the company's rows in `airbly_aircraft` atomically: DELETE existing rows for company, then INSERT new set. Wrapped in a transaction. Returns `{ "success": true }`.

Both endpoints are manager-only (same auth gate as other settings endpoints).

## Frontend (`TabIntegrations` in `SettingsPage.tsx`)

### Data loading

On tab mount, fetch `GET /manager/companies/airbly_aircraft.json` alongside the existing settings call. Store result in local state: `aircraftRows: AirblyAircraftRow[]`.

### "All aircraft" toggle

Rendered below the existing Airbly key/sync block when the integration is enabled (`airbly_enabled = true`).

**Computed ON** when every aircraft where `active === true` in `aircraftRows` also has `airbly_enabled === true`.

**Toggle ON action:** POST immediately with all active aircraft IDs. Update local state optimistically.

**Toggle OFF action:** expand the per-aircraft list (no POST). The list reflects current `aircraftRows` state.

### Per-aircraft list (visible when not all-on)

- One row per aircraft: registration (bold) + model, a toggle switch on the right.
- Aircraft with `active === false`: row is greyed out, toggle disabled.
- Info banner above the list:  
  _"Inactive aircraft are shown but cannot be imported. Activate the aircraft in Aircraft settings first."_
- **"Save selection"** button at the bottom. On click, POST with the IDs of rows where `airbly_enabled === true` and `active === true`. Disables during request, shows spinner.

### Error handling

- If the GET fails, show a small inline error in place of the aircraft section; do not block the rest of the settings tab.
- If the POST fails, show an inline error near the Save button; keep local state so the manager can retry.

## Behaviour notes

- New aircraft added to the fleet after the integration is enabled are **not** automatically enrolled. The manager must open the Integrations tab and add them (or turn "All aircraft" ON again, which re-POSTs the full active list).
- Inactive aircraft rows are visible so the manager has full visibility but cannot be toggled on; this is intentional to avoid importing from grounded aircraft.
- The import cron (`AirblyImport::resolveAircraft`) is the enforcement point — it checks `airbly_aircraft` on every run, so changes take effect on the next 15-minute sync without any cron restart.
