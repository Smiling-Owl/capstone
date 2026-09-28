(function () {
  const SQL_SOURCE_PATH = '../../development/supabase/migrations/202609080001_initial_domain_schema.sql';
  const SQL_SOURCE_NAME = '202609080001_initial_domain_schema.sql';
  const SQL_SOURCE_TEXT = window.POSTGRES_SCHEMA_SOURCE?.text;
  if (typeof SQL_SOURCE_TEXT !== 'string') throw new Error('PostgreSQL schema source snapshot did not load.');
  const toolbar = document.getElementById('postgres-toolbar');
  const panel = document.getElementById('postgres-panel');
  if (!toolbar || !panel) return;

  const root = document.createElement('section');
  root.className = 'pgsv-root';
  root.hidden = true;
  root.setAttribute('aria-label', 'PostgreSQL schema viewer');
  toolbar.classList.add('pgsv-toolbar');
  toolbar.setAttribute('aria-label', 'PostgreSQL schema controls');
  toolbar.innerHTML = `
    <label class="pgsv-search-label" for="pgsv-search">Find in schema</label>
    <div class="pgsv-search-group">
      <input id="pgsv-search" class="pgsv-search" type="search" autocomplete="off" spellcheck="false" placeholder="Search SQL…" aria-label="Search PostgreSQL schema">
      <button type="button" id="pgsv-previous" aria-label="Previous match" title="Previous match">↑</button>
      <button type="button" id="pgsv-next" aria-label="Next match" title="Next match">↓</button>
      <output class="pgsv-search-count" id="pgsv-search-count" aria-live="polite">No search</output>
    </div>
    <span class="pgsv-toolbar-spacer" aria-hidden="true"></span>
    <button type="button" id="pgsv-copy">Copy</button>
    <label class="pgsv-wrap-label"><input id="pgsv-wrap" type="checkbox"> Wrap</label>
    <a class="pgsv-download" href="${SQL_SOURCE_PATH}" download="${SQL_SOURCE_NAME}">Download source</a>
    <span class="pgsv-copy-status" id="pgsv-copy-status" role="status" aria-live="polite"></span>`;

  const lines = SQL_SOURCE_TEXT.split('\n');
  if (lines.at(-1) === '') lines.pop();
  const lineCount = lines.length;
  root.innerHTML = `
    <div class="pgsv-filebar">
      <span class="pgsv-file-name">${SQL_SOURCE_NAME}</span>
      <span class="pgsv-file-meta">${lineCount.toLocaleString()} lines · read-only</span>
      <a class="pgsv-source-link" href="${SQL_SOURCE_PATH}">Open source migration</a>
    </div>
    <div class="pgsv-editor" id="pgsv-editor" role="region" aria-label="PostgreSQL schema source" tabindex="0">
      <pre class="pgsv-code" id="pgsv-code" aria-label="SQL source with line numbers"></pre>
    </div>
    <div class="pgsv-source-credit">Source: <code>development/supabase/migrations/${SQL_SOURCE_NAME}</code> · PostgreSQL migration from this project.</div>`;
  panel.replaceChildren(root);

  const input = toolbar.querySelector('#pgsv-search');
  const count = toolbar.querySelector('#pgsv-search-count');
  const editor = root.querySelector('#pgsv-editor');
  const code = root.querySelector('#pgsv-code');
  const wrap = toolbar.querySelector('#pgsv-wrap');
  const copyStatus = toolbar.querySelector('#pgsv-copy-status');
  const searchableText = SQL_SOURCE_TEXT.toLowerCase();
  const lineStarts = [];
  let offset = 0;
  for (const line of lines) { lineStarts.push(offset); offset += line.length + 1; }

  const keywords = new Set(('all alter and any array as asc authorization begin between by case cast check collate column constraint create current_date current_time current_timestamp declare default delete desc distinct do drop else elsif end exception execute exists false fetch for foreign from grant group having if ilike in index insert into is language like limit loop not null offset on only or order owner perform primary procedure raise references return returning returns revoke role schema select sequence set table then to trigger true unique update using values view when where while with').split(' '));
  const types = new Set(('bigint bigserial boolean bytea char character date decimal double enum float int integer interval json jsonb numeric real serial smallint smallserial text time timestamp timestamptz uuid varchar void').split(' '));
  const state = { blockDepth: 0, dollar: '' };

  function classify(word) {
    const lower = word.toLowerCase();
    if (keywords.has(lower)) return 'keyword';
    if (types.has(lower)) return 'type';
    return '';
  }
  function tokensForLine(line) {
    const out = [];
    let i = 0;
    while (i < line.length) {
      const start = i;
      let kind = '';
      if (state.dollar && line.startsWith(state.dollar, i)) {
        i += state.dollar.length; state.dollar = ''; kind = 'string';
      } else if (state.blockDepth) {
        while (i < line.length) {
          if (line.startsWith('/*', i)) { state.blockDepth++; i += 2; }
          else if (line.startsWith('*/', i)) { state.blockDepth--; i += 2; if (!state.blockDepth) break; }
          else i++;
        }
        kind = 'comment';
      } else if (line.startsWith('--', i)) {
        i = line.length; kind = 'comment';
      } else if (line.startsWith('/*', i)) {
        state.blockDepth = 1; i += 2;
        while (i < line.length && state.blockDepth) {
          if (line.startsWith('/*', i)) { state.blockDepth++; i += 2; }
          else if (line.startsWith('*/', i)) { state.blockDepth--; i += 2; }
          else i++;
        }
        kind = 'comment';
      } else if (line[i] === "'") {
        i++;
        while (i < line.length) {
          if (line[i] === "'" && line[i + 1] === "'") i += 2;
          else if (line[i++] === "'") break;
        }
        kind = 'string';
      } else if (line[i] === '"') {
        i++;
        while (i < line.length) {
          if (line[i] === '"' && line[i + 1] === '"') i += 2;
          else if (line[i++] === '"') break;
        }
        kind = 'quoted';
      } else if (line[i] === '$') {
        const match = line.slice(i).match(/^\$[A-Za-z_0-9]*\$/);
        if (match) {
          if (!state.dollar) state.dollar = match[0];
          i += match[0].length;
          kind = 'string';
        } else i++;
      } else {
        const match = line.slice(i).match(/^[A-Za-z_][A-Za-z_0-9$]*|^\d+(?:\.\d+)?|^\s+|^./s);
        const token = match ? match[0] : line[i];
        i += token.length;
        kind = /^\d/.test(token) ? 'number' : /^[A-Za-z_]/.test(token) ? classify(token) : '';
        if (!kind && /^[A-Za-z_][A-Za-z_0-9$]*$/.test(token) && line.slice(i).match(/^\s*\(/)) kind = 'function';
        if (!kind && /^[=<>!:+*/%|-]+$/.test(token)) kind = 'operator';
      }
      out.push([start, i, kind]);
    }
    return out;
  }
  function escapeHTML(value) {
    return value.replace(/[&<>"']/g, char => ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[char]));
  }
  let matches = [];
  let activeMatch = -1;
  let rendered = false;
  const tokensByLine = [];
  let renderedMatchLines = new Set();
  function renderLine(line, tokens, ranges) {
    const parts = [];
    for (const [start, end, kind] of tokens) {
      let cursor = start;
      for (const match of ranges) {
        const a = Math.max(start, match.start);
        const b = Math.min(end, match.end);
        if (a >= b || b <= cursor) continue;
        if (a > cursor) parts.push(kind ? `<span class="pgsv-${kind}">${escapeHTML(line.slice(cursor, a))}</span>` : escapeHTML(line.slice(cursor, a)));
        const selected = match.index === activeMatch;
        const body = kind ? `<span class="pgsv-${kind}">${escapeHTML(line.slice(Math.max(cursor, a), b))}</span>` : escapeHTML(line.slice(Math.max(cursor, a), b));
        parts.push(`<mark class="pgsv-match${selected ? ' is-active' : ''}" data-match="${match.index}">${body}</mark>`);
        cursor = b;
      }
      if (cursor < end) parts.push(kind ? `<span class="pgsv-${kind}">${escapeHTML(line.slice(cursor, end))}</span>` : escapeHTML(line.slice(cursor, end)));
    }
    return parts.join('') || '\u00a0';
  }
  function lineIndexAt(position) {
    let low = 0, high = lineStarts.length - 1;
    while (low < high) { const mid = (low + high + 1) >> 1; if (lineStarts[mid] <= position) low = mid; else high = mid - 1; }
    return low;
  }
  function applyMatches() {
    if (!rendered) return;
    const grouped = new Map();
    for (const match of matches) {
      const first = lineIndexAt(match.start);
      const last = lineIndexAt(Math.max(match.start, match.end - 1));
      for (let index = first; index <= last; index++) {
        const start = Math.max(0, match.start - lineStarts[index]);
        const end = Math.min(lines[index].length, match.end - lineStarts[index]);
        if (start < end) {
          if (!grouped.has(index)) grouped.set(index, []);
          grouped.get(index).push({ start, end, index: match.index });
        }
      }
    }
    const affected = new Set([...renderedMatchLines, ...grouped.keys()]);
    for (const index of affected) {
      const content = code.querySelector(`#pgsv-line-${index + 1} .pgsv-line-content`);
      if (content) content.innerHTML = renderLine(lines[index], tokensByLine[index], grouped.get(index) || []);
    }
    renderedMatchLines = new Set(grouped.keys());
    const active = code.querySelector(`.pgsv-match[data-match="${activeMatch}"]`);
    active?.scrollIntoView({ block: 'center', inline: 'nearest' });
  }
  function renderCode() {
    state.blockDepth = 0; state.dollar = '';
    const html = lines.map((line, index) => {
      const tokens = tokensByLine[index] = tokensForLine(line);
      const rendered = renderLine(line, tokens, []);
      const result = `<span class="pgsv-line" id="pgsv-line-${index + 1}"><span class="pgsv-line-number" aria-hidden="true">${index + 1}</span><span class="pgsv-line-content">${rendered}</span></span>`;
      return result;
    }).join('');
    code.innerHTML = html;
    editor.classList.toggle('is-wrapped', wrap.checked);
  }
  function ensureRendered() {
    if (rendered) return;
    renderCode();
    rendered = true;
    applyMatches();
  }
  function updateSearch() {
    const query = input.value;
    matches = [];
    if (query) {
      const source = searchableText;
      const needle = query.toLowerCase();
      let index = 0;
      while ((index = source.indexOf(needle, index)) !== -1) {
        matches.push({ start: index, end: index + needle.length, index: matches.length });
        index += needle.length;
      }
    }
    activeMatch = matches.length ? Math.min(Math.max(activeMatch, 0), matches.length - 1) : -1;
    count.textContent = query ? `${matches.length.toLocaleString()} matches` : 'No search';
    applyMatches();
  }
  function moveMatch(direction) {
    if (!matches.length) return;
    code.querySelectorAll(`.pgsv-match[data-match="${activeMatch}"]`).forEach(node => node.classList.remove('is-active'));
    activeMatch = (activeMatch + direction + matches.length) % matches.length;
    const match = matches[activeMatch];
    const line = lineIndexAt(match.start);
    count.textContent = `${(activeMatch + 1).toLocaleString()} of ${matches.length.toLocaleString()} matches · line ${(line + 1).toLocaleString()}`;
    code.querySelectorAll(`.pgsv-match[data-match="${activeMatch}"]`).forEach(node => node.classList.add('is-active'));
    code.querySelector(`.pgsv-match[data-match="${activeMatch}"]`)?.scrollIntoView({ block: 'center', inline: 'nearest' });
  }
  async function copySource() {
    try {
      if (navigator.clipboard?.writeText) await navigator.clipboard.writeText(SQL_SOURCE_TEXT);
      else throw new Error('Clipboard API unavailable');
      copyStatus.textContent = 'Copied';
    } catch (_) {
      const temporary = document.createElement('textarea');
      temporary.value = SQL_SOURCE_TEXT; temporary.setAttribute('readonly', '');
      temporary.style.cssText = 'position:fixed;left:-9999px;top:0';
      document.body.append(temporary); temporary.select();
      const copied = document.execCommand('copy'); temporary.remove();
      copyStatus.textContent = copied ? 'Copied' : 'Copy unavailable';
    }
    window.setTimeout(() => { copyStatus.textContent = ''; }, 1800);
  }

  code.classList.add('pgsv-code-lines');
  input.addEventListener('input', () => { activeMatch = 0; updateSearch(); });
  toolbar.querySelector('#pgsv-previous').addEventListener('click', () => moveMatch(-1));
  toolbar.querySelector('#pgsv-next').addEventListener('click', () => moveMatch(1));
  toolbar.querySelector('#pgsv-copy').addEventListener('click', copySource);
  wrap.addEventListener('change', () => editor.classList.toggle('is-wrapped', wrap.checked));
  input.addEventListener('keydown', event => {
    if (event.key === 'Enter') { event.preventDefault(); moveMatch(event.shiftKey ? -1 : 1); }
    if (event.key === 'Escape') { input.value = ''; activeMatch = -1; updateSearch(); }
  });
  window.postgresSchemaViewer = {
    activate() { root.hidden = false; ensureRendered(); return root; },
    get sourcePath() { return SQL_SOURCE_PATH; },
    get sourceText() { return SQL_SOURCE_TEXT; },
    get lineCount() { return lines.length; }
  };
})();
