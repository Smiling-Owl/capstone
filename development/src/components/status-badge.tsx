import { PROFILE_STATUS_LABEL, PROFILE_STATUS_TONE, ProfileStatus, StatusTone } from "@/lib/profile-data";

export function StatusToneBadge({ label, tone }: { label: string; tone: StatusTone }) {
  return <span className={`status-badge status-badge-${tone}`}>{label}</span>;
}

export function StatusBadge({ status }: { status: ProfileStatus }) {
  return <StatusToneBadge label={PROFILE_STATUS_LABEL[status]} tone={PROFILE_STATUS_TONE[status]} />;
}
