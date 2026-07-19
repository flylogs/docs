---
description: Receive reports directly from any crew member
cover: >-
  https://images.unsplash.com/photo-1478272798175-3e553cc43e67?crop=entropy&cs=tinysrgb&fm=jpg&ixid=MnwxOTcwMjR8MHwxfHNlYXJjaHwxfHxmYXN0ZW4lMjBzZWF0YmVsdHN8ZW58MHx8fHwxNjc0Nzc0NjQ3&ixlib=rb-4.0.3&q=80
coverY: 0
---

# Safety Reports

Flylogs SMS, is an integrated Safety Management System based on the [ICAO recommendations](https://www.unitingaviation.com/publications/safetymanagementimplementation/content/#/) fully compliant with the [ICAO Doc 9859](https://www.icao.int/safety/safetymanagement/pages/guidancematerial.aspx). It allows to receive safety events directly in your Flylogs account linked with all the relevant information like flight crew, aircraft, maintenance, flight crew, trainings, duty times, etc.

**Any member** of your organization **has the ability to** access the Safety Reporting System and **create a new report.**

These reports can be specifically related to a flight, or not, allowing any of your users to inform about more other types of risks.<br>

The safety manager and other company managers can see the whole list of events and access to the statistics.\
They can also request third parties to complete a report on an existing event, giving you more information of the a single event.

Related events will appear grouped together and will share some common details like date, location, type of event, etc.

![](https://tawk.link/61f94bae9bd1f31184da67e3/kb/attachments/cYPNBm9ROy.png)

***

### Flight safety reports

Each report can be associated to a flight. If it is, the flight information will be displayed on the top part of the report, along with the crew names and user types.

All other report information is displayed below and only the safety manager or other, higher level managers can edit or delete the stored information.

![](https://tawk.link/61f94bae9bd1f31184da67e3/kb/attachments/J6eXYFldiB.png)

Additionally, the person writing the report or any manager can comment on the report and upload files as needed that will be attached to the existing report.



### Report classification (Occurrence vs Information)

When creating a report, the reporter first chooses its **classification**, following the ICAO Annex 19 distinction between safety occurrences and safety information:

* **Safety Occurrence** — *"Something happened."* A specific event or condition that has happened (or could happen) and affects aviation safety. These are the events reported, investigated and analysed under an SMS/SSP — accidents, serious incidents, incidents, and hazards that materialised. Examples: aircraft damage, runway incursion, bird strike, fuel contamination, incorrect maintenance, fatigue-related error, ATC communication error, near mid-air collision.
* **Safety Information** — *"Everything that helps us understand safety."* Data or knowledge used to improve aviation safety, broader than a single event. It may or may not describe a specific occurrence. Examples: Flight Data Monitoring (FDM/FOQA), LOSA observations, safety audits and inspections, safety surveys, risk assessments, safety performance indicators, manufacturer bulletins, airworthiness directives, regulatory findings.

The selector shows this guidance inline so the reporter chooses the right classification. It defaults to **Safety Occurrence**, and the chosen classification is shown as a badge on the report.

The classification determines the report's **severity**:

* **Safety Occurrence** → the severity is **Incident** or **Accident**, derived automatically from the damages and injuries recorded (an occurrence is at least an incident; important/catastrophic damage or serious injuries make it an accident).
* **Safety Information** → the reporter chooses between **General Information** and **Hazard**. Pick *Hazard* for a condition with the potential to cause harm that has not yet resulted in an event.

This is why the old "Information" and "Hazard" severities now live under **Safety Information**, while "Incident" and "Accident" live under **Safety Occurrence** — the severity list a manager sees when editing a report is filtered to match its classification.

### Report status

A report has 5 possible status in which can be.

* **New.** Default status when the report is created.
* Reviewed. Initial review performed, waiting for more details or further processing.
* **Closed.** Report is closed and no further actions are expected.
* Deleted. Useful for test reports.
* **Published.** The report is closed and published to all members in the organization.

#### Published Reports

Published SMS reports are public to all members of your organization. This enables that every body learns from the findings of a report, which is the final goal of the Safety System.

All members can see all published reports, and a summary of them are also available on the aircraft page. Each aicraft, has a summary of SMS reports in which it has been involved.

***

### Departments

Reports can be assigned to a **department** within your organisation (e.g. Flight Operations, Maintenance, Cabin Crew). This allows safety managers to filter and group events by area of responsibility.

Departments are configured at company level. Once configured, a department selector appears at the top of the report creation and editing forms, and the selected department is shown in the report list, the report detail view, and the printed PDF.

The **Analytics** page includes a dedicated **Reports by Department** chart and a department filter so you can focus the statistics on a specific area.

### Filtering reports

The report list supports filters to help you find specific events quickly. Available filters depend on your role.

**All users**

* **Date range** — from / to

**Managers and Safety Officers** (`user_group_id < 150`) **only**

* **Status** — Open, Reviewed, Closed, Published
* **Category** — event classification category
* **Severity** — Information, Incident, Accident, Hazard
* **Department** — filter by organisational department

Filters can be combined freely. The date range is the only filter available to standard crew members, who already see only their own reports plus any published ones.

### Pagination

The report list shows **25 reports per page** by default. You can change the page size to **50 or 100** with the selector in the filter bar, and move between pages with the pagination controls below the list. The header shows the total number of reports matching the active filters.

The Excel export always includes **all** reports matching the current filters, not just the visible page.
