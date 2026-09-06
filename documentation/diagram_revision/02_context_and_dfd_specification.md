# Context Diagram and Level 0 DFD Specification

Status: **segregated academic model; mandate- and evidence-aligned**.

Authoritative editable artifact: `level_0_dfd_readable.drawio`.

For legibility, the Level 0 model is presented as five connected sheets (0A–0E) inside one draw.io file. Process numbers, external entities, data stores, and cross-sheet data packages remain part of one balanced Level 0 model.

## System boundary

System name: **Disaster Situation Record Management and Situation Report Generation System**

The deployed system is owned, hosted, and administered by the adopting DRRM organization. The project team is outside the operational system. Electronic submission to OCD, DILG, NDRRMC, or another higher authority remains outside the current system boundary; the system produces an approved export for authorized submission.

## External entities

Only these three external entities appear in the Context Diagram and Level 0 DFD:

| External entity | Responsibility |
|---|---|
| Purok User | Maintains Purok profile data, proposes hazards, submits and corrects Purok incident reports, and views authorized Purok records. |
| Barangay User | Manages Purok accounts, verifies Purok profiles and reports, maintains the Barangay profile, consolidates Barangay reports, proposes hazards, and views authorized Barangay records. |
| DRRM Administrator | Manages Barangay accounts, verifies Barangay profiles/reports and applicable hazard records, generates/reviews/approves Situation Reports, and views authorized city-level records. |

There is no self-registration. The next higher administrative level creates and manages the accounts beneath it.

## Segregation rule

Purok and Barangay functions are separate modules. They must not be collapsed into generic profiling, user-management, reporting, verification, or history processes.

The required profile chain is:

```text
Purok CDRA profile
  → Barangay verification of the Purok profile
  → verified Purok profile dataset
  → Barangay CDRA profiling and consolidation
  → DRRM verification of the Barangay profile
```

The required incident chain is:

```text
Purok incident report
  → Barangay verification of the Purok report
  → verified Purok report dataset
  → Barangay consolidation and submission
  → DRRM verification of the Barangay report
  → eligible source snapshot for Situation Report generation
```

## Level 0 processes

| No. | Process | Authorized actor and purpose |
|---|---|---|
| 1.0 | Manage Purok Users | Barangay User creates, assigns, activates, suspends, and resets Purok accounts. |
| 2.0 | Manage Barangay Users | DRRM Administrator creates and maintains Barangay accounts, roles, and jurisdictions. |
| 3.0 | Maintain Purok CDRA Profile | Purok User maintains versioned Purok hazard, exposure, vulnerability, capacity, facility, resource, and risk-map information. |
| 4.0 | Maintain Barangay CDRA Profile | Barangay User consumes verified Purok datasets, performs Barangay-wide consolidation, and adds Barangay-level CDRA information. |
| 5.0 | Create and Maintain Hazard Record | Purok, Barangay, and DRRM users create jurisdiction-scoped hazard versions with source evidence. |
| 6.0 | Verify Purok CDRA Profile | Barangay User accepts, returns, or rejects a specific Purok profile version. |
| 7.0 | Verify Barangay CDRA Profile | DRRM Administrator accepts, returns, or rejects a specific Barangay profile version. |
| 8.0 | Submit Purok Incident Report | Purok User submits preliminary and corrected, immutable report versions. |
| 9.0 | Verify Purok Incident Report | Barangay User reviews Purok evidence and records a version-specific decision or correction request. |
| 10.0 | Consolidate and Submit Barangay Incident Report | Barangay User consolidates eligible verified Purok reports and Barangay-level facts. |
| 11.0 | Verify Barangay Incident Report | DRRM Administrator verifies and reconciles a Barangay report version and its sources. |
| 12.0 | Generate, Review, and Approve Situation Report | DRRM creates a fixed as-of source snapshot, produces narrative and cumulative tables, records review/approval, and exports. |
| 13.0 | Browse Purok Incident Report History | Authorized Purok User retrieves retained Purok report versions and statuses. |
| 14.0 | Browse Barangay Incident Report History | Authorized Barangay User retrieves retained Barangay report versions and statuses. |
| 15.0 | Browse Situation Report Historical Catalog | Authorized DRRM user retrieves prior Situation Report versions, approvals, and exports. |
| 16.0 | View Platform Dashboard | Authorized users view jurisdiction-scoped maps, totals, trends, statuses, and source links. |
| 17.0 | Authenticate and Authorize Access | Validates credentials and enforces account, role, organization, jurisdiction, and record-state permissions. |
| 18.0 | Verify Hazard Record by Level | Barangay verifies Purok-origin records; DRRM verifies Barangay-origin records; a DRRM-origin record requires a distinct authorized DRRM verifier. |

