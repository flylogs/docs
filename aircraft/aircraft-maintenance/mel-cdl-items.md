---
description: Track MEL and CDL items, their rectification deadlines, and their effect on flight dispatch
---

# MEL / CDL items

A **MEL item** (Minimum Equipment List) or **CDL item** (Configuration Deviation List) is an
[aircraft report](aircraft-reports.md) of type **MEL** or **CDL** that carries extra detail: a
regulatory **category**, a computed **rectification deadline**, the person who **released** the
aircraft under that condition, and any **operational limitations** that apply while the item is
open.

Unlike a plain defect report, an open MEL or CDL item is actively checked every time someone
tries to dispatch a flight on that aircraft — see [Dispatch and expiry](#dispatch-and-expiry)
below.

## Categories and rectification intervals

The category sets how long the aircraft may keep flying with the item open. The clock starts at
**midnight, company local time, on the day *after*** the item is raised — the day it is
discovered doesn't count towards the interval.

| Category | Standard interval | Notes |
|----------|-------------------|-------|
| **A** | Rectify before the next flight | Unless the MEL's own Remarks column specifies a different interval — in that case the item can instead be raised against a number of **flights**, **flight days**, or **cycles** |
| **B** | 3 calendar days | |
| **C** | 10 calendar days | |
| **D** | 120 calendar days | |

A **CDL item** does not require a category at all — when raised with no category it never
expires on its own (it simply documents a missing/deviated configuration item).

## Who may raise, edit, extend or close an item

Raising, editing, extending and closing a MEL or CDL item is restricted to:

* **Flylogs Administrator**
* **Company Administrator**
* **Operations Manager**
* **Compliance & Safety Manager**
* **Mechanic**

{% hint style="info" %}
**Raising** a new MEL or CDL item is also open to the **pilot currently assigned to that
aircraft**, even if they don't otherwise hold one of the roles above. That exception applies
only to raising a brand-new item — editing, extending or closing an existing one is restricted
to the five roles listed above.
{% endhint %}

### Who may release the aircraft

Every MEL or CDL item records a **releaser** — the person certifying that the aircraft may be
dispatched under that condition. The releaser can be:

* Any of the five roles listed above (Flylogs Administrator, Company Administrator, Operations
  Manager, Compliance & Safety Manager, Mechanic), or
* The person who is raising the report themselves,

but **never a Student Pilot**, even when a student is the assigned pilot and is otherwise
allowed to raise the report. The releaser picker on the report form only ever lists people who
are actually eligible.

## Dispatch and expiry

Once an item's deadline passes without being rectified or extended, it becomes **EXPIRED**, and
that has two very different consequences depending on what you're doing:

* **Dispatching a flight** — an expired MEL/CDL item is a **hard block**. This applies whether
  you dispatch straight from a schedule or dispatch a flight directly: the dispatch is rejected
  outright, and the message names the ATA chapter and MEL category that is blocking it.
* **Creating or editing a schedule** — an expired item only **warns**. The schedule still saves
  normally; the person saving it sees a toast naming the aircraft, ATA chapter and category, so
  the booking can still be made (and fixed, or reassigned to another aircraft) ahead of time.

An item nearing its deadline (within 3 days of expiry) is flagged as **expiring soon** wherever
it's shown, so it doesn't come as a surprise at dispatch time.

## Extending an item once

A Category **B**, **C** or **D** item can be granted a **one-time extension** — Category A can
never be extended. The extension:

* Can only be used **once** per item — an item that has already been extended cannot be
  extended again.
* Can push the deadline out by **at most the same number of days as the item's original
  interval** (for example, a Category C item — 10 days — can be extended by at most 10 further
  days beyond its original expiry).

Extending an item is restricted to the same five roles listed under
[Who may raise, edit, extend or close an item](#who-may-raise-edit-extend-or-close-an-item).

## Operational limitations

Any MEL or CDL item can carry one or more **operational limitations** — conditions the crew must
respect while the item is open:

* No ETOPS
* No RVSM
* No RNP AR
* No flight into known icing
* No IFR
* No night operations
* Day VFR only
* Maximum altitude
* Maximum passengers
* Maximum speed
* Maximum time above FL100
* Performance penalty
* Other (free text)

Limitations are shown wherever the item itself is shown — the aircraft page, the MEL/CDL list,
and the pre-dispatch window.

## Where open items are visible

Open MEL and CDL items surface in three places:

* The aircraft's own page, in a dedicated **MEL/CDL** panel.
* A dedicated list page, **Aircraft → MEL / CDL Items** (`/maintenance/mel/`), filterable by
  aircraft and category.
* The **pre-dispatch window** when dispatching a flight — shown alongside any upcoming scheduled
  maintenance for that aircraft, so the dispatcher sees everything relevant to airworthiness in
  one place before committing.

## A note on report types

Two report types have been retired: **Observation** and **Restriction** no longer exist as
choices. Existing reports of those types were reclassified automatically — Observation reports
became **Information** reports, and Restriction reports became **Defect** reports. This was a
one-time, automatic reclassification; nothing needs to be redone or checked on existing reports.

{% hint style="info" %}
The generic **Deferred** status and reference field available on any aircraft report (see
[Aircraft reports](aircraft-reports.md#closing-a-report)) is a free-text way to note that a
report is being carried under an MEL/CDL reference. It is independent of, and does not replace,
an actual MEL/CDL item as described on this page — a typed MEL/CDL item is the only one that
computes a rectification deadline and blocks dispatch on expiry.
{% endhint %}

MEL/CDL items are part of the maintenance module and require a **premium** or **unlimited**
subscription plan, the same as aircraft reports generally.
