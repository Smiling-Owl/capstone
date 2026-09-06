"use client";

import Link from "next/link";
import { usePrototypeStore } from "@/lib/prototype-store";

const QUEUE_STATUSES = new Set(["submitted", "under_review", "correction_requested"]);

export function DrrmDashboardSummary() {
  const { barangayProfiles, barangayIncidentReports, hazardEvents } = usePrototypeStore();
  const verified = barangayProfiles.filter((b) => b.status === "verified").length;
  const queue = barangayProfiles.filter((b) => QUEUE_STATUSES.has(b.status));
  const incidentQueue = barangayIncidentReports.filter((r) => QUEUE_STATUSES.has(r.status));
  const pendingHazardEvents = hazardEvents.filter((e) => e.createdByLevel === "barangay" && (e.status === "submitted" || e.status === "under_review"));
  const reportedThisPeriod = barangayProfiles.filter((b) => Boolean(b.submittedAt)).length;
  const overdue = barangayProfiles.filter((b) => !b.submittedAt);

  return (
    <>
      <div className="summary-grid">
        <div className="summary-tile">
          <span className="summary-value tabular-nums">{verified} / {barangayProfiles.length}</span>
          <span className="summary-label">Barangays verified this period</span>
        </div>
        <div className="summary-tile">
          <span className="summary-value tabular-nums">{queue.length}</span>
          <span className="summary-label">Awaiting DRRM verification action</span>
        </div>
        <div className="summary-tile">
          <span className="summary-value tabular-nums">{reportedThisPeriod} / {barangayProfiles.length}</span>
          <span className="summary-label">Source coverage this period</span>
          <span className="summary-meta">Barangays with a submitted profile</span>
        </div>
      </div>

      <section className="panel" aria-labelledby="drrm-task-heading">
        <h2 id="drrm-task-heading">Barangay profile verification</h2>
        <p>{queue.length} of {barangayProfiles.length} Barangay consolidated profiles need a verification decision.</p>
        <Link className="primary-action" href="/drrm/profiles">Open verification queue</Link>
      </section>

      {overdue.length > 0 && (
        <div className="callout callout-warning">
          <strong>{overdue.length} Barangay{overdue.length === 1 ? "" : "s"} overdue</strong>
          <p>{overdue.map((b) => b.barangay).join(", ")} {overdue.length === 1 ? "has" : "have"} not submitted a consolidated profile this period.</p>
        </div>
      )}

      {(incidentQueue.length > 0 || pendingHazardEvents.length > 0) && (
        <section className="panel" aria-labelledby="drrm-incident-heading">
          <h2 id="drrm-incident-heading">Active incidents</h2>
          <p>
            {incidentQueue.length} Barangay incident report{incidentQueue.length === 1 ? "" : "s"} and {pendingHazardEvents.length}{" "}
            hazard event{pendingHazardEvents.length === 1 ? "" : "s"} need a verification decision.
          </p>
          <Link className="secondary-action" href="/drrm/incidents/verification">Open incident verification</Link>
        </section>
      )}
    </>
  );
}
