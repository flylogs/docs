# Custom Forms

> Role names and `user_group_id` values are listed in [User groups](users.md#user-groups).

Company-built forms, their revisions, and the filled copies ("responses"). Every endpoint:

* needs the company's plan to include forms (**Premium** or **Unlimited**) — otherwise `403` *"Custom forms are available on the Premium and Unlimited plans"*;
* is scoped to the caller's company — a record of another company answers `404`, the same as a missing one.

`/manager/custom_forms/*` endpoints require `user_group_id` **1, 100, 105 or 110**. The other endpoints decide per form and per response (see [Access rules](#access-rules)).

Business refusals answer `200` with `{"result": false, "code": "<CODE>"}`.

---

## Data shapes

### Schema (one revision)

```json
{
  "sections": [
    {
      "key": "s_cand01",
      "title": "Pre-entry requirements",
      "condition": null,
      "filler_groups": null,
      "fields": [
        {
          "key": "f_ppl001",
          "type": "yes_no",
          "label": "An applicant for a modular IR(A) course shall be the holder of a PPL(A)…",
          "help": "",
          "required": true,
          "evidence": true,
          "condition": null,
          "options": [],
          "unit": "",
          "hhmm": false
        }
      ]
    }
  ]
}
```

| Property | Notes |
| --- | --- |
| `key` | `^[a-z]_[a-z0-9_]{1,24}$`, unique across sections and fields |
| `type` | `text_block`, `checkbox`, `yes_no`, `choice`, `text`, `textarea`, `number`, `date`, `datetime`, `photo`, `pdf` |
| `condition` | `null` or `{"field": "<earlier field key>", "equals": <value>}`. The source must be an earlier `checkbox` (`true`/`false`), `yes_no` (`"YES"`/`"NO"`) or `choice` (option key) field |
| `filler_groups` | `null` (part of the main signature) or `user_group_id`s that sign this section separately |
| `options` | `choice` only: `[{"key": "o_dual01", "label": "Dual"}]` |
| `unit`, `hhmm` | `number` only |

### Answers

```json
{ "f_ppl001": { "value": "YES", "files": ["<upload id>"] } }
```

`value` by type: `checkbox` bool · `yes_no` `"YES"`/`"NO"` · `choice` option key · `text`/`textarea` string · `number` number · `date` `"YYYY-MM-DD"` · `datetime` unix seconds · `photo`/`pdf` `null` (the files are the answer). `files` holds upload ids filed with `model=FormResponse`, `foreign_key=<response id>` (see [Uploads](uploads.md)). Answers to hidden fields and unknown keys are dropped.

### Signing units

A form signs in units: `form` (every section without `filler_groups`) plus one unit per section with `filler_groups`. A response is `SUBMITTED` when every unit with at least one shown section is signed.

---

## Manager endpoints

### List forms

<mark style="color:blue;">`GET`</mark> `/manager/custom_forms/index.json`

```json
{ "forms": [ { "id": "…", "name": "Pre-entry IR(A)", "status": "PUBLISHED", "current_revision_number": 0,
               "triggers": [ { "type": "ENROLMENT", "mode": "MANDATORY" } ],
               "counts": { "REQUESTED": 2, "DRAFT": 1, "SUBMITTED": 14 } } ] }
```

### View a form

<mark style="color:blue;">`GET`</mark> `/manager/custom_forms/view/{id}.json`

Returns `form`, `groups` (`{"FILL": [], "VIEW": [], "OPEN": []}`), `triggers`, `draft` (unpublished edits or `null`), `current` (the published revision new responses use) and `revisions` (published history: number, labels, `published`, `published_by_name`, `content_hash`).

### Create or update a form

<mark style="color:green;">`POST`</mark> `/manager/custom_forms/save.json`

```json
{
  "CustomForm": { "id": "<omit to create>", "name": "Pre-entry IR(A)", "description": "",
                  "fill_mode": "GROUPS", "require_password": true, "retention_months": 60 },
  "groups": { "FILL": [135], "VIEW": [150], "OPEN": [] },
  "triggers": [ { "type": "ENROLMENT", "mode": "MANDATORY", "scope": { "training_ids": ["<course id>"] } } ]
}
```

`fill_mode`: `SUBJECT`, `GROUPS`, `SUBJECT_OR_GROUPS`. Groups and triggers are **replaced**. Only `ENROLMENT` triggers are accepted in this release; course ids outside the company are dropped; an empty `training_ids` means every course. Response: `{"result": true, "form_id": "…", "errors": null}`.

### Save the draft revision

<mark style="color:green;">`POST`</mark> `/manager/custom_forms/save_draft/{id}.json`

```json
{ "schema": { "sections": [] }, "label_issue": "01", "label_revision": "00", "label_effective": "2026-03-05" }
```

Validated before saving; on error nothing is saved and `errors` lists `{"path": "sections.0.fields.2.label", "code": "LABEL_REQUIRED"}`. Codes: `SECTION_TITLE_REQUIRED`, `BAD_KEY`, `DUPLICATE_KEY`, `BAD_TYPE`, `LABEL_REQUIRED`, `CHOICE_NEEDS_OPTIONS`, `CONDITION_SOURCE_MISSING`, `CONDITION_SOURCE_LATER`, `CONDITION_SOURCE_TYPE`, `CONDITION_VALUE_INVALID`, `UNKNOWN_GROUP`, `TOO_LARGE`, `BAD_DATE`.

### Publish

<mark style="color:green;">`POST`</mark> `/manager/custom_forms/publish/{id}.json`

The draft becomes the next numbered revision (first = 0) and the form's current revision. Responses already started keep their revision. Refusals: `NOTHING_TO_PUBLISH`, `INVALID` (+ `errors`, including `NO_SECTIONS`). Success: `{"result": true, "number": 1}`.

### Archive / restore

<mark style="color:green;">`POST`</mark> `/manager/custom_forms/archive/{id}.json` — `{"archived": true}`

An archived form cannot be started or requested and gates nothing.

### Delete

<mark style="color:green;">`POST`</mark> `/manager/custom_forms/delete/{id}.json`

Soft delete; refused with `HAS_RESPONSES` once anyone has a copy.

### One revision

<mark style="color:blue;">`GET`</mark> `/manager/custom_forms/revision/{revisionId}.json`

### Responses of a form

<mark style="color:blue;">`GET`</mark> `/manager/custom_forms/responses/{formId}.json?status=&q=&page=`

50 per page, newest change first. `q` searches the person's name. Each row: `id`, `status`, `origin`, `subject_user {id, name}`, `subject_label`, `answers`, `revision_id`, `created`, `submitted`, `due`, `missing [{key, label}]` (required answers still missing on that copy's own revision). Plus `paging {page, limit, count, pageCount}`.

### Send a form to people

<mark style="color:green;">`POST`</mark> `/manager/custom_forms/request/{formId}.json`

```json
{ "user_ids": [178, 306], "pilot_group_ids": ["<group id>"], "due": 1793800000, "note": "Please fill in before Friday" }
```

One `REQUESTED` copy per active user of the company (pilot groups expanded), each notified. Users who already have an open copy are returned in `skipped`. Refusal: `NOT_PUBLISHED`.

### Waive a mandatory form

<mark style="color:green;">`POST`</mark> `/manager/custom_forms/waive/{formId}.json`

```json
{ "subject_model": "Training", "subject_id": "<course id>", "subject_user_id": 178, "reason": "Holds CPL(A), confirmed by HT" }
```

Records a `WAIVED` copy, which satisfies the enrolment gate like a submitted one. Refusals: `REASON_REQUIRED`, `NOT_PUBLISHED`.

---

## Filling endpoints

### My forms

<mark style="color:blue;">`GET`</mark> `/custom_forms/mine.json`

`pending` (copies with a unit the caller still has to sign, due first), `available` (forms the caller may open at will), `submitted` (the caller's 50 latest finished copies).

### Start a response

<mark style="color:green;">`POST`</mark> `/custom_forms/start/{formId}.json`

```json
{}
```

…starts one about the caller (the form must be open to their group). For a course pre-entry form:

```json
{ "subject_model": "Training", "subject_id": "<course id>", "subject_user_id": 178, "trigger_id": "<ENROLMENT trigger id>" }
```

Returns the open copy for that form and subject if there is one, otherwise a new `DRAFT` on the current revision. Response: `{"result": true, …bundle}`.

### Read a response

<mark style="color:blue;">`GET`</mark> `/custom_forms/response/{id}.json`

The bundle:

| Key | Content |
| --- | --- |
| `response` | `id`, `status`, `origin`, subject, `subject_label`, `answers`, `due`, `created`, `submitted`, `submitted_by` |
| `form` | `id`, `name`, `description`, `require_password`, `retention_months` |
| `revision` | the revision the copy is pinned to, with its `schema` and labels |
| `units`, `unit_groups` | signing units and who signs each |
| `signatures` | per unit: `user_id`, `name`, `group`, `time` |
| `fillable_units` | units the caller may still write and sign |
| `files` | the copy's uploads with signed URLs |
| `can_skip`, `can_reopen`, `can_delete` | |
| `history` | managers only: `SIGN`, `SUBMIT`, `REOPEN`, `WAIVE`, `SKIP`, `REQUEST` with user, time and reason |

### Save answers

<mark style="color:green;">`POST`</mark> `/custom_forms/save/{id}.json` — `{"answers": {…}}`

Only the fields of the caller's unsigned units are written; a field of those units missing from `answers` is cleared. Refusals: `LOCKED`, `NOT_YOURS`, `SIGNED_UNIT_CHANGED`.

### Sign a unit

<mark style="color:green;">`POST`</mark> `/custom_forms/sign/{id}.json`

```json
{ "unit": "form", "answers": { … }, "password": "<only when the form requires it>" }
```

Saves, then signs: the unit must be the caller's, unsigned, shown, and complete. Refusals: `LOCKED`, `NOT_YOURS`, `SIGNED_UNIT_CHANGED`, `UNIT_NOT_SHOWN`, `MISSING` (+ `missing` keys; what was typed is kept). A wrong password answers `400`. When the last unit is signed the copy becomes `SUBMITTED` (`"submitted": true`) and whoever requested it is notified.

### Skip

<mark style="color:green;">`POST`</mark> `/custom_forms/skip/{id}.json`

Only a copy started from a `SKIPPABLE` trigger. Refusal: `NOT_SKIPPABLE`.

### Reopen

<mark style="color:green;">`POST`</mark> `/custom_forms/reopen/{id}.json` — `{"reason": "…"}`

`user_group_id ≤ 110`, `SUBMITTED` copies only. Voids every signature, keeps the previous answers in the history, returns the copy to `DRAFT` and notifies its signers and the person concerned. Refusal: `REASON_REQUIRED`.

### Delete a draft

<mark style="color:green;">`POST`</mark> `/custom_forms/delete_response/{id}.json`

Deletes a `DRAFT` copy with its signatures, history and files. Allowed for the user who created it while no unit is signed, and for `user_group_id ≤ 110` at any time. Every other status, and anyone else, gets `{"result": false, "code": "NOT_DELETABLE"}` (or `404` when the caller cannot see the copy). The bundle's `can_delete` says whether the caller may.

### Forms of a course for one person

<mark style="color:blue;">`GET`</mark> `/custom_forms/for_subject.json?subject_model=Training&subject_id=<course id>&user_id=<user id>`

`offered`: the course's pre-entry forms still to fill (or skip) for that person that the caller may start — `id`, `name`, `mode`, `trigger_id`, open `response`. `responses`: every copy about that person and course the caller may see.

---

## Flight forms

Trigger types `PREFLIGHT`, `POSTFLIGHT`, `BOOKING` (scope `flight_type_ids`, `aircraft_ids`), `FIRST_FLIGHT_OF_DAY` (`aircraft_ids`) and `SOLO` (`training_ids`; applies when a training mission on the flight has `require_authorization > 0`). Stages: `PRE` = preflight, first flight of the day, solo; `POST` = post-flight; `BOOK` = booking creation.

A scope id that does not belong to the company (flight type, aircraft, course) makes `manager_save` answer `{"result": false, "errors": {"triggers": [{"path": "triggers.0.scope.aircraft_ids", "code": "SCOPE_NOT_FOUND"}]}}`; nothing is saved. `CustomForm.fill_seat`: `PIC` (default), `SIC`, `SUPERVISOR`, `ANY_CREW`.

### Forms of a flight

<mark style="color:blue;">`GET`</mark> `/custom_forms/flight_forms.json?stage=PRE|POST|BOOK&schedule_id=` · `&flight_id=` · `&token=<uuid>&aircraft_id=&flight_type_id=&date=YYYY-MM-DD&mission_ids[]=`

`offered` (each with `type`, `mode`, `trigger_id`, open `response`) and `responses` (this stage's copies) for a booking, a flight, or a flight not saved yet (a client-generated uuid `token`). Staff above `user_group_id` 145 only for flights they crew. `stage=BOOK` needs a `token` (the booking dialog's).

### Starting a flight form

`POST /custom_forms/start/{formId}.json` with `subject_model` `Schedule` | `Flight` | `Pending`, `subject_id` (booking id, flight id or token) and the `trigger_id` from `flight_forms`; for `Pending` also `aircraft_id`, `flight_type_id`, `date`, `mission_ids`. Allowed for the seat holder (any crew for `ANY_CREW`), the form's `FILL` groups and managers. Each stage keeps its own copy.

### Offline

<mark style="color:blue;">`GET`</mark> `/custom_forms/flight_definitions.json`

Every `PUBLISHED` form of the company with a `PREFLIGHT`, `FIRST_FLIGHT_OF_DAY`, `SOLO` or `POSTFLIGHT` trigger, for clients that fill flight forms without signal (Premium and Unlimited plans; readable by managers and by pilots, students and instructors so it can be cached on their devices — it carries form definitions only, never answers):

```json
{ "definitions": [ {
  "form": { "id": "…", "name": "…", "description": "…", "fill_mode": "SUBJECT", "fill_seat": "PIC", "require_password": false },
  "revision": { "id": "…", "schema": { … }, … },
  "groups": { "OPEN": [], "FILL": [], "VIEW": [] },
  "triggers": [ { "id": "…", "type": "POSTFLIGHT", "mode": "MANDATORY", "scope": { "aircraft_ids": ["12"] } } ]
} ] }
```

A copy filled offline is replayed after its flight is created:

* `POST /custom_forms/start/{formId}.json` with `subject_model: "Flight"` and an optional `revision_id` — the revision it was filled on. It must be a `PUBLISHED` revision of the same form, so a copy filled before the form was republished is kept on its own revision.
* `POST /custom_forms/sign/{id}.json` with an optional `offline_signed_at` (unix seconds). Values up to 5 minutes in the future and no older than 30 days are written into the copy's history ("signed offline at … UTC"); others are ignored. The signature itself is dated when it reaches the server. A form with `require_password` still needs the password.

### Where they are enforced

| Endpoint | Stage | Subject | Refusal |
| --- | --- | --- | --- |
| `POST /schedules/flight.json` (dispatch a booking) | PRE | the booking | `{"result": false, "code": "FORM_REQUIRED", "message", "forms"}` |
| `POST /flights/dispatch/{id}.json` | PRE | the flight | same |
| `POST /flights/create.json` — new flight, no `client_id` | PRE | `data[form_token]` | same |
| `POST /flights/confirm/{id}.json` | POST | the flight | `{"result": {"code": "FORM_REQUIRED", "message", "forms", …}}` |
| `POST /schedules/edit.json` — new booking made by the caller for themselves | BOOK | `data[form_token]` | `{"result": false, "code": "FORM_REQUIRED", "message", "forms"}` |

A create carrying `client_id` (offline replay) is never refused. A booking counts as made for oneself when `self_schedule` is `1` or the caller is its `pic_id`, `sic_id` or `supervisor_id`; edits and bookings made for others are never asked. Every row of one booking dialog (repeat dates, legs) sends the same `form_token`: the first saved booking takes the copies, and the next rows are covered by them. On dispatch the booking's copies move to the new flight; on create the token's copies (the caller's) move to the new flight. `manager_waive` accepts `subject_model` `Schedule` | `Flight` with the `trigger_id` it answers.

## Course enrolment

When a course has a **MANDATORY** `ENROLMENT` form:

* `POST /manager/trainings/students/enroll.json` enrols only the students whose form is `SUBMITTED` or `WAIVED`; the others are returned in `blocked: [{"user_id": 178, "forms": [{"id": "…", "name": "…"}]}]`.
* `POST /manager/trainings/enrollment_requests/decide/{id}/APPROVE.json` answers `{"result": false, "reason": "FORM_REQUIRED", "forms": […]}` until it is.
* Applications to the course are always held as `PENDING` for a manager, even when the course would otherwise enrol automatically.

---

## Access rules

| Who | May |
| --- | --- |
| Managers (`user_group_id ≤ 110`) | see every copy; fill the `form` unit on anyone's behalf; reopen; waive; delete any `DRAFT` |
| The creator of a copy | delete it while it is a `DRAFT` with no signed unit |
| The person the copy is about | see it; fill the `form` unit when `fill_mode` is `SUBJECT` or `SUBJECT_OR_GROUPS` |
| `FILL` groups | see copies of the form; start one about anyone; fill the `form` unit when `fill_mode` is `GROUPS` or `SUBJECT_OR_GROUPS` |
| A section's `filler_groups` | see the copy; fill and sign **only** that section (managers cannot sign it for them) |
| `VIEW` groups, signers, the creator | see it |
| `OPEN` groups | start a copy about themselves at any time |

Files with `model=FormResponse` follow the same rules on every uploads endpoint: readable by whoever may see the copy, added or removed only while the caller can still fill an unsigned unit, and never moved to another record.
