// Prototype dataset only. Hazard categories and incident report fields
// approximate standard CDRA hazard registry structure and NDRRMC-style
// situational reporting fields; finalize against the authoritative CDRA
// registry, RA 10121, and the 2024 NDRRMC Operations Center SOPG before
// production use.

import type { ProfileStatus } from "./profile-data.ts";

export interface HazardType {
  id: string;
  name: string;
  category: "hydrometeorological" | "geologic" | "human-induced" | "biological";
  description: string;
}

export const CDRA_HAZARD_REGISTRY: HazardType[] = [
  {
    id: "flood",
    name: "Flooding",
    category: "hydrometeorological",
    description: "Overflow of rivers, tributaries, or drainage during sustained or heavy rainfall.",
  },
  {
    id: "landslide",
    name: "Landslide",
    category: "geologic",
    description: "Slope failure or soil movement, typically following prolonged or heavy rainfall.",
  },
  {
    id: "storm-surge",
    name: "Storm surge",
    category: "hydrometeorological",
    description: "Abnormal sea level rise driven by tropical cyclone wind and pressure.",
  },
  {
    id: "severe-wind",
    name: "Typhoon or severe wind",
    category: "hydrometeorological",
    description: "Sustained damaging wind associated with a tropical cyclone.",
  },
  {
    id: "fire",
    name: "Fire",
    category: "human-induced",
    description: "Structural or informal-settlement fire requiring evacuation or response.",
  },
  {
    id: "earthquake",
    name: "Earthquake",
    category: "geologic",
    description: "Ground shaking from tectonic or volcanic activity.",
  },
];

export type CreatedByLevel = "purok" | "barangay" | "drrm";

export interface HazardEvent {
  id: string;
  hazardTypeId: string;
  title: string;
  description: string;
  barangay: string;
  city: string;
  createdByLevel: CreatedByLevel;
  createdBy: string;
  createdAt: string;
  status: ProfileStatus;
  reviewedBy?: string;
  reviewedAt?: string;
  correctionNote?: string;
}

export const SEED_HAZARD_EVENTS: HazardEvent[] = [
  {
    id: "flood-tetuan-2026-09",
    hazardTypeId: "flood",
    title: "Flooding along Tumaga River tributary corridor",
    description:
      "Sustained rainfall since September 4 raised the tributary that runs through Purok 1, 3, and 5. Low-lying households along the corridor are affected.",
    barangay: "Barangay Tetuan",
    city: "Zamboanga City",
    createdByLevel: "purok",
    createdBy: "Nora Villaflor",
    createdAt: "2026-09-05T06:10:00+08:00",
    status: "active",
    reviewedBy: "Ariel Consing",
    reviewedAt: "2026-09-05T07:40:00+08:00",
  },
  {
    id: "fire-stacatalina-2026-09",
    hazardTypeId: "fire",
    title: "Sta. Catalina public market fire",
    description: "Fire broke out in the dry goods section of the public market, contained after two hours.",
    barangay: "Barangay Sta. Catalina",
    city: "Zamboanga City",
    createdByLevel: "barangay",
    createdBy: "Ernesto Bayoneta",
    createdAt: "2026-09-04T20:15:00+08:00",
    status: "verified",
    reviewedBy: "DRRM Verification Desk",
    reviewedAt: "2026-09-04T22:00:00+08:00",
  },
  {
    id: "advisory-city-2026-09",
    hazardTypeId: "severe-wind",
    title: "Citywide yellow rainfall and wind advisory",
    description: "PAGASA yellow rainfall advisory in effect citywide through September 8.",
    barangay: "Citywide",
    city: "Zamboanga City",
    createdByLevel: "drrm",
    createdBy: "DRRM Verification Desk",
    createdAt: "2026-09-06T05:00:00+08:00",
    status: "active",
  },
  {
    id: "fire-guiwan-2026-08",
    hazardTypeId: "fire",
    title: "Guiwan public market vendor stall fire",
    description: "Isolated stall fire in the wet market section, extinguished within 30 minutes by barangay fire volunteers.",
    barangay: "Barangay Guiwan",
    city: "Zamboanga City",
    createdByLevel: "barangay",
    createdBy: "Rowena Mercado",
    createdAt: "2026-08-20T14:00:00+08:00",
    status: "verified",
    reviewedBy: "DRRM Verification Desk",
    reviewedAt: "2026-08-20T16:00:00+08:00",
  },
];

