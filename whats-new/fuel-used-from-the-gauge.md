# New: fuel used, worked out from the gauge

**November 2026** · Flights

Pilots read the fuel gauge and know what went into the tank. Fuel used is arithmetic, so Flylogs now does it for them:

> **Fuel used = fuel on board at start + fuel uplifted between legs − fuel on board at end**

***

### On every flight

Aircraft that track fuel get two new fields on the flight form: **Fuel on board at start** and **Fuel on board at end**, read at engine start and shutdown. Fuel used appears under them as you type, and on the flight page, the flight PDF and the logbook export.

### Uplifts between legs

For flights with [legs](../flights/flight-legs.md) — skydiving lifts, tows, survey runs — each leg now records the **fuel uplifted after it**: "after leg 3, 400 litres". Fuel on board at a leg's start and end is optional, and gives that leg its own fuel used. A new leg pre-fills its start fuel from the previous leg's end plus the uplift.

Every uplift after a leg is added to the flight's refuelling on **Billing → Fuel & Excise**, so nothing is typed twice.

### Pounds on the gauge, litres at the pump

Your company can now set an **uplift unit** in **Company Settings → Flights → Fuel**, separate from each aircraft's fuel tracking (gauge) unit: gauges in pounds refuelled in litres, for example. It is one setting for the whole fleet, because fuel is bought in the same unit whatever the aircraft. Set each such aircraft's **fuel type** too, so pounds convert to litres with the right density (Jet A-1 0.804 kg/l). Without it Flylogs says so instead of guessing.

<figure><img src="../.gitbook/assets/company-settings-fuel-uplift-unit.png" alt="Company Settings, Flights tab: the Fuel uplift unit set to Litres"><figcaption><p>One uplift unit for the whole fleet.</p></figcaption></figure>

1,500 lb at start, 400 l uplifted after leg 1, 1,100 lb at end, Jet A-1: fuel used is **625.7 l**.

***

[Manual: Flight legs → Fuel](../flights/flight-legs.md#fuel)
