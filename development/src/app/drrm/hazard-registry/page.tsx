import { RoleShell } from "@/components/role-shell";
import { DRRM_MOBILE_NAV, DRRM_NAV, ROLE_META } from "@/lib/role-nav";
import { CDRA_HAZARD_REGISTRY } from "@/lib/hazard-data";

const CATEGORY_LABEL = {
  hydrometeorological: "Hydrometeorological",
  geologic: "Geologic",
  "human-induced": "Human-induced",
  biological: "Biological",
} as const;

export default function HazardRegistryPage() {
  const meta = ROLE_META.drrm;
  return (
    <RoleShell
      role="drrm"
      subtitle={meta.subtitle}
      nav={DRRM_NAV}
      mobileNav={DRRM_MOBILE_NAV}
      activeHref="/drrm/hazard-registry"
      userInitials={meta.userInitials}
      userName={meta.userName}
    >
      <header className="role-header">
        <div>
          <p className="workspace-scope">{meta.subtitle}</p>
          <h1>CDRA Hazard Registry</h1>
        </div>
      </header>
      <p className="data-freshness">
        Approved hazard types Purok, Barangay, and DRRM users may select when creating a hazard event. Editing this
        registry is part of Reporting Schedule and Template Configuration, a later prototype checkpoint.
      </p>
      <ol className="hazard-list">
        {CDRA_HAZARD_REGISTRY.map((type) => (
          <li key={type.id} className="hazard-row">
            <span className="hazard-type-tag">{CATEGORY_LABEL[type.category]}</span>
            <div><strong>{type.name}</strong></div>
            <p className="hazard-row-description">{type.description}</p>
          </li>
        ))}
      </ol>
    </RoleShell>
  );
}