Audit logging is a cross-cutting system action written to `D16 Audit Events`, not a user-initiated business process.

## Level 0 data stores

The stores remain separated wherever combining them would hide a Purok-versus-Barangay module boundary or a verification decision.

| No. | Data store | Principal contents |
|---|---|---|
| D1 | Purok User Accounts | Account identity, active state, Barangay assignment, Purok jurisdiction, credential metadata |
| D2 | Barangay User Accounts | Account identity, active state, DRRM assignment, Barangay jurisdiction, credential metadata |
| D3 | Roles and Jurisdictions | Roles, permissions, organization units, geographic codes/boundaries, assignments |
| D4 | Purok CDRA Profile Versions | Versioned Purok baseline hazard, exposure, vulnerability, capacity, facilities, resources, and maps |
| D5 | Barangay CDRA Profile Versions | Versioned Barangay consolidation plus Barangay-wide baseline information |
| D6 | Purok Profile Verification Decisions | Reviewed version, decision, reason, discrepancy/correction request, reviewer, timestamp |
| D7 | Barangay Profile Verification Decisions | Verified version, decision, reason, discrepancy/correction request, verifier, timestamp |
| D8 | Hazard Record Versions | Jurisdiction, geometry/location, characteristics, likelihood/intensity, exposure, source, author, version |
| D9 | Hazard Verification Decisions | Hazard version, verifying level, decision, reason, correction request, verifier, timestamp |
| D10 | Purok Incident Report Versions | Preliminary/corrected reports, chronology, impacts, actions, assistance, needs, as-of time |
| D11 | Purok Incident Verification Decisions | Purok report version, decision, discrepancy, reason, reviewer, timestamp |
| D12 | Barangay Incident Report Versions | Included Purok versions, Barangay facts, consolidated impacts/actions, discrepancies, as-of time |
| D13 | Barangay Incident Verification Decisions | Barangay report version, verification/reconciliation decision, reason, verifier, timestamp |
| D14 | Situation Report Versions and Approvals | Report number/type/version, cut-off, source snapshot, narrative, tables, approval/release/export |
| D15 | Attachments and Source Evidence | Photos/documents, source type/identity, geolocation, capture time, provenance, integrity metadata |
| D16 | Audit Events | Actor, action, record/version, prior/new state, timestamp, reason |

History modules read the version stores. They do not need separate “history databases.”

## Data-flow dictionary

| Flow label | Required content |
|---|---|
| Credentials / authentication result | Identifier, authentication evidence, account state, permitted role, organization and jurisdiction scope |
| Purok account and assignment data | Purok user identity, account state, Barangay/Purok assignment, role and permission assignment |
| Barangay account, role, and jurisdiction data | Barangay user identity, account state, DRRM/Barangay assignment, role and permission assignment |
| Purok CDRA profile package | Geography; climate projection/scenario; hazard inventory, location, intensity, frequency/probability; historical loss/damage; exposed population/assets; urban-use and natural-resource areas; critical facilities; lifelines; sensitivity/vulnerability; adaptive/coping capacity; risk score/map; source and version |
| Verified Purok profile dataset | Accepted Purok profile version, decision, reviewer, reason, timestamp, limitations, and provenance links |
| Barangay CDRA additions and consolidation | Included verified Purok versions; Barangay-wide data; cross-Purok facilities/resources; aggregation rules; discrepancies; source; as-of time; version |
| Hazard proposal / verification package | Jurisdiction and geometry; hazard type/characteristics; likelihood/frequency; intensity/severity; exposed areas; evidence; author/version; decision, reason, correction request, verifier, timestamp |
| Purok incident report package | Incident reference/type; exact geography; occurrence/discovery/report times; reporting source; chronology; affected population; evacuation; casualties; damaged houses/infrastructure/agriculture/livelihood; service disruption; actions; assistance/resources; needs/issues; attachments; as-of time |
| Verified Purok report dataset | Accepted Purok report version, decision, reviewer, reason, timestamp, source links, and unresolved limitations |
| Barangay incident consolidation package | Included verified Purok versions; excluded/returned items and reasons; consolidated impacts/actions; Barangay facts; unresolved discrepancies; source set; as-of time; version |
| Barangay verification / reconciliation package | Submitted Barangay version; source-evidence summary; discrepancy and reconciliation; decision, reason, verifier, and timestamp |
| Situation Report source snapshot | Eligible verified report versions at a fixed cut-off; chronology and prevailing situation; affected population/displacement/evacuation; casualties; damage/loss; related incidents; actions; assistance/resources; service status; issues/needs; recommendations; provenance and unresolved discrepancies |
| Situation Report review / approval package | Report number/type/version; operational period/as-of time; narrative and cumulative tables; source summary; correction/review decision; approver; approval/release time; export status |
| Authorized history/dashboard query and result | Jurisdiction-scoped criteria; returned versions, maps, trends, totals, statuses, source links, and authorized export |

