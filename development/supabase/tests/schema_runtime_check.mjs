import { PGlite } from '@electric-sql/pglite';
import { readFile, writeFile, mkdir } from 'node:fs/promises';
import { fileURLToPath } from 'node:url';
import { dirname, resolve } from 'node:path';
import { runScenarios } from './schema_scenarios.mjs';

const here = dirname(fileURLToPath(import.meta.url));
const migrationPath = resolve(here, '../migrations/202609080001_initial_domain_schema.sql');
const catalogPath = resolve(here, '../../../documentation/database/rdm/schema-data.js');
const sql = await readFile(migrationPath, 'utf8');
const db = new PGlite();

await db.exec(`
  create schema auth;
  create table auth.users (id uuid primary key);
  create function auth.uid() returns uuid language sql stable as $$ select null::uuid $$;
  create role authenticated nologin;
  create role anon nologin;
  create role service_role nologin;
`);

try {
  await db.exec(sql);
  console.log('PostgreSQL migration executed successfully in an isolated database.');
  await runScenarios(db);

  if (process.argv.includes('--catalog')) {
    const rows = await catalog(db);
    await mkdir(dirname(catalogPath), { recursive: true });
    await writeFile(catalogPath, `window.SCHEMA_DATA = ${JSON.stringify(rows, null, 2)};\n`);
    const relationshipCount = rows.tables.reduce((total, table) => total + table.foreignKeys.length, 0);
    console.log(`Generated RDM catalog: ${rows.tables.length} relations, ${relationshipCount} relationships, ${rows.enums.length} enums, ${rows.views.length} views.`);
  }
} finally {
  await db.close();
}

async function catalog(database) {
  const tables = (await database.query(`
    select n.nspname as schema, c.relname as name, c.oid::text as oid,
           coalesce(obj_description(c.oid, 'pg_class'), '') as comment
    from pg_class c join pg_namespace n on n.oid=c.relnamespace
    where (n.nspname='public' or (n.nspname='auth' and c.relname='users'))
      and c.relkind in ('r','p') order by n.nspname,c.relname
  `)).rows;
  const columns = (await database.query(`
    select n.nspname as schema, c.relname as table_name, a.attnum,
           a.attname as name, format_type(a.atttypid,a.atttypmod) as type,
           not a.attnotnull as nullable, pg_get_expr(d.adbin,d.adrelid) as default_value
    from pg_attribute a join pg_class c on c.oid=a.attrelid
    join pg_namespace n on n.oid=c.relnamespace
    left join pg_attrdef d on d.adrelid=a.attrelid and d.adnum=a.attnum
    where (n.nspname='public' or (n.nspname='auth' and c.relname='users'))
      and c.relkind in ('r','p') and a.attnum>0 and not a.attisdropped
    order by n.nspname,c.relname,a.attnum
  `)).rows;
  const constraints = (await database.query(`
    select n.nspname as schema, c.relname as table_name, x.conname as name,
           x.contype as type, x.conkey::text as source_keys,
           x.confkey::text as target_keys, pn.nspname as target_schema,
           pc.relname as target_table, pg_get_constraintdef(x.oid,true) as definition,
           x.confdeltype as delete_action, x.confupdtype as update_action
    from pg_constraint x join pg_class c on c.oid=x.conrelid
    join pg_namespace n on n.oid=c.relnamespace
    left join pg_class pc on pc.oid=x.confrelid
    left join pg_namespace pn on pn.oid=pc.relnamespace
    where n.nspname='public' or (n.nspname='auth' and c.relname='users')
    order by n.nspname,c.relname,x.conname
  `)).rows;
  const enums = (await database.query(`
    select t.typname as name, e.enumlabel as value
    from pg_type t join pg_enum e on e.enumtypid=t.oid
    join pg_namespace n on n.oid=t.typnamespace
    where n.nspname='public' order by t.typname,e.enumsortorder
  `)).rows;
  const views = (await database.query(`select schemaname as schema, viewname as name, definition from pg_views where schemaname='public' order by viewname`)).rows;
  const byTable = new Map(tables.map(t => [`${t.schema}.${t.name}`, {
    schema:t.schema, name:t.name, group:groupFor(t.name), comment:t.comment,
    columns:[], primaryKey:[], foreignKeys:[], uniqueKeys:[], checks:[]
  }]));
  for (const col of columns) byTable.get(`${col.schema}.${col.table_name}`).columns.push({
    name:col.name, type:col.type, nullable:col.nullable, default:col.default_value ?? null
  });
  const keyNames = (table, raw) => parseKeys(raw).map(number => table.columns[Number(number)-1]?.name).filter(Boolean);
  const action = code => ({a:'NO ACTION',r:'RESTRICT',c:'CASCADE',n:'SET NULL',d:'SET DEFAULT'}[code] || code);
  for (const item of constraints) {
    const table = byTable.get(`${item.schema}.${item.table_name}`);
    const source = keyNames(table,item.source_keys);
    if (item.type === 'p') table.primaryKey=source;
    else if (item.type === 'u') table.uniqueKeys.push(source);
    else if (item.type === 'c') table.checks.push(item.definition);
    else if (item.type === 'f') {
      const target=byTable.get(`${item.target_schema}.${item.target_table}`);
      table.foreignKeys.push({name:item.name,columns:source,targetSchema:item.target_schema,targetTable:item.target_table,
        targetColumns:keyNames(target,item.target_keys),onDelete:action(item.delete_action),onUpdate:action(item.update_action)});
    }
  }
  return {
    title:'Disaster Situation Record Management and Situation Report Generation System',
    generatedAt:new Date().toISOString(), sqlFile:'../../../development/supabase/migrations/202609080001_initial_domain_schema.sql',
    tables:[...byTable.values()],
    enums:[...Map.groupBy(enums,e=>e.name)].map(([name,items])=>({name:`public.${name}`,values:items.map(i=>i.value)})),
    views:views.map(v=>({name:`${v.schema}.${v.name}`,definition:v.definition.trim()}))
  };
}

function parseKeys(raw) {
  if (!raw) return [];
  return String(raw).replace(/[{}]/g,'').split(',').map(x=>x.trim()).filter(Boolean);
}

function groupFor(name) {
  if (name === 'users') return 'Accounts and jurisdiction';
  if (/account|role_assignment/.test(name)) return 'Accounts and jurisdiction';
  if (/profile/.test(name)) return 'Monthly CDRA profiles';
  if (/sitrep|situation_report|evacuation_center|snapshot_/.test(name)) return 'Situation reports';
  if (/hazard/.test(name)) return 'Hazards';
  if (/incident|report_effect|affected_population|casualty|damage_assessment|barangay_report_source|report_version|report_review/.test(name)) return 'Incident reporting';
  if (/source|evidence|audit/.test(name)) return 'Evidence and audit';
  return 'Reference and administration';
}
