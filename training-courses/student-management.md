---
description: Learn how to add and manage students
---

# Student management

Flylogs training allows any existing user in your company to be enrolled as a student. This means that any staff member, technical personnel, client, or student can be enrolled in a training program of your choice.

To get started, go to the "**Trainings**" menu tab and click on "**STUDENTS**." On this page, you'll see the students currently enrolled in the selected training. You can choose any of your trainings, and the list will update to display all existing students and their progress.

**Who can see this page:** company managers (Administrator, Operations, Compliance & Safety, HR, Financial and Trainings Manager), Chief Pilot, Flight Instructors and external auditors. Flight Instructors and auditors get a **read-only** view: they can open any student's record but cannot enroll, edit, complete or reset an enrollment — those actions are limited to staff up to and including Chief Pilot.

#### Enrolling new students

First, you'll need to add your students to one of your courses. To do this, click on the blue button labeled "Enroll students" in the top right corner. A small pop-up window will appear. In this window, you can choose students individually, or you can enroll an entire pilot group at once. We recommend creating pilot groups for each academic year and adding them in batches. This will make management easier, especially when you have multiple classes to oversee in the future.

Select the training in which you want to enroll the user(s). Additionally, you have the option to choose a tutor for the newly enrolled users or set a finish-by date if desired.

<figure><img src="../.gitbook/assets/trainingsEnrollUsers.png" alt=""><figcaption><p>Enroll new students pop up window.</p></figcaption></figure>
#### Students report page

Once you've enrolled at least one student, the current page will show a report detailing the progress of students enrolled in the selected training. This report, similar to the one in the screenshot below, provides essential information for tracking student progress. It includes details such as progress in theory learning lessons, flight training mission progress, attendance records, and the date of the last flight, if applicable.

<figure><img src="../.gitbook/assets/trainingsUsersEnrolled.png" alt=""><figcaption><p>Students report page</p></figcaption></figure>

**Who can see this:** company managers (training manager, operations manager and above) and external auditors. Flight instructors do not get the **Students** entry in the Trainings menu; they open a student's training record from the pilot profile instead — go to **Pilots**, open the student, and click the course in the **Trainings** box. That record is the same progress page described below, read-only for instructors.
#### Student training progress page

You'll find a comprehensive training progress report page for each of your students. This page, as shown in the screenshot below, details progress and attendance in ground school lessons, exams, and flight missions. Additionally, it offers basic analytics to help you understand the strengths and weaknesses of each student.

Clicking on any of your students will open the complete progress report for that student in the selected training. Keep in mind that if a student is enrolled in more than one training, they will have a separate training report page for each training they are enrolled in.

These training reports for the student can also be accessed from the pilot profile page in the Trainings box.

<figure><img src="../.gitbook/assets/trainingsUserDetail.png" alt=""><figcaption></figcaption></figure>
<figure><img src="../.gitbook/assets/trainingsUserFlightsDetail.png" alt=""><figcaption></figcaption></figure>
#### Attendance breakdown

For onsite trainings, the attendance ring on the student's progress page breaks missed sessions down further, so a low attendance rate isn't a mystery:

