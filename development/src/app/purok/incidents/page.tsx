"use client";

import Link from "next/link";
import { RoleShell } from "@/components/role-shell";
import { StatusBadge } from "@/components/status-badge";
import { PUROK_NAV, ROLE_META } from "@/lib/role-nav";
import { usePrototypeStore } from "@/lib/prototype-store";
import { INCIDENT_VERSION_LABEL } from "@/lib/hazard-data";

const PUROK_NAME = "Purok 6";
const BARANGAY = "Barangay Tetuan";

export default function PurokIncidentsPage() {
  const meta = ROLE_META.purok;
  const { incidentReports, hazardEvents } = usePrototypeStore();
  const records = incidentReports.filter((r) => r.purokName === PUROK_NAME && r.barangay === BARANGAY);

  return (
    <RoleShell
      role="purok"
      subtitle={meta.subtitle}
      nav={PUROK_NAV}
      mobileNav={PUROK_NAV}
      activeHref="/purok/incidents"
      userInitials={meta.userInitials}
      userName={meta.userName}
    >
      <header className="role-header">
        <div>
          <p className="workspace-scope">{meta.subtitle}</p>
          <h1>Purok Incident Reporting</h1>
        </div>
      </header>
      <p className="data-freshness">Incident reports are filed against an active hazard event.</p>
      <ol className="record-list">
        {records.map((record) => {
          const event = hazardEvents.find((e) => e.id === record.hazardEventId);
          const actionLabel =
            record.status === "draft" || record.status === "not_started"
              ? "Continue report"
              : record.status === "correction_requested"
                ? "Open correction"
                : "View report";
          return (
            <li key={record.id}>
              <Link className="record-row" href={`/purok/incidents/${record.id}`}>
                <span className="record-row-title">
                  <strong>{event?.title ?? "Hazard event"}</strong>
                  <span>{INCIDENT_VERSION_LABEL[record.version]}</span>
                </span>
                <span className="record-row-action">{actionLabel}</span>
                <StatusBadge status={record.status} />
              </Link>
            </li>
          );
        })}
        {records.length === 0 && <li className="record-list-empty">No incident reports filed yet.</li>}
      </ol>
    </RoleShell>
  );
}
