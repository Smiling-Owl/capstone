"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import { RoleShell } from "@/components/role-shell";
import { StatusBadge } from "@/components/status-badge";
import { DRRM_MOBILE_NAV, DRRM_NAV, ROLE_META } from "@/lib/role-nav";
import { usePrototypeStore } from "@/lib/prototype-store";
import { PROFILE_STATUS_LABEL, ProfileStatus } from "@/lib/profile-data";

type CatalogKind = "profile" | "incident" | "hazard";

interface CatalogEntry {
  id: string;
  kind: CatalogKind;
  title: string;
  subtitle: string;
  status: ProfileStatus;
  submittedAt?: string;
  reviewedAt?: string;
  href: string;
}

function formatDate(iso?: string) {
  if (!iso) return null;
  return new Date(iso).toLocaleDateString(undefined, { month: "short", day: "numeric" });
}

export default function DrrmHistoryPage() {
  const meta = ROLE_META.drrm;
  const { barangayProfiles, barangayIncidentReports, hazardEvents, hazardTypes } = usePrototypeStore();
  const [search, setSearch] = useState("");
  const [kindFilter, setKindFilter] = useState<"all" | CatalogKind>("all");
  const [statusFilter, setStatusFilter] = useState<"all" | ProfileStatus>("all");

  const entries = useMemo<CatalogEntry[]>(() => {
    const profileEntries: CatalogEntry[] = barangayProfiles.map((p) => ({
      id: p.id,
      kind: "profile",
      title: `${p.barangay} consolidated profile`,
      subtitle: p.reportingPeriodLabel,
      status: p.status,
      submittedAt: p.submittedAt,
      reviewedAt: p.reviewedAt,
      href: `/drrm/profiles/${p.id}`,
    }));
    const incidentEntries: CatalogEntry[] = barangayIncidentReports.map((r) => {
      const event = hazardEvents.find((e) => e.id === r.hazardEventId);
      return {
        id: r.id,
        kind: "incident",
        title: `${r.barangay} · ${event?.title ?? "Hazard event"}`,
        subtitle: "Consolidated incident report",
        status: r.status,
        submittedAt: r.submittedAt,
        reviewedAt: r.reviewedAt,
        href: `/drrm/incidents/verification/${r.id}`,
      };
    });
    const hazardEntries: CatalogEntry[] = hazardEvents.map((e) => ({
      id: e.id,
      kind: "hazard",
      title: e.title,
      subtitle: hazardTypes.find((t) => t.id === e.hazardTypeId)?.name ?? e.hazardTypeId,
      status: e.status,
      submittedAt: e.createdAt,
      reviewedAt: e.reviewedAt,
      href: "/drrm/hazards",
    }));
    return [...profileEntries, ...incidentEntries, ...hazardEntries].sort((a, b) => {
      const aTime = a.reviewedAt ?? a.submittedAt ?? "";
      const bTime = b.reviewedAt ?? b.submittedAt ?? "";
      return bTime.localeCompare(aTime);
    });
  }, [barangayProfiles, barangayIncidentReports, hazardEvents]);

  const notYetSubmitted = entries.filter((e) => e.kind !== "hazard" && !e.submittedAt);
  const filtered = entries.filter((entry) => {
    if (kindFilter !== "all" && entry.kind !== kindFilter) return false;
    if (statusFilter !== "all" && entry.status !== statusFilter) return false;
    if (search.trim() && !entry.title.toLowerCase().includes(search.trim().toLowerCase())) return false;
    return true;
  });

  return (
    <RoleShell
      role="drrm"
      subtitle={meta.subtitle}
      nav={DRRM_NAV}
      mobileNav={DRRM_MOBILE_NAV}
      activeHref="/drrm/history"
      userInitials={meta.userInitials}
      userName={meta.userName}
    >
      <header className="role-header">
        <div>
          <p className="workspace-scope">{meta.subtitle}</p>
          <h1>Barangay Historical Catalogs</h1>
        </div>
      </header>
      <p className="data-freshness">
        Every Barangay consolidated profile, incident report, and hazard event on file citywide. SitReps are cataloged
        separately under SitRep Generation and Review.
      </p>

      {notYetSubmitted.length > 0 && (
        <div className="callout callout-warning">
          <strong>{notYetSubmitted.length} record{notYetSubmitted.length === 1 ? "" : "s"} not yet submitted</strong>
          <p>{notYetSubmitted.map((e) => e.title).join(", ")}. Not shown as complete or zero impact.</p>
        </div>
      )}

      <div className="panel">
        <div className="form-grid">
          <div className="form-field">
            <label htmlFor="catalog-search">Search</label>
            <input id="catalog-search" value={search} onChange={(e) => setSearch(e.target.value)} placeholder="Barangay or hazard event" />
          </div>
          <div className="form-field">
            <label htmlFor="catalog-kind">Record type</label>
            <select id="catalog-kind" value={kindFilter} onChange={(e) => setKindFilter(e.target.value as typeof kindFilter)}>
              <option value="all">All types</option>
              <option value="profile">Consolidated profiles</option>
              <option value="incident">Incident reports</option>
              <option value="hazard">Hazard events</option>
            </select>
          </div>
          <div className="form-field">
            <label htmlFor="catalog-status">Status</label>
            <select id="catalog-status" value={statusFilter} onChange={(e) => setStatusFilter(e.target.value as typeof statusFilter)}>
              <option value="all">All statuses</option>
              {(Object.keys(PROFILE_STATUS_LABEL) as ProfileStatus[]).map((status) => (
                <option key={status} value={status}>{PROFILE_STATUS_LABEL[status]}</option>
              ))}
            </select>
          </div>
        </div>
      </div>

      <ol className="record-list">
        {filtered.map((entry) => (
          <li key={`${entry.kind}-${entry.id}`}>
            <Link className="record-row" href={entry.href}>
              <span className="record-row-title">
                <strong>{entry.title}</strong>
                <span>
                  {entry.kind === "profile" ? "Consolidated profile" : entry.kind === "incident" ? "Incident report" : "Hazard event"} · {entry.subtitle}
                </span>
              </span>
              <span className="record-row-meta">
                {formatDate(entry.submittedAt) ? `${entry.kind === "hazard" ? "Created" : "Submitted"} ${formatDate(entry.submittedAt)}` : "Not submitted"}
                {formatDate(entry.reviewedAt) ? ` · Reviewed ${formatDate(entry.reviewedAt)}` : ""}
              </span>
              <StatusBadge status={entry.status} />
            </Link>
          </li>
        ))}
        {filtered.length === 0 && <li className="record-list-empty">No records match these filters.</li>}
      </ol>
    </RoleShell>
  );
}
