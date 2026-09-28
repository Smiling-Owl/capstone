begin;

create schema if not exists private;
revoke all on schema private from public, anon;
grant usage on schema private to authenticated;

create table public.workbench_invitations (
  email text primary key check (email = lower(btrim(email))),
  invited_by uuid not null references auth.users(id),
  created_at timestamptz not null default now(),
  accepted_by uuid unique references auth.users(id),
  accepted_at timestamptz
);

create table public.workbench_memberships (
  user_id uuid primary key references auth.users(id) on delete cascade,
  email text not null unique check (email = lower(btrim(email))),
  role text not null check (role in ('owner', 'panelist')),
  active boolean not null default true,
  created_at timestamptz not null default now()
);

create function private.workbench_role()
returns text
language sql stable security definer
set search_path = ''
as $$
  select m.role from public.workbench_memberships m
  where m.user_id = auth.uid() and m.active
$$;

revoke all on function private.workbench_role() from public, anon;
grant execute on function private.workbench_role() to authenticated;

create function private.accept_workbench_invite()
returns trigger
language plpgsql security definer
set search_path = ''
as $$
declare invite public.workbench_invitations%rowtype;
begin
  if new.email_confirmed_at is null then return new; end if;
  if tg_op = 'UPDATE' and old.email_confirmed_at is not null then return new; end if;
  select * into invite from public.workbench_invitations
  where email = lower(new.email) and accepted_by is null for update;
  if found then
    insert into public.workbench_memberships(user_id, email, role)
    values (new.id, lower(new.email), 'panelist')
    on conflict (user_id) do nothing;
    update public.workbench_invitations set accepted_by = new.id, accepted_at = now()
    where email = invite.email;
  end if;
  return new;
end
$$;

revoke all on function private.accept_workbench_invite() from public, anon, authenticated;
create trigger workbench_accept_invite after insert or update of email_confirmed_at on auth.users
for each row execute function private.accept_workbench_invite();

create table public.workbench_schema_versions (
  id uuid primary key default gen_random_uuid(),
  name text not null check (btrim(name) <> '' and char_length(name) <= 120),
  snapshot jsonb not null check (
    jsonb_typeof(snapshot) = 'object'
    and snapshot->>'format' = '1'
    and jsonb_typeof(snapshot->'erd') = 'object'
    and jsonb_typeof(snapshot->'erd'->'entities') = 'array'
    and jsonb_typeof(snapshot->'erd'->'relationships') = 'array'
    and jsonb_typeof(snapshot->'rdmDbml') = 'string'
    and jsonb_typeof(snapshot->'rdmModules') = 'array'
    and jsonb_typeof(snapshot->'postgres') = 'object'
    and jsonb_typeof(snapshot->'postgres'->'text') = 'string'
    and jsonb_typeof(snapshot->'targets') = 'array'
    and jsonb_array_length(snapshot->'targets') > 0
  ),
  created_by uuid not null references auth.users(id),
  published_at timestamptz not null default now(),
  created_at timestamptz not null default now()
);
create index workbench_schema_versions_published_idx on public.workbench_schema_versions(published_at desc);

create function public.publish_workbench_schema_version(p_name text, p_snapshot jsonb)
returns uuid
language plpgsql security invoker
set search_path = ''
as $$
declare version_id uuid;
begin
  if auth.uid() is null or private.workbench_role() <> 'owner' then
    raise exception 'owner access required' using errcode = '42501';
  end if;
  if p_name is null or btrim(p_name) = '' or char_length(p_name) > 120 then
    raise exception 'version name must be 1 to 120 characters';
  end if;
  if jsonb_typeof(p_snapshot) <> 'object' or p_snapshot->>'format' <> '1'
     or jsonb_typeof(p_snapshot->'targets') <> 'array' or jsonb_array_length(p_snapshot->'targets') = 0
     or jsonb_typeof(p_snapshot->'erd') <> 'object'
     or jsonb_typeof(p_snapshot->'erd'->'entities') <> 'array'
     or jsonb_typeof(p_snapshot->'erd'->'relationships') <> 'array'
     or jsonb_typeof(p_snapshot->'rdmDbml') <> 'string'
     or jsonb_typeof(p_snapshot->'rdmModules') <> 'array'
     or jsonb_typeof(p_snapshot->'postgres') <> 'object'
     or jsonb_typeof(p_snapshot->'postgres'->'text') <> 'string' then
    raise exception 'invalid workbench snapshot';
  end if;
  insert into public.workbench_schema_versions(name, snapshot, created_by)
  values (btrim(p_name), p_snapshot, auth.uid()) returning id into version_id;
  return version_id;
end
$$;
revoke all on function public.publish_workbench_schema_version(text, jsonb) from public, anon;
grant execute on function public.publish_workbench_schema_version(text, jsonb) to authenticated;

create table public.workbench_annotations (
  id uuid primary key default gen_random_uuid(),
  thread_id uuid not null,
  schema_version_id uuid not null references public.workbench_schema_versions(id) on delete restrict,
  target_type text not null check (target_type in ('table', 'column', 'relationship')),
  target_id text not null check (btrim(target_id) <> '' and char_length(target_id) <= 300),
  parent_id uuid references public.workbench_annotations(id) on delete restrict,
  content text not null check (btrim(content) <> '' and char_length(content) <= 8000),
  author_id uuid not null references auth.users(id),
  status text not null default 'open' check (status in ('open', 'resolved')),
  resolved_by uuid references auth.users(id),
  resolved_at timestamptz,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  constraint workbench_annotation_thread_fk foreign key (thread_id) references public.workbench_annotations(id) deferrable initially deferred,
  constraint workbench_resolution_shape check (
    (status = 'open' and resolved_by is null and resolved_at is null)
    or (status = 'resolved' and resolved_by is not null and resolved_at is not null)
  )
);
create index workbench_annotations_version_target_idx on public.workbench_annotations(schema_version_id, target_type, target_id, created_at);
create index workbench_annotations_thread_idx on public.workbench_annotations(thread_id, created_at);
create index workbench_annotations_author_idx on public.workbench_annotations(author_id, created_at desc);

