# Frontend Mockup Implementation Plan

## Product Definition

**System name:** Barangay Disaster Situation Record Management and Situation Report Generation System

The mockup is a clickable, production-shaped Next.js frontend that demonstrates one connected dataset across three administrative levels:

- Purok User: mobile-first field reporting and monthly aggregate profiling
- Barangay User: desktop-first consolidation, verification, reporting, and Purok account administration
- DRRM Administrator: desktop-first citywide verification, SitRep preparation and approval, configuration, account administration, and audit oversight

The prototype uses real Zamboanga City geographic names and realistic multi-hazard scenarios, but fictional identities, contact details, and record identifiers.

## Non-Negotiable Product Rules

1. Accounts are issued by the supervising administrative level. There is no self-registration.
2. Purok profiles contain aggregate totals, never named resident or household records.
3. Purok profiles are complete monthly snapshots, prefilled from the previous verified month.
4. A submitted profile does not affect higher-level totals until verified.
5. Barangay profiling consolidates verified Purok profiles and separately identifies Barangay-wide additions.
6. Hazard types come from a DRRM-managed, configurable CDRA registry. Users create hazard event instances from those approved types.
7. Purok-created hazard events require Barangay verification; Barangay-created events require DRRM verification; DRRM-created events activate immediately.
8. Incidents use progressive Initial, Progress, Terminal, and Final report versions.
9. Reviewers approve, reject, or request corrections. They never silently edit submitted records.
10. Submitted versions remain immutable and traceable. Corrections create new versions.
11. Barangay incident reports consolidate eligible verified Purok reports and separately identify other Barangay-level sources and discrepancies.
12. DRRM permissions distinguish Verifier, SitRep Preparer, and Approver, although one account may hold several permissions.
13. SitRep narrative sections are editable. Source-derived values remain linked and require a documented override or source correction.
14. Draft SitReps export to watermarked PDF and DOCX. Approved SitReps export cleanly with numbering, signatories, and source references.
15. Normal records are superseded or archived, not deleted.
16. Missing information is never presented as zero impact.

## Source and Mandate Gate

No operational field, validation rule, aggregation, status transition, or SitRep section may be invented for visual completeness.

Before implementing a form or generated document:

1. Record its authoritative source or approved local configuration basis.
2. Define its label, meaning, unit, allowed values, applicability, evidence requirement, and reporting stage.
3. Mark whether it is entered, calculated, consolidated, or narrative.
4. Define who may create, view, verify, correct, approve, and export it.
5. Confirm how unknown, zero, not applicable, provisional, and verified values differ.

Primary references include the applicable DHSUD CDRA guidance, 2024 NDRRM Operations Center SOPG, RA 10121, Operation LISTO materials, approved local CDRA records, and the project's verified research files.

## Information Architecture

### Shared

- Log In
- Notifications
- My Account and Password
- Session and Access States

### Purok Mobile

Bottom navigation: Home, Profile, Report, History, More.

- Purok Dashboard
- Monthly Purok CDRA Profile
- Hazard Event Creation
- Purok Incident Reporting
- Purok Incident History
- Notification Center
- Account and Offline Queue

### Barangay Desktop

- Barangay Dashboard
- Purok User Management
- Purok Profile Verification
- Barangay Profile Consolidation
- Hazard Event Creation
- Purok Incident Verification
- Barangay Incident Reporting
- Purok and Barangay Historical Catalogs
- Notifications and Account

### DRRM Desktop

- DRRM Dashboard
- Barangay User Management
- System User and Permission Management
- Barangay Profile Verification
- CDRA Hazard Registry
- Hazard Event Creation and Review
- Barangay Incident Verification
- SitRep Generation and Structured Editor
- SitRep Review, Approval, and Export
- Barangay and SitRep Historical Catalogs
- System Audit Log
- Reporting Schedule and Template Configuration

## Core Form Structures

### Monthly Purok Profile

1. Reporting Period and Purok Identification
2. Population and Households
3. Housing and Facilities
4. Vulnerability and Hazard Exposure
5. Local Capacities
6. Review and Submit

The form is resumable, prefilled from the previous verified month, and shows completion and validation by section.

