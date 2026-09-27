# Supabase database baseline

Apply `migrations/202609080001_initial_domain_schema.sql` to a disposable Supabase development database before using it on shared data.

The baseline intentionally fails closed: authenticated users can read only their own account/subtype, tenant geography, and reference catalogs. Operational tables have RLS enabled and no browser-write policies. Add narrowly scoped policies or security-definer RPCs with the first vertical application slice; never place the Supabase service-role key in the browser.

Core reporting boundary:

- Purok: Initial report metadata plus affected-family/person totals only.
- Barangay: exact verified Purok sources, consolidated population, casualty summary, and damage assessment.
- DRRM: frozen source snapshot, formal Situation Report content, review, approval, annexes, and export.

Run the executable migration scenarios and the static contract check:

```powershell
cd development/supabase
npm test
node tests/schema_contract_check.mjs
```

Generate the offline academic RDM viewer from the executed PostgreSQL catalog:

```powershell
cd development/supabase
npm run catalog
```

Then open `documentation/database/rdm/index.html`. Its SVG exports use 24 px labels and 5 px entity outlines for Lucidchart or draw.io.

When the Supabase CLI is installed, validate the actual PostgreSQL migration in a disposable local stack:

```powershell
supabase db reset
```

Do not add broad tenant-wide read policies for reports, evidence, sources, accounts, or audit records. Jurisdiction-scoped RLS and storage-bucket policies belong in the first feature migration, together with tests through actual authenticated JWT sessions.
