"use client";

import Link from "next/link";
import { RoleShell } from "@/components/role-shell";
import { StatusBadge } from "@/components/status-badge";
import { DRRM_MOBILE_NAV, DRRM_NAV, ROLE_META } from "@/lib/role-nav";
import { usePrototypeStore } from "@/lib/prototype-store";
import { ProfileStatus } from "@/lib/profile-data";

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

export default function DrrmIncidentVerificationPage() {
  const meta = ROLE_META.drrm;
  const { barangayIncidentReports, hazardEvents } = usePrototypeStore();
  const records = barangayIncidentReports
    .slice()
    .sort((a, b) => QUEUE_ORDER.indexOf(a.status) - QUEUE_ORDER.indexOf(b.status));

  return (
    <RoleShell
      role="drrm"
      subtitle={meta.subtitle}
      nav={DRRM_NAV}
      mobileNav={DRRM_MOBILE_NAV}
      activeHref="/drrm/incidents/verification"
      userInitials={meta.userInitials}
      userName={meta.userName}
    >
      <header className="role-header">
        <div>
          <p className="workspace-scope">{meta.subtitle}</p>
          <h1>Barangay Incident Verification</h1>
        </div>
      </header>
      <p className="data-freshness">Consolidated Barangay incident reports citywide, most urgent first.</p>
      <ol className="record-list">
        {records.map((record) => {
          const event = hazardEvents.find((e) => e.id === record.hazardEventId);
          return (
            <li key={record.id}>
              <Link className="record-row" href={`/drrm/incidents/verification/${record.id}`}>
                <span className="record-row-title">
                  <strong>{record.barangay} · {event?.title ?? "Hazard event"}</strong>
                  <span>{record.submittedBy ? `Submitted by ${record.submittedBy}` : "Not yet submitted"}</span>
                </span>
                <span className="record-row-meta">{formatDate(record.submittedAt)}</span>
                <StatusBadge status={record.status} />
              </Link>
            </li>
          );
        })}
        {records.length === 0 && <li className="record-list-empty">No Barangay incident reports on file.</li>}
      </ol>
    </RoleShell>
  );
}
