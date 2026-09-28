(() => {
  const data = window.erdSourceData;
  const panel = document.getElementById('erd-panel');
  const toolbar = document.getElementById('erd-toolbar');
  if (!data || !panel || !toolbar) return;

  const NS = 'http://www.w3.org/2000/svg';
  const entities = new Map(data.entities.map(entity => [entity.id, entity]));
  const positions = new Map(data.entities.map(entity => [entity.id, { x: entity.x, y: entity.y }]));
  const cards = new Map();
  const routes = new Map();
  const domainBounds = new Map();
  const domainNames = [...new Set(data.entities.map(entity => entity.group))];
  const groupColors = {
    'Accounts and hazards': '#537b93',
    'Profiles and verification': '#64836f',
    'Situation reports': '#7e7091',
    'Incident reports': '#9a7951'
  };
  const margin = 72;
  let zoom = 1, panX = 28, panY = 28, gesture = null;
  let active = false, selectedEntity = null, selectedRelationship = -1;
  let mode = 'academic', layoutBounds = null, manualPositions = null, draggedEntity = null, layoutRun = 0;
  const elk = window.ELK ? new window.ELK({ workerUrl: false }) : null;

  toolbar.innerHTML = `
    <div class="erd-toolbar-group" role="group" aria-label="ERD layout">
      <label for="erd-layout">Layout</label>
      <select id="erd-layout">
        <option value="academic">Academic / Orthogonal</option>
        <option value="hierarchical-lr">Hierarchical — LR</option>
        <option value="hierarchical-tb">Hierarchical — TB</option>
        <option value="module">Module / Domain</option>
        <option value="compact">Compact</option>
        <option value="manual">Manual / Preserve positions</option>
      </select>
      <button type="button" id="erd-apply">Apply</button>
    </div>
    <div class="erd-toolbar-group" role="group" aria-label="ERD zoom">
      <button type="button" id="erd-zoom-out" aria-label="Zoom out">−</button>
      <output id="erd-zoom-value" class="erd-zoom-value" aria-live="polite">100%</output>
      <button type="button" id="erd-zoom-in" aria-label="Zoom in">+</button>
      <button type="button" id="erd-fit">Fit</button>
    </div>
    <output id="erd-status" class="erd-status" aria-live="polite"></output>
    <details class="erd-more"><summary>More</summary><div class="erd-more-content">
      <p><a href="diagrams_final/final/ERD.png" target="_blank" rel="noreferrer">Open original ERD image</a></p>
      ${data.notes.map(note => `<p>${note}</p>`).join('')}
      <div id="erd-unmarked"></div>
      <p>Notation: PK marks the underlined primary key. Three-prong Crow’s-foot marks indicate many; one perpendicular bar indicates one; two bars indicate exactly one. These marks encode multiplicity, not direction. Connectors have no arrowheads or optionality circles. D marks a disjoint subtype group.</p>
      <p>Drag an entity to move it, or focus it and use arrow keys. Drag open canvas space to pan; use the wheel to zoom.</p>
    </div></details>`;

  panel.innerHTML = `
    <div class="erd-canvas" id="erd-canvas" tabindex="0" role="region" aria-label="Interactive ERD. Drag an entity or focus it and use arrow keys to move it. Drag empty canvas to pan or use the mouse wheel to zoom.">
      <div class="erd-world" id="erd-world"><svg class="erd-links" id="erd-links" aria-label="Entity relationships"></svg></div>
      <div class="erd-legend" role="note" aria-label="Relationship endpoint notation">
        <span><svg viewBox="0 0 40 18" aria-hidden="true"><path d="M1 9H16M16 9L25 2M16 9H25M16 9L25 16"/></svg>Many</span>
        <span><svg viewBox="0 0 40 18" aria-hidden="true"><path d="M1 9H22M22 2V16"/></svg>One</span>
        <span><svg viewBox="0 0 40 18" aria-hidden="true"><path d="M1 9H18M22 2V16M30 2V16"/></svg>Exactly one</span>
      </div>
    </div>`;

  const canvas = panel.querySelector('#erd-canvas');
  const world = panel.querySelector('#erd-world');
  const svg = panel.querySelector('#erd-links');
  const status = toolbar.querySelector('#erd-status');
  const zoomValue = toolbar.querySelector('#erd-zoom-value');
  const layoutSelect = toolbar.querySelector('#erd-layout');
  const svgEl = (tag, attrs = {}) => {
    const node = document.createElementNS(NS, tag);
    Object.entries(attrs).forEach(([name, value]) => node.setAttribute(name, String(value)));
    return node;
  };
  const point = (id) => positions.get(id);
  const routeId = (kind, index) => `${kind}-${index}`;

  function buildCards() {
    for (const entity of data.entities) {
      const card = document.createElement('article');
      card.className = 'erd-entity';
      card.dataset.entity = entity.id;
      card.tabIndex = 0;
      card.setAttribute('role', 'group');
      card.setAttribute('aria-labelledby', `erd-title-${entity.id}`);
      card.innerHTML = `<header class="erd-entity-header"><h3 id="erd-title-${entity.id}">${entity.label}</h3></header><table class="erd-fields" aria-label="${entity.label} attributes"><tbody>${entity.fields.map(field => `<tr><th class="erd-field-name" scope="row">${field.name}</th><td class="erd-key-cell">${field.primaryKey ? '<span class="erd-pk" title="Primary key">PK</span>' : ''}</td></tr>`).join('')}</tbody></table>`;
      card.style.setProperty('--erd-group-color', groupColors[entity.group] || '#637d91');
      world.append(card);
      cards.set(entity.id, card);
      place(entity.id);
      card.addEventListener('keydown', event => {
        if (event.key === 'Enter' || event.key === ' ') {
          event.preventDefault();
          selectEntity(entity.id);
        }
        const direction = { ArrowLeft: [-1, 0], ArrowRight: [1, 0], ArrowUp: [0, -1], ArrowDown: [0, 1] }[event.key];
        if (direction) {
          event.preventDefault();
          if (mode !== 'manual') {
            layoutRun++;
            mode = 'manual';
            layoutSelect.value = 'manual';
            manualPositions = new Map([...positions].map(([id, p]) => [id, { ...p }]));
          }
          const p = point(entity.id), step = (event.shiftKey ? 100 : 30) / zoom;
          positions.set(entity.id, { x: p.x + direction[0] * step, y: p.y + direction[1] * step });
          manualPositions.set(entity.id, { ...point(entity.id) });
          draggedEntity = entity.id;
          selectedEntity = entity.id;
          selectedRelationship = -1;
          place(entity.id);
          renderEdges();
        }
      });
    }
  }

  function place(id) {
    const p = point(id), card = cards.get(id);
    card.style.left = `${p.x}px`;
    card.style.top = `${p.y}px`;
  }

  function unmarkedRelationshipList() {
    const items = data.relationships.filter(relationship => !relationship.cardinality);
    const target = toolbar.querySelector('#erd-unmarked');
    if (!items.length) return;
    const heading = document.createElement('p');
    heading.className = 'erd-unmarked-heading';
    heading.textContent = `Cardinality is not marked in the source for ${items.length} relationships:`;
    const list = document.createElement('ul');
    list.className = 'erd-unmarked-list';
    for (const relationship of items) {
      const item = document.createElement('li');
      item.textContent = `${entities.get(relationship.from).label} — ${relationship.label} — ${entities.get(relationship.to).label}`;
      list.append(item);
    }
    target.append(heading, list);
  }

  function updateWorldSize(width = 6400, height = 5600) {
    const w = Math.max(1200, Math.ceil(width + margin * 2));
    const h = Math.max(900, Math.ceil(height + margin * 2));
    world.style.width = `${w}px`;
    world.style.height = `${h}px`;
    svg.style.width = `${w}px`;
    svg.style.height = `${h}px`;
    svg.setAttribute('width', w);
    svg.setAttribute('height', h);
    svg.setAttribute('viewBox', `0 0 ${w} ${h}`);
  }

  function geometryEdge(kind, index, from, to, label = '') {
    const id = routeId(kind, index);
    const edge = { id, sources: [from], targets: [to] };
    if (label) edge.labels = [{ text: label, width: Math.max(42, label.length * 7 + 12), height: 20 }];
    return edge;
  }

  function graphFor(kind) {
    const groups = domainNames;
    const compounds = kind === 'module';
    const nodes = Object.fromEntries(data.entities.map(entity => [entity.id, {
      id: entity.id,
      width: cards.get(entity.id).offsetWidth,
      height: cards.get(entity.id).offsetHeight
    }]));
    const specifications = data.specializations.map((group, index) => ({ id: `erd-subtype-${index}`, width: 32, height: 32 }));
    const edges = data.relationships.map((relationship, index) => geometryEdge('relationship', index, relationship.from, relationship.to, relationship.label));
    data.specializations.forEach((group, index) => {
      const node = `erd-subtype-${index}`;
      edges.push(geometryEdge('specialization-parent', index, group.parent, node));
      group.children.forEach(child => edges.push(geometryEdge('specialization-child', `${index}-${child}`, node, child)));
    });

    let children;
    if (compounds) {
      children = groups.map((name, index) => ({
        id: `erd-domain-${index}`,
        layoutOptions: {
          'elk.algorithm': 'layered',
          'elk.direction': 'RIGHT',
          'elk.padding': '[top=34,left=24,bottom=24,right=24]',
          'elk.spacing.nodeNode': kind === 'module' ? '88' : '82',
          'elk.layered.spacing.nodeNodeBetweenLayers': kind === 'module' ? '110' : '100'
        },
        children: data.entities.filter(entity => entity.group === name).map(entity => nodes[entity.id])
      }));
      for (const group of data.specializations) {
        const index = data.specializations.indexOf(group);
        const specialization = specifications[index];
        const parentGroup = data.entities.find(entity => entity.id === group.parent).group;
        children[groups.indexOf(parentGroup)].children.push(specialization);
      }
    } else {
      children = [...Object.values(nodes), ...specifications];
    }

    const compact = kind === 'compact';
    const direction = kind === 'module' || kind === 'hierarchical-tb' || kind === 'academic' ? 'DOWN' : 'RIGHT';
    return {
      id: 'erd-root',
      layoutOptions: {
        'elk.algorithm': 'layered',
        'elk.direction': direction,
        'elk.edgeRouting': 'ORTHOGONAL',
        'elk.hierarchyHandling': compounds ? 'INCLUDE_CHILDREN' : 'SEPARATE_CHILDREN',
        'elk.spacing.nodeNode': compact ? '32' : kind === 'academic' ? '64' : kind === 'module' ? '112' : '88',
        'elk.spacing.edgeNode': compact ? '14' : kind === 'academic' ? '24' : '30',
        'elk.spacing.edgeEdge': compact ? '10' : kind === 'academic' ? '18' : '22',
        'elk.layered.spacing.nodeNodeBetweenLayers': compact ? '60' : kind === 'academic' ? '118' : kind === 'module' ? '210' : '168',
        'elk.layered.layering.strategy': 'NETWORK_SIMPLEX',
        'elk.layered.crossingMinimization.strategy': 'LAYER_SWEEP',
        'elk.layered.nodePlacement.strategy': 'BRANDES_KOEPF',
        'elk.layered.nodePlacement.favorStraightEdges': 'true',
        'elk.layered.considerModelOrder.strategy': 'NODES_AND_EDGES',
        'elk.layered.crossingMinimization.forceNodeModelOrder': 'true'
      },
      children,
      edges
    };
  }

  function absoluteNodes(children, ox = 0, oy = 0) {
    for (const child of children || []) {
      const x = ox + child.x + margin, y = oy + child.y + margin;
      const groupIndex = child.id.startsWith('erd-domain-') ? Number(child.id.slice('erd-domain-'.length)) : -1;
      if (groupIndex >= 0) domainBounds.set(groupIndex, { x, y, width: child.width, height: child.height });
      if (cards.has(child.id)) {
        positions.set(child.id, { x, y });
        place(child.id);
      }
      if (child.id.startsWith('erd-subtype-')) subtypePoints.set(child.id, { x: ox + child.x + child.width / 2 + margin, y: oy + child.y + child.height / 2 + margin });
      absoluteNodes(child.children, x - margin, y - margin);
    }
  }

  const subtypePoints = new Map();
  function routeFromResult(result) {
    routes.clear();
    domainBounds.clear();
    subtypePoints.clear();
    absoluteNodes(result.children);
    for (const edge of result.edges || []) {
      routes.set(edge.id, {
        sections: (edge.sections || []).map(section => [section.startPoint, ...(section.bendPoints || []), section.endPoint].map(p => ({ x: p.x + margin, y: p.y + margin }))),
        labels: (edge.labels || []).map(label => ({ text: label.text, x: label.x + margin, y: label.y + margin, width: label.width, height: label.height }))
      });
    }
    if (mode === 'module') separateModuleLabels();
    layoutBounds = { x: margin, y: margin, width: result.width, height: result.height };
    updateWorldSize(result.width, result.height);
  }

  function separateModuleLabels() {
    const labels = [...routes.entries()]
      .filter(([id, route]) => id.startsWith('relationship-') && route.labels.length)
      .flatMap(([, route]) => route.labels);
    const cardsBounds = data.entities.map(entity => {
      const p = point(entity.id), card = cards.get(entity.id);
      return { x: p.x, y: p.y, width: card.offsetWidth, height: card.offsetHeight };
    });
    const placed = [];
    const overlaps = (a, b) => a.x < b.x + b.width + 5 && a.x + a.width + 5 > b.x
      && a.y < b.y + b.height + 4 && a.y + a.height + 4 > b.y;
    const offsets = [[0, 0]];
    for (let step = 1; step <= 12; step++) {
      const distance = step * 26;
      offsets.push([0, -distance], [0, distance], [-distance, 0], [distance, 0]);
    }
    for (const label of labels) {
      const origin = { x: label.x, y: label.y };
      for (const [dx, dy] of offsets) {
        const candidate = { ...label, x: origin.x + dx, y: origin.y + dy };
        if (cardsBounds.some(bounds => overlaps(candidate, bounds)) || placed.some(bounds => overlaps(candidate, bounds))) continue;
        label.x = candidate.x;
        label.y = candidate.y;
        placed.push(candidate);
        break;
      }
    }
  }

  function routeFor(kind, index, fromId, toId) {
    const route = routes.get(routeId(kind, index));
    return route?.sections?.[0] || manualRoute(fromId, toId);
  }

  function manualRoute(fromId, toId) {
    const from = cards.get(fromId), to = cards.get(toId), a = point(fromId), b = point(toId);
    const ac = { x: a.x + from.offsetWidth / 2, y: a.y + from.offsetHeight / 2 };
    const bc = { x: b.x + to.offsetWidth / 2, y: b.y + to.offsetHeight / 2 };
    const dx = bc.x - ac.x, dy = bc.y - ac.y;
    if (Math.abs(dx) >= Math.abs(dy)) {
      const side = dx >= 0 ? 1 : -1;
      const start = { x: side > 0 ? a.x + from.offsetWidth : a.x, y: ac.y };
      const end = { x: side > 0 ? b.x : b.x + to.offsetWidth, y: bc.y };
      const midX = (start.x + end.x) / 2;
      return [start, { x: midX, y: start.y }, { x: midX, y: end.y }, end];
    }
    const side = dy >= 0 ? 1 : -1;
    const start = { x: ac.x, y: side > 0 ? a.y + from.offsetHeight : a.y };
    const end = { x: bc.x, y: side > 0 ? b.y : b.y + to.offsetHeight };
    const midY = (start.y + end.y) / 2;
    return [start, { x: start.x, y: midY }, { x: end.x, y: midY }, end];
  }

  function cleanPoints(points) {
    return points.filter((p, index) => index === 0 || p.x !== points[index - 1].x || p.y !== points[index - 1].y);
  }

  function pathData(points) {
    return cleanPoints(points).map((p, index) => `${index ? 'L' : 'M'} ${p.x} ${p.y}`).join(' ');
  }

  function drawCardinality(points, kind, index) {
    if (!kind || points.length < 2) return;
    points = cleanPoints(points);
    if (points.length < 2) return;
    const glyphScale = Math.max(1, Math.min(2, 1 / zoom));
    const endpoint = points[0];
    const next = points[1];
    const length = Math.hypot(next.x - endpoint.x, next.y - endpoint.y);
    if (length < .001) return;
    const dx = (next.x - endpoint.x) / length, dy = (next.y - endpoint.y) / length;
    const px = -dy, py = dx;
    const at = distance => ({ x: endpoint.x + dx * distance * glyphScale, y: endpoint.y + dy * distance * glyphScale });
    const line = (x1, y1, x2, y2) => svg.append(svgEl('path', {
      d: `M ${x1} ${y1} L ${x2} ${y2}`,
      class: 'erd-cardinality', 'data-index': index
    }));
    if (kind === 'bar' || kind === 'doubleBar') {
      for (const offset of (kind === 'bar' ? [12] : [12, 20]).map(value => value * glyphScale)) {
        const p = at(offset);
        line(p.x - px * 9 * glyphScale, p.y - py * 9 * glyphScale, p.x + px * 9 * glyphScale, p.y + py * 9 * glyphScale);
      }
    } else if (kind === 'fork') {
      const convergence = at(26);
      for (const offset of [-11, 0, 11]) {
        const tip = { x: endpoint.x + dx * 4 * glyphScale + px * offset * glyphScale, y: endpoint.y + dy * 4 * glyphScale + py * offset * glyphScale };
        line(tip.x, tip.y, convergence.x, convergence.y);
      }
    }
  }

  function drawRelationship(relationship, index, placedLabels, cardBoxes) {
    const route = routeFor('relationship', index, relationship.from, relationship.to);
    const moved = draggedEntity && [relationship.from, relationship.to].includes(draggedEntity);
    const points = cleanPoints(moved || mode === 'manual' || !routes.has(routeId('relationship', index))
      ? manualRoute(relationship.from, relationship.to)
      : route);
    const path = svgEl('path', { d: pathData(points), class: 'erd-link', 'data-index': index });
    path.addEventListener('click', event => { event.stopPropagation(); selectRelationship(index); });
    svg.append(path);
    if (relationship.cardinality) {
      drawCardinality(points, relationship.cardinality.from, index);
      drawCardinality([...points].reverse(), relationship.cardinality.to, index);
    }
    const width = Math.max(42, relationship.label.length * 7 + 12), height = 20;
    const clear = box => {
      const overlaps = other => box.x < other.x + other.width + 5 && box.x + box.width + 5 > other.x && box.y < other.y + other.height + 5 && box.y + box.height + 5 > other.y;
      return !placedLabels.some(overlaps) && !cardBoxes.some(overlaps);
    };
    let label = !moved && mode !== 'manual' ? routes.get(routeId('relationship', index))?.labels?.[0] : null;
    if (!label || !clear(label)) {
      label = null;
      const segments = points.slice(1).map((end, i) => ({ start: points[i], end, length: Math.hypot(end.x - points[i].x, end.y - points[i].y) }))
        .sort((a, b) => b.length - a.length);
      for (const { start, end, length } of segments) {
        if (length < 38) continue;
        for (const t of [.5, .3, .7]) {
          const x = start.x + (end.x - start.x) * t, y = start.y + (end.y - start.y) * t;
          const horizontal = Math.abs(end.y - start.y) < 1;
          for (const side of [-1, 1]) {
            const candidate = horizontal
              ? { x: x - width / 2, y: y + (side < 0 ? -height - 7 : 7), width, height }
              : { x: x + (side < 0 ? -width - 9 : 9), y: y - height / 2, width, height };
            if (clear(candidate)) { label = candidate; break; }
          }
          if (label) break;
        }
        if (label) break;
      }
    }
    if (!label) label = { x: points[0].x + 12, y: points[0].y - height - 12, width, height };
    placedLabels.push(label);
    const text = svgEl('text', { x: label.x + label.width / 2, y: label.y + label.height - 4, class: 'erd-link-label', 'data-for': index });
    text.textContent = relationship.label;
    svg.append(text);
  }

  function drawSpecializations() {
    data.specializations.forEach((group, index) => {
      const nodeId = `erd-subtype-${index}`;
      const fallbackPoint = () => {
        const parent = cards.get(group.parent), parentPos = point(group.parent);
        return { x: parentPos.x + parent.offsetWidth / 2, y: parentPos.y + parent.offsetHeight + 76 };
      };
      const p = mode !== 'manual' && !draggedEntity ? subtypePoints.get(nodeId) || fallbackPoint() : fallbackPoint();
      const subtypeClass = `erd-subtype-link ${[group.parent, ...group.children].map(id => `subtype-${id}`).join(' ')}`;
      const parentPoints = routes.get(routeId('specialization-parent', index))?.sections?.[0];
      const dynamic = mode === 'manual' || (draggedEntity && [group.parent, ...group.children].includes(draggedEntity));
      let first = dynamic ? (() => {
        const parent = cards.get(group.parent), pos = point(group.parent);
        const start = { x: pos.x + parent.offsetWidth / 2, y: pos.y + parent.offsetHeight };
        const end = { x: p.x, y: p.y - 16 }, middle = (start.y + end.y) / 2;
        return [start, { x: start.x, y: middle }, { x: end.x, y: middle }, end];
      })() : parentPoints;
      if (!first) {
        const parent = cards.get(group.parent), pos = point(group.parent);
        first = [{ x: pos.x + parent.offsetWidth / 2, y: pos.y + parent.offsetHeight }, { x: p.x, y: p.y - 16 }];
      }
      svg.append(svgEl('path', { d: pathData(first), class: `erd-link erd-special-line ${subtypeClass}` }));
      group.children.forEach(childId => {
        const childPoints = routes.get(routeId('specialization-child', `${index}-${childId}`))?.sections?.[0];
        let points = childPoints;
        if (dynamic || !points) {
          const child = cards.get(childId), childPos = point(childId);
          const start = { x: p.x, y: p.y + 16 }, end = { x: childPos.x + child.offsetWidth / 2, y: childPos.y };
          const middle = (start.y + end.y) / 2;
          points = [start, { x: start.x, y: middle }, { x: end.x, y: middle }, end];
        }
        svg.append(svgEl('path', { d: pathData(points), class: `erd-link erd-special-line ${subtypeClass}` }));
      });
      svg.append(svgEl('circle', { cx: p.x, cy: p.y, r: 16, class: `erd-specialization ${subtypeClass}` }));
      const mark = svgEl('text', { x: p.x, y: p.y, class: 'erd-specialization-label' });
      mark.textContent = group.discriminator || 'D';
      svg.append(mark);
    });
  }

  function renderEdges() {
    const cardBoxes = data.entities.map(entity => {
      const p = point(entity.id), card = cards.get(entity.id);
      return { x: p.x, y: p.y, width: card.offsetWidth, height: card.offsetHeight };
    });
    svg.replaceChildren();
    drawGroups(false);
    const placedLabels = [];
    data.relationships.forEach((relationship, index) => drawRelationship(relationship, index, placedLabels, cardBoxes));
    drawSpecializations();
    drawGroups(true);
    updateSelection();
  }

  function drawGroups(labelsOnly) {
    if (mode !== 'academic' && mode !== 'module') return;
    for (const [index, bounds] of domainBounds) {
      if (!labelsOnly) {
        svg.append(svgEl('rect', { x: bounds.x, y: bounds.y, width: bounds.width, height: bounds.height, rx: 10, class: 'erd-domain-outline' }));
      } else {
        const label = svgEl('text', { x: bounds.x + 18, y: bounds.y + 23, class: 'erd-group-label' });
        label.textContent = domainNames[index];
        svg.append(label);
      }
    }
  }

  function updateSelection() {
    for (const [id, card] of cards) card.classList.toggle('is-selected', id === selectedEntity);
    const related = selectedEntity
      ? new Set(data.relationships.flatMap((relationship, index) => relationship.from === selectedEntity || relationship.to === selectedEntity ? [index] : []))
      : selectedRelationship >= 0 ? new Set([selectedRelationship]) : null;
    svg.querySelectorAll('.erd-link[data-index]').forEach(path => {
      const index = Number(path.dataset.index);
      path.classList.toggle('is-related', related?.has(index) || false);
      path.classList.toggle('is-muted', Boolean(related && !related.has(index)));
    });
    svg.querySelectorAll('.erd-cardinality[data-index]').forEach(mark => {
      const index = Number(mark.dataset.index);
      mark.classList.toggle('is-related', related?.has(index) || false);
      mark.classList.toggle('is-muted', Boolean(related && !related.has(index)));
    });
    svg.querySelectorAll('.erd-link-label[data-for]').forEach(label => {
      const index = Number(label.dataset.for);
      label.classList.toggle('is-muted', Boolean(related && !related.has(index)));
    });
    svg.querySelectorAll('.erd-subtype-link').forEach(link => {
      link.classList.toggle('is-related', Boolean(selectedEntity && link.classList.contains(`subtype-${selectedEntity}`)));
    });
    const count = selectedEntity
      ? data.relationships.filter(relationship => relationship.from === selectedEntity || relationship.to === selectedEntity).length
      : data.relationships.length;
    const ambiguous = selectedRelationship >= 0 && !data.relationships[selectedRelationship].cardinality;
    status.textContent = selectedEntity
      ? `${entities.get(selectedEntity).label} · ${count} relationships${mode === 'manual' ? ' · Manual' : ''}`
      : selectedRelationship >= 0
        ? `${entities.get(data.relationships[selectedRelationship].from).label} ${data.relationships[selectedRelationship].label} ${entities.get(data.relationships[selectedRelationship].to).label}${ambiguous ? ' · Cardinality not marked in source' : ''}`
        : `${entities.size} entities · ${count} relationships · ${modeLabel(mode)}`;
  }

  function modeLabel(kind) {
    return ({ academic: 'Academic / Orthogonal', 'hierarchical-lr': 'Hierarchical LR', 'hierarchical-tb': 'Hierarchical TB', module: 'Module / Domain', compact: 'Compact', manual: 'Manual' })[kind];
  }

  function selectEntity(id) {
    selectedEntity = id;
    selectedRelationship = -1;
    updateSelection();
  }

  function selectRelationship(index) {
    selectedEntity = null;
    selectedRelationship = index;
    updateSelection();
  }

  function applyTransform() {
    world.style.transform = `translate(${panX}px, ${panY}px) scale(${zoom})`;
    svg.style.setProperty('--erd-stroke-width', `${1.1 / zoom}px`);
    zoomValue.textContent = `${Math.round(zoom * 100)}%`;
  }

  function fit() {
    let bounds;
    if (layoutBounds && mode !== 'manual') bounds = layoutBounds;
    else {
      const entries = data.entities.map(entity => {
        const p = point(entity.id), card = cards.get(entity.id);
        return { x: p.x, y: p.y, w: card.offsetWidth, h: card.offsetHeight };
      });
      const minX = Math.min(...entries.map(item => item.x)), minY = Math.min(...entries.map(item => item.y));
      const maxX = Math.max(...entries.map(item => item.x + item.w)), maxY = Math.max(...entries.map(item => item.y + item.h));
      bounds = { x: minX, y: minY, width: maxX - minX, height: maxY - minY };
    }
    const padding = 58;
    zoom = Math.max(.025, Math.min(1.2, (canvas.clientWidth - padding * 2) / bounds.width, (canvas.clientHeight - padding * 2) / bounds.height));
    panX = (canvas.clientWidth - bounds.width * zoom) / 2 - bounds.x * zoom;
    panY = (canvas.clientHeight - bounds.height * zoom) / 2 - bounds.y * zoom;
    applyTransform();
    renderEdges();
  }

  function zoomAt(next, clientX = canvas.getBoundingClientRect().left + canvas.clientWidth / 2, clientY = canvas.getBoundingClientRect().top + canvas.clientHeight / 2) {
    const bounds = canvas.getBoundingClientRect(), x = clientX - bounds.left, y = clientY - bounds.top;
    const worldX = (x - panX) / zoom, worldY = (y - panY) / zoom;
    zoom = Math.max(.025, Math.min(2.2, next));
    panX = x - worldX * zoom;
    panY = y - worldY * zoom;
    applyTransform();
    renderEdges();
  }

  function manualLayout() {
    layoutRun++;
    selectedEntity = null;
    selectedRelationship = -1;
    if (!manualPositions) manualPositions = new Map([...positions].map(([id, p]) => [id, { ...p }]));
    mode = 'manual';
    routes.clear();
    layoutBounds = null;
    for (const [id, p] of manualPositions) { positions.set(id, { ...p }); place(id); }
    layoutSelect.value = mode;
    updateWorldSize();
    fit();
  }

  async function applyLayout(kind = layoutSelect.value) {
    if (kind === 'manual') { manualLayout(); return; }
    if (!elk) {
      status.textContent = 'Layout engine unavailable; existing positions preserved.';
      return;
    }
    const run = ++layoutRun;
    const previousMode = mode;
    mode = kind;
    selectedEntity = null;
    selectedRelationship = -1;
    layoutSelect.value = kind;
    draggedEntity = null;
    status.textContent = `Arranging ${modeLabel(kind)}…`;
    try {
      const result = await elk.layout(graphFor(kind));
      if (run !== layoutRun) return;
      routeFromResult(result);
      renderEdges();
      fit();
    } catch (error) {
      console.error('ERD layout failed', error);
      if (run === layoutRun) {
        mode = previousMode;
        layoutSelect.value = previousMode;
        renderEdges();
        status.textContent = `${modeLabel(kind)} layout failed; restored ${modeLabel(previousMode)} with previous positions.`;
      }
    }
  }

  buildCards();
  unmarkedRelationshipList();
  updateWorldSize();
  toolbar.querySelector('#erd-apply').addEventListener('click', () => applyLayout());
  toolbar.querySelector('#erd-fit').addEventListener('click', fit);
  toolbar.querySelector('#erd-zoom-in').addEventListener('click', () => zoomAt(zoom * 1.15));
  toolbar.querySelector('#erd-zoom-out').addEventListener('click', () => zoomAt(zoom / 1.15));
  canvas.addEventListener('wheel', event => {
    event.preventDefault();
    zoomAt(zoom * (event.deltaY < 0 ? 1.1 : 1 / 1.1), event.clientX, event.clientY);
  }, { passive: false });
  canvas.addEventListener('pointerdown', event => {
    if (event.button !== 0) return;
    const relationship = event.target.closest('.erd-link[data-index]');
    if (relationship) {
      selectRelationship(Number(relationship.dataset.index));
      return;
    }
    const card = event.target.closest('.erd-entity');
    if (card) {
      selectEntity(card.dataset.entity);
      gesture = { kind: 'entity', id: event.pointerId, entity: card.dataset.entity, startX: event.clientX, startY: event.clientY, origin: { ...point(card.dataset.entity) }, moved: false };
    } else {
      gesture = { kind: 'pan', id: event.pointerId, startX: event.clientX, startY: event.clientY, origin: { x: panX, y: panY }, moved: false };
      canvas.classList.add('is-panning');
    }
    canvas.setPointerCapture(event.pointerId);
  });
  canvas.addEventListener('pointermove', event => {
    if (!gesture || gesture.id !== event.pointerId) return;
    const dx = event.clientX - gesture.startX, dy = event.clientY - gesture.startY;
      if (!gesture.moved && Math.hypot(dx, dy) < 3) return;
      gesture.moved = true;
      if (gesture.kind === 'entity') {
        if (mode !== 'manual') {
          layoutRun++;
          mode = 'manual';
          layoutSelect.value = 'manual';
          manualPositions = new Map([...positions].map(([id, p]) => [id, { ...p }]));
        }
        draggedEntity = gesture.entity;
        positions.set(gesture.entity, { x: gesture.origin.x + dx / zoom, y: gesture.origin.y + dy / zoom });
        manualPositions?.set(gesture.entity, { ...point(gesture.entity) });
        place(gesture.entity);
        renderEdges();
    } else {
      panX = gesture.origin.x + dx;
      panY = gesture.origin.y + dy;
      applyTransform();
    }
  });
  canvas.addEventListener('pointerup', event => {
    if (gesture?.id === event.pointerId) gesture = null;
    canvas.classList.remove('is-panning');
  });
  canvas.addEventListener('pointercancel', () => { gesture = null; canvas.classList.remove('is-panning'); });
  window.addEventListener('resize', () => { if (active) fit(); });

  window.erdWorkbench = {
    activate() {
      active = true;
      applyTransform();
      renderEdges();
      if (!window.erdWorkbench.hasActivated) {
        window.erdWorkbench.hasActivated = true;
        applyLayout('academic');
      }
    },
    fit,
    get data() { return data; }
  };
})();
