# Offline flight data

Flylogs lets you create and edit flights even when your device has no internet connection. The flight is stored locally in the browser, you keep working as if nothing changed, and the record syncs to the server automatically as soon as you are back online.

> **Why this matters:** flights are often logged immediately after engine shutdown, on a ramp, in a hangar, in a remote airfield or in an aircraft cabin where Wi-Fi and mobile data are unreliable. Offline support means your crews never have to wait for a signal to capture flight data.

## How it works

When you save a flight while offline, Flylogs:

1. Stores the full flight record in your browser using local IndexedDB storage.
2. Sends you straight to the flight view page so the data is there for you to inspect, just like a normal flight.
3. Shows an orange banner at the top of the flight view explaining that the flight has not yet been synchronised with Flylogs.
4. Queues the flight in a local outbox.
5. When your device comes back online, automatically posts the flight to the Flylogs server and replaces the local copy with the real, server-issued record.

You do not need to press anything to trigger the sync. It happens in the background the moment a connection is detected.

![Offline saved flight notice on the flight view](https://tawk.link/61f94bae9bd1f31184da67e3/kb/attachments/_placeholder_offline_banner.png)

## The 48-hour storage window

Locally stored flights are kept for **48 hours** on your device. After that window the local copy is discarded automatically.

> **Don't let the window run out.** If you save a flight offline, make sure the device returns online at some point within the next 48 hours — even briefly — so the flight can sync. If the window expires before that, the locally stored data is lost.

## Creating a flight offline

The flight log form works normally without a connection. You can fill every field, select aircraft, PIC and SIC, enter times, route, remarks and so on. When you press **Save**:

- If your device is online, the flight is saved on the server immediately, as usual.
- If your device is offline, the flight is saved locally and the orange "Stored locally — not yet synced with Flylogs" banner appears on the view page.

The aircraft list, pilot list and flight type list are cached on your device the first time they are loaded online, so they remain available in the form when you go offline.

### What is not available while offline

A few sections of the form depend on live server data and are not available without a connection. In the flight log form a small notice replaces them while you are offline:

- **Training missions** — the list of missions associated with a pilot and training programme cannot be loaded without a connection. Add or edit missions once you are back online.

On the flight view page, the following sections are also hidden for locally-stored flights until the flight has been synced:

- **METAR weather reports**
- **ADS-B track and map**
- **Flight documents (attachments)**
- **Safety reports linked to the flight**

These will appear as soon as the flight has been synchronised and reloaded online.

## Editing a flight that is still pending sync

A flight that has been saved offline but has not yet been synced can be edited just like any other flight, both offline and online. Open the flight from the flight list (it will be in the **Pending Sync** group) and press **Edit**.

- If you edit it **offline**, your changes overwrite the local copy and remain queued for sync.
- If you edit it **online**, Flylogs first persists your changes locally, then attempts to send them to the server immediately. On success the locally stored copy is discarded and you are taken to the real flight record. On failure (server rejection, network drop mid-request) the flight stays in the pending queue and the orange banner remains in place.

## Where to find pending-sync flights

On the **Flights** list page, locally-stored flights that have not yet been synced are grouped under a **Pending Sync** section at the top of the list. The count next to the section header tells you how many flights are waiting to be uploaded.

Each row links to the flight view page, where you can review the data and, if needed, edit the flight before it is sent to the server.

## Reliability notes

- The local copy lives in **this browser, on this device**. It is not shared between devices. If you log a flight offline on a tablet, that flight will only sync when that same tablet comes back online — it will not appear on another laptop until it has been synced to the server.
- Clearing your browser data, switching to a private/incognito window, or wiping the application from the device will delete pending flights before they have a chance to sync.
- A flight that fails to sync because the server rejected it (for example, validation errors) stays in the pending queue and the orange banner remains. Open the flight to review and correct the data.

## Frequently asked questions

**Will the sync happen if I close the browser tab?**
The sync runs in the background while the Flylogs tab is open. If you close the tab, sync will resume the next time you open Flylogs while online, as long as the 48-hour window has not expired.

**Can I log a flight offline before I have ever logged into Flylogs on this device?**
No. The first login must happen online so your profile, company settings, aircraft list and pilot list are cached locally. Once you have logged in at least once on a device, that device can create flights offline.

**Does offline saving affect confirmed flights?**
No. Confirmation and other server-side actions (delete, cancel, confirm with password) require a live connection. While offline you can keep working on drafts and they will sync as drafts when you reconnect — confirmation happens after sync, online, as usual.
