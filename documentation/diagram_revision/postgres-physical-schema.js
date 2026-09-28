(function (root, factory) {
  const api = factory();
  if (typeof module === 'object' && module.exports) module.exports = api;
  if (root) root.PostgresPhysicalModel = api;
})(typeof globalThis !== 'undefined' ? globalThis : this, function () {
  'use strict';

  function statements(sql) {
    const out = [];
    let start = 0, quote = '', dollar = '', block = 0, line = false;
    for (let i = 0; i < sql.length; i++) {
      const c = sql[i], n = sql[i + 1];
      if (line) { if (c === '\n') line = false; continue; }
      if (block) {
        if (c === '/' && n === '*') { block++; i++; }
        else if (c === '*' && n === '/') { block--; i++; }
        continue;
      }
      if (dollar) { if (sql.startsWith(dollar, i)) { i += dollar.length - 1; dollar = ''; } continue; }
      if (quote) {
        if (c === quote && n === quote) { i++; continue; }
        if (c === quote) quote = '';
        else if (c === '\\' && quote === "'") i++;
        continue;
      }
      if (c === '-' && n === '-') { line = true; i++; continue; }
      if (c === '/' && n === '*') { block = 1; i++; continue; }
      if (c === "'" || c === '"') { quote = c; continue; }
      if (c === '$') {
        const match = sql.slice(i).match(/^\$[A-Za-z_][\w]*\$|^\$\$/);
        if (match) { dollar = match[0]; i += dollar.length - 1; continue; }
      }
      if (c === ';') { const statement = stripLeadingComments(sql.slice(start, i).trim()); if (statement) out.push(statement); start = i + 1; }
    }
    const tail = stripLeadingComments(sql.slice(start).trim()); if (tail) out.push(tail);
    return out;
  }

  function stripLeadingComments(text) {
    let value = text;
    while (true) {
      const next = value.replace(/^\s+/, '');
      if (next.startsWith('--')) { const end = next.indexOf('\n'); value = end < 0 ? '' : next.slice(end + 1); }
      else if (next.startsWith('/*')) {
        let depth = 1, i = 2;
        for (; i < next.length && depth; i++) {
          if (next.startsWith('/*', i)) { depth++; i++; }
          else if (next.startsWith('*/', i)) { depth--; i++; }
        }
        value = next.slice(i);
      } else return next;
    }
  }

  function splitTopLevel(text, delimiter = ',') {
    const out = []; let start = 0, depth = 0, quote = '', dollar = '';
    for (let i = 0; i < text.length; i++) {
      const c = text[i], n = text[i + 1];
      if (dollar) { if (text.startsWith(dollar, i)) { i += dollar.length - 1; dollar = ''; } continue; }
      if (quote) { if (c === quote && n === quote) i++; else if (c === quote) quote = ''; else if (c === '\\' && quote === "'") i++; continue; }
      if (c === "'" || c === '"') { quote = c; continue; }
      if (c === '$') { const m = text.slice(i).match(/^\$[A-Za-z_][\w]*\$|^\$\$/); if (m) { dollar = m[0]; i += dollar.length - 1; continue; } }
      if (c === '(') depth++;
      else if (c === ')') depth--;
      else if (c === delimiter && depth === 0) { out.push(text.slice(start, i).trim()); start = i + 1; }
    }
    out.push(text.slice(start).trim()); return out.filter(Boolean);
  }

  function matchingParen(text, open) {
    let depth = 0, quote = '';
    for (let i = open; i < text.length; i++) {
      const c = text[i], n = text[i + 1];
      if (quote) { if (c === quote && n === quote) i++; else if (c === quote) quote = ''; continue; }
      if (c === "'" || c === '"') { quote = c; continue; }
      if (c === '(') depth++;
      if (c === ')' && --depth === 0) return i;
    }
    return -1;
  }

  function identifier(s) { return s.replace(/^\s+|\s+$/g, '').replace(/^"((?:[^"]|"")*)"$/, (_, x) => x.replace(/""/g, '"')); }
  function qualifiedName(s) {
    const pieces = s.trim().match(/(?:"(?:[^"]|"")*"|[\w$]+)(?:\s*\.\s*(?:"(?:[^"]|"")*"|[\w$]+))*/);
    return pieces ? pieces[0].split('.').map(identifier).join('.') : '';
  }
  function columnList(s) { return splitTopLevel(s).map(identifier); }
  function findClose(text, open) { return matchingParen(text, open); }

  function parse(sql) {
    const tables = new Map(), constraints = [], uniqueConstraints = [], uniqueIndexes = [];
    function addForeignKey(tableName, local, targetName, target, source) {
      if (!local.length || !target.length) return;
      constraints.push({ table: tableName, columns: local, targetTable: targetName, targetColumns: target, source });
    }
    const ddl = statements(sql);
    for (const statement of ddl) {
      let m = statement.match(/^\s*create\s+table\s+(?:if\s+not\s+exists\s+)?/i);
      if (m) {
        const name = qualifiedName(statement.slice(m[0].length));
        const nameEnd = statement.indexOf(name, m[0].length) + name.length;
        const open = statement.indexOf('(', nameEnd), close = findClose(statement, open);
        if (open < 0 || close < 0) continue;
        const table = { name, columns: [], primaryKey: [], uniqueConstraints: [] };
        tables.set(name, table);
        for (const part of splitTopLevel(statement.slice(open + 1, close))) {
          const body = part.replace(/^constraint\s+(?:"(?:[^"]|"")*"|[\w$]+)\s+/i, '');
          let match = body.match(/^primary\s+key\s*\(/i);
          if (match) { table.primaryKey.push(...columnList(body.slice(match[0].length, body.lastIndexOf(')')))); continue; }
          match = body.match(/^unique(?:\s+nulls\s+not\s+distinct)?\s*\(/i);
          if (match) { const cols = columnList(body.slice(match[0].length, body.lastIndexOf(')'))); table.uniqueConstraints.push(cols); uniqueConstraints.push({ table: name, columns: cols }); continue; }
          match = body.match(/^foreign\s+key\s*\(/i);
          if (match) {
            const localEnd = body.indexOf(')', match[0].length), refs = body.slice(localEnd + 1).match(/\breferences\s+([\w."$]+)\s*\(/i);
            if (refs) { const refOpen = body.indexOf('(', localEnd + 1 + refs[0].lastIndexOf('(') - refs[0].lastIndexOf('(')); const targetEnd = body.indexOf(')', refOpen); addForeignKey(name, columnList(body.slice(match[0].length, localEnd)), qualifiedName(refs[1]), columnList(body.slice(refOpen + 1, targetEnd)), 'table'); }
            continue;
          }
          if (/^(?:check\s*\(|exclude\b)/i.test(body)) continue;
          const colMatch = body.match(/^\s*("(?:[^"]|"")*"|[\w$]+)\s+([\s\S]*)$/);
          if (!colMatch) continue;
          const colName = identifier(colMatch[1]), rest = colMatch[2];
          const col = { name: colName, type: '', nullable: !/\bnot\s+null\b/i.test(rest), primaryKey: false, unique: false, default: '' };
          const constraintMatch = /\b(?:not\s+null|null|default|primary\s+key|references|unique|check|generated|collate|constraint)\b/i.exec(rest);
          col.type = (constraintMatch ? rest.slice(0, constraintMatch.index) : rest).trim();
          const d = rest.match(/\bdefault\s+([\s\S]*?)(?=\s+(?:not\s+null|null|primary\s+key|references|unique|check|generated|constraint)\b|$)/i);
          if (d) col.default = d[1].trim();
          if (/\bprimary\s+key\b/i.test(rest)) { col.primaryKey = true; col.nullable = false; table.primaryKey.push(colName); }
          if (/\bunique\b/i.test(rest)) { col.unique = true; table.uniqueConstraints.push([colName]); uniqueConstraints.push({ table: name, columns: [colName] }); }
          const ref = rest.match(/\breferences\s+([\w."$]+)\s*\(/i);
          if (ref) {
            const refOpen = rest.indexOf('(', ref.index + ref[0].lastIndexOf('('));
            const refEnd = rest.indexOf(')', refOpen);
            addForeignKey(name, [colName], qualifiedName(ref[1]), columnList(rest.slice(refOpen + 1, refEnd)), 'inline');
          }
          table.columns.push(col);
        }
        continue;
      }
      m = statement.match(/^\s*alter\s+table\s+(?:only\s+)?([\w."$]+)\s+add\s+(?:constraint\s+(?:"(?:[^"]|"")*"|[\w$]+)\s+)?foreign\s+key\s*\(/i);
      if (m) {
        const tableName = qualifiedName(m[1]), localOpen = statement.indexOf('(', m[0].length - 1), localEnd = statement.indexOf(')', localOpen);
        const refs = statement.slice(localEnd + 1).match(/\breferences\s+([\w."$]+)\s*\(/i);
        if (refs) {
          const refOpen = statement.indexOf('(', localEnd + 1 + refs.index + refs[0].lastIndexOf('('));
          addForeignKey(tableName, columnList(statement.slice(localOpen + 1, localEnd)), qualifiedName(refs[1]), columnList(statement.slice(refOpen + 1, statement.indexOf(')', refOpen))), 'alter');
        }
      }
      m = statement.match(/^\s*create\s+unique\s+index\s+(?:if\s+not\s+exists\s+)?("(?:[^"]|"")*"|[\w$]+)\s+on\s+([\w."$]+)\s*\(/i);
      if (m) {
        const open = statement.indexOf('(', m.index + m[0].length - 1), close = matchingParen(statement, open);
        if (open < 0 || close < 0) throw new Error(`Could not parse CREATE UNIQUE INDEX statement: ${statement.slice(0, 100).replace(/\s+/g, ' ')}`);
        const where = statement.slice(close + 1).match(/\bwhere\s+([\s\S]+)$/i);
        uniqueIndexes.push({ name: identifier(m[1]), table: qualifiedName(m[2]), expressions: splitTopLevel(statement.slice(open + 1, close)), where: where ? where[1].trim() : '' });
      }
    }
    const declaredTables = ddl.filter(s => /^create\s+table\b/i.test(s));
    for (const statement of declaredTables) {
      const match = statement.match(/^create\s+table\s+(?:if\s+not\s+exists\s+)?([\w."$]+)\s*\(/i);
      const name = match && qualifiedName(match[1]);
      if (!name || !tables.has(name)) throw new Error(`Could not parse CREATE TABLE statement: ${statement.slice(0, 100).replace(/\s+/g, ' ')}`);
    }
    const expectedForeignKeys = ddl.filter(s => /^create\s+table\b|^alter\s+table\b/i.test(s))
      .reduce((count, statement) => count + [...statement.matchAll(/\breferences\s+/gi)].length, 0);
    if (constraints.length !== expectedForeignKeys) throw new Error(`Parsed ${constraints.length} foreign keys; found ${expectedForeignKeys} REFERENCES clauses in table DDL.`);
    for (const fk of constraints) {
      const table = tables.get(fk.table);
      if (!table) continue;
      for (const colName of fk.columns) {
        const col = table.columns.find(c => c.name === colName);
        if (col) col.foreignKey = true;
      }
    }
    for (const table of tables.values()) for (const column of table.columns) {
      if (table.primaryKey.includes(column.name)) { column.primaryKey = true; column.nullable = false; }
    }
    for (const uq of uniqueConstraints) {
      const table = tables.get(uq.table);
      if (table && uq.columns.length === 1) {
        const col = table.columns.find(c => c.name === uq.columns[0]);
        if (col) col.unique = true;
      }
    }
    const externalTables = new Set();
    for (const fk of constraints) if (!tables.has(fk.targetTable)) externalTables.add(fk.targetTable);
    return { tables: [...tables.values()], foreignKeys: constraints, uniqueConstraints, uniqueIndexes, externalTables: [...externalTables].map(name => ({ name })) };
  }

  function overviewLayout(cards, columns = 4, gapX = 14, gapY = 10, margin = 24) {
    const positions = [];
    const rowHeights = [];
    const cellWidth = Math.max(0, ...cards.map(card => card.width || 228));
    for (let i = 0; i < cards.length; i++) {
      const row = Math.floor(i / columns), col = i % columns;
      rowHeights[row] = Math.max(rowHeights[row] || 0, cards[i].height);
      positions.push({ name: cards[i].name, x: margin + col * (cellWidth + gapX), y: 0 });
    }
    let y = margin, row = -1;
    for (let i = 0; i < positions.length; i++) {
      const currentRow = Math.floor(i / columns);
      if (currentRow !== row) { if (row >= 0) y += rowHeights[row] + gapY; row = currentRow; }
      positions[i].y = y;
    }
    const count = Math.min(columns, cards.length);
    const width = margin * 2 + count * cellWidth + Math.max(0, count - 1) * gapX;
    const height = positions.length ? positions[positions.length - 1].y + rowHeights[row] + margin : margin * 2;
    return { positions, bounds: { left: 0, top: 0, right: width, bottom: height, width, height } };
  }

  function bestOverviewLayout(cards, viewportWidth, viewportHeight, gapX = 12, gapY = 8, margin = 24) {
    let best = null;
    for (let columns = 1; columns <= cards.length; columns++) {
      const candidate = overviewLayout(cards, columns, gapX, gapY, margin);
      const zoom = Math.min(1, (viewportWidth - 2 * margin) / candidate.bounds.width, (viewportHeight - 2 * margin) / candidate.bounds.height);
      if (!best || zoom > best.zoom) best = { ...candidate, columns, zoom };
    }
    return best || { positions: [], bounds: { left: 0, top: 0, right: 0, bottom: 0, width: 0, height: 0 }, columns: 0, zoom: 1 };
  }

  function fitTransform(items, viewportWidth, viewportHeight, padding = 24) {
    const left = Math.min(...items.map(item => item.x));
    const top = Math.min(...items.map(item => item.y));
    const right = Math.max(...items.map(item => item.x + item.width));
    const bottom = Math.max(...items.map(item => item.y + item.height));
    const width = Math.max(1, right - left), height = Math.max(1, bottom - top);
    const zoom = Math.max(Number.EPSILON, Math.min(1, (viewportWidth - padding * 2) / width, (viewportHeight - padding * 2) / height));
    const pan = { x: (viewportWidth - width * zoom) / 2 - left * zoom, y: (viewportHeight - height * zoom) / 2 - top * zoom };
    return { zoom, pan, bounds: { left, top, right, bottom, width, height } };
  }

  return { parse, statements, splitTopLevel, overviewLayout, bestOverviewLayout, fitTransform };
});
