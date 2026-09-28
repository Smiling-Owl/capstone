# Schema Workbench deployment

The deployed app is a static Vercel site backed by Supabase Auth and Postgres. Its HTML and JavaScript do not contain the ERD, RDM, or PostgreSQL schema payloads. The owner exports a snapshot from the local repository; the app publishes it through an owner-only Postgres RPC. Published schema snapshots are publicly readable. Annotation access is available to owner/panelist accounts or temporary guest sessions redeemed with an owner-generated panel code.

The Supabase publishable/anonymous key is public browser configuration. A service-role key is never used by Vercel or included in the static build; the invite/revoke Edge Function reads it only on Supabase.

## 1. Create Supabase and apply the migration

Create a Supabase project, then from `documentation/diagram_revision`:

```powershell
npx supabase login
npx supabase link --project-ref YOUR_PROJECT_REF
npx supabase db push
```

The migrations create owner/panelist memberships, immutable version snapshots, annotations and replies, the invitation trigger, indexes, and forced RLS. The follow-up `202609290001_public_schema_read.sql` grants the `anon` role read access to published snapshots only. Apply it before expecting the public viewer to load. It does not grant anonymous access to annotations, publishing, invitations, or memberships. Because a snapshot contains the full ERD, RDM, and PostgreSQL schema, anyone with the site URL can inspect all published versions.

In Supabase **Authentication → Providers → Email**, enable email/password sign-in and turn off public email sign-ups. In **Authentication → Sign In / Providers → Anonymous Sign-Ins**, enable anonymous sign-ins. This does not enable public email registration. Set **Site URL** to the production Vercel origin and add that origin as an allowed redirect URL. Invitations return to `/` where the workbench handles the invite token and password setup. Supabase recommends CAPTCHA for anonymous sign-ins, but this UI does not yet submit a CAPTCHA token; do not enable required Auth CAPTCHA until a challenge is added. For the small invited panel audience, the code has 80 bits of entropy and expires after 24 hours. Add CAPTCHA if this feature is exposed more broadly.

Create the initial owner in **Authentication → Users** using the dashboard invite flow. After that user exists, run this once in **SQL Editor**, replacing the email:

```sql
insert into public.workbench_memberships(user_id, email, role, active)
select id, lower(email), 'owner', true
from auth.users
where lower(email) = lower('owner@example.edu')
on conflict (user_id) do update set role = 'owner', active = true;
```

## 2. Deploy the access functions

Supabase injects `SUPABASE_URL`, `SUPABASE_ANON_KEY`, and `SUPABASE_SERVICE_ROLE_KEY` into hosted Edge Functions. Set only this custom function secret to the exact Vercel production origin:

```powershell
npx supabase secrets set WORKBENCH_APP_ORIGIN=https://YOUR_VERCEL_DOMAIN
npx supabase functions deploy workbench-invite
npx supabase functions deploy workbench-guest-access
```

The function validates the caller’s Auth session and owner membership before inviting, revoking, or reactivating a panelist. It rejects duplicate active memberships and pending invites. Do not set the service-role key in Vercel.

Apply the `202609290002_guest_panel_access.sql` migration before deploying the guest-access function. In the owner toolbar, **Generate panel code** creates one active, cryptographically random code that expires after 24 hours. The plaintext is shown once; copy it before navigating away. Generating another code or using **Revoke panel code** immediately disables the previous code and all guest sessions redeemed from it. Share the code only with intended reviewers. Guests choose a display name, which appears on comments as self-reported and unverified. They can read and add comments and replies, but cannot edit, resolve, publish, invite, or manage accounts. Anonymous visitors without a code remain unable to read annotations.

Supabase anonymous identities are tied to the browser session. Clearing browser storage or signing out loses that identity; guests must redeem the currently active code again. Supabase does not automatically clean up anonymous Auth users. Guest Auth identities remain because annotation authors reference them; expired/revoked guest sessions no longer pass RLS. A reviewer name is self-reported, not verified.

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

On the deployed site, verify a signed-out visitor can switch between published versions and inspect ERD, RDM, PostgreSQL diagram, and SQL source; the visitor must not read or write annotations. As owner, generate a panel code, copy it, and redeem it in a separate browser session. Verify the guest can read/add comments and replies, while publish, resolve/edit, invite, and account management remain unavailable. Verify revoking or rotating the code blocks the guest’s next annotation request. Also verify an invited active panelist can annotate, a panelist’s publish request is denied, and an owner can resolve/reopen.

The build copies only the HTML, CSS, viewer/runtime JavaScript, and layout libraries. It omits `erd-source-data.js`, the embedded RDM source block, `postgres-schema-source.js`, and any exported JSON. The underlying repository still contains the authored source diagrams and SQL; if the Git repository is public, those source files are public independently of the deployed app.

Remote Auth, RLS, email delivery, and Vercel deployment require project credentials and must be verified after provisioning; local checks cannot simulate Supabase’s database policies or email provider.
