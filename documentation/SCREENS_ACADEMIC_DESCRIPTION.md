SCREEN REGISTER AND ACADEMIC DESCRIPTIONS

System: Barangay Disaster Situation Record Management and Situation Report Generation System (SitRepO)
Scope: Screen-by-screen description of the implemented prototype across the three administrative roles and the shared surfaces.
Basis: Technology Stack and Implementation Plan, and Frontend Mockup Implementation Plan (project documentation).

This register documents each implemented screen, its function, its informational design, and the product rules it enforces. Descriptions are written in a formal register suitable for the scholarly record and for handover documentation.


1. SHARED SURFACES

1.1 Log In (/login)
The single-point authenticated entry to the system. It presents the institutional identity of the system, an explicit access restriction notice (Authorized users only), and a sign-in workspace. Authentication is invite-only by design: there is no self-registration (Product Rule 1). It states that access is limited to an account assigned to a role and jurisdiction, and it offers prototype demonstration handles (purok.demo, barangay.demo, drrm.demo) to support the reviewer workflow. The screen exposes the system's stance that identity is issued, never requested.

1.2 Session and Access States
Three companion surfaces govern the permission and session model.

Access Denied (/access-denied). Presented when an authenticated user attempts a workspace outside their permissions. It states that the workspace lies outside the user's permissions and offers a return path, without disclosing the denied resource. It implements the principle that frontend visibility is not authorization.

Session Expired (/session-expired). Presented on loss of the authenticated session, distinguishing a session lifecycle failure from an authorization failure.

Loading ([role]/loading). A skeleton state that reserves layout space during workspace retrieval, using aria-busy and aria-live to announce retrieval to assistive technology, and preventing layout shift.

1.3 Prototype Role Switcher (PrototypeToolbar)
A development-only navigation bar that visually separates the reviewer role switcher from production navigation. It exposes Log In, Purok, Barangay, and DRRM as parallel demonstrations of one connected dataset. It is deliberately non-production and is not presented as part of the operational interface.

1.4 Role Landing (/[role])
The authenticated entry point for each administrative level, rendering a role-scoped dashboard summary and an operational header. It establishes the role's workspace scope (a Purok, a Barangay, or the city DRRM office), reinforces the jurisdiction boundary, and routes the user to the highest-priority operational information for that level.


2. PUROK USER (MOBILE-FIRST)

2.1 Purok Dashboard
A mobile-first operational summary that prioritizes the status of the current monthly profile, active reporting tasks, offline drafts, correction requests, and recent history. It adheres to the Dashboard Rule that current operational work precedes historical trends, and that every aggregate discloses its reporting period, filters, denominator, and last-update metadata. Complete statuses (Verified, Provisional, Missing, Not Applicable) are distinguished rather than conflated (Rule 16).

2.2 Monthly Purok CDRA Profile (/purok/profile)
The structured capturing of a Purok's monthly Community-Based Disaster Risk Assessment (CDRA) aggregate profile. It is organized as a resumable, sectioned form: (1) Reporting Period and Purok Identification, (2) Population and Households, (3) Housing and Facilities, (4) Vulnerability and Hazard Exposure, (5) Local Capacities, followed by (6) Review and Submit.

Two non-negotiable rules govern this surface: profiles contain aggregate totals only, never named resident or household records (Rule 2); and profiles are complete monthly snapshots prefilled from the previous verified month (Rule 3). The form tracks per-section completion and validation and presents the state lineage (draft, saved on device, queued offline, submitted, under review, correction requested, verified, rejected, superseded).

2.3 Hazard Event Creation (/purok/hazards)
Permits a Purok reporter to create an instance of an approved hazard type. Hazard types come exclusively from the DRRM-managed CDRA registry (Rule 6); users only instantiate events from those types. A Purok-created event requires Barangay verification before activation (Rule 7). The screen lists hazard events affecting the Purok or the citywide scope, most recent first, with status, creator, and level of origin.

2.4 Purok Incident Reporting (/purok/incidents)
Enables the filing of an incident report against an active hazard event. Incident reporting uses the mandated progressive version model: Initial, Progress, Terminal, and Final reports (Rule 8). Initial reports accept only operationally essential facts (administrative location, landmark, observation time, reporter/source, hazard event, prevailing situation, immediate needs) while Progress, Terminal, and Final reports apply increasing completeness requirements. GPS and maps are optional and never obligatory. The screen presents the source lineage and the report version state.

2.5 Purok Incident Workspace (/purok/incidents/[recordId])
The structured editor for a specific incident report version. It organizes the report into the mandated sections (Event and Location, Prevailing Situation, Affected Population, Casualties and Displacement, Damage and Lifelines, Response Actions and Immediate Needs, Evidence) and enforces the completeness rules per version. Modes of Verification remain visible as incomplete during review and never silently default to a value.

