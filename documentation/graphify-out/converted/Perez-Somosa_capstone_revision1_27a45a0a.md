<!-- converted from Perez-Somosa_capstone_revision1.docx -->




DISASTER SITUATION RECORD MANAGEMENT AND SITUATION REPORT GENERATION SYSTEM




A Capstone Project Proposal
submitted to the Computer Science Department
as partial fulfillment of the requirements for the degree of
Bachelor of Science in Information Technology






by
Perez, Katrina Mae D.G.
Somosa, RJ P.



Precious T. Opinion
Adviser


August 19, 2026
# TABLE OF CONTENTS

## List of Tables
Figure 1.1.1 ZCDRRMO Departments Profile
Table 2.7 Comparison Table of the Related Systems and SitRepO Barangay Disaster Situation Record Management and Situation Report Generation System
## List of Figures
Figure 1.1.2 Current Process of Barangay Reporting and ZCDRRMO Situation Report Generation
Figure 1.2.1 Proposed Online Disaster Situation Reports Generation and Record Management Flowchart
Figure 1.2.2 Proposed User Management Module Flowchart
Figure 1.2.3.A Purok Level Level Disaster Reporting Module Flowchart
Figure 1.2.3.B Proposed Barangay Level Disaster Reporting Module Flowchart
Figure 1.2.4 Proposed Disaster Report Verification Module Flowchart
Figure 1.2.5 Proposed SitRep Generation Module Flowchart
Figure 1.2.6 Proposed SitRep Catalog Module Flowchart
Figure 1.2.7 Proposed Dashboard Module Flowchart
Figure 2.6.2.1 Advanced Gathering for Assistance Preparedness for Protection (AGAPP) Landing Page
Figure 2.6.2.2 Advanced Gathering for Assistance Preparedness for Protection (AGAPP) Report Page
Figure 2.6.2.3 Advanced Gathering for Assistance Preparedness for Protection (AGAPP) Map Page
Figure 2.6.2.4 Advanced Gathering for Assistance Preparedness for Protection (AGAPP) FAQ Page
Figure 2.6.3.1 Mamamayan Web App Pages
Figure 3.1 Barangay Disaster Situation Record Management and Situation Report Generation System N-tier Architecture Diagram
Figure 3.2.1 Functional Requirement
Figure 3.2.2 Users and Characteristics
Figure 3.3.1.A Barangay Disaster Situation Record Management and Situation Report Generation System Context Data Flow Diagram
Figure 3.3.1.B.1 Barangay Disaster Situation Record Management and Situation Report Generation System Level 1.1 DFD
Figure 3.3.1.B.2 Barangay Disaster Situation Record Management and Situation Report Generation System Level 1.2 DFD
Figure 3.3.1.B.3 Barangay Disaster Situation Record Management and Situation Report Generation System Level 1.3 DFD
Figure 3.3.1.B.4 Barangay Disaster Situation Record Management and Situation Report Generation System Level 1.4 DFD
Figure 3.3.1.B.5 Barangay Disaster Situation Record Management and Situation Report Generation System Level 1.5 DFD
Figure 3.3.2 Barangay Disaster Situation Record Management and Situation Report Generation System Entity Relationship Diagram
Figure 3.4.1 Barangay Disaster Situation Record Management and Situation Report Generation System Relational Data Model
Figure 3.4.2.1 Mobile Application Log In Page
Figure 3.4.2.2 Mobile Application Dashboard Page
Figure 3.4.2.3 Mobile Application Initial Report Page
Figure 3.4.2.4 Mobile Application Situation Report Page
Figure 3.4.2.5 Mobile Application Situation Report Catalog Page
Figure 3.4.2.6 Mobile Application Situation Analytics Dashboard Page
Figure 3.4.2.7 Web Application Admin Dashboard Page
Figure 3.4.2.8 Web Application Admin User Management Page
Figure 3.4.2.9 Web Application Admin Report Verification Page
Figure 3.4.2.10 Web Application Admin Situation Report History Page
Figure 3.4.2.11 Web Application Admin Situation Report Generation Page
Figure 3.4.2.12 Web Application Admin Incident Report Page
Figure 3.4.2.13 Web Application Admin System Report Page



























CHAPTER 1
# INTRODUCTION
## Project Context
The efficacy of disaster response in the Philippines is fundamentally anchored on the velocity, integrity, precision, and accuracy of disaster incident data. The Philippine disaster management framework operates under the primary legislative mandate of Republic Act No. 10121, otherwise known as “The Philippine Disaster Risk Reduction and Management Act of 2010.” This landmark legislation precipitated a paradigm shift from a purely reactive emergency response model to a proactive, risk-reduction, and resilience-building approach. At the local governance level, this mandate is explicitly operationalized through the Department of the Interior and Local Government’s (DILG) Operation L!STO (Operation LISTO) manual.
The information-management responsibilities of local DRRM institutions are further established in Section 12 of RA 10121. The law requires an LDDRM Office in every province, city, and municipality and a Barangay Disaster Risk Reduction Management Committee in every barangay. Within their respective jurisdiction, these bodies are tasked to consolidate local disaster-risk information, maintain risk maps and databases of resources and critical infrastructure, conduct continuous monitoring, disseminate information, coordinate local DRRM activities, establish linkages with other LGUs, and operate local DRRM operations centers. These provisions establish the institutional need for consistent information collection and coordination, although they do not prescribe a particular web platform or transfer public decision-making authority to a private system provider (Republic Act No. 10121, 2010). Operation L!STO complements this statutory framework by providing minimum preparedness protocols, manuals, and capacity-development activities for LGUs (DILG Region IX, 2023)
Under RA 10121 and the National Disaster Risk Reduction and Management Council (NDRRMC) standard operating procedures, the SitRep is the authoritative, single-source-of-truth document for disaster impact assessment in the Philippines. It is not merely an informational update; it is an official operational trigger. The SitRep aggregates empirical data on hazard impacts, casualties, displaced populations, and damaged public infrastructure from the barangay level up to the national NDRRMC Operations Center.
The timely escalation of standardized SitRep data from LGUs holds immense national and legal significance. Firstly, it forms the empirical basis for the President or the local Sanggunian to legally declare a "State of Calamity," which subsequently enforces price freezes on basic commodities and authorizes emergency spending. Secondly, the quantitative metrics within the SitRep dictate the deployment of national Quick Response Funds (QRF) and trigger resource augmentation from national agencies (such as the DSWD and AFP) when local capacities are overwhelmed. The DILG strictly monitors SitRep compliance; LGUs are even mandated to submit "Nil Reports" (zero damage) to prevent information vacuums. Failure to submit SitReps promptly subjects local officials to administrative sanctions and paralyzes post-disaster rehabilitation planning.
The 2024 NDRRM Operations Center Standard Operating Procedures and Guidelines clarify that disaster reporting is a progressive information lifecycle rather than a single act of documentation. An Initial Report communicates early observations, circumstances, and impacts and may be issued before complete supporting information becomes available. Progress Reports document changes in incident status and response actions, while Terminal and Final Reports close the response phase and preserve final impact figures, outcomes, shortcomings, and recommendations. A SitRep is a cumulative and contains the prevailing situation, preparedness measures, response actions, consolidated effects, issues, and concerns, and recommendations where application (NDRRMC, 2024). This progression is important to the proposed system because an early report may be incomplete but still operationally useful when its source, time, validation status, subsequent corrections, and relationship to later versions remain visible. The platform therefore supports local SitRep preparation and consolidation; it does not independently confer official NDRRMC status on every report generated by a participating DRRM organization.
The same guidelines show that disaster impacts must be geographically disaggregated and attributable to recognized sources. For example, affected families and displaced populations are organized by barangay, city or municipality, and province, with consolidated LDRRMC reports among the identified official sources (NDRRMC, 2024). This requirement supports the use of stable organization and jurisdiction identifiers, structured affected-population fields, source attribution, and version histories. These controls allow a consolidated value to be traced back to the local record from which it originated, especially when reports are updated as field conditions change.
However, despite these clear, standardized national mandates, a significant operational gap exists at the grassroots level. Extensive institutional evaluations and academic research demonstrate that disaster response communication remains highly fragmented between the grassroots tier (puroks/sitios and barangays) and municipal or city command centers. While LGUs formally adopt the Operation LISTO manuals, compliance with exact monitoring timelines and real-time SitRep generation is severely hindered by disorganized, legacy infrastructure. Recent studies indicate that barangay officials frequently lack standardized digital reporting protocols and instead rely heavily on unstructured, informal communication channels such as SMS, two-way radios, and personal social media applications like Facebook Messenger (De Gracia, 2025; Benigno et al., 2026). This reliance creates single points of failure when telecommunication networks drop, resulting in fragmented data reporting and critical data loss.
Furthermore, performance audits by the Commission on Audit (COA) reveal that many LGUs struggle to fully execute their mandated CPAs due to an over-reliance on manual, paper-based workflows (such as physical "Listo si Kap" checklists) and incomplete local records. Managing DRRM compliance across over 42,000 barangays using physical documentation creates an immense administrative burden (Domingo & Manejar, 2021). The lack of a centralized data structure forces municipal Operations Departments to engage in continuous back-and-forth communication to extract, translate, and verify specific demographic and damage data points from fragmented text messages. This manual consolidation causes critical delays in generating the formal NDRRMC-compliant SitReps during the crucial hours of a disaster, stalling the release of life-saving national funds.
The operational difficulties identified in the local workflow are consistent with broader Philippine institutional evidence, although they should not be assumed to occur uniformly in every DRRM office. Domingo and Manejar (2023) found that Philippine loss-and-damage accounting remains narrow and inconsistent, with weaknesses in institutional capacity, methodological application, process efficiency, monitoring, and knowledge management. Their assessment also notes that localized, small-scale, and slow-onset impacts may remain undocumented when recording systems emphasize only major, direct, or immediately visible losses. Earlier PIDS reviews likewise identified continuing gaps in the institutional translation of DRRM policy and in structured monitoring across national and subnational levels (Domingo, 2016; Domingo and Manejar, 2021). These findings strengthen the case for a system that preserves local observations, verification decisions, and historical records, but they do not establish that technology alone can resolve staffing, coordination, or resource limitations.
Disaster information quality is also contextual. A report can be complete in form while remaining unreliable, outdated, difficult to to interpret, or unsupported by a traceable source. Jayawardene et al. (2021) identify completeness, validity, reliability or credibility, accuracy, currency, accessibility, interpretability, and consistency as relevant dimensions of disaster information quality. Seppannen and Virrantaus (2015) similarly explain that shared situational awareness depends on whether information quality matches the needs of users and their operational context. For the proposed system, this means that standard fields should be accompanied by timestamps, source attribution, preliminary and verified states, corrections histories, explicit unknown values, and role-based access.
The value of structured records also extends beyond the immediate emergency. UNDRR emphasizes that accurate, comparable, disaggregated, and systematically documented disaster-loss data supports risk analysis, planning, and Sendai framework monitoring.  Its DesInventar methodology emerged partly from the problem of incompatible records and the tendency to overlook small and medium disasters when documentation focuses only on major events (UNDRR, n.d.). A chronological catalog of localized incident records and SitRep versions can therefore support later assessment and institutional learning, provided that the organization maintains clear provenance, consistent categories, and lawful records governance.
To address these systemic vulnerabilities, the development of a centralized, role-based Online Disaster Situation Reports Generation and Record Management System is proposed as a highly scalable technological intervention. Empirical research confirms that replacing fragmented, informal communication with centralized web and mobile platforms equipped with Role-Based Access Control (RBAC) significantly mitigates information latency, prevents unauthorized data tampering, and reduces reporting errors by up to 32% (Mustafa et al., 2025; Goh et al., 2023).
By establishing a structured, digital pipeline from the purok leader up to the LGU's command center, the proposed solution acts as the critical bridge between national policy and local execution. It aims to eliminate data silos, automate the validation of incident reports, and seamlessly translate raw grassroots data into the official SitRep format required by the NDRRMC. This ensures that localized threats are elevated to city and national awareness in real-time, ultimately professionalizing the flow of disaster data, minimizing information latency, and empowering LGUs to fully comply with the stringent preparedness and reporting mandates set forth by RA 10121 and the DILG.
The system is intended to operate beyond a single local government client. Under the current product direction, it is conceived as a startup-operated, responsive web platform that barangay, or other authorized DRRM organizations. Each organization retains authority over its jurisdiction, users, validation workflow, approved reports, and official submissions, while the service provider manages hosting, maintenance, security updates, and technical support. This separation reflects RA 10121, which assigns DRRM functions within territorial jurisdiction, and avoids treating ZCDRRMO as the platform’s only possible administrator or owner.
This multi-organization direction is consistent with the policy environment introduced by the E-Governance Act. Republic Act 12254 covers LGUs and their internal and government-to-government operations, promotes interoperable processes, secure information assets, continuity planning, accessible and mobile-friendly services, and the use of electronic transactions during disruptions. It also recognizes collaboration with startups and other private entities, subject to public accountability, transparency, procurement, and good-governance requirements. Its record and knowledge-management provisions cover the creation, processing, tracking, verification, storage, archiving, and disposal of government records (Republic Act No. 12254, 2025). These provisions support a reusable platform model, but they do not establish that the prototype is already integrated with national systems or compliant merely by being web-based.
A shared service also introduces governance and security requirements that were less visible in the earlier single-office framing. Under an outsourcing arrangement in which a participating DRRM organization determines the purpose and scope of personal-data processing, the organization ordinarily retains controller responsibilities while the startup processes information under documented instructions. The Data Privacy Act and its Implementing Rules and Regulations require purpose limitation, proportionality, safeguards, accountability for outsourced processing, and contractual provisions concerning processing scope, security, audit assistance, subprocessors, and the return or lawful retention of data when the service ends (Republic Act No. 10173, 2012; National Privacy Commission, 2016). At the application level, the authenticated user’s organization and jurisdiction must constrain every record query, approval, dashboard calculation, file operation, and export. OWASP guidance recommends deriving tenant context from authenticated identity, validating ownership at the data-access layer, and testing specifically for cross-organization leakage (OWASP foundation, n.d.).
Government records under the custody and records remain under the custody and records-management authority of the responsible public office even when a private provider hosts the system. Republic Act No. 9470 requires government offices to inventory public records, maintain approved records-disposition schedules, preserve restricted records appropriately, and obtain National Archives authorization before disposal. The platform must therefore support organization-controlled export, retention classification, version preservation, and authorized disposition rather than treating offboarding as automatic deletion of all customer records (Republic Act No. 9470, 2007).
Finally, responsive browser access improves the reach of the platform without creating a native mobile application. The current implementation does not include offline synchronization or SMS fallback and cannot guarantee submission during internet, power, or telecommunications failures. RA 12254 itself requires consideration of alternate delivery modes for users without internet access. Existing radio, telephone, paper, and other contingency procedures must therefore remain available during outages. The proposed platform should be understood as the structured system of record for connected operations, not as a replacement for every emergency communication channel for the trained personnel and institutional arrangements on which disaster response depends.






















