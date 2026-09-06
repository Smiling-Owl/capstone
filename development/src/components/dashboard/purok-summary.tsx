"use client";

import Link from "next/link";
import { usePrototypeStore } from "@/lib/prototype-store";
import { StatusBadge } from "@/components/status-badge";

const CURRENT_PROFILE_ID = "tetuan-purok-6-2026-09";
const PUROK_NAME = "Purok 6";
const BARANGAY = "Barangay Tetuan";
const ACTIONABLE_INCIDENT_STATUSES = new Set(["draft", "correction_requested", "not_started"]);

export function PurokDashboardSummary() {
  const { purokProfiles, incidentReports, hazardEvents } = usePrototypeStore();
  const profile = purokProfiles.find((p) => p.id === CURRENT_PROFILE_ID);
  const activeEvents = hazardEvents.filter((e) => e.status === "active" && (e.barangay === BARANGAY || e.barangay === "Citywide"));
  const actionableIncidents = incidentReports.filter((r) => r.purokName === PUROK_NAME && r.barangay === BARANGAY && ACTIONABLE_INCIDENT_STATUSES.has(r.status));
  if (!profile) return null;

  const actionLabel =
    profile.status === "draft"
      ? "Continue monthly profile"
      : profile.status === "correction_requested"
        ? "Open correction"
        : profile.status === "not_started"
          ? "Start monthly profile"
          : "View monthly profile";

  return (
    <>
      <div className="summary-grid">
        <div className="summary-tile">
          <StatusBadge status={profile.status} />
          <span className="summary-label">{profile.reportingPeriodLabel} profile status</span>
        </div>
        <div className="summary-tile">
          <span className="summary-value tabular-nums">{profile.previousVerified.population.totalHouseholds}</span>
          <span className="summary-label">Households, last verified period</span>
          <span className="summary-meta">{profile.previousVerified.identification.reportingPeriodLabel}</span>
        </div>
        <div className="summary-tile">
          <span className="summary-value tabular-nums">{profile.previousVerified.population.totalPopulation}</span>
          <span className="summary-label">Population, last verified period</span>
          <span className="summary-meta">{profile.previousVerified.identification.reportingPeriodLabel}</span>
        </div>
      </div>

      {profile.status === "correction_requested" && profile.correctionNote && (
        <div className="callout callout-urgent">
          <strong>Correction requested by {profile.reviewedBy}</strong>
          <p>{profile.correctionNote}</p>
        </div>
      )}

      <section className="panel" aria-labelledby="purok-task-heading">
        <h2 id="purok-task-heading">Required action</h2>
        <p>{profile.reportingPeriodLabel} monthly CDRA profile for {profile.purokName}.</p>
        <Link className="primary-action" href="/purok/profile">{actionLabel}</Link>
      </section>

      {activeEvents.length > 0 && (
        <section className="panel" aria-labelledby="purok-hazard-heading">
          <h2 id="purok-hazard-heading">Active hazard events</h2>
          <p>
            {activeEvents.length} active event{activeEvents.length === 1 ? "" : "s"} affecting {BARANGAY}
            {actionableIncidents.length > 0 ? `, including ${actionableIncidents.length} incident report needing action` : ""}.
          </p>
          <Link className="secondary-action" href="/purok/incidents">Open incident reporting</Link>
        </section>
      )}
    </>
  );
}
