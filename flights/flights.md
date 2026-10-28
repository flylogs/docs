# Flights

## Admin tier override

**Company Administrators, Operations Managers and Compliance & Safety Managers** can **create, edit, delete and confirm any flight at any time**, regardless of:

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

- **Who:** the viewer is the flight's **PIC** or the user who **created** it.
- **When:**
  - the flight is **unconfirmed** (draft, scheduled, dispatched) and the viewer's role has the `Flight.create` permission, **or**
  - the flight is **CONFIRMED** and no more than **12 hours** have passed since `Flight.offblocks_time`.

The server enforces the same rule on save (`FlightsController::create()` → `FlightEditPolicy`), so nobody else can edit a confirmed flight without `Flight.edit`, the API included.

#### `flights_block_days` (Company Settings → Logbook → Block logbook after)

This setting sets the minimum date for new flights and draft edits. It does **not** affect editing confirmed flights (see the 12-hour rule above).

When `flights_block_days` is set, users cannot create a new flight (or edit an existing draft) with a date older than `today − N days`. The date picker enforces a minimum date and the server rejects out-of-window dates.

Company Administrators, Operations Managers and Compliance & Safety Managers are exempt and can log flights on any past date.

> Note: the SIC and supervisor do **not** get the bypass. Without `Flight.edit` they can only use the **Cancel** action available to crew on draft flights.

## Confirm action — password requirement

When the company setting `require_flight_password` is enabled:

- The confirm modal shows a password field.
- The **Confirm** button is disabled (greyed out) until a password is entered.
- The Enter key shortcut is also blocked while the field is empty.

When `require_flight_password` is disabled the password field is hidden and confirm proceeds without it.
