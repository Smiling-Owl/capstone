"use client";

import Link from "next/link";
import { RoleShell } from "@/components/role-shell";
import { StatusBadge } from "@/components/status-badge";
import { SourceLineageRail, LineageStage } from "@/components/source-lineage-rail";
import { BARANGAY_MOBILE_NAV, BARANGAY_NAV, ROLE_META } from "@/lib/role-nav";
import { usePrototypeStore } from "@/lib/prototype-store";
import { consolidateBarangayTotals } from "@/lib/profile-data";

const BARANGAY = "Barangay Tetuan";

export default function BarangayConsolidationPage() {
  const meta = ROLE_META.barangay;
  const { purokProfiles, barangayProfiles } = usePrototypeStore();
  const puroks = purokProfiles.filter((p) => p.barangay === BARANGAY);
  const barangayRecord = barangayProfiles.find((b) => b.barangay === BARANGAY);
  const period = puroks[0]?.reportingPeriodLabel ?? "";

  if (!barangayRecord) {
    return (
      <RoleShell
        role="barangay"
        subtitle={meta.subtitle}
        nav={BARANGAY_NAV}
        mobileNav={BARANGAY_MOBILE_NAV}
        activeHref="/barangay/consolidation"
        userInitials={meta.userInitials}
        userName={meta.userName}
      >
        <p>No consolidation record for this Barangay yet.</p>
      </RoleShell>
    );
  }

  const { totals, verified, notYetVerified } = consolidateBarangayTotals(puroks, barangayRecord.additions);
  const previousPeriodLabel = puroks[0]?.previousVerified.identification.reportingPeriodLabel ?? "";
  const previousTotals = puroks.reduce(
    (acc, p) => {
      acc.totalHouseholds += p.previousVerified.population.totalHouseholds ?? 0;
      acc.totalPopulation += p.previousVerified.population.totalPopulation ?? 0;
      acc.householdsInHazardZone += p.previousVerified.housing.householdsInHazardZone ?? 0;
      return acc;
    },
    { totalHouseholds: 0, totalPopulation: 0, householdsInHazardZone: 0 },
  );

  const stages: LineageStage[] = [
    { label: "Purok sources", detail: `${verified.length} of ${puroks.length} verified`, state: verified.length === puroks.length ? "complete" : "current" },
    { label: "Barangay consolidation", detail: "This document", state: "current" },
    {
      label: "DRRM verification",
      detail: barangayRecord.reviewedBy ?? "Awaiting decision",
      timestamp: barangayRecord.reviewedAt ? formatDate(barangayRecord.reviewedAt) : undefined,
      state: barangayRecord.status === "verified" ? "complete" : barangayRecord.status === "correction_requested" ? "blocked" : "pending",
    },
  ];

  return (
    <RoleShell
      role="barangay"
      subtitle={meta.subtitle}
      nav={BARANGAY_NAV}
      mobileNav={BARANGAY_MOBILE_NAV}
      activeHref="/barangay/consolidation"
      userInitials={meta.userInitials}
      userName={meta.userName}
    >
      <div className="record-detail-header">
        <div>
          <p className="workspace-scope">{BARANGAY} · {period}</p>
          <h2>Barangay Profile Consolidation</h2>
        </div>
        <StatusBadge status={barangayRecord.status} />
      </div>

      <SourceLineageRail stages={stages} label="Consolidation lineage" />

      {barangayRecord.correctionNote && (
        <div className="callout callout-warning">
          <strong>Correction requested by {barangayRecord.reviewedBy}</strong>
          <p>{barangayRecord.correctionNote}</p>
        </div>
      )}

      {notYetVerified.length > 0 && (
        <div className="callout callout-warning">
          <strong>{notYetVerified.length} Purok{notYetVerified.length === 1 ? "" : "s"} not yet verified</strong>
          <p>
            {notYetVerified.map((p) => p.purokName).join(", ")} {notYetVerified.length === 1 ? "is" : "are"} excluded
            from the totals below until verified. Consolidated figures are provisional, not zero impact.
          </p>
        </div>
      )}

      <section className="panel">
        <h2>Consolidated totals</h2>
        <p>Reporting period {period}. Denominator: {verified.length} verified Purok{verified.length === 1 ? "" : "s"} of {puroks.length}, plus Barangay-wide additions.</p>
        <dl className="totals-grid">
          <div><dt>Total households</dt><dd className="tabular-nums">{totals.totalHouseholds}</dd></div>
          <div><dt>Total population</dt><dd className="tabular-nums">{totals.totalPopulation}</dd></div>
          <div><dt>Senior citizens</dt><dd className="tabular-nums">{totals.seniorCitizens}</dd></div>
          <div><dt>Persons with disability</dt><dd className="tabular-nums">{totals.personsWithDisability}</dd></div>
          <div><dt>Informal settler households</dt><dd className="tabular-nums">{totals.informalSettlerHouseholds}</dd></div>
          <div><dt>Households in hazard zone</dt><dd className="tabular-nums">{totals.householdsInHazardZone}</dd></div>
        </dl>
      </section>

      <section className="panel">
        <h2>Compared to last verified period</h2>
        <p>
          {previousPeriodLabel} reflects all {puroks.length} Puroks, fully verified. {period} reflects only the{" "}
          {verified.length} Purok{verified.length === 1 ? "" : "s"} verified so far this period. The two are not a
          like-for-like comparison until {period} reaches full coverage.
        </p>
        <table className="comparison-table">
          <caption className="visually-hidden">Comparison of last verified period and this period so far</caption>
          <thead>
            <tr>
              <th scope="col">Metric</th>
              <th scope="col">{previousPeriodLabel} ({puroks.length} of {puroks.length} Puroks)</th>
              <th scope="col">{period} so far ({verified.length} of {puroks.length} Puroks)</th>
            </tr>
          </thead>
          <tbody>
            <tr>
              <th scope="row">Total households</th>
              <td className="tabular-nums">{previousTotals.totalHouseholds}</td>
              <td className="tabular-nums">{totals.totalHouseholds}</td>
            </tr>
            <tr>
              <th scope="row">Total population</th>
              <td className="tabular-nums">{previousTotals.totalPopulation}</td>
              <td className="tabular-nums">{totals.totalPopulation}</td>
            </tr>
            <tr>
              <th scope="row">Households in hazard zone</th>
              <td className="tabular-nums">{previousTotals.householdsInHazardZone}</td>
              <td className="tabular-nums">{totals.householdsInHazardZone}</td>
            </tr>
          </tbody>
        </table>
      </section>

      <section className="panel">
        <h2>Verified Purok sources</h2>
        <ol className="record-list">
          {verified.map((p) => (
            <li key={p.id}>
              <Link className="record-row" href={`/barangay/profiles/${p.id}`}>
                <span className="record-row-title">
                  <strong>{p.purokName}</strong>
                  <span>Verified by {p.reviewedBy}</span>
                </span>
                <span className="record-row-meta tabular-nums">
                  {p.data.population.totalHouseholds} households · {p.data.population.totalPopulation} population
                </span>
                <StatusBadge status={p.status} />
              </Link>
            </li>
          ))}
          {verified.length === 0 && <li className="record-list-empty">No verified Purok sources for this period yet.</li>}
        </ol>
      </section>

      <section className="panel">
        <h2>Barangay-wide additions</h2>
        <p>Not assigned to any Purok, identified separately from consolidated Purok totals.</p>
        <dl className="totals-grid">
          <div><dt>Households</dt><dd className="tabular-nums">{barangayRecord.additions.barangayWideHouseholds}</dd></div>
          <div><dt>Population</dt><dd className="tabular-nums">{barangayRecord.additions.barangayWidePopulation}</dd></div>
        </dl>
        <p>{barangayRecord.additions.note}</p>
      </section>
    </RoleShell>
  );
}

function formatDate(iso: string) {
  return new Date(iso).toLocaleDateString(undefined, { month: "short", day: "numeric" });
}
