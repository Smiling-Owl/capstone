(function () {
  'use strict';

  const panel = document.getElementById('postgres-panel');
  const toolbar = document.getElementById('postgres-toolbar');
  if (!panel || !toolbar) return;
  const model = window.PostgresPhysicalModel;
  const source = window.POSTGRES_SCHEMA_SOURCE?.text;
  if (!model || typeof source !== 'string') throw new Error('Physical schema viewer dependencies did not load.');

  const root = document.createElement('section');
  root.id = 'postgres-diagram-root';
  root.className = 'pgd-root';
  root.hidden = true;
  root.setAttribute('aria-label', 'PostgreSQL physical schema diagram');
  root.innerHTML = `
    <div class="pgd-viewport" id="pgd-viewport" tabindex="0" role="region" aria-label="Physical schema diagram. Drag tables to arrange them; drag empty space to pan; use the mouse wheel to zoom.">
      <div class="pgd-world" id="pgd-world"><svg class="pgd-edges" id="pgd-edges" aria-hidden="true"></svg><div class="pgd-nodes" id="pgd-nodes"></div></div>
      <div class="pgd-empty" id="pgd-empty" hidden></div>
      <div class="pgd-canvas-legend"><b>PK</b> primary key <b>FK</b> foreign key <b>UQ</b> unique <b>N</b> nullable <b>NN</b> required <b>d</b> default</div>
    </div>
    <div class="pgd-status" id="pgd-status" role="status" aria-live="polite"></div>`;
  panel.append(root);

  const controls = document.createElement('div');
  controls.id = 'postgres-diagram-controls';
  controls.className = 'pgd-controls';
  controls.hidden = true;
  controls.setAttribute('aria-label', 'Physical schema diagram controls');
  controls.innerHTML = `
    <label class="pgd-search-label" for="pgd-search">Find table</label>
    <input id="pgd-search" type="search" placeholder="Table or column…" autocomplete="off" spellcheck="false">
    <label class="pgd-focus-label" for="pgd-focus">Go to</label>
    <select id="pgd-focus" aria-label="Focus a table"><option value="">Select table…</option></select>
    <button type="button" id="pgd-fit" title="Fit all tables in view">Fit</button>
    <button type="button" id="pgd-zoom-out" aria-label="Zoom out" title="Zoom out">−</button>
    <button type="button" id="pgd-zoom-in" aria-label="Zoom in" title="Zoom in">+</button>
    <label class="pgd-layout-label" for="pgd-direction">Layout</label>
    <select id="pgd-direction" aria-label="Diagram layout"><option value="OVERVIEW">Overview</option><option value="TB">Dependency · top to bottom</option><option value="LR">Dependency · left to right</option></select>`;
  toolbar.append(controls);

  const viewport = root.querySelector('#pgd-viewport');
  const world = root.querySelector('#pgd-world');
  const edgeLayer = root.querySelector('#pgd-edges');
  const nodeLayer = root.querySelector('#pgd-nodes');
  const status = root.querySelector('#pgd-status');
  const search = controls.querySelector('#pgd-search');
  const parsed = model.parse(source);
  const tables = new Map(parsed.tables.map(table => [table.name, table]));
  const cardNodes = new Map();
  let positions = new Map(), zoom = 1, pan = { x: 36, y: 36 }, activated = false, selectedTable = '';
  let dragging = null, panning = null, frame = 0, resizeTimer = 0, resizePending = false, layout = 'OVERVIEW';
  let canvasBounds = { left: 0, top: 0, width: 1, height: 1 };

  const esc = value => String(value).replace(/[&<>"']/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));
  const label = name => name.replace(/^public\./, '');
  const marker = column => [column.primaryKey && 'PK', column.foreignKey && 'FK', column.unique && !column.primaryKey && 'UQ'].filter(Boolean);

  function buildCards() {
    const allTables = [...parsed.tables, ...parsed.externalTables.map(t => ({ ...t, external: true, columns: [{ name: 'id', type: 'unknown', nullable: null }] }))];
    const fkCounts = new Map();
    for (const fk of parsed.foreignKeys) fkCounts.set(fk.table, (fkCounts.get(fk.table) || 0) + 1);
    const indexCounts = new Map();
    for (const index of parsed.uniqueIndexes) indexCounts.set(index.table, (indexCounts.get(index.table) || 0) + 1);
    for (const table of allTables) {
      const card = document.createElement('article');
      card.className = `pgd-table${table.external ? ' is-external' : ''}`;
      card.dataset.table = table.name;
      card.tabIndex = 0;
      card.setAttribute('role', 'button');
      card.setAttribute('aria-label', `${table.name}${table.external ? ', external reference' : ''}`);
      const rows = table.columns.map(column => {
        const keys = marker(column);
        const type = column.type || '—';
        const nullCue = column.nullable == null ? '?' : column.nullable ? 'N' : 'NN';
        const details = [column.primaryKey ? 'Primary key' : '', column.foreignKey ? 'Foreign key' : '', column.unique && !column.primaryKey ? 'Unique' : '', column.nullable == null ? 'Nullability not declared' : column.nullable ? 'Nullable' : 'Not null', column.default ? `Default: ${column.default}` : ''].filter(Boolean).join(' · ');
        return `<div class="pgd-column" data-column="${esc(column.name)}" title="${esc(details)}"><span class="pgd-attribute">${esc(column.name)}</span><span class="pgd-key-cell">${keys.map(key => `<b class="pgd-key pgd-key-${key.toLowerCase()}">${key}</b>`).join('')}</span><span class="pgd-type">${esc(type)}</span><span class="pgd-null" aria-label="${column.nullable == null ? 'Unknown nullability' : column.nullable ? 'Nullable' : 'Not null'}">${nullCue}</span>${column.default ? `<span class="pgd-default" aria-label="Default ${esc(column.default)}">d</span>` : ''}</div>`;
      }).join('');
      const composite = table.uniqueConstraints?.filter(cols => cols.length > 1) || [];
      const tableIndexes = parsed.uniqueIndexes.filter(index => index.table === table.name);
      const uniqueIndexNote = tableIndexes.length ? `<footer class="pgd-indexes" title="${esc(tableIndexes.map(index => `${index.name}: ${index.expressions.join(', ')}${index.where ? ` WHERE ${index.where}` : ''}`).join('; '))}">${tableIndexes.map(index => `<div><b>Unique index</b> ${esc(index.name)} (${esc(index.expressions.join(', '))})${index.where ? ` <span>WHERE ${esc(index.where)}</span>` : ''}</div>`).join('')}</footer>` : '';
      card.innerHTML = `<header class="pgd-table-head"><span class="pgd-schema">${esc(table.external ? 'External reference' : table.name.split('.')[0])}</span><strong>${esc(label(table.name))}</strong><span class="pgd-overview-meta">${table.external ? 'definition unavailable' : `${table.columns.length} columns · ${fkCounts.get(table.name) || 0} FK · ${indexCounts.get(table.name) || 0} unique index`}</span></header><div class="pgd-columns">${rows}</div>${composite.length ? `<footer class="pgd-composite" title="${esc(composite.map(cols => `UNIQUE (${cols.join(', ')})`).join('; '))}">${composite.length} composite unique ${composite.length === 1 ? 'constraint' : 'constraints'}</footer>` : ''}${uniqueIndexNote}`;
      nodeLayer.append(card);
      cardNodes.set(table.name, card);
    }
    const focus = controls.querySelector('#pgd-focus');
    for (const table of [...parsed.tables, ...parsed.externalTables]) {
      const option = document.createElement('option'); option.value = table.name; option.textContent = label(table.name); focus.append(option);
    }
  }

  function layoutGraph(direction) {
    layout = direction;
    nodeLayer.classList.toggle('is-overview', direction === 'OVERVIEW');
    if (direction === 'OVERVIEW') {
      const items = [...cardNodes].map(([name, card]) => ({ name, width: card.offsetWidth, height: card.offsetHeight }));
      const result = model.bestOverviewLayout(items, viewport.clientWidth || 1280, viewport.clientHeight || 720, 12, 8, 24);
      positions = new Map(result.positions.map(pos => [pos.name, { x: pos.x, y: pos.y }]));
      applyPositions(); fit(); drawEdges(); updateSelection(); return;
    }
    if (!window.dagre?.graphlib) { status.textContent = 'Dagre layout library is unavailable.'; return; }
    const graph = new window.dagre.graphlib.Graph({ multigraph: true });
    graph.setGraph({ rankdir: direction, ranksep: 110, nodesep: 56, edgesep: 24, marginx: 36, marginy: 36 });
    graph.setDefaultEdgeLabel(() => ({}));
    for (const [name, card] of cardNodes) {
      const ext = card.classList.contains('is-external');
      graph.setNode(name, { width: card.offsetWidth || 280, height: card.offsetHeight || 100, padding: ext ? 0 : 0 });
    }
    parsed.foreignKeys.forEach((fk, index) => {
      if (cardNodes.has(fk.table) && cardNodes.has(fk.targetTable)) graph.setEdge(fk.table, fk.targetTable, {}, `fk-${index}`);
    });
    window.dagre.layout(graph);
    positions = new Map();
    for (const name of cardNodes.keys()) {
      const n = graph.node(name);
      if (n) positions.set(name, { x: n.x - n.width / 2, y: n.y - n.height / 2 });
    }
    applyPositions();
    fit();
    drawEdges(); updateSelection();
  }

  function applyPositions() {
    let left = Infinity, top = Infinity, right = -Infinity, bottom = -Infinity;
    for (const [name, card] of cardNodes) {
      const p = positions.get(name);
      if (p) {
        card.style.left = `${p.x}px`; card.style.top = `${p.y}px`;
        left = Math.min(left, p.x); top = Math.min(top, p.y);
        right = Math.max(right, p.x + card.offsetWidth); bottom = Math.max(bottom, p.y + card.offsetHeight);
      }
    }
    canvasBounds = { left, top, width: Math.max(1, right - left + 36), height: Math.max(1, bottom - top + 36) };
    world.style.width = `${canvasBounds.width}px`; world.style.height = `${canvasBounds.height}px`;
    edgeLayer.style.left = `${left}px`; edgeLayer.style.top = `${top}px`;
    requestEdges();
  }

  function rowY(tableName, columnName) {
    const card = cardNodes.get(tableName);
    const row = card?.querySelector(`.pgd-column[data-column="${CSS.escape(columnName)}"]`);
    if (!card || !row) return 0;
    return positions.get(tableName).y + row.offsetTop + row.offsetHeight / 2;
  }

  function drawEdges() {
    const { left, top, width, height } = canvasBounds;
    edgeLayer.setAttribute('width', width); edgeLayer.setAttribute('height', height);
    edgeLayer.setAttribute('viewBox', `${left} ${top} ${width} ${height}`);
    const paths = [];
    for (const fk of parsed.foreignKeys) {
      const from = cardNodes.get(fk.table), to = cardNodes.get(fk.targetTable);
      const fp = positions.get(fk.table), tp = positions.get(fk.targetTable);
      if (!from || !to || !fp || !tp) continue;
      if (layout === 'OVERVIEW') {
        const startX = fp.x + from.offsetWidth / 2, startY = fp.y + from.offsetHeight / 2;
        const endX = tp.x + to.offsetWidth / 2, endY = tp.y + to.offsetHeight / 2;
        const d = fk.table === fk.targetTable
          ? `M ${fp.x + from.offsetWidth} ${startY} C ${fp.x + from.offsetWidth + 22} ${startY - 15}, ${fp.x + from.offsetWidth + 22} ${startY + 15}, ${fp.x + from.offsetWidth} ${startY}`
          : `M ${startX} ${startY} Q ${(startX + endX) / 2} ${(startY + endY) / 2 - 8} ${endX} ${endY}`;
        paths.push(`<path class="pgd-edge pgd-overview-edge" data-source-table="${esc(fk.table)}" data-target-table="${esc(fk.targetTable)}" data-from="${esc(fk.table)}" data-to="${esc(fk.targetTable)}" d="${d}"><title>${esc(fk.table)} references ${esc(fk.targetTable)}</title></path>`);
        continue;
      }
      if (fk.table === fk.targetTable) {
        fk.columns.forEach((sourceColumn, index) => {
          const targetColumn = fk.targetColumns[index];
          if (!from.querySelector(`.pgd-column[data-column="${CSS.escape(sourceColumn)}"]`) || !to.querySelector(`.pgd-column[data-column="${CSS.escape(targetColumn)}"]`)) return;
          const x = fp.x + from.offsetWidth, sy = rowY(fk.table, sourceColumn), ty = rowY(fk.targetTable, targetColumn);
          const d = `M ${x} ${sy} C ${x + 34} ${sy}, ${x + 34} ${ty}, ${x} ${ty}`;
          paths.push(`<path class="pgd-edge" data-source-table="${esc(fk.table)}" data-target-table="${esc(fk.targetTable)}" data-from="${esc(fk.table)}.${esc(sourceColumn)}" data-to="${esc(fk.targetTable)}.${esc(targetColumn)}" d="${d}"><title>${esc(fk.table)}.${esc(sourceColumn)} → ${esc(fk.targetTable)}.${esc(targetColumn)}</title></path>`);
        });
        continue;
      }
      const forward = tp.x >= fp.x + from.offsetWidth;
      const startX = fp.x + (forward ? from.offsetWidth : 0);
      const endX = tp.x + (forward ? 0 : to.offsetWidth);
      fk.columns.forEach((sourceColumn, index) => {
        const targetColumn = fk.targetColumns[index];
        const sourceRow = from.querySelector(`.pgd-column[data-column="${CSS.escape(sourceColumn)}"]`);
        const targetRow = to.querySelector(`.pgd-column[data-column="${CSS.escape(targetColumn)}"]`);
        if (!sourceRow || !targetRow) return;
        const sy = rowY(fk.table, sourceColumn), ty = rowY(fk.targetTable, targetColumn);
        const bend = startX + (endX - startX) / 2;
        const d = `M ${startX} ${sy} C ${bend} ${sy}, ${bend} ${ty}, ${endX} ${ty}`;
        paths.push(`<path class="pgd-edge" data-source-table="${esc(fk.table)}" data-target-table="${esc(fk.targetTable)}" data-from="${esc(fk.table)}.${esc(sourceColumn)}" data-to="${esc(fk.targetTable)}.${esc(targetColumn)}" d="${d}"><title>${esc(fk.table)}.${esc(sourceColumn)} → ${esc(fk.targetTable)}.${esc(targetColumn)}</title></path>`);
      });
    }
    edgeLayer.innerHTML = paths.join('');
    const query = search.value.trim().toLowerCase();
    if (query) for (const edge of edgeLayer.querySelectorAll('.pgd-edge')) {
      edge.classList.toggle('is-dimmed', !edge.dataset.from.toLowerCase().includes(query) && !edge.dataset.to.toLowerCase().includes(query));
    }
    updateSelection();
  }

  function requestEdges() { if (!frame) frame = requestAnimationFrame(() => { frame = 0; drawEdges(); }); }
  function applyTransform() { world.style.transform = `translate(${pan.x}px, ${pan.y}px) scale(${zoom})`; }
  function fit() {
    if (!cardNodes.size || !positions.size) return;
    const rect = viewport.getBoundingClientRect();
    const items = [...positions].map(([name, p]) => ({ x: p.x, y: p.y, width: cardNodes.get(name).offsetWidth, height: cardNodes.get(name).offsetHeight }));
    if (!rect.width || !rect.height || !items.length) return;
    ({ zoom, pan } = model.fitTransform(items, rect.width, rect.height, 24));
    applyTransform();
  }
  function zoomAt(next, x, y) {
    const value = Math.min(2, Math.max(0.005, next));
    const factor = value / zoom;
    pan = { x: x - (x - pan.x) * factor, y: y - (y - pan.y) * factor };
    zoom = value; applyTransform();
  }

  function focusTable(name) {
    const card = cardNodes.get(name), p = positions.get(name);
    if (!card || !p) return;
    const rect = viewport.getBoundingClientRect();
    zoom = Math.max(0.08, Math.min(1.15, Math.min((rect.width - 64) / card.offsetWidth, (rect.height - 64) / card.offsetHeight)));
    pan = { x: rect.width / 2 - (p.x + card.offsetWidth / 2) * zoom, y: rect.height / 2 - (p.y + card.offsetHeight / 2) * zoom };
    applyTransform();
    controls.querySelector('#pgd-focus').value = name;
    selectedTable = name; updateSelection();
    status.textContent = `Focused ${label(name)} · ${tables.get(name)?.columns.length || 1} attributes.`;
  }

  function selectTable(name) {
    if (layout === 'OVERVIEW') {
      const direction = controls.querySelector('#pgd-direction'); direction.value = 'TB'; layoutGraph('TB');
    }
    focusTable(name);
  }

  function updateSelection() {
    for (const [name, card] of cardNodes) {
      const related = selectedTable && parsed.foreignKeys.some(fk => (fk.table === selectedTable && fk.targetTable === name) || (fk.targetTable === selectedTable && fk.table === name));
      card.classList.toggle('is-focused', name === selectedTable);
      card.classList.toggle('is-related', Boolean(related));
      card.classList.toggle('is-selection-muted', Boolean(selectedTable) && name !== selectedTable && !related);
    }
    for (const edge of edgeLayer.querySelectorAll('.pgd-edge')) {
      const connected = selectedTable && (edge.dataset.sourceTable === selectedTable || edge.dataset.targetTable === selectedTable);
      edge.classList.toggle('is-related', Boolean(connected));
      edge.classList.toggle('is-selection-muted', Boolean(selectedTable) && !connected);
    }
  }

  function filterTables(query) {
    const value = query.trim().toLowerCase();
    let matched = 0;
    for (const [name, card] of cardNodes) {
      const table = tables.get(name);
      const isMatch = !value || name.toLowerCase().includes(value) || table?.columns.some(col => col.name.toLowerCase().includes(value));
      card.classList.toggle('is-dimmed', Boolean(value) && !isMatch);
      card.classList.toggle('is-match', Boolean(value && isMatch));
      if (value && isMatch) matched++;
    }
    for (const edge of edgeLayer.querySelectorAll('.pgd-edge')) {
      const show = !value || edge.dataset.from.toLowerCase().includes(value) || edge.dataset.to.toLowerCase().includes(value);
      edge.classList.toggle('is-dimmed', !show);
    }
    updateSelection();
    status.textContent = value ? `${matched} matching table${matched === 1 ? '' : 's'} of ${parsed.tables.length}.` : `${parsed.tables.length} tables · ${parsed.foreignKeys.length} foreign-key constraints · ${parsed.uniqueConstraints.length} table UNIQUE constraints · ${parsed.uniqueIndexes.length} unique indexes.`;
  }

  controls.querySelector('#pgd-fit').addEventListener('click', fit);
  controls.querySelector('#pgd-zoom-in').addEventListener('click', () => zoomAt(zoom * 1.2, viewport.clientWidth / 2, viewport.clientHeight / 2));
  controls.querySelector('#pgd-zoom-out').addEventListener('click', () => zoomAt(zoom / 1.2, viewport.clientWidth / 2, viewport.clientHeight / 2));
  controls.querySelector('#pgd-direction').addEventListener('change', event => layoutGraph(event.target.value));
  controls.querySelector('#pgd-focus').addEventListener('change', event => selectTable(event.target.value));
  search.addEventListener('input', () => filterTables(search.value));
  viewport.addEventListener('wheel', event => { event.preventDefault(); const rect = viewport.getBoundingClientRect(); zoomAt(zoom * (event.deltaY < 0 ? 1.12 : 1 / 1.12), event.clientX - rect.left, event.clientY - rect.top); }, { passive: false });
  viewport.addEventListener('pointerdown', event => {
    const card = event.target.closest('.pgd-table');
    if (card && event.button === 0) {
      const name = card.dataset.table, pos = positions.get(name);
      dragging = { name, pointer: event.pointerId, x: event.clientX, y: event.clientY, startX: pos.x, startY: pos.y, moved: false };
      card.classList.add('is-dragging'); card.setPointerCapture(event.pointerId); event.stopPropagation();
      return;
    }
    if (event.button === 0) {
      panning = { pointer: event.pointerId, x: event.clientX, y: event.clientY, startX: pan.x, startY: pan.y };
      viewport.setPointerCapture(event.pointerId);
    }
  });
  viewport.addEventListener('pointermove', event => {
    if (dragging?.pointer === event.pointerId) {
      const dx = event.clientX - dragging.x, dy = event.clientY - dragging.y;
      if (Math.hypot(dx, dy) > 4) dragging.moved = true;
      const p = positions.get(dragging.name); p.x = dragging.startX + dx / zoom; p.y = dragging.startY + dy / zoom; applyPositions();
    } else if (panning?.pointer === event.pointerId) {
      pan = { x: panning.startX + event.clientX - panning.x, y: panning.startY + event.clientY - panning.y }; applyTransform();
    }
  });
  function release(event) {
    if (dragging?.pointer === event.pointerId) {
      const completed = dragging;
      cardNodes.get(completed.name)?.classList.remove('is-dragging'); dragging = null;
      if (!completed.moved) selectTable(completed.name);
    }
    if (panning?.pointer === event.pointerId) panning = null;
  }
  viewport.addEventListener('pointerup', release);
  viewport.addEventListener('pointercancel', release);
  viewport.addEventListener('keydown', event => {
    if ((event.key === 'Enter' || event.key === ' ') && event.target.closest('.pgd-table')) {
      event.preventDefault(); selectTable(event.target.closest('.pgd-table').dataset.table);
    }
  });
  function resizeDiagram() {
    if (!activated) return;
    if (root.hidden || !viewport.clientWidth || !viewport.clientHeight) { resizePending = true; return; }
    resizePending = false;
    if (layout === 'OVERVIEW') layoutGraph(layout);
    else { fit(); if (selectedTable) focusTable(selectedTable); requestEdges(); }
  }
  window.addEventListener('resize', () => {
    if (!activated) return;
    window.clearTimeout(resizeTimer);
    resizeTimer = window.setTimeout(resizeDiagram, 100);
  });

  function activate() {
    root.hidden = false; controls.hidden = false;
    if (!activated) {
      if (!window.dagre?.graphlib) throw new Error('Load vendor/dagre.min.js before the PostgreSQL physical viewer.');
      activated = true; buildCards();
      layoutGraph('OVERVIEW');
      filterTables('');
    } else if (resizePending) resizeDiagram();
    return root;
  }
  window.postgresPhysicalSchema = parsed;
  window.postgresDiagram = Object.freeze({ activate, fit, parsed, focusTable });
})();
