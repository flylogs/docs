# New: crew alerts arrive as push notifications first

**October 2026** · Notifications

Booking, cancellation and logbook alerts now go out as a push notification first, with the full detail in the notification itself. WhatsApp becomes a backup: it is only sent when the push could not reach any of the person's devices.

***

### Why we built it

WhatsApp alerts had to fit a small set of fixed message templates, and a push notification announcing a schedule change only said "New schedule available" — you had to open Flylogs to find out what changed. Some alerts, like a flight logged with you on board, only existed on WhatsApp, so crew without WhatsApp never saw them at all.

Push notifications can say exactly what happened, open the right page when tapped, and reach the app and the browser alike.

***

### What changes

* **Detailed push notifications.** *"Flight CANCELED: EC-ABC 1 — EC-ABC C172 · 12 Oct 2026 09:30"* instead of a generic "New message". Tapping it opens the schedule or the flight.
* **WhatsApp only when push did not get through.** A pilot with push working on any device receives the push and no WhatsApp message. A pilot without push, who has WhatsApp switched on, keeps receiving WhatsApp as before.
* **One alert per cancellation.** Crew get one detailed push for a cancellation instead of a generic "new message" push on top of it. The cancellation message still lands in their inbox, and urgent emails are unchanged.
* **New alerts on push.** A flight logged by someone else with you on board, and a password change on your account, now also arrive as push notifications. The supervisor of a cancelled flight is now alerted too.
* **Signing out stops the alerts on that device.** A shared tablet or crew-room computer no longer receives the previous person's notifications after they sign out, and switching company moves your notifications to the company you are signed into.

***

### Which alerts go push-first

| Event | Who is alerted | What the push says | Tapping it opens |
| --- | --- | --- | --- |
| A booking is published or changed | PIC, SIC and supervisor of the booking | Status and callsign, aircraft, date and time | The schedule |
| A flight is cancelled | The rest of the crew, supervisor included (not the person cancelling) | *Flight CANCELED*, callsign, aircraft, date and time | The schedule |
| A booking is cancelled from the Schedule Manager | The crew of the booking who have email alerts on | *Flight CANCELED*, callsign, aircraft, date and time | The schedule |
| A flight is logged by someone else with you on board | The other crew members (PIC, SIC, supervisor) | *Flight logged*, callsign and block hours added to your logbook | The flight |
| Your password is changed | You | *Password changed*, with a prompt to reset it if it was not you | Your profile page |

***

### What you need to do

Nothing is required — every existing preference keeps working. To get the most out of it, ask your crew to turn push on:

* **Flylogs app:** tap **Allow** when the app asks after sign-in.
* **Browser:** profile page → **Push Notifications** → **Activate**.
* **iPhone without the app:** add Flylogs to the home screen first (**Share → Add to Home Screen**), then activate push from there.

See [Notifications: push, WhatsApp and email](../first-steps/notifications.md) for the full reference.
