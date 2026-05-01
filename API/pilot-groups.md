# Pilot Groups

Groups of pilots for bulk operations (activation, welcome emails, billing). All endpoints require manager access (`user_group_id ≤ 150`), except `manager_do` and `manager_welcomize` which require `user_group_id ≤ 150`.

---

## List Pilot Groups

<mark style="color:blue;">`GET`</mark> `/pilot_groups/manager_index.json`

List all pilot groups for the company. When called as a JSON request, returns groups with a `pilot_count` field. Ordered alphabetically by name.

#### Response

```json
{
  "pilotGroups": [
    {
      "PilotGroup": {
        "id": "abc123",
        "company_id": "42",
        "name": "Instructors",
        "pilot_count": 5
      }
    }
  ]
}
```

---

## View Pilot Group

<mark style="color:blue;">`GET`</mark> `/pilot_groups/manager_view/{id}.json`

Full details for a single group including all member pilots. Each user also shows which other groups they belong to.

#### Path Parameters

| Parameter | Type | Description |
|-----------|------|-------------|
| id | UUID | Pilot group ID |

#### Response

```json
{
  "PilotGroup": {
    "PilotGroup": {
      "id": "abc123",
      "company_id": "42",
      "name": "Instructors"
    },
    "User": [
      {
        "id": "100",
        "active": true,
        "email": "pilot@example.com",
        "email_status": "confirmed",
        "user_group_id": "170",
        "UserGroup": { "name": "Pilot" },
        "UserDetail": { "name": "John", "surname": "Doe" },
        "PilotGroups": []
      }
    ]
  }
}
```

---

## Create Pilot Group

<mark style="color:green;">`POST`</mark> `/pilot_groups/manager_add.json`

Create a new pilot group.

#### Request Body

| Field | Type | Required | Description |
|-------|------|----------|-------------|
| PilotGroup.name | string | Yes | Group name |

#### Response

```json
{
  "result": true,
  "message": "The new group has been created."
}
```

---

## Edit Pilot Group

<mark style="color:green;">`POST`</mark> `/pilot_groups/manager_edit/{id}.json`

<mark style="color:orange;">`PUT`</mark> `/pilot_groups/manager_edit/{id}.json`

Update a pilot group. A `GET` to this endpoint returns the current group data (including its members) for pre-populating a form.

#### Path Parameters

| Parameter | Type | Description |
|-----------|------|-------------|
| id | UUID | Pilot group ID |

#### Request Body

| Field | Type | Required | Description |
|-------|------|----------|-------------|
| PilotGroup.name | string | Yes | Group name |
| PilotGroup.User | array | No | Array of `{"id": "..."}` objects to set group membership |

#### Response

```json
{
  "result": true,
  "message": "The Pilot group has been saved."
}
```

---

## Delete Pilot Group

<mark style="color:green;">`POST`</mark> `/pilot_groups/manager_delete/{id}.json`

<mark style="color:red;">`DELETE`</mark> `/pilot_groups/manager_delete/{id}.json`

Delete a pilot group. Members are not deleted — only the group record and memberships.

#### Path Parameters

| Parameter | Type | Description |
|-----------|------|-------------|
| id | UUID | Pilot group ID |

#### Response

```json
{
  "result": true,
  "message": "The Pilot group has been deleted."
}
```

---

## Bulk Activate / Deactivate Group

<mark style="color:blue;">`GET`</mark> `/pilot_groups/manager_do/{pilotGroupId}/{action}.json`

Activate or deactivate all pilots in a group. Only affects users whose current `active` status differs from the target state.

#### Path Parameters

| Parameter | Type | Description |
|-----------|------|-------------|
| pilotGroupId | UUID | Pilot group ID |
| action | string | `1` to activate, `0` to deactivate |

#### Response

```json
{
  "result": true,
  "message": "Pilot status changed"
}
```

---

## Send Welcome Emails to Group

<mark style="color:green;">`POST`</mark> `/pilot_groups/manager_welcomize/{pilotGroupId}.json`

Send welcome / account confirmation emails to all active members of the group who have an email address.

#### Path Parameters

| Parameter | Type | Description |
|-----------|------|-------------|
| pilotGroupId | UUID | Pilot group ID |

#### Response

```json
{
  "result": true,
  "message": "3 emails sent"
}
```
