# Trainings

> **v2 schema**. The trainings plugin uses a unified-activities schema:
> `training_activities` orders lessons + exams together (drag-drop ordering),
> `activity_progress` is the single source of truth per (enrollment, activity),
> and `exams` covers both ONLINE and ONSITE (column `type`). Sessions
> (renamed from `lesson_classes`) bind to a single `training_activity_id`.
> Attendance is recorded per-session on `session_students.attendance_status`
> (`attended`, `attended_post_class`, `absent`, `absent_justified`, or `NULL`
> when not yet decided); progress % comes from `activity_progress.value`. The
> two are independent (a student can have attended a paper exam but not
> passed it). `activity_progress` is per-ACTIVITY — unique on
> (`trainings_user_id`, `training_activity_id`) — so it cannot represent
> attendance for one session out of several under the same activity;
> `session_students.attendance_status` is the per-session record.

> **Training types.** `trainings.type` is `ONSITE` or `DISTANCE`. The former
> `REMOTE` type was retired — it always behaved as `ONSITE` — and existing rows
> were converted. A write that still posts `type: "REMOTE"` is accepted and
> stored as `ONSITE`; reads never return `REMOTE`.

> **Schema additions — missed-class follow-up (task #514).** `session_students`
> also gained `missed_email_sent_at` and `attendance_notified_at` (both unix,
> `NULL` until sent) — independent claim-before-send guards for the
> missed-class email and the attendance-signed notification respectively (see
> **Sign Class**), so a re-sign never double-sends either one.
>
> **Schema additions — student attendance signature (task #978).** `trainings`
> gained `attendance_signature_days` (smallint, `0` = no closing date, the
> default) and `attendance_signature_from` (unix, `NULL` = no cut-off) — the
> latter stamped by `Training::beforeSave` on the OFF -> ON transition and
> backfilled for already-enabled courses, so the requirement never applies to
> classes taught before a course adopted it.
> `session_students` gained `signature` (JSON `{time, ip, browser, hash}`,
> `NULL` until the student countersigns — see **Sign Own Attendance**) and
> `signature_requested_at` (unix, the claim-before-send guard for the
> please-sign message raised by **Store Attendance**). These replace
> `activity_progress.signature` for per-session signing: that row is
> `UNIQUE (trainings_user_id, training_activity_id)`, so it holds one
> signature per ACTIVITY and cannot represent two sittings of the same
> lesson. The old column is still readable on historic rows and is no longer
> written.
>
> `sessions` gained `allow_classwork_upload`, `classwork_deadline`,
> `classwork_description`, `classwork_notified_at` (see **Request
> Classwork**) and `justification_deadline` (see **Schedule Class**).
> `trainings` gained `classwork_deadline_default_days` and
> `justification_deadline_default_days` — per-training day counts the client
> uses to pre-fill a new session's deadline fields; both save through the
> existing training-edit endpoint's unrestricted `Training.*` write and are
> not otherwise documented here. A new `session_justifications` table
> (`id`, `session_student_id`, `upload_id`, `text`, `status`
> `ENUM('pending','approved','rejected')`, `reviewed_by`, `reviewed_at`,
> `review_note`, `created`, `modified`) backs **Justifications** / **Submit
> Justification** / **Review Justification** below. A new
> `session_classwork_grades` table (`id`, `session_student_id` **UNIQUE**,
> `upload_id`, `score` `decimal(3,1)`, `feedback`, `graded_by`, `graded_at`,
> `created`, `modified`) backs **Classwork Grades** / **Rate Classwork**
> below.

## My Trainings

<mark style="color:blue;">`GET`</mark> `/trainings.json`

Retrieve the authenticated user's training enrollments, teaching assignments, and upcoming classes. Paginated (30 per page).

#### Path Parameters

| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| user_id | string | No | Optional user UUID to list enrollments for. Ignored unless the caller is an API user; non-API callers always see their own enrollments. Defaults to the authenticated user. |

#### Per-row enrichment

Per-row progress is computed in batch, grouped by `training_id`, so the endpoint runs O(distinct trainings) queries instead of O(rows). Each enrollment is enriched as follows:

- `Training.subjects_count` (always): integer count of `TrainingSubject` rows for the training. The full `TrainingSubject` list is no longer included — fetch it from the training-view endpoint when needed.
- `Training.Lessons` (only when `Training.theory == true`): unified ground-school progress for all training types.
  - Counts mandatory **lessons** + non-lesson-gate **exams** (subject-level + training-level, both ONLINE and ONSITE) as items.
  - Lesson is "done" when `activity_progress.value=1` AND every mandatory lesson-gate exam attached to it has `value=1` (lesson-gate exams gate the lesson but do **not** count as their own item).
  - Onsite-exam item is "done" when `activity_progress.value=1` (recorded via session attendance + manual grading).
  - Online-test item is "done" when any `exam_attempts.passed=1`.
  - Shape: `{ "total": <int>, "completed": <int>, "finished": <bool> }`.
- `Training.FlightProgress` (only when `Training.flights == true`): `{ "completed": <int>, "total": <int> }` — distinct `TrainingFlight` templates marked completed for the enrollment.

The legacy per-row `Training.Progress` field has been **replaced** by `Training.Lessons` (theory) and `Training.FlightProgress` (flights). Clients that read `Progress.total / Progress.completed` should switch to `Lessons.total / Lessons.completed`.

**Removed in this revision** (drop them from clients):

- `Training.TrainingSubject` (the embedded subject list) — replaced by `subjects_count`.
- Top-level `LessonClass` per row (the flattened upcoming-class list) — query the calendar endpoint or the training-view endpoint instead.
- `Training.Phase` and `Training.LastFlight` — removed for performance. Use the manager students-list endpoint when you need them.

#### Response

```json
{
  "trainings": [
    {
      "Training": {
        "id": "10",
        "active": true,
        "type": "DISTANCE",
        "name": "PPL Ground School",
        "validity": null,
        "flights": false,
        "flights_count": "0",
        "theory": true,
        "time_online": true,
        "training_id": "10",
        "enrollment_id": "500",
        "enrollment": "1714003200",
        "supervisor_id": "101",
        "flight_phase": null,
        "status": "ACTIVE",
        "status_reason": null,
        "finish_date": 0,
        "subjects_count": 8,
        "Lessons": {
          "total": 12,
          "completed": 5,
          "finished": false
        }
      }
    },
    {
      "Training": {
        "id": "11",
        "type": "ONSITE",
        "name": "CPL Flight Phase",
        "flights": true,
        "theory": false,
        "training_id": "11",
        "enrollment_id": "501",
        "subjects_count": 0,
        "FlightProgress": { "completed": 4, "total": 18 }
      }
    }
  ],
  "teacher": [
    {
      "TrainingSubject": {
        "id": "20",
        "code": "MET",
        "name": "Meteorology",
        "hours": "40",
        "lessons": "12"
      },
      "Training": { "name": "PPL Ground School", "id": "10" }
    }
  ],
  "myClasses": [
    {
      "Session": {
        "id": "300",
        "training_activity_id": "act-50",
        "datetime": "2025-03-15 09:00:00",
        "status": "scheduled",
        "teacher_id": "101",
        "signature": null,
        "minutes": "120",
        "location_id": "5",
        "remarks": ""
      },
      "TrainingActivity": {
        "id": "act-50",
        "kind": "LESSON",
        "lesson_id": "50",
        "exam_id": null,
        "training_subject_id": "20"
      },
      "Lesson": {
        "name": "Cloud Formation",
        "training_subject_id": "20",
        "TrainingSubject": { "name": "Meteorology" }
      },
      "Exam": null,
      "Teacher": {
        "id": "101",
        "UserDetail": { "name": "Maria", "surname": "Garcia", "id": "101" }
      }
    }
  ]
}
```

---

## Manager Trainings List

<mark style="color:blue;">`GET`</mark> `/manager/trainings.json`

List all trainings for the company. Manager-only (`user_group_id <= 135`). Paginated (50 per page), ordered by name asc.

#### Per-row fields

`Training.id`, `name`, `type`, `active`, `theory`, `flights`, `flights_count`, `competencies`, `metrics`, `announcement`, `start`, `end`, `color`, `created`, plus:

- `students_count` (int): total `trainings_users` rows for the training (every status, not deduplicated by user).
- `subjects_count` (int): non-deleted `training_subjects` rows for the training.

The previous `Student` and `TrainingSubject` association arrays are no longer returned — use the counts instead.

#### Response

```json
{
  "trainings": [
    {
      "Training": {
        "id": "10",
        "name": "PPL Ground School",
        "type": "DISTANCE",
        "active": true,
        "theory": true,
        "flights": false,
        "flights_count": "0",
        "competencies": false,
        "metrics": false,
        "announcement": null,
        "start": null,
        "end": null,
        "color": "#1f77b4",
        "created": "2025-01-15",
        "students_count": "24",
        "subjects_count": "8"
      }
    }
  ]
}
```

---

## Training View

<mark style="color:blue;">`GET`</mark> `/trainings/trainings/view/{id}.json`

Retrieve full details for a specific training enrollment.

#### Path Parameters

| Parameter | Type | Description |
|-----------|------|-------------|
| id | string | Training ID |

#### Response

```json
{
  "training": {
    "TrainingsUser": {
      "id": "500",
      "training_id": "10",
      "user_id": "123",
      "supervisor_id": "101",
      "finish_before": "2025-12-31",
      "status": "ACTIVE",
      "status_reason": null,
      "status_changed": null,
      "validity": null,
      "flight_phase": null,
      "notes": null,
      "created": "2025-01-15",
      "modified": "2025-03-10"
    },
    "Training": {
      "id": "10",
      "name": "PPL Ground School",
      "type": "ground",
      "active": true,
      "theory": true,
      "flights": false,
      "competencies": false,
      "metrics": false,
      "auto_finish": true,
      "allow_auto_restart": false,
      "validity": 31536000,
      "description": "Private Pilot Licence ground theory",
      "TrainingSubject": [
        {
          "id": "20",
          "code": "MET",
          "name": "Meteorology",
          "hours": "40",
          "lessons": "12",
          "training_id": "10",
          "Lesson": [
            { "id": "50", "minutes": "120", "training_subject_id": "20", "mandatory": true }
          ],
          "Exam": [],
          "TrainingActivity": [
            { "id": "act-50", "kind": "LESSON", "lesson_id": "50", "exam_id": null, "order": 10, "mandatory": true }
          ],
          "Progress": { "total": 12, "completed": 5, "finished": false, "lessons": {} }
        }
      ],
      "TrainingFlight": [],
      "Manager": {
        "id": "100",
        "UserDetail": { "name": "Admin", "surname": "User", "id": "100" }
      }
    },
    "User": {
      "id": "123",
      "UserDetail": { "name": "John", "surname": "Doe", "id": "123" }
    },
    "Supervisor": {
      "id": "101",
      "email": "maria@example.com",
      "UserDetail": { "name": "Maria", "surname": "Garcia", "photo": null, "id": "101" }
    },
    "Function": "student",
    "weeklytime": [
      { "week_name": "Week 10", "year": "2025", "week": "10", "week_time": "480" }
    ],
    "Progress": { "total": 12, "completed": 5, "finished": false },
    "TrainingFlightTypes": {},
    "ExamAttempt": [
      {
        "id": "0b06c152-…",
        "exam_id": "6305fe63-…",
        "training_subject_id": "60288e6f-…",
        "start": "1599429600",
        "finish": "1599429600",
        "status": "FINISHED",
        "score": "30",
        "passed": false,
        "Exam": {
          "id": "6305fe63-…",
          "name": "PPL",
          "type": "ONSITE",
          "training_subject_id": "60288e6f-…",
          "training_subject_lesson_id": null
        }
      }
    ]
  },
  "performedFlightTrainings": []
}
```

#### Notes

- `ExamAttempt` lists **every** attempt of this enrollment, online and onsite, oldest first. The per-subject `Exam` list in `Training.TrainingSubject[]` only contains ONSITE exams, so online attempts cannot be derived from it. Rows are flattened — the attempt fields sit at the top level with the exam nested under `Exam`, not wrapped in `ExamAttempt.ExamAttempt`.
- Onsite exams appear twice by design: once here as an attempt, once as the `activity_progress` row on their `TrainingActivity`. Clients that render a single history (the activity timeline does) should keep the activity-progress copy and skip attempts whose `Exam.type == "ONSITE"`.
- `TrainingSubject[].Lesson[]` carries `id`, `name` and `minutes`.

---

## Training Schema Totals

<mark style="color:blue;">`GET`</mark> `/trainings/trainings/schema/{id}.json`

Aggregate counts and durations for a training's ground-school structure and flight missions. Scope: must belong to caller's company.

#### Path Parameters

| Parameter | Type | Description |
|-----------|------|-------------|
| id | string | Training UUID |

#### Response

```json
{
  "schema": {
    "subjects_total": 4,
    "lessons_total": 38,
    "lessons_per_subject": [
      { "id": "20", "name": "Meteorology", "lessons": 12, "hours": 24.5 }
    ],
    "ground_hours_total": 76.0,
    "missions_total": 22,
    "flights_per_flight_type": [
      { "id": "1", "name": "Dual", "missions": 14, "hours": 21.5 },
      { "id": "2", "name": "Solo", "missions": 8,  "hours": 12.0 }
    ],
    "flight_hours_total": 33.5
  }
}
```

Notes:
- `ground_hours_total` derived from `SUM(Lesson.minutes) / 60` across non-deleted lessons in non-deleted subjects.
- `flight_hours_total` derived from `SUM(TrainingFlight.hours)` across non-deleted flight missions.
- `flights_per_flight_type` entries grouped by `TrainingFlight.flight_type_id`; each row carries both `missions` (count) and `hours` (sum).

#### Errors

| Status | Reason |
|--------|--------|
| 400    | Missing training id |
| 404    | Training not found in caller's company |

---

## Student Summary

<mark style="color:blue;">`GET`</mark> `/trainings/students/summary/{enrollmentId}.json`

Compact progress + attendance roll-up for an enrollment. Cheap to call (no nested rows) — designed for dashboards, modals, and mission-tab headers that don't need the full `TrainingsUser` view.

#### Path Parameters

| Parameter | Type | Description |
|-----------|------|-------------|
| enrollmentId | string | `TrainingsUser.id` (UUID) |

#### Access

- Manager-level callers (`user_group_id <= 170`): any enrollment in caller's company.
- Student-level callers (`user_group_id > 170`): only their own enrollment — `403` otherwise.

#### Response

```json
{
  "result": {
    "training_id":   "1a2b...",
    "enrollment_id": "9f8e...",
    "user_id":       "42",
    "status":        "ACTIVE",
    "status_reason": null,
    "theory": {
      "progress":   { "total": 38, "completed": 21, "percentage": 55 },
      "attendance": { "given":  42, "taken":     31, "percentage": 73 }
    },
    "flight": {
      "progress":   { "total": 22, "completed": 9,  "percentage": 41 },
      "attendance": { "attempts": 14, "passed": 9,  "percentage": 64 },
      "hours":      { "planned": 33.5, "flown":  18.2 }
    }
  }
}
```

#### Field semantics

- `theory.progress` — derived from `Training::getProgress` (mandatory `training_activities` in scope, all subjects). `completed` includes LESSON activities marked attended **and** EXAM activities passed (gate exams gate the corresponding lesson's completion). `percentage = floor(completed * 100 / total)`.
- `theory.attendance` — derived from `Training::getAttendance`. `given` = `session_students.invited = 1` rows whose `sessions.training_activity` is subject-scoped and `sessions.datetime < now()`. `taken` = subset where `attended = 1`.
- For `Training.type == "DISTANCE"` the `attendance` block mirrors `progress` (no live sessions exist for distance training).
- `flight` is `null` when `Training.flights == false`.
- `flight.progress` — `total` = count of `TrainingFlight` templates in the training. `completed` = distinct templates with at least one `UserTrainingFlight.completed = 1` row (flight `status = LANDED`). Same logic as `Training.FlightProgress` in `My Trainings`.
- `flight.attendance` — per-mission attempt counts across all `user_training_flights` for the enrollment (each row = one attempt). `passed = sum(completed = 1)`. Useful for "X attempts / Y passes" badges.
- `flight.hours.planned` = `SUM(TrainingFlight.hours)`. `flight.hours.flown` = `SUM(Flight.block_time) / 3600` over flights with `status = LANDED` linked through `user_training_flights`. Rounded to one decimal.
- `status` mirrors `TrainingsUser.status` — one of `ACTIVE`, `COMPLETED`, `STOPPED`, `FAILED`, `EXPELLED`. `status_reason` is the free text a manager gave when closing the enrollment, `null` otherwise. See [Enrollment status](#enrollment-status).

#### Errors

| Status | Reason |
|--------|--------|
| 400    | Missing enrollment id |
| 403    | Student requesting another user's enrollment |
| 404    | Enrollment not found / Training not found in caller's company |

---

## My Subjects

<mark style="color:blue;">`GET`</mark> `/trainings/subjects/mine.json`

Retrieve subjects assigned to the authenticated user (as student).

#### Response

```json
[
  {
    "Training": { "id": "10", "name": "PPL Ground School" },
    "TrainingSubject": [
      { "id": "20", "code": "MET", "name": "Meteorology", "teacher_id": "101", "training_id": "10" }
    ]
  }
]
```

---

## Subject View

### Manager View

<mark style="color:blue;">`GET`</mark> `/manager/trainings/subjects/view/{id}.json`

Retrieve subject details for the manager UI: subject metadata, full lesson list, subject-level exams, and the unified `TrainingActivity` ordering used for drag-drop reordering.

Notes:
- `Exam` is filtered to **subject-scope** rows only (`training_subject_lesson_id IS NULL`); lesson-gate exams are nested under their parent lesson elsewhere. Both `ONSITE` and `ONLINE` types are included.
- `TrainingActivity` is the unified activity ordering. The endpoint **backfills** missing `TrainingActivity` rows for any pre-v2 lesson/exam on read, undeleting any soft-deleted row that reuses the same `lesson_id`/`exam_id` (the unique keys ignore the `deleted` flag, so a fresh insert would 1062-collide). When a backfill happens the activity list is re-fetched so the response is consistent.
- `total_minutes` is the sum of mandatory lesson `minutes`.
- The teacher picker list is **no longer** part of this response — fetch it from `/manager/trainings/subjects/teachers.json` (see below).

#### Response

```json
{
  "subject": {
    "TrainingSubject": {
      "id": "20",
      "name": "Meteorology",
      "code": "MET",
      "description": "Weather theory for pilots",
      "hours": "40",
      "teacher_id": "101",
      "active": true,
      "total_minutes": 2400
    },
    "Lesson": [
      { "id": "50", "name": "Cloud Formation", "minutes": "120", "order": "1", "mandatory": true }
    ],
    "Exam": [
      { "id": "e-9", "name": "Final", "type": "ONSITE", "mandatory": true, "order": "1" }
    ],
    "TrainingActivity": [
      { "id": "act-50", "kind": "LESSON", "lesson_id": "50", "exam_id": null, "order": "1", "mandatory": true },
      { "id": "act-e9", "kind": "EXAM",   "lesson_id": null, "exam_id": "e-9", "order": "2", "mandatory": true }
    ],
    "Teacher": { "id": "101" }
  }
}
```

---

### Manager Teachers

<mark style="color:blue;">`GET`</mark> `/manager/trainings/subjects/teachers.json`

Return the teacher-picker list (formerly bundled inside `manager_view`). Users are scoped to the caller's `company_id` and to user groups with `instructor_teacher = 1`.

The payload is a `Hash::combine` of `id → "name surname"`, grouped by user-group name.

#### Response

```json
{
  "users": {
    "Instructor": {
      "101": "Maria Garcia",
      "102": "John Smith"
    },
    "Chief Instructor": {
      "55": "Anna Lopez"
    }
  }
}
```

---

### Manager Reorder Activities

<mark style="color:green;">`POST`</mark> `/manager/trainings/subjects/reorder_activities.json`

Persist a new order for the unified activity list (lessons + non-lesson-gate exams) of a single subject. Writes contiguous `TrainingActivity.order` via `TrainingActivity::resequence`.

| Field | Type | Required | Description |
|-------|------|----------|-------------|
| id    | string | Yes | Subject UUID |
| items | string[] | Yes | Ordered list of `training_activity_id`. IDs not belonging to the subject are silently dropped (whitelist). |

Authorization: caller's company must own the training; non-admin users (`user_group_id > 135`) must be the subject's teacher.

#### Response

```json
{ "result": true }
```

---

### Manager Activity Impact

<mark style="color:green;">`POST`</mark> `/manager/trainings/subjects/activity_impact.json`

Read-only preview of the student-progress impact of soft-deleting a lesson or an exam. The UI calls this immediately before showing the destructive confirm dialog so the manager can be warned with the count of enrollments whose progress would be reset.

The endpoint resolves which `TrainingActivity` rows would be affected:
- `lesson_id` → the `LESSON` activity for that lesson plus every `EXAM` activity bound to a gate exam (`exams.training_subject_lesson_id = lesson_id`).
- `exam_id`   → the single `EXAM` activity for that exam.

Pass exactly one of `lesson_id` or `exam_id`. The aggregates run over `ActivityProgress` (distinct `trainings_user_id`), `ExamAttempt` and `TrainingSession`; nothing is mutated.

| Field      | Type   | Required          | Description |
|------------|--------|-------------------|-------------|
| lesson_id  | string | One of these two  | Lesson UUID |
| exam_id    | string | One of these two  | Exam UUID |

Authorization: caller's company must own the training the entity belongs to. The endpoint walks the same resolution paths used by the corresponding delete actions (lesson → subject → training, exam → training | training_subject → training | training_subject_lesson → subject → training) and returns `404` if the entity is missing or out of company scope. Soft-deleted (`deleted=1`) lessons / subjects / trainings are still resolvable so the caller can preview impact of an already-removed entity; the `404.message` field disambiguates the failure (`Lesson not found: …`, `Training subject not found for lesson …`, `Lesson not accessible for current company`).

#### Response

```json
{
  "result": true,
  "impact": {
    "activityIds": ["act-50", "act-e50"],
    "studentsCompleted": 12,
    "studentsTouched": 17,
    "examAttempts": 34,
    "sessions": 2
  }
}
```

- `studentsCompleted` — distinct enrollments with `ActivityProgress.value = 1` on any of the affected activities (the count that needs warning).
- `studentsTouched`   — distinct enrollments with any `ActivityProgress` row on the affected activities (`>= studentsCompleted`).
- `examAttempts`      — total `ExamAttempt` rows that reference the affected exams (audit context).
- `sessions`          — total `TrainingSession` rows linked to the affected activities (audit context).

When every count is `0` the UI may skip the impact block and show the regular destructive warning.

---

### Add / Edit Exam

<mark style="color:green;">`POST`</mark> `/manager/trainings/subjects/add_exam.json`

Create or update an exam on a subject. Send `id` to edit, omit to create (a `TrainingActivity` of `kind=EXAM` is seeded for new exams).

| Field | Type | Required | Description |
|-------|------|----------|-------------|
| training_subject_id | string | Yes | Subject UUID. |
| id | string | No | Exam UUID — present = edit, absent = create. |
| type | enum | No | `ONLINE` \| `ONSITE` (default `ONSITE`). |
| name | string | Yes | Exam name. |
| reference, description, minutes, mandatory, caa_exam | mixed | No | Common fields. |
| questions, attempts, score, instructions, show_answers, expiration | mixed | No | **ONLINE only.** |
| access_mode | enum | No | **ONLINE only.** `FREE` \| `SCHEDULED` (default `FREE`). `SCHEDULED` gates the exam behind a session. Ignored / forced `FREE` for `ONSITE`. |
| access_window_days | int | No | **ONLINE + `SCHEDULED` only.** Days the window stays open after session start. Default `10` (used when omitted or `<= 0`). |

Authorization: caller's company must own the training; non-admin users (`user_group_id > 135`) must be the subject's teacher.

### List Schedulable Exams

<mark style="color:blue;">`GET`</mark> `/manager/trainings/exams/list/{subjectId}.json`

Exams in a subject that can be **scheduled into a session**: all `ONSITE` exams, **plus** `ONLINE` exams with `access_mode='SCHEDULED'`. `FREE` online exams are never scheduled and are excluded. Each row carries `type` and `access_mode` (plus `access_window_days`) so the UI can badge them.

---

### Student View

<mark style="color:blue;">`GET`</mark> `/trainings/subjects/view/{enrollmentId}/{subjectId}.json`

Retrieve subject details with the full unified activity list (lessons + exams) and the enrolled student's progress, attendance and exam attempts.

**Who can call this:** the enrolled student, the subject teacher, and managers (`user_group_id <= 150`). The endpoint resolves the student via `{enrollmentId}` (the `TrainingsUser.id` URL param), so attempts / progress / attendance always reflect that student regardless of which user is authenticated.

**Activity list:** `subject.TrainingActivity[]` is the canonical ordered list, sorted by `TrainingActivity.order ASC`. Lessons and exams are interleaved as a single sequence — typically `lesson → its gate exam → next lesson → next gate exam → … → subject-scope exams at the end`. Missing `TrainingActivity` rows are backfilled on read (live lesson / subject-scope exam without a TA row gets one inserted; a deleted TA row whose source is live again gets undeleted) so every live lesson and exam in the subject is guaranteed to appear.

**Per-activity payload:**
- LESSON activities carry the `Lesson` payload and a `Sessions[]` list — one entry per `TrainingSession` under that activity where the student has a `SessionStudent` row, ordered by `Session.datetime ASC`. Each entry has `Session: {id, datetime, minutes}` and `SessionStudent: {id, invited, attended}`. `attended` is resolved from the matching `ActivityProgress.value` (joined by `session_id`) when an `ActivityProgress` row exists for that session — that is where `OnsiteController::attendance` writes attendance. Sessions without a matching `ActivityProgress` row fall back to the raw `session_students.attended` column.
- EXAM activities carry the `Exam` payload with its `ExamAttempt[]` list for this enrollment (newest first). Onsite-exam `ActivityProgress` rows are sorted by `Session.datetime` ascending.

**Reset filter:** if an exam activity has been reset (`ActivityProgress.reset_at` is set), the `ExamAttempt[]` list under that activity contains only attempts where `start > reset_at` (falling back to `created` when `start` is empty). Pre-reset attempts are hidden from the student here; they remain in the DB and are surfaced — flagged with `reset: true` — in `GET /manager/trainings/students/view/{enrollmentId}.json` for manager review.

#### Response

```json
{
  "trainingsUserId": "500",
  "displayDetails": false,
  "enrollment": { "TrainingsUser": { "id": "500", "user_id": "900", "training_id": "10" } },
  "subject": {
    "TrainingSubject": {
      "id": "20",
      "training_id": "10",
      "name": "Meteorology",
      "code": "MET",
      "teacher_id": "101"
    },
    "Training": {
      "id": "10",
      "name": "PPL Ground School",
      "type": "DISTANCE",
      "time_online": true,
      "active": true,
      "allow_auto_restart": true
    },
    "TrainingActivity": [
      {
        "TrainingActivity": { "id": "act-50", "kind": "LESSON", "lesson_id": "50", "exam_id": null, "order": 1, "mandatory": true },
        "Lesson": { "id": "50", "name": "Cloud Formation", "minutes": 120 },
        "ActivityProgress": [
          { "id": "ap-1", "value": 1, "time": 1800, "session_id": "s-1", "created": "2025-03-01 09:00:00", "Session": { "id": "s-1", "datetime": "2025-03-01 09:00:00" } }
        ],
        "Sessions": [
          { "Session": { "id": "s-1", "datetime": "2025-03-01 09:00:00", "minutes": 60 }, "SessionStudent": { "id": "ss-1", "invited": true, "attended": true } },
          { "Session": { "id": "s-2", "datetime": "2025-03-08 09:00:00", "minutes": 60 }, "SessionStudent": { "id": "ss-2", "invited": true, "attended": false } }
        ]
      },
      {
        "TrainingActivity": { "id": "act-e50", "kind": "EXAM", "lesson_id": null, "exam_id": "e-50-gate", "order": 2, "mandatory": true },
        "Exam": {
          "id": "e-50-gate",
          "name": "Cloud Formation — gate",
          "type": "ONLINE",
          "attempts": 2,
          "score": 75,
          "questions": 10,
          "minutes": 15,
          "training_subject_id": "20",
          "training_subject_lesson_id": "50",
          "ExamAttempt": [
            { "id": "att-2", "start": 1741420000, "finish": 1741420900, "passed": true, "status": "FINISHED", "score": 80, "created": "2025-03-08 10:00:00" }
          ]
        },
        "ActivityProgress": []
      },
      {
        "TrainingActivity": { "id": "act-e9", "kind": "EXAM", "lesson_id": null, "exam_id": "e-9", "order": 99, "mandatory": true },
        "Exam": { "id": "e-9", "name": "Final", "type": "ONSITE", "training_subject_id": "20", "training_subject_lesson_id": null, "ExamAttempt": [] },
        "ActivityProgress": [
          { "id": "ap-2", "value": 1, "score": "85", "code": "PASS", "session_id": "s-3", "created": "2025-03-15 10:00:00", "Session": { "id": "s-3", "datetime": "2025-03-15 10:00:00" } }
        ]
      }
    ],
    "Progress": { "total": 12, "completed": 5, "finished": false, "lessons": {} }
  }
}
```

Legacy fields `subject.Lesson[]` and `subject.Exam[]` are no longer emitted by this endpoint — consume `subject.TrainingActivity[]` and branch on `TrainingActivity.kind`.

---

## Lessons

### View Lesson

<mark style="color:blue;">`GET`</mark> `/trainings/lessons/view/{lessonId}/{enrollmentId}.json`

Retrieve lesson details and attendance records.

#### Response shape

- `lesson`: the lesson with `TrainingSubject` (incl. `Training`) and `LessonSlide` ids.
- `enrollment`: the validated `TrainingsUser.id` (or `null` when no enrollment was passed).
- `attendance`: this student's `ActivityProgress` rows for the lesson's LESSON activity (`User.UserDetail` joined for display).
- `testAuthorization`: `true` when the student may take the lesson-gate test (has slides done, or no slides / no time-online requirement).
- `nextActivity`: the next `TrainingActivity` in the same subject, ordered by `TrainingActivity.order`. May be a LESSON or an EXAM — the response carries either an embedded `Lesson` or `Exam` payload accordingly. `null` when this lesson is the last activity in the subject. Orphan exam activities (deleted/missing Exam) are skipped over automatically.

`nextActivity` example (next item is the lesson-gate exam):

```json
{
  "nextActivity": {
    "TrainingActivity": {
      "id": "act-e50",
      "kind": "EXAM",
      "lesson_id": null,
      "exam_id": "e-50-gate",
      "order": 55,
      "mandatory": true
    },
    "Exam": {
      "id": "e-50-gate",
      "name": "Cloud Formation — gate",
      "type": "ONLINE",
      "attempts": 2,
      "score": 75,
      "questions": 10,
      "minutes": 15,
      "training_subject_id": "20",
      "training_subject_lesson_id": "50"
    }
  }
}
```

> Replaced the legacy `nextLesson` field. Clients that read `nextLesson` should switch to `nextActivity` and branch on `nextActivity.TrainingActivity.kind`.

### Lesson Slides

<mark style="color:blue;">`GET`</mark> `/trainings/lessons/slides/{lessonId}.json`

Retrieve e-learning slides for a lesson.

### View Slide

<mark style="color:blue;">`GET`</mark> `/trainings/lessons/slide/{slideId}.json`

Retrieve a single slide with content and navigation.

### Complete Lesson

<mark style="color:green;">`POST`</mark> `/trainings/lessons/complete.json`

Mark a lesson's slides as completed. Sent as `application/x-www-form-urlencoded`.

| Field | Type | Required | Description |
|-------|------|----------|-------------|
| lessonId | string | Yes | Lesson ID |
| timeSpent | number | Yes | Time spent in seconds |
| enrollmentId | string | Yes | Enrollment ID |

#### Response

```json
{
  "result": true,
  "finished": false,
  "trainingId": "10",
  "next": {
    "title": "Wind Patterns",
    "action": "lesson",
    "id": "51",
    "enrollmentId": "500"
  }
}
```

### Reset Lesson (student self-service)

<mark style="color:green;">`POST`</mark> `/trainings/lessons/reset.json`

Allows a **student** to wipe their own progress on a single lesson — both the lesson's `ActivityProgress` and the lesson-gate online exam attempts — so they can take the lesson again. Intended for DISTANCE trainings where a student has exhausted attempts on the gate exam without passing, and the course operator has opted in to self-recovery.

Sent as JSON.

#### Body

```json
{
  "enrollmentId": "500",
  "lessonId": "50"
}
```

| Field | Type | Required | Description |
|-------|------|----------|-------------|
| enrollmentId | string | Yes | `TrainingsUser.id` — must belong to the authenticated user |
| lessonId | string | Yes | `Lesson.id` — must belong to the enrolled training |

#### Guards (all must pass or the call rejects with 400/404)

- The enrollment exists and `TrainingsUser.user_id == auth user id` (you can only reset your own progress).
- `Training.type == 'DISTANCE'`.
- `Training.allow_auto_restart == 1`.
- The lesson belongs to the enrolled training.
- The lesson has at least one **ONLINE** lesson-gate exam (`exams.training_subject_lesson_id = lessonId AND type='ONLINE'`).
- At least one of those gate exams is in a **failed** state for this enrollment: `COUNT(ExamAttempt) >= Exam.attempts` and no attempt passed.

#### Side effects on success

Reset is **non-destructive**. `ExamAttempts` are retained for audit; `ActivityProgress` rows are kept and stamped with a reset boundary:

- For the lesson activity AND each lesson-gate exam activity, the corresponding `ActivityProgress` row is upserted with `reset_at = UNIX_TIMESTAMP(now)` and the user-visible state is cleared: `value=0`, `attempts_count=0`, `score=NULL`, `code=NULL`, `notes=NULL`, `last_attempt_id=NULL`.
- `ExamAttempts` rows are **not** deleted. The manager student-view surfaces them with a `reset: true` flag so reviewers can see the pre-reset cycle.
- Downstream attempt counting (the "max attempts" gate on `POST /trainings/exams/start/...`) and the pass/score aggregation (`ActivityProgress::recordExamAttempt`) only consider attempts where `ExamAttempt.created > ActivityProgress.reset_at` — so the student starts fresh.

The enrollment row is **not** touched. If the enrollment was `status='COMPLETED'` before the reset (unlikely on a DISTANCE in the failed branch), it stays completed — change it manually if needed.

#### Response

```json
{
  "result": true,
  "message": "You can now restart the lesson."
}
```

`400` reasons: missing fields, training not DISTANCE, `allow_auto_restart=0`, lesson has no gate exam, lesson not in failed state.
`404` reasons: enrollment doesn't belong to you, lesson not in this training.

### Lesson Attendance

<mark style="color:blue;">`GET`</mark> `/trainings/lessons/attendance/{subjectId}.json`

Retrieve attendance records for all lessons in a subject.

---

## Class Sessions

### View Class

<mark style="color:blue;">`GET`</mark> `/trainings/onsite/class/{id}.json`

Retrieve class session details including attendance.

Response `class` payload contains:

- `Session`, `Teacher`, `SessionStudent`, `Location`.
- `teacher` — `true` when the requester is the session's teacher, the subject's teacher (`TrainingActivity.TrainingSubject.teacher_id`), or a manager (`user_group_id <= 140`). Recomputed server-side on every call from the session/subject data — the same definition `attendance()` independently recomputes below, so the two never disagree.
- `enrollment` — the requester's `TrainingsUser.id` for this training, or `null`. Being on the session roster (`session_students`, e.g. a pilot-group invite or manual add with no enrollment) is enough to open the class even without one; `enrollment=null` is what the client uses to explain the missing progress/evaluation in that case. Below `user_group_id 170`, a caller who is neither enrolled, on the roster, nor a teacher/manager gets a 404.
- `attendances` — the session roster, returned by an internal call to `attendance()`; see **Attendance** below for the full per-row shape and its own access rule.
- `Session.signature`, when present, has its server-only `statuses` baseline stripped (and the same key inside every `history` entry) — see **Sign Class**'s note on `statuses`. This action has no teacher/student gate on the roster it exposes, so leaving `statuses` in would let any enrolled student read every classmate's attendance baseline.
- `TrainingActivity` — the bound activity (`id`, `kind`, `lesson_id`, `exam_id`, `training_subject_id`) with its nested children:
  - `TrainingActivity.TrainingSubject` including `Training` and `Training.Metric[]` — competency metrics defined on the training (`id`, `name`, `training_id`), ordered by name. Used to render the metric grid alongside attendance without an extra request.
  - `TrainingActivity.Lesson` (when `kind=LESSON`) with `LearningObjective[]` — objectives attached to the lesson (`id`, `name`, `description`, `training_subject_lesson_id`), ordered by name.
  - `TrainingActivity.Exam` (when `kind=EXAM`) — includes `type` and `access_mode`, so the session page knows to render the student exam-taking panel for a `SCHEDULED` online exam.
- `attendances` — `ActivityProgress` rows for the session (scoped to the requesting user unless teacher/manager).

Alongside `class`, the response carries:

- `classwork_submitted` — `true` when the requester has an active `SessionClasswork` upload of their own on this session. One count query; lets a client render the homework state without waiting on the uploads list.
- `signature_required` — whether THIS class is subject to the student attendance-signature requirement: the course flag AND the session falling at or after `trainings.attendance_signature_from`. Clients must gate the signature UI and the register's SIGNED column on this, **not** on `Training.attendance_signature`, which alone would render classes taught before the rule as unsigned.
- `classwork_grade` — **the requester's own** homework grade for this session, or `null` when they have not been graded (or are not on the roster). `{ score: 0.0-10.0 | null, feedback: string | null, graded_at: int }`. Scoped by construction: the roster row is resolved by (session, caller), so it can never return another student's mark. This exists because students are ACL-denied the Onsite sub-actions and so cannot call **Classwork Grades** — it is the only way a student reads their own grade. Reviewers get their own row here too, and use **Classwork Grades** for the roster.

### Attendance

<mark style="color:blue;">`GET`</mark> `/trainings/onsite/attendance/{sessionId}/{teacherParam}.json`

Return the roster and attendance for a class session. Called internally by **View Class** (its `attendances` field is this response), and independently reachable at its own URL/ACO.

The `{teacherParam}` URL segment is accepted for route compatibility only and is **ignored** — whether the caller sees the full roster is always recomputed server-side from the session/subject teacher and `user_group_id <= 140`, the same rule **View Class**'s `teacher` field uses. It cannot be used to grant teacher-level access from the URL.

Company-scoped: the session's `Training.company_id` must match the caller's company, or `404 Training Session not found`.

#### Response

`attendances` is an object keyed by `trainings_user_id` (or `ss-{session_student_id}` when the roster row has no matching `activity_progress`), one entry per roster row, sorted by `user_name`:

| Field | Description |
|-------|-------------|
| id | `ActivityProgress.id`, or `null` if none exists yet for this user/activity |
| session_student_id | `session_students.id` |
| attendance_status | `attended` \| `attended_post_class` \| `absent` \| `absent_justified` \| `null` |
| enrolled | `true` when the roster user has any `trainings_users` row for this training (any status), matching `store_attendance`'s write guard |
| value | boolean, `true` when `attendance_status` is `attended` or `attended_post_class` |
| user_id, user_name, user_group, photo | roster user display fields |
| time, remarks, measures, modified, created | from the matching `activity_progress` row, `null` if none |
| signature | the **student's own** attendance signature for THIS session, from `session_students.signature`: `{ time }` and nothing else, or `null`. The stored `ip`, `browser` and `hash` are never returned — a class payload is readable by the whole roster. Previously read from `activity_progress.signature`, which is per-activity and could not distinguish two sittings of the same lesson |
| can_sign | `true` when the caller may countersign this row right now. **Only answered for the caller's own row**; `null` on everyone else's |
| sign_blocked_reason | why `can_sign` is false: `not_required` \| `not_attended` \| `not_yet_open` \| `window_closed` \| `already_signed`. Own row only. `not_required` covers both "this course does not ask" and "this class predates the requirement" |
| exam_status, exam_rating, code, notes | from `activity_progress.value` / `score` / `code` / `notes` — exam activities only |

**Access.** Non-teacher, non-manager callers (`user_group_id > 140` and not the session/subject teacher) see only their own roster row. Teachers and managers see every row. Roster rows with `session_students.user_id IS NULL` (an unexpanded pilot-group placeholder) are excluded entirely.

### Schedule Class

<mark style="color:green;">`POST`</mark> `/manager/trainings/onsite/class.json`

Create or update a class session. Sent as `application/x-www-form-urlencoded`.

| Field | Type | Required | Description |
|-------|------|----------|-------------|
| training_activity_id | string | Yes | Activity ID (kind=LESSON or kind=EXAM). Replaces the old training_subject_lesson_id / training_subject_exam_id pair. |
| start | string | Yes | Start datetime |
| teacher_id | string | Yes | Teacher user ID |
| location_id | string | No | Location ID |
| remarks | string | No | Notes |
| notify | boolean | No | Send notification to students |
| students | string | Yes | Comma-separated student user IDs (creates `session_students` rows with `invited=1`). |
| allow_classwork_upload | boolean | No | Whether students may upload classwork for this session |
| classwork_deadline | int | No | Unix timestamp deadline for classwork upload, or empty to clear |
| classwork_description | string | No | Classwork brief shown to students |
| justification_deadline | int | No | Unix timestamp — deadline for a student to submit an absence justification for this session. Sent on every save; absent or empty clears it to `NULL` (unlike the three classwork fields below, this one is **not** preserve-when-omitted). |

A `training_activity_id` may be the activity of a `SCHEDULED` online exam (`kind=EXAM`, online). No special handling is needed beyond the standard access gate — the roster (`students`) defines who may take the exam during the window that opens at `start`.

**Classwork fields are preserved when omitted.** `allow_classwork_upload`, `classwork_deadline`, and `classwork_description` are normally set via **Request Classwork** below, not this endpoint. When editing an existing session, any of the three that is absent from the payload keeps its currently stored value rather than being reset to off/empty — an unrelated edit (date, teacher, location) never silently cancels a teacher's already-saved homework request. A field is only changed when the caller explicitly includes it. A brand-new session has nothing to preserve and defaults to off/no-deadline/no-description.

### Request Classwork

<mark style="color:green;">`POST`</mark> `/trainings/onsite/request_classwork.json`

Enable, edit, or cancel a classwork upload request for a session. The only write path for `classwork_description`; `manager_class` only ever preserves it.

| Field | Type | Required | Description |
|-------|------|----------|-------------|
| session_id | string | Yes | `TrainingSession.id` |
| allow_classwork_upload | boolean | No | Enable/disable the request |
| classwork_deadline | int | No | Unix timestamp; empty/absent clears it to `NULL` |
| classwork_description | string | No | Homework brief. `400 Homework description is too long (2000 characters max)` above 2000 characters (`mb_strlen`) |

**Access.** Company-scoped (`404 Training Session not found`). Caller must be the session's or subject's teacher, or a manager (`user_group_id <= 140`), else `404 Not authorized to modify this class`. Blocked once the session is signed: `400 Attendance for this class is already signed.`

**Side effect — roster notification.** On the disabled/never → enabled transition only (never on disable, never on an edit of an already-enabled request), every enrolled roster student gets a non-urgent in-app message with the training/subject/date/location, the homework brief, and the deadline. Guarded by `Session.classwork_notified_at` (claim-before-send, reset to `NULL` on every disable so a later re-enable notifies again). Notification failure does not fail the request.

#### Response

```json
{ "result": true }
```

### Delete Class

<mark style="color:blue;">`GET`</mark> `/manager/trainings/onsite/delete_class/{classId}/true.json`

Delete a scheduled class session.

### Session Report

<mark style="color:blue;">`GET`</mark> `/trainings/onsite/session_report/{start}/{end}[/{training_id}].json`

Report of class sessions in a date range with per-user attendance totals. Company-scoped via `Training.company_id`.

#### Path Parameters

| Param | Type | Required | Description |
|-------|------|----------|-------------|
| start | string\|int | Yes | Inclusive lower bound for `Session.datetime`. Accepts a unix timestamp or any `strtotime`-parseable string (e.g. `2026-01-01`). |
| end | string\|int | Yes | Inclusive upper bound for `Session.datetime`. Same accepted formats as `start`. |
| training_id | int | No | Optional `Training.id` filter — only sessions whose subject belongs to this training. |

#### Response

```json
{
  "sessions": [
    {
      "id": "s-1",
      "datetime": 1767225600,
      "minutes": 90,
      "status": "closed",
      "training_id": "t-1",
      "training": "B737 Recurrent",
      "subject_id": "sub-1",
      "subject": "Performance",
      "kind": "LESSON",
      "activity": "Takeoff Performance",
      "teacher_id": "u-9",
      "teacher_name": "Jane Doe"
    }
  ],
  "users": [
    {
      "user_id": "u-1",
      "user_name": "John Smith",
      "user_group": "Pilot",
      "sessions_invited": 5,
      "sessions_attended": 4,
      "minutes_invited": 450,
      "minutes_attended": 360
    }
  ],
  "filters": { "start": 1767225600, "end": 1769904000, "training_id": "t-1" }
}
```

#### Field semantics

- `sessions[]` — every `TrainingSession` whose `datetime` falls in `[start, end]` (any status, future or past within the window). Sorted by `datetime ASC`.
- `users[]` — aggregated from `activity_progress` rows attached to the matched sessions. Every distinct `user_id` with an `activity_progress` row is included (invited set).
  - `sessions_invited` / `minutes_invited` — count and sum of `Session.minutes` across every `activity_progress` row for the user.
  - `sessions_attended` / `minutes_attended` — subset where `activity_progress.value` is truthy.
- Users sorted alphabetically by `user_name`.

#### Errors

| Status | Body | When |
|--------|------|------|
| 400 | `Missing start or end date` | Path param null |
| 400 | `Invalid start or end date` | `strtotime` returned false / 0 |

### List Scheduled Sessions

<mark style="color:blue;">`GET`</mark> `/manager/trainings/onsite/sessions.json`

List scheduled class sessions in a date range. Company-scoped via `Training.company_id`.

#### Query Parameters

| Param | Type | Required | Description |
|-------|------|----------|-------------|
| start | string\|int | Yes | Inclusive lower bound for `Session.datetime`. Accepts a unix timestamp, or a date/datetime string parsed in `timeZone` (e.g. `2026-05-18`). |
| end | string\|int | Yes | Inclusive upper bound. Date-only values (no `T` and no `:`) are extended to `23:59:59` of that day in `timeZone`. |
| timeZone | string | No | IANA timezone name used to interpret `start`/`end` and to format response timestamps. Defaults to `UTC`. |
| training | string | No | Optional `Training.id` filter — only sessions whose subject belongs to this training. |

#### Response

```json
{
  "sessions": [
    {
      "id": "s-1",
      "start": "2026-05-19T09:00:00+00:00",
      "end": "2026-05-19T10:30:00+00:00",
      "duration_minutes": 90,
      "kind": "LESSON",
      "activity": "Takeoff Performance",
      "training": "B737 Recurrent",
      "teacher": { "id": "u-9", "name": "Jane", "surname": "Doe" },
      "location": "Classroom A"
    }
  ],
  "filters": {
    "start": 1747526400,
    "end": 1748217599,
    "timeZone": "UTC",
    "training": null
  }
}
```

#### Field semantics

- `sessions[]` — every `TrainingSession` whose `datetime` falls in `[start, end]`. Sorted by `datetime ASC`.
- `start` / `end` — ISO 8601 with offset, formatted in the supplied `timeZone`. `end = start + duration_minutes`.
- `kind` — `LESSON` or `EXAM` from the bound `TrainingActivity`.
- `activity` — the `Lesson.name` (kind=LESSON) or `Exam.name` (kind=EXAM).
- `training` — `Training.name`.
- `teacher` — `Teacher.UserDetail.name` / `surname`; `id` is the user id.
- `location` — `Location.name`, empty string if the session has no location.

#### Errors

| Status | Body | When |
|--------|------|------|
| 400 | `Missing start or end` | Query param missing or empty |
| 400 | `Invalid timeZone` | `DateTimeZone` rejected the name |
| 400 | `Invalid start` / `Invalid end` | Date string could not be parsed |

### Store Attendance

<mark style="color:green;">`POST`</mark> `/trainings/onsite/store_attendance.json`

Record attendance for a class session. The payload is now keyed by `session_students.id` (was `activity_progress.id`); each entry carries an `attendance_status` value rather than a bare 1/0 flag.

**Body**

| Field | Type | Required | Description |
|-------|------|----------|-------------|
| data[session_id] | string | Yes | `TrainingSession.id` |
| data[attendance][{session_student_id}][attendance_status] | string | No | One of `attended`, `attended_post_class`, `absent`, `absent_justified`. `400 Invalid attendance status: {value}` if set to anything else. |
| data[attendance][{session_student_id}][exam_value] | int/bool | No | EXAM activities only — teacher pass/fail grade, written to `activity_progress.value` alongside (not derived from) attendance |
| data[attendance][{session_student_id}][exam_rating] | number | No | Exam score |
| data[attendance][{session_student_id}][notes] | string | No | Exam notes |
| data[attendance][{session_student_id}][code] | string | No | Exam code |

Only the fields actually present in a row are written — an attendance-only save never clobbers a grade, and vice versa.

**Empty attendance map is a no-op, not an error.** `data[attendance]` absent, non-array, or `{}` returns `{"store": true, "grades": []}` rather than `400 Missing POST params`. The client drops unenrolled rows before posting, so a session whose entire roster is unenrolled (or has no students at all) legitimately submits nothing — and since **Sign Class** saves attendance before signing, the old 400 blocked signing that class outright.

**Access.** Company-scoped (`404 Training Session not found` if the session's training belongs to another company). `user_group_id <= 140` (manager) may always write; above that, the caller must be the session's `teacher_id` or the subject's `teacher_id`, else `404 Not authorized to modify this class attendance`.

**Enrollment guard.** Any row whose `session_students.user_id` has no `trainings_users` row for this training (any status) is refused outright — `400 Cannot record attendance for a student not enrolled in this training.` Checked for every row before anything is written, so one bad row fails the whole request.

**Closed sessions.** Once `Session.status` is no longer `open`/`scheduled`, non-managers (`user_group_id > 140`) may only submit the transition `absent`/`absent_justified` → `attended_post_class`; any other change on a closed session is rejected with `400 Attendance for this class is closed.` Managers are exempt.

#### Response

```json
{ "store": true, "grades": [ { "session_student_id": "ss-1", "user_id": "u-1", "value": 1 } ] }
```

`grades[]` lists the rows actually applied: `{session_student_id, user_id, value}` for a LESSON activity's derived attendance, or `{session_student_id, user_id, ...submitted exam fields}` for an EXAM activity's grade fields.

**Side effect — student signature request.** On a training with `attendance_signature = 1` **and** a session at or after `attendance_signature_from`, every roster row that is now eligible to countersign (see **Sign Own Attendance**) gets one non-urgent in-app message asking the student to sign, sender = the caller, linking to `FRONTEND_HOST/trainings/onsite/class/{sessionId}`. Idempotent per student via `session_students.signature_requested_at` (claim-before-send: conditional `UPDATE ... WHERE signature_requested_at IS NULL`, same pattern as `missed_email_sent_at` and `attendance_notified_at`), so re-saving the sheet does not re-ask. Nothing is sent when the setting is off, and never to a student the policy would then refuse. Notification failures are swallowed and do not affect the response.

This request is raised **here**, when attendance is recorded, rather than from **Sign Class** — the request and the ability to act on it now begin at the same moment.

### Sign Class

<mark style="color:green;">`POST`</mark> `/trainings/onsite/sign_class.json`

Digitally sign class attendance (teacher confirmation). This is the **teacher** closing the register. The student countersigning their own row is a different endpoint — see **Sign Own Attendance** below. The two are independent: signing the class does not close the students' signing window.

| Field | Type | Required | Description |
|-------|------|----------|-------------|
| classId | string | Yes | Class session ID |
| password | string | Yes | Teacher's password for verification |

**Repeatable.** A session that is already `closed` can be signed again — a fresh signature is written over the old one, and every prior signature is preserved in the new signature's `history` array rather than being discarded.

**Resolves undecided attendance.** Any roster row still `attendance_status=NULL` is resolved to `absent` at sign time — but only for a student actually enrolled in the training (any `trainings_users` status); an unenrolled roster row's status, including `NULL`, is left untouched.

**Sign window.** A teacher (`user_group_id > 140`) may normally only sign within 72h before / 6h after `Session.datetime`. Outside that window a re-sign is still allowed if every change since the LAST signature is exclusively `absent`/`absent_justified` → `attended_post_class` (crediting a late post-class submission); any other change outside the window is rejected with `400 Attendance signature for this class is closed already`. Managers (`user_group_id <= 140`) are not window-limited. Above `user_group_id 140`, the caller must additionally be the session's own `teacher_id` (not the subject teacher) or gets `404 Not authorized to sign this class`.

**Company-scoped.** `404 Class not found` if the session's training belongs to another company.

**Side effect — missed-class email.** Distinct from the notification below: for every roster row newly resolved to `absent` (enrolled students only), a separate templated email (`trainings/missed_class`) is sent once per student per session, guarded by `session_students.missed_email_sent_at` (claimed with a conditional `UPDATE ... WHERE missed_email_sent_at IS NULL` before sending, so concurrent sign calls can't double-send). A re-sign does not re-send it to a student already marked absent on a prior sign.

**Side effect — scheduled-exam window.** Signing sets `Session.status='closed'` and `Session.signed_at` (unix). For a `SCHEDULED` online exam this closes the access window from that moment (earlier than the `access_window_days` cutoff). New attempts are then rejected (`403`); an already-open attempt may still be submitted.

**Side effect — attendance notification.** Runs on every successful sign — first or repeat, since signing itself is repeatable — but is idempotent per student via `session_students.attendance_notified_at` (claim-before-send: a conditional `UPDATE ... WHERE attendance_notified_at IS NULL` before sending, same pattern as `missed_email_sent_at` above), so each student with an `activity_progress` row for the session receives at most one non-urgent in-app message via `Messages.Message::fastSave` (sender = signing teacher), no matter how many times the class is (re-)signed. Per-recipient body includes:

- Their attendance result (Attended / Not attended).
- For exam activities: rating (`score`) and result (Passed / Failed, derived from `value`).
- A reminder + frontend link to sign their own attendance, if the student attended and `session_students.signature` is empty — and only when the training has `attendance_signature = 1`. (This previously read `activity_progress.signature`, which is per-activity, and was sent regardless of the training setting.)
- The next `TrainingActivity` in the same `training_subject_id` (by `order`). If a future `Session` exists for that activity, it is shown with date and a frontend class-view link; otherwise just the activity name.
- If that next activity is an `Exam` of `type=ONLINE` and the student attended this one, an extra line linking to `FRONTEND_HOST/trainings/exams/start/{exam_uuid}`.

The message `redirect` field is `/trainings/onsite/class/{sessionId}`. Notification failures do not affect the sign response.

**Response `signature`.** The persisted `signature` JSON carries a server-only `statuses` map (`session_students.id => attendance_status` as of this sign) used purely as the next sign's carve-out baseline — it is stripped, along with the same key inside every `history` entry, before being returned here or from **View Class**.

### Sign Own Attendance

<mark style="color:green;">`POST`</mark> `/trainings/onsite/sign_attendance.json`

The **student** countersigns their own attendance for one class. Onsite and remote trainings only. Distinct from **Sign Class**, which is the teacher closing the register.

| Field | Type | Required | Description |
|-------|------|----------|-------------|
| class_id | string | Yes | Session id |
| pass | string | Yes | The caller's own password — the re-entry is what makes this a signature |

Writes `session_students.signature` (`{time, ip, browser, hash}`) for the `(session_id, caller)` roster row. It does **not** write `activity_progress.signature`: that row is `UNIQUE (trainings_user_id, training_activity_id)`, one per activity, so it cannot hold a per-sitting signature. The legacy column is still populated on historic rows and is never written again.

**Eligibility.** Decided by `StudentAttendanceSignaturePolicy`, the same rules that produce `can_sign` / `sign_blocked_reason` on **View Class**:

- The training must have `attendance_signature = 1` (`not_required`).
- The session must fall at or after `trainings.attendance_signature_from`, the moment that course adopted the requirement. An earlier session is **out of scope**, and reports `not_required` — not `window_closed`, and never "outstanding". `NULL` means no cut-off was recorded and the requirement applies throughout. This is what stops enabling the setting from retroactively marking a course's entire history as unsigned.
- The caller's `session_students.attendance_status` must be `attended` or `attended_post_class` (`not_attended`).
- Now must be at or after `Session.datetime - 4h` (`not_yet_open`).
- **There is no closing date by default.** `trainings.attendance_signature_days` is opt-in: `0` (the default) means a student may sign at any time; `> 0` closes the window that many days after `Session.datetime` (`window_closed`).
- **The teacher having signed the class is irrelevant.** `sessions.signature` is not consulted. This endpoint previously rejected outright once the class was signed — while the only message that asks a student to sign is sent by that signing.

Eligibility is checked **before** the password, so a caller is never asked for a credential only to be refused anyway.

**Repeat calls are a no-op**, not an error: an already-signed row returns its existing `{time}` with `200`.

**Access.** The caller must have a `session_students` row for the session (`404 You are not on the roster of this class`), and the session's `Training.company_id` must match theirs (`404 Training Session not found`). Beyond that, this action is ACL-gated per role on `acos.alias = 'sign_attendance'`: `UserGroup` 180 (Captain) is granted, 240 (Cabin Crew) and 250 (Auditor) are denied, and **200 (Student Pilot) must be granted for the feature to work at all** — a denied role gets `403 ACL_DENIED` no matter how valid the request is.

#### Response

```json
{ "update": { "time": 1758200000 } }
```

`null` if nothing was stored. The `ip`, `browser` and `hash` persisted alongside are never returned.

#### Errors

| Status | Message |
|--------|---------|
| 400 | `Missing POST params` |
| 400 | `This course does not ask students to sign their attendance.` |
| 400 | `Your attendance for this class has not been recorded as attended.` |
| 400 | `This class has not started yet.` |
| 400 | `The signature period for this class has closed.` |
| 400 | `The entered password was not correct` |
| 400 | `Training is not activated by company manager` / `Training not started yet` / `Training finished already` |
| 403 | `ACL_DENIED` — the caller's role is not granted this action |
| 404 | `Training Session not found` (unknown session, or another company's) |
| 404 | `You are not on the roster of this class` |

### Unsign Class

<mark style="color:green;">`POST`</mark> `/trainings/onsite/unsign_class.json`

Remove digital signature from a class.

### Classwork Grades

<mark style="color:blue;">`GET`</mark> `/trainings/onsite/classwork_grades/{sessionId}.json`

List the homework grades for a session, scoped by role.

**Access.** Company-scoped (`404 Training Session not found`). A reviewer — the session's or subject's teacher, or a manager (`user_group_id <= 140`) — sees every grade on the session. Anyone else is scoped to their own roster row.

**Students cannot call this endpoint.** On deployments where the Onsite sub-actions are ACL-restricted (the default), a student gets `403 ACL_DENIED` here exactly as they do for **Justifications**. A student's own grade is therefore carried on the **Class** payload instead, as `classwork_grade` — see below. Clients should read a student's mark from there and reserve this endpoint for the teacher's roster view.

#### Response

`grades[]`, ordered by `graded_at DESC`:

| Field | Description |
|-------|-------------|
| id | `SessionClassworkGrade.id` (UUID) |
| user_id | The graded student |
| upload_id | The upload that was graded, or `null` when the student submitted nothing |
| score | `0.0`–`10.0`, or `null` for feedback-only grading |
| feedback | Teacher's comment, or `null` |
| graded_by | User id of the reviewer who graded |
| graded_at | Unix timestamp |

### Rate Classwork

<mark style="color:green;">`POST`</mark> `/trainings/onsite/rate_classwork.json`

Grade one student's homework.

| Field | Type | Required | Description |
|-------|------|----------|-------------|
| session_id | string | Yes | `TrainingSession.id` |
| user_id | int | Yes | The student being graded |
| score | decimal | No | `0`–`10`, one decimal. Rounded to one decimal server-side (`7.46` → `7.5`). Empty clears a previously set score |
| feedback | string | No | Comment shown to the student |

**Access.** Reviewer only — the session's or subject's teacher, or a manager (`user_group_id <= 140`). A non-reviewer gets `404 Not authorized to grade this class`, the same response as a session that does not exist, so a caller cannot probe for sessions in another company.

**Guards.** `400 Score must be a number between 0 and 10` for a non-numeric or out-of-range score (validated before any write, so an invalid value never reaches the `decimal(3,1)` column). `400 A grade needs a score or feedback` when both are empty. `404 Student is not on this session roster` when the `user_id` has no `session_students` row on this session.

**Upsert.** Keyed on the roster row (`session_classwork_grades.session_student_id` is `UNIQUE`), so re-grading overwrites and two reviewers saving at once cannot produce two grades. `upload_id` is re-resolved on every save to whatever active `SessionClasswork` upload the student currently has, or `null`.

**Side effect — student notification.** Every successful save sends the student a **non-urgent** in-app message (no push, no email) with the training, session, score and feedback, linking to the class page. A re-grade notifies again. Notification failure is logged and does not fail the request.

#### Response

```json
{ "result": true, "grade": { "id": "...", "user_id": 490, "upload_id": null, "score": 8.5, "feedback": "...", "graded_by": 618, "graded_at": 1788517402 } }
```

### Justifications

<mark style="color:blue;">`GET`</mark> `/trainings/onsite/justifications/{sessionId}.json`

List absence-justification rows for a session, scoped by role.

**Access.** Company-scoped (`404 Training Session not found`). A student who is not a reviewer sees only their own roster row's justification(s). A reviewer — the session's or subject's teacher, or a manager (`user_group_id <= 140`) — sees every justification for the session. A caller with no roster row on the session (and not a reviewer) gets an empty list rather than an error.

#### Response

`justifications[]`, ordered by `created DESC`:

| Field | Description |
|-------|-------------|
| id | `SessionJustification.id` (UUID) |
| status | `pending` \| `approved` \| `rejected` |
| text | Student's free-text justification, or `null` |
| review_note | Reviewer's note, or `null` |
| reviewed_at | Unix timestamp, or `null` if not yet decided |
| upload_id | Linked `SessionJustification` upload id, or `null` |
| created | Unix timestamp |
| user_id, user_name | The justifying student |

### Submit Justification

<mark style="color:green;">`POST`</mark> `/trainings/onsite/submit_justification.json`

A student submits a justification for their own absence.

| Field | Type | Required | Description |
|-------|------|----------|-------------|
| session_id | string | Yes | `TrainingSession.id` |
| text | string | No | Free-text justification |
| upload_id | string | No | Supporting document upload id |

**Guards.** Caller must be on the session roster (`session_students`), else `404 Not on this session roster`. May submit only when their own `attendance_status` is exactly `absent` (not `absent_justified`, not present, not `NULL`) **and** they have no `pending` justification already on this session, else `400 A justification cannot be submitted for this attendance`. Enforced inside a row-locked transaction (`SELECT ... FOR UPDATE` on the `session_students` row) so two near-simultaneous submits cannot both create a pending row.

#### Response

```json
{ "saved": true }
```

### Review Justification

<mark style="color:green;">`POST`</mark> `/trainings/onsite/review_justification.json`

Approve or reject a pending justification.

| Field | Type | Required | Description |
|-------|------|----------|-------------|
| id | string | Yes | `SessionJustification.id` |
| decision | string | Yes | `approved` or `rejected`. Anything else → `400 Invalid decision` |
| review_note | string | No | Max 255 characters (`mb_strlen`) — `400 Review note is too long (255 characters max)` above that |

**Access.** Restricted to a manager (`user_group_id <= 140`) or the session's/subject's teacher, else `404 Not authorized to review this justification`. Company-scoped via the justification's session (`404 Justification not found`, same message as a genuinely missing id — a manager of another company cannot distinguish the two).

**Re-decision is refused.** The status flip is an atomic conditional update (`pending` → decision); a justification that is already `approved`/`rejected` cannot be re-decided — `400 This justification has already been decided`.

**Effect on approval.** Approving sets `session_students.attendance_status = absent_justified`, unless the student already counts as present (e.g. credited `attended_post_class` after submitting but before review) — in that case the justification is still recorded as approved, but the attendance status is left unchanged rather than downgraded. Rejection never changes `attendance_status`. For a LESSON activity, `activity_progress.value` is recomputed from all sibling sessions of the activity afterward, same as `store_attendance`/`sign_class`; EXAM activities are skipped (their `value` is the teacher's grade). All writes (justification status, `session_students`, `activity_progress`) happen in one transaction.

#### Response

```json
{ "saved": true, "newStatus": "absent_justified" }
```

### Session Uploads

Classwork submissions and absence-justification evidence go through the generic upload endpoints (see [uploads.md](uploads.md)), tagged with one of two reserved `Upload.model` values: `SessionClasswork` and `SessionJustification`. Both are keyed on `Upload.foreign_key = sessions.id` — not the student — with the uploader identified separately via `Upload.user_id`.

**Never re-tagged.** Once a row carries either tag its model/foreign_key are frozen for everyone (`POST /uploads/confirm/{id}.json` → `403 This file can not be reassigned.`).

**Delete rules.** `GET /uploads/delete/{id}.json` → `403 This file can not be deleted.` unless one of:

| Caller | `SessionClasswork` | `SessionJustification` |
|--------|--------------------|------------------------|
| Reviewer — session teacher, subject teacher, or manager (`user_group_id <= 140`) | Always | Always |
| The student who submitted the row | Until `sessions.classwork_deadline` passes **or** the work is graded, whichever is first | Never |
| Anyone else | Never | Never |

A student replaces their homework by deleting it and uploading again. Two independent locks close that window, either one being enough: the deadline passing, and a grade existing for that student on that session (any row in `session_classwork_grades` for their roster row). A grade locks the file even inside the window — replacing it afterwards would leave the teacher's mark attached to work nobody graded. A reviewer can still delete a graded file; redoing the grade is theirs to do. Absence evidence keeps the older rule — a student may add to it but never withdraw it. The reviewer lookup ignores the ownership narrowing that normally restricts `user_group_id > 170` to their own rows, so a session teacher who is themselves a line-pilot account can delete a student's submission rather than silently getting `{"result": false}` with HTTP 200.

**Write gate.** The uploader must be on the session roster (`session_students.user_id`), else `403 Uploads are not enabled for this session`. `SessionJustification` has no further condition — several pieces of evidence for one missed class are ordinary. `SessionClasswork` additionally requires:

- `sessions.allow_classwork_upload = true` for that session, and
- **no active `SessionClasswork` upload of their own on that session** — homework is one file. A student holding a submission must delete it first (subject to the deadline above); a second upload is `403 Uploads are not enabled for this session`.

The deadline does **not** gate uploading: a student who submitted nothing may still submit after it, and that submission arrives flagged late (see **Late submissions** below) rather than refused.

Enforced on every path that can attach one of these tags: `POST /uploads/sign.json` (before the presigned S3 PUT is issued — gating at `complete()` would be too late, the object is already in S3 by then), `POST /uploads/create.json`, and `POST /uploads/confirm/{id}.json`. `POST /uploads/complete/{id}.json` re-runs the same gate at activation: the one-file limit counts active rows, so two `sign()` calls made before either completed would both have seen zero. A row refused there is deleted along with its S3 object.

**Late submissions.** `GET /uploads/index/{model}/{foreignKey}.json` adds two fields to every row carrying one of these tags: `deadline` (the governing `classwork_deadline` / `justification_deadline`, or `null`) and `late` (`true` when the row's `created` second is after it). Both are derived per request, never stored — a teacher who extends the deadline afterwards un-flags the submissions the extension now covers. Nothing about `late` refuses or restricts anything; it is a label.

**Uploader identity.** The same listing returns `created` (unix, from the row) and `user_name` (the uploader's full name, or `null` when the user no longer resolves) on every upload row, for all tags — so a roster's submissions can be attributed without a second request.

**Read scope.** Enforced on `GET /uploads/index/{model}/{foreignKey}.json`, `GET /uploads/download/{id}.json` and `GET /uploads/proxy/{id}.json`. A plain student sees only their own uploads for the session. The session's own teacher, the subject's teacher, or a manager (`user_group_id <= 140`) see every upload on the session. Company-scoped: a session belonging to another company (or missing) is refused the same way as a genuinely absent one — `404 Training Session not found` from `index`, plain `404` from `download`/`proxy` — so a caller can't distinguish "wrong company" from "doesn't exist".

---

## Student Evaluation

Per-student evaluation for an onsite class session. Backed by `activity_progress` (one row per `(trainings_user_id, training_activity_id)`) plus two child tables:

- `user_training_objectives` — qualitative objective ratings (`UserTrainingObjective`).
- `user_training_metrics` — competency/metric ratings, optional free-text comments (`UserTrainingMetric`).

Both child tables are keyed to the parent `ActivityProgress.id` (objectives via `training_subject_attendance_id`, metrics via `user_training_attendance_id`).

### Get Evaluation

<mark style="color:blue;">`GET`</mark> `/trainings/onsite/get_student_evaluation/{classId}/{userId}.json`

Fetch the attendance row plus stored objective and metric ratings for a student in a class. Creates the attendance row lazily on first call if the student is enrolled in the training.

**URL params**

| Param | Type | Required | Description |
|-------|------|----------|-------------|
| classId | string | Yes | `TrainingSession.id` |
| userId | string | Yes | Student `User.id` |

**Auth / scope**

- Caller's `company_id` must match `Training.company_id`.
- `Training.active` must be `true`.

**Response 200**

```json
{
  "attendanceRecord": {
    "ActivityProgress": {
      "id": "...",
      "remarks": "...",
      "measures": "...",
      "value": 0,
      "time": 60
    },
    "UserTrainingObjective": [
      { "objective_id": "12", "rating": "STD" }
    ],
    "UserTrainingMetric": [
      { "metric_id": "7", "rating": "3", "comments": null }
    ]
  }
}
```

**Errors**

| Status | Message | Cause |
|--------|---------|-------|
| 400 | `Missing url params` / `Invalid url params` | `classId` or `studentId` null/empty |
| 404 | `Training Session not found` | No `TrainingSession` with that id |
| 404 | `Training not found or inactive` | Training inactive or belongs to another company |
| 404 | `Student not enrolled in training` | No `TrainingsUser` row and no existing attendance |

### Save Evaluation

<mark style="color:green;">`POST`</mark> `/trainings/onsite/save_student_evaluation.json`

Persist evaluation fields and replace the student's objective / metric ratings for a class. Setting `ActivityProgress.value = 1` happens automatically whenever at least one objective or metric row is saved.

**Auth / scope**

- Caller's `company_id` must match `Training.company_id`.
- `Training.active` must be `true`.
- The `ActivityProgress` row for `(class_id, student_id)` must already exist — call `get_student_evaluation` first to create it lazily.

**Body** (`application/x-www-form-urlencoded`)

| Field | Type | Required | Description |
|-------|------|----------|-------------|
| class_id | string | Yes | `TrainingSession.id` |
| student_id | string | Yes | Student `User.id` |
| remarks | string | No | Free-text evaluation remarks |
| measures | string | No | Free-text corrective measures |
| objectives | object | No | Map `objective_id → rating`. Sending the key clears existing rows and re-inserts non-empty entries. Empty rating skips that row. |
| metrics | object | No | Map `metric_id → rating` (string) **or** `metric_id → { rating, comments? }`. Sending the key clears existing rows and re-inserts non-empty entries. Allowed ratings: `-`, `STD`, `+`, `1`–`5`, `N`, `I`, `C`, `E`. |

**Example body**

```
class_id=abc-123
student_id=42
remarks=Good progress on stalls
measures=Review crosswind landings
objectives[12]=STD
objectives[13]=+
metrics[7][rating]=3
metrics[7][comments]=Smooth flare
metrics[8]=N
```

**Response 200**

```json
{
  "result": true,
  "updateData": {
    "id": "...",
    "modified": 1715500000,
    "remarks": "...",
    "measures": "...",
    "value": 1
  },
  "objectives": [ { "UserTrainingObjective": { "id": "..." } } ],
  "metrics":    [ { "UserTrainingMetric":    { "id": "..." } } ]
}
```

Per-field semantics for `objectives` and `metrics` in the response:

- `null` — key was not sent in the request.
- `false` — key was sent but all entries had empty ratings (rows were cleared, nothing inserted).
- array — saved rows (output of `saveAll`).

**Errors**

| Status | Message | Cause |
|--------|---------|-------|
| 400 | `Invalid request type` | Non-POST request |
| 400 | `No data received` | Empty body |
| 400 | `Missing POST params` / `Invalid POST params` | `class_id` or `student_id` missing/empty |
| 404 | `Class not found` | No `TrainingSession` with that id |
| 404 | `Training not found or inactive` | Training inactive or belongs to another company |
| 404 | `Attendance record not found` | No `ActivityProgress` row for `(class_id, student_id)` — call `get_student_evaluation` first |

---

## Exams (ONLINE + ONSITE)

The `exams` table now holds both ONLINE and ONSITE exams. Each row carries:

- `type` enum: `ONLINE` (auto-graded via `exam_attempts`) or `ONSITE` (graded after a session via `activity_progress`).
- Scope = where the exam attaches:
  - `training_subject_lesson_id NOT NULL` → **lesson-gate** (gates that lesson; not a counted activity).
  - `training_subject_id NOT NULL`, `training_subject_lesson_id NULL` → **subject-scope** (counted activity).
  - both NULL → **training-scope** (counted activity).

Every non-lesson-gate exam has a corresponding `training_activities` row so it participates in drag-drop ordering and session scheduling.

### Exam Info

<mark style="color:blue;">`GET`</mark> `/trainings/exams/index/{filter}:{id}.json`

List every exam matching a single scope filter. Returns **all** matching exams (not just one), each decorated with an `available` flag.

`{filter}` (exactly one, in this precedence):

| Filter | Returns |
|--------|---------|
| `exam:{exam_id}` | The single exam with that id. |
| `lesson:{lesson_id}` | All lesson-gate exams attached to that lesson. |
| `subject:{subject_id}` | All subject-scope exams (`training_subject_lesson_id IS NULL`). |
| `training:{training_id}` | All training-scope exams (subject and lesson both `IS NULL`). |

Auth / scoping:

- `Training.company_id` must match the caller's company.
- `Exam.deleted = false` (soft-deleted exams never returned).
- `Training.active` is **not** enforced — exams on archived trainings are returned so managers can still maintain them. The per-row `available` flag reflects archived state.

Each `Exam` row carries `available: true|false`. `available` is `false` when any of: exam expired, exam deleted, training not active, or the question bank holds fewer questions than `Exam.questions` (insufficient pool to compose an attempt).

#### Access mode (online exams)

Online exams carry `access_mode`:

- `FREE` (default) — current behaviour: takeable freely once the prerequisites above are met.
- `SCHEDULED` — gated behind a scheduled session. `available` additionally requires an **active session** for this exam *and the requesting student*, where:
  - the session's `TrainingActivity` points at this exam (`kind=EXAM`, `exam_id=this`), and
  - the requesting student is on the session roster (`session_students`), and
  - the session is **not signed**, and
  - `Session.datetime <= now <= Session.datetime + access_window_days * 86400`.

  All the FREE checks (expiration, deleted, active, question pool) still apply — `available` requires passing **all** of them. When several sessions exist (re-scheduled), the most recent in-window unsigned session wins. `access_window_days` defaults to `10`.

`available_until` (online exams): the `YYYY-MM-DD HH:MM:SS` timestamp when the current student's window closes — `min(session.datetime + access_window_days, session signed-at)`. `null` for `FREE` exams or when there is no active session.

`TrainingQuestion` is included with `TrainingSubject.name`, `TrainingSubject.code`, `Lesson.name` per question. For `user_group_id <= 135` each question also includes `TrainingQuestionOption` (the answer options). For `user_group_id > 150` the `TrainingQuestion` list is stripped.

Errors:

- `400 BadRequest` — no filter provided.
- `404 NotFound` — no exam matches.

Response shape:

```json
{
  "exams": [
    {
      "Exam": {
        "id": "...",
        "name": "Final LFR test",
        "type": "ONLINE",
        "attempts": 2,
        "score": 75,
        "questions": 20,
        "minutes": 30,
        "expiration": null,
        "training_id": "...",
        "training_subject_id": "...",
        "training_subject_lesson_id": null,
        "deleted": false,
        "access_mode": "FREE",
        "access_window_days": 10,
        "available": true,
        "available_until": null
      },
      "TrainingQuestion": [
        { "id": "...", "name": "Question text",
          "TrainingSubject": { "name": "...", "code": "..." },
          "Lesson": { "name": "..." } }
      ]
    }
  ]
}
```

### Manage Exam Questions

Exam questions are a **shared bank**: a single `TrainingQuestion` can be linked to many exams through the join table `exams_questions`. Editing a question changes it in **every** exam that uses it, and deletion is **scoped** so cleaning up one exam never destroys another's questions. Both endpoints are manager-scoped (`/manager/…`).

#### Create / Update Question

<mark style="color:green;">`POST`</mark> `/manager/trainings/questions/create.json`

Create a new question (and link it to an exam) or update an existing one. `Content-Type: application/x-www-form-urlencoded`, Cake nested-array field names.

| Field | Type | Required | Description |
|-------|------|----------|-------------|
| `data[Exam][id]` | string | On create | Exam to attach a **new** question to. On **edit** (see below) it is used only to resolve the question's subject — the question is **never** re-linked, so a shared question keeps all its other exam links. |
| `data[TrainingQuestion][id]` | string | No | Present = **edit** an existing question; absent = **create**. |
| `data[TrainingQuestion][name]` | string | Yes | Question text. |
| `data[TrainingQuestion][required]` | `0`\|`1` | No | Whether the question must be answered. |
| `data[TrainingQuestion][TrainingQuestionOption][i][id]` | int | No | Option id (present = keep/update, absent = new). |
| `data[TrainingQuestion][TrainingQuestionOption][i][name]` | string | Yes | Option text. |
| `data[TrainingQuestion][TrainingQuestionOption][i][value]` | `0`\|`1` | No | `1` marks the correct option. At least one option must be correct. |

Lesson-slide question variant: send `data[LessonSlide][training_subject_lesson_id]` (and `data[TrainingQuestion][training_subject_lesson_id]`) **instead of** `data[Exam][id]` to create/update a question that lives on a lesson slide.

Response: `{ "result": true, "question": { "TrainingQuestion": { "id": "…" } }, "slide": … }`.

#### Delete Question

<mark style="color:green;">`POST`</mark> `/manager/trainings/questions/delete.json`

Scoped, **non-destructive** removal. Nothing is hard-deleted — options, historical attempt answers and the row itself are always preserved.

| Field | Type | Required | Description |
|-------|------|----------|-------------|
| `id` | string | Yes | `TrainingQuestion` UUID. |
| `exam_id` | string | No | When present, unlink the question from **this exam only** (removes the `exams_questions` row). Omit it in a lesson context to remove the question's slide instead. |

Behavior:

- **With `exam_id`** — the exam↔question link is removed. If the question is still linked to any other exam (or a lesson slide), the question row is left fully intact and stays live in those exams.
- **Without `exam_id`** — the lesson slide surfacing the question is removed.
- The underlying `TrainingQuestion` is **soft-deleted** (`deleted=1`, hidden everywhere via `beforeFind`, recoverable) **only once nothing references it** — no remaining exam links and no lesson slides. A shared question is never destroyed by deleting it from one exam.

Response: `{ "result": true }`.

### Preview Exam

<mark style="color:blue;">`GET`</mark> `/trainings/exams/start/{enrollmentId}/{examId}.json`

Preview exam details and previous attempts before starting.

### Start Exam

<mark style="color:green;">`POST`</mark> `/trainings/exams/start/{enrollmentId}/{examId}.json`

Begin an exam attempt.

**Scheduled exams (server-side enforcement).** For an online exam with `access_mode=SCHEDULED`, starting a **new** attempt requires an active, in-window, unsigned session the student is rostered on (same condition as `available` above). Otherwise the request is rejected with:

- `403 Forbidden` — *"This exam is only available from your scheduled class during its access window."*

This is the real gate: it blocks a direct API hit even when the UI hides the button. An **already-open** attempt (started while the window was open) may still be resumed and submitted after the window closes — only new attempts are blocked. The `attempts` cap and `expiration` still apply within the window.

#### Response

```json
{
  "result": true,
  "message": "Exam started",
  "attempt_id": "1500"
}
```

### Take Exam

<mark style="color:blue;">`GET`</mark> `/trainings/exams/do/{attemptId}.json`

Retrieve exam questions for an active attempt.

### Submit Answer

<mark style="color:green;">`POST`</mark> `/trainings/exams/answer.json`

Submit an answer to an exam question.

| Field | Type | Required | Description |
|-------|------|----------|-------------|
| attemptDetailId | string | Yes | ExamAttemptDetail ID |
| questionOptionId | string | Yes | Selected option ID |

### Finish Exam

<mark style="color:blue;">`GET`</mark> `/trainings/exams/finish/{attemptId}.json`

Submit the exam for grading. Grades the attempt, then syncs `ActivityProgress` for the exam activity (`value`=best passed, `score`=best score) via `recordExamAttempt`.

**Scheduled exams — auto-record into attendance.** For an online exam with `access_mode=SCHEDULED`, finishing also links that `ActivityProgress` row to the gating session (`session_id`) and sets `session_students.attended=1`. The teacher's session grade view (`attendance()`) then shows the auto-graded result directly — `exam_status` = `value`, `exam_rating` = `score` — with no manual entry. (Re-scheduling the session clears its session-scoped progress as usual; the aggregate is rebuilt from `exam_attempts` on the next finish.)

### View Result

<mark style="color:blue;">`GET`</mark> `/trainings/exams/view/{attemptId}.json`

Retrieve exam results and (when enabled) correct answers.

---

## Students Management

### List Students

<mark style="color:blue;">`GET`</mark> `/manager/trainings/students/list/training:{trainingId}/status:{status}/group:{groupId}/pilot_group:{pilotGroupId}/username:{search}.json`

Retrieve students with filtering. All filter parameters optional (use empty string to skip).

**Access:** staff `user_group_id <= 135`, Chief Pilot (150), Flight Instructors (170) and auditors (250). Crew Scheduling (140) and Flight Dispatcher (145) are ACL-denied. Flight Instructors (170) can read this list, `/manager/trainings/students/index.json` and `/manager/trainings.json` (the course list) but are ACL-denied every mutating `Students/manager_*` action (`enroll`, `edit`, `finish`, `status`, `reset`, `unroll`), which stay `<= 135` / Chief Pilot. Any other group gets `403 ACL_DENIED`.

`status` accepts one of `ACTIVE` (default when omitted), `COMPLETED`, `STOPPED`, `FAILED`, `EXPELLED`, or `ALL` to return every enrollment regardless of status. Anything else returns `400 Unknown status`. Each row carries `TrainingsUser.status`, `TrainingsUser.status_reason` and `TrainingsUser.status_changed`.

> **Breaking change.** This filter replaces the old `finished:{true|false}` segment, and `TrainingsUser.finished` no longer appears in any response — the `finished` column was dropped in favour of `status`. See [Enrollment status](#enrollment-status).

### View Student

<mark style="color:blue;">`GET`</mark> `/manager/trainings/students/view/{enrollmentId}.json`

Retrieve full student enrollment details.

#### Suggested completion date

`TrainingsUser.completion_suggested_at` (unix seconds, or `null`) is the date the records say the student actually finished — the latest of their last completed activity, last passed exam and last completed flight mission, clamped between the enrollment date and now. It is derived on every read, never stored, and is there to prefill the completion-date field of a manual force-complete (`POST /manager/trainings/students/finish/{enrollmentId}.json`, field `completed_at`). `null` means nothing has been recorded for this student yet, in which case a client should default the field to today.

#### Attendance Status Breakdown

For a non-`DISTANCE` training, the response includes a top-level `training.AttendanceStatus` object — per-status **session** counts for this student in this training, sourced from `Training::getAttendanceStatusBreakdown($trainingId, $userId)`. It is keyed by `users.id`, **not** the enrollment (`TrainingsUser.id`) id — attendance status lives on `session_students`, which is keyed by user, and a roster row can exist without any enrollment at all.

Five integer keys, always all present:

| Key | Meaning |
|-----|---------|
| attended | Sessions where `session_students.attendance_status = 'attended'` |
| attended_post_class | Sessions credited `attended_post_class` (late/post-class submission) |
| absent | Sessions marked `absent` |
| absent_justified | Sessions marked `absent_justified` (approved justification) |
| unmarked | Sessions whose `attendance_status` is still `NULL` — not yet decided (attendance not signed) |

Counts only sessions under a non-deleted `training_activities` row (`training_activities.deleted = 0`).

**`DISTANCE` trainings.** `training.AttendanceStatus` is omitted from this response entirely when `Training.type = 'DISTANCE'` (attendance-by-session doesn't apply — distance trainings track `getProgress` instead).

**Same object, student report endpoint.** <mark style="color:blue;">`GET`</mark> `/trainings/students/report/{enrollmentId}.json` returns the identical breakdown nested at `training.Training.AttendanceStatus` — explicitly `null` (rather than omitted) for a `DISTANCE` training. Access is decided by `ReportVisibility::level()` (see [Training Certificate](#training-certificate) below): the student, their supervisor and same-company staff (`user_group_id <= 170`) receive the full report with `training.verification: false`; **anyone else — including an anonymous caller, the endpoint is public — receives the verification subset** with `training.verification: true`.

#### Reset attempts in the response

For lessons whose gate online-exam has been **reset** (see `POST /trainings/lessons/reset.json`), the response exposes the reset boundary and every `ExamAttempt` is annotated with a `reset` boolean so the UI can group pre-reset attempts visually.

Surfaced fields:

- `training.TrainingSubject[].TrainingSubject.Lesson[].Exam[].TrainingActivity.ActivityProgress[0].reset_at` — unix timestamp of the most recent reset, or `null` if never reset.
- `training.TrainingSubject[].TrainingSubject.Lesson[].Exam[].ExamAttempt[].reset` — `true` if `ExamAttempt.start <= reset_at` (the attempt belongs to a pre-reset cycle and didn't count toward the current limit), `false` otherwise.
- `training.TrainingSubject[].TrainingSubject.Exam[].TrainingActivity.ActivityProgress[0].reset_at` and `.ExamAttempt[].reset` — same annotation for subject-level exams (subject-level exams are not currently reset, but the field is populated for symmetry).

Example slice:

```json
{
  "training": {
    "TrainingSubject": [
      {
        "TrainingSubject": {
          "Lesson": [
            {
              "id": "50",
              "Exam": [
                {
                  "id": "e-50-gate",
                  "attempts": 3,
                  "TrainingActivity": {
                    "id": "act-e50",
                    "ActivityProgress": [
                      { "value": 0, "attempts_count": 0, "reset_at": 1778600000 }
                    ]
                  },
                  "ExamAttempt": [
                    { "id": "att-1", "start": 1778500001, "passed": 0, "status": "FINISHED", "reset": true  },
                    { "id": "att-2", "start": 1778510002, "passed": 0, "status": "FINISHED", "reset": true  },
                    { "id": "att-3", "start": 1778550003, "passed": 0, "status": "FINISHED", "reset": true  },
                    { "id": "att-4", "start": 1778700004, "passed": 0, "status": "STARTED",  "reset": false }
                  ]
                }
              ]
            }
          ]
        }
      }
    ]
  }
}
```

In this example three pre-reset attempts (`att-1..3`) maxed out the limit; the student called `lessons/reset.json` at `1778600000` and is now mid-way through `att-4` — only that one counts toward the current `attempts_count` and is what the next `recordExamAttempt` will aggregate.

### Enroll Students

<mark style="color:green;">`POST`</mark> `/manager/trainings/students/enroll.json`

Enroll one or more students (or whole pilot groups) in a training. Sent as `application/x-www-form-urlencoded` or JSON.

#### Request Body

| Field | Type | Required | Description |
|-------|------|----------|-------------|
| training_id | string | Yes | Training UUID. Must belong to the authenticated user's company. |
| students | array | Yes | Array of identifiers. Numeric entries are treated as **user IDs**. Non-numeric entries are treated as **pilot group IDs** and expanded server-side to all member users. |
| supervisor_id | string | No | UUID of the supervisor/instructor assigned to each new enrollment. |
| finish_before | integer | No | Deadline as a Unix timestamp. Cast to int; falsy values mean "no deadline". |

#### Behavior

- A student already enrolled in the training is **skipped**, unless their prior enrollment is closed — any `status` other than `ACTIVE`, i.e. `COMPLETED`, `STOPPED`, `FAILED` or `EXPELLED` — in which case a fresh enrollment is created (re-take).
- Pilot group entries are expanded to their members; members already enrolled are skipped.
- For each successful enrollment on an `active` training, an in-app notification is sent to the student linking to the enrollment.

#### Response

A map keyed by **user ID**, with the new **enrollment ID** (`TrainingsUser.id`) as the value — one entry per newly-created enrollment.

```json
{
  "123": "e1f2a3b4-c5d6-7890-abcd-ef1234567890",
  "456": "9a8b7c6d-5e4f-3210-9876-543210fedcba"
}
```

- The object has no wrapper key; the user-ID map is the response root.
- Only **newly-enrolled** students appear. Students that were already enrolled (and not re-taking) are **omitted entirely** — they are not returned as `false` or any other marker. An empty object `{}` means nothing new was enrolled.
- Pilot group IDs in the request are expanded server-side, so the keys are always individual user IDs.
- Count the entries to report how many students were enrolled.

#### Errors

| Status | When |
|--------|------|
| `400 Bad Request` | Not a POST, empty body, missing `training_id`, or `students` is not an array. |
| `404 Not Found` | `students` array is empty, or `training_id` does not match a training in the user's company. |

### Save Student Notes

<mark style="color:green;">`POST`</mark> `/manager/trainings/students/notes.json`

Update notes for a student enrollment.

---

## Enrollment status

`trainings_users.status` is the single source of truth for where an enrollment stands. It replaced the old boolean `trainings_users.finished` column, which has been **dropped** — `finished` no longer appears in any response payload, and the students-list URL filter is now `status:` instead of `finished:`.

| Status | Meaning |
|--------|---------|
| `ACTIVE` | The student is training. The only status that counts as an enrollment in progress. |
| `COMPLETED` | Training passed. Stamps `TrainingsUser.validity` and unlocks the certificate endpoint. |
| `STOPPED` | Closed without completing — the student quit or abandoned the course. |
| `FAILED` | Closed — the student did not pass. |
| `EXPELLED` | Closed — the school removed the student from the training. |

`STOPPED`, `FAILED` and `EXPELLED` are the non-destructive alternative to unrolling a student: every lesson, exam attempt and flight mission stays on record. Unrolling (`POST /manager/trainings/students/unroll/{id}.json`) still deletes all of it.

#### What `ACTIVE` gates

Only `ACTIVE` enrollments:

- appear in the default students list, in the student's own "in progress" trainings, and in the pilot profile's ongoing trainings;
- can be written to by the student — `POST /trainings/lessons/complete.json` and `POST /trainings/exams/start/...` return `403 This enrollment is closed` otherwise;
- auto-complete. A closed enrollment is skipped by `TrainingsUser::checkTrainingFinished` and never gets `validity` stamped;
- are matched by supervisor auto-assignment when scheduling a training flight;
- block a re-enrollment. Enrolling a student whose only enrollment is closed creates a fresh one (re-take).

#### Status history

Every transition is appended to `trainings_user_status_changes` and returned as `StatusChange` (oldest first) by both `GET /manager/trainings/students/view/{enrollmentId}.json` (response root) and `GET /trainings/trainings/view/{enrollmentId}.json` (under `training`):

```json
"StatusChange": [
  {
    "id": "b171362d-…",
    "status": "STOPPED",
    "reason": "Left the school",
    "changed_by": "3",
    "created": "1787673311",
    "changed_by_name": "Flylogs Support"
  }
]
```

`trainings_users` keeps only the current status — this is the full log, so a student stopped and later reopened shows both events. `created` is unix seconds, `changed_by_name` is resolved from `user_details`. Rows are never updated. Enrollments closed before the table existed were seeded with a single row carrying their current status.

Every path that opens, closes or reopens an enrollment writes a row:

| Path | Status | Reason | `changed_by` |
|------|--------|--------|--------------|
| `POST /manager/trainings/students/enroll.json` | `ACTIVE` | `Enrolled` | the manager |
| `POST /trainings/students/restart/{id}.json` | `ACTIVE` | `Training restarted by the student` | the student |
| `POST /manager/trainings/students/status/{id}.json` | as requested | the manager's free text | the manager |
| `POST /manager/trainings/students/finish/{id}.json` (and `/undo`) | `COMPLETED` / `ACTIVE` | — | the manager |
| `POST /manager/trainings/students/reset/{id}.json` | `ACTIVE`, only when the enrollment was closed | `Progress reset` | the manager |
| Auto-completion (`TrainingsUser::checkTrainingFinished`) | `COMPLETED` | `Automatic completion` | `null` — no acting user, it fires from the progress hooks |

`changed_by` and `changed_by_name` are `null` for system-made changes. The first row of an enrollment is always its creation: a reopen can only follow a closing row, so an `ACTIVE` row with nothing before it means the enrollment was opened, and clients render it as the signup event.

`POST /manager/trainings/students/unroll/{id}.json` deletes the enrollment together with its history — unrolling is the destructive path, stopping is the one that keeps a record.

### Set Enrollment Status

<mark style="color:green;">`POST`</mark> `/manager/trainings/students/status/{enrollmentId}.json`

Close or reopen an enrollment without deleting any progress. Sent as `application/x-www-form-urlencoded`.

#### Request Body

| Field | Type | Required | Description |
|-------|------|----------|-------------|
| status | string | Yes | `ACTIVE`, `COMPLETED`, `STOPPED`, `FAILED` or `EXPELLED`. May also be passed as a second URL segment (`.../status/{enrollmentId}/STOPPED.json`). |
| reason | string | No | Free text, max 255 chars. Stored in `TrainingsUser.status_reason` and included in the student's notification. |
| completed_at | int or string | No | `COMPLETED` only: the date the student actually finished, as unix seconds or `YYYY-MM-DD` (a date-only value is anchored at 12:00 UTC). Omitted, the server derives it from the recorded progress — the latest of the last completed activity, passed exam and completed mission — and falls back to now when nothing was ever recorded. Also accepted as `completion_date`. The same field is accepted by `POST /manager/trainings/students/finish/{enrollmentId}.json`. |

#### Access

- `manager` prefix: `user_group_id > 190` (and below 250) is rejected by the plugin, same as every other manager trainings action. External auditors (250) have no ACL grant on this action and cannot call it.
- The enrollment's training **and** the student must both belong to the caller's company.
- ACL grants mirror `manager_finish` exactly: allowed for company managers (`user_group_id` 100/135/150), denied for instructors (140/145) and for every student/pilot group (170/190/200/300).

#### Side effects

- Writes `status`, `status_reason`, `status_changed` (unix) and `status_changed_by` (user id), appends the change to `TrainingsUser.notes`, and inserts a `trainings_user_status_changes` row (see [Status history](#status-history)).
- `COMPLETED` stamps `status_changed` with the completion date — supplied, derived or now — and writes `TrainingsUser.validity` as that date plus `Training.validity` days (null when the training has no validity period). `status_changed` is the completion date the certificate is issued for; `modified` is only the row's last edit and must not be read as a finish date. `ACTIVE` (a reopen) clears `validity`; the terminated statuses leave it alone.
- Notifies the student, worded per status — completion keeps the original congratulations message, the closing statuses say what happened and quote `reason` when given, and `ACTIVE` announces the enrollment was reopened. The message is flagged **urgent**, so on top of the in-app message and push notification the student is emailed, provided their address is confirmed and `user_credentials.alerts = 1`. Emails count against the company's send quota.
- No progress row is created, modified or deleted.

#### Response

```json
{
  "result": true,
  "message": "Status updated.",
  "status": "STOPPED"
}
```

#### Errors

| Status | When |
|--------|------|
| `400 Bad Request` | Not a POST, missing enrollment id, a `status` outside the five allowed values, or a `completed_at` that is unparseable, in the future, or earlier than the enrollment date. |
| `404 Not Found` | Enrollment not found, or training/student outside the caller's company. |

---

## Training Calendar

<mark style="color:blue;">`GET`</mark> `/trainings/trainings/calendar.json`

Retrieve training-related calendar events.

#### Query Parameters

| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| start | string | Yes | Start date |
| end | string | Yes | End date |
| timeZone | string | Yes | IANA timezone |
| training | string | No | Filter by training ID |

---

## Training Certificate

<mark style="color:blue;">`GET`</mark> `/trainings/trainings/certificate/{enrollmentId}.json`

Retrieve training completion certificate data. Gated strictly on `TrainingsUser.status = 'COMPLETED'`. If the auto-completion mechanism (below) hasn't fired, this endpoint returns `404 Training not finished yet` regardless of how complete the activities look.

**Access** (`403` otherwise): the student, the enrollment's `supervisor_id`, or a user with `user_group_id <= 170` **of the same company** as the training. Managers of other companies are refused. This is the `ReportVisibility::level()` rule (`app/Lib/Trainings/ReportVisibility.php`), shared with the student report.

**Issuing.** The first successful call **issues** the certificate: a sequence number is reserved atomically on `company_details.certificate_next_number`, formatted with `company_details.certificate_pattern` / `certificate_prefix` (tokens `{prefix}` `{year}` `{seq}` `{seq:N}`; see `CertificateNumber`), and a `training_certificates` row is written with a JSON `snapshot` of every printed field. Every later call returns that row unchanged — number and `issued_at` never move. `training_certificates.trainings_user_id` is unique (one certificate per enrollment); a lost race burns a sequence number, never duplicates one.

#### Response additions

| Field | Description |
|-------|-------------|
| `TrainingCertificate` | `{ id, number, sequence, issued_at, issued_by, trainings_user_id, training_id, user_id, snapshot }`. `snapshot` = `{ locale, number, issued_at, student{name,surname,dob,licence}, organisation{name,legal_name,address,zip,city,country,approval_type,approval_reference}, course{id,name,type,regulatory_basis,ground_hours,flight_hours,started,completed,valid_until}, signer{user_id,name,surname,position} }`. NEO renders the PDF from the snapshot. |
| `Training.regulatory_basis` | Effective value: `trainings.regulatory_basis`, else `company_details.regulatory_basis`, else `null`. |
| `Training.manager_position` | Free text printed under the signer; `null` → "Head of Training". |
| `Training.ground_hours` | Planned theory hours: sum of `training_subjects.hours` (not deleted). |
| `Training.flight_hours` | Hours actually flown: block time of `CONFIRMED` flights on the enrollment's completed `user_training_flights`, one flight counted once, `/3600`, 2 dp. |
| `Training.Company.locale` | `companies.locale`; the certificate is rendered in this language. |
| `Training.Company.CompanyDetail.{legal_name, approval_type, approval_reference, regulatory_basis, zip}` | Organisation block. `certificate_prefix` / `certificate_pattern` are **not** returned. |
| `User.licence` | `user_certificates.name` of the student's valid (`status = valid`, not expired) `licence` row, newest `issue` first; `null` when none. No passport / address / phone. |
| `TrainingsUser.created` | Enrollment date, printed as the course start. |

**Manager fallback**: `Training.manager_id` may be `NULL`. When it is, `Training.Manager` is filled with the first company user in `user_group_id` ∈ (100, 105, 135) that has a non-empty `UserDetail.signature` so the certificate always has a signatory. Returned shape matches the normal Manager: `{ id, UserGroup.name, UserDetail.{name, surname, signature} }`. If no such user exists `Training.Manager` stays empty.

---

## Issued Certificates (manager)

<mark style="color:blue;">`GET`</mark> `/manager/trainings/trainings/certificates.json?page=&training_id=&q=`

Every certificate the company has issued, newest first. Querystring pagination (`page`, 50 per page, `maxLimit` 500). `training_id` filters one course; `q` matches the certificate `number` or the student's name/surname (`LIKE %q%`; users live in `flylogs_main`, so matching students are resolved first and passed as `user_id IN (...)`).

**Access:** `user_group_id <= 170` (`403` otherwise). ACO `controllers/Trainings/Trainings/manager_certificates` — needs `aco_sync`; inherits the root allow.

#### Response

```json
{
  "certificates": [
    {
      "TrainingCertificate": { "id": "…", "number": "EGM-2026-0001", "sequence": "1", "issued_at": "1789200000", "issued_by": "618", "trainings_user_id": "…", "training_id": "…", "user_id": "377" },
      "Training": { "id": "…", "name": "ATPL(A) - INTEGRATED", "color": "#249ac3" },
      "User": { "id": "377", "UserDetail": { "name": "Martha", "surname": "Smith" } },
      "Issuer": { "id": "618", "UserDetail": { "name": "Iñigo", "surname": "García" } }
    }
  ],
  "pagination": { "page": 1, "pageCount": 1, "count": 1, "limit": 50 }
}
```

---

## Student Report access and the verification payload

<mark style="color:blue;">`GET`</mark> `/trainings/students/report/{enrollmentId}.json` is **public** (`Auth->allow`) because the certificate's QR code points at it. The response depends on the caller:

| Caller | `training.verification` | Payload |
|--------|-------------------------|---------|
| The student, the enrollment's supervisor, or `user_group_id <= 170` of the training's company | `false` | The full report described above, plus `training.TrainingCertificate: { number, issued_at } \| null`. |
| Anyone else, including no `Authorization` header | `true` | `training.TrainingsUser { id, training_id, status, status_changed, validity, created }`, `training.Training { id, name, type, Company { id, name, CompanyTheme{logo,color}, CompanyDetail{legal_name, approval_type, approval_reference, city, Country.name} } }`, `training.User.UserDetail { name, surname }` **masked** (first letter of each word + `*` per remaining character: `O******** K********`), `training.TrainingCertificate { number, issued_at } \| null`. No exams, subjects, flights, passport, date of birth, address or phone. |

Reading the report never issues a certificate; only the certificate endpoint allocates numbers.

---

## Auto-Completion

There are two boolean training-level flags that govern automatic completion behavior. Both default to `0`.

| Field | Description |
|-------|-------------|
| `Training.auto_finish` | When `1`, every write to `ActivityProgress` or `UserTrainingFlight` triggers a re-evaluation of the enrollment. If all activities AND all flight missions are complete, `TrainingsUser.status` is set to `COMPLETED`, `TrainingsUser.status_changed` is stamped with the completion date and `TrainingsUser.validity` with `completion date + Training.validity * DAY` (i.e. `Training.validity` is the certificate lifetime in **days**). |
| `Training.allow_auto_restart` | When `1`, on a **DISTANCE** training, students can self-serve a lesson reset via `POST /trainings/lessons/reset.json` (see above) once they've exhausted lesson-gate exam attempts without passing. |

### Completion rule (used by `TrainingsUser::checkTrainingFinished`)

An enrollment auto-completes (`status` `ACTIVE` → `COMPLETED`) when **all** of the following hold:

1. The training's date window allows it: `Training.start <= today <= Training.end` (NULL bounds are treated as open-ended).
2. `Training::getProgress(training_id, enrollment_id).finished == true` — every mandatory activity has `ActivityProgress.value = 1`, and every mandatory lesson-gate exam has been passed.
3. **Flights** — only when `Training.flights = 1`. Then, for every `TrainingFlight` row attached to the training there is at least one `UserTrainingFlight` row with `completed = 1` scoped to this enrollment (this applies to every training type that has flight missions, not just DISTANCE). A training with zero `TrainingFlight` rows passes this clause trivially, and so does one whose flight section is switched off: turning `Training.flights` off does not delete the `training_flights` rows, and those leftovers are shown nowhere and cannot be flown, so they no longer block completion.

If `Training.auto_finish = 0`, the check still works when called manually (e.g. admin recompute), but it is **not** invoked automatically on writes.

Frontend implications:

- After a successful `POST /trainings/lessons/complete.json`, `POST /trainings/exams/finish.json` or any UserTrainingFlight write, re-fetch `/trainings/trainings/view/{enrollmentId}.json` to see whether `TrainingsUser.status` flipped to `COMPLETED`. Don't rely on a separate "did it finish?" call.
- The certificate endpoint only succeeds once `status = 'COMPLETED'` is persisted — there is no "force compute" query string.
- Only an `ACTIVE` enrollment can auto-complete. A `STOPPED` / `FAILED` / `EXPELLED` one is skipped and never gets its `validity` stamped.
- Read the completion date from `TrainingsUser.status_changed`, never from `TrainingsUser.modified`: `modified` is the row's last edit and moves whenever anything touches the enrollment. Legacy rows completed before `status_changed` existed carry `null`, which is the only case where `modified` is a reasonable fallback.
- Surface both flags (`Training.auto_finish`, `Training.allow_auto_restart`) in the training detail view so the UI can decide whether to show a "Reset lesson" button and whether to expect automatic finishing.

---

## Locations

### List Locations

<mark style="color:blue;">`GET`</mark> `/trainings/locations.json`

Retrieve all training locations.

### View Location

<mark style="color:blue;">`GET`</mark> `/trainings/locations/view/{id}.json`

Retrieve location details and scheduled classes.

### Edit Location

<mark style="color:green;">`POST`</mark> `/manager/trainings/locations/edit.json`

Create or update a training location. Sent as `application/x-www-form-urlencoded`.

| Field | Type | Required | Description |
|-------|------|----------|-------------|
| id | string | No | Location ID (omit to create new) |
| name | string | Yes | Location name |
| type | string | Yes | Location type |
| phone | string | No | Contact phone |
| address | string | No | Address |
| country_id | string | Yes | Country ID |
| timezone_id | string | Yes | Timezone ID |
| description | string | No | Description |

---

## Flight Missions

### Unsigned Missions

<mark style="color:blue;">`GET`</mark> `/trainings/missions/unsigned.json`

Returns all flight mission attendance records for the authenticated user that are missing a debriefing signature. Only includes missions from active trainings that have `require_debriefing_signature` enabled.

#### Response

```json
{
  "missions": [
    {
      "UserTrainingFlight": {
        "id": "800",
        "training_flight_id": "tf-uuid-1",
        "flight_id": "flight-uuid-1",
        "completed": "2025-04-15 14:30:00",
        "time": "5400"
      },
      "TrainingFlight": {
        "id": "tf-uuid-1",
        "name": "Solo Navigation",
        "order": "3",
        "Training": {
          "id": "10",
          "name": "CPL Flight Training",
          "active": true,
          "start": "2025-01-01",
          "end": "2025-12-31",
          "require_debriefing_signature": true
        }
      }
    }
  ]
}
```

---

### Sign Mission Debriefing

<mark style="color:green;">`POST`</mark> `/trainings/missions/sign.json`

Digitally sign the debriefing for a completed flight mission. Requires the user's password for verification. Only the student who flew the mission can sign it. Signing is only possible while the training is active and within its start/end dates.

| Field | Type | Required | Description |
|-------|------|----------|-------------|
| user_training_flight_id | string | Yes | UserTrainingFlight record ID |
| pass | string | Yes | User's account password |

#### Response

```json
{
  "update": true
}
```

Returns `false` if the record was already signed.

---

## Manager Training Operations

### List Trainings

<mark style="color:blue;">`GET`</mark> `/manager/trainings.json`

List all trainings with student counts (admin view).

### Create Training

<mark style="color:green;">`POST`</mark> `/manager/trainings/trainings/create.json`

Create a new training course.

| Field | Type | Required | Description |
|-------|------|----------|-------------|
| name | string | Yes | Training name |
| type | string | Yes | Training type |
| theory | boolean | No | Has theory component |
| flights | boolean | No | Has flight component |
| competencies | boolean | No | Uses competency-based evaluation |
| template_id | string | No | Base on existing template |

### Training Templates

<mark style="color:blue;">`GET`</mark> `/manager/trainings/trainings/templates.json`

List available training templates.

### Teaching Report

<mark style="color:green;">`POST`</mark> `/manager/trainings/trainings/teaching_report.json`

Generate a teaching activity report.

| Field | Type | Required | Description |
|-------|------|----------|-------------|
| training | string | Yes | Training ID |
| from | string | Yes | Start date |
| to | string | Yes | End date |

## Stage Checks

Ordered blocks of flight missions, each ending in a check the student must pass before flying a later stage.

Every endpoint below is inert unless the training has `stage_checks = 1`. Recording, overriding and voiding additionally require `user_group_id <= 135` **or** being the training's `manager_id`; a 403 is returned otherwise.

### List stages

<mark style="color:blue;">`GET`</mark> `/manager/trainings/stages/index/{trainingId}.json`

Returns the training's stages ordered by `(order, id)`.

### Create a stage

<mark style="color:green;">`POST`</mark> `/manager/trainings/stages/add/{trainingId}.json`

| Field | Type | Required | Description |
|-------|------|----------|-------------|
| name | string | Yes | Stage name |
| code | string | No | Short code, e.g. `S1` |
| description | string | No | Free text |
| order | integer | No | Position, defaults to 0 |
| check_training_flight_id | string | No | Mission nominated as this stage's check |

### Edit a stage

<mark style="color:green;">`POST`</mark> `/manager/trainings/stages/edit/{id}.json`

Accepts any of the fields above. Only the fields sent are changed.

### Delete a stage

<mark style="color:green;">`POST`</mark> `/manager/trainings/stages/delete/{id}.json`

Soft-deletes the stage and detaches its missions (`training_stage_id` set to `NULL`). The missions themselves are not deleted.

### Reorder stages

<mark style="color:green;">`POST`</mark> `/manager/trainings/stages/reorder/{trainingId}.json`

| Field | Type | Required | Description |
|-------|------|----------|-------------|
| ids[] | string[] | Yes | Every stage id, in the wanted order |

Positions are rewritten in one transaction, so no two stages are left sharing an order.

### Record a stage check

<mark style="color:green;">`POST`</mark> `/manager/trainings/stage_checks/record.json`

| Field | Type | Required | Description |
|-------|------|----------|-------------|
| trainings_user_id | string | Yes | Enrollment id |
| training_stage_id | string | Yes | Stage being checked |
| result | string | Yes | `SAT` or `UNSAT` |
| pass | string | Yes | The acting user's password — re-authentication for the signature |
| remarks | string | No | Free text |
| user_training_flight_id | integer | No | Mission the check was flown on |

Results are append-only. A re-check is a new row with `attempt + 1`; the latest non-voided attempt decides the student's state.

The stored signature holds the signing user, timestamp, IP, browser and a keyed hash bound to that specific result, so a stamp cannot be altered or copied onto another record.

### Override a stage

<mark style="color:green;">`POST`</mark> `/manager/trainings/stage_checks/override.json`

| Field | Type | Required | Description |
|-------|------|----------|-------------|
| trainings_user_id | string | Yes | Enrollment id |
| training_stage_id | string | Yes | Stage to clear |
| reason | string | Yes | Why the student may proceed without a pass |
| pass | string | Yes | The acting user's password |

Recorded as `result = OVERRIDE`. A request without a reason is rejected.

### Void a result

<mark style="color:green;">`POST`</mark> `/manager/trainings/stage_checks/void/{id}.json`

| Field | Type | Required | Description |
|-------|------|----------|-------------|
| void_reason | string | Yes | Why the result is being withdrawn |

Results are voided, never edited. A voided result stays in the history and the previous result decides the state again. Voiding an already-voided result returns 400.

### Stage status

<mark style="color:blue;">`GET`</mark> `/trainings/students/stage_status/{enrollmentId}.json`

Readable by the enrolled student for their own enrollment, and by anyone who may manage the training.

```json
{
  "stage_checks": 1,
  "stages": [{ "TrainingStage": { "id": "…", "order": 1, "code": "S1", "name": "Presolo" } }],
  "gate": {
    "stages":   { "<stageId>": "OPEN | CHECK_DUE | COMPLETE | BLOCKED" },
    "missions": { "<missionId>": "OK | BLOCKED_STAGE" }
  },
  "results": [{ "StageCheckResult": { "attempt": 1, "result": "UNSAT", "…": "…" } }]
}
```

`results` includes voided rows — the audit trail is the point.

**This endpoint reports; it does not enforce.** The refusal that actually stops a flight happens when the mission is written, and a blocked mission returns 400 with *"This mission is blocked: an earlier stage check has not been passed."*

## Mission Authorizations

A signed release for one student to fly one mission. Single-use: the flight that uses it consumes it. Inert unless the training has `stage_checks = 1` and the mission has a `require_authorization` level.

`training_flights.require_authorization` is a **ceiling on `user_group_id`** — `NULL` means no authorization is needed, `170` lets flight instructors and everyone above them sign, `130` restricts it to company management. Because group ids descend in authority, a **higher number is the looser rule**.

### Grant

<mark style="color:green;">`POST`</mark> `/manager/trainings/mission_authorizations/grant.json`

| Field | Type | Required | Description |
|-------|------|----------|-------------|
| trainings_user_id | string | Yes | Enrollment id |
| training_flight_id | string | Yes | Mission being authorised |
| pass | string | Yes | The signer's password — re-authentication for the signature |
| limitations | string | No | Free text, e.g. `circuits only, wind below 15kt` |
| remarks | string | No | Free text |
| aircraft_id | integer | No | Restrict the release to one aircraft |

403 when the caller's `user_group_id` does not clear the mission's level. 400 when the mission needs no authorization, or when an open grant already exists for that student and mission.

The stored signature holds the signer, timestamp, IP, browser and a keyed hash bound to that grant. `granted_by_group_id` and `required_level` are stamped at grant time, so later changes to a user's group or the mission's level never rewrite what a past release meant.

### Revoke

<mark style="color:green;">`POST`</mark> `/manager/trainings/mission_authorizations/revoke/{id}.json`

| Field | Type | Required | Description |
|-------|------|----------|-------------|
| revoke_reason | string | Yes | Why the release is being withdrawn |

400 when the grant has already been used by a flight — that is history and cannot be withdrawn.

### List

<mark style="color:blue;">`GET`</mark> `/manager/trainings/mission_authorizations/index.json` — open (unused, unrevoked) grants for the company.

<mark style="color:blue;">`GET`</mark> `/trainings/mission_authorizations/pending/{enrollmentId}.json` — the full history for one enrollment, including used and withdrawn grants. Readable by the student for their own enrollment, and by instructors and above.

### Consumption

A grant is consumed when the mission row is written, and is **not** conditional on the mission being passed — a mission flown but failed still used the release. Three rules follow from that:

* Re-saving the flight that consumed a grant is allowed (the grant records `consumed_flight_id`).
* A *different* flight is refused; it needs its own signature.
* Deleting or cancelling the flight restores the grant.

### Blocked flights

A refused mission opens one `mission_blocks` row per (enrollment, mission) and sends one urgent message to the people who can sign it. Repeated refusals reuse that row and send nothing.

An hourly cron widens the audience one rung per `company_settings.training_block_escalation_hours` (default 4) while the block is unresolved: flight instructor → enrollment instructor → course tutor → student's supervisor → anyone in the company who clears the level. Rungs that cannot sign are skipped, never notified. Issuing the grant, flying the mission, or cancelling the flight resolves the block.

## Course Approvals

Recorded decisions over two subjects: `GRADUATION` (a `trainings_users.id`) and `REVISION` (a `training_revisions.id`). Only `GRADUATION` gates anything, and only while the course has `stage_checks = 1`.

All actions require `user_group_id <= 135` or being the training's `manager_id`.

### Queue

<mark style="color:blue;">`GET`</mark> `/manager/trainings/approvals/index.json` — everything `PENDING` in the company, oldest request first. A course manager (group > 135) sees only courses they manage.

### Decide

<mark style="color:green;">`POST`</mark> `/manager/trainings/approvals/decide/{id}.json`

| Field | Type | Required | Description |
|-------|------|----------|-------------|
| status | string | Yes | `APPROVED` or `REJECTED` |
| pass | string | Yes | The approver's password |
| decision_reason | string | On reject | Mandatory when rejecting |

400 when the item was already decided. An approved `REVISION` is stamped with `approved_by/at` and a SHA-256 `snapshot_hash` of the course content; an approved `GRADUATION` releases the enrollment to complete.

Graduation requests are created automatically: the first time a student's stages are all cleared, a `PENDING` row is opened. Repeating the check does not queue a second one.

### Course change log

Every structural edit is recorded in `training_changes`: the entity (`STAGE`, `MISSION`, …), its name **as it read at the time**, the action (`CREATED` / `UPDATED` / `DELETED`), a field-level `{field: {from, to}}` diff, and who made it. Each row is linked to the revision it belongs to.

`GET /manager/trainings/trainings/view/{id}.json` returns the open revision with its `changes[]`, so an approver sees the list before deciding rather than approving a revision number.

Two rules worth knowing:

* **A no-op edit records nothing.** Re-saving a record without changing a field opens no revision and queues no approval.
* **Only posted fields are compared.** A partial update is not treated as clearing everything it omitted.

### Undoing a change

<mark style="color:green;">`POST`</mark> `/manager/trainings/trainings/revert/{changeId}.json` — approvers only.

Answers `200` with `result: false` and a plain-language `message` when the change cannot be undone. Those are business answers, not errors:

* *"A later change to the same item has to be reverted first."*
* *"That mission has already been flown by a student, so it cannot be removed."*
* *"That stage still has missions assigned to it."*
* *"This deletion was recorded before full snapshots were kept…"*

`UPDATED` restores the recorded `from` values; a reorder restores the recorded id sequence; `CREATED` deletes the entity after an in-use check; `DELETED` restores the row from `training_changes.snapshot`.

The revert is stamped on the change (`reverted_at`, `reverted_by`) so it cannot be applied twice, and it opens a revision of its own — an undo is a change to the course like any other.

## Open trainings

> **Schema additions.** `trainings` gained `published` (tinyint), `enrollment_mode`
> `ENUM('CLOSED','REQUEST','INSTANT')`, `requirements` (longtext),
> `announcement_body` (longtext) and `cover_upload_id`. The existing
> `announcement` (varchar 255) is now the **short strapline** on the catalog
> card; the long copy lives in `announcement_body`.
>
> Two new tables: `training_intakes` (one dated run of a course) and
> `training_enrollment_requests` (a student's application). `trainings_users`
> gained a nullable `intake_id` — `NULL` for every enrollment that predates
> this feature, for every one a manager still creates off-catalog, and for
> every one taken on a `DISTANCE` course offered with no dates.
>
> An application is deliberately **not** a `trainings_users.status` value.
> Every "enrollments of this training" query in the plugin assumes a row there
> is a real enrollment, so a pending row living among them would leak into seat
> counts, student lists, reports, exam gates and the completion cron.

### Seat counting

A seat on an intake is held by:

- a `trainings_users` row with that `intake_id`, `deleted = 0` and status `ACTIVE` or `COMPLETED`; **plus**
- a `training_enrollment_requests` row with status `APPROVED` whose `trainings_user_id` is still `NULL` — approved, but the enrollment has not been created yet.

Waitlisted students hold **no** seat. Counts are derived on every read; there is no `seats_taken` column, so a stale counter can never overbook a course.

`seats` `NULL` means **unlimited**, which is not the same as `0`. When `seats` is `NULL`, `seats_left` is `null` and `full` is always `false`.

### Entry requirements

`trainings.requirements` (free text) explains entry conditions to humans. `training_requirements` rows are the ones the system checks, one row per rule, with `kind` deciding which value column is read:

| `kind` | Column | Meaning |
|--------|--------|---------|
| `CERTIFICATE` | `certificate_type` | an exact `user_certificates.type` |
| `HOURS` | `hours_function` + `hours_min` | `total`/`pic`/`sic`/`dual`/`fi`/`night`/`ifr`/`xc`/`me`, in **hours** |
| `COURSE` | `required_training_id` | another course, status `COMPLETED` |
| `AGE` | `min_age` | age on the day they apply |

**Certificate matching is strict**, and deliberately differs from flight dispatch. A rule naming `medical_class_1` is satisfied only by a certificate recorded as exactly that type: a `medical_class_2` does not satisfy it, and neither does one filed under the legacy coarse `medical` — *including* a coarse row whose free-text `name` reads "Medical Class 1". `CertificateComplianceEvaluator` takes its coarse→granular bridge as an injected `$familyMap`, and `EnrollmentPrerequisites` passes an empty one. Dispatch keeps the bridge (a school that never recorded classes would otherwise ground its fleet); an ATO asking for a Class 1 is asking a different question.

Hours come from `PilotHoursTotals`, the same roll-up the pilot totals card shows: PICUS and the instructor/examiner classes count as PIC, the instructor classes also count as FI, supervisor counts as neither. `user_details.flight_hours` — the career total a pilot declares on their profile — is added to `total` **only**, because it carries no seat breakdown.

A verdict is a list of per-rule answers, each with a reason **code**: `CERTIFICATE_MISSING`, `CERTIFICATE_EXPIRED`, `HOURS_SHORT`, `COURSE_NOT_COMPLETED`, `TOO_YOUNG`, `BIRTHDATE_UNKNOWN`. `BIRTHDATE_UNKNOWN` is not `TOO_YOUNG`: a profile with no date of birth is an unfilled field, not an underage applicant.

Certificates with `status = 'revoked'` are dropped before evaluation; everything else is judged on its issue/expiration dates.

A half-saved rule (kind `HOURS` with no `hours_min`, say) is **ignored**, never treated as unmeetable. Unknown kinds are ignored too, so an older backend never blocks everybody on a rule it cannot read.

### Plan and access

Every endpoint below requires the company to be on the **premium** or **unlimited** plan; any other plan answers `404`.

The plugin's inherited gate only covers `manager_`-prefixed actions, so the three student-facing endpoints (`catalog/*`, `enrollment_requests/submit`, `enrollment_requests/withdraw`) check the plan themselves.

| Endpoint group | Who |
|----------------|-----|
| `catalog/*`, `enrollment_requests/submit`, `enrollment_requests/withdraw` | Any user in the company |
| `intakes/*`, `requirements/*`, `enrollment_requests/decide` | `user_group_id` **≤ 150** |

New actions need an ACL entry. `aco_sync` creates the ACOs, but the `controllers` root grants read to every group **except 180, 240 and 250** — so the three student-facing actions also need explicit `aros_acos` rows, copied from `Trainings/Students/index`. Without them students get `403 ACL_DENIED`.

### Catalog

<mark style="color:blue;">`GET`</mark> `/trainings/catalog/index.json`

Courses this company is currently offering. A course reaches the catalog in one of two ways, and in both it must be `published`, `active`, and not in `CLOSED` mode:

- **Dated courses** need at least one intake in `PUBLISHED` or `FULL` whose `enroll_deadline` has not passed. A `NULL` deadline means "no deadline", not "expired".
- **`DISTANCE` courses need no intake at all.** An intake schedules a classroom — a start day to gather a group around and a seat count to cap the room — and a distance course has neither, nor does it need anyone from the school to open the door. A published distance course is therefore listed on its own, with `Intakes: []`, and the student starts whenever it suits them. A school that *does* put dates on a distance course is taken at its word: those intakes are returned, and students apply to them exactly as on an on-site course.

Because `location_id` and `month` are questions about a scheduled class, a course with no dates cannot answer them and drops out of a list filtered by either.

`trainings.template` is **not** a visibility flag and is not filtered on. It marks a course as a blueprint other schools may build from (`manager_templates` lists it), which says nothing about whether this school teaches it — a school may well offer the same course it shares as a template. "Show this course in the catalog" (`published`) is the only switch that decides visibility. Until Sep 2026 the catalog excluded templates, which made a published one invisible with no explanation on any screen.

Visible to every user in the company — the course's own requirements are the filter, not group membership.

#### Path Parameters

Filters ride as CakePHP **named parameters**, not a query string:
`/trainings/catalog/index/type:ONSITE/month:2027-01.json`

| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| type | string | No | `DISTANCE` or `ONSITE`. |
| location_id | string | No | Only courses with a date at this location. Excludes dateless courses. |
| month | string | No | `YYYY-MM` — courses with a date starting in that calendar month. Excludes dateless courses. |
| page | integer | No | Paginated, 50 per page (`maxLimit` 200). |

#### Response

```json
{
  "courses": [
    {
      "Training": {
        "id": "602852d0-953c-4783-a87d-31dc3626a689",
        "name": "ATPL (A)",
        "type": "DISTANCE",
        "announcement": "Evening ATPL",
        "announcement_body": "Full ATPL theory, evenings.",
        "color": "#249ac3",
        "enrollment_mode": "REQUEST",
        "duration": 750
      },
      "Intakes": [
        {
          "id": "06236fe7-2d0d-4094-83e7-285780c6ccd4",
          "name": "Jan 2027",
          "status": "PUBLISHED",
          "start": "2027-01-10",
          "end": "2027-06-30",
          "enroll_opens": null,
          "enroll_deadline": "2026-12-15",
          "seats": 2,
          "location_id": null,
          "seats_taken": 0,
          "seats_left": 2,
          "full": false
        }
      ],
      "Me": {
        "enrollment": "EXPELLED",
        "enrollment_intake_id": null
      }
    }
  ]
}
```

`view` also returns `Requirements` (the rules) and `Me.prerequisites` (this caller's verdict, `null` when the course checks nothing — which is not the same as a verdict where every rule passed). Each verdict row carries a `label`: the certificate catalogue and course names live on the server, and a key like `medical_class_1` or a course uuid means nothing to a client.

`Me` is what the **calling** user already is to this course: `enrollment` (the `trainings_users.status`, absent when never enrolled) and `request` (the newest application's status, with `request_intake_id` and `request_reason`). A closed enrollment — `COMPLETED`, `STOPPED`, `FAILED`, `EXPELLED` — does not stop a fresh application; retakes are normal.

### Catalog course

<mark style="color:blue;">`GET`</mark> `/trainings/catalog/view/{trainingId}.json`

The announcement, the requirements text, a subject summary and every open date, plus the caller's own state. The course object is the response **root** (no wrapper key).

Subjects carry `id`, `code`, `name`, `hours` and `order` only. This page is readable by anyone in the company who has **not** enrolled, so it never exposes lesson content.

`404` when the course is not published, not active, belongs to another company, or the plan does not allow it — the same answer in every case, so the endpoint cannot be used to probe for course ids.

```json
{
  "Training": {
    "id": "602852d0-953c-4783-a87d-31dc3626a689",
    "name": "ATPL (A)",
    "requirements": "Class 1 medical",
    "enrollment_mode": "REQUEST"
  },
  "Subjects": [
    { "id": "7b1e…", "code": "010", "name": "Air Law", "hours": "52.00", "order": 1 }
  ],
  "Intakes": [
    { "id": "06236fe7…", "name": "Jan 2027", "status": "PUBLISHED", "seats_left": 2, "full": false }
  ],
  "Me": {}
}
```

### Catalog summary

<mark style="color:blue;">`GET`</mark> `/trainings/catalog/summary.json`

A deliberately cheap payload for the home-screen widget: how many courses are on offer plus the first three cards. No seat counts, no per-student state — it is fetched on every home screen.

`count: 0` means the school is offering nothing, and is the signal to render no widget at all.

```json
{
  "count": 1,
  "courses": [
    {
      "id": "602852d0-953c-4783-a87d-31dc3626a689",
      "name": "ATPL (A)",
      "type": "DISTANCE",
      "announcement": "Evening ATPL",
      "color": "#249ac3",
      "next_start": "2027-01-10",
      "intakes": 1
    }
  ]
}
```

### Apply to a course

<mark style="color:green;">`POST`</mark> `/trainings/enrollment_requests/submit.json`

#### Request Body

Exactly one of `intake_id` or `training_id` identifies what is being applied to. Post `intake_id` for a seat on a date; post `training_id` on its own for a `DISTANCE` course offered with no dates. Posting both is not an error — the intake wins and names its own course, so a client cannot reach one course through another's dates.

| Field | Type | Required | Description |
|-------|------|----------|-------------|
| intake_id | string | Conditional | The date being applied to. Must belong to the caller's company. |
| training_id | string | Conditional | The course being applied to, when it is offered with no dates. Must belong to the caller's company. Ignored when `intake_id` is present. |
| note | string | No | Message for the school, shown to the manager in the approvals queue. |

Neither field is a way past the rules: a course-level application to an `ONSITE` course is refused with `INTAKE_NOT_FOUND`, and so is one to a `DISTANCE` course whose type has since changed. `400 Missing Intake Id` is returned only when neither field is posted.

#### Behavior

What happens is decided by the **server**, from the course's `enrollment_mode` and the seats left. The client must not assume:

| `outcome` | When |
|-----------|------|
| `ENROLLED` | `INSTANT` mode and seats free — the enrollment already exists. |
| `PENDING` | `REQUEST` mode — a manager must approve it. |
| `WAITLIST` | The intake is `FULL`, whatever the mode. |

Taking the last seat flips the intake to `FULL` **in the same transaction** as the enrollment, under a `SELECT … FOR UPDATE` on the intake row, so two students racing for one seat produce exactly one enrollment.

A **course-level application carries no seat**: there is no room to fill, so `WAITLIST` is unreachable, there is nothing to lock, and the mode alone decides between `ENROLLED` and `PENDING`. The resulting `trainings_users` row (or `training_enrollment_requests` row) keeps `intake_id` `NULL`, and is created through the same `TrainingsUser::enrol()` path as every other enrollment, so the audit trail is identical.

A refusal is a **soft `200`** carrying `result: false` and a reason **code** — never a sentence, because the wording belongs to the client in seven locales:

`NOT_PUBLISHED`, `COURSE_INACTIVE`, `ENROLLMENT_CLOSED`, `INTAKE_NOT_FOUND`, `INTAKE_NOT_OPEN`, `ENROLLMENT_NOT_OPEN_YET`, `ENROLLMENT_DEADLINE_PASSED`, `ALREADY_ENROLLED`, `ALREADY_APPLIED`, `PREREQUISITES_NOT_MET`.

The order of those checks is part of the contract: publication → mode → intake state → enrolment window → who the student already is → capacity. A **full intake whose deadline has passed is closed, not waitlistable**. The deadline day itself is still open — it is the last day to apply, not the first closed one.

With no intake, the middle of that order simply does not apply: publication and mode are checked as always, the intake state, window and capacity checks are skipped, and a live enrollment or a live application still blocks a second one. `INTAKE_NOT_FOUND` is what a course that needs dates answers when asked for a dateless application.

#### Entry requirements at submit time

Requirements are checked **after** the course's own eligibility, so a closed course answers `ENROLLMENT_CLOSED` rather than "you need a medical". What an unmet rule does depends on the mode:

* `INSTANT` — refused, soft `200` with `reason: "PREREQUISITES_NOT_MET"` and the full verdict in `prerequisites_verdict`. There is no human in that path to notice.
* `REQUEST` — allowed through. The verdict is stored on the application in `prerequisite_snapshot` as JSON, so the manager decides with it in front of them (a medical booked for Friday is a normal reason to approve anyway).

The snapshot is what was true **at submit time**. Editing or deleting a rule afterwards does not rewrite it, which is why the approvals queue reads the stored copy rather than re-evaluating.

A course with no requirement rows costs no extra queries: the facts a rule set needs are gathered per kind, so a course with no hours rule never pays for the aggregate queries `PilotHoursTotals` costs.

A student may hold only one live application per intake — and one per course for the dateless kind, which the `one_open_request` unique key covers by folding a `NULL` intake into the key as `-`. A double submit answers `ALREADY_APPLIED` rather than creating a second one or failing.

```json
{ "result": true, "outcome": "PENDING", "request_id": "6e4ab9d0-6594-46e1-beff-6019c907bb7e" }
```

```json
{ "result": true, "outcome": "ENROLLED", "trainings_user_id": "cab97254-4dab-4d9a-ae2e-851d052e2464" }
```

```json
{ "result": false, "reason": "ALREADY_APPLIED" }
```

### Withdraw an application

<mark style="color:green;">`POST`</mark> `/trainings/enrollment_requests/withdraw/{id}.json`

Only the applicant may withdraw, and only while the application is still `PENDING` or `WAITLIST`. An answered application returns `result: false` with reason `REQUEST_ALREADY_ANSWERED`. Anyone else's application is `404`.

```json
{ "result": true }
```

### Course dates

<mark style="color:blue;">`GET`</mark> `/manager/trainings/intakes/index/{trainingId}.json`

Every date of one course with its seat position. Paginated (`limit` 200, `maxLimit` 1000).

```json
{
  "intakes": [
    {
      "TrainingIntake": {
        "id": "06236fe7-2d0d-4094-83e7-285780c6ccd4",
        "name": "Jan 2027",
        "status": "PUBLISHED",
        "start": "2027-01-10",
        "end": "2027-06-30",
        "enroll_deadline": "2026-12-15",
        "seats": 2,
        "seats_taken": 1,
        "seats_left": 1,
        "full": false
      }
    }
  ],
  "training": {
    "Training": { "id": "602852d0…", "name": "ATPL (A)", "published": true, "enrollment_mode": "REQUEST" }
  }
}
```

### Save a course date

<mark style="color:green;">`POST`</mark> `/manager/trainings/intakes/save.json`

#### Request Body

| Field | Type | Required | Description |
|-------|------|----------|-------------|
| id | string | No | Omit to create. |
| training_id | string | Yes | The course. **Fixed at creation** — sending a different one on an update is ignored, because moving a date would move its applications and enrollments with it. |
| name | string | No | Shown to students, e.g. "Jan 2027". |
| status | string | No | `DRAFT` (default), `PUBLISHED`, `FULL`, `CLOSED`, `CANCELED`. |
| start / end | date | No | `YYYY-MM-DD`. `end` may not precede `start`. |
| enroll_opens / enroll_deadline | date | No | `YYYY-MM-DD`. The deadline may not precede the opening. |
| seats | integer | No | **Empty or absent means unlimited.** Send `0` only if you really mean nobody can enroll. |
| location_id | string | No | |
| notes | string | No | Internal, not shown to students. |

`company_id` is taken from the session and never from the payload.

```json
{
  "result": true,
  "validationErrors": [],
  "intake": { "TrainingIntake": { "id": "06236fe7…", "seats_taken": 0, "seats_left": 2, "full": false } }
}
```

```json
{
  "result": false,
  "validationErrors": { "end": ["The course cannot end before it starts"] }
}
```

> Note the PHP quirk: an **empty** `validationErrors` serialises as `[]` (array), a populated one as an object. Check for emptiness before treating it as a map.

### Delete a course date

<mark style="color:green;">`POST`</mark> `/manager/trainings/intakes/delete/{id}.json`

Soft delete. **Refused while any student is enrolled on the date** — cancel it instead, so the students and their history survive. The refusal is a soft `200` carrying the count:

```json
{
  "result": false,
  "message": "This intake has 1 enrolled student(s). Cancel it instead of deleting it.",
  "enrolled": 1
}
```

### Change a date's status

<mark style="color:green;">`POST`</mark> `/manager/trainings/intakes/status/{id}/{status}.json`

| Status | Meaning |
|--------|---------|
| `DRAFT` | Invisible to students. New dates start here. |
| `PUBLISHED` | In the catalog, taking applications. |
| `FULL` | Visible, **waitlist joins only**. Normally written by the application the moment the last seat goes; setting it by hand stops enrolment without cancelling the run. |
| `CLOSED` | No longer taking anyone. |
| `CANCELED` | The run is called off. |

Raising `seats` and setting `PUBLISHED` puts a full date back in the catalog. An unknown status is `400`.

```json
{ "result": true, "message": "Intake updated", "status": "CLOSED" }
```

### Decide an application

<mark style="color:green;">`POST`</mark> `/manager/trainings/enrollment_requests/decide/{id}/{decision}.json`

`decision` is `APPROVE` or `REJECT`. A rejection takes `{ "reason": "…" }`, which the student sees on the course page.

Approving creates the enrollment through `TrainingsUser::enrol()` — the same path the manager's own enrol screen uses, so the row and the `TrainingsUserStatusChange` audit entry are identical — stamps `trainings_user_id` on the application, and re-checks capacity **under a row lock**. A date that filled in the meantime answers `result: false` with `INTAKE_FULL` rather than overbooking.

Approving a `WAITLIST` row is how a waitlisted student is promoted. Promotion is always manual; nothing is promoted automatically when a seat frees up.

```json
{ "result": true, "outcome": "APPROVED", "trainings_user_id": "af1a9796-f5ed-438e-b6d3-6655d959ac62" }
```

```json
{ "result": false, "reason": "INTAKE_FULL" }
```

### Applications queue

Open applications also appear on the existing approvals endpoint, as a third queue beside `approvals` and `flights`:

<mark style="color:blue;">`GET`</mark> `/manager/trainings/approvals/index.json`

```json
{
  "approvals": [],
  "flights": [],
  "enrollments": [
    {
      "TrainingEnrollmentRequest": {
        "id": "6e4ab9d0…",
        "status": "PENDING",
        "student_note": "Evenings please",
        "created": "1789...",
        "user_id": "490"
      },
      "Training": { "id": "602852d0…", "name": "ATPL (A)" },
      "TrainingIntake": { "id": "06236fe7…", "name": "Jan 2027", "seats_taken": 0, "seats": 2 },
      "Applicant": { "id": 490, "name": "Martha Smith" }
    }
  ]
}
```

`PENDING` rows come before `WAITLIST` ones. The applicant's name arrives in `Applicant` rather than a `User` association: `users` lives in the main database while these rows live in `flylogs_trainings`, and the name is on `user_details` in any case. A course manager sees applications for their own courses; `user_group_id` ≤ 135 sees every course's.

## Exam sittings

> **Schema additions** (`flylogs_trainings`). Five new tables:
> `exam_authority_rules` (attempt limits the school configures),
> `exam_sittings` (one dated sitting), `exam_sitting_subjects` (the course
> subjects a sitting offers), `exam_registrations` (a student put forward for a
> sitting) and `exam_registration_subjects` (the subjects chosen, and the
> official result of each).
>
> These tables are separate from the internal `exams` table. `exams.caa_exam` is unchanged, and official results **never** write `activity_progress`. None of the tables has a fee or price column.
>
> **2026-09-16 (task #959):** `exam_registration_subjects.result` gained the value `ABSENT` (`flylogs/migrations/2026-09-16-exam-sittings-absent.sql`, ENUM change only), and `manager_student` was added (needs `aco_sync`).

A sitting is `type` `AUTHORITY` (the authority's exam; Flylogs only manages registration and results) or `SCHOOL`. `datetime` is a unix timestamp. `registration_opens` / `registration_deadline` are `Y-m-d` dates, and the deadline day is the last day to register **or cancel**. `seats` and `max_subjects` `NULL` mean unlimited / no cap.

### Plan and access

Every endpoint requires the **premium** or **unlimited** plan; any other plan answers `404`. The student-facing actions check the plan themselves, because the plugin's inherited gate only covers `manager_` actions.

| Endpoint group | Who |
|----------------|-----|
| `exam_registrations/index`, `register`, `cancel`, `mine` | Any user in the company. `cancel` only works on the caller's own registration. |
| `exam_sittings/manager_*` (reads included) | `user_group_id` **≤ 150** |

The 19 new actions need `aco_sync`. The four student actions also need explicit `aros_acos` grants copied from `Trainings/Students/index`, like the catalog: see `flylogs/migrations/2026-09-13-exam-sittings-acl.md`.

### Attempt rules

`exam_authority_rules` rows are **data the school edits**; no regulation is encoded in code.

| Column | Meaning |
|--------|---------|
| `max_attempts_per_subject` | Attempts at one subject |
| `max_sittings` | Distinct sittings used, across every subject |
| `min_days_between_attempts` | Calendar days between two attempts at the same subject, pass or fail |
| `completion_window_months` | Window within which later sittings must fall |
| `window_starts_on` | `FIRST_ATTEMPT` or `FIRST_PASS`, at any subject |
| `window_from_month_end` | `1` starts the window at the end of the anchor's calendar month |

Every limit is nullable: `NULL` means **not limited**. `0` is refused by validation.

`ExamAttemptPolicy` evaluates one subject at one candidate sitting and returns this verdict:

```json
{
  "verdict": "BLOCK",
  "reason": "TOO_SOON",
  "reasons": [{ "reason": "TOO_SOON", "verdict": "BLOCK" }, { "reason": "LAST_ATTEMPT", "verdict": "WARN" }],
  "rule": "EASA",
  "attempts_used": 1, "attempt_no": 2, "max_attempts": 2,
  "sittings_used": 1, "max_sittings": null,
  "passed": false, "last_attempt_at": 1791877884,
  "next_eligible_date": "2026-11-12", "window_ends": "2028-04-30"
}
```

`BLOCK` reasons: `ATTEMPTS_EXHAUSTED`, `SITTINGS_EXHAUSTED`, `WINDOW_EXPIRED`, `TOO_SOON`. `WARN` reasons: `ALREADY_PASSED`, `LAST_ATTEMPT`, `LAST_SITTING`. `reason` is always the most severe reason present.

* An attempt is an `exam_registration_subjects` row with `result` `PASS`, `FAIL` or `ABSENT` and a `sat_at`. An absence spends the attempt like a `FAIL` (never a pass) — the authority counts a no-show, so the school does too (task #959). `PENDING` is not an attempt.
* History is scoped **per rule**: all the student's sat results in sittings with the same `authority_rule_id`. Sittings with no rule share one scope of their own, so they still get counters but never a `BLOCK`.
* The candidate sitting's own results are left out, so a sitting whose results are in still reads as the attempt it was.
* Days are counted in the company timezone.

### Eligibility and seats

A student may register for a subject when their enrolment on the subject's course is:

* `COMPLETED`; or
* `ACTIVE`, with every mandatory `EXAM` activity of the subject done (`activity_progress.value = 1` on that enrolment); or, when the subject has no mandatory exam, every mandatory `LESSON` done.

`STOPPED`, `FAILED` and `EXPELLED` enrolments are not eligible.

A registration holds a seat while it is `PENDING`, `CONFIRMED`, `SAT` or `ABSENT`. Counts are derived on every read. A sitting flips `PUBLISHED` → `FULL` when its last seat is taken and back again when one frees up; `FULL` is never set by hand.

### Student: open sittings

<mark style="color:blue;">`GET`</mark> `/trainings/exam_registrations/index.json` (named param `page`)

This returns sittings in `PUBLISHED` or `FULL` that haven't taken place yet and whose deadline hasn't passed. Each sitting lists **only the subjects the caller is eligible for**, each with its `attempt` verdict. A sitting with no eligible subject and no registration of the caller's is left out.

```json
{
  "sittings": [{
    "ExamSitting": { "id": "…", "name": "October theory", "type": "AUTHORITY", "status": "PUBLISHED", "datetime": 1792400000, "registration_deadline": "2026-10-01", "seats": 20, "max_subjects": 4, "seats_taken": 3, "seats_left": 17, "rule_name": "EASA", "location_name": "Madrid" },
    "Subjects": [{ "id": "…", "training_subject_id": "…", "code": "010", "name": "Air Law", "training_name": "ATPL(A)", "seats": null, "taken": 2, "seats_left": null, "eligible": true, "eligibility_reason": null, "attempt": { "verdict": "OK", "attempt_no": 1 } }],
    "Registration": null,
    "can_register": { "allowed": true, "reason": null }
  }],
  "paging": { "page": 1, "pageCount": 1 }
}
```

### Student: register

<mark style="color:green;">`POST`</mark> `/trainings/exam_registrations/register.json`

```json
{ "sitting_id": "…", "subjects": ["<exam_sitting_subjects.id>", "…"], "note": "optional" }
```

The server validates the request under a row lock on the sitting, so two students racing for the last seat get one registration and one refusal. A refusal is `{ "result": false, "reason": "…", "subject_id": "…" }`. The reasons, in the order they are checked:

`SITTING_FULL`, `SITTING_NOT_OPEN`, `SITTING_PAST`, `REGISTRATION_NOT_OPEN_YET`, `REGISTRATION_DEADLINE_PASSED`, `ALREADY_REGISTERED`, `NO_SUBJECTS`, `TOO_MANY_SUBJECTS`, `SUBJECT_NOT_OFFERED`, `SUBJECT_NOT_ELIGIBLE`, `ATTEMPT_BLOCKED`, `SUBJECT_FULL`, `SITTING_FULL`.

A new registration is `PENDING`. A subject whose verdict is `WARN` is accepted, and the warning comes back in the response:

```json
{ "result": true, "registration": { "id": "…", "status": "PENDING", "subjects": ["…"] }, "warnings": [{ "subject_id": "…", "reason": "LAST_ATTEMPT" }] }
```

### Student: cancel

<mark style="color:green;">`POST`</mark> `/trainings/exam_registrations/cancel/{id}.json`

This cancels the caller's own `PENDING` or `CONFIRMED` registration, up to and including the registration deadline, or until the sitting starts when there is no deadline. Refusals: `CANNOT_CANCEL_STATUS`, `CANCEL_DEADLINE_PASSED`. Another user's registration id answers `404`.

### Student: my registrations

<mark style="color:blue;">`GET`</mark> `/trainings/exam_registrations/mine.json` (named param `page`)

This returns `registrations`, newest first, each with `ExamSitting`, `Subjects` (result, score, attempt_no, and `training_id` so a course page can filter to its own subjects), `files` (see *Official result reports*) and `can_cancel`. It also returns `standing`: one entry per rule and subject the caller has ever sat (with `training_id`), with the `attempt` verdict evaluated as of now (attempts used, passed, next eligible date, window end). `standing` is built from the whole history, not from the current page.

Both this endpoint and the manager's `manager_student` below are shaped by `ExamStudentRecord`, so the student's page and the manager's view of the same student always agree.

### Manager: one student's record

<mark style="color:blue;">`GET`</mark> `/manager/trainings/exam_sittings/student/{user_id}.json` (named param `page`; `limit` 100, `maxLimit` 500)

Same payload as `mine` (`registrations`, `standing`, `paging`) for the given student, who must belong to the session company and not be deleted (`404` otherwise). Requires `user_group_id` ≤ 150. Needs `aco_sync`; it inherits the root allow like every other `manager_*` action. NEO's enrolment pages (`/trainings/view/{enrolment}` for the student, `/manager/trainings/students/view/{enrolment}` for a manager) render an **Exam sittings** section inside their Exams tab from these two endpoints, filtered to the course's `training_id`. Both pages accept `?tab=exams`, and the manager sittings page accepts `?sitting={id}` to open one sitting's registration list directly.

### Manager: sittings

| Method | Path | Notes |
|--------|------|-------|
| `GET` | `/manager/trainings/exam_sittings/index.json` | Named params `status`, `page`. Rows carry `seats_taken`, `rule_name`, `Subjects` and `Registrations` (count by status). `limit` 50. |
| `GET` | `/manager/trainings/exam_sittings/view/{id}.json` | One sitting with `Subjects` and `Rule`. |
| `GET` | `/manager/trainings/exam_sittings/options.json` | `trainings` (with `Subjects`), `rules`, `locations` for the form. |
| `POST` | `/manager/trainings/exam_sittings/save.json` | Create or update. Ignores `status`, `company_id` and `deleted`. |
| `POST` | `/manager/trainings/exam_sittings/status/{id}/{status}.json` | `DRAFT`, `PUBLISHED`, `CLOSED` or `CANCELED`. Publishing a sitting with no seats left lands on `FULL`. |
| `POST` | `/manager/trainings/exam_sittings/delete/{id}.json` | Soft delete. Refused while any registration is `PENDING`, `CONFIRMED`, `ABSENT` or `SAT`; the response carries `registered`. |

`save.json` takes an optional `subjects` array, `[{ "training_subject_id": "…", "seats": null }]`. When it is present, the offered subjects are reconciled to match it row by row: new subjects are added, seat changes are updated, and subjects left out are soft-deleted. Removing a subject that someone holds a seat for rolls the whole save back with `{ "result": false, "reason": "SUBJECT_HAS_REGISTRATIONS", "subject_id": "…", "registered": 2 }`. Every subject must belong to one of the company's courses (otherwise `404`), and so must the rule, course and location.

### Manager: registrations and results

<mark style="color:blue;">`GET`</mark> `/manager/trainings/exam_sittings/registrations/{id}.json` (named params `page`, `limit` up to 1000)

This returns every registration with `Applicant` `{ id, name }` and `Subjects`. Each subject carries its result and a `verdict` evaluated as of this sitting.

<mark style="color:green;">`POST`</mark> `/manager/trainings/exam_sittings/registration_status.json`

```json
{ "sitting_id": "…", "ids": ["…"], "status": "CONFIRMED", "reason": "optional, stored on REJECTED/CANCELED" }
```

| To | Allowed from |
|----|--------------|
| `CONFIRMED` | `PENDING`, `ABSENT`, `REJECTED`, `CANCELED` |
| `REJECTED` | `PENDING`, `CONFIRMED` |
| `CANCELED` | `PENDING`, `CONFIRMED`, `ABSENT` |
| `ABSENT` | `PENDING`, `CONFIRMED` |

`SAT` is never set here. Moving a registration to `ABSENT` stamps every subject whose `result` is still `PENDING` as `ABSENT`, with `sat_at` and `attempt_no` exactly as a `FAIL` would get them, inside the same transaction; leaving `ABSENT` (to `CONFIRMED`, `PENDING` or `CANCELED`) puts those subjects back to `PENDING` and clears the stamps, so a withdrawn absence never counts. Rows that can't make the requested change are skipped, not failed: `{ "result": true, "updated": [...], "skipped": [{ "id": "…", "reason": "INVALID_TRANSITION" | "SITTING_FULL" | "NOT_FOUND" }] }`. Moving a registration back into a seat-holding status is refused per row once the sitting is full.

<mark style="color:green;">`POST`</mark> `/manager/trainings/exam_sittings/results/{id}.json`

```json
{ "results": [{ "id": "<exam_registration_subjects.id>", "result": "PASS", "score": 88 }] }
```

`PASS`/`FAIL`/`ABSENT` stamps `sat_at` (the sitting's `datetime`) and `attempt_no` (from the student's earlier sat results under the same rule, this sitting excluded). A `PASS` or `FAIL` anywhere marks the registration `SAT`; absences alone mark it `ABSENT`. `PENDING` clears the result; a `SAT` or `ABSENT` registration with nothing sat left returns to `CONFIRMED`. `ABSENT` is never announced to the student. Skip reasons: `NOT_FOUND`, `UNKNOWN_RESULT`, `REGISTRATION_NOT_ACTIVE` (rejected or cancelled), `INVALID`.

### Manager: register a student

<mark style="color:blue;">`GET`</mark> `/manager/trainings/exam_sittings/candidates/{id}.json`

This returns every live user of the company (`users.deleted = 0`, `active = 1`) with an `ACTIVE` or `COMPLETED` enrolment on a course whose subjects the sitting offers, sorted by name. Each candidate carries `registered` (they already hold a live registration here) and `Subjects`, keyed by `exam_sitting_subjects.id`, each with `eligible`, `eligibility_reason` (`NOT_ENROLLED`, `ENROLMENT_CLOSED`, `EXAMS_NOT_PASSED`, `LESSONS_NOT_COMPLETE`) and `attempt`, the verdict at this sitting. Eligibility is shown here, not enforced.

<mark style="color:green;">`POST`</mark> `/manager/trainings/exam_sittings/register.json`

```json
{ "sitting_id": "…", "user_id": 490, "subjects": ["<exam_sitting_subjects.id>"], "note": "optional" }
```

The request is checked by `ExamRegistrationRules::decideForManager()` under the same row lock as a student's registration. A manager is **not** bound by the registration window, the sitting's date (so past sittings can be recorded), `DRAFT`/`CLOSED` status, or eligibility. A manager **is** bound by a `CANCELED` sitting, one live registration per student, `max_subjects`, the offered subjects, seats and the attempt rules (`ATTEMPT_BLOCKED`).

The user must belong to the session company and be live; otherwise the call answers `404`. The registration is created `CONFIRMED` and the student is notified. Subjects the student isn't ready for, and attempt warnings, come back as `warnings`:

```json
{
  "result": true,
  "registration": { "id": "…", "status": "CONFIRMED", "subjects": ["…"] },
  "warnings": [
    { "subject_id": "…", "reason": "NOT_ELIGIBLE", "detail": "EXAMS_NOT_PASSED" },
    { "subject_id": "…", "reason": "LAST_ATTEMPT" }
  ]
}
```

### Manager: reset a student's attempt history

<mark style="color:green;">`POST`</mark> `/manager/trainings/exam_sittings/reset_attempts.json`

```json
{ "user_id": 490, "authority_rule_id": "…", "reason": "Restarted the ATPL course" }
```

This gives a fresh count for a student under one rule, typically after they restart their training having used up their attempts. It inserts one `exam_attempt_resets` row (`company_id`, `user_id`, `authority_rule_id`, `reset_at`, `reason`, `created_by`). The table is insert-only, and **no result is edited or deleted**.

`ExamSittingFacts::history()` then ignores every sat result with `sat_at <= reset_at` for that student and rule, via the latest reset. That affects every verdict, the `attempt_no` stamped on new results, and the student's `standing`. Attempts, sittings and the completion window all start again. Earlier registrations still show their results and attempt numbers.

| Response | When |
|----------|------|
| `{ "result": true, "reset": { "id": "…", "user_id": 490, "authority_rule_id": "…", "reset_at": 1789300000 } }` | Saved; the student is notified |
| `{ "result": false, "reason": "REASON_REQUIRED" }` | Empty reason |
| `404` | Rule not in the company, or student not a live user of the company |

`candidates/{id}.json` carries `reset_at` per candidate (the latest reset under the sitting's rule, or `null`) and `sitting.Rule`. Requires `user_group_id` ≤ 150.

### Notifications

The student receives a message through `Message::fastSave`: in-app, plus email according to their notification settings. It links to `/trainings/exam_sittings` and is sent:

| Trigger | Subject |
|---------|---------|
| `manager_register` | `Registered for exam: {sitting}`, with the subject list |
| `registration_status` → `CONFIRMED` | `Exam registration confirmed: {sitting}`, with the subject list |
| `registration_status` → `REJECTED` | `Exam registration not accepted: {sitting}`, with the reason, HTML-escaped |
| `registration_status` → `CANCELED` | `Exam registration cancelled: {sitting}`, with the reason, HTML-escaped |
| `results` | `Exam results: {sitting}`, listing each subject whose result **changed** to `PASS`/`FAIL`, with its score |
| `reset_attempts` | `Exam attempt history reset: {rule}`, with the reason, HTML-escaped |

Nothing is sent for `ABSENT` (as a status or as a result), for a score-only correction, or when the same result is saved again. Messages are sent after the transaction commits; a failure is logged and never undoes the change.

### Official result reports

One report per **student per sitting**: managers attach the authority's result report to the student's registration through the generic uploads API with `model` `ExamRegistration` and `foreign_key` the `exam_registrations.id` (`/uploads/sign` → PUT → `/uploads/complete`, or the legacy `/uploads/create`; list with `/uploads/index/ExamRegistration/{registration_id}.json`). No new endpoint and no ACL change: the uploads index is company-scoped, and the registration id is a UUID the student already holds. `manager_registrations`, `mine` and `manager_student` each carry, per registration, `files` (count) and `Files` (list of `{ id, name, url, mime, icon }`, `url` being the signed CDN link `Upload::afterFind()` builds, valid about an hour), from `ExamStudentRecord::files()`. NEO shows the file as a plain link under the subjects on every view; the manager's registration list also opens an upload box per row on request.

### Manager: authority rules

| Method | Path | Notes |
|--------|------|-------|
| `GET` | `/manager/trainings/exam_sittings/rules.json` | Each rule carries `sittings`, the number of sittings using it. |
| `POST` | `/manager/trainings/exam_sittings/rule_save.json` | Create or update. Empty limits are stored as `NULL`. |
| `POST` | `/manager/trainings/exam_sittings/rule_delete/{id}.json` | Soft delete, refused while a sitting uses the rule (`sittings` in the response). |
