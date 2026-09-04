# Diagram Revision Audit

Source reviewed: `adviser_revisions/Perez-Somosa_capstone_revision1.docx`

Status: Initial consistency audit completed. The source manuscript was not modified.

## Executive finding

The diagrams should not yet be redrawn one at a time. Their current problem is structural: the process model, DFD hierarchy, ERD, RDM, and revised written scope describe different versions of the system. The safest revision is to establish one canonical system model first, then regenerate every diagram from it.

The highest-priority conflict is between the revised scope and the diagrams. The paper now describes a configurable, multi-organization platform with organization-scoped roles, report versions, verification, approval, audit history, and controlled SitRep generation. Most diagrams still describe a single ZCDRRMO installation with only three account subtypes: Administrator, Barangay, and Purok.

## Priority findings

### Critical — resolve before redrawing

1. **System actors need clearer role and organizational definitions.** Keep `Purok` and `Barangay` as external DFD actors because they participate in the bottom-up reporting chain. A Purok submits a local report; a Barangay reviews/consolidates Purok reports and then acts as a reporter to the City. Replace the overly broad `Administrator` actor with the applicable City/ZCDRRMO roles. The adopting DRRM organization—not the project team—owns, hosts, and administers the deployed system. In the data model, organizational units must remain separate from the user accounts assigned to them.

2. **The Context DFD uses actions as data flows.** Labels such as `Situation Report Generation`, `Account Creation and Modification access`, `Report Verification`, and `Verify Initial Report` describe processes or permissions rather than data moving across the system boundary. Replace them with noun phrases such as `SitRep generation request`, `account details`, `verification decision`, and `report review request`.

3. **The Level 0 DFD is not balanced with the context diagram.** Inputs and outputs are renamed, added, or omitted between the two diagrams. Every external flow in the context diagram must reappear unchanged in Level 0.

4. **Level 0 numbering and Level 1 decomposition conflict.** Level 0 contains seven processes (`1.0` through `7.0`), but the manuscript supplies detailed diagrams only for groups `1.x` through `5.x`. Worse, Level 1.4 combines incident creation, incident reporting, and SitRep creation even though these are separate Level 0 processes (`4.0`, `6.0`, and `7.0`). Level 1.5 is audit logging, but Level 0 process `5.0` is Initial Report Confirmation. Therefore Level 1.4 and Level 1.5 are not valid decompositions of their numbered parent processes.

5. **Process `5.0` is duplicated in Level 0.** Both `Initial Report Confirmation` and `Affected Population Data Submission` are shown as `5.0`. Each process must have a unique identifier.

6. **Level 0 contains invalid or orphaned data stores.** `Analytics Data`, `Barangay Account`, `Purok Account`, and `Admin Account` do not align with the RDM, which has an `Account` table plus subtype tables. `Initial Reports DB`, `Incident DB`, `Affected Population DB`, `Situation Report DB`, and `Accounts DB` also use names inconsistent with the Level 1 diagrams and RDM.

7. **Authentication is modeled incorrectly.** The Level 1.3 DFD sends `User Details` from `Display Dashboard` to `Log Out Session`, and `Log Out Session` has no output or session store. Role verification and authentication responses also do not balance cleanly with Level 0. Model credentials, authentication result, authorization context, and session termination separately.

8. **Audit logging is backwards.** In Level 1.5, external actors send `System Action` to `View Event Logs`; that process then stores activity. Users perform business actions through other processes, while the system records audit events. `View Event Logs` should retrieve filtered logs only for authorized audit users.

9. **The ERD/RDM cannot support the revised report lifecycle.** There are no structures for report status, version, supersession/correction, verification decision, rejection/return reason, approval, source evidence, reporting period, template version, generated version, organization ownership, or jurisdiction scope.

10. **The ERD/RDM cannot support the revised hierarchical reporting model.** `Account` specializes directly into `Admin`, `Barangay`, and `Purok`. Purok and Barangay are valid reporting actors and organizational units, but they are not account types. This design also prevents one person from having multiple roles or assignments. Use separate `OrganizationUnit`, `User`, `Role`, and `UserRoleAssignment` structures, with a parent-child relationship representing Purok → Barangay → City/Municipality → Province where applicable → Region → National.

11. **ERD and RDM keys do not fully match.** In the ERD, `Barangay_Id` and `Purok_Id` are shown as inherited PK/FK identifiers. In the RDM, their lines to `Account` are drawn, but the FK designations are not consistently shown. The relationship between `Barangay` and `Purok` also lacks an explicit `Barangay_Id` FK in `Purok`.

12. **Several data types are incorrect or inconsistent.** The RDM uses `VARCHAR(255)` for report date/time fields, `VARCHAR(255)` for `Initial_Report_DateTime`, `VARCHAR(6)` for `Hazard_Id`, and `Type` for `Affected_Population_Id` in `Situation Report`. Use actual `DATETIME`/timestamp types, consistent identifier types, and a valid FK type.

13. **`Account_Name` duplicates `Account_Fname`, `Account_Mname`, and `Account_Lname`.** Keep either a display/full name with a documented purpose or the component fields; do not store redundant values without a synchronization rule.

14. **Sensitive and operational data are underspecified.** `Affected Population` is a single wide aggregate row. It does not identify the incident, reporting period, version, source organization, verification state, or privacy classification needed by the revised scope.

### Major — revise with the canonical model

