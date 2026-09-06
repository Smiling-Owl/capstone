"use client";

import Link from "next/link";
import { RoleShell } from "@/components/role-shell";
import { StatusBadge } from "@/components/status-badge";
import { BARANGAY_MOBILE_NAV, BARANGAY_NAV, ROLE_META } from "@/lib/role-nav";
import { usePrototypeStore } from "@/lib/prototype-store";
import { INCIDENT_VERSION_LABEL } from "@/lib/hazard-data";
import { ProfileStatus } from "@/lib/profile-data";

const BARANGAY = "Barangay Tetuan";
const QUEUE_ORDER: ProfileStatus[] = [
  "correction_requested",
  "submitted",
  "under_review",
  "draft",
  "not_started",
  "rejected",
  "verified",
  "superseded",
];

function formatDate(iso?: string) {
  if (!iso) return "No submission yet";
  return `Submitted ${new Date(iso).toLocaleDateString(undefined, { month: "short", day: "numeric" })}`;
}

export default function BarangayIncidentVerificationPage() {
  const meta = ROLE_META.barangay;
  const { incidentReports, hazardEvents } = usePrototypeStore();
  const records = incidentReports
    .filter((r) => r.barangay === BARANGAY)
    .slice()
    .sort((a, b) => QUEUE_ORDER.indexOf(a.status) - QUEUE_ORDER.indexOf(b.status));

  return (
    <RoleShell
      role="barangay"
      subtitle={meta.subtitle}
      nav={BARANGAY_NAV}
      mobileNav={BARANGAY_MOBILE_NAV}
      activeHref="/barangay/incidents/verification"
      userInitials={meta.userInitials}
      userName={meta.userName}
    >
      <header className="role-header">
        <div>
          <p className="workspace-scope">{BARANGAY}</p>
          <h1>Purok Incident Verification</h1>
        </div>
      </header>
      <p className="data-freshness">All Purok incident reports under {BARANGAY}, most urgent first.</p>
      <ol className="record-list">
        {records.map((record) => {
          const event = hazardEvents.find((e) => e.id === record.hazardEventId);
          return (
            <li key={record.id}>
              <Link className="record-row" href={`/barangay/incidents/verification/${record.id}`}>
                <span className="record-row-title">
                  <strong>{record.purokName} · {event?.title ?? "Hazard event"}</strong>
                  <span>{INCIDENT_VERSION_LABEL[record.version]} · {record.submittedBy ?? "Not yet submitted"}</span>
                </span>
                <span className="record-row-meta">{formatDate(record.submittedAt)}</span>
                <StatusBadge status={record.status} />
              </Link>
            </li>
          );
        })}
        {records.length === 0 && <li className="record-list-empty">No incident reports on file.</li>}
      </ol>
    </RoleShell>
  );
}
