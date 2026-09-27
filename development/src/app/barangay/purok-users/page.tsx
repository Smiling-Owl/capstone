"use client";

import { RoleShell } from "@/components/role-shell";
import { UserDirectory } from "@/components/user-directory";
import { BARANGAY_MOBILE_NAV, BARANGAY_NAV, ROLE_META } from "@/lib/role-nav";

const BARANGAY = "Barangay Tetuan";
const MANAGER = "Ariel Consing";
const AUTHORITY = "Barangay Tetuan DRRM Office";

export default function BarangayPurokUsersPage() {
  const meta = ROLE_META.barangay;
  return (
    <RoleShell
      role="barangay"
      subtitle={meta.subtitle}
      nav={BARANGAY_NAV}
      mobileNav={BARANGAY_MOBILE_NAV}
      activeHref="/barangay/purok-users"
      userInitials={meta.userInitials}
      userName={meta.userName}
    >
      <header className="role-header">
        <div>
          <p className="workspace-scope">{BARANGAY}</p>
          <h1>Purok User Management</h1>
        </div>
        <p className="role-mode">Accounts issued by {BARANGAY}</p>
      </header>
      <p className="data-freshness">
        {BARANGAY} issues and administers the Purok reporter accounts below. There is no self-registration, and a
        deactivated account never removes the authorship or decision history tied to that person.
      </p>
      <UserDirectory scope="purok-users" actor={MANAGER} authority={AUTHORITY} selfId="user-barangay-tetuan" />
    </RoleShell>
  );
}
