---
description: Flylogs Company Account Setup Guide
---

# Quick start guide

This guide is intended to help companies configure their Flylogs account from scratch in a logical and efficient order. Following these steps sequentially will ensure that your organization data, aircraft, users, and trainings are correctly integrated into the system.

***

### 1. Flylogs Account Configuration

The first step after creating your Flylogs company account is to configure how the system behaves for your organization.

Within the **Company Settings**, configure the following:

* **Units configuration**\
  Define how operational data is displayed and recorded, such as time units, distance, fuel, weight, and any other operational measurements relevant to your operation.
* **Time and date settings**\
  Configure time format and time zones to ensure that flights, duty times, and reports are calculated and displayed correctly.
* **Permissions and system behavior**\
  Define how different user roles interact with the system and what actions are allowed based on permissions.
* **Appearance and branding**\
  Adjust visual preferences and any available branding options to align Flylogs with your company identity.
* **Duty time limitations**\
  Configure duty time rules and operational limits to ensure compliance with your internal policies and applicable regulations.

Completing this step first ensures that all data entered later behaves consistently throughout the system.

***

### 1.2 Create Management Accounts

Once the base system configuration is completed, you should create additional **management accounts**. These users can help you configure and populate the Flylogs account faster by dividing responsibilities across departments.

Flylogs offers **six different management account types**, each with a different access level and responsibility scope.

#### Management User Types

* **Company Administrator**\
  This is the highest access level in Flylogs.\
  The user that initially creates the company is usually a Company Administrator.\
  Company Administrators can:
  * Access all system features
  * Create new administrators
  * Downgrade or delete existing administrators, including the initial one
* **Operations Manager**\
  This profile has access to all system options **except** management of administrator accounts.
* **Compliance & Safety Manager**\
  This role is designed for operational oversight and regulatory compliance.\
  It has access to:
  * Reporting tools
  * Company documents
  * Flights
  * Trainings
  * SMS (Safety Management System)
* **Human Resources Manager**\
  This role focuses on personnel management and can:
  * Create and manage any other company user
* **Financial Manager**\
  This role is responsible for financial control and subscriptions.\
  It can:
  * Manage company billing
  * Manage user account balances
  * Manage the Flylogs Premium subscription
  * Download invoices and billing documents
* **Crew Scheduling Manager**\
  This profile has limited access and is focused on:
  * Managing flight schedules
  * Managing pilot information and availability
* **Flight Dispatcher**\
  This role is operational and flight-focused.\
  It can:
  * Edit or cancel scheduled flights
  * Confirm flights after landing
  * Enter flight details
* **Mechanic**\
  This role is aircraft-centric and has access to:
  * All aircraft details
  * Maintenance management
  * Aircraft flight history
  * Logbook viewing and download options

You can find full documentation on management account types here:\
[https://docs.flylogs.com/fcom/company-management/account-types](https://docs.flylogs.com/fcom/company-management/account-types)

#### Important Note on Pilot Privileges

Every management account, even though created in the **Company → Staff** section, can also be assigned **pilot privileges**.

This allows, for example, a **Compliance & Safety Manager** to also act as a pilot and perform pilot duties without needing a separate pilot account. This avoids duplication and simplifies account management.

***

### 2. Create Aircraft

After management users are created, the next step is to configure your fleet.

For each aircraft, you must:

* Create the aircraft profile
* Enter the **current airframe flight time**
* Enter the **number of cycles or landings**
* Record the **last performed maintenance and annual inspections**
* Define **expiration dates** for:
  * Aircraft documentation
  * Main aircraft components
* Upload aircraft-related documents
* Assign expiration dates to uploaded documents if applicable

Accurate aircraft data is essential for maintenance tracking, compliance monitoring, and flight logging accuracy.

***

### 3. Configure Trainings (If Applicable)

If your organization uses training tracking in Flylogs, this step is required.

Training creation is a **separate process on its own** and involves defining the full structure of each training course.

For each training, you will need to:

* Create the training course
* Define its structure, including:
  * Subjects
  * Lessons
  * Time allocation

Flylogs automatically creates the subject structure based on the lessons and time you configure, allowing for a quicker initial setup.

#### Distance Training Considerations

If you plan to use **distance or online training**, additional setup is required:

* Upload lesson content
* Upload slides
* Create exam questions and evaluations

This is a lengthy process and should be planned separately from the basic account setup.

Full documentation is available at:\
[https://docs.flylogs.com/fcom/training-courses/training-basics](https://docs.flylogs.com/fcom/training-courses/training-basics)

***

### 4. Create Pilot Groups

Before creating pilot accounts, it is recommended to define **pilot groups**.

Pilot groups can be created based on:

* Training year
* Type of pilots
* Classroom or internal organizational structure

Group names and colors are fully customizable.

Later, when pilot accounts are created, these groups can be used to:

* Invite multiple pilots to Flylogs at once
* Enroll pilots into trainings by group instead of individually

***

### 5. Upload Company Manuals

Once groups exist, you can upload your company manuals and internal documentation.

For each document:

* Upload it to the **Documents** section
* Set permissions to the appropriate user groups to ensure controlled access

This ensures that pilots and staff only see documents relevant to their role.

***

### 6. Create Pilot Accounts

With the system structure in place, you can begin creating pilot accounts.

Flylogs provides multiple pilot account levels, each with a specific access scope.

#### Pilot Account Types

* **Chief Pilot**\
  Has access to:
  * All pilots
  * Flights
  * Documents
  * SMS
  * Schedules
* **Flight Instructor**\
  Has access to:
  * Own flights
  * Own schedules
  * SMS
  * All students
* **Captain**\
  Can view and edit:
  * Own flights
  * Own schedules
* **Pilot**\
  Can view and edit:
  * Own flights
  * Own schedules
* **Student Pilot**\
  This is the most limited role:
  * View-only access
  * Limited access to other pilot profiles

#### Recommended Creation Order

It is strongly recommended to create:

1. Chief Pilot accounts
2. Flight Instructor accounts

This allows them early access to the system for preview, familiarization, and initial validation.

#### Important Reminder

Some pilot accounts may already exist if they were created earlier as **staff members**.

If this is the case:

* Verify that the **pilot privilege** is enabled on their **Staff user account**
* No separate pilot account is required

***

### Account Invitations and Status

When creating any account, you can choose whether to send the welcome email immediately.

If not sent initially:

* Welcome emails can be resent from the pilot profile
* Entire pilot groups can also be invited at once

**Invitation behavior:**

* Once the user clicks the invitation and creates the account, the email address becomes a **clickable blue link**
* If the account is not created or emails bounce, Flylogs automatically marks the account as **inactive**
* Inactive accounts show the email address in **grey**, and the invitation option becomes available again

***

### 7. Enroll Students into Trainings

The final setup step is to enroll students into the required trainings.

From **Trainings → Students**, you can:

* Enroll students individually
* Enroll students by pilot group

Once enrolled:

* Students receive an instant notification
* Access to the training is granted immediately

***

### Final Notes and Support

At this stage, your Flylogs account should be fully operational with your organization data integrated.

For additional guidance:

* Documentation: [https://docs.flylogs.com](https://docs.flylogs.com/)
* Support: support@flylogs.com

If you require **assistance or data migration**, contact Flylogs support for a faster and smoother onboarding experience.

***

Download this guide in a quick checklist for the final implementation check:&#x20;

{% file src="../.gitbook/assets/FlylogsImplementationChecklist.pdf" %}