Figure 1.1.2 Current Process of Barangay Reporting and ZCDRRMO Situation Report Generation
Figure 1.1.2 shows the current process for reporting of disaster incident data and
the generation of situation reports. The process begins when the purok leaders of the barangay notify the barangay focal person for disaster, this is dependent on each barangay whether it is their Barangay Disaster Risk Reduction Management Chairman (BDRRMC) or the Barangay Captain. There are several possible bases on such a report such as floodings in flood prone areas, damage in infrastructures, and a need for evacuation and rescue. When the Barangay’s focal person is notified, mobilization of rescue and on-site respondents occurs on the barangay level. The total mobilization of the personnels from the Operations Department of the ZCDRRMO should happen when multiple barangays are involved, however that is not the case today as they are also helping regardless of the number of barangays affected. Also during this time of response, drafting the initial report to be sent to the Operations Department of the ZCDRRMO is done by the personnels in each respective barangays. This report contains initial information such as affected areas, the initial damage assessment, and the time of report. The data gathering for this report is done on the evacuation centers for each respective barangays. It was also mentioned that the barangays have This report is what is sent to the ZCDRRMO via text message, online messages through messenger, or a case-to-case basis data sheet dependent on the Barangay.The consolidation of  the reports from different barangays, time, and events all happen in the Operations Department of the ZCDRRMO. They are utilizing excel spreadsheets and Google Drive as their main storage for Situation Report Generation and Data Storage. After consolidating the data, the next step for the department is the generation of the Situation Report. The completed report will then be forwarded to the Office of the City Mayor and the Office of The Civil Defense.

## Statement of the Problem and Purpose
The efficacy of the office’s disaster response is fundamentally tied on the velocity,
integrity,  precision and accuracy of disaster incident data. Currently, the office operates with a fragmented reporting system that suffers from several vulnerabilities. The core challenge in the current infrastructure is the lack of standardization in the linear progression from incident notification to formal documentation. While the initial reporting from the Purok Leaders to the Focal Person of the Barangay is functional as well as notifying the ZCDRRMO, the subsequent drafting, consolidation, and generation of the mandated Situation Report remains fragmented.
Currently, the process begins with an informal notification from the Barangays
sent via SMS or online message to signal that help is needed in the barangay. This process is no doubt effective for immediate awareness, this initial report phase lacks standardization and data structure. Essential details in the initial reports are often transmitted in fragmented messages. This process forces the ZCDRRMO Operations Department to engage in back-and-forth communication to extract the specific data points required for a formal Situation Report. This delay in information consolidation is crucial during the hours of disaster.



Figure 1.2.1 Proposed Online Disaster Situation Reports Generation and Record Management Flowchart
Figure 1.2.1 presents the proposed Barangay Disaster Situation Record
Management and Situation Report Generation System Application Cross-Functional Flowchart, which delineates the systematic interactions between the Purok Leader, Barangay Focal Person, and the ZCDRRMO Operations Department. The flowchart illustrates the sequential logic of the system access, role-based authentication, and the functional boundaries of the application’s core modules.
The entire process begins when a System User initializes the application. Upon
entry, the user is directed to the Application Log In Page. When the user continues to log in, the system verifies if the user already has an account. Users without an account are directed to the Account Registration Process. Here, the user can register as a Purok Leader, Barangay Focal Person, or as a personnel of ZCDRRMO. After registration, an account verification will be initiated by the ZCDRRMO Personnels in the system. Without verification, proceeding to log in is prohibited. Verification will be placed in the system as well as the user’s entered email address. Upon confirmation, the user returns to the log in page to enter their credentials. The system validates the credentials. If the credentials are incorrect, the user may retry or exit the application.
Upon the validation of user credentials, the system identifies which side of the
system the user will be redirected to. If the account is for Purok Leaders and for Barangays, the user will be redirected to their respective interfaces via connector A and B. For the Purok Leaders interface, they can only access their respective reporting interface. Their reports will be forwarded to their respective Barangay Focal Person. This is marked as the initial reporting. For the Barangay Focal Person side, they can access the initial reports and notifications from the Purok Leaders. They can forward these reports to the ZCDRRMO to ask for emergency response as well as for the data gathering.
If the account is identified as a ZCDRRMO Personnel, the user is redirected to
the ZCDRRMO-side through the connector C. The user will first be presented with the system dashboard that has the overview of the system details. Account Management is also handled in this side of the system which manages the user accounts. The ZCDRRMO side also has the capability to view initial reports from the barangays and incident reports from the Barangays. These modules allow them to respond to disaster situations and to generate reports for each disaster situation. The internal connectors demonstrate a linear data progression from the Purok Leader to the City Office. This ensures that disaster records are consistent and verifiable across all levels. Upon operations are complete, the session is then ended.


















Figure 1.2.2 Proposed User Management Module Flowchart
Figure 1.2.2 shows the user management module for the proposed system. The process starts with viewing of the list of existing accounts, followed by the process of creating a ZCDRRMO account if need be, updating account details, or viewing of barangay focal person accounts. The creation of a new account will require the account details including credentials such as name and designation/position.The same goes for updating account details, it will require updated account details.
For the process of viewing a barangay focal person account, it will include the verification and confirmation from a ZCDRRMO personnel if the account and its details are proven to be legitimate, wherein if it was, the ZCDRRMO personnel will confirm the account registration and an automated account confirmation email will be sent to that user. Otherwise, the ZCDRRMO personnel would have to reject the account registration and again automatically send an account rejection (confirmation) email. Rejected account registration can also be viewed by the ZCDRMMO personnel.































Figure 1.2.3.A Purok Level Level Disaster Reporting Module Flowchart


Figure 1.2.3.A shows how the reporting module is facilitated for the Purok Leaders. This is the initial data gateway for the entire process. The reporting module first lets the user show the reports made by the user and their status.  If the user chooses to create a new initial report, the user is then prompted to enter disaster types such as floods, fire, earthquake, etc. Inclusion of affected areas, purok name, initial damage assessment, the time and date of reporting is also mandatory. After providing information for the mentioned fields and confirmation of initial report information, the initial report will then be forwarded to the Barangay Focal Person. If the user chooses to edit a report, the user will be prompted to enter change to the reports and this will be forwarded to the Barangay Focal Person.

































Figure 1.2.3.B Proposed Barangay Level Disaster Reporting Module Flowchart
Figure 1.2.3.B illustrates the logic of the Disaster Reporting module for the Barangay Level. This module is to ensure that the initial data from the Puroks are systematically sorted, validated, consolidated and brought up to the ZCDRRMO appropriately
The entire process begins at the initialization of the interface which starts with viewing the reports history made by the Barangay focal person. Upon entry, the system retrieves and displays existing records for the Incident Reports and Initial Reports. This also allows authorized personnel to view or modify Barangay Reports if need be, ensuring that centralized database reflect the most current occurrences. Any modifications made. Modifications are processed into the database with marks that it has been modified to maintain an accurate audit trail of the disaster’s progression.
The module’s logic is a series of conditional checkpoints designed to categorize the scale of the disaster incident. The system checks whether there are any Purok-level notifications. If such notifications exist, the system then assesses the scope by determining if multiple Puroks are involved. If multiple Puroks are involved, the system consolidates the report details to provide a unified situational overview. On the other hand, if the incident is isolated, the Report Details are processed individually. In both scenarios given, the system automates the forwarding of Initial Report Details to the City Office, reducing the latency between local Barangay-level detection and city-wide emergency response.
The module also facilitates another reporting function done during disaster recovery. When evacuation is ongoing, the workflow then transitions to a Data Gathering phase. Field workers input affected population details, which are then synthesized into the Barangay Incident Report. This document undergoes a final validation before the submission of it is done. This report is also committed to the incident report database for long-term  monitoring and disaster analysis. The process cycle concludes by returning to the M.1 connector which accounts for continuous updates as the disaster landscape shifts.

Figure 1.2.4 Proposed Disaster Report Verification Module Flowchart
Figure 1.2.4 presents the disaster report verification module. The process starts with the viewing of the incident reports list where the ZCDRRMO ground personnel-assigned and other authorized ZCDRRMO personnels to verify the reports can view the list of Barangay Incident Reports and update the incident report details if necessary. When the list is viewed, a check will be done whether a specific report has been verified by a ZCDRRMO personnel. If a report has been verified, the verified report details will be stored in the Incident Reports database, and at the same time, do an automated system notification regarding the system action. Otherwise, the report details may be rejected and again, an automated system notification will notify the rejection. Also, the existing incident reports will also be displayed during the viewing of the incident reports list.
On the other hand, the process of updating the incident report details allows the authorized ZCDRRMO personnels to edit and update the incident reports. The updated version will then be stored in the Incident Reports database. The existing incident reports will then reflect upon viewing it.












Figure 1.2.5 Proposed SitRep Generation Module Flowchart
Figure 1.2.5 shows the SitRep Generation module. The process goes by first checking whether the account has permission to generate a SitRep. If the account is not allowed to generate SitReps, then the user will not be able to access the generation of SitReps. Otherwise, the process starts with retrieving barangay incident reports. If there are multiple barangays affected by the disaster, the information from the incident reports will be consolidated then the current situation report will be created based from the consolidated barangays incident information, including affected population. Otherwise, if only one barangay is affected by a disaster, the process moves with the creation of the current situation report for that barangay based on the barangay’s incident information and affected population data. After consolidations and creation of the situation report, if modifications have to be made, the system will allow the authorized ZCDRRMO personnels to modify the current SitRep. Otherwise, the SitRep will be submitted to the
City Mayor’s Office for immediate public awareness and the Office of the Civil Defense for the publication of the SitRep for the general public later on.

Figure 1.2.6 Proposed SitRep Catalog Module Flowchart
Figure 1.2.6 shows the SitRep Catalog Module Flowchart of the proposed system. This flowchart describes how authorized ZCDRMMO personnels can view and edit the generated Situation Reports within the system. Specifically, the situation reports history can be viewed and from that, a specific situation report can be viewed by the users authorized to access the situation reports. If the account can modify or edit the situation report, they can proceed to modify the necessary details that need modification (e.g., corrections), otherwise, they are only allowed to view the SitReps. For each modification, the system will notify the user that the report has been modified and that the edited version will be saved in the Situation Report database.

Figure 1.2.7 Proposed Dashboard Module Flowchart
Figure 1.2.7 shows the processes in the Dashboard Module of the system. This process will allow the authorized users, especially the ZCDRRMO personnels, to view relevant and up-to-date analytics regarding the number of disaster incidents, barangays affected by the disaster, population affected, and the damage assessment. It serves as the primary analytical command center for authorized personnel.
The process initiates via the M.1 connector, which transitions the user to viewing the dashboard analytics interface. Upon initialization, the system interfaces with the Situation Report DB to fetch current Situation Report Details. These data are processed to generate real-time metrics, including the total number of disaster incidents, the specific barangays impacted ed, cumulative and dissected affected populations, and comprehensive damage assessments. This centralized view ensures that decision making can be done with an immediate access to critical information regarding the city’s current landscape in a disaster situation.
In addition to real-time analytics, the module supports the Generation of Situation Reports. By aggregating the aforementioned metrics, the system compiles formal documentation that encapsulates the scope of the disaster, providing a structured output for administrative view. Furthermore, the dashboard also has the capability to view monthly situation reports received and submitted. By retrieving existing situation reports from the database, personnel can perform comparisons and response efficiency over a selected period of time. After the aforementioned functions, the process returns to the M.1  connector which allows for the continuous monitoring of incoming data streams.

