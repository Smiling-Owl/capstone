import assert from 'node:assert/strict';
import { createHash } from 'node:crypto';
import { readFile } from 'node:fs/promises';
import vm from 'node:vm';
import { createRequire } from 'node:module';

const dir = new URL('.', import.meta.url);
const sourceFile = await readFile(new URL('postgres-schema-source.js', dir), 'utf8');
const migration = await readFile(new URL('../../development/supabase/migrations/202609080001_initial_domain_schema.sql', dir), 'utf8');
const sandbox = { window: {} };
vm.runInNewContext(sourceFile, sandbox);
const snapshot = sandbox.window.POSTGRES_SCHEMA_SOURCE;
assert.equal(snapshot.text, migration, 'embedded source must exactly match the migration');
assert.equal(createHash('sha256').update(snapshot.text).digest('hex'), snapshot.sha256, 'snapshot checksum must match');

const require = createRequire(import.meta.url);
const { parse, statements, splitTopLevel, overviewLayout, bestOverviewLayout, fitTransform } = require('./postgres-physical-schema.js');
const schema = parse(snapshot.text);
assert.equal(schema.tables.length, 72, 'all physical tables are parsed');
const independentlyCountedColumns = statements(snapshot.text).filter(statement => /^create\s+table\b/i.test(statement)).reduce((sum, statement) => {
  const open = statement.indexOf('('), close = statement.lastIndexOf(')');
  const definitions = splitTopLevel(statement.slice(open + 1, close));
  return sum + definitions.filter(definition => {
    const body = definition.replace(/^constraint\s+(?:"(?:[^"]|"")*"|[\w$]+)\s+/i, '');
    return !/^(?:primary\s+key\b|unique\b|foreign\s+key\b|check\s*\(|exclude\b)/i.test(body);
  }).length;
}, 0);
assert.equal(independentlyCountedColumns, 742, 'independent DDL count excludes top-level table constraints');
assert.equal(schema.tables.reduce((sum, table) => sum + table.columns.length, 0), independentlyCountedColumns, 'only actual columns appear in the model');
assert.ok(schema.tables.every(table => !table.columns.some(column => column.name.toLowerCase() === 'check')), 'table-level CHECK constraints must never appear as columns');
assert.equal(schema.tables.find(table => table.name === 'public.account').columns.length, 17, 'account card includes columns, not its table CHECK clauses');
assert.equal(schema.foreignKeys.length, 138, 'all declared FK constraints are parsed');
assert.deepEqual(schema.foreignKeys.reduce((counts, fk) => ({ ...counts, [fk.source]: (counts[fk.source] || 0) + 1 }), {}), { inline: 3, table: 134, alter: 1 });
assert.equal(schema.uniqueConstraints.length, 96, 'all declared unique constraints are parsed');
assert.equal(schema.uniqueIndexes.length, 3, 'unique indexes must remain distinct from table UNIQUE constraints');
assert.deepEqual(schema.uniqueIndexes.map(index => [index.name, index.table, index.expressions, index.where]), [
  ['account_username_unique', 'public.account', ['lower(username)'], ''],
  ['snapshot_one_included_report_version_per_series', 'public.snapshot_barangay_report', ['tenant_id', 'snapshot_id', 'report_id'], "disposition = 'included'"],
  ['snapshot_one_included_hazard_version_per_series', 'public.snapshot_hazard_version', ['tenant_id', 'snapshot_id', 'hazard_record_id'], "disposition = 'included'"]
]);
assert.deepEqual(schema.externalTables.map(table => table.name), ['auth.users']);

const byName = new Map(schema.tables.map(table => [table.name, table]));
for (const fk of schema.foreignKeys) {
  assert.equal(fk.columns.length, fk.targetColumns.length, `${fk.table} composite key columns must pair by position`);
  assert.ok(byName.has(fk.table), `FK source table ${fk.table} must exist`);
  assert.ok(byName.has(fk.targetTable) || fk.targetTable === 'auth.users', `FK target ${fk.targetTable} must exist or be the external auth stub`);
  for (const column of fk.columns) assert.ok(byName.get(fk.table).columns.some(item => item.name === column), `${fk.table}.${column} must exist`);
  if (byName.has(fk.targetTable)) for (const column of fk.targetColumns) assert.ok(byName.get(fk.targetTable).columns.some(item => item.name === column), `${fk.targetTable}.${column} must exist`);
}
const composite = schema.foreignKeys.find(fk => fk.table === 'public.organization_unit' && fk.targetTable === 'public.organization_unit');
assert.deepEqual(composite.columns, ['tenant_id', 'parent_id']);
assert.deepEqual(composite.targetColumns, ['tenant_id', 'id']);

const edgeCase = `/* leading ; comment */ CREATE TABLE "x".a (id uuid PRIMARY KEY, note text DEFAULT 'a;b');
CREATE FUNCTION x() RETURNS text AS $$ SELECT ';'; $$ LANGUAGE SQL;
/* outer /* nested */ ending */ CREATE TABLE x.b (a_id uuid, FOREIGN KEY (a_id) REFERENCES "x".a(id));`;
assert.equal(parse(edgeCase).tables.length, 2, 'quotes, dollar bodies, and nested comments must not split DDL');
assert.equal(parse(edgeCase).foreignKeys.length, 1);
assert.equal(statements(edgeCase).length, 3);

const overviewCards = Array.from({ length: schema.tables.length + 1 }, (_, i) => ({ name: `table_${i}`, width: 228, height: i === 72 ? 54 : 44 }));
const tiles = overviewLayout(overviewCards, 4, 12, 8, 24);
assert.equal(tiles.positions.length, 73, 'overview places all physical tables and the external stub');
assert.equal(tiles.positions[0].x, tiles.positions[4].x, 'overview advances rows after four tiles');
assert.ok(tiles.positions[4].y > tiles.positions[0].y, 'overview rows do not overlap');
const narrowViewportLayout = bestOverviewLayout(overviewCards, 1004, 700, 12, 8, 24);
const wideViewportLayout = bestOverviewLayout(overviewCards, 1280, 490, 12, 8, 24);
const mobileViewportLayout = bestOverviewLayout(overviewCards, 390, 490, 12, 8, 24);
assert.equal(narrowViewportLayout.columns, 5, 'overview favors vertical space when the viewport is tall and narrow');
assert.equal(wideViewportLayout.columns, 7, 'overview adds columns to use a wide, short viewport');
assert.equal(mobileViewportLayout.columns, 4, 'overview recalculates a narrower grid for mobile width');
assert.ok(mobileViewportLayout.columns < wideViewportLayout.columns, 'responsive layout drops desktop columns on resize');
const tileBoxes = tiles.positions.map((position, i) => ({ ...position, width: 228, height: i === 72 ? 54 : 44 }));
const tileFit = fitTransform(tileBoxes, 1004, 760, 24);
for (const box of tileBoxes) {
  assert.ok(box.x * tileFit.zoom + tileFit.pan.x >= 24 - 1e-6);
  assert.ok((box.x + box.width) * tileFit.zoom + tileFit.pan.x <= 980 + 1e-6);
  assert.ok(box.y * tileFit.zoom + tileFit.pan.y >= 24 - 1e-6);
  assert.ok((box.y + box.height) * tileFit.zoom + tileFit.pan.y <= 736 + 1e-6);
}
const negativeFit = fitTransform([{ x: -160, y: -80, width: 320, height: 160 }], 1004, 760, 24);
assert.ok(-160 * negativeFit.zoom + negativeFit.pan.x >= 24 - 1e-6, 'Fit accounts for negative dragged coordinates');

const dagreSandbox = {};
vm.createContext(dagreSandbox);
vm.runInContext(await readFile(new URL('vendor/dagre.min.js', dir), 'utf8'), dagreSandbox);
for (const rankdir of ['TB', 'LR']) {
  const graph = new dagreSandbox.dagre.graphlib.Graph({ multigraph: true });
  graph.setGraph({ rankdir, ranksep: 110, nodesep: 56, edgesep: 24, marginx: 36, marginy: 36 });
  graph.setDefaultEdgeLabel(() => ({}));
  for (const table of schema.tables) graph.setNode(table.name, { width: 300, height: 46 + table.columns.length * 26 });
  graph.setNode('auth.users', { width: 300, height: 72 });
  schema.foreignKeys.forEach((fk, index) => graph.setEdge(fk.table, fk.targetTable, {}, `fk-${index}`));
  dagreSandbox.dagre.layout(graph);
  const geometry = [...graph.nodes()].map(name => { const n = graph.node(name); return { x: n.x - n.width / 2, y: n.y - n.height / 2, width: n.width, height: n.height }; });
  const fitted = fitTransform(geometry, 1004, 760, 24);
  for (const box of geometry) {
    assert.ok(box.x * fitted.zoom + fitted.pan.x >= 24 - 1e-6, `${rankdir} layout left bound must fit`);
    assert.ok((box.x + box.width) * fitted.zoom + fitted.pan.x <= 980 + 1e-6, `${rankdir} layout right bound must fit`);
    assert.ok(box.y * fitted.zoom + fitted.pan.y >= 24 - 1e-6, `${rankdir} layout top bound must fit`);
    assert.ok((box.y + box.height) * fitted.zoom + fitted.pan.y <= 736 + 1e-6, `${rankdir} layout bottom bound must fit`);
  }
}

const diagramJs = await readFile(new URL('postgres-diagram.js', dir), 'utf8');
assert.match(diagramJs, /option value="OVERVIEW"/);
assert.match(diagramJs, /event\.key === 'Enter' \|\| event\.key === ' '/, 'table cards support keyboard selection');
assert.match(diagramJs, /tabIndex = 0/, 'table cards are keyboard focusable');
assert.match(diagramJs, /#pgd-focus'\)\.addEventListener\('change', event => selectTable/, 'table selector switches to detail and focuses the selected table');
assert.match(diagramJs, /data-source-table=/, 'FK paths retain their source and target table identity');
assert.match(diagramJs, /definition unavailable/, 'external auth.users remains explicitly unresolved');
assert.match(diagramJs, /addEventListener\('resize',[\s\S]*?setTimeout\(resizeDiagram, 100\)/, 'viewport resize triggers a debounced diagram relayout');
assert.match(diagramJs, /if \(layout === 'OVERVIEW'\) layoutGraph\(layout\);\s*else \{ fit\(\); if \(selectedTable\) focusTable\(selectedTable\);/, 'resize preserves the selected detail table and recalculates Fit');

console.log('PostgreSQL physical schema check passed: SQL snapshot/counts, 3 distinct unique indexes, composite pairs, 73 overview tiles, fitted TB/LR Dagre geometry, and lexer edge cases.');
