# Disaster Situation Reporting System
## Technology Stack and Implementation Plan

**Status:** Planning baseline after stack interview  
**Prepared:** 2 September 2026  
**Delivery window:** 20 weeks, targeting February 2027 with March 2027 as contingency  
**Team:** Two developers, strongest in TypeScript/JavaScript

## 1. Executive decision

Build one responsive, multi-tenant web application for independent Philippine DRRM organizations. The capstone will implement and test a **city-scale prototype** while keeping the tenant and jurisdiction model able to add other cities later. Regional capacity is an expansion target, not a result the capstone will claim without evidence.

Use a TypeScript monolith rather than separate frontend and backend projects:

- **Next.js 16 Active LTS** for the web UI and server-side application logic
- **Supabase** for managed authentication, PostgreSQL, private file storage, and database-level Row-Level Security (RLS)
- **SQL migrations and generated database types**, without an additional ORM
- **pdf-lib** for filling AcroForm PDFs and overlaying data on static official PDF templates
- **Playwright** for end-to-end, role, browser, mobile, and interrupted-submission tests
- **Vercel** for the capstone web deployment and a Supabase project in Singapore

Use the latest security-patched Active LTS release when implementation begins; do not copy an old patch version from this document. As of this plan, Next.js identifies 16.3 as Active LTS and has published security fixes that reinforce the need for prompt patching.

## 2. Decisions established by the interview

| Decision | Planning consequence |
|---|---|
| One platform serves multiple independent DRRM organizations | Every protected row and attachment is tenant-scoped |
| Ordinary users belong to only one tenant | No customer-facing tenant switcher; cross-tenant access is limited to controlled platform support |
| Barangays and puroks are jurisdiction units inside a tenant | They use one hierarchy model rather than becoming separate SaaS tenants |
| City-scale prototype; region-scale later | Load and usability claims stop at the tested city-scale envelope |
| Reporter uses a mobile-responsive web interface | No native mobile application |
| Barangay, verifier, approver, and admin use responsive web screens | One application and one design system serve all roles |
| Browser draft preservation and explicit retry are sufficient | No offline synchronization, SMS gateway, or background sync |
| Refresh or navigation freshness is sufficient | No real-time subscriptions or WebSocket subsystem |
| Official inputs include fillable and static PDF templates | Fill or overlay the supplied files; do not recreate official layouts in HTML |
| Approval requires password re-authentication | Record approver, role, SitRep version, decision, and timestamp; do not claim a certified digital signature |
| Actual role users will be available | Validate workflows early and conduct task-based evaluation near the end |
| Real sensitive data lacks current authorization | Use synthetic or properly anonymized data until the privacy gate is passed |
| Startup operation is a capstone model, not a guaranteed service | Separate prototype completion from any future production commitment |

## 3. Scope boundary

### Included in the capstone

1. User and organization management
2. Structured disaster reporting for floods, typhoons, and fires
3. Draft saving, interrupted-submission status, idempotent retry, and reconciliation
4. Human verification, correction, rejection, partial verification where configured, and conflict handling
5. Versioned SitRep generation from eligible verified sources
6. Human review, password-confirmed approval, PDF output, and source traceability
7. SitRep catalog, version comparison, search, filters, export, retention metadata, and audit history
8. Role- and tenant-scoped dashboards with tabular equivalents
9. Functional, integration, tenant-isolation, recovery, accessibility, and role-based evaluation

### Explicitly excluded

- Native mobile applications
- Full offline synchronization
- SMS, radio, satellite, or mesh integration
- Push notifications and live dashboard updates
- Predictive AI, automated truth determination, dispatch, or resource allocation
- Live NDRRMC, OCD, DILG, PAGASA, PHIVOLCS, or other government integrations
- GIS risk modelling and incident heatmaps unless later made an explicit graded requirement
- A legally certified electronic-signature service
- Production SLA, 24/7 operations, procurement readiness, or nationwide-scale claims
- Real personal or sensitive records before the privacy gate is approved

