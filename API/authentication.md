---
audience: [developers]
plan: api
---

# Authentication

The Flylogs API authenticates with **API keys**. An API key is a long-lived secret, created by a Company Administrator, that you send on every request. There is **no login step** for API access — you do not exchange an email and password for a token.

```
Authorization: Bearer flk_3pQ8XnX...Zr
```

```bash
curl https://fmc.flylogs.com/v1/users/view.json \
  -H "Authorization: Bearer flk_3pQ8XnX...Zr"
```

A key authenticates **as the user it is bound to** and inherits that user's permissions. It remains valid until it is revoked, or until its optional expiry date passes — it is not affected by inactivity or logout.

It also stops working if the **bound user's account** has expired, been deactivated or deleted — even if the key itself has no expiry date set. A key can only be bound to a company manager, up to and including **Human Resources Manager** (Company Administrator, Operations Manager, Compliance & Safety Manager, Human Resources Manager). Pilots, instructors, students, staff, External Auditors and mechanics can never hold a key, and an existing key stops working if its user is moved to one of those roles.

{% hint style="info" %}
Don't have a key yet? See **[API Keys](api-keys.md)** for how a Company Administrator creates, lists and revokes them under **Company Settings → API**.
{% endhint %}

## Authenticating a request

| | |
|---|---|
| Header | `Authorization: Bearer <api-key>` |
| Key format | Begins with `flk_` |
| Lifetime | Until revoked, or the optional expiry date |
| Permissions | Inherited from the user the key is bound to |

For file-download endpoints that open in a new window (XLS, PDF), the key may also be supplied as a `?token=` query parameter:

```
https://fmc.flylogs.com/v1/safety_reports/index/excel:true?token=<api-key>
```

## Session tokens are not an API credential

The Flylogs apps (web and mobile) sign in with an email and password and receive a **session token**. That token is tied to the kind of device and app that signed in. It is not meant for scripts, and it cannot be used in place of an API key:

* A request carrying a session token from an HTTP library or API tool (curl, Python, Node.js, Postman and similar) is refused with **401**, unless the company has API access.
* A session token presented from a different kind of device than the one that signed in (for example, a token from a Linux browser replayed from Windows) is refused with **401**, unless the company has API access.
* For companies with API access, these requests are still served, and are recorded in the security log.

```json
{
  "code": 401,
  "error": "SESSION_INVALID",
  "message": "This session can only be used from the app or browser that signed in. Automated access needs API access enabled for your company and an API key (Company Settings > API)."
}
```

For any integration, script or automation, enable API access and use an **[API key](api-keys.md)**.

## Error responses

| Status | Meaning |
|--------|---------|
| 401 | API key missing, invalid, expired or revoked, or a session token used from a script or another device ([see above](#session-tokens-are-not-an-api-credential)) |
| 402 | The company has no API access: it is on the Free plan, or the API add-on was never purchased |
| 403 | The bound user lacks permission for this endpoint |
| 429 | Rate limited — reduce request frequency |

```json
{
  "message": "Invalid, expired or revoked API key"
}
```

A **402** is not a problem with your key or your code — the request is correct and the same call starts working as soon as the company's API access is active again:

```json
{
  "code": 402,
  "error": "API_ACCESS_DENIED",
  "message": "API access is not enabled for this company"
}
```

API access is a paid add-on and requires a paid plan. A Company Administrator can enable it under **Company Settings → API**; if the company was downgraded to Free, the entitlement is suspended until it renews. Treat a 402 as "retry later", not as a reason to rotate the key.

{% hint style="info" %}
Branch on the `error` field, never on `message` — wording may change, the code will not. A company that is **switched off** returns `403` with `"error": "ACCOUNT_UNUSABLE"` instead, and paying does not fix that one.
{% endhint %}
