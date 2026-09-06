import assert from "node:assert/strict";
import { getPrototypeRole } from "../src/lib/prototype-login.ts";
import { SEED_BARANGAY_PROFILES, SEED_PUROK_PROFILES, consolidateBarangayTotals } from "../src/lib/profile-data.ts";
import {
  SEED_BARANGAY_INCIDENT_REPORTS,
  SEED_INCIDENT_REPORTS,
  consolidateIncidentTotals,
  isIncidentSectionComplete,
} from "../src/lib/hazard-data.ts";
import { SEED_SITREPS, SITREP_SECTION_ORDER, SITREP_SOURCE_LINKED } from "../src/lib/sitrep-data.ts";

assert.equal(getPrototypeRole("purok.demo"), "purok");
assert.equal(getPrototypeRole(" Barangay.Demo "), "barangay");
assert.equal(getPrototypeRole("drrm.demo"), "drrm");
assert.equal(getPrototypeRole("unknown.demo"), undefined);

const tetuanPuroks = SEED_PUROK_PROFILES.filter((p) => p.barangay === "Barangay Tetuan");
const tetuanAdditions = SEED_BARANGAY_PROFILES.find((b) => b.barangay === "Barangay Tetuan")!.additions;
const { totals, verified, notYetVerified } = consolidateBarangayTotals(tetuanPuroks, tetuanAdditions);

assert.equal(verified.length + notYetVerified.length, tetuanPuroks.length);
assert.equal(
  totals.totalHouseholds,
  verified.reduce((sum, p) => sum + (p.data.population.totalHouseholds ?? 0), 0) + tetuanAdditions.barangayWideHouseholds,
);
assert.ok(notYetVerified.every((p) => p.status !== "verified"));

const floodReports = SEED_INCIDENT_REPORTS.filter((r) => r.hazardEventId === "flood-tetuan-2026-09");
const floodAdditions = SEED_BARANGAY_INCIDENT_REPORTS.find((r) => r.hazardEventId === "flood-tetuan-2026-09")!.additions;
const incidentConsolidation = consolidateIncidentTotals(floodReports, floodAdditions);

assert.equal(incidentConsolidation.verified.length + incidentConsolidation.notYetVerified.length, floodReports.length);
assert.equal(
  incidentConsolidation.totals.affectedFamilies,
  incidentConsolidation.verified.reduce((sum, r) => sum + (r.data.affectedPopulation.affectedFamilies ?? 0), 0) + floodAdditions.affectedFamilies,
);

// Initial reports may omit affected-population data; Progress/Terminal/Final may not.
const initialReport = SEED_INCIDENT_REPORTS.find((r) => r.version === "initial" && r.status === "draft")!;
assert.equal(isIncidentSectionComplete("affectedPopulation", "initial", initialReport.data), true);
assert.equal(isIncidentSectionComplete("affectedPopulation", "progress", initialReport.data), false);

for (const sitrep of SEED_SITREPS) {
  for (const key of SITREP_SECTION_ORDER) {
    const section = sitrep.sections[key];
    if (SITREP_SOURCE_LINKED[key]) {
      assert.equal(section.originalNarrative, section.narrative, `${sitrep.id}.${key} should start with no unresolved discrepancy`);
    }
  }
}

console.log("Prototype checks passed.");
