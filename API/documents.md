# Documents

## List Documents

<mark style="color:blue;">`GET`</mark> `/documents.json`

Retrieve documents and folders in the root folder.

<mark style="color:blue;">`GET`</mark> `/documents/index/folder:{folderId}.json`

Retrieve documents and subfolders within a specific folder.

#### Path Parameters

| Parameter | Type | Description |
|-----------|------|-------------|
| folderId | string | Folder ID to browse |

#### Response

```json
{
  "folders": [
    {
      "DocumentFolder": {
        "id": "10",
        "company_id": "42",
        "document_folder_id": "0",
        "name": "Operations Manual",
        "description": "OM Parts A-D",
        "created": "2024-01-15",
        "modified": "2025-02-20"
      }
    }
  ],
  "documents": [
    {
      "Document": {
        "id": "200",
        "company_id": "42",
        "document_folder_id": "0",
        "user_id": "100",
        "name": "Safety Policy",
        "description": "Company safety policy v3.2",
        "deleted": false,
        "download": true,
        "flying_only": false,
        "expiration": "2026-01-15",
        "created": "2024-06-01",
        "modified": "2025-01-10"
      },
      "DocumentDownload": [
        { "id": "300", "document_id": "200" }
      ],
      "Upload": [
        {
          "id": "400",
          "company_id": "42",
          "active": true,
          "type": "document",
          "user_id": "100",
          "filename": "safety-policy-v3.2.pdf",
          "model": "Document",
          "foreign_key": "200",
          "size": "2456789",
          "mime": "application/pdf",
          "expiration": null,
          "caption": "",
          "icon": "fa-file-pdf",
          "folder": "documents/42",
          "url": "https://...",
          "User": {
            "id": "100",
            "UserDetail": { "name": "Admin", "surname": "User", "id": "100" }
          }
        }
      ]
    }
  ],
  "folder": {
    "DocumentFolder": {
      "id": "0",
      "name": "Root",
      "description": ""
    }
  }
}
```

---

## View Document

<mark style="color:blue;">`GET`</mark> `/documents/view/{id}.json`

Retrieve a single document with its file attachments.

#### Path Parameters

| Parameter | Type | Description |
|-----------|------|-------------|
| id | string | Document ID |

#### Response

```json
{
  "document": {
    "Document": { ... },
    "DocumentDownload": [ ... ],
    "Upload": [ ... ]
  }
}
```

---

## Upload Document

<mark style="color:green;">`POST`</mark> `/documents/add.json`

Upload a new document. Uses `multipart/form-data`.

---

## Document Statistics

<mark style="color:blue;">`GET`</mark> `/documents/stats.json`

Company-wide read-receipt compliance across all documents.

> **Access:** staff only — users with **`user_group_id` ≤ 145**. Requests from any higher group return `403 Forbidden`.

A read receipt is **requested** once per document for each active user in one of the document's recipient groups (`flying_only` documents only count pilots). It is counted as **read** when that user has opened the document's **latest active upload**. Publishing a new version therefore resets everyone to unread. Deactivated and deleted users are excluded from the requested pool.

#### Response

| Field | Type | Description |
|-------|------|-------------|
| totals | object | `{ requested, read }` across the whole company |
| groups | array | Per user group: `user_group_id`, `name`, `requested`, `read` |
| users | array | Per user: `id`, `name`, `surname`, `user_group_id`, `group_name`, `requested`, `read` |
| documents | array | Per document: `id`, `name`, `created`, `expiration`, `flying_only`, `requested`, `read` |

```json
{
  "totals": { "requested": 320, "read": 268 },
  "groups": [
    { "user_group_id": "120", "name": "Pilots", "requested": 210, "read": 180 }
  ],
  "users": [
    { "id": "9f3…", "name": "Ada", "surname": "Lovelace", "user_group_id": "120", "group_name": "Pilots", "requested": 14, "read": 12 }
  ],
  "documents": [
    { "id": "a1b…", "name": "Operations Manual", "created": "1717000000", "expiration": null, "flying_only": true, "requested": 42, "read": 39 }
  ]
}
```

---

## User Document Breakdown

<mark style="color:blue;">`GET`</mark> `/documents/user_stats/{userId}.json`

Per-user drilldown: every document required of that user (their group is a recipient, respecting `flying_only`) and whether they have read the latest active version.

> **Access:** staff only — users with **`user_group_id` ≤ 145**. Returns `403 Forbidden` above 145, and `404` if the user is not in the caller's company.

#### Path Parameters

| Parameter | Type | Description |
|-----------|------|-------------|
| userId | string | Target user ID (must belong to the caller's company) |

#### Response

| Field | Type | Description |
|-------|------|-------------|
| user | object | `id`, `name`, `surname`, `user_group_id`, `group_name` |
| totals | object | `{ requested, read, pending }` for this user |
| documents | array | Per document: `id`, `name`, `created`, `expiration`, `flying_only`, `read` (bool), `read_at` (timestamp or `null`) |

```json
{
  "user": { "id": "9f3…", "name": "Ada", "surname": "Lovelace", "user_group_id": "120", "group_name": "Pilots" },
  "totals": { "requested": 14, "read": 12, "pending": 2 },
  "documents": [
    { "id": "a1b…", "name": "Operations Manual", "created": "1717000000", "expiration": null, "flying_only": true, "read": true, "read_at": "1717500000" },
    { "id": "c4d…", "name": "Safety Bulletin 2026-03", "created": "1718000000", "expiration": null, "flying_only": false, "read": false, "read_at": null }
  ]
}
```

---

## Manage Folders

### Create / Edit Folder

<mark style="color:green;">`POST`</mark> `/documents/folder.json`

Create or update a document folder.

#### Request Body

| Field | Type | Required | Description |
|-------|------|----------|-------------|
| id | string | No | Folder ID (omit to create new) |
| name | string | Yes | Folder name |
| description | string | No | Folder description |
| document_folder_id | string | No | Parent folder ID |

### Delete Folder

<mark style="color:blue;">`GET`</mark> `/documents/delete_folder/{id}/true.json`

Delete a folder and its contents.

#### Path Parameters

| Parameter | Type | Description |
|-----------|------|-------------|
| id | string | Folder ID |
