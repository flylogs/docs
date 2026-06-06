---
description: Extra data and tools available to company managers on the Document Library
---

# Manager tools

Company managers have access to extra data on top of the regular document view, designed to help track who has read each document and to audit compliance with company publications.

> Manager tools are available to users in **group level 150 or lower** (administrators and managers). Pilots and other regular members do not see them.

### Download registry

For each document, managers can see the full download history of the current version, including:

* User name and group
* Download date
* IP information when available

Re-downloads by the same user are not duplicated — the registry reflects unique readers per version, which is the figure that matters for compliance.

![](https://tawk.link/61f94bae9bd1f31184da67e3/kb/attachments/TitB2ImhZs.png)

### Pending users

Together with the download list, the view page shows a **Pending users** list — authorized users who have not yet downloaded the current version. The list is built from the document's authorized user groups minus the users that already downloaded, excluding inactive and deleted accounts.

This is the easiest way to chase the few crew members that still need to read a critical publication.

### Version reset

Publishing a new version clears the download registry and the comments for that document. From that moment, the **Pending users** list shows every authorized user again and the cycle restarts.

This guarantees that "downloaded" always refers to the current publication, never to an older one.

### Cross-company visibility

Because manager tools are tied to the company scope, managers see download data only for documents owned by their own company. There is no cross-company visibility, even for users that belong to multiple companies.

## Stats page

The **Stats** page (in the left menu, under Documents) gives a company-wide view of compliance, document status and staff read acknowledgements — rather than the per-document figures above.

> The Stats page is only visible and accessible to users in **group level 145 or lower**. It is hidden from the menu for everyone else, and opening its link directly shows an access-denied screen.

At the top it shows overall compliance: total read receipts **requested** versus how many have been **read**, with the remaining **pending**. The numbers can then be broken down three ways:

* **By group** — requested vs read per user group, expandable to list each user inside the group.
* **By user** — a searchable list, with a group filter, showing each person's requested vs read counts.
* **By document** — requested vs read for each document, with its publication and expiration dates.

A receipt is requested once per document for every active user in the document's authorized groups (`flying crew only` documents count pilots only), and counts as read when the user has opened the **current** version. Publishing a new version resets those receipts, exactly like the per-document registry. Deactivated and deleted accounts are excluded.
