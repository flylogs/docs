# Trainings

> **v2 schema**. The trainings plugin uses a unified-activities schema:
> `training_activities` orders lessons + exams together (drag-drop ordering),
> `activity_progress` is the single source of truth per (enrollment, activity),
> and `exams` covers both ONLINE and ONSITE (column `type`). Sessions
> (renamed from `lesson_classes`) bind to a single `training_activity_id`.
> Attendance % comes from `session_students.invited` vs `attended`; progress %
> from `activity_progress.value`. The two are independent (a student can have
> attended a paper exam but not passed it).

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
        "finished": false,
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

- `students_count` (int): total `trainings_users` rows for the training (includes finished enrollments; not deduplicated by user).
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
      "finished": false,
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
    "TrainingFlightTypes": {}
  },
  "performedFlightTrainings": []
}
```

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
    "finished":      false,
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
- `flight.progress` — `total` = count of `TrainingFlight` templates in the training. `completed` = distinct templates with at least one `UserTrainingFlight.completed = 1` row (non-draft, non-deleted flight). Same logic as `Training.FlightProgress` in `My Trainings`.
- `flight.attendance` — per-mission attempt counts across all `user_training_flights` for the enrollment (each row = one attempt). `passed = sum(completed = 1)`. Useful for "X attempts / Y passes" badges.
- `flight.hours.planned` = `SUM(TrainingFlight.hours)`. `flight.hours.flown` = `SUM(Flight.block_time) / 3600` over non-draft, non-deleted flights linked through `user_training_flights`. Rounded to one decimal.
- `finished` mirrors `TrainingsUser.finished`.

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

### Student View

<mark style="color:blue;">`GET`</mark> `/trainings/subjects/view/{enrollmentId}/{subjectId}.json`

Retrieve subject details with lessons, exams, and progress for the enrolled student.

**Reset filter:** if a lesson-gate exam has been reset (`ActivityProgress.reset_at` is set), the `ExamAttempt[]` list under that activity contains only attempts where `start > reset_at` (falling back to `created` when `start` is empty). Pre-reset attempts are hidden from the student here; they remain in the DB and are surfaced — flagged with `reset: true` — in `GET /manager/trainings/students/view/{enrollmentId}.json` for manager review.

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
      "teacher_id": "101"
    },
    "Training": {
      "id": "10",
      "name": "PPL Ground School",
      "type": "ground",
      "active": true,
      "flights": false,
      "time_online": true
    },
    "Teacher": {
      "UserDetail": { "name": "Maria", "surname": "Garcia" }
    },
    "Lesson": [
      {
        "id": "50",
        "name": "Cloud Formation",
        "minutes": "120",
        "TrainingActivity": {
          "id": "act-50",
          "order": "1",
          "ActivityProgress": [
            { "value": 1, "time": 1800, "session_id": "s-1", "Session": { "datetime": "2025-03-01 09:00:00" } }
          ]
        },
        "Exam": { "id": "e-pre", "ExamAttempt": [{ "passed": true }] }
      }
    ],
    "Exam": [
      {
        "id": "e-9",
        "name": "Final",
        "type": "ONSITE",
        "mandatory": true,
        "TrainingActivity": {
          "id": "act-e9",
          "order": "2",
          "ActivityProgress": [
            { "value": 1, "score": "85", "code": "PASS", "notes": "", "session_id": "s-2", "created": "2025-03-15 10:00:00", "Session": { "datetime": "2025-03-15 10:00:00" } }
          ]
        }
      }
    ],
    "Progress": { "total": 12, "completed": 5, "finished": false, "lessons": {} }
  }
}
```

Onsite exam `ActivityProgress` is sorted by `Session.datetime` ascending.

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

