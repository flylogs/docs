# Inventory

Manage maintenance inventory parts, units, and providers. Requires **premium**, **unlimited**, or **club** subscription plan.

## Available Items (dropdown selector)

<mark style="color:blue;">`GET`</mark> `/maintenance/inventory/available.json`

Returns a flat list of inventory items that have **at least one `InventoryUnit` not yet assigned to a work order** (i.e. `inventory_units.workorder_id IS NULL`). Intended for populating dropdown selectors when picking parts to add to a work order — items whose units are all already attached to some work order are omitted.

Scoped to the authenticated user's company. No request body, no pagination.

#### Response

```json
{
  "items": [
    { "id": "d4e5f6a7-b8c9-0123-defg-h12345678901", "name": "Oil filter", "category": "Engine" },
    { "id": "e5f6a7b8-c9d0-1234-efgh-i12345678901", "name": "Spark plug",  "category": "Engine" }
  ]
}
```

| Field | Type | Description |
|-------|------|-------------|
| id | string | Inventory UUID |
| name | string | Part name |
| category | string | Part category (used as the "type" label in selectors) |

Items are ordered by `name ASC`.

---

## List Inventory

<mark style="color:green;">`POST`</mark> `/maintenance/inventory/index.json`

Retrieve every inventory part for the company, ordered by part number. The list is not paged in practice (up to 10,000 items per page).

#### Request Body (optional filters)

