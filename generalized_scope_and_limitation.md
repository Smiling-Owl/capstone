# 1.4 Scope and Limitations

This study covers the design, development, and prototype evaluation of a startup-operated, centralized, role-based, responsive web system for disaster incident records and local Situation Report (SitRep) preparation. The startup provides the shared technical service, while every participating disaster risk reduction and management (DRRM) organization retains authority over its jurisdiction, users, workflow, records, validation decisions, disclosures, and official submissions. The prototype is bounded to functions that can be implemented and evaluated within the five-month development period; broader institutional adoption and production operation remain outside the study.

## 1.4.1 Scope of the Study

### Participating Organizations, Users, and Hazards

The system supports configurable accounts for participating provincial, city, municipal, barangay, or other authorized DRRM organizations without making one office, including ZCDRRMO, the permanent owner or administrator of the platform. Each organization can define its jurisdiction hierarchy and assign authorized organization administrators, reporters, reviewers, verifiers, approvers, and viewers. Platform personnel may provision organizations, maintain the service, and provide authorized technical support but may not validate incidents or approve official local reports. The prototype covers reporting for floods, typhoons, and fires; other hazards require later requirements analysis, data mapping, and validation.

### Structured Reporting and Progressive Record Lifecycle

The system captures initial and detailed incident information, including source, organization, jurisdiction, location, incident and submission times, affected population, casualties, damage, needs, actions taken, attachments where authorized, and explicit unknown or not-yet-verified values. It supports preliminary submission, review, return for correction, validation, rejection, consolidation, amendment, and archival. Material changes preserve prior versions, actors, timestamps, reasons, verification status, and source relationships so that urgent early observations remain distinguishable from later verified information. Automated format, range, consistency, and duplicate checks assist users but do not replace factual verification by authorized personnel (NDRRMC, 2024; Jayawardene et al., 2021).

### Local SitRep Preparation and Records Management

The system consolidates eligible validated records only within the authorized organization and jurisdiction and maps them to applicable NDRRM Operations Center SitRep categories. It generates a reviewable local SitRep and preserves links from consolidated values to their source records and versions. Generated documents, approvals, amendments, searchable historical records, retention classifications, legal or archival holds, and authorized exports are maintained as part of the record lifecycle. The application supports local preparation and recordkeeping; it does not independently confer official NDRRMC status on an output or replace the approval, transmittal, custody, retention, and disposition authority of the responsible public office (Republic Act No. 9470, 2007; NDRRMC, 2024).

### Multi-Organization Service Administration and Isolation

The startup operates one common application codebase with organization onboarding, activation, suspension, configuration, export, and offboarding functions. Organization and jurisdiction context must constrain every server-side authorization decision, record query, dashboard, search, file, cache, approval, audit event, and export. Customer configurations, approval routes, templates, and data definitions are versioned when necessary to keep historical reports reproducible. Support access to customer data is exceptional, organization-authorized, purpose- and time-limited, logged, and revoked after the support task. Offboarding includes a documented, usable export of organization-owned records, metadata, versions, and authorized attachments while respecting retention, legal-hold, archival, and lawful-disposition requirements (Republic Act No. 10173, 2012; Republic Act No. 9470, 2007; OWASP Foundation, n.d.).

### Responsive Access, Security, and Service Recovery

The system is delivered through supported desktop, tablet, and smartphone browsers and targets WCAG 2.2 Level AA for the complete in-scope workflows. Its controls include authenticated access, deny-by-default role and object authorization, protected sessions, transport security, audit logging, backups, restoration procedures, and tested organization isolation. Recovery-time and recovery-point objectives are defined before testing, and restoration is checked for record integrity, attachments, permissions, and organization boundaries. These are prototype controls and evaluation targets, not claims of certification, absolute security, or production-grade availability (W3C, 2023; National Institute of Standards and Technology, 2024).

### Evaluation Boundary

The prototype is evaluated through functional, integration, security, accessibility, recovery, and role-based user tests using declared organizations, tasks, datasets, devices, browsers, network conditions, workflow versions, and report templates. Measures include task success and time, errors, first-pass acceptance, data completeness and validity, permitted workflow transitions, verification turnaround, SitRep mapping and aggregation accuracy, provenance traceability, retrieval success, dashboard accuracy, cross-organization access denial, export completeness, restoration results, and the System Usability Scale. When feasible, equivalent scenarios compare the existing reporting process with the proposed process. Results are limited to the tested participants, settings, workload, and duration and will not be generalized as nationwide performance (ISO, 2008, 2023; Brooke, 1996).

