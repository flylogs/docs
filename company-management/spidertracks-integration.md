---
description: Import flight logs automatically from your Fleet Manager (formerly Spidertracks) organisation
---

# Fleet Manager Integration

[Fleet Manager](https://spidertracks.com), formerly **Spidertracks**, is an aircraft tracking system (Spider devices and the Aviator app) that records each flight your aircraft makes. If your organisation uses Fleet Manager, Flylogs can pull those flight logs straight into your account, so flights show up without anyone typing them in.

The integration is **one-way**: Flylogs only reads data from Fleet Manager. Nothing is ever sent from Flylogs back to Fleet Manager.

## Plan availability

{% hint style="info" %}
The Fleet Manager integration is available only on the **Premium** and **Unlimited** plans.

On the Free and Club plans the **Integrations** tab shows an upgrade notice instead of the settings, and the import does not run.
{% endhint %}

Only a company **manager** can connect or disconnect Fleet Manager. The settings live under **Company Settings → Integrations**, which is restricted to manager-level user types.

## Connecting your Fleet Manager account

Fleet Manager uses a secure **OAuth** sign-in — you never paste a key or token into Flylogs. You simply authorise Flylogs from your own Fleet Manager login.

1. In Flylogs, open **Company Settings → Integrations** and find the **Fleet Manager** section.
2. Click **Connect Fleet Manager**. You are sent to Fleet Manager to sign in.
3. Sign in and choose the organisation you want to connect, then approve the access request.
4. Fleet Manager sends you back to Flylogs. The **Account** indicator now shows **Connected**.

You can also start the connection from the Fleet Manager integration centre — in that case Fleet Manager sends you to Flylogs to sign in and approve, and back again when it is done.

Flylogs stores the access it was granted **encrypted** and refreshes it automatically. To stop the connection at any time, click **Disconnect** — this revokes the stored access and turns the import off. You can reconnect later.

{% hint style="info" %}
Each Fleet Manager connection is scoped to a **single organisation**. If you operate more than one Fleet Manager organisation, connect from the one whose flights you want in this Flylogs company.
{% endhint %}

## How the import works

* Once connected and enabled, Flylogs checks your Fleet Manager organisation **every 15 minutes** and imports any new flights.
* Each Fleet Manager flight is imported **once** — re-running never creates duplicates, even if Fleet Manager updates a flight later.
* Imported flights are saved as **drafts**. They do **not** count toward your logbooks, pilot currency, or aircraft maintenance until a user reviews and confirms them. This gives you a chance to check the data and fill in anything Fleet Manager does not provide.

The **Synchronization** panel on the Integrations tab shows the time of the last sync (in your company time zone and format) and a short summary of the last run.

### What gets imported

For each Fleet Manager flight, Flylogs fills in:

| Flight field | From Fleet Manager |
| --- | --- |
| Aircraft | Matched by tail number (registration) |
| Date, take-off and landing times | Flight departure/arrival times |
| Departure and arrival airports | Fleet Manager route, when available |
| Flight time | Departure → arrival, or the reported duration |
| Track points | Stored on the flight for map replay |

Hobbs and Tach readings are not provided by Fleet Manager, so those fields stay empty on imported flights. Crew is left blank for you to set during review.

### Aircraft matching

Flylogs matches each Fleet Manager aircraft to one of yours by **tail number / registration**. If no aircraft with that registration exists in your company, Flylogs **creates one automatically** from the make and model reported by Fleet Manager.

{% hint style="warning" %}
Auto-created aircraft start with no maintenance program and no Hobbs/Tach configuration. After the first import from a new aircraft, open it in **Aircraft** and set up its maintenance counters before confirming its flights.
{% endhint %}

## Reviewing imported flights

Imported flights appear in your **Flights** list as drafts. Open each one, check the details, set the pilot and flight type if needed, and confirm it into the logbooks. Only then does it count toward currency and maintenance.

## Disconnecting

To stop importing, open **Company Settings → Integrations** and either turn off **Enable Fleet Manager import** (keeps the connection so you can re-enable it) or click **Disconnect** (revokes access entirely; you will need to reconnect via Fleet Manager to use it again).
