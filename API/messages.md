# Messages

## Unread Messages

<mark style="color:blue;">`GET`</mark> `/messages/messages/unread.json`

Retrieve unread messages for the authenticated user. Used for notification badges.

#### Response

```json
{
  "messages": [
    {
      "Message": {
        "id": "1001",
        "subject": "Schedule change tomorrow",
        "created": "2025-03-10 14:00:00"
      },
      "Sender": {
        "id": "101",
        "email": "manager@example.com",
        "pic": "https://...",
        "name": "Maria Garcia"
      }
    }
  ]
}
```

---

## List Messages

<mark style="color:blue;">`GET`</mark> `/messages.json`

Retrieve all messages in the default mailbox (inbox).

<mark style="color:blue;">`GET`</mark> `/messages/messages/index/{mailbox}.json`

Retrieve messages in a specific mailbox.

#### Path Parameters

| Parameter | Type | Description |
|-----------|------|-------------|
| mailbox | string | Mailbox name (e.g. `inbox`, `sent`, `starred`, `archived`) |

#### Response

```json
{
  "messages": [
    {
      "Message": {
        "id": "1001",
        "subject": "Schedule change tomorrow",
        "urgent": false,
        "body": "<p>Your flight has been moved to 10:00.</p>",
        "starred": false,
        "parent_id": "0",
        "created": "2025-03-10 14:00:00"
      },
      "Sender": {
        "id": "101",
        "email": "manager@example.com",
        "pic": "https://...",
        "name": "Maria Garcia",
        "UserDetail": { "name": "Maria", "id": "101" }
      },
      "Recipient": [
        {
          "id": "2001",
          "user_id": "123",
          "message_id": "1001",
          "read": false,
          "notified": true,
          "starred": false,
          "archived": false,
          "deleted": false,
          "name": "John Doe",
          "user_group_id": "110",
          "email": "john@example.com",
          "pic": null,
          "pilot": true,
          "active": true,
          "company_id": "42"
        }
      ]
    }
  ],
  "boxes": ["inbox", "sent", "starred", "archived", "deleted"],
  "currentBox": "inbox"
}
```

---

## View Message Thread

<mark style="color:blue;">`GET`</mark> `/messages/messages/view/{messageId}.json`

Retrieve a message and its full conversation thread. Marks the message as read.

#### Path Parameters

| Parameter | Type | Description |
|-----------|------|-------------|
| messageId | string | Message ID |

#### Response

```json
{
  "message": {
    "Message": { "id": "1001", "subject": "...", "body": "...", ... },
    "Sender": { ... },
    "Recipient": [ ... ]
  },
  "family": [
    { "Message": { ... }, "Sender": { ... }, "Recipient": [ ... ] },
    { "Message": { ... }, "Sender": { ... }, "Recipient": [ ... ] }
  ]
}
```

| Field | Description |
|-------|-------------|
| message | The opened message (marked as read server-side) |
| family | Full conversation thread, oldest first (includes the opened message) |

---

## Reply to Message

<mark style="color:green;">`POST`</mark> `/messages/messages/add.json`

Send a reply in a message thread.

#### Request Body

```json
{
  "data": {
    "Message": {
      "parent_id": "1001",
      "subject": "Re: Schedule change tomorrow",
      "body": "<p>Understood, thank you.</p>"
    }
  }
}
```

| Field | Type | Required | Description |
|-------|------|----------|-------------|
| parent_id | string | Yes | ID of the message being replied to |
| subject | string | Yes | Message subject |
| body | string | Yes | HTML message body |

---

## Change Message Status

<mark style="color:green;">`POST`</mark> `/messages/messages/change/{field}/{value}.json`

Update a message flag (star, archive, delete).

#### Path Parameters

| Parameter | Type | Description |
|-----------|------|-------------|
| field | string | Field to change: `starred`, `archived`, `deleted` |
| value | string | New value: `true` or `false` |

#### Request Body

| Field | Type | Required | Description |
|-------|------|----------|-------------|
| id | string | Yes | Message ID |
