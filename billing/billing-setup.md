# Billing setup

Flylogs can create bills for your flights as soon as they are recorded in the system. You can adjust the billing settings for your entire company, and even set different rates for each pilot or aircraft.

#### Steps to setup your aircraft for automatic billing

In general terms, you will need to specify general billing settings for your company and activate the billing on each aircraft you want to have automatic billing.&#x20;

1. Setup company wide billing settings
2. Enter the billing rates and packages to use later.
3. Enable billing on each one of your aircraft and associate billing rates to each one.
4. Customize billing rates as neccesary for each pilot. You may also activate/deactivate billing availability for each pilot if neccesary.

Once you have performed this basic setup, you will be able to manually bill any flight.

### Manual billing

Within your flights section, you will find the billing list. This list, is a quick view of all your flights with basic flight information and billing status.

By clicking in any of the rows, you will open the manual flight billing window wich will allow you to easily select the desired billed person, rate and extra expenses.

<figure><img src="../../.gitbook/assets/Screenshot 2023-04-13 at 15.46.38.png" alt=""><figcaption><p>Flight billing list</p></figcaption></figure>





### Automatic Billing

Automatic billing happens 2 minutes after the flight was confirmed.

The bill will be issued to the selected pilot or the default billed pilot set in your company billing settings.

Flylogs will automatically multiply the flight, block, tach or Hobbs time (whichever billing criteria the aircraft is configured with) by the first rate that you specify in the aircraft configuration.

The bill will appear in your flight billing list and also in the flight it self.

This bill can be still edited or deleted if needed by you or any other billing manager you may have created.

The process takes into consideration all billing rates, company settings and available user packages as displayed in the following schema:

<figure><img src="../../.gitbook/assets/Untitled Diagram.jpg" alt=""><figcaption><p>Automatic billing process schema</p></figcaption></figure>

1. If there was no specific BILL TO person in the flight, the system will use your company settings to determine who is the flight crew to be selected.
2. Flylogs will check if the BILL TO user has any available packages, and if these, are valid for the aircraft used in the flight.
   1. If there are packages available, these will be used in order of purchase.
   2. Otherwise, default user/aircraft billing rates will be used combined with company extra expenses and taxes.
3. Last, if the company settings require user notification, a quick email notification will be delivered to the user confirmed email address.



### Bill numbers and receipts

Every bill, whether it comes from a flight or from a manual transaction, receives a **bill number**. Numbers are consecutive within your company and shared by flight bills and transactions. By default they never restart; if your company enables **Restart bill numbers every year** in its billing settings, numbering starts again at 1 every 1 January and bills show the year first, for example `2026/1`.

* Bills created before this change keep the number they already had. Some older numbers repeat across different years, because the old numbering restarted every January 1st.
* Older bills that never had a number can be numbered by editing them and ticking **Create bill and assign correlative number**.
* Bills are numbered in the order they are saved, not by their date. A bill saved today with a past date gets today's next number.

When you create or edit a manual transaction there are two independent checkboxes:

* **Create bill and assign correlative number** (checked by default): the label shows the number the bill will receive, for example `505`, or `2026/505` when numbering restarts every year. The transaction receives that number when it is saved. Unchecked, the transaction is recorded without a number; if the bill already had one, the number is removed. The checkbox shows the current state when you edit a bill, so an older bill without a number appears unchecked: tick it and save to give it the next number.
* **Send this receipt to the user** (unchecked by default): the user is notified (if your company billing settings have notifications enabled) and receives a link to the receipt. Unchecked, the transaction is recorded but the user is not notified.

One does not depend on the other: you can number a bill without notifying the user, or notify the user of a bill without number.

Automatic flight billing is not affected by this checkbox; it follows your company notification setting.

### Transactions, bills and flights lists

In the manager **Bills** page, the filter at the top separates your records into three lists:

* **Transactions:** manual transactions saved **without** a bill number.
* **Bills:** manual transactions that **have** a bill number.
* **Flights:** bills generated from flights. These always have a bill number.

Moving a transaction between **Transactions** and **Bills** is done by editing it and ticking or unticking **Create bill and assign correlative number**. The date filter covers the current year by default (1 January to 31 December), and each list is sorted by creation date, newest first.
