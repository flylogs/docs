---
description: Pilot currency requirements and documentation compliance
---

# Pilots

The Pilots tab defines what your company considers a *current* pilot and how strictly Flylogs enforces pilot documentation.

### Currency requirements

Flylogs tracks three independent currency levels, from most strict (Level 1) to least strict (Level 3). Each level is a rule of the form:

> Within the last **N days**, the pilot must have logged at least **X flight time** and **Y landings**.

For each level you configure:

* **Within last days** — the look-back period (Level 1 must be the shortest, e.g. 30 days; Level 3 the longest, e.g. 365 days).
* **Min flight time** — required block time within the period.
* **Min landings** — required landings within the period.

Flylogs evaluates the three levels continuously against each pilot's logbook and shows the result on the pilot profile and the currency dashboards — separately for **day**, **night** and **IFR** flying. See [Pilot currency checks](../../crew-management/pilot-currency-checks.md) for how pilots and managers read these indicators.

* **Block pilots that do not meet established currency** — turns the currency indicators into a hard gate: pilots who fail your currency requirements are blocked from scheduling and from logging new flights until they regain currency (for example, with an instructor flight).

### Documentation compliance

These switches control how pilot certificates (licence, ratings, medical) affect daily operations. Certificates themselves are managed on each pilot profile — see [Documents & Certificates](../../crew-management/document-and-certificates.md).

* **Allow pilots to edit their certificates** — whether pilots can add and update their own certificates and flight documentation. Disable it if you want only managers to maintain crew records (common in AOC operations where the CAMO/crew office owns the paperwork).
* **Require pilot documentation** — marks documentation as mandatory: pilots with missing or expired documents have limited flight capabilities and both the pilot and the schedulers see prominent warnings.
* **Block pilots without certificates** — the strictest option: pilots without a valid licence, rating and medical cannot be scheduled as PIC nor log flights. Combined with *Require pilot documentation*, scheduling a non-compliant pilot as PIC is rejected outright for non-staff users.

{% hint style="info" %}
The self-booking widget has its own related switch — **Allow self-booking without valid documents** — on the [Schedule tab](schedule.md#self-scheduling). The two act independently: this tab controls scheduling and logging in general, the Schedule tab switch controls only the visibility of self-booking.
{% endhint %}
