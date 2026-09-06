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
  { label: "Barangay Dashboard", href: "/barangay", enabled: true },
  { label: "Purok User Management", href: "/barangay/purok-users", enabled: false },
  { label: "Purok Profile Verification", href: "/barangay/profiles", enabled: true },
  { label: "Barangay Profile Consolidation", href: "/barangay/consolidation", enabled: true },
  { label: "Hazard Event Creation", href: "/barangay/hazards", enabled: true },
  { label: "Purok Incident Verification", href: "/barangay/incidents/verification", enabled: true },
  { label: "Barangay Incident Reporting", href: "/barangay/incidents", enabled: true },
  { label: "Purok and Barangay Historical Catalogs", href: "/barangay/history", enabled: true },
  { label: "Notifications and Account", href: "/barangay/account", enabled: false },
];

export const BARANGAY_MOBILE_NAV: RoleNavItem[] = [
  { label: "Dashboard", href: "/barangay", enabled: true },
  { label: "Profiles", href: "/barangay/profiles", enabled: true },
  { label: "Incidents", href: "/barangay/incidents/verification", enabled: true },
  { label: "Hazards", href: "/barangay/hazards", enabled: true },
  { label: "More", href: "/barangay/more", enabled: false },
];

export const DRRM_NAV: RoleNavItem[] = [
  { label: "DRRM Dashboard", href: "/drrm", enabled: true },
  { label: "Barangay User Management", href: "/drrm/barangay-users", enabled: false },
  { label: "System User and Permission Management", href: "/drrm/system-users", enabled: false },
  { label: "Barangay Profile Verification", href: "/drrm/profiles", enabled: true },
  { label: "CDRA Hazard Registry", href: "/drrm/hazard-registry", enabled: true },
  { label: "Hazard Event Creation and Review", href: "/drrm/hazards", enabled: true },
  { label: "Barangay Incident Verification", href: "/drrm/incidents/verification", enabled: true },
  { label: "SitRep Generation and Structured Editor", href: "/drrm/sitreps", enabled: true },
  { label: "SitRep Review, Approval, and Export", href: "/drrm/sitreps", enabled: true },
  { label: "Barangay and SitRep Historical Catalogs", href: "/drrm/history", enabled: true },
  { label: "System Audit Log", href: "/drrm/audit-log", enabled: false },
  { label: "Reporting Schedule and Template Configuration", href: "/drrm/configuration", enabled: false },
];

export const DRRM_MOBILE_NAV: RoleNavItem[] = [
  { label: "Dashboard", href: "/drrm", enabled: true },
  { label: "Profiles", href: "/drrm/profiles", enabled: true },
  { label: "Incidents", href: "/drrm/incidents/verification", enabled: true },
  { label: "Hazards", href: "/drrm/hazards", enabled: true },
  { label: "More", href: "/drrm/more", enabled: false },
];

export const ROLE_META = {
  purok: { subtitle: "Purok 6, Barangay Tetuan", userInitials: "MS", userName: "Maria Santos" },
  barangay: { subtitle: "Barangay Tetuan", userInitials: "AC", userName: "Ariel Consing" },
  drrm: { subtitle: "Zamboanga City DRRM Office", userInitials: "VD", userName: "Verification Desk" },
} as const;
