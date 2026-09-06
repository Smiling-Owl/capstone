import { notFound } from "next/navigation";
import { RoleShell } from "@/components/role-shell";
import { PurokDashboardSummary } from "@/components/dashboard/purok-summary";
import { BarangayDashboardSummary } from "@/components/dashboard/barangay-summary";
import { DrrmDashboardSummary } from "@/components/dashboard/drrm-summary";
import {
  BARANGAY_MOBILE_NAV,
  BARANGAY_NAV,
  DRRM_MOBILE_NAV,
  DRRM_NAV,
  PUROK_NAV,
  ROLE_META,
} from "@/lib/role-nav";

const roleTitle = {
  purok: "Purok workspace",
  barangay: "Barangay operations",
  drrm: "DRRM operations",
} as const;

type Role = keyof typeof roleTitle;

export default async function RolePage({ params }: { params: Promise<{ role: string }> }) {
  const { role } = await params;
  if (!(role in roleTitle)) notFound();
  const typedRole = role as Role;
  const meta = ROLE_META[typedRole];

  const nav = typedRole === "purok" ? PUROK_NAV : typedRole === "barangay" ? BARANGAY_NAV : DRRM_NAV;
  const mobileNav =
    typedRole === "purok" ? PUROK_NAV : typedRole === "barangay" ? BARANGAY_MOBILE_NAV : DRRM_MOBILE_NAV;

  return (
    <RoleShell
      role={typedRole}
      subtitle={meta.subtitle}
      nav={nav}
      mobileNav={mobileNav}
      activeHref={`/${role}`}
      userInitials={meta.userInitials}
      userName={meta.userName}
    >
      <header className="role-header">
        <div>
          <p className="workspace-scope">{meta.subtitle}</p>
          <h1>{roleTitle[typedRole]}</h1>
        </div>
        <p className="role-mode">Prototype workspace</p>
      </header>
      {typedRole === "purok" && <PurokDashboardSummary />}
      {typedRole === "barangay" && <BarangayDashboardSummary />}
      {typedRole === "drrm" && <DrrmDashboardSummary />}
    </RoleShell>
  );
}
