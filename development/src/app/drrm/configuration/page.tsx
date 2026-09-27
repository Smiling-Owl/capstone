"use client";

import { FormEvent, useEffect, useState } from "react";
import { RoleShell } from "@/components/role-shell";
import { StatusToneBadge } from "@/components/status-badge";
import { DRRM_MOBILE_NAV, DRRM_NAV, ROLE_META } from "@/lib/role-nav";
import { usePrototypeStore } from "@/lib/prototype-store";
import { formatScheduleDate, windowStatus } from "@/lib/config-data";
import { HAZARD_CATEGORY_LABEL } from "@/lib/hazard-data";

const ACTOR = "DRRM Verification Desk";

const HAZARD_CATEGORY_OPTIONS = Object.keys(HAZARD_CATEGORY_LABEL) as (keyof typeof HAZARD_CATEGORY_LABEL)[];

function windowBadge(phase: { opensAt: string; closesAt: string }) {
  const status = windowStatus(phase);
  const label = status === "open" ? "Open" : status === "upcoming" ? "Upcoming" : "Closed";
  const tone = status === "open" ? "pending" : "neutral";
  return <StatusToneBadge label={label} tone={tone} />;
}

function SitrepTemplateEditor() {
  const { config, updateSitrepConfig } = usePrototypeStore();
  const [templateVersion, setTemplateVersion] = useState(config.sitrep.templateVersion);
  const [draftWatermark, setDraftWatermark] = useState(config.sitrep.draftWatermark);
  const [approvedExportClean, setApprovedExportClean] = useState(config.sitrep.approvedExportClean);
  const [sourceReferencesRequired, setSourceReferencesRequired] = useState(config.sitrep.sourceReferencesRequired);
  const [saved, setSaved] = useState(false);

  useEffect(() => {
    setTemplateVersion(config.sitrep.templateVersion);
    setDraftWatermark(config.sitrep.draftWatermark);
    setApprovedExportClean(config.sitrep.approvedExportClean);
    setSourceReferencesRequired(config.sitrep.sourceReferencesRequired);
  }, [config.sitrep]);

  function handleSubmit(event: FormEvent) {
    event.preventDefault();
    updateSitrepConfig(
      {
        templateVersion: templateVersion.trim(),
        draftWatermark: draftWatermark.trim(),
        approvedExportClean,
        sourceReferencesRequired,
      },
      ACTOR,
    );
    setSaved(true);
  }

  return (
    <section className="panel">
      <h2>SitRep template and export configuration</h2>
      <p>
        Applies to SitReps generated from now on. Every generated SitRep records the template version used at the time.
      </p>
      {saved && (
        <div className="callout callout-verified" role="status">
          <strong>Configuration saved</strong>
          <p>The new template version is used by the next SitRep you generate.</p>
        </div>
      )}
      <form onSubmit={handleSubmit}>
        <div className="form-grid">
          <div className="form-field">
            <label htmlFor="sitrep-template-version">Active template version</label>
            <input
              id="sitrep-template-version"
              value={templateVersion}
              onChange={(e) => setTemplateVersion(e.target.value)}
              required
            />
            <span className="field-note">Published template identifier shown on the document header.</span>
          </div>
          <div className="form-field">
            <label htmlFor="sitrep-draft-watermark">Draft watermark text</label>
            <input
              id="sitrep-draft-watermark"
              value={draftWatermark}
              onChange={(e) => setDraftWatermark(e.target.value)}
              required
            />
            <span className="field-note">Shown on draft exports until the SitRep is approved.</span>
          </div>
          <div className="form-field">
            <label htmlFor="sitrep-approved-clean">Approved exports</label>
            <div className="checkbox-row">
              <input
                id="sitrep-approved-clean"
                type="checkbox"
                checked={approvedExportClean}
                onChange={(e) => setApprovedExportClean(e.target.checked)}
              />
              <span>Export approved SitReps without the watermark</span>
            </div>
          </div>
          <div className="form-field">
            <label htmlFor="sitrep-source-refs">Source references</label>
            <div className="checkbox-row">
              <input
                id="sitrep-source-refs"
                type="checkbox"
                checked={sourceReferencesRequired}
                onChange={(e) => setSourceReferencesRequired(e.target.checked)}
              />
              <span>Require source references on exported SitReps</span>
            </div>
          </div>
        </div>
        <div className="form-step-actions">
          <span />
          <button type="submit" className="primary-action">Save configuration</button>
        </div>
      </form>
    </section>
  );
}

