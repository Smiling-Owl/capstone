# Canonical Terms and Diagram Rules

## Reporting hierarchy

```text
Purok → Barangay → City or Municipality → Province (where applicable) → Region → National
```

Implemented study flow:

```text
Purok Reporter
  → submits Purok Report
Barangay Reviewer/Reporter
  → reviews, returns, rejects, or consolidates reports
  → submits Barangay Report
ZCDRRMO Reviewer/Verifier
  → verifies, returns, rejects, or reconciles reports
ZCDRRMO Approver
  → approves City SitRep
Higher DRRM Authority
  → receives endorsed output only if included in system scope
```

## Canonical actors

| Actor | Primary responsibility |
|---|---|
| Purok Reporter/Leader | Create, correct, and submit Purok reports |
| Barangay Reviewer/Reporter | Review Purok reports and submit consolidated Barangay reports |
| ZCDRRMO Reviewer/Verifier | Verify, return, reject, and reconcile Barangay reports |
| ZCDRRMO Approver | Review and approve City SitReps |
| Organization Administrator | Manage users, roles, and jurisdiction assignments |
| Authorized Viewer | View permitted reports and dashboards |
| Higher DRRM Authority | Receive endorsed reports when included in scope |

## Canonical record names

| Record | Meaning |
|---|---|
| Purok Report | Initial report submitted from a Purok |
| Barangay Report | Reviewed or consolidated report submitted by a Barangay |
| Verification Decision | Recorded City/ZCDRRMO review outcome for a specific report version |
| City SitRep | City-level situation report assembled from eligible verified Barangay report versions |
| Report Version | Immutable submitted revision linked to its prior version |
| Audit Event | Security-relevant or record-lifecycle action recorded by the system |

Avoid using `Initial Report`, `Incident Report`, `Disaster Incident Report`, and `Barangay Report` interchangeably.

## Lifecycle states

```text
Draft → Submitted → Under Review
                    ├─ Returned for Correction → Resubmitted
                    ├─ Rejected
                    ├─ Partially Verified (when configured)
                    └─ Verified → Included in SitRep

SitRep Draft → Under Review → Approved → Released/Exported
```

Submitted, verified, and approved records are never overwritten. A material correction creates a new version and preserves the prior version.

## DFD rules

- Purok and Barangay are valid external entities because they exchange data with the system.
- External entities represent actors or organizational participants; database tables do not.
- Data-flow labels use noun phrases: `Purok report`, `review decision`, `correction request`, and `approved SitRep`.
- Process labels use verb phrases: `Submit Purok Report`, `Review Barangay Reports`, and `Approve SitRep`.
- Context and Level 0 must use identical external flows.
- Every Level 1 diagram must balance with its numbered Level 0 parent process.
- No external entity connects directly to a data store.

## ERD/RDM rules

- `OrganizationUnit` represents Purok, Barangay, City/Municipality, Province, Region, and National units.
- `OrganizationUnit.parent_unit_id` represents the administrative/reporting hierarchy.
- `User` represents a person who can authenticate.
- `UserRoleAssignment` connects a user, role, and organizational unit.
- Purok and Barangay must not inherit from `Account`/`User`.
- Reports store both the submitting organizational unit and the reporting period or incident.
- Review and approval decisions identify the reviewed version, decision maker, timestamp, outcome, and reason.
- Foreign-key types must exactly match referenced primary-key types.

## Scope boundary

The system supports reporting through the Zamboanga City/ZCDRRMO level. Regional and national actors should appear as downstream recipients only if the proposed system actually transmits endorsed reports to them. Otherwise, describe export or manual submission as outside the system boundary.

After deployment and formal turnover, the adopting DRRM organization owns and administers the system, hosting environment, database, backups, user accounts, roles, and configuration. The project team is not an operational actor and must not appear in the Context Diagram, DFDs, ERD, RDM, or normal operational swimlanes. Any later technical assistance is an external maintenance arrangement and does not imply routine production-data access.
