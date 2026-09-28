import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';

const cors = { 'Access-Control-Allow-Origin': Deno.env.get('WORKBENCH_APP_ORIGIN') || '', 'Access-Control-Allow-Headers': 'authorization, apikey, content-type', 'Access-Control-Allow-Methods': 'POST, OPTIONS' };
Deno.serve(async request => {
  if (request.method === 'OPTIONS') return new Response('ok', { headers: cors });
  if (request.method !== 'POST') return Response.json({ error: 'Method not allowed.' }, { status: 405, headers: cors });
  const url = Deno.env.get('SUPABASE_URL')!;
  const anonKey = Deno.env.get('SUPABASE_ANON_KEY')!;
  const serviceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
  const authorization = request.headers.get('Authorization');
  if (!authorization?.startsWith('Bearer ')) return Response.json({ error: 'Sign in as an owner first.' }, { status: 401, headers: cors });
  try {
    const allowedOrigin = Deno.env.get('WORKBENCH_APP_ORIGIN');
    if (!allowedOrigin || request.headers.get('Origin') !== allowedOrigin) return Response.json({ error: 'Origin is not allowed.' }, { status: 403, headers: cors });
    const caller = createClient(url, anonKey, { global: { headers: { Authorization: authorization } } });
    const { data: { user }, error: authError } = await caller.auth.getUser();
    if (authError || !user) return Response.json({ error: 'The session is invalid or expired.' }, { status: 401, headers: cors });
    const { data: member, error: memberError } = await caller.from('workbench_memberships').select('role,active').eq('user_id', user.id).single();
    if (memberError || member?.role !== 'owner' || !member.active) return Response.json({ error: 'Owner access is required.' }, { status: 403, headers: cors });
    const admin = createClient(url, serviceKey, { auth: { autoRefreshToken: false, persistSession: false } });
    const body = await request.json();
    if (body.action === 'revoke' || body.action === 'reactivate') {
      if (typeof body.userId !== 'string' || body.userId === user.id) return Response.json({ error: 'Choose a different panelist account.' }, { status: 400, headers: cors });
      const { data: target, error: lookupError } = await admin.from('workbench_memberships').select('role,active').eq('user_id', body.userId).single();
      if (lookupError || target?.role !== 'panelist') return Response.json({ error: 'Only an invited panelist account can be changed.' }, { status: 404, headers: cors });
      if ((body.action === 'revoke' && !target.active) || (body.action === 'reactivate' && target.active)) return Response.json({ error: 'Panelist access already has that status.' }, { status: 409, headers: cors });
      const { error } = await admin.from('workbench_memberships').update({ active: body.action === 'reactivate' }).eq('user_id', body.userId);
      if (error) throw error;
      return Response.json({ [body.action === 'revoke' ? 'revoked' : 'reactivated']: true }, { headers: cors });
    }
    const { email, redirectTo } = body;
    if (typeof email !== 'string' || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) return Response.json({ error: 'Enter a valid panelist email.' }, { status: 400, headers: cors });
    const cleanEmail = email.trim().toLowerCase();
    if (body.action === 'resend') {
      const { data: pending } = await admin.from('workbench_invitations').select('accepted_by').eq('email', cleanEmail).maybeSingle();
      if (!pending || pending.accepted_by !== null) return Response.json({ error: 'There is no pending invitation to resend.' }, { status: 404, headers: cors });
      const { error } = await admin.auth.admin.inviteUserByEmail(cleanEmail, { redirectTo: typeof redirectTo === 'string' ? redirectTo : undefined });
      if (error) throw error;
      return Response.json({ invited: true, resent: true }, { headers: cors });
    }
    const { data: existingMember } = await admin.from('workbench_memberships').select('active,role').eq('email', cleanEmail).maybeSingle();
    if (existingMember) return Response.json({ error: existingMember.active ? 'This person already has active access.' : 'This person already has an account. Use Manage access to reactivate it.' }, { status: 409, headers: cors });
    const { data: pendingInvite } = await admin.from('workbench_invitations').select('accepted_by').eq('email', cleanEmail).maybeSingle();
    if (pendingInvite?.accepted_by === null) return Response.json({ error: 'An invitation is already pending for this email.' }, { status: 409, headers: cors });
    const { error: inviteError } = await admin.from('workbench_invitations').insert({ email: cleanEmail, invited_by: user.id });
    if (inviteError) throw inviteError;
    const { error } = await admin.auth.admin.inviteUserByEmail(cleanEmail, { redirectTo: typeof redirectTo === 'string' ? redirectTo : undefined });
    if (error) throw error;
    return Response.json({ invited: true }, { headers: cors });
  } catch (error) {
    return Response.json({ error: error instanceof Error ? error.message : 'Invitation failed.' }, { status: 400, headers: cors });
  }
});
