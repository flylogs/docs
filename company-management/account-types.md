# Account types

Every time you create a new Flylogs user within your account, you need to carefully select the desired account type. The account type you select will determine the access level of the new user.

**You can create:**&#x20;

* **STAFF MEMBERS**, which can also have PILOT privileges.
* **Pilots** with no company management privileges.
* **Cabin Crew** members.
* **Mechanics**.
* **Auditors** with external read-only access.

### Staff members

Staff members are people working in your organization. Usually this members will have a management role of some level, and in some cases, some could also have some flight crew duties.

To create staff members, navigate to Company > Staff > Create a new user

<figure><img src="../.gitbook/assets/Screenshot 2023-04-23 at 17.37.54.png" alt=""><figcaption><p>Create new staff member form</p></figcaption></figure>

All staff members require at least the following fields:

* Name
* Family name
* Email address
* User type

#### Management Account Types

* **Company administrator:** It is the highest level. The user that creates the company is usually a company administrator, but new administrators can be created and the initial  can be downgraded or deleted.
* **Operations manager:** This profile has access to all options except the management of the administrator account.
* **Compliance & Safety manager:** Access to reporting tools, docs, flights, trainings and SMS.
* **Human resources manager:** Create and manage any other company user.
* **Financial manager:** Access to manage company billing and user account balances. Also has the ability to manage the Flylogs Premium subscription and download the bills.
* **Trainings manager:** Dedicated to managing the trainings module. Can create and edit training programs, schedule sessions, record attendance and manage exams and progress for students.
* **Crew Scheduling:** Limited access with privilege to manage the flight schedule and pilot info and availability.
* **Flight Dispatcher:** This profile can edit or cancel scheduled flights. Also can confirm and enter flight details after their landings.

As mentioned before, any of these STAFF profiles, can also be activated as pilot. In that case, the user will appear both in the STAFF members and PILOTS lists.



### Pilots

Pilot management can be performed by any Company administrator, Operations manager or Human Resources manager.

Pilots do not have company management privileges and are designed to be selected in any flight, schedule, training or SMS report forms.

In contrast with STAFF members, **pilots can be created without email address**. This will allow you to schedule or store flight data for a pilot without or unknown email address. In this case, the pilot, will not have LOGIN access to Flylogs.

Pilots can also be created with or without flying privileges. This way, you can control who can or can not fly. This is usefull for student pilots still in their first stages of the trainings. It will remove non-flying pilots from flight/scheduling forms to avoid errors and remove clutter.

#### Pilot account types:

* **Chief Pilot:** This pilot has access to view all other pilots, flights, documents, SMS and schedules.
* **Flight Instructors,** have a more limited access to view all their own flights, schedules and SMS. They can also view all students.
* **Captain:** Own flights and schedule view/edit only.&#x20;
* **Pilot:** Own flights and schedule view/edit only.
* **Student Pilot:** This is the most limited access with view only capabilities and limited access to other pilot profiles.

### Cabin Crew

Cabin Crew members can be added to flights as part of the crew, alongside pilots. They have a personal view of their own assigned flights, schedules and documents, but no company management privileges.

Like pilots, cabin crew members can be created without an email address if login access is not required.

### Mechanics

Mechanics have access to all aircraft details. They can manage maintenance jobs and work orders, and view and download all aircraft flight and logbook information.

### Auditors

Auditors are external users granted read-only access to your company. They are typically used to provide regulators, inspectors or external compliance reviewers a temporary view of your operations without giving them permission to modify any data.

Auditor accounts have a few rules that always apply and cannot be turned off when creating or editing one:

* **Always temporary.** Every auditor account must have an expiration date, no more than 90 days in the future. Once it passes, the account can no longer log in — you can extend it at any time by editing the account and setting a new expiration date (also capped at 90 days out).
* **Never a pilot.** Auditor accounts can never be granted flying privileges.
* **Email-based two-factor only.** Auditors always verify login with a code sent to their email — this can't be changed to an authenticator app or turned off.
* **No personal contact details of other people.** An auditor never sees another user's email address, phone number or address — anywhere in the app. They see operational data (aircraft, maintenance, flights, trainings, student progress, safety reports, schedules, FTL, rosters) at a company-wide level, not individual pilot profiles.
* **Read-only, including their own account.** The only thing an auditor can change about their own account is their password — everything else (email, name, 2FA method, etc.) is fixed by whoever created the account.
* **No API access.** Auditor accounts never have an API key — only company managers can have one, always bound to their own account. See [API Keys](../API/api-keys.md).
* **The expiration date is always emailed.** The welcome email sent when the account is created shows when it expires. This is true for any account you create with an expiration date set, not just auditors.



### Permissions at a glance

The table below summarises what each role can do across the main areas of Flylogs. ✅ = full access · View = read-only · — = no access.

| Role | Manage users | Billing | Flights | Aircraft | Trainings | Safety | Schedule |
|------|:---:|:---:|:---:|:---:|:---:|:---:|:---:|
| Company Administrator | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ |
| Operations Manager | ⚠️ no admins | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ |
| Compliance & Safety Manager | — | — | ✅ | — | View | ✅ | View |
| Human Resources Manager | ✅ | — | — | — | — | — | — |
| Financial Manager | — | ✅ | View | — | — | — | — |
| Trainings Manager | — | — | View | — | ✅ | — | View |
| Crew Scheduling | — | — | View | — | — | — | ✅ |
| Flight Dispatcher | — | — | ✅ | View | — | — | ✅ |
| Chief Pilot | View pilots | — | View all | — | — | View | View all |
| Flight Instructor | View students | — | Own + students | — | Teach | Own | Own |
| Captain | — | — | Own | — | — | Own | Own |
| Pilot | — | — | Own | — | — | Own | Own |
| Student Pilot | — | — | Own (read) | — | Enrolled | Own | Own (read) |
| Cabin Crew | — | — | Assigned | — | — | Own | Assigned |
| Auditor | — | View | View | View | View | View | View |
| Mechanic | — | — | View | ✅ | — | — | — |

A few rules apply across every role:

* The user that **created the flight**, or the assigned **Pilot in Command**, can always edit their own flight for 24 hours after it was confirmed, even without any other permission.
* **Company Administrators, Operations Managers, and Compliance & Safety Managers** can override almost every limit — they can edit, cancel, delete or confirm any flight regardless of who created it.
* **Deleted** flights and **historical** entries cannot be modified by anyone, regardless of role.

### Deactivate or delete users

You can deactivate users to hide them from any list and archive them. The user information is not deleted, but will be hidden from your daily tasks.

You can delete staff members and pilots also, but in this case, Flylogs will mark the user as deleted with the same result and this action can not be undone unless you request it to our support service.

#### Deactivated pilots

If you deactivate a pilot, this user will dissapear from your list as expected, but the user will still have access and login option to the Flylogs account without edit capabilities.

This is setup this way so the pilots can always log in to check his/her logbooks as needed.
