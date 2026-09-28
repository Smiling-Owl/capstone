import { cp, mkdir, readFile, rm, writeFile } from 'node:fs/promises';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const root = path.dirname(fileURLToPath(import.meta.url));
const out = path.join(root, 'dist');
const read = name => readFile(path.join(root, name), 'utf8');
let envFile = '';
try { envFile = await read('.env'); } catch { /* Vercel provides build variables directly. */ }
const envValue = name => process.env[name] || envFile.match(new RegExp(`^${name}=(.*)$`, 'm'))?.[1]?.trim() || '';
const config = {
  url: envValue('VITE_SUPABASE_URL'),
  anonKey: envValue('VITE_SUPABASE_ANON_KEY')
};
if (Boolean(config.url) !== Boolean(config.anonKey)) throw new Error('Set both VITE_SUPABASE_URL and VITE_SUPABASE_ANON_KEY.');

const html = await read('rdm_schema_workbench.html');
const rdmBlock = html.match(/<script>\s*\/\/ Source data is embedded[\s\S]*?<\/script>/);
const tabsBlock = html.match(/<script>\s*\(\(\)=>\{\s*const tabs=\[[\s\S]*?<\/script>/);
if (!rdmBlock || !tabsBlock) throw new Error('Could not locate the existing RDM renderer and tab controller.');

const rdmCode = rdmBlock[0].replace(/^<script>|<\/script>$/g, '')
  .replace("const source = document.getElementById('schema-source').textContent;", 'const source = window.schemaWorkbenchSnapshot.rdmDbml;')
  .replace(/const modules = \[[\s\S]*?\n    \];/, 'const modules = window.schemaWorkbenchSnapshot.rdmModules;');
const tabsCode = tabsBlock[0].replace(/^<script>|<\/script>$/g, '');
const runtimeConfig = '<script src="./workbench-config.js"></script>';
const cleaned = html
  .replace(rdmBlock[0], '')
  .replace(tabsBlock[0], '')
  .replace(/<script type="text\/plain" id="schema-source">[\s\S]*?<\/script>/, '')
  .replace(/<script\b[\s\S]*?<\/script>/gi, '')
  .replace('<link rel="stylesheet" href="erd-viewer.css">', '<link rel="stylesheet" href="erd-viewer.css"><link rel="stylesheet" href="workbench-cloud.css">')
  .replace('<body>', '<body class="auth-pending">')
  .replace('</head>', `${runtimeConfig}\n</head>`)
  .replace('</body>', '<script type="module" src="./workbench-app.js"></script>\n</body>');

await rm(out, { recursive: true, force: true });
await mkdir(path.join(out, 'vendor'), { recursive: true });
await mkdir(path.join(out, 'assets'), { recursive: true });
await writeFile(path.join(out, 'index.html'), cleaned);
await writeFile(path.join(out, 'workbench-config.js'), `window.WORKBENCH_CONFIG=${JSON.stringify(config)};\n`);
await writeFile(path.join(out, 'rdm-viewer.js'), rdmCode);
await writeFile(path.join(out, 'workbench-tabs.js'), tabsCode);
for (const name of ['erd-viewer.css', 'postgres-schema-viewer.css', 'postgres-diagram.css', 'erd-viewer.js', 'postgres-schema-viewer.js', 'postgres-physical-schema.js', 'postgres-diagram.js']) {
  await cp(path.join(root, name), path.join(out, name));
}
for (const name of ['elkjs.bundled.js', 'dagre.min.js']) await cp(path.join(root, 'vendor', name), path.join(out, 'vendor', name));
await cp(path.join(root, 'workbench-cloud.css'), path.join(out, 'workbench-cloud.css'));
await cp(path.join(root, 'workbench-app.js'), path.join(out, 'workbench-app.js'));
await cp(path.join(root, 'workbench-api.mjs'), path.join(out, 'workbench-api.mjs'));
console.log('Built sanitized static workbench in documentation/diagram_revision/dist');
