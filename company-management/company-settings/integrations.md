---
description: Automatic flight imports from Airbly and Fleet Manager (formerly Spidertracks)
---

# Integrations

The Integrations tab connects Flylogs to your aircraft tracking hardware so flights are imported automatically instead of typed by hand.

{% hint style="info" %}
Integrations require a **Premium** or **Unlimited** plan. On other plans the tab shows an upgrade notice.
{% endhint %}

Both integrations follow the same philosophy:

* Flights are imported automatically **every 15 minutes**.
* Imported flights arrive as **drafts**, so a manager or the crew reviews and confirms them before they count toward logbooks and maintenance counters.
* The tab shows the connection status, the time of the last synchronization and its result.

### Airbly

Imports flight logs recorded by your [Airbly](https://airbly.com) aircraft monitors.

1. In the Airbly web app, open your **Group settings** and copy the **group key**.
2. Paste it into the **Airbly group key** field. The key is stored encrypted and never shown again; the status box turns to *Connected*.
3. Turn on **Enable Airbly import**.

From then on, new flights detected by your monitors appear as draft flights in Flylogs, matched to the aircraft by registration. See [Airbly Integration](../airbly-integration.md) for a step-by-step guide with screenshots.

### Fleet Manager (formerly Spidertracks)

Imports flight logs from your Fleet Manager organisation trackers.

Unlike Airbly, there is no key to paste — the connection uses OAuth:

1. Click **Connect Fleet Manager**. You are taken to the Fleet Manager consent page to authorize Flylogs against your organisation.
2. After approving, you return to this tab with the account marked *Connected*.
3. Turn on **Enable Fleet Manager import**.

**Disconnect** revokes the link at any time; imports stop until you reconnect. See [Fleet Manager Integration](../spidertracks-integration.md) for details.
