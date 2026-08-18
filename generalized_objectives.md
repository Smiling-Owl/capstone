# 1.3 Objectives

## General Objective

The general objective of this study is to design, develop, and evaluate a centralized, role-based, responsive Online Disaster Situation Report Generation and Record Management System as a startup-operated service for participating disaster risk reduction and management (DRRM) organizations. The system is intended to support structured local incident reporting, human verification, SitRep preparation, and records management for floods, typhoons, and fires while keeping each organization's users, jurisdictions, workflows, and records separate.

## Specific Objectives

Specifically, the study aims to:

1. Develop a **User and Organization Management Module** that allows the startup to onboard and configure participating DRRM organizations and enables each organization to manage its own authorized users, jurisdiction hierarchy, and role-based permissions. The module will separate platform administration from the authority to verify incidents, approve reports, or disclose organizational records and will prevent users from accessing another organization's data.

2. Develop a **Disaster Reporting Module** that enables authorized local reporters to create and update structured initial and detailed reports containing the incident type, location, date and time, source, affected population, casualties, damage, immediate needs, actions taken, and information that is unknown or awaiting verification. The module will apply required-field, format, range, consistency, and possible-duplicate checks without treating automated validation as proof that a reported incident is factual.

3. Develop a **Disaster Report Verification Module** that allows authorized reviewers and verifiers to examine submitted reports, return them for correction, validate them, or reject them with a recorded reason. The module will preserve report status, source, organization, jurisdiction, responsible actor, timestamp, and prior versions so that material corrections remain traceable and are not silently overwritten.

4. Develop a **SitRep Generation Module** that consolidates eligible validated records within an authorized organization's jurisdiction and maps the data to the applicable categories of the 2024 NDRRM Operations Center Situation Report, including the prevailing situation, preparedness measures, response actions, consolidated effects, issues and concerns, and recommendations where applicable. The generated SitRep will remain subject to review and approval by the responsible organization and will not be represented as an official national NDRRMC issuance merely because it was produced by the system.

5. Develop a **SitRep Catalog Module** that stores local SitReps chronologically and allows authorized users to view, search, filter, export, and amend them while preserving earlier approved versions, source relationships, retention information, and an audit history. Organization-owned records must remain exportable in a documented and usable form if the service relationship ends, subject to applicable retention, archival, and lawful-disposition requirements.

6. Develop a **Dashboard Module** that presents organization-scoped summaries of disaster incidents, affected populations, report status, SitReps, and processing activity using records available to the authenticated user. Dashboard figures will be traceable to the underlying records and will support monitoring rather than forecasting hazards, dispatching emergency resources, or making automated government decisions.

7. Evaluate the developed modules through functional, integration, security, accessibility, recovery, and role-based user testing under declared devices, browsers, network conditions, datasets, and reporting scenarios. Evaluation will examine whether the modules perform their specified tasks, maintain organization and role boundaries, produce correct aggregations, preserve traceability, and support usable task completion. Results will be limited to the tested prototype, participants, settings, and duration and will not be treated as proof of nationwide adoption, production availability, or improved disaster outcomes.

The objectives do not include a native mobile application, offline synchronization, SMS or radio integration, predictive analytics, automated public warnings, emergency dispatch, or live integration with national government systems. The responsive web application depends on electricity, internet connectivity, compatible devices, and continued human verification and approval.
