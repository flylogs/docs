# Next maintenance forecast

Flylogs estimates when each aircraft's next check will fall due, from its own flying history, and shows that estimate wherever the aircraft is about to be used.

The rule is the same everywhere:

* If the shop has **already booked** the work — an open maintenance job with a date — Flylogs shows that date, tagged **Scheduled**.
* If **nothing is booked**, Flylogs shows its own estimate, tagged **Estimated**.

An estimate is a suggestion, never a commitment. It never blocks a booking, never creates a conflict, and never stops a flight being saved.

### Where you see it

**Aircraft page.** A card under the aircraft header with the predicted date, the job it refers to, and the likely window it will fall in. If the aircraft has already run past an interval the card turns red and reports how many hours it is over.

**Schedule Manager calendar.** Aircraft with no maintenance booked get a blue all‑day marker on their estimated date. It is a suggestion: you can book flights on that day exactly as before, and the marker will not raise a conflict. Aircraft that already have a job booked keep the amber block they have always had — nothing changes for them.

**Schedules page.** Under your upcoming flights, one line per aircraft you are booked on, so nobody turns up to a flight on an aircraft that is about to go into the shop.

**Flight form.** Below the maintenance hours bar, alongside the remaining‑hours gauge.

### How the estimate is calculated

Flylogs takes the interval recorded when the last check of that type was signed off (the airframe reading at the time, plus the validity interval), and works out how long the remaining hours will take to fly.

The utilisation rate blends the **last 90 days** and the **last 12 months** of flying, counting every calendar day — including days the aircraft did not fly, because grounded days are part of how long an interval really takes to burn.

Blending the two windows is what makes the estimate survive a quiet season. A school that barely flies in August would, on a short window alone, look like it needs no maintenance until winter. The 12‑month half of the blend always contains one August, so the quiet month is accounted for rather than mistaken for the new normal.

The estimate also takes the **earliest** of everything that can fall due — airframe hours, landings, and any calendar expiry recorded on the job — so a check that comes due on landings before it comes due on hours is the one you are shown.

### The likely window

Alongside the date, Flylogs shows a range, e.g. *Likely between 19 Sep and 29 Oct*. That range is calibrated against the company's own history rather than assumed: measured across several years of real fleet data, the true date falls inside the range roughly **8 times out of 10**.

Use the date to plan, and the range to judge how firm that plan is. A narrow range means a steady, predictable aircraft; a wide one means utilisation has been uneven and the check could land noticeably earlier or later.

### What it does not know

* **Calendar‑only items** that are not recorded on a maintenance job — the ARC, the annual, life‑limited parts — are not part of the hours estimate and can fall earlier. Record them as a job with an expiry date and they will be taken into account.
* **A stale record.** If nobody has signed off a check for a long time while the aircraft kept flying, Flylogs reports the aircraft as overdue, because that is what the data says. That is usually a sign the jobs stopped being recorded rather than that the aircraft is unairworthy — but it is worth checking either way.
* **Long‑life items without a maintenance plan.** If an engine TBO or hot‑section is recorded as an ordinary job with no [maintenance plan](maintenance-plans.md) attached, a later routine sign‑off supersedes it, and it will not be offered as the next due item until the routine check passes it. Attaching those items to a maintenance plan keeps them tracked as their own cycle.

Nothing here replaces your approved maintenance programme. It is a planning aid: the authority on when an aircraft is due remains the job card and the CRS.

### Who can see it

The forecast needs a **Club**, **Premium** or **Unlimited** subscription, like the rest of the maintenance section.

Within that, it follows the visibility of the page it appears on: the aircraft page and the flight form show it to any user who can see the aircraft's maintenance information (`user_group_id` 170 or lower, or 250 and above), the Schedules page shows it for the aircraft you are personally booked on, and the blue calendar markers appear on the Schedule Manager page, which is limited to schedule managers.
