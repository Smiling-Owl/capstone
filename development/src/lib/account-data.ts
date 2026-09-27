// Prototype dataset only. Accounts are issued by the supervising administrative
// level; there is no self-registration. User identities mirror the persons who
// prepare and review seeded records so every role view shares one dataset.

import type { StatusTone } from "./profile-data";

export type UserStatus = "active" | "invited" | "deactivated";

export const USER_STATUS_LABEL: Record<UserStatus, string> = {
  active: "Active",
  invited: "Invitation sent",
  deactivated: "Deactivated",
};

export const USER_STATUS_TONE: Record<UserStatus, StatusTone> = {
  active: "verified",
  invited: "pending",
  deactivated: "neutral",
};

export type UserLevel = "purok" | "barangay" | "drrm";

export const USER_LEVEL_LABEL: Record<UserLevel, string> = {
  purok: "Purok",
  barangay: "Barangay",
  drrm: "DRRM Office",
};

export type DrrmPermission = "verifier" | "sitrep_preparer" | "approver";

export const DRRM_PERMISSION_LABEL: Record<DrrmPermission, string> = {
  verifier: "Verifier",
  sitrep_preparer: "SitRep Preparer",
  approver: "Approver",
};

export const DRRM_PERMISSION_ORDER: DrrmPermission[] = ["verifier", "sitrep_preparer", "approver"];

export interface UserRecord {
  id: string;
  fullName: string;
  username: string;
  level: UserLevel;
  /** Administrative unit the account is assigned to, e.g. "Purok 6" or "Barangay Tetuan". */
  unit: string;
  /** Parent jurisdiction for Purok accounts, e.g. "Barangay Tetuan". */
  parentUnit?: string;
  roleLabel: string;
  permissions?: DrrmPermission[];
  status: UserStatus;
  issuedBy: string;
  issuedAt: string;
  lastActiveAt?: string;
  passwordChangedAt?: string;
}

export const PUROK_NAMES_IN_TETUAN = ["Purok 1", "Purok 2", "Purok 3", "Purok 4", "Purok 5", "Purok 6"];

export const BARANGAY_NAMES_SEED = ["Barangay Tetuan", "Barangay Sta. Catalina", "Barangay Guiwan"];

const CITY_DRRM = "Zamboanga City DRRM Office";
const CITY_DRRM_ADMIN = "Zamboanga City DRRM Office Administrator";
const TETUAN_BARANGAY = "Barangay Tetuan DRRM Office";

