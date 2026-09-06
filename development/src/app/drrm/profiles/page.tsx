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

export default function DrrmProfilesPage() {
  const meta = ROLE_META.drrm;
  const { barangayProfiles } = usePrototypeStore();
  const records = barangayProfiles
    .slice()
    .sort((a, b) => QUEUE_ORDER.indexOf(a.status) - QUEUE_ORDER.indexOf(b.status));
  const period = records[0]?.reportingPeriodLabel ?? "";

  return (
    <RoleShell
      role="drrm"
      subtitle={meta.subtitle}
      nav={DRRM_NAV}
      mobileNav={DRRM_MOBILE_NAV}
      activeHref="/drrm/profiles"
      userInitials={meta.userInitials}
      userName={meta.userName}
    >
      <header className="role-header">
        <div>
          <p className="workspace-scope">{meta.subtitle}</p>
          <h1>Barangay Profile Verification</h1>
        </div>
        <p className="role-mode">{period}</p>
      </header>
      <p className="data-freshness">Reporting period {period}. Consolidated Barangay submissions citywide, most urgent first.</p>

      <ol className="record-list">
        {records.map((record) => (
          <li key={record.id}>
            <Link className="record-row" href={`/drrm/profiles/${record.id}`}>
              <span className="record-row-title">
                <strong>{record.barangay}</strong>
                <span>{record.submittedBy ? `Submitted by ${record.submittedBy}` : "Not yet submitted"}</span>
              </span>
              <span className="record-row-meta">
                {record.submittedAt ? `Submitted ${formatDate(record.submittedAt)}` : "No submission yet"}
              </span>
              <StatusBadge status={record.status} />
            </Link>
          </li>
        ))}
      </ol>
    </RoleShell>
  );
}

function formatDate(iso: string) {
  return new Date(iso).toLocaleDateString(undefined, { month: "short", day: "numeric" });
}
