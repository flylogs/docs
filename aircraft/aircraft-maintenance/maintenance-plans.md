---
description: Set up your approved maintenance programme and let Flylogs schedule it
---

# Maintenance plans

Most operators work with an **approved maintenance plan** for one or several of their aircraft. Instead of creating every maintenance job by hand, you can load that programme into Flylogs once, and the system will suggest and schedule the jobs for you.

A maintenance plan is an **ordered list of plan actions**. Each action is a job template with:

* A **title** and **description**
* The named **programme** it belongs to (required)
* Which **aircraft** of your fleet it applies to — optional, one action can cover several aircraft (or none yet)
* A **recurrence**: every N flight hours, every N landings, and/or a time period (week, month, quarter, semester, year)
* Its own list of **work orders**, created automatically with every job generated from the action

You can still create free-form maintenance jobs with an empty title and any work orders you wish — plans are an addition, not a replacement.

### Who can manage maintenance plans

Maintenance plans follow the same access rules as maintenance jobs:

* The maintenance module requires a **premium** or **unlimited** subscription plan.
* Staff up to user group 170 and the maintenance tier (user groups 250 and above) can **see** maintenance data: jobs, plans, inventory and the aircraft maintenance widget.
* Only **administrators, managers and mechanics** (user groups 1, 100, 105, 110 and 300) can create, edit, reorder or delete plan actions, edit jobs or inventory, [sign or edit the CRS, or sign an inspection](README.md#signing-the-crs).

### Creating plan actions

Open **Aircraft → Maintenance Plan** and press **New plan action**. Choose the **programme** the action belongs to (required — pick an existing one or create a new one), set the title, description and recurrence, and add the custom work orders for this action. Assigning the **aircraft** covered by the action is optional: you can leave it unassigned and link aircraft later.

The list of plan actions is **reorderable by drag and drop**. The order matters: it is the sequence of your maintenance cycle, and it is what Flylogs uses to know which action comes next.

### Grouping actions under a named programme

You can optionally group plan actions under a named **maintenance programme** — for example one programme per aircraft type ("C172 Programme", "PA28 Programme"). In the plan-action form, use the **Programme** selector to pick an existing programme or choose **+ New programme…** and type a name; the programme is created the first time you use it.

Grouping is optional and purely organizational: an action with no programme works exactly as before. On the plan-actions list each action shows its programme as a tag, and the **aircraft view page** groups the aircraft's assigned actions under their programme names so you can see at a glance which programme covers the aircraft.

### Creating jobs from the plan

When you create a new maintenance job and select an aircraft with a plan, Flylogs shows the plan actions for that aircraft and highlights the **next due** one. Picking an action fills in the job title and description and copies all its template work orders into the job.

### Automatic scheduling of the next action

When a plan job is completed and the **CRS is signed**, Flylogs checks the aircraft maintenance plan, finds the next action in your order, and **creates its job in the future automatically**, dated on the day the signed CRS says the next maintenance is expected. The new job arrives with all its work orders ready, and the scheduling agenda of the aircraft is blocked accordingly.

With the plan in place, the only manual step left in your maintenance cycle is the CRS signature by the engineer.
