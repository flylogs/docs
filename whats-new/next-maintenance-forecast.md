# New: Flylogs tells you when the next check is due

**September 2026** · Fleet & Maintenance

Every aircraft now carries an estimate of when its next maintenance will fall due, worked out from its own flying history — and that estimate shows up where you actually plan: the aircraft page, the Schedule Manager calendar, your upcoming flights, and the flight form.

Booked work always wins. If the shop has a job on the calendar, that is what you see. The estimate only fills the gap where nothing is booked yet.

***

### Why we rebuilt it

The aircraft page has predicted a next-maintenance date for a while, and it was wrong often enough that people stopped reading it. The reason turned out to be seasonal.

The old estimate measured how fast an aircraft was flying over a short recent window. Ask it on 1 September, and the window it measured was largely August — the month a flying school does roughly **half** its normal hours. The aircraft looked idle, so the check looked months away, and then it arrived in October with nothing booked.

We backtested the fix against real fleet data: 99 aircraft, 838 forecast dates over five years, each one compared against what actually happened. The old method was off by a median of **25 days**, and **39 days** when asked in September. The new one is off by **14 days**, and **9 days** in September.

We also tried the two obvious clever fixes — sampling the same weeks from previous years, and a statistical simulation for the confidence range — and measured both as *worse* than the simple thing. They are not in the product. What is in the product is a blend of the last 90 days and the last 12 months of flying, which contains exactly one August and therefore handles the quiet season without being told about it.

***

### Where you'll see it

**On the aircraft page**, a card with the predicted date, the check it refers to, and the likely window. If the aircraft has already run past an interval it turns red and says how many hours over it is.

**In the Schedule Manager calendar**, aircraft with nothing booked get a blue all-day marker on their estimated date. It is a suggestion: it overlaps freely, raises no conflict, and will not stop you booking a flight that day. Aircraft that *do* have work booked keep the amber block that blocks the slot, exactly as before — nothing changed for them.

**On your Schedules page**, under your upcoming flights, one line per aircraft you are booked on. So nobody turns up to a flight on an aircraft that is about to go into the shop.

**In the flight form**, under the maintenance hours bar you already use.

Everywhere, a **Scheduled** tag means the shop booked it and an **Estimated** tag means we worked it out. The estimate never blocks anything, anywhere.

***

### The likely window

Alongside the date you get a range — *"Likely between 19 Sep and 29 Oct"*. That range is calibrated against real history rather than assumed: measured out of sample, the true date lands inside it about **8 times out of 10**.

Read the date to plan and the range to judge the plan. A narrow range is a steady aircraft. A wide one means utilisation has been uneven and the check could land noticeably either side.

***

### What it will not do

It does not know about calendar items you have not recorded as a job — the ARC, the annual, life-limited parts. Record them with an expiry date and they are taken into account; leave them out and the hours estimate cannot see them.

And it reports what your data says. If nobody has signed off a check for a long time while the aircraft kept flying, it will tell you the aircraft is overdue. In our own test data that flagged two aircraft whose jobs had simply stopped being recorded — which is worth knowing either way.

It is a planning aid. The authority on when an aircraft is due remains the job card and the CRS.

See [Aircraft maintenance → Next maintenance forecast](../aircraft/aircraft-maintenance/next-maintenance-forecast.md) for the full reference.