### Incident Report Version

1. Event and Location
2. Prevailing Situation
3. Affected Population
4. Casualties and Displacement
5. Damage and Lifelines
6. Response Actions and Immediate Needs
7. Evidence
8. Review and Submit

Initial Reports accept incomplete but operationally essential information. Progress, Terminal, and Final reports apply increasing completeness requirements.

Required Initial Report facts include administrative location, landmark, observation time, reporter/source, hazard event, prevailing situation, and immediate needs. GPS or a map pin is optional. Modes of Verification may follow the Initial Report but remain visible as incomplete during review.

### SitRep Editor

Use structured editable sections beside a live document preview. Preserve the mandated document order, section validation, source links, unresolved discrepancies, template version, generated version, and approval state. Do not imitate an unrestricted word processor.

## Workflow States

### Profiles, Hazards, and Reports

Draft -> Saved on Device -> Queued -> Submitted -> Under Review -> Verified

Alternative review outcomes:

- Correction Requested -> Revised Draft -> Resubmitted
- Rejected
- Superseded by a later accepted version

### SitRep

Draft -> Under Review -> Approved -> Exported

Rejected or returned drafts retain comments and version history.

## Dashboard Rules

- Purok prioritizes monthly profile status, active reporting tasks, offline drafts, correction requests, and recent history.
- Barangay prioritizes Purok submission coverage, verification queues, consolidated verified totals, active incidents, and reporting gaps.
- DRRM prioritizes citywide verification queues, verified incident effects, source coverage, SitRep readiness, discrepancies, and overdue submissions.
- Historical trends are secondary to current operational work.
- Every aggregate discloses reporting period, filters, denominator, last update, and Verified, Provisional, Missing, or Not Applicable status.
- Incident maps are secondary views with equivalent tables and lists.

## Design System

### Direction

Restrained hybrid of formal public documentation and emergency operations. Routine work is calm and document-oriented. Urgency appears only where an active incident, rejected evidence, overdue submission, or verification decision requires it.

### Governing Philosophy: Operational Minimalism

- Show only the information required to understand the current state, make the next decision, or verify its basis.
- Preserve completeness through progressive disclosure, structured sections, summaries, and drill-down rather than placing every field on one surface.
- Prefer short, literal labels and sentences over promotional or decorative copy.
- Give each screen one dominant task and one visually dominant primary action.
- Keep record identity, reporting period, verification state, source, and next action visible without scrolling where practical.
- Use typography, alignment, dividers, and spacing as the main visual language. Avoid oversized statements, decorative emptiness, and unnecessary containers.
- Use color only for interaction, hierarchy, and semantic state. Never use color to decorate routine information.
- Make dense information scannable rather than making it artificially sparse.
- Accuracy and traceability take precedence over visual drama.

Design dials:

- Variance: 3/10
- Motion: 2/10
- Density: 7/10 on desktop and 5/10 on mobile forms

### Palette

- Graphite ink: `#202A2D`
- Mineral teal: `#285F5B`
- Teal active/hover: `#1F4B48`
- Mist canvas: `#F3F5F2`
- White surface: `#FFFFFF`
- Soft border: `#D8DEDA`
- Muted text: `#5D6B68`

Semantic colors are not brand decoration:

- Urgent or rejected: deep red
- Pending or correction required: amber
- Verified or approved: green
- Informational: mineral teal

### Typography

- Lexend: headings, navigation, and high-level status
- Source Sans 3: forms, instructions, tables, timelines, and document content
- Tabular numerals for counts, dates, times, versions, and report identifiers

### Shape and Material

- Small, consistent radii for inputs and controls
- Panels use borders and spacing before elevation
- No gradients, glassmorphism, oversized promotional headings, decorative metric cards, or color-only status communication
- Touch targets are at least 44 by 44 CSS pixels

### Signature Interaction

The system's distinctive element is a **source lineage rail**. On consolidated profiles, Barangay reports, and SitReps, it shows how a value travels from Purok source through verification and consolidation to the current document. This makes traceability visible without turning the interface into a technical diagram.

## Responsive Model

