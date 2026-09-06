"use client";

import { useRouter } from "next/navigation";
import { RoleShell } from "@/components/role-shell";
import { StatusBadge } from "@/components/status-badge";
import { DRRM_NAV, ROLE_META } from "@/lib/role-nav";
import { usePrototypeStore } from "@/lib/prototype-store";
import { buildInitialSitRepSections } from "@/lib/sitrep-data";

const PREPARER = "DRRM Verification Desk";
const TEMPLATE_VERSION = "NDRRMC SitRep Template v2024.1";

export default function NewSitRepPage() {
  const meta = ROLE_META.drrm;
  const router = useRouter();
  const { hazardEvents, barangayIncidentReports, sitreps, generateSitRep } = usePrototypeStore();
  const eventsWithoutSitrep = hazardEvents.filter((e) => !sitreps.some((s) => s.hazardEventId === e.id));

  function handleGenerate(eventId: string) {
    const event = hazardEvents.find((e) => e.id === eventId)!;
    const eligibleIncidents = barangayIncidentReports.filter((r) => r.hazardEventId === eventId && r.status === "verified");
    const id = generateSitRep({
      hazardEventId: eventId,
      title: event.title,
      reportingPeriodLabel: "September 2026",
      templateVersion: TEMPLATE_VERSION,
      preparedBy: PREPARER,
      includedBarangayIncidentIds: eligibleIncidents.map((r) => r.id),
      sections: buildInitialSitRepSections(event, eligibleIncidents),
    });
    router.push(`/drrm/sitreps/${id}`);
  }

  return (
    <RoleShell
      role="drrm"
      subtitle={meta.subtitle}
      nav={DRRM_NAV}
      mobileNav={DRRM_NAV}
      activeHref="/drrm/sitreps"
      userInitials={meta.userInitials}
      userName={meta.userName}
    >
      <header className="role-header">
        <div>
          <p className="workspace-scope">{meta.subtitle}</p>
          <h1>Generate a SitRep</h1>
        </div>
      </header>
      <p className="data-freshness">
        Pick a hazard event. Situation, area, and casualty sections are pre-filled from DRRM-verified Barangay
        incident reports; events with no verified sources yet still generate, but those sections start blank.
      </p>

      <ol className="hazard-list">
        {eventsWithoutSitrep.map((event) => {
          const allIncidents = barangayIncidentReports.filter((r) => r.hazardEventId === event.id);
          const eligible = allIncidents.filter((r) => r.status === "verified");
          return (
            <li key={event.id} className="hazard-row">
              <div className="hazard-row-header">
                <div>
                  <strong>{event.title}</strong>
                </div>
                <StatusBadge status={event.status} />
              </div>
              <p className="hazard-row-meta">{event.barangay}</p>
              <p className="hazard-row-description">
                {eligible.length} of {allIncidents.length} Barangay incident report{allIncidents.length === 1 ? "" : "s"} verified and eligible for inclusion.
                {allIncidents.length === 0 && " No Barangay incident report has been consolidated for this event yet."}
              </p>
              <div className="detail-actions">
                <button type="button" className="primary-action" onClick={() => handleGenerate(event.id)}>
                  Generate SitRep draft
                </button>
              </div>
            </li>
          );
        })}
        {eventsWithoutSitrep.length === 0 && (
          <li className="record-list-empty">Every hazard event already has a SitRep on file.</li>
        )}
      </ol>
    </RoleShell>
  );
}
