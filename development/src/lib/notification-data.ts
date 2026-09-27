// Notification feeds are derived from live store state so a notification always
// reflects the current record, never a stale snapshot. Routine notifications stay
// in-app; urgent escalation outside the app is out of prototype scope.

import type { StatusTone } from "./profile-data";
import type { PurokProfileRecord } from "./profile-data";
import type { BarangayIncidentReportRecord, HazardEvent, IncidentReportRecord } from "./hazard-data";
import type { ReportingCycle, ScheduleWindowStatus } from "./config-data";
import { INCIDENT_VERSION_LABEL } from "./hazard-data";
import { windowStatus } from "./config-data";

export interface NotificationFeedItem {
  id: string;
  title: string;
  detail: string;
  occurredAt?: string;
  href?: string;
  tone: StatusTone;
}

export const FEED_TONE_LABEL: Record<StatusTone, string> = {
  neutral: "Information",
  pending: "Needs action",
  urgent: "Urgent",
  verified: "Resolved",
};

const RANK: Record<StatusTone, number> = { urgent: 0, pending: 1, verified: 2, neutral: 3 };

function sortFeed(items: NotificationFeedItem[]): NotificationFeedItem[] {
  return items.sort((a, b) => {
    const rankDiff = RANK[a.tone] - RANK[b.tone];
    if (rankDiff !== 0) return rankDiff;
    return (b.occurredAt ?? "").localeCompare(a.occurredAt ?? "");
  });
}

function dateTime(iso?: string) {
  if (!iso) return "";
  return new Date(iso).toLocaleString(undefined, { month: "short", day: "numeric", hour: "2-digit", minute: "2-digit" });
}

function profileWindowState(cycle: ReportingCycle | undefined): ScheduleWindowStatus | undefined {
  if (!cycle) return undefined;
  const phase = cycle.phases.find((p) => p.id.endsWith("-purok-profile"));
  return phase ? windowStatus(phase) : undefined;
}

export interface PurokFeedInput {
  purokName: string;
  barangay: string;
  profiles: PurokProfileRecord[];
  incidents: IncidentReportRecord[];
  hazardEvents: HazardEvent[];
  currentCycle?: ReportingCycle;
}

export function buildPurokNotificationFeed({
  purokName,
  barangay,
  profiles,
  incidents,
  hazardEvents,
  currentCycle,
}: PurokFeedInput): NotificationFeedItem[] {
  const items: NotificationFeedItem[] = [];

  for (const profile of profiles) {
    const period = profile.reportingPeriodLabel;
    const own = profile.purokName === purokName;
    if (!own) continue;
    switch (profile.status) {
      case "draft":
      case "not_started": {
        const window = profileWindowState(currentCycle);
        if (window === "closed") {
          items.push({
            id: `${profile.id}-overdue`,
            title: `${period} profile was not submitted`,
            detail: "The Purok reporting window has closed. Coordinate with Barangay Tetuan before the consolidated profile is due.",
            href: "/purok/profile",
            tone: "urgent",
          });
        } else if (window === "open") {
          items.push({
            id: `${profile.id}-draft`,
            title: `${period} profile is still a draft`,
            detail: "Finish the remaining sections and submit before the Purok reporting window closes.",
            href: "/purok/profile",
            tone: "pending",
          });
        }
        break;
      }
      case "queued_offline":
        items.push({
          id: `${profile.id}-queued`,
          title: `${period} profile is queued on this device`,
          detail: "It will submit automatically when a connection is available. It is not yet received by Barangay Tetuan.",
          href: "/purok/account",
          tone: "pending",
        });
        break;
      case "submitted":
      case "under_review":
        items.push({
          id: `${profile.id}-review`,
          title: `${period} profile submitted`,
          detail: `Submitted ${dateTime(profile.submittedAt)}. It is under review by Barangay Tetuan.`,
          href: "/purok/profile",
          occurredAt: profile.submittedAt,
          tone: "pending",
        });
        break;
      case "correction_requested":
        items.push({
          id: `${profile.id}-correction`,
          title: `Correction requested on your ${period} profile`,
          detail: `${profile.reviewedBy} asked for changes: ${profile.correctionNote ?? "See the profile for the full note."}`,
          href: "/purok/profile",
          occurredAt: profile.reviewedAt,
          tone: "urgent",
        });
        break;
      case "rejected":
        items.push({
          id: `${profile.id}-rejected`,
          title: `${period} profile was rejected`,
          detail: profile.correctionNote ?? "The profile was returned without verification.",
          href: "/purok/profile",
          occurredAt: profile.reviewedAt,
          tone: "urgent",
        });
        break;
      case "verified":
        items.push({
          id: `${profile.id}-verified`,
          title: `${period} profile verified`,
          detail: `Verified by ${profile.reviewedBy}. It now counts toward the Barangay consolidated totals.`,
          href: "/purok/profile",
          occurredAt: profile.reviewedAt,
          tone: "verified",
        });
        break;
      default:
        break;
    }
  }

  for (const record of incidents) {
    if (record.purokName !== purokName || record.barangay !== barangay) continue;
    const event = hazardEvents.find((e) => e.id === record.hazardEventId);
    const versionLabel = INCIDENT_VERSION_LABEL[record.version];
    const subject = `${event?.title ?? "Hazard event"} (${versionLabel})`;
    switch (record.status) {
      case "draft":
      case "not_started":
        items.push({
          id: `${record.id}-draft`,
          title: `${subject} is still a draft`,
          detail: "Initial Reports accept only operationally essential facts. Submit it when the situation is confirmed.",
          href: `/purok/incidents/${record.id}`,
          tone: "pending",
        });
        break;
      case "queued_offline":
        items.push({
          id: `${record.id}-queued`,
          title: `${subject} is queued on this device`,
          detail: "It has not reached Barangay Tetuan yet. It submits automatically when a connection is available.",
          href: "/purok/account",
          tone: "pending",
        });
        break;
      case "submitted":
      case "under_review":
        items.push({
          id: `${record.id}-review`,
          title: `${subject} submitted`,
          detail: `Submitted ${dateTime(record.submittedAt)}. Barangay Tetuan is reviewing it.`,
          href: `/purok/incidents/${record.id}`,
          occurredAt: record.submittedAt,
          tone: "pending",
        });
        break;
      case "correction_requested":
        items.push({
          id: `${record.id}-correction`,
          title: `Correction requested on ${subject}`,
          detail: record.correctionNote ?? "See the report for the reviewer note.",
          href: `/purok/incidents/${record.id}`,
          occurredAt: record.reviewedAt,
          tone: "urgent",
        });
        break;
      case "rejected":
        items.push({
          id: `${record.id}-rejected`,
          title: `${subject} was rejected`,
          detail: record.correctionNote ?? "The report was returned without verification.",
          href: `/purok/incidents/${record.id}`,
          occurredAt: record.reviewedAt,
          tone: "urgent",
        });
        break;
      case "verified":
        items.push({
          id: `${record.id}-verified`,
          title: `${subject} verified`,
          detail: `Verified by ${record.reviewedBy}. It may be consolidated into the Barangay report.`,
          href: `/purok/incidents/${record.id}`,
          occurredAt: record.reviewedAt,
          tone: "verified",
        });
        break;
      default:
        break;
    }
  }

  for (const event of hazardEvents) {
    if (event.status !== "active") continue;
    if (event.barangay !== barangay && event.barangay !== "Citywide") continue;
    items.push({
      id: `${event.id}-active`,
      title: `Active hazard: ${event.title}`,
      detail: `${event.barangay}. ${event.description}`,
      href: "/purok/hazards",
      occurredAt: event.reviewedAt ?? event.createdAt,
      tone: "neutral",
    });
  }

  return sortFeed(items);
}