## Objectives
### General Objective
The general objective of this research is to design, develop, and evaluate a centralized, role-based Online Disaster Situation Reports Generation and Record Management System that streamlines grassroots disaster reporting and automates National Disaster Risk Reduction and Management Council (NDRRMC) SitRep consolidation for Local Government Units (LGUs)
### Specific Objectives
To develop a secure User and Organization Management Module that allows the startup to onboard, configure, activate, suspend, and offboard participating DRRM organizations and enables each organization to manage its jurisdiction hierarchy, authorized users, and role assignments. The module will support distinct organization administrators, reporters, reviewers, approvers, and viewers; apply least-privilege and organization-scoped access; preserve the authorship of records when an account is disabled; and record security relevant changes. The system will implement strict Role-Based Access Control (RBAC) that restricts confidential demographic and casualty data exclusively to authorized personnel (Purok Leaders, Barangay Officials, and City DRRMOs), achieving zero unauthorized access breaches and 100% RBAC compliance during pre-deployment security testing.
To develop a Disaster Reporting Module that enables authorized reporters to create, save, submit, and update structured initial and detailed disaster reports. The module will capture a stable incident and submission identifier, apply required-fields, and check format and consistency. It will display whether a report is in draft, being submitted, acknowledged, failed, or requires further reconciliation after interruption.
To develop a Disaster Report Verification Module equipped that enables authorized personnel to triage and examine submitted reports, compare sources and versions, request clarification or correction, flag duplicates and conflicting values, and validate, partially validate, return or reject a report with a recorded reason. The module will preserve the original submitted version, source organization, jurisdiction, responsible actor, timestamps, evidence references, decision, reason, and subsequent corrections in an append-only material history. Automated rules may identify inconsistencies or suggest possible duplicates but the system will not determine which field account is true or confer verification authority on the. Concurrent or late corrections will require an explicit reconciliation decision instead of silently overwriting a reviewed record.
To develop a SitRep Generation Module that retrieves only eligible report versions within the authenticated organization’s authorized jurisdiction and assembles a reviewable local SitRep using the applicable categories of the 2024 NDRRM Operations Center Standard Operating Procedures and Guidelines. Depending on the organization’s configured workflow, the output will identify its report type, report number, operation or reporting period, response actions, unresolved discrepancies, template version, generated version, and approval status. It will mathematically aggregate verified barangay demographic and infrastructure damage data and automatically populates the exact, official NDRRMC Situation Report template, ensuring structural compliance with national DILG Operation LISTO reporting mandates. The SitRep will then be having an authorized human review and approval process and will not by itself create an official national NDRRMC issuance or transmit a report to an external agency.
To develop a SitRep Catalog Module that maintains the controlled reference data and historical records needed to interpret reports inconsistently. It will support authorized users to view, search, filter, compare, export, correct, and supersede SitRep whale preserving prior approved versions, source relationship, classification, retention information, legal or archival holds, and audit history.
To develop a Dashboard Module present organization- and role-scoped summaries of disaster incidents, affected populations, report status, verification activity, SitRep coverage, and processing time using records available to the authenticated user. The dashboard will distinguish provisional from verified values, disclose the applicable filters, reporting period, last update, and missing data. Charts will include textual or tabular equivalents and will not rely on mere color visualizations. The dashboard will support monitoring of recorded information; it will not be presented as a forecasting, dispatch, resource-allocation, or automatic decision making system, and absence of a digital report will not be interpreted as absence of disaster impact.
## Scope and Limitations
This study covers the design, development, and prototype evaluation of centralized, role-based, responsive Online Disaster Situation Report Generation and Record Management System. The platform is conceived as a configurable service rather than a system permanently owned and administered by only a single DRRMO. Retention of authority over its jurisdiction, users, reporting route, verification and approval decisions, records, disclosure, and official submission is upheld highly.
The system includes the User and Organization Management Module, Disaster Reporting Module, Disaster Report Verification Module, SitRep Generation Module, SitRep Catalog Module, and Dashboard Module. The prototype covers local reporting for floods, typhoons, earthquakes, and fires. It will not cover any non-disastrous events. Its controlled terms and fields may be configured for participating organizations, but support for other hazards requires separate requirements analysis, domain validation, test data, and approval before it can be claimed. The service supports customer administrators, reporters, reviewers, or verifiers, approvers, authorized reviewers, records and privacy personnel, and limited startup support personnel. The system will follow the mandated role titles and escalation routes but could be configured and mapped out.
The User and Organization Management covers organization onboarding and basic configuration, account registration, activation and deactivation, jurisdictional membership, role assignment, administrator handover, and access event recording. Organization identity and jurisdiction must constrain server-side access to records, searchers, attachments, dashboard, background actions, exports, and audit entries. Account removal will not erase the authorship or approval history of public records. This module will also be designed according to the user access hierarchy. For instance, purok leaders may only report an ongoing disaster incident to the BDRRMC chair, but cannot generate the SitRep itself.
The Disaster Reporting Module covers draft, submitted, corrected, and reconcile incident information. Records include stable identifiers, hazard and incident description, organization, location, occurrence, observation, receipt, submission times, source channel, affected population, and an explicit indication that a value is unknown, provisional, disputed, or not applicable. Initial reports may legitimately be incomplete because the 2024 NDRRM Operations Center guidelines recognize progressive reporting as information develops. The system therefore supports structure completeness without converting unavailable information into zero or presenting an early estimate as settled fact. Automated validation is limited to syntactic, domain, range, consistency, and possible-duplicate checks does not establish factual accuracy.
On the other hand, the Disaster Report Verification Module covers triage, review, clarification, correction, corroboration, validation, partial validation where configured, return, rejection, and reconciliation. It records who made each decision, role, when it was made, what source version was examined, and why information was returned, accepted, or rejected. Duplicate and conflict flags assist reviewers but do not automatically merge records or decide which source is authoritative. Late reports and corrections remain linked to the affected record and reporting period. Material changes create a new version or supersession relationship rather than replacing the prior submitted or approved account without history.
Moreover, the system will include the SitRep Generation Module where disaster situation reports can be reviewed and generated by the authorized ZCDRRMO personnels. This will feature automated consolidation and update of the situation report based on the submission of the barangays.
Also, the SiteRep Catalog Module will be included in the system where the final generated disaster situation reports will be stored in chronological order and based on the disaster category (i.e., Typhoon, Flood, and Fire). This module will feature filters and search bars for easier and optimal access. Also, authorized ZCDRMMO personnels may edit the generated Situation Reports in the event that it must be edited for correction. SitReps can also be downloaded from the system to the authorized user’s or the office’s local device (i.e., computer, laptop).
Lastly, the system will also include the Dashboard Module where the authorized ZCDRRMO personnels can view the analytics of the website including, but not limited to, initial reports entries, number of disaster incidents reported, and number of situation reports generated. This will serve as an analytical tool for the ZCDRRMO to monitor relevant and key trends using the data.
As for the limitations of this project, the system will only cover the floods, typhoons, and fire disasters and will not cover other disasters like the earthquake, landslide, tsunami, and volcanic eruption. Also, real-time operations in the system, such as disaster reporting, will mainly take place online. Factors such as network signal and internet connectivity are beyond the control of this project. Also, ZCDRRMO personnels will be responsible for checking and validating if a user (newly registered account) is legitimate and has permission to access the system, as well as for overseeing the transactions within the system (e.g., initial reporting, report verification, etc.). Ultimately, the system will be designed exclusively for the ZCDRRMO Situation Report Generation and Record Management process and will not handle the announcements to the general public.
## Significance of the Project
The development of the Online Disaster Situation Reports Generation and Record Management System serves as a critical technological intervention in the localized disaster response framework. By directly addressing the communication fragmentation and compliance bottlenecks experienced under the Department of the Interior and Local Government’s (DILG) Operation LISTO mandate, the significance of the study heavily impacts and manifests across multiple stakeholders and dimensions.
At the grassroots level, the system empowers purok leaders by providing a structured, digital reporting tool that bypasses the traditional delays of physical transit and unverified social media chats. During fast-moving hazards, purok leaders are the first line of incident detection. By utilizing standardized mobile/web interfaces, purok leaders can transmit exact incident coordinates, household demographic impacts, and immediate resource needs in real-time. This ensures that their specific communities are not overlooked during city-wide relief distributions and eliminates the burden of manual, error-prone tallies that often lead to double-counting or lost data.
Under the DILG's Operation LISTO, specifically the *"Listo si Kap"* checklist, the Barangay Captain and the Barangay Disaster Risk Reduction and Management Committee (BDRRMC) Chair bear the heavy mandate of executing pre-emptive evacuations, monitoring casualties, and consolidating grassroots data. The system provides these officials with an automated dashboard that aggregates purok-level data instantly. This eliminates the 6 to 12-hour operational latency commonly associated with consolidating physical logbooks and paper tally sheets (Goh et al., 2019). Consequently, the barangay leadership can make rapid, evidence-based decisions, maintain a highly accurate inventory of affected families, and effortlessly submit mandatory Operation LISTO compliance reports to the municipal DRRMO without administrative bottlenecks.
or the municipal or city government, the system acts as an operational force multiplier. By enforcing a standardized digital reporting pipeline, the City Disaster Risk Reduction and Management Office (CDRRMO) gains real-time, high-fidelity visibility into the disaster landscape. Automated data validation ensures that the central command center is not overwhelmed by noisy, unstructured SMS or Facebook messages. This allows the City Government to accurately track compliance with Alpha, Bravo, and Charlie alert protocols and dynamically dispatch search-and-rescue assets or relief goods to precise, geo-tagged high-risk zones. Ultimately, it professionalizes the flow of data, enabling the rapid and accurate generation of formal Situation Reports (SitReps) required by the National Disaster Risk Reduction and Management Council (NDRRMC) and the Commission on Audit (COA).
This project provides profound and multifaceted value to the academic fields of disaster informatics, public policy, and resilient governance. Future researchers can utilize this system as a foundational case study for evaluating the integration of national mandates—specifically RA 10121 and Operation LISTO—into localized municipal IT infrastructure.
By transitioning grassroots disaster governance from analog to digital, the system generates vast amounts of empirical, structured, and spatial datasets (e.g., household readiness indicators, real-time warning dissemination metrics, and evacuation tracking). According to the Philippine Institute for Development Studies (PIDS), local disaster information systems represent indispensable inputs for policy research, enabling scholars to evaluate institutional capacity and risk governance effectiveness at the grassroots level (Domingo & Manejar, 2018; 2021).
Furthermore, subsequent researchers can leverage this localized historical disaster data to conduct predictive analytics, hazard mapping, and machine learning models to forecast future vulnerability zones. It also opens avenues for academic inquiry into behavioral studies—such as integrating the Protection Motivation Theory (PMT) with real-world preparedness data (Kurata et al., 2023)—and analyzing the sociology of digital technology adoption among local government officials in developing nations.

















CHAPTER II
# REVIEW OF RELATED LITERATURE

### 2.1 Disaster Management Frameworks and Mandates
Globally, the United Nations Office for Disaster Risk Reduction (UNDRR) is the lead United Nations entity for the coordination of disaster risk reduction. UNDRR supports the implementation and review of the Disaster Risk Reduction Frameworks formed through inter-governmental negotiations and stakeholder consultations involving United Nations Member States. Currently, the Sendai Framework for Disaster Risk Reduction 2015-2030 is the landmark global agreement adopted by United Nations member states, with the goal of minimizing the catastrophic impacts of natural and human-induced hazards, where it focuses on proactive approach to disaster risk management for the prevention of new risks and the reduction of existing vulnerabilities (United Nations Office for Disaster Risk Reduction, 2015).
Priority 1 of the Sendai Framework establishes that effective disaster risk management must be fundamentally rooted in a comprehensive understanding of risk, encompassing vulnerability, capacity, exposure, and hazard characteristics, at both local and global scales. To achieve this, the framework mandates a systematic approach to the collection, analysis, and dissemination of detailed and categorized data, by also utilizing advanced technological innovations like geospatial tools and real-time monitoring to inform decision-making. Moving beyond technical data, this priority focuses on integrating scientific research with traditional and indigenous knowledge to ensure disaster impacts are recorded transparently across all sectors. Ultimately, by aligning science with policy, promoting public education, and fostering global cooperation, this priority aims to create a collection of evidence that empowers governments, communities, and the private sector to move beyond mere reactive emergency response toward proactive prevention and sustainable risk reduction (United Nations Office for Disaster Risk Reduction, 2015).
While the Sendai Framework provides a comprehensive and solid global framework for disaster management, its implementation under Priority 1 is hindered by several structural gaps. First, there is a persistent data fragmentation issue, where many member states lack standardized reporting mechanisms and centralized focal points, which leads to inconsistent disaster loss data and a heavy reliance on the private sector for economic loss information (Dix et al., 2021). Furthermore, a technocratic bias often prioritizes high-level geospatial tools over the integration of traditional and indigenous knowledge, which remains underutilized in formal policy. These technical challenges are compounded by a significant financing gap and growing technological inequalities, where developing nations and local governments struggle to access the advanced monitoring systems and high-resolution data required to model increasingly complex, climate-driven systemic risks (Fang & Rahman, 2019).
Similarly, the United Nations Disaster Assessment and Coordination (UNDAC) 8th Edition Handbook of the United Nations Office for the Coordination of Humanitarian Affairs (UNOCHA), a reference guide for the UNDAC team members before and during a disaster or emergency mission, shares the same sentiments with regards to establishing an understanding of a disaster and its impacts, highlighting good situational awareness as a key to an effective and accountable humanitarian response. Part of developing their Information Management (IM) strategy is determining the required information for decision-making and its dissemination schedule. Subsequently, part of the execution of the IM plan is regularly updating and sharing information products like situation reports (United Nations Office for the Coordination of Humanitarian Affairs, 2024).
However, the operational environment, as described by Staufaccher (2011), the co-founder of the ICT4Peace Foundation, highlights a persistent methodological fragmentation that is mirrored in the UNDAC Handbook (8th Edition). By relying on what the author calls 'haphazard' tech adoption and standalone tools, the Handbook's processes inadvertently create the data silos and interoperability gaps the UN Crisis Information Management Strategy (CiMS) was designed to solve. As a result, these processes struggle to translate raw data into actionable intelligence, leading to the information overload and reactive reporting cycles that the ICT4Peace Foundation co-founder identifies as a primary barrier to effective humanitarian response.
Nationally, the mandate for the Philippines’ Disaster Risk Reduction and Management System, which is the Republic Act No. 10121 or the Philippine Disaster Risk Reduction and Management Act of 2010, emphasizes the functions of the NDRRMC as the primary policy-making and coordinating body. Crucial to this mandate is the Council’s responsibility for information management and situation report generation. These reports serve as the definitive baseline for the President to declare a State of Calamity and are significant because they transform raw, multi-agency data into actionable intelligence. By providing a unified 'situation map,' the NDRRMC ensures that resource mobilization is targeted, that the National DRRM Fund is utilized appropriately and efficiently, and that all stakeholders, from local volunteers to international partners, operate under a single, synchronized response strategy (Congress of the Philippines, 2010).
At the local level, the mandate shifts to ground-level implementation and rapid response through the Local Disaster Risk Reduction and Management (LDRRM) Offices and the Barangay Disaster Risk Reduction and Management (BDRRM) Committees, where as the primary executors of disaster programs within their territorial jurisdictions, these offices are mandated to maintain 24/7 monitoring and operation centers. The significance of local situation report generation cannot be overstated because it serves as the immediate trigger for the mobilization of local resources and the deployment of emergency response teams. Furthermore, these reports provide the necessary legal and empirical basis for the utilization of the Local DRRM Fund, ensuring that aid, particularly for the most vulnerable sectors like women and children as well as persons with disability (PWDs), is delivered with equity and precision. By consolidating real-time disaster situation information, the LDRRMO acts as the vital information bridge that connects community-level realities to national-level decision-making (Congress of the Philippines, 2010).
### 2.2 The Need of Reporting and SitRep Generation
According to Abello (2017), disaster reporting through Situational Reports (SitReps) is a mandated activity used to support strategic, operational, and tactical situational awareness for national and international organizations. Within the Philippine National Disaster Response Plan (NDRP), SitReps from various clusters are integrated across all phases of operations: pre-disaster, during-disaster, and post-disaster, to guide coordinated response efforts. These reports serve as critical operational triggers. For instance, if no information or reporting is received from an affected area within 6 to 12 hours of a typhoon's landfall, the national government assumes response activities and prepositions Rapid Deployment Teams (RDT). These teams are tasked with conducting Rapid Disaster Needs Assessments and aerial surveys to assess the magnitude of damage when ground-level communication is lost.
Despite its importance, reporting often faces challenges related to data accuracy, consistency, and validation. Research indicates significant discrepancies between official NDRRMC SitReps, media reports, and local government data, particularly regarding casualty counts in specific locations (Agapito et. al, 2025; Aminoltaheri et. al, 2017). For example, mass casualty events recorded by local disaster officers or the press may sometimes be absent from final official tallies, necessitating the use of multiple data sources to account for reporting gaps (Agapito et. al, 2025). Furthermore, according to Abello (2017), disaster-related data is frequently characterized by unverified rumors and "perishable" social media information, which amplifies the need for officers to perform rigorous triangulation between official national data and crowd-mapped platforms. Inaccurate barangay-level assessment reports and the difficulty of transmitting information from grassroots communities further complicate the generation of reliable SitReps.
According to Aminoltaheri et. al (2017), the evolution of reporting now encompasses a shift toward open data policies and the integration of multisectoral damage estimates. The Philippine government has increasingly utilized online platforms to promptly publish SitReps and updates, adhering to a commitment to transparency and information sharing. However, damage data collection is often described as a "socially constructed process" that remains fragmented and unsystematic due to the diverse priorities of different stakeholders. To address this, frameworks like the Post Disaster Needs Assessment (PDNA) provide a reporting system designed to identify long-term community needs and capture systemic interdependencies among affected sectors. By integrating "crisis data", where real-time, georeferenced reports from affected populations and digital volunteers are included, with traditional official SitReps, planners can create a more dynamic and comprehensive spatial representation of disaster impacts to support recovery.

