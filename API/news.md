# News

## List News

<mark style="color:blue;">`GET`</mark> `/news.json`

<mark style="color:blue;">`GET`</mark> `/news/news/index/{base_id}.json`

Retrieve company news articles. Paginated (10 per page).

When the request is authenticated, results are scoped to the user's company and filtered by recipient `user_group_id` (for users with `user_group_id > 105`) and the optional `base_id` segment. Without authentication, only the public Flylogs feed is returned and full `entry` content is included.

#### Path Parameters

| Parameter | Type | Description |
|-----------|------|-------------|
| base_id | string | Optional. Restrict to news for a specific base (or no base assigned) |

#### Response

```json
{
  "news": [
    {
      "News": {
        "id": "50",
        "slug": "winter-operations-update",
        "name": "Winter Operations Update",
        "category": "Operations",
        "view_count": "42",
        "sign": true,
        "created": "2025-03-01 10:00:00"
      },
      "NewsSignature": [
        { "id": "9", "user_id": "100", "news_id": "50" }
      ]
    }
  ],
  "pagination": {
    "page": 1,
    "current": 1,
    "count": 23,
    "prevPage": false,
    "nextPage": true,
    "pageCount": 3,
    "limit": 10
  }
}
```

| Field | Type | Description |
|-------|------|-------------|
| slug | string | URL-friendly identifier |
| sign | boolean | Whether read-acknowledgment is required |
| NewsSignature | array | Signature record from the authenticated user (empty if not signed) |
| pagination | object | Standard CakePHP pagination block |

---

## View News Article

<mark style="color:blue;">`GET`</mark> `/news/news/view/{slug}.json`

Retrieve a single news article by its slug. Behaviour depends on the viewer:

- **Manager** (`user_group_id <= 135`): full `NewsRecipient` group list and `NewsRecipientUsers` total user count are included. The `view_count` is **not** incremented.
- **Regular user** (`user_group_id > 135`): only their own `NewsSignature` is included. `view_count` is incremented on each view.
- **Unauthenticated**: only the public Flylogs feed is returned.

#### Path Parameters

| Parameter | Type | Description |
|-----------|------|-------------|
| slug | string | Article slug |

#### Response

```json
{
  "post": {
    "News": {
      "id": "50",
      "company_id": "42",
      "user_id": "100",
      "base_id": "0",
      "slug": "winter-operations-update",
      "category": "Operations",
      "view_count": "43",
      "sign": true,
      "notification": "1",
      "name": "Winter Operations Update",
      "entry": "<p>Important information about winter ops procedures...</p>",
      "created": "2025-03-01 10:00:00",
      "modified": "2025-03-01 10:00:00"
    },
    "NewsSignature": {
      "100": "John Doe",
      "101": "Jane Smith"
    },
    "NewsRecipient": ["110", "120"],
    "NewsRecipientUsers": 42
  }
}
```

`NewsSignature` is keyed by `user_id` → user fullname. `NewsRecipient` and `NewsRecipientUsers` are only present for managers.

Returns `404` if the slug is unknown or the article does not belong to the viewer's company.

---

## Create / Edit News

<mark style="color:green;">`POST`</mark> `/manager/news/news/edit.json`

Create or update a news article. Admin access required.

#### Request Body

```json
{
  "News": {
    "id": "50",
    "name": "Winter Operations Update",
    "entry": "<p>Updated content...</p>",
    "category": "Operations",
    "sign": true,
    "notification": "1",
    "base_id": "0",
    "created": "2025-03-01",
    "time": " 10:00:00"
  },
  "NewsRecipient": {
    "user_group_id": ["110", "120"]
  }
}
```

- Omit `News.id` to create a new article.
- `notification` is normalised: any value other than `'0'` / `'false'` / empty becomes `'1'`. Empty/falsy values are stripped from the payload.
- `News.time`, when present, is appended to `News.created`.
- `NewsRecipient.user_group_id[]` replaces the recipient set on every save; existing recipients are deleted first.
- `company_id` and `user_id` are forced to the authenticated user's session.

#### Response

```json
{
  "result": true,
  "message": "News article saved",
  "errors": []
}
```

On validation failure: `result = false`, `errors` contains the model validation errors.

---

## Delete News

<mark style="color:green;">`POST`</mark> `/manager/news/news/delete/{id}.json`

Delete a news article. Admin access required.

#### Path Parameters

| Parameter | Type | Description |
|-----------|------|-------------|
| id | string | News article ID |

#### Response

```json
{
  "result": true,
  "message": "News deleted"
}
```

---

## Sign News Article

<mark style="color:green;">`POST`</mark> `/news/news/sign/{id}.json`

Acknowledge a news article that has `sign = true`. Re-authenticates the user with their password before saving the signature.

#### Path Parameters

| Parameter | Type | Description |
|-----------|------|-------------|
| id | string | News article ID |

#### Request Body

| Field | Type | Required | Description |
|-------|------|----------|-------------|
| password | string | Yes | The signing user's account password (verified against their stored credential) |

#### Response

```json
{
  "result": true
}
```

#### Errors

| Status | Cause |
|--------|-------|
| 400 | Not a POST, missing/empty password, or password does not match |
| 404 | Article not found in the user's company |
