---
description: Duty time and flight time limitations, rest requirements and duty records
---

# Duty Limits

The Duty Limits tab encodes your legal flight and duty time limitations. Flylogs uses these values in two ways:

1. **While scheduling** — the schedule editor warns the roster manager when a slot would push a pilot over any limit, and can refuse to save it (see *Block overtime scheduling* below).
2. **In the background** — our servers run daily checks on all logged flight and duty time and send warning messages when a configured limit is exceeded.

{% hint style="info" %}
This tab requires a **Premium** or **Unlimited** plan. On Free and Club plans the settings are hidden.
{% endhint %}

Leave any field empty to disable that particular limit.

### Duty time limits

* **Max duty per day / week / month** — maximum accumulated duty time in each period.
* **Max single flight** — the longest single flight allowed.
* **Commute before / after duty** — a fixed commute time automatically added before the first flight and after the last flight of the day when Flylogs calculates a pilot's duty period.
* **Min rest between flights** — minimum rest required between two consecutive flights.
* **Min rest between duties** — minimum rest required between the end of one duty day and the start of the next.

### Flight time limits

Maximum accumulated **block time** per rolling period: per day, 7 days, 14 days, 28 days, 90 days and 365 days. These mirror the usual EASA/FAA flight time limitation tables — enter the figures from your own operations manual.

### Duty records

* **Auto complete duty** — Flylogs automatically calculates each pilot's flight duty period (FDP) from their logged flights and activities, applying the commute times configured above. If the calculated duty time exceeds *Max duty per day*, the pilot automatically receives a warning message asking them to review and correct the record.
* **Block overtime scheduling** — turns scheduling warnings into hard stops: managers cannot publish schedule slots that would cause a pilot to exceed any duty or flight time limit. With the switch off, the same situations only produce warnings.
* **Require duty records** — asks every crew member to enter their work start/end times each day. Pilots get a duty times widget on their dashboard where they fill in the records; see [Duty and Flight time storage](../../crew-management/duty-and-flight-time-storage.md).
  * **Days allowed to edit duty** — how far back (1 to 7 days) a pilot can still enter or correct their own duty records. Older records can only be changed by managers.
