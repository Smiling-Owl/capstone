import Link from "next/link";
import { RoleShell } from "@/components/role-shell";
import { BARANGAY_MOBILE_NAV, BARANGAY_NAV, ROLE_META } from "@/lib/role-nav";

export default function BarangayMorePage() {
  const meta = ROLE_META.barangay;
  return (
    <RoleShell
      role="barangay"
      subtitle={meta.subtitle}
      nav={BARANGAY_NAV}
      mobileNav={BARANGAY_MOBILE_NAV}
      activeHref="/barangay/more"
      userInitials={meta.userInitials}
      userName={meta.userName}
    >
      <header className="role-header">
        <div>
          <p className="workspace-scope">{meta.subtitle}</p>
          <h1>More</h1>
        </div>
      </header>
      <p className="data-freshness">Workspace areas not shown in the mobile navigation.</p>

      <section className="panel">
        <h2>Reporting and history</h2>
        <ol className="record-list">
          <li>
            <Link className="record-row" href="/barangay/consolidation">
              <span className="record-row-title">
                <strong>Barangay Profile Consolidation</strong>
                <span>Consolidate verified Purok totals and separate Barangay-wide additions</span>
              </span>
              <span className="record-row-action">Open</span>
            </Link>
          </li>
          <li>
            <Link className="record-row" href="/barangay/incidents">
              <span className="record-row-title">
                <strong>Barangay Incident Reporting</strong>
                <span>Consolidate eligible verified Purok reports for a hazard event</span>
              </span>
              <span className="record-row-action">Open</span>
            </Link>
          </li>
          <li>
            <Link className="record-row" href="/barangay/history">
              <span className="record-row-title">
                <strong>Purok and Barangay Historical Catalogs</strong>
                <span>Search past profiles, incidents, and decisions</span>
              </span>
              <span className="record-row-action">Open</span>
            </Link>
          </li>
        </ol>
      </section>

      <section className="panel">
        <h2>Accounts and account</h2>
        <ol className="record-list">
          <li>
            <Link className="record-row" href="/barangay/purok-users">
              <span className="record-row-title">
                <strong>Purok User Management</strong>
                <span>Issue, reactivate, or deactivate Purok reporter accounts</span>
              </span>
              <span className="record-row-action">Open</span>
            </Link>
          </li>
          <li>
            <Link className="record-row" href="/barangay/account">
              <span className="record-row-title">
                <strong>Notifications and Account</strong>
                <span>In-app notifications, account details, and password</span>
              </span>
              <span className="record-row-action">Open</span>
            </Link>
          </li>
        </ol>
      </section>
    </RoleShell>
  );
}