function ScheduleCycleBlock() {
  const { config, updateSchedule } = usePrototypeStore();
  const [saved, setSaved] = useState(false);

  const nextCycle = config.cycles.find((cycle) => !cycle.isCurrent);
  const currentCycle = config.cycles.find((cycle) => cycle.isCurrent);
  const [drafts, setDrafts] = useState<Record<string, { opensAt: string; closesAt: string }>>({});

  useEffect(() => {
    if (!nextCycle) return;
    setDrafts(
      Object.fromEntries(nextCycle.phases.map((phase) => [phase.id, { opensAt: phase.opensAt, closesAt: phase.closesAt }])),
    );
  }, [nextCycle]);

  if (!currentCycle) return null;

  return (
    <section className="panel">
      <h2>Reporting schedule</h2>
      <p>Cutoffs follow the approved LGU calendar. The current cycle is locked; the next cycle is configurable.</p>
      {saved && (
        <div className="callout callout-verified" role="status">
          <strong>Schedule updated</strong>
          <p>{nextCycle?.periodLabel} reporting windows now use the dates shown.</p>
        </div>
      )}

      <h3 className="schedule-period-title">{currentCycle.periodLabel} (current)</h3>
      <table className="data-table">
        <caption className="visually-hidden">Current reporting cycle windows</caption>
        <thead>
          <tr>
            <th scope="col">Stage</th>
            <th scope="col">Applies to</th>
            <th scope="col">Window</th>
            <th scope="col">Status</th>
          </tr>
        </thead>
        <tbody>
          {currentCycle.phases.map((phase) => (
            <tr key={phase.id}>
              <td data-label="Stage"><span className="table-primary">{phase.task}</span></td>
              <td data-label="Applies to">{phase.appliesTo}</td>
              <td data-label="Window" className="tabular-nums">
                {formatScheduleDate(phase.opensAt)} &ndash; {formatScheduleDate(phase.closesAt)}
              </td>
              <td data-label="Status">{windowBadge(phase)}</td>
            </tr>
          ))}
        </tbody>
      </table>

      {nextCycle && (
        <>
          <h3 className="schedule-period-title">{nextCycle.periodLabel} (upcoming)</h3>
          <table className="data-table">
            <caption className="visually-hidden">Upcoming reporting cycle windows</caption>
            <thead>
              <tr>
                <th scope="col">Stage</th>
                <th scope="col">Applies to</th>
                <th scope="col">Opens</th>
                <th scope="col">Closes</th>
                <th scope="col"><span className="visually-hidden">Save</span></th>
              </tr>
            </thead>
            <tbody>
              {nextCycle.phases.map((phase) => {
                const draft = drafts[phase.id] ?? { opensAt: phase.opensAt, closesAt: phase.closesAt };
                return (
                  <tr key={phase.id}>
                    <td data-label="Stage"><span className="table-primary">{phase.task}</span></td>
                    <td data-label="Applies to">{phase.appliesTo}</td>
                    <td data-label="Opens">
                      <div className="form-field schedule-date-field">
                        <label className="visually-hidden" htmlFor={`${phase.id}-opens`}>Opens date</label>
                        <input
                          id={`${phase.id}-opens`}
                          type="date"
                          value={draft.opensAt}
                          onChange={(e) =>
                            setDrafts((prev) => ({
                              ...prev,
                              [phase.id]: { ...(prev[phase.id] ?? draft), opensAt: e.target.value },
                            }))
                          }
                        />
                      </div>
                    </td>
                    <td data-label="Closes">
                      <div className="form-field schedule-date-field">
                        <label className="visually-hidden" htmlFor={`${phase.id}-closes`}>Closes date</label>
                        <input
                          id={`${phase.id}-closes`}
                          type="date"
                          value={draft.closesAt}
                          onChange={(e) =>
                            setDrafts((prev) => ({
                              ...prev,
                              [phase.id]: { ...(prev[phase.id] ?? draft), closesAt: e.target.value },
                            }))
                          }
                        />
                      </div>
                    </td>
                    <td data-label="Actions">
                      <div className="table-actions">
                        <button
                          type="button"
                          className="row-action"
                          onClick={() => {
                            updateSchedule(nextCycle.periodLabel, phase.id, { opensAt: draft.opensAt, closesAt: draft.closesAt }, ACTOR);
                            setSaved(true);
                          }}
                        >
                          Save
                        </button>
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </>
      )}
    </section>
  );
}

function HazardRegistryManager() {
  const { hazardTypes, addHazardType, setHazardTypeStatus } = usePrototypeStore();
  const [name, setName] = useState("");
  const [category, setCategory] = useState<keyof typeof HAZARD_CATEGORY_LABEL>("hydrometeorological");
  const [description, setDescription] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [added, setAdded] = useState(false);

  function handleAdd(event: FormEvent) {
    event.preventDefault();
    setAdded(false);
    if (!name.trim()) {
      setError("Enter the hazard type name.");
      return;
    }
    if (!description.trim()) {
      setError("Describe the hazard type so users select the right one.");
      return;
    }
    addHazardType({ name: name.trim(), category, description: description.trim() }, ACTOR);
    setName("");
    setDescription("");
    setError(null);
    setAdded(true);
  }

  return (
    <section className="panel">
      <h2>CDRA hazard type registry</h2>
      <p>
        Users create hazard events only from approved types. Archiving a type hides it from new events without deleting
        existing history.
      </p>
      {error && (
        <div className="callout callout-urgent" role="alert">
          <strong>Cannot add the hazard type</strong>
          <p>{error}</p>
        </div>
      )}
      {added && (
        <div className="callout callout-verified" role="status">
          <strong>Hazard type added</strong>
          <p>It is now selectable when creating a hazard event.</p>
        </div>
      )}
      <form onSubmit={handleAdd}>
        <div className="form-grid">
          <div className="form-field">
            <label htmlFor="registry-name">Hazard type name</label>
            <input id="registry-name" value={name} onChange={(e) => setName(e.target.value)} required />
          </div>
          <div className="form-field">
            <label htmlFor="registry-category">Category</label>
            <select id="registry-category" value={category} onChange={(e) => setCategory(e.target.value as typeof category)}>
              {HAZARD_CATEGORY_OPTIONS.map((option) => (
                <option key={option} value={option}>{HAZARD_CATEGORY_LABEL[option]}</option>
              ))}
            </select>
          </div>
          <div className="form-field span-2">
            <label htmlFor="registry-description">Description</label>
            <textarea id="registry-description" value={description} onChange={(e) => setDescription(e.target.value)} required />
          </div>
        </div>
        <div className="form-step-actions">
          <span />
          <button type="submit" className="primary-action">Add hazard type</button>
        </div>
      </form>

      <table className="data-table">
        <caption className="visually-hidden">Approved and archived hazard types</caption>
        <thead>
          <tr>
            <th scope="col">Hazard type</th>
            <th scope="col">Category</th>
            <th scope="col">Status</th>
            <th scope="col"><span className="visually-hidden">Actions</span></th>
          </tr>
        </thead>
        <tbody>
          {hazardTypes.map((type) => (
            <tr key={type.id}>
              <td data-label="Hazard type">
                <span className="table-primary">{type.name}</span>
                <span className="table-secondary">{type.description}</span>
              </td>
              <td data-label="Category">{HAZARD_CATEGORY_LABEL[type.category]}</td>
              <td data-label="Status">
                <StatusToneBadge
                  label={type.status === "archived" ? "Archived" : "Approved"}
                  tone={type.status === "archived" ? "neutral" : "verified"}
                />
              </td>
              <td data-label="Actions">
                <div className="table-actions">
                  {type.status === "archived" ? (
                    <button type="button" className="row-action" onClick={() => setHazardTypeStatus(type.id, "approved", ACTOR)}>
                      Reactivate
                    </button>
                  ) : (
                    <button
                      type="button"
                      className="row-action row-action-danger"
                      onClick={() => {
                        if (window.confirm(`Archive "${type.name}"? It is hidden from new hazard events but kept for existing records.`)) {
                          setHazardTypeStatus(type.id, "archived", ACTOR);
                        }
                      }}
                    >
                      Archive
                    </button>
                  )}
                </div>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </section>
  );
}

export default function DrrmConfigurationPage() {
  const meta = ROLE_META.drrm;
  return (
    <RoleShell
      role="drrm"
      subtitle={meta.subtitle}
      nav={DRRM_NAV}
      mobileNav={DRRM_MOBILE_NAV}
      activeHref="/drrm/configuration"
      userInitials={meta.userInitials}
      userName={meta.userName}
    >
      <header className="role-header">
        <div>
          <p className="workspace-scope">{meta.subtitle}</p>
          <h1>Reporting Schedule and Template Configuration</h1>
        </div>
        <p className="role-mode">DRRM-managed</p>
      </header>
      <p className="data-freshness">
        DRRM-managed values that govern monthly profile cutoffs, SitRep template and export behavior, and the CDRA
        hazard type registry. Changes are recorded in the audit log.
      </p>
      <SitrepTemplateEditor />
      <ScheduleCycleBlock />
      <HazardRegistryManager />
    </RoleShell>
  );
}
