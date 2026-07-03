---
description: Logbook protection, flight form options, pre-dispatch gates and flight permissions
---

# Flights

The Flights tab controls how flight records are created, confirmed, edited and protected across your company logbooks.

### Logbook settings

* **Block logbook after** — locks the logbook against changes in the past. Once set, Flylogs **rejects any flight dated earlier than today minus the selected number of days** — both new entries and edits of existing flights. Choose from 1 day up to 1 year, or *Disabled* to allow changes at any date.

  This is your main data-integrity protection: after the window closes, the logbook becomes an immutable historical record for everybody, including managers.

* **Auto delete flight files** — a retention policy for files attached to flights (photos, scans, PDFs). A nightly background job permanently deletes flight attachments older than the selected age (1 month up to 10 years). *Never* keeps everything. Only the attached files are removed — the flight data itself is never touched.

{% hint style="warning" %}
Files removed by the retention policy are deleted permanently and cannot be recovered. Make sure the selected period matches your legal record-keeping requirements before enabling it.
{% endhint %}

### Flight options

* **Pax & cargo fields** — shows or hides the passenger and cargo weight fields on the flight log form and on the schedule review pages. It is enabled automatically for companies registered as AOC operators, and optional for everyone else.
* **Require password to confirm flights** — adds a second validation step: the user must retype their own account password to confirm a flight into the logbook. Recommended for shared office or dispatch computers, where a logged-in session might be used by someone else.

### Pre-dispatch gates

These two switches add mandatory safety steps to the [flight dispatch function](../../schedules/flight-dispatch-function.md). Both are off by default.

* **Require pre-dispatch checklist** — the crew must tick every item on an acknowledgement checklist (weather, NOTAMs, aircraft status, crew documents, SOPs) before the Dispatch button becomes active. The checklist is an acknowledgement only; the ticks are not stored.
* **Require Flight Risk Assessment (FRAT)** — a crew member dispatching their own flight must first complete a FAA-style PAVE questionnaire. The answers produce a risk score and a band (Low / Medium / High). **High-risk flights can only be dispatched by a supervisor.** Results are stored per flight and per crew member for audit. Several questions are pre-answered from the dispatcher's own flight history (recent hours, type familiarity, airports flown, night experience) and live route weather. The requirement only applies when the person dispatching is assigned to the flight. See [Flight Risk Assessment (FRAT)](../../schedules/flight-risk-assessment-frat.md).

### Flight permissions

Flylogs splits flight handling into three independent permissions. For each one, you tick which user types in your company are allowed to perform the action:

* **Who can create flights** — draft a new flight from the Flights page or dispatch a scheduled flight into a draft.
* **Who can confirm flights** — turn a completed draft into a confirmed entry in the logbooks.
* **Who can edit flights** — change values on a confirmed flight or mark it as deleted.

Each permission is granted per user type (Pilot, Captain, Flight Instructor, Chief Pilot, Flight Dispatcher, Student, etc.). A user only sees the matching button when their user type is enabled in the corresponding list.

#### What happens when a permission is missing

| Action | Where the button appears | If your user type is not allowed |
| --- | --- | --- |
| Create flight | Flights page, top-right "Log flight" | Button is hidden |
| Dispatch flight | Schedule modal, "Dispatch flight" | Action is hidden in the dropdown |
| Confirm flight | Flight view, green confirm button | Button is hidden |
| Edit flight | Flight view, edit button | Button is hidden |
| Delete flight | Flight view, delete button | Button is hidden |
| Cancel flight | Flight view, cancel button | Visible only to the crew of an upcoming draft |

#### Rules that always apply

* **Company Administrators, Operations Managers, and Compliance & Safety Managers** can create, confirm, edit, delete and cancel any flight regardless of how the permissions are configured. These staff roles are never restricted by flight permission settings, so they do not appear in the permission lists.
* **Creator and PIC self-edit window** — the user who created the flight, or the pilot listed as PIC, can always edit a confirmed flight for **24 hours** after it was last modified, even if their user type is not in the edit list.
* **Active pilots only** — to create a flight you must be marked as a pilot in your profile and your account must be active. A staff-only user (no pilot flag) above the Crew Scheduling level cannot create flights even if their user type is allowed.
* **Historical and deleted flights** are locked for everybody — no edits, no deletes, no confirmations.

Permission changes take effect immediately for every user, on their next page load.
