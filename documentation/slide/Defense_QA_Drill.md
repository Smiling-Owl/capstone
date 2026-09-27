# Capstone Defense: Panel Q&A Drill

**Project:** Integrated Disaster Incident Record Management and Automated Situation Report Generation System  
**Prepared from:** *Thesis Defense Presentation.pptx* and *Perez-Somosa_capstone_final.docx*  
**Purpose:** Rehearse clear, evidence-based answers. The answers below are speaking anchors, not scripts to memorize.

## How to answer in the room

Use this sequence: **answer the question directly → connect it to the paper or diagram → state the boundary or limitation.** If the paper does not give a number or implementation result, say so and give the exact information only if you can verify it from your study records. Do not fill a gap by guessing.

Keep the central distinction clear:

- Purok originates aggregate baseline information and a brief initial incident report.
- Barangay verifies Purok submissions, consolidates Purok data, and prepares a more complete Barangay incident report.
- The DRRM Administrator verifies the Barangay submission and prepares an editable Situation Report draft from eligible verified sources.
- Human reviewers retain factual judgment, approval, and official release authority. The system supports their work; it does not replace them.

## Resolve these before the panel sees the deck

These are the most likely consistency checks. A panelist may notice them immediately.

1. **Offline capability conflicts.** Slide 15’s architecture lists “Synchronization & Offline Relay Handlers” and localized client registries. The scope slide says the system is web-based, uses a centralized database, and has no offline synchronization or SMS fallback. Several interface descriptions in the paper also mention offline drafts or queued offline submissions. Decide which design is in scope, then make the architecture, UI descriptions, and limitations agree. As currently written, the defensible scope is online-only; retain radio/phone contingency channels during outages.
2. **Pilot scope conflicts.** The scope describes a configurable service for participating DRRM organizations, with ZCDRRMO as the study setting/potential pilot. Elsewhere, the paper says the system is exclusively for the ZCDRRMO process. Clarify whether this study designs for one pilot organization or a multi-organization service; do not claim both without explaining the boundary.
3. **The deck shows an ERD, not the RDM.** Slide 17 is labeled ERD and uses conceptual relationship labels such as “creates,” “verifies,” and “includes.” The manuscript has a separate relational data model (Figure 41), but the current slide deck does not show it. If asked about the RDM, distinguish it from the ERD and do not call slide 17 an RDM.
4. **Monthly profile history is clearer in the manuscript’s RDM than in the slide ERD.** The RDM describes a profile series, reporting month, and linked profile versions; the ERD slide does not make the period/version structure evident. Add or explain that distinction so monthly snapshots and corrections are not confused with overwriting one profile.
5. **Account subtype notation needs a rule.** The ERD shows Account with DRRM, Barangay, and Purok subtypes and a “D” marker. Be ready to state whether subtypes are disjoint and whether every account must belong to exactly one subtype. The diagram’s total/partial participation rule is not obvious.
6. **Check the objectives for duplication and testability.** The manuscript repeats the Barangay Incident Report History objective. Several objectives promise 100% correct verification decisions or 100% consolidation accuracy; explain the test dataset, ground truth, and pass/fail rule, or revise the targets to measurable criteria you can defend.
7. **Interview methodology needs exact details.** The paper describes interviews with Barangay officials and ZCDRRMO personnel and cites a named ZCDRRMO practitioner, but the reviewed methods section does not clearly state the total participant count, sampling approach, or formal analysis procedure. Prepare these from your actual records; do not infer them from the quotations.
8. **Qualify claims about laws and existing systems.** Do not say RA 10121 requires this software, that Operation L!STO is a law, or that no related system has a feature unless your sources establish that. Describe the comparison as limited to the systems and published materials reviewed. The paper’s broad claims about sanctions, funding triggers, error reduction, and universal workflow problems need careful qualification.
9. **Clarify the name “SitRepO.”** The paper uses SitRepO as the proposed system name in its related-systems discussion, while the title slide uses the full scholarly title. If SitRepO is simply the proposed system’s short name, say so consistently; do not let it sound like a separate existing product.
10. **Clarify the backend boundary.** The paper names Node.js and PostgREST. Be ready to state which component owns application/business rules, authentication, authorization, and database access. If that division is not finalized, call it a proposed stack rather than a completed implementation.

## Panelist 1 — Clarificatory questions

This panelist is trying to understand the project fairly. Answer plainly and define project-specific terms before adding detail.

### Project and problem

**1. In one minute, what is your study about?**  
**Answer anchor:** Our study designs, develops, and evaluates a role-based web system for managing disaster incident records and preparing Situation Report drafts. It structures information as it moves from Purok to Barangay to the DRRM Administrator, with review and consolidation at each level.

**2. What problem led you to propose this system?**  
**Answer anchor:** The study identifies four connected problems in the observed ZCDRRMO reporting workflow: communication delay, time-consuming manual record handling, limited data sharing, and inefficient verification. The proposed system addresses the handoffs and record handling through visible status, structured submissions, role- and jurisdiction-based access, and a documented review trail.

**3. How did you identify those problems?**  
**Answer anchor:** The paper grounds the problem statement in the described current workflow and interviews with Barangay and ZCDRRMO personnel, including accounts of repeated calls, manual report editing, information gaps, and personnel-intensive verification. I would describe the findings as evidence from the study setting, not as proof that every LGU works the same way.

**4. What is the difference between the general and specific objectives?**  
**Answer anchor:** The general objective states the overall aim: design, develop, and evaluate the centralized, role-based system. The specific objectives break that aim into modules and observable functions, such as user management, profiling, hazard records, incident reporting and verification, SitRep generation, history, and dashboards.