2.6 Purok Incident History (/purok/history)
A historical catalog of the Purok's incident reports and monthly profiles, exposing submitted dates, review outcomes, and verification decisions. Missing information is never presented as zero impact (Rule 16); records that have not been submitted are labeled accordingly.
    
2.7 Notification Center (/purok/notifications)
An in-app message feed dedicated to the signed-in Purok. Notifications are derived at render time from live store state so they always reflect the current record: a draft, a queued-offline submission, an outstanding correction, a rejection, a verification, or an active hazard. Routine notifications remain in-app; SMS or email is represented only for configured urgent escalation. Because the feed is computed rather than stored, it cannot drift from the underlying record.

2.8 More (/purok/more)
A mobile navigation overflow surface listing tools not present in the bottom navigation: hazard event creation, the Notification Center, and the Account and Offline Queue. It preserves a single, dominant navigation model without crowding the primary bar.

2.9 Account and Offline Queue (/purok/account)
The account-management surface for a Purok reporter. It presents the account identity and the fact that the account was issued by the supervising administrative level (Rule 1), and it provides a password-change control (with the documented caveat that prototype changes persist only in the browser). Below this it distinguishes two storage states mandated by the prototype behavior.

Saved drafts on this device: drafts that autosave locally and remain editable.

Offline submission queue: submissions attempted without connectivity. Such a submission is never displayed as successfully submitted until receipt is acknowledged; it waits in the queue and transmits automatically. This enforces the idempotent, no-silent-duplicate submission semantics.


3. BARANGAY USER (DESKTOP-FIRST)

3.1 Barangay Dashboard
A desktop-first operational summary prioritizing Purok submission coverage, verification queues, consolidated verified totals, active incidents, and reporting gaps. Aggregates disclose their reporting period and verification status; the dashboard surfaces the Source Lineage Rail as the system's signature interaction, exposing how Purok totals travel through verification and consolidation.

3.2 Purok User Management (/barangay/purok-users)
The Barangay-level administration of Purok reporter accounts. Consistent with Rule 1 (Accounts are issued by the supervising administrative level; there is no self-registration), the Barangay issues, resends, deactivates, and reactivates Purok accounts. The register models the role-assignment model (user-to-role-to-organizational-unit), allows multiple named users to belong to one Purok while a draft has one current owner, and preserves authorship and decision history across deactivation.

3.3 Purok Profile Verification (/barangay/profiles)
The queue for verifying Purok-submitted monthly profiles. It orders records by operational urgency and exposes each Purok's aggregation state (not-yet-submitted, submitted, under review, correction requested, verified, rejected) so that a reviewer never conflates a draft or a provisional figure with a verified total. A reviewer approves, rejects, or requests corrections, never silently edits a submitted record (Rule 9); corrections generate new linked versions (Rule 10).

3.4 Purok Profile Detail (/barangay/profiles/[purokId])
The per-Purok review surface, rendering the immutable submitted version, its comparable previous verified profile, validation flags, and the reviewer decision panel (Verify, Request Correction, Reject). It presents the source lineage from Purok source through verification to consolidation and mandates a documented reason for any return or rejection.

3.5 Barangay Profile Consolidation (/barangay/consolidation)
The aggregation surface that consolidates verified Purok profiles while separating Barangay-wide additions and discrepancies. It excludes not-yet-verified Purok totals from the verified aggregate, surfaced separately so a consolidated figure never silently understates coverage as complete, and distinguishes Barangay-wide items not assigned to any Purok. Additions are reported as Barangay-level rather than attributed to a Purok (Rule 5).

3.6 Hazard Event Creation (/barangay/hazards)
Enables a Barangay officer to create a hazard event instance and to verify Purok-submitted events. Barangay-created events require DRRM verification (Rule 7). The screen shows the scope of events for the Barangay (and citywide advisories), each with its verification state and origin level, so the reviewer always sees whose decision is pending.

3.7 Purok Incident Verification (/barangay/incidents/verification)
The review queue for Purok-submitted incident reports. It flags validation, possible duplicates, conflicts, and late reports as reviewer aids, and requires a documented reason for return, rejection, or partial verification. Decisions are stored against the specific version reviewed, so that every decision identifies the exact version reviewed.

3.8 Purok Incident Verification Detail (/barangay/incidents/verification/[recordId])
The drill-down review of a Purok incident version: the immutable submitted version, its evidence, the reviewer decision panel, and a correction loop that produces a newly linked version rather than an in-place edit. Modes of verification and unresolved discrepancies remain visible throughout.

