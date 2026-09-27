"use client";

import { CreatedByLevel, HazardEvent } from "@/lib/hazard-data";
import { StatusBadge } from "@/components/status-badge";
import { ReviewDecisionPanel } from "@/components/review-decision-panel";
import { usePrototypeStore } from "@/lib/prototype-store";

function formatDateTime(iso: string) {
  return new Date(iso).toLocaleString(undefined, { month: "short", day: "numeric", hour: "2-digit", minute: "2-digit" });
}

export function HazardEventList({
  events,
  reviewer,
  reviewableCreatorLevel,
}: {
  events: HazardEvent[];
  reviewer: string;
  /** Only events created at this level show Verify/Correction/Reject actions. Omit to render read-only. */
  reviewableCreatorLevel?: CreatedByLevel;
}) {
  const { hazardTypes, verifyHazardEvent, requestHazardEventCorrection, rejectHazardEvent } = usePrototypeStore();

  function hazardTypeName(id: string) {
    return hazardTypes.find((t) => t.id === id)?.name ?? id;
  }

  if (events.length === 0) {
    return <p className="record-list-empty">No hazard events for this scope yet.</p>;
  }

  return (
    <ol className="hazard-list">
      {events.map((event) => {
        const pending = event.status === "submitted" || event.status === "under_review";
        const actionable = pending && event.createdByLevel === reviewableCreatorLevel;
        return (
          <li key={event.id} className="hazard-row">
            <div className="hazard-row-header">
              <div>
                <span className="hazard-type-tag">{hazardTypeName(event.hazardTypeId)}</span>
                <div><strong>{event.title}</strong></div>
              </div>
              <StatusBadge status={event.status} />
            </div>
            <p className="hazard-row-meta">
              {event.barangay} · Created by {event.createdBy} ({event.createdByLevel}) · {formatDateTime(event.createdAt)}
            </p>
            <p className="hazard-row-description">{event.description}</p>
            {event.correctionNote && (
              <div className={event.status === "rejected" ? "callout callout-urgent" : "callout callout-warning"}>
                <strong>{event.status === "rejected" ? "Rejected" : "Correction requested"} by {event.reviewedBy}</strong>
                <p>{event.correctionNote}</p>
              </div>
            )}
            {actionable && (
              <ReviewDecisionPanel
                onVerify={() => verifyHazardEvent(event.id, reviewer)}
                onCorrection={(note) => requestHazardEventCorrection(event.id, reviewer, note)}
                onReject={(note) => rejectHazardEvent(event.id, reviewer, note)}
              />
            )}
          </li>
        );
      })}
    </ol>
  );
}
