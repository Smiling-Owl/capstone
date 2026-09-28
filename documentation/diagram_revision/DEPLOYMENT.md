# Schema Workbench deployment

The deployed app is a static Vercel site backed by Supabase Auth and Postgres. Its HTML and JavaScript do not contain the ERD, RDM, or PostgreSQL schema payloads. The owner exports a snapshot from the local repository; the app publishes it through an owner-only Postgres RPC. Signed-in active members read snapshots and annotations through RLS.

The Supabase publishable/anonymous key is public browser configuration. A service-role key is never used by Vercel or included in the static build; the invite/revoke Edge Function reads it only on Supabase.

## 1. Create Supabase and apply the migration

Create a Supabase project, then from `documentation/diagram_revision`:

```powershell
npx supabase login
npx supabase link --project-ref YOUR_PROJECT_REF
npx supabase db push
```

The migration creates owner/panelist memberships, immutable version snapshots, annotations and replies, the invitation trigger, indexes, and forced RLS. Do not edit the older application migration for this workbench feature.

In Supabase **Authentication → Providers → Email**, enable email/password sign-in and turn off public sign-ups. Set **Site URL** to the production Vercel origin and add that origin as an allowed redirect URL. Invitations return to `/` where the workbench handles the invite token and password setup.

Create the initial owner in **Authentication → Users** using the dashboard invite flow. After that user exists, run this once in **SQL Editor**, replacing the email:

```sql
insert into public.workbench_memberships(user_id, email, role, active)
select id, lower(email), 'owner', true
from auth.users
where lower(email) = lower('owner@example.edu')
on conflict (user_id) do update set role = 'owner', active = true;
```

## 2. Deploy the invite/access function

Supabase injects `SUPABASE_URL`, `SUPABASE_ANON_KEY`, and `SUPABASE_SERVICE_ROLE_KEY` into hosted Edge Functions. Set only this custom function secret to the exact Vercel production origin:

```powershell
npx supabase secrets set WORKBENCH_APP_ORIGIN=https://YOUR_VERCEL_DOMAIN
npx supabase functions deploy workbench-invite
```

The function validates the caller’s Auth session and owner membership before inviting, revoking, or reactivating a panelist. It rejects duplicate active memberships and pending invites. Do not set the service-role key in Vercel.

## 3. Deploy the static app to Vercel

Import the Git repository in Vercel and configure:

- **Root Directory:** `documentation/diagram_revision`
- **Build Command:** `npm run build`
- **Output Directory:** `dist`
- **Install Command:** `npm install`
- **Environment variables:** `VITE_SUPABASE_URL` and `VITE_SUPABASE_ANON_KEY` (Supabase publishable/anon key), for Production.

The same settings are in `vercel.json`. Trigger a production deployment. Add the final Vercel production origin to Supabase Auth’s allowed redirect URLs and set `WORKBENCH_APP_ORIGIN` to that exact origin, then redeploy the Edge Function if the secret changed.

## 4. Publish the first schema snapshot

From a local checkout containing the schema source files:

```powershell
cd documentation/diagram_revision
npm run schema:export
```

This creates the ignored local file `schema-version.json`. Sign in to the deployed site as the owner, choose that file under **Publish snapshot**, enter a version name, and publish. The snapshot is inserted by the authenticated user’s owner-only RPC and cannot be updated or deleted. Later versions get new IDs; comments stay bound to the version where they were written.

Invite panelists from the deployed owner toolbar. **Manage access** lists active and revoked accounts; only the Edge Function can change membership state. A revoked user’s already-issued JWT no longer passes membership-backed RLS checks.

## 5. Verify the deployment

From this directory run:

```powershell
npm run schema:export
$env:VITE_SUPABASE_URL = 'https://YOUR_PROJECT_REF.supabase.co'
$env:VITE_SUPABASE_ANON_KEY = 'YOUR_PUBLIC_ANON_KEY'
npm run build
npm run test:workbench
node workbench-check.mjs
```

On the deployed site, verify an invited panelist can annotate a table, attribute, and relationship, reply, switch versions, and reload. Verify a panelist’s publish request is denied, an owner can resolve/reopen, and revoked access fails on the next API request. Exercise ERD, RDM, PostgreSQL diagram, and SQL source view for each version.

The build copies only the HTML, CSS, viewer/runtime JavaScript, and layout libraries. It omits `erd-source-data.js`, the embedded RDM source block, `postgres-schema-source.js`, and any exported JSON. Schema payloads become readable to active invited members only. The underlying repository still contains the authored source diagrams and SQL; if the Git repository is public, those source files are public independently of the deployed app.

Remote Auth, RLS, email delivery, and Vercel deployment require project credentials and must be verified after provisioning; local checks cannot simulate Supabase’s database policies or email provider.
