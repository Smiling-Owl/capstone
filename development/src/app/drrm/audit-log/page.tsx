"use client";

import { useMemo, useState } from "react";
import { RoleShell } from "@/components/role-shell";
import { DRRM_MOBILE_NAV, DRRM_NAV, ROLE_META } from "@/lib/role-nav";
import { usePrototypeStore } from "@/lib/prototype-store";
import { AUDIT_CATEGORY_LABEL, AuditCategory } from "@/lib/audit-data";

const CATEGORY_ORDER = Object.keys(AUDIT_CATEGORY_LABEL) as AuditCategory[];

function formatDateTime(iso: string) {
  return new Date(iso).toLocaleString(undefined, {
    year: "numeric",
    month: "short",
    day: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
}

export default function DrrmAuditLogPage() {
  const meta = ROLE_META.drrm;
  const { auditEvents } = usePrototypeStore();
  const [search, setSearch] = useState("");
  const [category, setCategory] = useState<AuditCategory | "all">("all");

  const filtered = useMemo(() => {
    const q = search.trim().toLowerCase();
    return auditEvents
      .filter((event) => (category === "all" ? true : event.category === category))
      .filter((event) =>
        q
          ? [event.actor, event.action, event.target, event.detail ?? "", AUDIT_CATEGORY_LABEL[event.category]]
              .join(" ")
              .toLowerCase()
              .includes(q)
          : true,
      )
      .slice()
      .sort((a, b) => b.occurredAt.localeCompare(a.occurredAt));
  }, [auditEvents, search, category]);

  return (
    <RoleShell
      role="drrm"
      subtitle={meta.subtitle}
      nav={DRRM_NAV}
      mobileNav={DRRM_MOBILE_NAV}
      activeHref="/drrm/audit-log"
      userInitials={meta.userInitials}
      userName={meta.userName}
    >
      <header className="role-header">
        <div>
          <p className="workspace-scope">{meta.subtitle}</p>
          <h1>System Audit Log</h1>
        </div>
        <p className="role-mode">DRRM administrators only</p>
      </header>
      <p className="data-freshness">
        Immutable record of sign-ins, submissions, verification decisions, approvals, exports, account administration,
        and configuration changes. {filtered.length} of {auditEvents.length} events shown.
      </p>

      <div className="list-toolbar">
        <div className="search-field">
          <label className="visually-hidden" htmlFor="audit-search">Search audit events</label>
          <input
            id="audit-search"
            type="search"
            placeholder="Search actor, action, or target"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>
        <div className="filter-field">
          <label className="visually-hidden" htmlFor="audit-category">Filter by category</label>
          <select id="audit-category" value={category} onChange={(e) => setCategory(e.target.value as AuditCategory | "all")}>
            <option value="all">All categories</option>
            {CATEGORY_ORDER.map((key) => (
              <option key={key} value={key}>{AUDIT_CATEGORY_LABEL[key]}</option>
            ))}
          </select>
        </div>
      </div>

      <table className="data-table">
        <caption className="visually-hidden">Audit events, newest first</caption>
        <thead>
          <tr>
            <th scope="col">When</th>
            <th scope="col">Actor</th>
            <th scope="col">Category</th>
            <th scope="col">Action</th>
            <th scope="col">Target</th>
          </tr>
        </thead>
        <tbody>
          {filtered.map((event) => (
            <tr key={event.id}>
              <td data-label="When" className="tabular-nums">{formatDateTime(event.occurredAt)}</td>
              <td data-label="Actor"><span className="table-primary">{event.actor}</span></td>
              <td data-label="Category">
                <span className="permission-chip">{AUDIT_CATEGORY_LABEL[event.category]}</span>
              </td>
              <td data-label="Action">
                <span className="table-primary">{event.action}</span>
                {event.detail && <span className="table-secondary">{event.detail}</span>}
              </td>
              <td data-label="Target"><span translate="no">{event.target}</span></td>
            </tr>
          ))}
        </tbody>
      </table>
      {filtered.length === 0 && <p className="table-empty">No audit events match the current filters.</p>}
    </RoleShell>
  );
}
