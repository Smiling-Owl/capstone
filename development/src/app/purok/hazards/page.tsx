"use client";

import { RoleShell } from "@/components/role-shell";
import { HazardEventList } from "@/components/hazard/hazard-event-list";
import { HazardEventCreateForm } from "@/components/hazard/hazard-event-create-form";
import { PUROK_NAV, ROLE_META } from "@/lib/role-nav";
import { usePrototypeStore } from "@/lib/prototype-store";

const BARANGAY = "Barangay Tetuan";
const CITY = "Zamboanga City";
const CURRENT_USER = "Maria Santos";

export default function PurokHazardsPage() {
  const meta = ROLE_META.purok;
  const { hazardEvents } = usePrototypeStore();
  const events = hazardEvents.filter((e) => e.barangay === BARANGAY || e.barangay === "Citywide");

  return (
    <RoleShell
      role="purok"
      subtitle={meta.subtitle}
      nav={PUROK_NAV}
      mobileNav={PUROK_NAV}
      activeHref="/purok/hazards"
      userInitials={meta.userInitials}
      userName={meta.userName}
    >
      <header className="role-header">
        <div>
          <p className="workspace-scope">{BARANGAY}</p>
          <h1>Hazard Event Creation</h1>
        </div>
      </header>
      <HazardEventCreateForm
        createdByLevel="purok"
        createdBy={CURRENT_USER}
        barangay={BARANGAY}
        city={CITY}
        activateImmediately={false}
      />
      <section className="panel">
        <h2>Hazard events affecting {BARANGAY}</h2>
        <p>Includes events created at any level, most recent first.</p>
        <HazardEventList events={events} reviewer={CURRENT_USER} />
      </section>
    </RoleShell>
  );
}