The training row is **not** touched. If the training was `finished=true` before the reset (unlikely on a DISTANCE in the failed branch), it stays finished — flip it manually if needed.

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
- `TrainingActivity` — the bound activity (`id`, `kind`, `lesson_id`, `exam_id`, `training_subject_id`) with its nested children:
  - `TrainingActivity.TrainingSubject` including `Training` and `Training.Metric[]` — competency metrics defined on the training (`id`, `name`, `training_id`), ordered by name. Used to render the metric grid alongside attendance without an extra request.
  - `TrainingActivity.Lesson` (when `kind=LESSON`) with `LearningObjective[]` — objectives attached to the lesson (`id`, `name`, `description`, `training_subject_lesson_id`), ordered by name.
  - `TrainingActivity.Exam` (when `kind=EXAM`).
- `attendances` — `ActivityProgress` rows for the session (scoped to the requesting user unless teacher/manager).

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

### Store Attendance

<mark style="color:green;">`POST`</mark> `/trainings/onsite/store_attendance.json`

Record attendance for a class session.

**Body**

| Field | Type | Required | Description |
|-------|------|----------|-------------|
| data[session_id] | string | Yes | `TrainingSession.id` |
| data[attendance][{activity_progress_id}][value] | int/bool | Yes | 1/0 attendance flag |
| data[attendance][{activity_progress_id}][exam_value] | int/bool | No | Exam activities only — overrides `value` |
| data[attendance][{activity_progress_id}][exam_rating] | number | No | Exam score |
| data[attendance][{activity_progress_id}][notes] | string | No | Exam notes |
| data[attendance][{activity_progress_id}][code] | string | No | Exam code |

### Sign Attendance

<mark style="color:green;">`POST`</mark> `/trainings/onsite/sign_class.json`

Digitally sign class attendance (teacher confirmation).

| Field | Type | Required | Description |
|-------|------|----------|-------------|
| classId | string | Yes | Class session ID |
| password | string | Yes | Teacher's password for verification |

**Side effect — attendance notification.** On a successful first sign (status transitioning from `scheduled`/`open` to `closed`), every student with an `activity_progress` row for the session receives a non-urgent in-app message via `Messages.Message::fastSave`, sender = signing teacher. Per-recipient body includes:

- Their attendance result (Attended / Not attended).
- For exam activities: rating (`score`) and result (Passed / Failed, derived from `value`).
- A reminder + frontend link to sign their own attendance, if `value=1` but `signature` is empty.
- The next `TrainingActivity` in the same `training_subject_id` (by `order`). If a future `Session` exists for that activity, it is shown with date and a frontend class-view link; otherwise just the activity name.
- If that next activity is an `Exam` of `type=ONLINE` and the student attended this one, an extra line linking to `FRONTEND_HOST/trainings/exams/start/{exam_uuid}`.

The message `redirect` field is `/trainings/onsite/class/{sessionId}`. Notification failures do not affect the sign response.

### Unsign Class

<mark style="color:green;">`POST`</mark> `/trainings/onsite/unsign_class.json`

Remove digital signature from a class.

---

## Student Evaluation

Per-student evaluation for an onsite/remote class session. Backed by `activity_progress` (one row per `(trainings_user_id, training_activity_id)`) plus two child tables:

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
- `Training.active` must be true.
- `Exam.deleted = false` (soft-deleted exams never returned).

Each `Exam` row carries `available: true|false`. `available` is `false` when any of: exam expired, exam deleted, training not active, or the question bank holds fewer questions than `Exam.questions` (insufficient pool to compose an attempt).

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
        "available": true
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

### Preview Exam

<mark style="color:blue;">`GET`</mark> `/trainings/exams/start/{enrollmentId}/{examId}.json`

Preview exam details and previous attempts before starting.

### Start Exam

<mark style="color:green;">`POST`</mark> `/trainings/exams/start/{enrollmentId}/{examId}.json`

Begin an exam attempt.

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

Submit the exam for grading.

### View Result

<mark style="color:blue;">`GET`</mark> `/trainings/exams/view/{attemptId}.json`

Retrieve exam results and (when enabled) correct answers.

---

## Students Management

### List Students

<mark style="color:blue;">`GET`</mark> `/manager/trainings/students/list/training:{trainingId}/finished:{finished}/group:{groupId}/pilot_group:{pilotGroupId}/username:{search}.json`