export const SEED_USERS: UserRecord[] = [
  // Purok reporter accounts issued by the supervising Barangay.
  {
    id: "user-purok-1",
    fullName: "Nora Villaflor",
    username: "nora.villaflor@purok1.tetuan",
    level: "purok",
    unit: "Purok 1",
    parentUnit: "Barangay Tetuan",
    roleLabel: "Purok reporter",
    status: "active",
    issuedBy: TETUAN_BARANGAY,
    issuedAt: "2026-01-12T09:00:00+08:00",
    lastActiveAt: "2026-09-05T08:31:00+08:00",
  },
  {
    id: "user-purok-2",
    fullName: "Ariel Consing",
    username: "ariel.consing@purok2.tetuan",
    level: "purok",
    unit: "Purok 2",
    parentUnit: "Barangay Tetuan",
    roleLabel: "Purok reporter",
    status: "active",
    issuedBy: TETUAN_BARANGAY,
    issuedAt: "2026-02-03T10:00:00+08:00",
    lastActiveAt: "2026-09-05T16:41:00+08:00",
  },
  {
    id: "user-purok-3",
    fullName: "Bituin Ramos",
    username: "bituin.ramos@purok3.tetuan",
    level: "purok",
    unit: "Purok 3",
    parentUnit: "Barangay Tetuan",
    roleLabel: "Purok reporter",
    status: "active",
    issuedBy: TETUAN_BARANGAY,
    issuedAt: "2026-01-15T11:00:00+08:00",
    lastActiveAt: "2026-09-05T08:06:00+08:00",
  },
  {
    id: "user-purok-4",
    fullName: "Domingo Salazar",
    username: "domingo.salazar@purok4.tetuan",
    level: "purok",
    unit: "Purok 4",
    parentUnit: "Barangay Tetuan",
    roleLabel: "Purok reporter",
    status: "active",
    issuedBy: TETUAN_BARANGAY,
    issuedAt: "2026-01-20T14:00:00+08:00",
    lastActiveAt: "2026-09-01T11:31:00+08:00",
  },
  {
    id: "user-purok-5",
    fullName: "Ligaya Ferrer",
    username: "ligaya.ferrer@purok5.tetuan",
    level: "purok",
    unit: "Purok 5",
    parentUnit: "Barangay Tetuan",
    roleLabel: "Purok reporter",
    status: "deactivated",
    issuedBy: TETUAN_BARANGAY,
    issuedAt: "2026-02-10T09:30:00+08:00",
    lastActiveAt: "2026-08-19T15:10:00+08:00",
  },
  {
    id: "user-purok-6",
    fullName: "Maria Santos",
    username: "purok.demo",
    level: "purok",
    unit: "Purok 6",
    parentUnit: "Barangay Tetuan",
    roleLabel: "Purok reporter",
    status: "active",
    issuedBy: TETUAN_BARANGAY,
    issuedAt: "2026-01-08T08:00:00+08:00",
    lastActiveAt: "2026-09-06T07:55:00+08:00",
  },
  // Barangay accounts issued by the Zamboanga City DRRM Office.
  {
    id: "user-barangay-tetuan",
    fullName: "Ariel Consing",
    username: "barangay.demo",
    level: "barangay",
    unit: "Barangay Tetuan",
    roleLabel: "Barangay DRRM officer",
    status: "active",
    issuedBy: CITY_DRRM,
    issuedAt: "2025-11-04T09:00:00+08:00",
    lastActiveAt: "2026-09-06T10:01:00+08:00",
  },
  {
    id: "user-barangay-stacatalina",
    fullName: "Ernesto Bayoneta",
    username: "ernesto.bayoneta@stacatalina",
    level: "barangay",
    unit: "Barangay Sta. Catalina",
    roleLabel: "Barangay DRRM officer",
    status: "active",
    issuedBy: CITY_DRRM,
    issuedAt: "2025-12-01T13:00:00+08:00",
    lastActiveAt: "2026-09-05T09:02:00+08:00",
  },
  {
    id: "user-barangay-guiwan",
    fullName: "Rowena Mercado",
    username: "rowena.mercado@guiwan",
    level: "barangay",
    unit: "Barangay Guiwan",
    roleLabel: "Barangay DRRM officer",
    status: "active",
    issuedBy: CITY_DRRM,
    issuedAt: "2025-12-15T10:00:00+08:00",
    lastActiveAt: "2026-09-04T09:12:00+08:00",
  },
  // DRRM system accounts issued by the DRRM Office administrator.
  {
    id: "user-drrm-desk",
    fullName: "DRRM Verification Desk",
    username: "drrm.demo",
    level: "drrm",
    unit: CITY_DRRM,
    roleLabel: "DRRM administrator",
    permissions: ["verifier", "sitrep_preparer", "approver"],
    status: "active",
    issuedBy: CITY_DRRM_ADMIN,
    issuedAt: "2025-10-20T08:00:00+08:00",
    lastActiveAt: "2026-09-06T06:05:00+08:00",
  },
  {
    id: "user-drrm-salonga",
    fullName: "Cristina Salonga",
    username: "cristina.salonga@drrm",
    level: "drrm",
    unit: CITY_DRRM,
    roleLabel: "DRRM staff",
    permissions: ["verifier"],
    status: "active",
    issuedBy: CITY_DRRM_ADMIN,
    issuedAt: "2026-03-02T09:00:00+08:00",
    lastActiveAt: "2026-09-05T17:20:00+08:00",
  },
  {
    id: "user-drrm-bautista",
    fullName: "Rodel Bautista",
    username: "rodel.bautista@drrm",
    level: "drrm",
    unit: CITY_DRRM,
    roleLabel: "DRRM staff",
    permissions: ["sitrep_preparer"],
    status: "invited",
    issuedBy: CITY_DRRM_ADMIN,
    issuedAt: "2026-09-01T14:00:00+08:00",
  },
  {
    id: "user-drrm-ortega",
    fullName: "Maria Lourdes Ortega",
    username: "malou.ortega@drrm",
    level: "drrm",
    unit: CITY_DRRM,
    roleLabel: "DRRM staff",
    permissions: ["approver"],
    status: "active",
    issuedBy: CITY_DRRM_ADMIN,
    issuedAt: "2026-04-14T11:00:00+08:00",
    lastActiveAt: "2026-09-02T10:45:00+08:00",
  },
];

/** Prototype log-in handles shown on the shared sign-in screen. */
export const DEMO_ACCOUNT_HANDLES: Record<UserLevel, string> = {
  purok: "purok.demo",
  barangay: "barangay.demo",
  drrm: "drrm.demo",
};
