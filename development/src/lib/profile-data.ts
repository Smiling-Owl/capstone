// Prototype dataset only. Field categories approximate standard DHSUD CDRA
// population/housing/vulnerability profiling structure; finalize against the
// authoritative CDRA source and local configuration before production use.

// Shared across Purok/Barangay profiles, hazard events, and incident reports.
export type ProfileStatus =
  | "not_started"
  | "draft"
  | "queued_offline"
  | "submitted"
  | "under_review"
  | "correction_requested"
  | "verified"
  | "active"
  | "rejected"
  | "superseded";

export const PROFILE_STATUS_LABEL: Record<ProfileStatus, string> = {
  not_started: "Not started",
  draft: "Draft",
  queued_offline: "Queued (offline)",
  submitted: "Submitted",
  under_review: "Under review",
  correction_requested: "Correction requested",
  verified: "Verified",
  active: "Active",
  rejected: "Rejected",
  superseded: "Superseded",
};

export type StatusTone = "neutral" | "pending" | "urgent" | "verified";

export const PROFILE_STATUS_TONE: Record<ProfileStatus, StatusTone> = {
  not_started: "neutral",
  draft: "neutral",
  queued_offline: "pending",
  submitted: "pending",
  under_review: "pending",
  correction_requested: "urgent",
  verified: "verified",
  active: "verified",
  rejected: "urgent",
  superseded: "neutral",
};

export interface PurokProfileSections {
  identification: {
    purokName: string;
    barangay: string;
    city: string;
    reportingPeriodLabel: string;
    preparedBy: string;
    dateAccomplished: string | null;
  };
  population: {
    totalHouseholds: number | null;
    totalPopulation: number | null;
    malePopulation: number | null;
    femalePopulation: number | null;
    childrenUnder5: number | null;
    seniorCitizens: number | null;
    personsWithDisability: number | null;
    pregnantOrLactatingWomen: number | null;
    informalSettlerHouseholds: number | null;
  };
  housing: {
    lightMaterialHouseholds: number | null;
    mixedMaterialHouseholds: number | null;
    concreteMaterialHouseholds: number | null;
    householdsInHazardZone: number | null;
    evacuationCenterAvailable: "yes" | "no" | "shared_with_adjacent_purok" | null;
    primaryWaterSource: string;
    healthStationAccess: "within_purok" | "adjacent_purok" | "barangay_center" | null;
  };
  vulnerability: {
    exposedToFlood: boolean | null;
    exposedToLandslide: boolean | null;
    exposedToStormSurge: boolean | null;
    exposedToFireHazard: boolean | null;
    householdsWithoutEarlyWarningAccess: number | null;
    notes: string;
  };
  capacities: {
    trainedResponders: number | null;
    hasEarlyWarningEquipment: boolean | null;
    foodStockpileDays: number | null;
    waterStockpileDays: number | null;
    evacuationDrillsLast6Months: number | null;
  };
}

export const PROFILE_SECTION_ORDER = [
  "identification",
  "population",
  "housing",
  "vulnerability",
  "capacities",
] as const;

export type ProfileSectionKey = (typeof PROFILE_SECTION_ORDER)[number];

export const PROFILE_SECTION_LABEL: Record<ProfileSectionKey, string> = {
  identification: "Reporting Period and Purok Identification",
  population: "Population and Households",
  housing: "Housing and Facilities",
  vulnerability: "Vulnerability and Hazard Exposure",
  capacities: "Local Capacities",
};

export interface PurokProfileRecord {
  id: string;
  purokName: string;
  barangay: string;
  city: string;
  reportingPeriodLabel: string;
  status: ProfileStatus;
  submittedBy?: string;
  submittedAt?: string;
  reviewedBy?: string;
  reviewedAt?: string;
  correctionNote?: string;
  data: PurokProfileSections;
  previousVerified: PurokProfileSections;
}

export interface BarangayProfileRecord {
  id: string;
  barangay: string;
  city: string;
  reportingPeriodLabel: string;
  status: ProfileStatus;
  submittedBy?: string;
  submittedAt?: string;
  reviewedBy?: string;
  reviewedAt?: string;
  correctionNote?: string;
  additions: {
    barangayWideHouseholds: number;
    barangayWidePopulation: number;
    note: string;
  };
}

const CITY = "Zamboanga City";
const REPORTING_PERIOD = "September 2026";
const PREVIOUS_REPORTING_PERIOD = "August 2026";

