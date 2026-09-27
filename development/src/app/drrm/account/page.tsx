"use client";

import { RoleShell } from "@/components/role-shell";
import { AccountPanel } from "@/components/account-panel";
import { DRRM_MOBILE_NAV, DRRM_NAV, ROLE_META } from "@/lib/role-nav";
import { usePrototypeStore } from "@/lib/prototype-store";
import { DEMO_ACCOUNT_HANDLES, DRRM_PERMISSION_LABEL } from "@/lib/account-data";

export default function DrrmAccountPage() {
  const meta = ROLE_META.drrm;
  const { users } = usePrototypeStore();
  const account = users.find((user) => user.username === DEMO_ACCOUNT_HANDLES.drrm);

  return (
    <RoleShell
      role="drrm"
      subtitle={meta.subtitle}
      nav={DRRM_NAV}
      mobileNav={DRRM_MOBILE_NAV}
      activeHref="/drrm/account"
      userInitials={meta.userInitials}
      userName={meta.userName}
    >
      <header className="role-header">
        <div>
          <p className="workspace-scope">{meta.subtitle}</p>
          <h1>My Account and Password</h1>
        </div>
      </header>
      <p className="data-freshness">
        Account details and security. DRRM system users are issued by the DRRM Office administrator.
      </p>
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
          <h2>Permissions on this account</h2>
          <p>This workspace combines the DRRM permissions granted to the account that signed in.</p>
          <div className="permission-set">
            {(account?.permissions ?? []).length > 0 ? (
              account!.permissions!.map((permission) => (
                <span className="permission-chip" key={permission}>{DRRM_PERMISSION_LABEL[permission]}</span>
              ))
            ) : (
              <span className="permission-chip permission-chip-empty">No permissions assigned</span>
            )}
          </div>
          <p className="password-note">
            Permission changes are made by the DRRM Office administrator on the System User and Permission Management
            screen and are recorded in the audit log.
          </p>
        </section>
      </div>
    </RoleShell>
  );
}
