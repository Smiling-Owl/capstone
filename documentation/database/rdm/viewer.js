/* The catalog is generated from PostgreSQL. This viewer never defines schema facts. */
(() => {
  'use strict';
  const esc = value => String(value ?? '').replace(/[&<>"']/g, c => ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
  const keyOf = table => `${table.schema}.${table.name}`;
  const wrap = (value, limit = 34) => {
    const input = String(value ?? '');
    const lines = [];
    for (const paragraph of input.split('\n')) {
      let remaining = paragraph;
      while (remaining.length > limit) {
        let cut = remaining.lastIndexOf('_', limit);
        if (cut < limit / 2) cut = limit;
        else cut += 1;
        lines.push(remaining.slice(0, cut));
        remaining = remaining.slice(cut);
      }
      lines.push(remaining);
    }
    return lines;
  };
  function relationships(tables, selected) {
    return tables.flatMap(child => (child.foreignKeys || []).map((fk, index) => ({
      child, fk, index,
      parent: tables.find(t => keyOf(t) === `${fk.targetSchema}.${fk.targetTable}`)
    }))).filter(edge => edge.parent && (!selected || keyOf(edge.child) === selected || keyOf(edge.parent) === selected));
  }
  function cardinalities(edge) {
    const {child, fk} = edge;
    const optional = fk.columns.some(name => child.columns.find(c => c.name === name)?.nullable);
    const keys = [child.primaryKey || [], ...(child.uniqueKeys || [])];
    const unique = keys.some(key => key.length > 0 && key.every(name => fk.columns.includes(name)));
    return {parent: optional ? '0..1' : '1', child: unique ? '0..1' : '0..N'};
  }
  function svgText(lines, x, y, attrs = '') {
    return `<text x="${x}" y="${y}" ${attrs}>${lines.map((line, i) => `<tspan x="${x}" dy="${i ? 32 : 0}">${esc(line)}</tspan>`).join('')}</text>`;
  }
  function svgFrame(width, height, title, body) {
    return `<svg xmlns="http://www.w3.org/2000/svg" width="${width}" height="${height}" viewBox="0 0 ${width} ${height}" role="img" aria-labelledby="diagram-title"><title id="diagram-title">${esc(title)}</title><rect width="100%" height="100%" fill="white"/><g fill="#202b29" font-family="Consolas, monospace" font-size="24">${body}</g></svg>`;
  }
  function relationshipSvg(edges, selected, showFk = true) {
    let y = 170;
    let body = svgText(wrap(`RELATIONSHIPS: ${selected}`, 105), 48, 48, 'font-family="Segoe UI, sans-serif" font-weight="600"');
    body += svgText(['Child table (referencing) → parent table (referenced)', 'Key attributes only. Repeated boxes denote the same relation, not additional tables.'], 48, 104, 'font-family="Segoe UI, sans-serif"');
    for (const edge of edges) {
      const {child, parent, fk} = edge;
      const card = cardinalities(edge);
      const nameLines = wrap(fk.name || `${child.name} reference`, 105);
      body += svgText(nameLines, 48, y + 24, 'font-family="Segoe UI, sans-serif" font-weight="600"');
      y += nameLines.length * 32 + 38;
      const titleLeft = wrap(keyOf(child), 34), titleRight = wrap(keyOf(parent), 34);
      const headerHeight = Math.max(titleLeft.length, titleRight.length) * 32 + 34;
      const rowHeights = fk.columns.map((name, i) => Math.max(wrap(name, 32).length, wrap(fk.targetColumns[i], 32).length) * 32 + 28);
      const boxHeight = headerHeight + rowHeights.reduce((a, b) => a + b, 0);
      for (const [table, x, titleLines] of [[child,48,titleLeft],[parent,1160,titleRight]]) {
        body += `<rect x="${x}" y="${y}" width="590" height="${boxHeight}" fill="${keyOf(table) === selected ? '#e5efea' : '#ffffff'}" stroke="#202b29" stroke-width="5"/>`;
        body += `<path d="M${x} ${y + headerHeight}h590" fill="none" stroke="#202b29" stroke-width="3"/>`;
        body += svgText(titleLines, x + 20, y + 34, 'font-weight="600"');
      }
      body += svgText([card.child], 664, y + headerHeight - 14, 'font-weight="600"');
      body += svgText([card.parent], 1065, y + headerHeight - 14, 'font-weight="600"');
      let rowY = y + headerHeight;
      fk.columns.forEach((name, i) => {
        const targetName = fk.targetColumns[i];
        const attrY = rowY + 36;
        body += svgText(wrap(name, 32), 68, attrY, (child.primaryKey || []).includes(name) ? 'text-decoration="underline"' : '');
        body += svgText(wrap(targetName, 32), 1180, attrY, (parent.primaryKey || []).includes(targetName) ? 'text-decoration="underline"' : '');
        if (showFk) body += svgText(['FK'], 570, attrY, 'font-family="Segoe UI, sans-serif" fill="#17665d"');
        const lineY = rowY + rowHeights[i] / 2;
        body += `<path d="M638 ${lineY}H1160m-14 -8 14 8 -14 8" fill="none" stroke="#202b29" stroke-width="3"/>`;
        rowY += rowHeights[i];
      });
      y += boxHeight + 34;
      const explanation = `Each child references ${card.parent} parent; each parent may have ${card.child} children.`;
      body += svgText([explanation], 48, y, 'font-family="Segoe UI, sans-serif"');
      y += 78;
    }
    body += svgText(['Underlined = primary key. Multiplicities are derived from FK nullability and unique keys.', 'Composite FK lines form one constraint. A parent need not have a child unless an additional rule enforces it.'], 48, y, 'font-family="Segoe UI, sans-serif"');
    return svgFrame(1800, y + 90, `Foreign-key relationships for ${selected}`, body);
  }
  function tableSvg(table, showFk = true) {
    const width = 1800, nameLines = wrap(keyOf(table), 100), headerHeight = nameLines.length * 34 + 44;
    let y = 54 + headerHeight;
    let body = svgText(nameLines, 76, 94, 'font-weight="600"');
    body += `<path d="M48 ${y}H1752" stroke="#202b29" stroke-width="3"/>`;
    body += svgText(['ATTRIBUTE'], 76, y + 40, 'font-weight="600"');
    body += svgText(['TYPE'], 860, y + 40, 'font-weight="600"');
    body += svgText(['NULL'], 1470, y + 40, 'font-weight="600"');
    y += 66;
    const fkNames = new Set((table.foreignKeys || []).flatMap(fk => fk.columns));
    for (const column of table.columns) {
      const lines = wrap(column.name, 48), typeLines = wrap(column.type, 37);
      const height = Math.max(lines.length, typeLines.length) * 32 + 28;
      body += `<path d="M48 ${y}H1752" stroke="#d6ddda" stroke-width="1"/>`;
      body += svgText(lines, 76, y + 36, (table.primaryKey || []).includes(column.name) ? 'text-decoration="underline"' : '');
      if (showFk && fkNames.has(column.name)) body += svgText(['FK'], 790, y + 36, 'fill="#17665d"');
      body += svgText(typeLines, 860, y + 36);
      body += svgText([column.nullable ? 'Allowed' : 'Not allowed'], 1470, y + 36, 'font-family="Segoe UI, sans-serif"');
      y += height;
    }
    body = `<rect x="48" y="54" width="1704" height="${y-54}" fill="white" stroke="#202b29" stroke-width="5"/>` + body;
    body += svgText(['Underlined attributes form the primary key. FK marks foreign-key attributes.', 'This plate contains all attributes. Defaults, checks and relationship mappings are in the accompanying catalog.'], 48, y + 56, 'font-family="Segoe UI, sans-serif"');
    return svgFrame(width, y + 118, `Relational schema: ${keyOf(table)}`, body);
  }
  function connectedLayout(tables) {
    const domains = [...new Set(tables.map(t => t.group || t.schema))];
    const edges = relationships(tables);
    const crossCount = edges.filter(e => (e.child.group || e.child.schema) !== (e.parent.group || e.parent.schema)).length;
    const top = 190 + crossCount * 8;
    const nodes = [], groups = [];
    domains.forEach((name, groupIndex) => {
      const x = 220 + groupIndex * 1100;
      let y = top + 100;
      const domainTables = tables.filter(t => (t.group || t.schema) === name);
      // Put referenced relations first without changing the actual graph.
      domainTables.sort((a,b) => edges.filter(e=>keyOf(e.parent)===keyOf(b)).length - edges.filter(e=>keyOf(e.parent)===keyOf(a)).length || keyOf(a).localeCompare(keyOf(b)));
      for (const table of domainTables) {
        const keyNames = new Set([...(table.primaryKey || []), ...(table.foreignKeys || []).flatMap(fk => fk.columns)]);
        const columns = table.columns.filter(c => keyNames.has(c.name));
        const titleLines = wrap(keyOf(table), 37);
        const headerHeight = titleLines.length * 32 + 34;
        let height = headerHeight;
        const rows = columns.map(column => {
          const lines = wrap(column.name, 33), rowHeight = lines.length * 32 + 16;
          const row = {column, lines, y:y + height, height:rowHeight};
          height += rowHeight;
          return row;
        });
        height += 52;
        nodes.push({table, x, y, width:640, height, headerHeight, titleLines, rows, group:name, groupIndex});
        y += height + 82;
      }
      groups.push({name, x:x - 26, y:top, width:692, height:y - top - 44, count:domainTables.length});
    });
    const lookup = new Map(nodes.map(node => [keyOf(node.table),node]));
    const fromCounts = new Map(), toCounts = new Map(), internalCounts = new Map();
    let crossIndex = 0;
    const routed = edges.map((edge,index) => {
      const child=lookup.get(keyOf(edge.child)), parent=lookup.get(keyOf(edge.parent));
      const childRow=child.rows.find(r=>r.column.name===edge.fk.columns[0]);
      const parentRow=parent.rows.find(r=>r.column.name===edge.fk.targetColumns[0]);
      const sy=childRow ? childRow.y + childRow.height / 2 : child.y + child.headerHeight / 2;
      let ty=parentRow ? parentRow.y + parentRow.height / 2 : parent.y + parent.headerHeight / 2;
      const sx=child.x+child.width;
      let path;
      if (child.groupIndex===parent.groupIndex) {
        const lane=internalCounts.get(child.groupIndex)||0;
        internalCounts.set(child.groupIndex,lane+1);
        const via=sx+34+lane*7;
        if(child===parent && Math.abs(sy-ty)<20) ty=parent.y+parent.headerHeight/2;
        path=`M${sx} ${sy}H${via}V${ty}H${parent.x+parent.width}`;
      } else {
        const sourceLane=fromCounts.get(child.groupIndex)||0, targetLane=toCounts.get(parent.groupIndex)||0;
        fromCounts.set(child.groupIndex,sourceLane+1);toCounts.set(parent.groupIndex,targetLane+1);
        const sourceX=sx+240+sourceLane*3;
        const targetX=parent.x-34-targetLane*3;
        const viaY=166+crossIndex++*8;
        path=`M${sx} ${sy}H${sourceX}V${viaY}H${targetX}V${ty}H${parent.x}`;
      }
      return {...edge, id:`R${String(index+1).padStart(3,'0')}`, path};
    });
    return {nodes,groups,edges:routed,width:domains.length*1100+100,height:Math.max(top+240,...nodes.map(n=>n.y+n.height))+130};
  }
  function connectedSvg(tables, options = {}) {
    const layout=connectedLayout(tables), {showFk=true, domain='', focus=''}=options;
    const emphasized=edge => focus ? keyOf(edge.child)===focus || keyOf(edge.parent)===focus : !domain || (edge.child.group||edge.child.schema)===domain || (edge.parent.group||edge.parent.schema)===domain;
    const visibleNodes=new Set(focus ? layout.edges.filter(emphasized).flatMap(e=>[keyOf(e.child),keyOf(e.parent)]).concat(focus) : []);
    let body=svgText(['COMPLETE RELATIONAL DATA MODEL'],48,50,'font-family="Segoe UI, sans-serif" font-weight="600"');
    body+=svgText([`${tables.length} relations · ${layout.edges.length} foreign-key constraints · Primary and foreign-key attributes`, 'Arrow: referencing child → referenced parent. Open a relation for all attributes and column mappings.'],48,90,'font-family="Segoe UI, sans-serif"');
    for(const group of layout.groups) {
      body+=`<g data-domain="${esc(group.name)}"><rect x="${group.x}" y="${group.y}" width="${group.width}" height="${group.height}" fill="#f2f4f0" stroke="#d6ddda" stroke-width="2"/>`;
      body+=svgText(wrap(`${group.name} (${group.count})`,40),group.x+24,group.y+38,'font-family="Segoe UI, sans-serif" font-weight="600"');
      body+='</g>';
    }
    body+='<g class="rdm-edges" fill="none">';
    for(const edge of layout.edges) {
      const card=cardinalities(edge), active=emphasized(edge), title=`${edge.id}: ${edge.fk.name}. ${keyOf(edge.child)} (${edge.fk.columns.join(', ')}) → ${keyOf(edge.parent)} (${edge.fk.targetColumns.join(', ')}). Parent per child: ${card.parent}; child per parent: ${card.child}.`;
      body+=`<path data-rdm-edge="${esc(edge.id)}" data-child="${esc(keyOf(edge.child))}" data-parent="${esc(keyOf(edge.parent))}" d="${edge.path}" stroke="${active?'#17665d':'#aebbb6'}" stroke-width="${focus&&active?5:2.5}" opacity="${active?0.86:0.22}" marker-end="url(#rdm-arrow)" pointer-events="stroke"><title>${esc(title)}</title></path>`;
    }
    body+='</g>';
    for(const node of layout.nodes) {
      const table=node.table, id=keyOf(table), fks=new Set((table.foreignKeys||[]).flatMap(f=>f.columns));
      const active=focus ? visibleNodes.has(id) : !domain||node.group===domain;
      body+=`<a href="#table=${encodeURIComponent(id)}" aria-label="Open ${esc(id)}: ${table.columns.length} attributes" data-rdm-node="${esc(id)}" tabindex="0" opacity="${active?1:0.3}"><title>${esc(id)} · ${table.columns.length} total attributes. Open for the complete relation.</title><rect x="${node.x}" y="${node.y}" width="${node.width}" height="${node.height}" fill="${focus===id?'#e5efea':'white'}" stroke="#202b29" stroke-width="5"/>`;
      body+=svgText(node.titleLines,node.x+22,node.y+36,'font-weight="600"');
      body+=`<path d="M${node.x} ${node.y+node.headerHeight}h${node.width}" stroke="#202b29" stroke-width="3"/>`;
      for(const row of node.rows) {
        body+=svgText(row.lines,node.x+22,row.y+33,(table.primaryKey||[]).includes(row.column.name)?'text-decoration="underline"':'');
        if(showFk&&fks.has(row.column.name)) body+=svgText(['FK'],node.x+570,row.y+33,'font-family="Segoe UI, sans-serif" fill="#17665d"');
      }
      body+=svgText([`${table.columns.length} attributes · open relation`],node.x+22,node.y+node.height-18,'font-family="Segoe UI, sans-serif" fill="#677571"');
      body+='</a>';
    }
    body+=svgText(['Underlined = primary key. FK = foreign key. Each connector is one FK constraint (including composite keys).', 'Every relation and foreign key remains in the model when a domain or relation is highlighted. Full details follow in the catalog.'],48,layout.height-66,'font-family="Segoe UI, sans-serif"');
    return svgFrame(layout.width,layout.height,'Complete connected relational data model',`<defs><marker id="rdm-arrow" viewBox="0 0 12 12" refX="11" refY="6" markerWidth="9" markerHeight="9" orient="auto-start-reverse"><path d="M1 1L11 6L1 11" fill="none" stroke="#17665d" stroke-width="2"/></marker></defs>${body}`);
  }
  if (typeof module !== 'undefined' && module.exports) module.exports = {keyOf, wrap, relationships, cardinalities, relationshipSvg, tableSvg, connectedLayout, connectedSvg};
  if (typeof document === 'undefined') return;

  const $ = id => document.getElementById(id);
  const data = window.SCHEMA_DATA;
  if (!data || !Array.isArray(data.tables) || !data.tables.length) {
    $('content').innerHTML = '<h2>Schema catalog unavailable</h2><p>Keep <code>schema-data.js</code> in the same folder as this page, then reopen <code>index.html</code>. The catalog must be generated from the SQL schema.</p>';
    $('catalog-count').textContent = 'No schema loaded';
    $('print').disabled = true;
    return;
  }
  const tables = [...data.tables].sort((a,b) => keyOf(a).localeCompare(keyOf(b)));
  const groups = [...new Set(tables.map(t => t.group || t.schema))];
  const allEdges = relationships(tables);
  let selected = null, edgePage = 0, edgeDirection = 'all', zoom = 0.65, fit = true;
  let connectedMode=false, academicMode=false, graphZoom=1, graphFit=true, graphDomain='', graphFocus='', academicErdZoom=1, academicErdFit=true;
  const PAGE_SIZE = 6;
  const nf = new Intl.NumberFormat();
  const href = table => `#table=${encodeURIComponent(keyOf(table))}`;
  const announce = message => {$('announcement').textContent = message;};
  const showFk = () => $('show-fk').checked;
  const fkColumns = table => new Set((table.foreignKeys || []).flatMap(fk => fk.columns));
  const notation = table => {
    const fks = fkColumns(table);
    return `<span>${esc(keyOf(table))}</span> (${table.columns.map(c => `<span class="${(table.primaryKey || []).includes(c.name) ? 'key' : ''}">${esc(c.name)}</span>${fks.has(c.name) ? '<span class="fk-marker">FK</span>' : ''}`).join(', ')})`;
  };
  function download(name, text, type) {
    const url = URL.createObjectURL(new Blob([text], {type}));
    const link = document.createElement('a');
    link.href = url; link.download = name; document.body.append(link); link.click(); link.remove();
    setTimeout(() => URL.revokeObjectURL(url), 1000);
    announce(`${name} exported.`);
  }
  function renderIndex() {
    const query = $('search').value.trim().toLowerCase(), group = $('domain').value;
    const matches = tables.filter(t => (!group || (t.group || t.schema) === group) && (!query || `${keyOf(t)} ${t.comment || ''} ${t.columns.map(c => c.name).join(' ')}`.toLowerCase().includes(query)));
    $('search-count').textContent = `${nf.format(matches.length)} of ${nf.format(tables.length)} tables`;
    $('table-index').innerHTML = groups.map(g => {
      const items = matches.filter(t => (t.group || t.schema) === g);
      return items.length ? `<section class="nav-group"><h2>${esc(g)}</h2>${items.map(t => `<a href="${href(t)}"${selected && keyOf(t) === keyOf(selected) ? ' aria-current="page"' : ''} translate="no">${esc(t.schema)}.<wbr>${esc(t.name)}</a>`).join('')}</section>` : '';
    }).join('') || '<p class="empty">No matches. Try a shorter name or select all domains.</p>';
  }
  function overview() {
    $('content').innerHTML = `<section class="intro"><p class="breadcrumb">Complete schema / ${nf.format(groups.length)} domains</p><h2>Tables and their relationships</h2><p>${esc(data.title || 'Disaster situation management system')}</p><p class="quiet">Select a table to inspect every attribute, its constraints and its direct relationships. Relationship plates show one foreign key at a time, so column mappings remain readable.</p></section>
      <div class="connected-entry"><div><h3>Connected RDM</h3><p>All ${tables.length} relations and ${allEdges.length} foreign keys in one connected, zoomable model.</p></div><a class="button-link" href="#view=connected">Open connected RDM</a></div>
      <div class="overview-grid">${groups.map(group => {const items=tables.filter(t=>(t.group||t.schema)===group);return `<section class="domain-card"><header><h3>${esc(group)}</h3><span class="quiet">${items.length} tables</span></header><ul class="table-links">${items.map(t=>`<li><a href="${href(t)}" translate="no">${esc(keyOf(t))}</a></li>`).join('')}</ul></section>`;}).join('')}</div>
      <section class="section reference-data"><h3>Controlled values and database views</h3><p class="quiet">These definitions are read from the same SQL catalog as the tables.</p>${(data.enums || []).map(e=>`<details><summary><code>${esc(e.name)}</code> · controlled values</summary><div class="enum-values">${(e.values||[]).map(v=>`<code>${esc(v)}</code>`).join('')}</div></details>`).join('')}${(data.views || []).map(v=>`<details><summary><code>${esc(v.name)}</code> · view</summary><pre>${esc(v.definition)}</pre></details>`).join('') || '<p>No enum or view definitions in this catalog.</p>'}</section>
      <section class="print-catalog"><h2>Relational schema catalog</h2>${tables.map(t=>`<article><h3>${esc(keyOf(t))}</h3><p>${esc(t.comment || '')}</p><div class="notation">${notation(t)}</div>${(t.foreignKeys||[]).length ? `<p>${t.foreignKeys.map(f=>`FOREIGN KEY (${esc(f.columns.join(', '))}) → ${esc(`${f.targetSchema}.${f.targetTable}`)} (${esc(f.targetColumns.join(', '))})`).join('<br>')}</p>`:''}</article>`).join('')}</section>`;
  }
  function academicErdView() {
    academicErdFit=true;academicErdZoom=1;
    $('content').innerHTML = `<p class="breadcrumb"><a href="#">Schema</a> / ERD image &amp; audit</p><section class="academic-erd-intro"><h2>Legacy ERD</h2><p>This is the single raster ERD supplied in <code>diagrams_final/capstone - ERD.png</code>. The current SQL-backed RDM is a separate, newer model; the two should not be read as one schema.</p><p><a href="#view=connected">Open the current RDM</a> to inspect implementation tables, every stored attribute, keys, data types, nullability, and declared relationships.</p><a class="erd-original" href="../../diagram_revision/diagrams_final/capstone%20-%20ERD.png" download>Download original PNG · 27,371 × 16,331</a><p class="quiet">The canvas uses a display-optimized copy of the supplied image. Zoom, pan, fullscreen, keyboard arrows, and area shortcuts make the full-resolution detail easier to inspect.</p></section>
      <section id="academic-erd-workspace" class="academic-erd-workspace" aria-label="Legacy ERD image viewer"><div class="academic-erd-controls"><div class="erd-zoom-controls" aria-label="Zoom controls"><button id="erd-out" type="button" aria-label="Zoom ERD out">−</button><output id="erd-zoom" aria-live="polite">Fit</output><button id="erd-in" type="button" aria-label="Zoom ERD in">+</button><button id="erd-fit" type="button">Fit to view</button><button id="erd-actual" type="button">100% / viewer image</button><button id="erd-fullscreen" type="button" aria-pressed="false">Enter fullscreen</button></div><div class="erd-pan-wrap"><label class="erd-pan-label" for="erd-area">Jump to area</label><select id="erd-area" aria-label="Jump to an ERD area"><option value="overview">Overview</option><option value="sitrep">Situation reports</option><option value="accounts">Accounts and hazards</option><option value="profiles">Profiles</option><option value="incidents">Incident reports</option></select><div class="erd-pan-controls" role="group" aria-label="Pan the ERD"><button id="erd-pan-up" class="pan-up" type="button" aria-label="Pan up"><svg viewBox="0 0 24 24" aria-hidden="true"><path d="M5 12h14m-6-6 6 6-6 6"/></svg></button><button id="erd-pan-left" class="pan-left" type="button" aria-label="Pan left"><svg viewBox="0 0 24 24" aria-hidden="true"><path d="M5 12h14m-6-6 6 6-6 6"/></svg></button><button id="erd-pan-down" class="pan-down" type="button" aria-label="Pan down"><svg viewBox="0 0 24 24" aria-hidden="true"><path d="M5 12h14m-6-6 6 6-6 6"/></svg></button><button id="erd-pan-right" class="pan-right" type="button" aria-label="Pan right"><svg viewBox="0 0 24 24" aria-hidden="true"><path d="M5 12h14m-6-6 6 6-6 6"/></svg></button></div></div></div><div id="academic-erd-canvas" class="academic-erd-canvas" tabindex="0" role="region" aria-label="Legacy ERD canvas. Scroll or use the arrow keys, area shortcuts, and pan controls to move around the diagram."><img id="academic-erd-image" src="academic-erd.png" alt="Legacy relational entity-relationship diagram supplied as capstone - ERD.png." draggable="false" decoding="async"></div></section>
      <section class="erd-audit section" aria-labelledby="erd-audit-heading"><div class="section-head"><div><h3 id="erd-audit-heading">Diagram audit</h3><p class="quiet">Findings recorded for the legacy ERD and RDM in the project’s diagram audit.</p></div><a href="../../diagram_revision/diagram_revision_audit.md">Open full audit notes</a></div><div class="table-wrap" tabindex="0" role="region" aria-label="Audit findings for the legacy ERD"><table class="attribute-table"><caption>Review findings for the legacy data model, based on the revised project scope.</caption><thead><tr><th scope="col">Area</th><th scope="col">Finding</th><th scope="col">Required review</th></tr></thead><tbody>
        <tr><th scope="row">Lifecycle</th><td>Reports and situation reports lack the revised scope’s version, status, verification, approval, source, and export lifecycle records.</td><td>Model immutable versions, review decisions, approvals, evidence, and released exports.</td></tr>
        <tr><th scope="row">Reporting hierarchy</th><td>Account subtypes represent Admin, Barangay, and Purok, while organizational units and user assignments are not separated.</td><td>Separate users, roles, jurisdiction units, and assignments; preserve Purok → Barangay → City reporting.</td></tr>
        <tr><th scope="row">Keys</th><td>Inherited PK/FK notation is inconsistent, and the Purok-to-Barangay reference is not explicit.</td><td>Show each PK, FK, cardinality, and matching identifier type.</td></tr>
        <tr><th scope="row">Data types</th><td>The audit identifies date/time values stored as VARCHAR and inconsistent identifier types.</td><td>Use date/time types and consistent referenced key types.</td></tr>
        <tr><th scope="row">Account data</th><td>Account_Name duplicates the first, middle, and last name fields without a synchronization rule.</td><td>Keep one representation or document the display-name rule.</td></tr>
        <tr><th scope="row">Affected population</th><td>The model uses a wide aggregate row without a clear incident, reporting-period, or version relationship.</td><td>Link reported effects to their incident and version, with scoped aggregate records.</td></tr>
        <tr><th scope="row">Model provenance</th><td>No editable source matching this PNG was found; available draw.io/DBML models describe different versions.</td><td>Do not treat those files as a transcription. A field-by-field reconstruction requires the matching source or validation of a manual transcription.</td></tr>
      </tbody></table></div></section>`;
    const canvas=$('academic-erd-canvas'), image=$('academic-erd-image'), workspace=$('academic-erd-workspace');
    const pan=(x,y)=>canvas.scrollBy({left:x,top:y,behavior:'auto'});
    const panStep=()=>Math.max(120,Math.round(Math.min(canvas.clientWidth,canvas.clientHeight)*.25));
    $('erd-area').addEventListener('change',()=>{
      if($('erd-area').value==='overview'){canvas.scrollTo({left:0,top:0,behavior:'smooth'});return;}
      const targets={sitrep:[.18,.48],accounts:[.5,.2],profiles:[.76,.55],incidents:[.68,.84]};
      const [x,y]=targets[$('erd-area').value]||[0,0];
      canvas.scrollTo({left:Math.max(0,image.naturalWidth*academicErdZoom*x-canvas.clientWidth/2),top:Math.max(0,image.naturalHeight*academicErdZoom*y-canvas.clientHeight/2),behavior:'smooth'});
    });
    const zoomBy=factor=>{const previousZoom=academicErdZoom;academicErdFit=false;academicErdZoom*=factor;sizeAcademicErd(previousZoom);};
    image.addEventListener('load',()=>sizeAcademicErd());
    $('erd-in').addEventListener('click',()=>zoomBy(1.25));
    $('erd-out').addEventListener('click',()=>zoomBy(1/1.25));
    $('erd-fit').addEventListener('click',()=>{academicErdFit=true;sizeAcademicErd();});
    $('erd-actual').addEventListener('click',()=>{const previousZoom=academicErdZoom;academicErdFit=false;academicErdZoom=1;sizeAcademicErd(previousZoom);});
    $('erd-fullscreen').addEventListener('click',()=>{
      if(document.fullscreenElement===workspace) document.exitFullscreen().catch(()=>announce('Could not exit fullscreen.'));
      else if(workspace.requestFullscreen) workspace.requestFullscreen().catch(()=>announce('Fullscreen is unavailable in this browser.'));
      else announce('Fullscreen is unavailable in this browser.');
    });
    [['erd-pan-up',0,-1],['erd-pan-down',0,1],['erd-pan-left',-1,0],['erd-pan-right',1,0]].forEach(([id,x,y])=>$(id).addEventListener('click',()=>pan(x*panStep(),y*panStep())));
    canvas.addEventListener('keydown',event=>{
      const step=panStep();
      const movement={ArrowUp:[0,-step],ArrowDown:[0,step],ArrowLeft:[-step,0],ArrowRight:[step,0],PageUp:[0,-canvas.clientHeight*.8],PageDown:[0,canvas.clientHeight*.8]};
      if(movement[event.key]){event.preventDefault();pan(...movement[event.key]);}
    });
    if(image.complete&&image.naturalWidth)sizeAcademicErd();
  }
  function sizeAcademicErd(previousZoom=academicErdZoom) {
    const canvas=$('academic-erd-canvas'), image=$('academic-erd-image');
    if(!canvas||!image?.naturalWidth)return;
    const centerX=canvas.scrollLeft+canvas.clientWidth/2, centerY=canvas.scrollTop+canvas.clientHeight/2;
    if(academicErdFit) academicErdZoom=Math.min(1,(canvas.clientWidth-24)/image.naturalWidth,(canvas.clientHeight-24)/image.naturalHeight);
    else academicErdZoom=Math.max(.02,Math.min(2,academicErdZoom));
    image.style.width=`${image.naturalWidth*academicErdZoom}px`;
    if(!academicErdFit&&previousZoom)canvas.scrollTo({left:Math.max(0,centerX*academicErdZoom/previousZoom-canvas.clientWidth/2),top:Math.max(0,centerY*academicErdZoom/previousZoom-canvas.clientHeight/2),behavior:'auto'});
    else canvas.scrollTo(0,0);
    $('erd-zoom').textContent=`${Math.round(academicErdZoom*100)}%`;
  }
  function syncAcademicFullscreen() {
    const workspace=$('academic-erd-workspace'), button=$('erd-fullscreen');
    if(!workspace||!button)return;
    const active=document.fullscreenElement===workspace;
    button.textContent=active?'Exit fullscreen':'Enter fullscreen';
    button.setAttribute('aria-pressed',String(active));
    if(academicErdFit)sizeAcademicErd();
  }
  function connectedView() {
    $('content').innerHTML=`<p class="breadcrumb"><a href="#">Schema</a> / Connected RDM</p><div class="section-head"><div><h2>Complete connected RDM</h2><p class="quiet">${tables.length} relations · ${allEdges.length} foreign keys · ${groups.length} domains</p></div><div class="actions"><button id="export-connected" type="button">Export complete RDM SVG</button></div></div><p class="intro">Each relation appears once. Connectors represent the actual foreign-key constraints. Boxes show primary and foreign-key attributes; select a box to inspect every attribute. Use the focus controls to follow a domain or relation without removing the surrounding model.</p>
      <div class="graph-toolbar"><div><label for="graph-domain">Highlight domain</label><select id="graph-domain"><option value="">All domains</option>${groups.map(g=>`<option value="${esc(g)}">${esc(g)}</option>`).join('')}</select></div><div><label for="graph-focus">Focus relation and its connections</label><select id="graph-focus"><option value="">All relations</option>${tables.map(t=>`<option value="${esc(keyOf(t))}">${esc(keyOf(t))}</option>`).join('')}</select></div></div>
      <div class="diagram-controls"><button id="graph-out" type="button" aria-label="Zoom connected model out">−</button><output id="graph-zoom" aria-live="polite"></output><button id="graph-in" type="button" aria-label="Zoom connected model in">+</button><button id="graph-fit" type="button">Fit complete model</button><button id="graph-actual" type="button">100% / 24 px text</button><button id="graph-center" type="button">Center highlighted area</button><span id="graph-count" class="quiet" role="status"></span></div>
      <div id="connected-canvas" class="diagram-viewport connected-canvas" tabindex="0" role="region" aria-label="Complete connected RDM. Use arrow keys to pan and zoom buttons to enlarge. Table links also appear below."></div>
      <div class="legend"><p><strong>Read the model:</strong> an arrow points from the child containing the FK to its referenced parent. Underlined attributes form the primary key; FK marks foreign-key attributes. One connector represents one whole constraint, including composite keys.</p><p>Choosing a domain or relation zooms and centers its connected area. The full diagram stays present, so pan out to inspect surrounding or cross-domain links; <strong>Fit complete model</strong> returns to the overview. Hover over a connector for its constraint name, column mapping and multiplicity. The text list below provides the same information without using the canvas.</p><p>The SVG export always includes the complete model, with 24 px text and 5 px relation outlines. Use the individual table view for all attributes, data types, nullability and constraints.</p></div>
      <section class="section"><h3>Accessible relation index</h3><p class="quiet">The same ${tables.length} relations shown on the canvas. Every link opens its complete schema.</p><div class="graph-relation-index">${groups.map(g=>`<details><summary>${esc(g)} · ${tables.filter(t=>(t.group||t.schema)===g).length} relations</summary><ul class="table-links">${tables.filter(t=>(t.group||t.schema)===g).map(t=>`<li><a href="${href(t)}"><code>${esc(keyOf(t))}</code></a></li>`).join('')}</ul></details>`).join('')}</div></section><section class="section"><details><summary>All ${allEdges.length} foreign-key mappings and multiplicities</summary><div class="relationship-list section">${allEdges.map(relationshipItem).join('')}</div></details></section>`;
    $('graph-domain').value=graphDomain;$('graph-focus').value=graphFocus;
    $('graph-domain').addEventListener('change',()=>{graphDomain=$('graph-domain').value;graphFocus='';$('graph-focus').value='';renderConnected();if(graphDomain)fitConnectedHighlight();else fitCompleteConnected();});
    $('graph-focus').addEventListener('change',()=>{graphFocus=$('graph-focus').value;if(graphFocus){graphDomain='';$('graph-domain').value='';}renderConnected();if(graphFocus||graphDomain)fitConnectedHighlight();else fitCompleteConnected();});
    $('graph-in').addEventListener('click',()=>{graphFit=false;graphZoom=Math.min(2,graphZoom*1.35);sizeConnected();});
    $('graph-out').addEventListener('click',()=>{graphFit=false;graphZoom=Math.max(.025,graphZoom/1.35);sizeConnected();});
    $('graph-fit').addEventListener('click',fitCompleteConnected);
    $('graph-actual').addEventListener('click',()=>{graphFit=false;graphZoom=1;sizeConnected();centerConnected();});
    $('graph-center').addEventListener('click',centerConnected);
    $('export-connected').addEventListener('click',()=>download('complete-relational-data-model.svg',connectedSvg(tables,{showFk:showFk()}),'image/svg+xml'));
    renderConnected();
  }
  function renderConnected() {
    if(!$('connected-canvas'))return;
    $('connected-canvas').innerHTML=connectedSvg(tables,{showFk:showFk(),domain:graphDomain,focus:graphFocus});
    $('graph-count').textContent=`${tables.length} relations and ${allEdges.length} FK connectors retained`;
    sizeConnected();
  }
  function sizeConnected() {
    const viewport=$('connected-canvas'), svg=viewport?.querySelector('svg');
    if(!svg)return;
    const width=Number(svg.getAttribute('width')),height=Number(svg.getAttribute('height'));
    if(graphFit)graphZoom=Math.min(1,Math.max(.01,Math.min((viewport.clientWidth-2)/width,(viewport.clientHeight-2)/height)));
    svg.style.width=`${width*graphZoom}px`;svg.style.height=`${height*graphZoom}px`;
    $('graph-zoom').textContent=`${Math.round(graphZoom*1000)/10}%`;
  }
  function fitCompleteConnected() {
    graphDomain='';graphFocus='';graphFit=true;
    if($('graph-domain'))$('graph-domain').value='';
    if($('graph-focus'))$('graph-focus').value='';
    sizeConnected();$('connected-canvas')?.scrollTo(0,0);
  }
  function connectedHighlightBounds(layout) {
    const seeds=new Set();
    if(graphFocus)seeds.add(graphFocus);
    else if(graphDomain)layout.nodes.filter(n=>n.group===graphDomain).forEach(n=>seeds.add(keyOf(n.table)));
    const included=new Set(seeds);
    for(const edge of layout.edges) {
      const child=keyOf(edge.child),parent=keyOf(edge.parent);
      if(seeds.has(child))included.add(parent);
      if(seeds.has(parent))included.add(child);
    }
    const nodes=layout.nodes.filter(n=>included.has(keyOf(n.table)));
    if(!nodes.length)return null;
    const left=Math.min(...nodes.map(n=>n.x)),top=Math.min(...nodes.map(n=>n.y));
    const right=Math.max(...nodes.map(n=>n.x+n.width)),bottom=Math.max(...nodes.map(n=>n.y+n.height));
    return {left,top,width:right-left,height:bottom-top};
  }
  function fitConnectedHighlight() {
    const viewport=$('connected-canvas'),svg=viewport?.querySelector('svg');
    if(!svg)return;
    const bounds=connectedHighlightBounds(connectedLayout(tables));
    if(!bounds)return;
    graphFit=false;
    graphZoom=Math.max(.025,Math.min(2,(viewport.clientWidth-72)/bounds.width,(viewport.clientHeight-72)/bounds.height));
    sizeConnected();
    viewport.scrollTo({left:Math.max(0,(bounds.left+bounds.width/2)*graphZoom-viewport.clientWidth/2),top:Math.max(0,(bounds.top+bounds.height/2)*graphZoom-viewport.clientHeight/2),behavior:'auto'});
  }
  function centerConnected() {
    const layout=connectedLayout(tables),viewport=$('connected-canvas');
    const bounds=connectedHighlightBounds(layout);
    if(bounds&&viewport)viewport.scrollTo({left:Math.max(0,(bounds.left+bounds.width/2)*graphZoom-viewport.clientWidth/2),top:Math.max(0,(bounds.top+bounds.height/2)*graphZoom-viewport.clientHeight/2),behavior:'auto'});
  }
  function detail(table) {
    const edges = relationships(tables, keyOf(table)), fks = fkColumns(table);
    $('content').innerHTML = `<p class="breadcrumb"><a href="#">Schema</a> / ${esc(table.group || table.schema)}</p><h2 class="table-title" translate="no">${esc(keyOf(table))}</h2>${table.comment ? `<p class="comment">${esc(table.comment)}</p>`:''}
      <div class="table-meta"><span>${table.columns.length} attributes</span><span>${(table.foreignKeys||[]).length} outgoing foreign keys</span><span>${edges.filter(e=>keyOf(e.parent)===keyOf(table)).length} incoming foreign keys</span></div>
      <section aria-labelledby="notation-heading"><h3 id="notation-heading">Relational notation</h3><div class="notation" translate="no">${notation(table)}</div></section>
      <section class="section" aria-labelledby="attributes-heading"><div class="section-head"><h3 id="attributes-heading">Attributes</h3><div class="actions"><button id="export-table" type="button">Export table SVG</button></div></div><div class="table-wrap" tabindex="0" role="region" aria-label="Complete attribute table; scroll horizontally on small screens"><table class="attribute-table"><caption>Every stored attribute; underlined names form the primary key.</caption><thead><tr><th scope="col">Attribute</th><th scope="col">Data type</th><th scope="col">Nullable</th><th scope="col">Default / reference</th></tr></thead><tbody>${table.columns.map(c=>{const pk=(table.primaryKey||[]).includes(c.name);const refs=(table.foreignKeys||[]).filter(f=>f.columns.includes(c.name));return `<tr${pk?' class="pk-row"':''}><th scope="row"><code class="${pk?'key':''}">${esc(c.name)}</code>${fks.has(c.name)?'<span class="fk-marker">FK</span>':''}</th><td><code>${esc(c.type)}</code></td><td>${c.nullable?'Yes':'No'}</td><td>${c.default != null ? `<code>${esc(c.default)}</code>`:'<span class="quiet">No default</span>'}${refs.map(f=>`<div class="quiet">References <a href="#table=${encodeURIComponent(`${f.targetSchema}.${f.targetTable}`)}"><code>${esc(`${f.targetSchema}.${f.targetTable}`)}</code></a>.<code>${esc(f.targetColumns[f.columns.indexOf(c.name)])}</code></div>`).join('')}</td></tr>`;}).join('')}</tbody></table></div></section>
      <section class="section"><h3>Keys and constraints</h3><ul class="constraint-list"><li>Primary key: <code>${esc((table.primaryKey||[]).join(', ') || 'None declared')}</code></li>${(table.uniqueKeys||[]).map(k=>`<li>UQ: <code>(${esc(k.join(', '))})</code></li>`).join('')}${(table.checks||[]).map(c=>`<li>Check: <code>${esc(typeof c==='string'?c:c.definition||JSON.stringify(c))}</code></li>`).join('')}</ul></section>
      <section class="section" aria-labelledby="relationships-heading"><div class="section-head"><h3 id="relationships-heading">Relationships</h3>${edges.length?'<div class="actions"><button id="export-relations" type="button">Export all related keys SVG</button></div>':''}</div>
      ${edges.length?`<p class="quiet">Each plate connects the foreign-key attributes of a child table to the referenced attributes of its parent. All ${edges.length} relationships are listed below.</p><div class="diagram-screen"><div class="diagram-controls"><label for="edge-direction">Show</label><select id="edge-direction"><option value="all">All relationships</option><option value="outgoing">Outgoing references</option><option value="incoming">Incoming references</option></select><button id="previous-edges" type="button">Previous</button><span id="edge-page-label" class="quiet" role="status"></span><button id="next-edges" type="button">Next</button></div><div class="diagram-controls"><button id="zoom-out" type="button" aria-label="Zoom diagram out">−</button><output id="zoom-label" aria-live="polite"></output><button id="zoom-in" type="button" aria-label="Zoom diagram in">+</button><button id="fit-diagram" type="button">Fit width</button><button id="actual-size" type="button">100% / 24 px text</button></div><div id="diagram" class="diagram-viewport" tabindex="0" role="region" aria-label="Relationship diagram; use arrow keys to scroll"></div></div><div class="legend"><p><strong>Multiplicity:</strong> 1 = exactly one; 0..1 = optional one; 0..N = zero or more. The number beside a table states how many of its rows may relate to one row in the opposite table.</p><p>Foreign-key nullability determines whether a parent is optional. A unique key contained in the foreign key limits a parent to one child. Required child participation cannot be inferred from a foreign key alone. Composite mappings belong to a single constraint.</p></div><div class="relationship-list section">${edges.map(e=>relationshipItem(e)).join('')}</div>`:'<p class="empty">No declared foreign-key relationships reference this table.</p>'}</section>`;
    $('export-table').addEventListener('click',()=>download(`${keyOf(table)}-table.svg`,tableSvg(table,showFk()),'image/svg+xml'));
    if (edges.length) {
      $('export-relations').addEventListener('click',()=>download(`${keyOf(table)}-relationships.svg`,relationshipSvg(edges,keyOf(table),showFk()),'image/svg+xml'));
      $('edge-direction').value=edgeDirection;
      $('edge-direction').addEventListener('change',()=>{edgeDirection=$('edge-direction').value;edgePage=0;renderDiagram();});
      $('previous-edges').addEventListener('click',()=>{edgePage--;renderDiagram();});
      $('next-edges').addEventListener('click',()=>{edgePage++;renderDiagram();});
      $('zoom-in').addEventListener('click',()=>{fit=false;zoom=Math.min(1.5,zoom+.15);sizeDiagram();});
      $('zoom-out').addEventListener('click',()=>{fit=false;zoom=Math.max(.2,zoom-.15);sizeDiagram();});
      $('fit-diagram').addEventListener('click',()=>{fit=true;sizeDiagram();});
      $('actual-size').addEventListener('click',()=>{fit=false;zoom=1;sizeDiagram();});
      renderDiagram();
    }
  }
  function relationshipItem(edge) {
    const card=cardinalities(edge), {child,parent,fk}=edge;
    return `<article class="relationship-item"><h4>${esc(fk.name || 'Foreign key')}</h4><p><a href="${href(child)}"><code>${esc(keyOf(child))}</code></a> → <a href="${href(parent)}"><code>${esc(keyOf(parent))}</code></a></p><div class="mapping">${fk.columns.map((name,i)=>`<div>${esc(name)} → ${esc(fk.targetColumns[i])}</div>`).join('')}</div><div class="relationship-meta"><span>Parent rows per child: <strong>${card.parent}</strong></span><span>Child rows per parent: <strong>${card.child}</strong></span>${fk.onDelete?`<span>On delete: ${esc(fk.onDelete)}</span>`:''}${fk.onUpdate?`<span>On update: ${esc(fk.onUpdate)}</span>`:''}</div></article>`;
  }
  function renderDiagram() {
    if (!selected || !$('diagram')) return;
    const id=keyOf(selected);
    const edges=relationships(tables,id).filter(e=>edgeDirection==='all'||keyOf(edgeDirection==='outgoing'?e.child:e.parent)===id);
    const pages=Math.max(1,Math.ceil(edges.length/PAGE_SIZE));
    edgePage=Math.max(0,Math.min(edgePage,pages-1));
    const subset=edges.slice(edgePage*PAGE_SIZE,(edgePage+1)*PAGE_SIZE);
    $('diagram').innerHTML=subset.length?relationshipSvg(subset,id,showFk()):'<p class="empty">No relationships in this direction.</p>';
    $('edge-page-label').textContent=edges.length?`${edgePage*PAGE_SIZE+1}–${Math.min((edgePage+1)*PAGE_SIZE,edges.length)} of ${edges.length}`:'0 relationships';
    $('previous-edges').disabled=edgePage===0;
    $('next-edges').disabled=edgePage>=pages-1;
    sizeDiagram();
  }
  function sizeDiagram() {
    const viewport=$('diagram'), svg=viewport?.querySelector('svg');
    if (!svg) return;
    if(fit) zoom=Math.max(.15,Math.min(1,viewport.clientWidth/1800));
    svg.style.width=`${1800*zoom}px`;
    svg.style.height=`${Number(svg.getAttribute('height'))*zoom}px`;
    $('zoom-label').textContent=`${Math.round(zoom*100)}%`;
  }
  function route() {
    const params=new URLSearchParams(location.hash.slice(1));
    const id=params.get('table');
    connectedMode=params.get('view')==='connected'&&!id;
    academicMode=params.get('view')==='erd'&&!id;
    document.body.classList.toggle('academic-erd-mode',academicMode);
    selected=tables.find(t=>keyOf(t)===id)||null;
    edgePage=0;edgeDirection='all';
    if(selected) detail(selected); else if(academicMode)academicErdView();else if(connectedMode)connectedView();else overview();
    [$('overview-nav'),$('connected-nav'),$('academic-nav')].forEach(link=>link.removeAttribute('aria-current'));
    if(academicMode)$('academic-nav').setAttribute('aria-current','page');
    else if(connectedMode)$('connected-nav').setAttribute('aria-current','page');
    else if(!selected)$('overview-nav').setAttribute('aria-current','page');
    renderIndex();
    document.title=selected?`${keyOf(selected)} · Relational data model`:academicMode?'Legacy ERD image and audit · Schema documentation':connectedMode?'Connected RDM · Complete schema':'Relational data model · Schema overview';
    if(id&&!selected) announce('The requested table was not found. Showing the complete catalog.');
    else announce(selected?`Showing ${keyOf(selected)}.`:academicMode?'Showing the legacy ERD image and diagram audit.':connectedMode?`Showing all ${tables.length} relations and ${allEdges.length} connections.`:'Showing all schema domains.');
  }
  $('domain').innerHTML+=[...groups].sort().map(g=>`<option value="${esc(g)}">${esc(g)}</option>`).join('');
  $('catalog-count').textContent=`${nf.format(tables.length)} tables · ${nf.format(allEdges.length)} foreign keys`;
  if(data.sqlFile) $('sql-link').setAttribute('href',data.sqlFile);
  const generated=new Date(data.generatedAt);
  $('provenance').textContent=`Catalog generated from the SQL schema${Number.isNaN(generated.getTime())?'':` on ${new Intl.DateTimeFormat(undefined,{dateStyle:'medium',timeStyle:'short'}).format(generated)}`}. Additional validation implemented by triggers and application permissions is documented in the SQL file.`;
  $('search').addEventListener('input',renderIndex);
  $('domain').addEventListener('change',renderIndex);
  $('show-fk').addEventListener('change',()=>{document.body.classList.toggle('hide-fk',!showFk());renderDiagram();if(connectedMode)renderConnected();});
  $('print').addEventListener('click',()=>window.print());
  window.addEventListener('hashchange',()=>{
    route();
    $('main').focus({preventScroll:true});
    $('main').scrollIntoView({block:'start'});
  });
  window.addEventListener('resize',()=>{if(fit)sizeDiagram();if(graphFit)sizeConnected();if(academicMode&&academicErdFit)sizeAcademicErd();});
  document.addEventListener('fullscreenchange',syncAcademicFullscreen);
  route();
})();