create function private.validate_workbench_annotation()
returns trigger
language plpgsql security definer
set search_path = ''
as $$
declare parent public.workbench_annotations%rowtype; version_snapshot jsonb;
begin
  if tg_op = 'INSERT' then
    if new.parent_id is null then
      new.thread_id := new.id;
    else
      select * into parent from public.workbench_annotations where id = new.parent_id;
      if not found or parent.thread_id <> new.thread_id
         or parent.schema_version_id <> new.schema_version_id
         or parent.target_type <> new.target_type or parent.target_id <> new.target_id then
        raise exception 'reply must belong to the same target and schema version as its thread';
      end if;
      if parent.parent_id is not null then
        raise exception 'replies must be attached to a thread root';
      end if;
      new.status := 'open'; new.resolved_by := null; new.resolved_at := null;
    end if;
    select snapshot into version_snapshot from public.workbench_schema_versions where id = new.schema_version_id;
    if not found or not exists (
      select 1 from jsonb_array_elements(version_snapshot->'targets') target
      where target->>'type' = new.target_type and target->>'id' = new.target_id
    ) then
      raise exception 'annotation target does not exist in this schema version';
    end if;
    if new.status = 'resolved' and (private.workbench_role() <> 'owner' or new.resolved_by <> auth.uid()) then
      raise exception 'only an owner can resolve a thread';
    end if;
  else
    if new.id <> old.id or new.thread_id <> old.thread_id or new.schema_version_id <> old.schema_version_id
       or new.target_type <> old.target_type or new.target_id <> old.target_id
       or new.parent_id is distinct from old.parent_id or new.author_id <> old.author_id
       or new.created_at <> old.created_at then
      raise exception 'annotation identity and target are immutable';
    end if;
    if new.status = old.status and (new.resolved_by is distinct from old.resolved_by or new.resolved_at is distinct from old.resolved_at) then
      raise exception 'resolution attribution changes only with a status transition';
    end if;
    new.updated_at := now();
    if new.status is distinct from old.status then
      if old.parent_id is not null or private.workbench_role() <> 'owner' then
        raise exception 'only an owner can change thread status';
      end if;
      if new.status = 'resolved' then new.resolved_by := auth.uid(); new.resolved_at := now();
      else new.resolved_by := null; new.resolved_at := null; end if;
    end if;
    if new.content is distinct from old.content and (old.author_id <> auth.uid() or old.status <> 'open') then
      raise exception 'only the author can edit their own open comment';
    end if;
  end if;
  return new;
end
$$;
revoke all on function private.validate_workbench_annotation() from public, anon, authenticated;
create trigger workbench_annotation_validate before insert or update on public.workbench_annotations
for each row execute function private.validate_workbench_annotation();

alter table public.workbench_memberships enable row level security;
alter table public.workbench_memberships force row level security;
alter table public.workbench_invitations enable row level security;
alter table public.workbench_invitations force row level security;
alter table public.workbench_schema_versions enable row level security;
alter table public.workbench_schema_versions force row level security;
alter table public.workbench_annotations enable row level security;
alter table public.workbench_annotations force row level security;

create policy workbench_membership_read on public.workbench_memberships for select to authenticated
using (user_id = auth.uid() or private.workbench_role() = 'owner');
create policy workbench_schema_read on public.workbench_schema_versions for select to authenticated
using (private.workbench_role() in ('owner', 'panelist'));
create policy workbench_schema_publish on public.workbench_schema_versions for insert to authenticated
with check (created_by = auth.uid() and private.workbench_role() = 'owner');
create policy workbench_annotations_read on public.workbench_annotations for select to authenticated
using (private.workbench_role() in ('owner', 'panelist'));
create policy workbench_annotations_insert on public.workbench_annotations for insert to authenticated
with check (
  author_id = auth.uid()
  and private.workbench_role() in ('owner', 'panelist')
  and status = 'open' and resolved_by is null and resolved_at is null
);
create policy workbench_annotation_edit_own on public.workbench_annotations for update to authenticated
using (author_id = auth.uid() and status = 'open' and private.workbench_role() in ('owner', 'panelist'))
with check (author_id = auth.uid() and status = 'open' and private.workbench_role() in ('owner', 'panelist'));
create policy workbench_annotation_resolve on public.workbench_annotations for update to authenticated
using (parent_id is null and private.workbench_role() = 'owner')
with check (parent_id is null and private.workbench_role() = 'owner');

revoke all on public.workbench_invitations, public.workbench_memberships from anon, authenticated;
grant all on public.workbench_invitations to service_role;
grant update (active) on public.workbench_memberships to service_role;
grant select on public.workbench_memberships to authenticated;
revoke all on public.workbench_schema_versions from anon, authenticated;
grant select, insert on public.workbench_schema_versions to authenticated;
revoke all on public.workbench_annotations from anon, authenticated;
grant select, insert on public.workbench_annotations to authenticated;
grant update (content) on public.workbench_annotations to authenticated;
grant update (status, resolved_by, resolved_at) on public.workbench_annotations to authenticated;

commit;
