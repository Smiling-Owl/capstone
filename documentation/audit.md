# Revision Audit Trail

## Purpose and Basis

This audit records the revision of the `generalized_*` Chapter I drafts following the completed startup direction in `generalized_project_context.md`. The controlling change is that the proposed system is no longer framed as a system owned and administered exclusively by ZCDRRMO. It is a startup-operated platform that may serve multiple participating DRRM organizations, while each organization retains its public authority, jurisdiction, users, records, verification workflow, approvals, disclosures, and official submissions.

Research was conducted in three independent evidence groups: institutional authority and electronic disaster records; startup service governance, privacy, security, and continuity; and information quality, inclusion, and measurable evaluation. The detailed results are stored in `startup_drrm_section_research/results/`, and their consolidated summary is in `startup_drrm_section_research/report.md`. All three JSON results parsed successfully and contain every field defined in `fields.yaml`; none retained an uncertain field.

## Second-Pass Deepening (2026-08-19)

Following review, a second research pass was conducted because the first revision was accurate but compressed several distinct issues into broad statements. Preliminary research expanded the framework into six independent objects: DRRM SitRep workflow and Incident Command System alignment; privacy, public records, electronic evidence, and disclosure; multi-tenant security and service continuity; connectivity, accessibility, inclusion, and degraded operation; information quality and prototype evaluation; and public-sector adoption, procurement, and startup viability. The complete structured results are stored in `startup_drrm_section_research/results_v2/`.

The second-pass schema required each researcher to address 15 fields covering primary evidence, legal or evidentiary status, evidence limits, objective revisions, scope, limitations, stakeholder causal chains, safe and unsafe claims, responsibility allocation, report lineage and lifecycle, module-specific requirements, risks and residual limits, test metrics and conditions, adoption and cost dependencies, and generalization. All six JSON files parsed successfully, contain every required field, and contain no uncertain values. The prescribed Python validator could not run because the available Windows `python.exe` is an inaccessible Store alias and the validator expects a different YAML schema; equivalent PowerShell parsing and field-coverage checks were used.

This pass expanded the revised sections without restoring the earlier requirements-specification style. The objectives remain organized by the paper's six submodules, but now identify the report states, data lineage, conflict handling, generated-report contents, catalog governance, dashboard interpretation, and test evidence expected from each. Scope and limitations now explain connected degraded operation, later reconciliation of alternate-channel reports, accessibility evidence, controlled vocabularies, disclosure tiers, external-integration boundaries, and preliminary startup feasibility. Significance now traces each claimed benefit through an immediate system output, organizational use, dependency, possible harm, and evidence needed before the benefit can be asserted.

## File-by-File Revisions

### `generalized_project_context.md`

- Status: retained as the controlling, completed project context.
- No textual revision was made in this pass because the file already establishes the multi-organization startup model, separates customer authority from provider responsibilities, and states the connected-web, privacy, records, and interoperability boundaries used by the other sections.

### `generalized_objectives.md`

- Replaced nine requirements-heavy objectives with the paper's intended module-based specific objectives.
- Revised the general objective to identify a startup-operated service for participating DRRM organizations rather than a ZCDRRMO-exclusive system.
- Defined objectives for the User and Organization Management, Disaster Reporting, Disaster Report Verification, SitRep Generation, SitRep Catalog, and Dashboard modules.
- Added one evaluation objective covering the developed modules under declared prototype conditions.
- Preserved essential startup requirements—organization separation, platform/customer authority boundaries, export, and responsive access—inside the relevant module objectives instead of treating them as separate products.
- Removed detailed formulas, standard-by-standard test instructions, universal pass thresholds, and procurement-readiness deliverables from Chapter I objectives. Those details belong in requirements, methodology, or test plans.
- Removed unsupported or out-of-scope functionality, including offline-first operation, SMS fallback, GIS heatmaps, predictive analytics, automated warnings, and live national-system integration.
- Clarified that generated SitReps remain subject to human review and organizational approval and are not automatically official NDRRMC issuances.
- Second pass: added stable identifiers, distinct occurrence/observation/submission times, explicit zero/unknown/not-applicable values, interruption states, duplicate and conflict handling, append-only material history, cut-off snapshots, operational periods, controlled catalogs, provisional-versus-verified dashboards, and concrete evaluation measures.

### `generalized_scope_and_limitation.md`

- Recast the scope in the prose format used by the full paper while adding the startup and multi-organization model.
- Organized the scope around the six named modules used in the objectives.
- Replaced ZCDRRMO-only roles with configurable organization administrators, reporters, reviewers, verifiers, approvers, and viewers; ZCDRRMO may still be a pilot or participating organization.
- Added organization-scoped authorization, limited startup support access, report provenance, version preservation, customer export, backups, and restoration.
- Kept the hazard boundary to floods, typhoons, and fires.
- Confirmed that the deliverable is a responsive web application, not a native mobile app, and depends on power, connectivity, devices, and hosting.
- Stated the continued need for radio, telephone, paper, face-to-face, or other approved contingency procedures during outages.
- Explicitly excluded autonomous verification, declarations, resource allocation, dispatch, forecasting, public warnings, predictive AI, sensor networks, and live government-system integration.
- Added privacy, public-record custody, procurement, provider-dependence, production-readiness, and outcome-attribution limits.
- Second pass: explained the workflow from draft through verification, inclusion, correction, supersession, archival, and disposition; added controlled-reference versioning, field-level disclosure concerns, accessible end-to-end task testing, degraded connected operation, alternate-channel reconciliation, Incident Command System boundaries, Common Alerting Protocol limits, lifecycle costing, and the distinction between usability, adoption, willingness to pay, and procurement readiness.

