import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { createRequire } from 'node:module';
import { dirname, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';
import vm from 'node:vm';

const directory = dirname(fileURLToPath(import.meta.url));
const require = createRequire(import.meta.url);
const sourceContext = { window: {} };
const source = readFileSync(resolve(directory, 'erd-source-data.js'), 'utf8');
new vm.Script(source).runInNewContext(sourceContext);
const data = JSON.parse(JSON.stringify(sourceContext.window.erdSourceData));
const ELK = require(resolve(directory, 'vendor/elkjs.bundled.js'));
const engine = new ELK({ workerUrl: false });

const domainNames = [...new Set(data.entities.map(entity => entity.group))];
const sizes = Object.fromEntries(data.entities.map(entity => [entity.id, {
  id: entity.id, width: 390, height: 58 + entity.fields.length * 23
}]));
const subtypeNodes = data.specializations.map((_, index) => ({ id: `subtype-${index}`, width: 32, height: 32 }));
const edge = (id, source, target, label = '') => ({
  id, sources: [source], targets: [target],
  ...(label ? { labels: [{ text: label, width: label.length * 7 + 12, height: 20 }] } : {})
});

function graphFor(mode) {
  const compound = mode === 'module';
  const children = compound
    ? domainNames.map((name, index) => ({
      id: `domain-${index}`,
      layoutOptions: {
        'elk.algorithm': 'layered',
        'elk.direction': 'RIGHT',
        'elk.padding': '[top=34,left=24,bottom=24,right=24]',
        'elk.spacing.nodeNode': mode === 'module' ? '88' : '82',
        'elk.layered.spacing.nodeNodeBetweenLayers': mode === 'module' ? '110' : '100'
      },
      children: data.entities.filter(entity => entity.group === name).map(entity => ({ ...sizes[entity.id] }))
    }))
    : [...Object.values(sizes).map(node => ({ ...node })), ...subtypeNodes.map(node => ({ ...node }))];
  if (compound) data.specializations.forEach((specialization, index) => {
    const parent = data.entities.find(entity => entity.id === specialization.parent);
    children[domainNames.indexOf(parent.group)].children.push({ ...subtypeNodes[index] });
  });

  const edges = data.relationships.map((relationship, index) => edge(`relationship-${index}`, relationship.from, relationship.to, relationship.label));
  data.specializations.forEach((specialization, index) => {
    const subtype = `subtype-${index}`;
    edges.push(edge(`specialization-parent-${index}`, specialization.parent, subtype));
    specialization.children.forEach(child => edges.push(edge(`specialization-child-${index}-${child}`, subtype, child)));
  });
  const compact = mode === 'compact';
  return {
    id: 'root', children, edges,
    layoutOptions: {
      'elk.algorithm': 'layered',
      'elk.direction': mode === 'module' || mode === 'hierarchical-tb' || mode === 'academic' ? 'DOWN' : 'RIGHT',
      'elk.edgeRouting': 'ORTHOGONAL',
      'elk.hierarchyHandling': compound ? 'INCLUDE_CHILDREN' : 'SEPARATE_CHILDREN',
      'elk.spacing.nodeNode': compact ? '32' : mode === 'academic' ? '64' : mode === 'module' ? '112' : '88',
      'elk.spacing.edgeNode': compact ? '14' : mode === 'academic' ? '24' : '30',
      'elk.spacing.edgeEdge': compact ? '10' : mode === 'academic' ? '18' : mode === 'module' ? '48' : '22',
      'elk.layered.spacing.nodeNodeBetweenLayers': compact ? '60' : mode === 'academic' ? '118' : mode === 'module' ? '210' : '168',
      'elk.layered.layering.strategy': 'NETWORK_SIMPLEX',
      'elk.layered.crossingMinimization.strategy': 'LAYER_SWEEP',
      'elk.layered.nodePlacement.strategy': 'BRANDES_KOEPF'
    }
  };
}

function walk(children, callback, offset = { x: 0, y: 0 }) {
  for (const child of children || []) {
    const position = { x: offset.x + (child.x || 0), y: offset.y + (child.y || 0) };
    callback(child, position);
    walk(child.children, callback, position);
  }
}

for (const mode of ['academic', 'hierarchical-lr', 'hierarchical-tb', 'module', 'compact']) {
  const result = await engine.layout(graphFor(mode));
  assert.equal(result.edges.filter(item => item.id.startsWith('relationship-')).length, 29, `${mode}: relationship routes missing`);
  const relationLabels = [];
  for (const relationship of result.edges.filter(item => item.id.startsWith('relationship-'))) {
    assert.ok(relationship.sections?.length, `${mode}: no route for ${relationship.id}`);
    relationLabels.push(...(relationship.labels || []));
    if (mode === 'academic') {
      for (const section of relationship.sections) {
        const points = [section.startPoint, ...(section.bendPoints || []), section.endPoint];
        for (let index = 1; index < points.length; index++) {
          const a = points[index - 1], b = points[index];
          assert.ok(a.x === b.x || a.y === b.y, `${mode}: diagonal segment in ${relationship.id}`);
        }
      }
    }
  }
  const boxes = [];
  walk(result.children, (node, position) => {
    if (data.entities.some(entity => entity.id === node.id)) boxes.push({ ...position, width: node.width, height: node.height, id: node.id });
  });
  for (let i = 0; i < boxes.length; i++) for (let j = i + 1; j < boxes.length; j++) {
    const a = boxes[i], b = boxes[j];
    const overlaps = a.x < b.x + b.width && a.x + a.width > b.x && a.y < b.y + b.height && a.y + a.height > b.y;
    assert.ok(!overlaps, `${mode}: entity cards overlap (${a.id}, ${b.id})`);
  }
  if (mode === 'module') {
    const collision = (a, b) => a.x < b.x + b.width + 5 && a.x + a.width + 5 > b.x
      && a.y < b.y + b.height + 4 && a.y + a.height + 4 > b.y;
    const placed = [];
    for (const label of relationLabels) {
      const origin = { x: label.x, y: label.y };
      const offsets = [[0, 0]];
      for (let step = 1; step <= 12; step++) {
        const distance = step * 26;
        offsets.push([0, -distance], [0, distance], [-distance, 0], [distance, 0]);
      }
      const candidate = offsets.map(([dx, dy]) => ({ ...label, x: origin.x + dx, y: origin.y + dy }))
        .find(item => !boxes.some(box => collision(item, box)) && !placed.some(item2 => collision(item, item2)));
      assert.ok(candidate, `module: no clear label lane for ${label.text}`);
      label.x = candidate.x;
      label.y = candidate.y;
      placed.push(candidate);
    }
    assert.match(readFileSync(resolve(directory, 'erd-viewer.js'), 'utf8'), /if \(mode === 'module'\) separateModuleLabels\(\)/,
      'Module label collision pass must run after ELK routes return');
  }
}

console.log('PASS: ELK routes all 29 source relationships in Academic, both hierarchical modes, Module/Domain, and Compact; Academic routes are orthogonal and cards do not overlap.');