2.3 The Advantages of Switching Fragmented to Centralized Reporting
The transition from fragmented to centralized reporting addresses a critical vulnerability in disaster management where data is often collected in an unsystematic manner. Currently, many agencies operate within information silos, viewing damage and data collection through diverging priorities and requirements. In regions like Catanduanes, this fragmentation is evident as various municipalities rely on a disparate mix of SMS, VHF radio, and even amateur radio, often without a unified protocol for total communication failure. This lack of coordination can lead to geographical isolation during catastrophes, where physical damage to ground-based infrastructure further severs the flow of information between grassroots communities and national responders (Aminoltaheri et. al, 2017; Toyado, 2020).
Moreover, according to Aminoltaheri et. al (2017) and Agapito et. al (2025), the shift toward a centralized system, such as a unique workflow for data management, ensures that information produced in one phase of a disaster remains relevant and accessible for subsequent phases. Centralized platforms like Project NOAH demonstrate this advantage by transforming "siloed," university-based research into a unified national strategy for disaster preparedness. By moving away from fragmented, non-machine-readable formats like printed maps or scanned PDFs, centralized reporting allows for interoperable digital data that can be easily shared and analyzed across multiple Geographic Information System (GIS) platforms. This integration is vital for creating a "target data structure" that supports intelligent search and retrieval during the frantic timeline of a crisis.
Centralization significantly enhances strategic and operational situational awareness by providing a "single version of truth" for decision-makers. The implementation of the Pre-Disaster Risk Assessment (PDRA) system in the Philippines exemplifies how a centralized reporting mechanism can provide hazard-specific, area-focused, and time-bound warnings (Agapito et al., 2025; Aminoltaheri et. al, 2017). This approach facilitates interagency collaboration, allowing the national government to assume response activities immediately if local reporting is lost for more than six hours. Also, according to Abello (2017) and Agapito et. al (2025), the availability of a centralized Web-GIS platform further empowers stakeholders to access real-time analytics and high-resolution hazard maps, which has been shown to reduce mass casualty events even when physical property damage remains high.
Ultimately, the advantages of centralized reporting extend into the post-disaster recovery and spatial planning phases. By integrating real-time crisis data from victims and digital volunteers into a centralized repository, urban planners can identify long-term community needs and capture systemic interdependencies. According to Aminoltaheri et. al (2017), this knowledge management approach allows for the comparison of post-event damage assessments against pre-disaster hazard maps to verify the accuracy of risk models. Centralization thus fosters resilient reconstruction by ensuring that lessons learned during the emergency are systematically embedded into land-use planning and community-based disaster risk reduction programs.
2.4 Importance of Secure Information Management
According to Alvarez et. al (2016), secure information management is a critical "force-multiplier" during disasters, as the impairment of existing infrastructure often forces responders to rely on substitute solutions with unknown or reduced security properties. While analog radios and unsecured internet access provide necessary connectivity, they are vulnerable to eavesdropping and message tampering by adversaries like militias, terrorists, and looters who become more active during crises. Foundational security features, specifically confidentiality, integrity, and authenticity, are mandatory to prevent the distribution of false information, which can lead to widespread confusion or a total loss of trust among recipients. Without these protections, malicious actors can replay old messages or inject fabricated data regarding the location of safe zones or critical facilities to manipulate the movement of victims and agencies.
The complexity of disaster scenarios necessitates a balance between open data transparency and the protection of sensitive information. While organizations increasingly adopt open access policies for situational reports and hazard maps, disaster management systems must implement strict authorization protocols to keep personally identifiable information (PII) from leaking to the public domain. For instance, during the 2008 Sichuan Earthquake, the lack of secure, anonymous channels led to the imprisonment of a citizen for sharing disaster-related images that the government deemed sensitive. Effective information management thus requires a structured workflow that ensures data is not only accessible to authorized planners but also protected against unauthorized manipulation (Alvarez et. al, 2016; Ha et. al, 2017).
Technological integration, such as the use of biometrics and secure mobile platforms, offers defense against information subversion. The E-Ligtas application in the Philippines exemplifies this by integrating fingerprint biometrics with GPS tracking to provide a reliable and verifiable means of alerting authorities (Rey, 2024). Similarly, according to Ha et. al (2017), frameworks like Sahana and WebEOC provide security at both the modular and framework levels to ensure that synchronized tasks remain protected across jurisdictions. By transitioning from non-machine-readable formats, like scanned PDFs, to interoperable digital data, organizations can maintain a "single version of truth" that is less prone to the errors and discrepancies often found between official reports and unverified social media rumors .
Finally, the importance of secure information management extends beyond the immediate emergency into the post-disaster recovery and reconstruction phase. Secure, immense repositories like those provided by crisis mapping platforms generate a historical memory of the event that is vital for verifying the accuracy of pre-disaster risk models. Maintaining the validity and "freshness" of this information prevents the replaying of superseded data that could harm long-term spatial planning and relocation efforts. By embedding operations research (OR) and secure data management into national policy, such as the Philippine DRRM Act, governments can ensure that the scientific knowledge produced during a crisis remains a trusted foundation for building resilient and adaptive communities (Alvarez et. al, 2016; Agapito at. al, 2025; Aminoltaheri et. al, 2017).
### 2.5 Disaster Reporting and SitRep Generation Technology
The digital transformation of disaster management has led to numerous web-based and mobile application Incident Reporting Systems that aids in Disaster Risk Reduction. These platforms aim to offer a more accessible avenue for reporting whilst decreasing the response and awareness latency. An implementation of such a system by de los Santos et al. leverages React Native and Laravel to facilitate geotagged reporting via SMS and mobile interfaces.  This implementation is supported by a MySQL relational database. This architecture exemplifies how IT solutions can be utilized to build robust, scalable mediums for emergency response and communication (Eastern Visayas State University, 2025).
Standardized reporting under the NDRRMC framework states that various administrative levels from municipalities to regions produce Situation Reports according to rigorous templates. Currently, this process is characterized by manual entry via conventional productivity tools, leading to potential inefficiencies and discrepancies. Although the surge of automated reporting modules has graced other sectors, such innovations have yet to be applied to the generation of official disaster situation reports. This gap highlights a significant need for an integrated system capable of automating the synthesis of data into formal documentation.
### 2.6 Related Systems
There are several systems that use Information Technology tools with the goal of making disaster situation reporting organized, streamlined, and systematic. Reviewing these existing studies offers a basis for understanding how the proposed system improves upon the past systems.
2.6.1 Bandilyo App
The Bandilyo App serves as a specialized Disaster Risk Reduction (DRR)   and Incident Reporting System (IRS) that demonstrates how integrated command and control communication can modernize emergency management. Prior to the development of the system, disaster coordination in Tanauan, Leyte faced challenges in information lag and manual reporting. With the introduction of the mentioned integrated platform, the municipality gained a system equipped with Geotagging and Short Messaging Services (SMS) technology, allowing for more precise tracking and faster humanitarian response. This digital approach not only streamlines the coordination of planning activities but also ensures that emergency data is captured and transmitted through an accessible mobile form factor (Eastern Visayas State University, 2025) .
The system provides a comprehensive suite of features that simplify the complexities of disaster response and administrative monitoring. It utilizes a combination of broadband connectivity, mobile applications, and a client-server network architecture to create a robust environment for incident reporting. Technical features vital for the system include real-time geolocation for incident mapping and a secure database powered by MySQL to ensure data reliability. By utilizing a technical stack of Laravel, React Native, and JavaScript, the Bandilyo App provides an intuitive interface for field responders while maintaining a secured backend for administrators to monitor and manage resources effectively. To ensure that the system met the rigorous requirements of emergency response, the researchers employed an Agile Software development methodology, allowing for iterative development improvements based on user requirement (Eastern Visayas State University, 2025) .
The Bandilyo App serves as a valuable technical reference for the proposed system, with its successful integration of multi-platform communication and its proven efficiency in high-stakes operational environments.
2.6.2 Advanced Gathering for Assistance Preparedness for Protection (AGAPP)
The Advanced Gathering for Assistance Preparedness for Protection (AGAPP) is a system developed by the Information and Communications Technology Management Service (ICTMS) in collaboration with the Disaster Response Management Bureau (DRMB) of the Department of Social Welfare and Development (DSWD) for disaster data and information reporting systems of the department. It is a mobile application tool that is designed to streamline the collection of data and information on disaster incidents (Philippine Disaster Response Management Bureau, 2026). The primary purpose of this tool is to provide near real-time situation reports, which are essential for informed decision-making by disaster managers and other stakeholders. By enabling the immediate transmission of information, the app ensures that interventions and services can be swiftly implemented in areas affected by disasters.
In addition to speeding up data transmission, AGAPP is vital for enhancing situational awareness through the meticulous compilation of essential incident details. The application features an intuitive interface and robust tools that empower responders to efficiently manage incidents and mitigate risks. These capabilities are designed to foster coordinated response efforts and facilitate prompt decision-making to safeguard the well-being of affected communities. Ultimately, the system serves as a critical component in the DSWD's efforts to modernize disaster response operations and provide comprehensive situational awareness during emergencies (Philippine Disaster Response Management Bureau, 2026).














Figure 2.6.2.1 Advanced Gathering for Assistance Preparedness for Protection (AGAPP) Landing Page

















Figure 2.6.2.2 Advanced Gathering for Assistance Preparedness for Protection (AGAPP) Report Page
























Figure 2.6.2.3 Advanced Gathering for Assistance Preparedness for Protection (AGAPP) Map Page





















Figure 2.6.2.4 Advanced Gathering for Assistance Preparedness for Protection (AGAPP) FAQ Page
2.6.3 IRespondPH
According to Montefalcon et. al (2021), IRespondPH is a comprehensive mobile and web-based application specifically designed for Post Disaster Needs Assessment (PDNA) and disaster response in the Philippines. Developed by a team of researchers from National University-Manila and Mapua University-Manila, including Myron Darrel Montefalcon and others, the system addresses the critical need for efficient post-disaster response to minimize the adverse impacts of natural calamities such as typhoons, earthquakes, and volcanic eruptions. Its primary purpose is to provide citizens with real-time disaster information while enabling disaster managers to make data-driven decisions based on reports submitted by the public in the immediate aftermath of an event. By integrating technology into the assessment process, the system aims to improve the effectiveness of aid relief operations and contribute to building disaster resiliency across the country.
The system architecture facilitates interaction between three primary user groups: Citizens (Users), Local Government Units (Admins), and Disaster Management Coordinators (Master Admins). Citizens utilize the mobile application to report disaster occurrences, maintain a personal profile of their engagement, and access real-time news updates and safety tips for various types of natural hazards. They can also view a heatmap that displays the severity and details of disasters in their area. On the web-based side, LGU Admins are responsible for monitoring the disaster database, validating citizen reports, and scaling the severity of incidents for public display. Master Admins oversee the entire platform, managing the registry of new admins, coordinating with other government institutions for relief efforts, and utilizing a real-time dashboard of graphs and charts to guide strategic response decisions.
Moreover, IRespondPH was developed using the Agile Software Development Cycle, an iterative process consisting of four stages: Concept, Inception, Construction, and Release. The development team used WordPress and Flutter for the frontend interfaces, while the backend was built using MySQL and Firebase. The construction phase involved four specific iterations that moved from initial design and database creation to the integration of complex features like the heatmap and history logs. To ensure system reliability, it underwent Agile testing at four levels: unit/component testing, integration testing, system testing, and Usability Acceptance Testing (UAT). The UAT, which evaluated the system based on learnability, efficiency, errors, and satisfaction, resulted in high mean scores ranging from 3.8 to 4.6, indicating that the application is ready for deployment and implementation within local government units..

