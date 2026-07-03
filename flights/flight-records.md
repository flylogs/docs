# Flight records

### Data safety

By entrusting your flight data to Flylogs, you can rest assured that our robust and dependable audit and reporting tools will provide you with peace of mind and ensure compliance with all regulatory requirements.

Flylogs uses a system like a computerized notebook called a blockchain to save your flight information. Once a flight is confirmed, it cannot be changed. Instead, every change you make creates a new record that replaces the old one. This guarantees that you will always have a full record of any changes made to any of your flights, along with the user name that made those changes and a brief required description.



### **Flight data lifecycle**

Flylogs flight data storage has been developed to be easy to understand, fast to manage and specially secure.

A flight can be in any of the following status:

* Draft
* Confirmed
* Deleted

> A **draft** flight can be cancelled by its crew at any time, regardless of the flight date. See [Cancelling a flight](#cancelling-a-flight) below.

<figure><img src="../.gitbook/assets/Flights - visual selection.png" alt=""><figcaption></figcaption></figure>

### DRAFT

As the name indicates, this is just a draft that can be easily edited.

Drafts are usually only visible by the crew selected on the flight and do not appear on regular flight listings. A draft can be edited and deleted by the crew but this depends on your company settings.

To edit a draft you will need to have at least CREATE FLIGHT permissions within your company. A draft will always be indicated by a green DRAFT box.

Drafts are automatically cleaned from the system after 60 days if they are not confirmed into flights.

![](https://tawk.link/61f94bae9bd1f31184da67e3/kb/attachments/5sPPuW-y6L.png)

***

### CONFIRMED flights

If we have the permission to do so, after filling in the date, and flight time information in a draft, we will see a GREEN confirmation button on the flight view page top right corner.

The **Confirm** button only appears when:

* The draft has the four block/takeoff/landing times filled in and the landing time is in the past.
* Your user type has the **Confirm flights** permission enabled (Company Administrators, Operations Managers, and Compliance & Safety Managers always see it).
* The flight has a block time greater than zero, an aircraft, and a PIC.

_To learn more about company permissions, read the_ [_Flight permissions section in Company Settings_](../company-management/company-settings/flights.md#flight-permissions)_._<br>

![](https://tawk.link/61f94bae9bd1f31184da67e3/kb/attachments/o-8DINhaSx.png)

When pressed a confirmation dialog will ask to please check the data before proceeding.

Also, depending on the company settings, you may be required to enter your password to sign the action.<br>

![](https://tawk.link/61f94bae9bd1f31184da67e3/kb/attachments/x6ZL5XJ0Mo.png)

***

###

### DELETED flights

Flights can be completely deleted when they are a DRAFT. Once a flight has been confirmed, it can be deleted but the system will NOT actually delete the flight. The flight will be marked as deleted, the flight times will be removed from the logbooks and any associated bills will be erased, but the flight it self, remains in your Flylogs records as a deleted record.

Only the user profiles that you set up in your company settings are allowed to delete flights. Company Administrators, Operations Managers, and Compliance & Safety Managers can always edit and delete any flight regardless of these settings. For all other roles, the **Edit & delete flights** permission controls both the edit and the delete buttons. Even without this permission:

* If the flight is still a **Draft**, the assigned PIC or the user who created the flight can always edit it.
* If the flight has been **Confirmed**, the assigned PIC or the user who created the flight can still edit it for **24 hours** after it was last modified.

_To learn more about company permissions, read the_ [_Flight permissions section in Company Settings_](../company-management/company-settings/flights.md#flight-permissions)_._<br>

Flight modification history will be preserved but flight attachments like PDF documents will be erased after 24 hours.

***

### Cancelling a flight

Cancelling applies to **draft** flights (a flight that has not been confirmed yet, typically a planned or dispatched flight that is not going to happen). The **Cancel Flight** button appears on the flight view page for any draft, and a cancellation reason is required.

**Date is not a restriction.** A draft can be cancelled at any time, including drafts dated in the past — for example a flight instructor cancelling yesterday's flight. There is no minimum-anticipation or "future only" rule on flight cancellation.

**Who can cancel.** Any of the following can cancel a draft:

* A crew member of the flight — the **PIC**, the **SIC**, or the **Supervisor** (also shown as Examiner or Specialist depending on company type).
* The user who **created** the flight.
* Any user whose role has the **Create flights**, **Edit & delete flights**, or **Confirm flights** permission.
* Company Administrators, Operations Managers, and Compliance & Safety Managers always can (they bypass the permission gates).

If you open a draft you are **not** allowed to cancel, the **Cancel Flight** button is still shown, but disabled. Hovering it explains why — only the flight crew (PIC, SIC or supervisor), the flight's creator, or staff with flight permissions can cancel the flight.

When a flight is cancelled, the crew (other than the user cancelling) are notified, and the cancellation is recorded in the flight change history with the reason. Cancelling requires a live connection; while offline the cancellation is queued and applied when you reconnect.

_To learn more about company permissions, read the_ [_Flight permissions section in Company Settings_](../company-management/company-settings/flights.md#flight-permissions)_._<br>
