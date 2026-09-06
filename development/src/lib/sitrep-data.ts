// Prototype dataset only. Section structure approximates a standard NDRRMC-style
// situational report; finalize against the 2024 NDRRM Operations Center SOPG and
// approved local template before production use.

import type { StatusTone } from "./profile-data";
import type { BarangayIncidentReportRecord, HazardEvent } from "./hazard-data";

export type SitRepStatus = "draft" | "under_review" | "returned" | "approved" | "exported";

export const SITREP_STATUS_LABEL: Record<SitRepStatus, string> = {
  draft: "Draft",
  under_review: "Under review",
  returned: "Returned for revision",
  approved: "Approved",
  exported: "Exported",
};

export const SITREP_STATUS_TONE: Record<SitRepStatus, StatusTone> = {
  draft: "neutral",
  under_review: "pending",
  returned: "urgent",
  approved: "verified",
  exported: "verified",
};

export const SITREP_SECTION_ORDER = [
  "situationOverview",
  "areasAndPopulation",
  "casualtiesAndDisplacement",
  "damageAndLifelines",
  "responseActions",
  "needsAndGaps",
  "recommendations",
] as const;

export type SitRepSectionKey = (typeof SITREP_SECTION_ORDER)[number];

export const SITREP_SECTION_LABEL: Record<SitRepSectionKey, string> = {
  situationOverview: "Situation Overview",
  areasAndPopulation: "Areas and Population Affected",
  casualtiesAndDisplacement: "Casualties and Displacement",
  damageAndLifelines: "Damage and Lifelines",
  responseActions: "Response Actions and Assistance",
  needsAndGaps: "Immediate Needs and Gaps",
  recommendations: "Recommendations",
};

/** Source-linked sections derive an initial value from verified source records and require a documented override to change materially. */
export const SITREP_SOURCE_LINKED: Record<SitRepSectionKey, boolean> = {
  situationOverview: true,
  areasAndPopulation: true,
  casualtiesAndDisplacement: true,
  damageAndLifelines: false,
  responseActions: false,
  needsAndGaps: false,
  recommendations: false,
};

export interface SitRepSectionState {
  narrative: string;
  /** Frozen source-derived text at generation time, for source-linked sections only. Undefined for narrative-only sections. */
  originalNarrative?: string;
  overridden: boolean;
  overrideNote: string;
}

export type SitRepSections = Record<SitRepSectionKey, SitRepSectionState>;

export interface SitRepRecord {
  id: string;
  hazardEventId: string;
  title: string;
  reportingPeriodLabel: string;
  templateVersion: string;
  generatedVersion: number;
  status: SitRepStatus;
  preparedBy: string;
  preparedAt: string;
  reviewedBy?: string;
  reviewedAt?: string;
  approvedBy?: string;
  approvedAt?: string;
  exportedBy?: string;
  exportedAt?: string;
  returnNote?: string;
  includedBarangayIncidentIds: string[];
  sections: SitRepSections;
}

const TEMPLATE_VERSION = "NDRRMC SitRep Template v2024.1";

function section(narrative: string): SitRepSectionState {
  return { narrative, overridden: false, overrideNote: "" };
}

function sourceLinkedSection(narrative: string): SitRepSectionState {
  return { narrative, originalNarrative: narrative, overridden: false, overrideNote: "" };
}

function emptySection(): SitRepSectionState {
  return { narrative: "", overridden: false, overrideNote: "" };
}

