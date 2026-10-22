---
description: >-
  Efficiently Track and Manage the Status, Lifecycle, and Requirements of Your
  Maintenance Warehouse Items
---

# Inventory

The inventory tracking system is designed to help you manage and monitor the status, lifecycle, and requirements of your maintenance warehouse items. It enables efficient tracking of stock levels, predicts future needs, and facilitates seamless communication and work organization with your engineering team.

<figure><img src="../../.gitbook/assets/InventoryItemsList.png" alt=""><figcaption></figcaption></figure>

The system displays all part numbers in your catalog, and you can add the numbers available in your stock. These serial numbers can be linked to a specific company base, work order, or aircraft. This functionality allows you to track the location and status of each serial number, ensuring complete visibility and control over your inventory.

### Stock counts

The inventory list shows three unit counts for each part:

| Column | What it counts |
|--------|----------------|
| **Units** | Every unit you have recorded for the part |
| **Installed** | Units whose status is *Installed* (fitted to an aircraft) |
| **Available** | Units whose status is *Available*: the stock you can still issue from stores. Shown in red when it reaches 0 |

<figure><img src="../../.gitbook/assets/inventoryStockList.png" alt="Inventory list with Units, Installed and Available columns"><figcaption><p>Units, Installed and Available for every part</p></figcaption></figure>

When you fit a unit to an aircraft, open the part, click the unit and pick the **Aircraft**: a unit that was *Available* becomes **Installed** automatically (you can also set the status yourself). Add the **Installation Date** and save. The unit then moves from *Available* to *Installed*, so the list always shows how much stock is left.

<figure><img src="../../.gitbook/assets/inventoryUnitInstall.png" alt="Edit Unit with the aircraft, installation date and a Certificate of Conformity"><figcaption><p>Installing a unit on an aircraft</p></figcaption></figure>

The part page shows the same three counts above its units, and each installed unit shows its aircraft and installation date.

<figure><img src="../../.gitbook/assets/inventoryItemUnits.png" alt="Units card with one unit installed and one available"><figcaption><p>Units of a part after one was installed</p></figcaption></figure>
 Units in other statuses (Ordered, Received, Removed, Overhauled, Retired…) count towards *Units* only.

If you set an ATA chapter on a part, the list shows it next to the category.

### Searching

The search box above the list finds parts by part number, name, manufacturer, model, ATA chapter or description, and by the serial, batch, lot or certificate number of any of their units. Use **Filters** to narrow the list by category or approval status.

<figure><img src="../../.gitbook/assets/inventorySearchSerial.png" alt="Searching the inventory by a unit serial number"><figcaption><p>Finding a part from a unit's serial number</p></figcaption></figure>

### Release documents

Each unit can record its release document: EASA Form 1, FAA 8130-3, JAA Form 1, TCCA Form 24-0078, ANAC SEGVOO 003, **Certificate of Conformity** (common for parts bought from distributors rather than the manufacturer) or Other, with the certificate number and date.

### Part details

For each inventory item, you can see all details, as well as provider information and available serials in your warehouse.

&#x20;

<figure><img src="../../.gitbook/assets/InventoryItemDetails.png" alt=""><figcaption><p>Inventory Part details</p></figcaption></figure>

