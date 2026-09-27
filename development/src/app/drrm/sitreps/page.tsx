"use client";

import Link from "next/link";
import { RoleShell } from "@/components/role-shell";
import { StatusToneBadge } from "@/components/status-badge";
import { DRRM_MOBILE_NAV, DRRM_NAV, ROLE_META } from "@/lib/role-nav";
import { usePrototypeStore } from "@/lib/prototype-store";
import { SITREP_STATUS_LABEL, SITREP_STATUS_TONE } from "@/lib/sitrep-data";

function formatDate(iso?: string) {
  if (!iso) return undefined;
  return new Date(iso).toLocaleDateString(undefined, { month: "short", day: "numeric", year: "numeric" });
}

export default function SitRepCatalogPage() {
  const meta = ROLE_META.drrm;
  const { sitreps, hazardEvents } = usePrototypeStore();
  const sorted = sitreps
    .slice()
    .sort((a, b) => (b.approvedAt ?? b.preparedAt).localeCompare(a.approvedAt ?? a.preparedAt));
  const eventsWithoutSitrep = hazardEvents.filter((e) => !sitreps.some((s) => s.hazardEventId === e.id));

  return (
    <RoleShell
      role="drrm"
      subtitle={meta.subtitle}
      nav={DRRM_NAV}
      mobileNav={DRRM_MOBILE_NAV}
      activeHref="/drrm/sitreps"
      userInitials={meta.userInitials}
      userName={meta.userName}
    >
      <header className="role-header">
        <div>
          <p className="workspace-scope">{meta.subtitle}</p>
          <h1>SitRep Generation and Review</h1>
        </div>
        {eventsWithoutSitrep.length > 0 && (
          <Link className="primary-action" href="/drrm/sitreps/new">Generate new SitRep</Link>
        )}
      </header>

      <ol className="record-list">
        {sorted.map((sitrep) => {
          const event = hazardEvents.find((e) => e.id === sitrep.hazardEventId);
          return (
            <li key={sitrep.id}>
              <Link className="record-row" href={`/drrm/sitreps/${sitrep.id}`}>
                <span className="record-row-title">
                  <strong>{sitrep.title}</strong>
                  <span>{event?.barangay ?? ""} · {sitrep.reportingPeriodLabel} · Version {sitrep.generatedVersion}</span>
                </span>
                <span className="record-row-meta">
                  {sitrep.status === "exported"
                    ? `Exported ${formatDate(sitrep.exportedAt)}`
                    : sitrep.status === "approved"
                      ? `Approved ${formatDate(sitrep.approvedAt)}`
                      : `Prepared ${formatDate(sitrep.preparedAt)}`}
                </span>
                <StatusToneBadge label={SITREP_STATUS_LABEL[sitrep.status]} tone={SITREP_STATUS_TONE[sitrep.status]} />
              </Link>
            </li>
          );
        })}
        {sorted.length === 0 && <li className="record-list-empty">No SitReps generated yet.</li>}
      </ol>
    </RoleShell>
  );
}
