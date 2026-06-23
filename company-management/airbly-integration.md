---
description: Import flight logs automatically from your Airbly aircraft monitors
---

# Airbly Integration

[Airbly](https://airbly.com) is a panel-mounted aircraft monitor that automatically records each flight your aircraft makes. If your company uses Airbly, Flylogs can pull those flight logs straight into your account, so flights show up without anyone typing them in.

The integration is **one-way**: Flylogs only reads data from Airbly. Nothing is ever sent from Flylogs back to Airbly.

## Plan availability

{% hint style="info" %}
The Airbly integration is available only on the **Premium** and **Unlimited** plans.

On the Free and Club plans the **Integrations** tab shows an upgrade notice instead of the settings, and the import does not run even if a key was set on a previous plan.
{% endhint %}

Only a company **manager** can connect or disconnect Airbly. The settings live under **Company Settings → Integrations**, which is restricted to manager-level user types.

## Connecting your Airbly account

1. Log in to your Airbly web app and copy your **group key** from your Group settings. This is a read-only key that lets Flylogs read your assets and flight logs.
2. In Flylogs, open **Company Settings → Integrations**.
3. Paste the key into **Airbly group key**.
4. Turn on **Enable Airbly import**.

That's it. Flylogs stores your key **encrypted** and never shows it again — the field displays dots once a key is saved. To replace it, just paste a new key over the dots; leaving the dots untouched keeps the existing key.

The **Connection** indicator shows whether a key is currently stored.

## How the import works

* Flylogs checks your Airbly account **every 15 minutes** and imports any new completed flights.
* Each Airbly flight is imported **once** — re-running never creates duplicates, even if Airbly updates a flight later.
* Imported flights are saved as **drafts**. They do **not** count toward your logbooks, pilot currency, or aircraft maintenance until a user reviews and confirms them. This gives you a chance to check the data and fill in anything Airbly does not provide.

The **Synchronization** panel on the Integrations tab shows the time of the last sync (in your company time zone and format) and a short summary of the last run.

### What gets imported

For each completed Airbly flight, Flylogs fills in:

| Flight field | From Airbly |
| --- | --- |
| Aircraft | Matched by tail number (registration) |
| Date, take-off and landing times | Flight start/stop times |
| Departure and arrival airports | Airbly route |
| Flight time | Airbly usage |
| Landings | Airbly usage |
| Pilot in command | Matched to a Flylogs user (see below) |

Hobbs and Tach readings are not provided by Airbly, so those fields stay empty on imported flights.

### Aircraft matching

Flylogs matches each Airbly aircraft to one of yours by **tail number / registration**. If no aircraft with that registration exists in your company, Flylogs **creates one automatically** from the make, model and serial number reported by Airbly.

{% hint style="warning" %}
Auto-created aircraft start with no maintenance program and no Hobbs/Tach configuration. After the first import from a new aircraft, open it in **Aircraft** and set up its maintenance counters before confirming its flights.
{% endhint %}

### Pilot matching

If the Airbly flight includes a crew member, Flylogs tries to match them to a user in your company — first by **email**, then by **full name**. When no match is found, the flight is still imported, just with the pilot field left blank for you to fill in during review.

## Reviewing imported flights

Imported flights appear in your **Flights** list as drafts. Open each one, check the details, set the pilot and flight type if needed, and confirm it into the logbooks. Only then does it count toward currency and maintenance.

## Disconnecting

To stop importing, open **Company Settings → Integrations** and turn off **Enable Airbly import**. Your stored key remains so you can re-enable it later; to remove the key entirely, paste a blank value over the dots and save.
