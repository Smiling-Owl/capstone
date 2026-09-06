"use client";

import Link from "next/link";
import { RoleShell } from "@/components/role-shell";
import { StatusBadge } from "@/components/status-badge";
import { PUROK_NAV, ROLE_META } from "@/lib/role-nav";
import { usePrototypeStore } from "@/lib/prototype-store";
import { INCIDENT_VERSION_LABEL } from "@/lib/hazard-data";

const PUROK_NAME = "Purok 6";
const BARANGAY = "Barangay Tetuan";

function formatDate(iso?: string) {
  if (!iso) return "Not submitted";
  return new Date(iso).toLocaleDateString(undefined, { month: "short", day: "numeric", year: "numeric" });
}

export default function PurokHistoryPage() {
  const meta = ROLE_META.purok;
  const { incidentReports, purokProfiles, hazardEvents } = usePrototypeStore();
  const incidents = incidentReports.filter((r) => r.purokName === PUROK_NAME && r.barangay === BARANGAY);
  const profiles = purokProfiles.filter((p) => p.purokName === PUROK_NAME && p.barangay === BARANGAY);

  return (
    <RoleShell
      role="purok"
      subtitle={meta.subtitle}
      nav={PUROK_NAV}
      mobileNav={PUROK_NAV}
      activeHref="/purok/history"
      userInitials={meta.userInitials}
      userName={meta.userName}
    >
      <header className="role-header">
        <div>
          <p className="workspace-scope">{meta.subtitle}</p>
          <h1>Purok Incident History</h1>
        </div>
      </header>

      <section className="panel">
        <h2>Incident reports</h2>
        <ol className="record-list">
          {incidents.map((record) => {
            const event = hazardEvents.find((e) => e.id === record.hazardEventId);
            return (
              <li key={record.id}>
                <Link className="record-row" href={`/purok/incidents/${record.id}`}>
                  <span className="record-row-title">
                    <strong>{event?.title ?? "Hazard event"}</strong>
                    <span>{INCIDENT_VERSION_LABEL[record.version]}</span>
                  </span>
                  <span className="record-row-meta">{formatDate(record.submittedAt)}</span>
                  <StatusBadge status={record.status} />
                </Link>
              </li>
            );
          })}
          {incidents.length === 0 && <li className="record-list-empty">No incident reports on file.</li>}
        </ol>
      </section>

      <section className="panel">
        <h2>Monthly profiles</h2>
        <ol className="record-list">
          {profiles.map((profile) => (
            <li key={profile.id}>
              <Link className="record-row" href="/purok/profile">
                <span className="record-row-title">
                  <strong>{profile.reportingPeriodLabel}</strong>
                  <span>Monthly CDRA profile</span>
                </span>
                <span className="record-row-meta">{formatDate(profile.submittedAt)}</span>
                <StatusBadge status={profile.status} />
              </Link>
            </li>
          ))}
        </ol>
      </section>
    </RoleShell>
  );
}
