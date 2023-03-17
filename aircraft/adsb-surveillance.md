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



#### Flylogs will store all received positions using the following criteria:

Eligible aircraft, will automatically be tracked by Flylogs at least **once every 15 minutes,** with the following improvements:

* **Every 5 minutes** for aircraft that have a live position in the **last 30 minutes.**
* **Every 3 minutes if:**
  * Aircraft last received position was less than 15 minutes ago,
  * and vertical speed is more than 1000ft/min or less than -1000ft/min.
* **Every 2 minutes if:**
  * Aircraft last received position was less than 15 minutes ago,
  * and speed is less than 1kt.
* **Every minute if:**
  * Aircraft last stored position within the last 10 minutes,
  * and speed is less than 250kts,
  * and altitude is below 12000 feet.

### ADSB data usage and display:

1- You can see a summary of your aircraft location in your Manager home page. A small moving map displays all your aircraft, on which you can click to see more details.

![](<../.gitbook/assets/Screenshot 2023-03-17 at 11.54.47.png>)



2- On each aircraft details page, if the aircraft is flying, you will see again a moving map, that in this case, will display the flown route.

![](<../.gitbook/assets/Screenshot 2023-03-17 at 11.56.11.png>)

3- Every time you create a new flight, Flylogs will check if there are any received ADSB positions for that aircraft on the specified AOBT/ATOT and ALDT. If there is, a flight map will appear with all recorded ADSB data.

![](<../.gitbook/assets/Screenshot 2023-03-17 at 12.03.54.png>)
