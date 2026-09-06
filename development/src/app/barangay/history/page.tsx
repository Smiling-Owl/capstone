"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import { RoleShell } from "@/components/role-shell";
import { StatusBadge } from "@/components/status-badge";
import { BARANGAY_NAV, ROLE_META } from "@/lib/role-nav";
import { usePrototypeStore } from "@/lib/prototype-store";
import { PROFILE_STATUS_LABEL, ProfileStatus } from "@/lib/profile-data";
import { INCIDENT_VERSION_LABEL } from "@/lib/hazard-data";

const BARANGAY = "Barangay Tetuan";

type CatalogKind = "profile" | "incident";

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

export default function BarangayHistoryPage() {
  const meta = ROLE_META.barangay;
  const { purokProfiles, incidentReports, hazardEvents } = usePrototypeStore();
  const [search, setSearch] = useState("");
  const [kindFilter, setKindFilter] = useState<"all" | CatalogKind>("all");
  const [statusFilter, setStatusFilter] = useState<"all" | ProfileStatus>("all");

  const entries = useMemo<CatalogEntry[]>(() => {
    const profileEntries: CatalogEntry[] = purokProfiles
      .filter((p) => p.barangay === BARANGAY)
      .map((p) => ({
        id: p.id,
        kind: "profile",
        title: `${p.purokName} monthly profile`,
        subtitle: p.reportingPeriodLabel,
        status: p.status,
        submittedAt: p.submittedAt,
        reviewedAt: p.reviewedAt,
        href: `/barangay/profiles/${p.id}`,
      }));
    const incidentEntries: CatalogEntry[] = incidentReports
      .filter((r) => r.barangay === BARANGAY)
      .map((r) => {
        const event = hazardEvents.find((e) => e.id === r.hazardEventId);
        return {
          id: r.id,
          kind: "incident",
          title: `${r.purokName} · ${event?.title ?? "Hazard event"}`,
          subtitle: INCIDENT_VERSION_LABEL[r.version],
          status: r.status,
          submittedAt: r.submittedAt,
          reviewedAt: r.reviewedAt,
          href: `/barangay/incidents/verification/${r.id}`,
        };
      });
    return [...profileEntries, ...incidentEntries].sort((a, b) => {
      const aTime = a.reviewedAt ?? a.submittedAt ?? "";
      const bTime = b.reviewedAt ?? b.submittedAt ?? "";
      return bTime.localeCompare(aTime);
    });
  }, [purokProfiles, incidentReports, hazardEvents]);

  const notYetSubmitted = entries.filter((e) => !e.submittedAt);
  const filtered = entries.filter((entry) => {
    if (kindFilter !== "all" && entry.kind !== kindFilter) return false;
    if (statusFilter !== "all" && entry.status !== statusFilter) return false;
    if (search.trim() && !entry.title.toLowerCase().includes(search.trim().toLowerCase())) return false;
    return true;
  });

  return (
    <RoleShell
      role="barangay"
      subtitle={meta.subtitle}
      nav={BARANGAY_NAV}
      mobileNav={BARANGAY_NAV}
      activeHref="/barangay/history"
      userInitials={meta.userInitials}
      userName={meta.userName}
    >
      <header className="role-header">
        <div>
          <p className="workspace-scope">{BARANGAY}</p>
          <h1>Purok and Barangay Historical Catalogs</h1>
        </div>
      </header>
      <p className="data-freshness">
        Every Purok profile and incident report on file for {BARANGAY} this period. Filters narrow the list; they do
        not change the underlying record count.
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
            <input id="catalog-search" value={search} onChange={(e) => setSearch(e.target.value)} placeholder="Purok name or hazard event" />
          </div>
          <div className="form-field">
            <label htmlFor="catalog-kind">Record type</label>
            <select id="catalog-kind" value={kindFilter} onChange={(e) => setKindFilter(e.target.value as typeof kindFilter)}>
              <option value="all">All types</option>
              <option value="profile">Monthly profiles</option>
              <option value="incident">Incident reports</option>
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
                <span>{entry.kind === "profile" ? "Monthly profile" : "Incident report"} · {entry.subtitle}</span>
              </span>
              <span className="record-row-meta">
                {formatDate(entry.submittedAt) ? `Submitted ${formatDate(entry.submittedAt)}` : "Not submitted"}
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
