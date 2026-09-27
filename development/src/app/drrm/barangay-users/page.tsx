"use client";

import { RoleShell } from "@/components/role-shell";
import { UserDirectory } from "@/components/user-directory";
import { DRRM_MOBILE_NAV, DRRM_NAV, ROLE_META } from "@/lib/role-nav";

const MANAGER = "DRRM Verification Desk";
const AUTHORITY = "Zamboanga City DRRM Office";

export default function DrrmBarangayUsersPage() {
  const meta = ROLE_META.drrm;
  return (
    <RoleShell
      role="drrm"
      subtitle={meta.subtitle}
      nav={DRRM_NAV}
      mobileNav={DRRM_MOBILE_NAV}
      activeHref="/drrm/barangay-users"
      userInitials={meta.userInitials}
      userName={meta.userName}
    >
      <header className="role-header">
        <div>
          <p className="workspace-scope">{meta.subtitle}</p>
          <h1>Barangay User Management</h1>
        </div>
        <p className="role-mode">Accounts issued by {AUTHORITY}</p>
      </header>
      <p className="data-freshness">
        The DRRM Office issues and administers the Barangay DRRM officer account for every Barangay. Deactivation never
        deletes authorship or decision history.
      </p>
      <UserDirectory scope="barangay-users" actor={MANAGER} authority={AUTHORITY} />
    </RoleShell>
  );
}
