# Fixed: overnight duty periods missing from Duty Time reports

**July 2026** · Crew Management

We fixed a bug affecting duty periods that cross midnight — for example a duty starting in the evening and ending after 00:00 the next day.

***

### What was wrong

When a duty period crossed midnight, Flylogs miscalculated its length:

* **Duty Times overview** (**Pilots → Duty times**) — the affected day showed blank instead of the actual duty time, even when the pilot had exceeded the configured daily duty limit. No red highlight appeared.
* **Downloadable duty report (PDF)** — the same day showed a duty time, but the number was wrong (too short, and in some cases roughly the "leftover" time instead of the true duty length). The duty time column was also never highlighted in red, even when the correct value would have exceeded the limit — the PDF only ever flagged flight (block) time and FDP exceedances in red.

Both issues came from the same root cause: the calculation didn't account for the duty period wrapping past midnight, so the two ends of the shift were subtracted as if they fell on the same clock, producing a negative or otherwise incorrect duration.

***

### What's fixed

* The **Duty Times overview** now shows the correct total for overnight duty periods and highlights the day in red when it exceeds your configured daily duty limit.
* The **duty report PDF** — downloaded either from the overview table or from a pilot's own duty widget — now shows the same correct total, and its **Duty time** column is highlighted in red when the daily duty limit is exceeded, matching the block-time and FDP columns.

No configuration changes are needed — this applies automatically to existing and future duty records.

***

See [Duty and Flight time storage](../crew-management/duty-and-flight-time-storage.md) for how duty time limits and the Duty Times overview work.
