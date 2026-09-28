import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';

const origin = Deno.env.get('WORKBENCH_APP_ORIGIN') || '';
const cors = { 'Access-Control-Allow-Origin': origin, 'Access-Control-Allow-Headers': 'authorization, apikey, content-type', 'Access-Control-Allow-Methods': 'POST, OPTIONS', 'Cache-Control': 'no-store' };
const json = (body: unknown, status = 200) => Response.json(body, { status, headers: cors });
const alphabet = '23456789ABCDEFGHJKLMNPQRSTUVWXYZ';

async function hashCode(code: string) {
  const digest = await crypto.subtle.digest('SHA-256', new TextEncoder().encode(code));
  return [...new Uint8Array(digest)].map(byte => byte.toString(16).padStart(2, '0')).join('');
}

function newCode() {
  const random = crypto.getRandomValues(new Uint8Array(16));
  return [...random].map(byte => alphabet[byte & 31]).join('').match(/.{4}/g)!.join('-');
}

Deno.serve(async request => {
  if (request.method === 'OPTIONS') return new Response('ok', { headers: cors });
  if (request.method !== 'POST') return json({ error: 'Method not allowed.' }, 405);
  if (!origin || request.headers.get('Origin') !== origin) return json({ error: 'Origin is not allowed.' }, 403);
  const authorization = request.headers.get('Authorization');
  if (!authorization?.startsWith('Bearer ')) return json({ error: 'Sign in first.' }, 401);

  const url = Deno.env.get('SUPABASE_URL')!;
  const anonKey = Deno.env.get('SUPABASE_ANON_KEY')!;
  const serviceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
  try {
    const caller = createClient(url, anonKey, { global: { headers: { Authorization: authorization } } });
    const { data: { user }, error: authError } = await caller.auth.getUser();
    if (authError || !user) return json({ error: 'The session is invalid or expired.' }, 401);
    const admin = createClient(url, serviceKey, { auth: { autoRefreshToken: false, persistSession: false } });
    const body = await request.json();

    if (body.action === 'generate' || body.action === 'revoke') {
      const { data: member } = await admin.from('workbench_memberships').select('role,active').eq('user_id', user.id).maybeSingle();
      if (member?.role !== 'owner' || !member.active || user.is_anonymous) return json({ error: 'Owner access is required.' }, 403);
      const now = new Date().toISOString();
      const { error: revokeError } = await admin.from('workbench_guest_codes').update({ revoked_at: now }).is('revoked_at', null);
      if (revokeError) throw revokeError;
      if (body.action === 'revoke') return json({ revoked: true });
      const code = newCode();
      const expiresAt = new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString();
      const { error } = await admin.from('workbench_guest_codes').insert({ code_hash: await hashCode(code.replaceAll('-', '')), created_by: user.id, expires_at: expiresAt });
      if (error) throw error;
      return json({ code, expiresAt });
    }

    if (body.action === 'status') {
      if (!user.is_anonymous) return json({ active: false });
      const { data: guest } = await admin.from('workbench_guest_sessions').select('display_name,code_id,workbench_guest_codes!inner(expires_at,revoked_at)').eq('user_id', user.id).maybeSingle();
      const code = guest?.workbench_guest_codes as { expires_at: string; revoked_at: string | null } | undefined;
      return json({ active: !!guest && !code?.revoked_at && Date.parse(code?.expires_at || '') > Date.now(), displayName: guest?.display_name || null });
    }

    if (body.action === 'redeem') {
      if (!user.is_anonymous) return json({ error: 'A guest session is required.' }, 403);
      if (typeof body.displayName !== 'string' || !body.displayName.trim() || body.displayName.trim().length > 60) return json({ error: 'Enter a display name of 1 to 60 characters.' }, 400);
      const cleanCode = typeof body.code === 'string' ? body.code.toUpperCase().replaceAll('-', '') : '';
      if (!new RegExp('^[' + alphabet + ']{16}$').test(cleanCode)) return json({ error: 'Enter a valid panel code.' }, 400);
      const codeHash = await hashCode(cleanCode);
      const { data: activeCode, error } = await admin.from('workbench_guest_codes').select('id').eq('code_hash', codeHash).is('revoked_at', null).gt('expires_at', new Date().toISOString()).maybeSingle();
      if (error) throw error;
      if (!activeCode) return json({ error: 'That panel code is invalid, expired, or revoked.' }, 403);
      const { error: saveError } = await admin.from('workbench_guest_sessions').upsert({ user_id: user.id, code_id: activeCode.id, display_name: body.displayName.trim() }, { onConflict: 'user_id' });
      if (saveError) throw saveError;
      return json({ redeemed: true });
    }

    return json({ error: 'Unknown guest-access action.' }, 400);
  } catch (error) {
    console.error('workbench-guest-access failed', error);
    return json({ error: 'Guest access could not be completed. Try again or contact the owner.' }, 500);
  }
});
