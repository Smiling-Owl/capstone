# IMBOK process of the capstone project

**Name 1:** Perez, Katrina Mae D. G.  
**Name 2:** Somosa, RJ P.  
**Capstone title/topic:** Barangay Disaster Situation Record Management and Situation Report Generation System

## Information technology

The product is a responsive web platform for different disaster risk reduction and management organizations. A DRRM office can use desktop or laptop computers for administrative work, while barangay and purok personnel can submit reports through internet-capable smartphones or tablets. Everyone uses the same browser-based system. A separate native mobile application is not part of the current deliverable.

The web interface will use React and Tailwind CSS. Its navigation, forms, tables, cards, and dashboards will adjust to desktop, tablet, and smartphone screens. Laravel and PHP will process requests and apply the business rules. MySQL will store organization profiles, user accounts, jurisdictions, incident reports, verification decisions, generated SitReps, configuration versions, and audit records. The platform can run on Apache or cloud infrastructure through HTTPS.

Development tools include XAMPP or Laravel Sail, Visual Studio Code, Git and GitHub, Composer, NPM, Jest, and Cypress. Docker Desktop may be used to keep development environments consistent. React Native, Expo, CocoaPods, Gradle, SQLite mobile synchronization, and a separate mobile release remain outside the implementation.

The platform has four technical layers. React provides the presentation layer and displays functions based on the user's role and organization. Laravel handles authentication, authorization, validation, report verification, data aggregation, SitRep generation, notifications, analytics, configuration, and event logging. HTTPS carries requests between the browser and server. MySQL holds the platform's operational records.

Because several DRRM organizations may use the same platform, every organization-owned user, jurisdiction, report, SitRep, and audit record must have a server-controlled organization identifier. Location records also need a jurisdiction identifier. The server and database queries must apply both role and organization restrictions. Hiding another organization's records in the interface is not enough. Automated authorization tests should create at least two organizations and confirm that a user from one cannot view, edit, approve, export, or list the other's records.

The startup will have a platform administrator who can provision organizations, manage service configuration, monitor availability, and provide support. Each DRRM organization will appoint its own organization administrator to manage its users, jurisdictions, and local workflow. Platform administrators should not verify incidents, approve local reports, or issue SitReps for a customer. Any exceptional support access to customer data should require authorization, expire after a set period, and appear in the audit log.

Security and reliability controls include database constraints, client-side and server-side validation, secure password hashing, session management, role-based access control (RBAC), prepared statements or ORM, output escaping, input sanitization, audit logs, backups, and restoration tests. The team will test individual units, integrations, the complete system, and security controls. Since the product works online, a weak or interrupted connection may delay a submission. Where practical, the interface should retain unfinished form data and clearly tell the user when the server did not receive a request. The project does not claim guaranteed offline synchronization.

## Information systems

The platform supports several organizations without treating them as one shared administrative office. Each DRRM organization controls the reporting workflow within its assigned area. The organization decides who can report, review, verify, approve, view, and administer records. The startup supplies the platform and its configuration tools but does not appoint government officials or take over their legal authority.

Purok personnel will open the system in a mobile browser and submit initial observations. Barangay personnel will review reports from their jurisdiction, gather details about affected people and damage, and prepare barangay reports. The designated DRRM office will verify or reject submissions, request corrections, consolidate accepted records, generate SitReps, maintain its report catalog, inspect its event logs, and use its dashboard. Organization administrators will manage local accounts and assignments. The platform administrator will handle organization provisioning, technical operations, and support.

The required functions are:

1. **Platform administration:** organization onboarding, activation, suspension, configuration, technical monitoring, support, and offboarding.
2. **Organization administration:** management of the DRRM organization's profile, jurisdictions, users, roles, approval assignments, and local settings.
3. **User management:** registration, login, logout, account verification, role-based access, and account status controls.
4. **Initial disaster reporting:** submission of reports and notifications through the configured purok, barangay, and DRRM workflow.
5. **Disaster situation reporting:** entry of incident details, affected population, casualties, infrastructure damage, resource needs, and actions taken.
6. **Report verification:** review, validation, rejection, correction requests, status updates, and notifications.
7. **SitRep generation:** consolidation of verified data into the required Situation Report structure.
8. **SitRep catalog:** chronological storage, version identification, viewing, amendment, filtering, searching, and downloading.
9. **Dashboard:** summaries of affected population, incidents, report status, generated SitReps, and processing activity for the authorized organization and jurisdiction.
10. **Audit and security:** event logging, session control, data validation, tenant isolation, access restrictions, and traceability of material changes.

The product should keep one standard data model and codebase while allowing controlled configuration. An organization may set its name, jurisdiction hierarchy, terminology, assigned roles, approval route, and report template. The system should preserve the configuration, workflow, and template version used for each approved record so that an older SitRep can still be reproduced. Unrestricted custom code for every customer is outside the current scope because it would make the product harder to maintain.

Users need basic experience with a web browser, smartphone, or computer. They should also understand the reporting terms and fields used by their organization. Training should match each role and cover submission, correction, verification, approval, SitRep generation, and dashboard use. New customers will need organization setup, administrator orientation, practice accounts, and a reporting exercise that follows one incident through their configured workflow.

The interface should have clear navigation, readable touch controls, visible labels on small screens, required-field checks, useful error messages, confirmation prompts, and save and status feedback. Complex fields can appear only when relevant. The same terms and actions should remain recognizable across desktop and mobile browsers.

