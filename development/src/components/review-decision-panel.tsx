"use client";

import { useState } from "react";

export function ReviewDecisionPanel({
  onVerify,
  onCorrection,
  onReject,
  verifyLabel = "Verify",
  correctionLabel = "Describe what needs correction",
  correctionActionLabel = "Send correction request",
  rejectLabel = "Describe why this is rejected",
}: {
  onVerify: () => void;
  onCorrection?: (note: string) => void;
  onReject?: (note: string) => void;
  verifyLabel?: string;
  correctionLabel?: string;
  correctionActionLabel?: string;
  rejectLabel?: string;
}) {
  const [mode, setMode] = useState<"correction" | "reject" | null>(null);
  const [note, setNote] = useState("");

  if (mode) {
    return (
      <div className="correction-form">
        <label htmlFor="reviewer-note">{mode === "correction" ? correctionLabel : rejectLabel}</label>
        <textarea id="reviewer-note" value={note} onChange={(e) => setNote(e.target.value)} required />
        <div className="correction-form-actions">
          <button
            type="button"
            className="primary-action"
            disabled={!note.trim()}
            onClick={() => {
              if (mode === "correction") onCorrection?.(note.trim());
              else onReject?.(note.trim());
            }}
          >
            {mode === "correction" ? correctionActionLabel : "Confirm rejection"}
          </button>
          <button
            type="button"
            className="secondary-action"
            onClick={() => {
              setMode(null);
              setNote("");
            }}
          >
            Cancel
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="detail-actions">
      <button type="button" className="primary-action" onClick={onVerify}>{verifyLabel}</button>
      {onCorrection && (
        <button type="button" className="secondary-action" onClick={() => setMode("correction")}>Request correction</button>
      )}
      {onReject && (
        <button type="button" className="secondary-action urgent-action" onClick={() => setMode("reject")}>Reject</button>
      )}
    </div>
  );
}