### Users and workflow

**5. Who are the intended users, and why are there three levels?**  
**Answer anchor:** The intended operational users are Purok personnel, Barangay personnel, and DRRM Administrators. The levels follow the administrative reporting workflow: local observations originate at Purok, Barangay reviews and consolidates local submissions, and DRRM reviews higher-level submissions and prepares the SitRep.

**6. What data does a Purok submit in an initial incident report?**  
**Answer anchor:** The initial report is deliberately short: hazard/event identification, location, date and time, affected exposure units or population totals, and an initial situation description. It is an early report, not a complete damage assessment or SitRep.

**7. What changes when the report reaches Barangay?**  
**Answer anchor:** Barangay reviews the Purok submissions, requests corrections where needed, and consolidates eligible verified information into a more complete Barangay incident report. The Barangay stage can include consolidated affected-population figures, casualty summaries, and damage assessment. This is why the Purok form should remain lightweight.

**8. What does the DRRM Administrator do with the Barangay report?**  
**Answer anchor:** The DRRM Administrator reviews and verifies the Barangay-level submission, then selects eligible verified information and a reporting cutoff for a Situation Report. The system prepares an editable draft; authorized personnel review, approve, and submit the official document.

**9. Why separate Purok profiling and Barangay profiling instead of combining them?**  
**Answer anchor:** They represent different levels of responsibility and different data transformations. Purok profiles provide aggregate community baselines; Barangay profiles consolidate verified Purok profiles and may include Barangay-wide information. Keeping them distinct preserves source lineage and makes each level’s review responsibility visible.

**10. What is stored in a community profile? Do you record every household?**  
**Answer anchor:** The profile is an aggregate monthly snapshot of population, households/families, housing, vulnerability, and hazard exposure. It is not a register of named households or residents. Incident records may still contain sensitive information, so privacy safeguards remain relevant.

### Mandates, reports, and contribution

