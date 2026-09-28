import assert from 'node:assert/strict';
import { createHash } from 'node:crypto';
import { existsSync, readFileSync } from 'node:fs';
import { dirname, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';
import vm from 'node:vm';

const directory = dirname(fileURLToPath(import.meta.url));
const read = path => readFileSync(resolve(directory, path));
const html = read('rdm_schema_workbench.html').toString('utf8');
const parseAttributes = source => Object.fromEntries(
  [...source.matchAll(/([\w:-]+)\s*=\s*(["'])(.*?)\2/gs)].map(([, key, , value]) => [key, value])
);

for (const match of html.matchAll(/<(script|link|a)\b([^>]*)>/gi)) {
  const [, tag, source] = match;
  const attributes = parseAttributes(source);
  const target = tag.toLowerCase() === 'script' ? attributes.src : attributes.href;
  if (!target || target.startsWith('#') || /^[a-z][a-z\d+.-]*:/i.test(target)) continue;
  assert.ok(existsSync(resolve(directory, decodeURIComponent(target))), `Missing local ${tag} target: ${target}`);
}

const tabs = [...html.matchAll(/<button\b([^>]*)>([\s\S]*?)<\/button>/gi)]
  .map(([, attrs, label]) => ({ ...parseAttributes(attrs), label: label.replace(/<[^>]+>/g, '').trim() }))
  .filter(tab => tab.role === 'tab');
assert.deepEqual(tabs.map(tab => tab.id), ['tab-erd', 'tab-rdm', 'tab-postgres']);
assert.equal(tabs.filter(tab => tab['aria-selected'] === 'true').length, 1);
for (const tab of tabs) {
  const panel = html.match(new RegExp(`<[^>]+\\bid=["']${tab['aria-controls']}["'][^>]*>`, 'i'))?.[0];
  assert.ok(panel, `Missing panel for ${tab.id}`);
  const attributes = parseAttributes(panel);
  assert.equal(attributes.role, 'tabpanel');
  assert.equal(attributes['aria-labelledby'], tab.id);
}

const dbml = read('erd_derived_rdm.dbml').toString('utf8');
const embeddedDbml = html.match(/<script\b(?=[^>]*\bid=["']schema-source["'])[^>]*>([\s\S]*?)<\/script>/i)?.[1];
assert.equal(embeddedDbml, dbml, 'Embedded RDM DBML must match the audited DBML file exactly');
assert.doesNotMatch(html, /\bmarker-(?:start|end)\b|<marker\b|marker(?:Start|End)\s*[:=]|arrowhead/i,
  'RDM workbench must not define arrow markers');

const tables = new Map();
const references = [];
let current = null;
for (const rawLine of dbml.split(/\r?\n/)) {
  const line = rawLine.trim();
  const tableMatch = line.match(/^Table\s+([\w]+)\s*\{/i);
  if (tableMatch) {
    current = { primaryKeys: new Set() };
    assert.ok(!tables.has(tableMatch[1]), `Duplicate relation ${tableMatch[1]}`);
    tables.set(tableMatch[1], current);
    continue;
  }
  if (line === '}') { current = null; continue; }
  if (!current || !line || line.startsWith('//')) continue;
  const fieldMatch = line.match(/^([\w]+)\s+[\w]+(?:\s+\[([^\]]*)\])?/);
  if (!fieldMatch) continue;
  const [, field, attributes = ''] = fieldMatch;
  if (/\bpk\b/i.test(attributes)) current.primaryKeys.add(field);
  for (const ref of attributes.matchAll(/\bref\s*:\s*[<>-]\s*([\w]+)\.([\w]+)/gi)) {
    references.push({ table: ref[1], field: ref[2] });
  }
}
assert.equal(tables.size, 32);
assert.equal(references.length, 36);
for (const reference of references) {
  assert.ok(tables.has(reference.table), `Missing FK target relation ${reference.table}`);
  assert.ok(tables.get(reference.table).primaryKeys.has(reference.field),
    `FK target ${reference.table}.${reference.field} is not a declared PK`);
}

const erdContext = { window: {} };
new vm.Script(read('erd-source-data.js').toString('utf8'), { filename: 'erd-source-data.js' })
  .runInNewContext(erdContext);
const erd = erdContext.window.erdSourceData;
assert.ok(erd, 'ERD source data must initialize');
const entityIds = new Set(erd.entities.map(entity => entity.id));
assert.equal(erd.entities.length, 32);
assert.equal(entityIds.size, 32, 'ERD entity IDs must be unique');
for (const entity of erd.entities) {
  const keys = entity.fields.filter(field => field.primaryKey);
  assert.ok(entity.fields[0]?.primaryKey, `${entity.id} must begin with its PK row`);
  assert.equal(keys.length, 1, `${entity.id} must have exactly one PK row`);
}
for (const relationship of erd.relationships) {
  assert.ok(entityIds.has(relationship.from), `Unknown relationship source ${relationship.from}`);
  assert.ok(entityIds.has(relationship.to), `Unknown relationship target ${relationship.to}`);
  if (relationship.cardinality) {
    assert.deepEqual(Object.keys(relationship.cardinality).sort(), ['from', 'to']);
    for (const marker of Object.values(relationship.cardinality)) {
      assert.ok(['bar', 'doubleBar', 'barFork'].includes(marker), `Unsupported cardinality marker ${marker}`);
    }
  }
}
// Ordered source-image transcription; null endpoints are intentionally unresolved.
const auditedRelationships = [
  ['hazard_characteristic', 'hazard', 'includes', 'barFork', 'bar'],
  ['barangay_profile', 'barangay_profile_hazard_exposure', 'includes', 'doubleBar', 'barFork'],
  ['barangay_profile', 'barangay_profile_housing', 'includes', 'doubleBar', 'bar'],
  ['purok_profile', 'purok_profile_hazard_exposure', 'includes', 'doubleBar', 'barFork'],
  ['purok_profile', 'purok_profile_housing', 'includes', 'bar', 'bar'],
  ['incident_report', 'incident_report_version', 'includes', 'barFork', 'doubleBar'],
  ['incident_report', 'incident_report_affected_population', 'includes', 'barFork', 'doubleBar'],
  ['incident_report', 'incident_report_casualty', 'includes', 'barFork', 'doubleBar'],
  ['incident_report', 'incident_report_damage', 'includes', 'barFork', 'bar'],
  ...[
    'situation_report_assistance', 'situation_report_recommendation', 'situation_report_issue',
    'situation_report_calamity', 'situation_report_classwork', 'situation_report_lifeline',
    'situation_report_signatory', 'situation_report_response', 'situation_report_evacuation'
  ].map(target => ['situation_report', target, 'includes', 'doubleBar', 'barFork']),
  ['account', 'hazard', 'creates', 'bar', 'barFork'],
  ['drrm_account', 'barangay_account', 'creates', 'bar', 'barFork'],
  ['drrm_account', 'situation_report', 'creates', null, null],
  ['barangay_account', 'purok_account', 'creates', 'bar', 'barFork'],
  ['barangay_account', 'barangay_profile', 'creates', 'doubleBar', 'doubleBar'],
  ['purok_account', 'purok_profile', 'creates', 'doubleBar', 'doubleBar'],
  ['drrm_account', 'barangay_profile_verification', 'verifies', 'barFork', 'barFork'],
  ['barangay_account', 'purok_profile_verification', 'verifies', null, null],
  ['barangay_profile', 'barangay_profile_verification', 'verifies', null, null],
  ['purok_profile', 'purok_profile_verification', 'verifies', null, null],
  ['purok_report_verification', 'incident_report', 'verifies', 'doubleBar', 'barFork']
];
assert.equal(erd.relationships.length, 29, 'Source ERD relationship count changed');
assert.deepEqual(JSON.parse(JSON.stringify(erd.relationships.map(({ from, to, label, cardinality }) => [
  from, to, label, cardinality?.from ?? null, cardinality?.to ?? null
]))), auditedRelationships, 'ERD transcription must match the source-image audit');
for (const specialization of erd.specializations) {
  assert.ok(entityIds.has(specialization.parent), `Unknown specialization parent ${specialization.parent}`);
  assert.ok(specialization.children.length > 0);
  for (const child of specialization.children) assert.ok(entityIds.has(child), `Unknown subtype ${child}`);
}

const migrationPath = '../../development/supabase/migrations/202609080001_initial_domain_schema.sql';
const migrationBytes = read(migrationPath);
const migrationText = migrationBytes.toString('utf8');
const postgresContext = { window: {} };
new vm.Script(read('postgres-schema-source.js').toString('utf8'), { filename: 'postgres-schema-source.js' })
  .runInNewContext(postgresContext);
const snapshot = postgresContext.window.POSTGRES_SCHEMA_SOURCE;
assert.equal(snapshot.path, 'development/supabase/migrations/202609080001_initial_domain_schema.sql');
assert.equal(snapshot.text, migrationText, 'Embedded PostgreSQL text must match the authoritative migration');
assert.equal(snapshot.sha256, createHash('sha256').update(migrationBytes).digest('hex'));

const externalScripts = [...html.matchAll(/<script\b([^>]*)>/gi)]
  .map(([, attrs]) => parseAttributes(attrs).src)
  .filter(Boolean);
assert.ok(externalScripts.indexOf('erd-source-data.js') < externalScripts.indexOf('erd-viewer.js'));
assert.ok(externalScripts.indexOf('postgres-schema-source.js') < externalScripts.indexOf('postgres-schema-viewer.js'));
for (const scriptPath of [...externalScripts, 'erd-viewer.js', 'postgres-schema-viewer.js']) {
  new vm.Script(read(scriptPath).toString('utf8'), { filename: scriptPath });
}
for (const [, attrs, body] of html.matchAll(/<script\b([^>]*)>([\s\S]*?)<\/script>/gi)) {
  const attributes = parseAttributes(attrs);
  if (!attributes.src && attributes.type !== 'text/plain') new vm.Script(body, { filename: 'workbench inline script' });
}

console.log('PASS: local HTML assets and tabs; RDM DBML/32 relations/36 PK references/no arrows; ERD entities, PKs, endpoints and cardinality markers; exact PostgreSQL source and SHA-256; JavaScript syntax.');
