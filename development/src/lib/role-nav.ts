export interface RoleNavItem {
  label: string;
  href: string;
  enabled: boolean;
}

export const PUROK_NAV: RoleNavItem[] = [
  { label: "Home", href: "/purok", enabled: true },
  { label: "Profile", href: "/purok/profile", enabled: true },
  { label: "Report", href: "/purok/incidents", enabled: true },
  { label: "History", href: "/purok/history", enabled: true },
  { label: "More", href: "/purok/more", enabled: true },
];

export const BARANGAY_NAV: RoleNavItem[] = [
  { label: "Dashboard", href: "/barangay", enabled: true },
  { label: "Purok users", href: "/barangay/purok-users", enabled: true },
  { label: "Profile review", href: "/barangay/profiles", enabled: true },
  { label: "Consolidation", href: "/barangay/consolidation", enabled: true },
  { label: "Hazards", href: "/barangay/hazards", enabled: true },
  { label: "Incident review", href: "/barangay/incidents/verification", enabled: true },
  { label: "Incident reports", href: "/barangay/incidents", enabled: true },
  { label: "History", href: "/barangay/history", enabled: true },
  { label: "Account", href: "/barangay/account", enabled: true },
];

export const BARANGAY_MOBILE_NAV: RoleNavItem[] = [
  { label: "Dashboard", href: "/barangay", enabled: true },
  { label: "Profiles", href: "/barangay/profiles", enabled: true },
  { label: "Incidents", href: "/barangay/incidents/verification", enabled: true },
  { label: "Hazards", href: "/barangay/hazards", enabled: true },
  { label: "More", href: "/barangay/more", enabled: true },
];

export const DRRM_NAV: RoleNavItem[] = [
  { label: "Dashboard", href: "/drrm", enabled: true },
  { label: "Barangay users", href: "/drrm/barangay-users", enabled: true },
  { label: "System users", href: "/drrm/system-users", enabled: true },
  { label: "Profile review", href: "/drrm/profiles", enabled: true },
  { label: "Hazard registry", href: "/drrm/hazard-registry", enabled: true },
  { label: "Hazard review", href: "/drrm/hazards", enabled: true },
  { label: "Incident review", href: "/drrm/incidents/verification", enabled: true },
  { label: "SitReps", href: "/drrm/sitreps", enabled: true },
  { label: "History", href: "/drrm/history", enabled: true },
  { label: "Audit log", href: "/drrm/audit-log", enabled: true },
  { label: "Reporting setup", href: "/drrm/configuration", enabled: true },
  { label: "My account", href: "/drrm/account", enabled: true },
];

export const DRRM_MOBILE_NAV: RoleNavItem[] = [
  { label: "Dashboard", href: "/drrm", enabled: true },
  { label: "Profiles", href: "/drrm/profiles", enabled: true },
  { label: "Incidents", href: "/drrm/incidents/verification", enabled: true },
  { label: "Hazards", href: "/drrm/hazards", enabled: true },
  { label: "More", href: "/drrm/more", enabled: true },
];

export const ROLE_META = {
  purok: { subtitle: "Purok 6, Barangay Tetuan", userInitials: "MS", userName: "Maria Santos" },
  barangay: { subtitle: "Barangay Tetuan", userInitials: "AC", userName: "Ariel Consing" },
  drrm: { subtitle: "Zamboanga City DRRM Office", userInitials: "VD", userName: "Verification Desk" },
} as const;
