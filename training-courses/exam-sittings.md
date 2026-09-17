# Exam sittings

Exam sittings let your school put students forward for dated exams and keep track of how each attempt went. A sitting can be:

* **An authority exam.** The authority runs it: EASA, the FAA, or your national CAA. Flylogs doesn't examine anyone. It handles who registers for which subjects, and records the results you enter.
* **A school exam.** A dated exam your school runs itself.

Students register by choosing subjects. Flylogs counts every attempt and checks it against the rules of the authority you pick, so a student stays within that authority's limits.

> Exam sittings are part of Trainings, which is available on the **Premium** and **Unlimited** plans. On any other plan the pages are not shown.

> Exam fees are not handled in Flylogs. There is no price or payment step anywhere in exam sittings.

## Who can do what

| Action | Who |
| ------ | --- |
| See open sittings, register, cancel your own registration, see your own results | Every user in the company |
| Create, edit, publish and delete sittings | Managers (`user_group_id` 150 or lower) |
| Confirm, reject or mark registrations absent, and enter results | Managers (`user_group_id` 150 or lower) |
| Register a student yourself | Managers (`user_group_id` 150 or lower) |
| Reset a student's attempt history | Managers (`user_group_id` 150 or lower) |
| Create and edit authority rules | Managers (`user_group_id` 150 or lower) |

Managers find the page under **Trainings → Exam sittings**. Students open **Trainings** and use the **Exam sittings** button at the top of the page.

## Authority rules

An authority rule is the set of limits attempts are counted against: for example, how many times a subject may be attempted. Set rules up first, then choose one for each sitting.

{% hint style="warning" %}
**These numbers are yours to set.** Flylogs doesn't encode any regulation. Every limit is a value your school types in, so check each one against the authority's current rules before relying on it. If a number is wrong, you fix it by editing the rule.
{% endhint %}

Open the **Authority rules** tab and click **New rule**.

| Field | Meaning |
| ----- | ------- |
| **Authority** | The name of the rule, for example *EASA*. |
| **Max attempts per subject** | How many times a student may sit the same subject. |
| **Max sittings** | How many different sittings a student may use in total, across all subjects. |
| **Min days between attempts** | The number of calendar days a student must wait between two attempts at the same subject. |
| **Completion window (months)** | How long a student has to get through every subject. |
| **Window starts on** | When that window starts: at the student's **first attempt** at any subject, or at their **first pass**. |
| **Count from the end of that month** | Starts the window at the end of that calendar month instead of on the exact day. |

**An empty field means no limit.** A zero is refused: "0 attempts" would close the subject to everyone.

A sitting doesn't have to use a rule. With **No rules — count attempts only**, Flylogs still numbers each attempt but never blocks a registration.

A rule that sittings still use cannot be deleted. Change those sittings to another rule first.

### A starting point for EASA

EASA Part-FCL theory exams are often set up as **4** attempts per subject and **6** sittings, with an **18**-month window that starts at the first attempt and is counted from the end of that month. Treat these as a starting point only, and confirm them against the current regulation before you use them.

### How attempts are counted

* A result of **Pass**, **Fail** or **Absent** counts as an attempt. The authority counts a no-show, so Flylogs does too: an absence is scored like a fail (it never counts as a pass). A registration that was cancelled or rejected, or whose results are still pending, doesn't use an attempt.
* Attempts are counted **per subject**. Sittings and the completion window are counted **across all subjects** under the same rule.
* Each rule keeps its own count. A school that runs EASA and FAA sittings side by side keeps two separate histories.
* Days are calendar days in your company's timezone, so the time of day of an exam doesn't change the count.

## Creating a sitting

Open the **Sittings** tab and click **New sitting**.

* **Name**, **type** (authority or school exam) and **authority**. The authority is shown to students.
* **Attempt rules**: the authority rule this sitting counts against.
* **Date** and **time** of the sitting, in your company's timezone.
* **Location**.
* **Registration opens** and **Registration deadline**. The deadline is the last day a student can register **or cancel**. Leave it empty to accept registrations until the sitting starts.
* **Seats**. Leave it **empty** for unlimited seats.
* **Max subjects per student**. Leave it empty for no cap.
* **Instructions**: what students should know or bring.
* **Subjects**: tick the course subjects this sitting offers. You can give a subject its own seat limit; if you leave it empty, only the sitting's seat limit applies.

A new sitting is saved as a **Draft**, which students never see. Click **Publish** on its row to open it.

You can remove a subject from a sitting as long as nobody is registered for it. If students are registered, cancel their registrations first.

### Sitting statuses

* **Draft**: not visible to students.
* **Published**: visible and taking registrations.
* **Full**: every seat is taken. Flylogs sets this by itself when the last seat goes, and returns the sitting to **Published** as soon as a seat frees up.
* **Closed**: registration is over. You can still enter results.
* **Cancelled**: the sitting is called off.

A sitting with registrations cannot be deleted. Cancel it instead, so the students and their attempt history are kept.

## What students see

A published sitting appears for a student only when it offers **at least one subject they are ready for**, and it lists only those subjects. A student is ready for a subject when:

* they have an **active** enrolment on the subject's course, and every mandatory exam of that subject is passed; or, if the subject has no mandatory exam, every mandatory lesson is complete;
* **or** they have **completed** the course.

