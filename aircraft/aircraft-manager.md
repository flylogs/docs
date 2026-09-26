---
description: >-
  Give one person full control of one aircraft — its record, maintenance,
  documents and bookings — without opening up the rest of the fleet.
---

# Aircraft manager

Every aircraft can name one **aircraft manager**: the person responsible for that tail. It is set
from the aircraft's edit page, in the **Aircraft Manager** card, and it is stored on the aircraft
itself, not on the user.

The function is deliberately **independent of the user group**. A Captain, a Flight Instructor, a
line Pilot or even a Student Pilot who owns the aeroplane they train in gets the same authority
over *that* aircraft as a Company Administrator has over the whole fleet — and no extra authority
anywhere else. Their user group is unchanged, and the rest of the fleet stays exactly as closed to
them as it was.

The typical use is an operator that **manages aircraft on behalf of third-party owners**: the owner
(or the crew member assigned to that aeroplane) gets a real seat in the system, sees their own
aircraft's hours, next maintenance, expiring certificates and upcoming bookings, and cannot see
anybody else's.

## Setting the manager

1. Open **Aircraft → (the aircraft) → Edit**.
2. Scroll to the **Aircraft Manager** card and pick a pilot.
3. Save.

Only company staff can change this field: groups **1, 100, 105, 110, 150 and 300** (Flylogs
Administrator, Company Administrator, Operations Manager, Compliance & Safety Manager, Chief Pilot,
Mechanic). A manager editing their own aircraft sees the selector read-only — the server drops
`user_id`, `company_id`, `active` and `deleted` from their save, so they cannot hand the aeroplane
to somebody else, move it to another company or retire it.

Leaving the field empty means the aircraft has no manager; only staff act on it.

## What the manager can do

On **the aircraft they are named on** — and only that one:

| Area | What they get |
|------|---------------|
| Aircraft record | The full aircraft page (certificate expiry dates, hours, landings, logbook, documents, fuel and oil tracking) plus **Edit**, and the photo upload / remove actions |
| Mass & Balance | Create and edit the aircraft's Mass & Balance profile |
| Maintenance jobs | Create, edit, duplicate and delete jobs; sign the **Certificate of Release to Service**; link and unlink aircraft reports to a job |
| Aircraft reports | Raise, edit, defer and delete defect reports, and raise, edit, extend and delete **MEL / CDL** items |
| Scheduling | The **Schedule Manager** page opens for them, showing only the aircraft they manage; they create and edit bookings on those tails and set the crew |
| Flights | Open any flight flown on the aircraft, even one they were not crewed on |

The **Aircraft** and **Maintenance** menu entries appear for a manager who would otherwise not see
them at all. Inside those pages, every aircraft selector is narrowed to their own tails — the
"New Job" and "New MEL item" forms will not even offer another registration.

## What stays with company staff

The manager function is an authority over one aeroplane, not a promotion. These stay with the
staff groups:

* Adding, retiring (`active`) or deleting an aircraft, and reordering the fleet
* Changing **who** manages an aircraft
* Company-wide **maintenance plans** and the parts **inventory**
* Deleting somebody else's booking (a manager edits and re-crews bookings on their aircraft, but
  deletion still follows the normal booking-owner rules)
* Everything on every other aircraft in the company

## How it is enforced

Every check is made **on the server, per aircraft**, not merely hidden in the interface. The shared
rule lives in `AircraftManagerPolicy`:

* `canManageAircraft()` — maintenance jobs and aircraft reports: groups 1, 100, 105, 110, 300, **or**
  the aircraft's manager.
* `canEditAircraft()` — the aircraft record, its photo and its Mass & Balance profile: groups 1, 100,
  105, 110, 150, 300, **or** the aircraft's manager.

A request aimed at a tail the caller does not manage is answered with `404 Not Found`, exactly as if
the record did not exist. `Schedules::manager_index` admits a non-staff group only when they manage
at least one aircraft, and then returns a board holding only those aircraft.

{% hint style="info" %}
Maintenance features (jobs, reports, MEL/CDL) also require a plan that includes maintenance. On the
Free plan the maintenance menus do not appear for anyone, manager or not — see
[Account limitations](../company-management/account-limitations.md).
{% endhint %}

## See also

* [Aircraft management](aircraft-basics.md)
* [Account types](../company-management/account-types.md)
* [Aircraft maintenance](aircraft-maintenance/README.md)
* [MEL / CDL items](aircraft-maintenance/mel-cdl-items.md)
