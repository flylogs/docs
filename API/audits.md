# Audits

> Role names and `user_group_id` values are listed in [User groups](users.md#user-groups).

The audit endpoints back the SMS **audit programme**: audit areas and their risk-based frequency, internal and authority audits with their assessments, audit findings with corrective actions and authority decisions, links from findings to the hazard log, issued (versioned) documents and the management review. They **support** compliance monitoring; they do not make an operator compliant. End-user description: [Audit programme](../sms/audits.md), [Audit findings](../sms/audit-findings.md), [Management review](../sms/management-review.md).

Every endpoint requires a **premium** or **unlimited** company plan. On any other plan the call fails with `400` and the message `Not a premium account`.

> **Company configuration, not ICAO values.** Audit frequencies, finding classifications and finding deadlines are configured by each company (see [Settings](#settings)). The values Flylogs seeds or suggests are editable defaults, not regulatory values.

---

## Access Control

| Who | Settings, areas, audits, documents, reviews | Findings | Write |
|-----|---------------------------------------------|----------|-------|
| Manager: `user_group_id` ≤ 110 (Compliance & Safety Manager and above) | read | read all | everything, except recording the management review |
| **Accountable manager**: the user stored in the company settings (`accountable_manager_user_id`), any group except 250 | read | read all | records the management review ([Review](#record-the-review)); adds actions to a management review |
| Auditor: `user_group_id` = 250 | **read-only** | **read-only** | **never** |
| Finding owner, any group | no | own findings only: list (`mine`), view (audit header only), root cause, authority decision proposals, corrective actions on that finding, evidence uploads | limited to those; on a closed finding only evidence uploads (no root cause, decision proposals or new actions) |
| Everyone else | `403` | list: only their own findings (an empty list if they own none); view: `403` | `403` |

* The rules are enforced in the controllers, object by object (company scope plus the rules above), not only by the ACL. **Every write endpoint rejects auditors with `403` (`Auditors have read-only access.`) before anything else runs**, so a group 250 key can never write, independent of the ACL. This includes uploads under the audit tags.
* The accountable manager is a company setting and may be in any group except 250. A missing or invalid group fails closed.
* A finding owner never sees the audit's results, attached files, assessments or other findings, and sees no risk-link entries in a finding's history.
* A wrong role is `403`, a missing, soft-deleted or foreign-company record is `404`, a bad value is `400` with a `message`. A wrong HTTP method is `405`.
* The accountable manager, a finding owner and a lead auditor must belong to the company; owners and the accountable manager must be active users and cannot be auditors (`400`).

### Refused moves

Refusals that depend on the state of a record answer `400` with a machine-readable `error` next to the human `message`:

```json
{ "result": false, "message": "The finding cannot be closed yet.", "error": "close_blocked", "blocker": "needs_effective_action" }
```

The codes are listed with each endpoint.

### Conventions

* Bodies are JSON (or form data, optionally wrapped in `data[Audit]`, `data[AuditFinding]`… as elsewhere in the API). Only the fields listed for an endpoint are read; `company_id`, ids, numbers, statuses and audit fields such as `approved_by` are always set by the server.
* Dates are `YYYY-MM-DD` strings (a malformed date is `400`). Timestamps (`created`, `modified`, `issued_at`…) are Unix seconds. Free text is limited to 20,000 bytes and must be a string.
* Areas, classifications and assessments use integer ids. Audits, findings, decisions, documents and management reviews use UUIDs.
* Successful writes answer `{ "result": true, … }` with the saved record.

### Enumerations

| Name | Values |
|------|--------|
| Audit `kind` | `internal`, `authority` |
| Audit `status` | `planned`, `in_progress`, `completed`, `postponed`, `cancelled` |
| Area `criticality` | `low`, `medium`, `high` |
| Area `frequency_months` | `1`, `2`, `3`, `6`, `12`, `24` |
| Assessment answers | `yes`, `partial`, `no`, `na` |
| Assessment `conclusion` | `compliant_effective`, `compliant_ineffective`, `non_compliant`, `improvement_opportunity`, `not_applicable` |
| Classification `rank` | `critical`, `major`, `minor`, `observation` |
| Finding `status` | `open`, `cap_submitted`, `cap_accepted`, `in_progress`, `pending_verification`, `pending_closure`, `closed`, `closed_by_decision` |
| `root_cause_category` | `procedures`, `documentation`, `training`, `human_factors`, `supervision`, `resources`, `equipment_facilities`, `communication`, `contracted_services`, `organisational`, `other` |
| Decision `type` | `variation`, `alternative_means`, `cap_acceptance`, `other` |
| Decision `decision` | `pending`, `accepted`, `rejected` |
| Document `kind` | `programme`, `audit_report`, `cap_response`, `decision_proposal`, `management_report` |
| Management review `status` | `draft`, `issued`, `reviewed` |

---

## Settings

Company configuration of the audit tools: finding classifications, the accountable manager and the procedure documents.

### Get Settings

<mark style="color:blue;">`GET`</mark> `/audit_settings/index.json`

Access: managers, auditors and the accountable manager. A **manager's** first call seeds the default classifications when the company has none; a read by an auditor or the accountable manager never writes, so they get `"classifications": []` until a manager has opened the settings (shown as "not configured yet").

```json
{
  "classifications": [
    { "id": 1, "name": "Level 1", "rank": "critical", "is_non_compliance": 1, "default_cap_days": 0, "default_implementation_days": null, "active": 1, "sort": 0 },
    { "id": 2, "name": "Level 2", "rank": "major", "is_non_compliance": 1, "default_cap_days": null, "default_implementation_days": 90, "active": 1, "sort": 1 },
    { "id": 3, "name": "Observation", "rank": "observation", "is_non_compliance": 0, "default_cap_days": null, "default_implementation_days": null, "active": 1, "sort": 2 }
  ],
  "settings": {
    "accountable_manager_user_id": 12,
    "accountable_manager_name": "Jane Doe",
    "audit_procedure_document_id": "8f0c…",
    "audit_reporting_document_id": null,
    "audit_followup_document_id": null,
    "audit_programme_notes": null
  },
  "documents": [ { "id": "8f0c…", "name": "Audit procedure" } ]
}
```

`documents` is the company's document library, for the pickers. The three seeded classifications are editable company defaults.

### Save Settings

<mark style="color:green;">`POST`</mark> `/audit_settings/save.json`

Access: managers. Only the posted keys change.

| Field | Description |
|-------|-------------|
| `accountable_manager_user_id` | Active user of the company, not an auditor; empty clears it. |
| `audit_procedure_document_id`, `audit_reporting_document_id`, `audit_followup_document_id` | A live document of the company; empty clears it. |
| `audit_programme_notes` | Free text. |

Response: `{ "result": true }`.

### Create / Edit a Classification

<mark style="color:green;">`POST`</mark> `/audit_settings/classification_save.json` (create) · `/audit_settings/classification_save/{id}.json` (edit)

Access: managers.

| Field | Required | Description |
|-------|----------|-------------|
| `name` | on create | Up to 100 characters. |
| `rank` | no | One of the ranks. Default `minor`. Drives colours and indicators. |
| `is_non_compliance` | no | `1` (default) or `0`. Observations are `0`: they can be closed with a note and can be converted into findings. |
| `default_cap_days` | no | Whole days, counted from the raised date, for the default action plan due date. Empty: set per finding. `0` means due immediately. |
| `default_implementation_days` | no | Same, for the default target date. |
| `active` | no | `1` or `0`. An inactive classification cannot be given to a finding. |
| `sort` | no | Display order. |

Response: `{ "result": true, "classification": { … } }`.

### Delete a Classification

<mark style="color:green;">`POST`</mark> `/audit_settings/classification_delete/{id}.json` (also accepts `DELETE`)

Access: managers. A classification no finding uses is removed; one that findings reference is only deactivated. Response: `{ "result": true, "deactivated": false }`.

---

## Audit Areas

An area is a process you audit. Areas form a tree with **one level** of sub-areas.

### Area object

```json
{
  "id": 4,
  "parent_id": null,
  "name": "Operational control",
  "description": null,
  "requirements": "REQ-OPS-01",
  "safety_report_department_id": 2,
  "criticality": "high",
  "frequency_months": 3,
  "active": 1,
  "sort": 3,
  "coverage": {
    "last_audit_date": "2026-03-12",
    "last_conclusion": "compliant_effective",
    "consecutive_effective": 1,
    "open_nc_findings": 0,
    "repeat_findings": 0,
    "high_risk_hazards": 0,
    "next_due": "2026-06-12",
    "overdue": true,
    "suggested": { "months": 3, "reasons": ["base_high"] }
  },
  "children": []
}
```

`coverage` is derived, never stored:

* `last_audit_date` and `next_due` come from the last **completed internal** audit that covers the area (`next_due` = that date plus `frequency_months`). Authority audits never reset them. An area never audited has both `null` and `overdue: true`. `overdue` is `false` for inactive areas.
* `last_conclusion` is the conclusion of that audit (the worst one when it assessed the area more than once); `consecutive_effective` counts the latest run of `compliant_effective` audits (`not_applicable` neither extends nor breaks it).
* `open_nc_findings` counts non-compliance findings that are not closed; `repeat_findings` counts non-compliance findings with a repeat link raised in the last 24 months; `high_risk_hazards` counts open hazards in the mapped department whose current risk band is `high`.
* `suggested.months` is the **suggested frequency**, shown but never applied. It starts at 3 (high), 6 (medium) or 12 (low) months, moves one step more frequent on any risk signal (last conclusion `non_compliant` or `compliant_ineffective`, open non-compliance findings, repeat findings, high-risk hazards) and otherwise one step less frequent after two consecutive `compliant_effective` conclusions with no open non-compliance findings. `reasons` are the inputs used: `base_low`, `base_medium`, `base_high`, `last_non_compliant`, `last_compliant_ineffective`, `open_nc_findings`, `repeat_findings`, `high_risk_hazards`, `consecutive_effective`.

### List Areas

<mark style="color:blue;">`GET`</mark> `/audit_areas/index.json`

Access: managers, auditors and the accountable manager. Returns `{ "areas": [ … ] }`, top-level areas in display order, each with its `children`.

### Create Area

<mark style="color:green;">`POST`</mark> `/audit_areas/add.json`

Access: managers.

| Field | Required | Description |
|-------|----------|-------------|
| `name` | **yes** | Up to 255 characters. |
| `parent_id` | no | A top-level area of the company. A sub-area cannot have sub-areas. |
| `description`, `requirements` | no | Free text (applicable regulations or standards). |
| `safety_report_department_id` | no | Department of the safety reports; used for the high-risk-hazard input and the department filter. |
| `criticality` | no | Default `medium`. |
| `frequency_months` | no | One of `1, 2, 3, 6, 12, 24`. Omitted: the suggestion for the posted criticality. |
| `active`, `sort` | no | |
| `reason` | **conditional** | Required (`400`) when `frequency_months` differs from the suggested frequency. |

Response: `{ "result": true, "area": { … } }`.

### Edit Area

<mark style="color:green;">`POST`</mark> `/audit_areas/edit/{id}.json`

Access: managers. Same fields as create. A `reason` is **required** when `frequency_months` or `criticality` actually changes. Every changed field is appended to the area's change history with the reason. An area with sub-areas cannot become a sub-area; an area cannot be its own parent. Response: `{ "result": true, "area": { … } }`.

### Seed the Starter Areas or a Template

<mark style="color:green;">`POST`</mark> `/audit_areas/seed_starter.json`

Access: managers. Two forms:

* **Without a body**: adds the starter areas (flight operations, crew training and checking, flight and duty time limitations, operational control, ground operations, dangerous goods, continuing airworthiness, aircraft maintenance, training organisation, safety management system, emergency response, contracted services) whose name the company does not have yet, as medium-criticality areas with a 6-month frequency.
* **With an `areas` body** (an area template, used by NEO's *Templates* dialog): creates the posted tree.

```json
{
  "areas": [
    { "name": "Flight operations", "criticality": "high", "requirements": "ORO.GEN, Part-CAT",
      "children": [ { "name": "Operational control", "criticality": "high", "requirements": "ORO.GEN.110" } ] },
    { "name": "Records and documentation", "criticality": "low" }
  ]
}
```

| Field | Required | Description |
|-------|----------|-------------|
| `areas` | **yes** | A list of 1 to 40 top-level areas. |
| `areas[].name` | **yes** | 1 to 255 characters, trimmed. |
| `areas[].criticality` | no | `low`, `medium` (default) or `high`. The frequency is always the suggestion for it: 3, 6 or 12 months. |
| `areas[].requirements`, `areas[].description` | no | Free text. |
| `areas[].children` | no | Up to 20 sub-areas with the same fields. Sub-areas cannot have `children` (`400`). |

Names compare trimmed and case-insensitively against **every** live area of the company: a name the company already uses, at any level, is never created again. An existing top-level area receives the posted sub-areas; a posted top-level area whose name exists only as a sub-area is skipped together with its sub-areas. Malformed input is `400` with a `message`.

Nothing is logged: seeding is creation. The areas are examples to rename or remove. Response: `{ "result": true, "created": 12 }` (`created` is `0` when everything already exists).

### Area Change History

<mark style="color:blue;">`GET`</mark> `/audit_areas/changes/{id}.json`

Access: managers, auditors and the accountable manager. Append-only, newest first.

```json
{ "changes": [ { "id": 31, "user_id": 12, "user_name": "Jane Doe", "field": "frequency_months", "old": "6", "new": "3", "reason": "Two repeat findings in 2026.", "created": 1789000000 } ] }
```

---

## Audits

An audit is the plan and the executed audit in one record. `idn` is `AU-YYYY-NNN`, numbered per company.

### Audit object

```json
{
  "id": "c3b2…",
  "idn": "AU-2026-004",
  "kind": "internal",
  "authority_name": null,
  "title": "Operational control audit",
  "scope": "…", "criteria": "…", "requirements": "Company operations manual part A, rev. 2025-03",
  "methodology_document_id": "8f0c…", "methodology_note": null,
  "planned_date": "2026-06-12", "original_planned_date": null,
  "start_date": null, "end_date": null,
  "lead_auditor_name": "A. Smith", "lead_auditor_user_id": null, "team": null,
  "auditor_independence_confirmed": 1,
  "auditor_independence_statement": "Not responsible for the audited activity.",
  "auditor_competence": "Lead auditor course 2024, 6 years in flight operations.",
  "auditor_declaration_na": 0,
  "results": "…",
  "status": "planned",
  "approved_by": null, "approved_at": null,
  "created_by": 12, "created": 1789000000, "modified": 1789000000
}
```

### List the Programme

<mark style="color:blue;">`GET`</mark> `/audits/index.json`

Access: managers, auditors and the accountable manager.

| Parameter | Description |
|-----------|-------------|
| `year` | Four digits. Default: the current year. Anything else is `400`. |

Returns `{ "year": 2026, "audits": [ … ] }`: audits whose planned date **or original planned date** is in the year, by planned date. Each audit adds `postponed_out` (originally planned in the year, now planned in another one), `area_ids` and `findings` (`{ "total": 3, "by_rank": { "critical": 0, "major": 1, "minor": 0, "observation": 2, "unclassified": 0 } }`).

### View Audit

<mark style="color:blue;">`GET`</mark> `/audits/view/{id}.json`

Access: managers, auditors and the accountable manager. Returns `{ "audit": { … } }` with the audit object plus:

| Key | Description |
|-----|-------------|
| `areas`, `area_ids` | The audited areas. |
| `assessments` | One row per area and process: `id`, `area_id`, `process`, the six answers, `conclusion`, `notes`. |
| `findings`, `finding_list` | Counts by rank, and the findings of the audit (`id`, `number`, `title`, `status`, `classification_*`, `owner_*`, dates, `overdue`). |
| `approval_blockers` | Why the report cannot be approved yet: `not_completed`, `independence`, `competence`. Empty when it can be. |
| `documents` | Issued document versions (see [Documents](#issued-documents)). |
| `changes` | Append-only history: `action`, `fields` (`{ field: [old, new] }`), `comments`, user, `created`. |
| `lead_auditor_user_name`, `approved_by_name` | Names, `null` when the user is gone. |

Result files are uploads tagged `Audit`, see [Files](#files).

### Create Audit

<mark style="color:green;">`POST`</mark> `/audits/add.json`

Access: managers. Created as `planned`.

| Field | Required | Description |
|-------|----------|-------------|
| `title` | **yes** | Up to 255 characters. |
| `planned_date` | **yes** | `YYYY-MM-DD`. |
| `kind` | no | Default `internal`. |
| `authority_name`, `lead_auditor_name` | no | Up to 255 characters. |
| `scope`, `criteria`, `requirements`, `methodology_note`, `team`, `results` | no | Free text. |
| `methodology_document_id` | no | A live document of the company. |
| `lead_auditor_user_id` | no | A user of the company. |
| `start_date`, `end_date` | no | `end_date` cannot be before `start_date`. |
| `auditor_independence_confirmed`, `auditor_independence_statement`, `auditor_competence` | no | The auditor declaration. |
| `auditor_declaration_na` | no | `1` only on an `authority` audit ("authority inspector: not applicable"); otherwise `400`. |
| `area_ids` | no | Array of live area ids of the company. |

Response: `{ "result": true, "audit": { … } }`.

### Edit Audit

<mark style="color:green;">`POST`</mark> `/audits/edit/{id}.json`

Access: managers. Same fields, only the posted ones change; a cancelled audit is `400`. The planned date moves only through [Postpone](#postpone-audit) (changing it here is `400`); status moves through [Status](#change-audit-status) and [Cancel](#cancel-audit). **Any real change clears the approval** (`approved_by` and `approved_at` become `null`), and it is logged.

### Postpone Audit

<mark style="color:green;">`POST`</mark> `/audits/postpone/{id}.json`

```json
{ "planned_date": "2026-09-15", "reason": "Auditor unavailable." }
```

Access: managers. Both fields are required, the date must differ from the current one and the audit must be `planned` or `postponed`. The first planned date is kept once in `original_planned_date`; the status becomes `postponed`. Response: `{ "result": true, "audit": { … } }`.

### Cancel Audit

<mark style="color:green;">`POST`</mark> `/audits/cancel/{id}.json`

Body `{ "reason": "…" }` (required). Allowed from `planned`, `postponed` and `in_progress`. Response: `{ "result": true, "audit": { … } }`.

### Change Audit Status

<mark style="color:green;">`POST`</mark> `/audits/status/{id}.json`

Body `{ "status": "in_progress" }`.

| From | To |
|------|----|
| `planned` | `in_progress` |
| `postponed` | `planned`, `in_progress` |
| `in_progress` | `completed` |

Any other move is `400`. Response: `{ "result": true, "audit": { … } }`.

### Approve the Audit Report

<mark style="color:green;">`POST`</mark> `/audits/approve/{id}.json`

Access: managers. Sets `approved_by` and `approved_at`. Refused with `400` and `blockers` (a list of `not_completed`, `independence`, `competence`) when the audit is not `completed`, or the independence declaration is not confirmed or the competence is blank. An authority audit with `auditor_declaration_na` skips the two declarations. Approving an approved audit is `400` with `error: "already_approved"`. Approval is cleared by any later real change to the audit or its assessments, and when one of its findings is created, really changed (edit, including the owner's root cause), moves status (status, convert) or is changed by an accepted decision; each of these is logged in the audit's history as `approval_revoked`.

### Save an Assessment

<mark style="color:green;">`POST`</mark> `/audits/assessment_save/{auditId}.json` (create) · `/audits/assessment_save/{auditId}/{assessmentId}.json` (edit)

Access: managers. An assessment covers one area of the audit and optionally one process within it; there is one per (audit, area, process), so saving an existing combination updates it.

| Field | Required | Description |
|-------|----------|-------------|
| `area_id` | **yes** on create | An area **already linked to the audit** (`400` otherwise). |
| `process` | no | A specific process within the area, up to 255 characters. |
| `documented`, `followed`, `understood`, `achieves_purpose`, `risk_controls_effective`, `corrective_actions_effective` | no | `yes`, `partial`, `no`, `na` or empty. |
| `conclusion` | no | One of the conclusions or empty. |
| `notes` | no | Free text. |

Response: `{ "result": true, "assessment": { … }, "prompt": "create_finding" }`. `prompt` is a hint for what to offer next, never an action taken: `create_finding` after `non_compliant`, `link_hazard` after `compliant_ineffective`, otherwise `null`. A cancelled audit is `400`. Changing an assessment clears the audit's approval.

---

## Findings

### Finding object

```json
{
  "id": "e91a…",
  "audit_id": "c3b2…",
  "assessment_id": null,
  "number": "AU-2026-004-1",
  "classification_id": 2,
  "requirement": "REQ-FTL-04 (rev. 2025-03)",
  "title": "Duty periods not recorded",
  "details": "…",
  "area_id": 4,
  "raised_by_name": "A. Smith", "raised_by_user_id": null, "raised_date": "2026-06-12",
  "owner_user_id": 123,
  "cap_due_date": null, "target_date": "2026-09-10",
  "completed_date": null, "verified_date": null,
  "cap_accepted_date": null, "cap_accepted_ref": null,
  "authority_closure_date": null, "authority_closure_ref": null,
  "closure_date": null, "closure_note": null,
  "root_cause": null, "root_cause_category": null,
  "status": "open",
  "repeat_of_finding_id": null,
  "overdue": false,
  "created_by": 12, "created": 1789000000, "modified": 1789000000
}
```

### List Findings

<mark style="color:blue;">`GET`</mark> `/audit_findings/index.json`

Managers, auditors and the accountable manager see every finding of the company. **Anyone else gets only the findings they own** (the `owner` and `repeat` filters are ignored for them, and `repeat_of_finding_id` is `null`).

| Parameter | Description |
|-----------|-------------|
| `year` | Four digits, default the current year. Findings **raised** in that year. |
| `open` | `1`: **Open, all years** (the NEO list's default): every finding that is not `closed` / `closed_by_decision`, raised in **any year**; `year` is ignored. Same company scope and viewer rules. |
| `mine` | `1`: **My findings**, for any caller: only the findings the caller owns, **of any year**, closed ones left out unless `include_closed=1`. `year` is ignored. |
| `include_closed` | `1` with `mine=1`. |
| `overdue` | `1`: every finding raised up to the end of `year` that is **overdue** (instead of the year's findings). With `open=1`: the overdue findings of any year. |
| `kind` | `internal` or `authority` (the audit's kind). |
| `classification_id`, `status`, `root_cause_category` | Exact match. |
| `area_id` | The area and its sub-areas. |
| `owner` | Owner user id. |
| `repeat` | `1` repeat findings only, `0` the others. |

**Overdue** is the same rule everywhere (list, dashboard, reminders): the finding is `open`, `cap_submitted`, `cap_accepted` or `in_progress` and is past `target_date`, or is `open` and past `cap_due_date`. Closed findings and findings in `pending_verification` or `pending_closure` are never overdue.

Returns `{ "year": 2026, "mine": false, "findings": [ … ] }`. Each row has the finding's number, title, status, dates, `classification_name`, `classification_rank`, `is_non_compliance`, `area_name`, `owner_name`, `audit_id`, `audit_idn`, `audit_title`, `audit_kind`, `root_cause_category`, `repeat_of_finding_id` and `overdue`. `mine` is `true` when the caller is not a viewer, so the list was narrowed to their own findings.

### View Finding

<mark style="color:blue;">`GET`</mark> `/audit_findings/view/{id}.json`

Access: managers, auditors, the accountable manager, or the finding's owner (`403` for anyone else). Returns `{ "finding": { … } }`: the finding object plus

| Key | Description |
|-----|-------------|
| `audit` | The audit header: `id`, `idn`, `kind`, `authority_name`, `title` and dates; viewers also get `status` and `lead_auditor_name`. |
| `classification`, `area` | The classification (with its default days) and the area. |
| `decisions` | The [authority decisions](#authority-decisions). |
| `hazards`, `reports`, `repeat_of`, `repeat_candidates` | Viewers only (empty for an owner): linked hazards (`ineffective_control`, `control_note`, `next_review_date`), linked safety reports, the finding this one repeats, and possible repeats (same area and requirement in the last 24 months). |
| `allowed_transitions` | The statuses a manager may move to by hand (empty for others). |
| `close_blocker` | Why the finding cannot be closed yet, `null` when it can: `needs_effective_action`, `actions_open` or `note_required`. |
| `can` | `{ "manage": bool, "work": bool }` for the caller. |
| `changes` | Append-only history. An owner sees only entries about what they can see. |
| `owner_name`, `raised_by_user_name` | Names. |

Corrective actions of a finding are listed with [Safety Actions](safety-assurance.md#list-actions) (`source_model=AuditFinding&source_id={id}`). Evidence files are uploads tagged `AuditFinding`.

### Create Finding

<mark style="color:green;">`POST`</mark> `/audit_findings/add.json`

Access: managers. The audit must not be cancelled. Created `open`.

| Field | Required | Description |
|-------|----------|-------------|
| `audit_id` | **yes** | UUID of the audit. |
| `title` | **yes** | Up to 255 characters. |
| `classification_id` | **yes** | An **active** classification of the company. |
| `number` | no | Up to 32 characters, unique within the audit. Default `<audit idn>-N`. |
| `requirement`, `raised_by_name` | no | Up to 500 / 255 characters. |
| `details`, `root_cause` | no | Free text. |
| `raised_date` | no | Default today. |
| `cap_due_date`, `target_date` | no | Default from the classification's `default_cap_days` / `default_implementation_days` counted from `raised_date`; always overridable. |
| `completed_date`, `verified_date` | no | Normally set automatically. |
| `area_id` | no | A live area of the company. |
| `assessment_id` | no | An assessment of the same audit. |
| `raised_by_user_id` | no | A user of the company. |
| `owner_user_id` | no | An active user of the company who is not an auditor. The owner is notified in-app and by email. |
| `root_cause_category` | no | |
| `repeat_of_finding_id` | no | Another live finding of the company; manager-confirmed. |

Response: `{ "result": true, "finding": { … } }`.

### Edit Finding

<mark style="color:green;">`POST`</mark> `/audit_findings/edit/{id}.json`

Managers can change any field above except `audit_id`; status, closure, plan acceptance and authority closure go through [Status](#change-finding-status) and [Decisions](#authority-decisions). A change of owner notifies the new owner. Changing the classification of an observation to a non-compliance class is `400` ("Use convert").

The **finding owner** may post only `root_cause` and `root_cause_category` (any other key is `403`), and not once the finding is closed (`400`). Response: `{ "result": true, "finding": { … } }`.

### Change Finding Status

<mark style="color:green;">`POST`</mark> `/audit_findings/status/{id}.json`

Access: managers. Done under the finding's row lock.

```json
{ "status": "cap_accepted", "date": "2026-07-01", "reference": "AUTH/2026/17", "note": "…" }
```

| Field | Description |
|-------|-------------|
| `status` | Target status. |
| `note` | Free text. **Required** for a backward move and for closing an observation. |
| `date` | Date of acceptance or closure; default today. |
| `reference` | The authority's reference (up to 255 characters). |
| `authority` | `true` to record the **authority's closure** (`status` must be `closed`). |

Rules:

* Allowed manual targets: any status except the current one and `closed_by_decision` (which only an accepted decision sets). `cap_submitted`, `cap_accepted` and `pending_closure` exist only on findings of an **authority** audit. `closed` cannot be set from `closed_by_decision`.
* **Backward moves** need a `note` and clear what the later stages recorded: before `pending_verification` the completed and verified dates; `pending_closure` back to `pending_verification` the verified date; before `cap_accepted` the plan acceptance; out of a closed state the closure and authority closure.
* Moving to `cap_accepted` stores `date` and `reference` as the plan acceptance.
* **Closing** (`closed`): a non-compliance classification needs at least one corrective action **verified effective** and none `open` or `done`; an observation needs a `note`. The closure date is `date` and the note is stored.
* **Authority closure** (`authority: true`): only for findings of an authority audit; allowed **from any status**, including `closed_by_decision`, with open actions staying open. Stores `authority_closure_date`, `authority_closure_ref`, the closure date and an optional note.
* Corrective actions also move the finding automatically (first action `in_progress`; no action `open` → `pending_verification` and `completed_date`; an authority finding that meets the closing conditions → `pending_closure` and `verified_date`). Automatic moves never leave `cap_submitted`, and are logged as `auto_status`.

Refusals (`400`): `transition_not_allowed`, `note_required`, `close_blocked` (with `blocker`: `needs_effective_action`, `actions_open`, `note_required`), `not_authority`. Response: `{ "result": true, "finding": { … } }`.

### Convert an Observation

<mark style="color:green;">`POST`</mark> `/audit_findings/convert/{id}.json`

```json
{ "classification_id": 2, "reason": "Recurred in the last two audits." }
```

Access: managers. Turns an observation into a finding: the classification must be an **active non-compliance** class, `reason` is required, the dates are set again from the new classification, the status restarts at `open` and completion, verification, plan acceptance and closure are cleared. Logged with the reason. `400` `not_an_observation` when the current classification is already a non-compliance. Response: `{ "result": true, "finding": { … } }`.

---

## Authority Decisions

A finding can carry authority decisions: proposals sent to the authority and its answers. They are a finding-management procedure that may or may not exist under a given authority, not an ICAO mechanism.

### Decision object

```json
{
  "id": "7a41…", "finding_id": "e91a…",
  "type": "variation",
  "proposal": "…", "mitigations": "…", "submitted_date": "2026-07-01",
  "decision": "accepted", "decision_date": "2026-08-12", "decision_reference": "AUTH/2026/44", "decision_note": "…",
  "review_date": "2027-02-12", "expiry_date": null,
  "created_by": 12, "created": 1789000000, "modified": 1789000000
}
```

### Save a Decision

<mark style="color:green;">`POST`</mark> `/audit_findings/decision_save/{findingId}.json` (create) · `/audit_findings/decision_save/{findingId}/{decisionId}.json` (edit)

Access: managers; the finding's owner may create and edit **pending proposals** only (`type`, `proposal`, `mitigations`, `submitted_date`; any other key is `403`, and a closed finding is `400`). Done under the finding's row lock.

| Field | Description |
|-------|-------------|
| `type` | **Required.** `variation`, `alternative_means`, `cap_acceptance` or `other`. |
| `proposal`, `mitigations` | Free text: the proposal and the mitigating factors and safety evidence. |
| `submitted_date` | Date the proposal went to the authority. |
| `decision` | `pending` (default), `accepted` or `rejected`. Managers only. |
| `decision_date`, `decision_reference`, `decision_note` | The authority's answer. `decision_date` is **required** when `decision` is not `pending`. |
| `review_date`, `expiry_date` | When an accepted variation is reviewed or expires. |

Rules:

* A recorded decision is **final**: its `type` and `decision` can no longer change (`decision_final`).
* An accepted `variation` or `alternative_means` needs `review_date` or `expiry_date`, **and** a linked, live, not-closed hazard whose `next_review_date` is on or before that date (`review_date`, else `expiry_date`). Checked when it becomes accepted and whenever those dates change; refused with `review_date_required` or `hazard_required`.
* An accepted `cap_acceptance` is only for findings of an authority audit (`not_authority`).
* On the transition **into accepted**: a variation or alternative means sets the finding `closed_by_decision` with the decision date as closure date; a `cap_acceptance` stores the plan acceptance date and reference and moves the finding to `cap_accepted` when it was earlier. Later edits of an accepted decision never touch the finding.

Response: `{ "result": true, "decision": { … }, "finding": { … } }`.

---

## Finding Links

Links from a finding to risk management. Access: managers only for every endpoint here; auditors are refused first. The finding and the hazard or report must belong to the company and be live. Every write runs in a transaction and is logged on the finding. Each answers the finding's current links:

```json
{ "result": true, "hazards": [ { "id": "a91f…", "idn": "HZ-2026-004", "title": "…", "status": "open", "next_review_date": "2026-12-01", "ineffective_control": 0, "control_note": null } ], "reports": [ { "id": "5d7c…", "idn": "2026/00042", "name": "…", "status": "closed" } ] }
```

| Endpoint | Description |
|----------|-------------|
| <mark style="color:green;">`POST`</mark> `/audit_finding_links/hazard_create/{findingId}.json` | Creates a hazard (`source` `manual`) prefilled from the finding (title, description from the details and root cause, and the department of the finding's area) and links it. The body may override `title`, `description`, `safety_report_department_id`, `type`, `owner_user_id`, `risk_probability`, `risk_severity`, `review_interval_months` with the same validation as [Create Hazard](safety-assurance.md#create-hazard). The answer adds `hazard`. |
| <mark style="color:green;">`POST`</mark> `/audit_finding_links/hazard_link/{findingId}/{hazardId}.json` | Links an existing hazard. Idempotent. A closed hazard is `400` `hazard_closed`. |
| <mark style="color:green;">`POST`</mark> `/audit_finding_links/hazard_unlink/{findingId}/{hazardId}.json` | Removes the link (also for a hazard deleted since). `400` `hazard_required` when it is the only linked hazard that keeps an accepted variation or alternative means covered. The hazard itself is unchanged. |
| <mark style="color:blue;">`GET`</mark> `/audit_finding_links/report_search.json?q=` | Search for a report to link, by number or name. At least 2 characters; at most 20 results `{ "reports": [ { "id", "idn", "name", "status" } ] }`. Submitted top-level reports only. Managers only: the search is not available to finding owners. |
| <mark style="color:green;">`POST`</mark> `/audit_finding_links/report_link/{findingId}/{reportId}.json` | Links a submitted safety report (and its risk assessment). Idempotent; a follow-up statement cannot be linked (`400`). |
| <mark style="color:green;">`POST`</mark> `/audit_finding_links/report_unlink/{findingId}/{reportId}.json` | Removes the link. |
| <mark style="color:green;">`POST`</mark> `/audit_finding_links/ineffective/{findingId}/{hazardId}.json` | Body `{ "ineffective_control": true, "control_note": "…" }`. Flags or clears an ineffective existing risk control on the link; flagging needs a note naming the control or action (`400` `note_required`). |
| <mark style="color:green;">`POST`</mark> `/audit_finding_links/reassess/{findingId}/{hazardId}.json` | Body `{ "note": "…" }` (optional). Makes the hazard's `next_review_date` **today** in the company timezone (unless it is already due earlier) and notifies the hazard owner. From the next day, until a review is recorded, the hazard is overdue for review in the hazard log and counts as an *untracked* risk on the dashboard. A closed hazard is `400` `hazard_closed`. |

The hazard returned by [View Hazard](safety-assurance.md#view-hazard) includes a `findings` list (`id`, `number`, `title`, `status`) of the findings linked to it.

---

## Issued Documents

Documents are issued as **immutable versions**. An issue stores a snapshot of the exact data used and, once, the rendered PDF. Re-rendering an old version uses its snapshot, so it reproduces what was issued even if the audit or finding was changed later. There is no edit or delete endpoint.

| `kind` | Subject (`subject_model`, `subject_id`) | Requires |
|--------|------------------------------------------|----------|
| `programme` | `Programme`, the year (for example `2026`) | |
| `audit_report` | `Audit`, the audit id | The audit must be **approved** (`approved_by` set) to issue |
| `cap_response` | `AuditFinding`, the finding id | |
| `decision_proposal` | `AuditFinding`, the finding id, plus `decision_id` | |
| `management_report` | `ManagementReview`, the review id | Issued only through [Issue the report](#issue-the-report) |

Versions are numbered per (company, subject, kind), starting at 1; a number is never reused.

### Document object

```json
{ "id": "d2f0…", "kind": "audit_report", "subject_model": "Audit", "subject_id": "c3b2…", "version": 2, "upload_id": "b91e…", "decision_id": null,
  "issued_by": 12, "issued_by_name": "Jane Doe", "issued_at": 1789000000, "note": "Corrected scope." }
```

`decision_id` is set for `decision_proposal` versions. `upload_id` is the stored PDF, `null` until attached.

### List Versions

<mark style="color:blue;">`GET`</mark> `/audit_documents/index.json`

Access: managers, auditors and the accountable manager.

| Parameter | Required | Description |
|-----------|----------|-------------|
| `subject_model` | **yes** | `Programme`, `Audit`, `AuditFinding` or `ManagementReview`. |
| `subject_id` | **yes** | The subject's id (the year for `Programme`). The subject must be live (`404` otherwise). |
| `kind` | no | Filter by kind. |

Returns `{ "documents": [ … ] }` ordered by kind, then newest version first, without snapshots.

### View a Version

<mark style="color:blue;">`GET`</mark> `/audit_documents/view/{id}.json`

Access: managers, auditors and the accountable manager. Returns `{ "document": { …, "snapshot": { … } } }`. The snapshot envelope is `{ "format", "kind", "subject_model", "subject_id", "version", "company": { "name", "logo", "date_format", "time_format", "timezone" }, "issued_by", "issued_at", "note", "data": { … } }`; `data` depends on the kind and is exactly what the PDF is rendered from.

### Preview

<mark style="color:blue;">`GET`</mark> `/audit_documents/preview.json`

Access: managers. Returns `{ "snapshot": { … } }`: what an issue would store **right now**, with `issued_by` and `issued_at` `null` and the next version number. Nothing is written. Parameters: `kind`, `subject_id`, and `decision_id` for `decision_proposal`. An audit report can be previewed before it is approved. `kind=management_report` is `400` `use_management_review`.

### Issue

<mark style="color:green;">`POST`</mark> `/audit_documents/issue.json`

```json
{ "kind": "audit_report", "subject_id": "c3b2…", "note": "Corrected scope." }
```

Access: managers. Stores the next version under the subject's row lock, so concurrent issues get distinct versions. `decision_id` is required for `decision_proposal` (a missing or unknown decision is `404`). Refusals (`400`): `not_approved` (audit report of an unapproved audit), `use_management_review` (`management_report`), `version_conflict` (a concurrent issue took the number; retry). Response: `{ "result": true, "id": "d2f0…", "version": 2, "snapshot": { … }, "document": { … } }`.

### Attach the PDF

<mark style="color:green;">`POST`</mark> `/audit_documents/attach_pdf/{id}.json`

Access: managers. Records the rendered PDF of an issued version, **once**. First upload the PDF with the [Uploads API](uploads.md) (`model` `AuditDocument`, `foreign_key` the document id), then:

```json
{ "upload_id": "b91e…" }
```

The upload must be active, belong to the company and be tagged `AuditDocument` with this document as its record, else `400` `invalid_upload`; a second attach is `400` `already_attached`. Response: `{ "result": true, "document": { … } }`.

---

## Management Reviews

A management review covers a period. It holds the management audit report (as issued versions) and the accountable manager's recorded review. Resulting actions are [safety actions](safety-assurance.md#safety-actions) with `source_model` `ManagementReview`.

### Review object

```json
{
  "id": "5c19…",
  "period_from": "2026-01-01", "period_to": "2026-06-30",
  "report_document_id": "d2f0…",
  "prepared_by": 12, "prepared_by_name": "Jane Doe", "prepared_at": 1789000000,
  "reviewed_by": null, "reviewed_by_name": null, "reviewed_at": null,
  "recommendations": "Extend the audit team.\nReview the FDP records process.",
  "decisions": null,
  "status": "issued",
  "created": 1788000000, "modified": 1789000000
}
```

`status` is `draft`, `issued` (awaiting the review) or `reviewed`. `report_document_id` is the current issued report version.

### List Reviews

<mark style="color:blue;">`GET`</mark> `/management_reviews/index.json`

Access: managers, auditors and the accountable manager. Returns `{ "reviews": [ … ] }`, newest period first; each adds `report_version`.

### View Review

<mark style="color:blue;">`GET`</mark> `/management_reviews/view/{id}.json`

Access: managers, auditors and the accountable manager. Returns `{ "review": { … } }` with

| Key | Description |
|-----|-------------|
| `documents` | Issued report versions, newest first. |
| `report` | The snapshot of the **current** issued report (what the accountable manager reviews), or `null` before the first issue. |
| `can` | `{ "manage", "edit" (draft only), "issue", "review" (accountable manager and status `issued`), "add_actions" }` for the caller. |

### The report

The snapshot `data` of a management report contains the review and nine sections:

| Key | Section |
|-----|---------|
| `completed_vs_planned` | Audits planned, completed, in progress, not started and cancelled in the period (an audit whose planned or original planned date is in the period belongs to it), with `by_kind` and the audit list. |
| `findings_by_class_area` | Findings raised in the period by classification, by area and as a matrix. |
| `repeat_findings` | Findings raised in the period with a repeat link. |
| `overdue_findings` | Findings overdue **as of `period_to`** (their dates compared with `period_to`, their **current** status: a finding closed since is not counted); findings awaiting verification or the authority are not counted. |
| `actions_awaiting_verification` | Corrective actions done and not yet verified as of `period_to`. |
| `action_effectiveness` | Actions verified in the period: `effective`, `not_effective` and the list. |
| `root_cause_trends` | Root-cause categories of the period against the previous period of the same length. |
| `ineffective_controls` | `compliant_ineffective` assessments of audits held in the period and risk controls flagged ineffective on findings. |
| `recommendations` | The recommendations text, one entry per line. |

Flow measures count what is dated inside the period; backlog measures are taken as of `period_to`.

### Preview the Report

<mark style="color:blue;">`GET`</mark> `/management_reviews/preview/{id}.json`

Access: managers, auditors and the accountable manager. Returns `{ "snapshot": { … } }`: the report with the data as it stands now and the next version number. Nothing is written.

### Create Review

<mark style="color:green;">`POST`</mark> `/management_reviews/add.json`

Access: managers. Created as `draft`.

| Field | Required | Description |
|-------|----------|-------------|
| `period_from`, `period_to` | **yes** | `YYYY-MM-DD`; the start cannot be after the end (`400`). `period_to` cannot be later than today in the company timezone: `400` with `error: "period_in_future"`. |
| `recommendations` | no | Free text, one recommendation per line. |

Response: `{ "result": true, "review": { … } }`.

### Edit Review

<mark style="color:green;">`POST`</mark> `/management_reviews/edit/{id}.json`

Access: managers. Changes `period_from`, `period_to` and `recommendations`, **only while the review is a draft** (`400` `not_draft` afterwards). The same period rules as on create apply, including `400` `period_in_future`. Response: `{ "result": true, "review": { … } }`.

### Issue the Report

<mark style="color:green;">`POST`</mark> `/management_reviews/issue/{id}.json`

Body `{ "note": "…" }` (optional). Access: managers. Stores the next `management_report` version (an immutable snapshot of the current data), sets the status to `issued` and notifies the accountable manager in-app and by email. It can be issued again while the status is `draft` or `issued` (a new version); once the review is recorded it is `400` `already_reviewed`. The PDF is attached with [Attach the PDF](#attach-the-pdf). The report PDF is issued before the review, so its review block reads that the review is to be recorded by the accountable manager in Flylogs.

Refusals (`400`): `already_reviewed`, `version_conflict`. Response: `{ "result": true, "document": { "id", "version" }, "version": 2, "snapshot": { … }, "review": { … } }`.

### Record the Review

<mark style="color:green;">`POST`</mark> `/management_reviews/review/{id}.json`

```json
{ "document_id": "d2f0…", "decisions": "Approved the extra audit hours; see the actions." }
```

Access: **only the accountable manager** (`403` for everyone else, including managers and auditors). Records the decisions with the reviewer and the time and sets the status to `reviewed`.

| Field | Required | Description |
|-------|----------|-------------|
| `document_id` | **yes** | The report version the accountable manager read. It must still be the current `report_document_id`. |
| `decisions` | **yes** | Free text. |

Refusals (`400`): `not_issued` (nothing to review yet), `already_reviewed`, `stale_report` (a newer version was issued meanwhile; read it and review again, so decisions are never attached to a version the accountable manager did not see). Once reviewed the review is closed: no edit, no new issue. Resulting actions can be added at any time with [Create Action](safety-assurance.md#create-action) using `source_model` `ManagementReview`. Response: `{ "result": true, "review": { … } }`.

---

## Safety Actions From Findings and Reviews

[Safety actions](safety-assurance.md#safety-actions) accept two more sources: `AuditFinding` (corrective actions) and `ManagementReview` (resulting actions). They show in `mine.json`, are reminded like any action and count in `actions_overdue`.

| Endpoint | Rule for these sources |
|----------|------------------------|
| `POST /safety_actions/add.json` | `AuditFinding`: a manager or the finding's owner; on a `closed` / `closed_by_decision` finding a manager only (the owner gets `400` with `error: "finding_closed"`). `ManagementReview`: a manager or the accountable manager. Whoever may add sets `owner_user_id` and `due_date`; always created `open`; auditors never. |
| `GET /safety_actions/index.json?source_model=…&source_id=…` | `AuditFinding`: managers, auditors, the accountable manager and the finding's owner see every action on it. `ManagementReview`: managers, auditors and the accountable manager. Anyone else sees only their own actions. |
| `POST /safety_actions/status/{id}.json` | As for any action. For an `AuditFinding` action the finding is updated in the same transaction (automatic status and dates). |

`source_title` is the finding number and title, or the period of the review.

---

## Files

Result files, finding evidence and issued PDFs use the [Uploads API](uploads.md) with these tags: `model` `Audit` (result files and certificates of an audit), `AuditFinding` (evidence of a finding) and `AuditDocument` (the PDF of an issued version), and `foreign_key` the record id.

| Tag | Read | Add | Remove or rename |
|-----|------|-----|------------------|
| `Audit` | managers, auditors, accountable manager | managers | managers |
| `AuditFinding` | managers, auditors, accountable manager, the finding's owner | managers and the finding's owner | managers; the owner only files they uploaded |
| `AuditDocument` | managers, auditors, accountable manager | managers, only while the version has no PDF | **never** the issued PDF; managers may delete an orphan of a failed attach |

* Auditors (250) never write, whatever the ACL says.
* Adding files needs a premium or unlimited plan; reading remains possible after a downgrade.
* Issued documents are immutable: an issued PDF cannot be renamed, re-tagged or deleted.

---

## Dashboard and Drill-down

The `audits` key of [Dashboard](safety-assurance.md#dashboard) summarises the programme for the Assurance tab (managers and auditors; the `type` filter does not apply to audits).

```json
{
  "audits": {
    "has_data": true,
    "open_by_class": [ { "classification_id": 2, "name": "Level 2", "rank": "major", "is_non_compliance": 1, "count": 3 } ],
    "findings_overdue": { "count": 1, "status": "red", "critical_open": 0 },
    "awaiting_authority": { "count": 0, "status": "green" },
    "awaiting_verification": { "count": 2, "status": "amber" },
    "programme": { "planned": 8, "completed": 5, "overdue_planned": 1 },
    "areas_overdue": { "count": 2, "status": "amber" },
    "last_management_review_date": "2026-07-15",
    "trend": { "findings_overdue": { "current": [null, 1, 2, null, null, null, null, null, null, null, null, null], "previous": [null, null, null, null, null, null, null, null, null, null, null, null] } }
  }
}
```

* `has_data` is `false` (and every count zero) for a company without any audit record.
* `findings_overdue.status` is `red` when an overdue finding is `critical` or `major`, or any `critical` finding is open; `amber` when anything is overdue; `green` otherwise. `awaiting_*` and `areas_overdue` are `amber` above zero.
* `open_by_class` counts findings that are not closed, per classification (a row with `classification_id: null` counts unclassified ones).
* `programme` is the year's audits: `planned` (planned or original planned date in the year, cancelled audits excluded), `completed` and `overdue_planned` (still `planned` or `postponed` with a planned date before today).
* `trend` has monthly values for `findings_overdue` and `areas_overdue` (12 values for the year and the year before, `null` before history exists).
* `last_management_review_date` is the date, in the company timezone, of the last recorded review (`null` if none). The Assurance tab shows it red when none exists or it is older than 12 months: a display hint only.
* Findings and the department filter: a finding's department is that of its area.
* **Year semantics**: open, overdue, awaiting and areas overdue are backlog measures (findings dated in or before the year by `raised_date`, areas by creation date); `programme` is a flow measure (audits planned in the year).

[Items](safety-assurance.md#items) accepts four more `key` values for the audits block, with the same `year` and `department` filters:

| `key` | Lists |
|-------|-------|
| `findings_overdue` | Overdue findings, most severe first. |
| `awaiting_authority` | Findings in `pending_closure`. |
| `awaiting_verification` | Findings in `pending_verification`. |
| `areas_overdue` | Active areas never audited or past their due date. |

Finding items have `kind: "finding"`, `idn` (the finding number), `title`, `audit_idn`, `classification`, `rank`, `area`, `department`, `status`, `due_date`, `age_days` (since raised) and `link` (`/audits/findings/view/{id}`). Area items have `kind: "area"`, `idn: null`, `title` (the area name), `status` (`never_audited` or `overdue`), `next_due`, `last_audit_date`, `age_days` and `link` `/audits/areas`. No owner or author is ever included.

---

## Notifications

| Who | When |
|-----|------|
| Finding owner | Assigned or changed (in-app message and email, with a link to the finding). Reminders 14 days before, 3 days before and on `cap_due_date` (only while `open`) and `target_date` (while `open`, `cap_submitted`, `cap_accepted` or `in_progress`) |
| Managers | 30 days before an accepted decision's `review_date` or `expiry_date`, and 30 days before an active area's next due date |
| Hazard owner | A reassessment is requested from a finding |
| Accountable manager | A management report is issued (in-app and email) |
| Action owner | As for any [safety action](safety-assurance.md#safety-actions) |