3.9 Barangay Incident Reporting (/barangay/incidents)
The consolidation of eligible verified Purok incident reports for a hazard event into a Barangay-level report, separately identifying other Barangay-level sources and discrepancies (Rule 11). The screen presents the eligible versus not-yet-eligible Purok reports and the narrative of Barangay-level additions so a consolidated incident total is never subtly inflated or conflated with Purok figures.

3.10 Purok and Barangay Historical Catalogs (/barangay/history)
A searchable, filterable catalog of Purok and Barangay records, timelines, and decisions, exposing missing-data states and comparison views. It supports the traceability requirement by making each record's verification state and submission history viewable without claiming completeness for records that are still draft or provisional.

3.11 Notifications and Account (/barangay/account)
The combined in-app notification feed and account surface for a Barangay officer. It derives notifications from live store state: incoming Purok submissions awaiting verification, outstanding corrections, verified profiles, Purok-reported hazard events awaiting review, and consolidated drafts. It is accompanied by the account identity (issued by the city DRRM office) and the password control, and it reminds the officer that verification decisions are recorded against the submitted version and appear in the DRRM audit log.

3.12 More (/barangay/more)
A mobile overflow surface that links every workspace area not resident in the bottom navigation: consolidation, incident reporting, historical catalogs, Purok user management, and Notifications and Account, preserving one dominant navigational hierarchy.


4. DRRM ADMINISTRATOR (DESKTOP-FIRST)

4.1 DRRM Dashboard
A citywide operational summary prioritizing verification queues across Barangays, verified incident effects, source coverage, SitRep readiness, discrepancies, and overdue submissions. It separates provisional from verified totals, exposes freshness, missingness, and drill-down, and reiterates the Dashboard Rule that historical trends are secondary to current operational work.

4.2 Barangay User Management (/drrm/barangay-users)
City-wide administration of Barangay DRRM officer accounts. Accounts are issued by the DRRM Office, and deactivation never deletes authorship or decision history. It implements the role-assignment model where a user is assigned a role and an organizational unit, and it permits only the supervising level to issue accounts.

4.3 System User and Permission Management (/drrm/system-users)
Administration of DRRM system accounts and their permission sets. DRRM permissions distinguish Verifier, SitRep Preparer, and Approver, and one account may hold several permissions (Rule 12). The screen renders permissions as a selectable set and, critically, reads them as authorization rather than as a means of delegating editing authority. The signed-in account cannot edit its own permission set, preventing self-lockout, and the audit trail records every permission change.

4.4 Barangay Profile Verification (/drrm/profiles)
The city-level verification queue for Barangay-submitted consolidated profiles. It enforces the rule that a submitted profile does not affect higher-level totals until verified (Rule 4) and that reviewers never silently edit submitted records. Decisions are stored against the reviewed version.

4.5 Barangay Profile Detail (/drrm/profiles/[barangayId])
The per-Barangay review surface showing the consolidated verified Purok totals, the separately identified Barangay-wide additions, and the reviewer decision panel. It exposes the source lineage from Purok through Barangay consolidation to city-level verification and requires a documented correction or rejection reason.

4.6 CDRA Hazard Registry (/drrm/hazard-registry)
The reference list of approved hazard types that users at all three levels may select when creating a hazard event. Hazard types are DRRM-managed and configurable (Rule 6). Archiving a type hides it from new events without deleting existing history (Rule 15); the screen distinguishes Approved from Archived types and explains that the registry is maintained on the configuration screen, where the Source and Mandate Gate requires each type's authoritative basis, meaning, and applicability to be recorded.

4.7 Hazard Event Creation and Review (/drrm/hazards)
Creation and review of hazard events at the city level. DRRM-created events activate immediately (Rule 7); Barangay-created events require DRRM activation. The screen shows each event's origin level and verification state, so the responsible decision point is always explicit.

4.8 Barangay Incident Verification (/drrm/incidents/verification)
The city-level review queue for Barangay-submitted incident reports, carrying validation, conflict, duplicate, and discrepancy flags, and requiring documented reasons for return, rejection, or reconciliation. Every decision identifies the exact version reviewed.

4.9 Barangay Incident Verification Detail (/drrm/incidents/verification/[recordId])
The drill-down review of a Barangay incident version, presenting the immutable version, evidence, discrepancies, and the reviewer decision panel. Corrections produce new linked versions; submitted versions remain immutable and traceable.

4.10 SitRep Generation and Structured Editor (/drrm/sitreps, /drrm/sitreps/new)
The preparation of a Situation Report (SitRep) from eligible verified sources. The generation surface lets the DRRM preparer select a hazard event and shows how many Barangay incident reports are verified and eligible for inclusion; Situation, Area, and Casualty sections are pre-filled only from DRRM-verified Barangay reports, and events with no verified sources still generate but begin with authorable blank source-linked sections, never a fabricated zero.

