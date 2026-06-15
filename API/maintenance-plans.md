# Maintenance Plans

Manage the approved maintenance programme of the fleet. Requires **premium** or **unlimited** subscription plan.

A maintenance plan is an ordered list of **plan actions**. Each action is a job template: a title, a description, a recurrence (flight hours, landings and/or a time period) and its own template work orders. Each action can be linked to zero or more aircraft (many-to-many) — assigning aircraft is optional and can be done later.

Every plan action belongs to a named **maintenance programme** (the parent entity), e.g. a per-type programme such as "C172 Programme". A programme is **required**: it is company-scoped and groups several plan actions; an action belongs to exactly one programme (`maintenance_programme_id`).

## Access control

| Action | Allowed |
|--------|---------|
| List / view / suggestions / programmes (`index`, `view`, `for_aircraft`, `assigned`, `programmes`) | Any authenticated company user on a premium/unlimited plan. The Flylogs NEO interface shows maintenance sections to `user_group_id <= 170` and `>= 250` |
| Manage (`edit`, `delete`, `reorder`) | `user_group_id` in **1, 100, 105, 110, 300** (administrators, managers and mechanics) |

All endpoints are company-scoped: plans, programmes and aircraft are matched against the authenticated user's `company_id`.

## Automatic scheduling

- When a job is created with a `maintenance_plan_id`, it inherits the plan action's template work orders (created with `status = pending`).
- When a plan-linked job is completed (CRS signed), the system looks up the aircraft's plan, takes the **next action in the user-defined order** (wrapping around at the end of the list) and automatically creates its job in the future:
  - `start` is the CRS `expiration` date of the signed job — the date the system expects the next maintenance.
  - If no expiration was given, `start` falls back to the next action's periodicity counted from the signed job's `finish` date.
  - Template work orders of the next action are copied with `status = pending`.
  - The creation is idempotent: if an open job already exists for the next plan action, nothing is created.
- Plan-linked jobs are created with `repeat = NEVER`; the plan cycle replaces the standalone recurring-job clone.

With this in place, the only manual step left in a plan-driven maintenance cycle is the CRS signature by the engineer.

## List Plan Actions

<mark style="color:green;">`POST`</mark> `/maintenance/plans/index.json`

Returns all plan actions of the company, ordered by `sort_order`.

#### Request Body (optional filters)

| Parameter | Type | Description |
|-----------|------|-------------|
| aircraft | number | Only actions linked to this aircraft ID |

#### Response

```json
{
  "plans": [
    {
      "MaintenancePlan": {
        "id": "a1b2c3d4-e5f6-7890-abcd-ef1234567890",
        "company_id": "c1d2e3f4-a5b6-7890-abcd-ef1234567890",
        "user_id": "123",
        "name": "50h Inspection",
        "description": "Standard 50 hour check",
        "hours_interval": "50.00",
        "landings_interval": null,
        "repeat": "NEVER",
        "maintenance_programme_id": "e9f8a7b6-c5d4-3210-fedc-ba9876543210",
        "sort_order": "1",
        "created": "1778485469",
        "modified": "1778485469"
      },
      "Aircraft": [
        { "id": "45", "registration": "EC-ABC" }
      ],
      "MaintenanceProgramme": {
        "id": "e9f8a7b6-c5d4-3210-fedc-ba9876543210",
        "name": "C172 Programme",
        "sort_order": "1"
      },
      "PlanWorkOrder": [
        {
          "id": "b2c3d4e5-f6a7-8901-bcde-f12345678901",
          "maintenance_plan_id": "a1b2c3d4-e5f6-7890-abcd-ef1234567890",
          "name": "Oil change",
          "description": "Drain and refill engine oil",
          "ata": "79",
          "time": "1.50",
          "sort_order": "1"
        }
      ]
    }
  ]
}
```

`MaintenanceProgramme` is `null` when the plan action is not grouped under any programme.

---

## View Plan Action

<mark style="color:blue;">`GET`</mark> `/maintenance/plans/view/{id}.json`

Returns a single plan action with linked aircraft and template work orders.

---

## Create / Edit Plan Action

<mark style="color:green;">`POST`</mark> `/maintenance/plans/edit.json`

Creates a plan action, or edits it when `data[MaintenancePlan][id]` is sent. Restricted to manager groups (see access control above).

#### Request Body