2.6.4 The Mamamayan Web App
According to Calanog et. al (2024), Mamamayan is a mobile community-based emergency reporting and notification system specifically designed for Makati City in the Philippines. Developed by William Penaflor Rey, Sydney Alison S. Adalin, Khristopher Ross L. Calanog, and Gian Windsor R. Jimenez from Mapua University, the system aims to prioritize disaster risk reduction and climate change adaptation. Its primary purpose is to serve as a resilient emergency alert system that informs the public and the local government about crises, accidents, or incidents requiring immediate attention, ultimately to save lives and protect property in a densely populated urban environment.
The system architecture facilitates interaction between two main user groups: the "Makatizens" (residents) and emergency dispatchers at the Makati Command Center. Residents use an Android-based mobile application to report a wide range of emergencies, including fires, typhoon-related incidents, vehicular accidents, and health-related concerns. The system utilizes the geolocation capabilities of smartphones, allowing dispatchers to pinpoint a caller's exact location for a more effective response. Beyond reporting, the app provides users with a "marked-as-safe" feature, evacuation-map assistance, local emergency contact lists, and safety tips.
Technically, Mamamayan was developed using a Feature-Driven Development (FDD) approach within the Agile methodology. The system was built using Java as the primary programming language and utilizes Firebase as its cloud-based database. The design follows an Input, Process, Output (IPO) model, where the mobile app communicates with web services that process data for a monitoring software tool used by city officials. This architecture ensures a continuous flow of data from the citizens to the authorities who can then coordinate resource deployment.
Furthermore, the system underwent rigorous evaluation using IBM’s Post-Study System Usability Questionnaire (PSSUQ) and ISO/IEC 9126 standards. It achieved high marks for usability, with a PSSUQ overall mean score of 1.50 (indicating high acceptance in usefulness and interface quality) and an ISO 9126 score of 4.71, reflecting strong performance in reliability, efficiency, and maintainability. Performance testing also confirmed that the web application operates at "Fast" speeds for parameters like First Contentful Paint and Fully Loaded Time, ensuring it can handle the demands of real-time emergency management.

















Figure 2.6.3.1 Mamamayan Web App Pages





### 2.7 Comparative Analysis of Existing Systems
This section presents the difference between each related system and the SitRepO mobile application based on the system feature:
Table 2.7 Comparison Table of the Related Systems and SitRepO Barangay Disaster Situation Record Management and Situation Report Generation System

The core similarity among these systems: IRespondPH, Mamamayan, Bandilyo, AGAPP, and the proposed SitRepO, is their shared objective to modernize disaster management in the Philippines through mobile and web-based technologies. All projects utilize geolocation and real-time data to bridge the "information lag" that often hampers humanitarian response in hazard-prone regions. They are designed to assist decision-makers by providing a centralized platform for reporting and monitoring, moving away from traditional manual processes to ensure that interventions are implemented swiftly in affected areas.
IRespondPH differs from SitRepO by focusing heavily on Post Disaster Needs Assessment (PDNA) and citizen-centric features. While SitRepO is structured around a formal administrative reporting chain from puroks to the city office, IRespondPH includes modules for donations, news updates, and safety tips specifically for citizens. Furthermore, IRespondPH utilizes heatmaps to visualize disaster severity for the public, whereas SitRepO’s primary innovation lies in its structured "Disaster Situation Reporting Module" designed for local government units to generate official, data-driven situation reports.
Systems like Mamamayan and Bandilyo emphasize real-time incident reporting of various emergencies, including fires, vehicular accidents, and crimes. Mamamayan operates through a community-based system that feeds directly into the Makati Emergency Operations Center for immediate dispatch. Bandilyo highlights technical innovation through its use of SMS technology and a modern tech stack (Laravel and React Native) to ensure connectivity in high-stakes environments. SitRepO distinguishes itself from these by focusing on the lifecycle of the SitRep itself, providing a dedicated Verification Module that allows for formal revisions and responses before a report is finalized.
A key innovation of SitRepO compared to tools like AGAPP (DSWD) is the inclusion of a "SitRep Catalog Module". While AGAPP aims to streamline data collection for "near real-time" reports, SitRepO provides a dedicated storage system where historical situational reports can be retrieved and sorted using specific filters. This functionality is critical for long-term disaster risk reduction (DRR) planning, as it allows authorized personnel to analyze past data trends through a centralized Reports Module to improve future emergency protocols.
Finally, while these systems all implement user authentication and role-based access to protect data integrity, none explicitly mention the use of encryption for sensitive data at rest. Mamamayan uses Firebase for cloud-based data storage, and Bandilyo relies on a secured MySQL database, reflecting a common trend of prioritizing availability and reliability. The primary difference remains that SitRepO acts as a comprehensive management and generation tool for official documentation, whereas the other systems function more as immediate reporting and notification interfaces for field responders and the general public (Philippine Disaster Response Management Bureau, 2026; Montefalcon et. al 2021; Calanog et. al 2024).
CHAPTER III
# METHODOLOGY
## 3.1 Architectural Design

Figure 3.1 Barangay Disaster Situation Record Management and Situation Report Generation System N-tier Architecture Diagram
Figure 3.1 illustrates the layered architectural  design of the Barangay Disaster SItuation Record Management and Situation Report Generation System, displaying a decoupled cross-platform architecture engineered to accommodate both centralized desktop-based administration and decentralized mobile field operations. The structural layout is divided into four distinct, specialized tiers comprising the User Interface Component Layer, the Business Logic Layer, the Network Layer, and the Data Layer, which collectively bridge an administrative web portal with a field-ready mobile application. The presentation layer forms the operation frontier of the application, distributing platform-specific interfaces across stakeholders where the Administrator utilizes a web and mobile console containing components for Log In Validation, Analytics Dashboard, Account Registration and Hierarchy Management, Disaster Incident Creation, Situation Report Generation and Export, and an Initial and Incident Report Viewing. Conversely, decentralized operations are what is present in the Barangay mobile workspace. This includes user interface components for Log In Validation, Localized Barangay Dashboard, a Purok Account Registration Approval View, an Initial Reporting dashboard, an Incident Report Entry Form, an Affected Population entry module, and a Local Situation Data View, while the ground-level Purok Mobile client is strictly restricted to basic operation inputs consisting of a Log In Validation screen, an Account Registration Request Screen, and an Initial Incident Reporting Module.
Operating directly beneath the presentation layer, the business logic layer functions as the core computation engine of the platform, executing the internal processing rules, transactional validations, and data manipulation routines that govern the lifecycle of disaster records. To maintain a strict separation of concerns and ensure role-based security, these core logic handlers are segregated into independent processing blocks tailored to each entity’s specific functions. The Administrator business logic engine manages secure login/logout sequences with encrypted password validation, enforces system-wide role-based access control, regulates administrative profile configurations, initializes new hazard event parameters within the central repository, drives the report compiler to aggregate complex data into situation reports, and runs background audit tracking to generate event log records. The Barangay business logic engine focuses primarily on validation and data enrichment within localized domains, rendering localized monthly analytics dashboards, processing field incident entries, aggregating extensive quantitative affected population metrics across specific vulnerable demographics, and operating verification to audit incoming ground-level reports. The Purok business logic engine provides low-overhead operational processing routines restricted to managing entry-level mobile authentication, passing registration datasets to higher-tier verification queues to receive automated approval notifications and executing the executing workflows required to capture and send the initial ground-level emergency records.
The transport and persistence of data across these distributed runtime environments are regulated by the network and data layers, which maintain systemic stability and data consistency during high-concurrency event states or severe communication drops. The network layer establishes a cross-platform communication architecture that handles desktop-to-mobile synchronization via HTTPS and WebSocket frameworks, ensuring that localized field records instantly reflect on the administrative console. This transport tier leverages a unified RESTful API Gateway Engine to parse incoming JSON payloads uniformly across web and mobile clients while deploying synchronization and offline relay handlers that manages bi-directional and transactional queues to cache information on local mobile devices during connection dropouts and automatically execute push-reconciliations when connectivity is re-established. Finally, the data layer implants a hybrid, fault tolerant persistence model engineered to provide maximum operational uptime during catastrophic events by splitting data workloads between centralized cloud infrastructure and localized device database. This framework utilizes a cloud-hosted MySQL database engine as the master ledger to service primary web views, run heavy analytical aggregates, and maintain long-term archival storage, which operates alongside embedded SQLite database registries deployed directly on mobile client devices to enable offline lookups and record creations. This cross platform schema enforces strict relational consistency constraints across both databases, maintaining identical data structures and mapping transaction states identically for all shared system tables.
## 3.2 Requirement Specification
The section focuses on the functional and non-functional requirements of the proposed Barangay Disaster Situation Record Management and Situation Report Generation System. The requirements were gathered from the interviews from the Barangay Officials that have dealt with the process of Disaster Situation Report and their BDRRMC chairperson as well as personnel from ZCDRRMO responsible for emergency response and Situation Report Generation. It is also rooted from the current workflow of the offices and the mandate by the NDRRMC. The system aims to streamline the process of Disaster Situation Reporting and Situation Report Generation by providing a platform for the different bodies involved in the entire process.
### 3.2.1 Users and Characteristics
Barangay Disaster Situation Record Management and Situation Report Generation System categorizes users based on their roles, access privileges, and technical expertise. The following users are administrator, barangay personnel, and their respective purok/s personnel/s.
Figure 3.2.2 Users and Characteristics

### 3.2.2 Software Functionalities
The proposed system provides a set of core functionalities designed to address the current challenges faced in recording, reporting, generating, and managing disaster situation reports. The functionalities are the following:

Figure 3.2.1 Functional Requirements

### 3.2.3 Security Requirements
The proposed system will utilize a login module to restrict and control system access, ensuring only authorized users can access the system, and only the organization’s head can generate the situation report to avoid duplication. Furthermore, passwords must be encrypted using secure hashing algorithms. Access control should restrict users from accessing unauthorized modules. Also, the system should be able to maintain session management in order to prevent unauthorized logins. All data stored in the database should be secured and protected in a hashed format. Lastly, all forms must include security measures to avoid web and mobile vulnerabilities.

### 3.2.4 Technical Requirements
The proposed system will utilize a single, centralized database using MySQL that supports real-time storage of data, creation, retrieval, and updating of disaster situation reports. The system will be implemented by the developer using modern web technologies such as the JavaScript library React, and TailWindCSS for the css styling. The system will cater to three types of users: Reporters, Verifiers/Approvers, and Admins. For the reporters, they are the users who can send initial incident reports in the system using their mobile phones. For the verifiers/approvers, they are responsible for verifying that the report is legitimate and coordinate with each other, including organization head (e.g., barangay captain/BDRRMC chair in the barangay level, operations department head for the CDRRMO). Lastly, the admin will be responsible for monitoring site activity, ensuring incident reports are taken care of and disaster situation reports are monitored.
Hardware Requirements
Web Client Deployment (Administrative Framework)
Minimum
Processor: Intel Core i3-10100 (4 Cores, 8 Threads, up to 4.30 GHz) or AMD Ryzen 3 3100 (4 Cores, 8 Threads, up to 3.90 GHz)
Memory: 8 GB DDR4 RAM
Storage: 256 GB SATA III Solid State Drive (SSD)
Display: 1366 x 768 minimum resolution console monitor
Device: Desktop, laptop, or workstation terminal computer
Recommended
Processor: Intel Core i5-12400 (6 Cores, 12 Threads, up to 4.40 GHz) or AMD Ryzen 5 5600X (6 Cores, 12 Threads, up to 4.60 GHz)
Memory: 16 GB DDR4/DDR5 RAM
Storage: 512 GB NVMe M.2 Solid State Drive (SSD)
Display: 1920 x 1080 Full HD widescreen display monitor
Mobile Client Deployment (Barangay and Purok Field Handlers)
Minimum
Android Device: MediaTek Helio G85 or Qualcomm Snapdragon 680 (Octa-Core, up to 2.4 GHz); 4 GB LPDDR4X RAM; 64 GB internal storage (Android 10.0 or higher)
iOS Device: Apple A12 Bionic (6 Cores, up to 2.5 GHz); 3 GB RAM; 64 GB internal storage (iOS 15 or higher; iPhone XS / XR or newer)
Recommended
Android Device: MediaTek Dimensity 7050 or Qualcomm Snapdragon 778G (Octa-Core, up to 2.6 GHz with integrated 5G modem); 8 GB LPDDR4X/LPDDR5 RAM; 128 GB UFS 2.2 internal storage (Android 12.0 or higher)
iOS Device: Apple A15 Bionic (6 Cores, up to 3.23 GHz with integrated 5G modem); 4 GB RAM or higher; 128 GB NVMe internal storage (iOS 17 or higher; iPhone 13 or newer)
Software Requirements
Operating Systems: Windows 10 / 11 (64-bit) or macOS 13 (Ventura) or newer for administrative web deployment terminals, alongside Android OS 10.0 or higher for decentralized field mobile operations.
Development Frameworks: Web-tier backend services and administrative portals engineered via the Laravel PHP framework; cross-platform mobile frameworks (such as Flutter or React Native) optimized to build native Android and iOS application layers from a single codebase.
Database Management Systems (DBMS): Cloud-hosted MySQL relational database server acting as the high-availability central repository, working alongside embedded localized SQLite database engines running inside mobile runtimes to manage offline transactional data capture.
Web and Local Development Servers: Apache web servers or cloud-hosted infrastructure configured to host the live production database pools, alongside XAMPP or Laravel Sail for isolated local development environments.
Containerization Tools: Docker Desktop environments implemented to containerize local development dependencies, ensuring absolute environment parity between local building nodes and operational production runtimes.
Integrated Development Environments (IDE): Visual Studio Code equipped with PHP Extension Pack and cross-platform mobile development toolkits, alongside Xcode (macOS exclusive) for compiling, signing, and deploying the iOS mobile application binary packages.
Version Control and Management: Git software packages linked with remote GitHub organizations to regulate source code version tracking, branch merges, and manuscript code backups.
Dependency and Package Managers: Composer for backend PHP libraries, Node Package Manager (NPM) for frontend JavaScript compiling, CocoaPods for managing iOS native dependencies, and Gradle for compiling Android application packages.
## 3.3 Analysis
### 3.3.1 Process Models
Context Flow Diagram


Figure 3.3.1.A Barangay Disaster Situation Record Management and Situation Report Generation System Context Data Flow Diagram

