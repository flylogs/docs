# Hazard Suggestions

> Role names and `user_group_id` values are listed in [User groups](users.md#user-groups).

The Hazard Suggestions endpoints back the **Possible hazards** section of the **Remark Findings** page. Once a night Flylogs proposes hazards from safety reports that are not yet linked to a hazard, and from safety-relevant flight remarks. Each proposal is either a **new** hazard or a **link** to a hazard already in the log. **Nothing is created or linked until a manager accepts a suggestion.** End-user description: [Flight remark findings](../sms/flight-remark-findings.md#possible-hazards), [Hazard log](../sms/hazard-log.md). Hazards themselves: [Safety Assurance](safety-assurance.md).

Suggestions are generated automatically from text patterns and AI. They can be wrong or incomplete, so show them to a person who reviews each one before acting. The endpoints below only read and decide suggestions; they do not generate them.

Every endpoint requires a **premium** or **unlimited** company plan. On any other plan the call fails with `400` and the message `Not a premium account`.

---

## Access Control

| Who | List | Accept | Dismiss |
|-----|------|--------|---------|
| Manager: `user_group_id` ≤ 110 | yes | yes | yes |
| Auditor: `user_group_id` = 250 | `403` (`Auditors have read-only access.`) | `403` | `403` |
| Everyone else | `403` | `403` | `403` |

* Auditors are rejected first, then the plan is checked, then the role.
* A suggestion of another company, or one that does not exist, is `404`.
* The list never includes who wrote a cited report. Reports are returned by number, name and status only.
* The AI is never sent reporter names or ids.

---

## List suggestions

<mark style="color:blue;">`GET`</mark> `/safety_hazard_suggestions/index.json`

#### Query Parameters

| Parameter | Type | Default | Description |
|-----------|------|---------|-------------|
| `status` | string | `pending` | `pending`, `accepted` or `dismissed`. Any other value means `pending`. |

#### Response

Newest first. An empty array when there is nothing to show (including before the first nightly run).

```json
{
  "suggestions": [
    {
      "id": "6f1c0a52-3b7e-4c0e-9a4d-0a1b2c3d4e5f",
      "kind": "new",
      "hazard": null,
      "title": "Unmarked work vehicle on the apron at dusk",
      "description": "Two reports describe a vehicle without lights crossing the apron near the fuel point.",
      "department_id": 2,
      "reports": [
        { "id": "…", "idn": "SR-2026-014", "name": "Vehicle on apron", "status": "open" }
      ],
      "remark_refs": [
        { "digest_id": "…", "flight_id": "…", "quote": "vehicle crossed without lights" }
      ],
      "quote": "vehicle crossed without lights",
      "confidence": 0.82,
      "status": "pending",
      "decided_by_name": null,
      "decided_at": null,
      "created_hazard": null,
      "created": 1794268800
    }
  ]
}
```

| Field | Description |
|-------|-------------|
| `kind` | `new` (propose a hazard) or `link` (link the cited reports to an existing hazard). |
| `hazard` | For `kind=link`: `{ "id", "idn", "title" }` of the target hazard, or `null` when it no longer exists. Always `null` for `new`. |
| `department_id` | Suggested `safety_report_department_id`, or `null`. |
| `reports` | The cited reports that are still live (not drafts, not deleted). |
| `remark_refs` | Cited flight remarks (digest id, flight id, verbatim quote). Shape may carry extra keys. |
| `quote` | A passage copied verbatim from the cited text. |
| `confidence` | 0.5 to 1. Suggestions below 0.5 are discarded and never stored. |
| `decided_by_name`, `decided_at` | Set once accepted or dismissed (`decided_at` is a Unix timestamp). |
| `created_hazard` | `{ "id", "idn" }` of the hazard an accepted suggestion produced or linked to, otherwise `null`. |
| `created` | Unix timestamp. |

---

## Accept a suggestion

<mark style="color:green;">`POST`</mark> `/safety_hazard_suggestions/accept/{id}.json`

* `kind=new`: creates a hazard prefilled from the suggestion and links every cited report that is still live. The hazard is recorded with source `report` when at least one report was linked, otherwise `manual`.
* `kind=link`: links the cited reports that are still live and not yet linked to the target hazard.

The whole decision runs in one transaction, so a double click decides once: the second call answers `already_decided`.

#### Body (all optional, used for `kind=new` only)

Send as form data or JSON. Any field overrides the suggestion's prefill.

| Field | Type | Description |
|-------|------|-------------|
| `title` | string | Up to 255 characters. Must not be empty after trimming. |
| `description` | string | Hazard description. |
| `safety_report_department_id` | integer | A department of the company. |
| `risk_probability` | string | Initial probability slug (see [Safety Assurance](safety-assurance.md#identifiers)). |
| `risk_severity` | string | Initial severity slug. |

For `kind=link` the body is ignored.

#### Response

```json
{ "result": true, "hazard": { "id": "…", "idn": "HZ-2026-007" }, "linked": 2 }
```

`linked` is the number of reports newly linked by this call.

---

## Dismiss a suggestion

<mark style="color:green;">`POST`</mark> `/safety_hazard_suggestions/dismiss/{id}.json`

| Field | Type | Description |
|-------|------|-------------|
| `reason` | string, optional | Up to 255 characters. An empty string is stored as no reason. |

Dismissed suggestions are not proposed again for the same reports.

#### Response

```json
{ "result": true }
```

---

## Errors

Decision conflicts answer `400` with a machine-readable `error` code next to the human `message`:

```json
{ "result": false, "message": "This suggestion has already been decided.", "error": "already_decided" }
```

| `error` | Endpoint | Meaning |
|---------|----------|---------|
| `already_decided` | accept, dismiss | The suggestion is no longer `pending` (decided by someone else or by an earlier click). |
| `nothing_to_link` | accept (`link`) | None of the cited reports can be linked any more: deleted, drafts, or already linked to that hazard. |
| `hazard_unavailable` | accept (`link`) | The target hazard was deleted or closed since the suggestion was made. |

Other failures use the usual statuses: `400` with a `message` for a bad value (empty title, reason longer than 255 characters, invalid field), `403` for role, `404` for an unknown suggestion, `405` for a method other than POST on accept and dismiss.
