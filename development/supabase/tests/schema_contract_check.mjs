import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';

const sql = readFileSync(new URL('../migrations/202609080001_initial_domain_schema.sql', import.meta.url), 'utf8');

for (const required of [
  "Purok Initial reports may contain affected-population totals only",
  "A Purok report series remains Initial",
  "Only verified Purok versions may be included",
  "Purok source must be a direct child of the consolidating Barangay",
  "SitRep data-point lineage must come from an included exact Barangay report version",
  "A frozen source snapshot is immutable",
  "The preparer cannot review the same version",
  "Draft and under-review exports must be watermarked",
  "force row level security",
  "Account subtype identity cannot change",
  "Report effect subtype identity cannot change",
  "Incident-hazard identity cannot change",
  "Exporter lacks an active SitRep role for the city",
]) assert.ok(sql.includes(required), `missing schema invariant: ${required}`);

assert.ok(/incident_hazard_immutable_after_submission before insert or update or delete/.test(sql), 'new hazard links must not bypass submitted-incident protection');
assert.ok(/v_state <> 'draft' and new\.content_hash is distinct from v_hash/.test(sql), 'frozen export hashes must use a NULL-safe comparison');

assert.ok(!/create policy tenant_member_read on public\.(evidence|audit_event|incident_report)/i.test(sql), 'restricted tables must not receive blanket tenant read policies');
assert.ok(/create type public\.effect_kind as enum \('affected_population', 'casualty_summary', 'damage_assessment'\)/.test(sql));
assert.ok(/v_level = 'purok' and new\.kind <> 'affected_population'/.test(sql));
assert.ok(/family_count_state public\.value_state not null/.test(sql));
assert.ok(/person_count_state public\.value_state not null/.test(sql));
assert.ok(/new\.content_hash := encode\(pg_catalog\.sha256/.test(sql), 'finalization must calculate a database-side content hash');
assert.ok(!/\bdigest\s*\(/.test(sql), 'schema must not depend on the optional pgcrypto digest function');
assert.ok(sql.includes('All six formal SitRep body sections must be completed or explicitly qualified before review'));
assert.ok(sql.includes("'structured_content', public.sitrep_structured_payload(new.tenant_id, new.id)"));
assert.ok(sql.includes("'consolidated_purok_versions', v_consolidation_sources"));

const tableStarts = new Map([...sql.matchAll(/create table public\.(\w+)\s*\(/gi)].map(match => [match[1], match.index]));
for (const table of sql.matchAll(/create table public\.(\w+)\s*\(([\s\S]*?)\n\);/gi)) {
  for (const reference of table[2].matchAll(/references public\.(\w+)/gi)) {
    const referenceStart = tableStarts.get(reference[1]);
    assert.ok(referenceStart !== undefined, `${table[1]} references missing table ${reference[1]}`);
    assert.ok(reference[1] === table[1] || referenceStart < table.index, `${table[1]} references ${reference[1]} before it is created`);
  }
}

const functionNames = [...sql.matchAll(/create(?: or replace)? function public\.(\w+)/gi)].map(match => match[1]);
assert.equal(functionNames.length, new Set(functionNames).size, 'function names must be unique');
const triggerNames = [...sql.matchAll(/create (?:constraint )?trigger (\w+)/gi)].map(match => match[1]);
assert.equal(triggerNames.length, new Set(triggerNames).size, 'trigger names must be unique');
assert.equal((sql.match(/\$\$/g) ?? []).length % 2, 0, 'dollar-quoted function bodies must be balanced');

const beginCount = (sql.match(/\bbegin;/gi) ?? []).length;
const commitCount = (sql.match(/\bcommit;/gi) ?? []).length;
assert.equal(beginCount, commitCount, 'migration transaction must have balanced BEGIN/COMMIT');

console.log('Schema contract check passed.');
