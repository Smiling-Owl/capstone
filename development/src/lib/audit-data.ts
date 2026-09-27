// Prototype audit trail. The complete audit log is restricted to authorized DRRM
// administrators. Entries are immutable in the real system; the prototype keeps
// a seeded history and appends new events as decisions are made in the session.

export type AuditCategory =
  | "auth"
  | "reporting"
  | "verification"
  | "approval"
  | "export"
  | "user_admin"
  | "configuration"
  | "account";

export const AUDIT_CATEGORY_LABEL: Record<AuditCategory, string> = {
  auth: "Sign-in and session",
  reporting: "Reporting and submission",
  verification: "Verification",
  approval: "Approval",
  export: "Export",
  user_admin: "User management",
  configuration: "Configuration",
  account: "Account and password",
};

export interface AuditEvent {
  id: string;
  occurredAt: string;
  actor: string;
  action: string;
  category: AuditCategory;
  /** Subject of the event, e.g. a record id or account name. */
  target: string;
  detail?: string;
}

export const SEED_AUDIT_EVENTS: AuditEvent[] = [
  {
    id: "audit-seed-001",
    occurredAt: "2026-09-06T06:05:00+08:00",
    actor: "DRRM Verification Desk",
    action: "Signed in",
    category: "auth",
    target: "DRRM Office workspace",
  },
  {
    id: "audit-seed-002",
    occurredAt: "2026-09-06T05:00:00+08:00",
    actor: "DRRM Verification Desk",
    action: "Activated hazard event",
    category: "verification",
    target: "Citywide yellow rainfall and wind advisory",
  },
  {
    id: "audit-seed-003",
    occurredAt: "2026-09-06T10:00:00+08:00",
    actor: "Ariel Consing",
    action: "Submitted consolidated Barangay profile",
    category: "reporting",
    target: "tetuan-2026-09 (Barangay Tetuan)",
  },
  {
    id: "audit-seed-004",
    occurredAt: "2026-09-05T16:40:00+08:00",
    actor: "Ariel Consing",
    action: "Submitted Purok profile",
    category: "reporting",
    target: "tetuan-purok-2-2026-09 (Purok 2)",
  },
  {
    id: "audit-seed-005",
    occurredAt: "2026-09-05T09:20:00+08:00",
    actor: "Ariel Consing",
    action: "Verified incident report",
    category: "verification",
    target: "incident-purok3-flood-initial (Purok 3)",
  },
  {
    id: "audit-seed-006",
    occurredAt: "2026-09-05T07:40:00+08:00",
    actor: "Ariel Consing",
    action: "Activated hazard event",
    category: "verification",
    target: "Flooding along Tumaga River tributary corridor",
  },
  {
    id: "audit-seed-007",
    occurredAt: "2026-09-05T13:00:00+08:00",
    actor: "DRRM Verification Desk",
    action: "Generated SitRep draft",
    category: "reporting",
    target: "sitrep-stacatalina-fire-2026-09 (v1)",
  },
  {
    id: "audit-seed-008",
    occurredAt: "2026-09-04T09:45:00+08:00",
    actor: "DRRM Verification Desk",
    action: "Verified Barangay profile",
    category: "verification",
    target: "sta-catalina-2026-09 (Barangay Sta. Catalina)",
  },
  {
    id: "audit-seed-009",
    occurredAt: "2026-09-03T08:20:00+08:00",
    actor: "Ariel Consing",
    action: "Requested correction on Purok profile",
    category: "verification",
    target: "tetuan-purok-3-2026-09 (Purok 3)",
    detail: "Households in hazard zone unchanged from August despite the reported slope movement.",
  },
  {
    id: "audit-seed-010",
    occurredAt: "2026-09-03T11:10:00+08:00",
    actor: "DRRM Verification Desk",
    action: "Requested correction on Barangay profile",
    category: "verification",
    target: "guiwan-2026-09 (Barangay Guiwan)",
    detail: "Consolidated totals included unverified Purok submissions.",
  },
  {
    id: "audit-seed-011",
    occurredAt: "2026-08-20T18:05:00+08:00",
    actor: "DRRM Verification Desk",
    action: "Exported SitRep",
    category: "export",
    target: "sitrep-guiwan-fire-2026-08 (v1)",
  },
  {
    id: "audit-seed-012",
    occurredAt: "2026-08-20T18:00:00+08:00",
    actor: "DRRM Verification Desk",
    action: "Approved SitRep",
    category: "approval",
    target: "sitrep-guiwan-fire-2026-08 (v1)",
  },
  {
    id: "audit-seed-013",
    occurredAt: "2026-09-01T14:00:00+08:00",
    actor: "Zamboanga City DRRM Office Administrator",
    action: "Invited user",
    category: "user_admin",
    target: "Rodel Bautista (SitRep Preparer)",
  },
  {
    id: "audit-seed-014",
    occurredAt: "2026-08-25T16:00:00+08:00",
    actor: "DRRM Verification Desk",
    action: "Published reporting schedule",
    category: "configuration",
    target: "September 2026 reporting cycle",
  },
];

let auditSequence = 0;

/** Builds the id for a runtime audit event. */
export function nextAuditId() {
  auditSequence += 1;
  return `audit-${Date.now()}-${auditSequence}`;
}
