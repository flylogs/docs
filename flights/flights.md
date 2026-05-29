# Flights

## Admin tier override

Users with `user_group_id <= 110` (admin tier) can **create, edit, delete and confirm any flight at any time**, regardless of:

- Company `Flight.create` / `Flight.edit` / `Flight.confirm` permissions
- Draft / confirmed status
- The `flights_block_days` time window
- Whether they are listed as crew on the flight

This bypass applies on the flight list, the flight form (create/edit) and the flight view page.

## Edit permission rules

The **Edit** button on the flight view page is shown when **all** of these are true:

1. The flight is **not** being viewed as a historical change (`isHistoryView == false`).
2. The flight is **not** deleted (`isDeletedFlight == false`).
3. **At least one** of the following:
   - The viewer has the company `Flight.edit` permission, **or**
   - The viewer is allowed by the **self-edit bypass** (see below).

### Self-edit bypass

The bypass lets a crew member or staff user edit a flight even when they do not have the `Flight.edit` company permission.

It applies when **both** conditions hold:

- **Who:** the viewer is the **PIC** of the flight, **or** the viewer's `user_group_id < 200` (i.e. instructors, managers, admins — anyone above pilot/student tier).
- **When:**
  - the flight is a **DRAFT**, **or**
  - the flight is **CONFIRMED** and the current time is within the **`flights_block_days`** window measured from `Flight.landing_time`.

#### `flights_block_days` (Company Settings → Logbook → Block logbook after)

This setting has two effects:

**1. Minimum date for new flights and draft edits**

When `flights_block_days` is set, users cannot create a new flight (or edit an existing draft) with a date older than `today − N days`. The date picker enforces a minimum date and the server rejects out-of-window dates.

Admin tier (`user_group_id <= 110`) is exempt and can log flights on any past date.

**2. Self-edit bypass window for confirmed flights**

| Value | Effect on self-edit bypass for confirmed flights |
|-------|--------------------------------------------------|
| `0` (Disabled) | Bypass **never** allowed for confirmed flights — only `Flight.edit` permission can edit. Drafts are still bypassable. |
| `N > 0` | Bypass allowed for confirmed flights whose landing time is within the last `N` days. After `N` days the flight is locked from self-edit and only `Flight.edit` permission can edit. |

> Note: the SIC alone does **not** get the bypass. They must either be a privileged group (`user_group_id < 200`) or use the **Cancel** action available to crew on draft flights.

## Confirm action — password requirement

When the company setting `require_flight_password` is enabled:

- The confirm modal shows a password field.
- The **Confirm** button is disabled (greyed out) until a password is entered.
- The Enter key shortcut is also blocked while the field is empty.

When `require_flight_password` is disabled the password field is hidden and confirm proceeds without it.
