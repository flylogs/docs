# News

## List News

<mark style="color:blue;">`GET`</mark> `/news.json`

Retrieve all company news articles.

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
      "NewsSignature": []
    }
  ]
}
```

| Field | Type | Description |
|-------|------|-------------|
| slug | string | URL-friendly identifier |
| sign | boolean | Whether read-acknowledgment is required |
| NewsSignature | array | List of users who have acknowledged |

---

## View News Article

<mark style="color:blue;">`GET`</mark> `/news/news/view/{slug}.json`

Retrieve a single news article by its slug.

#### Path Parameters

| Parameter | Type | Description |
|-----------|------|-------------|
| slug | string | Article slug |

#### Response

```json
{
  "News": {
    "id": "50",
    "company_id": "42",
    "user_id": "100",
    "base_id": "0",
    "slug": "winter-operations-update",
    "category": "Operations",
    "view_count": "43",
    "sign": true,
    "notification": "all",
    "name": "Winter Operations Update",
    "entry": "<p>Important information about winter ops procedures...</p>",
    "created": "2025-03-01 10:00:00",
    "modified": "2025-03-01 10:00:00"
  }
}
```

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
    "notification": "all",
    "base_id": "0"
  }
}
```

Omit `id` to create a new article.

---

## Delete News

<mark style="color:green;">`POST`</mark> `/manager/news/news/delete/{id}.json`

Delete a news article. Admin access required.

#### Path Parameters

| Parameter | Type | Description |
|-----------|------|-------------|
| id | string | News article ID |
