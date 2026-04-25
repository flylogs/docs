# Inventory

Manage maintenance inventory parts, units, and providers. Requires **premium**, **unlimited**, or **club** subscription plan.

## List Inventory

<mark style="color:green;">`POST`</mark> `/maintenance/inventory/index.json`

Retrieve a paginated list of inventory parts for the company.

#### Request Body (optional filters)

| Parameter | Type | Description |
|-----------|------|-------------|
| category | string | Filter by part category |
| status | string | Filter by approval status |
| name | string | Search in part number, name, and manufacturer |

#### Response

```json
{
  "items": [
    {
      "Inventory": {
        "id": "d4e5f6a7-b8c9-0123-defg-h12345678901",
        "company_id": "c1d2e3f4-a5b6-7890-abcd-ef1234567890",
        "part_number": "CH48110-1",
        "name": "Oil filter",
        "mfr_name": "Champion Aerospace",
        "category": "Engine",
        "approval_status": "Approved",
        "description": "Standard oil filter for Lycoming engines.",
        "deleted": false
      },
      "InventoryUnit": [
        {
          "id": "e5f6a7b8-c9d0-1234-efgh-i12345678901",
          "aircraft_id": "45"
        }
      ]
    }
  ],
  "paginate": {
    "page": 1,
    "current": 10,
    "count": 85,
    "prevPage": false,
    "nextPage": true,
    "pageCount": 2,
    "limit": 50
  }
}
```

---

## Selectables

<mark style="color:blue;">`GET`</mark> `/maintenance/inventory/selectables.json`

Retrieve available status and category values for building forms.

#### Response

```json
{
  "status": {
    "Pending": "Pending",
    "Approved": "Approved",
    "Rejected": "Rejected",
    "Quarantined": "Quarantined",
    "Certified": "Certified",
    "Non-certified": "Non-certified",
    "Under-review": "Under review",
    "Expired": "Expired",
    "Unapproved": "Unapproved"
  },
  "categories": {
    "Avionics": "Avionics",
    "Hydraulics": "Hydraulics",
    "Engine": "Engine",
    "Landing Gear": "Landing Gear",
    "Electrical": "Electrical",
    "Fuel System": "Fuel System",
    "Flight Controls": "Flight Controls",
    "Cabin Interior": "Cabin Interior",
    "Propulsion": "Propulsion",
    "Navigation": "Navigation",
    "Pneumatics": "Pneumatics",
    "Airframe": "Airframe",
    "Communication": "Communication",
    "Lighting": "Lighting",
    "Braking System": "Braking System",
    "Oxygen System": "Oxygen System",
    "Environmental Control System": "Environmental Control System",
    "Emergency Equipment": "Emergency Equipment",
    "Structure": "Structure",
    "Consumables": "Consumables",
    "Miscellaneous": "Miscellaneous"
  }
}
```

---

## View Inventory Part

<mark style="color:blue;">`GET`</mark> `/maintenance/inventory/view/{id}.json`

Retrieve full details for a single inventory part, including units, providers, and change history.

#### Path Parameters

| Parameter | Type | Description |
|-----------|------|-------------|
| id | string | Inventory UUID |

#### Response

```json
{
  "inventory": {
    "Inventory": {
      "id": "d4e5f6a7-b8c9-0123-defg-h12345678901",
      "company_id": "c1d2e3f4-a5b6-7890-abcd-ef1234567890",
      "part_number": "CH48110-1",
      "name": "Oil filter",
      "mfr_name": "Champion Aerospace",
      "category": "Engine",
      "approval_status": "Approved",
      "description": "Standard oil filter for Lycoming engines."
    },
    "InventoryProvider": {
      "id": "f6a7b8c9-d0e1-2345-fghi-j12345678901",
      "name": "Aviation Parts Inc.",
      "email": "parts@example.com",
      "phone": "+1234567890"
    },
    "InventoryChange": [
      {
        "id": "a7b8c9d0-e1f2-3456-ghij-k12345678901",
        "action": "ADD",
        "created": "1714003200",
        "User": {
          "id": "123",
          "UserDetail": {
            "name": "John",
            "surname": "Doe"
          }
        }
      }
    ],
    "InventoryUnit": [
      {
        "id": "e5f6a7b8-c9d0-1234-efgh-i12345678901",
        "serial_number": "SN-001234",
        "status": "installed",
        "condition": "SV",
        "Base": {
          "name": "LEBL"
        },
        "Aircraft": {
          "id": "45",
          "registration": "EC-ABC",
          "active": true,
          "maintenance": true,
          "flight_count": "1200",
          "AircraftModel": {
            "name": "C172",
            "AircraftManufacturer": {
              "name": "Cessna"
            }
          }
        }
      }
    ]
  }
}
```