**11. What role do RA 10121 and Operation L!STO play in the project?**  
**Answer anchor:** RA 10121 establishes local DRRM institutions and responsibilities, including local disaster-risk information and coordination. Operation L!STO provides preparedness manuals and operational guidance. They inform the project’s context and workflow, but neither mandates this particular software. [RA 10121, Supreme Court E-Library](https://elibrary.judiciary.gov.ph/thebookshelf/showdocs/2/21121); [Operation L!STO manual, Local Government Academy](https://lga.gov.ph/uploads/publication/attachments/1590478478.pdf).

**12. What does “automated Situation Report generation” mean?**  
**Answer anchor:** “Automated” means the system can retrieve eligible verified records and pre-populate structured sections of an editable draft using the selected report type and cutoff. It does not mean AI writes or verifies facts, or that the system automatically issues an official report.

**13. What is the project’s main contribution compared with the related systems?**  
**Answer anchor:** The proposal focuses on the administrative reporting lifecycle: a Purok-to-Barangay-to-DRRM review chain, consolidated records, version/history support, and preparation of a structured SitRep draft. The comparison is based on the systems and published descriptions reviewed; it is not a claim that every other system lacks every one of these features.

**14. What is outside the system’s scope?**  
**Answer anchor:** The stated prototype focuses on during- and post-disaster reporting and SitRep preparation. It does not include pre-disaster preparedness/risk-monitoring functions, public announcements, native mobile apps, offline synchronization, or SMS fallback. Existing contingency channels remain necessary during outages.

## Panelist 2 — Questions checking whether you know what is in your paper

This panelist already knows the paper and is checking for overstatement or contradiction. Slow down, answer only what the paper supports, and correct yourself if needed.

### Mandates and evidence

**1. Which section of RA 10121 specifically requires your system?**  
**Answer anchor:** No section requires this specific software. RA 10121 establishes institutional roles and DRRM responsibilities; our system is a proposed tool to support selected information-management and reporting work. We should not present the software as a legal requirement. [RA 10121, Supreme Court E-Library](https://elibrary.judiciary.gov.ph/thebookshelf/showdocs/2/21121).

**2. Is Operation L!STO a law?**  
**Answer anchor:** No. It is a DILG/LGA preparedness program and set of manuals. It helps inform local operational context; it is not a statute and does not prescribe our application. [Operation L!STO manual, Local Government Academy](https://lga.gov.ph/uploads/publication/attachments/1590478478.pdf).

**3. Does the Sendai Framework require this application or this particular database?**  
**Answer anchor:** No. The Sendai Framework is a global disaster-risk-reduction framework with priorities such as understanding risk, governance, resilience investment, and preparedness. We use it as policy context, not as a software specification. [UNDRR, Sendai Framework 2015–2030](https://www.undrr.org/publication/sendai-framework-disaster-risk-reduction-2015-2030).

**4. Are you saying every Barangay and DRRM office has the same workflow problem?**  
**Answer anchor:** No. The paper’s problem evidence concerns the workflow investigated for this study. The workflow may differ across LGUs, so the findings should not be generalized without broader evaluation.

**5. How many interview participants did you have, how were they selected, and how were responses analyzed?**  
**Answer anchor:** The paper needs to state these clearly. I will provide the exact participant count, roles, selection criteria, interview dates, and analysis procedure from our research records—not estimate them during the defense.  
**Before presenting:** Fill this in from the approved methods and actual interview records: **[participant count]**, **[roles]**, **[sampling method]**, **[analysis/coding method]**.

**6. Does your research prove the system reduces delays, errors, or disaster losses?**  
**Answer anchor:** Not yet. The paper identifies problems and proposes design features to address them. The planned evaluation can assess functionality, usability, and specified quality criteria; we should not claim measured reductions or improved disaster outcomes without results.

### Scope and requirements

**7. Can users submit reports when there is no internet?**  
**Answer anchor:** Not in the stated scope. The prototype depends on internet access and the centralized hosted database. Radio, telephone, and other current contingency channels must remain available during an outage. The offline-relay language in the architecture is inconsistent and should be removed or reconciled before the defense.

**8. Does the system automatically determine whether a report is factually true?**  
**Answer anchor:** No. Automated checks can flag missing fields, invalid ranges, inconsistent values, or possible duplicates. Human reviewers determine whether evidence supports the report and record the decision or correction request.

**9. Does every Purok report include casualties and a full damage assessment?**  
**Answer anchor:** No. Purok’s initial report is intentionally concise and captures the hazard, location/time, initial situation, and affected exposure/population totals. More detailed, consolidated casualty and damage information is handled at Barangay and SitRep stages as it becomes available.

**10. Is there one fixed national list of hazards in the system?**  
**Answer anchor:** No. The paper says hazard types follow the participating organization’s CDRA. Authorized users record/classify hazards according to that adopted CDRA; the system does not independently assess risk or decide a classification.

**11. Does an exported SitRep automatically become official or trigger a declaration, funding, or response deployment?**  
**Answer anchor:** No. The system prepares an output for authorized human review. Government officials retain approval, official submission, and operational decisions. The system does not itself declare a state of calamity, allocate funding, or dispatch response teams.

**12. Have you already achieved the SUS score of 68 or passed the tests shown?**  
**Answer anchor:** The presentation describes planned alpha and beta testing, and 68 is a proposed SUS target—not a result. I should report actual outcomes only if testing has been completed and documented. If it has not, I will say it remains planned.

**13. Why do some objectives promise 100% correct verification? Can that be guaranteed?**  
**Answer anchor:** It is a target in the current wording, not a guarantee about real-world truth. To defend it, we need a defined test set with independently established expected decisions, acceptance criteria, and a clear denominator. If the methodology does not define that, revise the objective to a measurable test criterion rather than promise perfect factual verification.

**14. Do the comparison results prove that other systems lack verification, report history, or export?**  
**Answer anchor:** No universal claim is justified. The comparison summarizes features documented in the sources reviewed. We should say “not described in the materials reviewed” rather than “the system cannot do this,” unless we have current, direct evidence.

**15. Does the project use AI to verify reports or generate disaster facts?**  
**Answer anchor:** The paper and deck do not define AI as a system capability. Do not imply the application uses AI. If asked about AI assistance during the project lifecycle, describe actual use honestly and separate drafting or development assistance from implemented system functions.

**16. Why does the presentation call the proposed system “SitRepO” in one place and use the full title elsewhere?**  
**Answer anchor:** If SitRepO is the short name for our proposed system, I will state that clearly. It is not a separate existing product. We should use the same naming consistently in the paper and slides.

## Panelist 3 — Technical questions and curveballs

This panelist may test whether the models can be implemented and whether the claims survive edge cases. Give the design intention, then identify what is specified and what remains to be tested.

### Architecture and data flow

**1. Your architecture shows offline relays, while your scope excludes offline use. Which design is correct?**  
**Answer anchor:** The current written scope is online-only with one centralized database. The architecture graphic is inconsistent and should be corrected before presenting. I would not claim offline capability unless it is explicitly added to the scope, data model, synchronization rules, and test plan.

**2. Why is this a layered architecture, and what belongs in each layer?**  
**Answer anchor:** The design separates presentation, application/business rules, network/API communication, and persistence. The user interface handles role-specific workflows; application logic enforces validations and permissions; the API transports requests; PostgreSQL stores the records. These are proposed boundaries, and the final architecture must specify each component’s responsibility.

**3. The paper names both Node.js and PostgREST. Why use both?**  
**Answer anchor:** The intended stack is Node.js for application services and PostgREST for exposing PostgreSQL data/API operations. The division of business-rule enforcement, authentication, authorization, and database access must be explicit so controls are not split ambiguously. If the final implementation does not yet settle that boundary, describe it as a design decision still to finalize.

**4. Why use a relational database for this problem?**  
**Answer anchor:** The data have structured relationships: organizations and accounts, profiles and versions, incidents and reviews, and SitRep sections and sources. A relational model can express these associations and integrity constraints. The paper proposes PostgreSQL; performance or availability claims still require appropriate testing.

**5. How does the DFD differ from the flowchart?**  
**Answer anchor:** The flowchart emphasizes user decisions and process sequence. The DFD emphasizes which data enter a process, how the process transforms them, where they are stored, and what data leave. In the Level 0 DFD, the Purok, Barangay, and DRRM Administrator are external entities interacting with numbered processes and data stores.

**6. Why is information routed through Barangay instead of sending Purok data directly to DRRM?**  
**Answer anchor:** Barangay is the intermediate jurisdictional review and consolidation level in the proposed workflow. It checks Purok submissions, requests corrections, consolidates verified information, and prepares a higher-level incident report; DRRM then reviews that Barangay-level report.

### ERD, RDM, and database logic

**7. Your slide says ERD. Is that also your RDM?**  
**Answer anchor:** No. Slide 17 presents the conceptual ERD: entities, attributes, subtype structure, and named relationships. The paper’s RDM is a separate, implementation-oriented model with relations/tables, keys, versioning, source links, and constraints. The current defense deck does not show that RDM slide, so I should not label the ERD as an RDM.

**8. Why does your RDM look different from a simple connected table diagram?**  
**Answer anchor:** The manuscript’s RDM is a schema-level model intended to show more than table names: it includes version records, review decisions, evidence/source associations, SitRep source snapshots, and structured report content. The layout is custom because the full model is large; the core relational content is still tables, attributes, primary keys, foreign keys, and constraints. We should present a readable connected view or a scoped view if the full page is too dense. Do not claim formal normalization levels unless we can demonstrate them.

**9. How should the Account subtype rule work?**  
**Answer anchor:** The intended model is a common Account identity with role-specific Purok, Barangay, or DRRM details. We need to state whether an account must belong to exactly one subtype and whether multiple operational roles are possible. The “D” marker indicates a disjointness intention, but the diagram should make total versus partial specialization explicit.

**10. How are monthly profile updates preserved without overwriting history?**  
**Answer anchor:** The RDM separates a profile series from profile versions and associates the series with a reporting month. A correction or later submission creates a linked version, so prior submitted or verified snapshots remain traceable. The simplified ERD slide does not show this structure clearly; the full RDM does.

**11. How do you avoid counting Purok figures twice in the Barangay totals?**  
**Answer anchor:** Barangay totals should be derived from the eligible verified Purok profile/report versions selected for that reporting period, plus any separately identified Barangay-wide additions. The source relationship and reconciliation status need to identify exactly which records were included. The model must not add a parent total to its already-included child totals.

**12. How do you distinguish “zero affected” from “not reported” or “unknown”?**  
**Answer anchor:** The RDM defines separate value states such as unknown, reported zero, not applicable, provisional, for validation, verified, and disputed. A missing submission must not be rendered as zero impact. The interface and aggregation logic should preserve that distinction.

**13. What happens when a report is corrected after verification?**  
**Answer anchor:** The submitted version should remain traceable; a correction creates a new linked version with its source, author, time, and review decision. The reviewer evaluates the new version rather than silently editing the prior approved record. The audit record and version history serve different purposes: one records the action; the other preserves the report state.

**14. How will the SitRep be reproducible if reports change after it is generated?**  
**Answer anchor:** The relational design describes a source snapshot tied to a Situation Report version, identifying the Barangay report and hazard versions used at the selected cutoff. That lets a later reviewer see which source versions contributed. If source snapshots are not implemented, the system cannot honestly promise exact reproducibility yet.

**15. What if there are no verified Barangay reports at the selected cutoff?**  
**Answer anchor:** The output must not invent zero values. It should show that information is unavailable or that no eligible verified source was included; authorized personnel may add an explicitly sourced narrative or leave the section blank. The RDM’s value-state distinction supports this, but the implementation and test cases need to confirm it.

**16. How are duplicate or conflicting reports resolved?**  
**Answer anchor:** The system can flag potential duplicates or inconsistencies for a human reviewer. It should preserve the records and document the reconciliation decision; it should not automatically merge reports or select an authoritative source unless a documented rule says so.

### Security, privacy, reliability, and evaluation

**17. How do you prevent one Barangay from seeing another Barangay’s records?**  
**Answer anchor:** The design requires role- and jurisdiction-scoped access on every record operation, not merely hiding screens in the frontend. The manuscript proposes organization-aware access controls and security tests, but the defense should distinguish a proposed control from one already implemented and independently tested.

**18. Your profiles are aggregate totals. Why is the Data Privacy Act still relevant?**  
**Answer anchor:** Aggregate profiling reduces the need for resident-level data, but user accounts and some incident, casualty, or assistance records may still contain identifiable or sensitive information. The system therefore needs purpose limitation, data minimization, role-based access, appropriate security, and accountable handling under RA 10173. [RA 10173, Official Gazette](https://officialgazette.gov.ph/2012/08/15/republic-act-no-10173/).

**19. What does verification mean technically, and what does it not mean?**  
**Answer anchor:** Technical validation checks structure and consistency—for example, required fields, allowed ranges, incompatible totals, and possible duplicates. Verification is the authorized person’s evidence-based review and decision. The system can record the reviewer, version, status, reason, and timestamp; it cannot prove facts merely because fields pass validation.

**20. What if the internet or hosted database fails during a disaster?**  
**Answer anchor:** The prototype has no offline synchronization or SMS fallback, so users cannot rely on it during that outage. Existing radio, telephone, and other contingency channels remain necessary. Availability, backup, and recovery objectives should be specified and tested before operational deployment.

**21. What security tests will you perform, and what does the current slide prove?**  
**Answer anchor:** The paper proposes unit/component, API, integration, end-to-end, system, and security testing, with Jest, Supertest, and Cypress named for parts of the plan. The slide is a test plan, not evidence that the system passed. We must define threat cases such as unauthorized role access, cross-jurisdiction data leakage, injection, session handling, and audit integrity, then report actual results.

**22. Why is a SUS score of 68 your threshold, and how many users will test it?**  
**Answer anchor:** The paper proposes a 10-item SUS questionnaire and a target average of 68 or higher. The number and selection of beta participants are not clear in the reviewed methods text, so I need to provide the approved sample plan. A score is an evaluation result only after data are collected; the target itself is not proof of usability.

**23. Your objective says 100% of reports should be correctly verified. What is the ground truth?**  
**Answer anchor:** A verification-accuracy test needs a predefined set of cases with decisions established independently by qualified reviewers, plus a scoring rule and denominator. If the study has no such test set, we should not present 100% as a guaranteed outcome; we should define a feasible acceptance criterion before testing.

**24. How would you test performance during a high-volume disaster event?**  
**Answer anchor:** The paper’s current plan focuses on functional, integration, security, responsive, and usability testing; it does not establish a demonstrated high-load result. We would need a defined workload, concurrent users, response-time and error thresholds, and a load-test environment before making performance claims.

## Advanced round: experienced panelists

These questions combine multiple parts of the study. An experienced panelist may ask one broad question, then use your first answer to test whether the evidence, models, and implementation plan agree. The angle beneath each question tells you what they may be testing.

### Experienced Panelist 1 — Clarification through reasoning

**1. Choose one problem from your matrix and trace it from evidence to outcome: what did you observe, which requirement follows, which module implements it, and what result would show that the module helped?**  
*Angle:* Whether the problem-objective-method matrix forms a defensible chain, rather than matching labels only.  
**Answer anchor:** For communication delay, the study describes repeated calls and follow-up at reporting handoffs. The response is a role-based submission route with visible status and review feedback. The system can record submission and review times, but the current evaluation plan does not establish a before-and-after reduction in elapsed time. I can claim the design addresses the handoff; I cannot yet claim it proved faster reporting.

**2. The system accepts an early report before every fact is known. How do you make that useful without presenting uncertain data as confirmed impact?**  
*Angle:* Whether the design supports progressive reporting and communicates uncertainty.  
**Answer anchor:** Keep the initial Purok report small, preserve its source and time, and label its state. Barangay can request correction or add consolidated information later. Dashboards and SitRep outputs must distinguish provisional, for-validation, verified, disputed, unknown, and reported-zero values instead of flattening them into one number.

**3. Why maintain a monthly community profile separately from incident reports? How would a decision-maker use both without confusing baseline exposure with actual disaster impact?**  
*Angle:* Whether the data concepts support a meaningful comparison.  
**Answer anchor:** The profile is a periodic aggregate baseline for population, housing, vulnerability, and hazard exposure. An incident report records event-specific observations and effects. A SitRep can use the baseline as context, but should label it as a baseline and must not treat everyone exposed at baseline as actually affected by the incident.

**4. Describe how a single Purok observation becomes a Barangay report and then a SitRep. At each step, what changes and what must remain traceable?**  
*Angle:* Whether the hierarchical workflow changes detail without losing provenance.  
**Answer anchor:** Purok submits an initial record. Barangay reviews it, requests corrections when needed, and consolidates eligible Purok submissions with Barangay-level information. DRRM reviews the Barangay report and uses selected verified versions in a SitRep draft. Each stage should preserve the originating record, reporting period, version, reviewer decision, and any added or reconciled information.

**5. In your models, what is the difference between a CDRA hazard type, a recorded hazard event, and an incident report?**  
*Angle:* Whether reference classifications, event records, and impact reports are distinct concepts.  
**Answer anchor:** A hazard type is the organization’s configured classification drawn from its CDRA. A hazard record/event identifies a specific occurrence or hazard instance. An incident report records observations and effects associated with the event and jurisdiction. I would use the exact terms consistently in the ERD, RDM, DFD, and interface.

**6. The paper describes a configurable service but reserves authority for local government. How can a shared platform avoid making the service operator the decision-maker?**  
*Angle:* Governance, ownership, and separation between technical operation and statutory authority.  
**Answer anchor:** The participating DRRM organization controls its users, jurisdiction, verification and approval decisions, record disclosures, and official submissions. The technical operator maintains the service. Hosting a record does not give the operator authority to verify impact, approve a SitRep, or direct a response.

**7. Why use a responsive web application for Purok instead of a native app, and what trade-off does that create during an emergency?**  
*Angle:* Whether the interface choice reflects actual users and limitations.  
**Answer anchor:** A browser-based, responsive interface avoids separate installation and supports mobile use at reporting posts. The trade-off is dependence on connectivity and the hosted service. The current scope excludes offline synchronization and SMS fallback, so existing emergency communication channels remain necessary.

**8. What would you do next if the panel approved the study today, and what evidence would you need before calling the system operationally ready?**  
*Angle:* Whether the proponents distinguish a prototype from a deployable public-sector service.  
**Answer anchor:** First reconcile the paper and diagrams, finalize requirements and data governance, then implement and test the role workflows with intended users. Before operational use, the team would need documented functional, security, usability, backup/recovery, and performance results, plus the organization’s approval of its reporting and retention procedures. The current plan is not itself evidence of readiness.

### Experienced Panelist 2 — Paper checks and consistency pressure

**1. Your legal slide invokes RA 10121. Which exact provision requires your particular online system, and which provision merely establishes the institutional context?**  
*Angle:* Whether you are converting a public mandate into an unsupported software requirement.  
**Answer anchor:** No provision requires this specific application. RA 10121 establishes DRRM bodies and responsibilities, including local risk-information and coordination functions. The system is our proposed support mechanism. Operation L!STO and the NDRRMOC SOPG inform operational practice, but they are not interchangeable with the statute or with a software mandate. [RA 10121](https://elibrary.judiciary.gov.ph/thebookshelf/showdocs/2/21121); [Operation L!STO manual](https://lga.gov.ph/uploads/publication/attachments/1590478478.pdf); [NDRRMOC SOPG 2024](https://ndrrmc.gov.ph/attachments/article/4125/NDRRMOC_SOPG_2024_EDITION.pdf).

**2. Your problem statement relies on interview evidence. Did you measure current submission, verification, or consolidation times, or are you reporting participants’ accounts of delay?**  
*Angle:* Whether an observed perception is being presented as a measured baseline.  
**Answer anchor:** The paper presents interview accounts and a described workflow. Unless we have a separate time study in our records, we should not state an observed number of hours or a statistically measured delay. That evidence motivates the design; measuring change in elapsed time would require a defined baseline and follow-up procedure.

**3. If the workflow came from one study setting and a small set of interviews, why should the panel accept the problem as research-worthy rather than anecdotal?**  
*Angle:* Evidence quality, triangulation, and limits on generalization.  
**Answer anchor:** The study uses the local workflow as its bounded problem context and relates it to the mandates and reporting guidance discussed in the paper. That supports designing for this setting; it does not establish prevalence across all LGUs. I should state the sample and method accurately and limit the conclusion to the setting and sources actually examined.

**4. The paper calls the output an “official NDRRMC template” and also says human approval is required. Which exact template version and required fields did you implement, and which fields are your own design choices?**  
*Angle:* Whether “mandated” sections are being distinguished from a chosen form or prototype structure.  
**Answer anchor:** We should identify the exact template or guidance edition used in the paper and map each generated section to it. The law does not itself prescribe every field in our database. Any additional fields should be described as system design choices, not legal requirements. If the exact template version is not recorded, resolve that before presenting the output as compliant.

**5. The flowchart permits hazard creation at several levels, but the scope says hazard classification remains with DRRM. Who can submit a hazard record, who approves it, and who can change the organization’s CDRA hazard list?**  
*Angle:* Difference between reporting an occurrence, configuring reference data, and approving a classification.  
**Answer anchor:** These must be separate permissions. A user at an operational level may submit hazard information; the supervising level reviews it. The DRRM Administrator governs the approved classification/reference data under the organization’s CDRA. If the diagrams do not show those distinct actions and approval states, they need revision. Do not imply that a Purok user can silently alter the official hazard taxonomy.

**6. You say Purok and Barangay profiles are monthly, but the presentation ERD does not show the month or version structure. Where is that represented?**  
*Angle:* Whether the presentation model and implementation model tell the same data-lifecycle story.  
**Answer anchor:** The manuscript’s RDM describes a profile series associated with a reporting month and linked profile versions. The simplified ERD slide does not make that explicit. I should point to the RDM and explain the distinction, or revise the ERD if it is intended to stand alone.

**7. The architecture shows offline relay/local registries while the scope says online-only. Suppose your panel accepts the diagram as authoritative. What exact offline behavior could they reasonably infer?**  
*Angle:* Whether you recognize how an architectural symbol changes the stated product boundary.  
**Answer anchor:** They could infer local persistence and later synchronization, which the written scope excludes. The answer is not to explain it away: the figure and text conflict. The deck should be corrected so the architecture shows the centralized online design, unless offline behavior is added to the scope, model, and tests.

**8. Your system is called SitRepO in the related-systems section, but the title slide uses the full title. Is SitRepO an existing comparator or your own system?**  
*Angle:* Whether the comparison accidentally compares the proposal against itself as if it were an external product.  
**Answer anchor:** If SitRepO is the short name for our proposal, it belongs in the proposed-system column, not among existing systems. I should identify it once and keep the same label throughout the presentation.

**9. Several objectives use 100% as the success threshold. What is the denominator, what counts as correct, and who establishes the expected answer before testing?**  
*Angle:* Whether the targets are measurable and whether the test can independently judge correctness.  
**Answer anchor:** Each target needs a defined test dataset, expected result, denominator, and pass/fail rule. For a verification decision, qualified reviewers must establish the reference decision independently. Without that, 100% is an unsubstantiated aspiration, not a valid result or guarantee.

**10. The beta plan names SUS and zero unhandled crashes. Would passing those criteria prove that SitRep totals are accurate, legally compliant, or faster to prepare?**  
*Angle:* Whether evaluation measures align with the claims.  
**Answer anchor:** No. SUS measures perceived usability, and the crash/rendering criterion concerns stability in tested sessions. Data correctness, legal compliance, reporting time, security, and operational outcomes require separate criteria and evidence. We should not use one test result as a proxy for all quality claims.

**11. Your related-systems discussion says competitors do not support some functions. Did you test each system directly, or infer features from papers, product pages, and reports?**  
*Angle:* Whether negative claims about other systems exceed the evidence reviewed.  
**Answer anchor:** The comparison should be limited to the feature descriptions in the cited materials. Unless we performed direct and current testing, we should say a capability was not documented in the sources reviewed, not that the deployed system definitively lacks it.

**12. You say profiles do not store named households. Does that mean the whole system contains no personal or sensitive information?**  
*Angle:* Whether aggregate profile design is being used to dismiss privacy risk elsewhere.  
**Answer anchor:** No. Aggregate profiles avoid resident-level household registers, but accounts and some incident, casualty, or assistance records may still identify people or reveal sensitive circumstances. Privacy controls must be based on the data actually collected across all modules.

### Experienced Panelist 3 — Technical design and curveballs

**1. A Purok report arrives after the SitRep cutoff, then Barangay verifies it after the draft is approved. Should it alter the old SitRep, appear in the next version, or both? Explain the rule.**  
*Angle:* Cutoff semantics, late-arriving data, and reproducibility.  
**Answer anchor:** It should not silently change a released version. The source can be considered for a subsequent SitRep version or an explicitly approved correction, with the report cutoff and exact source versions recorded. The manuscript’s source-snapshot/version design supports this, but the business rule for late records must be stated and tested.

**2. Barangay submits 100 affected families from Purok A and 80 from Purok B, but one Purok report is still provisional and one has a correction request. What total may the DRRM dashboard and SitRep show?**  
*Angle:* Whether aggregation respects verification state and source coverage.  
**Answer anchor:** Do not present 180 as a verified total if one input remains provisional or under correction. Show the verified subtotal separately from provisional/pending information, disclose the included source coverage, and never translate missing or unverified data into zero.

**3. Two Purok users edit the same incident version at nearly the same time. How do you prevent one update from overwriting the other?**  
*Angle:* Concurrency control and preservation of submitted evidence.  
**Answer anchor:** The design should create linked versions and reject or reconcile a stale edit rather than silently overwrite newer data. The implementation needs a version check or equivalent concurrency rule, an audit entry, and a test in which both edits start from the same parent version. The manuscript describes versioning, but the precise concurrency mechanism should be documented.

**4. Suppose a Barangay profile total is lower than the sum of its verified Purok profiles. Is that an error, a valid reconciliation, or double counting? What information must the model preserve?**  
*Angle:* Aggregation logic, jurisdiction completeness, and reconciliation provenance.  
**Answer anchor:** The system should not force equality without understanding the cause. It should preserve which Purok versions were included, which were missing or excluded, any Barangay-wide adjustment, the reviewer’s reconciliation decision, and its reason. The visible total should disclose its coverage and status.

**5. A single incident involves flooding and a landslide in the same Barangay. Does your model allow one report to reference multiple hazard types without duplicating affected people?**  
*Angle:* Many-to-many modeling and aggregation across overlapping causes.  
**Answer anchor:** The relational design needs an explicit incident-to-hazard association and must distinguish the event from its impact records. Affected counts should be tied to a defined geography, time, and population category, not summed once per hazard if the same people appear in both. The RDM describes an incident-hazard association; the aggregation rule for overlapping populations must still be explicit.

**6. How do you distinguish the time an event occurred, the time a user observed it, the time it was submitted, and the reporting cutoff? Which one orders the history?**  
*Angle:* Temporal data quality and auditability.  
**Answer anchor:** These timestamps represent different events and should not be collapsed into one field. Preserve occurrence/observation time separately from system submission and review times, and store the SitRep’s operational period and cutoff. The report history should be ordered by version/submission metadata while retaining the event chronology for the narrative. If the time-zone convention is unspecified, define it before implementation.

**7. The ERD connects casualty and damage detail to a generic Incident Report, but your workflow says Purok submits only initial affected-population information. Is the schema allowing data earlier than the process permits?**  
*Angle:* Whether the data model enforces the role boundary described in the DFD.  
**Answer anchor:** The shared parent can identify a report series, but level-specific content and permissions must control where those details are entered. Casualty and damage fields should be collected at the Barangay consolidation stage or later, unless the paper explicitly authorizes an earlier field. The ERD and RDM should show that boundary clearly.

**8. A profile is submitted for a month, rejected, corrected twice, and then verified. Which version becomes the input to Barangay consolidation, and what happens to the rejected versions?**  
*Angle:* Whether status applies to a record series or a particular version.  
**Answer anchor:** The verified version for that reporting month becomes eligible; the rejected and superseded versions remain traceable but are not counted as current inputs. The Barangay source association should point to the exact Purok profile version used.

**9. A user changes role, moves to another Barangay, or is deactivated. What happens to records they created and decisions they made?**  
*Angle:* Identity lifecycle, jurisdiction changes, and historical accountability.  
**Answer anchor:** Deactivation or reassignment should change future access, not erase past authorship or review history. Prior decisions retain the account, role/jurisdiction at the time, timestamp, and action. If users can move jurisdictions, the system needs an effective-dated assignment or equivalent audit history.

**10. If the platform is multi-organization, what is the security boundary: role, Barangay, tenant, or all three? How would you test a cross-organization leak?**  
*Angle:* Whether the access model has a concrete enforcement and test strategy.  
**Answer anchor:** The proposed model needs organization/tenant isolation plus jurisdiction- and role-scoped permissions. Enforcement must apply to every query, export, dashboard, attachment, and API route, not just the visible interface. A negative test should attempt to read or modify another organization’s record using valid credentials from the wrong tenant. Do not claim this test has passed until results exist.

**11. Why is a normalized relational design preferable to storing the whole report as one JSON document, and what cost does your design introduce?**  
*Angle:* Whether the model choice follows requirements and acknowledges trade-offs.  
**Answer anchor:** Separate relations support structured validation, referential integrity, versioned sources, and queries across profiles, reports, reviews, and SitRep sections. The cost is more joins and a denser schema, which requires careful query design and comprehensible reporting views. We should not claim a specific normal form unless we have checked the schema against it.

**12. The diagram uses an Account supertype with three subtypes. What database constraint enforces “exactly one subtype,” and what happens if a user needs two roles?**  
*Angle:* Whether conceptual specialization can be implemented without contradictory rows.  
**Answer anchor:** The ERD communicates the intended specialization, but the SQL design must enforce it with a clear role-assignment strategy and constraints. If accounts may hold multiple permissions, those permissions should be modeled separately from the organizational account subtype. The team must decide whether operational account type is exclusive and make the ERD and schema agree.

**13. What is the difference between a primary key on the conceptual ERD and foreign keys in the RDM? Why did your adviser ask for underlined PKs only in the ERD?**  
*Angle:* Whether you understand abstraction levels and the requested academic notation.  
**Answer anchor:** The ERD communicates entities and conceptual relationships; underlining identifies each entity’s primary-key attribute in the adviser’s requested convention. The RDM translates entities into relations and makes implementation references explicit through foreign keys and constraints. The absence of FK attributes in the conceptual ERD does not mean the SQL schema has no foreign keys.

**14. Your central database is a single point of dependency during a disaster. What happens if the host is unreachable, and what recovery objective have you set?**  
*Angle:* Availability, business continuity, and untested operational risk.  
**Answer anchor:** The current scope acknowledges dependence on the hosted database and does not provide offline submission. Before deployment, the organization and operator would need backup frequency, recovery-point and recovery-time objectives, restore testing, monitoring, and a fallback procedure. The paper does not establish measured recovery targets, so I should not invent them.

**15. How would you prove that a SitRep export is both traceable and not falsely presented as approved?**  
*Angle:* Artifact integrity and the boundary between workflow approval and legal signature.  
**Answer anchor:** The export should identify the report version, operational period, included source versions, approval status, signatories, and generation time. Drafts should be visibly marked as drafts, while approved exports should reflect the recorded human decision. The paper explicitly does not claim that an application approval is a legally certified digital signature.

**16. Your paper says “real-time” in the architecture. What latency target defines real time, and where is it measured?**  
*Angle:* Whether a qualitative marketing term has an operational definition.  
**Answer anchor:** The paper does not currently define a measurable latency service level. I should describe the intended online update behavior without promising instantaneous delivery. A defensible real-time claim would require a defined end-to-end threshold, test conditions, and measured results.

**17. The system flags possible duplicates. What is the matching rule, and how do you avoid merging two genuinely separate incidents at the same location?**  
*Angle:* False positives, explainability, and preserving source records.  
**Answer anchor:** A duplicate flag should support reviewer triage, not automatically merge reports. A rule might compare event time, location, hazard, and source, but its thresholds and evidence need validation with realistic cases. Until defined and tested, describe the capability as a proposed review flag, not a proven detection algorithm.

**18. If an organization changes its CDRA hazard taxonomy, how do old reports retain their original meaning while new users select the updated list?**  
*Angle:* Reference-data versioning and historical interpretation.  
**Answer anchor:** Hazard classifications should be versioned or otherwise time-bounded. Historical reports should retain the classification used when submitted; new reports use the organization’s currently approved taxonomy. The RDM’s hazard versioning is intended to support that distinction, but the update and migration policy should be documented.

**19. What data would you collect to show that digitization improved the workflow rather than merely moved paperwork onto a screen?**  
*Angle:* Evaluation design and measurable operational outcomes.  
**Answer anchor:** In addition to usability and correctness tests, an effectiveness study could compare submission-to-acknowledgement time, correction cycles, verification turnaround, consolidation effort, and missing-field rates against a documented baseline. The current testing plan does not establish those comparative outcomes, so I would propose them as additional evaluation measures rather than claim them as results.

**20. If AI tools were used during requirements, coding, or writing, how did you verify outputs and protect research integrity?**  
*Angle:* Disclosure, authorship, and the difference between project tooling and system behavior.  
**Answer anchor:** I should disclose only the tools and uses that actually occurred, including the tasks for which they assisted. I remain responsible for checking requirements against interviews and mandates, testing generated code, and verifying citations. The system itself does not use AI to verify incidents or generate facts unless that capability is explicitly implemented and documented.

### Three cross-examination chains to rehearse aloud

These are realistic sequences in which each answer invites the next question.

**Chain A: From a problem claim to evidence of impact**

1. “You say reporting is delayed. What evidence supports that?”
2. “Did you measure elapsed time, or did participants describe delay?”
3. “Which module changes the observed process?”
4. “Which metric will show improvement, and what baseline will you compare against?”
5. “If you did not measure before-and-after performance, what can you conclude today?”

**Safe endpoint:** The study identified a local workflow problem and designed a response. It has not yet demonstrated a quantified reduction in reporting time.

**Chain B: From mandate to system authority**

1. “Which law requires this system?”
2. “What does RA 10121 actually require of local DRRM institutions?”
3. “Does a law or manual mandate your exact database fields and screen flow?”
4. “Who has authority to verify and issue the report?”
5. “Can the platform itself declare a calamity, dispatch responders, or make an official submission?”

**Safe endpoint:** The law establishes institutional responsibilities. The proposed system supports selected information workflows; government personnel retain verification, approval, and operational authority.

**Chain C: From report aggregation to an auditable export**

1. “Which Purok and Barangay records enter this SitRep?”
2. “How do you handle a provisional report, a late correction, or a missing Barangay?”
3. “Can you distinguish unknown from zero?”
4. “If source records change later, can you reproduce the old SitRep?”
5. “How does the exported document show whether it is draft or approved?”

**Safe endpoint:** The report version should retain its cutoff, source snapshot, value states, and recorded human decision. If the implementation has not yet enforced those rules, describe them as design requirements and do not claim that the export is already reproducible.

## Mandate and standards references to keep at hand

Use these to support context, not to overclaim that a law mandates the proposed software or every field in its forms.

- Republic Act No. 10121, particularly its institutional provisions and local DRRM responsibilities: [Supreme Court E-Library](https://elibrary.judiciary.gov.ph/thebookshelf/showdocs/2/21121).
- National Disaster Risk Reduction and Management Operations Center Standard Operating Procedures and Guidelines, 2024 Edition: [NDRRMC PDF](https://ndrrmc.gov.ph/attachments/article/4125/NDRRMOC_SOPG_2024_EDITION.pdf).
- Operation L!STO disaster preparedness manual: [Local Government Academy PDF](https://lga.gov.ph/uploads/publication/attachments/1590478478.pdf).
- Republic Act No. 10173, Data Privacy Act of 2012: [Official Gazette](https://officialgazette.gov.ph/2012/08/15/republic-act-no-10173/).
- Sendai Framework for Disaster Risk Reduction 2015–2030: [UNDRR](https://www.undrr.org/publication/sendai-framework-disaster-risk-reduction-2015-2030).

## Final rehearsal reminder

The strongest defense is precise about what is **mandated**, what is **proposed**, what is **implemented**, and what is **evaluated**. When the evidence is not yet available, acknowledge the limit and explain what would be needed to establish it.
