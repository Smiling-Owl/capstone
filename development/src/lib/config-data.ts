// Prototype configuration only. Reporting cutoffs and template settings are
// DRRM-managed values that follow the approved LGU reporting calendar; they are
// synthetic dates for the September-October 2026 prototype cycle.

export interface SitRepTemplateConfig {
  templateVersion: string;
  draftWatermark: string;
  approvedExportClean: boolean;
  sourceReferencesRequired: boolean;
}

export const DEFAULT_SITREP_TEMPLATE_VERSION = "NDRRMC SitRep Template v2024.1";

export interface SchedulePhase {
  id: string;
  task: string;
  appliesTo: string;
  /** Date-only local values interpreted as start of day; closesAt is end of day. */
  opensAt: string;
  closesAt: string;
}

export interface ReportingCycle {
  periodLabel: string;
  isCurrent: boolean;
  phases: SchedulePhase[];
}

export interface PrototypeConfig {
  sitrep: SitRepTemplateConfig;
  cycles: ReportingCycle[];
}

function cycle(periodLabel: string, isCurrent: boolean, base: { purok: [string, string]; barangay: [string, string]; drrm: [string, string] }): ReportingCycle {
  const idPrefix = periodLabel.toLowerCase().replace(/\s/g, "-");
  return {
    periodLabel,
    isCurrent,
    phases: [
      {
        id: `${idPrefix}-purok-profile`,
        task: "Purok monthly profile submission window",
        appliesTo: "Purok reporters",
        opensAt: base.purok[0],
        closesAt: base.purok[1],
      },
      {
        id: `${idPrefix}-barangay-profile`,
        task: "Purok profile verification and Barangay consolidation",
        appliesTo: "Barangay DRRM officers",
        opensAt: base.purok[1],
        closesAt: base.barangay[1],
      },
      {
        id: `${idPrefix}-drrm-profile`,
        task: "Barangay profile verification",
        appliesTo: "DRRM Office",
        opensAt: base.barangay[1],
        closesAt: base.drrm[1],
      },
    ],
  };
}

export const SEED_CONFIG: PrototypeConfig = {
  sitrep: {
    templateVersion: DEFAULT_SITREP_TEMPLATE_VERSION,
    draftWatermark: "DRAFT FOR REVIEW",
    approvedExportClean: true,
    sourceReferencesRequired: true,
  },
  cycles: [
    cycle("September 2026", true, {
      purok: ["2026-09-01", "2026-09-07"],
      barangay: ["2026-09-07", "2026-09-12"],
      drrm: ["2026-09-12", "2026-09-15"],
    }),
    cycle("October 2026", false, {
      purok: ["2026-10-01", "2026-10-07"],
      barangay: ["2026-10-07", "2026-10-12"],
      drrm: ["2026-10-12", "2026-10-15"],
    }),
  ],
};

export type ScheduleWindowStatus = "open" | "upcoming" | "closed";

/** Derives a window status from its configured dates so the schedule never claims an open window that has passed. */
export function windowStatus(
  phase: Pick<SchedulePhase, "opensAt" | "closesAt">,
  now = Date.now(),
): ScheduleWindowStatus {
  const openAt = new Date(`${phase.opensAt}T00:00:00`).getTime();
  const closeAt = new Date(`${phase.closesAt}T23:59:59`).getTime();
  if (now < openAt) return "upcoming";
  if (now <= closeAt) return "open";
  return "closed";
}

export function formatScheduleDate(isoDate: string) {
  return new Date(`${isoDate}T00:00:00`).toLocaleDateString(undefined, { month: "short", day: "numeric" });
}
