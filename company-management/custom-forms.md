---
description: Build your own forms, decide who fills them in, and keep every filled copy as a signed record
---

# Custom forms

Custom forms let you rebuild the forms you keep on paper or in Word — a course application form, a checklist, a declaration — inside Flylogs. You build a form once; every copy filled in from it is kept as a signed record, attached to the person (and course) it is about.

{% hint style="info" %}
Custom forms are available on the **Premium** and **Unlimited** plans. If your company moves to a plan without forms, nothing is deleted: filled copies stay readable, and forms simply stop being required anywhere.
{% endhint %}

## Who can do what

| Action | Who |
| --- | --- |
| Build, publish, archive and delete forms; see every response; send forms to people; reopen a signed copy; delete any draft copy; waive a mandatory form | Flylogs Administrator, Company Administrator, Operations Manager, Compliance & Safety Manager (user groups 1, 100, 105, 110) |
| Fill in and sign a form | Whoever the form says fills it in (see below) |
| See a filled copy | Managers, the person it is about, whoever filled or signed it, and the user groups you add as viewers |

Managers find **Forms** under **Home** in the main menu. Every user finds the forms they have to fill under **My forms**, in the menu that opens from their name at the top right.

## Building a form

Open **Home → Forms → New form**, give it a name, then add sections and fields on the **Fields** tab.

### Field types

| Type | Answer |
| --- | --- |
| Text block | No answer — a paragraph of instructions or regulation text |
| Tick box | Ticked or not |
| Yes / No | Yes or No |
| Single choice | One of the options you list |
| Short text / Long text | Free text |
| Number | A number, optionally with a unit (e.g. *hours*) and entered as *hh:mm* |
| Date | A date, in your company's date format |
| Date and time | A date and time, in your company's time zone and format |
| Photo | One or more photos (the phone camera opens on mobile) |
| PDF | One or more PDF files |

Each field can be **required** or optional. A field's label can be a whole paragraph, so regulation wording can be quoted word for word.

Tick **Allow evidence files** on a field to let people attach a photo or PDF next to their answer — for example a licence scan next to "Holds a PPL(A)? Yes". The evidence belongs to that row, not to the whole form.

There are no calculated fields: a figure such as the minimum training hours after credits is typed by the person responsible, and Flylogs keeps exactly what they typed.

### Showing a field only when needed

Every field and every section has a **Show** setting. By default it is always shown. You can choose to show it only when an **earlier** tick box, Yes / No or single-choice field has a given answer.

Example: *Refuel performed?* (Yes / No) → *Fuel slip photo*, shown only if the answer is **Yes**. A hidden field is never required, and whatever was entered in it is discarded when the answer above changes.

### Sections signed by someone else

A section can be **signed separately** by chosen user groups — for example an English-proficiency row assessed by a CTKI, while the Head of Training signs the rest. That section can only be filled and signed by those groups; nobody else (not even a manager) can sign it for them. The form is complete only when every section shown has been signed.

## Who fills it in, who sees it

On the **Who fills & sees** tab:

* **Who fills it in**
  * *The person the form is about* — each person fills and signs their own copy.
  * *Selected user groups, on someone's behalf* — e.g. the Head of Training fills in a candidate's enrolment form.
  * *Either*.

  Managers can always fill in the main part of a form on someone's behalf, so a missing person never blocks a process.
* **Who can see filled copies** — add user groups beyond managers, signers and the person concerned. Use this to keep personal data (dates of birth, licence numbers) to the people who need it.
* **Who can open it at any time** — these groups find the form under *My forms → Available* and can start one whenever they need.

## Revisions

Editing a form never changes copies already filled in. Your edits are kept as a draft until you press **Publish**: the draft then becomes the next numbered revision (the first is revision 0). Every filled copy names the revision it was filled on, with its fingerprint.

On the **Revisions** tab you can add your own labels — *Issue*, *Revision*, *Effective date* — so the form carries the same references as your manual or syllabus. Older revisions can be viewed at any time.

## Signing

Filling in is saved as you type. When a section is complete, press **Sign**. If **Sign with password** is on (Settings tab), the signer re-enters their password, as for course approvals. Either way, each signature records who signed, when, and a fingerprint of the answers signed. Signed answers can no longer be changed.

A manager can **reopen** a signed copy with a reason: its signatures are voided, the answers it held are kept in the history, and it must be signed again.

A **draft** (a copy started but not every part signed yet) can be deleted with its answers and files: by the person who started it, as long as nobody has signed any part of it yet, and by managers at any time — from the copy itself or from the **Delete** button on its row in **Forms → Responses**. Requested, submitted, skipped and waived copies cannot be deleted.

## Sending a form to people

From **Forms → Responses → Request**, choose people and/or pilot groups, an optional due date and a note. Each person gets their own copy and a notification; anyone who already has an open copy of that form is not asked again. Overdue copies are shown in red to them and to you.

