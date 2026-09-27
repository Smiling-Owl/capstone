# Capstone Presentation Outline and Slide Content

**Project:** Integrated Disaster Incident Record Management and Automated Situation Report Generation System  
**Authors:** Katrina Mae D.G. Perez and RJ P. Somosa  
**Source:** `Perez-Somosa_capstone_final.docx` in the revisions folder

The order below follows the revised presentation outline. The slide numbers map directly to `Integrated_Disaster_Incident_Record_Management_Capstone_Proposal_Revised_Final_v5.pptx`. The deck uses 43 slides because the detailed module section and diagrams are separated for readability.

| No. | Section | Slides | Main content |
|---:|---|---:|---|
| 1 | Title Page | 1 | Full scholarly system title, authors, program, adviser, date and institution location. |
| 2 | Presentation Flow | 2 | Roadmap from RA 10121 and Operation L!STO through the reporting context, proposed system, data models, development and significance. |
| 3 | RA 10121 (The Mandate) | 3 | Local DRRM information, monitoring, database, dissemination and coordination responsibilities; distinguishes the mandate from this specific software proposal. |
| 4 | Operation L!STO Manual | 4 | Explains DILG–LGA preparedness guidance and minimum, hazard-specific protocols; includes DILG Region IX’s 2023 rollout in Zamboanga Peninsula and distinguishes operational guidance from RA 10121 and from the proposed software. |
| 5 | Situation Report | 5 | Initial, Progress, Terminal and Final reporting; proposed report content: identification, situation, preparedness, consolidated effects, response, issues, recommendations, and supporting control/source/approval/annex material as applicable. |
| 6 | Current Workflow | 6 | Purok observation and communication, Barangay checking and preparation, ZCDRRMO follow-up, manual consolidation and City SitRep submission. |
| 7 | Implications of the Current Workflow | 7 | Qualitative effects on timeliness, staff effort, record continuity, verification workload and controlled information sharing. No unreported delay/error measurements are asserted. |
| 8 | Possible Solutions and Why Not | 8 | Compares calls/SMS/radio, paper/spreadsheets, and single-level reporting applications; explains what each supports and what remains unresolved when used alone. |
| 9 | Problem Statement | 9 | Four paper-based problem themes: communication delay, manual record management, limited data sharing and inefficient verification. |
| 10 | Workflow Gaps and Why Mandated Practice Should Be Followed | 10 | Maps RA 10121 and NDRRMC reporting/validation practice to current workflow gaps and design responses, while clarifying that law does not mandate this particular platform. |
| 11 | Proposed System | 11 | Three boxes explain what the system is, why it is needed based on the paper's workflow problems, and how Purok submissions move through Barangay verification and consolidation to DRRM SitRep preparation. Officials retain factual review, approval and release authority. |
| 12 | Proposed System Objectives | 12 | General and specific objectives, with evaluation criteria framed as planned targets rather than achieved results. |
| 13 | Proposed System Flowchart | 13 | Issued-account login; Purok submission; Barangay and DRRM review gates; correction returns; SitRep preparation, authorized approval and export. |
| 14 | Proposed System Modules (Overview) | 14 | All 17 named modules grouped without combining responsibilities across Purok, Barangay and system-administration levels. |
| 15 | Existing Systems | 15 | Paper-based comparison of Bandilyo, AGAPP, IRespondPH and Mamamayan; limits the comparison to related systems reviewed in the manuscript. |
| 16 | Problem, Objectives and Methods | 16 | Traceability matrix connecting each problem to its objective and system method: hierarchical submission, centralized versioned records, role-scoped access and staged human verification. |
| 17 | Users and Characteristics | 17 | Purok personnel: mobile-first aggregate reporting; Barangay personnel: review and consolidation on mobile or desktop; DRRM administrators: desktop-capable administration and SitRep work. Unspecified demographic traits are not invented. |
| 18 | Scope and Limitations | 18 | Response/recovery and report-history scope; internet and centralized database dependency; no offline sync, SMS fallback, native app, pre-disaster preparedness or risk-monitoring functions. |
| 19 | Architectural Design | 19 | Presentation, application, network and data layers; summarized using the stack and operational assumptions in the revised text rather than stale Figure 25 claims. |
| 20 | Proposed System Modules (Detailed) — How and Why | 20–25 | Each of the 17 modules is explained by its operation and purpose. Covers issued accounts, monthly aggregate profiles, Purok initial reports, level-specific verification, Barangay consolidation, history, hazard configuration, dashboards and editable SitRep preparation. |
| 21 | DFD | 26 | Level 0 actors, processes and data stores; explains the role-separated reporting flow and notes that a DFD does not define relational keys. |
| 22 | ERD | 27 | Account supertype with Purok, Barangay and DRRM subtypes; profile, hazard, incident and SitRep entity families; conceptual ERD convention uses underlined identifiers and relationships, without FK attributes. |
| 23 | RDM | 28 | Relational table groups and relationships, distinguishing the connected implementation-oriented RDM from the conceptual ERD. |
| 24 | User Flow: Purok, Barangay and DRRM Administrator | 29–31 | Role-specific sequences from sign-in and submission through review, correction, consolidation, SitRep preparation, approval and export. |
| 25 | Overview of the Development Plan | 32 | Requirements, design, build, alpha testing, beta evaluation and refinement; no unsubstantiated sprint dates or completed milestones. |
| 26 | Technicalities: Technology Stack, Testing and AI Use | 33–35 | Paper-specified stack and test plan; AI use across research, analysis, design and presentation work to date, plus planned architecture, coding, debugging and test support, with researcher verification and disclosure. Clarifies that AI assistance is separate from system functionality. |
| 27 | Significance of the Project | 36 | Intended value for Purok, Barangay, DRRM organizations and future research, clearly identified as expected rather than proven impact. |
| 28 | Summary | 37 | Purok-originated information progresses through Barangay consolidation to authorized DRRM SitRep work, with traceability and human verification. |

Slides 38–43 are supporting material: selected references, discussion, and full source copies of Figure 2 (flowchart), Figure 27 (Level 0 DFD), Figure 40 (ERD) and Figure 41 (RDM).

## Before the defense

The revised paper contains items that should be reconciled before presenting them as settled design facts:

- The scope describes a configurable multi-organization system in one passage and an exclusively ZCDRRMO system in another.
- Figure 25 appears to show mobile applications and offline relay, while the scope excludes a native app and offline synchronization. The presentation therefore follows the prose scope and does not reproduce Figure 25 as the architecture.
- Table 2's Purok dashboard wording should be checked against the role-scoped dashboard description in the scope.
- The specific objectives repeat Barangay Incident Report History.
- The SitRep section list is presented as the paper's proposed structure. The deck does not claim that RA 10121 mandates this exact eight-part software form; the applicable official reporting template should govern document-control and annex requirements.

These are manuscript alignment points, not new requirements added to the project.
