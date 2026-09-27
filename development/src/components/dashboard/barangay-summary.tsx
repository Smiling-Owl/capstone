"use client";

import Link from "next/link";
import { usePrototypeStore } from "@/lib/prototype-store";
import { consolidateBarangayTotals, PROFILE_STATUS_LABEL } from "@/lib/profile-data";
import { AnalyticsChart } from "@/components/dashboard/analytics-chart";

const BARANGAY = "Barangay Tetuan";
const QUEUE_STATUSES = new Set(["submitted", "under_review", "correction_requested"]);

export function BarangayDashboardSummary() {
  const { purokProfiles, barangayProfiles, incidentReports, hazardEvents } = usePrototypeStore();
  const puroks = purokProfiles.filter((p) => p.barangay === BARANGAY);
  const verifiedCount = puroks.filter((p) => p.status === "verified").length;
  const queue = puroks.filter((p) => QUEUE_STATUSES.has(p.status));
  const barangayRecord = barangayProfiles.find((b) => b.barangay === BARANGAY);
  const totals = barangayRecord ? consolidateBarangayTotals(puroks, barangayRecord.additions).totals : null;
  const incidentQueue = incidentReports.filter((r) => r.barangay === BARANGAY && QUEUE_STATUSES.has(r.status));
  const pendingHazardEvents = hazardEvents.filter((e) => e.barangay === BARANGAY && e.createdByLevel === "purok" && (e.status === "submitted" || e.status === "under_review"));
  const reportingGaps = puroks.filter((p) => p.status === "draft" || p.status === "not_started");
  const profileStatusCounts = [...new Set(puroks.map((profile) => profile.status))].map((status) => ({
    label: PROFILE_STATUS_LABEL[status],
    value: puroks.filter((profile) => profile.status === status).length,
  }));
  const verifiedProfiles = puroks.filter((profile) => profile.status === "verified");
  const exposureData = ([
    ["Flood exposure", "exposedToFlood"],
    ["Landslide exposure", "exposedToLandslide"],
    ["Storm-surge exposure", "exposedToStormSurge"],
    ["Fire exposure", "exposedToFireHazard"],
  ] as const).map(([label, key]) => {
    const values = verifiedProfiles.map((profile) => profile.data.vulnerability[key]);
    const notReported = values.filter((value) => value === null).length;
    return {
      label,
      value: verifiedProfiles.length ? values.filter((value) => value === true).length : null,
      detail: `${verifiedProfiles.length - notReported} reported · ${notReported} not reported`,
    };
  });

  return (
    <>
      <div className="summary-grid">
        <div className="summary-tile">
          <span className="summary-value tabular-nums">{verifiedCount} / {puroks.length}</span>
          <span className="summary-label">Puroks verified this period</span>
        </div>
        <div className="summary-tile">
          <span className="summary-value tabular-nums">{queue.length}</span>
          <span className="summary-label">Awaiting verification action</span>
        </div>
        <div className="summary-tile">
          <span className="summary-value tabular-nums">{totals ? totals.totalPopulation : "—"}</span>
          <span className="summary-label">Consolidated population</span>
          <span className="summary-meta">Verified puroks plus Barangay-wide additions</span>
        </div>
        <div className="summary-tile">
          <span className="summary-value tabular-nums">{reportingGaps.length}</span>
          <span className="summary-label">Puroks not yet submitted</span>
          <span className="summary-meta">Reporting gap for this period</span>
        </div>
      </div>

      <div className="analytics-grid">
        <AnalyticsChart
          id="barangay-submission-status"
          title="Purok submission status"
          description={`${puroks.length} Purok profiles in the current reporting period.`}
          valueLabel="Profiles"
          data={profileStatusCounts}
          emptyMessage="No Purok profiles are available for this period."
        />
        <AnalyticsChart
          id="barangay-verified-exposure"
          title="Reported hazard exposure"
          description={`${verifiedProfiles.length} verified Purok profiles only · values count profiles reporting exposure.`}
          valueLabel="Verified profiles reporting exposure"
          data={exposureData}
          emptyMessage="No verified Purok profiles are available. Exposure totals are not reported."
        />
      </div>

      <section className="panel" aria-labelledby="barangay-task-heading">
        <h2 id="barangay-task-heading">Purok profile verification</h2>
        <p>{queue.length} of {puroks.length} Purok submissions need a verification decision this period.</p>
        <Link className="primary-action" href="/barangay/profiles">Open verification queue</Link>
      </section>

      {reportingGaps.length > 0 && (
        <div className="callout callout-warning">
          <strong>Reporting gap: {reportingGaps.length} Purok{reportingGaps.length === 1 ? "" : "s"} not yet submitted</strong>
          <p>{reportingGaps.map((p) => p.purokName).join(", ")} {reportingGaps.length === 1 ? "has" : "have"} not submitted this period's profile.</p>
        </div>
      )}

      {(incidentQueue.length > 0 || pendingHazardEvents.length > 0) && (
        <section className="panel" aria-labelledby="barangay-incident-heading">
          <h2 id="barangay-incident-heading">Active incidents</h2>
          <p>
            {incidentQueue.length} incident report{incidentQueue.length === 1 ? "" : "s"} and {pendingHazardEvents.length} hazard
            event{pendingHazardEvents.length === 1 ? "" : "s"} need a verification decision.
          </p>
          <Link className="secondary-action" href="/barangay/incidents/verification">Open incident verification</Link>
        </section>
      )}
    </>
  );
}
