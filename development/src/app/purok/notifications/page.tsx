"use client";

import { RoleShell } from "@/components/role-shell";
import { NotificationFeed } from "@/components/notification-feed";
import { PUROK_NAV, ROLE_META } from "@/lib/role-nav";
import { usePrototypeStore } from "@/lib/prototype-store";
import { buildPurokNotificationFeed } from "@/lib/notification-data";

const PUROK_NAME = "Purok 6";
const BARANGAY = "Barangay Tetuan";

export default function PurokNotificationsPage() {
  const meta = ROLE_META.purok;
  const { purokProfiles, incidentReports, hazardEvents, config } = usePrototypeStore();
  const currentCycle = config.cycles.find((cycle) => cycle.isCurrent);

  const items = buildPurokNotificationFeed({
    purokName: PUROK_NAME,
    barangay: BARANGAY,
    profiles: purokProfiles,
    incidents: incidentReports,
    hazardEvents,
    currentCycle,
  });

  return (
    <RoleShell
      role="purok"
      subtitle={meta.subtitle}
      nav={PUROK_NAV}
      mobileNav={PUROK_NAV}
      activeHref="/purok/notifications"
      userInitials={meta.userInitials}
      userName={meta.userName}
    >
      <header className="role-header">
        <div>
          <p className="workspace-scope">{meta.subtitle}</p>
          <h1>Notification Center</h1>
        </div>
      </header>
      <p className="data-freshness">
        In-app notifications about your profiles, incident reports, and active hazards. Notifications reflect the
        current state of each record; they refresh as decisions are made.
      </p>
      <section className="panel">
        <h2>For {PUROK_NAME}</h2>
        <NotificationFeed
          items={items}
          emptyMessage="Nothing needs your attention right now."
        />
      </section>
    </RoleShell>
  );
}