| Parameter | Type | Description |
|-----------|------|-------------|
| data[MaintenancePlan][id] | string | Plan action UUID (edit only) |
| data[MaintenancePlan][name] | string | **Required.** Action title |
| data[MaintenancePlan][description] | string | Description |
| data[MaintenancePlan][hours_interval] | number | Recurrence: every N flight hours |
| data[MaintenancePlan][landings_interval] | number | Recurrence: every N landings |
| data[MaintenancePlan][repeat] | string | Recurrence period: `NEVER`, `DAY`, `WEEK`, `MONTH`, `QUARTER`, `SEMESTER`, `YEAR` |
| data[MaintenancePlan][maintenance_programme_id] | string | **Required** (unless `programme_name` is given). Existing company programme UUID. An invalid or other-company id is treated as empty |
| data[MaintenancePlan][programme_name] | string | Used when `maintenance_programme_id` is empty: creates a new programme with this name (or reuses a same-named company programme) and links the action to it. One of `maintenance_programme_id` / `programme_name` must resolve to a programme, otherwise the save fails with a `maintenance_programme_id` validation error |
| data[Aircraft][Aircraft][] | array | **Optional.** Aircraft IDs the action applies to. Only company aircraft are accepted; the submitted set replaces the previous links. May be empty/omitted to leave the action unassigned |
| data[PlanWorkOrder][n][id] | string | Existing template work order UUID (keep/update) |
| data[PlanWorkOrder][n][name] | string | Template work order name (rows without a name are skipped) |
| data[PlanWorkOrder][n][description] | string | Template work order description |
| data[PlanWorkOrder][n][ata] | string | ATA chapter |
| data[PlanWorkOrder][n][time] | number | Estimated work duration in decimal hours |

Template work orders are synced: submitted rows are saved in the submitted order (`sort_order`), existing rows not submitted are deleted.

#### Response

```json
{
  "result": true,
  "plan": { "MaintenancePlan": { "...": "..." }, "Aircraft": [], "PlanWorkOrder": [] },
  "message": null
}
```

---

## Delete Plan Action

<mark style="color:blue;">`GET`</mark> `/maintenance/plans/delete/{id}.json`

Soft-deletes a plan action. Existing jobs created from it are kept. Restricted to manager groups.

---

## Reorder Plan Actions

<mark style="color:green;">`POST`</mark> `/maintenance/plans/reorder.json`

Persists the drag-and-drop order of the company plan actions. Restricted to manager groups.

#### Request Body

| Parameter | Type | Description |
|-----------|------|-------------|
| order | array | Plan action UUIDs in the desired order |

#### Response

```json
{ "result": true }
```

---

## Plan For Aircraft (suggestions)

<mark style="color:blue;">`GET`</mark> `/maintenance/plans/for_aircraft/{aircraftId}.json`

Returns the ordered plan actions linked to one aircraft, plus the suggested next action. Used by the job creation form to suggest jobs from the plan.

#### Response

```json
{
  "plans": [ { "MaintenancePlan": { "...": "..." }, "PlanWorkOrder": [] } ],
  "next_plan_id": "a1b2c3d4-e5f6-7890-abcd-ef1234567890",
  "open_plan_ids": []
}
```

| Field | Description |
|-------|-------------|
| plans | Plan actions linked to the aircraft, in plan order |
| next_plan_id | Suggested next action: the one after the last completed plan-linked job of this aircraft (wraps around); the first action when no plan job was ever completed |
| open_plan_ids | Plan actions that already have an open (not completed) job for this aircraft |

---

## Assigned Plan Actions (lightweight)

<mark style="color:blue;">`GET`</mark> `/maintenance/plans/assigned/{aircraftId}.json`

Returns a light summary of the plan actions assigned to one aircraft — no jobs or scheduling. Used by the aircraft view page to show whether the aircraft is covered by the maintenance programme and to group its actions by programme name.

#### Response

```json
{
  "count": 2,
  "plans": [
    {
      "id": "a1b2c3d4-e5f6-7890-abcd-ef1234567890",
      "name": "50h Inspection",
      "hours_interval": "50.00",
      "landings_interval": null,
      "repeat": "NEVER",
      "maintenance_programme_id": "e9f8a7b6-c5d4-3210-fedc-ba9876543210",
      "programme_name": "C172 Programme"
    }
  ]
}
```

| Field | Description |
|-------|-------------|
| count | Number of plan actions assigned to the aircraft |
| plans[].maintenance_programme_id | Parent programme UUID, or `null` when the action is not grouped |
| plans[].programme_name | Parent programme name, or `null` |

---

## List Maintenance Programmes

<mark style="color:blue;">`GET`</mark> `/maintenance/plans/programmes.json`

Returns the company's named maintenance programmes (parent groups), ordered by `sort_order` then name. Used to populate the programme selector in the plan-action form.

#### Response

```json
{
  "programmes": [
    { "id": "e9f8a7b6-c5d4-3210-fedc-ba9876543210", "name": "C172 Programme", "plan_count": 4 }
  ]
}
```

| Field | Description |
|-------|-------------|
| programmes[].plan_count | Number of plan actions currently grouped under the programme |

Programmes are created implicitly through the plan-action `edit` endpoint (`programme_name`); there is no standalone create endpoint. A programme with no plan actions is still returned until soft-deleted.

---

## Job creation from a plan action

`POST /maintenance/jobs/create.json` accepts an optional `data[Job][maintenance_plan_id]`. The plan action must belong to the company **and** be linked to the job's aircraft, otherwise a 404 is returned. On success the plan action's template work orders are copied into the new job with `status = pending`.
