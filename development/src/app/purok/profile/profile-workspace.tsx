"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import {
  PROFILE_SECTION_LABEL,
  PROFILE_SECTION_ORDER,
  ProfileSectionKey,
  PurokProfileSections,
} from "@/lib/profile-data";
import { usePrototypeStore } from "@/lib/prototype-store";
import { StatusBadge } from "@/components/status-badge";

const PROFILE_ID = "tetuan-purok-6-2026-09";
const CURRENT_USER = "Maria Santos";

type StepKey = ProfileSectionKey | "review";
const STEPS: StepKey[] = [...PROFILE_SECTION_ORDER, "review"];

function toNumberInput(value: number | null) {
  return value === null ? "" : String(value);
}

function parseNumberInput(raw: string): number | null {
  if (raw.trim() === "") return null;
  const n = Number(raw);
  return Number.isNaN(n) ? null : n;
}

function isSectionComplete(key: ProfileSectionKey, data: PurokProfileSections): boolean {
  if (key === "identification") {
    const s = data.identification;
    return Boolean(s.purokName && s.barangay && s.city && s.reportingPeriodLabel && s.preparedBy);
  }
  if (key === "population") {
    return Object.values(data.population).every((v) => v !== null);
  }
  if (key === "housing") {
    const s = data.housing;
    return (
      s.lightMaterialHouseholds !== null &&
      s.mixedMaterialHouseholds !== null &&
      s.concreteMaterialHouseholds !== null &&
      s.householdsInHazardZone !== null &&
      s.evacuationCenterAvailable !== null &&
      Boolean(s.primaryWaterSource) &&
      s.healthStationAccess !== null
    );
  }
  if (key === "vulnerability") {
    const s = data.vulnerability;
    return (
      s.exposedToFlood !== null &&
      s.exposedToLandslide !== null &&
      s.exposedToStormSurge !== null &&
      s.exposedToFireHazard !== null &&
      s.householdsWithoutEarlyWarningAccess !== null
    );
  }
  const s = data.capacities;
  return (
    s.trainedResponders !== null &&
    s.hasEarlyWarningEquipment !== null &&
    s.foodStockpileDays !== null &&
    s.waterStockpileDays !== null &&
    s.evacuationDrillsLast6Months !== null
  );
}