## 4. Proposed technology stack

| Layer | Choice | Why it fits this project |
|---|---|---|
| Language | TypeScript | The team is fastest in it; one language covers browser, server, validation, and tests |
| Web framework | Next.js App Router, Active LTS | One deployable application with responsive UI, server actions/route handlers, and straightforward cloud hosting |
| UI | React, semantic HTML, Tailwind CSS | Responsive layouts without a separate mobile codebase; semantic controls support accessibility testing |
| Forms and validation | React Hook Form for long drafts; Zod schemas at both client and server boundaries | Handles multi-section reports while keeping one validation definition |
| Authentication | Supabase Auth with email/password, invite-only onboarding, password reset, and secure cookie sessions | Avoids implementing password storage, token issuance, and recovery flows |
| Authorization | Application permission checks plus PostgreSQL RLS | Server logic enforces workflows; the database independently blocks cross-tenant row access |
| Database | Supabase PostgreSQL | Relational constraints suit versions, approvals, jurisdictions, controlled terms, and traceability |
| Data access | Supabase JavaScript client, SQL migrations, generated TypeScript types | Avoids a second schema abstraction and keeps RLS visible and testable |
| Attachments | Private Supabase Storage buckets with RLS and short-lived signed access | Keeps files outside the database while preserving tenant-scoped access |
| PDF output | pdf-lib | Fills existing AcroForm fields and overlays values on supplied static PDF pages |
| Charts | Recharts only where a chart materially helps; always pair with an HTML table | Small implementation cost and an accessible non-chart representation |
| Dates and time | PostgreSQL `timestamptz`, UTC storage, native `Intl` display in Asia/Manila | Preserves occurrence, observation, receipt, submission, cutoff, and decision times without another date library |
| Unit/integration tests | Vitest for isolated rules; Supabase database tests for RLS and constraints | Covers aggregation and state rules close to their implementation |
| End-to-end tests | Playwright | Exercises Chromium, Firefox, WebKit, mobile emulation, roles, and complete workflows |
| CI | GitHub Actions | Runs formatting, linting, type checks, migrations, RLS tests, unit tests, and critical Playwright flows on pull requests |
| Hosting | Vercel web deployment plus Supabase Singapore region | Low-operations prototype hosting close to Philippine users |
| Local development | Node.js Active LTS, npm, Supabase CLI | Uses the standard toolchain and the existing lockfile mechanism |

### Why not a separate API service

A NestJS/Express API plus a separate React application would duplicate routing, validation, deployment, authentication integration, and CI work. The core workload is transactional CRUD and workflow logic, which Next.js server-side code and PostgreSQL already cover. Split services only if measured scaling or organizational ownership later requires it.

### Why Supabase rather than separate Auth, database, and storage vendors

Supabase Auth integrates its JWT identity with PostgreSQL RLS, and Supabase Storage uses RLS-based access policies. This reduces security glue code and the number of vendor accounts. The application must still own DRRM-specific tenant membership, jurisdiction assignments, roles, state transitions, and approval rules.

The browser and normal server requests must use the signed-in user's session so RLS remains active. The Supabase service key bypasses RLS and must never be exposed to the browser or used for ordinary user requests.

## 5. Minimal architecture

```text
Mobile/desktop browser
        |
        v
Next.js application
  - responsive pages
  - server actions and route handlers
  - validation and workflow rules
  - PDF generation
        |
        +-------------------+
        |                   |
        v                   v
Supabase Auth         Supabase PostgreSQL
                            - constraints
                            - tenant RLS
                            - audit records
                            - reporting views/functions
                                  |
                                  v
                         Private Supabase Storage
                         - evidence attachments
                         - generated SitRep files
```

This is one application, one shared database, and one private object store. Tenant isolation is logical and enforced at the database boundary; a database/schema/project per tenant is unnecessary for the city-scale prototype.