Figure 3.3.1.A shows the Context Data Flow Diagram (DFD) of the Barangay Disaster Situation Record Management and Situation Report Generation System. The main entities that interact with the system are the Purok, Barangay, and Administrator.
The Purok serves as the initial reporting unit. They interact with the system by providing their log-in credentials to submit an Initial Incident Report regarding a disaster or emergency. Once submitted, the system processes this data and returns an Initial Incident Report Confirmation to the Purok user, ensuring that the ground-level data has been successfully captured.
The Barangay entities are responsible for the validation and enrichment of the data. They provide log-in credentials to access the system to Verify Initial Reports and input specific Affected Report Details. In exchange, the system provides them with access to the Barangay Analytics Database, Situation Report Data, and the final Situation Report Generation. This allows the Barangay level to maintain a localized view of the disaster's impact and manage the records for their specific jurisdiction.
The Administrator has high-level control and oversight over the entire platform. They manage the system’s security and user hierarchy through Account Creation and Modification access and Administrator Role Access. The Administrator is responsible for Disaster Incident Entry, Report Verification, and monitoring Recent System Activity. The system provides the Administrator with comprehensive Analytics Dashboard Data, Affected Population Details, and Situation Report Generation.
The Barangay Disaster Situation Record Management and Situation Report Generation System acts as the central repository and processor. It stores all disaster incident entries, affected population details, and account information in the database. It serves as the primary engine that retrieves and updates data whenever a report is verified or an analytics dashboard is generated, ensuring that the flow of information from the Purok to the Administrator is seamless and documented.




Level 0 Data Flow Diagram


Figure 3.3.1.B Barangay Disaster Situation Record Management and Situation Report Generation System Context Level 0 Data Flow Diagram
Figure 3.3.1.B shows the Level 0 Data Flow Diagram of the Barangay Disaster Situation Record Management and Situation Report Generation System. The primary external entities interacting with the system are the Purok, Barangay, and Administrator. The diagram is composed of seven main processes, which include: (1.0) Generate Analytics Dashboard, (2.0) Account Registration and Management, (3.0) Log In, (4.0) Initial Report Submission, (5.0) Initial Report Confirmation, (6.0) Incident Type and Event Creation, and (7.0) Situation Report Generation.

These processes function as the central hub for data exchange, connecting to various data stores such as D1 Analytics Data, D2 Situation Report DB, D3 Accounts DB, D4 Initial Reports DB, D5 Incident DB, and D6 Affected Population DB. The system coordinates the flow of incident reports, demographic impact data, and system credentials across these components.
The Administrator interacts with multiple processes to manage user hierarchies via Account Modification Access, define the parameters for disasters in Incident Type and Event Creation, and monitor regional status through the Analytics Dashboard Data. The Purok communicates with the system to submit ground-level data through the Initial Report Submission, receiving immediate feedback from the Initial Report Confirmation process. The Barangay plays a critical operational role by verifying reports, submitting Affected Population Data, and retrieving processed Barangay Analytics to manage their local disaster response. Through these interactions, the seven processes maintain a unified and balanced flow of data, ensuring that disaster records are accurately captured, verified, and transformed into the necessary documentation for emergency management.







Process 1: Generate Dashboard Monthly Analytics

Figure 3.3.1.B.1 Barangay Disaster Situation Record Management and Situation Report Generation System Level 1.1 DFD
Figure 3.3.1.B.1 illustrates the Level 1 Data Flow Diagram for the Generate Analytics Dashboard process, detailing how raw disaster data is transformed into visual insights. The subprocesses involved are (1.1) Data Retrieval, (1.2) Display Dashboard, and (1.3) Analysis Report.
The cycle begins with Process 1.1 (Data Retrieval), which pulls necessary information from two primary data stores: the Situation Report DB and the Incident Report DB. It fetches Situation Report Details and Incident Report Details, consolidating them into a unified stream of Situation and Incident Report Data.
This data is then passed to Process 1.2 (Display Dashboard). This process is responsible for rendering the visual components of the system. It outputs Analysis Dashboard Data directly to the Administrator for high-level monitoring and to the Barangay for localized awareness.
Finally, Process 1.3 (Analysis Report) focuses on specialized metrics and reporting. The Administrator receives detailed granular data including the User Number, Monthly Affected Population, and Monthly Reports Number. Simultaneously, the Barangay receives the Barangay Monthly Affected Population report, ensuring that both entities have the specific statistical breakdowns required for resource allocation and disaster evaluation. Through these subprocesses, the system ensures that complex database records are distilled into clear, actionable analytics for all stakeholders.
Process 2: Account Management


Figure 3.3.1.B.2 Barangay Disaster Situation Record Management and Situation Report Generation System Level 1.2 DFD
Figure 3.3.1.B.2 illustrates the Level 1 Data Flow Diagram for the Account Registration and Management process, detailing how user credentials and roles are handled within the platform. The subprocesses involved include: (2.1) Account Registration, (2.2) Approval of Registered Accounts, (2.3) Account Details Modification, (2.4) Retrieve Account Information, (2.5) Admin Account Creation, (2.6) Viewing of Barangay Accounts, (2.7) Approval of Registered Accounts, and (2.8) Viewing of Purok Accounts.
The registration lifecycle begins when the Barangay and Purok entities provide their Account Registration Details to Process 2.1 (Account Registration). Once submitted, these details are directed through distinct verification pathways. For Purok users, the registration details flow into Process 2.2 (Approval of Registered Accounts), where the Barangay entity reviews the Respective Purok Registration List to authorize or reject access. For Barangay users, the registration data moves to Process 2.7 (Approval of Registered Accounts), which routes a Barangay Registration List to the Administrator for a high-level Barangay Account Registration Approval, subsequently granting Purok Account Registration Approval back to the lower reporting levels.
Administrative and system settings are handled through specific backend components. The Administrator can provision system access via Process 2.5 (Admin Account Creation) by inputting Administrator Staff Details, which outputs Created Account Details to Process 2.4 (Retrieve Account Information). Furthermore, the Administrator can update existing profile credentials through Process 2.3 (Account Details Modification) by providing Account Details, generating Modified Account Details that update the centralized repository.
To maintain system oversight, account statuses can be reviewed seamlessly. Process 2.6 (Viewing of Barangay Accounts) pulls Barangay DB Account Details from the Barangay Account DB data store to provide a consolidated List of Barangay Accounts to the Administrator. Concurrently, Process 2.8 (Viewing of Purok Accounts) retrieves Purok Account Details from the Purok Account DB data store, allowing the Barangay to monitor active ground-level operators. This structured architecture ensures that permissions and user credentials remain secure, audited, and strictly role-bound across all administrative tiers.

Process 3: Log In Validation

Figure 3.3.1.B.3 Barangay Disaster Situation Record Management and Situation Report Generation System Level 1.3 DFD
Figure 3.3.1.B.3 shows the Level 1 Data Flow Diagram for the Log In Validation process, which controls access control and system security. The system architecture breaks this down into four primary subprocesses: (3.1) Validate User, (3.2) Verify Role, (3.3) Display Dashboard, and (3.4) Log Out Session.

The authentication sequence initiates at Process 3.1 (Validate User), where the system acts as a secure gateway. The three core external entities, the Administrator, the Barangay, and the Purok, interact with this process by submitting their respective Log In Credentials. To authenticate these incoming entries, the process cross-references the credentials against stored User Accounts retrieved from the User Account DB data store.
Once authentication succeeds, the validated user data moves forward to Process 3.2 (Verify Role). This subsystem evaluates the structural access tier assigned to the authenticated account. It determines specific functional privileges within the system architecture and outputs a verified User Role to Process 3.3 (Display Dashboard).
Process 3.3 (Display Dashboard) receives this information to route and render the specific interface layout authorized for that specific role, ensuring users only see the features and administrative privileges meant for them. When a user chooses to close their active session, the dashboard subsystem passes the authorized User Details to Process 3.4 (Log Out Session), which safely terminates the system connection and clears the temporary operational state.
Process 4: Incident and Situation Report

Figure 3.3.1.B.4 Barangay Disaster Situation Record Management and Situation Report Generation System Level 1.4 DFD

Figure 3.3.1.B.4 illustrates the Level 1 Data Flow Diagram for the disaster documentation and report compilation subsystems. This phase of the system architectural workflow is segmented into six operational subprocesses: (4.1) Create Disaster Incident, (4.2) View Disaster Incident Reports, (4.3) Create/Modify Disaster Incident Report, (4.4) Modify Existing Disaster Incident Reports, (4.5) Create Situation Report, and (4.6) View Situation Report.
The data ingestion sequence begins when the Administrator interacts with Process 4.1 (Create Disaster Incident) by inputting the initial Incident Type and Details. This subsystem processes the parameters and saves the structural Incident Details into the Disaster Incident DB data store. Once a disaster framework is established, the Barangay entity can input field observations via Process 4.3 (Create/Modify Disaster Incident Report) by providing localized Incident Report Details. This process retrieves structural definitions from the Disaster Incident DB and maps incoming field updates as Incident Reports into the Disaster Incident Reports DB data store.
Data validation and synthesis are managed sequentially through administrative review channels. The Administrator utilizes Process 4.2 (View Disaster Incident Reports) to fetch Disaster Incident Report Details directly from the storage entity, outputting granular Incident Report Details to their dashboard interface. If data corrections are necessary, the Administrator pushes an Incident Report Modification through Process 4.4 (Modify Existing Disaster Incident Reports), which dynamically routes the verified corrections directly back to the Barangay entity.
The final phase involves formal document compilation. Process 4.5 (Create Situation Report) maps incoming Incident Report Data extracted from the storage layers alongside administrative Situation Report Details provided by the Administrator. This subsystem combines the fields and commits a structured Situation Report to the Situation Report DB data store. The compiled outputs can be systematically reviewed through Process 4.6 (View Situation Report), which reads the storage layer to render the finalized Situation Report document back onto the Administrator's console for formal export and regional dissemination.
Process 5: Event Logs


Figure 3.3.1.B.5 Barangay Disaster Situation Record Management and Situation Report Generation System Level 1.5 DFD
Figure 3.3.1.B.5 shows the Level 1 Data Flow Diagram for the system audit tracking and log management architecture. This background subsystem monitoring pipeline is broken down into three main subprocesses: (5.1) View Event Logs, (5.2) Record System Activity, and (5.3) Retrieve Event Logs.
The audit sequence relies on real-time operational capturing. When the external entities perform operations within the platform, their actions are passed as a System Action data flow into Process 5.1 (View Event Logs). This hub immediately routes the incoming operational data as a Store System Action string directly to Process 5.2 (Record System Activity). This secondary engine formalizes the operational record, appending tracking fields before committing the structured Event Log into the System Logs DB data store.
For administrative system oversight and monitoring, security records are displayed via active fetching mechanisms. The Administrator can send a request to View Event Logs through Process 5.1, which queries the database layer to pull the Retrieved Log Record and projects it back to the administrative dashboard interface. Concurrently, standalone background system processes rely on Process 5.3 (Retrieve Event Logs) to independently extract structural Log Action data points directly from the System Logs DB repository, ensuring that all platform events remain traceable, verifiable, and secure.
### 3.3.2 Data Models


Figure 3.3.2 Barangay Disaster Situation Record Management and Situation Report Generation System Entity Relationship Diagram
Figure 3.3.2 illustrates the Entity Relationship Diagram (ERD) of the Barangay Disaster Situation Record Management and Situation Report Generation System. The database schema utilizes an Enhanced Entity-Relationship structure featuring a user role generalization and specialization hierarchy to map specific profile permissions alongside operational disaster documentation pathways. The foundational architecture relies on a central Account supertype table that holds generalized profile credentials and demographic attributes, including Account_Id, Account_Usernmae, Account_Password, Account_Date_Created, Account_Name, Account_Fname, Account_Mname, Account_Lname, Account_Email, Account_Phone, and Account_Address. Through a total specialization disjoint constraint, this supertype entity splits into three distinct operational subtypes: Admin, Barangay, and Purok. Each specialized entity automatically inherits all core profile properties from the root account table while maintaining independent relational pathways. The Admin_Id, Barangay_Id, and Purok_Id function as combined primary and foreign keys linking directly back to the base table, with the Barangay and Purok entities maintaining unique secondary text fields denoted as Barangay_Name and Purok_Name, respectively, to define their localized jurisdictions.
The administrative and auditing workflows are governed by systematic data-logging constraints connected directly to the user hierarchy. The Admin entity maintains a one-to-many relationship with the Event Logs table through a Views link, allowing a single administrator to oversee multiple transactional traces to enforce system integrity. The tracking attributes within the Event Logs entity consist of Event_Logs_Id, Event_Logs_DateTime, Event_Logs_Action, and Event_Logs_Message, ensuring that every background system action is thoroughly audited. Furthermore, the Admin entity holds a one-to-many relationship with the Hazard table via an Initializes connection, permitting administrative users to define and open multiple hazard events over time. The Hazard entity categorizes active disasters using the Hazard_Id primary key, alongside the descriptive and temporal markers Hazard_Name, Hazard_Started, and Hazard_Ended.
The operational reporting and verification pipeline bridges ground-level observations with administrative data structures through a multi-tiered validation workflow. Within user management operations, higher-tier Barangay accounts maintain a one-to-many relationship to Create lower-tier Purok accounts. Ground-level operators within the Purok entity populate data by building a one-to-many mapping to the Initial Report table via a Submits connection. This entrypoint log captures urgent field parameters using the Initial_Report_Id, Initial_Report_Date, Initial_Report_Time, and Initial_Report_Message. Once filed, the Barangay entity interacts with these field entries through a one-to-many relationship via a Receives connection, pulling incoming files into their console for localized review. Upon vetting a submission, the Barangay user updates the reporting status and Files a formal document, building a one-to-many relationship with the Incident Report table, which catalogs entries using the Incident_Report_Id, Incident_Report_Date, Incident_Report_Time, and Incident_Report_Message. To guarantee data authenticity, the Admin entity retains a one-to-many relationship that approves these pending incident reports before they are locked into the system ledger.
The final stage of the relational schema synthesizes qualitative incident tracking with extensive quantitative demographic tracking for export. Each verified Incident Report explicitly Includes a one-to-many relationship with the Affected Population dataset. This comprehensive table captures granular metrics using the Affected_Population_Id primary key, paired with specific structural indicators such as Affected_Barangay, Affected_EvacuationAreas, Affected_Total_Population, Affected_Individual_Number, Affected_Family_Number, Affected_Minor_Number, Affected_Senior_Number, Affected_PWD_Number, Affected_Casualties_Number, Affected_Lactating_Number, Affected_Pregnant_Number, Affected_Injured_Number, and Affected_AffectedAreas. Concurrently, the Admin entity executes the core reporting engine by mapping a one-to-many relationship that generates a finalized Situation Report, defined by Situation_Report_Id, Situation_Report_DateTime, and Situation_Report_Message. This summary log dynamically connects with the Affected Population dataset, compiling all historical incident data and localized regional metrics into an authoritative, exportable file for regional emergency management and public safety decision-makers.
### 3.3.3 Logic Models
3.3.3.1 Administrative and Analytics Logic
The system's administrative and analytics core focuses on data aggregation, trend monitoring, and system maintenance. The Generate Analytics Dashboard process transforms raw transactional, demographic, and incident data into actionable insights for high-level decision-makers.
RETRIEVE Incident Report Details from Incident Report DB
RETRIEVE Situation Report Details from Situation Report DB
RETRIEVE Affected Population Data from Affected Population DB
IF Incident and Demographic Data exist THEN
COMPUTE Monthly Reports Number
COMPUTE Monthly Affected Population
COMPUTE User Number By Role
DISPLAY Analytics Dashboard to Administrator and Barangay
ELSE
DISPLAY "No Operational Data Found" Message
ENDIF
EXIT
3.3.3.2 Account Registration and Management Logic
This module governs the onboarding lifecycle, security verification, and administrative profile management of users across the platform's multi-tiered hierarchy.
INPUT Account Registration Details (Username, Password, Name, Role-Specific Details)
IF Role EQUALS "Purok" THEN
ROUTE Registration Details to Respective Purok Registration List
VERIFY Status via Barangay Authorization
IF Approved BY Barangay THEN
CREATE Profile in Account DB and Purok Subtype Table
DISPLAY "Purok Account Registered Successfully"
ELSE
REJECT Registration Request
ENDIF
ELSEIF Role EQUALS "Barangay" THEN
ROUTE Registration Details to Barangay Registration List
VERIFY Status via Admin Authorization
IF Approved BY Administrator THEN
CREATE Profile in Account DB and Barangay Subtype Table
DISPLAY "Barangay Account Registered Successfully"
ELSE
REJECT Registration Request
ENDIF
ELSEIF Role EQUALS "Admin" AND Initiated BY Existing Administrator THEN
INPUT Administrator Staff Details
CREATE Profile in Account DB and Admin Subtype Table
DISPLAY "New Administrative Account Created"
ENDIF