| Parameter | Type | Description |
|-----------|------|-------------|
| category | string | Filter by part category |
| status | string | Filter by approval status |
| certification | string | Filter by part certification (see Selectables `certifications`) |
| name | string | Keyword search in part number, name, manufacturer, model, ATA chapter, certification and description, and in the serial, batch, lot and certificate numbers and remarks of the item's units |

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
        "certification": "EASA Form 1",
        "ata_chapter": "79",
        "description": "Standard oil filter for Lycoming engines.",
        "deleted": false
      },
      "InventoryUnit": [
        {
          "id": "e5f6a7b8-c9d0-1234-efgh-i12345678901",
          "aircraft_id": "45",
          "status": "installed",
          "base_id": "b1c2d3e4-f5a6-7890-abcd-ef1234567890",
          "Base": { "id": "b1c2d3e4-f5a6-7890-abcd-ef1234567890", "name": "Main base" }
        }
      ],
      "InventoryProvider": {
        "id": "f6a7b8c9-d0e1-2345-fghi-j12345678901",
        "name": "Aviation Parts Inc."
      }
    }
  ],
  "paginate": {
    "page": 1,
    "current": 85,
    "count": 85,
    "prevPage": false,
    "nextPage": false,
    "pageCount": 1,
    "limit": 10000
  }
}
```

`InventoryUnit` lists the item's units that have not been deleted. The NEO list shows three counts from it: **Units** (all units), **Installed** (`status` = `installed`) and **Available** (`status` = `available`). Units in any other status (`ordered`, `received`, `removed`, `overhauled`, `retired`…) count towards Units only.

Each unit's `Base` is where the unit is kept. NEO's stock schedule export (Excel / PDF, built in the browser from this response) shows it as **Stock location**: the available units per base, e.g. `Main base (12)`. `InventoryProvider` is the part's supplier (`null` when none).

`certification` is the release document the part comes with (`EASA Form 1`, `FAA 8130-3`, `JAA Form 1`, `TCCA Form 24-0078`, `ANAC SEGVOO 003`, `Certificate of Conformity`, `Other`), or `null`. The same values are accepted for `InventoryUnit.certificate_type`. NEO labels `description` as **Notes**.

---

## Selectables

<mark style="color:blue;">`GET`</mark> `/maintenance/inventory/selectables.json`

Retrieve available status, category and certification values for building forms.

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
  "certifications": {
    "EASA Form 1": "EASA Form 1",
    "FAA 8130-3": "FAA 8130-3",
    "JAA Form 1": "JAA Form 1",
    "TCCA Form 24-0078": "TCCA Form 24-0078",
    "ANAC SEGVOO 003": "ANAC SEGVOO 003",
    "Certificate of Conformity": "Certificate of Conformity",
    "Other": "Other"
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

`InventoryChange` is the history of the part **and of its units** (added `ADD`, edited `CNG`, deleted `DEL`, `INSTALL`, `REMOVE`), newest first, up to 500 rows. `model` tells whether a row is about the part (`Inventory`) or a unit (`InventoryUnit`, with its `serial_number` kept even after the unit is deleted). `INSTALL`/`REMOVE` rows carry the aircraft and its airframe time (`aircraft_seconds`, whole seconds) and landings at that moment.

Each unit's `Aircraft` carries its current `hours` (decimal) and `landings`, so the unit's life can be computed: see [Edit Unit](inventory-units.md#edit-unit).

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
        "id": "912",
        "model": "InventoryUnit",
        "foreign_key": "e5f6a7b8-c9d0-1234-efgh-i12345678901",
        "inventory_id": "d4e5f6a7-b8c9-0123-defg-h12345678901",
        "serial_number": "SN-001234",
        "action": "INSTALL",
        "aircraft_id": "45",
        "aircraft_seconds": "16273800",
        "aircraft_cycles": "11230",
        "created": "1714003200",
        "Aircraft": { "id": "45", "registration": "EC-ABC" },
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
        "InventoryProvider": {
          "id": "f6a7b8c9-d0e1-2345-fghi-j12345678901",
          "name": "Aviation Parts Inc."
        },
        "life_limit_hours": "500.00",
        "installed_aircraft_seconds": "16273800",
        "installed_aircraft_cycles": "11230",
        "used_seconds": "0",
        "used_cycles": "0",
        "Aircraft": {
          "id": "45",
          "registration": "EC-ABC",
          "active": true,
          "maintenance": true,
          "flight_count": "1200",
          "hours": "4560.50000",
          "landings": "11290",
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
| Inventory[ata_chapter] | string | no | ATA chapter (up to 10 characters) |
| Inventory[certification] | string | no | Release document the part comes with, one of `certifications` from Selectables; send an empty value to clear it |
| Inventory[description] | string | no | Part notes (shown as **Notes** in NEO) |
| Inventory[inventory_provider_id] | string | no | Supplier UUID, one of the company's suppliers (404 otherwise); send an empty value to clear it |
| InventoryProvider[name] | string | no | Supplier by name: links the company's supplier of that name (case and spacing ignored), creating it only when there is none |
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

## List Suppliers

<mark style="color:blue;">`GET`</mark> / <mark style="color:green;">`POST`</mark> `/maintenance/inventory/providers.json`

The company's parts suppliers, ordered by name. Deleted (merged) suppliers are not listed. Each supplier carries how many parts and units point at it.

Available to every group that inherits the default allow (managers 1/100/105/110, staff 120–170, mechanics 300) and to auditors (250). Pilots and students (190, 200) and the default-deny groups (180, 240, 245) get `403`. The maintenance section needs the Club, Premium or Unlimited plan.

#### Request Body (optional)

| Parameter | Type | Description |
|-----------|------|-------------|
| search | string | Search in name, contact, email, phone and account number |

#### Response

A JSON array:

```json
[
  {
    "InventoryProvider": {
      "id": "f6a7b8c9-d0e1-2345-fghi-j12345678901",
      "company_id": "c1d2e3f4-a5b6-7890-abcd-ef1234567890",
      "name": "Aviation Parts Inc.",
      "contact_name": "Jane Doe",
      "email": "parts@example.com",
      "phone": "+1234567890",
      "website": "www.example.com",
      "address": "Hangar 3, Main Airport",
      "vat": "IE1234567X",
      "account_number": "FL-0042",
      "notes": "Net 30",
      "deleted": false,
      "created": "1793025958",
      "modified": "1793025958",
      "parts": 4,
      "units": 27
    }
  }
]
```

`parts` and `units` count the parts and units (not deleted) that name this supplier — what a merge would move.

---

## View Supplier

<mark style="color:blue;">`GET`</mark> `/maintenance/inventory/provider/{id}.json`

Retrieve one supplier of the company (404 for another company's or a deleted one). Same access as List Suppliers.

#### Path Parameters

| Parameter | Type | Description |
|-----------|------|-------------|
| id | string | Supplier UUID |

#### Response

The `InventoryProvider` object as in List Suppliers, without `parts` / `units`.

---

## Create or Edit Supplier

<mark style="color:green;">`POST`</mark> `/maintenance/inventory/provider_edit.json`

Create a supplier, or edit one when `InventoryProvider[id]` is sent. Names are unique within the company, ignoring case and spacing: a second "Tecnam" is refused with `errors.name`. The company is always the caller's.

Managers (user groups 1, 100, 105, 110) and mechanics (300) only. Other groups get `403`.

#### Request Body

| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| InventoryProvider[id] | string | no | Supplier UUID (omit to create) |
| InventoryProvider[name] | string | yes | Supplier name |
| InventoryProvider[contact_name] | string | no | Contact person |
| InventoryProvider[email] | string | no | Email (validated when given) |
| InventoryProvider[phone] | string | no | Phone |
| InventoryProvider[website] | string | no | Website |
| InventoryProvider[address] | string | no | Postal address |
| InventoryProvider[vat] | string | no | Supplier's VAT number |
| InventoryProvider[account_number] | string | no | Your own account / customer number with this supplier |
| InventoryProvider[notes] | string | no | Free notes |

Fields that are sent are saved as sent, so an empty value clears that field.

#### Response

```json
{
  "result": true,
  "message": "Supplier saved",
  "errors": null,
  "provider": {
    "InventoryProvider": { "id": "f6a7b8c9-d0e1-2345-fghi-j12345678901", "name": "Aviation Parts Inc.", "...": "..." }
  }
}
```

On validation failure:

```json
{
  "result": false,
  "message": "Could not save the supplier due to validation errors",
  "errors": { "name": ["A supplier with this name already exists"] },
  "provider": null
}
```

---

## Delete or Merge Supplier

<mark style="color:green;">`POST`</mark> `/maintenance/inventory/provider_delete.json`

Delete a supplier. To clean up a duplicate, send `merge_into`: every part and unit of the deleted supplier moves to that supplier first, and the kept supplier's **blank** details (contact, email, phone, website, address, VAT, account number) are filled from the deleted one — its own values are never overwritten; notes are appended. Everything happens in one transaction.

A supplier still used by parts or units is only deleted with `merge_into`; without it the call answers `409` with the counts, so no part loses its supplier silently.

Managers (user groups 1, 100, 105, 110) and mechanics (300) only. Other groups get `403`.

#### Request Body

| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| id | string | yes | Supplier to delete |
| merge_into | string | no | Supplier that receives its parts and units (must be another supplier of the company) |

#### Response

```json
{
  "result": true,
  "message": "Supplier merged into Aviation Parts Inc.",
  "merged": { "parts": 1, "units": 12 }
}
```

Still in use, no `merge_into` (`409`):

```json
{
  "result": false,
  "message": "This supplier is used by 1 part(s) and 12 unit(s). Choose another supplier to move them to.",
  "parts": 1,
  "units": 12
}
```

`400` when `merge_into` is the supplier itself; `404` when either supplier is not one of the company's live suppliers. Deleted suppliers are kept as records (soft delete) so old history still resolves.

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
