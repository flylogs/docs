---
description: Automatic flight imports from Airbly and Fleet Manager (formerly Spidertracks)
---

# Integrations

The Integrations tab connects Flylogs to your aircraft tracking hardware so flights are imported automatically instead of typed by hand. Two integrations are available: **Airbly** and **Fleet Manager** (formerly Spidertracks).

Both integrations are **one-way**: Flylogs only reads data from the tracking service. Nothing is ever sent from Flylogs back to it.

{% hint style="info" %}
Integrations are available only on the **Premium** and **Unlimited** plans. On the Free and Club plans the tab shows an upgrade notice instead of the settings, and the import does not run even if a key was set on a previous plan.
{% endhint %}

Only a company **manager** can connect or disconnect an integration — the Company Settings page is restricted to manager-level user types.

## How the imports work

Both integrations follow the same rules:

* Once connected and enabled, Flylogs checks the service **every 15 minutes** and imports any new completed flights.
* Each flight is imported **once** — re-running never creates duplicates, even if the service updates a flight later.
* Imported flights are saved as **drafts**. They do **not** count toward your logbooks, pilot currency, or aircraft maintenance until a user reviews and confirms them. This gives you a chance to check the data and fill in anything the service does not provide.
* Aircraft are matched by **tail number / registration**. If no aircraft with that registration exists in your company, Flylogs **creates one automatically** from the make and model reported by the service.

The **Synchronization** panel shows the time of the last sync (in your company time zone and format) and a short summary of the last run.

{% hint style="warning" %}
Auto-created aircraft start with no maintenance program and no Hobbs/Tach configuration. After the first import from a new aircraft, open it in **Aircraft** and set up its maintenance counters before confirming its flights.
{% endhint %}

### Reviewing imported flights

Imported flights appear in your **Flights** list as drafts. Open each one, check the details, set the pilot and flight type if needed, and confirm it into the logbooks. Only then does it count toward currency and maintenance.

## Airbly

[Airbly](https://airbly.com) is a panel-mounted aircraft monitor that automatically records each flight your aircraft makes. If your company uses Airbly, Flylogs can pull those flight logs straight into your account, so flights show up without anyone typing them in.

### Connecting your Airbly account

1. Log in to your Airbly web app and copy your **group key** from your Group settings. This is a read-only key that lets Flylogs read your assets and flight logs.
2. In Flylogs, open **Company Settings → Integrations**.
3. Paste the key into **Airbly group key**.
4. Turn on **Enable Airbly import**.

That's it. Flylogs stores your key **encrypted** and never shows it again — the field displays dots once a key is saved. To replace it, just paste a new key over the dots; leaving the dots untouched keeps the existing key.

The **Connection** indicator shows whether a key is currently stored.

### What gets imported from Airbly

| Flight field | From Airbly |
| --- | --- |
| Aircraft | Matched by tail number (registration) |
| Date, take-off and landing times | Flight start/stop times |
| Departure and arrival airports | Airbly route |
| Flight time | Airbly usage |
| Landings | Airbly usage |
| Pilot in command | Matched to a Flylogs user (see below) |

Hobbs and Tach readings are not provided by Airbly, so those fields stay empty on imported flights. Auto-created aircraft also take their serial number from Airbly.

#### Pilot matching

If the Airbly flight includes a crew member, Flylogs tries to match them to a user in your company — first by **email**, then by **full name**. When no match is found, the flight is still imported, just with the pilot field left blank for you to fill in during review.

### Disconnecting Airbly

To stop importing, turn off **Enable Airbly import**. Your stored key remains so you can re-enable it later; to remove the key entirely, paste a blank value over the dots and save.

## Fleet Manager (formerly Spidertracks)

[Fleet Manager](https://spidertracks.com), formerly **Spidertracks**, is an aircraft tracking system (Spider devices and the Aviator app) that records each flight your aircraft makes. If your organisation uses Fleet Manager, Flylogs can pull those flight logs straight into your account.

### Connecting your Fleet Manager account

Fleet Manager uses a secure **OAuth** sign-in — you never paste a key or token into Flylogs. You simply authorise Flylogs from your own Fleet Manager login.

1. In Flylogs, open **Company Settings → Integrations** and find the **Fleet Manager** section.
2. Click **Connect Fleet Manager**. You are sent to Fleet Manager to sign in.
3. Sign in and choose the organisation you want to connect, then approve the access request.
4. Fleet Manager sends you back to Flylogs. The **Account** indicator now shows **Connected**.

You can also start the connection from the Fleet Manager integration centre — in that case Fleet Manager sends you to Flylogs to sign in and approve, and back again when it is done.

Flylogs stores the access it was granted **encrypted** and refreshes it automatically.

{% hint style="info" %}
Each Fleet Manager connection is scoped to a **single organisation**. If you operate more than one Fleet Manager organisation, connect from the one whose flights you want in this Flylogs company.
{% endhint %}

### What gets imported from Fleet Manager

| Flight field | From Fleet Manager |
| --- | --- |
| Aircraft | Matched by tail number (registration) |
| Date, take-off and landing times | Flight departure/arrival times |
| Departure and arrival airports | Fleet Manager route, when available |
| Flight time | Departure → arrival, or the reported duration |
| Track points | Stored on the flight for map replay |

Hobbs and Tach readings are not provided by Fleet Manager, so those fields stay empty on imported flights. Crew is left blank for you to set during review.

### Disconnecting Fleet Manager

Either turn off **Enable Fleet Manager import** (keeps the connection so you can re-enable it) or click **Disconnect** (revokes the stored access entirely; you will need to reconnect via Fleet Manager to use it again).
