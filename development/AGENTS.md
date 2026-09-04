# Development guidance

## Architecture

- Build the application in this directory as the TypeScript monolith defined in `../documentation/TECH_STACK_AND_IMPLEMENTATION_PLAN.md`.
- Preserve tenant isolation, immutable submitted versions, idempotent submission, source traceability, and the documented privacy gate.
- Prefer the smallest vertical slice that produces a working end-to-end user flow.

## Automatic frontend skill routing

- For any UI implementation, redesign, or UX change, load `ui-ux-pro-max` before editing.
- For new pages, dashboards, substantial layouts, or visual-system work, also load `design-taste-frontend` and `frontend-design`.
- For accessibility, usability, or interface review, load `web-design-guidelines` and perform a separate review pass.
- Apply relevant design guidance to the implementation; do not load frontend skills for backend-only work.

## Verification

- Run the smallest relevant checks after changes and report failures accurately.
- Use an independent reviewer subagent for security-sensitive authorization, tenant isolation, approval, attachment, and export changes.
