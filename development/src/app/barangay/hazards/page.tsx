"use client";

import { RoleShell } from "@/components/role-shell";
import { HazardEventList } from "@/components/hazard/hazard-event-list";
import { HazardEventCreateForm } from "@/components/hazard/hazard-event-create-form";
import { BARANGAY_MOBILE_NAV, BARANGAY_NAV, ROLE_META } from "@/lib/role-nav";
import { usePrototypeStore } from "@/lib/prototype-store";

const BARANGAY = "Barangay Tetuan";
const CITY = "Zamboanga City";
const REVIEWER = "Ariel Consing";

export default function BarangayHazardsPage() {
  const meta = ROLE_META.barangay;
  const { hazardEvents } = usePrototypeStore();
  const events = hazardEvents.filter((e) => e.barangay === BARANGAY || e.barangay === "Citywide");

  return (
    <RoleShell
      role="barangay"
      subtitle={meta.subtitle}
      nav={BARANGAY_NAV}
      mobileNav={BARANGAY_MOBILE_NAV}
      activeHref="/barangay/hazards"
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
        createdByLevel="barangay"
        createdBy={REVIEWER}
        barangay={BARANGAY}
        city={CITY}
        activateImmediately={false}
      />
      <section className="panel">
        <h2>Hazard events for {BARANGAY}</h2>
        <p>Verify Purok-submitted events below. Barangay-created events above require DRRM verification.</p>
        <HazardEventList events={events} reviewer={REVIEWER} reviewableCreatorLevel="purok" />
      </section>
    </RoleShell>
  );
}
