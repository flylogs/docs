---
description: How to access and use Flylogs on desktop and mobile, system requirements, and access restrictions.
---

# How to use Flylogs

This page describes everything you need to access [https://neo.flylogs.com](https://neo.flylogs.com) successfully — supported browsers, the technical requirements your device must meet, the countries from which access is not permitted, and how to get the best experience on a smartphone.

## Supported browsers

Flylogs is built and tested against the latest two stable releases of the following desktop browsers:

* **Google Chrome** 120 or newer (recommended)
* **Microsoft Edge** 120 or newer
* **Mozilla Firefox** 115 ESR or newer
* **Apple Safari** 16 or newer (macOS Ventura, Sonoma or later)

On mobile, Flylogs supports:

* **Safari** on iOS 16 or newer
* **Chrome** on Android 10 or newer

Internet Explorer is **not supported**. Older Chromium-based browsers (Opera, Brave, Vivaldi) usually work, but we do not test against them and cannot guarantee every feature.

{% hint style="warning" %}
If the page loads blank or you see a "Session expired" loop, you are almost certainly on an unsupported or outdated browser. Update it and reload.
{% endhint %}

## Technical requirements

Flylogs is a single-page web application that runs entirely in your browser. For it to work, your device must allow:

### Cookies

Flylogs uses cookies to keep your session and your selected company. Make sure that:

* Cookies are **enabled** for `*.flylogs.com`.
* Third-party cookies do **not** need to be enabled, but if your browser is set to "block all cookies", login will fail.
* Privacy extensions (uBlock, Privacy Badger, etc.) must not block the `flylogs.com` domain.

### Local storage

Flylogs stores your authentication token, company settings, language preference and recently used filters in the browser's **localStorage**. This is required.

If your browser is configured to clear site data when you close the tab, you will be asked to log in again on every visit. To avoid this, allow Flylogs to keep site data.

### Internet connection

A **continuous internet connection is required**. Flylogs is not an offline-capable app:

* The minimum recommended bandwidth is **2 Mbps** down / **1 Mbps** up.
* Latency above ~500 ms can make the schedule and flight forms feel sluggish.
* Reports and PDF exports may require a few MB of bandwidth per document.

If your connection drops while you are editing a flight or a schedule, finish editing once the connection returns — your draft is **not** kept between sessions.

## Restricted countries

For legal and compliance reasons, access to Flylogs is **not available** from territories subject to comprehensive international sanctions. Connections originating from the following countries or regions are blocked at the network edge:

* Cuba
* Iran
* North Korea (DPRK)
* Syria
* Russia
* Belarus
* The non-government-controlled areas of Ukraine (Crimea, Donetsk, Luhansk, Zaporizhzhia, Kherson)

This list reflects the current scope of EU and OFAC comprehensive sanctions and is updated when those programs change. Attempting to access Flylogs from one of these locations — including through a VPN that surfaces a sanctioned IP — will result in an immediate connection refusal.

If you are travelling temporarily and find yourself blocked, contact your company administrator. Access for company users who are based outside the restricted territories can usually be restored once the user returns to a permitted region.

## Using Flylogs on a smartphone

The Flylogs web application is fully responsive and works on both iPhone and Android phones. There is **no separate mobile app** — the website itself adapts to small screens.

Some practical notes for using Flylogs on a phone:

* Rotate to **landscape** when filling in the flight form or reviewing schedules — the extra width makes long rows easier to read.
* Use the hamburger menu in the top-left corner to reach sections that are hidden on the desktop sidebar.
* Signing a debriefing or a flight is supported on touch screens; use your finger or a stylus.
* PDF reports open in a new tab. iOS will offer to **Share** the PDF to Files, Mail or AirDrop.

### Add Flylogs to the iPhone home screen

Adding Flylogs to your home screen gives you a one-tap icon that launches the app in full-screen mode (without the Safari address bar). This is the closest experience to a native app.

1. Open **Safari** on your iPhone — this only works in Safari, not Chrome or Firefox on iOS.
2. Navigate to [https://neo.flylogs.com](https://neo.flylogs.com) and log in.
3. Tap the **Share** button (the square with an arrow pointing up) in the bottom toolbar.
4. Scroll down in the share sheet and tap **Add to Home Screen**.
5. Edit the name if you want (the default is "Flylogs") and tap **Add** in the top-right corner.

<div style="display:flex; gap:6px; width:100%; align-items:flex-start; margin: 12px 0;">
  <a href=".gitbook/assets/IMG_0021.PNG" style="flex:1; min-width:0;"><img src=".gitbook/assets/IMG_0021.PNG" alt="Safari share menu" style="width:100%; height:auto; border-radius:6px;" /></a>
  <a href=".gitbook/assets/IMG_0022.PNG" style="flex:1; min-width:0;"><img src=".gitbook/assets/IMG_0022.PNG" alt="Add to Home Screen" style="width:100%; height:auto; border-radius:6px;" /></a>
  <a href=".gitbook/assets/IMG_0023.PNG" style="flex:1; min-width:0;"><img src=".gitbook/assets/IMG_0023.PNG" alt="Confirm name and Add" style="width:100%; height:auto; border-radius:6px;" /></a>
  <a href=".gitbook/assets/IMG_0020.PNG" style="flex:1; min-width:0;"><img src=".gitbook/assets/IMG_0020.PNG" alt="Flylogs icon on home screen" style="width:100%; height:auto; border-radius:6px;" /></a>
</div>

The Flylogs icon will now appear on your home screen. Tapping it launches the site in standalone mode — no browser tabs, no address bar, just the app.

{% hint style="info" %}
The home-screen shortcut keeps its own cookies and localStorage. The first time you open it you will be asked to log in, even if you were already signed in inside Safari.
{% endhint %}

### Add Flylogs to the Android home screen

The procedure on Android is similar:

1. Open **Chrome** on your Android phone.
2. Navigate to [https://neo.flylogs.com](https://neo.flylogs.com) and log in.
3. Tap the **three-dot menu** in the top-right corner.
4. Tap **Add to Home screen** (or **Install app** if the option is offered).
5. Confirm the name and tap **Add**.

Chrome installs Flylogs as a Progressive Web App. It will appear in your app drawer and on the home screen just like a regular app.
