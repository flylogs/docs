---
description: Record who signed off a graduation, a content change, or an instructor
---

# Course Approvals

Three decisions on a course get recorded rather than just happening: graduating a student, changing the course content, and designating who may instruct or run checks on it.

Only the first of these **blocks** anything, and only on courses with [stage checks](stage-checks.md) enabled. The other two record and inform — they never stop a save.

### Graduating a student

On a course with stage checks on, passing the last stage no longer completes the course by itself. Instead the student appears as **waiting for approval** on their Flight missions tab, and an approver decides.

* **Approve** — the course completes and the certificate becomes available.
* **Reject** — the enrollment stays active and the reason is kept on the record.

Both are signed with your password.

On a course **without** stage checks nothing changes: auto-finish behaves exactly as it always has.

### Approving content changes

Any change to a course's stages or flight missions opens a **revision**. The course then shows *Unapproved changes (revision N)* until someone signs it off.

Editing a course fifty times before anyone approves produces **one** revision, not fifty — the revision stays open and simply records who touched it last.

**You can see what you are approving.** The badge lists every recorded change in that revision — what was added, edited or deleted, the old and new value of each field, and who made it. Expand it before signing.

Approving stores a fingerprint of the content as it stood at that moment, so the approval can later be shown to have covered exactly that version.

An edit that changes nothing records nothing: re-saving a stage without touching a field does not open a revision or ask anyone to approve it.

This never blocks anything. Students always run the live content; the revision is a record of what was approved and when, not a draft that has to be published.

### Undoing a change

Because changes go live immediately, the change log gives an approver an **Undo** on each entry. What can be undone faithfully differs by the kind of change:

| Change | Undo |
| ------ | ---- |
| A field was edited | The previous values are written back. Exact. |
| Stages or missions reordered | The previous sequence is restored. Exact. |
| Something was created | It is removed — **unless** it is already in use (a mission a student has flown, a stage with missions in it). |
| Something was deleted | It is restored from the stored copy. Deletions recorded before this feature existed cannot be restored, and say so rather than guessing. |

Two rules keep undo from making a mess:

* **Newest first.** If someone edited the same item again afterwards, that later change has to be undone first. Undoing an older one would silently discard the newer edit.
* **An undo is itself a change.** It appears in the log and opens a revision like any other edit, so the record never shows an edit that quietly stopped being true.

### Who may sign a stage check

Stage checks are signed by pilots at **Chief Pilot level or above** (`user_group_id` 150 and below), plus the training's own manager.

This is deliberately wider than who may *approve* a graduation: signing a check is an instructional act, approving a graduation is a management one.

### Who can approve

Approvals are decided by a Company Administrator, Operations Manager, Compliance & Safety Manager, Human Resources Manager, Financial Manager, Trainings Manager, or the training's own manager.

Course managers see only their own courses in the queue; managers at company level see all of them.