---

## Edit Inventory Part

<mark style="color:green;">`POST`</mark> `/maintenance/inventory/edit.json`

Create or update an inventory part. When creating, an initial inventory unit is also created.

#### Request Body

| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| Inventory[id] | string | no | Inventory UUID (omit to create new) |
| Inventory[part_number] | string | yes (create) | Part number (unique per company) |
| Inventory[name] | string | yes (create) | Part name |
| Inventory[mfr_name] | string | yes (create) | Manufacturer name |
| Inventory[category] | string | yes (create) | Part category (see categories list) |
| Inventory[approval_status] | string | no | Approval status |
| Inventory[description] | string | no | Part description |
| InventoryProvider[name] | string | no | Provider name (creates or links provider) |
| InventoryUnit[serial_number] | string | no | Initial unit serial number |
| InventoryUnit[status] | string | no | Unit status |
| InventoryUnit[condition] | string | no | Unit condition |
| InventoryUnit[base_id] | string | no | Base UUID |
| InventoryUnit[aircraft_id] | number | no | Aircraft ID |

#### Response

```json
{
  "result": {
    "Inventory": {
      "id": "d4e5f6a7-b8c9-0123-defg-h12345678901",
      "part_number": "CH48110-1",
      "name": "Oil filter"
    }
  },
  "message": "Inventory item saved",
  "errors": null,
  "data": { ... }
}
```

On validation failure:

```json
{
  "result": null,
  "message": "Could not save the inventory item due to validation errors",
  "errors": {
    "part_number": ["This part number is already registered"]
  },
  "data": { ... }
}
```

---

## Delete Inventory Part

<mark style="color:green;">`POST`</mark> `/maintenance/inventory/delete.json`

Delete an inventory part. Requires manager role.

#### Request Body

| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| id | string | yes | Inventory UUID |

#### Response

```json
{
  "result": true,
  "part": {
    "Inventory": {
      "id": "d4e5f6a7-b8c9-0123-defg-h12345678901",
      "part_number": "CH48110-1",
      "name": "Oil filter"
    }
  }
}
```

---

## List Providers

<mark style="color:green;">`POST`</mark> `/maintenance/inventory/providers.json`

List inventory providers for the company, optionally filtered by search.

#### Request Body (optional)

| Parameter | Type | Description |
|-----------|------|-------------|
| search | string | Search in provider name, email, and phone |

#### Response

```json
{
  "providers": [
    {
      "InventoryProvider": {
        "id": "f6a7b8c9-d0e1-2345-fghi-j12345678901",
        "company_id": "c1d2e3f4-a5b6-7890-abcd-ef1234567890",
        "name": "Aviation Parts Inc.",
        "email": "parts@example.com",
        "phone": "+1234567890"
      }
    }
  ]
}
```

---

## View Provider

<mark style="color:blue;">`GET`</mark> `/maintenance/inventory/provider/{id}.json`

Retrieve details for a single provider.

#### Path Parameters

| Parameter | Type | Description |
|-----------|------|-------------|
| id | string | Provider ID |

#### Response

```json
{
  "provider": {
    "InventoryProvider": {
      "id": "f6a7b8c9-d0e1-2345-fghi-j12345678901",
      "company_id": "c1d2e3f4-a5b6-7890-abcd-ef1234567890",
      "name": "Aviation Parts Inc.",
      "email": "parts@example.com",
      "phone": "+1234567890"
    }
  }
}
```

---

## Enumerations Reference

#### Category

| Value |
|-------|
| `Avionics` |
| `Hydraulics` |
| `Engine` |
| `Landing Gear` |
| `Electrical` |
| `Fuel System` |
| `Flight Controls` |
| `Cabin Interior` |
| `Propulsion` |
| `Navigation` |
| `Pneumatics` |
| `Airframe` |
| `Communication` |
| `Lighting` |
| `Braking System` |
| `Oxygen System` |
| `Environmental Control System` |
| `Emergency Equipment` |
| `Structure` |
| `Consumables` |
| `Miscellaneous` |

#### Approval Status

| Value | Description |
|-------|-------------|
| `Pending` | Awaiting inspection, documentation, or approval |
| `Approved` | Passed inspections, meets regulatory requirements |
| `Rejected` | Failed inspection, cannot be used |
| `Quarantined` | Held pending further investigation |
| `Certified` | Officially certified (e.g. FAA 8130-3, EASA Form 1) |
| `Non-certified` | Lacks necessary certification |
| `Under-review` | Being evaluated, no decision yet |
| `Expired` | Certification lapsed or shelf life ended |
| `Unapproved` | Explicitly not suitable for use |
