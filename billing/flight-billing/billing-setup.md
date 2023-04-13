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

Flylogs will automatically multiply the flight/bock or tach time by the first rate that you specify in the aircraft configuration.

The bill will appear in your flight billing list and also in the flight it self.

This bill can be still edited or deleted if needed by you or any other billing manager you may have created.

The process takes into consideration all billing rates, company settings and available user packages as displayed in the following schema:

<figure><img src="../../.gitbook/assets/Untitled Diagram.jpg" alt=""><figcaption><p>Automatic billing process schema</p></figcaption></figure>

1. If there was no specific BILL TO person in the flight, the system will use your company settings to determine who is the flight crew to be selected.
2. Flylogs will check if the BILL TO user has any available packages, and if these, are valid for the aircraft used in the flight.
   1. If there are packages available, these will be used in order of purchase.
   2. Otherwise, default user/aircraft billing rates will be used combined with company extra expenses and taxes.
3. Last, if the company settings require user notification, a quick email notification will be delivered to the user confirmed email address.

