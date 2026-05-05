---
description: Index page, folder organization and group-based access
---

# Document Library

Discover all about the [Document Library here](https://flylogs.com/features/aeronautical-documentation)!

Flylogs Company Document Library is an embedded system in your Flylogs account that lets you store company manuals and other files and share them with the rest of your company.

The main features of the system are:

* Group level access privileges
* File version control
* Download registry
* File comments
* File folders

### How the index page works

The index page is the entry point of the library. It lists the documents and subfolders inside the current folder, with the **Main Folder** shown by default. Click any folder card to open it, or use the search box to look up a document by name across the whole library.

Each row shows the document name, description, latest version uploader and creation date. A quick download button is offered for the current version.

### File folders

For better organization, you can create as many folders as needed for your documents. Folders are flat per company — they are not nested visually, but each document belongs to exactly one folder.

![](https://tawk.link/61f94bae9bd1f31184da67e3/kb/attachments/Ee0r0ZX5Ha.png)

Use folders to separate operational manuals, training material, forms, etc. The same access rules apply regardless of the folder a document lives in.

### Group level access privileges

For each document you publish you choose which **user groups** can access it. Permissions are evaluated when the index page is rendered, so users only see documents their group is authorized to read.

* Users outside the recipient groups will not see the document at all in the index.
* Documents marked as `flying_only` are hidden from non-pilots, even if their group is in the recipient list.
* Document owners always see their own documents in the index, regardless of the recipient list.
* Top-level company administrators (group level 105 or below) see every document in the company.

This filtering is applied **before pagination**, so search results and folder counts always reflect what the current user is allowed to see.

### File version control

Each time you update a published document you can publish the new version. Flylogs keeps old versions hidden but still available to you in the future.

Every new version renews the cycle: every authorized member needs to download the file again, comments are cleared and the download registry is reset for the new version.
