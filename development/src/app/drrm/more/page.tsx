import Link from "next/link";
import { RoleShell } from "@/components/role-shell";
import { DRRM_MOBILE_NAV, DRRM_NAV, ROLE_META } from "@/lib/role-nav";

export default function DrrmMorePage() {
  const meta = ROLE_META.drrm;
  return (
    <RoleShell
      role="drrm"
      subtitle={meta.subtitle}
      nav={DRRM_NAV}
      mobileNav={DRRM_MOBILE_NAV}
      activeHref="/drrm/more"
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
        <h2>SitRep and history</h2>
        <ol className="record-list">
          <li>
            <Link className="record-row" href="/drrm/sitreps">
              <span className="record-row-title">
                <strong>SitRep Generation and Structured Editor</strong>
                <span>Generate SitRep drafts from eligible verified Barangay incident reports</span>
              </span>
              <span className="record-row-action">Open</span>
            </Link>
          </li>
          <li>
            <Link className="record-row" href="/drrm/history">
              <span className="record-row-title">
                <strong>Barangay and SitRep Historical Catalogs</strong>
                <span>Search verified reports, Barangay records, and past SitReps</span>
              </span>
              <span className="record-row-action">Open</span>
            </Link>
          </li>
          <li>
            <Link className="record-row" href="/drrm/hazard-registry">
              <span className="record-row-title">
                <strong>CDRA Hazard Registry</strong>
                <span>Approved hazard types selectable when creating events</span>
              </span>
              <span className="record-row-action">Open</span>
            </Link>
          </li>
        </ol>
      </section>

      <section className="panel">
        <h2>Administration</h2>
        <ol className="record-list">
          <li>
            <Link className="record-row" href="/drrm/barangay-users">
              <span className="record-row-title">
                <strong>Barangay User Management</strong>
                <span>Issue and administer Barangay DRRM officer accounts</span>
              </span>
              <span className="record-row-action">Open</span>
            </Link>
          </li>
          <li>
            <Link className="record-row" href="/drrm/system-users">
              <span className="record-row-title">
                <strong>System User and Permission Management</strong>
                <span>DRRM accounts and Verifier, SitRep Preparer, and Approver permissions</span>
              </span>
              <span className="record-row-action">Open</span>
            </Link>
          </li>
          <li>
            <Link className="record-row" href="/drrm/audit-log">
              <span className="record-row-title">
                <strong>System Audit Log</strong>
                <span>Immutable trail of sign-ins, decisions, exports, and administration</span>
              </span>
              <span className="record-row-action">Open</span>
            </Link>
          </li>
          <li>
            <Link className="record-row" href="/drrm/configuration">
              <span className="record-row-title">
                <strong>Reporting Schedule and Template Configuration</strong>
                <span>Reporting cutoffs, SitRep template, and CDRA hazard type registry</span>
              </span>
              <span className="record-row-action">Open</span>
            </Link>
          </li>
          <li>
            <Link className="record-row" href="/drrm/account">
              <span className="record-row-title">
                <strong>My Account and Password</strong>
                <span>Account details, permissions, and password</span>
              </span>
              <span className="record-row-action">Open</span>
            </Link>
          </li>
        </ol>
      </section>
    </RoleShell>
  );
}