type SectionOverrides = {
  [K in keyof PurokProfileSections]?: Partial<PurokProfileSections[K]>;
};

function verifiedSection(overrides: SectionOverrides): PurokProfileSections {
  const base: PurokProfileSections = {
    identification: {
      purokName: "",
      barangay: "Barangay Tetuan",
      city: CITY,
      reportingPeriodLabel: PREVIOUS_REPORTING_PERIOD,
      preparedBy: "",
      dateAccomplished: "2026-08-28",
    },
    population: {
      totalHouseholds: 0,
      totalPopulation: 0,
      malePopulation: 0,
      femalePopulation: 0,
      childrenUnder5: 0,
      seniorCitizens: 0,
      personsWithDisability: 0,
      pregnantOrLactatingWomen: 0,
      informalSettlerHouseholds: 0,
    },
    housing: {
      lightMaterialHouseholds: 0,
      mixedMaterialHouseholds: 0,
      concreteMaterialHouseholds: 0,
      householdsInHazardZone: 0,
      evacuationCenterAvailable: "no",
      primaryWaterSource: "Barangay waterline",
      healthStationAccess: "barangay_center",
    },
    vulnerability: {
      exposedToFlood: false,
      exposedToLandslide: false,
      exposedToStormSurge: false,
      exposedToFireHazard: false,
      householdsWithoutEarlyWarningAccess: 0,
      notes: "",
    },
    capacities: {
      trainedResponders: 0,
      hasEarlyWarningEquipment: false,
      foodStockpileDays: 0,
      waterStockpileDays: 0,
      evacuationDrillsLast6Months: 0,
    },
  };
  return {
    identification: { ...base.identification, ...overrides.identification },
    population: { ...base.population, ...overrides.population },
    housing: { ...base.housing, ...overrides.housing },
    vulnerability: { ...base.vulnerability, ...overrides.vulnerability },
    capacities: { ...base.capacities, ...overrides.capacities },
  };
}

function currentFromPrevious(
  previous: PurokProfileSections,
  overrides: SectionOverrides = {},
): PurokProfileSections {
  return verifiedSection({
    ...previous,
    ...overrides,
    identification: {
      ...previous.identification,
      reportingPeriodLabel: REPORTING_PERIOD,
      dateAccomplished: null,
      ...overrides.identification,
    },
  });
}

const purok1Previous = verifiedSection({
  identification: { purokName: "Purok 1", preparedBy: "Nora Villaflor" },
  population: {
    totalHouseholds: 142,
    totalPopulation: 611,
    malePopulation: 301,
    femalePopulation: 310,
    childrenUnder5: 58,
    seniorCitizens: 74,
    personsWithDisability: 12,
    pregnantOrLactatingWomen: 9,
    informalSettlerHouseholds: 18,
  },
  housing: {
    lightMaterialHouseholds: 40,
    mixedMaterialHouseholds: 61,
    concreteMaterialHouseholds: 41,
    householdsInHazardZone: 22,
    evacuationCenterAvailable: "yes",
    primaryWaterSource: "Barangay waterline",
    healthStationAccess: "within_purok",
  },
  vulnerability: {
    exposedToFlood: true,
    exposedToLandslide: false,
    exposedToStormSurge: false,
    exposedToFireHazard: true,
    householdsWithoutEarlyWarningAccess: 6,
    notes: "Low-lying cluster along Tumaga River tributary floods during sustained rainfall.",
  },
  capacities: {
    trainedResponders: 8,
    hasEarlyWarningEquipment: true,
    foodStockpileDays: 3,
    waterStockpileDays: 3,
    evacuationDrillsLast6Months: 1,
  },
});

const purok2Previous = verifiedSection({
  identification: { purokName: "Purok 2", preparedBy: "Ariel Consing" },
  population: {
    totalHouseholds: 98,
    totalPopulation: 429,
    malePopulation: 210,
    femalePopulation: 219,
    childrenUnder5: 33,
    seniorCitizens: 51,
    personsWithDisability: 7,
    pregnantOrLactatingWomen: 5,
    informalSettlerHouseholds: 6,
  },
  housing: {
    lightMaterialHouseholds: 21,
    mixedMaterialHouseholds: 48,
    concreteMaterialHouseholds: 29,
    householdsInHazardZone: 4,
    evacuationCenterAvailable: "shared_with_adjacent_purok",
    primaryWaterSource: "Deep well",
    healthStationAccess: "adjacent_purok",
  },
  vulnerability: {
    exposedToFlood: false,
    exposedToLandslide: false,
    exposedToStormSurge: false,
    exposedToFireHazard: false,
    householdsWithoutEarlyWarningAccess: 2,
    notes: "",
  },
  capacities: {
    trainedResponders: 5,
    hasEarlyWarningEquipment: true,
    foodStockpileDays: 2,
    waterStockpileDays: 3,
    evacuationDrillsLast6Months: 1,
  },
});

