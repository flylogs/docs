# Schedule Edit page (Schedule Manager)

The **Schedule Manager** is the main working view for building and editing your flight schedule. It shows a calendar of every aircraft and lets you create, move, edit and delete schedule records (bookings) directly on the grid.

This page is reserved for **schedule management roles** — Company Managers, Roster Managers and Aircraft Managers. Members with a Flight Instructor rank (or pilots, depending on your company settings) may see the calendar in a **Read‑only** mode, where flights are visible but cannot be created or edited. Members without any schedule access are blocked from the page.

{% hint style="info" %}
All times on this page are shown in your **company time zone**, displayed in the page header.
{% endhint %}

### The calendar grid

Aircraft are listed down the left side; time runs across the top. Each schedule record appears as a coloured block on its aircraft row.

* **Views** — Switch between **Day**, **Week** and **Month** from the buttons in the top‑right of the calendar. Your browser remembers the last view you used. On large fleets the day view automatically uses the timeline layout.
* **Now indicator & navigation** — A line marks the current time. Use **today / prev / next** to move through dates, or click a day heading to jump to it.
* **Business hours shading** — Daylight hours for the base airport (sunrise to sunset) are highlighted so night operations are easy to spot.
* **Maintenance blocks** — Open maintenance jobs appear as striped 🔧 background bands on the affected aircraft, and the slot cannot be booked over them.
* **Colour legend** — A legend below the calendar maps the left‑border colour of each block to its status (Draft, Scheduled, Confirmed, Delay, Departed, Landed, Canceled, Dispatched). A 🛣️ road icon marks local / touch‑and‑go training missions.

### Creating a flight

Click and drag on an aircraft row to select a time slot. The **New Flight** form opens with the date, start and end times, aircraft and callsign pre‑filled from your selection. See [The schedule record edit form](#the-schedule-record-edit-form) below.

### Editing, moving and resizing

* **Click** a block to open the edit form.
* **Drag** a block to a new time or a different aircraft row.
* **Resize** the edges of a block to change its start or end time.

When you move, resize or edit a flight that is **not a Draft** (i.e. already published to crew), a confirmation prompt appears first. For moves and resizes you can tick **Notify crew** so the affected pilots are alerted to the change. Overlapping bookings on the same aircraft are not allowed.

### Base filter

If your company has more than one operational base, a **base selector** appears in the header. Choosing a base limits the calendar to that base's aircraft and loads that base's airport (sunrise/sunset and METAR for kiosk mode). Choose **All bases** to see the whole fleet.

### On‑duty pilots strip

Managers also see an **on‑duty pilots** strip above the calendar, summarising which crew are on duty for the dates currently in view. It follows the base filter and the visible date range.

## The schedule record edit form

The edit form has the flight data on the left and dynamic, supplemental information on the right. For the full list of fields and the schedule record lifecycle, see [Flight Schedule Records](flight-schedule-records.md).

Only five fields are mandatory: **Aircraft**, **Callsign**, **Flight Type**, **Offblocks** (start) and **Onblocks** (end). The callsign defaults to the aircraft registration if left empty.

### Crew panels (PIC / SIC)

Each crew slot has a searchable pilot selector grouped by user group. As you pick a pilot, a side panel shows live context:

* Pilot group, phone and **last flight** date.
* **Certificates / documents** with expiry dates — expired items show in red, and a clear "Missing/expired required docs" warning appears if the pilot is not document‑valid for the flight.
* **Availability dots** — pilots already busy in the selected time window are flagged, helping you avoid double‑booking.

If the selected aircraft is **multi‑pilot**, an SIC is required. The same pilot cannot be assigned as both PIC and SIC.

### Training missions

If a selected PIC or SIC is enrolled in a flight training with pending missions, a **Training Mission** selector appears and the next uncompleted mission is auto‑selected (skipping missions already scheduled elsewhere). If the mission's flight type differs from the schedule's flight type, you are prompted on save to either switch to the mission's flight type or keep the current one.

### Status, supervisor and notes

The right column carries:

* **Status** — Draft, Scheduled or Canceled. Leave as **Draft** to keep the record private to managers, or set **Scheduled** to publish it to crew on save. See [Publishing multiple schedule records](publishing-multiple-schedule-records.md).
* **Supervisor / Examiner / Specialist** — a third crew slot, labelled to match your company type.
* **Notes** — free text for the crew.
* **Notify crew** — for non‑Draft records, tick to email the assigned crew when you save.

### Validation and warnings

Before saving, the form runs duty and safety checks and shows warnings for:

* Flight duration over the maximum.
* Daily / monthly flight‑time limits exceeded.
* Daily duty time exceeded and minimum rest (between days and between flights) not met.

If your company has **block overtime scheduling** enabled, these violations **block saving** until resolved; otherwise they are advisory. A separate, always‑blocking check stops you assigning a pilot to an **aircraft or flight type they are not entitled to** fly.

## Actions menu

The green **Actions** menu (top‑right) gives bulk and utility tools. The first group is available to **top‑level managers** only:

* **Publish schedule** — email/notify pilots for a range of records at once (see [Publishing multiple schedule records](publishing-multiple-schedule-records.md)).
* **Copy week** — duplicate a whole week's schedule to another week.
* **Clear week** — delete a week's records in one step.
* **Auto‑pilot** — auto‑assign crew across the fleet.

Available to anyone who can edit:

* **Kiosk mode** — a full‑screen, auto‑refreshing display of the calendar for ops‑room screens, showing the base name and live **METAR**. It refreshes every couple of minutes and re‑centres on the current time.
* **Print PDF** — export the current calendar view to a PDF named by date.
