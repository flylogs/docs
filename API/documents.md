---
audience: [developers]
plan: api
---

# Documents

> Role names and `user_group_id` values are listed in [User groups](users.md#user-groups).

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
        "requires_receipt": true,
        "read_by": "2026-12-01",
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

A user above group 150 can open the document only when it is addressed to them: their user group (pilots only on a `flying_only` document) or them by name.

#### Response

```json
{
  "document": {
    "Document": {
      "id": "a1b…",
      "name": "Safety Notice 12-26",
      "flying_only": true,
      "requires_receipt": true,
      "read_by": "2026-12-01",
      "read_by_passed": false,
      ...
    },
    "DocumentRecipient": [
      { "user_group_id": "190", "user_id": null, "UserGroup": { "id": "190", "name": "Pilot" }, "User": null },
      { "user_group_id": null, "user_id": "805", "UserGroup": null, "User": { "UserDetail": { "name": "Ada", "surname": "Lovelace" } } }
    ],
    "DocumentDownload": [ ... ],
    "Upload": [ ... ]
  },
  "remainingusers": [
    {
      "User": { "id": 805, "reminded_at": 1795110734 },
      "UserDetail": { "name": "Ada", "surname": "Lovelace" },
      "UserGroup": { "name": "Flight Dispatcher" }
    }
  ]
}
```

| Field | Description |
|-------|-------------|
| `Document.requires_receipt` | `false` = the document is distributed but requests no read receipt (reference material). |
| `Document.read_by` | Company calendar day (`YYYY-MM-DD`) by which the latest version must be read, or `null`. |
| `Document.read_by_passed` | `true` once `read_by` is before today on the company calendar: every pending receipt is overdue. |
| `DocumentRecipient[]` | One row per recipient: a user group (`user_group_id`) **or** a named person (`user_id`). Above group 150 only the caller's own rows are returned. |
| `remainingusers` | Managers (group ≤ 150) only: who has not opened the latest version. Same audience as [Document Statistics](#document-statistics). Empty when `requires_receipt` is `false`. `User.reminded_at` is the unix time of the last reminder about this document, or `null`. |

---

## Upload Document

<mark style="color:green;">`POST`</mark> `/documents/add.json`

Upload a new document. Uses `multipart/form-data`.

> **Access:** management groups — users with **`user_group_id` ≤ 150** (up to and including the Chief Pilot). The same limit applies to editing and deleting documents and to folder management below; higher groups get `403 Forbidden`.

#### Read-receipt and recipient fields

These fields are accepted by `POST /documents/add.json` (multipart) and `POST /documents/edit/{id}.json`:

| Field | Type | Description |
|-------|------|-------------|
| `data[Document][requires_receipt]` | `1` / `0` | Request a read receipt from every recipient. Default `1`. |
| `data[Document][read_by]` | `YYYY-MM-DD` | Read-by date; empty clears it. Anything that is not a real calendar date is stored as no date. |
| `data[DocumentRecipient][user_group_id][]` | int | Recipient user groups. |
| `data[DocumentRecipient][user_id][]` | int | Named recipients. Only users of your company are kept; others are ignored. |

At least one group or one named person is expected. On edit, each list replaces the stored rows **only when it is sent**: posting groups without `user_id` keeps the named people, and the other way round. A field of `Document` that is not sent keeps its stored value.

`POST /documents/upload.json` (new version) also accepts `data[Upload][read_by]`, which replaces the document's read-by date when present.

`GET /documents/add.json` and `GET /documents/edit/{id}.json` return, besides `usergroups` and `folders`, a `users` list of the people that can be named (`id`, `name`, `surname`, `user_group_id`, `group_name`, `pilot`). The edit response gives the stored named people as `document.RecipientUser` (user ids); `document.DocumentRecipient` stays the list of group ids.

---

## Remind Pending Readers

<mark style="color:green;">`POST`</mark> `/documents/remind/{id}.json`

Send a reminder message (in-app, push and e-mail) to the users who have not opened the document's latest version.

> **Access:** management groups — users with **`user_group_id` ≤ 150**, the same users who receive `remainingusers` from View Document. Higher groups get `403 Forbidden`.

#### Request Body

| Field | Type | Required | Description |
|-------|------|----------|-------------|
| `user_id` | int[] | No | Remind only these users (ignored unless they are pending). Omit to remind everybody pending. |

Users reminded about the same document in the **last 12 hours** are skipped. A document with `requires_receipt` = `false`, or without a file, has nobody to remind (`result: false`).

#### Response

```json
{ "result": true, "message": "Reminder sent to 2 people.", "sent": 2, "skipped": 1 }
```

The automatic reminder on the 1st and 16th of each month is the company setting `CompanySetting.document_receipt_reminders` (off by default, saved with the other company settings). It sends each user one message listing every document that requests a read receipt and that they have not read.

---

## Document Statistics

<mark style="color:blue;">`GET`</mark> `/documents/stats.json`

Company-wide read-receipt compliance across all documents.

> **Access:** staff only — users with **`user_group_id` ≤ 145 (Flight Dispatcher and above)**. Requests from any higher group return `403 Forbidden`.

A read receipt is **requested** once per document for each active user in one of the document's recipient groups (`flying_only` documents only count pilots) and for each active user named on it. Documents with `requires_receipt` = `false` request none and are left out. A receipt is counted as **read** when that user has opened the document's **latest active upload**. Publishing a new version therefore resets everyone to unread. Deactivated and deleted users are excluded from the requested pool. An unread receipt is **overdue** once the document's `read_by` date has passed on the company calendar.

#### Response

| Field | Type | Description |
|-------|------|-------------|
| totals | object | `{ requested, read, overdue }` across the whole company |
| groups | array | Per user group (the user's own group): `user_group_id`, `name`, `requested`, `read`, `overdue` |
| users | array | Per user: `id`, `name`, `surname`, `user_group_id`, `group_name`, `requested`, `read`, `overdue` |
| documents | array | Per document: `id`, `name`, `created`, `expiration`, `flying_only`, `read_by`, `requested`, `read`, `overdue` |

```json
{
  "totals": { "requested": 320, "read": 268, "overdue": 7 },
  "groups": [
    { "user_group_id": 190, "name": "Pilot", "requested": 210, "read": 180, "overdue": 5 }
  ],
  "users": [
    { "id": 805, "name": "Ada", "surname": "Lovelace", "user_group_id": 190, "group_name": "Pilot", "requested": 14, "read": 12, "overdue": 1 }
  ],
  "documents": [
    { "id": "a1b…", "name": "Operations Manual", "created": "1717000000", "expiration": null, "flying_only": true, "read_by": "2026-12-01", "requested": 42, "read": 39, "overdue": 0 }
  ]
}
```

---

## User Document Breakdown

<mark style="color:blue;">`GET`</mark> `/documents/user_stats/{userId}.json`

Per-user drilldown: every document that requests a read receipt of that user (their group is a recipient, respecting `flying_only`, or they are named on it) and whether they have read the latest active version.

> **Access:** staff only — users with **`user_group_id` ≤ 145 (Flight Dispatcher and above)**. Returns `403 Forbidden` above 145, and `404` if the user is not in the caller's company.

#### Path Parameters

| Parameter | Type | Description |
|-----------|------|-------------|
| userId | string | Target user ID (must belong to the caller's company) |

#### Response

| Field | Type | Description |
|-------|------|-------------|
| user | object | `id`, `name`, `surname`, `user_group_id`, `group_name` |
| totals | object | `{ requested, read, pending, overdue }` for this user |
| documents | array | Per document: `id`, `name`, `created`, `expiration`, `flying_only`, `read_by`, `read` (bool), `read_at` (timestamp or `null`), `overdue` (bool) |

```json
{
  "user": { "id": "9f3…", "name": "Ada", "surname": "Lovelace", "user_group_id": "120", "group_name": "Pilots" },
  "totals": { "requested": 14, "read": 12, "pending": 2, "overdue": 1 },
  "documents": [
    { "id": "a1b…", "name": "Operations Manual", "created": "1717000000", "expiration": null, "flying_only": true, "read_by": null, "read": true, "read_at": "1717500000", "overdue": false },
    { "id": "c4d…", "name": "Safety Bulletin 2026-03", "created": "1718000000", "expiration": null, "flying_only": false, "read_by": "2026-11-10", "read": false, "read_at": null, "overdue": true }
  ]
}
```

---

## Manage Folders

### Create / Edit Folder

<mark style="color:green;">`POST`</mark> `/documents/folder.json`

Create or update a document folder.

> **Access:** management groups — users with **`user_group_id` ≤ 150 (Chief Pilot and above)**.

#### Request Body

| Field | Type | Required | Description |
|-------|------|----------|-------------|
| id | string | No | Folder ID (omit to create new) |
| name | string | Yes | Folder name |
| description | string | No | Folder description |
| document_folder_id | string | No | Parent folder ID. Empty / `0` / omitted = root folder |

#### Plan limit

Creating a **root folder** is subject to the company plan's folder limit:

| Plan | Root folders |
|------|--------------|
| Free | 3 |
| Club Essentials | Unlimited |
| Premium | Unlimited |
| Unlimited | Unlimited |

Subfolders (non-empty `document_folder_id`) never count against this limit. The check applies whenever a folder becomes root-level: on create, and on edit when an existing subfolder is moved to root (`document_folder_id` cleared). Renaming a folder, moving it between two non-root parents, or editing an existing root folder without changing its parent is never blocked by this limit. When the limit is reached the endpoint responds:

```
HTTP 400 Bad Request
You have reached the limit of folders for your subscription plan. Please upgrade your plan to add more folders.
```

#### Nesting limits

Folders can nest up to **4 levels** deep. `document_folder_id` is validated on every create/edit:

| Violation | Response |
|-----------|----------|
| New parent is the folder itself, or one of its own descendants (would create a cycle) | `400 Bad Request` — "Cannot move a folder into its own subfolder." |
| Resulting depth would exceed 4 levels | `400 Bad Request` — "Folders can be nested at most 4 levels deep." |

### Delete Folder

<mark style="color:blue;">`GET`</mark> `/documents/delete_folder/{id}/true.json`

Delete a folder, cascading to every subfolder nested inside it at any depth.

Documents are never deleted by this call. Any document found anywhere in the deleted branch — in the folder itself or in any of its subfolders — is moved to the root folder (`document_folder_id` cleared) before the folder rows are removed.

#### Path Parameters

| Parameter | Type | Description |
|-----------|------|-------------|
| id | string | Folder ID |
