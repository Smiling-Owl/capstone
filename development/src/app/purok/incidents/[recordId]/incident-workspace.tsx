"use client";

import { useParams, useRouter } from "next/navigation";
import {
  INCIDENT_SECTION_LABEL,
  INCIDENT_SECTION_ORDER,
  INCIDENT_VERSION_LABEL,
  IncidentReportSections,
  IncidentSectionKey,
  isIncidentSectionComplete,
} from "@/lib/hazard-data";
import { usePrototypeStore } from "@/lib/prototype-store";
import { StatusBadge } from "@/components/status-badge";
import { useState } from "react";

const CURRENT_USER = "Maria Santos";

type StepKey = IncidentSectionKey | "review";
const STEPS: StepKey[] = [...INCIDENT_SECTION_ORDER, "review"];

function toNumberInput(value: number | null) {
  return value === null ? "" : String(value);
}

function parseNumberInput(raw: string): number | null {
  if (raw.trim() === "") return null;
  const n = Number(raw);
  return Number.isNaN(n) ? null : n;
}

export function IncidentWorkspace() {
  const params = useParams<{ recordId: string }>();
  const router = useRouter();
  const { incidentReports, hazardEvents, saveIncidentDraft, submitIncidentReport } = usePrototypeStore();
  const record = incidentReports.find((r) => r.id === params.recordId);
  const [step, setStep] = useState<StepKey>("eventAndLocation");
  const [savedAt, setSavedAt] = useState<string | null>(null);

  if (!record) return <p>Incident report not found.</p>;

  const hazardEvent = hazardEvents.find((e) => e.id === record.hazardEventId);
  const data = record.data;
  const editable = record.status === "draft" || record.status === "correction_requested" || record.status === "not_started";
  const stepIndex = STEPS.indexOf(step);
  const complete = INCIDENT_SECTION_ORDER.every((key) => isIncidentSectionComplete(key, record.version, data));

  function updateSection<K extends IncidentSectionKey>(key: K, patch: Partial<IncidentReportSections[K]>) {
    const next: IncidentReportSections = { ...data, [key]: { ...data[key], ...patch } };
    saveIncidentDraft(record!.id, next);
    setSavedAt(new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }));
  }

  function handleSubmit() {
    submitIncidentReport(record!.id, data, CURRENT_USER);
    router.push("/purok/incidents");
  }

  return (
    <>
      <header className="role-header">
        <div>
          <p className="workspace-scope">{record.barangay} · {hazardEvent?.title ?? "Hazard event"}</p>
          <h1>{record.purokName} {INCIDENT_VERSION_LABEL[record.version]}</h1>
        </div>
        <StatusBadge status={record.status} />
      </header>

      {record.status === "correction_requested" && record.correctionNote && (
        <div className="callout callout-urgent">
          <strong>Correction requested by {record.reviewedBy}</strong>
          <p>{record.correctionNote}</p>
        </div>
      )}
      {!editable && (
        <div className="callout">
          <strong>This report is locked</strong>
          <p>
            {record.status === "verified"
              ? "This version is verified. File a Progress, Terminal, or Final report to add a new version."
              : "This report is being reviewed and cannot be edited until a decision is made."}
          </p>
        </div>
      )}

      <div className="profile-workspace">
        <ol className="profile-section-nav" aria-label="Incident report sections">
          {STEPS.map((key, index) => (
            <li key={key}>
              <button type="button" aria-current={step === key ? "step" : undefined} onClick={() => setStep(key)}>
                <span>
                  <span className="section-index tabular-nums">{String(index + 1).padStart(2, "0")}</span>{" "}
                  {key === "review" ? "Review and Submit" : INCIDENT_SECTION_LABEL[key]}
                </span>
                {key !== "review" && isIncidentSectionComplete(key, record.version, data) && (
                  <span className="section-check" aria-label="Section complete">✓</span>
                )}
              </button>
            </li>
          ))}
        </ol>

        <div className="profile-form-panel">
          {step === "eventAndLocation" && (
            <EventAndLocationSection data={data} editable={editable} hazardEventTitle={hazardEvent?.title} onChange={(p) => updateSection("eventAndLocation", p)} />
          )}
          {step === "prevailingSituation" && (
            <PrevailingSituationSection data={data} editable={editable} version={record.version} onChange={(p) => updateSection("prevailingSituation", p)} />
          )}
          {step === "affectedPopulation" && (
            <AffectedPopulationSection data={data} editable={editable} onChange={(p) => updateSection("affectedPopulation", p)} />
          )}
          {step === "casualtiesAndDisplacement" && (
            <CasualtiesSection data={data} editable={editable} onChange={(p) => updateSection("casualtiesAndDisplacement", p)} />
          )}
          {step === "damageAndLifelines" && (
            <DamageSection data={data} editable={editable} onChange={(p) => updateSection("damageAndLifelines", p)} />
          )}
          {step === "responseAndNeeds" && (
            <ResponseSection data={data} editable={editable} version={record.version} onChange={(p) => updateSection("responseAndNeeds", p)} />
          )}
          {step === "evidence" && (
            <EvidenceSection data={data} editable={editable} onChange={(p) => updateSection("evidence", p)} />
          )}
          {step === "review" && <ReviewSection data={data} version={record.version} />}

          <div className="form-step-actions">
            <button type="button" className="secondary-action" disabled={stepIndex === 0} onClick={() => setStep(STEPS[stepIndex - 1])}>
              Back
            </button>
            {step !== "review" ? (
              <button type="button" className="primary-action" onClick={() => setStep(STEPS[stepIndex + 1])}>
                Next: {STEPS[stepIndex + 1] === "review" ? "Review and Submit" : INCIDENT_SECTION_LABEL[STEPS[stepIndex + 1] as IncidentSectionKey]}
              </button>
            ) : (
              <button type="button" className="primary-action" disabled={!editable || !complete} onClick={handleSubmit}>
                Submit for Barangay verification
              </button>
            )}
          </div>
          {editable && (
            <p className="autosave-status">{savedAt ? `Saved to this device at ${savedAt}` : "Changes save to this device automatically."}</p>
          )}
        </div>
      </div>
    </>
  );
}