## Business process

The product has two connected processes. The first is the startup's service process for onboarding and supporting DRRM organizations. The second is each customer's operational process for collecting, verifying, consolidating, and storing disaster reports.

The service process is:

1. The startup creates and configures an organization account based on the DRRM office's jurisdiction and operating structure.
2. The organization appoints its administrator and defines its reporters, verifiers, approvers, and viewers.
3. The startup orients the organization's administrators and provides setup and support materials.
4. The platform operator monitors service availability, performs maintenance and backups, tests restoration, and handles technical incidents.
5. If the service agreement ends, the organization receives an authorized export of its data. Retention, return, and deletion follow the agreement and applicable records and privacy requirements.

Within each organization, the reporting process is:

1. A field reporter records a flood, typhoon, or fire incident and submits an initial report under the correct organization and jurisdiction.
2. The assigned barangay or local reviewer checks the first details, coordinates local action, and gathers information about the affected population, casualties, infrastructure damage, location, time, and resource needs.
3. The report moves through the organization's configured review and approval route.
4. Authorized DRRM personnel verify the report, request a correction, edit details within their authority, or reject an invalid submission.
5. The system stores the accepted record and updates its status, notifications, dashboard values, and audit history.
6. The organization's authorized personnel consolidate verified records and generate a SitRep.
7. Personnel review and export the SitRep, send it through the proper reporting channels, and retain it in the organization's catalog.
8. Dashboards and historical records remain available for monitoring, comparison, planning, and post-disaster evaluation.

Daily work includes account approval, data entry, validation, notification checking, report review, correction, filtering, export, configuration, and audit-log review. The outputs include traceable incident records, verified reports, SitReps, notifications, historical records, and operational summaries. Every output remains tied to its organization, jurisdiction, source records, workflow version, and approving user.

## Business benefit

For a DRRM organization, the product may shorten report consolidation, reduce repeated encoding, improve traceability, and make historical records easier to retrieve. Managers will be able to see incidents, pending verification work, generated SitReps, and processing activity for their own area. Field personnel can use the same controlled workflow in a smartphone browser without installing another application.

For the startup, one configurable platform can serve different DRRM organizations without maintaining a separate application for every customer. The business can provide onboarding, hosting, updates, backups, technical support, and future product improvements through licensing, service agreements, or another pricing model chosen later. Government customers may also require formal procurement, lifecycle-cost review, contractual security terms, and renewal procedures rather than a normal consumer subscription.

These are expected benefits, not guaranteed outcomes. Results from one pilot organization should not be treated as proof that every DRRM office has the same workflow or will achieve the same result. Internet availability also remains an operational limitation.

The evaluation should measure:

- the median time between a field submission and receipt by the assigned reviewer;
- the median time between submission and a verification decision;
- the time required to consolidate verified records and generate a SitRep;
- the percentage of reports complete on their first submission;
- duplicate, rejected, returned, and corrected records;
- the percentage of generated SitReps that follow the configured structure;
- failed submissions and successful resubmissions;
- unauthorized access attempts and RBAC results;
- cross-organization access and data-isolation test results;
- uptime, unhandled crashes, backup restoration, and critical defects; and
- changes in repeated encoding, follow-up messages, and spreadsheet work.

Results should be separated by organization, jurisdiction, role, and device type where possible. This prevents a successful test in one office or on desktop computers from hiding problems in another organization or on smaller screens.

Beta testing will use the 10-item System Usability Scale (SUS), with the paper's target average score of at least 68. Task observations and open-ended comments will add context to that score. Before release, the team should resolve every critical and major alpha-testing issue. Beta testing should finish with no unhandled application crashes, no unresolved critical data-integrity defect, successful completion of the main reporting tasks on supported browsers, and no successful attempt to access another organization's records.

## Business strategy

The startup approach changes the system from a custom project for one office into a reusable product for DRRM organizations. ZCDRRMO remains the original study setting and may be treated as a reference or possible pilot organization, but it is not the only client, administrator, or authority supported by the platform.

Each customer keeps control over its jurisdiction, users, workflow, verification decisions, approved reports, and official submissions. The startup manages the technical service. This separation lets the product support provincial, city, municipal, barangay, or other authorized DRRM bodies without transferring government authority to the platform operator.

The product's technical advantage is a shared, maintainable codebase with organization-level configuration and strict data isolation. New customers can receive the same core reporting, verification, SitRep, catalog, dashboard, and audit functions while keeping their records separate. Controlled configuration makes the product reusable without turning every deployment into a different software project.

The startup will also need clear service terms for hosting, availability, maintenance windows, support response, backups, restoration, security incidents, customer data, authorized subprocessors, data export, and offboarding. If customer support requires access to production data, that access should be approved, limited, and logged.

The current product covers floods, typhoons, and fires. It is limited to authorized institutional users and responsive web access. It does not include a native mobile application, offline synchronization, SMS fallback, public alerting, emergency dispatch, predictive analytics, or direct integration with national systems. Those features can be considered later if customer research and field testing show a clear need.

## Source basis

This assignment uses the capstone files in the workspace and the team's updated product direction. Earlier drafts focused on ZCDRRMO as the main administrative organization. The current version treats ZCDRRMO as the original study setting while defining a startup-operated platform that can support several DRRM organizations and their respective jurisdictions. The technical architecture remains a responsive React, Laravel, and MySQL web application.
