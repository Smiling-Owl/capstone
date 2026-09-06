"use client";

import { useParams, useRouter } from "next/navigation";
import { RoleShell } from "@/components/role-shell";
import { StatusBadge } from "@/components/status-badge";
import { LineageStage, SourceLineageRail } from "@/components/source-lineage-rail";
import { ReviewDecisionPanel } from "@/components/review-decision-panel";
import { BARANGAY_MOBILE_NAV, BARANGAY_NAV, ROLE_META } from "@/lib/role-nav";
import { usePrototypeStore } from "@/lib/prototype-store";
import { INCIDENT_VERSION_LABEL } from "@/lib/hazard-data";

const REVIEWER = "Ariel Consing";

function formatDateTime(iso?: string) {
  if (!iso) return undefined;
  return new Date(iso).toLocaleString(undefined, { month: "short", day: "numeric", hour: "2-digit", minute: "2-digit" });
}

export default function BarangayIncidentDetailPage() {
  const params = useParams<{ recordId: string }>();
  const router = useRouter();
  const { incidentReports, hazardEvents, verifyIncidentReport, requestIncidentCorrection, rejectIncidentReport } = usePrototypeStore();
  const record = incidentReports.find((r) => r.id === params.recordId);
  const meta = ROLE_META.barangay;

  if (!record) {
    return (
      <RoleShell role="barangay" subtitle={meta.subtitle} nav={BARANGAY_NAV} mobileNav={BARANGAY_MOBILE_NAV} activeHref="/barangay/incidents/verification" userInitials={meta.userInitials} userName={meta.userName}>
        <p>Incident report not found.</p>
      </RoleShell>
    );
  }

  const event = hazardEvents.find((e) => e.id === record.hazardEventId);
  const actionable = record.status === "submitted" || record.status === "under_review";
  const { eventAndLocation: loc, prevailingSituation: sit, affectedPopulation: pop, casualtiesAndDisplacement: cas, responseAndNeeds: resp } = record.data;

  const stages: LineageStage[] = [
    { label: "Purok submission", detail: record.submittedBy, timestamp: formatDateTime(record.submittedAt), state: record.submittedAt ? "complete" : "pending" },
    {
      label: "Barangay verification",
      detail: record.reviewedBy ?? (actionable ? "Awaiting decision" : undefined),
      timestamp: formatDateTime(record.reviewedAt),
      state: record.status === "verified" ? "complete" : record.status === "rejected" || record.status === "correction_requested" ? "blocked" : actionable ? "current" : "pending",
    },
    { label: "Barangay incident report", state: record.status === "verified" ? "current" : "pending" },
    { label: "DRRM verification", state: "pending" },
  ];

  return (
    <RoleShell role="barangay" subtitle={meta.subtitle} nav={BARANGAY_NAV} mobileNav={BARANGAY_MOBILE_NAV} activeHref="/barangay/incidents/verification" userInitials={meta.userInitials} userName={meta.userName}>
      <div className="record-detail-header">
        <div>
          <p className="workspace-scope">{record.barangay} · {event?.title ?? "Hazard event"}</p>
          <h2>{record.purokName} {INCIDENT_VERSION_LABEL[record.version]}</h2>
        </div>
        <StatusBadge status={record.status} />
      </div>

      <SourceLineageRail stages={stages} />

      {record.correctionNote && (
        <div className={record.status === "rejected" ? "callout callout-urgent" : "callout callout-warning"}>
          <strong>{record.status === "rejected" ? "Rejected" : "Correction requested"} by {record.reviewedBy}</strong>
          <p>{record.correctionNote}</p>
        </div>
      )}

      <section className="panel">
        <h2>Reported values</h2>
        <div className="review-summary">
          <div className="review-summary-section">
            <header><h3>Event and Location</h3></header>
            <dl>
              <div><dt>Location</dt><dd>{loc.administrativeLocation}</dd></div>
              <div><dt>Landmark</dt><dd>{loc.landmark}</dd></div>
              <div><dt>Reporter</dt><dd>{loc.reporterName}</dd></div>
              <div><dt>Observation time</dt><dd>{loc.observationTime ?? "Not entered"}</dd></div>
            </dl>
          </div>
          <div className="review-summary-section">
            <header><h3>Prevailing Situation</h3></header>
            <dl>
              <div><dt>Summary</dt><dd>{sit.summary || "Not entered"}</dd></div>
              <div><dt>Intensity</dt><dd>{sit.hazardIntensity ?? "Not yet assessed"}</dd></div>
            </dl>
          </div>
          {record.version !== "initial" && (
            <>
              <div className="review-summary-section">
                <header><h3>Affected Population</h3></header>
                <dl>
                  <div><dt>Affected families</dt><dd className="tabular-nums">{pop.affectedFamilies}</dd></div>
                  <div><dt>Evacuated persons</dt><dd className="tabular-nums">{pop.evacuatedPersons}</dd></div>
                </dl>
              </div>
              <div className="review-summary-section">
                <header><h3>Casualties and Displacement</h3></header>
                <dl>
                  <div><dt>Deaths</dt><dd className="tabular-nums">{cas.deaths}</dd></div>
                  <div><dt>Displaced families</dt><dd className="tabular-nums">{cas.displacedFamilies}</dd></div>
                </dl>
              </div>
            </>
          )}
          <div className="review-summary-section">
            <header><h3>Response Actions and Immediate Needs</h3></header>
            <dl>
              <div><dt>Immediate needs</dt><dd>{resp.immediateNeeds || "Not entered"}</dd></div>
              <div><dt>Response actions taken</dt><dd>{resp.responseActionsTaken || "Not entered"}</dd></div>
            </dl>
          </div>
        </div>
      </section>

      {actionable && (
        <section className="panel">
          <h2>Verification decision</h2>
          <ReviewDecisionPanel
            onVerify={() => {
              verifyIncidentReport(record.id, REVIEWER);
              router.push("/barangay/incidents/verification");
            }}
            onCorrection={(note) => {
              requestIncidentCorrection(record.id, REVIEWER, note);
              router.push("/barangay/incidents/verification");
            }}
            onReject={(note) => {
              rejectIncidentReport(record.id, REVIEWER, note);
              router.push("/barangay/incidents/verification");
            }}
          />
        </section>
      )}
    </RoleShell>
  );
}
