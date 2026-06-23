---
description: How aircraft logs work and what each log entry means
---

# Aircraft Logbook

Every aircraft in Flylogs keeps an automatic, read-only audit trail of its cumulative flight hours and landings. This is the **Aircraft Logbook**, made up of individual **aircraft log** entries.

You can find it on the aircraft detail page, under the **Logbook** tab.

### What is an aircraft log entry?

Each aircraft log entry is a snapshot of the aircraft's total flight time and landings at a point in time. Entries are never edited or deleted — they form a permanent history of how the aircraft's total time has progressed.

There are three types of aircraft log entries:

| Type | Created | What it means |
|---|---|---|
| **Setup / Logbook reference** | Manually, when the aircraft is created (or via "Reset aircraft hours") | Establishes the aircraft's baseline hours and landings, e.g. "this aircraft has 1234.5 hours and 567 landings as of today" |
| **Flight** | Automatically, every time a pilot saves a completed flight | Records the flight's block time and landings, and the aircraft's new cumulative totals after that flight |
| **Maintenance** | Automatically, when a maintenance job affects aircraft totals (e.g. an overhaul or component replacement) | Adjusts the aircraft's hours/landings to reflect the maintenance event |

You never create Flight or Maintenance entries by hand — they appear automatically as flights are flown and maintenance is recorded.

### What you see in the Logbook tab

For each row in the logbook table:

* **Date** — when the log entry was created, shown in your company's timezone and date/time format.
* **Flight reference** — for Flight-type entries, a link to the flight (callsign and route, e.g. `ABC123 KJFK → KLAX`). For Setup entries, a "Logbook reference" badge is shown instead.
* **Time** — the flight's block time added by this entry (only for Flight-type entries).
* **Total time** — the aircraft's cumulative flight hours after this entry. This column is always filled in.

Landings and cumulative landings are tracked the same way, alongside hours.

Hovering a row shows extra detail: flight rules (IFR/VFR) and PIC for flights, or the logbook reference timestamp for Setup entries.

### Downloading the logbook

Use the **Download** button on the Logbook tab to export the full logbook as an Excel file, with the same columns as the on-screen table.

### Setting up initial hours

When you [create a new aircraft](create-your-aircraft.md), you enter its current flight time and landings — this becomes the first Setup log entry.

If the aircraft's totals ever need correcting later (for example after a data entry mistake), staff/admin users can use the **Reset aircraft hours** button on the aircraft edit page. This creates a new log entry with the corrected totals; it does not alter or remove previous entries.

### Aircraft log vs. maintenance jobs

The aircraft logbook is not the same as the **Maintenance** tab:

* The **Maintenance** tab tracks actual maintenance work orders/jobs (open, completed, history).
* The **Logbook** tab tracks the resulting changes to the aircraft's cumulative hours and landings.

A completed maintenance job that adds hours (e.g. an engine overhaul) will produce a Maintenance-type entry in the logbook reflecting the aircraft's new totals — but the job itself lives in the Maintenance tab.

### Who can see and create log entries

* **Viewing** the logbook is available to anyone with access to the aircraft.
* **Creating** Setup or Maintenance entries manually (via aircraft creation or "Reset aircraft hours") is restricted to staff/admin roles.
* Flight entries are created automatically for any pilot saving a flight — no special permission needed.
