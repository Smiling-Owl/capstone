"use client";

import { useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { RoleShell } from "@/components/role-shell";
import { StatusBadge } from "@/components/status-badge";
import { LineageStage, SourceLineageRail } from "@/components/source-lineage-rail";
import { BARANGAY_MOBILE_NAV, BARANGAY_NAV, ROLE_META } from "@/lib/role-nav";
import { usePrototypeStore } from "@/lib/prototype-store";
import { PurokProfileSections } from "@/lib/profile-data";

const REVIEWER = "Ariel Consing";

const COMPARISON_ROWS: { label: string; get: (d: PurokProfileSections) => string | number }[] = [
  { label: "Total households", get: (d) => d.population.totalHouseholds ?? 0 },
  { label: "Total population", get: (d) => d.population.totalPopulation ?? 0 },
  { label: "Senior citizens", get: (d) => d.population.seniorCitizens ?? 0 },
  { label: "Persons with disability", get: (d) => d.population.personsWithDisability ?? 0 },
  { label: "Informal settler households", get: (d) => d.population.informalSettlerHouseholds ?? 0 },
  { label: "Households in hazard zone", get: (d) => d.housing.householdsInHazardZone ?? 0 },
  { label: "Without early warning access", get: (d) => d.vulnerability.householdsWithoutEarlyWarningAccess ?? 0 },
  { label: "Trained responders", get: (d) => d.capacities.trainedResponders ?? 0 },
];

export default function BarangayProfileDetailPage() {
  const params = useParams<{ purokId: string }>();
  const router = useRouter();
  const { purokProfiles, verifyPurokProfile, requestPurokCorrection, rejectPurokProfile } = usePrototypeStore();
  const record = purokProfiles.find((p) => p.id === params.purokId);
  const [noteMode, setNoteMode] = useState<"correction" | "reject" | null>(null);
  const [note, setNote] = useState("");
  const meta = ROLE_META.barangay;

  if (!record) {
    return (
      <RoleShell
        role="barangay"
        subtitle={meta.subtitle}
        nav={BARANGAY_NAV}
        mobileNav={BARANGAY_MOBILE_NAV}
        activeHref="/barangay/profiles"
        userInitials={meta.userInitials}
        userName={meta.userName}
      >
        <p>Submission not found.</p>
      </RoleShell>
    );
  }

  const actionable = record.status === "submitted" || record.status === "under_review";

  const stages: LineageStage[] = [
    {
      label: "Purok submission",
      detail: record.submittedBy,
      timestamp: record.submittedAt ? formatDateTime(record.submittedAt) : undefined,
      state: record.submittedAt ? "complete" : "pending",
    },
    {
      label: "Barangay verification",
      detail: record.reviewedBy ?? (actionable ? "Awaiting decision" : undefined),
      timestamp: record.reviewedAt ? formatDateTime(record.reviewedAt) : undefined,
      state:
        record.status === "verified"
          ? "complete"
          : record.status === "rejected" || record.status === "correction_requested"
            ? "blocked"
            : actionable
              ? "current"
              : "pending",
    },
    { label: "Barangay consolidation", state: record.status === "verified" ? "current" : "pending" },
    { label: "DRRM verification", state: "pending" },
  ];

  function handleVerify() {
    if (!record) return;
    verifyPurokProfile(record.id, REVIEWER);
    router.push("/barangay/profiles");
  }

  function submitNote() {
    if (!record || !note.trim()) return;
    if (noteMode === "correction") requestPurokCorrection(record.id, REVIEWER, note.trim());
    if (noteMode === "reject") rejectPurokProfile(record.id, REVIEWER, note.trim());
    router.push("/barangay/profiles");
  }

  return (
    <RoleShell
      role="barangay"
      subtitle={meta.subtitle}
      nav={BARANGAY_NAV}
      mobileNav={BARANGAY_MOBILE_NAV}
      activeHref="/barangay/profiles"
      userInitials={meta.userInitials}
      userName={meta.userName}
    >
      <div className="record-detail-header">
        <div>
          <p className="workspace-scope">{record.barangay} · {record.reportingPeriodLabel}</p>
          <h2>{record.purokName} monthly profile</h2>
        </div>
        <StatusBadge status={record.status} />
      </div>

      <SourceLineageRail stages={stages} />

      {record.correctionNote && (
        <div className={`callout ${record.status === "rejected" ? "callout-urgent" : "callout-warning"}`}>
          <strong>{record.status === "rejected" ? "Rejected" : "Correction requested"} by {record.reviewedBy}</strong>
          <p>{record.correctionNote}</p>
        </div>
      )}

      <section className="panel">
        <h2>Reported values versus last verified period</h2>
        <p>{record.previousVerified.identification.reportingPeriodLabel} verified values compared to this submission.</p>
        <table className="comparison-table">
          <caption className="visually-hidden">Comparison of previous verified and current submitted values</caption>
          <thead>
            <tr>
              <th scope="col">Field</th>
              <th scope="col">Last verified</th>
              <th scope="col">This submission</th>
            </tr>
          </thead>
          <tbody>
            {COMPARISON_ROWS.map((row) => {
              const prevVal = row.get(record.previousVerified);
              const curVal = row.get(record.data);
              const changed = prevVal !== curVal;
              return (
                <tr key={row.label}>
                  <th scope="row">{row.label}</th>
                  <td className="tabular-nums">{String(prevVal)}</td>
                  <td className={changed ? "tabular-nums changed" : "tabular-nums"}>{String(curVal)}</td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </section>

      {actionable && (
        <section className="panel">
          <h2>Verification decision</h2>
          {noteMode === null ? (
            <div className="detail-actions">
              <button type="button" className="primary-action" onClick={handleVerify}>Verify</button>
              <button type="button" className="secondary-action" onClick={() => setNoteMode("correction")}>Request correction</button>
              <button type="button" className="secondary-action urgent-action" onClick={() => setNoteMode("reject")}>Reject</button>
            </div>
          ) : (
            <div className="correction-form">
              <label htmlFor="reviewer-note">
                {noteMode === "correction" ? "Describe what needs correction" : "Describe why this submission is rejected"}
              </label>
              <textarea id="reviewer-note" value={note} onChange={(e) => setNote(e.target.value)} required />
              <div className="correction-form-actions">
                <button type="button" className="primary-action" onClick={submitNote} disabled={!note.trim()}>
                  {noteMode === "correction" ? "Send correction request" : "Confirm rejection"}
                </button>
                <button
                  type="button"
                  className="secondary-action"
                  onClick={() => {
                    setNoteMode(null);
                    setNote("");
                  }}
                >
                  Cancel
                </button>
              </div>
            </div>
          )}
        </section>
      )}
    </RoleShell>
  );
}

function formatDateTime(iso: string) {
  return new Date(iso).toLocaleString(undefined, { month: "short", day: "numeric", hour: "2-digit", minute: "2-digit" });
}