export interface IncidentReportSections {
  eventAndLocation: {
    hazardEventId: string;
    administrativeLocation: string;
    landmark: string;
    observationTime: string | null;
    reporterName: string;
    reporterContact: string;
    gpsCoordinates: string;
  };
  prevailingSituation: {
    summary: string;
    hazardIntensity: "advisory" | "watch" | "warning" | "emergency" | null;
    stillOngoing: boolean | null;
  };
  affectedPopulation: {
    affectedFamilies: number | null;
    affectedPersons: number | null;
    evacuatedFamilies: number | null;
    evacuatedPersons: number | null;
    evacuationCentersActivated: number | null;
  };
  casualtiesAndDisplacement: {
    deaths: number | null;
    injured: number | null;
    missing: number | null;
    displacedFamilies: number | null;
  };
  damageAndLifelines: {
    housesDamagedTotal: number | null;
    housesDamagedPartial: number | null;
    roadAccessAffected: boolean | null;
    powerInterrupted: boolean | null;
    waterInterrupted: boolean | null;
  };
  responseAndNeeds: {
    responseActionsTaken: string;
    immediateNeeds: string;
    resourcesDeployed: string;
  };
  evidence: {
    photosAttached: number;
    notes: string;
  };
}

export const INCIDENT_SECTION_ORDER = [
  "eventAndLocation",
  "prevailingSituation",
  "affectedPopulation",
  "casualtiesAndDisplacement",
  "damageAndLifelines",
  "responseAndNeeds",
  "evidence",
] as const;

export type IncidentSectionKey = (typeof INCIDENT_SECTION_ORDER)[number];

export const INCIDENT_SECTION_LABEL: Record<IncidentSectionKey, string> = {
  eventAndLocation: "Event and Location",
  prevailingSituation: "Prevailing Situation",
  affectedPopulation: "Affected Population",
  casualtiesAndDisplacement: "Casualties and Displacement",
  damageAndLifelines: "Damage and Lifelines",
  responseAndNeeds: "Response Actions and Immediate Needs",
  evidence: "Evidence",
};

export type IncidentReportVersion = "initial" | "progress" | "terminal" | "final";

export const INCIDENT_VERSION_LABEL: Record<IncidentReportVersion, string> = {
  initial: "Initial Report",
  progress: "Progress Report",
  terminal: "Terminal Report",
  final: "Final Report",
};

export interface IncidentReportRecord {
  id: string;
  hazardEventId: string;
  purokName: string;
  barangay: string;
  city: string;
  version: IncidentReportVersion;
  status: ProfileStatus;
  submittedBy?: string;
  submittedAt?: string;
  reviewedBy?: string;
  reviewedAt?: string;
  correctionNote?: string;
  data: IncidentReportSections;
}

function emptyIncidentSections(overrides: Partial<{
  eventAndLocation: Partial<IncidentReportSections["eventAndLocation"]>;
  prevailingSituation: Partial<IncidentReportSections["prevailingSituation"]>;
  affectedPopulation: Partial<IncidentReportSections["affectedPopulation"]>;
  casualtiesAndDisplacement: Partial<IncidentReportSections["casualtiesAndDisplacement"]>;
  damageAndLifelines: Partial<IncidentReportSections["damageAndLifelines"]>;
  responseAndNeeds: Partial<IncidentReportSections["responseAndNeeds"]>;
  evidence: Partial<IncidentReportSections["evidence"]>;
}>): IncidentReportSections {
  return {
    eventAndLocation: {
      hazardEventId: "",
      administrativeLocation: "",
      landmark: "",
      observationTime: null,
      reporterName: "",
      reporterContact: "",
      gpsCoordinates: "",
      ...overrides.eventAndLocation,
    },
    prevailingSituation: { summary: "", hazardIntensity: null, stillOngoing: null, ...overrides.prevailingSituation },
    affectedPopulation: {
      affectedFamilies: null,
      affectedPersons: null,
      evacuatedFamilies: null,
      evacuatedPersons: null,
      evacuationCentersActivated: null,
      ...overrides.affectedPopulation,
    },
    casualtiesAndDisplacement: {
      deaths: null,
      injured: null,
      missing: null,
      displacedFamilies: null,
      ...overrides.casualtiesAndDisplacement,
    },
    damageAndLifelines: {
      housesDamagedTotal: null,
      housesDamagedPartial: null,
      roadAccessAffected: null,
      powerInterrupted: null,
      waterInterrupted: null,
      ...overrides.damageAndLifelines,
    },
    responseAndNeeds: { responseActionsTaken: "", immediateNeeds: "", resourcesDeployed: "", ...overrides.responseAndNeeds },
    evidence: { photosAttached: 0, notes: "", ...overrides.evidence },
  };
}