A stopped, failed or expelled enrolment doesn't count.

For each subject the student sees which attempt this would be (for example *Attempt 2 of 4*) and, where it applies:

* **A warning they can still register past**: *Last attempt*, *Last sitting*, or *Already passed*.
* **A block that stops them registering for that subject**: *No attempts left*, *No sittings left*, *Too soon after the last attempt* (with the next date they can sit), or *This sitting falls after the completion window*.

The student ticks the subjects they want, up to the sitting's maximum, adds an optional message, and clicks **Register**. The registration starts as **Pending** until the school confirms it. The student can cancel it up to the registration deadline.

Under **My registrations**, students see every registration with its results, and a **Progress by subject** table: the attempts used, whether each subject is passed, the next date they can sit, and when their window ends.

The same information also appears in the **Exams** tab of the student's course page (**Trainings → the course**), under the course's own exams, as an **Exam sittings** section limited to that course's subjects. Managers see the same section in the **Exams** tab of the student's enrolment page (**Manager → Trainings → Students → the student**). Both read the same record, so they never disagree.

## Managing registrations

Click the registrations summary on a sitting's row to open its list. Each registration shows the student, their message, their subjects grouped by course, and the attempt status of each subject. Under the student's name, **Sitting N of M** tells you which sitting this is for them under the rule (and how many the rule allows); with no sitting limit it just reads **Sitting N**.

Select rows and use:

* **Confirm**: puts the student forward.
* **Reject**: turns the registration down, with the reason you type. The student sees the reason.
* **Mark absent**: the student didn't turn up. Their seat stays used, and every subject still pending is recorded as **Absent**, which counts as a failed attempt. If that was wrong, confirm the registration again (or cancel it) and the absences are taken back.
* **Cancel**: withdraws the registration and frees the seat.

Rows that can't make the change you asked for are skipped, and Flylogs tells you why. For example, a rejected registration can't be marked absent. Bringing a rejected or cancelled registration back takes a seat, so it is refused once the sitting is full.

### Registering a student yourself

Open a sitting's registrations and click **Register a student**. Only students enrolled on a course this sitting offers are listed. Anyone already registered is shown but can't be picked.

Choose the student, tick their subjects and click **Register**. For each subject you see which attempt it would be. You also see whether the student is ready for it, and if not, why: not enrolled, internal exams not passed, or lessons not complete.

A registration you make yourself:

* is **Confirmed** straight away, and the student is notified;
* can be made after the registration deadline, on a draft or closed sitting, or for a sitting that has already taken place, which is how you record exams sat before the school used Flylogs;
* can include a subject the student isn't ready for yet. Flylogs shows a warning, and the decision is yours;
* **still follows the attempt rules**, the seat limits and the subject cap. A subject with no attempts left, or too soon after the last attempt, can't be registered. If a rule is wrong for your school, change the rule.

A cancelled sitting can't take new registrations.

### Resetting a student's attempt history

A student who used up their attempts and then **restarts their training** needs a fresh count. In the **Register a student** panel, choose the student and click **Reset attempt history**. Then type the reason, which is required, and confirm.

* The reset applies to the student under **that sitting's authority rule**. Other rules keep their own history.
* **Nothing is deleted.** Every earlier result stays on the student's record with the attempt number it was given, and the reset itself is recorded with who made it, when, and why.
* From now on, results sat **before the reset stop counting**: attempts, sittings and the completion window all start again from the next sitting.
* The student is notified, with the reason you gave.
* The panel shows the date of the student's last reset.

The option only appears for sittings that use an authority rule. Sittings with no rule never block a student, so there is nothing to reset.

### Entering results

For each subject, choose **Pass**, **Fail** or **Absent**, optionally type the score, and click **Save results**.

* Flylogs records the attempt number from the student's earlier results under the same rule. Saving the same result again doesn't add an attempt.
* A pass or fail marks the registration as **Sat**. Absences alone mark it **Absent**.
* Setting a result back to **Pending** clears it. A registration with no results left goes back to **Confirmed**.

### Official result reports

Each registration has an **Official result report** link under the student's name. Click it to upload the authority's result report (PDF or image) for that student and that sitting, as evidence for audits. One report per student per sitting. Once a file is there it is listed under the student's subjects as a link that opens the file; the **Official result report** link (with a count) opens the upload box again to replace or delete it. The student sees the same link on their exam sittings page and in the **Exam sittings** section of their course's Exams tab. Only managers can upload or delete.

Official results are kept **separately from the course**. They don't change the student's lessons, internal exams or course progress.

## Notifications

The student gets a message in Flylogs, and an email if their notification settings allow it, when:

* the school **registers them** for a sitting (with the list of subjects);
* their registration is **confirmed** (with the list of subjects);
* their registration is **rejected** or **cancelled** by the school (with the reason you typed);
* their **results** are entered, with each subject's result and score;
* their **attempt history is reset** (with the reason you typed).

Results are announced only when a result actually changes. Correcting a score, or saving the same result again, doesn't send another message. Marking a student absent doesn't send one either.

Each message links to the student's **Exam sittings** page.

### Exporting for the authority

**Export to Excel** downloads every registration of the sitting, with one row per student and subject: course, subject code and name, registration status, attempt number, result and score. Use it to send the candidate list to the authority.
