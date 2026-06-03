---
cover: >-
  https://images.unsplash.com/photo-1601342630314-8427c38bf5e6?crop=entropy&cs=srgb&fm=jpg&ixid=MnwxOTcwMjR8MHwxfHNlYXJjaHw5fHxjYWxlbmRhcnxlbnwwfHx8fDE2ODMxMDEyNDI&ixlib=rb-4.0.3&q=85
coverY: 0
---

# Flight Schedule Records

Flylogs flight scheduling has been designed to fit precisely the needs of ATO organizations with or without multiple operational bases and multiple aircraft on each location. Schedule records or bookings may be created by the **company manager**, **roster manager**, **aircraft manager** or even directly by your **pilots** or **students**.

**Company Managers** and **Roster Managers** have a full access to al rostering options in all company aircraft. Aircraft managers have full access to the aircraft they manage, including maintenance records, logbooks and schedules.

**Pilot or Student self booking** is available on demand, and requires the company to activate the flight billing functions.

### Schedule Record Lifecycle

1. **Draft:** Unpublished schedule record. Only visible to schedule management users.
2. **Active:** The schedule record is published and visible to crew members.
3. **Confirmed:** The schedule record has been confirmed by the flight crew.
4. **Rejected** The schedule record has been rejected by either one of the flight crew.
5. **Cancelled:** The flight has been cancelled after the schedule was confirmed.
6. **Deleted**

### Schedule Record Information

Each schedule record contains the following information and represents a scheduled flight, 1 flight.

* Published (check box that defines if the schedule record is visible by crew or not).
* Schedule start date and time
* Schedule end date and time
* Aircraft
* Crew: PIC, SIC and Supervisor or third crew member.
* Flight Rules
* Flight Type
* Flight Mission (See [Trainings - Flight training missions](../training-courses/flight-training.md))

### Crew Acceptance Status

Each crew slot (PIC and SIC) on a schedule record carries its own acceptance status, independent of the overall record status.

| Status | Meaning |
|--------|---------|
| **Pending** | The crew member has been assigned but has not yet accepted the flight. |
| **Accepted** | The crew member has accepted (or was automatically accepted at creation). |
| **None** | The slot is empty — no crew member assigned. |

**How the status is set when a record is created:**

* **Self-scheduled flights** (pilot or student booking their own flight): the current user is automatically set as PIC with status **Accepted**. No SIC is assigned (**None**).
* **Flights created by an instructor or Flight Instructor (FI)**: the FI is set as PIC (**Accepted**) and the selected pilot becomes SIC (**None** — SIC acceptance is not required in this case).
* **Flights created by management on behalf of crew**: both PIC and SIC (if assigned) are set to **Pending**. They must accept the flight through the notification they receive.

{% hint style="info" %}
Crew members can accept all their pending flights at once from the **Upcoming Flights** panel on their home page, or individually from the schedule record.
{% endhint %}

### The Schedule record edit form

We have created a fast editing form (see screenshot below) that includes the management of all information related to each schedule record.

The form has a flight data information on the left side, and a supplemental information right side that changes dynamically depending on the aircraft and crew members selected for the flight.

The form has only 5 fields that are mandatory:

1. Flight type
2. Start time (Automatically populated from your click position on the calendar)
3. End time (Automatically populated from your click position on the calendar)
4. Callsign (Automatically populated with the Aircraft registration if left empty)
5. PIC

{% hint style="info" %}
All other fields are optional. Note that additional fields may appear dynamically, like the flight mission, if the PIC or SIC are enrolled in a flight training with pending flight missions.
{% endhint %}

> You can directly choose to publish the new record as you create it if select in the status box "**SCHEDULED**".

<figure><img src="../.gitbook/assets/Screenshot 2026-03-03 at 15.43.52.png" alt="Flight Schedule Record editing form"><figcaption></figcaption></figure>
