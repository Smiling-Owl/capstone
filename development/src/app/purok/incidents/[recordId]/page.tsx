import { RoleShell } from "@/components/role-shell";
import { PUROK_NAV, ROLE_META } from "@/lib/role-nav";
import { IncidentWorkspace } from "./incident-workspace";

export default function PurokIncidentRecordPage() {
  const meta = ROLE_META.purok;
  return (
    <RoleShell
      role="purok"
      subtitle={meta.subtitle}
      nav={PUROK_NAV}
      mobileNav={PUROK_NAV}
      activeHref="/purok/incidents"
      userInitials={meta.userInitials}
      userName={meta.userName}
    >
      <IncidentWorkspace />
    </RoleShell>
  );
}
