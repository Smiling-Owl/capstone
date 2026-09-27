export interface LineageStage {
  label: string;
  detail?: string;
  timestamp?: string;
  state: "complete" | "current" | "pending" | "blocked";
}

const STATE_TEXT: Record<LineageStage["state"], string> = {
  complete: "Complete",
  current: "In progress",
  pending: "Pending",
  blocked: "Needs attention",
};

export function SourceLineageRail({ stages, label = "Source lineage" }: { stages: LineageStage[]; label?: string }) {
  return (
    <ol className="lineage-rail" aria-label={label}>
      {stages.map((stage, index) => (
        <li key={stage.label} data-state={stage.state}>
          <span className="lineage-index" aria-hidden="true">{String(index + 1).padStart(2, "0")}</span>
          <span className="lineage-label">
            {stage.label} <span className="visually-hidden">({STATE_TEXT[stage.state]})</span>
          </span>
          {stage.detail && <span className="lineage-detail">{stage.detail}</span>}
          {stage.timestamp && <span className="lineage-timestamp tabular-nums">{stage.timestamp}</span>}
        </li>
      ))}
    </ol>
  );
}
