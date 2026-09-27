import Link from "next/link";
import { RoleShell } from "@/components/role-shell";
import { PUROK_NAV, ROLE_META } from "@/lib/role-nav";

export default function PurokMorePage() {
  const meta = ROLE_META.purok;
  return (
    <RoleShell
      role="purok"
      subtitle={meta.subtitle}
      nav={PUROK_NAV}
      mobileNav={PUROK_NAV}
      activeHref="/purok/more"
      userInitials={meta.userInitials}
      userName={meta.userName}
    >
      <header className="role-header">
        <div>
          <p className="workspace-scope">{meta.subtitle}</p>
          <h1>More</h1>
        </div>
      </header>
      <p className="data-freshness">Tools not shown in the bottom navigation.</p>
      <ol className="record-list">
        <li>
          <Link className="record-row" href="/purok/hazards">
            <span className="record-row-title">
              <strong>Hazard Event Creation</strong>
              <span>Report a new hazard event for Barangay verification</span>
            </span>
            <span className="record-row-meta" />
            <span className="record-row-action">Open</span>
          </Link>
        </li>
        <li>
          <Link className="record-row" href="/purok/notifications">
            <span className="record-row-title">
              <strong>Notification Center</strong>
              <span>In-app updates about your profiles, reports, and active hazards</span>
            </span>
            <span className="record-row-meta" />
            <span className="record-row-action">Open</span>
          </Link>
        </li>
        <li>
          <Link className="record-row" href="/purok/account">
            <span className="record-row-title">
              <strong>Account and Offline Queue</strong>
              <span>Account details, password, saved drafts, and queued offline submissions</span>
            </span>
            <span className="record-row-meta" />
            <span className="record-row-action">Open</span>
          </Link>
        </li>
      </ol>
    </RoleShell>
  );
}
