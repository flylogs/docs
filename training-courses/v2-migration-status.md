# Trainings v2 — migration status

The trainings plugin is mid-migration to a unified-activities schema. The data layer (DDL, model classes, core progress logic) is complete. The legacy controllers still contain hundreds of references to the dropped CakePHP model aliases (`TrainingSubjectExam`, `TrainingSubjectAttendance`, `TrainingSubjectExamGrade`) — these need targeted rewrites before merging.

## What changed

### Schema (see `app/Config/Schema/trainings_v2_migration.sql`)

| Old | New |
|---|---|
| `training_subject_lessons` | `lessons` |
| `lesson_classes` | `sessions` |
| `lesson_class_students` | `session_students` (with `invited`, `attended`) |
| `training_subject_exams` | folded into `exams` with `type='ONSITE'` |
| `training_subject_attendances` | replaced by `activity_progress` |
| `training_subject_exam_grades` | folded into `activity_progress` |
| — | new `training_activities` (ordered curriculum) |
| — | new `activity_progress` (per-student per-activity) |

`exams.type` enum (`ONLINE`, `ONSITE`). `exams.attemps` typo renamed to `attempts`. `exams` gets `name`, `reference`, `description`, `caa_exam`. `sessions.training_activity_id` is the single binding (no more dual lesson/exam FKs).

### Models

- New: `Lesson`, `TrainingActivity`, `ActivityProgress`, `Session`, `SessionStudent`.
- Restructured: `Exam` (unified ONLINE/ONSITE; `Lesson` belongsTo replaces `TrainingSubjectLesson`; hasOne `TrainingActivity`).
- Deleted: `TrainingSubjectLesson`, `TrainingSubjectExam`, `TrainingSubjectAttendance`, `TrainingSubjectExamGrade`, `LessonClass`, `LessonClassStudent`.
- Updated associations: `TrainingSubject`, `Training`, `LessonSlide`, `LearningObjective`, `Location`, `UserTrainingMetric`, `UserTrainingObjective`, `TrainingQuestion`.

### Progress

`Training::getProgress` and the two `getProgressBatch` helpers (in `TrainingsController` and `StudentsController`) are rewritten against `training_activities` + `activity_progress`. Counted = mandatory non-gate activities. Lesson done = `value=1` AND every lesson-gate exam `value=1`.

`Training::getAttendance` headline `total/completed/finished` delegates to `getProgress`. `given/taken` come from `session_students.invited` vs `session_students.attended` for past sessions.

`Training::getNextEvent` walks `training_activities` in order, returns first non-done.

`Training::copy` builds new `training_activities` rows for the duplicated training (helper `_seedActivitiesForTraining`).

## What still needs doing in code

The mechanical class renames `TrainingSubjectLesson → Lesson`, `LessonClass → Session`, `LessonClassStudent → SessionStudent` are applied across all controllers. Remaining work, all centred on the dropped tables:

| File | Refs left | What's needed |
|---|---|---|
| `OnsiteController.php` | 88 | Rewrite class scheduling / attendance / sign / grade flows against `Session` + `SessionStudent` + `ActivityProgress`. The biggest piece. |
| `StudentsController.php` | 40 | `manager_view`, `manager_audit`, reports — replace `TrainingSubjectExam` containment with `Exam` (filter by `type='ONSITE'` where appropriate); replace `TrainingSubjectAttendance` reads with `ActivityProgress` joins. |
| `LessonsController.php` | 26 | Lesson scheduling, slide completion, attendance — write to `ActivityProgress.upsert()` instead of `TrainingSubjectAttendance`. |
| `ExamsController.php` | 20 | After an attempt finishes, call `ActivityProgress::recordExamAttempt()` (helper provided) so progress stays in sync. Remove direct `TrainingSubjectExam` reads. |
| `SubjectsController.php` | 14 | View / edit / save flows — replace `TrainingSubjectExam` save calls with `Exam` (`type='ONSITE'`); strip `TrainingSubjectAttendance` reads from view payload. |
| `TrainingsController.php` | 12 | `myClasses` widget, calendar feed, teaching report — replace `TrainingSubjectExam` joins; otherwise the file is already on `Session`/`Lesson`. |

## Helper for online-test sync

After `ExamAttempt::finish()` returns, call:

```php
$ActivityProgress = ClassRegistry::init('Trainings.ActivityProgress');
$ActivityProgress->recordExamAttempt($trainingsUserId, $userId, $examId);
```

This finds the activity row for that exam and aggregates `value=MAX(passed)`, `score=MAX(score)`, `attempts_count`, `last_attempt_id` from `exam_attempts`. Lesson-gate exams update too — the gate check in `getProgress` reads them.

## Activity ordering API (drag-drop)

`TrainingActivity::resequence(array $orderedIds)` — pass activity IDs in the desired order; `order` is rewritten as `1..N * 10` so future inserts can land between.

## Cutover

Single deploy:

1. Take DB backup.
2. Run `app/Config/Schema/trainings_v2_migration.sql`.
3. Deploy the v2 code.

No dual-write window. Legacy controllers that still reference dropped tables will fatal until rewritten. Plan the controller pass before flipping.