## 6. Tenant and authorization model

### Tenant boundary

An independent customer organization is a `tenant`. Every tenant-owned table includes a non-null `tenant_id`. Every foreign key and query path preserves that tenant context. A user's tenant is derived from authenticated membership, never accepted from an untrusted form field or URL alone.

### Jurisdiction boundary

`organization_unit` represents the hierarchy inside a tenant:

```text
City/Municipality
  -> Barangay
      -> Purok/Sitio
```

Role assignments connect one user to one role and one organization unit. Access to descendant units is explicit in policy or precomputed in a closure table only if hierarchy queries prove difficult; start with the direct parent hierarchy and ordinary recursive PostgreSQL queries.

### Roles

- Platform administrator: tenant onboarding and platform configuration; no standing access to customer records
- Organization administrator: users, roles, and jurisdiction configuration within one tenant
- Reporter: drafts and submits reports for assigned units
- Barangay reviewer/reporter: reviews purok reports and submits barangay reports
- Verifier: triages, returns, rejects, verifies, or reconciles eligible reports
- Approver: reviews and approves a specific SitRep version after re-authentication
- Viewer: reads permitted records and dashboards
- Records/privacy officer: manages classification, retention metadata, holds, and authorized exports
- Authorized support: purpose-, scope-, and time-limited access with explicit approval and audit logging

Frontend visibility is not authorization. Every mutation, read, export, PDF source query, attachment action, and dashboard aggregate must be allowed by server checks and RLS.

## 7. Core data model

Start with these relational concepts; finalize fields against the supplied forms before implementation:

- `tenant`
- `organization_unit`
- `user_profile`
- `role_assignment`
- `support_access_grant`
- `incident`
- `report`
- `report_version`
- `report_value` or typed impact tables, chosen after form analysis
- `review_decision`
- `reconciliation_decision`
- `sitrep`
- `sitrep_version`
- `sitrep_source`
- `approval_decision`
- `controlled_term`
- `controlled_term_version`
- `attachment`
- `retention_rule`
- `legal_hold`
- `audit_event`
- `submission_request`

### Non-negotiable database rules

- Submitted, verified, and approved versions are immutable.
- Corrections create a new version linked to the prior version.
- Every decision identifies the exact version reviewed.
- `tenant_id` is non-null and checked across relationships.
- Important state transitions are constrained in database functions or transactions, not assembled from unrelated client writes.
- Zero, unknown, disputed, provisional, and not applicable remain distinct values.
- Approved SitRep totals retain links to included report versions and decisions.
- A client-generated idempotency key prevents duplicate submission during retries.
- Account deactivation never deletes authorship or decision history.

## 8. Key implementation flows

### Reporting and interrupted submission

1. Save the minimum necessary draft in the database while connected.
2. Optionally preserve an encrypted/minimized browser draft only after the shared-device risk is agreed with the LGU.
3. Generate one stable idempotency key for a submission attempt.
4. Show `submitting` until the server acknowledges the saved version.
5. If acknowledgement is lost, retry with the same key.
6. Return the already-created version when the key exists; never create a silent duplicate.
7. Send uncertain cases to reconciliation rather than guessing.

### Verification

1. Load the immutable submitted version and related evidence.
2. Show validation, possible-duplicate, conflict, and late-report flags as reviewer aids.
3. Require a reason for return, rejection, partial verification, or reconciliation.
4. Store the decision against the reviewed version.
5. Permit corrections through a new linked version only.

### SitRep generation and approval

1. Select eligible verified versions by tenant, jurisdiction, reporting period, cutoff, and configured workflow.
2. Materialize a SitRep draft with source links and unresolved discrepancies.
3. Fill the official PDF form or overlay the static official PDF.
4. Allow authorized human review and correction through a new SitRep version.
5. Re-authenticate the approver with Supabase Auth.
6. Store the immutable approval decision and final PDF hash.
7. Export the approved version without implying automatic national submission.