export function ProfileWorkspace() {
  const router = useRouter();
  const { purokProfiles, saveDraft, submitPurokProfile } = usePrototypeStore();
  const record = purokProfiles.find((p) => p.id === PROFILE_ID);
  const [step, setStep] = useState<StepKey>("identification");
  const [savedAt, setSavedAt] = useState<string | null>(null);

  if (!record) {
    return <p>Profile not found for this account.</p>;
  }

  const data = record.data;
  const editable = record.status === "draft" || record.status === "correction_requested" || record.status === "not_started";

  function updateSection<K extends ProfileSectionKey>(key: K, patch: Partial<PurokProfileSections[K]>) {
    const next: PurokProfileSections = { ...data, [key]: { ...data[key], ...patch } };
    saveDraft(PROFILE_ID, next);
    setSavedAt(new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }));
  }

  function goToStep(next: StepKey) {
    setStep(next);
  }

  function handleSubmit() {
    submitPurokProfile(PROFILE_ID, data, CURRENT_USER);
    router.push("/purok");
  }

  const stepIndex = STEPS.indexOf(step);

  return (
    <>
      <header className="role-header">
        <div>
          <p className="workspace-scope">{record.barangay}</p>
          <h1>Monthly Purok CDRA Profile</h1>
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
          <strong>This submission is locked</strong>
          <p>
            {record.status === "verified"
              ? "This period is verified. Changes require a new reporting period or a correction request from Barangay."
              : "This submission is being reviewed and cannot be edited until a decision is made."}
          </p>
        </div>
      )}

      <div className="profile-workspace">
        <ol className="profile-section-nav" aria-label="Profile sections">
          {STEPS.map((key, index) => (
            <li key={key}>
              <button
                type="button"
                aria-current={step === key ? "step" : undefined}
                onClick={() => goToStep(key)}
              >
                <span>
                  <span className="section-index tabular-nums">{String(index + 1).padStart(2, "0")}</span>{" "}
                  {key === "review" ? "Review and Submit" : PROFILE_SECTION_LABEL[key]}
                </span>
                {key !== "review" && isSectionComplete(key, data) && (
                  <span className="section-check" aria-label="Section complete">✓</span>
                )}
              </button>
            </li>
          ))}
        </ol>

        <div className="profile-form-panel">
          {step === "identification" && (
            <IdentificationSection data={data} editable={editable} onChange={(patch) => updateSection("identification", patch)} />
          )}
          {step === "population" && (
            <PopulationSection data={data} editable={editable} onChange={(patch) => updateSection("population", patch)} />
          )}
          {step === "housing" && (
            <HousingSection data={data} editable={editable} onChange={(patch) => updateSection("housing", patch)} />
          )}
          {step === "vulnerability" && (
            <VulnerabilitySection data={data} editable={editable} onChange={(patch) => updateSection("vulnerability", patch)} />
          )}
          {step === "capacities" && (
            <CapacitiesSection data={data} editable={editable} onChange={(patch) => updateSection("capacities", patch)} />
          )}
          {step === "review" && <ReviewSection data={data} />}

          <div className="form-step-actions">
            <button
              type="button"
              className="secondary-action"
              disabled={stepIndex === 0}
              onClick={() => goToStep(STEPS[stepIndex - 1])}
            >
              Back
            </button>
            {step !== "review" ? (
              <button type="button" className="primary-action" onClick={() => goToStep(STEPS[stepIndex + 1])}>
                Next: {STEPS[stepIndex + 1] === "review" ? "Review and Submit" : PROFILE_SECTION_LABEL[STEPS[stepIndex + 1] as ProfileSectionKey]}
              </button>
            ) : (
              <button
                type="button"
                className="primary-action"
                disabled={!editable || !PROFILE_SECTION_ORDER.every((key) => isSectionComplete(key, data))}
                onClick={handleSubmit}
              >
                Submit for Barangay verification
              </button>
            )}
          </div>
          {editable && (
            <p className="autosave-status">
              {savedAt ? `Saved to this device at ${savedAt}` : "Changes save to this device automatically."}
            </p>
          )}
        </div>
      </div>
    </>
  );
}

interface SectionProps<K extends ProfileSectionKey> {
  data: PurokProfileSections;
  editable: boolean;
  onChange: (patch: Partial<PurokProfileSections[K]>) => void;
}

function IdentificationSection({ data, editable, onChange }: SectionProps<"identification">) {
  const s = data.identification;
  return (
    <>
      <h2>{PROFILE_SECTION_LABEL.identification}</h2>
      <p className="section-hint">Confirm the reporting period and who is accomplishing this profile.</p>
      <div className="form-grid">
        <div className="form-field">
          <label htmlFor="purokName">Purok</label>
          <input id="purokName" value={s.purokName} disabled />
        </div>
        <div className="form-field">
          <label htmlFor="barangay">Barangay</label>
          <input id="barangay" value={s.barangay} disabled />
        </div>
        <div className="form-field">
          <label htmlFor="reportingPeriod">Reporting period</label>
          <input id="reportingPeriod" value={s.reportingPeriodLabel} disabled />
        </div>
        <div className="form-field">
          <label htmlFor="preparedBy">Prepared by</label>
          <input
            id="preparedBy"
            value={s.preparedBy}
            disabled={!editable}
            onChange={(e) => onChange({ preparedBy: e.target.value })}
          />
        </div>
      </div>
    </>
  );
}