interface SectionProps<K extends IncidentSectionKey> {
  data: IncidentReportSections;
  editable: boolean;
  onChange: (patch: Partial<IncidentReportSections[K]>) => void;
}

function EventAndLocationSection({
  data,
  editable,
  hazardEventTitle,
  onChange,
}: SectionProps<"eventAndLocation"> & { hazardEventTitle?: string }) {
  const s = data.eventAndLocation;
  return (
    <>
      <h2>{INCIDENT_SECTION_LABEL.eventAndLocation}</h2>
      <p className="section-hint">Administrative location, landmark, observation time, reporter, and hazard event are required for every version.</p>
      <div className="form-grid">
        <div className="form-field span-2">
          <label htmlFor="hazardEventTitle">Hazard event</label>
          <input id="hazardEventTitle" value={hazardEventTitle ?? "Unknown event"} disabled />
        </div>
        <div className="form-field">
          <label htmlFor="administrativeLocation">Administrative location</label>
          <input id="administrativeLocation" value={s.administrativeLocation} disabled={!editable} onChange={(e) => onChange({ administrativeLocation: e.target.value })} />
        </div>
        <div className="form-field">
          <label htmlFor="landmark">Nearest landmark</label>
          <input id="landmark" value={s.landmark} disabled={!editable} onChange={(e) => onChange({ landmark: e.target.value })} />
        </div>
        <div className="form-field">
          <label htmlFor="observationTime">Observation time</label>
          <input id="observationTime" type="datetime-local" value={s.observationTime ?? ""} disabled={!editable} onChange={(e) => onChange({ observationTime: e.target.value || null })} />
        </div>
        <div className="form-field">
          <label htmlFor="reporterName">Reporter name</label>
          <input id="reporterName" value={s.reporterName} disabled={!editable} onChange={(e) => onChange({ reporterName: e.target.value })} />
        </div>
        <div className="form-field">
          <label htmlFor="reporterContact">Reporter contact</label>
          <input id="reporterContact" value={s.reporterContact} disabled={!editable} onChange={(e) => onChange({ reporterContact: e.target.value })} />
        </div>
        <div className="form-field">
          <label htmlFor="gpsCoordinates">GPS coordinates</label>
          <span className="field-note">Optional.</span>
          <input id="gpsCoordinates" value={s.gpsCoordinates} disabled={!editable} onChange={(e) => onChange({ gpsCoordinates: e.target.value })} />
        </div>
      </div>
    </>
  );
}

