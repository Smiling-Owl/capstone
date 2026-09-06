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

<!-- BEGIN:nextjs-agent-rules -->

# This is NOT the Next.js you know

This version has breaking changes — APIs, conventions, and file structure may all differ from your training data. Read the relevant guide in `node_modules/next/dist/docs/` (resolved from this file's directory; in monorepos the `next` package may not be visible from the repo root) before writing any code. Heed deprecation notices.

This block is written and re-added by `next dev` — verify at `node_modules/next/dist/server/lib/generate-agent-files.js`. Removing it from a diff only re-creates the uncommitted change; committing it with your work keeps the tree clean.

<!-- END:nextjs-agent-rules -->