- Purok workflows are designed from common phone resolutions upward.
- Barangay and DRRM workflows are designed from common laptop and desktop resolutions downward.
- Tablet widths receive an explicit review pass.
- Long desktop tables transform into prioritized record summaries on narrow screens rather than forcing horizontal page scrolling.

## Accessibility Baseline

Every approved screen must meet WCAG 2.2 Level AA, including:

- Semantic structure and logical heading hierarchy
- Visible connected labels and contextual help
- Keyboard operation and visible focus
- Programmatically associated validation and errors
- Minimum touch targets
- Contrast-compliant text and controls
- Status that does not rely on color alone
- Zoom and text-resize resilience
- Reduced-motion support
- Accessible alternatives for maps and charts
- Focus management for dialogs, drawers, validation summaries, and route changes

## Prototype Behavior

- One seeded dataset is shared across all role views.
- A Purok submission appears in the Barangay verification queue and, after approval and consolidation, in the DRRM workflow.
- A reviewer-only role switcher is visually separate from production navigation.
- Purok drafts autosave locally and queue when offline.
- Offline drafts are never displayed as successfully submitted.
- Multiple named users may belong to one administrative unit, but each draft has one current owner.
- Each record exposes its activity timeline; the complete audit log is restricted to authorized DRRM administrators.
- Routine notifications remain in-app. SMS or email is represented only for configured urgent escalation.

## Implementation and Review Order

### Checkpoint 1: Foundation and Access

- Tokens, typography, responsive shells, reviewer toolbar
- Shared Log In
- Role-specific landing behavior
- Validation, loading, access-denied, and session-expired states

### Checkpoint 2: Profiling Workflow

- Purok monthly profile
- Barangay profile verification
- Barangay consolidation
- DRRM profile verification
- Profile-derived dashboard summaries

### Checkpoint 3: Incident Workflow

- Hazard registry and event creation
- Purok Initial/Progress/Terminal/Final reporting
- Barangay verification and correction loop
- Barangay report consolidation
- DRRM verification

### Checkpoint 4: Dashboards and Catalogs

- Purok, Barangay, and DRRM dashboards
- Purok and Barangay report catalogs
- Search, filters, comparison, timelines, and missing-data states

### Checkpoint 5: SitRep

- Eligibility and source selection
- Structured editor and source lineage
- Review and approval
- Draft and approved document previews
- PDF and DOCX export states
- SitRep catalog

### Checkpoint 6: Administration and Final States

- Purok, Barangay, and system user management
- Permissions and account lifecycle
- Notifications, audit log, schedules, and configuration
- Empty, loading, error, offline, correction, rejected, and superseded states
- Cross-role click-path and responsive audit

Each checkpoint is reviewed screen by screen before the next checkpoint begins.

## Design Self-Critique

The original deep-navy and burnt-orange login was legible but too close to a generic institutional landing page and too promotional for a dense operational system. The first graphite and mineral-teal revision improved identity but still relied on oversized editorial typography and decorative empty space. The governing direction now uses an operational type scale, tighter information hierarchy, and progressive disclosure. Visual distinctiveness is spent on source lineage rather than decoration. The system stays recognizable because its structure reflects the real Purok-to-Barangay-to-DRRM reporting chain.

## Skill-Governed Quality Passes

- `ui-ux-pro-max`: product-wide design system, UX outcomes, responsive and stack guidance
- `frontend-design`: deliberate visual identity, signature interaction, copy and self-critique
- `design-taste-frontend`: anti-template review for access and non-dashboard presentation surfaces
- `frontend-design-direction` and `design-system`: shared tokens, components, density, and consistency
- `frontend-patterns`: Next.js composition, forms, state, and performance discipline
- `frontend-a11y` and `accessibility`: semantic forms, focus, keyboard, errors, and assistive technology behavior
- `dashboard-builder`: role-scoped operational hierarchy and honest data presentation
- `motion-foundations`, `motion-patterns`, and `motion-ui`: restrained state transitions and reduced-motion behavior
- `make-interfaces-feel-better`: interaction and copy polish after functional completion
- `click-path-audit`: end-to-end workflow audit across roles
- `browser-qa` and `web-design-guidelines`: final browser, responsive, usability, and standards review
