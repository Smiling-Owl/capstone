import { mkdir, readFile, writeFile } from 'node:fs/promises';
import path from 'node:path';
import vm from 'node:vm';
import { fileURLToPath } from 'node:url';

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const html = await readFile(path.join(root, 'rdm_schema_workbench.html'), 'utf8');
const dbml = html.match(/<script type="text\/plain" id="schema-source">([\s\S]*?)<\/script>/)?.[1]?.trim();
if (!dbml) throw new Error('RDM source block was not found in the local workbench.');
const renderer = html.match(/<script>\s*\/\/ Source data is embedded[\s\S]*?<\/script>/)?.[0];
const moduleLiteral = renderer?.match(/const modules = (\[[\s\S]*?\n    \]);/)?.[1];
if (!moduleLiteral) throw new Error('RDM module layout metadata was not found.');
const moduleContext = {};
vm.runInNewContext(`globalThis.value = ${moduleLiteral}`, moduleContext);

const browser = { window: {} };
vm.runInNewContext(await readFile(path.join(root, 'erd-source-data.js'), 'utf8'), browser);
const erd = browser.window.erdSourceData;
const pgContext = { window: {} };
vm.runInNewContext(await readFile(path.join(root, 'postgres-schema-source.js'), 'utf8'), pgContext);
const postgres = pgContext.window.POSTGRES_SCHEMA_SOURCE;
const physical = { module: { exports: {} }, globalThis: null };
physical.globalThis = physical;
vm.runInNewContext(await readFile(path.join(root, 'postgres-physical-schema.js'), 'utf8'), physical);
const parsedPostgres = physical.module.exports.parse(postgres.text);

const targets = new Map();
const add = (type, id) => targets.set(`${type}:${id}`, { type, id });
const table = id => add('table', id.replace(/^public\./, ''));
const column = (tableId, columnId) => { const owner = tableId.replace(/^public\./, ''); table(owner); add('column', `${owner}.${columnId}`); };
for (const entity of erd.entities) {
  table(entity.id);
  for (const field of entity.fields) column(entity.id, field.name);
}
for (const relationship of erd.relationships) add('relationship', `erd:${relationship.from}:${relationship.label}:${relationship.to}`);

const refs = [];
for (const match of dbml.matchAll(/^Table\s+([\w]+)\s*\{([\s\S]*?)^\}/gm)) {
  const name = match[1]; table(name);
  for (const line of match[2].split(/\r?\n/)) {
    const field = line.trim().match(/^([\w]+)\s+[\w]+(?:\s+\[([^\]]*)\])?/);
    if (!field) continue;
    column(name, field[1]);
    const ref = field[2]?.match(/\bref\s*:\s*[<>-]\s*([\w]+)\.([\w]+)/);
    if (ref) {
      const id = `fk:${name}.${field[1]}->${ref[1]}.${ref[2]}`;
      refs.push({ id, from: name, fromColumn: field[1], to: ref[1], toColumn: ref[2] });
      add('relationship', id);
    }
  }
}
for (const t of parsedPostgres.tables) {
  table(t.name);
  for (const c of t.columns) column(t.name, c.name);
}
for (const fk of parsedPostgres.foreignKeys) add('relationship', `fk:${fk.table.replace(/^public\./, '')}.${fk.columns.join(',')}->${fk.targetTable.replace(/^public\./, '')}.${fk.targetColumns.join(',')}`);
const normalizedErd = {
  ...JSON.parse(JSON.stringify(erd)),
  relationships: erd.relationships.map(relationship => ({
    ...JSON.parse(JSON.stringify(relationship)),
    id: `erd:${relationship.from}:${relationship.label}:${relationship.to}`
  }))
};
const snapshot = {
  format: 1,
  erd: normalizedErd,
  rdmDbml: dbml,
  rdmModules: moduleContext.value,
  postgres,
  targets: [...targets.values()]
};
const output = process.argv.findIndex(arg => arg === '--out');
const outputPath = output >= 0 ? path.resolve(process.argv[output + 1]) : path.join(root, 'schema-version.json');
await mkdir(path.dirname(outputPath), { recursive: true });
await writeFile(outputPath, `${JSON.stringify(snapshot)}\n`);
console.log(`Exported schema snapshot (${snapshot.targets.length} logical targets) to ${outputPath}`);