## Mandate and evidence mapping

- **Republic Act No. 10121, Sections 3 and 12:** disaster information includes human, material, economic, and environmental impacts; risk assessment/mapping; vulnerable groups; local hazard, vulnerability, and climate-risk information; resources/equipment; directories; and critical-infrastructure locations and capacities.
- **DHSUD CDRA guidance:** CDRA is the baseline risk-assessment basis. Its exposure database includes population, urban-use areas, natural-resource production areas, critical point facilities, lifeline utilities, and other elements at risk, together with sensitivity, adaptive capacity, maps, and risk scores.
- **NDRRMOC SOPG 2024, pp. 52–55 and 63:** initial information may be incomplete; progress reporting carries current developments/actions and supporting sources; terminal reporting carries final impact figures; Situation and Final Reports are cumulative and cover situation, actions, effects, issues, outcomes, shortcomings, and recommendations.
- **Published NDRRMC Situation Reports:** actual documents use report number/as-of time and tables for affected population, casualties, evacuation, related incidents, damaged houses, infrastructure and sectoral damage, actions, assistance/resources, service status, remarks, and report status.
- **Project interview evidence:** the DRRM respondent identified narrative and chronology, variable operational periods, first- and second-hand source limits, retained prior versions, verification, privacy sanitation, approval before publication, and authorized access.

The mandates do not prescribe this application's exact database schema or literal Purok-to-Barangay software routing. Those are design decisions grounded in the study's confirmed actors, academic module convention, and local interview evidence.

## Balancing and control rules

- Context and Level 0 use identical external-flow labels.
- External entities never read or write a data store directly.
- Processes use verb phrases; flows and stores use noun phrases.
- Submitted, verified, approved, and released records are immutable. A correction creates a linked version.
- Purok and Barangay profile, incident, verification, and history responsibilities remain visibly separate.
- CDRA baseline risk data is not current incident-impact data.
- Barangay review, DRRM verification, and DRRM approval/release are distinct permissions.
- With only the three confirmed external entities, a DRRM-originated hazard uses internal maker-checker separation; approval by a higher external authority is outside scope.
- Personally identifiable casualty data and attachments require role-based access and sanitation before publication/export.

## Required Level 1 diagrams

Level 1 decomposition is recommended for processes 3.0 through 12.0 and 18.0. Processes 1.0, 2.0, and 17.0 need Level 1 diagrams if required by the adviser or panel. Processes 13.0–16.0 can remain Level 0 unless their query, filtering, or authorization logic becomes substantial.

## Primary references

- Republic Act No. 10121: https://lawphil.net/statutes/repacts/ra2010/ra_10121_2010.html
- DHSUD, *Climate and Disaster Risk Assessment (CDRA) Briefer*: https://www.dhsud.gov.ph/wp-content/uploads/Publication/CDRA/CDRA_Briefer_USAID-SURGE%26DHSUD.pdf
- DHSUD/HLURB, *Supplemental Guidelines on Mainstreaming Climate and Disaster Risks in the Comprehensive Land Use Plan*: https://dhsud.gov.ph/wp-content/uploads/Publication/Guidebooks/HLURB_Supplemental_Guidelines.pdf
- NDRRMC, *NDRRM Operations Center Standard Operating Procedures and Guidelines, 2024 Edition*: https://ndrrmc.gov.ph/attachments/article/4125/NDRRMOC_SOPG_2024_EDITION.pdf
- NDRRMC, *SitRep No. 44 for El Niño 2023*: https://ndrrmc.gov.ph/attachments/article/4252/SitRep_No__44_for_El_Nino_2023_240513_110710.pdf
- Project evidence: `documentation/transcripts/CAPSTONE-INTERVIEW TRANSCRIPTS.md`
