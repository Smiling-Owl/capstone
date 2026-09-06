"use client";

import { useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { RoleShell } from "@/components/role-shell";
import { StatusBadge } from "@/components/status-badge";
import { LineageStage, SourceLineageRail } from "@/components/source-lineage-rail";
import { DRRM_MOBILE_NAV, DRRM_NAV, ROLE_META } from "@/lib/role-nav";
import { usePrototypeStore } from "@/lib/prototype-store";
import { consolidateBarangayTotals } from "@/lib/profile-data";

const REVIEWER = "DRRM Verification Desk";

export default function DrrmProfileDetailPage() {
  const params = useParams<{ barangayId: string }>();
  const router = useRouter();
  const { purokProfiles, barangayProfiles, verifyBarangayProfile, requestBarangayCorrection } = usePrototypeStore();
  const record = barangayProfiles.find((b) => b.id === params.barangayId);
  const [noteMode, setNoteMode] = useState(false);
  const [note, setNote] = useState("");
  const meta = ROLE_META.drrm;

  if (!record) {
    return (
      <RoleShell role="drrm" subtitle={meta.subtitle} nav={DRRM_NAV} mobileNav={DRRM_MOBILE_NAV} activeHref="/drrm/profiles" userInitials={meta.userInitials} userName={meta.userName}>
        <p>Submission not found.</p>
      </RoleShell>
    );
  }

  const puroksForBarangay = purokProfiles.filter((p) => p.barangay === record.barangay);
  const hasPurokSource = puroksForBarangay.length > 0;
  const consolidation = hasPurokSource ? consolidateBarangayTotals(puroksForBarangay, record.additions) : null;
  const actionable = record.status === "submitted" || record.status === "under_review";

  const stages: LineageStage[] = [
    {
      label: "Purok sources",
      detail: hasPurokSource ? `${consolidation!.verified.length} of ${puroksForBarangay.length} verified` : "Not tracked in this prototype",
      state: hasPurokSource ? (consolidation!.notYetVerified.length === 0 ? "complete" : "current") : "pending",
    },
    { label: "Barangay consolidation", detail: record.submittedBy, timestamp: record.submittedAt ? formatDate(record.submittedAt) : undefined, state: "complete" },
    {
      label: "DRRM verification",
      detail: record.reviewedBy ?? (actionable ? "Awaiting decision" : undefined),
      timestamp: record.reviewedAt ? formatDate(record.reviewedAt) : undefined,
      state: record.status === "verified" ? "complete" : record.status === "correction_requested" ? "blocked" : actionable ? "current" : "pending",
    },
  ];

  function handleVerify() {
    if (!record) return;
    verifyBarangayProfile(record.id, REVIEWER);
    router.push("/drrm/profiles");
  }

  function submitNote() {
    if (!record || !note.trim()) return;
    requestBarangayCorrection(record.id, REVIEWER, note.trim());
    router.push("/drrm/profiles");
  }

  return (
    <RoleShell role="drrm" subtitle={meta.subtitle} nav={DRRM_NAV} mobileNav={DRRM_MOBILE_NAV} activeHref="/drrm/profiles" userInitials={meta.userInitials} userName={meta.userName}>
      <div className="record-detail-header">
        <div>
          <p className="workspace-scope">{record.city} · {record.reportingPeriodLabel}</p>
          <h2>{record.barangay} consolidated profile</h2>
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
        <h2>Consolidated totals</h2>
        {consolidation ? (
          <>
            <p>Denominator: {consolidation.verified.length} verified Purok{consolidation.verified.length === 1 ? "" : "s"} of {puroksForBarangay.length}, plus Barangay-wide additions.</p>
            <dl className="totals-grid">
              <div><dt>Total households</dt><dd className="tabular-nums">{consolidation.totals.totalHouseholds}</dd></div>
              <div><dt>Total population</dt><dd className="tabular-nums">{consolidation.totals.totalPopulation}</dd></div>
              <div><dt>Households in hazard zone</dt><dd className="tabular-nums">{consolidation.totals.householdsInHazardZone}</dd></div>
            </dl>
          </>
        ) : (
          <>
            <div className="callout">
              <strong>Purok-level source records unavailable</strong>
              <p>This prototype only seeds Purok-level detail for Barangay Tetuan. Figures below are Barangay-reported additions only, not a full consolidation.</p>
            </div>
            <dl className="totals-grid">
              <div><dt>Barangay-wide households</dt><dd className="tabular-nums">{record.additions.barangayWideHouseholds}</dd></div>
              <div><dt>Barangay-wide population</dt><dd className="tabular-nums">{record.additions.barangayWidePopulation}</dd></div>
            </dl>
          </>
        )}
        <p>{record.additions.note}</p>
      </section>

      {actionable && (
        <section className="panel">
          <h2>Verification decision</h2>
          {!noteMode ? (
            <div className="detail-actions">
              <button type="button" className="primary-action" onClick={handleVerify}>Verify</button>
              <button type="button" className="secondary-action" onClick={() => setNoteMode(true)}>Request correction</button>
            </div>
          ) : (
            <div className="correction-form">
              <label htmlFor="drrm-reviewer-note">Describe what needs correction</label>
              <textarea id="drrm-reviewer-note" value={note} onChange={(e) => setNote(e.target.value)} required />
              <div className="correction-form-actions">
                <button type="button" className="primary-action" onClick={submitNote} disabled={!note.trim()}>Send correction request</button>
                <button type="button" className="secondary-action" onClick={() => { setNoteMode(false); setNote(""); }}>Cancel</button>
              </div>
            </div>
          )}
        </section>
      )}
    </RoleShell>
  );
}

function formatDate(iso: string) {
  return new Date(iso).toLocaleString(undefined, { month: "short", day: "numeric", hour: "2-digit", minute: "2-digit" });
}