function PopulationSection({ data, editable, onChange }: SectionProps<"population">) {
  const s = data.population;
  const fields: { key: keyof PurokProfileSections["population"]; label: string }[] = [
    { key: "totalHouseholds", label: "Total households" },
    { key: "totalPopulation", label: "Total population" },
    { key: "malePopulation", label: "Male population" },
    { key: "femalePopulation", label: "Female population" },
    { key: "childrenUnder5", label: "Children under 5" },
    { key: "seniorCitizens", label: "Senior citizens" },
    { key: "personsWithDisability", label: "Persons with disability" },
    { key: "pregnantOrLactatingWomen", label: "Pregnant or lactating women" },
    { key: "informalSettlerHouseholds", label: "Informal settler households" },
  ];
  return (
    <>
      <h2>{PROFILE_SECTION_LABEL.population}</h2>
      <p className="section-hint">Prefilled from the last verified period. Update counts that changed.</p>
      <div className="form-grid">
        {fields.map(({ key, label }) => (
          <div className="form-field" key={key}>
            <label htmlFor={key}>{label}</label>
            <input
              id={key}
              type="number"
              inputMode="numeric"
              min={0}
              value={toNumberInput(s[key])}
              disabled={!editable}
              onChange={(e) => onChange({ [key]: parseNumberInput(e.target.value) } as Partial<PurokProfileSections["population"]>)}
            />
          </div>
        ))}
      </div>
    </>
  );
}

function HousingSection({ data, editable, onChange }: SectionProps<"housing">) {
  const s = data.housing;
  return (
    <>
      <h2>{PROFILE_SECTION_LABEL.housing}</h2>
      <p className="section-hint">Housing material counts should sum to total households.</p>
      <div className="form-grid">
        <div className="form-field">
          <label htmlFor="lightMaterialHouseholds">Light material households</label>
          <input
            id="lightMaterialHouseholds"
            type="number"
            min={0}
            value={toNumberInput(s.lightMaterialHouseholds)}
            disabled={!editable}
            onChange={(e) => onChange({ lightMaterialHouseholds: parseNumberInput(e.target.value) })}
          />
        </div>
        <div className="form-field">
          <label htmlFor="mixedMaterialHouseholds">Mixed material households</label>
          <input
            id="mixedMaterialHouseholds"
            type="number"
            min={0}
            value={toNumberInput(s.mixedMaterialHouseholds)}
            disabled={!editable}
            onChange={(e) => onChange({ mixedMaterialHouseholds: parseNumberInput(e.target.value) })}
          />
        </div>
        <div className="form-field">
          <label htmlFor="concreteMaterialHouseholds">Concrete material households</label>
          <input
            id="concreteMaterialHouseholds"
            type="number"
            min={0}
            value={toNumberInput(s.concreteMaterialHouseholds)}
            disabled={!editable}
            onChange={(e) => onChange({ concreteMaterialHouseholds: parseNumberInput(e.target.value) })}
          />
        </div>
        <div className="form-field">
          <label htmlFor="householdsInHazardZone">Households in a mapped hazard zone</label>
          <input
            id="householdsInHazardZone"
            type="number"
            min={0}
            value={toNumberInput(s.householdsInHazardZone)}
            disabled={!editable}
            onChange={(e) => onChange({ householdsInHazardZone: parseNumberInput(e.target.value) })}
          />
        </div>
        <div className="form-field">
          <label htmlFor="evacuationCenterAvailable">Evacuation center</label>
          <select
            id="evacuationCenterAvailable"
            value={s.evacuationCenterAvailable ?? ""}
            disabled={!editable}
            onChange={(e) => onChange({ evacuationCenterAvailable: e.target.value as typeof s.evacuationCenterAvailable })}
          >
            <option value="" disabled>Select</option>
            <option value="yes">Available within Purok</option>
            <option value="shared_with_adjacent_purok">Shared with adjacent Purok</option>
            <option value="no">Not available</option>
          </select>
        </div>
        <div className="form-field">
          <label htmlFor="healthStationAccess">Nearest health station</label>
          <select
            id="healthStationAccess"
            value={s.healthStationAccess ?? ""}
            disabled={!editable}
            onChange={(e) => onChange({ healthStationAccess: e.target.value as typeof s.healthStationAccess })}
          >
            <option value="" disabled>Select</option>
            <option value="within_purok">Within Purok</option>
            <option value="adjacent_purok">Adjacent Purok</option>
            <option value="barangay_center">Barangay center</option>
          </select>
        </div>
        <div className="form-field span-2">
          <label htmlFor="primaryWaterSource">Primary water source</label>
          <input
            id="primaryWaterSource"
            value={s.primaryWaterSource}
            disabled={!editable}
            onChange={(e) => onChange({ primaryWaterSource: e.target.value })}
          />
        </div>
      </div>
    </>
  );
}

