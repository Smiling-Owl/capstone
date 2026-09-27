"use client";

import { RoleShell } from "@/components/role-shell";
import { UserDirectory } from "@/components/user-directory";
import { DRRM_MOBILE_NAV, DRRM_NAV, ROLE_META } from "@/lib/role-nav";

const MANAGER = "DRRM Verification Desk";
const AUTHORITY = "Zamboanga City DRRM Office Administrator";

export default function DrrmSystemUsersPage() {
  const meta = ROLE_META.drrm;
  return (
    <RoleShell
      role="drrm"
      subtitle={meta.subtitle}
      nav={DRRM_NAV}
      mobileNav={DRRM_MOBILE_NAV}
      activeHref="/drrm/system-users"
      userInitials={meta.userInitials}
      userName={meta.userName}
    >
      <header className="role-header">
        <div>
          <p className="workspace-scope">{meta.subtitle}</p>
          <h1>System User and Permission Management</h1>
        </div>
        <p className="role-mode">Managed by {AUTHORITY}</p>
      </header>
      <p className="data-freshness">
        DRRM permissions distinguish Verifier, SitRep Preparer, and Approver. One account may hold several permissions;
        frontend visibility is not authorization.
      </p>
      <UserDirectory scope="system-users" actor={MANAGER} authority={AUTHORITY} selfId="user-drrm-desk" />
    </RoleShell>
  );
}