## 9. Security and privacy baseline

### Before any real personal or sensitive data

Real data is prohibited until all of the following are documented and approved:

- Written authorization from the participating LGU
- A Privacy Impact Assessment covering data inventory, flows, risks, cloud services, and controls
- Defined Personal Information Controller and Personal Information Processor roles
- An outsourcing/data-processing agreement and applicable subprocessor terms
- School ethics or research approval
- Privacy notice and lawful-purpose/collection basis
- Named Data Protection Officer contacts and incident-response procedure
- Retention, legal hold, export, return, and lawful disposal rules
- Confirmation that Supabase/Vercel region and cross-border processing are acceptable
- A tested backup, restoration, breach-response, and offboarding procedure

Until then, development, usability testing, screenshots, demonstrations, and the defense use synthetic or properly anonymized records only.

### Technical controls

- Invite-only accounts; disable public self-registration
- Secure, HTTP-only, same-site session cookies
- Password re-authentication for approvals and other high-impact actions
- RLS on every exposed tenant table and storage object path
- Deny-by-default policies with explicit allow rules
- Server-side role, jurisdiction, record-state, and ownership checks
- No service key in client code, logs, or ordinary request paths
- Private storage buckets and short-lived signed downloads
- Attachment allowlist, MIME/content verification, file-size limits, generated names, and no executable formats
- Rate limits for login, password reset, submissions, exports, and PDF generation
- Security headers, CSRF-safe mutation patterns, output encoding, and parameterized queries
- Immutable audit events for authentication, authorization changes, support access, exports, verification, approval, and retention actions
- Secret scanning and dependency/security updates in CI
- Separate local, test, staging, and defense environments

For production with real attachments, add malware scanning before files become available to reviewers. It is not safe to claim production readiness without it.

## 10. Accessibility and responsive design

Design reporter tasks mobile-first and the other role workspaces desktop-first, while retaining responsive behavior for all screens.

At minimum:

- Native semantic controls and labels
- Keyboard-complete workflows and visible focus
- Errors linked to fields and summarized at the top
- Status changes announced to assistive technology
- No color-only state or severity indicators
- Adequate touch targets and spacing
- Reflow and zoom testing
- Tables or text summaries for every chart
- Clear handling of unknown, provisional, disputed, and verified values
- Playwright checks plus manual keyboard and selected screen-reader evaluation

Document exactly which WCAG 2.2 criteria, pages, tasks, browsers, devices, and assistive technologies were tested. Do not claim universal conformance from an automated scan.

## 11. Provisional city-scale test envelope

Confirm these values with the partner LGU in Week 1. They are test targets, not production promises:

- At least two independently populated tenants for isolation testing
- One primary city tenant with up to 100 barangays and its configured puroks
- 2,000 user accounts in seeded/load-test data
- 50,000 report versions and 5,000 SitRep versions in performance data
- 100 concurrent authenticated sessions during a scripted peak test
- Burst of 20 report submissions per minute
- Images and PDFs only, initially capped at 10 MB per attachment
- 95th-percentile interactive requests below 3 seconds under the declared test conditions, excluding uploads and PDF generation
- SitRep generation below 15 seconds for the declared maximum source set
- Zero successful cross-tenant reads, writes, downloads, exports, or aggregates in the isolation suite

If actual field estimates exceed these values, change the test data and measure again; do not infer regional performance from city-scale results.

## 12. Twenty-week delivery plan

