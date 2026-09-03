const assert = require('node:assert/strict');
const fs = require('node:fs');
const vm = require('node:vm');

const files = ['index.html', 'reporter.html', 'styles.css', 'app.js'];
const source = Object.fromEntries(files.map(file => [file, fs.readFileSync(`${__dirname}/${file}`, 'utf8')]));
const allSource = Object.values(source).join('\n');

new vm.Script(source['app.js']);
for (const feature of ['incident-map', 'SMS fallback', 'Local SitRep', 'Priority routing']) {
  assert.match(allSource, new RegExp(feature, 'i'));
}
for (const file of ['index.html', 'reporter.html']) {
  const ids = [...source[file].matchAll(/\sid="([^"]+)"/g)].map(match => match[1]);
  assert.equal(ids.length, new Set(ids).size, `${file} contains duplicate IDs`);
  for (const asset of [...source[file].matchAll(/(?:href|src)="([^"]+\.(?:css|js))"/g)].map(match => match[1])) {
    if (!asset.startsWith('http')) assert.ok(fs.existsSync(`${__dirname}/${asset}`), `${file} references missing ${asset}`);
  }
}
assert.match(source['index.html'], /leaflet@1\.9\.4/);
assert.match(source['styles.css'], /-apple-system/);
assert.doesNotMatch(source['index.html'], /sidebar|metric-strip/);
assert.match(source['app.js'], /localStorage\.setItem/);
assert.match(source['app.js'], /report\.infrastructure === 'Bridge destroyed'/);
assert.match(source['app.js'], /report\.action === 'Evacuation requested'/);
assert.match(source['styles.css'], /prefers-reduced-motion/);
assert.doesNotMatch(allSource, /[\u2013\u2014\u00c2]/);

console.log('DRRM Desk mockup checks passed.');