### `generalized_significance.md`

- Rewrote the section around the stakeholder style of the full paper: local reporters, barangay personnel, participating DRRM organizations, the startup, affected communities, records/privacy/system personnel, and future researchers.
- Replaced claims of guaranteed real-time reporting, eliminated delays, automatic accuracy, rapid resource deployment, and improved disaster outcomes with conditional, testable contributions.
- Explained the mechanism of benefit for each stakeholder: structured capture, status and correction traceability, consolidation, retrieval, shared maintenance, records accountability, and reusable research evidence.
- Added the possible costs and harms of the startup model, including provider dependence, cross-organization exposure, inappropriate support access, exclusion through connectivity or accessibility barriers, and misuse of sensitive information.
- Clarified that economic significance is a hypothesis requiring full lifecycle cost evidence, not an established return on investment.
- Added a responsibility boundary between each customer's public functions and the startup's contracted technical functions.
- Limited generalization to the tested prototype, users, organizations, scenarios, devices, and period.
- Second pass: expanded the stakeholder analysis to incident managers, users with disabilities or constrained connectivity, procurement personnel, startup founders, and potential partners. Each benefit now identifies its mechanism, dependencies, counter-risk, and required evidence; economic and commercial significance is graded from early workflow-fit evidence through paid and retained demand rather than inferred from positive user feedback.

### `startup_drrm_section_research/outline.yaml`

- Corrected the results directory from a machine-specific `E:/capstone/...` path to the repository-relative `startup_drrm_section_research/results` path.

### Research artifacts

- Refreshed three structured deep-research JSON files in `startup_drrm_section_research/results/`.
- Added `startup_drrm_section_research/generate_report.py`, a standard-library report generator supporting flat and nested JSON, uncertain-value filtering, complex values, and extra fields.
- Added `startup_drrm_section_research/report.md` as the consolidated research report. The generator could not be executed because the available `python.exe` is an inaccessible Windows Store alias; the report was therefore produced directly from the validated JSON results.
- Replaced the three-item outline and nine-field schema with a six-item, 15-field second-pass framework and routed its results to `startup_drrm_section_research/results_v2/` so the earlier evidence remains auditable.

## Principal Evidence Applied

- Republic Act No. 10121: local DRRM institutions, jurisdictions, information consolidation, monitoring, coordination, and operations-center responsibilities.
- 2024 NDRRM Operations Center SOPG: progressive report lifecycle and applicable SitRep categories.
- Republic Act No. 8792: electronic documents and signatures, subject to reliable methods and agency procedure.
- Republic Act No. 9470: public-record custody, retention schedules, preservation, and authorized disposition.
- Republic Act No. 10173 and its IRR: lawful and proportionate processing, safeguards, accountability, and outsourced-processing responsibilities.
- Republic Act No. 12009: public procurement context; no assumption that prototype completion establishes procurement eligibility.
- Republic Act No. 12254: accessible, secure, interoperable, continuity-aware e-governance and potential collaboration with private entities and startups.
- ISO/IEC 25010:2023, ISO/IEC 25012:2008, WCAG 2.2, and the System Usability Scale: bounded evaluation references, not certifications or proof of disaster outcomes.
- Primary academic studies on disaster-information quality, situational awareness, verification, volunteered geographic-information bias, and scenario-based evaluation.

## Consistency Decisions

- Preferred term: **Online Disaster Situation Report Generation and Record Management System**.
- Service model: startup-operated, configurable, multi-organization platform.
- Customer authority: participating DRRM organization controls operational and public decisions.
- Original setting: ZCDRRMO may remain a potential pilot or study setting but is not the platform's exclusive owner or universal administrator.
- Included hazards: floods, typhoons, and fires.
- Included delivery channel: responsive connected web application.
- Included modules: User and Organization Management, Disaster Reporting, Disaster Report Verification, SitRep Generation, SitRep Catalog, and Dashboard.
- Evaluation claims: limited to implemented functions and declared prototype test conditions.

## Items Requiring Later Paper-Wide Reconciliation

The full paper still contains organization-specific and now-excluded statements outside the revised `generalized_*` files, including ZCDRRMO-only administration, an offline-first SMS fallback objective, GIS heatmap language, and automated submission wording. When the revised Chapter I sections are inserted into the full paper, the methodology, figures, user descriptions, requirements, process models, and references should be updated to use the same startup model and module boundaries. This pass did not modify `Perez-Somosa Final Paper.docx.md` because the request identified the `generalized_*` files as the revision targets.
