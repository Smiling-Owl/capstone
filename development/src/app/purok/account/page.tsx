"use client";

import Link from "next/link";
import { RoleShell } from "@/components/role-shell";
import { AccountPanel } from "@/components/account-panel";
import { StatusBadge } from "@/components/status-badge";
import { PUROK_NAV, ROLE_META } from "@/lib/role-nav";
import { usePrototypeStore } from "@/lib/prototype-store";
import { INCIDENT_VERSION_LABEL } from "@/lib/hazard-data";
import { DEMO_ACCOUNT_HANDLES } from "@/lib/account-data";

const PUROK_NAME = "Purok 6";
const BARANGAY = "Barangay Tetuan";

export default function PurokAccountPage() {
  const meta = ROLE_META.purok;
  const { users, purokProfiles, incidentReports, hazardEvents } = usePrototypeStore();
  const account = users.find((user) => user.username === DEMO_ACCOUNT_HANDLES.purok);

  const profiles = purokProfiles.filter((p) => p.purokName === PUROK_NAME && p.barangay === BARANGAY);
  const incidents = incidentReports.filter((r) => r.purokName === PUROK_NAME && r.barangay === BARANGAY);
  const queued = [...profiles, ...incidents].filter((r) => r.status === "queued_offline");
  const drafts = [...profiles, ...incidents].filter((r) => r.status === "draft" || r.status === "not_started");

  function draftHref(record: { id: string; purokName: string }) {
    return profiles.some((p) => p.id === record.id) ? "/purok/profile" : `/purok/incidents/${record.id}`;
  }

  function draftLabel(record: { id: string; purokName: string }) {
    const profile = profiles.find((p) => p.id === record.id);
    if (profile) return "Monthly CDRA profile";
    const report = incidents.find((r) => r.id === record.id)!;
    return INCIDENT_VERSION_LABEL[report.version];
  }

  function draftTitle(record: { id: string; purokName: string }) {
    const profile = profiles.find((p) => p.id === record.id);
    if (profile) return profile.reportingPeriodLabel;
    const report = incidents.find((r) => r.id === record.id)!;
    const event = hazardEvents.find((e) => e.id === report.hazardEventId);
    return event?.title ?? "Hazard event";
  }

  return (
    <RoleShell
      role="purok"
      subtitle={meta.subtitle}
      nav={PUROK_NAV}
      mobileNav={PUROK_NAV}
      activeHref="/purok/account"
      userInitials={meta.userInitials}
      userName={meta.userName}
    >
      <header className="role-header">
        <div>
          <p className="workspace-scope">{meta.subtitle}</p>
          <h1>Account and Offline Queue</h1>
        </div>
      </header>
      <p className="data-freshness">
        Account details are issued by Barangay Tetuan. Drafts autosave on this device and queue when a submission is
        attempted offline; a queued submission is never shown as successfully submitted.
      </p>

      <div className="settings-grid">
        {account ? (
          <AccountPanel user={account} />
        ) : (
          <section className="setting-block">
            <h2>Account</h2>
            <p>The demonstration account could not be found in this prototype session.</p>
          </section>
        )}

        <section className="setting-block">
          <h2>Saved drafts on this device</h2>
          <p>Drafts remain editable here until you submit while connected.</p>
          <ol className="record-list">
            {drafts.map((record) => (
              <li key={record.id}>
                <Link className="record-row" href={draftHref(record)}>
                  <span className="record-row-title">
                    <strong>{draftTitle(record)}</strong>
                    <span>{draftLabel(record)}</span>
                  </span>
                  <span className="record-row-action">Continue</span>
                  <StatusBadge status={record.status} />
                </Link>
              </li>
            ))}
            {drafts.length === 0 && <li className="record-list-empty">No unsent drafts on this device.</li>}
          </ol>

          <h2>Offline submission queue</h2>
          <p>Submissions made without a connection wait here and send automatically when a connection returns.</p>
          <ol className="record-list">
            {queued.map((record) => (
              <li key={record.id}>
                <Link className="record-row" href={draftHref(record)}>
                  <span className="record-row-title">
                    <strong>{draftTitle(record)}</strong>
                    <span>{draftLabel(record)}</span>
                  </span>
                  <span className="record-row-meta">Waiting to send</span>
                  <StatusBadge status={record.status} />
                </Link>
              </li>
            ))}
            {queued.length === 0 && (
              <li className="record-list-empty">
                No queued submissions. If you submit while offline, the report waits here until a connection is
                available instead of being marked as received.
              </li>
            )}
          </ol>
        </section>
      </div>
    </RoleShell>
  );
}