function PrevailingSituationSection({
  data,
  editable,
  version,
  onChange,
}: SectionProps<"prevailingSituation"> & { version: string }) {
  const s = data.prevailingSituation;
  return (
    <>
      <h2>{INCIDENT_SECTION_LABEL.prevailingSituation}</h2>
      <p className="section-hint">A short summary is required for every version. Intensity is required from the Progress report onward.</p>
      <div className="form-grid">
        <div className="form-field span-2">
          <label htmlFor="summary">Situation summary</label>
          <textarea id="summary" value={s.summary} disabled={!editable} onChange={(e) => onChange({ summary: e.target.value })} />
        </div>
        <div className="form-field">
          <label htmlFor="hazardIntensity">Hazard intensity{version !== "initial" ? "" : " (optional for Initial)"}</label>
          <select id="hazardIntensity" value={s.hazardIntensity ?? ""} disabled={!editable} onChange={(e) => onChange({ hazardIntensity: (e.target.value || null) as typeof s.hazardIntensity })}>
            <option value="">Not yet assessed</option>
            <option value="advisory">Advisory</option>
            <option value="watch">Watch</option>
            <option value="warning">Warning</option>
            <option value="emergency">Emergency</option>
          </select>
        </div>
        <div className="form-field">
          <label htmlFor="stillOngoing">Still ongoing</label>
          <div className="checkbox-row">
            <input id="stillOngoing" type="checkbox" checked={Boolean(s.stillOngoing)} disabled={!editable} onChange={(e) => onChange({ stillOngoing: e.target.checked })} />
            <span>{s.stillOngoing ? "Yes" : "No"}</span>
          </div>
        </div>
      </div>
    </>
  );
}

function AffectedPopulationSection({ data, editable, onChange }: SectionProps<"affectedPopulation">) {
  const s = data.affectedPopulation;
  const fields: { key: keyof IncidentReportSections["affectedPopulation"]; label: string }[] = [
    { key: "affectedFamilies", label: "Affected families" },
    { key: "affectedPersons", label: "Affected persons" },
    { key: "evacuatedFamilies", label: "Evacuated families" },
    { key: "evacuatedPersons", label: "Evacuated persons" },
    { key: "evacuationCentersActivated", label: "Evacuation centers activated" },
  ];
  return (
    <>
      <h2>{INCIDENT_SECTION_LABEL.affectedPopulation}</h2>
      <p className="section-hint">Required from the Progress report onward. Optional, but welcome, in an Initial report.</p>
      <div className="form-grid">
        {fields.map(({ key, label }) => (
          <div className="form-field" key={key}>
            <label htmlFor={key}>{label}</label>
            <input id={key} type="number" min={0} value={toNumberInput(s[key])} disabled={!editable} onChange={(e) => onChange({ [key]: parseNumberInput(e.target.value) } as Partial<IncidentReportSections["affectedPopulation"]>)} />
          </div>
        ))}
      </div>
    </>
  );
}

