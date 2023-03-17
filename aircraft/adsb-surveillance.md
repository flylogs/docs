---
description: Aircraft automatic location and flight envelope storage
---

# ADSB surveillance

Flylogs offers a limited, an automatic ADSB data storage that gather information from publicly available ADSB data sources over the Internet.

Our servers, will automatically request your aircraft information, and if any, will automatically be stored so you can use it when needed. Since this information is provided by third party websites, we can not guarantee the availability or validity of the received data, so you should always validate it with your real navigation data.



### Requirements

* Only available for [Flylogs Premium](https://www.flylogs.com/static/pricing) subscribers
* Your aircraft needs to have ADSB-out installed and working
* The coverage is limited, you can review it [here](https://opensky-network.org/network/facts)
* Enter the ADSB HEX identifier in the aircraft properties page
* The aircraft needs to be operational (Acitve in Flylogs)



Aircraft that meet those requirements, will automatically be tracked by Flylogs. Flylogs will store all received positions using the following criteria:

* **Get adsb positions every 4 minutes for aircraft:**
  * That belong to a premium company
  * That are active
  * That have a valid ADSB hex code
* **Position is requested every 3 minutes if:**
  * Aircraft last received position was less than 15 minutes ago
  * Vertical speed is more than 1000ft/min
* **Position is requested every 2 minutes if:**
  * Aircraft last received position was less than 15 minutes ago
  * Speed is less than 1kts
* **Position is requested every 1 minute if:**
  * Aircraft last position was less than 5 minutes ago
  * Speed is less than 250kts
  * Alt is below 12000 feet

### Position usage

1- You can see a summary of your aircraft location in your Manager home page. A small moving map displays all your aircraft, on which you can click to see more details.

![](<../.gitbook/assets/Screenshot 2023-03-17 at 11.54.47.png>)



2- On each aircraft details page, if the aircraft is flying, you will see again a moving map, that in this case, will display the flown route.

![](<../.gitbook/assets/Screenshot 2023-03-17 at 11.56.11.png>)

3- Every time you create a new flight, Flylogs will check if there are any received ADSB positions for that aircraft on the specified AOBT/ATOT and ALDT. If there is, a flight map will appear with all recorded ADSB data.

![](<../.gitbook/assets/Screenshot 2023-03-17 at 12.03.54.png>)
