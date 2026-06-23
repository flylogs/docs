# Create a flight

Our flight create form has been designed to be clear, easy to use, avoid mistakes and at the same time, be 100% usable on mobile devices.

> **Don't see the "Log flight" button?** Creating flights requires the **Create flights** permission to be enabled for your user type, plus an active pilot profile. Company Administrators, Operations Managers, and Compliance & Safety Managers can always create flights. See [Flight permissions](../company-management/company-settings.md#flight-permissions) for details.



![The form in a computer screen](https://tawk.link/61f94bae9bd1f31184da67e3/kb/attachments/RoMrRsRTmm.png)



### From top to bottom:

_Noted with an \* are required fields._

* \* Date of flight
* \* Aircraft
* \* Flight Callsign<br>
* \* Flight rules
* \* PIC (Pilot in command)
* SIC (Second in command or student)
* \* Departure Aerodrome
* \* Landing Aerodrome
* Cross country&#x20;

<br>

### Time fields:

_The flight time fields will be only available once the DATE field has a value of today or before._

> The time fields can be left blank, but the flight will be saved only as a draft and will not have the option to be confirmed into the logbooks.

* Off Blocks time ( in HH:mm format )
* Take Off time ( in HH:mm format )
* Landing time ( in HH:mm format )
* On Blocks time ( in HH:mm format )

**UTC vs local time.**

The timezone is a setting that the company management can set in the company settings page and affects all time fields across the different Flylogs systems, like Flights, schedules, trainings ...



To view the required timezone in the flight create form, put your mouse pointer on top of the time inputs and the tooltip will display the required timezone.

![](https://tawk.link/61f94bae9bd1f31184da67e3/kb/attachments/laEzRhOo_d.png)

Once the flight times have been entered correctly the following fields will be available:

* \* Landings (Quantity of landings performed in this flight)
* Night flight time (Night flight time in HH:mm format)
* IFR flight time (IFR flight time in HH:mm format)<br>

**Right column inputs:**

* \* Flight type
* Route
* Base
* Supervisor
* Remarks

<br>

### Hobbs and Tach readings

If the selected aircraft tracks **Hobbs** and/or **Tach** meters, the form shows those fields and helps you fill them in:

* **Hobbs/Tach start** is pre-filled from the end reading of that aircraft's last logged flight, so consecutive flights stay continuous.
* **Hobbs/Tach end** is auto-calculated as the start reading plus the block time. The link icon next to the field shows whether the value is auto-calculated or has been overridden — you can edit it manually, and click the pencil icon to revert to the auto-calculated value.

**When editing an existing flight, your stored readings are respected:**

* If the flight already has Hobbs/Tach values, they are **left untouched** — the form will not overwrite them.
* If a value is empty, it is auto-filled as described above.
* If you **change the aircraft**, all Hobbs/Tach readings are re-prefilled from the newly selected aircraft's last flight.

<br>

### Flight type and logbook time

The selected flight type determines what kind of time is written to each crew member's logbook. Every flight type defines a time classification for each of the three crew roles: **PIC**, **SIC**, and **Supervisor** (also shown as Examiner or Specialist depending on company type).

The available classifications are:

| Classification | Logbook effect |
|----------------|----------------|
| **Pilot in Command** | Logs PIC time. |
| **Pilot in Command Under Supervision** | Logs PIC time (shown separately as PICUS). |
| **Second in Command** | Logs SIC time. **Only counts on multi-pilot aircraft** — on single-pilot aircraft no SIC time is logged. |
| **Flight Instructor** | Logs both PIC and FI time. |
| **Dual Received** | Logs Dual time. |
| **Class Rating Instructor**, **Instrument Rating Instructor**, **Type Rating Instructor**, **Flight Instructor of Flight Instructors**, **Synthetic Flight Instructor**, **Examiner** | Log both PIC and FI time, and are also reported separately so each instructor/examiner role can be tracked on its own. |
| **Supervisor** | Reported separately only — not added to PIC or FI totals. |
| **None** | No time logged for that role. |

For example, a training flight type can log Flight Instructor time for the PIC, Dual time for the SIC, and no time for the supervisor.

Company managers can configure these classifications in the flight types management page. The supervisor classification is set to **None** by default, so supervisors receive no logbook time from a flight unless the company configures otherwise.

> **Note:** The old **Copilot** classification has been replaced by **Second in Command (SIC)**. Existing flight types that used Copilot were automatically migrated to SIC, which keeps the same behaviour of only logging time on multi-pilot aircraft.
