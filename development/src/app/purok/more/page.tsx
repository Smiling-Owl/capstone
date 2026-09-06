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
        <li className="record-list-empty">Notification Center — arrives in a later prototype checkpoint.</li>
        <li className="record-list-empty">Account and Offline Queue — arrives in a later prototype checkpoint.</li>
      </ol>
    </RoleShell>
  );
}