The structured editor places editable sections beside a live document preview while preserving mandated document order, per-section validation, source links, unresolved discrepancies, template version, generated version, and approval state. It deliberately does not imitate an unrestricted word processor. Source-derived values remain linked and require a documented override or source correction before a materially divergent value may be submitted.

4.11 SitRep Review, Approval, and Export (/drrm/sitreps/[id])
The review, approval, and export surface. A reviewer may return a draft for revision with comments, and the approver re-authenticates by password before an approval is recorded against a specific SitRep version. Approved SitReps export cleanly with numbering, signatories, and source references; draft SitReps export with a watermark (for example, DRAFT FOR REVIEW), distinguishing a draft from a release-ready document. The decision, role, SitRep version, and timestamp are all recorded; this is authenticated workflow approval and is never claimed as a legally certified digital signature.

4.12 Barangay and SitRep Historical Catalogs (/drrm/history)
A searchable, filterable citywide catalog of Barangay consolidated profiles, incident reports, and hazard events, with status, submission, and review metadata. SitReps are cataloged separately under SitRep Generation and Review. The catalog exposes missing-data states rather than treating an unreported record as zero impact.

4.13 System Audit Log (/drrm/audit-log)
The immutable city-level audit trail, restricted to authorized DRRM administrators. It records sign-ins, submissions, verification decisions, approvals, exports, account administration, and configuration changes, each with actor, action, category, target, and timestamp. The screen supports search and category filtering and is explicitly read-only; audit events in the real system are immutable and are never edited or deleted, preserving the traceability mandate that every decision identifies the exact version reviewed.

4.14 Reporting Schedule and Template Configuration (/drrm/configuration)
The DRRM-managed configuration surface, comprising three governed areas.

SitRep template and export configuration: the active template version applied to newly generated SitReps, the draft-watermark text, whether approved exports are clean, and whether source references are required. Because each generated SitRep records its template version, configurable changes never retroactively mutate past documents.

Reporting schedule: the monthly cycle cutoffs for Purok submission, Barangay consolidation and submission, and DRRM verification. The current cycle is locked; the upcoming cycle is configurable, and window statuses (Open, Upcoming, Closed) are computed live so the schedule never claims a passed window is open.

CDRA hazard type registry: the lifecycle administration (added, reactivated, archived) of hazard types, which propagate immediately to hazard-event creation forms, reflecting a configurable registry rather than a hard-coded list.

Configurations are audit-logged, and every field respects the Source and Mandate Gate: no operating parameter is invented for visual completeness.

4.15 My Account and Password (/drrm/account)
The DRRM account and security surface. It presents the account identity and permissions assigned to the signed-in account, notes that permission changes are administered by the DRRM Office administrator on the System User and Permission Management screen, and provides the password control for the re-authentication requirement on high-impact actions.

4.16 More (/drrm/more)
A mobile overflow surface linking every workspace area not resident in the bottom navigation: SitRep generation, historical catalogs, the CDRA hazard registry, Barangay and system user management, the audit log, configuration, and the account surface, maintaining one dominant navigational hierarchy.


5. CROSS-CUTTING PRINCIPLES REPRESENTED

Several mandates are enacted across every screen rather than in any single one.

Source and Mandate Gate: no operational field, rule, aggregation, or status transition is invented for visual completeness; each is traceable to an authoritative source (CDRA guidance, the 2024 NDRRM SOPG, RA 10121, Operation LISTO, or approved local configuration).

Immutable versions and traceability: submitted, verified, and approved versions are immutable; corrections create new linked versions; every decision identifies the exact version reviewed.

Tenant and jurisdiction isolation: every protected row is tenant-scoped with a non-null tenant identifier; the jurisdiction hierarchy is City to Barangay to Purok, and access to descendant units follows explicit policy.

Privacy gate: no real personal or sensitive records are used until documented authorization, a Privacy Impact Assessment, and the privacy gate are approved; development and demonstration use synthetic or anonymized records only.

Honest data presentation: missing information is never presented as zero impact; provisional, verified, missing, and not-applicable values remain distinct; aggregated figures disclose their period, filters, denominator, and freshness.

Accessibility: each surface is designed to meet WCAG 2.2 Level AA: semantic structure and heading hierarchy, connected labels and contextual help, keyboard operation and visible focus, programmatically associated validation and errors, minimum touch targets, non-color-only state, zoom and text-resize resilience, reduced-motion support, and accessible alternatives for maps, charts, and tables.