| Weeks | Outcome | Developer A focus | Developer B focus | Exit check |
|---|---|---|---|---|
| 1-2 | Requirements and risk baseline | Convert official report/SitRep forms into field and rule inventory | Confirm actors, role matrix, tenant/jurisdiction hierarchy, and evaluation tasks | Signed scope, form mapping, state diagrams, synthetic dataset plan, privacy gate recorded |
| 3-4 | Secure platform foundation | Next.js shell, Supabase Auth, invite flow, session handling | SQL migrations, tenant model, jurisdiction model, initial RLS tests | Two seeded tenants; cross-tenant access denied in automated tests |
| 5-7 | Disaster Reporting Module | Mobile reporter forms, draft UX, attachment flow | Version model, validation, idempotent submission, interruption tests | Reporter completes draft-submit-retry-correct flow on target phones |
| 8-10 | Verification Module | Review queue, comparison, reasons, conflict/duplicate UI | Decision transactions, reconciliation, version immutability, audit events | All permitted transitions pass; forbidden and cross-tenant transitions fail |
| 11-13 | SitRep Module | Draft review UI, source drill-down, approval confirmation | Aggregation rules, source mapping, PDF fill/overlay, output hashing | Sampled totals trace to sources; official PDFs match approved templates |
| 14-15 | Catalog and Dashboard | Search, filters, compare/supersede, accessible tables | Scoped aggregates, dashboard queries, exports, retention metadata | Catalog and dashboard match seeded expected results |
| 16-17 | Hardening and recovery | Accessibility fixes, responsive QA, workflow usability fixes | Backup/restore, export completeness, security review, performance tests | Restored environment works; no known critical security or data-loss defect |
| 18-19 | Formal evaluation | Facilitate role-based task tests and collect usability data | Run functional, integration, isolation, recovery, and accuracy suites | Raw results include conditions, denominators, failures, and participant roles |
| 20 | Defense release | Documentation, deployment rehearsal, demo script | Release candidate, evidence bundle, restore fallback | Tagged release, reproducible deployment, synthetic defense data, contingency demo |

### Weekly working rhythm

- Monday: choose the smallest vertical slice that advances an objective.
- Daily: short-lived branch, reviewed pull request, green checks before merge.
- Midweek: deploy to staging and test the slice as its real user role.
- Friday: demonstrate to stakeholders, record decisions, and cut scope that is not tied to an objective.
- Keep one working end-to-end path at all times; do not leave integration until Month 5.

## 13. Testing and evaluation evidence

### Automated checks

- Database constraints and RLS allow/deny tests for every tenant table and private storage path
- Unit tests for aggregation, eligibility, state transitions, unknown/zero semantics, and PDF field mapping
- End-to-end tests for each role and complete report-to-approved-SitRep flow
- Cross-tenant attempts covering direct IDs, search, dashboards, attachments, exports, background operations, and altered URLs
- Interrupted submission tests covering loss before send, loss after receipt before acknowledgement, retry, expiry, and concurrent correction
- Browser coverage on supported Chromium, Firefox, and WebKit versions
- Mobile viewport and touch-target coverage for reporter tasks
- Backup restoration and tenant export verification

### Human evaluation

Use actual role representatives with synthetic/anonymized scenarios. Record task completion, critical errors, time, corrections, verification turnaround, aggregation/retrieval accuracy, accessibility findings, and feedback separately. A satisfaction score must not substitute for security, correctness, accessibility, or performance results.

## 14. Deployment, handover, and exit path

### Capstone deployment

- Vercel project for the Next.js application
- Supabase project in the Singapore region
- Separate staging and defense/prototype environments
- Custom domain and HTTPS
- Environment variables stored in provider secret settings
- Database migrations committed to Git
- Synthetic seed script committed to Git
- Release tag and rollback procedure before the defense

### Handover package

- Source repository and lockfile
- Database schema and repeatable migrations
- RLS policies and database tests
- Synthetic seed data
- Environment-variable inventory without secret values
- Deployment, backup, restoration, and offboarding runbooks
- Tenant export format and sample export
- Official PDF templates and field-mapping manifest
- Administrator and role-user guides
- Known limitations, security findings, and unresolved accessibility issues
- Provider ownership-transfer steps or migration steps

Because the product's post-capstone operator is not yet institutionally settled, avoid embedding project-team identities or provider accounts in application logic. Ownership can change through provider account transfer and secret rotation; the data model and authorization rules remain the same.

