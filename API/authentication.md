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

It also stops working if the **bound user's account** has expired, been deactivated or deleted — even if the key itself has no expiry date set. Note that External Auditor accounts never have an API key in the first place — only company managers can have one, always bound to their own account.

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
https://fmc.flylogs.com/v1/safety_reports/view/150/pdf:true?token=<api-key>
```

## Error responses

| Status | Meaning |
|--------|---------|
| 401 | API key missing, invalid, expired or revoked |
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