const purok3Previous = verifiedSection({
  identification: { purokName: "Purok 3", preparedBy: "Bituin Ramos" },
  population: {
    totalHouseholds: 87,
    totalPopulation: 366,
    malePopulation: 180,
    femalePopulation: 186,
    childrenUnder5: 29,
    seniorCitizens: 40,
    personsWithDisability: 5,
    pregnantOrLactatingWomen: 4,
    informalSettlerHouseholds: 9,
  },
  housing: {
    lightMaterialHouseholds: 30,
    mixedMaterialHouseholds: 40,
    concreteMaterialHouseholds: 17,
    householdsInHazardZone: 15,
    evacuationCenterAvailable: "no",
    primaryWaterSource: "Barangay waterline",
    healthStationAccess: "barangay_center",
  },
  vulnerability: {
    exposedToFlood: true,
    exposedToLandslide: true,
    exposedToStormSurge: false,
    exposedToFireHazard: false,
    householdsWithoutEarlyWarningAccess: 11,
    notes: "Slope cluster east of the barangay road has recurring soil movement after heavy rain.",
  },
  capacities: {
    trainedResponders: 3,
    hasEarlyWarningEquipment: false,
    foodStockpileDays: 1,
    waterStockpileDays: 2,
    evacuationDrillsLast6Months: 0,
  },
});

const purok4Previous = verifiedSection({
  identification: { purokName: "Purok 4", preparedBy: "Domingo Salazar" },
  population: {
    totalHouseholds: 121,
    totalPopulation: 512,
    malePopulation: 253,
    femalePopulation: 259,
    childrenUnder5: 41,
    seniorCitizens: 63,
    personsWithDisability: 9,
    pregnantOrLactatingWomen: 6,
    informalSettlerHouseholds: 3,
  },
  housing: {
    lightMaterialHouseholds: 18,
    mixedMaterialHouseholds: 55,
    concreteMaterialHouseholds: 48,
    householdsInHazardZone: 2,
    evacuationCenterAvailable: "yes",
    primaryWaterSource: "Barangay waterline",
    healthStationAccess: "within_purok",
  },
  vulnerability: {
    exposedToFlood: false,
    exposedToLandslide: false,
    exposedToStormSurge: false,
    exposedToFireHazard: false,
    householdsWithoutEarlyWarningAccess: 1,
    notes: "",
  },
  capacities: {
    trainedResponders: 10,
    hasEarlyWarningEquipment: true,
    foodStockpileDays: 4,
    waterStockpileDays: 4,
    evacuationDrillsLast6Months: 2,
  },
});

const purok5Previous = verifiedSection({
  identification: { purokName: "Purok 5", preparedBy: "Ligaya Ferrer" },
  population: {
    totalHouseholds: 76,
    totalPopulation: 318,
    malePopulation: 156,
    femalePopulation: 162,
    childrenUnder5: 24,
    seniorCitizens: 35,
    personsWithDisability: 4,
    pregnantOrLactatingWomen: 3,
    informalSettlerHouseholds: 11,
  },
  housing: {
    lightMaterialHouseholds: 27,
    mixedMaterialHouseholds: 33,
    concreteMaterialHouseholds: 16,
    householdsInHazardZone: 9,
    evacuationCenterAvailable: "shared_with_adjacent_purok",
    primaryWaterSource: "Shared deep well",
    healthStationAccess: "adjacent_purok",
  },
  vulnerability: {
    exposedToFlood: true,
    exposedToLandslide: false,
    exposedToStormSurge: false,
    exposedToFireHazard: true,
    householdsWithoutEarlyWarningAccess: 8,
    notes: "",
  },
  capacities: {
    trainedResponders: 4,
    hasEarlyWarningEquipment: false,
    foodStockpileDays: 2,
    waterStockpileDays: 2,
    evacuationDrillsLast6Months: 0,
  },
});

