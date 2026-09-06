"use client";

import Link from "next/link";
import { RoleShell } from "@/components/role-shell";
import { StatusBadge } from "@/components/status-badge";
import { SourceLineageRail, LineageStage } from "@/components/source-lineage-rail";
import { BARANGAY_MOBILE_NAV, BARANGAY_NAV, ROLE_META } from "@/lib/role-nav";
import { usePrototypeStore } from "@/lib/prototype-store";
import { consolidateIncidentTotals } from "@/lib/hazard-data";

const BARANGAY = "Barangay Tetuan";

function formatDate(iso?: string) {
  if (!iso) return undefined;
  return new Date(iso).toLocaleDateString(undefined, { month: "short", day: "numeric" });
}

export default function BarangayIncidentReportingPage() {
  const meta = ROLE_META.barangay;
  const { incidentReports, hazardEvents, barangayIncidentReports } = usePrototypeStore();
  const reports = barangayIncidentReports.filter((r) => r.barangay === BARANGAY);

  return (
    <RoleShell
      role="barangay"
      subtitle={meta.subtitle}
      nav={BARANGAY_NAV}
      mobileNav={BARANGAY_MOBILE_NAV}
      activeHref="/barangay/incidents"
      userInitials={meta.userInitials}
      userName={meta.userName}
    >
      <header className="role-header">
        <div>
          <p className="workspace-scope">{BARANGAY}</p>
          <h1>Barangay Incident Reporting</h1>
        </div>
      </header>

      {reports.map((report) => {
        const event = hazardEvents.find((e) => e.id === report.hazardEventId);
        const purokReports = incidentReports.filter((r) => r.hazardEventId === report.hazardEventId && r.barangay === BARANGAY);
        const { totals, verified, notYetVerified } = consolidateIncidentTotals(purokReports, report.additions);

        const stages: LineageStage[] = [
          { label: "Purok sources", detail: `${verified.length} of ${purokReports.length} verified`, state: verified.length === purokReports.length && purokReports.length > 0 ? "complete" : "current" },
          { label: "Barangay incident report", detail: "This document", state: "current" },
          {
            label: "DRRM verification",
            detail: report.reviewedBy ?? "Awaiting decision",
            timestamp: formatDate(report.reviewedAt),
            state: report.status === "verified" ? "complete" : report.status === "correction_requested" ? "blocked" : "pending",
          },
        ];

        return (
          <section className="panel" key={report.id}>
            <div className="record-detail-header" style={{ paddingBottom: 0, border: 0 }}>
              <div>
                <p className="workspace-scope">{event?.title ?? "Hazard event"}</p>
                <h2>Consolidated incident report</h2>
              </div>
              <StatusBadge status={report.status} />
            </div>
            <p>{report.narrative}</p>

            <SourceLineageRail stages={stages} label="Incident report lineage" />

            {report.correctionNote && (
              <div className="callout callout-warning">
                <strong>Correction requested by {report.reviewedBy}</strong>
                <p>{report.correctionNote}</p>
              </div>
            )}
            {notYetVerified.length > 0 && (
              <div className="callout callout-warning">
                <strong>{notYetVerified.length} Purok report{notYetVerified.length === 1 ? "" : "s"} not yet verified</strong>
                <p>
                  {notYetVerified.map((r) => r.purokName).join(", ")} excluded from totals below until verified.
                  Figures are provisional, not zero impact.
                </p>
              </div>
            )}

            <dl className="totals-grid">
              <div><dt>Affected families</dt><dd className="tabular-nums">{totals.affectedFamilies}</dd></div>
              <div><dt>Affected persons</dt><dd className="tabular-nums">{totals.affectedPersons}</dd></div>
              <div><dt>Displaced families</dt><dd className="tabular-nums">{totals.displacedFamilies}</dd></div>
              <div><dt>Deaths</dt><dd className="tabular-nums">{totals.deaths}</dd></div>
              <div><dt>Injured</dt><dd className="tabular-nums">{totals.injured}</dd></div>
            </dl>

            <h3>Verified Purok sources</h3>
            <ol className="record-list">
              {verified.map((r) => (
                <li key={r.id}>
                  <Link className="record-row" href={`/barangay/incidents/verification/${r.id}`}>
                    <span className="record-row-title">
                      <strong>{r.purokName}</strong>
                      <span>Verified by {r.reviewedBy}</span>
                    </span>
                    <span className="record-row-meta tabular-nums">
                      {r.data.affectedPopulation.affectedFamilies ?? 0} families affected
                    </span>
                    <StatusBadge status={r.status} />
                  </Link>
                </li>
              ))}
              {verified.length === 0 && <li className="record-list-empty">No verified Purok sources yet.</li>}
            </ol>

            <h3>Barangay-level additions</h3>
            <p>{report.additions.note}</p>
          </section>
        );
      })}
      {reports.length === 0 && <p className="record-list-empty">No Barangay incident reports on file.</p>}
    </RoleShell>
  );
}
