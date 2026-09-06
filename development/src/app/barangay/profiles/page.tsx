"use client";

import Link from "next/link";
import { RoleShell } from "@/components/role-shell";
import { StatusBadge } from "@/components/status-badge";
import { BARANGAY_MOBILE_NAV, BARANGAY_NAV, ROLE_META } from "@/lib/role-nav";
import { usePrototypeStore } from "@/lib/prototype-store";
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

export default function BarangayProfilesPage() {
  const meta = ROLE_META.barangay;
  const { purokProfiles } = usePrototypeStore();
  const records = purokProfiles
    .filter((p) => p.barangay === BARANGAY)
    .slice()
    .sort((a, b) => QUEUE_ORDER.indexOf(a.status) - QUEUE_ORDER.indexOf(b.status));
  const period = records[0]?.reportingPeriodLabel ?? "";

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
      <header className="role-header">
        <div>
          <p className="workspace-scope">{BARANGAY}</p>
          <h1>Purok Profile Verification</h1>
        </div>
        <p className="role-mode">{period}</p>
      </header>
      <p className="data-freshness">Reporting period {period}. All Puroks under {BARANGAY}, most urgent first.</p>

      <ol className="record-list">
        {records.map((record) => (
          <li key={record.id}>
            <Link className="record-row" href={`/barangay/profiles/${record.id}`}>
              <span className="record-row-title">
                <strong>{record.purokName}</strong>
                <span>
                  {record.submittedBy
                    ? `Submitted by ${record.submittedBy}`
                    : `Prepared by ${record.data.identification.preparedBy}, not yet submitted`}
                </span>
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
