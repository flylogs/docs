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
| status | string | Filter by unit status, e.g. `installed` (see enumerations) |
| name | string | Search in part number, name, and serial number |
| limit | number | Results per page (default 50, max 500) |

#### Response

```json
{
  "items": [
    {
      "InventoryUnit": {
        "id": "e5f6a7b8-c9d0-1234-efgh-i12345678901",
        "inventory_id": "d4e5f6a7-b8c9-0123-defg-h12345678901",
        "serial_number": "SN-001234",
        "status": "installed",
        "aircraft_id": "45",
        "installation_date": "2026-01-15",
        "expiration": "2027-12-22",
        "certificate_type": "EASA Form 1",
        "certificate_number": "F1-70017",
        "life_limit_hours": "500.00",
        "life_limit_cycles": null,
        "installed_aircraft_seconds": "14905800",
        "installed_aircraft_cycles": "10820",
        "used_seconds": "0",
        "used_cycles": "0"
      },
      "Inventory": {
        "id": "d4e5f6a7-b8c9-0123-defg-h12345678901",
        "deleted": false,
        "name": "Dry air vacuum pump",
        "part_number": "215CC",
        "ata_chapter": "37",
        "certification": "EASA Form 1"
      },
      "Aircraft": { "id": "45", "registration": "EC-ABC" },
      "InventoryProvider": { "id": "f6a7b8c9-d0e1-2345-fghi-j12345678901", "name": "Aviation Parts Inc." }
    }
  ],
  "paginate": {
    "page": 1,
    "current": 1,
    "count": 1,
    "prevPage": false,
    "nextPage": false,
    "pageCount": 1,
    "limit": 500
  }
}
```

Units are ordered by serial number. The aircraft page in NEO calls this with `aircraft` and `status=installed` to list the installed parts, and computes each unit's life left from the aircraft's current hours and landings (see [Edit Unit](#edit-unit)).

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
      "life_limit_hours": "500.00",
      "expiration": null,
      "installation_date": "2024-01-15",
      "installed_aircraft_seconds": "16273800",
      "installed_aircraft_cycles": "11230",
      "used_seconds": "756000",
      "used_cycles": "0",
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
        "inventory_id": "d4e5f6a7-b8c9-0123-defg-h12345678901",
        "serial_number": "SN-001234",
        "aircraft_id": "45",
        "aircraft_seconds": "16273800",
        "aircraft_cycles": "11230",
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

Create or update an inventory unit.

A unit is **installed** when its `status` is `installed` and it has an `aircraft_id`. Saving a unit records its life and its history automatically:

* **Installed** (not installed before, or moved to another aircraft): `installed_aircraft_seconds` / `installed_aircraft_cycles` are set to the aircraft's airframe time (whole seconds) and landings — at the end of `installation_date` when that date is in the past, otherwise now — unless you send them. An `INSTALL` history row is written with the aircraft and those figures.
* **Removed** (status changed from `installed`, aircraft cleared, or moved): the time and landings flown since installation are added to `used_seconds` / `used_cycles`, the installation snapshot is cleared, `aircraft_id` is cleared when the unit is no longer installed, and a `REMOVE` row is written with the aircraft's figures at removal.
* Any other save writes `ADD` (create) or `CNG` (edit).

Life used = `used_*` + (aircraft now − `installed_aircraft_*`) while installed. NEO shows it against `life_limit_hours` / `life_limit_cycles`.

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
| InventoryUnit[used_seconds] | number | no | Time used before the current installation, in whole seconds (earlier installations, or a used part) |
| InventoryUnit[used_cycles] | number | no | Cycles used before the current installation |
| InventoryUnit[installed_aircraft_seconds] | number | no | Aircraft airframe time at installation, in whole seconds. Empty = record automatically (or keep the stored value) |
| InventoryUnit[installed_aircraft_cycles] | number | no | Aircraft landings at installation. Empty = record automatically (or keep the stored value) |
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

<mark style="color:green;">`POST`</mark> `/maintenance/unit/delete/{id}.json` (or `/maintenance/unit/delete.json` with `id` in the body). GET is refused (405).

Delete an inventory unit. Only user groups 1, 100, 105, 110 and 300 may delete. A unit that is installed on an aircraft or attached to a work order cannot be deleted (400): remove or detach it first. A `DEL` row is written to the part's history with the unit's serial number, and the unit's earlier history is kept.

#### Request

| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| id | string | yes | Unit UUID, in the URL or as POST data |

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

Server-stamped fields on the unit (no need to send these):

- `workorder_id` → target work order
- `aircraft_id` → copied from `WorkOrder.Job.aircraft_id`
- `status` → `installed`
- `installation_date` → today (`YYYY-MM-DD`)
- `last_inspection_date` → now (`YYYY-MM-DD HH:MM:SS`)

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

## Detach Unit from Work Order

<mark style="color:green;">`POST`</mark> `/maintenance/unit/detach.json`

Unlink an inventory unit from its work order. Reverses `attach()`.

Server-stamped fields on the unit:

- `workorder_id` → `null`
- `aircraft_id` → `null`
- `status` → `available`
- `installation_date` → `null`
- `last_inspection_date` → **unchanged** (reflects last physical inspection, not the work-order link)

#### Request Body

| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| id | string | yes | Unit UUID |

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
