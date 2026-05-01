# Uploads

Manages file attachments within the app. Files are stored in AWS S3 under `/files/{company_id}/{model}/{filename}`. Photo uploads also generate a thumbnail prefixed with `t_`.

---

## List Uploads

<mark style="color:blue;">`GET`</mark> `/uploads/index/{model}/{foreignKey}.json`

List active uploads for a given model record. Scoped to the authenticated user's company. Results are paginated.

#### Path Parameters

| Parameter | Type | Description |
|-----------|------|-------------|
| model | string | Model name (e.g. `Aircraft`, `Flight`) |
| foreignKey | string | ID of the related record |

#### Pagination Headers

| Header | Description |
|--------|-------------|
| X-Total-Posts | Total number of uploads |
| X-Actual-Page | Current page |
| X-Paging-recs | Records on current page |
| X-Paging-limit | Page size limit (default 50) |
| X-Paging-Prev-Page | Whether a previous page exists |
| X-Paging-Next-Page | Whether a next page exists |
| X-Number-Pages | Total number of pages |

#### Response

```json
{
  "uploads": [
    {
      "id": "abc123",
      "user_id": "100",
      "filename": "preflight-photo.jpg",
      "type": "photo",
      "mime": "image/jpeg",
      "company_id": "42",
      "model": "Flight",
      "size": "204800",
      "width": "1920",
      "height": "1080",
      "active": true,
      "expiration": null
    }
  ]
}
```

---

## View Upload

<mark style="color:blue;">`GET`</mark> `/uploads/view/{id}.json`

Retrieve full details of a single upload, including EXIF data if available.

#### Path Parameters

| Parameter | Type | Description |
|-----------|------|-------------|
| id | string | Upload UUID |

#### Response

```json
{
  "upload": {
    "id": "abc123",
    "user_id": "100",
    "company_id": "42",
    "foreign_key": "500",
    "type": "photo",
    "model": "Flight",
    "mime": "image/jpeg",
    "size": "204800",
    "active": true,
    "filename": "preflight-photo.jpg",
    "exif": { "Make": "Apple", "Model": "iPhone 15" },
    "expiration": null,
    "width": "1920",
    "height": "1080",
    "created": "2026-04-01 10:23:00"
  }
}
```

---

## Download Upload

<mark style="color:blue;">`GET`</mark> `/uploads/download/{id}.json`

Redirects to the file's AWS S3 URL for direct download. Scoped to the authenticated user's company.

#### Path Parameters

| Parameter | Type | Description |
|-----------|------|-------------|
| id | string | Upload UUID |

---

## Create Upload

<mark style="color:green;">`POST`</mark> `/uploads/create.json`

Upload a new file. Accepts `multipart/form-data`. File is saved to a temporary location and marked `active: false` until confirmed. If `active`, `model`, and `id` are provided, the upload is confirmed immediately.

#### Supported MIME Types

| Type value | Accepted MIME types |
|------------|---------------------|
| `photo` | image/* |
| `video` | video/* |
| `document` | PDF, Office, etc. |
| `sound` | audio/* |
| `other` | Other allowed types |

#### Request Body (multipart/form-data)

| Field | Type | Required | Description |
|-------|------|----------|-------------|
| file | file | Yes | File to upload |
| active | boolean | No | If `true`, confirm immediately (requires `model` and `id`) |
| model | string | No | Model name to associate (e.g. `Aircraft`) |
| id | string | No | Foreign key of the related record |
| acl | string | No | S3 ACL override |

#### Response

```json
{
  "result": true,
  "file": {
    "id": "abc123",
    "filename": "preflight-photo.jpg",
    "type": "photo",
    "mime": "image/jpeg",
    "size": "204800",
    "active": false,
    "model": null,
    "foreign_key": null
  },
  "error": null
}
```

---

## Confirm Upload

<mark style="color:green;">`POST`</mark> `/uploads/confirm/{id}.json`

Confirm a previously uploaded file: moves it to its final S3 path and sets `active: true`. The upload must belong to the authenticated user.

#### Path Parameters

| Parameter | Type | Description |
|-----------|------|-------------|
| id | string | Upload UUID to confirm |

#### Request Body

| Field | Type | Required | Description |
|-------|------|----------|-------------|
| model | string | Yes | Model name to associate (e.g. `Flight`) |
| foreign_key | string | Yes | ID of the related record |

#### Response

```json
{
  "result": true,
  "Upload": {
    "id": "abc123",
    "filename": "preflight-photo.jpg",
    "active": true,
    "model": "Flight",
    "foreign_key": "500"
  }
}
```

---

## Set Upload Expiration

<mark style="color:green;">`POST`</mark> `/uploads/expiration/{id}.json`

Set or clear the expiration date of an upload. Admins (user_group_id ≤ 170) can update any upload in the company; regular users can only update their own.

#### Path Parameters

| Parameter | Type | Description |
|-----------|------|-------------|
| id | string | Upload UUID |

#### Request Body

| Field | Type | Required | Description |
|-------|------|----------|-------------|
| expiration | string\|timestamp | Yes | Date string or Unix timestamp. Send empty to clear. |

#### Response

```json
{
  "file": {
    "Upload": {
      "filename": "preflight-photo.jpg",
      "company_id": "42",
      "model": "Flight",
      "user_id": "100",
      "expiration": "2027-01-01"
    }
  }
}
```

---

## Delete Upload

<mark style="color:red;">`GET`</mark> `/uploads/delete/{id}.json`

Delete an upload record and remove the file from AWS S3. Admins (user_group_id ≤ 170) can delete any upload in the company; regular users can only delete their own.

#### Path Parameters

| Parameter | Type | Description |
|-----------|------|-------------|
| id | string | Upload UUID |

#### Response

```json
{
  "result": true,
  "id": "abc123",
  "filename": "preflight-photo.jpg"
}
```
