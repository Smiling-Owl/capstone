import { RoleShell } from "@/components/role-shell";
import { DRRM_NAV, ROLE_META } from "@/lib/role-nav";
import { SitRepEditor } from "./sitrep-editor";

export default function SitRepEditorPage() {
  const meta = ROLE_META.drrm;
  return (
    <RoleShell
      role="drrm"
      subtitle={meta.subtitle}
      nav={DRRM_NAV}
      mobileNav={DRRM_NAV}
      activeHref="/drrm/sitreps"
      userInitials={meta.userInitials}
      userName={meta.userName}
    >
      <SitRepEditor />
    </RoleShell>
  );
}
