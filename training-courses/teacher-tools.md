---
description: Classroom management and teacher tools
---

# Teacher tools

Once a class or exam is scheduled, the assigned teacher and students get access to the scheduled event page details. Additionally, the selected teacher and all company managers, can add some extra content to the event, communicate with students and rate them.

{% embed url="https://youtu.be/E7SazQtlZTQ" %}

**This is what teachers can do:**

**In regular lessons:**

* Add documents or files for the class
* Comment on and answer students' questions
* View and update the student list
* Record class attendance and evaluate student performance, add remarks and corrective measures if needed.

**In exams:**

* Record attendance
* View and update the student list
* Enter exam grades
* Comment on and answer students' questions

#### Class evaluation tool for teachers and managers:

<figure><img src="../.gitbook/assets/Screenshot 2025-12-16 at 17.36.18.png" alt=""><figcaption></figcaption></figure>

The class teacher or any company manager can record attendance and enter evaluation details. Whether editing is allowed depends on who you are and whether the class has been signed off.

**Teachers** can edit attendance and exam results when:

* The class has **not been signed** yet, and
* The class was scheduled **no more than 3 days ago**

Teachers can also **sign** the class to lock the record once the session has taken place (the sign option becomes available up to 4 hours before the scheduled start time).

**Managers** (training manager, operations manager, and above) can edit attendance and exam results when:

* The class has **not been signed** yet — no time restrictions apply

**Once a class is signed, the record is locked** for everyone. A training manager can unlock it again with **Modify signed attendance**: confirm the prompt, make the correction, then **Update attendance** to sign again. Nothing is lost — every signature is kept as history, so you can always see who signed, and when, including earlier corrections.

{% hint style="info" %}
A teacher who is also enrolled as a student in the same class will be treated as a student — their teacher editing rights are suppressed for that class.
{% endhint %}

{% hint style="info" %}
Online exams are graded automatically and cannot be edited manually from the class page.
{% endhint %}

An onsite exam grade entered on the class page is recorded as one attempt for that sitting in the student's exam history, the same history the manager's **Add result** button writes to. Saving the class again updates that sitting's attempt rather than adding another one, and the student's pass/fail state and best score are recalculated from the full history.

### Attendance statuses and signing

<figure><img src="../.gitbook/assets/trainingsMustSignPrompt.png" alt=""><figcaption><p>A class left unsigned for more than two days prompts the teacher to sign it.</p></figcaption></figure>

Attendance isn't a tick box — each student on the register can be set to one of four statuses:

* **Attended**
* **Attended (post-class)** — used to credit a student who did not attend live but completed the class afterwards (see [Missed classes and class work](missed-classes-and-class-work.md)).
* **Absent**
* **Absent (justified)** — set automatically when a student's absence justification is approved (see below).

Before the class is signed, a student can simply be left **unmarked** — nothing is recorded for them yet. Attendance is only saved when you **sign** the class: signing turns every student still unmarked into **Absent**, and from that moment the register is a record, not a draft. Both **Attended** and **Attended (post-class)** count as present; **Absent (justified)** does not.

Signing automatically sends a missed-class email to every student marked **Absent**, with the class details and a link back to the class page. Each student gets that email once per class, even if you reopen and re-sign the register later — re-signing won't send it again to students already emailed.

{% hint style="info" %}
Students invited to a class without being enrolled in the training appear on the register as **Not enrolled**, read-only. No attendance can be recorded for them and they're left out of the attendance count and the missed-class email — enrol them in the training first.
{% endhint %}

### Student attendance signatures

Some courses ask the students themselves to countersign their attendance, the way a flight debrief is signed. Turn it on per course with **Require students to sign assistance** on the training settings page (see [Edit a training](edit-a-training.md)). It applies to onsite and remote classes; distance courses don't use it.

When it's on:

* As soon as you record a student as **Attended** or **Attended (post-class)** and save, that student is notified and asked to sign. Each student is asked once per class.
* The student opens the class page, presses **Sign my attendance** and confirms with their password. Their signature is stored with the date and time.
* You see the signature date under each student's name on the register, and a **SIGNED** column appears on the class report PDF — showing the date, *Not signed*, or *—* for anyone who wasn't present to sign.

