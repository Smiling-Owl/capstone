import { RoleShell } from "@/components/role-shell";
import { PUROK_NAV, ROLE_META } from "@/lib/role-nav";
import { ProfileWorkspace } from "./profile-workspace";

export default function PurokProfilePage() {
  const meta = ROLE_META.purok;
  return (
    <RoleShell
      role="purok"
      subtitle={meta.subtitle}
      nav={PUROK_NAV}
      mobileNav={PUROK_NAV}
      activeHref="/purok/profile"
      userInitials={meta.userInitials}
      userName={meta.userName}
    >
      <ProfileWorkspace />
    </RoleShell>
  );
}
