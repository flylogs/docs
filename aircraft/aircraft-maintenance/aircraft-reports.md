---
description: Record aircraft defects and observations, and group them into maintenance jobs
---

# Aircraft reports

An **aircraft report** records something about the state of an aircraft: a defect, an
observation, a servicing action, an operating restriction. Pilots file them at the end
of a flight, or at any time from **Aircraft → Reports**, and every report carries the
severity, the ATA chapter, the dispatch condition and whether the aircraft is left
**flyable** or **grounded**.

Filing a report notifies the company's managers and maintenance staff by message.

## Reports and maintenance jobs

Not every defect grounds the aircraft. A blown navigation light is not required for
VFR flight; an inoperative ADF is not required unless you are navigating on
instruments. Reports like these pile up while the aircraft keeps flying and get fixed
together at the next scheduled visit.

Flylogs supports exactly that: **one maintenance job can clear several aircraft
reports**. A report belongs to at most one job, a job can hold as many reports as you
like, and each of those reports can be worked through as many work orders as the job
needs.

When the job's **CRS** is signed, **every report attached to it is closed
automatically**, with the date and the signing user recorded.

### Three ways to group reports

**From the report** — open the report and choose:

* **Open maintenance job** to create a new job for it, or
* **Add to existing job** to attach it to a job already open for that aircraft.

**From the report list** — tick the reports you want (Aircraft → Reports), then use
**New maintenance job** or **Add to existing job** in the bar that appears. The
selection is confined to a single aircraft: a maintenance job belongs to one airframe,
so picking a report from a different aircraft starts a fresh selection.

**From the job** — open the maintenance job and use **Add reports** in the *Aircraft
Reports* card. The picker lists only open or deferred reports of that aircraft that
are not yet on another job.

To take a report back out, use **Detach from job** — either on the report itself or on
the row in the job's *Aircraft Reports* card. The report stays open and can be grouped
somewhere else.

{% hint style="info" %}
Attaching and detaching are only possible **before the CRS is signed**. Once a job is
signed, its certificate covers a fixed set of reports and the list is frozen.
{% endhint %}

## Closing a report

A report can be closed in two ways:

* **Automatically**, when the maintenance job it is attached to has its CRS signed.
* **Manually**, with the **Close report** button on the report. Use **Reopen** if it
  was closed by mistake.

You never fill in a closing date. Flylogs records who closed the report and when, from
the action itself. Reopening a report clears that record.

Reports that are still outstanding can also be parked as **Deferred**, with a
reference (MEL / CDL number) and a deferral date, while the aircraft keeps operating
under that condition.

## Who can do what

| Action | Who |
|--------|-----|
| File a report, view reports | Any user of a company on a **premium** or **unlimited** plan |
| Close / reopen a report, edit management fields | `user_group_id` below 120, or 300 — administrators, managers and maintenance staff |
| Attach / detach reports to a maintenance job | `user_group_id` 1, 100, 105, 110 or 300, or the user the aircraft is assigned to |

Aircraft reports are part of the maintenance module and require a **premium** or
**unlimited** subscription plan.