IF Account Modification Request Received THEN
VERIFY Account_Id and Credentials
UPDATE Account Table with Modified Account Details
DISPLAY "Profile Parameters Updated Successfully"
ENDIF
EXIT
3.3.3.3 Log In Validation Logic
The authentication and session management gateway validates user access and dynamically enforces role-bound privileges based on the database user subtype structure.
INPUT Log In Credentials (Username, Password)
RETRIEVE User Accounts from User Account DB
IF Username AND Password MATCH User Accounts THEN
VERIFY User Role (Admin, Barangay, or Purok Subtype)
IF Role EQUALS "Admin" THEN
DISPLAY Administrative Console and System-Wide Dashboards
ELSEIF Role EQUALS "Barangay" THEN
DISPLAY Localized Barangay Analytics and Verification Boards
ELSEIF Role EQUALS "Purok" THEN
DISPLAY Initial Report Submission Interfaces
ENDIF
INITIALIZE Active User Session
ELSE
DISPLAY "Invalid Credentials. Access Denied."
ENDIF

IF Log Out Request Received THEN
TERMINATE Active User Session
CLEAR Temporary Operational State
REDIRECT to Authentication Screen
ENDIF
EXIT
3.3.3.4 Disaster Incident and Situation Report Management Logic
This core process controls the workflow of establishing hazard events, filing field data, executing administrative updates, and compiling official, exportable situation documents.
// Subprocess: Hazard Event Initialization
INPUT Incident Type and Details (Hazard_Name, Hazard_Started) BY Administrator
CREATE New Entry in Disaster Incident DB
DISPLAY "New Hazard Event Framework Successfully Initialized"

// Subprocess: Field Reporting and Modification
INPUT Incident Report Details BY Barangay
RETRIEVE Validated Hazard Framework from Disaster Incident DB
CREATE Field Incident Entry in Disaster Incident Reports DB
IF Administrator Requests Incident Report Modification THEN
ROUTE Modifications to Barangay
UPDATE Incident Entry in Disaster Incident Reports DB with Verified Corrections
ENDIF

// Subprocess: Formal Document Synthesis
RETRIEVE Incident Report Data from Disaster Incident Reports DB
INPUT Situation Report Details BY Administrator
IF Report Metrics and Summary Narrative are Complete THEN
COMPUTE Consolidated Demographic Totals
SYNTHESIZE Fields into Unified Summary Document
STORE Structured Entry in Situation Report DB
DISPLAY Finalized Situation Report to Administrator Console for Export
ELSE
DISPLAY "Compilation Error: Missing Required Impact Metrics"
ENDIF
EXIT
3.3.3.5 Event Logs and Management Logic
Operating continuously in the background, this module captures all user transactions and state changes to commit immutable, time-stamped tracking entries to the system audit trail.
WHEN Any System Action IS Executed BY Administrator, Barangay, or Purok
CAPTURE Account_Id, Current_DateTime, Action_Type, and Operational_Message
FORMAT Data Stream into Structured Event Log
STORE Event Log Entry in System Logs DB

IF Administrator Requests Audit Trail Review THEN
RETRIEVE Retrieved Log Records from System Logs DB
SORT Entries BY Current_DateTime DESCENDING
DISPLAY Filtered Audit Logs to Administrator Console
ENDIF
EXIT
## 3.4 Design
The design phase is focused on the planning of the logistics of Disaster Incident Report and Situation Report Generation. The design planning phase ensures that the system is aligned with the specific needs and addresses the challenges of the current process. It also ensures that the system flow is intuitive and accessible for ease of use.
### 3.4.1 Database Design

Figure 3.4.1 Barangay Disaster Situation Record Management and Situation Report Generation System Relational Data Model
Figure 3.4.1  illustrates the Relational Data Model of the Barangay Disaster Situation Record Management and Situation Report Generation System. This schema translates the conceptual Entity Relationship Diagram into a logical database layout by mapping table entities, data types, lengths, primary keys (PK), and foreign keys (FK). The system implements a specialization/generalization pattern by using a base Account table to maintain shared user details, which cascades into specialized tables (Admin, Barangay, Purok) linked through structural constraints to preserve referential integrity across multi-tiered authentication and operational reporting workflows.
The root of the database architecture resides in the Account table, which captures core personal profiles and structural access parameters. This table defines the fields Account_Id as an INT(6)acting as the Primary Key (PK), Account_Username as a VARCHAR(50), Account_Password as a VARCHAR(255) to accommodate secure cryptographic hashes, Account_Date_Created as a DATETIME object, and the remaining text metrics Account_Name, Account_Fname, Account_Mname, Account_Lname, Account_Email, and Account_Address as VARCHAR(255), along with Account_Phone configured as VARCHAR(11). Through a strict identity-sharing pattern, the three disjoint user sub-roles inherit from this base record. The Admin table contains Admin_Id as an INT(6) which serves concurrently as its Primary Key (PK) and a Foreign Key (FK) pointing directly back to the base Account table. The Barangay table is structured similarly with Barangay_Id as an INT(6) acting as both a Primary Key (PK) and a Foreign Key (FK), alongside a localized attribute Barangay_Name defined as VARCHAR(255). Lastly, the Purok table maps Purok_Id as an INT(6) as its combined Primary Key (PK) and Foreign Key (FK), paired with Purok_Name as a VARCHAR(255) to specify the reporting unit.
System accountability, security logging, and baseline hazard initializations are directly bound to these core user roles via relational dependencies. The Event Logs table tracks administrative operations and contains Event_Logs_Id as an INT(6) for its Primary Key (PK), Admin_Id as a VARCHAR(255) acting as a Foreign Key (FK) to record the actor, Event_Logs_DateTime mapped as DATETIME, Event_Logs_Action as VARCHAR(100), and Event_Logs_Message as VARCHAR(255). Parallel to this, structural hazard events are managed through the Hazard table, which uses Hazard_Id as a VARCHAR(6) Primary Key (PK), Hazard_Name as VARCHAR(255), Hazard_Started and Hazard_Ended as DATETIME elements, and incorporates Admin_Id as an INT(6) functioning as a Foreign Key (FK) to verify which administrator initiated the disaster tracker.
The field data pipeline captures initial community records and structures them into verified disaster summaries using sequential foreign key linkages. The ground-level reporting flow begins in the Initial Report table, which uses Initial_Report_Id as an INT(6) Primary Key (PK), Initial_Report_DateTime as a VARCHAR(255) string, and Initial_Report_Message as a VARCHAR(255) narrative. It binds operational context by including Purok_Id as an INT(6) Foreign Key (FK) to log the submitting unit, and Barangay_Id as an INT(6) Foreign Key (FK) to flag the target reviewing office. Once vetted, these are transformed into formal records within the Incident Report table, which establishes Incident_Report_Id as an INT(6) Primary Key (PK), Incident_Report_DateTime as VARCHAR(255), and Incident_Report_Message as VARCHAR(255). It connects directly to the system hierarchy by embedding Barangay_Id as an INT(6) Foreign Key (FK) to track the creator, Affected_Population_Id as an INT(6) Foreign Key (FK) to integrate impact statistics, and Admin_Id as an INT(6) Foreign Key (FK) to represent administrative confirmation.
The quantitative demographic impact records and final text summaries are systematically structured for dynamic report generation and export. The extensive quantitative metrics are isolated within the Affected Population table, utilizing Affected_Population_Id as an INT(6) Primary Key (PK) alongside the geographical descriptor Affected_Barangay as a VARCHAR(100) and Affected_EvacuationAreas as a VARCHAR(255). This table stores purely numerical data for statistical aggregates, declaring Affected_Total_Population, Affected_Individual_Number, Affected_Family_Number, Affected_Minor_Number, Affected_Senior_Number, Affected_PWD_Number, Affected_Casualties_Number, Affected_Lactating_Number, Affected_Pregnant_Number, and Affected_Injured_Number as INT(7) fields, capped with Affected_AffectedAreas as a VARCHAR(255) list. Finally, the centralized reporting endpoint is represented by the Situation Report table, which maps Situation_Report_Id as an INT(6) Primary Key (PK), Situation_Report_DateTime as a VARCHAR(255) string, and Situation_Report_Message as VARCHAR(255). It locks the entire workflow together by grouping three strict Foreign Keys (FK): Admin_Id as an INT(6) representing the generating authority, Incident_Report_Id as an INT(6) linking the verified disaster file, and Affected_Population_Id to allow the system engine to pull and format localized demographic counts into official public safety situation reports.
### 3.4.2 User Interface Design
Mobile App Interface
This interface will be the primary point of data entry and will be used by the reporters, report verifiers, and other organizational personnels.






















Figure 3.4.2.1 Mobile Application Log In Page























Figure 3.4.2.2 Mobile Application Dashboard Page




















Figure 3.4.2.3 Mobile Application Initial Report Page




















Figure 3.4.2.4 Mobile Application Situation Report Page



























Figure 3.4.2.5 Mobile Application Situation Report Catalog Page


















Figure 3.4.2.6 Mobile Application Situation Analytics Dashboard Page






Web Admin Interface
This interface will be primarily used by the organizations’ admins, who have the authority to view sensitive data, and have the capacity to generate web reports.














Figure 3.4.2.7 Web Application Admin Dashboard Page

















Figure 3.4.2.8 Web Application Admin User Management Page

























Figure 3.4.2.9 Web Application Admin Report Verification Page
























Figure 3.4.2.10 Web Application Admin Situation Report History Page






















Figure 3.4.2.11 Web Application Admin Situation Report Generation Page



















Figure 3.4.2.12 Web Application Admin Incident Report Page







### 3.4.3 Report Design

















