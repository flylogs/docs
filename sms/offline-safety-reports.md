# Offline safety reports

Flylogs lets you create safety reports even when your device has no internet connection. The report is stored locally in the browser, you keep working as if nothing changed, and it syncs to the server automatically as soon as you are back online — exactly like [offline flight data](../flights/offline-flight-data.md).

> **Why this matters:** safety events are often reported right where they happen — on a ramp, in a hangar, at a remote airfield or in the cabin — where Wi‑Fi and mobile data are unreliable. Offline support means a hazard or occurrence gets captured immediately, while the details are fresh, instead of waiting for a signal.

## How it works

When you save a report while offline, Flylogs:

1. Stores the full report on your device using local IndexedDB storage.
2. Takes you to the Safety Reports list, where the report appears in a **Pending Sync** section at the top.
3. Keeps it queued in a local outbox.
4. When your device comes back online, automatically posts the report to the Flylogs server and removes the local copy.

You do not need to press anything to trigger the sync. It happens in the background the moment a connection is detected — **even if you never return to the Safety section**. If a report is filed offline and you carry on using other parts of the app, it still syncs on its own.

## Getting to the form offline

The **Safety Reports** menu item stays clickable while you are offline, and the **Create Report** button works too. On the Safety Reports list, if you have no cached reports to show, an offline message explains that anything you create now is saved on the device and will sync later.

## What is cached for the form

Everything the create form needs is cached on your device the moment you log in online, so the dropdowns work without a connection:

- Departments and their categories
- Flight types
- Aircraft
- Users (for "involved individuals")

The remaining fields — phase of flight, airspace, aircraft damage, personal injuries and immediate consequences — are fixed lists that are always available.

## Draft or submit, offline too

Both **Save as draft** and **Submit report** work offline. Your choice is remembered with the queued report:

- A report you **submit** offline becomes a filed (open) report — and notifies your safety team — only once it reaches the server on reconnect.
- A report you **save as draft** offline syncs as a private draft, still visible only to you.

See [Create a Safety Report](create-a-safety-report.md) for the difference between the two.

## Attachments need a connection

File attachments are the one part of the form that requires the internet. While you are offline the attachments panel is shown but disabled, with an "unavailable offline" overlay. Add any files once you are back online by opening the synced report and editing it.

## Editing a report that is still pending sync

A report saved offline that has not yet synced can be edited. Open it from the **Pending Sync** section of the Safety Reports list — the form reopens with everything you entered, and saving again re-queues it (or files it, if you are back online).

## The 48-hour storage window

Locally stored reports are kept for **48 hours** on your device. After that window the local copy is discarded automatically.

> **Don't let the window run out.** If you save a report offline, make sure the device returns online at some point within the next 48 hours — even briefly — so the report can sync. If the window expires before that, the locally stored data is lost.

## Where to find pending-sync reports

On the **Safety Reports** list page, reports created offline that have not yet been synced are grouped under a **Pending Sync** section at the top of the list, each with a **Draft** or **Pending Sync** badge. The count next to the section header tells you how many are waiting to be uploaded.