* **Missed** — the total number of sessions the student did not attend.
* **Justified** — of those, how many have an approved absence justification.
* **Not justified** — how many are still a plain, unresolved absence.
* **Credited after class** — how many were later marked **Attended (post-class)**, i.e. the student made up the class afterwards. When some of those were recovered by attending another sitting of the same lesson (see [Recovering a class in another sitting](missed-classes-and-class-work.md#recovering-a-class-in-another-sitting)), that number is shown alongside.

The same split carries through to the training report and its PDF. See [Missed classes and class work](missed-classes-and-class-work.md) for how a student gets from "Absent" to one of these outcomes.

<!-- SCREENSHOT TODO — add trainingsAttendanceBreakdown.png to .gitbook/assets/, then uncomment:

<figure><img src="../.gitbook/assets/trainingsAttendanceBreakdown.png" alt=""><figcaption><p>Missed sessions split into justified, not justified and credited after class.</p></figcaption></figure>

-->
#### Students invited but not enrolled

Someone can be invited to an individual class without being enrolled in the training itself — useful for a one-off visitor or a student you haven't formally enrolled yet. They can open the class page, but no attendance or evaluation can ever be recorded for them: on the class register they show up read-only with a **Not enrolled** label, and they're left out of the attendance ratio, the missed-class email and the class work notification.

They also won't appear on this training's student report or progress pages, since there's no enrollment to report on. To record their attendance and results, enrol them in the training — from that point on they're treated like any other student.

<!-- SCREENSHOT TODO — add trainingsNotEnrolledInvitee.png to .gitbook/assets/, then uncomment:

<figure><img src="../.gitbook/assets/trainingsNotEnrolledInvitee.png" alt=""><figcaption><p>A "Not enrolled" invitee on a class register, shown read-only.</p></figcaption></figure>

-->
#### Marking a training as completed, and the completion date

Most courses complete themselves: as soon as the last lesson, exam and flight mission is done, the enrollment is closed automatically and the certificate becomes available. When you need to close one by hand — a course finished on paper, or a student who finished before you set the course up in Flylogs — open their training progress page, click "**Manage enrollment**" and choose "**Mark as completed**".

Flylogs then asks you for the **completion date**, prefilled with the date the records say the student actually finished: the latest of their last completed lesson, last passed exam and last completed flight mission. Change it if the real date was different.

That date matters, because it is the date printed on the certificate and the date its expiry is counted from. A student who finished on a Thursday but is only marked completed two weeks later still gets a certificate dated that Thursday, valid for the full period from then — not one dated the day you pressed the button.

The date cannot be in the future, and cannot be earlier than the day the student was enrolled. Where nothing has been recorded for the student yet, the field simply defaults to today.

**Who can do this:** company managers. Instructors, students and external auditors cannot mark an enrollment as completed or change its completion date.

#### The course completion certificate

Once an enrollment is completed, the certificate can be downloaded from the student's training progress page (managers), from the Students overview, and by the student themselves from their training page — unless **Show certificate to students** is switched off on the training. It is the training organisation's document, printed in the **company language**:

* **Organisation** — legal name, address, approval type and reference from **Company settings → General → Training organisation**.
* **Student** — full name, date of birth (from the pilot profile) and licence. The licence line is the **name of the student's valid licence document** under *My Certificates* (type "Licence", not expired) — record the licence number there, e.g. `PPL(A) SI.FCL.12345`. Students with no licence get no licence line. Passport number, address and phone are never printed.
* **Course** — name, regulatory basis, **theoretical training hours** (the planned syllabus hours of the course subjects) and **flight training hours** (the block time actually flown on the student's completed missions, each flight counted once), the course start date (the enrolment date) and the completion date.
* **Issue** — the certificate number, the date of issue and the signature, name and position of the training manager (see [Edit a training](edit-a-training.md#certificate-signer-and-regulatory-basis)).

**Numbering.** The certificate is *issued* the first time anyone downloads it: Flylogs reserves the next number from the company counter, stamps the date of issue and stores a copy of every printed field. Every later download — by the student, a manager, or from the certificates list — reproduces that same certificate. Editing the company details or the course afterwards does not alter a certificate already issued.

**Issued certificates list.** **Trainings → Certificates** lists every certificate the organisation has issued: number, student, course, date of issue and who triggered it, with a search by number or student and a filter by training. Each row can be downloaded again or opened as a training report. Available to managers and instructors (`Flight Instructor` and above).

**The QR code and privacy.** The QR code on the certificate opens the student's training report page. Anyone scanning it **without logging in** sees only what is needed to check the document is genuine: the student's name with all but the first letter of each word masked (`O******** K********`), the course, the organisation, whether the course is completed and on which date, and the certificate number. The full training report — attendance, exams, flights and the personal details — is shown only to the student, their supervisor, and managers or instructors of the same company, after logging in.

#### Enrollment status: stopping, failing or expelling a student

Not every enrollment ends with a pass. When a student quits, is removed from the course, or does not pass, you can **close the enrollment without deleting any of their work** — every lesson, exam attempt and flight mission stays on record.

Open the student's training progress page, click "**Manage enrollment**" and choose "**Stop training**". Pick what happened and optionally write a reason:

| Status | Use it when |
|--------|-------------|
| **Stopped** | The student quit or abandoned the course. |
| **Not passed** | The student did not pass the training. |
| **Expelled** | Your school removed the student from the training. |

<figure><img src="../.gitbook/assets/trainingsStopStudent.png" alt=""><figcaption><p>Choosing why an enrollment is being closed, with an optional reason for the student.</p></figcaption></figure>
The student is notified in the app **and by email**, with the reason you typed included in the message. The same applies when you mark a training as completed or reopen an enrollment. Students who have turned alerts off, or whose email address is not confirmed, only get the in-app message.

Once an enrollment is closed:

- The student can no longer complete lessons or start exams in that training — their record becomes read-only.
- They stop appearing in the default student list, in their own list of trainings in progress, and in the pending trainings on their pilot profile. Use the status filter at the top of the students list to see them again.
- The enrollment no longer auto-completes, and no certificate is issued.
- You can enroll the same student in that training again — a fresh enrollment is created and the old one is kept for the record.

To resume a stopped student, use "**Reopen enrollment**" — either the button in the header of their training progress page, or the first option inside "**Manage enrollment**" (while an enrollment is closed, "Mark as completed" and "Stop training" are hidden there, since neither applies). Reopening puts the enrollment back in progress, notifies the student, and leaves every lesson, exam and mission exactly as it was.

Stopping, failing, expelling and reopening all appear in the student's **Activity** timeline as separate entries — each with the date, the reason given and the name of whoever made the change — so the full history is on the record, not just the latest state. The same trail covers the enrollment being created (who enrolled the student), a training completed automatically by the system, and a progress reset that reopened a closed enrollment. Removing a student deletes their enrollment and its history along with it, which is why stopping is the option to use when the record must be kept. That timeline is now also visible to the student on their own training page.

In **Trainings → Audit → Analytics** you get a Stopped card, a pie chart splitting the stopped students by outcome (stopped / not passed / expelled), and a "Recently stopped" list — most recent first, showing each student, their outcome, the reason given and the date, and linking through to their progress page.

> Stopping is not the same as "**Remove student**". Removing (unrolling) deletes the enrollment together with all of the student's lessons, exams and flight missions, and cannot be undone. Stopping keeps everything.

**Who can do this:** the same staff who can mark a training as completed or reset it — company managers. Instructors, students and external auditors cannot change an enrollment's status.