export interface BarangayFeedInput {
  barangay: string;
  purokProfiles: PurokProfileRecord[];
  purokIncidents: IncidentReportRecord[];
  barangayIncidents: BarangayIncidentReportRecord[];
  hazardEvents: HazardEvent[];
}

export function buildBarangayNotificationFeed({
  barangay,
  purokProfiles,
  purokIncidents,
  barangayIncidents,
  hazardEvents,
}: BarangayFeedInput): NotificationFeedItem[] {
  const items: NotificationFeedItem[] = [];

  const puroks = purokProfiles.filter((p) => p.barangay === barangay);
  for (const profile of puroks) {
    switch (profile.status) {
      case "submitted":
      case "under_review":
        items.push({
          id: `${profile.id}-toverify`,
          title: `${profile.purokName} submitted the ${profile.reportingPeriodLabel} profile`,
          detail: `Submitted by ${profile.submittedBy} ${dateTime(profile.submittedAt)}. Verify before consolidation.`,
          href: `/barangay/profiles/${profile.id}`,
          occurredAt: profile.submittedAt,
          tone: "pending",
        });
        break;
      case "correction_requested":
        items.push({
          id: `${profile.id}-outstanding`,
          title: `Correction outstanding for ${profile.purokName}`,
          detail: "The Purok has not resubmitted after your correction request.",
          occurredAt: profile.reviewedAt,
          href: `/barangay/profiles/${profile.id}`,
          tone: "urgent",
        });
        break;
      case "verified":
        items.push({
          id: `${profile.id}-verified`,
          title: `${profile.purokName} profile verified`,
          detail: `Verified ${dateTime(profile.reviewedAt)}. Its totals are now eligible for consolidation.`,
          href: `/barangay/profiles/${profile.id}`,
          occurredAt: profile.reviewedAt,
          tone: "verified",
        });
        break;
      default:
        break;
    }
  }

  for (const record of purokIncidents) {
    if (record.barangay !== barangay) continue;
    const event = hazardEvents.find((e) => e.id === record.hazardEventId);
    const subject = `${record.purokName} ${event?.title ?? "incident report"}`;
    switch (record.status) {
      case "submitted":
      case "under_review":
        items.push({
          id: `${record.id}-toverify`,
          title: `${subject} awaits verification`,
          detail: `${INCIDENT_VERSION_LABEL[record.version]} submitted ${dateTime(record.submittedAt)} by ${record.submittedBy}.`,
          href: `/barangay/incidents/verification/${record.id}`,
          occurredAt: record.submittedAt,
          tone: "pending",
        });
        break;
      default:
        break;
    }
  }

  for (const event of hazardEvents) {
    if (event.barangay !== barangay) continue;
    if (event.createdByLevel !== "purok") continue;
    if (event.status === "submitted" || event.status === "under_review") {
      items.push({
        id: `${event.id}-hazardverify`,
        title: `Purok-reported hazard event awaits verification`,
        detail: `${event.createdBy} reported "${event.title}". Verify before it becomes active.`,
        href: "/barangay/hazards",
        occurredAt: event.createdAt,
        tone: "pending",
      });
    }
  }

  for (const report of barangayIncidents) {
    if (report.barangay !== barangay) continue;
    const event = hazardEvents.find((e) => e.id === report.hazardEventId);
    if (report.status === "draft") {
      items.push({
        id: `${report.id}-consolidate`,
        title: `Consolidated report for "${event?.title ?? "hazard event"}" is a draft`,
        detail: "Add Barangay-level sources and discrepancies, then submit once eligible Purok reports are verified.",
        href: "/barangay/incidents",
        tone: "pending",
      });
    }
  }

  return sortFeed(items);
}