Retrieve students with filtering. All filter parameters optional (use empty string to skip).

### View Student

<mark style="color:blue;">`GET`</mark> `/manager/trainings/students/view/{enrollmentId}.json`

Retrieve full student enrollment details.

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

- A student already enrolled in the training is **skipped**, unless their prior enrollment is marked `finished = true` — in which case a fresh enrollment is created (re-take).
- Pilot group entries are expanded to their members; members already enrolled are skipped.
- For each successful enrollment on an `active` training, an in-app notification is sent to the student linking to the enrollment.

#### Response

```json
{
  "results": {
    "123": {
      "TrainingsUser": {
        "id": "e1f2a3b4-...",
        "training_id": "t1u2v3w4-...",
        "user_id": "123",
        "supervisor_id": "987",
        "finish_before": 1735689600
      }
    },
    "456": false
  }
}
```

`results` is a map keyed by user ID. The value is the saved record on success or `false` if that individual save failed validation.

#### Errors

| Status | When |
|--------|------|
| `400 Bad Request` | Not a POST, empty body, missing `training_id`, or `students` is not an array. |
| `404 Not Found` | `students` array is empty, or `training_id` does not match a training in the user's company. |

### Save Student Notes

<mark style="color:green;">`POST`</mark> `/manager/trainings/students/notes.json`

Update notes for a student enrollment.

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

Retrieve training completion certificate data. Gated strictly on `TrainingsUser.finished = 1`. If the auto-completion mechanism (below) hasn't fired, this endpoint returns `404 Training not finished yet` regardless of how complete the activities look.

**Manager fallback**: `Training.manager_id` may be `NULL`. When it is, `Training.Manager` is filled with the first company user in `user_group_id` ∈ (100, 105, 135) that has a non-empty `UserDetail.signature` so the certificate always has a signatory. Returned shape matches the normal Manager: `{ id, UserGroup.name, UserDetail.{name, surname, signature} }`. If no such user exists `Training.Manager` stays empty.

---

## Auto-Completion

There are two boolean training-level flags that govern automatic completion behavior. Both default to `0`.

| Field | Description |
|-------|-------------|
| `Training.auto_finish` | When `1`, every write to `ActivityProgress` or `UserTrainingFlight` triggers a re-evaluation of the enrollment. If all activities AND all flight missions are complete, `TrainingsUser.finished` is set to `1` and `TrainingsUser.validity` is stamped with `now + Training.validity * DAY` (i.e. `Training.validity` is the certificate lifetime in **days**). |
| `Training.allow_auto_restart` | When `1`, on a **DISTANCE** training, students can self-serve a lesson reset via `POST /trainings/lessons/reset.json` (see above) once they've exhausted lesson-gate exam attempts without passing. |

### Completion rule (used by `TrainingsUser::checkTrainingFinished`)

An enrollment is considered `finished` when **all** of the following hold:

1. The training's date window allows it: `Training.start <= today <= Training.end` (NULL bounds are treated as open-ended).
2. `Training::getProgress(training_id, enrollment_id).finished == true` — every mandatory activity has `ActivityProgress.value = 1`, and every mandatory lesson-gate exam has been passed.
3. **Flights** (applies to every training type that has flight missions, not just DISTANCE): for every `TrainingFlight` row attached to the training there is at least one `UserTrainingFlight` row with `completed = 1` scoped to this enrollment. A training with zero `TrainingFlight` rows passes this clause trivially.

If `Training.auto_finish = 0`, the check still works when called manually (e.g. admin recompute), but it is **not** invoked automatically on writes.

Frontend implications:

- After a successful `POST /trainings/lessons/complete.json`, `POST /trainings/exams/finish.json` or any UserTrainingFlight write, re-fetch `/trainings/trainings/view/{enrollmentId}.json` to see whether `TrainingsUser.finished` flipped. Don't rely on a separate "did it finish?" call.
- The certificate endpoint only succeeds once `finished = 1` is persisted — there is no "force compute" query string.
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
