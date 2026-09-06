"use client";

import { useState } from "react";
import { useParams } from "next/navigation";
import { usePrototypeStore } from "@/lib/prototype-store";
import { StatusToneBadge } from "@/components/status-badge";
import { ReviewDecisionPanel } from "@/components/review-decision-panel";
import {
  SITREP_SECTION_LABEL,
  SITREP_SECTION_ORDER,
  SITREP_SOURCE_LINKED,
  SITREP_STATUS_LABEL,
  SITREP_STATUS_TONE,
  SitRepSectionKey,
  SitRepSections,
} from "@/lib/sitrep-data";

const CURRENT_USER = "DRRM Verification Desk";

export function SitRepEditor() {
  const params = useParams<{ id: string }>();
  const { sitreps, hazardEvents, saveSitRepDraft, submitSitRepForReview, approveSitRep, returnSitRep, exportSitRep } = usePrototypeStore();
  const sitrep = sitreps.find((s) => s.id === params.id);
  const [submitError, setSubmitError] = useState<string | null>(null);

  if (!sitrep) return <p>SitRep not found.</p>;

  const event = hazardEvents.find((e) => e.id === sitrep.hazardEventId);
  const editable = sitrep.status === "draft" || sitrep.status === "returned";
  const reviewable = sitrep.status === "under_review";
  const exportable = sitrep.status === "approved";
  const watermarked = sitrep.status !== "approved" && sitrep.status !== "exported";

  function updateSection<K extends SitRepSectionKey>(key: K, patch: Partial<SitRepSections[K]>) {
    const next: SitRepSections = { ...sitrep!.sections, [key]: { ...sitrep!.sections[key], ...patch } };
    saveSitRepDraft(sitrep!.id, next);
  }

  function unresolvedDiscrepancies(): SitRepSectionKey[] {
    return SITREP_SECTION_ORDER.filter((key) => {
      const s = sitrep!.sections[key];
      if (!SITREP_SOURCE_LINKED[key] || s.originalNarrative === undefined) return false;
      return s.narrative !== s.originalNarrative && !s.overridden;
    });
  }

  function handleSubmit() {
    const unresolved = unresolvedDiscrepancies();
    if (unresolved.length > 0) {
      setSubmitError(
        `${unresolved.map((k) => SITREP_SECTION_LABEL[k]).join(", ")} ${unresolved.length === 1 ? "has" : "have"} changed from the source-derived value. Check "Document an override" and explain why, or restore the source value, before submitting.`,
      );
      return;
    }
    setSubmitError(null);
    submitSitRepForReview(sitrep!.id);
  }

  return (
    <>
      <div className="record-detail-header">
        <div>
          <p className="workspace-scope">
            {event?.barangay ?? ""} · {sitrep.reportingPeriodLabel} · Version {sitrep.generatedVersion}
          </p>
          <h2>{sitrep.title}</h2>
        </div>
        <StatusToneBadge label={SITREP_STATUS_LABEL[sitrep.status]} tone={SITREP_STATUS_TONE[sitrep.status]} />
      </div>

      {sitrep.status === "returned" && sitrep.returnNote && (
        <div className="callout callout-urgent">
          <strong>Returned by {sitrep.reviewedBy}</strong>
          <p>{sitrep.returnNote}</p>
        </div>
      )}

      <div className="sitrep-editor">
        <div className="sitrep-sections">
          {SITREP_SECTION_ORDER.map((key) => {
            const s = sitrep.sections[key];
            const sourceLinked = SITREP_SOURCE_LINKED[key];
            const diverged = sourceLinked && s.originalNarrative !== undefined && s.narrative !== s.originalNarrative;
            return (
              <div className="sitrep-section-card" key={key}>
                {sourceLinked && <span className="source-tag">Source-linked</span>}
                <h3>{SITREP_SECTION_LABEL[key]}</h3>
                <textarea
                  aria-label={SITREP_SECTION_LABEL[key]}
                  value={s.narrative}
                  disabled={!editable}
                  onChange={(e) => updateSection(key, { narrative: e.target.value })}
                />
                {diverged && (
                  <div className="sitrep-discrepancy">
                    <div className="sitrep-override-row">
                      <input
                        id={`override-${key}`}
                        type="checkbox"
                        checked={s.overridden}
                        disabled={!editable}
                        onChange={(e) => updateSection(key, { overridden: e.target.checked })}
                      />
                      <label htmlFor={`override-${key}`}>This differs from the source-derived value. Document an override.</label>
                    </div>
                    {s.overridden && (
                      <div className="form-field sitrep-override-note">
                        <label htmlFor={`override-note-${key}`}>Override justification</label>
                        <textarea
                          id={`override-note-${key}`}
                          value={s.overrideNote}
                          disabled={!editable}
                          onChange={(e) => updateSection(key, { overrideNote: e.target.value })}
                        />
                      </div>
                    )}
                  </div>
                )}
              </div>
            );
          })}

          {editable && (
            <div className="form-step-actions">
              <span />
              <button type="button" className="primary-action" onClick={handleSubmit}>
                Submit for review
              </button>
            </div>
          )}
          {submitError && (
            <div className="callout callout-urgent">
              <strong>Cannot submit yet</strong>
              <p>{submitError}</p>
            </div>
          )}

          {reviewable && (
            <section className="panel">
              <h2>Review decision</h2>
              <ReviewDecisionPanel
                onVerify={() => approveSitRep(sitrep.id, CURRENT_USER)}
                onCorrection={(note) => returnSitRep(sitrep.id, CURRENT_USER, note)}
                verifyLabel="Approve"
                correctionLabel="Describe what needs revision before this can be approved"
                correctionActionLabel="Return for revision"
              />
            </section>
          )}

          {exportable && (
            <section className="panel">
              <h2>Export</h2>
              <p>Approved SitReps export cleanly with numbering, signatories, and source references.</p>
              <div className="detail-actions">
                <button type="button" className="primary-action" onClick={() => exportSitRep(sitrep.id, CURRENT_USER)}>
                  Export as PDF
                </button>
                <button type="button" className="secondary-action" onClick={() => exportSitRep(sitrep.id, CURRENT_USER)}>
                  Export as DOCX
                </button>
              </div>
            </section>
          )}

          {sitrep.status === "exported" && (
            <div className="callout callout-verified">
              <strong>Exported</strong>
              <p>
                Exported by {sitrep.exportedBy} on {sitrep.exportedAt ? new Date(sitrep.exportedAt).toLocaleString() : ""}.
              </p>
            </div>
          )}
        </div>

        <div className="sitrep-preview-wrap">
          <div className="sitrep-preview">
            {watermarked && (
              <div className="sitrep-watermark" aria-hidden="true">
                <span>Draft · Not for Release</span>
              </div>
            )}
            <header className="sitrep-preview-header">
              <h2>{sitrep.title}</h2>
              <p className="sitrep-preview-meta">
                {event?.barangay ?? ""} · {sitrep.reportingPeriodLabel}
                <br />
                {sitrep.templateVersion} · Generated version {sitrep.generatedVersion}
                <br />
                Prepared by {sitrep.preparedBy}
              </p>
            </header>
            {SITREP_SECTION_ORDER.map((key) => (
              <div className="sitrep-preview-section" key={key}>
                <h4>{SITREP_SECTION_LABEL[key]}</h4>
                {sitrep.sections[key].narrative ? (
                  <p>{sitrep.sections[key].narrative}</p>
                ) : (
                  <p className="sitrep-preview-empty">Not yet written.</p>
                )}
              </div>
            ))}
            {(sitrep.status === "approved" || sitrep.status === "exported") && (
              <div className="sitrep-signatory">
                <p>Approved by {sitrep.approvedBy}</p>
                <p>{sitrep.approvedAt ? new Date(sitrep.approvedAt).toLocaleString() : ""}</p>
              </div>
            )}
          </div>
        </div>
      </div>
    </>
  );
}
