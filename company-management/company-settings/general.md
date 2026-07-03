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
