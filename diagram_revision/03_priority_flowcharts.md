# Priority Flowcharts: Current, Mandated, and Proposed

These three flowcharts use the same subject—incident information moving from the community level toward a City SitRep—but answer different questions.

## 1. Current system flowchart

Purpose: document the existing mostly manual process described in the manuscript and interviews.

Key characteristics:

- Purok observations are communicated to the Barangay.
- Barangay personnel prepare an initial report and send it through SMS, calls, online messaging, or other existing channels.
- Barangay personnel gather affected-population and damage information.
- ZCDRRMO receives submissions from multiple Barangays and manually consolidates records using tools such as Google Drive and spreadsheets.
- ZCDRRMO prepares the City SitRep and submits it through the applicable official process.

This is an **as-is** diagram. It must not show proposed automated verification, version control, role-based access, or automatic consolidation.

Editable source: `current_system_flowchart.mmd`

## 2. Mandated reporting lifecycle flowchart

Purpose: show the report lifecycle required or supported by the 2024 NDRRMOC SOPG and the human-verification requirement reflected in Operation LISTO.

The authoritative lifecycle is:

```text
Incident onset
→ Initial Report, even when information is preliminary
→ Human review and source-document checking
→ Progress Report(s) as conditions and actions change
→ Terminal Report when the response process or phase concludes
→ cumulative SitRep(s), when applicable
→ Final Report containing final outcomes, shortcomings, and recommendations
```

Important limitation: the NDRRMOC SOPG defines report classifications, expected contents, documentation, and cumulative reporting. It does not by itself justify claiming that every local report must electronically pass through Purok → Barangay → City → Region → National in one software workflow. The diagram therefore separates the mandated report lifecycle from the study's local organizational routing.

The guideline permits an Initial Report at incident onset before supporting information is complete; Progress Reports contain updates and should be supported by source documentation; Terminal Reports close an incident response process or phase with final impact figures; SitReps are cumulative; and Final Reports preserve final outcomes and recommendations. Human DRRM review remains necessary for official evidence and compliance.

Editable source: `mandated_reporting_flowchart.mmd`

Official basis: National Disaster Risk Reduction and Management Council, *NDRRMOC Standard Operating Procedures and Guidelines: 2024 Edition*, pp. 52–55 and 63; DILG Operation LISTO manuals.

## 3. Proposed system flowchart

Purpose: show how the proposed system supports the bottom-up local workflow without claiming to replace official review or automatically issue a national NDRRMC report.

Key controls:

- Purok reports remain identifiable by source, time, incident, jurisdiction, and version.
- Barangay acts first as reviewer of Purok submissions and then as reporter to ZCDRRMO.
- Returned or corrected reports create a new version instead of replacing the submitted version.
- ZCDRRMO verifies Barangay reports and records its decision and reason.
- Only eligible verified report versions are included in the City SitRep draft.
- A DRRM approver reviews and approves the City SitRep.
- The approved City SitRep is exported for the applicable official submission process; the system does not independently confer national NDRRMC status.
- The DRRM organization owns, hosts, and administers the system after turnover.

Editable source: `proposed_system_flowchart.mmd`

## Figure titles

- **Figure 1.1.2. Current Process of Purok-to-ZCDRRMO Incident Reporting and City SitRep Preparation**
- **Figure 1.1.3. NDRRMOC Guideline-Aligned Disaster Reporting Lifecycle**
- **Figure 1.2.1. Proposed Purok-to-ZCDRRMO Report Review, Consolidation, and City SitRep Workflow**

Use “guideline-aligned” rather than “national mandated routing” unless the paper cites a source that explicitly prescribes every organizational handoff shown.
