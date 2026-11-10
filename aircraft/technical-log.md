---
description: Preflight and post-flight signatures and the numbered daily technical log of each aircraft
---

# Technical log

The technical log brings together what Flylogs already records for an aircraft (flights, aircraft hours, defects, MEL/CDL items and the CRS) on one numbered page per aircraft and day. It adds the two signatures of the pilot-in-command: one before the flight and one after it.

Turn it on in **Settings → Aircraft → Technical log** (Company Administrator, Operations Manager or Compliance & Safety Manager). It is off by default.

### Who can do what

| Action | Who |
|---|---|
| Turn the technical log on or off | Users who can edit company settings |
| Give the preflight signature | The pilot-in-command of the flight only, after the flight is dispatched (also offline) |
| Give the post-flight signature (confirm the flight) | Whoever may confirm flights in your company, as before |
| Release an aircraft after an inspection or a defect rectification (sign the CRS) | Managers, mechanics and the aircraft's named managers, as before |
| Download the technical log PDF | Every active user of the company |

### Preflight signature

Dispatch and the preflight signature are two separate steps:

1. **Dispatch** releases the flight. Whoever dispatches signs the dispatch, as before.
2. **Preflight signature**: once the flight is dispatched, its pilot-in-command opens the flight and presses **Preflight signature**. The window shows the CRS validity (date, hours and hours left), the maintenance due next, and every open defect and MEL/CDL item. By signing, the pilot-in-command accepts the aircraft in that condition.

If your company requires a password to confirm flights, the same password is asked for the preflight signature.

The preflight signature is refused when:

* the flight is not dispatched yet;
* the person signing is not the pilot-in-command;
* the flight already has its preflight signature;
* an MEL/CDL item has expired or the aircraft is grounded (the same checks as dispatch, made again at the moment of signing).

Flylogs keeps a copy of what was accepted (open defects, MEL/CDL items, CRS validity, maintenance due and aircraft hours) with a fingerprint of the signature. The flight history shows the signature.

A flight can still be cancelled at any stage: before dispatch, after dispatch, or after the preflight signature. A signature given before a cancellation stays on record, and the flight appears as *CANCELLED* on the technical log page.

### Without a connection

Flights are logged and confirmed offline as usual. The preflight signature can also be given without signal:

* Flylogs keeps the aircraft status on the device whenever the flight page is opened with a connection. Open the dispatched flight once before going out to the aircraft.
* Without signal, the signing window shows that saved status and the time it was saved. The signature is stored on the device and the flight shows **Preflight signed on this device · waiting to sync**.
* When the device is back online, the signature is sent with the time it was given on the device and what the device showed. Flylogs also records the aircraft's state at that moment. The flight and the technical log mark it as **signed offline**.
* A signature given offline is accepted even if the flight was confirmed or cancelled in the meantime.
* If your company requires a password to confirm flights, the preflight signature can only be given online: the device cannot check the password.

To fly without a device, print the technical log page beforehand, fill it in by hand and enter the flights in Flylogs later. The paper page is the record of that day.

### Post-flight signature

Confirming the flight is the post-flight signature. While the technical log is on, the button reads **Sign and confirm** and the window says so.

### Technical log PDF

Download it from:

* the **flight page**: **Export → Technical log** gives the page of that aircraft for the flight's day;
* the **aircraft page**: the **Technical log** tab lists the aircraft's days with flights or a page number, newest first, with paging. Pick a **Day** to find one in particular. **New empty page** numbers today for this aircraft and downloads it.

The technical log is always **one page** per aircraft and day. It has three tables:

1. **Aircraft and operator**: registration, serial number, make and model, last CRS (with its release reference when there is one) and how long it is valid (date and hours). Below it, the **maintenance statement**: the maintenance due next, by hours, landings or date. The heading carries the company name, address, phone and logo.
2. **Log**: preflight signature, callsign, off-block, on-block, takeoff and landing times, block time, flight time, CRS hours left after the flight, the initials of up to three crew members, and remarks (including the post-flight signature). Ten rows, at least five of them left blank to be filled in by hand; a busier day gets more, shorter rows on the same page.
3. **Open defects and MEL/CDL items**, printed even when there are none: MEL reference and category, ATA chapter, name, operational (O) and maintenance (M) procedures, description, created date, validity date, a release signature/stamp column, and the date and person when the item was closed that day. The rest of the page is filled with blank rows for defects written on paper. If there are more open items than fit, the last row says how many more there are.

Times are shown in the flight timezone and your company's date and time format.

### Techlogs register

**Aircraft → Techlogs** in the menu lists every numbered page of the company, newest number first. It is shown while the technical log is on. Each row shows:
* the page number and date;
* the aircraft (click it to open the aircraft's Technical log tab);
* why the page was numbered: **Flights**, **Defect / MEL** or **Empty page**;
* how many flights it has and how many of them have their preflight signature;
* when and by whom it was numbered.

Filter by aircraft, date range, page number or reason, and download any page as its PDF. On a phone the list shows one card per page.

### Page numbers

Every numbered page is one aircraft and one day. Numbers are consecutive within the whole company (not per aircraft), are never used twice, and follow the date: a later day never has a lower number than an earlier one.

An aircraft-day gets its number:

* **when the aircraft has a flight that day** (planned, dispatched or logged). Flylogs numbers it shortly after the flight is in Flylogs;
* **when a defect or MEL/CDL item is noted** on the aircraft that day, even without flights;
* **on request**, with **New empty page**, for maintenance annotations or a flight you will write on paper. The button is on the aircraft page (Technical log tab, for today) and on a new flight (for the aircraft and date chosen). It asks you to confirm, because a number cannot be taken back.

A day without any of these has no page and no number. Downloading a page never gives it a number by itself, so downloading days in any order does not change the numbers.

Numbers are only given to today, and to yesterday until today has its first number (for flights logged after midnight). A flight entered later for an older day leaves that day's page as *Not numbered*, because numbering it would put it after later days. Days from before the technical log was switched on are *Not numbered* too.

### CAMO / Part-M operators

If your aircraft's continuing airworthiness is managed under Part-M, by a CAMO or your own approved organisation, turn on **CAMO / Part-M operator (M.A.306)** in **Settings → Aircraft**. Then:

* every CRS needs its **release reference** (organisation approval or licence number) before it can be signed;
* each page states *Aircraft technical log — Part-M, M.A.306*;
* a warning appears in Settings if flight files are deleted before 36 months, the period EASA asks technical log records to be kept after the last entry (M.A.306(c)).

The maintenance statement and the release reference are on every technical log page, whether or not this option is on.

### Record keeping

Signatures, page numbers and flight data are never deleted by Flylogs. Files attached to flights follow your **Auto delete flight files** setting (Settings → Flights). Make sure it matches the period your regulations require.