Figure 3.4.2.13 Web Application Admin System Report Page
The figure represents the system report page where graphs and summarized data will be displayed. It will also allow the admin/s to filter data according to their need. The system will generate key reports on the disaster situation reports, types of disasters, and display figures relevant to a disaster situation. Moreover, the system report functionality will allow the admin/s to export these reports that they could utilize for decision making processes and evaluation of Disaster Risk Reduction Plans.
The user interface architecture of the Barangay Disaster Situation Record Management and Situation Report Generation System is engineered around the core principles of User-Centered Design. This mentioned structural framework prioritizes users as the primary principle in its design. It has high glanceability, operation efficiency under high-stress conditions, and explicit role-bound navigation. Given that the platform operates across a hybrid development environment by utilizing a web-based administration alongside decentralized mobile applications for iOS and Android, the UI layout explicitly adapts its density and control mechanics to fit the immediate physical environment of each user entity. Rather than relying on purely aesthetic visual elements, the design layout uses contrast boundaries, alignment frameworks, and clean modular cards. This clean, minimalist structure presentation minimizes cognitive load for operations interacting with the system during active incidents or documentation.
For high-level administrative tasks, the desktop web interface utilizes an information-dense, multi-column dashboard layout tailored for complex analytical tracking and document compilation. This interface displays data-heavy components, including tabular analytics grids, verification panes, and automated report compilers, into a single cohesive view. It presents a clear data hierarchy, allowing the Administrator to rapidly pivot between live incident report lines, demographic metric overrides, and system-wide event logs without losing operational context. In contrast, the mobile interface layout for field teams reorients the presentation layer toward a single column, touch optimized workflow. Because field operations are mobile and frequently disrupted, the mobile interfaces utilize large, distinct container blocks, explicit form fields, and stick status indicators. This ensures that ground level personnel can input urgent qualitative initial records or update extensive numerical affected population metrics with speed and minimal input errors.
To bridge these distinct user experiences into a cohesive platform ecosystem, the entire user interface follows a predictable, task-oriented behavioral flow. Each distinct screen begins with a uniform, secure log in validation that evaluates credentials and dynamically configures the interface elements based on the authenticated user subtype database constraint. Once authenticated, users are immediately routed to a specialized workplace that strips away irrelevant operational tools, leaving only features required for their designated roles. By emphasizing structural predictability, maintaining absolute cross-platform behavioral consistency, and designing layouts tailored to specific conditions, the user interface functions as an efficient, user-centered data pipeline. It seamlessly translates raw, localized ground observations into verified, situation report
### 3.4.4 Integrity Controls
To ensure data accuracy, completeness, and reliability in the Barangay Disaster Situation Record Management and Situation Report Generation System, several integrity checks and rules will be implemented integrated into the user interface, application logic, and database. These mechanisms aim to prevent invalid, incomplete, and inconsistent data entry, storage, and output, which will ensure the trustworthiness of the information throughout system operation.
Input Integrity Controls
Input integrity controls will ensure all data entering into the system are valid, accurate, and complete before being processed and stored. The proposed system will use a multi-layered validation based from React’s built-in state management to manage data integrity across all modules like User Management and Initial Disaster Reporting. Required field validation will ensure that important inputs will not be left blank. Format and range checks will verify that entries like email addresses, dates, and numeric values follow proper formatting. In addition, duplication checks will be enforced to prevent repeated records, while confirmation prompts and error messages will guide the users in entering correct information. These validations will maintain data consistency and reliability across all CRUD operations in the system. These checks will happen in the front-end and back-end to ensure the system will not just accept data even though it is invalid, inconsistent (format), and incomplete.
Furthermore, in the Disaster Report Verification Module and Disaster Situation Reporting Module, stricter controls will be applied to minimize human errors. These modules will implement high-fidelity integrity checks to ensure critical data is precise and actionable by using APIs. This approach will ensure that the reports are valid, complete, authentic, and accurate.
Database Integrity Controls
Database integrity will be maintained by using MySQL, where data will be stored. Rules and features will be used to keep the data clean and reliable, like primary keys, foreign keys, and default values. Each record in the database will have a primary key to ensure it can be identified properly. In addition, foreign keys will connect related tables, which will help in maintaining appropriate operations in the system. Moreover, the system will also utilize default values for certain fields like setting a report’s status to “Unverified” until it is verified. Overall, these controls will help keep the database structured, reliable, and accurate, preventing issues like duplicates, missing and mismatched data, and missing records.
Output Integrity Controls
Output integrity will ensure that all information generated and displayed by the system, and all data that goes out of the system (e.g., reports exported as PDF) will be accurate, complete, reliable, and valid. All system outputs, especially those from Disaster Situation Reporting Module, are retrieved directly from a live database using the appropriate database queries. Through this, any updates are immediately reflected in the system. Filtering, searching, and sorting features in the system will be validated to prevent incorrect data views or display of unauthorized and manipulated results. Access to the outputs, especially the initial and completed reports, will be strictly controlled and will only be given to those who have the authority to view the sensitive and confidential data.
### 3.4.5 Security Controls
Security controls and measures are critical to the system as it will be handling sensitive and confidential information. This will also help in protecting the privacy of the people (e.g., victims, responders, etc) in the report, protecting the system from unauthorized access, data breaches, manipulation of data, potential data loss, and other attacks from malicious actors that may harm the system’s security and integrity. With this, the system will implement a multi-layered security mechanism to safeguard not just the users but also their credentials and the sensitive data. The following key security controls will be implemented to secure the system:
User Authentication: Each user must log in using a unique username and password. Passwords will be stored in encrypted form using hashing algorithms and encryption methods.
Role-Based Access Control (RBAC): Using React’s Context API and backend middleware, the system will enforce the “least privilege" principle. Users will only access the specific data and modules necessary for their roles and operational tasks, preventing unauthorized exposure of sensitive data (e.g., victim identities).
Database Encryption: On the server side, sensitive personally identifiable information (PII) such as victim names, address, and other sensitive details will be encrypted at the field level before being stored.
Secure Data Transmission: The system will use a secure protocol (HTTPS) to ensure all communication between users and the server is encrypted.
Sanitized Data Binding: Attacks like Cross-Site Scripting (XSS) will be prevented by using React’s behavior of escaping string variables to protect the system. A library like “DOMPurify” (for “dangerouslySetInnerHTML” property) will be utilized to prevent any malicious actors from injecting malicious scripts into the system.
Parameterized Queries: When it comes to SQL injection attacks, the backend will exclusively use Object-Relational Mapping (ORM) or prepared statements to prevent this kind of attack. This will ensure that user-provided data cannot be executed as database commands.
CSRF Protection: For the web system, especially the admin panel, Anti-Cross-Site Request Forgery (CSRF) tokens will be implemented to ensure that state-changing actions like deleting or verifying a report are intentional and authorized.
Immutability of Logs: Every critical action in the system like verification, modification of report, or admin login will be recorded in a read-only audit log. This will provide accountability, transparency, and will help in security breach forensic analysis should such an incident occur.
Automatic Session Termination: To prevent unauthorized access via unattended devices, the system will implement automatic session timeouts for both the mobile app and the web dashboard.
## 3.5 Development
The system will be implemented using web and app technologies, particularly the React for web and React Native (Expo) for the mobile application. For the database, MySQL will be used as the storage for the data. The developer will follow the Agile Software Development Life Cycle (SDLC) as it would work well with the proposed system and allows developers to simultaneously play roles during the analysis, design, development, and testing of the system. Agile will help the team to break down complex tasks into smaller, manageable tasks, which then would allow each member to effectively perform each of the tasks efficiently. Furthermore, Agile will help the team to adapt to the changes throughout the SDLC and stay consistent and organized.
## 3.6 Testing
This section presents the Alpha and Beta Testing phases, which aims to evaluate the functionality, reliability, usability, and overall readiness of the system. These phases will ensure correctness and the product’s quality before release.
### 3.6.1 Alpha Testing
Under Alpha Testing, the proponents will conduct unit, integration, system, and security testing. For unit testing, the developers will ensure that individual components, functions, and isolated modules of the source code operate correctly and yield the expected outputs before integration. To achieve high code coverage, structural precision, and efficiency during this Alpha Testing phase, automated testing tools will be systematically utilized during the unit and integration testing phases. Specifically, the development team will employ Jest to automate unit and component tests for the mobile application framework, which is built using React Native, specifically Expo. Simultaneously, Cypress will be implemented as the primary automation tool to test the web-based administrative interface, facilitating reliable testing for the React.js web admin panel of the system.
Moreover, utilizing these automated testing frameworks can help the proponents in rapidly identifying and detecting syntax errors, logical errors, and edge-case exceptions within individual units of code. Subsequently, through these frameworks, integration testing will then be conducted to validate data communication and structural interfaces between the combined software modules. Also, system testing will be executed to evaluate the end-to-end functionality of the fully integrated system against the established technical specifications. Finally, since the system must be heavily secured as it will process confidential data, security testing will be performed to identify system vulnerabilities, safeguard data transmissions within the system, and mitigate potential security risks like unauthorized access prior to the external deployment of the system.  The following presents sample criteria for the automated unit and integration testing:
Unit Testing

Integration Testing


Furthermore, the alpha testers will create test cases to ensure that each testing phase is well-documented and the alpha testers will be guided throughout the process. These test cases will include the manual test cases, which aims to allow for evaluation and testing using human intuition, that machines or automation might miss. Moreover, manual testing will allow the developers to discover unforeseen functional issues or complex edge-case exceptions that the scripts might not cover. As much as possible, the alpha testers will use Jira as a tool to document the errors encountered or functionalities that need fixes, which will aid in the process of resolving those errors, giving the developers a way to track changes, fixes, and the unfixed errors.

### 3.6.2 Beta Testing
Under Beta Testing, the proponents will invite target users to conduct acceptance and usability testing. Beta Testing will be conducted after the completion of Alpha Testing and will involve a selected end-users who will operate and utilize the system in a real-world environment. To ensure a systematic evaluation, this external testing phase is governed by clear entry and exit criteria. The entry criteria dictate that beta testing will only commence once all "Critical" and "Major" defects identified during automated Alpha testing (via Jest and Cypress) are completely resolved. Conversely, the exit criteria require that the system encounters zero unhandled application crashes or data synchronization failures between the Expo mobile app and the React.js web admin panel during independent user operations.
To measure user acceptance objectively, the proponents will deploy the standardized System Usability Scale (SUS) as the primary data collection instrument following the evaluation period. This will allow the team to mathematically and systematically compute a global usability score based on a 10-item Likert scale questionnaire, with a target success threshold set at a minimum average score of 68, which is the industry-standard benchmark for an acceptable system (Sauro, 2011). Additionally, open-ended questions will also be included to allow testers to openly express their perception of the application. Any non-blocking functional feedback gathered during this asynchronous testing phase will be logged, prioritized, and addressed in final code iterations to ensure the platform satisfies user expectations prior to deployment. The following is a sample of Likert-scale questionnaire based on SUS:



## 3.7 Calendar of Activities

Figure 3.7 Gantt Chart for the Activities and Phases
This figure outlines the calendar of activities for implementing the proposed system from system proposal writing to final defense and presentation. It starts with a proposal paper and getting adviser approval, then moves to the writing and submission of the proposal. A proposal defense will take place before or during the midterm. When the proposal is accepted, the team will then move on to the development and testing stages of the proposed system, where each unit of the system will be simultaneously built and tested to ensure quality and that errors will be detected early on. Lastly, the project ends with the final defense and fixing and finalization of the capstone paper.



















## REFERENCES
Abello, J. E. (2017). Meteorological disaster risk profile of the Philippines. Emergency and Disaster Reports, 4(2), 9–55. https://reunido.uniovi.es/index.php/edr/issue/view/1267/222
Agapito, J. V. C., Rosales, R. M. L., Pascual, A. C., Concepcion, C. R., & Lagmay, A. M. F. A. (2025). Counterfactual evidence on the impacts of operations research on Philippine disaster risk reduction efforts. Disaster Prevention and Management an International Journal, 35(6), 44–63. https://doi.org/10.1108/dpm-04-2025-0127
Alvarez, F., Gardner-Stephen, P., & Hollick, M. (2018). Maintaining both availability and integrity of communications: Challenges and guidelines for data security and privacy during disasters and crises. arXiv (Cornell University). https://doi.org/10.48550/arxiv.1808.04683
Aminoltaheri, N., Mejri, O., Menoni, S., & Matias, K. (2017). Crisis information to support spatial planning in post disaster recovery. International Journal of Disaster Risk Reduction, 22, 46–61. https://doi.org/10.1016/j.ijdrr.2017.02.007
Calanog, K. R. L., Rey, W. P., Adalin, S. a. S., & Jimenez, G. W. R. (2024). Mamamayan: a mobile community-based emergency reporting and notification system for the city of Makati in the Philippines. 5th International Conference on Software Engineering and Development, 35–41. https://doi.org/10.1145/3637792.3637799
Congress of the Philippines. (2010). Republic Act No. 10121. Official Gazzette Philippines. https://www.officialgazette.gov.ph/2010/05/27/republic-act-no-10121/
Dix, M., Wilkins, A., Pennaz, A., Smith, A., Vawter, J., Karlson, D., Tokar, S., & Brooks, E. (2021). Challenges and opportunities for Sendai framework disaster loss reporting in the United States. Progress in Disaster Science, 10, 100167. https://doi.org/10.1016/j.pdisas.2021.100167
Eastern Visayas State University. (2025, January 3). Bandilyo App: A Disaster Risk Reduction Monitoring and Incident Reporting System with Geolocation and SMS Technology | Eastern Visayas State University. https://www.evsu.edu.ph/university-research-and-created-works/bandilyo-app-a-disaster-risk-reduction-monitoring-and-incident-reporting-system-with-geolocation-and-sms-technology/
Fang, C., & Rahman, A. (2019). Appraisal of gaps and challenges in SENDAI Framework for Disaster Risk Reduction Priority 1 through the lens of Science, Technology and Innovation. Progress in Disaster Science, 1, 100006. https://doi.org/10.1016/j.pdisas.2019.100006
Ha, H., Li, T., Xie, N., Zeng, C., Zhou, W., Zheng, L., Jiang, Y., Yang, Y., Xue, W., Huang, Y., Chen, S., Navlakha, J., & Iyengar, S. S. (2017). Data-Driven Techniques in Disaster Information Management. ACM Computing Surveys, 50(1), 1–45. https://doi.org/10.1145/3017678
Office of the City Disaster Risk Deduction Management | Zamboanga website. (n.d.). https://zamboangacity.gov.ph/office-of-the-city-disaster-risk-deduction-management/
Montefalcon, M. D., Padilla, J. R., Ibanez, M., Sapinit, R., Reyes, L. L., Rodriguez, R. L., & Serrano, E. (2021). IRESPONDPH: a mobile and web-based application for post disaster needs assessment and response in the Philippines. 5th International Conference on E-Society, E-Education and E-Technology, 54–61. https://doi.org/10.1145/3485768.3485784
Philippine Disaster Response Management Bureau. (2026). Advanced gathering for assistance preparedness for protection. Disaster Response Management. https://drm.dswd.gov.ph/others/
Rey, W. P. (2024). E-Ligtas in focus: A PACMAD-Based Usability Evaluation of Emergency Reporting in the Philippines. Proceedings of the 2024 the 6th World Symposium on Software Engineering (WSSE), 121–128. https://doi.org/10.1145/3698062.3698078
Stauffacher, D. (2011, October 17). Strengthening crisis information management. United Nations. https://www.un.org/en/chronicle/article/strengthening-crisis-information-management
Toyado, D. (2020). Disaster preparedness of local government units communication systems in Catanduanes, Philippines. Journal of Communication Engineering and Its Innovations, 6, 33–38. https://doi.org/10.46610/JOCEI.2020.v06i02.004
United Nations Office for Disaster Risk Reduction. (2015). Sendai Framework for Disaster Risk Reduction 2015–2030. https://www.undrr.org/publication/sendai-framework-disaster-risk-reduction-2015-2030
United Nations Office for the Coordination of Humanitarian Affairs. (2024, May 4). UNDAC Handbook, 8th Edition. OCHA. https://www.unocha.org/publications/report/world/undac-handbook-8th-edition