function VulnerabilitySection({ data, editable, onChange }: SectionProps<"vulnerability">) {
  const s = data.vulnerability;
  const hazards: { key: "exposedToFlood" | "exposedToLandslide" | "exposedToStormSurge" | "exposedToFireHazard"; label: string }[] = [
    { key: "exposedToFlood", label: "Exposed to flooding" },
    { key: "exposedToLandslide", label: "Exposed to landslide" },
    { key: "exposedToStormSurge", label: "Exposed to storm surge" },
    { key: "exposedToFireHazard", label: "Exposed to fire hazard" },
  ];
  return (
    <>
      <h2>{PROFILE_SECTION_LABEL.vulnerability}</h2>
      <p className="section-hint">Hazard exposure should reflect the current CDRA-approved hazard map for this Purok.</p>
      <div className="form-grid">
        {hazards.map(({ key, label }) => (
          <div className="form-field" key={key}>
            <label htmlFor={key}>{label}</label>
            <div className="checkbox-row">
              <input
                id={key}
                type="checkbox"
                checked={Boolean(s[key])}
                disabled={!editable}
                onChange={(e) => onChange({ [key]: e.target.checked } as Partial<PurokProfileSections["vulnerability"]>)}
              />
              <span>{s[key] ? "Yes" : "No"}</span>
            </div>
          </div>
        ))}
        <div className="form-field">
          <label htmlFor="householdsWithoutEarlyWarningAccess">Households without early warning access</label>
          <input
            id="householdsWithoutEarlyWarningAccess"
            type="number"
            min={0}
            value={toNumberInput(s.householdsWithoutEarlyWarningAccess)}
            disabled={!editable}
            onChange={(e) => onChange({ householdsWithoutEarlyWarningAccess: parseNumberInput(e.target.value) })}
          />
        </div>
        <div className="form-field span-2">
          <label htmlFor="vulnerabilityNotes">Notes</label>
          <span className="field-note">Optional. Describe conditions a reviewer should know about.</span>
          <textarea
            id="vulnerabilityNotes"
            value={s.notes}
            disabled={!editable}
            onChange={(e) => onChange({ notes: e.target.value })}
          />
        </div>
      </div>
    </>
  );
}

function CapacitiesSection({ data, editable, onChange }: SectionProps<"capacities">) {
  const s = data.capacities;
  return (
    <>
      <h2>{PROFILE_SECTION_LABEL.capacities}</h2>
      <p className="section-hint">Local response capacity available to this Purok as of the reporting date.</p>
      <div className="form-grid">
        <div className="form-field">
          <label htmlFor="trainedResponders">Trained BDRRM/CERT responders</label>
          <input
            id="trainedResponders"
            type="number"
            min={0}
            value={toNumberInput(s.trainedResponders)}
            disabled={!editable}
            onChange={(e) => onChange({ trainedResponders: parseNumberInput(e.target.value) })}
          />
        </div>
        <div className="form-field">
          <label htmlFor="hasEarlyWarningEquipment">Early warning equipment on hand</label>
          <div className="checkbox-row">
            <input
              id="hasEarlyWarningEquipment"
              type="checkbox"
              checked={Boolean(s.hasEarlyWarningEquipment)}
              disabled={!editable}
              onChange={(e) => onChange({ hasEarlyWarningEquipment: e.target.checked })}
            />
            <span>{s.hasEarlyWarningEquipment ? "Yes" : "No"}</span>
          </div>
        </div>
        <div className="form-field">
          <label htmlFor="foodStockpileDays">Food stockpile (days of supply)</label>
          <input
            id="foodStockpileDays"
            type="number"
            min={0}
            value={toNumberInput(s.foodStockpileDays)}
            disabled={!editable}
            onChange={(e) => onChange({ foodStockpileDays: parseNumberInput(e.target.value) })}
          />
        </div>
        <div className="form-field">
          <label htmlFor="waterStockpileDays">Water stockpile (days of supply)</label>
          <input
            id="waterStockpileDays"
            type="number"
            min={0}
            value={toNumberInput(s.waterStockpileDays)}
            disabled={!editable}
            onChange={(e) => onChange({ waterStockpileDays: parseNumberInput(e.target.value) })}
          />
        </div>
        <div className="form-field">
          <label htmlFor="evacuationDrillsLast6Months">Evacuation drills, last 6 months</label>
          <input
            id="evacuationDrillsLast6Months"
            type="number"
            min={0}
            value={toNumberInput(s.evacuationDrillsLast6Months)}
            disabled={!editable}
            onChange={(e) => onChange({ evacuationDrillsLast6Months: parseNumberInput(e.target.value) })}
          />
        </div>
      </div>
    </>
  );
}

