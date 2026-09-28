begin;

create table public.workbench_guest_codes (
  id uuid primary key default gen_random_uuid(),
  code_hash text not null unique check (code_hash ~ '^[0-9a-f]{64}$'),
  created_by uuid not null references auth.users(id),
  created_at timestamptz not null default now(),
  expires_at timestamptz not null,
  revoked_at timestamptz
);
create unique index workbench_one_active_guest_code on public.workbench_guest_codes ((true)) where revoked_at is null;

create table public.workbench_guest_sessions (
  user_id uuid primary key references auth.users(id) on delete cascade,
  code_id uuid not null references public.workbench_guest_codes(id) on delete cascade,
  display_name text not null check (char_length(display_name) between 1 and 60),
  created_at timestamptz not null default now()
);

alter table public.workbench_guest_codes enable row level security;
alter table public.workbench_guest_codes force row level security;
alter table public.workbench_guest_sessions enable row level security;
alter table public.workbench_guest_sessions force row level security;
revoke all on public.workbench_guest_codes, public.workbench_guest_sessions from public, anon, authenticated;
grant all on public.workbench_guest_codes, public.workbench_guest_sessions to service_role;

create or replace function private.workbench_role()
returns text
language sql stable security definer
set search_path = ''
as $$
  select coalesce(
    (select m.role from public.workbench_memberships m where m.user_id = auth.uid() and m.active),
    case when auth.jwt() ->> 'is_anonymous' = 'true' and exists (
      select 1
      from public.workbench_guest_sessions s
      join public.workbench_guest_codes c on c.id = s.code_id
      where s.user_id = auth.uid() and c.revoked_at is null and c.expires_at > now()
    ) then 'guest' end
  )
$$;
revoke all on function private.workbench_role() from public, anon;
grant execute on function private.workbench_role() to authenticated;

alter table public.workbench_annotations add column author_label text;
create or replace function private.validate_workbench_annotation()
returns trigger
language plpgsql security definer
set search_path = ''
as $$
declare parent public.workbench_annotations%rowtype; version_snapshot jsonb; guest_name text;
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
      if parent.parent_id is not null then raise exception 'replies must be attached to a thread root'; end if;
      new.status := 'open'; new.resolved_by := null; new.resolved_at := null;
    end if;
    select snapshot into version_snapshot from public.workbench_schema_versions where id = new.schema_version_id;
    if not found or not exists (
      select 1 from jsonb_array_elements(version_snapshot->'targets') target
      where target->>'type' = new.target_type and target->>'id' = new.target_id
    ) then raise exception 'annotation target does not exist in this schema version'; end if;
    if new.status = 'resolved' and (private.workbench_role() <> 'owner' or new.resolved_by <> auth.uid()) then
      raise exception 'only an owner can resolve a thread';
    end if;
    if private.workbench_role() = 'guest' then
      select s.display_name into guest_name
      from public.workbench_guest_sessions s join public.workbench_guest_codes c on c.id = s.code_id
      where s.user_id = auth.uid() and c.revoked_at is null and c.expires_at > now();
      if guest_name is null then raise exception 'active panel code required'; end if;
      new.author_label := 'Guest · ' || guest_name || ' (unverified)';
    else
      new.author_label := 'Reviewer ' || left(auth.uid()::text, 8);
    end if;
  else
    if new.id <> old.id or new.thread_id <> old.thread_id or new.schema_version_id <> old.schema_version_id
       or new.target_type <> old.target_type or new.target_id <> old.target_id
       or new.parent_id is distinct from old.parent_id or new.author_id <> old.author_id
       or new.author_label is distinct from old.author_label or new.created_at <> old.created_at then
      raise exception 'annotation identity and target are immutable';
    end if;
    if new.status = old.status and (new.resolved_by is distinct from old.resolved_by or new.resolved_at is distinct from old.resolved_at) then
      raise exception 'resolution attribution changes only with a status transition';
    end if;
    new.updated_at := now();
    if new.status is distinct from old.status then
      if old.parent_id is not null or private.workbench_role() <> 'owner' then raise exception 'only an owner can change thread status'; end if;
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

drop policy workbench_schema_read on public.workbench_schema_versions;
create policy workbench_schema_read on public.workbench_schema_versions for select to authenticated
using (private.workbench_role() in ('owner', 'panelist', 'guest'));
drop policy workbench_annotations_read on public.workbench_annotations;
create policy workbench_annotations_read on public.workbench_annotations for select to authenticated
using (private.workbench_role() in ('owner', 'panelist', 'guest'));
drop policy workbench_annotations_insert on public.workbench_annotations;
create policy workbench_annotations_insert on public.workbench_annotations for insert to authenticated
with check (author_id = auth.uid() and private.workbench_role() in ('owner', 'panelist', 'guest')
  and status = 'open' and resolved_by is null and resolved_at is null);

commit;
