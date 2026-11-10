# Safety Assurance

> Role names and `user_group_id` values are listed in [User groups](users.md#user-groups).

The Safety Assurance endpoints back the SMS **Safety Assurance** dashboard, the **hazard log**, **safety actions** and **company-defined safety indicators**. They support the ICAO Annex 19 / Doc 9859 safety performance and risk management processes. For safety reports themselves see [Safety Reports](safety-reports.md). Audit programme, findings and management review: [Audits](audits.md). End-user description: [Safety Assurance dashboard](../sms/safety-assurance.md), [Hazard log](../sms/hazard-log.md), [Safety actions](../sms/safety-actions.md).

Every endpoint requires a **premium** or **unlimited** company plan. On any other plan the call fails with `400` and the message `Not a premium account`.

---

## Access Control

| Who | Dashboard, items | Hazards | Indicators | Actions |
|-----|------------------|---------|------------|---------|
| Manager: `user_group_id` ≤ 110 (Compliance & Safety Manager and above) | read, accept risks | read, create, edit, review, link, unlink | read, create, edit, delete | read all, create, edit, verify, cancel, reopen |
| Auditor: `user_group_id` = 250 | **read-only** | **read-only** | **read-only** | **read-only** |
| Assigned reviewer or non-anonymous **author** of a report, any group | no | on **that report only**: create a hazard from it, link (not unlink); hazard search (`q`) returns `id`, `idn`, `title` only | no | on that report only: list its actions and propose one (created `open`) |
| Action owner, any group | no | no | no | own actions only: list, `mine`, mark done |
| Everyone else | `403` | `403` | `403` | own actions only |

* The rules are enforced in the controllers, object by object (company scope plus the group rules above), not only by the ACL. Every write endpoint rejects auditors with `403` (`Auditors have read-only access.`) before anything else runs.
* The author of an **anonymous** report (no stored author) never gets author rights.
* Nothing returned by these endpoints identifies the reporter of a report. Action owners see only the title of the source.
* A wrong role is `403`, a missing or foreign-company record is `404`, a bad value is `400` with a `message`.
* The owner of an action or a hazard must be an active, non-deleted user of the company and cannot be an auditor (`400`).

### Identifiers

* Reports, hazards and actions use UUID `id`s. Indicators use integer ids.
* Risk values use the safety report slugs. Probability: `remote` (1), `improbable` (2), `possible` (3), `probable` (4), `likely` (5). Severity: `negligible` (E), `marginal` (D), `critical` (C), `hazardous` (B), `catastrophic` (A). See [Risk Probability](safety-reports.md#risk-probability) and [Risk Severity](safety-reports.md#risk-severity).
* A risk **band** is `high`, `medium`, `low` or `unassessed`. A *frequent* probability is `probable` or `likely`.
* The **current risk** of a report or hazard is its residual (mitigated) risk when recorded, otherwise its initial risk.

### Counting rules

Follow-up crew statements (reports with a `parent_id`) and drafts are never counted.

* **Risk measures** (`untracked`, `unmitigated`, `heat_map`, `emerging.new_high`): a report linked to a live hazard is counted through the hazard, not on its own.
* **Processing measures** (`reports_overdue`, `handling`, `reviewers`, `emerging.rising_categories` and their drill-downs): every report counts, linked to a hazard or not; linking does not close a report.
* Custom indicators count reports regardless.

### Year filter

| Measures | Items counted for `year=Y` |
|----------|----------------------------|
| **State / backlog**: `indicators`, `trend`, `heat_map`, `handling.age_buckets`, `handling.unassigned`, `handling.overdue`, `reviewers[].open`, `reviewers[].overdue`, and the [Items](#items) keys `untracked`, `unmitigated`, `actions_overdue`, `reports_overdue`, `cell`, `age`, `unassigned`, `reviewer` with `metric=open`/`overdue` | unresolved items dated **in or before** `Y` |
| **Flow**: `handling.by_status`, `handling.median_days_to_assess`, `handling.median_days_to_close`, `reviewers[].assigned`, `reviewers[].closed`, `reviewers[].median_days_to_close`, `emerging`, `custom`, and the Items keys `status`, `assessed`, `closed`, `category`, `custom`, `reviewer` with `metric=assigned`/`closed` | items dated **in** `Y` |

Item dates: a report's event date (`datetime`, stored wall time), a hazard's creation date (company timezone), an action's due date. An item without a date is never counted under a year. For example, an action due `2025-12-15` that is still `open` is in `actions_overdue` for `year=2026`.

---

## Dashboard

<mark style="color:blue;">`GET`</mark> `/safety_assurance/dashboard.json`

Returns everything shown on the Assurance tab for the selected filters. Access: managers and auditors.

#### Query Parameters

| Parameter | Type | Default | Description |
|-----------|------|---------|-------------|
| `year` | integer | current year | 2000–2100. Anything malformed means the current year. |
| `department` | integer | all | `safety_report_department_id`. |
| `type` | string | all | `OCCURRENCE` or `INFORMATION`. |

#### Response

```json
{
  "indicators": {
    "untracked":       { "count": 2, "status": "amber", "bands": { "high": 0, "medium": 1, "low": 0, "unassessed": 1 } },
    "unmitigated":     { "count": 3, "status": "red",   "bands": { "high": 1, "medium": 2, "low": 0, "unassessed": 0 } },
    "actions_overdue": { "count": 1, "status": "amber", "bands": { "high": 0, "medium": 1, "low": 0, "unassessed": 0 } },
    "reports_overdue": { "count": 0, "status": "green", "bands": { "high": 0, "medium": 0, "low": 0, "unassessed": 0 } }
  },
  "trend": {
    "untracked": { "current": [null, null, 1, 2, null, null, null, null, null, null, null, null], "previous": [null, null, null, null, null, null, null, null, null, null, null, null] }
  },
  "custom": [
    {
      "id": 7, "name": "Occurrences per 1,000 flight hours", "description": null,
      "denominator": "flight_hours", "per": 1000, "period": "month", "target": 5.0, "alert_level": 10.0,
      "series":   [{ "period": "2026-01", "numerator": 3, "exposure": 210.5, "value": 14.25, "status": "red" }],
      "previous": [{ "period": "2025-01", "numerator": 0, "exposure": 0.0, "value": null, "status": "no_exposure" }]
    }
  ],
  "heat_map": {
    "initial": { "3|2": 1 },
    "current": { "3|2": 1, "4|4": 2 }
  },
  "emerging": {
    "new_hazards": [ { "kind": "hazard", "id": "…", "idn": "HZ-2026-001", "title": "…", "department": "Flight Operations", "type": "OCCURRENCE", "status": "open", "band": "high", "age_days": 12, "link": "/safety_reports/hazards/view/…" } ],
    "rising_categories": [ { "category_id": 3, "name": "Operational", "current": 6, "previous": 2, "delta": 4 } ],
    "new_high": []
  },
  "handling": {
    "by_status": { "open": 4, "reviewed": 1, "closed": 7 },
    "age_buckets": { "0_7": 1, "8_30": 2, "31_90": 1, "90_plus": 0 },
    "unassigned": 1,
    "overdue": 2,
    "median_days_to_assess": 3,
    "median_days_to_close": 18
  },
  "reviewers": [
    { "reviewer_id": "123", "name": "Jane Doe", "assigned": 5, "closed": 3, "open": 2, "overdue": 1, "median_days_to_close": 12 }
  ],
  "settings": { "assessment_days": 14, "closure_days": 30 },
  "audits": { "has_data": true, "…": "see Audits" }
}
```

* **`indicators`**: the four built-in indicators, all with a target of zero. They are live counts, today, of unresolved items dated in or before the selected year (see [Year filter](#year-filter)), so each count can be listed with [Items](#items). `status` is `green` (count 0), `amber`, or `red` (any counted item is in the high band or has probability `probable`/`likely`, or is overdue by more than twice its deadline for report tiles, or more than 30 days late for hazard reviews and safety actions; an action is also red when its source's band is high).
  * `untracked`: reports with status `open` or `reviewed` and no initial risk after `assessment_days` (`closed` and `published` reports never count), plus hazards whose `next_review_date` has passed and are not closed.
  * `unmitigated`: items with current risk in the `high` band, plus items in the `medium` band without a recorded risk acceptance. Closed hazards are excluded.
  * `actions_overdue`: actions with status `open` past `due_date`.
  * `reports_overdue`: reports with status `open` or `reviewed` older than `closure_days`, including reports linked to a hazard.
* **`trend`**: monthly history of each built-in indicator, 12 values for the selected year (`current`) and the previous one (`previous`). A month without a stored snapshot is `null` ("no data", never zero). History begins when the feature is deployed; a month's value is its last-day value. Each point follows the tile's year rule: the `current` series counts items dated in or before the selected year, `previous` those dated in or before the year before, so the latest point matches the tile. Trend points cannot be drilled into.
* **`custom`**: active company-defined indicators (see [Indicators](#indicators)). `series` has one entry per period of the selected year, `previous` the same for the year before. `status` is `green` (value ≤ target), `amber` (≤ `alert_level`), `red`, `no_exposure` (denominator not `none` and no exposure in the period) or `future` (the period starts after the current period in the company timezone; `value` and `exposure` are `null`, `numerator` is `0`). A `future` period cannot be drilled into meaningfully. `exposure` is in hours for `flight_hours`. The `department` and `type` filters apply to the numerator only.
* **`heat_map`**: the live risk picture per `"<probability 1-5>|<severity 1-5>"` cell, for initial and current risk, over items dated in or before the selected year: reports (not linked to a hazard) with status `open` or `reviewed`, `closed` / `published` reports that are still unmitigated (current risk `high`, or `medium` without a risk acceptance), and hazards that are not closed. Resolved reports (low or accepted medium current risk) are left out. `items.json?key=cell` lists exactly the records counted in a cell. Empty cells are absent; with no data the value is an empty object.
* **`emerging`**: hazards created in the year, report categories whose count exceeds the previous year's same period, and new high or frequent items. Items have the [item shape](#item-shape).
* **`handling`**: report status counts, age buckets of open reports in days, open reports without a reviewer, overdue reports, and median days from submission to first risk assessment and to closure (`null` when there is nothing to measure). Linked reports are included; see [Year filter](#year-filter) for which numbers are in-year and which are in-or-before. Medians for reports older than the feature are approximate.
* **`reviewers`**: one row per current reviewer. `assigned`, `closed` and `median_days_to_close` cover reports whose current assignment (`reviewer_assigned_at`, or the report's creation date when null) falls in the selected year; `open` and `overdue` cover reports assigned in or before it that are still open, so a reviewer with only an older backlog appears with `assigned: 0`. `name` is `null` when the reviewer is no longer in the company.
* **`audits`**: the audits and findings block of the Assurance tab (open findings by classification, overdue findings, awaiting authority and verification, programme progress, areas overdue, last management review). Described in [Audits](audits.md#dashboard-and-drill-down).
* **`settings`**: the two company deadlines, `safety_assessment_days` (default 14) and `safety_closure_days` (default 30), set in the company settings.

---

## Items

<mark style="color:blue;">`GET`</mark> `/safety_assurance/items.json`

The drill-down: the records behind a tile, heat-map cell, handling number, reviewer figure, rising category or custom indicator period. Access: managers and auditors. Accepts the same `year`, `department` and `type` filters as the dashboard.

#### Query Parameters

| Parameter | Required with | Description |
|-----------|---------------|-------------|
| `key` | always | `untracked`, `unmitigated`, `actions_overdue`, `reports_overdue`, `cell`, `status`, `age`, `unassigned`, `assessed`, `closed`, `reviewer`, `category`, `custom`, or one of the audit keys `findings_overdue`, `awaiting_authority`, `awaiting_verification`, `areas_overdue` (see [Audits](audits.md#dashboard-and-drill-down)). Anything else is `400`. |
| `cell` | `key=cell` | `"<probability>|<severity>"`, each 1–5, for example `4|4`. |
| `mode` | `key=cell` | `initial` or `current` (default `current`). |
| `status` | `key=status` | A report status, for example `open`. |
| `bucket` | `key=age` | `0_7`, `8_30`, `31_90` or `90_plus`. |
| `reviewer_id` and `metric` | `key=reviewer` | Reviewer id and `assigned`, `closed`, `open` or `overdue`. |
| `category_id` | `key=category` | Safety report category id. |
| `indicator_id` and `period` | `key=custom` | Indicator id and a period label from its `series`: `YYYY-MM`, `YYYY-Qn` or `YYYY`. An unknown `indicator_id` is `404` (`Unknown indicator.`). |
| `band` | no | Optional filter on the result: `high`, `medium`, `low` or `unassessed`. |

`key=unassigned`, `assessed` and `closed` take no extra parameter.

#### Response

```json
{
  "items": [
    {
      "kind": "report",
      "id": "5d7c…",
      "idn": "2026/00042",
      "title": "Bird strike on approach",
      "department": "Flight Operations",
      "type": "OCCURRENCE",
      "status": "open",
      "band": "high",
      "age_days": 41,
      "link": "/safety_reports/view/5d7c…"
    }
  ]
}
```

<a name="item-shape"></a>`kind` is `report`, `hazard` or `action` (`finding` or `area` for the [audit keys](audits.md#dashboard-and-drill-down)). `band` is `unassessed` when no risk is recorded. `age_days` is the age since creation (`null` when unknown). Items are sorted oldest first. The reporter of a report is never included.

An **action** item has `idn: null`; its `title` is prefixed with the number of its source (`"HZ-2026-004 · Trim the grass"`), its `band` is the source's current band, and its `link` is the source page: `/safety_reports/view/{source_id}` for a report, `/safety_reports/hazards/view/{source_id}` for a hazard, `/audits/findings/view/{source_id}` for an audit finding, `/audits/reviews/view/{source_id}` for a management review.

---

## Accept Risk

<mark style="color:green;">`POST`</mark> `/safety_assurance/accept_risk.json`

Records an ICAO Doc 9859 **risk acceptance** (tolerable risk) on reports and hazards. Access: managers only (`user_group_id` ≤ 110); auditors get `403`.

Only items whose **current risk is in the medium band** can be accepted. High-band risk can never be accepted, and there is no automatic acceptance of existing data. Changing the risk of a report or hazard later clears its acceptance.

#### Request Body

```json
{
  "items": [
    { "kind": "report", "id": "5d7c…" },
    { "kind": "hazard", "id": "a91f…" }
  ],
  "note": "Controls in place: briefing and checklist change. Reviewed with the accountable manager."
}
```

| Field | Type | Description |
|-------|------|-------------|
| `items` | array | 1 to 500 entries of `kind` (`report` or `hazard`) and `id`. Duplicates are ignored. |
| `note` | string | **Required**, up to 5,000 characters. Stored on every accepted item with who accepted it and when. |

#### Response

```json
{
  "result": true,
  "accepted": 1,
  "refused": [
    { "kind": "hazard", "id": "a91f…", "reason": "high" }
  ]
}
```

`refused[].reason` is one of: `high` (high band), `unassessed` (no risk recorded), `not_medium`, `not_found` (missing, other company, draft, follow-up statement, or a report linked to a live hazard, which is accepted through the hazard), `not_saved`. A request with no note or no items is `400`.

---

## Hazard Log

Hazards have `status` `open`, `mitigated`, `monitoring` or `closed`, a classification `type` (`OCCURRENCE` or `INFORMATION`, optional), initial risk (`risk_probability`, `risk_severity`), optional residual risk (`residual_risk_probability`, `residual_risk_severity`), `review_interval_months` (`1`, `3`, `6` or `12`, default `12`) and `next_review_date`. The `idn` (`HZ-YYYY-NNN`), `source` (`manual` or `report`), company, creator, timestamps and risk acceptance are set by the server and ignored when sent.

### Hazard object

```json
{
  "id": "a91f…",
  "idn": "HZ-2026-001",
  "title": "Wildlife near runway 32L in autumn",
  "safety_report_department_id": 2,
  "type": "OCCURRENCE",
  "owner_user_id": 123,
  "status": "open",
  "risk_probability": "probable",
  "risk_severity": "critical",
  "residual_risk_probability": null,
  "residual_risk_severity": null,
  "review_interval_months": 12,
  "next_review_date": "2027-11-09",
  "source": "report",
  "risk_accepted_at": null,
  "created": 1789000000,
  "modified": 1789000000
}
```

### List Hazards

<mark style="color:blue;">`GET`</mark> `/safety_hazards/index.json`

Access: managers and auditors. Returns `{ "hazards": [ … ] }`, newest first. Each hazard also has `linked_reports` (count of live reports), `open_actions` and `owner_name`.

| Parameter | Description |
|-----------|-------------|
| `year` | Hazards created **or reviewed** in that year (company timezone). |
| `department` | Department id. |
| `type` | `OCCURRENCE` or `INFORMATION`. |
| `status` | `open`, `mitigated`, `monitoring` or `closed`. |
| `band` | Current-risk band: `high`, `medium`, `low`, `unassessed`. |
| `q` | Text search on title and `idn`. |

**Hazard picker.** Any user who can work on a report (a report's assigned reviewer or author) may call this endpoint with `q` of at least 2 characters. They receive only `{ "hazards": [ { "id", "idn", "title" } ] }`, up to 20, for hazards that are not closed.

### View Hazard

<mark style="color:blue;">`GET`</mark> `/safety_hazards/view/{id}.json`

Access: managers and auditors.

```json
{
  "hazard": { "…": "hazard object plus owner_name, description, risk_accepted_by, risk_accepted_by_name, risk_acceptance_note" },
  "reports": [ { "id": "5d7c…", "idn": "2026/00042", "name": "Bird strike on approach", "status": "closed" } ],
  "actions": [ { "id": "…", "title": "…", "status": "open", "due_date": "2026-12-01" } ],
  "reviews": [
    {
      "id": 4, "user_id": 123, "reviewer_name": "Jane Doe", "reviewed_at": 1789000000,
      "risk_probability": "probable", "risk_severity": "critical",
      "residual_risk_probability": "improbable", "residual_risk_severity": "critical",
      "status": "monitoring", "note": "Fencing installed."
    }
  ]
}
```

`findings` lists the [audit findings](audits.md#finding-links) linked to the hazard (`id`, `number`, `title`, `status`; empty when there are none). `reviews` is the append-only history, newest first. `actions` holds the raw action rows; use [Safety Actions](#safety-actions) for the full shape. `owner_name` and `risk_accepted_by_name` are looked up inside the company (`null` when the user is no longer in it).

### Create Hazard

<mark style="color:green;">`POST`</mark> `/safety_hazards/add.json`

Access: managers only. Creates a hazard with `source` `manual`.

| Field | Required | Description |
|-------|----------|-------------|
| `title` | **yes** | Up to 255 characters. |
| `description` | no | Free text. |
| `safety_report_department_id` | no | Valid department id. |
| `type` | no | `OCCURRENCE` or `INFORMATION`. |
| `owner_user_id` | no | Active, non-deleted user of the same company; not an auditor (`400` otherwise). |
| `status` | no | Default `open`. |
| `risk_probability`, `risk_severity` | no | Initial risk. |
| `residual_risk_probability`, `residual_risk_severity` | no | Residual risk. |
| `review_interval_months` | no | `1`, `3`, `6` or `12`. |

Response: `{ "result": true, "hazard": { … } }`.

### Create Hazard From a Report

<mark style="color:green;">`POST`</mark> `/safety_hazards/add_from_report/{reportId}.json`

Creates a hazard with `source` `report` and links it to the report in one transaction. Access: managers, and the report's assigned reviewer or non-anonymous author (any group). The report must be submitted (not a draft) and not a follow-up statement.

The hazard is prefilled from the report (title = report name, description = events, department, classification, initial risk). The body may override `title`, `description`, `safety_report_department_id`, `type`, `risk_probability` and `risk_severity`. Response: `{ "result": true, "hazard": { … } }`, or `{ "result": false, "message": … }` when nothing could be saved.

### Link / Unlink a Report

<mark style="color:green;">`POST`</mark> `/safety_hazards/link/{hazardId}/{reportId}.json`

<mark style="color:green;">`POST`</mark> `/safety_hazards/unlink/{hazardId}/{reportId}.json`

Attach or detach a report. Both are idempotent and return `{ "result": true }`. A **closed** hazard cannot be linked to new reports (`400`). A report can be linked to several hazards.

* `link`: managers, and the report's assigned reviewer or non-anonymous author.
* `unlink`: **managers only** (`403` `Only safety managers can unlink a report from a hazard.` for anyone else, including the reviewer and the author).

### Edit Hazard

<mark style="color:green;">`POST`</mark> `/safety_hazards/edit/{id}.json`

Access: managers only. Accepts the same fields as create; only posted fields change. Changing any of the four risk fields clears a recorded risk acceptance. Changing `review_interval_months` re-schedules `next_review_date` from the last review (or the creation date). Response: `{ "result": true, "hazard": { … } }`.

### Record a Review

<mark style="color:green;">`POST`</mark> `/safety_hazards/review/{id}.json`

Appends a review to the history. Access: managers only.

| Field | Description |
|-------|-------------|
| `risk_probability`, `risk_severity`, `residual_risk_probability`, `residual_risk_severity` | The risk as it stands now. |
| `status` | Hazard status after the review. |
| `note` | Optional, up to 20,000 bytes. |

The hazard's current values are updated, a snapshot is stored, and `next_review_date` becomes the review date plus `review_interval_months`. A changed risk clears a recorded risk acceptance. Response: `{ "result": true, "hazard": { … } }`.

---

## Safety Actions

An action belongs to a report (`source_model` `SafetyReport`), a hazard (`SafetyHazard`), an audit finding (`AuditFinding`, its corrective actions) or a management review (`ManagementReview`, the actions resulting from the accountable manager's decisions) and has `status` `open`, `done`, `verified` or `cancelled`.

### Action object

```json
{
  "id": "c3b2…",
  "source_model": "SafetyHazard",
  "source_id": "a91f…",
  "source_title": "Wildlife near runway 32L in autumn",
  "title": "Install bird scaring device",
  "description": null,
  "owner_user_id": 123,
  "owner_name": "Jane Doe",
  "due_date": "2026-12-01",
  "status": "verified",
  "done_at": 1789000000,
  "done_note": "Installed on 12 Nov.",
  "verified_at": 1789100000,
  "verified_by": 5,
  "effective": 1,
  "verification_note": "No strikes in 30 days.",
  "created": 1788000000,
  "modified": 1789100000
}
```

### List Actions

<mark style="color:blue;">`GET`</mark> `/safety_actions/index.json`

Returns `{ "actions": [ … ] }`, newest first. Managers and auditors see every action of the company. Everyone else sees only the actions they own, except that the assigned reviewer or non-anonymous author of a report sees **every action on that report** when `source_model=SafetyReport&source_id={reportId}` is given.

| Parameter | Description |
|-----------|-------------|
| `source_model` | `SafetyReport`, `SafetyHazard`, `AuditFinding` or `ManagementReview`. |
| `source_id` | UUID of the source. |

### My Actions

<mark style="color:blue;">`GET`</mark> `/safety_actions/mine.json`

Any group. The caller's own actions, open ones first then by due date. Each entry has `id`, `title`, `description`, `status`, `due_date`, `source_model`, `source_id`, `source_title`, `done_note`, `effective` and `verification_note`. Never the reporter.

### Create Action

<mark style="color:green;">`POST`</mark> `/safety_actions/add.json`

| Field | Required | Description |
|-------|----------|-------------|
| `source_model` | **yes** | `SafetyReport`, `SafetyHazard`, `AuditFinding` or `ManagementReview`. |
| `source_id` | **yes** | UUID of the report, hazard, finding or management review. |
| `title` | **yes** | Up to 255 characters. |
| `description` | no | Free text. |
| `owner_user_id` | no | Active user of the same company; not an auditor. The owner is notified in-app and by email. |
| `due_date` | no | `YYYY-MM-DD`. |

Access: managers for every source type; for `SafetyReport` also the report's assigned reviewer or non-anonymous author (a *proposal*); for `AuditFinding` also the finding's owner; for `ManagementReview` also the accountable manager. See [Audits](audits.md#safety-actions-from-findings-and-reviews) for the audit sources. The status is always `open`; completion and verification fields are server-side. Response: `{ "result": true, "action": { … } }`.

### Edit Action

<mark style="color:green;">`POST`</mark> `/safety_actions/edit/{id}.json`

Managers only. Changes `title`, `description`, `owner_user_id` and `due_date` of an `open` or `done` action (a verified or cancelled action is `400`). A new owner is notified.

### Change Status

<mark style="color:green;">`POST`</mark> `/safety_actions/status/{id}.json`

```json
{ "status": "verified", "effective": 1, "note": "No strikes in 30 days." }
```

| Move | Who | Requirements |
|------|-----|--------------|
| `open` → `done` | the owner, or a manager | optional `note` (stored as the completion note) |
| `done` → `verified` | managers | `effective` (`1`/`0` or `true`/`false`) **and** a `note` |
| `open` or `done` → `cancelled` | managers | `note` |
| `done` → `open` (reopen) | managers | none |

Any other move is `400`; a move another role could make is `403`. A concurrent change returns `400` ("changed by someone else"). A **not effective** verification keeps the action closed and flags it (`effective: 0`); create a follow-up action. Auditors cannot own or change actions. Response: `{ "result": true, "action": { … } }`.

Owners receive a reminder email 3 days before the due date and on the due date.

---

## Indicators

Company-defined safety performance indicators. Lower is always better.

### Indicator object

```json
{
  "id": 7,
  "name": "Occurrences per 1,000 flight hours",
  "description": null,
  "filters": { "type": ["OCCURRENCE"], "departments": [2] },
  "denominator": "flight_hours",
  "per": 1000,
  "period": "month",
  "target": 5.0,
  "alert_level": 10.0,
  "active": true,
  "sort": 0,
  "created": 1789000000,
  "modified": 1789000000
}
```

| Field | Description |
|-------|-------------|
| `filters` | Object with any of `categories`, `type`, `severity`, `departments`, `flight_phases`, each an array. Empty or `{}` means all reports. |
| `denominator` | `none` (count of reports), `flight_hours`, `flights` or `landings` (confirmed flights of the company). |
| `per` | Positive whole number the rate is expressed per (default 1000; ignored when `none`). |
| `period` | `month` (default), `quarter` or `year`. |
| `target`, `alert_level` | Both required; `alert_level` must not be below `target`. |
| `active` | Whether it is shown on the dashboard. |
| `sort` | Display order. |

### List Indicators

<mark style="color:blue;">`GET`</mark> `/safety_indicators/index.json`

Managers and auditors. Returns `{ "indicators": [ … ] }` including inactive ones.

### Create / Edit / Delete

<mark style="color:green;">`POST`</mark> `/safety_indicators/add.json`

<mark style="color:green;">`POST`</mark> `/safety_indicators/edit/{id}.json`

<mark style="color:green;">`POST`</mark> `/safety_indicators/delete/{id}.json`

Managers only; auditors get `403`. `name` is required (up to 255 characters). On edit only posted fields change and the result must still be a valid definition. At most 100 indicators per company. Delete is a soft delete and returns `{ "result": true }`; create and edit return `{ "result": true, "indicator": { … } }`. The computed values are never stored: the dashboard calculates them from your reports and flights.
