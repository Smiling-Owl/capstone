"use client";

import { FormEvent, useState } from "react";
import { CreatedByLevel } from "@/lib/hazard-data";
import { usePrototypeStore } from "@/lib/prototype-store";

export function HazardEventCreateForm({
  createdByLevel,
  createdBy,
  barangay,
  city,
  activateImmediately,
}: {
  createdByLevel: CreatedByLevel;
  createdBy: string;
  barangay: string;
  city: string;
  activateImmediately: boolean;
}) {
  const { hazardTypes, createHazardEvent } = usePrototypeStore();
  const approvedTypes = hazardTypes.filter((type) => type.status !== "archived");
  const [hazardTypeId, setHazardTypeId] = useState("");
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [confirmation, setConfirmation] = useState(false);

  function handleSubmit(event: FormEvent) {
    event.preventDefault();
    if (!hazardTypeId || !title.trim()) return;
    createHazardEvent({
      hazardTypeId,
      title: title.trim(),
      description: description.trim(),
      barangay,
      city,
      createdByLevel,
      createdBy,
      activateImmediately,
    });
    setHazardTypeId("");
    setTitle("");
    setDescription("");
    setConfirmation(true);
  }

  return (
    <form className="panel inline-create-form" onSubmit={handleSubmit}>
      <h2>Report a new hazard event</h2>
      <p>
        {activateImmediately
          ? "Events you create activate immediately."
          : createdByLevel === "purok"
            ? "Requires Barangay verification before it becomes active."
            : "Requires DRRM verification before it becomes active."}
      </p>
      {confirmation && (
        <div className="callout callout-verified" role="status" aria-live="polite">
          <strong>Hazard event submitted</strong>
          <p>It now appears in the list below.</p>
        </div>
      )}
      <div className="form-grid">
        <div className="form-field">
          <label htmlFor="hazardTypeId">Hazard type</label>
          <select id="hazardTypeId" value={hazardTypeId} onChange={(e) => setHazardTypeId(e.target.value)} required>
            <option value="" disabled>Select from the CDRA registry</option>
            {approvedTypes.map((type) => (
              <option key={type.id} value={type.id}>{type.name}</option>
            ))}
          </select>
        </div>
        <div className="form-field">
          <label htmlFor="title">Event title</label>
          <input id="title" value={title} onChange={(e) => setTitle(e.target.value)} required />
        </div>
        <div className="form-field span-2">
          <label htmlFor="description">Description</label>
          <span className="field-note">What is happening, where, and since when.</span>
          <textarea id="description" value={description} onChange={(e) => setDescription(e.target.value)} />
        </div>
      </div>
      <div className="form-step-actions">
        <span />
        <button type="submit" className="primary-action" disabled={!hazardTypeId || !title.trim()}>
          Submit hazard event
        </button>
      </div>
    </form>
  );
}
