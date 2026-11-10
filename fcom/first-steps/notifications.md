---
description: How Flylogs alerts crew — push notifications first, WhatsApp as a backup, email for the record.
---

# Notifications: push, WhatsApp and email

Flylogs alerts crew the moment something changes on their flying: a booking is published or cancelled, a flight is logged with them on board, their password is changed.

Every one of these alerts goes out as a **push notification** first. WhatsApp is only a backup: it is sent when the push could not reach any of the person's devices, and only to people who switched WhatsApp on.

***

### How an alert is delivered

1. **Push notification.** Sent to every phone, tablet and browser where the person has push turned on. Tapping it opens the right page in Flylogs (the schedule, the flight).
2. **WhatsApp, only if push reached nothing.** If none of the person's devices received the push — they never turned push on, or they are signed out everywhere — and they have **WhatsApp Notifications** switched on with a verified phone number, the same alert is sent on WhatsApp instead.
3. **Message and email.** Alerts that also land in the Flylogs messaging system (cancellations, for example) stay in the inbox as before, and urgent ones are still emailed. Turning push on does not change your email preferences.

So a pilot with the Flylogs app or browser push turned on gets one push per alert and no WhatsApp message. A pilot without push, who has WhatsApp on, keeps getting WhatsApp exactly as before.

***

### Which alerts go push-first

| Event | Who is alerted | What the push says | Tapping it opens |
| --- | --- | --- | --- |
| A booking is published or changed | PIC, SIC and supervisor of the booking | Status and callsign, aircraft, date and time | The schedule |
| A flight is cancelled | The rest of the crew, supervisor included (not the person cancelling) | *Flight CANCELED*, callsign, aircraft, date and time | The schedule |
| A booking is cancelled from the Schedule Manager | The crew of the booking who have email alerts on | *Flight CANCELED*, callsign, aircraft, date and time | The schedule |
| A flight is logged by someone else with you on board | The other crew members (PIC, SIC, supervisor) | *Flight logged*, callsign and block hours added to your logbook | The flight |
| Your password is changed | You | *Password changed*, with a prompt to reset it if it was not you | Your profile page |

The WhatsApp phone-number check is the only message that is always sent on WhatsApp, because its whole purpose is to verify that number.

For cancellations, crew receive this one detailed push instead of the generic "New message" push the cancellation message used to trigger — the message itself is still in their inbox.

***

### Turning push notifications on

**In the Flylogs app (iPhone, iPad, Android).** The app asks for permission the first time you sign in. Tap **Allow**. If you declined, turn notifications on for Flylogs in your device's **Settings → Notifications**.

**In a browser.** Open your profile page and press **Activate** next to **Push Notifications**, then allow notifications when the browser asks. If it shows **Blocked**, notifications were refused for neo.flylogs.com — allow them again in the browser's site settings.

**On an iPhone or iPad without the app.** Safari only delivers web push to Flylogs once it has been added to the home screen (**Share → Add to Home Screen**, iOS 16.4 or later). Open Flylogs from that icon, then activate push from your profile page. Installing the Flylogs app is simpler.

> Push is turned on **per device**. A pilot who uses Flylogs on a phone and a laptop should turn it on on both.

***

### Signing out and switching company

* **Signing out** stops push notifications on that device. A shared tablet or a crew-room computer stops receiving the previous person's alerts as soon as they sign out.
* **Switching company** moves the device's notifications to the company you switched to. You receive the alerts of the company you are signed into.
* **Signing back in** turns push back on automatically on a device that already allowed notifications — there is no need to activate it again.

***

### WhatsApp notifications

WhatsApp stays available as a backup for crew who do not want to, or cannot, use push.

* Each pilot switches **WhatsApp Notifications** on from their own profile page. Flylogs sends a code to the phone number on the profile to verify it.
* Managers (Chief Pilot and above) can switch it **off** for a pilot from the pilot edit page, but never on — see [Pilot notification preferences](../crew-management/pilot-accounts.md#pilot-notification-preferences).
* A pilot who has push working on any device will normally receive no WhatsApp messages at all, even with WhatsApp switched on.

***

### Good to know

* Alert texts are currently in English, on push and on WhatsApp.
* Push notifications and WhatsApp messages both count towards your company's monthly **instant notifications** quota (see [Account limitations](../company-management/account-limitations.md)). Push is counted per device reached.