export const SEED_INCIDENT_REPORTS: IncidentReportRecord[] = [
  {
    id: "incident-purok1-flood-initial",
    hazardEventId: "flood-tetuan-2026-09",
    purokName: "Purok 1",
    barangay: "Barangay Tetuan",
    city: "Zamboanga City",
    version: "initial",
    status: "under_review",
    submittedBy: "Nora Villaflor",
    submittedAt: "2026-09-05T08:30:00+08:00",
    data: emptyIncidentSections({
      eventAndLocation: {
        hazardEventId: "flood-tetuan-2026-09",
        administrativeLocation: "Purok 1, Barangay Tetuan",
        landmark: "Riverside Elementary School frontage",
        observationTime: "2026-09-05T07:45",
        reporterName: "Nora Villaflor",
        reporterContact: "0917-555-0142",
      },
      prevailingSituation: {
        summary: "Water reached knee-level along the river road; 12 households along the bank are cut off from the main road.",
        hazardIntensity: "warning",
        stillOngoing: true,
      },
      responseAndNeeds: {
        immediateNeeds: "Rescue boat for cut-off households, drinking water for the temporary holding area at the school covered court.",
      },
    }),
  },
  {
    id: "incident-purok3-flood-initial",
    hazardEventId: "flood-tetuan-2026-09",
    purokName: "Purok 3",
    barangay: "Barangay Tetuan",
    city: "Zamboanga City",
    version: "initial",
    status: "verified",
    submittedBy: "Bituin Ramos",
    submittedAt: "2026-09-05T08:05:00+08:00",
    reviewedBy: "Ariel Consing",
    reviewedAt: "2026-09-05T09:20:00+08:00",
    data: emptyIncidentSections({
      eventAndLocation: {
        hazardEventId: "flood-tetuan-2026-09",
        administrativeLocation: "Purok 3, Barangay Tetuan",
        landmark: "Purok 3 covered basketball court",
        observationTime: "2026-09-05T07:30",
        reporterName: "Bituin Ramos",
        reporterContact: "0917-555-0198",
      },
      prevailingSituation: {
        summary: "Slope area east of the barangay road showed fresh soil movement after overnight rain; 6 households evacuated as a precaution.",
        hazardIntensity: "watch",
        stillOngoing: true,
      },
      affectedPopulation: { affectedFamilies: 15, affectedPersons: 61, evacuatedFamilies: 6, evacuatedPersons: 24, evacuationCentersActivated: 1 },
      casualtiesAndDisplacement: { deaths: 0, injured: 0, missing: 0, displacedFamilies: 6 },
      damageAndLifelines: { housesDamagedTotal: 0, housesDamagedPartial: 1, roadAccessAffected: true, powerInterrupted: false, waterInterrupted: false },
      responseAndNeeds: {
        responseActionsTaken: "Purok BDRRM volunteers assisted evacuation to the covered court; barangay tanod posted at the affected slope.",
        immediateNeeds: "Sleeping mats and hot meals for evacuated families.",
        resourcesDeployed: "2 Purok BDRRM volunteers, 1 barangay tanod.",
      },
      evidence: { photosAttached: 4, notes: "Photos of the slope crack and the covered court holding area." },
    }),
  },
  {
    id: "incident-purok5-flood-initial",
    hazardEventId: "flood-tetuan-2026-09",
    purokName: "Purok 5",
    barangay: "Barangay Tetuan",
    city: "Zamboanga City",
    version: "initial",
    status: "draft",
    data: emptyIncidentSections({
      eventAndLocation: {
        hazardEventId: "flood-tetuan-2026-09",
        administrativeLocation: "Purok 5, Barangay Tetuan",
        reporterName: "Ligaya Ferrer",
      },
    }),
  },
  {
    id: "incident-purok6-flood-initial",
    hazardEventId: "flood-tetuan-2026-09",
    purokName: "Purok 6",
    barangay: "Barangay Tetuan",
    city: "Zamboanga City",
    version: "initial",
    status: "draft",
    data: emptyIncidentSections({
      eventAndLocation: {
        hazardEventId: "flood-tetuan-2026-09",
        administrativeLocation: "Purok 6, Barangay Tetuan",
        reporterName: "Maria Santos",
      },
    }),
  },
];

export interface BarangayIncidentReportRecord {
  id: string;
  hazardEventId: string;
  barangay: string;
  city: string;
  status: ProfileStatus;
  submittedBy?: string;
  submittedAt?: string;
  reviewedBy?: string;
  reviewedAt?: string;
  correctionNote?: string;
  narrative: string;
  additions: {
    affectedFamilies: number;
    displacedFamilies: number;
    note: string;
  };
}