/** Generates the initial section set for a new SitRep from its source records. Source-linked sections are pre-filled once; narrative sections start blank for the preparer to author. */
export function buildInitialSitRepSections(
  hazardEvent: HazardEvent,
  barangayIncidents: BarangayIncidentReportRecord[],
): SitRepSections {
  const totalAffectedFamilies = barangayIncidents.reduce((sum, r) => sum + r.additions.affectedFamilies, 0);
  const totalDisplacedFamilies = barangayIncidents.reduce((sum, r) => sum + r.additions.displacedFamilies, 0);
  const barangayNames = barangayIncidents.map((r) => r.barangay).join(", ");

  return {
    situationOverview: sourceLinkedSection(
      `${hazardEvent.description} ${barangayIncidents.map((r) => r.narrative).join(" ")}`.trim(),
    ),
    areasAndPopulation: sourceLinkedSection(
      `${barangayNames}. ${totalAffectedFamilies} affected families reported. Figures reflect Barangay-submitted totals as of this report's preparation.`,
    ),
    casualtiesAndDisplacement: sourceLinkedSection(
      `${totalDisplacedFamilies} displaced families reported. No deaths or injuries reported as of this report's preparation.`,
    ),
    damageAndLifelines: emptySection(),
    responseActions: emptySection(),
    needsAndGaps: emptySection(),
    recommendations: emptySection(),
  };
}

export const SEED_SITREPS: SitRepRecord[] = [
  {
    id: "sitrep-stacatalina-fire-2026-09",
    hazardEventId: "fire-stacatalina-2026-09",
    title: "Sta. Catalina Public Market Fire",
    reportingPeriodLabel: "September 2026",
    templateVersion: TEMPLATE_VERSION,
    generatedVersion: 1,
    status: "draft",
    preparedBy: "DRRM Verification Desk",
    preparedAt: "2026-09-05T13:00:00+08:00",
    includedBarangayIncidentIds: ["barangay-incident-stacatalina-fire-2026-09"],
    sections: {
      situationOverview: sourceLinkedSection(
        "Fire broke out in the dry goods section of the Sta. Catalina public market. Contained after two hours. Market fire contained with no casualties. 8 vendor stalls destroyed; market operations suspended pending structural inspection.",
      ),
      areasAndPopulation: sourceLinkedSection(
        "Barangay Sta. Catalina public market. 8 affected families (market vendors). Purok-level source records are not tracked for this barangay in this prototype; figures reflect Barangay-reported additions only.",
      ),
      casualtiesAndDisplacement: sourceLinkedSection("No deaths or injuries reported. 0 households displaced; affected parties are market vendors, not household residents."),
      damageAndLifelines: emptySection(),
      responseActions: emptySection(),
      needsAndGaps: emptySection(),
      recommendations: emptySection(),
    },
  },
  {
    id: "sitrep-guiwan-fire-2026-08",
    hazardEventId: "fire-guiwan-2026-08",
    title: "Guiwan Public Market Vendor Stall Fire",
    reportingPeriodLabel: "August 2026",
    templateVersion: TEMPLATE_VERSION,
    generatedVersion: 1,
    status: "exported",
    preparedBy: "DRRM Verification Desk",
    preparedAt: "2026-08-20T17:00:00+08:00",
    reviewedBy: "DRRM Verification Desk",
    reviewedAt: "2026-08-20T17:30:00+08:00",
    approvedBy: "DRRM Verification Desk",
    approvedAt: "2026-08-20T18:00:00+08:00",
    exportedBy: "DRRM Verification Desk",
    exportedAt: "2026-08-20T18:05:00+08:00",
    includedBarangayIncidentIds: ["barangay-incident-guiwan-fire-2026-08"],
    sections: {
      situationOverview: sourceLinkedSection(
        "Isolated stall fire broke out in the wet market section of the Guiwan public market at approximately 2:00 PM on August 20. Barangay fire volunteers extinguished the fire within 30 minutes.",
      ),
      areasAndPopulation: sourceLinkedSection("Barangay Guiwan public market. 2 affected families (market vendors). No household population affected."),
      casualtiesAndDisplacement: sourceLinkedSection("No deaths, injuries, or displacement reported."),
      damageAndLifelines: section("Two vendor stalls destroyed. No damage to surrounding infrastructure. No lifeline interruption reported."),
      responseActions: section(
        "Barangay fire volunteers responded within 5 minutes and extinguished the fire using barangay-owned fire extinguishers. Barangay tanod secured the area during response.",
      ),
      needsAndGaps: section("None outstanding. Affected vendors advised to coordinate with the market administrator for stall reconstruction."),
      recommendations: section(
        "Recommend a fire safety inspection of remaining market stalls given the age of electrical wiring in the wet market section.",
      ),
    },
  },
];