function ReviewSection({ data }: { data: PurokProfileSections }) {
  return (
    <>
      <h2>Review and Submit</h2>
      <p className="section-hint">Confirm each section before submitting. Barangay verification follows submission.</p>
      <div className="review-summary">
        <div className="review-summary-section">
          <header><h3>{PROFILE_SECTION_LABEL.identification}</h3></header>
          <dl>
            <div><dt>Purok</dt><dd>{data.identification.purokName}</dd></div>
            <div><dt>Reporting period</dt><dd>{data.identification.reportingPeriodLabel}</dd></div>
            <div><dt>Prepared by</dt><dd>{data.identification.preparedBy || "Not entered"}</dd></div>
          </dl>
        </div>
        <div className="review-summary-section">
          <header><h3>{PROFILE_SECTION_LABEL.population}</h3></header>
          <dl>
            <div><dt>Total households</dt><dd className="tabular-nums">{data.population.totalHouseholds}</dd></div>
            <div><dt>Total population</dt><dd className="tabular-nums">{data.population.totalPopulation}</dd></div>
            <div><dt>Senior citizens</dt><dd className="tabular-nums">{data.population.seniorCitizens}</dd></div>
            <div><dt>Persons with disability</dt><dd className="tabular-nums">{data.population.personsWithDisability}</dd></div>
          </dl>
        </div>
        <div className="review-summary-section">
          <header><h3>{PROFILE_SECTION_LABEL.housing}</h3></header>
          <dl>
            <div><dt>Households in hazard zone</dt><dd className="tabular-nums">{data.housing.householdsInHazardZone}</dd></div>
            <div><dt>Evacuation center</dt><dd>{data.housing.evacuationCenterAvailable}</dd></div>
          </dl>
        </div>
        <div className="review-summary-section">
          <header><h3>{PROFILE_SECTION_LABEL.vulnerability}</h3></header>
          <dl>
            <div><dt>Flood exposure</dt><dd>{data.vulnerability.exposedToFlood ? "Yes" : "No"}</dd></div>
            <div><dt>Landslide exposure</dt><dd>{data.vulnerability.exposedToLandslide ? "Yes" : "No"}</dd></div>
            <div><dt>Without early warning access</dt><dd className="tabular-nums">{data.vulnerability.householdsWithoutEarlyWarningAccess}</dd></div>
          </dl>
        </div>
        <div className="review-summary-section">
          <header><h3>{PROFILE_SECTION_LABEL.capacities}</h3></header>
          <dl>
            <div><dt>Trained responders</dt><dd className="tabular-nums">{data.capacities.trainedResponders}</dd></div>
            <div><dt>Food stockpile</dt><dd className="tabular-nums">{data.capacities.foodStockpileDays} days</dd></div>
          </dl>
        </div>
      </div>
    </>
  );
}
