---
description: Data formats, units and the emergency access switch
---

# General

The General tab defines how dates, times and durations are displayed and entered everywhere in Flylogs, and holds the company-wide login switch.

### Data formatting

These formats apply to **every screen, form, report and export** in the system, for every user of your company. Pilots do not choose their own formats — the company setting always wins.

* **Date format** — choose between `YYYY-MM-DD`, `DD-MM-YYYY` and `MM-DD-YYYY`. Every date shown in the app (schedules, flights, certificates, bills, reports) and every date input follows this pattern.
* **Time format** — 24 hours (`14:30`) or 12 hours with AM/PM (`2:30 PM`).
* **Duration format** — how flight times and duty times are displayed:
  * **Time (HH:MM)** — e.g. `1:30` for one and a half hours.
  * **Decimal (0.00)** — e.g. `1.5` for the same duration. Common in US-style operations and in schools that bill by decimal hours.
* **Start of week** — whether calendars and week views begin on Monday or Sunday.
* **Unit format** — Metric or Imperial. Affects units shown next to weights and distances, for example the passenger and cargo fields on the flight log form.

{% hint style="info" %}
All times in Flylogs are displayed and entered in your **company time zone**, which is set on the Company Preferences page (company profile), not here. The formats on this tab only change *how* values are written, not *which* time zone they are in.
{% endhint %}

### Access control

* **Disable login** — an emergency switch that immediately blocks every **non-manager** user from logging in to your company. Company Administrators and Operations Managers can still log in; pilots, instructors, students, dispatchers and all other user types are locked out and see the company as inactive on the login screen.

Use it when performing internal maintenance, migrating data, or if you need to temporarily restrict access to the system. Turning the switch off restores access instantly.

{% hint style="warning" %}
Users who belong to more than one company are only blocked from **your** company — they can still log in to their other operators.
{% endhint %}

### Training organisation

These fields are printed on the **course completion certificate** so the document reads as issued by your organisation rather than by Flylogs. They are company-wide: one legal entity per Flylogs account. Leave a field empty and that line is simply left off the certificate.

* **Legal name** — the legal entity name printed in the certificate header. Falls back to the company name.
* **Approval type** and **Approval reference** — e.g. `ATO` and `SI.ATO.041`, or your DTO reference. Printed together under the legal name and address.
* **Regulatory basis (default)** — e.g. `Regulation (EU) No 1178/2011, Part-FCL`. Each course can override it from its own settings (see [Edit a training](../../training-courses/edit-a-training.md)).

#### Certificate numbering

Every certificate gets a **unique number** the first time it is downloaded, and keeps that number and its date of issue forever — re-downloading never changes them. The number follows your own scheme:

* **Prefix** — free text substituted for `{prefix}`, e.g. `EGM-`.
* **Number pattern** — built from these tokens: `{prefix}`, `{year}` (year of issue), `{seq}` (running counter) and `{seq:4}` (counter padded to 4 digits — any width works). The pattern must contain a `{seq}` token. Default: `{prefix}{year}-{seq:4}` → `EGM-2026-0001`. If the prefix is empty, the token and the separator after it are dropped, so `{prefix}-{year}-{seq:4}` still gives `2026-0042`.
* **Next number** — the counter value the next certificate will receive. Set it once when you migrate from a paper register; after that it advances by itself. The preview line under the fields shows exactly what the next certificate number will look like.

The address printed on the certificate is the company address from the **Billing information** card on this page, together with the city and country.

**Who can edit this:** Company Administrators and Operations Managers (the same users who can edit the company preferences). Every manager and instructor (`Flight Instructor` and above) can see the list of issued certificates under **Trainings → Certificates**.

