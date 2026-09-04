# Uploads

Manages file attachments within the app. Files are stored in AWS S3 under `/files/{company_id}/{model}/{filename}`. Photo uploads also generate a thumbnail prefixed with `t_`.

There are two ways to upload a file:

| | Path | Size limit | Notes |
|---|------|-----------|-------|
| **Direct to S3** (preferred) | `Sign Upload` → `PUT` → `Complete Upload` | 2 GB | Bytes go straight to storage; no proxy limit |
| **Through the API** (legacy) | `Create Upload` (+ `Confirm Upload`) | 100 MB | Single request; still fully supported |

#### Access control

Any authenticated user may create an upload by either path. Uploads are scoped to the caller's company, which the server reads from the session — it is never taken from the request, so a client cannot write into another company's storage. `Complete Upload` additionally requires the caller to be the same user who signed the upload. No `user_group_id` restriction and no plan gate applies to creating uploads; the exception for External Auditors on listing is documented under `List Uploads`.

---

## List Uploads

<mark style="color:blue;">`GET`</mark> `/uploads/index/{model}/{foreignKey}.json`

List active uploads for a given model record. Scoped to the authenticated user's company. Results are paginated.

{% hint style="info" %}
**Callers with `user_group_id` 250 (External Auditor)** requesting `model = UserCertificate` get every row's `url` (and `thumb_url`) omitted — they can see that a file exists but cannot fetch it. This exception is specific to `UserCertificate`; every other model is unaffected.
{% endhint %}

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
      "expiration": null,
      "created": "1788524764",
      "user_name": "Martha Smith"
    }
  ]
}
```

`created` (unix seconds, a `double` — microsecond precision) and `user_name` (the uploader's full name, `null` when the user no longer resolves) are returned for every tag, so a shared list can be attributed without a second request. Resolving the names costs one extra query per page, and none when the page is empty.

Rows tagged `SessionClasswork` or `SessionJustification` additionally carry `deadline` (unix, or `null`) and `late` (boolean) — see [trainings.md](trainings.md) § Session Uploads.

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

## Sign Upload

<mark style="color:green;">`POST`</mark> `/uploads/sign.json`

Start a **direct-to-S3 upload**. Returns a short-lived presigned URL that the client PUTs the file bytes to, without the file passing through the API server.

Prefer this over `Create Upload` for anything large: the bytes never traverse the origin, so the 100 MB proxy limit that applies to `create.json` does not apply here. The maximum file size on this path is **2 GB**.

The flow is three steps:

1. `POST /uploads/sign.json` — returns `url` and `upload_id`.
2. `PUT` the raw file bytes to `url`. **Send no `Authorization` header and no extra headers** — the URL carries its own credentials, and additional headers break the signature.
3. `POST /uploads/complete/{upload_id}.json` — verifies and activates the upload.

The presigned URL is valid for **15 minutes**. An upload that is signed but never completed is deleted automatically after 24 hours.

#### Request Body

| Field | Type | Required | Description |
|-------|------|----------|-------------|
| filename | string | Yes | Original file name; used for the extension and display |
| mime | string | Yes | MIME type, validated against the supported types below |
| size | integer | Yes | File size in bytes; must be ≤ 2 GB |
| model | string | Yes | Model name to associate (e.g. `Aircraft`) |
| foreign_key | string | Yes | Foreign key of the related record |

#### Response

```json
{
  "result": true,
  "upload_id": "abc123",
  "url": "https://flylogscom.s3.eu-central-1.amazonaws.com/files/42/Aircraft/1a2b3c4d_photo.jpg?X-Amz-Signature=...",
  "key": "files/42/Aircraft/1a2b3c4d_photo.jpg",
  "expires": 1754745600,
  "error": null
}
```

#### Errors

| Status | Condition |
|--------|-----------|
| 400 | Missing parameters, unsupported MIME type, invalid size, or size above 2 GB |
| 404 | No authenticated user |

---

## Complete Upload

<mark style="color:green;">`POST`</mark> `/uploads/complete/{id}.json`

Verify and activate an upload that was signed with `Sign Upload` and PUT to S3. No request body.

The server confirms the object exists, takes its **real** size from storage (the size declared at sign time is only a hint), and inspects the file's leading bytes to check they are consistent with the declared MIME type. A file that fails verification is deleted from storage and its record removed.

For images, this call also extracts EXIF data and pixel dimensions and generates the thumbnail.

**Idempotent** — calling it again on an already-active upload returns the same record without reprocessing.

#### Path Parameters

| Parameter | Type | Description |
|-----------|------|-------------|
| id | string | Upload UUID returned as `upload_id` by `Sign Upload` |

#### Response

Identical in shape to `Create Upload`:

```json
{
  "result": true,
  "file": {
    "id": "abc123",
    "filename": "1a2b3c4d_preflight-photo.jpg",
    "type": "photo",
    "mime": "image/jpeg",
    "size": "204800",
    "active": true,
    "model": "Aircraft",
    "foreign_key": "def456"
  },
  "error": null
}
```

#### Errors

| Status | Condition |
|--------|-----------|
| 400 | Object missing from storage, empty, above 2 GB, or its content does not match the declared type |
| 404 | Upload not found, or it belongs to another user |
| 405 | Not a POST request |

---

## Create Upload

<mark style="color:green;">`POST`</mark> `/uploads/create.json`

Upload a new file through the API server. Accepts `multipart/form-data`. File is saved to a temporary location and marked `active: false` until confirmed. If `active`, `model`, and `id` are provided, the upload is confirmed immediately.

This endpoint remains fully supported. Note that requests are subject to a **100 MB** limit imposed by the CDN proxy in front of the API — use `Sign Upload` for larger files.

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
