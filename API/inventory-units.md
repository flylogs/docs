# Inventory Units

Manage individual serialized parts (units) within inventory items. Requires **premium** or **unlimited** subscription plan.

## List Units

<mark style="color:green;">`POST`</mark> `/maintenance/unit/index.json`

Retrieve a paginated list of inventory units for the company.

#### Request Body (optional filters)

| Parameter | Type | Description |
|-----------|------|-------------|
| inventory | string | Filter by inventory item UUID |
| workorder | string | Filter by work order UUID (empty string returns unassigned units) |
| aircraft | number | Filter by aircraft ID |
| name | string | Search in part number, name, and serial number |
| limit | number | Results per page (default 50, max 500) |

#### Response

```json
{
  "items": {
    "Oil filter": {
      "e5f6a7b8-c9d0-1234-efgh-i12345678901": "SN-001234"
    }
  },
  "paginate": {
    "page": 1,
    "current": 10,
    "count": 120,
    "prevPage": false,
    "nextPage": true,
    "pageCount": 3,
    "limit": 50
  }
}
```

Note: items are grouped by inventory name, with unit ID as key and serial number as value.

---

## View Unit

<mark style="color:blue;">`GET`</mark> `/maintenance/unit/view/{id}.json`

Retrieve full details for a single inventory unit, including change history and associated aircraft.

#### Path Parameters

| Parameter | Type | Description |
|-----------|------|-------------|
| id | string | Unit UUID |

#### Response

```json
{
  "item": {
    "InventoryUnit": {
      "id": "e5f6a7b8-c9d0-1234-efgh-i12345678901",
      "inventory_id": "d4e5f6a7-b8c9-0123-defg-h12345678901",
      "serial_number": "SN-001234",
      "alternate_part_numbers": "",
      "status": "installed",
      "condition": "SV",
      "aircraft_id": "45",
      "base_id": "b1c2d3e4-f5a6-7890-bcde-f12345678901",
      "workorder_id": "b2c3d4e5-f6a7-8901-bcde-f12345678901",
      "life_limit_cycles": null,
      "life_limit_hours": null,
      "expiration": null,
      "installation_date": "2024-01-15",
      "last_inspection_date": "2024-04-25",
      "next_due_inspection": "2024-10-25",
      "remarks": "",
      "deleted": false
    },
    "Inventory": {
      "id": "d4e5f6a7-b8c9-0123-defg-h12345678901",
      "name": "Oil filter",
      "part_number": "CH48110-1",
      "InventoryProvider": { ... }
    },
    "InventoryChange": [
      {
        "action": "INSTALL",
        "created": "1714003200",
        "User": {
          "id": "123",
          "UserDetail": {
            "name": "John",
            "surname": "Doe"
          }
        },
        "Aircraft": {
          "id": "45",
          "registration": "EC-ABC"
        }
      }
    ],
    "Base": {
      "name": "LEBL"
    },
    "WorkOrder": { ... },
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
}
```

---

## Edit Unit

<mark style="color:green;">`POST`</mark> `/maintenance/unit/edit.json`

Create or update an inventory unit. Changing `aircraft_id` automatically logs an INSTALL or REMOVE event.

#### Request Body

| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| InventoryUnit[id] | string | no | Unit UUID (omit to create new) |
| InventoryUnit[inventory_id] | string | yes (create) | Parent inventory item UUID |
| InventoryUnit[base_id] | string | yes (create) | Base UUID |
| InventoryUnit[serial_number] | string | no | Serial number |
| InventoryUnit[alternate_part_numbers] | string | no | Alternate part numbers |
| InventoryUnit[status] | string | no | Unit status (see enumerations) |
| InventoryUnit[condition] | string | no | Unit condition (see enumerations) |
| InventoryUnit[aircraft_id] | number | no | Aircraft ID (set to install, clear to remove) |
| InventoryUnit[workorder_id] | string | no | Associated work order UUID |
| InventoryUnit[life_limit_cycles] | number | no | Life limit in cycles |
| InventoryUnit[life_limit_hours] | number | no | Life limit in hours |
| InventoryUnit[expiration] | string | no | Expiration date |
| InventoryUnit[installation_date] | string | no | Installation date |
| InventoryUnit[last_inspection_date] | string | no | Last inspection date |
| InventoryUnit[next_due_inspection] | string | no | Next due inspection date |
| InventoryUnit[remarks] | string | no | Remarks |

#### Response

```json
{
  "result": {
    "InventoryUnit": {
      "id": "e5f6a7b8-c9d0-1234-efgh-i12345678901",
      "serial_number": "SN-001234",
      "status": "installed"
    }
  },
  "message": "Inventory item saved",
  "errors": null,
  "data": { ... }
}
```

---

## Delete Unit

<mark style="color:green;">`POST`</mark> `/maintenance/unit/delete.json`

Delete an inventory unit. Requires manager role.

#### Request Body

| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| id | string | yes | Unit UUID |

#### Response

```json
{
  "result": true,
  "serial": {
    "InventoryUnit": {
      "id": "e5f6a7b8-c9d0-1234-efgh-i12345678901",
      "serial_number": "SN-001234"
    }
  }
}
```

---

## Attach Unit to Work Order

<mark style="color:green;">`POST`</mark> `/maintenance/unit/attach.json`

Attach an inventory unit to a work order. This installs the unit on the work order's aircraft.

#### Request Body

| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| id | string | yes | Unit UUID |
| workorder | string | yes | Work order UUID |

#### Response

```json
{
  "result": true,
  "item": {
    "InventoryUnit": {
      "id": "e5f6a7b8-c9d0-1234-efgh-i12345678901",
      "serial_number": "SN-001234"
    }
  },
  "message": "Inventory item updated",
  "url": ["view", "e5f6a7b8-c9d0-1234-efgh-i12345678901"]
}
```

---

## Enumerations Reference

#### Unit Status

| Value | Description |
|-------|-------------|
| `available` | Available and ready for use or installation |
| `ordered` | Ordered but not yet received |
| `received` | Received, awaiting processing or inspection |
| `installed` | Installed on aircraft or system |
| `removed` | Removed from aircraft, may still be serviceable |
| `overhauled` | Fully inspected and restored to original specifications |
| `retired` | Permanently removed from service |

#### Unit Condition

| Value | Code | Description |
|-------|------|-------------|
| `NEW` | New | Brand-new, never used |
| `USED` | Used | Previously installed or operated |
| `SV` | Serviceable | Used but inspected, tested, and fit for use |
| `OH` | Overhauled | Fully disassembled, inspected, repaired, reassembled |
| `RP` | Repaired | Underwent repairs, now operational |
| `AR` | As Removed | Removed from aircraft, not yet inspected |
| `SCR` | Scrap | No longer serviceable, designated for disposal |
| `FN` | Factory New | New and directly from manufacturer |
| `EX` | Exchanged | Replaced through exchange program |
| `TS` | Tested | Undergone testing, confirmed operational |
| `MOD` | Modified | Altered or upgraded to meet new specifications |
| `UNS` | Unserviceable | Not fit for use without repairs or overhaul |
