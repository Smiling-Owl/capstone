# Context Diagram and Level 0 DFD Specification

Status: Draft revision based on DRRM ownership and bottom-up reporting.

## System boundary

System name: **Disaster Situation Record Management and Situation Report Generation System**

The deployed system is owned, hosted, and administered by the adopting DRRM organization. The project team is outside the operational system and does not appear as an actor.

## Context Diagram

### External entities and flows

| External entity | Data sent to the system | Data received from the system |
|---|---|---|
| Purok Reporter | Account credentials; Purok report; corrected Purok report | Authentication result; report status; correction request; notification |
| Barangay Reviewer/Reporter | Account credentials; review decision; consolidated Barangay report; corrected Barangay report | Authentication result; assigned Purok reports; report status; correction request; notification |
| ZCDRRMO Reviewer/Verifier | Account credentials; verification decision; reconciliation details | Authentication result; submitted Barangay reports; discrepancy information; notification |
| ZCDRRMO Approver | Account credentials; SitRep review decision; approval decision | Authentication result; SitRep draft; source-report summary; notification |
| DRRM System Administrator | Account credentials; user/role/jurisdiction configuration; system configuration | Authentication result; account/configuration status; audit information |
| Authorized DRRM Viewer | Account credentials; search/filter request; dashboard request | Authentication result; authorized reports; dashboard/analytics data |
| Higher DRRM Authority | — unless electronic transmission is in scope | Approved/endorsed City SitRep or exported report |

If higher-level transmission is manual, omit `Higher DRRM Authority` from the DFD and state that approved reports are exported for submission outside the system.

## Level 0 processes

| No. | Process | Purpose |
|---|---|---|
| 1.0 | Manage Users, Roles, and Jurisdictions | DRRM-controlled account and access administration |
| 2.0 | Authenticate and Authorize Access | Validate credentials and determine permitted actions |
| 3.0 | Capture and Version Purok Reports | Create, submit, correct, and preserve Purok report versions |
| 4.0 | Review and Consolidate Barangay Reports | Review Purok submissions and create the Barangay-level report |
| 5.0 | Verify and Reconcile Barangay Reports | Perform City/ZCDRRMO verification and record decisions |
| 6.0 | Generate, Review, and Approve City SitReps | Assemble eligible verified sources and approve the City SitRep |
| 7.0 | Search Records and Produce Analytics | Provide authorized catalog, dashboard, and export functions |

Audit events are recorded by all state-changing processes in `D8 Audit Events`; audit logging is not a separate user-initiated business process.

## Level 0 data stores

| No. | Data store |
|---|---|
| D1 | Users, Roles, and Assignments |
| D2 | Organizations and Jurisdictions |
| D3 | Incidents and Hazards |
| D4 | Purok and Barangay Report Versions |
| D5 | Review and Verification Decisions |
| D6 | SitRep Versions and Approvals |
| D7 | Attachments and Source Evidence |
| D8 | Audit Events |

## Balancing notes

- Context Diagram flows are intentionally expressed as data, not actions or permissions.
- Level 0 must preserve each external input and output listed in the context specification.
- Barangay has a dual role: it receives Purok reports for review and submits a consolidated Barangay report upward.
- ZCDRRMO review and approval are separated so verification and final authorization are not treated as the same decision.
- Submitted records are versioned; correction never overwrites the prior submitted version.
- Hosting administration belongs in the deployment/architecture section. Only DRRM user, role, jurisdiction, and system configuration appears in the DFD.

## Required Level 1 diagrams

- Level 1 for 3.0 Capture and Version Purok Reports
- Level 1 for 4.0 Review and Consolidate Barangay Reports
- Level 1 for 5.0 Verify and Reconcile Barangay Reports
- Level 1 for 6.0 Generate, Review, and Approve City SitReps

Processes 1.0, 2.0, and 7.0 need Level 1 diagrams only if required by the adviser or panel.
