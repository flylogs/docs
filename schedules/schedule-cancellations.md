# Schedule cancellations

Flight cancellations are something we can not avoid. The important thing about them, is to keep a good track to analyze the factors and avoid the unnecessary events due to a lack of information about our own operations.

Flylogs is all about empowering you, the company manager, by giving you access to all the information in an easy to access and understand format.



Each scheduled flight, if confirmed by the pilots, is due to happen. A scheduled flight that is never dispatched or logged is treated as **not flown**. Once the company's *not-flown grace window* passes after the scheduled end time, Flylogs automatically cancels the booking, attributes the cancellation to the **PIC**, and records the reason **"Not flown"**. These appear in the Schedule cancellation analytics alongside manual cancellations. In the flight's history the action is shown as performed by **Flylogs Autopilot** (the system), while the count still goes against the PIC. The auto-cancellation is silent — no notification is sent. Logging the flight (even without dispatching it from the schedule) prevents it. The grace window is set per company under **Company settings → Schedule → Schedule cancellations**, and can be disabled.

The PIC, SIC or supervisor can cancel their own booking manually, right up until the company's *Dispatch cancel limit* (Company settings → Schedule → Schedule cancellations) is reached — inside that window the cancel option is no longer available to them, and they should ask the PIC or a scheduling manager to cancel it instead. Staff with scheduling rights are not subject to this limit and can always cancel any booking from the [Schedule Review page](schedule-review-page.md). Either way, the system asks for a cancellation reason.

![](../.gitbook/assets/cancel-dialog.png)

This information is stored and displayed in the Schedule cancellation analytics page so you can have a better understanding of why your flights are being cancelled.

![](../.gitbook/assets/cancellations-analytics.png)

### "Other reasons", read from the note

{% embed url="https://youtu.be/TkW9ONAMvJY" %}

**Others** used to be one big grey slice, even though the note people write usually says exactly why: *"runway closed"*, *"instructor not available"*, *"I have a work trip"*, *"booked twice by mistake"*. Flylogs now reads those notes and shows them in the charts as their real reason, marked **(from notes)** — for example *Weather (from notes)* or *Instructor unavailable (from notes)*. In the cancellation log, an *Others* row shows the reason its note points to next to it.

Three reasons appear only this way, because nobody can choose them in the cancel dialog: **Personal**, **Instructor unavailable** and **Booking admin / error**.

<figure><img src="../.gitbook/assets/ai-cancellations-chart.png" alt=""><figcaption><p>"Others" split into the reasons its notes point to.</p></figcaption></figure>

<figure><img src="../.gitbook/assets/ai-cancellations-log.png" alt=""><figcaption><p>In the log, each Others row shows the reason read from its note.</p></figcaption></figure>

This is an automated reading: the reason the person chose is never changed, and a note that does not clearly say why stays under *Others*.


### Repeating bookings

Bookings created with **Repeat weekly** are linked. Cancelling one from the Schedule Manager (status *Canceled*) or deleting it asks whether to apply it to **this booking only** or **this and following**. See [Repeating flights](flight-schedule-records.md#repeating-flights).