const purok6Previous = verifiedSection({
  identification: { purokName: "Purok 6", preparedBy: "Maria Santos" },
  population: {
    totalHouseholds: 104,
    totalPopulation: 447,
    malePopulation: 219,
    femalePopulation: 228,
    childrenUnder5: 36,
    seniorCitizens: 48,
    personsWithDisability: 6,
    pregnantOrLactatingWomen: 5,
    informalSettlerHouseholds: 7,
  },
  housing: {
    lightMaterialHouseholds: 22,
    mixedMaterialHouseholds: 51,
    concreteMaterialHouseholds: 31,
    householdsInHazardZone: 6,
    evacuationCenterAvailable: "yes",
    primaryWaterSource: "Barangay waterline",
    healthStationAccess: "within_purok",
  },
  vulnerability: {
    exposedToFlood: false,
    exposedToLandslide: false,
    exposedToStormSurge: false,
    exposedToFireHazard: false,
    householdsWithoutEarlyWarningAccess: 3,
    notes: "",
  },
  capacities: {
    trainedResponders: 7,
    hasEarlyWarningEquipment: true,
    foodStockpileDays: 3,
    waterStockpileDays: 3,
    evacuationDrillsLast6Months: 1,
  },
});

export const SEED_PUROK_PROFILES: PurokProfileRecord[] = [
  {
    id: "tetuan-purok-1-2026-09",
    purokName: "Purok 1",
    barangay: "Barangay Tetuan",
    city: CITY,
    reportingPeriodLabel: REPORTING_PERIOD,
    status: "verified",
    submittedBy: "Nora Villaflor",
    submittedAt: "2026-09-03T09:14:00+08:00",
    reviewedBy: "Ariel Consing",
    reviewedAt: "2026-09-04T13:02:00+08:00",
    data: currentFromPrevious(purok1Previous, {
      identification: { preparedBy: "Nora Villaflor", dateAccomplished: "2026-09-03" },
      population: { ...purok1Previous.population, totalHouseholds: 143, totalPopulation: 614 },
    }),
    previousVerified: purok1Previous,
  },
  {
    id: "tetuan-purok-2-2026-09",
    purokName: "Purok 2",
    barangay: "Barangay Tetuan",
    city: CITY,
    reportingPeriodLabel: REPORTING_PERIOD,
    status: "under_review",
    submittedBy: "Ariel Consing",
    submittedAt: "2026-09-05T16:40:00+08:00",
    data: currentFromPrevious(purok2Previous, {
      identification: { preparedBy: "Ariel Consing", dateAccomplished: "2026-09-05" },
    }),
    previousVerified: purok2Previous,
  },
  {
    id: "tetuan-purok-3-2026-09",
    purokName: "Purok 3",
    barangay: "Barangay Tetuan",
    city: CITY,
    reportingPeriodLabel: REPORTING_PERIOD,
    status: "correction_requested",
    submittedBy: "Bituin Ramos",
    submittedAt: "2026-09-02T10:05:00+08:00",
    reviewedBy: "Ariel Consing",
    reviewedAt: "2026-09-03T08:20:00+08:00",
    correctionNote:
      "Households in hazard zone (15) is unchanged from August despite the reported slope movement. Confirm the count or provide updated basis.",
    data: currentFromPrevious(purok3Previous, {
      identification: { preparedBy: "Bituin Ramos", dateAccomplished: "2026-09-02" },
    }),
    previousVerified: purok3Previous,
  },
  {
    id: "tetuan-purok-4-2026-09",
    purokName: "Purok 4",
    barangay: "Barangay Tetuan",
    city: CITY,
    reportingPeriodLabel: REPORTING_PERIOD,
    status: "verified",
    submittedBy: "Domingo Salazar",
    submittedAt: "2026-09-01T11:30:00+08:00",
    reviewedBy: "Ariel Consing",
    reviewedAt: "2026-09-02T09:00:00+08:00",
    data: currentFromPrevious(purok4Previous, {
      identification: { preparedBy: "Domingo Salazar", dateAccomplished: "2026-09-01" },
    }),
    previousVerified: purok4Previous,
  },
  {
    id: "tetuan-purok-5-2026-09",
    purokName: "Purok 5",
    barangay: "Barangay Tetuan",
    city: CITY,
    reportingPeriodLabel: REPORTING_PERIOD,
    status: "draft",
    data: currentFromPrevious(purok5Previous, {
      identification: { preparedBy: "Ligaya Ferrer", dateAccomplished: null },
    }),
    previousVerified: purok5Previous,
  },
  {
    id: "tetuan-purok-6-2026-09",
    purokName: "Purok 6",
    barangay: "Barangay Tetuan",
    city: CITY,
    reportingPeriodLabel: REPORTING_PERIOD,
    status: "draft",
    data: currentFromPrevious(purok6Previous, {
      identification: { preparedBy: "Maria Santos", dateAccomplished: null },
    }),
    previousVerified: purok6Previous,
  },
];

