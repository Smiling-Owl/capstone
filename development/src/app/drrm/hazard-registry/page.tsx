"use client";

import Link from "next/link";
import { RoleShell } from "@/components/role-shell";
import { StatusToneBadge } from "@/components/status-badge";
import { DRRM_MOBILE_NAV, DRRM_NAV, ROLE_META } from "@/lib/role-nav";
import { usePrototypeStore } from "@/lib/prototype-store";
import { HAZARD_CATEGORY_LABEL } from "@/lib/hazard-data";

export default function HazardRegistryPage() {
  const meta = ROLE_META.drrm;
  const { hazardTypes } = usePrototypeStore();

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
        Approved hazard types Purok, Barangay, and DRRM users may select when creating a hazard event. DRRM maintains
        this registry on the{" "}
        <Link href="/drrm/configuration">Reporting Schedule and Template Configuration</Link> screen; archiving a type
        hides it from new events without deleting existing history.
      </p>
      <ol className="hazard-list">
        {hazardTypes.map((type) => (
          <li key={type.id} className="hazard-row">
            <div className="hazard-row-header">
              <div>
                <span className="hazard-type-tag">{HAZARD_CATEGORY_LABEL[type.category]}</span>
                <div><strong>{type.name}</strong></div>
              </div>
              <StatusToneBadge
                label={type.status === "archived" ? "Archived" : "Approved"}
                tone={type.status === "archived" ? "neutral" : "verified"}
              />
            </div>
            <p className="hazard-row-meta">
              {type.status === "archived"
                ? "Not selectable for new hazard events. Existing events keep their reference."
                : "Selectable when creating a hazard event."}
            </p>
            <p className="hazard-row-description">{type.description}</p>
          </li>
        ))}
      </ol>
    </RoleShell>
  );
}
