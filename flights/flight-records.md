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

> A flight can be cancelled if the DRAFT was created by a crew member from a schedule record.

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
* Your user type has the **Confirm flights** permission enabled (Company Administrators and Operations Managers always see it).
* The flight has a block time greater than zero, an aircraft, and a PIC.

_To learn more about company permissions, read the_ [_Flight permissions section in Company Settings_](../company-management/company-settings.md#flight-permissions)_._<br>

![](https://tawk.link/61f94bae9bd1f31184da67e3/kb/attachments/o-8DINhaSx.png)

When pressed a confirmation dialog will ask to please check the data before proceeding.

Also, depending on the company settings, you may be required to enter your password to sign the action.<br>

![](https://tawk.link/61f94bae9bd1f31184da67e3/kb/attachments/x6ZL5XJ0Mo.png)

***

###

### DELETED flights

Flights can be completely deleted when they are a DRAFT. Once a flight has been confirmed, it can be deleted but the system will NOT actually delete the flight. The flight will be marked as deleted, the flight times will be removed from the logbooks and any associated bills will be erased, but the flight it self, remains in your Flylogs records as a deleted record.

Only the user profiles that you setup in your company settings are allowed to delete flights. The **Edit & delete flights** permission controls both the edit and the delete buttons. Even without this permission, the user who created the flight or the assigned PIC can still edit it for **24 hours** after it was last modified.

_To learn more about company permissions, read the_ [_Flight permissions section in Company Settings_](../company-management/company-settings.md#flight-permissions)_._<br>

Flight modification history will be preserved but flight attachments like PDF documents will be erased after 24 hours.
