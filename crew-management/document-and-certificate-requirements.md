---
description: Store licenses or certificates and get notified before they expire
---

# Document & Certificate Requirements

We are glad to announce the new **Pilot Documentation Control System (PDCS)**, which can be enabled today in any Flylogs account from the Company Settings page.

The **PDCS** allows you to have a better control of pilot documentation and expiration dates.

**This new function also adds a safety barrier that will prevent pilots with expired or missing license or medical certificates from:**

* publishing their flight availability,
* confirming any scheduled flights,
* and logging any flights.<br>

Student pilots will only be required to upload a valid medical certificate in order to publish their schedule and confirm it.

**What the general check requires:** one valid licence, one valid rating and one valid medical. Pilots normally hold several ratings (type rating, IR, SEP, MEP, FI…), and only one of them needs to be valid for this general check to pass — a lapsed rating you no longer use, or one that only becomes effective in a few weeks, no longer blocks the pilot. Whether a *specific* rating is required for a given flight is decided by the flight type's [required certificates](#per-flight-type-certificate-requirements) for each seat, which are checked individually.

The configuration page in the company settings area is fairly simple, just click both checkboxes to fully enable the PDCS and instantly the system will watch your back.

![](https://tawk.link/61f94bae9bd1f31184da67e3/kb/attachments/HlWlsXHOyV.png)

For example; A pilot with an expired license will not be able to publish schedule availability if any of his/her licenses are expired - like shown in the image below.

![](https://tawk.link/61f94bae9bd1f31184da67e3/kb/attachments/D6XoUgqoLn.png)

### Manager warnings

When managers select any pilot to create a schedule record, Flylogs automatically displays on the right side the relevant information for the crew member.

This includes all certificates, ordered by expiration date.



**If any certificates are expired, a visual alert will pop up, and depending on your company settings, it will block the pilot from being scheduled.**

![Pilot expired certificate warning for the Manager Scheduling a flight.](https://tawk.link/61f94bae9bd1f31184da67e3/kb/attachments/-GrEMu89zC.png)

### Per–flight type certificate requirements

Beyond the company-wide PDCS, you can define — **for each flight type** — exactly which certificates a crew member must hold to occupy each seat: **PIC**, **SIC** and **Supervisor**. The three seats are independent, and a seat with no requirements imposes none.

For example, on a school's **Dual** flight type you might require the instructor acting as **PIC** to hold a valid **licence**, **Class 1 medical** and **single-engine rating**, while the student sitting as **SIC** only needs a valid **medical**.

To configure this, open **Company Settings → Flight Types**, edit a flight type, and pick the required certificates under each seat in the *Required certificates* section. The flight types list shows a summary of each type's requirements underneath its row.

Once configured, Flylogs checks each crew member against **their seat's required certificates for the chosen flight type**, evaluating validity at the relevant moment — a check for a future flight reflects whether the certificates will still be valid then, and warns if one expires before the flight ends. These checks surface throughout the crew workflow:

* **Schedule editor** — when a manager assigns a PIC or SIC, the crew card shows *Docs OK* or lists exactly which required certificates that person is **missing or expired** (expired ones are tagged), and blocks the save when your documentation settings require it.
* **Dispatch briefing** — the crew readiness checklist shows, per seat, each required certificate as ok / missing / expired, plus the soonest expiry.
* **Booking a slot** — the booking modal warns when the person flying (or the chosen SIC) doesn't meet the flight type's requirements. It stops the booking only when *Require pilot documentation* is on and *Allow self-booking without valid documents* is off; otherwise the warning is informational and the pilot can book.
* **Flight form** — under each selected PIC/SIC, a badge names any missing required certificate.

A pilot always sees their own status; instructors, dispatchers and managers can see it for the crew they schedule.

> **What counts:** for a flight type, only the certificates you configured as *required* for that seat are checked — so keep those lists up to date. A seat with no configured requirements is always considered ready. The lists are validated against the same certificate catalog used on the pilot's documents page, so requirements always match the document types you actually track.
