---
description: Classify your operations and control how each flight logs time, pre-fills, and checks crew
---

# Flight Types

**Flight types** classify every flight by purpose (Training, Ferry, Rental, OPC…) and drive a surprising amount of the system: how logbook time is credited to each crew member, what the flight form pre-fills, whether a slot can be booked, and which certificates the crew must hold. Getting them right once means the rest of Flylogs behaves correctly for every flight of that kind.

Each flight type belongs to your company. A starter set is created automatically when you sign up (tailored to your operation — school, commercial, special operations), and you can add, edit, reorder or remove them at any time.

## Where to configure

**Company Settings → Flight Types.** Click **New flight type** to add one, or a row to edit it. Drag rows by the handle to change their order.

## Options

### Name

A short label shown wherever the flight type appears (flight form, schedule, logbook, reports). Keep it brief — it's rendered as a compact badge.

### Color

A colour used for the flight type's badge on the calendar, schedule and lists, so different operations are easy to tell apart at a glance. Pick one manually or let Flylogs derive it from the name.

### Description

Optional free text to remind managers what the type is for. Shown under the name in the flight types list.

### Pilot time classification

The most important setting. For each of the three seats — **PIC**, **SIC** and **Supervisor** — you choose *how the time flown on this flight type is credited to that person's logbook*:

| Value | Credits |
|-------|---------|
| **PIC** | Pilot in Command time |
| **PICUS** | Counts toward the pilot's **PIC** total; also reported separately |
| **SIC** | Second in Command time — **only credited on multi-pilot aircraft** |
| **FI** | Counts toward **PIC and FI** totals; also reported separately |
| **Dual** | Dual instruction received |
| **CRI / IRI / TRI / FIFI / SFI / EXA** | Instructor & examiner roles — count toward **PIC and FI** totals; each also reported separately |
| **Supervisor** | Reported separately only — **not** rolled into PIC or FI |
| **None** | Time is not logged for that seat |

So a **Training** type is typically PIC = *FI* (the instructor logs PIC + FI time) and SIC = *Dual* (the student logs dual received); a **Rental** type is PIC = *PIC*, SIC = *None*.

> **Multi-pilot only:** *SIC* time is credited only when the aircraft is marked multi-pilot. On single-pilot aircraft a seat set to SIC logs no time. (This preserves the behaviour of the retired *Copilot* classification.)

### Default flight condition

Optionally set **VFR** or **IFR** as the type's default. When a crew member picks this flight type on the flight form, the flight's **Rules** field is pre-filled with that value (you can still change it per flight). Leave it empty for no default.

### Visible on scheduling

A toggle that controls whether the flight type appears in the **self-booking / scheduling** flight-type picker. Turn it off for types that should only be used when logging a flight after the fact (e.g. Test or Ferry), and on for the everyday operations crew book themselves onto.

### Order

The position of the type in every flight-type list. Drag rows in the flight types page to set it — put your most-used types at the top.

### Required certificates

Define, **per seat** (PIC / SIC / Supervisor), which certificates a crew member must hold to occupy that seat on this flight type — for example a licence, Class 1 medical and single-engine rating for the PIC, but only a medical for a student SIC. The three seats are independent, and a seat with no requirements imposes none. See [Document & Certificate Requirements](../crew-management/document-and-certificate-requirements.md) for how these are checked across the app.

## How flight types affect the rest of Flylogs

### Flights

* **Classification & reports.** Every flight carries a flight type; it's how flights are grouped and filtered in logbooks, exports and statistics.
* **Logbook time.** The PIC / SIC / Supervisor classifications above decide exactly what time each crew member's logbook receives — and how it rolls up into their PIC / FI totals.
* **Rules pre-fill.** Choosing the type on the flight form sets the flight's VFR/IFR rules from the type's default flight condition.
* **Crew documentation.** Under each selected PIC/SIC on the flight form, a badge names any required certificate that person is missing or expired for that flight type.

### Schedules, dispatch & booking

* **Booking picker.** Only types with **Visible on scheduling** enabled can be chosen when booking a slot.
* **Crew compliance.** When a manager assigns crew in the schedule editor, each crew card shows *Docs OK* or lists exactly which required certificates are missing/expired for that seat, and can block the save. The pre-flight **dispatch briefing** shows the same per-seat checklist. In **self-booking**, a flyer who doesn't meet the type's requirements is always warned, and is stopped from booking only when *Require pilot documentation* is on and *Allow self-booking without valid documents* is off. Validity is evaluated for the scheduled time, so a certificate that expires before the flight ends is flagged.

### Trainings

Training missions reference flight types, tying a syllabus exercise to the flight type (and therefore the time classification) used to fly it.

### Logbooks & reports

Because the time classification is set on the flight type, pilot totals, currency and statistics all derive from it — change a type's classification and future flights of that type log accordingly (past flights are unaffected).

## Deleting a flight type

Deleting is a soft delete: the type is hidden from new flights and schedules but existing flights that already reference it keep their classification and history. The delete dialog tells you how many flights currently use the type before you confirm.
