"use client";

import { RoleShell } from "@/components/role-shell";
import { HazardEventList } from "@/components/hazard/hazard-event-list";
import { HazardEventCreateForm } from "@/components/hazard/hazard-event-create-form";
import { DRRM_MOBILE_NAV, DRRM_NAV, ROLE_META } from "@/lib/role-nav";
import { usePrototypeStore } from "@/lib/prototype-store";

const CITY = "Zamboanga City";
const REVIEWER = "DRRM Verification Desk";

export default function DrrmHazardsPage() {
  const meta = ROLE_META.drrm;
  const { hazardEvents } = usePrototypeStore();

  return (
    <RoleShell
      role="drrm"
      subtitle={meta.subtitle}
      nav={DRRM_NAV}
      mobileNav={DRRM_MOBILE_NAV}
      activeHref="/drrm/hazards"
      userInitials={meta.userInitials}
      userName={meta.userName}
    >
      <header className="role-header">
        <div>
          <p className="workspace-scope">{meta.subtitle}</p>
          <h1>Hazard Event Creation and Review</h1>
        </div>
      </header>
      <HazardEventCreateForm
        createdByLevel="drrm"
        createdBy={REVIEWER}
        barangay="Citywide"
        city={CITY}
        activateImmediately
      />
      <section className="panel">
        <h2>Hazard events citywide</h2>
        <p>Verify Barangay-created events below. DRRM-created events above activate immediately.</p>
        <HazardEventList events={hazardEvents} reviewer={REVIEWER} reviewableCreatorLevel="barangay" />
      </section>
    </RoleShell>
  );
}
