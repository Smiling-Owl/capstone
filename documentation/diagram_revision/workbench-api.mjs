export function createWorkbenchApi(config, fetchImpl = fetch) {
  if (!config?.url || !config?.anonKey) throw new Error('The workbench Supabase URL and anonymous key are not configured.');
  const base = config.url.replace(/\/$/, '');
  let session = null;
  let onSessionChange = () => {};
  let refreshing = null;
  const headers = extra => ({ apikey: config.anonKey, ...(session?.access_token ? { Authorization: `Bearer ${session.access_token}` } : {}), ...extra });
  const withExpiry = data => ({ ...data, expires_at: data.expires_at || Math.floor(Date.now() / 1000) + Number(data.expires_in || 3600) });
  function saveSession(data) { session = data; onSessionChange(data); return data; }
  function requireAnnotationSession() {
    if (!session?.access_token || !session?.user?.id) throw new Error('Sign in with an active workbench account to use annotations.');
  }
  async function refreshSession() {
    if (!refreshing) refreshing = request('/auth/v1/token?grant_type=refresh_token', {
      method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ refresh_token: session.refresh_token })
    }, false).then(data => saveSession(withExpiry(data))).finally(() => { refreshing = null; });
    return refreshing;
  }
  async function request(url, options = {}, mayRetry = true) {
    if (!url.startsWith('/auth/v1/token') && session?.refresh_token && session.expires_at * 1000 < Date.now() + 60_000) await refreshSession();
    const response = await fetchImpl(`${base}${url}`, { ...options, headers: headers(options.headers) });
    const body = response.status === 204 ? null : await response.json().catch(() => null);
    if (response.status === 401 && mayRetry && !url.startsWith('/auth/v1/token') && session?.refresh_token) {
      await refreshSession(); return request(url, options, false);
    }
    if (!response.ok) throw new Error(body?.msg || body?.message || body?.error_description || body?.error || `Request failed (${response.status}).`);
    return body;
  }
  return {
    get session() { return session; },
    setSession(value) { session = value; onSessionChange(value); },
    onSessionChange(callback) { onSessionChange = callback; },
    async refresh(refreshToken) {
      return saveSession(withExpiry(await request('/auth/v1/token?grant_type=refresh_token', {
        method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ refresh_token: refreshToken })
      }, false)));
    },
    async getUser() { return request('/auth/v1/user'); },
    async updatePassword(password) {
      return request('/auth/v1/user', { method: 'PUT', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ password }) });
    },
    async signIn(email, password) {
      return saveSession(withExpiry(await request('/auth/v1/token?grant_type=password', {
        method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ email, password })
      }, false)));
    },
    async signInAnonymously() {
      return saveSession(withExpiry(await request('/auth/v1/signup', {
        method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ data: {} })
      }, false)));
    },
    guestAccess(action, data = {}) {
      return request('/functions/v1/workbench-guest-access', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ action, ...data }) });
    },
    async redeemPanelCode(code, displayName) {
      return this.guestAccess('redeem', { code, displayName });
    },
    guestStatus() { return this.guestAccess('status'); },
    generatePanelCode() { return this.guestAccess('generate'); },
    revokePanelCode() { return this.guestAccess('revoke'); },
    signOut() { session = null; },
    async membership() {
      const rows = await request(`/rest/v1/workbench_memberships?select=user_id,email,role,active&user_id=eq.${encodeURIComponent(session.user.id)}&limit=1`);
      return rows?.[0] || null;
    },
    versions() { return request('/rest/v1/workbench_schema_versions?select=id,name,published_at&order=published_at.desc'); },
    async snapshot(id) {
      const rows = await request(`/rest/v1/workbench_schema_versions?select=id,name,published_at,snapshot&id=eq.${encodeURIComponent(id)}&limit=1`);
      if (!rows?.[0]) throw new Error('This schema version is unavailable.');
      return rows[0];
    },
    annotations(versionId, type, targetId) {
      requireAnnotationSession();
      const query = new URLSearchParams({ select: '*', schema_version_id: `eq.${versionId}`, target_type: `eq.${type}`, target_id: `eq.${targetId}`, order: 'created_at.asc' });
      return request(`/rest/v1/workbench_annotations?${query}`);
    },
    createAnnotation(data) {
      requireAnnotationSession();
      return request('/rest/v1/workbench_annotations?select=*', { method: 'POST', headers: { 'Content-Type': 'application/json', Prefer: 'return=representation' }, body: JSON.stringify(data) });
    },
    async updateAnnotation(id, data) {
      requireAnnotationSession();
      await request(`/rest/v1/workbench_annotations?id=eq.${encodeURIComponent(id)}`, { method: 'PATCH', headers: { 'Content-Type': 'application/json', Prefer: 'return=minimal' }, body: JSON.stringify(data) });
    },
    async publish(name, snapshot) {
      return request('/rest/v1/rpc/publish_workbench_schema_version', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ p_name: name, p_snapshot: snapshot }) });
    },
    invite(email, redirectTo) {
      return request('/functions/v1/workbench-invite', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ email, redirectTo }) });
    },
    resendInvite(email, redirectTo) {
      return request('/functions/v1/workbench-invite', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ action: 'resend', email, redirectTo }) });
    },
    revoke(userId) {
      return request('/functions/v1/workbench-invite', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ action: 'revoke', userId }) });
    },
    reactivate(userId) {
      return request('/functions/v1/workbench-invite', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ action: 'reactivate', userId }) });
    },
    memberships() { return request('/rest/v1/workbench_memberships?select=user_id,email,role,active&order=email.asc'); }
  };
}