function CasualtiesSection({ data, editable, onChange }: SectionProps<"casualtiesAndDisplacement">) {
  const s = data.casualtiesAndDisplacement;
  const fields: { key: keyof IncidentReportSections["casualtiesAndDisplacement"]; label: string }[] = [
    { key: "deaths", label: "Deaths" },
    { key: "injured", label: "Injured" },
    { key: "missing", label: "Missing" },
    { key: "displacedFamilies", label: "Displaced families" },
  ];
  return (
    <>
      <h2>{INCIDENT_SECTION_LABEL.casualtiesAndDisplacement}</h2>
      <p className="section-hint">Required from the Progress report onward. Never presented as zero unless confirmed.</p>
      <div className="form-grid">
        {fields.map(({ key, label }) => (
          <div className="form-field" key={key}>
            <label htmlFor={key}>{label}</label>
            <input id={key} type="number" min={0} value={toNumberInput(s[key])} disabled={!editable} onChange={(e) => onChange({ [key]: parseNumberInput(e.target.value) } as Partial<IncidentReportSections["casualtiesAndDisplacement"]>)} />
          </div>
        ))}
      </div>
    </>
  );
}

function DamageSection({ data, editable, onChange }: SectionProps<"damageAndLifelines">) {
  const s = data.damageAndLifelines;
  const booleanFields: { key: "roadAccessAffected" | "powerInterrupted" | "waterInterrupted"; label: string }[] = [
    { key: "roadAccessAffected", label: "Road access affected" },
    { key: "powerInterrupted", label: "Power interrupted" },
    { key: "waterInterrupted", label: "Water interrupted" },
  ];
  return (
    <>
      <h2>{INCIDENT_SECTION_LABEL.damageAndLifelines}</h2>
      <p className="section-hint">Required from the Progress report onward.</p>
      <div className="form-grid">
        <div className="form-field">
          <label htmlFor="housesDamagedTotal">Houses totally damaged</label>
          <input id="housesDamagedTotal" type="number" min={0} value={toNumberInput(s.housesDamagedTotal)} disabled={!editable} onChange={(e) => onChange({ housesDamagedTotal: parseNumberInput(e.target.value) })} />
        </div>
        <div className="form-field">
          <label htmlFor="housesDamagedPartial">Houses partially damaged</label>
          <input id="housesDamagedPartial" type="number" min={0} value={toNumberInput(s.housesDamagedPartial)} disabled={!editable} onChange={(e) => onChange({ housesDamagedPartial: parseNumberInput(e.target.value) })} />
        </div>
        {booleanFields.map(({ key, label }) => (
          <div className="form-field" key={key}>
            <label htmlFor={key}>{label}</label>
            <div className="checkbox-row">
              <input id={key} type="checkbox" checked={Boolean(s[key])} disabled={!editable} onChange={(e) => onChange({ [key]: e.target.checked } as Partial<IncidentReportSections["damageAndLifelines"]>)} />
              <span>{s[key] ? "Yes" : "No"}</span>
            </div>
          </div>
        ))}
      </div>
    </>
  );
}

function ResponseSection({ data, editable, version, onChange }: SectionProps<"responseAndNeeds"> & { version: string }) {
  const s = data.responseAndNeeds;
  return (
    <>
      <h2>{INCIDENT_SECTION_LABEL.responseAndNeeds}</h2>
      <p className="section-hint">Immediate needs are required for every version. Response actions taken are required from the Progress report onward.</p>
      <div className="form-grid">
        <div className="form-field span-2">
          <label htmlFor="immediateNeeds">Immediate needs</label>
          <textarea id="immediateNeeds" value={s.immediateNeeds} disabled={!editable} onChange={(e) => onChange({ immediateNeeds: e.target.value })} />
        </div>
        <div className="form-field span-2">
          <label htmlFor="responseActionsTaken">Response actions taken{version === "initial" ? " (optional for Initial)" : ""}</label>
          <textarea id="responseActionsTaken" value={s.responseActionsTaken} disabled={!editable} onChange={(e) => onChange({ responseActionsTaken: e.target.value })} />
        </div>
        <div className="form-field span-2">
          <label htmlFor="resourcesDeployed">Resources deployed</label>
          <textarea id="resourcesDeployed" value={s.resourcesDeployed} disabled={!editable} onChange={(e) => onChange({ resourcesDeployed: e.target.value })} />
        </div>
      </div>
    </>
  );
}

