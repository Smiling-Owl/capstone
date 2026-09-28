import { createWorkbenchApi } from './workbench-api.mjs';

const config = window.WORKBENCH_CONFIG || {};
const sessionKey = 'schema-workbench-session';
const versionKey = 'schema-workbench-version';
let api, membership, currentVersion, currentSnapshot, selectedTarget, inviteSession, returnFocus, authReturnFocus;
const html = value => String(value ?? '').replace(/[&<>"']/g, char => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[char]));

function authScreen(message = '', setPassword = false, reloadOnSuccess = false, allowBrowsing = false) {
  authReturnFocus = document.querySelector('.auth-screen[role="dialog"]') ? authReturnFocus : document.activeElement;
  document.body.classList.add('auth-pending');
  document.querySelector('.auth-screen')?.remove();
  const screen = document.createElement('div');
  screen.className = 'auth-screen';
  screen.setAttribute('role', 'dialog'); screen.setAttribute('aria-modal', 'true'); screen.setAttribute('aria-labelledby', 'auth-title'); screen.tabIndex = -1;
  screen.innerHTML = `<form class="auth-form"><h1 id="auth-title">${setPassword ? 'Set your password' : 'Schema Workbench'}</h1><p>${setPassword ? 'Choose a password to finish accepting your panelist invitation.' : 'Sign in with an invitation, or use a panel code.'}</p>${setPassword ? '' : '<div class="auth-switch"><button type="button" id="auth-use-password" aria-pressed="true">Account sign in</button><button type="button" id="auth-use-code" aria-pressed="false">Use panel code</button></div><div id="auth-account-fields"><label for="auth-email">Email</label><input id="auth-email" name="email" type="email" autocomplete="username" required>'}<label for="auth-password">${setPassword ? 'New password' : 'Password'}</label><input id="auth-password" name="password" type="password" autocomplete="${setPassword ? 'new-password' : 'current-password'}" minlength="8" required>${setPassword ? '' : '</div><div id="auth-code-fields" hidden><label for="auth-display-name">Display name</label><input id="auth-display-name" name="displayName" maxlength="60" autocomplete="name" placeholder="Your name for comments" disabled><label for="auth-panel-code">Panel code</label><input id="auth-panel-code" name="panelCode" type="text" inputmode="text" autocomplete="one-time-code" autocapitalize="characters" spellcheck="false" placeholder="ABCD-EFGH-JKLM-NPQR" disabled><p class="auth-note">Your name is self-reported and shown as unverified to other reviewers.</p></div>'}<button type="submit">${setPassword ? 'Save password' : 'Sign in'}</button><div class="auth-error" role="alert">${html(message)}</div></form>`;
  document.body.append(screen);
  const form = screen.querySelector('form'), button = form.querySelector('[type=submit]'), alert = form.querySelector('[role=alert]');
  let guestMode = false;
  if (!setPassword) {
    const switchMode = guest => {
      guestMode = guest;
      form.querySelector('#auth-account-fields').hidden = guest;
      form.querySelector('#auth-code-fields').hidden = !guest;
      form.elements.email.required = !guest;
      form.elements.password.required = !guest;
      form.elements.displayName.disabled = !guest; form.elements.displayName.required = guest;
      form.elements.panelCode.disabled = !guest; form.elements.panelCode.required = guest;
      form.querySelector('#auth-use-password').setAttribute('aria-pressed', String(!guest));
      form.querySelector('#auth-use-code').setAttribute('aria-pressed', String(guest));
      button.textContent = guest ? 'Continue with panel code' : 'Sign in';
      (guest ? form.elements.displayName : form.elements.email).focus();
    };
    form.querySelector('#auth-use-password').addEventListener('click', () => switchMode(false));
    form.querySelector('#auth-use-code').addEventListener('click', () => switchMode(true));
  }
  const dismiss = () => {
    if (!allowBrowsing) return;
    screen.remove(); document.body.classList.remove('auth-pending');
    if (authReturnFocus?.isConnected) authReturnFocus.focus?.();
    authReturnFocus = null;
  };
  screen.addEventListener('keydown', event => {
    if (event.key === 'Escape' && allowBrowsing) { event.preventDefault(); dismiss(); return; }
    if (event.key !== 'Tab') return;
    const focusable = [...screen.querySelectorAll('a[href],button:not([disabled]),input:not([disabled]),select:not([disabled]),textarea:not([disabled]),[tabindex]:not([tabindex="-1"])')];
    if (!focusable.length) { event.preventDefault(); screen.focus(); return; }
    const first = focusable[0], last = focusable.at(-1), active = document.activeElement;
    if (event.shiftKey && (active === first || !screen.contains(active))) { event.preventDefault(); last.focus(); }
    else if (!event.shiftKey && (active === last || !screen.contains(active))) { event.preventDefault(); first.focus(); }
  });
  screen.querySelector('input')?.focus();
  if (allowBrowsing) {
    const browse = document.createElement('button'); browse.type = 'button'; browse.textContent = 'Continue browsing';
    browse.addEventListener('click', dismiss);
    form.append(browse);
  }
  form.addEventListener('submit', async event => {
    event.preventDefault(); button.disabled = true; button.textContent = 'Signing in…'; alert.textContent = '';
    try {
      let data;
      if (setPassword) {
        await api.updatePassword(form.elements.password.value);
        data = { ...api.session, user: await api.getUser() };
        api.setSession(data);
        history.replaceState(null, '', location.pathname + location.search);
      } else if (guestMode) {
        if (!api.session?.user?.is_anonymous) await api.signInAnonymously();
        await api.redeemPanelCode(form.elements.panelCode.value, form.elements.displayName.value);
        data = api.session;
      } else data = await api.signIn(form.elements.email.value.trim(), form.elements.password.value);
      sessionStorage.setItem(sessionKey, JSON.stringify(data));
      if ((reloadOnSuccess || guestMode) && !setPassword) location.reload();
      else await startApp();
    } catch (error) { alert.textContent = error.message; button.disabled = false; button.textContent = guestMode ? 'Continue with panel code' : 'Sign in'; }
  });
}

function emptyVersionsScreen() {
  document.body.classList.add('auth-pending');
  document.querySelector('.auth-screen')?.remove();
  const screen = document.createElement('main');
  screen.className = 'auth-screen';
  if (!membership) {
    screen.innerHTML = '<section class="auth-form"><h1>No schema published</h1><p>The owner has not published a schema version yet.</p><button type="button" id="public-sign-in">Sign in</button></section>';
    screen.querySelector('#public-sign-in').addEventListener('click', () => authScreen());
    document.body.append(screen);
    return;
  }
  if (membership.role !== 'owner') {
    screen.innerHTML = '<section class="auth-form"><h1>Schema not published yet</h1><p>The owner has not published a schema version. You can return after the owner publishes the first version.</p><button type="button" id="empty-sign-out">Sign out</button></section>';
    screen.querySelector('#empty-sign-out').addEventListener('click', () => { sessionStorage.removeItem(sessionKey); location.reload(); });
    document.body.append(screen);
    return;
  }
  screen.innerHTML = '<form class="auth-form" id="first-publish-form"><h1>Publish the first schema version</h1><p>Choose a schema snapshot JSON file and name this version to open the workbench.</p><label for="first-version-name">Version name</label><input id="first-version-name" name="name" maxlength="120" required placeholder="Initial review"><label for="first-snapshot-file">Schema snapshot</label><input id="first-snapshot-file" name="snapshot" type="file" accept="application/json,.json" required><button type="submit">Publish and open workbench</button><div class="auth-error" id="first-publish-status" role="status" aria-live="polite"></div><button type="button" id="first-publish-sign-out">Sign out</button></form>';
  document.body.append(screen);
  screen.querySelector('#first-publish-sign-out').addEventListener('click', () => { sessionStorage.removeItem(sessionKey); location.reload(); });
  const form = screen.querySelector('#first-publish-form'), button = form.querySelector('button[type="submit"]'), status = screen.querySelector('#first-publish-status');
  form.addEventListener('submit', async event => {
    event.preventDefault(); button.disabled = true; status.textContent = 'Publishing…';
    try {
      const file = form.elements.snapshot.files[0], snapshot = JSON.parse(await file.text());
      if (snapshot.format !== 1 || !Array.isArray(snapshot.targets) || !snapshot.erd || typeof snapshot.rdmDbml !== 'string' || !snapshot.postgres) throw new Error('The selected file is not a supported schema snapshot.');
      const id = await api.publish(form.elements.name.value.trim(), snapshot);
      sessionStorage.setItem(versionKey, id);
      await startApp();
    } catch (error) { status.textContent = error.message; button.disabled = false; }
  });
}

async function loadScript(src) {
  await new Promise((resolve, reject) => {
    const script = document.createElement('script'); script.src = src; script.onload = resolve;
    script.onerror = () => reject(new Error(`Could not load viewer module: ${src}`)); document.body.append(script);
  });
}

function targetFor(element) {
  const snapshot = currentSnapshot;
  const erdField = element.closest('.erd-field-name');
  if (erdField) {
    const card = erdField.closest('.erd-entity'), id = `${card?.dataset.entity}.${erdField.textContent.trim()}`;
    return { type: 'column', id, label: `${card?.dataset.entity} · ${erdField.textContent.trim()}`, element: erdField.closest('tr') };
  }
  const rdmField = element.closest('.table-card tr[data-attribute]');
  if (rdmField) {
    const table = rdmField.closest('.table-card')?.dataset.table, field = rdmField.dataset.attribute;
    return { type: 'column', id: `${table}.${field}`, label: `${table} · ${field}`, element: rdmField };
  }
  const pgField = element.closest('.pgd-column[data-column]');
  if (pgField) {
    const table = pgField.closest('.pgd-table')?.dataset.table.replace(/^public\./, ''), field = pgField.dataset.column;
    return { type: 'column', id: `${table}.${field}`, label: `${table} · ${field}`, element: pgField };
  }
  const erdEdge = element.closest('.erd-link[data-index],.erd-cardinality[data-index]');
  if (erdEdge) {
    const rel = snapshot.erd.relationships[Number(erdEdge.dataset.index)];
    return rel && { type: 'relationship', id: rel.id || `erd:${rel.from}:${rel.label}:${rel.to}`, label: `${rel.from} ${rel.label} ${rel.to}`, element: erdEdge };
  }
  const rdmEdge = element.closest('.edge[data-from-field]');
  if (rdmEdge) {
    const id = `fk:${rdmEdge.dataset.from}.${rdmEdge.dataset.fromField}->${rdmEdge.dataset.to}.${rdmEdge.dataset.toField}`;
    return { type: 'relationship', id, label: `${rdmEdge.dataset.from}.${rdmEdge.dataset.fromField} → ${rdmEdge.dataset.to}.${rdmEdge.dataset.toField}`, element: rdmEdge };
  }
  const pgEdge = element.closest('.pgd-edge[data-from]');
  if (pgEdge) {
    const from = pgEdge.dataset.from.replace(/^public\./, ''), to = pgEdge.dataset.to.replace(/^public\./, '');
    const candidates = snapshot.targets.filter(item => item.type === 'relationship' && item.id.startsWith(`fk:${from.split('.')[0]}.`) && item.id.includes(`->${to.split('.')[0]}.`));
    if (candidates.length === 1) return { ...candidates[0], label: candidates[0].id, element: pgEdge };
  }
  const erdTable = element.closest('.erd-entity[data-entity]');
  const rdmTable = element.closest('.table-card[data-table]');
  const pgTable = element.closest('.pgd-table[data-table]');
  const table = erdTable?.dataset.entity || rdmTable?.dataset.table || pgTable?.dataset.table.replace(/^public\./, '');
  if (table) return { type: 'table', id: table, label: table, element: erdTable || rdmTable || pgTable };
  return null;
}

function drawerMarkup() {
  const drawer = document.createElement('aside'); drawer.className = 'annotation-drawer'; drawer.id = 'annotation-drawer'; drawer.setAttribute('aria-hidden', 'true'); drawer.setAttribute('aria-label', 'Schema annotations'); drawer.inert = true;
  drawer.innerHTML = `<header class="annotation-head"><div><h2 id="annotation-title" tabindex="-1">Annotations</h2><p id="annotation-subtitle"></p></div><button type="button" id="annotation-close" aria-label="Close annotations">Close</button></header>${membership ? `<div class="annotation-thread-list" id="annotation-threads" aria-live="polite"></div><form class="annotation-compose" id="annotation-compose"><label for="annotation-content">Add a comment</label><textarea id="annotation-content" maxlength="8000" required></textarea><button type="submit">Comment</button><div class="cloud-status" id="annotation-status" role="status"></div>${membership.role === 'guest' ? '<p class="auth-note">Guest reviewer · self-reported name, unverified</p>' : ''}</form>` : '<div class="annotation-thread-list"><p class="annotation-empty">Sign in with an active workbench account or use a panel code to view and add annotations.</p><button type="button" id="annotation-sign-in">Sign in to annotate</button></div>'}`;
  document.body.append(drawer);
  drawer.querySelector('#annotation-close').addEventListener('click', closeDrawer);
  if (membership) drawer.querySelector('#annotation-compose').addEventListener('submit', submitRoot);
  else drawer.querySelector('#annotation-sign-in').addEventListener('click', () => authScreen('', false, true, true));
  return drawer;
}
let drawer;
function closeDrawer() { drawer.setAttribute('aria-hidden', 'true'); drawer.inert = true; document.querySelector('.annotation-target')?.classList.remove('annotation-target'); returnFocus?.focus?.(); }
function openDrawer(target) {
  if (!currentSnapshot.targets.some(item => item.type === target.type && item.id === target.id)) return;
  if (drawer.getAttribute('aria-hidden') === 'true') returnFocus = document.activeElement;
  selectedTarget = target; document.querySelector('.annotation-target')?.classList.remove('annotation-target'); target.element?.classList.add('annotation-target');
  drawer.querySelector('#annotation-title').textContent = 'Annotations'; drawer.querySelector('#annotation-subtitle').textContent = `${currentVersion.name} · ${target.type} · ${target.label}`;
  drawer.inert = false; drawer.setAttribute('aria-hidden', 'false'); drawer.querySelector('#annotation-close').focus(); if (membership) loadThreads();
}

const createdAt = value => new Date(value).toLocaleString();
function renderThreadList(rows) {
  const roots = rows.filter(item => item.parent_id === null);
  const replies = new Map();
  for (const row of rows.filter(item => item.parent_id !== null)) replies.set(row.thread_id, [...(replies.get(row.thread_id) || []), row]);
  const rootHtml = roots.map(root => {
    const author = root.author_label || `Reviewer ${root.author_id.slice(0, 8)}`;
    const statusAction = membership.role === 'owner' ? `<button type="button" data-status-id="${root.id}" data-status="${root.status === 'open' ? 'resolved' : 'open'}">${root.status === 'open' ? 'Resolve' : 'Reopen'}</button>` : '';
    const replyHtml = (replies.get(root.thread_id) || []).map(reply => `<div class="annotation-reply"><div class="annotation-meta">${html(reply.author_label || `Reviewer ${reply.author_id.slice(0, 8)}`)} · ${html(createdAt(reply.created_at))}</div><p>${html(reply.content)}</p></div>`).join('');
    return `<article class="annotation-thread"><div class="annotation-meta">${html(author)} · ${html(createdAt(root.created_at))} · ${html(root.status)}</div><p>${html(root.content)}</p>${statusAction}<form class="annotation-reply-form" data-thread="${root.thread_id}"><label class="visually-hidden" for="reply-${root.id}">Reply to comment</label><textarea id="reply-${root.id}" maxlength="8000" required placeholder="Write a reply"></textarea><button type="submit">Reply</button></form>${replyHtml}</article>`;
  }).join('');
  const list = drawer.querySelector('#annotation-threads');
  list.innerHTML = rootHtml || '<p class="annotation-empty">No comments on this item yet.</p>';
  list.querySelectorAll('.annotation-reply-form').forEach(form => form.addEventListener('submit', submitReply));
  list.querySelectorAll('[data-status-id]').forEach(button => button.addEventListener('click', async () => {
    button.disabled = true;
    try { const status = button.dataset.status; await api.updateAnnotation(button.dataset.statusId, { status }); await loadThreads(); }
    catch (error) { showAnnotationError(error.message); button.disabled = false; }
  }));
}
function showAnnotationError(message) { drawer.querySelector('#annotation-status').textContent = message; }
async function loadThreads() {
  const list = drawer.querySelector('#annotation-threads'); list.innerHTML = '<p class="annotation-empty">Loading comments…</p>'; showAnnotationError('');
  try { renderThreadList(await api.annotations(currentVersion.id, selectedTarget.type, selectedTarget.id)); }
  catch (error) { list.innerHTML = `<p class="annotation-error">${html(error.message)}</p>`; }
}
async function submitRoot(event) {
  event.preventDefault(); const form = event.currentTarget, content = form.elements['annotation-content'].value.trim(); if (!content) return;
  const button = form.querySelector('button'); button.disabled = true;
  try {
    await api.createAnnotation({ schema_version_id: currentVersion.id, target_type: selectedTarget.type, target_id: selectedTarget.id, parent_id: null, thread_id: null, content, author_id: api.session.user.id });
    form.reset(); await loadThreads();
  } catch (error) { showAnnotationError(error.message); } finally { button.disabled = false; }
}
async function submitReply(event) {
  event.preventDefault(); const form = event.currentTarget, content = form.querySelector('textarea').value.trim(); if (!content) return;
  const button = form.querySelector('button'); button.disabled = true;
  try {
    const rows = await api.annotations(currentVersion.id, selectedTarget.type, selectedTarget.id);
    const root = rows.find(row => row.thread_id === form.dataset.thread && row.parent_id === null);
    if (!root) throw new Error('The annotation thread is no longer available.');
    await api.createAnnotation({ schema_version_id: currentVersion.id, target_type: selectedTarget.type, target_id: selectedTarget.id, parent_id: root.id, thread_id: root.thread_id, content, author_id: api.session.user.id });
    await loadThreads();
  } catch (error) { showAnnotationError(error.message); } finally { button.disabled = false; }
}

function addCloudBar(versions) {
  const bar = document.createElement('div'); bar.className = 'cloud-bar'; bar.innerHTML = `<label for="schema-version">Version<select id="schema-version"></select></label><label for="review-target">${membership ? 'Review an item' : 'Annotate an item'}<select id="review-target"><option value="">Select table, attribute, or relationship…</option></select></label>${membership ? `<span class="cloud-user">${html(membership.email || `Guest · ${membership.displayName}`)} · ${html(membership.role)}</span>` : '<button type="button" class="cloud-sign-in" id="cloud-sign-in">Sign in to annotate</button>'}<div class="cloud-admin" hidden><label for="schema-snapshot-file">Publish snapshot<input id="schema-snapshot-file" type="file" accept="application/json,.json"></label><input id="schema-version-name" maxlength="120" placeholder="Version name" aria-label="New schema version name"><button id="schema-publish" type="button">Publish</button><section class="guest-code-controls" aria-label="Guest reviewer access"><button id="guest-code-generate" type="button">Generate panel code</button><button id="guest-code-revoke" type="button">Revoke panel code</button><div class="guest-code-reveal" id="guest-code-reveal" hidden><p>Share this code with panelists. It is shown once and expires in 24 hours.</p><code id="guest-code-value"></code><button id="guest-code-copy" type="button">Copy code</button><span id="guest-code-expiry"></span></div></section><label for="panelist-email">Panelist email<input id="panelist-email" type="email" placeholder="panelist@example.edu" autocomplete="email"></label><button id="panelist-invite" type="button">Invite</button><button id="panelist-resend" type="button">Resend invitation</button><button id="access-toggle" type="button" aria-expanded="false" aria-controls="member-list">Manage access</button><div class="member-list" id="member-list" role="region" aria-label="Panelist access" hidden></div></div><span class="cloud-status" id="cloud-status" role="status"></span>${membership ? '<button id="sign-out" type="button">Sign out</button>' : ''}`;
  document.querySelector('.topbar').append(bar);
  const select = bar.querySelector('#schema-version');
  for (const version of versions) { const option = document.createElement('option'); option.value = version.id; option.textContent = `${version.name} · ${createdAt(version.published_at)}`; select.append(option); }
  select.value = currentVersion.id;
  select.addEventListener('change', () => { sessionStorage.setItem(versionKey, select.value); location.reload(); });
  const targetSelect = bar.querySelector('#review-target');
  for (const target of currentSnapshot.targets) targetSelect.add(new Option(`${target.type} · ${target.id}`, `${target.type}:${target.id}`));
  targetSelect.addEventListener('change', () => { const value = targetSelect.value; if (!value) return; const split = value.indexOf(':'); openDrawer({ type: value.slice(0, split), id: value.slice(split + 1), label: value.slice(split + 1) }); targetSelect.value = ''; });
  const admin = bar.querySelector('.cloud-admin'); admin.hidden = membership?.role !== 'owner';
  if (membership) bar.querySelector('#sign-out').addEventListener('click', () => { sessionStorage.removeItem(sessionKey); sessionStorage.removeItem(versionKey); location.reload(); });
  else bar.querySelector('#cloud-sign-in').addEventListener('click', () => authScreen('', false, true, true));
  if (membership?.role === 'owner') {
    const status = bar.querySelector('#cloud-status'), reveal = bar.querySelector('#guest-code-reveal');
    bar.querySelector('#guest-code-generate').addEventListener('click', async event => {
      const button = event.currentTarget; button.disabled = true; reveal.hidden = true; bar.querySelector('#guest-code-value').textContent = ''; status.textContent = 'Generating code…';
      try {
        const result = await api.generatePanelCode();
        bar.querySelector('#guest-code-value').textContent = result.code;
        bar.querySelector('#guest-code-expiry').textContent = `Expires ${createdAt(result.expiresAt)}. Generate a new code to revoke this one.`;
        reveal.hidden = false; status.textContent = 'New panel code ready. Copy it now; it will not be shown again.';
      } catch (error) { status.textContent = error.message; }
      finally { button.disabled = false; }
    });
    bar.querySelector('#guest-code-revoke').addEventListener('click', async event => {
      const button = event.currentTarget; button.disabled = true;
      try { await api.revokePanelCode(); reveal.hidden = true; bar.querySelector('#guest-code-value').textContent = ''; status.textContent = 'Panel code revoked. Existing guest annotation access has ended.'; }
      catch (error) { status.textContent = error.message; }
      finally { button.disabled = false; }
    });
    bar.querySelector('#guest-code-copy').addEventListener('click', async () => {
      try { await navigator.clipboard.writeText(bar.querySelector('#guest-code-value').textContent); status.textContent = 'Panel code copied.'; }
      catch { status.textContent = 'Copy was unavailable. Select and copy the code manually.'; }
    });
  }
  bar.querySelector('#schema-publish').addEventListener('click', async () => {
    const status = bar.querySelector('#cloud-status'), file = bar.querySelector('#schema-snapshot-file').files[0], name = bar.querySelector('#schema-version-name').value.trim();
    if (!file || !name) { status.textContent = 'Choose a snapshot JSON file and enter a version name.'; return; }
    try {
      const snapshot = JSON.parse(await file.text());
      if (snapshot.format !== 1 || !Array.isArray(snapshot.targets) || !snapshot.erd || typeof snapshot.rdmDbml !== 'string' || !snapshot.postgres) throw new Error('The selected file is not a supported schema snapshot.');
      bar.querySelector('#schema-publish').disabled = true; status.textContent = 'Publishing…';
      const id = await api.publish(name, snapshot); sessionStorage.setItem(versionKey, id); location.reload();
    } catch (error) { status.textContent = error.message; } finally { bar.querySelector('#schema-publish').disabled = false; }
  });
  bar.querySelector('#panelist-invite').addEventListener('click', async () => {
    const status = bar.querySelector('#cloud-status'), email = bar.querySelector('#panelist-email').value.trim();
    try { status.textContent = 'Sending invitation…'; await api.invite(email, `${location.origin}/`); status.textContent = 'Invitation sent.'; }
    catch (error) { status.textContent = error.message; }
  });
  bar.querySelector('#panelist-resend').addEventListener('click', async () => {
    const status = bar.querySelector('#cloud-status'), email = bar.querySelector('#panelist-email').value.trim();
    try { status.textContent = 'Resending invitation…'; await api.resendInvite(email, `${location.origin}/`); status.textContent = 'Invitation resent.'; }
    catch (error) { status.textContent = error.message; }
  });
  const accessToggle = bar.querySelector('#access-toggle'), memberList = bar.querySelector('#member-list');
  accessToggle.addEventListener('click', async () => {
    const opening = memberList.hidden; memberList.hidden = !opening; accessToggle.setAttribute('aria-expanded', String(opening));
    if (!opening) return;
    memberList.textContent = 'Loading access…';
    try {
      const people = await api.memberships();
      memberList.innerHTML = people.map(person => `<div class="member-row"><span>${html(person.email)}<small>${html(person.role)} · ${person.active ? 'active' : 'revoked'}</small></span>${person.role === 'panelist' ? `<button type="button" data-access-action="${person.active ? 'revoke' : 'reactivate'}" data-user="${html(person.user_id)}">${person.active ? 'Revoke' : 'Reactivate'}</button>` : ''}</div>`).join('') || '<p>No panelist accounts.</p>';
      memberList.querySelectorAll('[data-access-action]').forEach(button => button.addEventListener('click', async () => {
        button.disabled = true; const status = bar.querySelector('#cloud-status');
        try { await api[button.dataset.accessAction](button.dataset.user); status.textContent = button.dataset.accessAction === 'revoke' ? 'Panelist access revoked.' : 'Panelist access restored.'; await accessToggle.click(); await accessToggle.click(); }
        catch (error) { status.textContent = error.message; button.disabled = false; }
      }));
    } catch (error) { memberList.textContent = error.message; }
  });
}

async function startViewer() {
  window.schemaWorkbenchSnapshot = currentSnapshot;
  window.erdSourceData = currentSnapshot.erd;
  window.POSTGRES_SCHEMA_SOURCE = currentSnapshot.postgres;
  window.schemaWorkbenchSelect = openDrawer;
  const source = document.createElement('script'); source.type = 'text/plain'; source.id = 'schema-source'; source.textContent = currentSnapshot.rdmDbml; document.body.append(source);
  await loadScript('./vendor/elkjs.bundled.js');
  await loadScript('./erd-viewer.js');
  await loadScript('./rdm-viewer.js');
  await loadScript('./postgres-schema-viewer.js');
  await loadScript('./vendor/dagre.min.js');
  await loadScript('./postgres-physical-schema.js');
  await loadScript('./postgres-diagram.js');
  await loadScript('./workbench-tabs.js');
  document.removeEventListener('click', onViewerClick, true);
  document.addEventListener('click', onViewerClick, true);
  document.addEventListener('keydown', onViewerKeydown, true);
}
function onViewerClick(event) { const target = targetFor(event.target); if (target) openDrawer(target); }
function onViewerKeydown(event) {
  if (event.key === 'Escape' && drawer?.getAttribute('aria-hidden') === 'false') { closeDrawer(); return; }
  if (event.key !== 'Enter' && event.key !== ' ') return;
  const target = targetFor(event.target); if (!target) return;
  if (event.key === ' ') event.preventDefault();
  if (event.target.closest('.erd-field-name')) event.stopPropagation();
  openDrawer(target);
}

async function startApp() {
  try {
    let session;
    try { session = JSON.parse(sessionStorage.getItem(sessionKey) || 'null'); } catch { session = null; }
    if (!session?.access_token && location.hash) {
      const fragment = new URLSearchParams(location.hash.slice(1));
      if (fragment.get('type') === 'invite' && fragment.get('access_token') && fragment.get('refresh_token')) {
        inviteSession = { access_token: fragment.get('access_token'), refresh_token: fragment.get('refresh_token'), expires_at: Math.floor(Date.now() / 1000) + Number(fragment.get('expires_in') || 3600) };
        api.setSession(inviteSession);
        try { await api.getUser(); authScreen('', true); return; }
        catch { authScreen('The invitation link is invalid or has expired. Ask the owner to send a new one.'); return; }
      }
    }
    if (session?.access_token) {
      api.setSession(session);
      try {
        if (session.expires_at && session.expires_at * 1000 < Date.now() + 30000) {
          session = await api.refresh(session.refresh_token); sessionStorage.setItem(sessionKey, JSON.stringify(session));
        }
        const member = await api.membership();
        if (member?.active && ['owner', 'panelist'].includes(member.role)) membership = member;
        else {
          const guest = await api.guestStatus();
          if (!guest.active) throw new Error('No active workbench membership or panel-code session.');
          membership = { role: 'guest', displayName: guest.displayName };
        }
      } catch {
        session = null; membership = null;
        sessionStorage.removeItem(sessionKey);
        api.setSession(null);
      }
    } else {
      api.setSession(null);
      membership = null;
    }
    const versions = await api.versions();
    if (!versions.length) { emptyVersionsScreen(); return; }
    const wanted = sessionStorage.getItem(versionKey);
    currentVersion = versions.find(version => version.id === wanted) || versions[0];
    currentSnapshot = (await api.snapshot(currentVersion.id)).snapshot;
    drawer = drawerMarkup(); addCloudBar(versions); await startViewer();
    document.body.classList.remove('auth-pending'); document.querySelector('.auth-screen')?.remove();
  } catch (error) { api?.signOut(); sessionStorage.removeItem(sessionKey); authScreen(error.message); }
}

try {
  api = createWorkbenchApi(config);
  api.onSessionChange(session => { if (session?.access_token) sessionStorage.setItem(sessionKey, JSON.stringify(session)); });
  startApp();
}
catch (error) { authScreen(error.message); }