export const SEED_BARANGAY_INCIDENT_REPORTS: BarangayIncidentReportRecord[] = [
  {
    id: "barangay-incident-tetuan-flood-2026-09",
    hazardEventId: "flood-tetuan-2026-09",
    barangay: "Barangay Tetuan",
    city: "Zamboanga City",
    status: "draft",
    narrative:
      "Flooding along the Tumaga tributary continues to affect low-lying households in Purok 1, 3, and 5. Consolidation is pending until all three Purok reports are verified.",
    additions: {
      affectedFamilies: 4,
      displacedFamilies: 3,
      note: "Barangay covered court sheltered 3 additional families from outside the mapped Purok hazard zones.",
    },
  },
  {
    id: "barangay-incident-stacatalina-fire-2026-09",
    hazardEventId: "fire-stacatalina-2026-09",
    barangay: "Barangay Sta. Catalina",
    city: "Zamboanga City",
    status: "verified",
    submittedBy: "Ernesto Bayoneta",
    submittedAt: "2026-09-05T09:00:00+08:00",
    reviewedBy: "DRRM Verification Desk",
    reviewedAt: "2026-09-05T11:30:00+08:00",
    narrative: "Market fire contained with no casualties. 8 vendor stalls destroyed; market operations suspended pending structural inspection.",
    additions: {
      affectedFamilies: 8,
      displacedFamilies: 0,
      note: "Affected parties are market vendors, not household residents; figures reflect stalls, not Purok population.",
    },
  },
  {
    id: "barangay-incident-guiwan-fire-2026-08",
    hazardEventId: "fire-guiwan-2026-08",
    barangay: "Barangay Guiwan",
    city: "Zamboanga City",
    status: "verified",
    submittedBy: "Rowena Mercado",
    submittedAt: "2026-08-20T15:00:00+08:00",
    reviewedBy: "DRRM Verification Desk",
    reviewedAt: "2026-08-20T16:00:00+08:00",
    narrative: "Vendor stall fire in the wet market extinguished within 30 minutes by barangay fire volunteers. No injuries; two stalls destroyed.",
    additions: {
      affectedFamilies: 2,
      displacedFamilies: 0,
      note: "Affected parties are market vendors, not household residents.",
    },
  },
];

export function isIncidentSectionComplete(
  key: IncidentSectionKey,
  version: IncidentReportVersion,
  data: IncidentReportSections,
): boolean {
  const fullReportRequired = version !== "initial";
  if (key === "eventAndLocation") {
    const s = data.eventAndLocation;
    return Boolean(s.hazardEventId && s.administrativeLocation && s.landmark && s.observationTime && s.reporterName);
  }
  if (key === "prevailingSituation") {
    const s = data.prevailingSituation;
    return Boolean(s.summary) && (!fullReportRequired || s.hazardIntensity !== null);
  }
  if (key === "responseAndNeeds") {
    const s = data.responseAndNeeds;
    return Boolean(s.immediateNeeds) && (!fullReportRequired || Boolean(s.responseActionsTaken));
  }
  if (!fullReportRequired) return true;
  if (key === "affectedPopulation") return Object.values(data.affectedPopulation).every((v) => v !== null);
  if (key === "casualtiesAndDisplacement") return Object.values(data.casualtiesAndDisplacement).every((v) => v !== null);
  if (key === "damageAndLifelines") return Object.values(data.damageAndLifelines).every((v) => v !== null);
  return true;
}

export interface IncidentConsolidationTotals {
  affectedFamilies: number;
  affectedPersons: number;
  displacedFamilies: number;
  deaths: number;
  injured: number;
}

export function consolidateIncidentTotals(
  reports: IncidentReportRecord[],
  additions: BarangayIncidentReportRecord["additions"],
) {
  const verified = reports.filter((r) => r.status === "verified");
  const notYetVerified = reports.filter((r) => r.status !== "verified");
  const totals: IncidentConsolidationTotals = verified.reduce(
    (acc, r) => {
      acc.affectedFamilies += r.data.affectedPopulation.affectedFamilies ?? 0;
      acc.affectedPersons += r.data.affectedPopulation.affectedPersons ?? 0;
      acc.displacedFamilies += r.data.casualtiesAndDisplacement.displacedFamilies ?? 0;
      acc.deaths += r.data.casualtiesAndDisplacement.deaths ?? 0;
      acc.injured += r.data.casualtiesAndDisplacement.injured ?? 0;
      return acc;
    },
    { affectedFamilies: 0, affectedPersons: 0, displacedFamilies: 0, deaths: 0, injured: 0 } satisfies IncidentConsolidationTotals,
  );
  totals.affectedFamilies += additions.affectedFamilies;
  totals.displacedFamilies += additions.displacedFamilies;
  return { totals, verified, notYetVerified };
}
