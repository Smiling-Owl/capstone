# Reporting Responsibility and Database Rules

## Authoritative boundary

This project uses national disaster-reporting content as the downstream information standard, but it does not require a Purok reporter to complete a national Situation Report. Republic Act No. 10121 assigns local disaster-information duties to local DRRM structures; the Purok tier and the Purok → Barangay → DRRM software routing are project and academic design decisions.

| Level | Owns | Does not own |
|---|---|---|
| Purok | A concise Initial Incident Report: hazard/incident reference, reporting Purok, location/landmark, occurrence or observation time, report as-of time, short prevailing situation, affected-family count, affected-person count, data state, reporter/source, optional evidence, and optional urgent-needs remarks | Structured casualty, damage, lifeline, suspension, calamity declaration, evacuation, response action, assistance, issue, recommendation, or formal SitRep sections |
| Barangay | Verification of Purok versions; exact consolidation source set; consolidated affected population; aggregate casualty summary; damage assessment; separately sourced Barangay additions; discrepancies, limitations, and evidence | DRRM approval, formal SitRep chronology, preparedness/response narrative, lifeline/service status, official declarations, recommendations, release, or clean export |
| DRRM | Verification of Barangay versions; fixed source snapshot; derived population/casualty/damage; official chronology and situation overview; preparedness; lifelines; suspensions/declarations; evacuation; response actions; assistance; issues; recommendations; approval, signatories, annexes, release, and export | Silent modification of submitted Purok or Barangay source versions |

## Purok Initial Incident Report

### Required before submission

- Incident or hazard reference.
- Reporting Purok and exact location or recognizable landmark.
- Occurrence/observation date and time, or an explicit unknown state.
- Report as-of date and time.
- Concise prevailing-situation statement.
- Affected families and affected persons, each with an explicit data state. A known zero is recorded as zero; unknown is stored as null with state `unknown`.
- Reporter/account and at least one information source.

### Optional

- Evidence attachment with capture time, location, provenance, privacy class, and integrity checksum.
- Urgent-needs remarks for escalation. This is free text, not a detailed needs-assessment form.

### Version rule

A Purok report series is always an Initial report. Corrections and later observations create successor versions in the same series; they do not turn the Purok report into a Progress, Terminal, or Final report.

## Barangay Incident Report

### Consolidation inputs

- Exact verified Purok report-version identifiers.
- Disposition for every considered Purok source: included, pending, excluded, or superseded.
- Reason for every non-included source.
- Reconciliation note for conflicts or duplication.
- Consolidation cut-off and report as-of time.

### Structured effects

- Affected population: families and persons, with current/cumulative classification and data state.
- Casualty summary: dead, injured, ill, and missing aggregate counts, with validation classification. No named casualty or medical record is stored in the general reporting schema.
- Damage assessment: category, item/facility, damage classification, partial/total quantity, affected area, unit, estimated damage, and estimated loss.

Barangay-added figures require their own source and must not be blended invisibly into Purok totals. Barangay reports may use Initial, Progress, Terminal, and Final stages.

## DRRM Situation Report

The formal body order is:

1. Situation Overview
2. Preparedness Measures
3. Consolidated Effects
4. Response Actions
5. Issues and Concerns
6. Recommendations

Document control is the header. Sources accompany the facts they support. Approval/signatories form the closing control block. Annexes follow the report body.

Population, casualty, and damage figures are generated from a frozen set of verified Barangay versions. A DRRM edit to a derived value creates an immutable override containing the original value/hash, replacement, reason, actor, and time. The original source remains traceable.

## Database invariants

- Tenant and jurisdiction scope are enforced by composite database references as well as row-level security.
- No public self-registration exists. The next higher administrative level creates subordinate accounts.
- Purok, Barangay, and DRRM accounts are disjoint subtypes of Account; operational roles remain separate assignments.
- Submitted profile, hazard, report, and SitRep versions are immutable. Corrections create a new version.
- Review and approval decisions reference an exact submitted version and are append-only.
- A maker cannot verify or approve the same version they prepared.
- Purok report values permit only affected-family and affected-person fields.
- Barangay report values permit affected population, casualty summary, and damage assessment fields.
- Only verified, in-jurisdiction Purok versions may be included in a Barangay consolidation.
- Only verified, in-jurisdiction Barangay and hazard versions at or before the cut-off may enter a SitRep snapshot.
- Unknown, not applicable, provisional, disputed, and verified states remain distinct; unknown is never aggregated as zero.
- General reports contain aggregates, not named residents, households, or casualty medical records.
- Draft exports are visibly watermarked. A clean release references an approved, content-hashed SitRep version and frozen source snapshot.

## Evidence basis

- Republic Act No. 10121, especially the definitions and local DRRM functions in Sections 3 and 12.
- DHSUD Climate and Disaster Risk Assessment guidance for baseline hazard, exposure, vulnerability, capacity, facilities, lifelines, maps, and risk information.
- NDRRMOC Standard Operating Procedures and Guidelines (2024) for Initial, Progress, Terminal, Situation, and Final reporting concepts.
- Published NDRRMC Situation Reports for the recurring effects and response information categories.
- Project interview evidence for version retention, source limitations, verification, approval, privacy sanitation, and authorized access.

These sources support the information categories and controls. They do not prescribe the application's exact tables or make Purok a statutory national-reporting office.
