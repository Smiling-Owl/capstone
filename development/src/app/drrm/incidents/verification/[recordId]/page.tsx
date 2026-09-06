"use client";

import { useParams, useRouter } from "next/navigation";
import { RoleShell } from "@/components/role-shell";
import { StatusBadge } from "@/components/status-badge";
import { LineageStage, SourceLineageRail } from "@/components/source-lineage-rail";
import { ReviewDecisionPanel } from "@/components/review-decision-panel";
import { DRRM_MOBILE_NAV, DRRM_NAV, ROLE_META } from "@/lib/role-nav";
import { usePrototypeStore } from "@/lib/prototype-store";
import { consolidateIncidentTotals } from "@/lib/hazard-data";

const REVIEWER = "DRRM Verification Desk";

function formatDate(iso?: string) {
  if (!iso) return undefined;
  return new Date(iso).toLocaleString(undefined, { month: "short", day: "numeric", hour: "2-digit", minute: "2-digit" });
}

export default function DrrmIncidentDetailPage() {
  const params = useParams<{ recordId: string }>();
  const router = useRouter();
  const { barangayIncidentReports, incidentReports, hazardEvents, verifyBarangayIncidentReport, requestBarangayIncidentCorrection } = usePrototypeStore();
  const record = barangayIncidentReports.find((r) => r.id === params.recordId);
  const meta = ROLE_META.drrm;

  if (!record) {
    return (
      <RoleShell role="drrm" subtitle={meta.subtitle} nav={DRRM_NAV} mobileNav={DRRM_MOBILE_NAV} activeHref="/drrm/incidents/verification" userInitials={meta.userInitials} userName={meta.userName}>
        <p>Submission not found.</p>
      </RoleShell>
    );
  }

  const event = hazardEvents.find((e) => e.id === record.hazardEventId);
  const purokReports = incidentReports.filter((r) => r.hazardEventId === record.hazardEventId && r.barangay === record.barangay);
  const hasPurokSource = purokReports.length > 0;
  const consolidation = hasPurokSource ? consolidateIncidentTotals(purokReports, record.additions) : null;
  const actionable = record.status === "submitted" || record.status === "under_review";

  const stages: LineageStage[] = [
    { label: "Purok sources", detail: hasPurokSource ? `${consolidation!.verified.length} of ${purokReports.length} verified` : "Not tracked in this prototype", state: hasPurokSource ? (consolidation!.notYetVerified.length === 0 ? "complete" : "current") : "pending" },
    { label: "Barangay incident report", detail: record.submittedBy, timestamp: formatDate(record.submittedAt), state: "complete" },
    {
      label: "DRRM verification",
      detail: record.reviewedBy ?? (actionable ? "Awaiting decision" : undefined),
      timestamp: formatDate(record.reviewedAt),
      state: record.status === "verified" ? "complete" : record.status === "correction_requested" ? "blocked" : actionable ? "current" : "pending",
    },
  ];

  return (
    <RoleShell role="drrm" subtitle={meta.subtitle} nav={DRRM_NAV} mobileNav={DRRM_MOBILE_NAV} activeHref="/drrm/incidents/verification" userInitials={meta.userInitials} userName={meta.userName}>
      <div className="record-detail-header">
        <div>
          <p className="workspace-scope">{record.city} · {event?.title ?? "Hazard event"}</p>
          <h2>{record.barangay} consolidated incident report</h2>
        </div>
        <StatusBadge status={record.status} />
      </div>

      <SourceLineageRail stages={stages} />

      {record.correctionNote && (
        <div className="callout callout-warning">
          <strong>Correction requested by {record.reviewedBy}</strong>
          <p>{record.correctionNote}</p>
        </div>
      )}

      <section className="panel">
        <h2>Situation narrative</h2>
        <p>{record.narrative}</p>
        {consolidation ? (
          <dl className="totals-grid">
            <div><dt>Affected families</dt><dd className="tabular-nums">{consolidation.totals.affectedFamilies}</dd></div>
            <div><dt>Displaced families</dt><dd className="tabular-nums">{consolidation.totals.displacedFamilies}</dd></div>
            <div><dt>Deaths</dt><dd className="tabular-nums">{consolidation.totals.deaths}</dd></div>
          </dl>
        ) : (
          <div className="callout">
            <strong>Purok-level source records unavailable</strong>
            <p>This prototype only seeds Purok-level incident detail for Barangay Tetuan.</p>
          </div>
        )}
        <p>{record.additions.note}</p>
      </section>

      {actionable && (
        <section className="panel">
          <h2>Verification decision</h2>
          <ReviewDecisionPanel
            onVerify={() => {
              verifyBarangayIncidentReport(record.id, REVIEWER);
              router.push("/drrm/incidents/verification");
            }}
            onCorrection={(note) => {
              requestBarangayIncidentCorrection(record.id, REVIEWER, note);
              router.push("/drrm/incidents/verification");
            }}
          />
        </section>
      )}
    </RoleShell>
  );
}