### Portability

The prototype will use managed services, but its durable assets remain portable:

- Standard PostgreSQL schema and SQL migrations
- Standard SQL/CSV/JSON exports
- Files exported with a metadata manifest and stable IDs
- Next.js runnable as a Node.js server outside Vercel
- Configuration supplied through environment variables

Do not promise one-click self-hosting of the full Supabase platform. Build and test documented export/restore paths instead.

## 15. Principal risks and controls

| Risk | Control |
|---|---|
| Objectives exceed two-developer capacity | One monolith, managed backend, objective-tied backlog, weekly vertical slices |
| Tenant data leak | RLS, server checks, non-null tenant IDs, storage policies, adversarial isolation tests |
| Real sensitive data used prematurely | Hard privacy gate; synthetic/anonymized data by default |
| Official template changes late | Obtain versioned source files in Week 1 and maintain a field-mapping manifest |
| Reports silently duplicate after network interruption | Stable idempotency key and server reconciliation |
| Submitted history is overwritten | Immutable versions and transactional decisions |
| Dashboard misrepresents provisional data | Separate provisional/verified totals, visible filters, freshness, missingness, and drill-down |
| Approval is mistaken for a legal digital signature | Describe it as authenticated workflow approval only |
| Vendor lock-in blocks turnover | SQL migrations, standard exports, file manifest, provider transfer/migration runbook |
| Defense network fails | Rehearsed local/static contingency demonstration using synthetic data and captured test evidence |
| Startup claims outrun evidence | Separate prototype results from production, regional, commercial, and public-safety claims |

## 16. Definition of capstone completion

The system is ready for defense only when:

1. All six objective modules work through their critical end-to-end tasks.
2. Two seeded tenants cannot access each other's rows, attachments, dashboards, exports, or background results.
3. Submitted and approved versions remain immutable and traceable.
4. Official PDF outputs match the supplied versioned templates and sampled values trace to eligible sources.
5. Interrupted retries do not silently duplicate reports.
6. Backup restoration and tenant export complete successfully.
7. The declared accessibility tasks have documented automated and manual results.
8. The declared city-scale performance test has reproducible inputs and results.
9. The defense environment contains no unauthorized real personal or sensitive data.
10. The repository, deployment, migration, recovery, and administrator documentation can be handed to another competent operator.

## 17. Immediate next actions

1. Resolve the thesis wording that alternates between startup operation and customer-owned deployment; use the multi-tenant startup-operated prototype model consistently.
2. Inventory every field, rule, calculation, and signatory position in the fillable and static official PDFs.
3. Obtain representative synthetic scenarios for valid, incomplete, conflicting, duplicate, late, corrected, rejected, and superseded records.
4. Draft the tenant/jurisdiction/role matrix with partner users.
5. Create the Supabase staging project in Singapore and disable public signup.
6. Build the first vertical slice: invited reporter logs in, saves a draft, submits once, and a barangay reviewer sees only the permitted tenant/unit record.
7. Run the privacy-approval workstream separately; do not let it block synthetic-data development.

## 18. Primary references

- [Supabase Auth documentation](https://supabase.com/docs/guides/auth)
- [Supabase PostgreSQL Row-Level Security](https://supabase.com/docs/guides/database/postgres/row-level-security)
- [Supabase Storage access control](https://supabase.com/docs/guides/storage/security/access-control)
- [Supabase available regions](https://supabase.com/docs/guides/platform/regions)
- [Next.js releases and security notices](https://nextjs.org/blog)
- [Playwright documentation](https://playwright.dev/docs/intro)
- [National Privacy Commission: Security of Personal Data in Government Agencies](https://privacy.gov.ph/npc-circular-16-01-security-of-personal-data-in-government-agencies/)
- [National Privacy Commission: Data Privacy Act Implementing Rules and Regulations](https://privacy.gov.ph/implementing-rules-regulations-data-privacy-act-2012/)