function EvidenceSection({ data, editable, onChange }: SectionProps<"evidence">) {
  const s = data.evidence;
  return (
    <>
      <h2>{INCIDENT_SECTION_LABEL.evidence}</h2>
      <p className="section-hint">Optional supporting documentation.</p>
      <div className="form-grid">
        <div className="form-field">
          <label htmlFor="photosAttached">Photos attached</label>
          <input id="photosAttached" type="number" min={0} value={s.photosAttached} disabled={!editable} onChange={(e) => onChange({ photosAttached: Number(e.target.value) || 0 })} />
        </div>
        <div className="form-field span-2">
          <label htmlFor="evidenceNotes">Notes</label>
          <textarea id="evidenceNotes" value={s.notes} disabled={!editable} onChange={(e) => onChange({ notes: e.target.value })} />
        </div>
      </div>
    </>
  );
}

function ReviewSection({ data, version }: { data: IncidentReportSections; version: string }) {
  return (
    <>
      <h2>Review and Submit</h2>
      <p className="section-hint">Confirm before submitting. Barangay verification follows submission.</p>
      <div className="review-summary">
        <div className="review-summary-section">
          <header><h3>{INCIDENT_SECTION_LABEL.eventAndLocation}</h3></header>
          <dl>
            <div><dt>Location</dt><dd>{data.eventAndLocation.administrativeLocation || "Not entered"}</dd></div>
            <div><dt>Landmark</dt><dd>{data.eventAndLocation.landmark || "Not entered"}</dd></div>
            <div><dt>Reporter</dt><dd>{data.eventAndLocation.reporterName || "Not entered"}</dd></div>
          </dl>
        </div>
        <div className="review-summary-section">
          <header><h3>{INCIDENT_SECTION_LABEL.prevailingSituation}</h3></header>
          <dl>
            <div><dt>Summary</dt><dd>{data.prevailingSituation.summary || "Not entered"}</dd></div>
            <div><dt>Intensity</dt><dd>{data.prevailingSituation.hazardIntensity ?? "Not yet assessed"}</dd></div>
          </dl>
        </div>
        {version !== "initial" && (
          <>
            <div className="review-summary-section">
              <header><h3>{INCIDENT_SECTION_LABEL.affectedPopulation}</h3></header>
              <dl>
                <div><dt>Affected families</dt><dd className="tabular-nums">{data.affectedPopulation.affectedFamilies}</dd></div>
                <div><dt>Evacuated persons</dt><dd className="tabular-nums">{data.affectedPopulation.evacuatedPersons}</dd></div>
              </dl>
            </div>
            <div className="review-summary-section">
              <header><h3>{INCIDENT_SECTION_LABEL.casualtiesAndDisplacement}</h3></header>
              <dl>
                <div><dt>Deaths</dt><dd className="tabular-nums">{data.casualtiesAndDisplacement.deaths}</dd></div>
                <div><dt>Displaced families</dt><dd className="tabular-nums">{data.casualtiesAndDisplacement.displacedFamilies}</dd></div>
              </dl>
            </div>
          </>
        )}
        <div className="review-summary-section">
          <header><h3>{INCIDENT_SECTION_LABEL.responseAndNeeds}</h3></header>
          <dl>
            <div><dt>Immediate needs</dt><dd>{data.responseAndNeeds.immediateNeeds || "Not entered"}</dd></div>
          </dl>
        </div>
      </div>
    </>
  );
}