export const SEED_BARANGAY_PROFILES: BarangayProfileRecord[] = [
  {
    id: "tetuan-2026-09",
    barangay: "Barangay Tetuan",
    city: CITY,
    reportingPeriodLabel: REPORTING_PERIOD,
    status: "under_review",
    submittedBy: "Ariel Consing",
    submittedAt: "2026-09-06T10:00:00+08:00",
    additions: {
      barangayWideHouseholds: 14,
      barangayWidePopulation: 52,
      note: "Barangay hall compound staff housing and the covered court evacuation annex, not assigned to a purok.",
    },
  },
  {
    id: "sta-catalina-2026-09",
    barangay: "Barangay Sta. Catalina",
    city: CITY,
    reportingPeriodLabel: REPORTING_PERIOD,
    status: "verified",
    submittedBy: "Ernesto Bayoneta",
    submittedAt: "2026-09-03T14:00:00+08:00",
    reviewedBy: "DRRM Verification Desk",
    reviewedAt: "2026-09-04T09:45:00+08:00",
    additions: {
      barangayWideHouseholds: 9,
      barangayWidePopulation: 31,
      note: "Barangay health station staff quarters, not assigned to a purok.",
    },
  },
  {
    id: "guiwan-2026-09",
    barangay: "Barangay Guiwan",
    city: CITY,
    reportingPeriodLabel: REPORTING_PERIOD,
    status: "correction_requested",
    submittedBy: "Rowena Mercado",
    submittedAt: "2026-09-02T15:20:00+08:00",
    reviewedBy: "DRRM Verification Desk",
    reviewedAt: "2026-09-03T11:10:00+08:00",
    correctionNote: "Two Purok totals were consolidated from unverified submissions. Re-run consolidation after both are verified.",
    additions: {
      barangayWideHouseholds: 21,
      barangayWidePopulation: 74,
      note: "Public market vendor housing cluster, not assigned to a purok.",
    },
  },
];

export function numericFieldKeys<T extends object>(sample: T): (keyof T)[] {
  return (Object.keys(sample) as (keyof T)[]).filter((key) => typeof sample[key] === "number");
}

export interface ConsolidatedTotals {
  totalHouseholds: number;
  totalPopulation: number;
  childrenUnder5: number;
  seniorCitizens: number;
  personsWithDisability: number;
  informalSettlerHouseholds: number;
  householdsInHazardZone: number;
}

/**
 * Sums verified Purok totals only. Puroks that are not yet verified are
 * excluded and surfaced separately so the consolidated figure never silently
 * understates coverage as complete.
 */
export function consolidateBarangayTotals(
  purokProfiles: PurokProfileRecord[],
  additions: BarangayProfileRecord["additions"],
) {
  const verified = purokProfiles.filter((profile) => profile.status === "verified");
  const notYetVerified = purokProfiles.filter((profile) => profile.status !== "verified");

  const totals: ConsolidatedTotals = verified.reduce(
    (acc, profile) => {
      const { population, housing } = profile.data;
      acc.totalHouseholds += population.totalHouseholds ?? 0;
      acc.totalPopulation += population.totalPopulation ?? 0;
      acc.childrenUnder5 += population.childrenUnder5 ?? 0;
      acc.seniorCitizens += population.seniorCitizens ?? 0;
      acc.personsWithDisability += population.personsWithDisability ?? 0;
      acc.informalSettlerHouseholds += population.informalSettlerHouseholds ?? 0;
      acc.householdsInHazardZone += housing.householdsInHazardZone ?? 0;
      return acc;
    },
    {
      totalHouseholds: 0,
      totalPopulation: 0,
      childrenUnder5: 0,
      seniorCitizens: 0,
      personsWithDisability: 0,
      informalSettlerHouseholds: 0,
      householdsInHazardZone: 0,
    } satisfies ConsolidatedTotals,
  );

  totals.totalHouseholds += additions.barangayWideHouseholds;
  totals.totalPopulation += additions.barangayWidePopulation;

  return { totals, verified, notYetVerified };
}