15. **The proposed overview swimlane is not a proper role-responsibility model.** `System User` is a generic lane, authentication routing is mixed with module navigation, and ZCDRRMO functions are shown as flowchart connectors rather than activities. Create lanes for the actual actors and one lane for automated system actions.

16. **Several module flowcharts have no swimlanes.** User management, Purok reporting, Barangay reporting, SitRep generation, catalog, and dashboard diagrams place user actions, system actions, data objects, and database operations in one undifferentiated container. This makes ownership unclear.

17. **Flowchart notation is inconsistent.** Database cylinders and data parallelograms are mixed into user workflows; connector `M.1` is reused without a clear referenced destination; some modules have no explicit end state; and branch paths sometimes loop to connectors instead of a named state.

18. **The workflow permits direct modification of submitted records.** Purok, Barangay, verification, and catalog diagrams show existing reports being modified in place. The revised scope requires material changes to create a new version or supersession relationship while retaining history.

19. **Verification is too binary.** The written scope includes triage, clarification, correction, corroboration, partial validation where configured, return, rejection, reconciliation, and recorded reasons. The diagrams mainly use verified/rejected paths and omit the review record and version examined.

20. **SitRep generation lacks lifecycle controls.** The flowchart checks permission and allows modification, but omits eligibility rules, reporting period, unresolved discrepancies, template version, generated version, reviewer, approver, approval status, and publication/export state.

21. **The current-process swimlane mixes reporting with emergency response.** `Evacuation Process` and `Send Response team` broaden the diagram beyond the paper's record-management/SitRep boundary. Keep them only as external operational events or clearly label them outside the proposed system scope.

22. **Terminology varies across figures.** Examples include `Initial Report`, `Initial Incident Report`, `Disaster Incident Report`, `Incident Report`, `Barangay Report`, and `Situation Report`. Establish a glossary and use one label for each record type and lifecycle stage.

## Recommended canonical model

Use the following model as the single source for every revised diagram.

### External actors and reporting hierarchy

- Purok Reporter/Leader — creates and submits a Purok report
- Barangay Reviewer/Reporter — reviews and consolidates Purok reports, then submits a Barangay report
- City/ZCDRRMO Reviewer or Verifier — verifies Barangay reports
- City/ZCDRRMO Approver — approves the local SitRep
- City/ZCDRRMO Organization Administrator — manages authorized users and assignments
- Authorized Viewer/Records or Privacy Personnel
- Higher DRRM Authority — receives an endorsed report only when transmission is included in scope

The canonical reporting direction is bottom-up: Purok → Barangay → City or Municipality → Province where applicable → Region → National. City and Municipality are alternatives at the same administrative level, not consecutive steps. For this study, the implemented chain should stop at the Zamboanga City/ZCDRRMO level unless the system genuinely transmits reports to a higher authority. Barangay and Purok remain DFD actors and organizational units, but not user-account subtypes. The project team exits the operational model after deployment, training, documentation, and formal turnover.

### Level 0 processes

1.0 Manage Organizations, Jurisdictions, Users, and Roles

2.0 Authenticate and Authorize Access

3.0 Capture and Version Incident Reports

4.0 Review, Verify, and Reconcile Reports

5.0 Generate, Review, and Approve SitReps

6.0 Search, View, and Export Records

7.0 Produce Authorized Dashboards and Analytics

Audit-event recording should be a cross-cutting system function/data store used by all state-changing processes, not a user-originated reporting process.

### Core data stores/entities

- Organization
- Jurisdiction Unit
- User
- Role and Permission
- User Role Assignment
- Hazard/Event or Incident
- Incident Report
- Incident Report Version
- Affected Population Record
- Damage Assessment
- Verification/Review Decision
- SitRep
- SitRep Version
- SitRep Source Report
- Approval Decision
- Attachment/Source Evidence
- Notification
- Audit Event
- Report Template

This is the minimum logical structure needed to represent the requirements already stated in the revised paper. Physical table design can merge a few lookup structures later if implementation simplicity requires it.

## Required balancing rules

Before accepting a revised diagram set, verify all of the following:

- Context and Level 0 use identical external actors and external data-flow labels.
- Every Level 0 process has either a matching Level 1 decomposition or no Level 1 diagram; numbering follows the parent process.
- A Level 1 diagram preserves the complete inputs and outputs of its parent process.
- No external entity connects directly to a data store.
- Every process has at least one input and one output, except an explicitly modeled terminal response.
- Every data store maps to one or more ERD/RDM structures.
- Every ERD entity maps to an RDM table or is explicitly identified as conceptual-only.
- All RDM relationships show PKs, FKs, cardinality/optionality, and matching data types.
- Submitted/verified/approved records are versioned rather than overwritten.
- Role names, report names, statuses, and organization/jurisdiction terms are identical across prose and diagrams.

## Revision order

1. Approve the canonical actors, record terminology, and seven Level 0 processes.
2. Redraw the context diagram and balance Level 0 against it.
3. Redraw only the Level 1 decompositions required by the panel/adviser.
4. Redesign the ERD from the approved process/data requirements.
5. Derive the RDM from the corrected ERD; do not edit the old RDM independently.
6. Revise the swimlanes using the same actors and lifecycle states.
7. Replace the explanatory paragraphs and captions after the diagrams stabilize.

## Proposed deliverables for the next pass

- `01_canonical_terms_and_rules.md`
- `02_context_and_dfd_specification.md`
- `03_erd_rdm_specification.md`
- `04_swimlane_specification.md`
- Corrected diagram source files and exported PNG/SVG figures after the specifications are approved
