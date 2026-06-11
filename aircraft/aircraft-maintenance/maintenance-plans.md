---
description: Set up your approved maintenance programme and let Flylogs schedule it
---

# Maintenance plans

Most operators work with an **approved maintenance plan** for one or several of their aircraft. Instead of creating every maintenance job by hand, you can load that programme into Flylogs once, and the system will suggest and schedule the jobs for you.

A maintenance plan is an **ordered list of plan actions**. Each action is a job template with:

* A **title** and **description**
* Which **aircraft** of your fleet it applies to (one action can cover several aircraft)
* A **recurrence**: every N flight hours, every N landings, and/or a time period (week, month, quarter, semester, year)
* Its own list of **work orders**, created automatically with every job generated from the action

You can still create free-form maintenance jobs with an empty title and any work orders you wish — plans are an addition, not a replacement.

### Who can manage maintenance plans

Maintenance plans follow the same access rules as maintenance jobs:

* The maintenance module requires a **premium** or **unlimited** subscription plan.
* Staff up to user group 170 and the maintenance tier (user groups 250 and above) can **see** maintenance data: jobs, plans, inventory and the aircraft maintenance widget.
* Only **administrators, managers and mechanics** (user groups 1, 100, 105, 110 and 300) can create, edit, reorder or delete plan actions, edit jobs or inventory, [sign or edit the CRS, or sign an inspection](README.md#signing-the-crs).

### Creating plan actions

Open **Aircraft → Maintenance Plan** and press **New plan action**. Select the aircraft covered by the action, set the title, description and recurrence, and add the custom work orders for this action.

The list of plan actions is **reorderable by drag and drop**. The order matters: it is the sequence of your maintenance cycle, and it is what Flylogs uses to know which action comes next.

### Creating jobs from the plan

When you create a new maintenance job and select an aircraft with a plan, Flylogs shows the plan actions for that aircraft and highlights the **next due** one. Picking an action fills in the job title and description and copies all its template work orders into the job.

### Automatic scheduling of the next action

When a plan job is completed and the **CRS is signed**, Flylogs checks the aircraft maintenance plan, finds the next action in your order, and **creates its job in the future automatically**, dated on the day the signed CRS says the next maintenance is expected. The new job arrives with all its work orders ready, and the scheduling agenda of the aircraft is blocked accordingly.

With the plan in place, the only manual step left in your maintenance cycle is the CRS signature by the engineer.