## 1.4.2 Limitations and Delimitations

### Connected Web Operation

The prototype does not include a native mobile application, offline synchronization, SMS fallback, radio integration, or custom telecommunications hardware. Responsive access still depends on a compatible device, electricity, internet connectivity, hosting availability, and functioning telecommunications. Interrupted requests may be handled safely where implemented, but the system cannot guarantee submission during a prolonged outage. Participating organizations must retain telephone, radio, paper, face-to-face, or other approved contingency procedures and reconcile records entered through those procedures after connectivity returns (Republic Act No. 12254, 2025).

### Human Authority and Information Reliability

The system does not autonomously establish that an incident is true, resolve disputed observations, approve a SitRep, declare a state of calamity, allocate resources, authorize spending, issue evacuation orders, or make other statutory decisions. It may flag incomplete, invalid, inconsistent, or potentially duplicate entries, but authorized personnel remain responsible for verification, corrections, approval, and disclosure. Source data may still be late, inaccurate, biased, incomplete, duplicated, or deliberately false; structured fields and centralization improve organization and traceability but cannot guarantee accuracy or sound decisions.

### No Forecasting, Dispatch, or Public-Warning System

The study excludes predictive artificial intelligence, meteorological forecasting, long-term climate modelling, sensor or Internet-of-Things networks, emergency dispatch, rescue-resource optimization, automated public alerts, and direct control of sirens or warning channels. Maps and dashboards, where implemented, visualize user-submitted and validated records rather than predict hazard behavior. The system is an internal reporting and records service, not a replacement for PAGASA, PHIVOLCS, NDRRMC, emergency hotlines, dispatch platforms, or authorized public-information channels.

### No Implemented National Integration or Automatic Interoperability

The prototype does not claim a live connection to NDRRMC, OCD, DILG, DSWD, PAGASA, PHIVOLCS, GeoRiskPH, or another external government system. Stable identifiers, structured schemas, versioned data definitions, and documented exports may prepare the platform for future exchange, but they do not establish technical, semantic, organizational, or legal interoperability. Any future API, electronic-signature, or inter-agency exchange requires the receiving agency's specifications, authorization, security review, testing, and agreement on authoritative data and correction procedures (Republic Act No. 8792, 2000; Republic Act No. 12254, 2025).

### Privacy, Records, and Disclosure Constraints

Disaster records may contain personal, sensitive personal, operational, or security-sensitive information. Collection and access are limited to a documented lawful purpose and the minimum necessary data. The prototype can implement safeguards, retention attributes, access logs, and export controls, but legal compliance also depends on each organization's policies, lawful basis, Privacy Impact Assessment, trained personnel, breach response, records schedule, contracts, and actual operation. Hosting does not transfer government-record ownership to the startup, and offboarding does not permit automatic deletion of public records. Operational access, inter-organization sharing, public disclosure, archival use, and research reuse are separate decisions requiring appropriate authority and safeguards (Republic Act No. 10173, 2012; National Privacy Commission, 2016; Republic Act No. 9470, 2007).

### Prototype, Adoption, and Commercial Limits

The study does not establish continuous production availability, resistance to every attack, national scalability, long-term retention, sustained adoption, commercial viability, procurement eligibility, return on investment, or service performance during an actual major disaster. A shared platform also introduces dependence on the startup's hosting, personnel, security, support, financial continuity, and subprocessors. Production use would require funded service ownership, contracts and service levels, risk and privacy assessment, security testing, incident and continuity plans, tested backups and exports, training and drills, customer support, procurement compliance, and an orderly provider-exit process (Republic Act No. 12009, 2024; World Bank, 2021).

### Limits of Outcome Attribution and Generalization

The evaluation can determine whether the implemented software performs specified reporting, consolidation, retrieval, access-control, accessibility, and recovery tasks under declared test conditions. It cannot by itself prove reduced casualties, faster rescue, equitable relief distribution, release of emergency funds, improved policy decisions, or compliance by participating organizations. Those outcomes also depend on source-data quality, staffing, training, trust, communications, logistics, institutional authority, and actual use. Results from a convenience sample or one pilot organization are not representative of all Philippine DRRM offices; benefits and burdens must be reported by organization, role, hazard scenario, device, and connectivity condition where the sample permits.
