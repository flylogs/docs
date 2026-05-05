# Trainings

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
- `Training.Lessons` (only when `Training.theory == true`): ground-school progress.
  - For `type = "DISTANCE"`, computed from passed exams + slide-attendance.
  - For `type = "ONSITE"` / `"REMOTE"`, computed from class attendance on past `LessonClass` rows.
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
      "LessonClass": {
        "id": "300",
        "training_subject_id": "20",
        "training_subject_lesson_id": "50",
        "training_subject_exam_id": "0",
        "datetime": "2025-03-15 09:00:00",
        "status": "scheduled",
        "teacher_id": "101",
        "signature": null,
        "minutes": "120",
        "location_id": "5",
        "remarks": ""
      },
      "TrainingSubjectLesson": {
        "name": "Cloud Formation",
        "training_subject_id": "20",
        "TrainingSubject": { "name": "Meteorology" }
      },
      "TrainingSubjectExam": { "name": null, "training_subject_id": null },
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
      "description": "Private Pilot Licence ground theory",
      "TrainingSubject": [
        {
          "id": "20",
          "code": "MET",
          "name": "Meteorology",
          "hours": "40",
          "lessons": "12",
          "training_id": "10",
          "TrainingSubjectLesson": [
            { "id": "50", "minutes": "120", "training_subject_id": "20" }
          ],
          "TrainingSubjectExam": [],
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

### Student View

<mark style="color:blue;">`GET`</mark> `/trainings/subjects/view/{enrollmentId}/{subjectId}.json`

Retrieve subject details with lessons, exams, and progress.

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
      "total_minutes": 2400
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
    "TrainingSubjectLesson": [
      {
        "id": "50",
        "name": "Cloud Formation",
        "minutes": "120",
        "mandatory": true,
        "order": "1",
        "TrainingSubjectAttendance": [
          { "value": true, "LessonClass": { "datetime": "2025-03-01 09:00:00" } }
        ]
      }
    ],
    "TrainingSubjectExam": [],
    "Progress": { "total": 12, "completed": 5, "finished": false, "lessons": {} }
  }
}
```

---

## Lessons

### View Lesson

<mark style="color:blue;">`GET`</mark> `/trainings/lessons/view/{lessonId}/{enrollmentId}.json`

Retrieve lesson details and attendance records.

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

### Lesson Attendance

<mark style="color:blue;">`GET`</mark> `/trainings/lessons/attendance/{subjectId}.json`

Retrieve attendance records for all lessons in a subject.

---

## Class Sessions

### View Class

<mark style="color:blue;">`GET`</mark> `/trainings/onsite/class/{id}.json`

Retrieve class session details including attendance.

### Schedule Class

<mark style="color:green;">`POST`</mark> `/manager/trainings/onsite/class.json`

Create or update a class session. Sent as `application/x-www-form-urlencoded`.

| Field | Type | Required | Description |
|-------|------|----------|-------------|
| training_subject_id | string | Yes | Subject ID |
| training_subject_lesson_id | string | No | Lesson ID (if class covers a specific lesson) |
| training_subject_exam_id | string | No | Exam ID (if class is an exam session) |
| start | string | Yes | Start datetime |
| teacher_id | string | Yes | Teacher user ID |
| location_id | string | No | Location ID |
| remarks | string | No | Notes |
| notify | boolean | No | Send notification to students |
| students | string | Yes | Comma-separated student user IDs |

### Delete Class

<mark style="color:blue;">`GET`</mark> `/manager/trainings/onsite/delete_class/{classId}/true.json`

Delete a scheduled class session.

### Store Attendance

<mark style="color:green;">`POST`</mark> `/trainings/onsite/store_attendance.json`

Record attendance for a class session.

### Sign Attendance

<mark style="color:green;">`POST`</mark> `/trainings/onsite/sign_class.json`

Digitally sign class attendance (teacher confirmation).

| Field | Type | Required | Description |
|-------|------|----------|-------------|
| classId | string | Yes | Class session ID |
| password | string | Yes | Teacher's password for verification |

### Unsign Class

<mark style="color:green;">`POST`</mark> `/trainings/onsite/unsign_class.json`

Remove digital signature from a class.

---

## Student Evaluation

### Get Evaluation

<mark style="color:blue;">`GET`</mark> `/trainings/onsite/get_student_evaluation/{classId}/{userId}.json`

Retrieve evaluation data for a student in a class.

### Save Evaluation

<mark style="color:green;">`POST`</mark> `/trainings/onsite/save_student_evaluation.json`

Save student evaluation for a class session.

| Field | Type | Required | Description |
|-------|------|----------|-------------|
| class_id | string | Yes | Class session ID |
| student_id | string | Yes | Student user ID |
| remarks | string | No | Evaluation remarks |
| measures | string | No | Evaluation measures |
| objectives | string | No | Learning objectives assessment |

---

## Online Exams

### Exam Info

<mark style="color:blue;">`GET`</mark> `/trainings/exams/index/{type}:{id}.json`

Retrieve exam information. Type can be `subject` or `lesson`.

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

Retrieve training completion certificate data.

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
