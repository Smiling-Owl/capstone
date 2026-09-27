"use client";

import { RoleShell } from "@/components/role-shell";
import { AccountPanel } from "@/components/account-panel";
import { NotificationFeed } from "@/components/notification-feed";
import { BARANGAY_MOBILE_NAV, BARANGAY_NAV, ROLE_META } from "@/lib/role-nav";
import { usePrototypeStore } from "@/lib/prototype-store";
import { buildBarangayNotificationFeed } from "@/lib/notification-data";
import { DEMO_ACCOUNT_HANDLES } from "@/lib/account-data";

const BARANGAY = "Barangay Tetuan";

export default function BarangayAccountPage() {
  const meta = ROLE_META.barangay;
  const { users, purokProfiles, incidentReports, barangayIncidentReports, hazardEvents } = usePrototypeStore();
  const account = users.find((user) => user.username === DEMO_ACCOUNT_HANDLES.barangay);

  const notifications = buildBarangayNotificationFeed({
    barangay: BARANGAY,
    purokProfiles,
    purokIncidents: incidentReports,
    barangayIncidents: barangayIncidentReports,
    hazardEvents,
  });

  return (
    <RoleShell
      role="barangay"
      subtitle={meta.subtitle}
      nav={BARANGAY_NAV}
      mobileNav={BARANGAY_MOBILE_NAV}
      activeHref="/barangay/account"
      userInitials={meta.userInitials}
      userName={meta.userName}
    >
      <header className="role-header">
        <div>
          <p className="workspace-scope">{BARANGAY}</p>
          <h1>Notifications and Account</h1>
        </div>
      </header>
      <p className="data-freshness">
        In-app notifications about Purok submissions and review decisions for {BARANGAY}, alongside your account
        details.
      </p>

      <section className="panel">
        <h2>Notifications</h2>
        <NotificationFeed
          items={notifications}
          emptyMessage="No Purok submissions or review items need attention in this Barangay."
        />
      </section>

      <div className="settings-grid">
        {account ? (
          <AccountPanel user={account} />
        ) : (
          <section className="setting-block">
            <h2>Account</h2>
            <p>The demonstration account could not be found in this prototype session.</p>
          </section>
        )}
        <section className="setting-block">
          <h2>About this workspace</h2>
          <p>Your account is issued by the Zamboanga City DRRM Office.</p>
          <div className="callout">
            <p>
              Verification decisions you make are recorded against the submitted version and appear in the DRRM system
              audit log. Corrections create a new version; submitted versions are never silently edited.
            </p>
          </div>
        </section>
      </div>
    </RoleShell>
  );
}
