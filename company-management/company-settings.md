---
description: Setup Flylogs behavior and flight data storage characteristics
---

# Company Settings

Flylogs allows you to customize how your data is managed and what limits you want to enforce within your organization.

**Among the all the options, you can:**

* enable and disable Flylogs features,&#x20;
* manage flight permissions for each user type,&#x20;
* block logbook changes in the past,
* change flight document retention policies and
* customize pilot duty time limitations.

You can customize all this settings from your Company Settings page.

<figure><img src="../.gitbook/assets/Screenshot 2023-04-13 at 13.23.10.png" alt=""><figcaption><p>Edit flight data modification permissions for each user type.</p></figcaption></figure>

You can customize which profiles can create flights, confirm them or edit and delete them once they are on the logbooks.

Additionally, to enhance the security in shared office computers, the last checkbox "**Require user Password to confirm flights into logbooks**" enables a second validation step by asking for the user´s password in order to confirm the flights.

### Flight permissions

Flylogs splits flight handling into three independent permissions. For each one, you decide which user types in your company are allowed to perform the action:

* **Create flights** — draft a new flight from the Flights page or dispatch a scheduled flight into a draft.
* **Confirm flights** — turn a completed draft into a confirmed entry in the logbooks.
* **Edit & delete flights** — change values on a confirmed flight or mark it as deleted.

Each permission is granted per user type (Pilot, Captain, Flight Instructor, Chief Pilot, Flight Dispatcher, etc.). A user only sees the matching button once their user type is enabled in the corresponding list.

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

* **Company Administrators, Operations Managers, and Compliance & Safety Managers** can create, confirm, edit, delete and cancel any flight regardless of how the permissions are configured. These roles are never restricted by flight permission settings.
* **Creator and PIC self-edit window** — the user who created the flight, or the pilot listed as PIC, can always edit a confirmed flight for **24 hours** after it was last modified, even if their user type is not in the edit list.
* **Active pilots only** — to create a flight you must be marked as a pilot in your profile and your account must be active. A staff-only user (no pilot flag) above the Crew Scheduling level cannot create flights even if their user type is allowed.
* **Historical and deleted flights** are locked for everybody — no edits, no deletes, no confirmations.

Permission changes take effect immediately for every user, on their next page load. There is no need to log out and back in.

#### Pre-dispatch gates

Under **Company Settings → Flights → Pre-dispatch gates** you can require crew to complete one or both safety steps before dispatching a flight. Both are off by default and require a Club, Premium or Unlimited plan.

* **Require pre-dispatch checklist** (`schedule_dispatch_checklist`) — shows an acknowledgement checklist (weather, NOTAMs, aircraft status, crew documents, SOPs) that must be fully ticked before the Dispatch button is enabled. The checklist is not stored.
* **Require Flight Risk Assessment (FRAT)** (`schedule_dispatch_frat`) — a crew member dispatching their own flight must complete a FAA-style PAVE FRAT questionnaire. The answers produce a risk score and band (Low / Medium / High); **High-risk flights can only be dispatched by a Supervisor**. The result is stored per flight and per crew member. Several questions are pre-answered from the dispatcher's flight history (recent hours, type familiarity, airports flown, night experience) and the live route weather. The requirement applies only when the person dispatching is assigned to the flight.



### Pilot flight duty time limitations

Flylogs can be a great help to track flight time and duty time limitations. <br>

Flylogs scheduling tool will alert your roster manager when creating the flight schedule if any slot does not comply with your legal requirements.

On top of that, our servers run daily background checks on all the flight time stored in our database and triggers alarms if any of your setup limits are reached.

![](../.gitbook/assets/dutyTimeconfigbox.png)
