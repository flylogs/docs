---
description: Set up an aircraft Mass & Balance profile and calculate, sign and print a loadsheet for each flight
---

# Mass & Balance

Flylogs calculates a **Mass & Balance loadsheet** for each flight. Enter who and what is aboard and the fuel. Flylogs then works out the zero fuel, ramp, take-off and landing mass and centre of gravity (CG). It checks them against the aircraft's limits and plots them on the CG envelope.

Each aircraft needs a **Mass & Balance profile** before its flights can have a loadsheet.

{% hint style="warning" %}
Flylogs does the arithmetic, but the pilot in command stays responsible for loading the aircraft. Every figure in the profile must come from **this aircraft's** approved flight manual (AFM/POH, section 6) and its **latest weighing report**.
{% endhint %}

## The aircraft profile

Open the aircraft and find the **Mass & Balance** card, under *Certificates & expirations*. Click **Set up**, or **Edit** if a profile already exists.

A profile contains:

| Section | What to enter |
|---------|---------------|
| **Units** | Mass in **kg** or **lb**; arm in **m**, **mm**, **cm** or **in**. Use the units of the flight manual. Changing a unit does **not** convert values already entered. |
| **Weighing** | Basic empty mass and its arm, weighing date and weighing report reference. |
| **Limits** | Max take-off mass (required), max landing, max zero fuel and max ramp mass (optional). |
| **Loading stations** | One row per seat row, baggage area or fuel tank, each with its arm from the AFM loading table. Seats and baggage can have a maximum mass. Fuel tanks have a fuel unit (litres, US or imperial gallons), a **density**, and an optional usable capacity. The **AVGAS** and **Jet A-1** buttons fill a typical density; check it against your AFM. |
| **CG envelope** | The forward and aft limits as *mass / arm* points, exactly as the AFM or type certificate gives them. Between points the limit is a straight line. Below the first point and above the last it stays constant. |
| **Landing envelope** | Optional, for aircraft whose landing CG limits differ from take-off. |

The preview chart updates as you type. Before saving you must tick the box confirming you checked every value against the flight manual and weighing report.

### Type templates

To save typing, choose a **type template**. Templates for your aircraft model are listed first. A template fills in the units, maximum masses, envelope and whatever loading stations the public data gives. It never fills in the basic empty mass or arm.

Templates exist for common types such as the Cessna 150/152/172/206/210/208, Piper PA-28-181, PA-34 Seneca V and PA-38, Diamond DA40 / DA40 NG / DA42 / DA62, Tecnam P2008 / P92 / P-Mentor, Cirrus SR20/SR22, TBM 700 N and Pilatus PC-12/47E. They come from public **type certificate data sheets** and, where noted, AFM pages. Each template names its source and lists what to check: serial number ranges, modifications that change the limits, and stations you still need to add.

{% hint style="info" %}
A template is a starting point, not a certified profile. Many types have several envelopes depending on serial number or installed modifications (for example the DA40 NG maximum take-off mass of 1280 or 1310 kg). Always compare it with your own flight manual.
{% endhint %}

Not covered: helicopters (they need a lateral CG check), aircraft whose limits are only given in % MAC, and airliners or business jets (use your operator's loadsheet system).

### Who can edit the profile

| Action | Who |
|--------|-----|
| View the profile | Everyone in the company |
| Create, edit or delete it | Flylogs Administrator, Company Administrator, Operations Manager, Compliance & Safety Manager, Chief Pilot, Mechanic — and the **private owner** of the aircraft |

Deleting a profile does not change loadsheets already saved on flights: each keeps its own copy.

## The flight loadsheet

On a flight with an aircraft that has a profile, the **Loadsheet** card appears in the right-hand column. Click **Calculate loadsheet** (or **Open loadsheet** once one exists).

1. For each seat and baggage station, enter the **mass** and optionally who or what is there. For a new loadsheet Flylogs fills in the names of the crew and of the passengers from the passenger manifest. Masses are always left for you to enter.
2. For each fuel tank enter volumes:
   * **Take-off**: fuel on board at take-off.
   * **Taxi**: fuel burnt before take-off (adds to the ramp mass).
   * **Trip**: fuel burnt before landing.
3. The **Result** panel shows the zero fuel, ramp, take-off and landing mass and CG against the maximums, a list of every limit exceeded, and the points on the envelope chart.
4. Click **Save**. The server recalculates the loadsheet with the aircraft's current profile and stores it with the flight, including a copy of the profile used.

The loadsheet checks:

* each station's maximum mass and each tank's usable capacity,
* trip fuel not greater than take-off fuel,
* max zero fuel, ramp, take-off and landing mass,
* CG inside the envelope at zero fuel, take-off and landing (landing uses the landing envelope when there is one).

### Signing

Once a loadsheet is saved **within limits**, the **PIC** (or the flight's **supervisor**) can **Sign** it by entering their password. The signature records who, when and from which device. It is bound to the exact numbers saved.

* Changing any figure and saving again **removes** the signature.
* A loadsheet **outside limits cannot be signed**.
* If the aircraft or its profile changes after saving, the loadsheet is marked as out of date. Save it again to recalculate before signing.
* If the stored numbers no longer match the signature, Flylogs shows the signature as **invalid**.

### PDF

**PDF** prints the saved loadsheet: flight details, loading table, results, exceeded limits, the envelope chart, who calculated it and who signed it. Save your changes first; the PDF always shows the stored loadsheet, not unsaved screen values.

### Who can use loadsheets

| Action | Who |
|--------|-----|
| View | Anyone who can view the flight. Captains, pilots, students and cabin crew (groups above Flight Instructor, below Auditor) only for flights they are on or aircraft they own |
| Calculate, save or delete | The flight's creator, PIC, SIC or supervisor; the aircraft owner; Flylogs Administrator, Company Administrator, Operations Manager, Compliance & Safety Manager, Flight Dispatcher, Chief Pilot and Flight Instructor. Not on cancelled or deleted flights |
| Sign | The PIC or the supervisor only (the creator if the flight has no PIC) |

Auditors and cabin crew can read loadsheets but not change them.

See also the [Mass & Balance API](../API/mass-balance.md).
