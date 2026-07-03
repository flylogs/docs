---
description: Activate the Flylogs API, manage API keys and the IP whitelist
---

# API

The API tab controls programmatic access to your company data through the [Flylogs REST API](../../API/description.md) — flights, aircraft, pilots, schedules and more — so you can integrate Flylogs with your website, dashboards, accounting or any third-party tool.

### Activating API access

API access is an optional service that must be activated once per company:

| Plan | API access |
| --- | --- |
| Free | Not available — upgrade to a paid plan first |
| Club / Premium | **€390 per year**, paid online from this tab |
| Unlimited | **Included free** — activated instantly with one click |

On Club and Premium plans, clicking **Activate & pay** takes you to a secure checkout. As soon as the payment succeeds, API access is enabled instantly — no waiting for support.

{% hint style="warning" %}
The €390 fee is **recurring**: it is added to your subscription fee on every yearly renewal — including the next one, even if it is less than a year away — and stays added until you deactivate API access.
{% endhint %}

Once activated, the tab shows the IP whitelist and the API keys manager.

### IP whitelist

A list of IP addresses that are trusted for API access. It plays two roles:

* Third-party integrations that log in with a dedicated API user account (flight simulators, crew management tools, etc.) are **only accepted from whitelisted addresses** — a login from any other IP is rejected.
* Logins from whitelisted addresses skip the two-factor authentication challenge, which machines cannot answer.

Add one entry per address with **Add IP address**. Keep the list short and current: remove addresses you no longer use.

### API keys

API keys are long-lived credentials for server-to-server integrations, an alternative to session tokens that never requires an interactive login. See [API Authentication](../../API/authentication.md) for how to use them in requests.

* Each key **acts as the user who created it** and inherits that user's permissions — a key created by a read-only user cannot write.
* Keys look like `flk_…` and are sent as a `Bearer` token in the `Authorization` header.
* The plaintext key is shown **only once**, at creation. Copy it immediately; afterwards only a prefix is displayed.
* An optional **expiry date** disables the key automatically at the end of that day. *Never* keeps it valid until revoked.
* The list shows when each key was **last used**, so stale keys are easy to spot.
* **Revoke** disables a key immediately and permanently; any integration using it stops working at once.

{% hint style="info" %}
Create one key per integration and name it after the system that uses it (e.g. "Ops dashboard"). That way you can revoke a single integration without breaking the others.
{% endhint %}