## Course pre-entry forms

On the **Attached to** tab, attach the form to **course enrolment**, for all courses or only the ones you pick, as:

* **Mandatory** — the student cannot be enrolled until the form is complete and signed, or a manager **waives** it with a reason. When a student applies to such a course, the application always waits for a manager, even if the course normally accepts applications automatically.
* **Skippable** — the form is offered at enrolment and can be skipped. Skips are recorded.

When you enrol a single student, the course's pre-entry forms appear in the enrol window: fill them in there, and **Enrol** becomes available once the mandatory ones are signed. When you enrol several students at once, those without their forms are not enrolled and are listed with the forms they are missing. In the **Approvals** queue, the form icon on an application opens its pre-entry forms.

The student's enrolment page shows their pre-entry forms and their signed copies.

## Flight forms

On the **Attached to** tab you can also attach a form to flights:

| Attached to | Asked | Can be limited to |
| --- | --- | --- |
| **Preflight** | in the dispatch window of a booking or flight, and when a new flight is entered online | flight types, aircraft |
| **First flight of the day** | the same places, once per aircraft per day: whoever fills it, it covers that aircraft for the rest of the day | aircraft |
| **Before a solo flight** | the same places, for flights on a training mission that needs a mission authorisation | courses |
| **Post-flight** | in the confirm window | flight types, aircraft |
| **Booking creation** | when someone books a flight for themselves | flight types, aircraft |

**Who fills it**: on *Who fills & sees*, choose the crew member — PIC (default), SIC, instructor / supervisor, or any crew member. Managers and the form's filling groups can always fill it on the crew's behalf.

**Mandatory** flight forms block the step until they are signed or a manager waives them with a reason: the **Dispatch** button, saving a new flight, or **Confirm**. **Skippable** ones are offered and can be skipped.

What is never blocked:

* flights saved **offline** — the forms are offered on the device (see below) but saving is never held up;
* flights already confirmed, imported flights and flights recorded from ADS-B;
* bookings made by staff for someone else, bookings created by Auto Pilot and copied weeks.

A form filled before the flight exists (for a new flight or a booking) is attached to the flight once it is saved or dispatched. The flight page lists its preflight and post-flight forms. The same form can be both preflight and post-flight: each is a separate copy.

### Booking forms

A form attached to **booking creation** is asked when a pilot or student books a flight for themselves — from self-booking, or from the schedule when they are on the booking's crew. A **mandatory** booking form must be signed before the booking is made; a **skippable** one can be skipped.

One copy covers everything booked in the same go: a booking repeated over several dates or a trip with several legs asks for the form once. The signed copy is attached to the booking and, once dispatched, to its flight.

### Filling flight forms offline

The app keeps a copy of your company's flight forms on the device, so preflight and post-flight forms can be filled in without signal:

* entering a **new flight offline**, the preflight forms that apply are offered before it is saved. You can fill them now or save the flight and fill them later;
* **confirming offline**, the post-flight forms are shown in the confirm window.

Answers, photos and PDFs stay on the device and are signed there. When the device is back online the flight is sent first, then its forms, then its confirmation, so the confirmation finds its forms already signed. The history of each copy notes that it was signed offline and when.

A form that is signed **with a password** can be filled offline but is signed once you are back online. Forms *before a solo flight* are only offered online.

If a mandatory post-flight form is still missing when an offline confirmation syncs, the confirmation is refused with the form named. The flight stays a draft; fill the form and confirm again online.

Forms for exams, first login, document downloads and certificates will be added in later releases.

## Responses

**Forms → Responses** lists every copy of a form: who it is about, its status, when it was started, submitted and due, and which required answers are still missing. The **Related to** column links to the record each copy belongs to: the flight, the booking, the student's enrolment (or the course, for a pre-entry form filled before enrolment) or the person. The same link is at the top of each filled copy.

Who gets the link: flights and bookings link for everyone who can see the copy, and the flight or booking page still applies its own access. Enrolment, course and person pages link for managers (`user_group_id` ≤ 110); a student also gets a link to their own enrolment. Filter by status or name, open any copy, or export the list to Excel (one column per field).

| Status | Meaning |
| --- | --- |
| Requested | Sent to someone, not started yet |
| Draft | Started, not every part signed yet |
| Submitted | Every part signed |
| Skipped | A skippable pre-entry form was skipped |
| Waived | A manager waived a mandatory form, with a reason |

## Retention

You can set how many months filled copies should be kept (Settings tab). The period is stored and shown with the form; automatic deletion is not active yet.

## Archiving and deleting

**Archive** a form you no longer use: it can no longer be started or requested, and it stops being required for enrolment. Filled copies stay. A form can only be **deleted** while nobody has filled it in or been asked to.
