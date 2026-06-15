# New: Flight Risk Assessment (FRAT) at dispatch

**June 2026** · Schedules & Dispatch

We've added a **Flight Risk Assessment Tool (FRAT)** to flight dispatch. When a crew member dispatches their own flight, Flylogs can now require a short, structured go/no-go assessment based on the FAA Safety Team **PAVE** model — **P**ilot, **A**ircraft, en**V**ironment, **E**xternal pressures — turning the decision to fly into a deliberate, recorded one.

***

### Why we built it

A go/no-go call made in someone's head leaves no trace and is easy to rationalise away under pressure. The FRAT puts the same decision on the record: every risk factor is scored, the total drops into a clear risk band, and high-risk flights can't be quietly waved through. Safety officers get a repeatable assessment they can review after the fact, not a verbal "looked fine to me."

***

### How it works

* **Risk score and bands.** Each answer carries a weight. As the crew member answers, the weights sum into a live **Risk score** with a colour-coded band:
  * **Low** (green) — 10 or less — proceed.
  * **Medium** (amber) — 11–20 — review and mitigate before flying.
  * **High** (red) — more than 20 — a **Supervisor** must dispatch.
* **High-risk flights are blocked for ordinary crew.** If the assessment lands High, the PIC or SIC cannot dispatch — a Supervisor completes and dispatches instead.
* **Less typing, better data.** Objective questions are pre-answered from the dispatcher's own flight history and live route weather: hours in the last 90 days, familiarity with the aircraft type, unfamiliar airports, night flying, and the METAR/TAF flight category. Every pre-fill is just a suggestion — the crew member can change any answer.
* **Recorded per crew member.** On dispatch the score, band and answers are stored against the flight, one assessment per person who completes one.

***

### Where it fits

The FRAT shows in the **dispatch confirmation** on the schedule view, directly under the optional **pre-dispatch checklist**. It's required only when the person dispatching is a crew member of that flight (PIC, SIC or Supervisor) — operations staff who aren't assigned to the flight dispatch as before.

***

### Turning it on

Both pre-dispatch gates are **optional** and **off by default**. A Company Administrator enables them under **Company Settings → Flights → Pre-dispatch gates**. You can turn on the checklist, the FRAT, or both. The feature is available on the **Club, Premium and Unlimited** plans.

***

Read the full guide: [Flight Risk Assessment (FRAT)](../schedules/flight-risk-assessment-frat.md) · [Flight Dispatch Function](../schedules/flight-dispatch-function.md).