Students can sign from four hours before the class until **seven days after** it. Absent students are never asked — there's nothing for them to attest.

{% hint style="info" %}
Signing the class yourself does **not** close the students' window: your signature certifies who was there, theirs confirms they were. A student can still sign after you've signed and locked the register, which is usually exactly when they get round to it.
{% endhint %}

### Exporting a class report (PDF)

The class teacher and any training manager can download a **PDF report** of a class or exam session — handy when your authority asks for evidence of theoretical training. Use the **PDF report** button next to **Edit Class** on the class page. Students don't see it, and a teacher who is on the class's own student list is treated as a student here too.

The report uses the same layout as the flight record PDF: your company logo (or company name) top left, the report title in the middle and the export date top right, with page numbers on every page. It contains:

* **Session identification** — training, subject, lesson or exam, date and time (in your company's time zone and date/time format), duration, teacher and location
* **Lesson content** — goals and learning objectives (for exams: name, reference, type and duration)
* **Attendance register** — every student's attendance status, remarks and corrective measures, plus the attendance count. For exams, the result earned in that sitting. On courses that require student attendance signatures, a **SIGNED** column shows when each student signed.
* **Student evaluations** — each student's learning-objective and performance-metric ratings and comments, on your training's rating scale
* **Session remarks**
* **Attendance certification** — who signed the register, when, from which IP address, and the record's integrity hash, plus how many times it was signed before

{% hint style="info" %}
A class that hasn't been signed can still be exported, but the report is marked **UNSIGNED** on every page because its statuses can still change. Sign the class first when you need the final record. Students invited without an enrolment are shown as **Not enrolled** and left out of the attendance count.
{% endhint %}

### Requesting class work

From the class page's **Documents** tab, a teacher can request class work (homework) from students: turn it on, set a deadline and write a description of what's expected. Students are notified and see a banner on the class page until they've dealt with it.

Once attendance is signed, the request is frozen — it can no longer be enabled, changed or cancelled. Students can still upload their work after signing, and the teacher and any training manager can review everyone's submissions from the same tab; each student only ever sees their own.

Class work is one file per student. Students can replace theirs — delete, upload again — until the deadline passes or you grade it, whichever comes first; after either, it locks. Grading early is therefore a way to freeze a submission. Anything submitted after the deadline is still accepted and shown to you marked **Late**.

### Grading class work

The same **Documents** tab lists every student on the register with their submission — who uploaded it, when, and whether it was late — plus a score out of 10 and a comment for the student. Students who submitted nothing still get a row, so you can record a zero with an explanation. A score, a comment, or both: an empty grade isn't saved. Re-grading replaces the previous mark.

Saving sends the student an in-app message with their score and your comment, linking back to the class. No email, no phone notification. Students see only their own grade.

The subject's teacher and training managers can grade too — the same people who can see the whole roster's submissions.

{% hint style="info" %}
Class work is requested from the Documents tab, not while scheduling the class — see [Schedule a class or an exam](schedule-a-class-or-an-exam.md).
{% endhint %}

### Reviewing absence justifications

A student marked **Absent** can submit a justification — an explanation, a document, or both — from the class page's **Attendance** tab. The class teacher or any training manager reviews it there: **approve** it, which sets the student to **Absent (justified)**, or **reject** it, each with an optional note explaining the decision. A submission only gets one decision; if the student wants to make their case again, they submit a new one.

{% hint style="info" %}
A student can delete their own class work file to replace it, until the deadline passes or you grade it — never after. Justification documents can never be deleted by the student who submitted them. You and any training manager can remove either at any time, for a corrupt file or work posted to the wrong class. Nothing can be moved to a different record.
{% endhint %}

#### Student evaluation pop up window:

<figure><img src="../.gitbook/assets/Screenshot 2025-11-14 at 18.06.16.png" alt=""><figcaption></figcaption></figure>

Once attendance or exam results are recorded, they are stored in each student's training record. Managers can then access all attendance and exam records, along with a summary showing the percentage of attendance for the entire training program or per subject.

This information is also available to the student and is included in full detail in the training report that Flylogs creates for each student.
