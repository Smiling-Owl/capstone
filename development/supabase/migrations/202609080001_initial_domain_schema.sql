-- Disaster Situation Record Management and Situation Report Generation System
-- Initial PostgreSQL/Supabase schema. PostgreSQL 15+.

begin;

-- Uses built-in gen_random_uuid() and pg_catalog.sha256(); no extension required.

create type public.unit_kind as enum ('city', 'barangay', 'purok');
create type public.account_level as enum ('purok', 'barangay', 'drrm');
create type public.account_status as enum ('active', 'suspended', 'deactivated');
create type public.role_code as enum (
  'purok_reporter', 'barangay_reviewer_reporter', 'drrm_verifier',
  'sitrep_preparer', 'sitrep_approver', 'organization_admin', 'viewer'
);
create type public.record_state as enum ('draft', 'submitted');
create type public.review_outcome as enum ('verified', 'correction_requested', 'rejected');
create type public.value_state as enum (
  'unknown', 'reported_zero', 'not_applicable', 'provisional',
  'for_validation', 'verified', 'disputed'
);
create type public.profile_level as enum ('purok', 'barangay');
create type public.report_level as enum ('purok', 'barangay');
create type public.report_stage as enum ('initial', 'progress', 'terminal', 'final');
create type public.source_disposition as enum ('included', 'pending', 'excluded', 'superseded');
create type public.effect_kind as enum ('affected_population', 'casualty_summary', 'damage_assessment');
create type public.sitrep_state as enum ('draft', 'under_review', 'approved', 'released', 'superseded');
create type public.sitrep_decision_stage as enum ('review', 'approval');
create type public.sitrep_decision_value as enum ('accepted', 'correction_requested', 'rejected');
create type public.sitrep_content_kind as enum (
  'chronology', 'preparedness_measure', 'lifeline_status', 'class_work_suspension',
  'calamity_declaration', 'preemptive_evacuation', 'response_action',
  'assistance_provided', 'issue_concern', 'recommendation',
  'incident_overview', 'geographic_coverage', 'hazard_condition',
  'exposure_summary', 'related_incident', 'displaced_population'
);

create function public.valid_count_state(p_value bigint, p_state public.value_state)
returns boolean
language sql
immutable
set search_path = pg_catalog, public
as $$
  select case
    when p_state in ('unknown', 'not_applicable') then p_value is null
    when p_state = 'reported_zero' then p_value is not null and p_value = 0
    else p_value is not null and p_value >= 0
  end
$$;

create function public.valid_numeric_state(p_value numeric, p_state public.value_state)
returns boolean
language sql
immutable
set search_path = pg_catalog, public
as $$
  select case
    when p_state in ('unknown', 'not_applicable') then p_value is null
    when p_state = 'reported_zero' then p_value is not null and p_value = 0
    else p_value is not null and p_value >= 0
  end
$$;

create table public.tenant (
  id uuid primary key default gen_random_uuid(),
  name text not null check (btrim(name) <> ''),
  created_at timestamptz not null default now(),
  unique (id)
);

create table public.organization_unit (
  id uuid primary key default gen_random_uuid(),
  tenant_id uuid not null references public.tenant(id),
  parent_id uuid,
  kind public.unit_kind not null,
  code text not null check (btrim(code) <> ''),
  name text not null check (btrim(name) <> ''),
  geographic_code text,
  province_name text,
  location_description text,
  boundary_reference text,
  active boolean not null default true,
  created_at timestamptz not null default now(),
  unique (tenant_id, id),
  unique (tenant_id, code),
  foreign key (tenant_id, parent_id)
    references public.organization_unit(tenant_id, id)
);

create function public.enforce_organization_unit_hierarchy()
returns trigger
language plpgsql
set search_path = pg_catalog, public
as $$
declare
  v_parent_kind public.unit_kind;
  v_cycle boolean;
begin
  if new.kind = 'city' and new.parent_id is not null then
    raise exception 'A city unit cannot have a parent';
  elsif new.kind <> 'city' and new.parent_id is null then
    raise exception '% unit requires a parent', new.kind;
  end if;

  if new.parent_id is not null then
    select kind into v_parent_kind
    from public.organization_unit
    where tenant_id = new.tenant_id and id = new.parent_id;

    if (new.kind = 'barangay' and v_parent_kind <> 'city')
       or (new.kind = 'purok' and v_parent_kind <> 'barangay') then
      raise exception 'Invalid organization hierarchy: % cannot be under %', new.kind, v_parent_kind;
    end if;

    with recursive ancestors(id, parent_id) as (
      select id, parent_id from public.organization_unit
      where tenant_id = new.tenant_id and id = new.parent_id
      union all
      select ou.id, ou.parent_id
      from public.organization_unit ou
      join ancestors a on a.parent_id = ou.id
      where ou.tenant_id = new.tenant_id
    )
    select exists(select 1 from ancestors where id = new.id) into v_cycle;

    if v_cycle then raise exception 'Organization hierarchy cannot contain a cycle'; end if;
  end if;
  return new;
end
$$;

create trigger organization_unit_hierarchy_guard
before insert or update of tenant_id, parent_id, kind
on public.organization_unit
for each row execute function public.enforce_organization_unit_hierarchy();

create table public.account (
  id uuid primary key default gen_random_uuid(),
  tenant_id uuid not null references public.tenant(id),
  auth_user_id uuid not null references auth.users(id),
  level public.account_level not null,
  username text not null check (username ~ '^[A-Za-z0-9_.-]{3,64}$'),
  address text,
  first_name text not null check (btrim(first_name) <> ''),
  middle_name text,
  last_name text not null check (btrim(last_name) <> ''),
  designation text,
  official_email text,
  official_mobile text,
  status public.account_status not null default 'active',
  created_by_account_id uuid,
  created_at timestamptz not null default now(),
  deactivated_at timestamptz,
  deactivation_reason text,
  unique (tenant_id, id),
  unique (auth_user_id),
  foreign key (tenant_id, created_by_account_id)
    references public.account(tenant_id, id),
  check ((status = 'deactivated') = (deactivated_at is not null)),
  check (status <> 'deactivated' or nullif(btrim(deactivation_reason), '') is not null)
);

create table public.purok_account (
  tenant_id uuid not null,
  account_id uuid primary key,
  purok_unit_id uuid not null,
  foreign key (tenant_id, account_id) references public.account(tenant_id, id),
  foreign key (tenant_id, purok_unit_id) references public.organization_unit(tenant_id, id),
  unique (tenant_id, account_id)
);

create table public.barangay_account (
  tenant_id uuid not null,
  account_id uuid primary key,
  barangay_unit_id uuid not null,
  foreign key (tenant_id, account_id) references public.account(tenant_id, id),
  foreign key (tenant_id, barangay_unit_id) references public.organization_unit(tenant_id, id),
  unique (tenant_id, account_id)
);

create table public.drrm_account (
  tenant_id uuid not null,
  account_id uuid primary key,
  city_unit_id uuid not null,
  foreign key (tenant_id, account_id) references public.account(tenant_id, id),
  foreign key (tenant_id, city_unit_id) references public.organization_unit(tenant_id, id),
  unique (tenant_id, account_id)
);

create function public.enforce_account_subtype()
returns trigger
language plpgsql
set search_path = pg_catalog, public
as $$
declare
  v_level public.account_level;
  v_kind public.unit_kind;
  v_expected public.account_level := tg_argv[0]::public.account_level;
  v_expected_kind public.unit_kind := tg_argv[1]::public.unit_kind;
  v_unit_id uuid := (to_jsonb(new) ->> tg_argv[2])::uuid;
begin
  if tg_op = 'UPDATE' and (new.tenant_id is distinct from old.tenant_id
      or new.account_id is distinct from old.account_id) then
    raise exception 'Account subtype identity cannot change; create a new account instead';
  end if;
  select level into v_level from public.account
  where tenant_id = new.tenant_id and id = new.account_id;
  select kind into v_kind from public.organization_unit
  where tenant_id = new.tenant_id and id = v_unit_id;
  if v_level <> v_expected or v_kind <> v_expected_kind then
    raise exception 'Account subtype % requires organization-unit kind %', v_expected, v_expected_kind;
  end if;
  return new;
end
$$;

create trigger purok_account_subtype_guard before insert or update on public.purok_account
for each row execute function public.enforce_account_subtype('purok', 'purok', 'purok_unit_id');
create trigger barangay_account_subtype_guard before insert or update on public.barangay_account
for each row execute function public.enforce_account_subtype('barangay', 'barangay', 'barangay_unit_id');
create trigger drrm_account_subtype_guard before insert or update on public.drrm_account
for each row execute function public.enforce_account_subtype('drrm', 'city', 'city_unit_id');

create function public.enforce_account_total_disjoint()
returns trigger
language plpgsql
set search_path = pg_catalog, public
as $$
declare
  v_tenant uuid;
  v_account uuid;
  v_level public.account_level;
  v_count integer;
  v_creator uuid;
  v_unit uuid;
  v_parent uuid;
begin
  if tg_table_name = 'account' then
    if tg_op = 'DELETE' then v_tenant := old.tenant_id; v_account := old.id;
    else v_tenant := new.tenant_id; v_account := new.id; end if;
  else
    if tg_op = 'DELETE' then v_tenant := old.tenant_id; v_account := old.account_id;
    else v_tenant := new.tenant_id; v_account := new.account_id; end if;
  end if;
  select level, created_by_account_id into v_level, v_creator from public.account where tenant_id = v_tenant and id = v_account;
  if not found then return null; end if;
  select (exists(select 1 from public.purok_account where tenant_id = v_tenant and account_id = v_account))::int
       + (exists(select 1 from public.barangay_account where tenant_id = v_tenant and account_id = v_account))::int
       + (exists(select 1 from public.drrm_account where tenant_id = v_tenant and account_id = v_account))::int
  into v_count;
  if v_count <> 1 then raise exception 'Account must have exactly one administrative-level subtype'; end if;
  if (v_level = 'purok' and not exists(select 1 from public.purok_account where account_id = v_account))
     or (v_level = 'barangay' and not exists(select 1 from public.barangay_account where account_id = v_account))
     or (v_level = 'drrm' and not exists(select 1 from public.drrm_account where account_id = v_account)) then
    raise exception 'Account discriminator does not match its subtype';
  end if;
  if v_level = 'purok' then
    select p.purok_unit_id, u.parent_id into v_unit, v_parent
    from public.purok_account p join public.organization_unit u on u.tenant_id = p.tenant_id and u.id = p.purok_unit_id
    where p.tenant_id = v_tenant and p.account_id = v_account;
    if v_creator is null or not exists(select 1 from public.barangay_account b
      where b.tenant_id = v_tenant and b.account_id = v_creator and b.barangay_unit_id = v_parent) then
      raise exception 'A Purok account must be created by an account assigned to its parent Barangay';
    end if;
  elsif v_level = 'barangay' then
    select b.barangay_unit_id, u.parent_id into v_unit, v_parent
    from public.barangay_account b join public.organization_unit u on u.tenant_id = b.tenant_id and u.id = b.barangay_unit_id
    where b.tenant_id = v_tenant and b.account_id = v_account;
    if v_creator is null or not exists(select 1 from public.drrm_account d
      where d.tenant_id = v_tenant and d.account_id = v_creator and d.city_unit_id = v_parent) then
      raise exception 'A Barangay account must be created by a DRRM account assigned to its parent city';
    end if;
  end if;
  return null;
end
$$;

create constraint trigger account_total_disjoint after insert or update on public.account
deferrable initially deferred for each row execute function public.enforce_account_total_disjoint();
create constraint trigger purok_account_total_disjoint after insert or update or delete on public.purok_account
deferrable initially deferred for each row execute function public.enforce_account_total_disjoint();
create constraint trigger barangay_account_total_disjoint after insert or update or delete on public.barangay_account
deferrable initially deferred for each row execute function public.enforce_account_total_disjoint();
create constraint trigger drrm_account_total_disjoint after insert or update or delete on public.drrm_account
deferrable initially deferred for each row execute function public.enforce_account_total_disjoint();

create table public.role_assignment (
  id uuid primary key default gen_random_uuid(),
  tenant_id uuid not null,
  account_id uuid not null,
  unit_id uuid not null,
  role public.role_code not null,
  valid_from timestamptz not null default now(),
  valid_until timestamptz,
  assigned_by_account_id uuid not null,
  assignment_reason text,
  unique (tenant_id, id),
  foreign key (tenant_id, account_id) references public.account(tenant_id, id),
  foreign key (tenant_id, unit_id) references public.organization_unit(tenant_id, id),
  foreign key (tenant_id, assigned_by_account_id) references public.account(tenant_id, id),
  check (valid_until is null or valid_until > valid_from)
);

create table public.information_source (
  id uuid primary key default gen_random_uuid(),
  tenant_id uuid not null,
  source_type text not null check (btrim(source_type) <> ''),
  source_name text not null check (btrim(source_name) <> ''),
  source_organization text,
  reference_number text,
  reference_url text,
  observed_at timestamptz,
  received_at timestamptz not null default now(),
  confidentiality_classification text not null default 'internal',
  reliability_notes text,
  created_by_account_id uuid not null,
  created_at timestamptz not null default now(),
  unique (tenant_id, id),
  foreign key (tenant_id, created_by_account_id) references public.account(tenant_id, id)
);

create table public.evidence (
  id uuid primary key default gen_random_uuid(),
  tenant_id uuid not null,
  evidence_type text not null,
  title text not null,
  storage_path text not null,
  captured_at timestamptz,
  location_description text,
  latitude numeric(9,6),
  longitude numeric(9,6),
  caption text,
  privacy_classification text not null default 'restricted',
  integrity_checksum text not null,
  uploaded_by_account_id uuid not null,
  uploaded_at timestamptz not null default now(),
  unique (tenant_id, id),
  unique (tenant_id, storage_path),
  foreign key (tenant_id, uploaded_by_account_id) references public.account(tenant_id, id),
  check (latitude is null or latitude between -90 and 90),
  check (longitude is null or longitude between -180 and 180)
);


create table public.profile (
  id uuid primary key default gen_random_uuid(),
  tenant_id uuid not null,
  unit_id uuid not null,
  level public.profile_level not null,
  reporting_month date not null check (extract(day from reporting_month) = 1),
  created_at timestamptz not null default now(),
  unique (tenant_id, id),
  unique (tenant_id, unit_id, reporting_month),
  foreign key (tenant_id, unit_id) references public.organization_unit(tenant_id, id)
);

create table public.profile_version (
  id uuid primary key default gen_random_uuid(),
  tenant_id uuid not null,
  profile_id uuid not null,
  parent_version_id uuid,
  version_number integer not null check (version_number > 0),
  as_of_date date not null,
  methodology_notes text,
  data_gap_notes text,
  limitations text,
  state public.record_state not null default 'draft',
  prepared_by_account_id uuid not null,
  submitted_at timestamptz,
  submission_key uuid,
  content_hash text,
  unique (tenant_id, id),
  unique (tenant_id, id, profile_id),
  unique (tenant_id, profile_id, version_number),
  unique (tenant_id, prepared_by_account_id, submission_key),
  foreign key (tenant_id, profile_id) references public.profile(tenant_id, id),
  foreign key (tenant_id, parent_version_id) references public.profile_version(tenant_id, id),
  foreign key (tenant_id, prepared_by_account_id) references public.account(tenant_id, id),
  check ((state = 'draft' and submitted_at is null and submission_key is null and content_hash is null)
      or (state = 'submitted' and submitted_at is not null and submission_key is not null and content_hash is not null))
);


create table public.profile_review_decision (
  id uuid primary key default gen_random_uuid(),
  tenant_id uuid not null,
  profile_version_id uuid not null,
  reviewer_account_id uuid not null,
  outcome public.review_outcome not null,
  reason text,
  correction_request text,
  accepted_limitations text,
  decided_at timestamptz not null default now(),
  unique (tenant_id, id),
  unique (tenant_id, profile_version_id),
  foreign key (tenant_id, profile_version_id) references public.profile_version(tenant_id, id),
  foreign key (tenant_id, reviewer_account_id) references public.account(tenant_id, id),
  check (outcome = 'verified' or nullif(btrim(reason), '') is not null)
);

create table public.profile_version_evidence (
  tenant_id uuid not null,
  profile_version_id uuid not null,
  evidence_id uuid not null,
  evidence_role text,
  primary key (tenant_id, profile_version_id, evidence_id),
  foreign key (tenant_id, profile_version_id) references public.profile_version(tenant_id, id),
  foreign key (tenant_id, evidence_id) references public.evidence(tenant_id, id)
);

create table public.barangay_profile_source (
  tenant_id uuid not null,
  barangay_profile_version_id uuid not null,
  purok_profile_version_id uuid not null,
  purok_profile_id uuid not null,
  disposition public.source_disposition not null,
  reason text,
  reconciliation_notes text,
  added_at timestamptz not null default now(),
  primary key (tenant_id, barangay_profile_version_id, purok_profile_version_id),
  unique (tenant_id, barangay_profile_version_id, purok_profile_id),
  foreign key (tenant_id, barangay_profile_version_id) references public.profile_version(tenant_id, id),
  foreign key (tenant_id, purok_profile_version_id, purok_profile_id) references public.profile_version(tenant_id, id, profile_id),
  check (disposition = 'included' or nullif(btrim(reason), '') is not null)
);

create table public.hazard_type (
  id uuid primary key default gen_random_uuid(),
  tenant_id uuid not null,
  code text not null,
  name text not null,
  category text not null,
  definition text not null,
  authority_reference text,
  active boolean not null default true,
  unique (tenant_id, id),
  unique (tenant_id, code),
  foreign key (tenant_id) references public.tenant(id)
);

create table public.hazard_record (
  id uuid primary key default gen_random_uuid(),
  tenant_id uuid not null,
  unit_id uuid not null,
  hazard_type_id uuid not null,
  reference_number text not null,
  created_by_account_id uuid not null,
  created_at timestamptz not null default now(),
  unique (tenant_id, id),
  unique (tenant_id, reference_number),
  foreign key (tenant_id, unit_id) references public.organization_unit(tenant_id, id),
  foreign key (tenant_id, hazard_type_id) references public.hazard_type(tenant_id, id),
  foreign key (tenant_id, created_by_account_id) references public.account(tenant_id, id)
);

create table public.hazard_version (
  id uuid primary key default gen_random_uuid(),
  tenant_id uuid not null,
  hazard_record_id uuid not null,
  parent_version_id uuid,
  version_number integer not null check (version_number > 0),
  title text not null,
  description text not null,
  location_description text not null,
  landmark text,
  geometry jsonb,
  assessment_at timestamptz not null,
  onset_at timestamptz,
  end_at timestamptz,
  observed_or_forecast text not null,
  severity text,
  confidence_level text,
  state public.record_state not null default 'draft',
  prepared_by_account_id uuid not null,
  submitted_at timestamptz,
  submission_key uuid,
  content_hash text,
  unique (tenant_id, id),
  unique (tenant_id, id, hazard_record_id),
  unique (tenant_id, hazard_record_id, version_number),
  unique (tenant_id, prepared_by_account_id, submission_key),
  foreign key (tenant_id, hazard_record_id) references public.hazard_record(tenant_id, id),
  foreign key (tenant_id, parent_version_id) references public.hazard_version(tenant_id, id),
  foreign key (tenant_id, prepared_by_account_id) references public.account(tenant_id, id),
  check (end_at is null or onset_at is null or end_at >= onset_at),
  check ((state = 'draft' and submitted_at is null and submission_key is null and content_hash is null)
      or (state = 'submitted' and submitted_at is not null and submission_key is not null and content_hash is not null))
);


create table public.hazard_review_decision (
  id uuid primary key default gen_random_uuid(),
  tenant_id uuid not null,
  hazard_version_id uuid not null,
  reviewer_account_id uuid not null,
  outcome public.review_outcome not null,
  reason text,
  correction_request text,
  accepted_limitations text,
  decided_at timestamptz not null default now(),
  unique (tenant_id, id),
  unique (tenant_id, hazard_version_id),
  foreign key (tenant_id, hazard_version_id) references public.hazard_version(tenant_id, id),
  foreign key (tenant_id, reviewer_account_id) references public.account(tenant_id, id),
  check (outcome = 'verified' or nullif(btrim(reason), '') is not null)
);

create table public.hazard_version_evidence (
  tenant_id uuid not null,
  hazard_version_id uuid not null,
  evidence_id uuid not null,
  evidence_role text,
  primary key (tenant_id, hazard_version_id, evidence_id),
  foreign key (tenant_id, hazard_version_id) references public.hazard_version(tenant_id, id),
  foreign key (tenant_id, evidence_id) references public.evidence(tenant_id, id)
);


create table public.incident_type (
  id uuid primary key default gen_random_uuid(),
  tenant_id uuid not null,
  code text not null,
  name text not null,
  description text,
  active boolean not null default true,
  unique (tenant_id, id),
  unique (tenant_id, code),
  foreign key (tenant_id) references public.tenant(id)
);

create table public.incident (
  id uuid primary key default gen_random_uuid(),
  tenant_id uuid not null,
  incident_type_id uuid not null,
  reference_number text not null,
  title text not null,
  status text not null default 'open',
  created_by_account_id uuid not null,
  created_at timestamptz not null default now(),
  closed_at timestamptz,
  unique (tenant_id, id),
  unique (tenant_id, reference_number),
  foreign key (tenant_id, incident_type_id) references public.incident_type(tenant_id, id),
  foreign key (tenant_id, created_by_account_id) references public.account(tenant_id, id)
);

create table public.incident_hazard (
  tenant_id uuid not null,
  incident_id uuid not null,
  hazard_version_id uuid not null,
  relationship_type text not null default 'primary',
  description text,
  primary key (tenant_id, incident_id, hazard_version_id),
  foreign key (tenant_id, incident_id) references public.incident(tenant_id, id),
  foreign key (tenant_id, hazard_version_id) references public.hazard_version(tenant_id, id)
);

create table public.incident_report (
  id uuid primary key default gen_random_uuid(),
  tenant_id uuid not null,
  incident_id uuid not null,
  reporting_unit_id uuid not null,
  level public.report_level not null,
  created_by_account_id uuid not null,
  created_at timestamptz not null default now(),
  unique (tenant_id, id),
  unique (tenant_id, incident_id, reporting_unit_id),
  foreign key (tenant_id, incident_id) references public.incident(tenant_id, id),
  foreign key (tenant_id, reporting_unit_id) references public.organization_unit(tenant_id, id),
  foreign key (tenant_id, created_by_account_id) references public.account(tenant_id, id)
);

create table public.incident_report_version (
  id uuid primary key default gen_random_uuid(),
  tenant_id uuid not null,
  report_id uuid not null,
  parent_version_id uuid,
  version_number integer not null check (version_number > 0),
  stage public.report_stage not null,
  occurrence_or_observation_at timestamptz,
  occurrence_time_state public.value_state not null,
  location_description text not null check (btrim(location_description) <> ''),
  landmark text,
  as_of_at timestamptz not null,
  consolidation_cutoff_at timestamptz,
  prevailing_situation text not null check (btrim(prevailing_situation) <> ''),
  urgent_needs_remarks text,
  limitations text,
  state public.record_state not null default 'draft',
  prepared_by_account_id uuid not null,
  submitted_at timestamptz,
  received_at timestamptz,
  submission_key uuid,
  content_hash text,
  unique (tenant_id, id),
  unique (tenant_id, id, report_id),
  unique (tenant_id, report_id, version_number),
  unique (tenant_id, prepared_by_account_id, submission_key),
  foreign key (tenant_id, report_id) references public.incident_report(tenant_id, id),
  foreign key (tenant_id, parent_version_id) references public.incident_report_version(tenant_id, id),
  foreign key (tenant_id, prepared_by_account_id) references public.account(tenant_id, id),
  check ((occurrence_time_state in ('unknown', 'not_applicable') and occurrence_or_observation_at is null)
      or (occurrence_time_state not in ('unknown', 'not_applicable') and occurrence_or_observation_at is not null)),
  check ((state = 'draft' and submitted_at is null and submission_key is null and content_hash is null)
      or (state = 'submitted' and submitted_at is not null and submission_key is not null and content_hash is not null))
);

create function public.enforce_report_version_level()
returns trigger
language plpgsql
set search_path = pg_catalog, public
as $$
declare
  v_level public.report_level;
  v_kind public.unit_kind;
  v_unit uuid;
  v_authorized boolean;
begin
  select r.level, u.kind, r.reporting_unit_id into v_level, v_kind, v_unit
  from public.incident_report r
  join public.organization_unit u on u.tenant_id = r.tenant_id and u.id = r.reporting_unit_id
  where r.tenant_id = new.tenant_id and r.id = new.report_id;
  if v_level::text <> v_kind::text then
    raise exception 'Report level must match reporting organization-unit kind';
  end if;
  if v_level = 'purok' and new.stage <> 'initial' then
    raise exception 'A Purok report series remains Initial; corrections create successor versions';
  end if;
  if v_level = 'purok' then
    select exists(select 1 from public.purok_account a
                  where a.tenant_id = new.tenant_id and a.account_id = new.prepared_by_account_id and a.purok_unit_id = v_unit)
      and public.has_active_role(new.tenant_id, new.prepared_by_account_id, v_unit, array['purok_reporter'::public.role_code])
    into v_authorized;
  else
    select exists(select 1 from public.barangay_account a
                  where a.tenant_id = new.tenant_id and a.account_id = new.prepared_by_account_id and a.barangay_unit_id = v_unit)
      and public.has_active_role(new.tenant_id, new.prepared_by_account_id, v_unit, array['barangay_reviewer_reporter'::public.role_code])
    into v_authorized;
  end if;
  if not coalesce(v_authorized, false) then raise exception 'Report preparer lacks the required account subtype, unit, or active role'; end if;
  return new;
end
$$;

create trigger incident_report_version_level_guard
before insert or update of report_id, stage, prepared_by_account_id on public.incident_report_version
for each row execute function public.enforce_report_version_level();

create table public.report_version_source (
  id uuid primary key default gen_random_uuid(),
  tenant_id uuid not null,
  report_version_id uuid not null,
  source_id uuid not null,
  source_role text not null default 'reporting source',
  source_citation_snapshot text not null,
  source_received_at_snapshot timestamptz,
  source_notes text,
  unique (tenant_id, id),
  unique (tenant_id, report_version_id, source_id),
  foreign key (tenant_id, report_version_id) references public.incident_report_version(tenant_id, id),
  foreign key (tenant_id, source_id) references public.information_source(tenant_id, id)
);

create table public.report_effect_item (
  id uuid primary key default gen_random_uuid(),
  tenant_id uuid not null,
  report_version_id uuid not null,
  kind public.effect_kind not null,
  affected_location text,
  information_as_of_at timestamptz not null,
  source_id uuid,
  remarks text,
  unique (tenant_id, id),
  foreign key (tenant_id, report_version_id) references public.incident_report_version(tenant_id, id),
  foreign key (tenant_id, source_id) references public.information_source(tenant_id, id)
);

create table public.affected_population (
  tenant_id uuid not null,
  effect_item_id uuid primary key,
  population_category text not null default 'all affected',
  family_count bigint,
  family_count_state public.value_state not null,
  person_count bigint,
  person_count_state public.value_state not null,
  current_or_cumulative text not null default 'current',
  foreign key (tenant_id, effect_item_id) references public.report_effect_item(tenant_id, id),
  unique (tenant_id, effect_item_id),
  check (public.valid_count_state(family_count, family_count_state)),
  check (public.valid_count_state(person_count, person_count_state)),
  check (current_or_cumulative in ('current', 'cumulative'))
);

create table public.casualty_summary (
  tenant_id uuid not null,
  effect_item_id uuid primary key,
  dead_count bigint,
  dead_count_state public.value_state not null,
  injured_count bigint,
  injured_count_state public.value_state not null,
  ill_count bigint,
  ill_count_state public.value_state not null,
  missing_count bigint,
  missing_count_state public.value_state not null,
  validation_classification text not null
    check (validation_classification in ('validated', 'for_validation')),
  cause text,
  medical_assistance_summary text,
  restricted_register_reference text,
  foreign key (tenant_id, effect_item_id) references public.report_effect_item(tenant_id, id),
  unique (tenant_id, effect_item_id),
  check (public.valid_count_state(dead_count, dead_count_state)),
  check (public.valid_count_state(injured_count, injured_count_state)),
  check (public.valid_count_state(ill_count, ill_count_state)),
  check (public.valid_count_state(missing_count, missing_count_state))
);

create table public.damage_assessment (
  tenant_id uuid not null,
  effect_item_id uuid primary key,
  damage_category text not null,
  asset_or_facility_name text,
  owner_or_responsible_party text,
  assessment_at timestamptz,
  validating_agency text,
  operational_status text,
  commodity text,
  farmers_affected bigint check (farmers_affected >= 0),
  fisherfolk_affected bigint check (fisherfolk_affected >= 0),
  livestock_owners_affected bigint check (livestock_owners_affected >= 0),
  livestock_affected bigint check (livestock_affected >= 0),
  aquaculture_area_affected numeric check (aquaculture_area_affected >= 0),
  production_lost numeric check (production_lost >= 0),
  production_unit text,
  estimated_repair_cost numeric(18,2) check (estimated_repair_cost >= 0),
  damage_classification text,
  partially_damaged_quantity numeric,
  partially_damaged_state public.value_state not null,
  totally_damaged_quantity numeric,
  totally_damaged_state public.value_state not null,
  affected_area numeric,
  affected_area_state public.value_state not null,
  measurement_unit text,
  estimated_damage numeric(18,2),
  estimated_damage_state public.value_state not null,
  estimated_loss numeric(18,2),
  estimated_loss_state public.value_state not null,
  foreign key (tenant_id, effect_item_id) references public.report_effect_item(tenant_id, id),
  unique (tenant_id, effect_item_id),
  check (partially_damaged_quantity is null or partially_damaged_quantity >= 0),
  check (totally_damaged_quantity is null or totally_damaged_quantity >= 0),
  check (affected_area is null or affected_area >= 0),
  check (estimated_damage is null or estimated_damage >= 0),
  check (estimated_loss is null or estimated_loss >= 0),
  check (public.valid_numeric_state(partially_damaged_quantity, partially_damaged_state)),
  check (public.valid_numeric_state(totally_damaged_quantity, totally_damaged_state)),
  check (public.valid_numeric_state(affected_area, affected_area_state)),
  check (public.valid_numeric_state(estimated_damage, estimated_damage_state)),
  check (public.valid_numeric_state(estimated_loss, estimated_loss_state))
);

create function public.enforce_report_effect_scope()
returns trigger
language plpgsql
set search_path = pg_catalog, public
as $$
declare v_level public.report_level;
begin
  select r.level into v_level
  from public.incident_report_version rv
  join public.incident_report r on r.tenant_id = rv.tenant_id and r.id = rv.report_id
  where rv.tenant_id = new.tenant_id and rv.id = new.report_version_id;
  if v_level = 'purok' and new.kind <> 'affected_population' then
    raise exception 'Purok Initial reports may contain affected-population totals only';
  end if;
  return new;
end
$$;

create trigger report_effect_scope_guard before insert or update on public.report_effect_item
for each row execute function public.enforce_report_effect_scope();

create function public.enforce_effect_subtype()
returns trigger
language plpgsql
set search_path = pg_catalog, public
as $$
declare v_kind public.effect_kind;
begin
  if tg_op = 'UPDATE' and (new.tenant_id is distinct from old.tenant_id
      or new.effect_item_id is distinct from old.effect_item_id) then
    raise exception 'Report effect subtype identity cannot change';
  end if;
  select kind into v_kind from public.report_effect_item
  where tenant_id = new.tenant_id and id = new.effect_item_id;
  if v_kind::text <> tg_argv[0] then
    raise exception 'Effect subtype % does not match effect kind %', tg_table_name, v_kind;
  end if;
  return new;
end
$$;

create trigger affected_population_kind_guard before insert or update on public.affected_population
for each row execute function public.enforce_effect_subtype('affected_population');
create trigger casualty_summary_kind_guard before insert or update on public.casualty_summary
for each row execute function public.enforce_effect_subtype('casualty_summary');
create trigger damage_assessment_kind_guard before insert or update on public.damage_assessment
for each row execute function public.enforce_effect_subtype('damage_assessment');

create function public.enforce_effect_total_disjoint()
returns trigger
language plpgsql
set search_path = pg_catalog, public
as $$
declare
  v_tenant uuid;
  v_effect uuid;
  v_kind public.effect_kind;
  v_count integer;
begin
  if tg_table_name = 'report_effect_item' then
    if tg_op = 'DELETE' then v_tenant := old.tenant_id; v_effect := old.id;
    else v_tenant := new.tenant_id; v_effect := new.id; end if;
  else
    if tg_op = 'DELETE' then v_tenant := old.tenant_id; v_effect := old.effect_item_id;
    else v_tenant := new.tenant_id; v_effect := new.effect_item_id; end if;
  end if;
  select kind into v_kind from public.report_effect_item where tenant_id = v_tenant and id = v_effect;
  if not found then return null; end if;
  select (exists(select 1 from public.affected_population where tenant_id = v_tenant and effect_item_id = v_effect))::int
       + (exists(select 1 from public.casualty_summary where tenant_id = v_tenant and effect_item_id = v_effect))::int
       + (exists(select 1 from public.damage_assessment where tenant_id = v_tenant and effect_item_id = v_effect))::int
  into v_count;
  if v_count <> 1 then raise exception 'Each report effect must have exactly one subtype'; end if;
  if (v_kind = 'affected_population' and not exists(select 1 from public.affected_population where effect_item_id = v_effect))
     or (v_kind = 'casualty_summary' and not exists(select 1 from public.casualty_summary where effect_item_id = v_effect))
     or (v_kind = 'damage_assessment' and not exists(select 1 from public.damage_assessment where effect_item_id = v_effect)) then
    raise exception 'Report effect discriminator does not match its subtype';
  end if;
  return null;
end
$$;

create constraint trigger report_effect_total_disjoint after insert or update on public.report_effect_item
deferrable initially deferred for each row execute function public.enforce_effect_total_disjoint();
create constraint trigger affected_population_total_disjoint after insert or update or delete on public.affected_population
deferrable initially deferred for each row execute function public.enforce_effect_total_disjoint();
create constraint trigger casualty_summary_total_disjoint after insert or update or delete on public.casualty_summary
deferrable initially deferred for each row execute function public.enforce_effect_total_disjoint();
create constraint trigger damage_assessment_total_disjoint after insert or update or delete on public.damage_assessment
deferrable initially deferred for each row execute function public.enforce_effect_total_disjoint();

create table public.report_review_decision (
  id uuid primary key default gen_random_uuid(),
  tenant_id uuid not null,
  report_version_id uuid not null,
  reviewer_account_id uuid not null,
  outcome public.review_outcome not null,
  reason text,
  correction_request text,
  accepted_limitations text,
  decided_at timestamptz not null default now(),
  unique (tenant_id, id),
  unique (tenant_id, report_version_id),
  foreign key (tenant_id, report_version_id) references public.incident_report_version(tenant_id, id),
  foreign key (tenant_id, reviewer_account_id) references public.account(tenant_id, id),
  check (outcome = 'verified' or nullif(btrim(reason), '') is not null)
);

create table public.barangay_report_source (
  tenant_id uuid not null,
  barangay_report_version_id uuid not null,
  purok_report_version_id uuid not null,
  purok_report_id uuid not null,
  disposition public.source_disposition not null,
  reason text,
  reconciliation_notes text,
  added_at timestamptz not null default now(),
  primary key (tenant_id, barangay_report_version_id, purok_report_version_id),
  unique (tenant_id, barangay_report_version_id, purok_report_id),
  foreign key (tenant_id, barangay_report_version_id) references public.incident_report_version(tenant_id, id),
  foreign key (tenant_id, purok_report_version_id, purok_report_id) references public.incident_report_version(tenant_id, id, report_id),
  check (disposition = 'included' or nullif(btrim(reason), '') is not null)
);

create table public.report_version_evidence (
  tenant_id uuid not null,
  report_version_id uuid not null,
  evidence_id uuid not null,
  evidence_role text,
  primary key (tenant_id, report_version_id, evidence_id),
  foreign key (tenant_id, report_version_id) references public.incident_report_version(tenant_id, id),
  foreign key (tenant_id, evidence_id) references public.evidence(tenant_id, id)
);

create table public.situation_report (
  id uuid primary key default gen_random_uuid(),
  tenant_id uuid not null,
  city_unit_id uuid not null,
  report_number text not null,
  document_type text not null default 'Situation Report',
  title text not null,
  created_by_account_id uuid not null,
  created_at timestamptz not null default now(),
  archived_at timestamptz,
  unique (tenant_id, id),
  unique (tenant_id, report_number),
  foreign key (tenant_id, city_unit_id) references public.organization_unit(tenant_id, id),
  foreign key (tenant_id, created_by_account_id) references public.account(tenant_id, id)
);

create table public.situation_report_incident (
  tenant_id uuid not null,
  situation_report_version_id uuid not null,
  incident_id uuid not null,
  inclusion_role text not null default 'covered incident',
  incident_reference_snapshot text not null,
  incident_title_snapshot text not null,
  inclusion_notes text,
  primary key (tenant_id, situation_report_version_id, incident_id),
  foreign key (tenant_id, incident_id) references public.incident(tenant_id, id)
);

create table public.situation_report_version (
  id uuid primary key default gen_random_uuid(),
  tenant_id uuid not null,
  situation_report_id uuid not null,
  parent_version_id uuid,
  version_number integer not null check (version_number > 0),
  operational_period_start timestamptz,
  operational_period_end timestamptz,
  as_of_at timestamptz not null,
  data_cutoff_at timestamptz not null,
  change_summary text,
  state public.sitrep_state not null default 'draft',
  prepared_by_account_id uuid not null,
  prepared_at timestamptz not null default now(),
  content_hash text,
  unique (tenant_id, id),
  unique (tenant_id, situation_report_id, version_number),
  foreign key (tenant_id, situation_report_id) references public.situation_report(tenant_id, id),
  foreign key (tenant_id, parent_version_id) references public.situation_report_version(tenant_id, id),
  foreign key (tenant_id, prepared_by_account_id) references public.account(tenant_id, id),
  check (operational_period_end is null or operational_period_start is null or operational_period_end >= operational_period_start),
  check (state = 'draft' or content_hash is not null)
);

alter table public.situation_report_incident
add foreign key (tenant_id, situation_report_version_id)
references public.situation_report_version(tenant_id, id);

create table public.situation_report_section (
  id uuid primary key default gen_random_uuid(),
  tenant_id uuid not null,
  situation_report_version_id uuid not null,
  section_code text not null,
  heading text not null,
  section_status text not null default 'pending'
    check (section_status in ('pending', 'provided', 'none_reported', 'unknown', 'not_applicable')),
  status_reason text,
  sequence_number integer not null check (sequence_number > 0),
  content text not null default '',
  last_edited_by_account_id uuid not null,
  last_edited_at timestamptz not null default now(),
  unique (tenant_id, id),
  unique (tenant_id, situation_report_version_id, section_code),
  unique (tenant_id, situation_report_version_id, sequence_number),
  foreign key (tenant_id, situation_report_version_id) references public.situation_report_version(tenant_id, id),
  foreign key (tenant_id, last_edited_by_account_id) references public.account(tenant_id, id),
  check (section_code in (
    'situation_overview', 'preparedness_measures', 'consolidated_effects',
    'response_actions', 'issues_and_concerns', 'recommendations'
  )),
  check (section_status in ('pending', 'provided') or nullif(btrim(status_reason), '') is not null)
);

create table public.sitrep_source_snapshot (
  id uuid primary key default gen_random_uuid(),
  tenant_id uuid not null,
  situation_report_version_id uuid not null,
  cutoff_at timestamptz not null,
  coverage_status text not null,
  limitations text,
  frozen_at timestamptz,
  frozen_by_account_id uuid,
  snapshot_hash text,
  unique (tenant_id, id),
  unique (tenant_id, situation_report_version_id),
  foreign key (tenant_id, situation_report_version_id) references public.situation_report_version(tenant_id, id),
  foreign key (tenant_id, frozen_by_account_id) references public.account(tenant_id, id),
  check ((frozen_at is null and frozen_by_account_id is null and snapshot_hash is null)
      or (frozen_at is not null and frozen_by_account_id is not null and snapshot_hash is not null))
);

create table public.snapshot_barangay_report (
  tenant_id uuid not null,
  snapshot_id uuid not null,
  report_version_id uuid not null,
  report_id uuid not null,
  disposition public.source_disposition not null,
  reason text,
  reconciliation_notes text,
  primary key (tenant_id, snapshot_id, report_version_id),
  foreign key (tenant_id, snapshot_id) references public.sitrep_source_snapshot(tenant_id, id),
  foreign key (tenant_id, report_version_id, report_id) references public.incident_report_version(tenant_id, id, report_id),
  check (disposition = 'included' or nullif(btrim(reason), '') is not null)
);

create table public.snapshot_hazard_version (
  tenant_id uuid not null,
  snapshot_id uuid not null,
  hazard_version_id uuid not null,
  hazard_record_id uuid not null,
  disposition public.source_disposition not null,
  reason text,
  primary key (tenant_id, snapshot_id, hazard_version_id),
  foreign key (tenant_id, snapshot_id) references public.sitrep_source_snapshot(tenant_id, id),
  foreign key (tenant_id, hazard_version_id, hazard_record_id) references public.hazard_version(tenant_id, id, hazard_record_id),
  check (disposition = 'included' or nullif(btrim(reason), '') is not null)
);

create table public.sitrep_data_point (
  id uuid primary key default gen_random_uuid(),
  tenant_id uuid not null,
  situation_report_version_id uuid not null,
  section_code text not null default 'consolidated_effects',
  field_code text not null,
  label text not null,
  numeric_value numeric,
  text_value text,
  measurement_unit text,
  value_state public.value_state not null,
  aggregation_method text not null,
  source_coverage_complete boolean not null,
  source_coverage_description text not null,
  derivation_hash text not null,
  remarks text,
  unique (tenant_id, id),
  unique (tenant_id, situation_report_version_id, field_code),
  foreign key (tenant_id, situation_report_version_id) references public.situation_report_version(tenant_id, id),
  check (source_coverage_complete or value_state not in ('verified', 'reported_zero')),
  check (
    (value_state in ('unknown', 'not_applicable') and num_nonnulls(numeric_value, text_value) = 0)
    or (value_state = 'reported_zero' and numeric_value is not null and numeric_value = 0 and text_value is null)
    or (value_state in ('provisional', 'for_validation', 'verified', 'disputed') and num_nonnulls(numeric_value, text_value) = 1)
  )
);

create table public.sitrep_data_point_source (
  tenant_id uuid not null,
  sitrep_data_point_id uuid not null,
  report_effect_item_id uuid not null,
  contribution_description text,
  primary key (tenant_id, sitrep_data_point_id, report_effect_item_id),
  foreign key (tenant_id, sitrep_data_point_id) references public.sitrep_data_point(tenant_id, id),
  foreign key (tenant_id, report_effect_item_id) references public.report_effect_item(tenant_id, id)
);

create table public.sitrep_value_override (
  id uuid primary key default gen_random_uuid(),
  tenant_id uuid not null,
  sitrep_data_point_id uuid not null,
  original_value jsonb not null,
  original_derivation_hash text not null,
  replacement_value jsonb not null,
  justification text not null check (btrim(justification) <> ''),
  requested_by_account_id uuid not null,
  requested_at timestamptz not null default now(),
  approved_by_account_id uuid not null,
  approved_at timestamptz not null default now(),
  unique (tenant_id, id),
  unique (tenant_id, sitrep_data_point_id),
  foreign key (tenant_id, sitrep_data_point_id) references public.sitrep_data_point(tenant_id, id),
  foreign key (tenant_id, requested_by_account_id) references public.account(tenant_id, id),
  foreign key (tenant_id, approved_by_account_id) references public.account(tenant_id, id),
  check (approved_by_account_id <> requested_by_account_id)
);

create table public.sitrep_content_item (
  id uuid primary key default gen_random_uuid(),
  tenant_id uuid not null,
  situation_report_version_id uuid not null,
  kind public.sitrep_content_kind not null,
  sequence_number integer not null check (sequence_number > 0),
  information_as_of_at timestamptz not null,
  value_state public.value_state not null,
  source_id uuid,
  recorded_by_account_id uuid not null,
  remarks text,
  unique (tenant_id, id),
  unique (tenant_id, situation_report_version_id, kind, sequence_number),
  unique (tenant_id, id, kind),
  foreign key (tenant_id, situation_report_version_id) references public.situation_report_version(tenant_id, id),
  foreign key (tenant_id, source_id) references public.information_source(tenant_id, id),
  foreign key (tenant_id, recorded_by_account_id) references public.account(tenant_id, id)
);

create table public.sitrep_content_evidence (
  tenant_id uuid not null,
  sitrep_content_item_id uuid not null,
  evidence_id uuid not null,
  primary key (tenant_id, sitrep_content_item_id, evidence_id),
  foreign key (tenant_id, sitrep_content_item_id) references public.sitrep_content_item(tenant_id, id),
  foreign key (tenant_id, evidence_id) references public.evidence(tenant_id, id)
);

create table public.sitrep_decision (
  id uuid primary key default gen_random_uuid(),
  tenant_id uuid not null,
  situation_report_version_id uuid not null,
  stage public.sitrep_decision_stage not null,
  decision public.sitrep_decision_value not null,
  comments text,
  decided_by_account_id uuid not null,
  decided_at timestamptz not null default now(),
  unique (tenant_id, id),
  unique (tenant_id, situation_report_version_id, stage),
  foreign key (tenant_id, situation_report_version_id) references public.situation_report_version(tenant_id, id),
  foreign key (tenant_id, decided_by_account_id) references public.account(tenant_id, id),
  check (decision = 'accepted' or nullif(btrim(comments), '') is not null)
);

create table public.sitrep_signatory (
  id uuid primary key default gen_random_uuid(),
  tenant_id uuid not null,
  situation_report_version_id uuid not null,
  sequence_number integer not null check (sequence_number > 0),
  signatory_role text not null,
  display_name text not null,
  designation text not null,
  unique (tenant_id, id),
  unique (tenant_id, situation_report_version_id, sequence_number),
  foreign key (tenant_id, situation_report_version_id) references public.situation_report_version(tenant_id, id)
);

create table public.sitrep_annex (
  id uuid primary key default gen_random_uuid(),
  tenant_id uuid not null,
  situation_report_version_id uuid not null,
  sequence_number integer not null check (sequence_number > 0),
  annex_code text not null,
  title text not null,
  description text,
  storage_path text not null,
  integrity_checksum text not null,
  unique (tenant_id, id),
  unique (tenant_id, situation_report_version_id, sequence_number),
  foreign key (tenant_id, situation_report_version_id) references public.situation_report_version(tenant_id, id)
);

create table public.sitrep_export (
  id uuid primary key default gen_random_uuid(),
  tenant_id uuid not null,
  situation_report_version_id uuid not null,
  format text not null check (format in ('pdf', 'docx')),
  filename text not null,
  storage_path text not null,
  watermarked boolean not null,
  content_hash text not null,
  generated_by_account_id uuid not null,
  generated_at timestamptz not null default now(),
  unique (tenant_id, id),
  foreign key (tenant_id, situation_report_version_id) references public.situation_report_version(tenant_id, id),
  foreign key (tenant_id, generated_by_account_id) references public.account(tenant_id, id)
);

create table public.audit_event (
  id bigint generated always as identity primary key,
  tenant_id uuid not null,
  actor_account_id uuid,
  action text not null,
  entity_type text not null,
  entity_id uuid,
  previous_state jsonb,
  new_state jsonb,
  reason text,
  occurred_at timestamptz not null default now(),
  unique (tenant_id, id),
  foreign key (tenant_id) references public.tenant(id),
  foreign key (tenant_id, actor_account_id) references public.account(tenant_id, id)
);

-- Explicit aggregate profile fields. Purok and Barangay remain separate workflows
-- and monthly series through profile.level; level-specific views follow below.
create table public.profile_population (
  tenant_id uuid not null,
  profile_version_id uuid primary key,
  population_count bigint,
  population_count_state public.value_state not null default 'unknown',
  check (public.valid_count_state(population_count, population_count_state)),
  household_count bigint,
  household_count_state public.value_state not null default 'unknown',
  check (public.valid_count_state(household_count, household_count_state)),
  family_count bigint,
  family_count_state public.value_state not null default 'unknown',
  check (public.valid_count_state(family_count, family_count_state)),
  male_count bigint,
  male_count_state public.value_state not null default 'unknown',
  check (public.valid_count_state(male_count, male_count_state)),
  female_count bigint,
  female_count_state public.value_state not null default 'unknown',
  check (public.valid_count_state(female_count, female_count_state)),
  check (male_count is null or population_count is null or male_count <= population_count),
  check (female_count is null or population_count is null or female_count <= population_count),
  check (male_count is null or female_count is null or population_count is null
    or male_count + female_count <= population_count),
  source_id uuid not null,
  foreign key (tenant_id, profile_version_id) references public.profile_version(tenant_id, id),
  foreign key (tenant_id, source_id) references public.information_source(tenant_id, id),
  unique (tenant_id, profile_version_id)
);

create table public.profile_housing (
  tenant_id uuid not null,
  profile_version_id uuid primary key,
  housing_unit_count bigint,
  housing_unit_count_state public.value_state not null default 'unknown',
  check (public.valid_count_state(housing_unit_count, housing_unit_count_state)),
  light_material_count bigint,
  light_material_count_state public.value_state not null default 'unknown',
  check (public.valid_count_state(light_material_count, light_material_count_state)),
  near_water_count bigint,
  near_water_count_state public.value_state not null default 'unknown',
  check (public.valid_count_state(near_water_count, near_water_count_state)),
  near_fault_count bigint,
  near_fault_count_state public.value_state not null default 'unknown',
  check (public.valid_count_state(near_fault_count, near_fault_count_state)),
  check (light_material_count is null or housing_unit_count is null or light_material_count <= housing_unit_count),
  check (near_water_count is null or housing_unit_count is null or near_water_count <= housing_unit_count),
  check (near_fault_count is null or housing_unit_count is null or near_fault_count <= housing_unit_count),
  source_id uuid not null,
  foreign key (tenant_id, profile_version_id) references public.profile_version(tenant_id, id),
  foreign key (tenant_id, source_id) references public.information_source(tenant_id, id),
  unique (tenant_id, profile_version_id)
);

create table public.profile_demographic (
  tenant_id uuid not null,
  profile_version_id uuid not null,
  category text not null check (category in ('infants','children','adults','senior_citizens','persons_with_disabilities','pregnant_women','lactating_women')),
  person_count bigint,
  person_count_state public.value_state not null default 'unknown',
  check (public.valid_count_state(person_count, person_count_state)),
  category_definition text not null check (btrim(category_definition) <> ''),
  source_id uuid not null,
  primary key (tenant_id, profile_version_id, category),
  foreign key (tenant_id, profile_version_id) references public.profile_version(tenant_id, id),
  foreign key (tenant_id, source_id) references public.information_source(tenant_id, id)
);
create table public.profile_hazard_exposure (
  id uuid primary key default gen_random_uuid(),
  tenant_id uuid not null,
  profile_version_id uuid not null,
  hazard_type_id uuid not null,
  exposed_family_count bigint,
  exposed_family_count_state public.value_state not null default 'unknown',
  check (public.valid_count_state(exposed_family_count, exposed_family_count_state)),
  exposed_household_count bigint,
  exposed_household_count_state public.value_state not null default 'unknown',
  check (public.valid_count_state(exposed_household_count, exposed_household_count_state)),
  exposed_person_count bigint,
  exposed_person_count_state public.value_state not null default 'unknown',
  check (public.valid_count_state(exposed_person_count, exposed_person_count_state)),
  exposure_basis text not null,
  map_reference text,
  source_id uuid not null,
  remarks text,
  unique (tenant_id, id),
  unique (tenant_id, profile_version_id, hazard_type_id),
  foreign key (tenant_id, profile_version_id) references public.profile_version(tenant_id, id),
  foreign key (tenant_id, hazard_type_id) references public.hazard_type(tenant_id, id),
  foreign key (tenant_id, source_id) references public.information_source(tenant_id, id)
);
create table public.profile_exposed_group (
  tenant_id uuid not null,
  exposure_id uuid not null,
  group_name text not null,
  person_count bigint,
  person_count_state public.value_state not null default 'unknown',
  check (public.valid_count_state(person_count, person_count_state)),
  primary key (tenant_id, exposure_id, group_name),
  foreign key (tenant_id, exposure_id) references public.profile_hazard_exposure(tenant_id, id)
);
create table public.hazard_characteristic (
  tenant_id uuid not null,
  hazard_version_id uuid primary key,
  intensity_or_magnitude numeric,
  intensity_unit text,
  duration_hours numeric check (duration_hours >= 0),
  alert_level text,
  current_status text not null,
  advisory_agency text,
  advisory_number text,
  advisory_issued_at timestamptz,
  expected_development text,
  source_id uuid not null,
  unique (tenant_id, hazard_version_id),
  foreign key (tenant_id, hazard_version_id) references public.hazard_version(tenant_id, id),
  foreign key (tenant_id, source_id) references public.information_source(tenant_id, id),
  check (intensity_or_magnitude is null or nullif(btrim(intensity_unit), '') is not null)
);
-- The incident effect data remain aggregates; no named household/casualty register.
create table public.evacuation_center (
  id uuid primary key default gen_random_uuid(),
  tenant_id uuid not null,
  unit_id uuid not null,
  name text not null,
  location_description text not null,
  managing_organization text,
  capacity_persons bigint check (capacity_persons >= 0),
  unique (tenant_id, id),
  foreign key (tenant_id, unit_id) references public.organization_unit(tenant_id, id)
);

create table public.sitrep_incident_overview (
  tenant_id uuid not null,
  content_item_id uuid primary key,
  kind public.sitrep_content_kind generated always as ('incident_overview'::public.sitrep_content_kind) stored,
  incident_id uuid not null,
  incident_name text not null,
  primary_hazard text not null,
  onset_at timestamptz,
  discovered_at timestamptz,
  current_status text not null,
  incident_scale text,
  description text not null,
  foreign key (tenant_id, incident_id) references public.incident(tenant_id, id),
  unique (tenant_id, content_item_id),
  foreign key (tenant_id, content_item_id, kind) references public.sitrep_content_item(tenant_id, id, kind)
);

create table public.sitrep_geographic_coverage (
  tenant_id uuid not null,
  content_item_id uuid primary key,
  kind public.sitrep_content_kind generated always as ('geographic_coverage'::public.sitrep_content_kind) stored,
  unit_id uuid not null,
  location_description text not null,
  landmark text,
  affected_area numeric check (affected_area >= 0),
  area_unit text,
  accessibility text,
  foreign key (tenant_id, unit_id) references public.organization_unit(tenant_id, id),
  unique (tenant_id, content_item_id),
  foreign key (tenant_id, content_item_id, kind) references public.sitrep_content_item(tenant_id, id, kind)
);

create table public.sitrep_hazard_condition (
  tenant_id uuid not null,
  content_item_id uuid primary key,
  kind public.sitrep_content_kind generated always as ('hazard_condition'::public.sitrep_content_kind) stored,
  hazard_version_id uuid not null,
  severity text,
  intensity numeric,
  intensity_unit text,
  alert_level text,
  advisory_agency text,
  advisory_number text,
  advisory_issued_at timestamptz,
  expected_development text,
  foreign key (tenant_id, hazard_version_id) references public.hazard_version(tenant_id, id),
  unique (tenant_id, content_item_id),
  foreign key (tenant_id, content_item_id, kind) references public.sitrep_content_item(tenant_id, id, kind)
);

create table public.sitrep_chronology (
  tenant_id uuid not null,
  content_item_id uuid primary key,
  kind public.sitrep_content_kind generated always as ('chronology'::public.sitrep_content_kind) stored,
  event_at timestamptz not null,
  event_type text not null,
  description text not null,
  location_description text not null,
  reported_by text not null,
  unique (tenant_id, content_item_id),
  foreign key (tenant_id, content_item_id, kind) references public.sitrep_content_item(tenant_id, id, kind)
);

create table public.sitrep_preparedness_measure (
  tenant_id uuid not null,
  content_item_id uuid primary key,
  kind public.sitrep_content_kind generated always as ('preparedness_measure'::public.sitrep_content_kind) stored,
  category text not null,
  responsible_agency text not null,
  measure_description text not null,
  location_covered text,
  initiated_at timestamptz,
  status text not null,
  response_units_on_standby text,
  evacuation_center_status text,
  dissemination_method text,
  dissemination_reach bigint check (dissemination_reach >= 0),
  unique (tenant_id, content_item_id),
  foreign key (tenant_id, content_item_id, kind) references public.sitrep_content_item(tenant_id, id, kind)
);

create table public.sitrep_exposure_summary (
  tenant_id uuid not null,
  content_item_id uuid primary key,
  kind public.sitrep_content_kind generated always as ('exposure_summary'::public.sitrep_content_kind) stored,
  unit_id uuid not null,
  hazard_type_id uuid not null,
  exposure_category text not null,
  baseline_profile_version_id uuid,
  baseline_quantity numeric(18,2),
  baseline_quantity_state public.value_state not null default 'unknown',
  check (public.valid_numeric_state(baseline_quantity, baseline_quantity_state)),
  affected_quantity numeric(18,2),
  affected_quantity_state public.value_state not null default 'unknown',
  check (public.valid_numeric_state(affected_quantity, affected_quantity_state)),
  damaged_quantity numeric(18,2),
  damaged_quantity_state public.value_state not null default 'unknown',
  check (public.valid_numeric_state(damaged_quantity, damaged_quantity_state)),
  measurement_unit text not null,
  impact_severity text,
  foreign key (tenant_id, unit_id) references public.organization_unit(tenant_id, id),
  foreign key (tenant_id, hazard_type_id) references public.hazard_type(tenant_id, id),
  foreign key (tenant_id, baseline_profile_version_id) references public.profile_version(tenant_id, id),
  unique (tenant_id, content_item_id),
  foreign key (tenant_id, content_item_id, kind) references public.sitrep_content_item(tenant_id, id, kind)
);

create table public.sitrep_related_incident (
  tenant_id uuid not null,
  content_item_id uuid primary key,
  kind public.sitrep_content_kind generated always as ('related_incident'::public.sitrep_content_kind) stored,
  incident_id uuid not null,
  relationship_to_primary text not null,
  location_description text not null,
  landmark text,
  occurred_at timestamptz,
  description text not null,
  effects text,
  actions_taken text,
  current_status text not null,
  foreign key (tenant_id, incident_id) references public.incident(tenant_id, id),
  unique (tenant_id, content_item_id),
  foreign key (tenant_id, content_item_id, kind) references public.sitrep_content_item(tenant_id, id, kind)
);

create table public.sitrep_displaced_population (
  tenant_id uuid not null,
  content_item_id uuid primary key,
  kind public.sitrep_content_kind generated always as ('displaced_population'::public.sitrep_content_kind) stored,
  unit_id uuid not null,
  evacuation_center_id uuid,
  accommodation text not null check (accommodation in ('inside_center','outside_center')),
  family_count bigint,
  family_count_state public.value_state not null default 'unknown',
  check (public.valid_count_state(family_count, family_count_state)),
  person_count bigint,
  person_count_state public.value_state not null default 'unknown',
  check (public.valid_count_state(person_count, person_count_state)),
  count_basis text not null check (count_basis in ('current','cumulative')),
  center_opened_at timestamptz,
  center_closed_at timestamptz,
  managing_organization text,
  check (accommodation <> 'inside_center' or evacuation_center_id is not null),
  check (center_closed_at is null or center_opened_at is null or center_closed_at >= center_opened_at),
  foreign key (tenant_id, unit_id) references public.organization_unit(tenant_id, id),
  foreign key (tenant_id, evacuation_center_id) references public.evacuation_center(tenant_id, id),
  unique (tenant_id, content_item_id),
  foreign key (tenant_id, content_item_id, kind) references public.sitrep_content_item(tenant_id, id, kind)
);

create table public.sitrep_lifeline_status (
  tenant_id uuid not null,
  content_item_id uuid primary key,
  kind public.sitrep_content_kind generated always as ('lifeline_status'::public.sitrep_content_kind) stored,
  category text not null,
  service_provider text not null,
  affected_unit_id uuid not null,
  service_status text not null,
  interrupted_service_percent numeric(5,2) check (interrupted_service_percent between 0 and 100),
  interrupted_at timestamptz,
  restored_at timestamptz,
  expected_restoration_at timestamptz,
  cause text,
  advisory_number text,
  foreign key (tenant_id, affected_unit_id) references public.organization_unit(tenant_id, id),
  check (restored_at is null or interrupted_at is null or restored_at >= interrupted_at),
  unique (tenant_id, content_item_id),
  foreign key (tenant_id, content_item_id, kind) references public.sitrep_content_item(tenant_id, id, kind)
);

create table public.sitrep_class_work_suspension (
  tenant_id uuid not null,
  content_item_id uuid primary key,
  kind public.sitrep_content_kind generated always as ('class_work_suspension'::public.sitrep_content_kind) stored,
  suspension_category text not null,
  sector text not null,
  education_level text,
  geographic_coverage text not null,
  suspension_start_at timestamptz not null,
  resumption_at timestamptz,
  issuing_authority text not null,
  order_or_advisory_number text,
  status text not null,
  check (resumption_at is null or resumption_at >= suspension_start_at),
  unique (tenant_id, content_item_id),
  foreign key (tenant_id, content_item_id, kind) references public.sitrep_content_item(tenant_id, id, kind)
);

create table public.sitrep_calamity_declaration (
  tenant_id uuid not null,
  content_item_id uuid primary key,
  kind public.sitrep_content_kind generated always as ('calamity_declaration'::public.sitrep_content_kind) stored,
  geographic_coverage text not null,
  declaration_level text not null,
  declaring_body text not null,
  resolution_or_ordinance_number text not null,
  resolution_date date,
  effective_date date,
  declaration_reason text,
  executive_order_number text,
  status text not null,
  unique (tenant_id, content_item_id),
  foreign key (tenant_id, content_item_id, kind) references public.sitrep_content_item(tenant_id, id, kind)
);

create table public.sitrep_preemptive_evacuation (
  tenant_id uuid not null,
  content_item_id uuid primary key,
  kind public.sitrep_content_kind generated always as ('preemptive_evacuation'::public.sitrep_content_kind) stored,
  hazard_basis text not null,
  evacuation_order text,
  location_description text not null,
  evacuation_center_id uuid,
  family_count bigint,
  family_count_state public.value_state not null default 'unknown',
  check (public.valid_count_state(family_count, family_count_state)),
  person_count bigint,
  person_count_state public.value_state not null default 'unknown',
  check (public.valid_count_state(person_count, person_count_state)),
  animal_count bigint,
  animal_count_state public.value_state not null default 'unknown',
  check (public.valid_count_state(animal_count, animal_count_state)),
  started_at timestamptz,
  ended_at timestamptz,
  status text not null,
  foreign key (tenant_id, evacuation_center_id) references public.evacuation_center(tenant_id, id),
  check (ended_at is null or started_at is null or ended_at >= started_at),
  unique (tenant_id, content_item_id),
  foreign key (tenant_id, content_item_id, kind) references public.sitrep_content_item(tenant_id, id, kind)
);

create table public.sitrep_response_action (
  tenant_id uuid not null,
  content_item_id uuid primary key,
  kind public.sitrep_content_kind generated always as ('response_action'::public.sitrep_content_kind) stored,
  response_phase text,
  response_cluster text not null,
  action_category text not null,
  responsible_organization text not null,
  involved_agencies text,
  responsible_team text,
  description text not null,
  affected_unit_id uuid,
  started_at timestamptz,
  completed_at timestamptz,
  status text not null,
  persons_served bigint,
  persons_served_state public.value_state not null default 'unknown',
  check (public.valid_count_state(persons_served, persons_served_state)),
  coverage_description text,
  resources_used text,
  operation_result text,
  remaining_gap text,
  next_planned_action text,
  foreign key (tenant_id, affected_unit_id) references public.organization_unit(tenant_id, id),
  check (completed_at is null or started_at is null or completed_at >= started_at),
  unique (tenant_id, content_item_id),
  foreign key (tenant_id, content_item_id, kind) references public.sitrep_content_item(tenant_id, id, kind)
);

create table public.sitrep_assistance_provided (
  tenant_id uuid not null,
  content_item_id uuid primary key,
  kind public.sitrep_content_kind generated always as ('assistance_provided'::public.sitrep_content_kind) stored,
  recipient_group text not null,
  recipient_unit_id uuid,
  assistance_category text not null,
  assistance_item text not null,
  provider text not null,
  quantity numeric(18,2),
  quantity_state public.value_state not null default 'unknown',
  check (public.valid_numeric_state(quantity, quantity_state)),
  measurement_unit text,
  unit_cost numeric(18,2) check (unit_cost >= 0),
  total_cost numeric(18,2) check (total_cost >= 0),
  funding_or_resource_source text,
  distributed_at timestamptz,
  families_served bigint,
  families_served_state public.value_state not null default 'unknown',
  check (public.valid_count_state(families_served, families_served_state)),
  persons_served bigint,
  persons_served_state public.value_state not null default 'unknown',
  check (public.valid_count_state(persons_served, persons_served_state)),
  distribution_status text not null,
  foreign key (tenant_id, recipient_unit_id) references public.organization_unit(tenant_id, id),
  unique (tenant_id, content_item_id),
  foreign key (tenant_id, content_item_id, kind) references public.sitrep_content_item(tenant_id, id, kind)
);

create table public.sitrep_issue_concern (
  tenant_id uuid not null,
  content_item_id uuid primary key,
  kind public.sitrep_content_kind generated always as ('issue_concern'::public.sitrep_content_kind) stored,
  reference_number text not null,
  category text not null,
  description text not null,
  affected_location text not null,
  identified_at timestamptz not null,
  cause text,
  severity text,
  urgency text,
  assistance_required text,
  responsible_organization text,
  status text not null,
  unique (tenant_id, content_item_id),
  foreign key (tenant_id, content_item_id, kind) references public.sitrep_content_item(tenant_id, id, kind)
);

create table public.sitrep_recommendation (
  tenant_id uuid not null,
  content_item_id uuid primary key,
  kind public.sitrep_content_kind generated always as ('recommendation'::public.sitrep_content_kind) stored,
  reference_number text not null,
  related_issue_content_item_id uuid,
  category text not null,
  recommended_action text not null,
  basis text not null,
  target_organization text not null,
  priority text,
  required_resources text,
  estimated_budget numeric(18,2) check (estimated_budget >= 0),
  target_date date,
  expected_outcome text,
  decision_authority text,
  approval_status text not null,
  implementation_status text not null,
  result text,
  foreign key (tenant_id, related_issue_content_item_id) references public.sitrep_issue_concern(tenant_id, content_item_id),
  unique (tenant_id, content_item_id),
  foreign key (tenant_id, content_item_id, kind) references public.sitrep_content_item(tenant_id, id, kind)
);

create unique index account_username_unique on public.account(lower(username));
comment on table public.profile_demographic is 'Aggregate categories may overlap. Record the adopted age/group definition; do not sum vulnerability groups into total population.';
comment on table public.profile_housing is 'Light materials, near water, and near fault categories overlap; their sum is not total housing.';
comment on table public.profile_hazard_exposure is 'Baseline exposure by hazard, not observed disaster impact. Multi-hazard exposed populations must not be summed across hazards.';
comment on table public.hazard_characteristic is 'Typed hazard condition fields; the linked hazard_version preserves identification, time, description and severity.';
comment on table public.sitrep_content_item is 'DRRM-authored evidence and provenance shared by one disjoint typed section detail. No arbitrary JSON form payload.';

create function public.enforce_version_lineage()
returns trigger
language plpgsql
set search_path = pg_catalog, public
as $$
declare
  v_parent uuid := (to_jsonb(new) ->> 'parent_version_id')::uuid;
  v_series uuid := (to_jsonb(new) ->> tg_argv[1])::uuid;
  v_parent_series uuid;
  v_parent_number integer;
  v_parent_state text;
begin
  if tg_op = 'INSERT' and (to_jsonb(new) ->> 'state') <> 'draft' then
    raise exception 'A version must be created as a draft';
  end if;
  if v_parent is null then
    if new.version_number <> 1 then raise exception 'A first version must use version number 1'; end if;
  else
    if v_parent = new.id then raise exception 'A version cannot be its own parent'; end if;
    execute format(
      'select %I, version_number, state::text from public.%I where tenant_id = $1 and id = $2 for update',
      tg_argv[1], tg_argv[0]
    ) into v_parent_series, v_parent_number, v_parent_state using new.tenant_id, v_parent;
    if v_parent_series is null or v_parent_series <> v_series then raise exception 'Parent version must belong to the same series'; end if;
    if new.version_number <> v_parent_number + 1 then raise exception 'Version number must immediately follow its parent'; end if;
    if v_parent_state = 'draft' then raise exception 'A correction can only follow a finalized version'; end if;
  end if;
  return new;
end
$$;

create trigger profile_version_lineage before insert or update of parent_version_id, version_number, profile_id
on public.profile_version for each row execute function public.enforce_version_lineage('profile_version', 'profile_id');
create trigger hazard_version_lineage before insert or update of parent_version_id, version_number, hazard_record_id
on public.hazard_version for each row execute function public.enforce_version_lineage('hazard_version', 'hazard_record_id');
create trigger report_version_lineage before insert or update of parent_version_id, version_number, report_id
on public.incident_report_version for each row execute function public.enforce_version_lineage('incident_report_version', 'report_id');
create trigger sitrep_version_lineage before insert or update of parent_version_id, version_number, situation_report_id
on public.situation_report_version for each row execute function public.enforce_version_lineage('situation_report_version', 'situation_report_id');

create function public.protect_series_identity()
returns trigger
language plpgsql
set search_path = pg_catalog, public
as $$
declare v_exists boolean;
begin
  execute format('select exists(select 1 from public.%I where tenant_id = $1 and %I = $2)', tg_argv[0], tg_argv[1])
    into v_exists using old.tenant_id, old.id;
  if v_exists then raise exception 'Series ownership/discriminator cannot change after a version exists'; end if;
  return new;
end
$$;

create trigger profile_identity_immutable before update of tenant_id, unit_id, level, reporting_month on public.profile
for each row execute function public.protect_series_identity('profile_version', 'profile_id');
create trigger hazard_identity_immutable before update of tenant_id, unit_id, hazard_type_id on public.hazard_record
for each row execute function public.protect_series_identity('hazard_version', 'hazard_record_id');
create trigger report_identity_immutable before update of tenant_id, incident_id, reporting_unit_id, level on public.incident_report
for each row execute function public.protect_series_identity('incident_report_version', 'report_id');
create trigger sitrep_identity_immutable before update of tenant_id, city_unit_id, report_number on public.situation_report
for each row execute function public.protect_series_identity('situation_report_version', 'situation_report_id');

create function public.protect_organization_scope()
returns trigger
language plpgsql
set search_path = pg_catalog, public
as $$
begin
  if old.tenant_id <> new.tenant_id or old.parent_id is distinct from new.parent_id or old.kind <> new.kind then
    if exists(select 1 from public.organization_unit where tenant_id = old.tenant_id and parent_id = old.id)
       or exists(select 1 from public.purok_account where tenant_id = old.tenant_id and purok_unit_id = old.id)
       or exists(select 1 from public.barangay_account where tenant_id = old.tenant_id and barangay_unit_id = old.id)
       or exists(select 1 from public.drrm_account where tenant_id = old.tenant_id and city_unit_id = old.id)
       or exists(select 1 from public.profile where tenant_id = old.tenant_id and unit_id = old.id)
       or exists(select 1 from public.hazard_record where tenant_id = old.tenant_id and unit_id = old.id)
       or exists(select 1 from public.incident_report where tenant_id = old.tenant_id and reporting_unit_id = old.id)
       or exists(select 1 from public.situation_report where tenant_id = old.tenant_id and city_unit_id = old.id) then
      raise exception 'Organization scope cannot change after dependent records exist';
    end if;
  end if;
  return new;
end
$$;

create trigger organization_scope_immutable before update on public.organization_unit
for each row execute function public.protect_organization_scope();

create function public.validate_report_submission()
returns trigger
language plpgsql
set search_path = pg_catalog, public
as $$
declare
  v_level public.report_level;
  v_incident uuid;
  v_sources integer;
  v_population integer;
  v_casualty integer;
  v_damage integer;
  v_included integer;
  v_effects jsonb;
  v_source_snapshot jsonb;
  v_consolidation_sources jsonb;
  v_evidence jsonb;
begin
  if old.state = 'draft' and new.state = 'submitted' then
    if new.submission_key is null then raise exception 'Submission key is required'; end if;
    select level, incident_id into v_level, v_incident
    from public.incident_report where tenant_id = new.tenant_id and id = new.report_id;
    perform 1 from public.incident
    where tenant_id = new.tenant_id and id = v_incident for update;
    if not exists(select 1 from public.incident_hazard where tenant_id = new.tenant_id and incident_id = v_incident) then
      raise exception 'A submitted incident report requires an associated hazard version';
    end if;
    select count(*) into v_sources from public.report_version_source
    where tenant_id = new.tenant_id and report_version_id = new.id;
    if v_sources = 0 then raise exception 'A submitted report requires at least one information source'; end if;
    select count(*) filter (where kind = 'affected_population'),
           count(*) filter (where kind = 'casualty_summary'),
           count(*) filter (where kind = 'damage_assessment')
    into v_population, v_casualty, v_damage
    from public.report_effect_item where tenant_id = new.tenant_id and report_version_id = new.id;
    if v_level = 'purok' then
      if new.stage <> 'initial' or v_population = 0 or v_casualty <> 0 or v_damage <> 0 then
        raise exception 'Purok submission requires affected population only and must remain Initial';
      end if;
    else
      if new.consolidation_cutoff_at is null then raise exception 'Barangay consolidation cutoff is required'; end if;
      select count(*) into v_included from public.barangay_report_source
      where tenant_id = new.tenant_id and barangay_report_version_id = new.id and disposition = 'included';
      if v_included = 0 or v_population = 0 or v_casualty = 0 or v_damage = 0 then
        raise exception 'Barangay submission requires an included verified Purok source and population, casualty, and damage effects';
      end if;
      if exists(
        select 1
        from public.barangay_report_source bs
        join public.incident_report_version pv on pv.tenant_id = bs.tenant_id and pv.id = bs.purok_report_version_id
        join public.incident_report pr on pr.tenant_id = pv.tenant_id and pr.id = pv.report_id
        join public.organization_unit pu on pu.tenant_id = pr.tenant_id and pu.id = pr.reporting_unit_id
        join public.incident_report_version bv on bv.tenant_id = bs.tenant_id and bv.id = bs.barangay_report_version_id
        join public.incident_report br on br.tenant_id = bv.tenant_id and br.id = bv.report_id
        where bs.tenant_id = new.tenant_id and bs.barangay_report_version_id = new.id and bs.disposition = 'included'
          and (pv.state <> 'submitted' or pv.as_of_at > new.consolidation_cutoff_at
            or pr.level <> 'purok' or br.level <> 'barangay' or pr.incident_id <> br.incident_id
            or pu.parent_id <> br.reporting_unit_id
            or not exists(select 1 from public.report_review_decision d where d.tenant_id = pv.tenant_id and d.report_version_id = pv.id and d.outcome = 'verified'))
      ) then raise exception 'Barangay source set is no longer eligible at the consolidation cutoff';
      end if;
    end if;
    select coalesce(jsonb_agg(jsonb_build_object(
      'effect', to_jsonb(e),
      'affected_population', to_jsonb(ap),
      'casualty_summary', to_jsonb(cs),
      'damage_assessment', to_jsonb(da)
    ) order by e.id), '[]'::jsonb) into v_effects
    from public.report_effect_item e
    left join public.affected_population ap on ap.tenant_id = e.tenant_id and ap.effect_item_id = e.id
    left join public.casualty_summary cs on cs.tenant_id = e.tenant_id and cs.effect_item_id = e.id
    left join public.damage_assessment da on da.tenant_id = e.tenant_id and da.effect_item_id = e.id
    where e.tenant_id = new.tenant_id and e.report_version_id = new.id;
    select coalesce(jsonb_agg(to_jsonb(s) order by s.id), '[]'::jsonb) into v_source_snapshot
    from public.report_version_source s where s.tenant_id = new.tenant_id and s.report_version_id = new.id;
    select coalesce(jsonb_agg(to_jsonb(s) order by s.purok_report_version_id), '[]'::jsonb) into v_consolidation_sources
    from public.barangay_report_source s
    where s.tenant_id = new.tenant_id and s.barangay_report_version_id = new.id;
    select coalesce(jsonb_agg(jsonb_build_object('link', to_jsonb(l), 'checksum', e.integrity_checksum) order by e.id), '[]'::jsonb)
    into v_evidence
    from public.report_version_evidence l join public.evidence e on e.tenant_id = l.tenant_id and e.id = l.evidence_id
    where l.tenant_id = new.tenant_id and l.report_version_id = new.id;
    new.submitted_at := coalesce(new.submitted_at, now());
    new.content_hash := encode(pg_catalog.sha256(convert_to(
      ((to_jsonb(new) - 'content_hash' - 'submitted_at') || jsonb_build_object(
        'effects', v_effects,
        'sources', v_source_snapshot,
        'consolidated_purok_versions', v_consolidation_sources,
        'evidence', v_evidence
      ))::text, 'UTF8')), 'hex');
  elsif new.state <> old.state then
    raise exception 'Invalid incident-report state transition';
  end if;
  return new;
end
$$;

create trigger report_submission_gate before update of state on public.incident_report_version
for each row execute function public.validate_report_submission();

create function public.validate_profile_or_hazard_submission()
returns trigger language plpgsql set search_path = pg_catalog, public as $$
declare
  v_values jsonb;
  v_evidence jsonb;
  v_sources jsonb := '[]'::jsonb;
  v_profile public.profile%rowtype;
begin
  if old.state = 'draft' and new.state = 'submitted' then
    if new.submission_key is null then raise exception 'Submission key is required'; end if;
    if tg_table_name = 'profile_version' then
      select * into v_profile from public.profile where tenant_id = new.tenant_id and id = new.profile_id;
      if date_trunc('month', new.as_of_date)::date <> v_profile.reporting_month then
        raise exception 'Profile observation date must belong to its reporting month';
      end if;
      if not exists(select 1 from public.profile_population where tenant_id = new.tenant_id and profile_version_id = new.id)
        or not exists(select 1 from public.profile_housing where tenant_id = new.tenant_id and profile_version_id = new.id)
        or (select count(*) from public.profile_demographic where tenant_id = new.tenant_id and profile_version_id = new.id) <> 7
        or not exists(select 1 from public.profile_hazard_exposure where tenant_id = new.tenant_id and profile_version_id = new.id) then
        raise exception 'Profile requires population, housing, all seven demographic categories and hazard exposure';
      end if;
      if exists(select 1 from public.hazard_type h where h.tenant_id = new.tenant_id and h.active
        and not exists(select 1 from public.profile_hazard_exposure e
          where e.tenant_id = new.tenant_id and e.profile_version_id = new.id and e.hazard_type_id = h.id)) then
        raise exception 'Account for each configured active hazard; record unknown or not applicable explicitly';
      end if;
      if v_profile.level = 'barangay' then
        if not exists(select 1 from public.organization_unit u where u.tenant_id = new.tenant_id and u.parent_id = v_profile.unit_id and u.active)
          or exists(select 1 from public.organization_unit u where u.tenant_id = new.tenant_id and u.parent_id = v_profile.unit_id and u.active
            and not exists(select 1 from public.barangay_profile_source s
              join public.profile_version pv on pv.tenant_id = s.tenant_id and pv.id = s.purok_profile_version_id
              join public.profile p on p.tenant_id = pv.tenant_id and p.id = pv.profile_id
              join public.profile_review_decision d on d.tenant_id = pv.tenant_id and d.profile_version_id = pv.id and d.outcome = 'verified'
              where s.tenant_id = new.tenant_id and s.barangay_profile_version_id = new.id
                and s.disposition = 'included' and p.unit_id = u.id and p.reporting_month = v_profile.reporting_month
                and pv.state = 'submitted')) then
          raise exception 'Barangay monthly profile requires verified profiles from every active Purok';
        end if;
      end if;
      select coalesce(jsonb_agg(to_jsonb(s) order by s.purok_profile_version_id), '[]'::jsonb) into v_sources
      from public.barangay_profile_source s where s.tenant_id = new.tenant_id and s.barangay_profile_version_id = new.id;
      select jsonb_build_object(
        'population', (select to_jsonb(x) from public.profile_population x where x.tenant_id = new.tenant_id and x.profile_version_id = new.id),
        'housing', (select to_jsonb(x) from public.profile_housing x where x.tenant_id = new.tenant_id and x.profile_version_id = new.id),
        'demographics', (select jsonb_agg(to_jsonb(x) order by x.category) from public.profile_demographic x where x.tenant_id = new.tenant_id and x.profile_version_id = new.id),
        'exposures', (select jsonb_agg(to_jsonb(x) order by x.id) from public.profile_hazard_exposure x where x.tenant_id = new.tenant_id and x.profile_version_id = new.id),
        'exposed_groups', coalesce((select jsonb_agg(to_jsonb(g) order by g.exposure_id, g.group_name)
          from public.profile_exposed_group g join public.profile_hazard_exposure e on e.tenant_id = g.tenant_id and e.id = g.exposure_id
          where e.tenant_id = new.tenant_id and e.profile_version_id = new.id), '[]'::jsonb)
      ) into v_values;
      select coalesce(jsonb_agg(jsonb_build_object('link', to_jsonb(l), 'checksum', e.integrity_checksum) order by e.id), '[]'::jsonb)
      into v_evidence from public.profile_version_evidence l join public.evidence e on e.tenant_id = l.tenant_id and e.id = l.evidence_id
      where l.tenant_id = new.tenant_id and l.profile_version_id = new.id;
    else
      select to_jsonb(h) into v_values from public.hazard_characteristic h where h.tenant_id = new.tenant_id and h.hazard_version_id = new.id;
      if v_values is null then raise exception 'Hazard submission requires documented characteristics and an information source'; end if;
      select coalesce(jsonb_agg(jsonb_build_object('link', to_jsonb(l), 'checksum', e.integrity_checksum) order by e.id), '[]'::jsonb)
      into v_evidence from public.hazard_version_evidence l join public.evidence e on e.tenant_id = l.tenant_id and e.id = l.evidence_id
      where l.tenant_id = new.tenant_id and l.hazard_version_id = new.id;
    end if;
    new.submitted_at := now();
    new.content_hash := encode(pg_catalog.sha256(convert_to(
      ((to_jsonb(new) - 'content_hash') || jsonb_build_object('values', v_values, 'sources', v_sources, 'evidence', v_evidence))::text, 'UTF8')), 'hex');
  elsif new.state <> old.state then
    raise exception 'Invalid version state transition';
  end if;
  return new;
end
$$;

create trigger profile_submission_gate before update of state on public.profile_version
for each row execute function public.validate_profile_or_hazard_submission();
create trigger hazard_submission_gate before update of state on public.hazard_version
for each row execute function public.validate_profile_or_hazard_submission();

create function public.prevent_submitted_version_change()
returns trigger
language plpgsql
set search_path = pg_catalog, public
as $$
begin
  if old.state::text <> 'draft' then
    raise exception 'Submitted or finalized versions are immutable; create a successor version';
  end if;
  return case when tg_op = 'DELETE' then old else new end;
end
$$;

create trigger profile_version_immutable before update or delete on public.profile_version
for each row execute function public.prevent_submitted_version_change();
create trigger hazard_version_immutable before update or delete on public.hazard_version
for each row execute function public.prevent_submitted_version_change();
create trigger report_version_immutable before update or delete on public.incident_report_version
for each row execute function public.prevent_submitted_version_change();

create function public.guard_sitrep_version_change()
returns trigger
language plpgsql
set search_path = pg_catalog, public
as $$
declare
  v_snapshot_hash text;
  v_payload jsonb;
begin
  if tg_op = 'DELETE' then
    if old.state <> 'draft' then raise exception 'Finalized SitRep versions are immutable'; end if;
    return old;
  end if;
  if old.state = 'draft' then
    if new.state not in ('draft', 'under_review') then
      raise exception 'A draft SitRep must enter review before approval';
    end if;
    if new.state = 'under_review' then
      select snapshot_hash into v_snapshot_hash from public.sitrep_source_snapshot s
      where s.tenant_id = new.tenant_id and s.situation_report_version_id = new.id and s.frozen_at is not null;
      if v_snapshot_hash is null then
        raise exception 'SitRep source snapshot must be frozen before review';
      end if;
      if (select count(*) from public.situation_report_section s
          where s.tenant_id = new.tenant_id and s.situation_report_version_id = new.id) <> 6
         or exists(select 1 from public.situation_report_section s
          where s.tenant_id = new.tenant_id and s.situation_report_version_id = new.id
            and s.section_status = 'pending') then
        raise exception 'All six formal SitRep body sections must be completed or explicitly qualified before review';
      end if;
      if not exists(select 1 from public.situation_report_incident i
                    where i.tenant_id = new.tenant_id and i.situation_report_version_id = new.id) then
        raise exception 'A SitRep under review requires at least one linked disaster incident';
      end if;
      if not exists(select 1 from public.sitrep_signatory s
                    where s.tenant_id = new.tenant_id and s.situation_report_version_id = new.id) then
        raise exception 'A SitRep under review requires its prepared-by or approval signatory block';
      end if;
      if exists(select 1 from public.sitrep_data_point p
                where p.tenant_id = new.tenant_id and p.situation_report_version_id = new.id
                  and not exists(select 1 from public.sitrep_data_point_source l
                                 where l.tenant_id = p.tenant_id and l.sitrep_data_point_id = p.id)) then
        raise exception 'Every derived SitRep data point requires source lineage';
      end if;
      if exists(
        select 1
        from public.sitrep_data_point p
        join public.sitrep_data_point_source l on l.tenant_id = p.tenant_id and l.sitrep_data_point_id = p.id
        join public.report_effect_item e on e.tenant_id = l.tenant_id and e.id = l.report_effect_item_id
        left join public.affected_population ap on ap.tenant_id = e.tenant_id and ap.effect_item_id = e.id
        left join public.casualty_summary cs on cs.tenant_id = e.tenant_id and cs.effect_item_id = e.id
        where p.tenant_id = new.tenant_id and p.situation_report_version_id = new.id
          and p.source_coverage_complete
          and ((p.field_code = 'affected_families' and ap.family_count_state not in ('reported_zero', 'verified'))
            or (p.field_code = 'affected_persons' and ap.person_count_state not in ('reported_zero', 'verified'))
            or (p.field_code = 'casualties_dead' and cs.dead_count_state not in ('reported_zero', 'verified'))
            or (p.field_code = 'casualties_injured' and cs.injured_count_state not in ('reported_zero', 'verified'))
            or (p.field_code = 'casualties_ill' and cs.ill_count_state not in ('reported_zero', 'verified'))
            or (p.field_code = 'casualties_missing' and cs.missing_count_state not in ('reported_zero', 'verified')))
      ) then raise exception 'Complete SitRep totals cannot treat unknown or provisional source values as verified zero';
      end if;
      select jsonb_build_object(
        'version', to_jsonb(new) - 'state' - 'content_hash',
        'snapshot_hash', v_snapshot_hash,
        'incidents', coalesce((select jsonb_agg(to_jsonb(x) order by x.incident_id) from public.situation_report_incident x where x.tenant_id = new.tenant_id and x.situation_report_version_id = new.id), '[]'::jsonb),
        'sections', coalesce((select jsonb_agg(to_jsonb(x) order by x.sequence_number) from public.situation_report_section x where x.tenant_id = new.tenant_id and x.situation_report_version_id = new.id), '[]'::jsonb),
        'data_points', coalesce((select jsonb_agg(to_jsonb(x) order by x.field_code) from public.sitrep_data_point x where x.tenant_id = new.tenant_id and x.situation_report_version_id = new.id), '[]'::jsonb),
        'data_point_sources', coalesce((select jsonb_agg(to_jsonb(l) order by l.sitrep_data_point_id, l.report_effect_item_id) from public.sitrep_data_point_source l join public.sitrep_data_point p on p.tenant_id = l.tenant_id and p.id = l.sitrep_data_point_id where p.tenant_id = new.tenant_id and p.situation_report_version_id = new.id), '[]'::jsonb),
        'overrides', coalesce((select jsonb_agg(to_jsonb(o) order by o.id) from public.sitrep_value_override o join public.sitrep_data_point p on p.tenant_id = o.tenant_id and p.id = o.sitrep_data_point_id where p.tenant_id = new.tenant_id and p.situation_report_version_id = new.id), '[]'::jsonb),
        'content_items', coalesce((select jsonb_agg(to_jsonb(x) order by x.kind, x.sequence_number) from public.sitrep_content_item x where x.tenant_id = new.tenant_id and x.situation_report_version_id = new.id), '[]'::jsonb),
        'structured_content', public.sitrep_structured_payload(new.tenant_id, new.id),
        'content_evidence', coalesce((select jsonb_agg(to_jsonb(l) order by l.sitrep_content_item_id, l.evidence_id) from public.sitrep_content_evidence l join public.sitrep_content_item c on c.tenant_id = l.tenant_id and c.id = l.sitrep_content_item_id where c.tenant_id = new.tenant_id and c.situation_report_version_id = new.id), '[]'::jsonb),
        'signatories', coalesce((select jsonb_agg(to_jsonb(x) order by x.sequence_number) from public.sitrep_signatory x where x.tenant_id = new.tenant_id and x.situation_report_version_id = new.id), '[]'::jsonb),
        'annexes', coalesce((select jsonb_agg(to_jsonb(x) order by x.sequence_number) from public.sitrep_annex x where x.tenant_id = new.tenant_id and x.situation_report_version_id = new.id), '[]'::jsonb)
      ) into v_payload;
      new.content_hash := encode(pg_catalog.sha256(convert_to(v_payload::text, 'UTF8')), 'hex');
    end if;
    return new;
  end if;
  if (to_jsonb(new) - 'state') <> (to_jsonb(old) - 'state') then
    raise exception 'Only the controlled SitRep state may change after review starts';
  end if;
  if not ((old.state = 'under_review' and new.state = 'approved')
       or (old.state = 'approved' and new.state = 'released')
       or (old.state = 'released' and new.state = 'superseded')) then
    raise exception 'Invalid SitRep state transition: % to %', old.state, new.state;
  end if;
  if new.state = 'approved' and not exists(
    select 1 from public.sitrep_decision d
    where d.tenant_id = new.tenant_id and d.situation_report_version_id = new.id
      and d.stage = 'approval' and d.decision = 'accepted'
  ) then raise exception 'Accepted approval decision is required';
  end if;
  return new;
end
$$;

create trigger sitrep_version_immutable before update or delete on public.situation_report_version
for each row execute function public.guard_sitrep_version_change();

create function public.guard_version_child_change()
returns trigger
language plpgsql
set search_path = pg_catalog, public
as $$
declare
  v_old_tenant uuid;
  v_new_tenant uuid;
  v_old_parent uuid;
  v_new_parent uuid;
  v_state text;
begin
  if tg_op <> 'INSERT' then
    v_old_tenant := (to_jsonb(old) ->> 'tenant_id')::uuid;
    v_old_parent := (to_jsonb(old) ->> tg_argv[1])::uuid;
    execute format('select state::text from public.%I where tenant_id = $1 and id = $2 for update', tg_argv[0])
      into v_state using v_old_tenant, v_old_parent;
    if v_state <> 'draft' then raise exception 'Finalized parent content is immutable'; end if;
  end if;
  if tg_op <> 'DELETE' then
    v_new_tenant := (to_jsonb(new) ->> 'tenant_id')::uuid;
    v_new_parent := (to_jsonb(new) ->> tg_argv[1])::uuid;
    if tg_op = 'INSERT' or v_new_tenant <> v_old_tenant or v_new_parent <> v_old_parent then
      execute format('select state::text from public.%I where tenant_id = $1 and id = $2 for update', tg_argv[0])
        into v_state using v_new_tenant, v_new_parent;
      if v_state <> 'draft' then raise exception 'Finalized parent content is immutable'; end if;
    end if;
  end if;
  return case when tg_op = 'DELETE' then old else new end;
end
$$;

create trigger profile_evidence_immutable before insert or update or delete on public.profile_version_evidence
for each row execute function public.guard_version_child_change('profile_version', 'profile_version_id');
create trigger profile_source_immutable before insert or update or delete on public.barangay_profile_source
for each row execute function public.guard_version_child_change('profile_version', 'barangay_profile_version_id');
create trigger hazard_evidence_immutable before insert or update or delete on public.hazard_version_evidence
for each row execute function public.guard_version_child_change('hazard_version', 'hazard_version_id');
create trigger report_source_immutable before insert or update or delete on public.report_version_source
for each row execute function public.guard_version_child_change('incident_report_version', 'report_version_id');
create trigger report_effect_immutable before insert or update or delete on public.report_effect_item
for each row execute function public.guard_version_child_change('incident_report_version', 'report_version_id');
create trigger report_evidence_immutable before insert or update or delete on public.report_version_evidence
for each row execute function public.guard_version_child_change('incident_report_version', 'report_version_id');
create trigger barangay_report_source_immutable before insert or update or delete on public.barangay_report_source
for each row execute function public.guard_version_child_change('incident_report_version', 'barangay_report_version_id');
create trigger sitrep_section_immutable before insert or update or delete on public.situation_report_section
for each row execute function public.guard_version_child_change('situation_report_version', 'situation_report_version_id');
create trigger sitrep_incident_immutable before insert or update or delete on public.situation_report_incident
for each row execute function public.guard_version_child_change('situation_report_version', 'situation_report_version_id');
create trigger sitrep_data_point_immutable before insert or update or delete on public.sitrep_data_point
for each row execute function public.guard_version_child_change('situation_report_version', 'situation_report_version_id');
create trigger sitrep_content_immutable before insert or update or delete on public.sitrep_content_item
for each row execute function public.guard_version_child_change('situation_report_version', 'situation_report_version_id');
create trigger sitrep_signatory_immutable before insert or update or delete on public.sitrep_signatory
for each row execute function public.guard_version_child_change('situation_report_version', 'situation_report_version_id');
create trigger sitrep_annex_immutable before insert or update or delete on public.sitrep_annex
for each row execute function public.guard_version_child_change('situation_report_version', 'situation_report_version_id');

create function public.guard_effect_subtype_change()
returns trigger
language plpgsql
set search_path = pg_catalog, public
as $$
declare
  v_tenant uuid;
  v_effect uuid;
  v_state public.record_state;
begin
  if tg_op <> 'INSERT' then
    v_tenant := old.tenant_id; v_effect := old.effect_item_id;
    select rv.state into v_state
    from public.report_effect_item e
    join public.incident_report_version rv on rv.tenant_id = e.tenant_id and rv.id = e.report_version_id
    where e.tenant_id = v_tenant and e.id = v_effect for update of rv;
    if v_state <> 'draft' then raise exception 'Submitted report effect content is immutable'; end if;
  end if;
  if tg_op <> 'DELETE' and (tg_op = 'INSERT' or new.tenant_id <> v_tenant or new.effect_item_id <> v_effect) then
    select rv.state into v_state
    from public.report_effect_item e
    join public.incident_report_version rv on rv.tenant_id = e.tenant_id and rv.id = e.report_version_id
    where e.tenant_id = new.tenant_id and e.id = new.effect_item_id for update of rv;
    if v_state <> 'draft' then raise exception 'Submitted report effect content is immutable'; end if;
  end if;
  return case when tg_op = 'DELETE' then old else new end;
end
$$;

create trigger affected_population_immutable before insert or update or delete on public.affected_population
for each row execute function public.guard_effect_subtype_change();
create trigger casualty_summary_immutable before insert or update or delete on public.casualty_summary
for each row execute function public.guard_effect_subtype_change();
create trigger damage_assessment_immutable before insert or update or delete on public.damage_assessment
for each row execute function public.guard_effect_subtype_change();

create function public.has_active_role(
  p_tenant_id uuid,
  p_account_id uuid,
  p_unit_id uuid,
  p_roles public.role_code[]
)
returns boolean
language sql
stable
set search_path = pg_catalog, public
as $$
  select exists(
    select 1 from public.role_assignment r
    join public.account a on a.tenant_id = r.tenant_id and a.id = r.account_id
    where r.tenant_id = p_tenant_id and r.account_id = p_account_id and r.unit_id = p_unit_id
      and r.role = any(p_roles) and r.valid_from <= now()
      and (r.valid_until is null or r.valid_until > now()) and a.status = 'active'
  )
$$;

create function public.enforce_profile_scope()
returns trigger
language plpgsql
set search_path = pg_catalog, public
as $$
declare v_kind public.unit_kind;
begin
  select kind into v_kind from public.organization_unit where tenant_id = new.tenant_id and id = new.unit_id;
  if v_kind::text <> new.level::text then raise exception 'Profile level must match organization-unit kind'; end if;
  return new;
end
$$;

create trigger profile_scope_guard before insert or update on public.profile
for each row execute function public.enforce_profile_scope();

create function public.enforce_profile_preparer()
returns trigger
language plpgsql
set search_path = pg_catalog, public
as $$
declare v_profile public.profile%rowtype;
begin
  select * into v_profile from public.profile where tenant_id = new.tenant_id and id = new.profile_id;
  if v_profile.level = 'purok' then
    if not exists(select 1 from public.purok_account a where a.tenant_id = new.tenant_id and a.account_id = new.prepared_by_account_id and a.purok_unit_id = v_profile.unit_id)
       or not public.has_active_role(new.tenant_id, new.prepared_by_account_id, v_profile.unit_id, array['purok_reporter'::public.role_code]) then
      raise exception 'Purok profile preparer lacks the assigned account and role';
    end if;
  else
    if not exists(select 1 from public.barangay_account a where a.tenant_id = new.tenant_id and a.account_id = new.prepared_by_account_id and a.barangay_unit_id = v_profile.unit_id)
       or not public.has_active_role(new.tenant_id, new.prepared_by_account_id, v_profile.unit_id, array['barangay_reviewer_reporter'::public.role_code]) then
      raise exception 'Barangay profile preparer lacks the assigned account and role';
    end if;
  end if;
  return new;
end
$$;

create trigger profile_preparer_guard before insert or update of profile_id, prepared_by_account_id on public.profile_version
for each row execute function public.enforce_profile_preparer();

create function public.enforce_hazard_author()
returns trigger
language plpgsql
set search_path = pg_catalog, public
as $$
declare v_kind public.unit_kind;
begin
  select kind into v_kind from public.organization_unit where tenant_id = new.tenant_id and id = new.unit_id;
  if (v_kind = 'purok' and not exists(select 1 from public.purok_account a where a.tenant_id = new.tenant_id and a.account_id = new.created_by_account_id and a.purok_unit_id = new.unit_id))
     or (v_kind = 'barangay' and not exists(select 1 from public.barangay_account a where a.tenant_id = new.tenant_id and a.account_id = new.created_by_account_id and a.barangay_unit_id = new.unit_id))
     or (v_kind = 'city' and not exists(select 1 from public.drrm_account a where a.tenant_id = new.tenant_id and a.account_id = new.created_by_account_id and a.city_unit_id = new.unit_id)) then
    raise exception 'Hazard author must belong to the originating organization unit';
  end if;
  return new;
end
$$;

create trigger hazard_author_guard before insert or update of unit_id, created_by_account_id on public.hazard_record
for each row execute function public.enforce_hazard_author();

create function public.enforce_hazard_preparer()
returns trigger
language plpgsql
set search_path = pg_catalog, public
as $$
declare
  v_creator uuid;
  v_unit uuid;
begin
  select created_by_account_id, unit_id into v_creator, v_unit from public.hazard_record
  where tenant_id = new.tenant_id and id = new.hazard_record_id;
  if new.version_number = 1 and new.prepared_by_account_id <> v_creator then
    raise exception 'The first hazard version must be prepared by its creator';
  end if;
  if not exists(select 1 from public.role_assignment r where r.tenant_id = new.tenant_id
                and r.account_id = new.prepared_by_account_id and r.unit_id = v_unit
                and r.valid_from <= now() and (r.valid_until is null or r.valid_until > now())) then
    raise exception 'Hazard preparer lacks an active role for the originating unit';
  end if;
  return new;
end
$$;

create trigger hazard_preparer_guard before insert or update of hazard_record_id, prepared_by_account_id on public.hazard_version
for each row execute function public.enforce_hazard_preparer();

create function public.enforce_sitrep_preparer()
returns trigger
language plpgsql
set search_path = pg_catalog, public
as $$
declare v_city uuid;
begin
  select city_unit_id into v_city from public.situation_report where tenant_id = new.tenant_id and id = new.situation_report_id;
  if not exists(select 1 from public.drrm_account a where a.tenant_id = new.tenant_id and a.account_id = new.prepared_by_account_id and a.city_unit_id = v_city)
     or not public.has_active_role(new.tenant_id, new.prepared_by_account_id, v_city, array['sitrep_preparer'::public.role_code]) then
    raise exception 'SitRep preparer lacks the assigned DRRM account and role';
  end if;
  return new;
end
$$;

create trigger sitrep_preparer_guard before insert or update of situation_report_id, prepared_by_account_id on public.situation_report_version
for each row execute function public.enforce_sitrep_preparer();

create function public.enforce_sitrep_editor_role()
returns trigger
language plpgsql
set search_path = pg_catalog, public
as $$
declare
  v_version uuid := (to_jsonb(new) ->> 'situation_report_version_id')::uuid;
  v_actor uuid := (to_jsonb(new) ->> tg_argv[0])::uuid;
  v_city uuid;
begin
  select sr.city_unit_id into v_city
  from public.situation_report_version sv
  join public.situation_report sr on sr.tenant_id = sv.tenant_id and sr.id = sv.situation_report_id
  where sv.tenant_id = new.tenant_id and sv.id = v_version;
  if not public.has_active_role(new.tenant_id, v_actor, v_city, array['sitrep_preparer'::public.role_code]) then
    raise exception 'SitRep content may be edited only by an assigned SitRep preparer';
  end if;
  return new;
end
$$;

create trigger sitrep_section_editor_guard before insert or update on public.situation_report_section
for each row execute function public.enforce_sitrep_editor_role('last_edited_by_account_id');
create trigger sitrep_content_editor_guard before insert or update on public.sitrep_content_item
for each row execute function public.enforce_sitrep_editor_role('recorded_by_account_id');

create function public.guard_review_maker_checker()
returns trigger
language plpgsql
set search_path = pg_catalog, public
as $$
declare
  v_preparer uuid;
  v_subject_level text;
  v_subject_unit uuid;
  v_review_unit uuid;
  v_reviewer_level public.account_level;
  v_expected_level public.account_level;
  v_expected_role public.role_code;
begin
  if tg_table_name = 'profile_review_decision' then
    select pv.prepared_by_account_id, p.level::text, p.unit_id, u.parent_id
    into v_preparer, v_subject_level, v_subject_unit, v_review_unit
    from public.profile_version pv join public.profile p on p.tenant_id = pv.tenant_id and p.id = pv.profile_id
    join public.organization_unit u on u.tenant_id = p.tenant_id and u.id = p.unit_id
    where pv.tenant_id = new.tenant_id and pv.id = new.profile_version_id and pv.state = 'submitted';
  elsif tg_table_name = 'hazard_review_decision' then
    select hv.prepared_by_account_id, u.kind::text, hr.unit_id,
           case when u.kind = 'city' then u.id else u.parent_id end
    into v_preparer, v_subject_level, v_subject_unit, v_review_unit
    from public.hazard_version hv join public.hazard_record hr on hr.tenant_id = hv.tenant_id and hr.id = hv.hazard_record_id
    join public.organization_unit u on u.tenant_id = hr.tenant_id and u.id = hr.unit_id
    where hv.tenant_id = new.tenant_id and hv.id = new.hazard_version_id and hv.state = 'submitted';
  else
    select rv.prepared_by_account_id, r.level::text, r.reporting_unit_id, u.parent_id
    into v_preparer, v_subject_level, v_subject_unit, v_review_unit
    from public.incident_report_version rv join public.incident_report r on r.tenant_id = rv.tenant_id and r.id = rv.report_id
    join public.organization_unit u on u.tenant_id = r.tenant_id and u.id = r.reporting_unit_id
    where rv.tenant_id = new.tenant_id and rv.id = new.report_version_id and rv.state = 'submitted';
  end if;
  if v_preparer is null then raise exception 'Only a submitted version may be reviewed'; end if;
  if v_preparer = new.reviewer_account_id then raise exception 'The preparer cannot review the same version'; end if;
  select level into v_reviewer_level from public.account
  where tenant_id = new.tenant_id and id = new.reviewer_account_id and status = 'active';
  if v_subject_level = 'purok' then
    v_expected_level := 'barangay'; v_expected_role := 'barangay_reviewer_reporter';
  else
    v_expected_level := 'drrm'; v_expected_role := 'drrm_verifier';
  end if;
  if v_reviewer_level <> v_expected_level then raise exception 'Review must be performed by the next authorized administrative level'; end if;
  if not public.has_active_role(new.tenant_id, new.reviewer_account_id, v_review_unit, array[v_expected_role]) then
    raise exception 'Reviewer lacks the required active role for this jurisdiction';
  end if;
  return new;
end
$$;

create trigger profile_review_maker_checker before insert on public.profile_review_decision
for each row execute function public.guard_review_maker_checker();
create trigger hazard_review_maker_checker before insert on public.hazard_review_decision
for each row execute function public.guard_review_maker_checker();
create trigger report_review_maker_checker before insert on public.report_review_decision
for each row execute function public.guard_review_maker_checker();

create function public.enforce_barangay_profile_source()
returns trigger
language plpgsql
set search_path = pg_catalog, public
as $$
declare
  v_barangay_level public.profile_level;
  v_purok_level public.profile_level;
  v_barangay_unit uuid;
  v_purok_parent uuid;
  v_barangay_month date;
  v_purok_month date;
  v_verified boolean;
begin
  select p.level, p.unit_id, p.reporting_month
  into v_barangay_level, v_barangay_unit, v_barangay_month
  from public.profile_version pv join public.profile p on p.tenant_id = pv.tenant_id and p.id = pv.profile_id
  where pv.tenant_id = new.tenant_id and pv.id = new.barangay_profile_version_id;
  select p.level, u.parent_id, p.reporting_month,
         exists(select 1 from public.profile_review_decision d
                where d.tenant_id = pv.tenant_id and d.profile_version_id = pv.id and d.outcome = 'verified')
  into v_purok_level, v_purok_parent, v_purok_month, v_verified
  from public.profile_version pv
  join public.profile p on p.tenant_id = pv.tenant_id and p.id = pv.profile_id
  join public.organization_unit u on u.tenant_id = p.tenant_id and u.id = p.unit_id
  where pv.tenant_id = new.tenant_id and pv.id = new.purok_profile_version_id;
  if v_barangay_level <> 'barangay' or v_purok_level <> 'purok' then
    raise exception 'Barangay profile coverage must link a Barangay version to a Purok version';
  end if;
  if v_purok_parent <> v_barangay_unit then raise exception 'Purok profile source must be a direct child of the Barangay'; end if;
  if v_purok_month <> v_barangay_month then raise exception 'Profile source and consolidation months must match'; end if;
  if new.disposition = 'included' and not v_verified then raise exception 'Only verified Purok profile versions may be included'; end if;
  return new;
end
$$;

create trigger barangay_profile_source_guard before insert or update on public.barangay_profile_source
for each row execute function public.enforce_barangay_profile_source();

create function public.enforce_barangay_report_source()
returns trigger
language plpgsql
set search_path = pg_catalog, public
as $$
declare
  v_barangay_level public.report_level;
  v_purok_level public.report_level;
  v_barangay_incident uuid;
  v_purok_incident uuid;
  v_barangay_unit uuid;
  v_purok_unit uuid;
  v_purok_parent uuid;
  v_cutoff timestamptz;
  v_source_as_of timestamptz;
  v_verified boolean;
begin
  select r.level, r.incident_id, r.reporting_unit_id, rv.consolidation_cutoff_at
  into v_barangay_level, v_barangay_incident, v_barangay_unit, v_cutoff
  from public.incident_report_version rv
  join public.incident_report r on r.tenant_id = rv.tenant_id and r.id = rv.report_id
  where rv.tenant_id = new.tenant_id and rv.id = new.barangay_report_version_id;
  select r.level, r.incident_id, r.reporting_unit_id, u.parent_id, rv.as_of_at,
         exists(select 1 from public.report_review_decision d
                where d.tenant_id = rv.tenant_id and d.report_version_id = rv.id and d.outcome = 'verified')
  into v_purok_level, v_purok_incident, v_purok_unit, v_purok_parent, v_source_as_of, v_verified
  from public.incident_report_version rv
  join public.incident_report r on r.tenant_id = rv.tenant_id and r.id = rv.report_id
  join public.organization_unit u on u.tenant_id = r.tenant_id and u.id = r.reporting_unit_id
  where rv.tenant_id = new.tenant_id and rv.id = new.purok_report_version_id;
  if v_barangay_level <> 'barangay' or v_purok_level <> 'purok' then
    raise exception 'Barangay consolidation must link a Barangay version to a Purok version';
  end if;
  if v_barangay_incident <> v_purok_incident then raise exception 'Consolidated report sources must belong to the same incident'; end if;
  if new.purok_report_id is distinct from (select report_id from public.incident_report_version where tenant_id = new.tenant_id and id = new.purok_report_version_id) then
    raise exception 'Purok report series identifier does not match the exact version';
  end if;
  if v_purok_parent <> v_barangay_unit then raise exception 'Purok source must be a direct child of the consolidating Barangay'; end if;
  if v_cutoff is not null and v_source_as_of > v_cutoff then raise exception 'Purok source is later than the Barangay consolidation cutoff'; end if;
  if new.disposition = 'included' and not v_verified then raise exception 'Only verified Purok versions may be included'; end if;
  return new;
end
$$;

create trigger barangay_report_source_guard before insert or update on public.barangay_report_source
for each row execute function public.enforce_barangay_report_source();

create function public.guard_snapshot_change()
returns trigger
language plpgsql
set search_path = pg_catalog, public
as $$
declare
  v_cutoff timestamptz;
  v_city uuid;
  v_payload jsonb;
begin
  if tg_op = 'DELETE' then
    if old.frozen_at is not null then raise exception 'A frozen source snapshot is immutable'; end if;
    return old;
  end if;
  select sv.data_cutoff_at, sr.city_unit_id into v_cutoff, v_city
  from public.situation_report_version sv join public.situation_report sr
    on sr.tenant_id = sv.tenant_id and sr.id = sv.situation_report_id
  where sv.tenant_id = new.tenant_id and sv.id = new.situation_report_version_id for update of sv;
  if new.cutoff_at <> v_cutoff then raise exception 'Snapshot cutoff must equal the owning SitRep version cutoff'; end if;
  if tg_op = 'UPDATE' and old.frozen_at is not null then raise exception 'A frozen source snapshot is immutable'; end if;
  if new.frozen_at is not null and (tg_op = 'INSERT' or old.frozen_at is null) then
    if new.frozen_by_account_id is null then raise exception 'Snapshot freezer is required'; end if;
    if not public.has_active_role(new.tenant_id, new.frozen_by_account_id, v_city, array['sitrep_preparer'::public.role_code]) then
      raise exception 'Snapshot freezer lacks SitRep preparer role for the city';
    end if;
    if not exists(select 1 from public.snapshot_barangay_report s
                  where s.tenant_id = new.tenant_id and s.snapshot_id = new.id and s.disposition = 'included') then
      raise exception 'A frozen SitRep snapshot requires at least one included verified Barangay report';
    end if;
    select jsonb_build_object(
      'cutoff', new.cutoff_at,
      'barangay_reports', coalesce((select jsonb_agg(to_jsonb(x) order by x.report_id)
        from public.snapshot_barangay_report x where x.tenant_id = new.tenant_id and x.snapshot_id = new.id), '[]'::jsonb),
      'hazards', coalesce((select jsonb_agg(to_jsonb(x) order by x.hazard_record_id)
        from public.snapshot_hazard_version x where x.tenant_id = new.tenant_id and x.snapshot_id = new.id), '[]'::jsonb)
    ) into v_payload;
    new.frozen_at := coalesce(new.frozen_at, now());
    new.snapshot_hash := encode(pg_catalog.sha256(convert_to(v_payload::text, 'UTF8')), 'hex');
  end if;
  return new;
end
$$;

create trigger sitrep_snapshot_guard before insert or update or delete on public.sitrep_source_snapshot
for each row execute function public.guard_snapshot_change();

create trigger sitrep_snapshot_parent_guard before insert or update or delete on public.sitrep_source_snapshot
for each row execute function public.guard_version_child_change('situation_report_version', 'situation_report_version_id');

create function public.guard_snapshot_member_change()
returns trigger
language plpgsql
set search_path = pg_catalog, public
as $$
declare
  v_old_snapshot uuid;
  v_new_snapshot uuid;
  v_tenant uuid;
  v_frozen timestamptz;
begin
  if tg_op <> 'INSERT' then
    v_tenant := old.tenant_id; v_old_snapshot := old.snapshot_id;
    select frozen_at into v_frozen from public.sitrep_source_snapshot
    where tenant_id = v_tenant and id = v_old_snapshot for update;
    if v_frozen is not null then raise exception 'Frozen snapshot membership is immutable'; end if;
  end if;
  if tg_op <> 'DELETE' then
    v_new_snapshot := new.snapshot_id;
    if tg_op = 'INSERT' or new.tenant_id <> v_tenant or v_new_snapshot <> v_old_snapshot then
      select frozen_at into v_frozen from public.sitrep_source_snapshot
      where tenant_id = new.tenant_id and id = v_new_snapshot for update;
      if v_frozen is not null then raise exception 'Frozen snapshot membership is immutable'; end if;
    end if;
  end if;
  return case when tg_op = 'DELETE' then old else new end;
end
$$;

create trigger snapshot_barangay_member_guard before insert or update or delete on public.snapshot_barangay_report
for each row execute function public.guard_snapshot_member_change();
create trigger snapshot_hazard_member_guard before insert or update or delete on public.snapshot_hazard_version
for each row execute function public.guard_snapshot_member_change();

create function public.enforce_snapshot_barangay_eligibility()
returns trigger
language plpgsql
set search_path = pg_catalog, public
as $$
declare
  v_cutoff timestamptz;
  v_sitrep uuid;
  v_city uuid;
  v_level public.report_level;
  v_unit_parent uuid;
  v_incident uuid;
  v_report_id uuid;
  v_as_of timestamptz;
  v_state public.record_state;
  v_verified boolean;
begin
  select ss.cutoff_at, ss.situation_report_version_id, sr.city_unit_id
  into v_cutoff, v_sitrep, v_city
  from public.sitrep_source_snapshot ss
  join public.situation_report_version sv on sv.tenant_id = ss.tenant_id and sv.id = ss.situation_report_version_id
  join public.situation_report sr on sr.tenant_id = sv.tenant_id and sr.id = sv.situation_report_id
  where ss.tenant_id = new.tenant_id and ss.id = new.snapshot_id;
  select r.level, u.parent_id, r.incident_id, rv.report_id, rv.as_of_at, rv.state,
         exists(select 1 from public.report_review_decision d where d.tenant_id = rv.tenant_id and d.report_version_id = rv.id and d.outcome = 'verified')
  into v_level, v_unit_parent, v_incident, v_report_id, v_as_of, v_state, v_verified
  from public.incident_report_version rv
  join public.incident_report r on r.tenant_id = rv.tenant_id and r.id = rv.report_id
  join public.organization_unit u on u.tenant_id = r.tenant_id and u.id = r.reporting_unit_id
  where rv.tenant_id = new.tenant_id and rv.id = new.report_version_id;
  if new.report_id <> v_report_id then raise exception 'Snapshot report series does not match exact report version'; end if;
  if v_level <> 'barangay' or v_unit_parent <> v_city then raise exception 'Snapshot report must belong to a Barangay under the SitRep city'; end if;
  if not exists(select 1 from public.situation_report_incident i
                where i.tenant_id = new.tenant_id and i.situation_report_version_id = v_sitrep and i.incident_id = v_incident) then
    raise exception 'Snapshot report incident is not covered by this SitRep';
  end if;
  if new.disposition = 'included' and (v_state <> 'submitted' or not v_verified or v_as_of > v_cutoff) then
    raise exception 'Included Barangay report must be submitted, verified, and at or before the snapshot cutoff';
  end if;
  return new;
end
$$;

create trigger snapshot_barangay_eligibility before insert or update on public.snapshot_barangay_report
for each row execute function public.enforce_snapshot_barangay_eligibility();

create function public.enforce_snapshot_hazard_eligibility()
returns trigger
language plpgsql
set search_path = pg_catalog, public
as $$
declare
  v_cutoff timestamptz;
  v_sitrep uuid;
  v_city uuid;
  v_unit uuid;
  v_record uuid;
  v_assessed timestamptz;
  v_state public.record_state;
  v_verified boolean;
  v_in_scope boolean;
begin
  select ss.cutoff_at, ss.situation_report_version_id, sr.city_unit_id
  into v_cutoff, v_sitrep, v_city
  from public.sitrep_source_snapshot ss
  join public.situation_report_version sv on sv.tenant_id = ss.tenant_id and sv.id = ss.situation_report_version_id
  join public.situation_report sr on sr.tenant_id = sv.tenant_id and sr.id = sv.situation_report_id
  where ss.tenant_id = new.tenant_id and ss.id = new.snapshot_id;
  select hr.unit_id, hv.hazard_record_id, hv.assessment_at, hv.state,
         exists(select 1 from public.hazard_review_decision d where d.tenant_id = hv.tenant_id and d.hazard_version_id = hv.id and d.outcome = 'verified')
  into v_unit, v_record, v_assessed, v_state, v_verified
  from public.hazard_version hv join public.hazard_record hr on hr.tenant_id = hv.tenant_id and hr.id = hv.hazard_record_id
  where hv.tenant_id = new.tenant_id and hv.id = new.hazard_version_id;
  if new.hazard_record_id <> v_record then raise exception 'Snapshot hazard series does not match exact hazard version'; end if;
  with recursive ancestors(id, parent_id) as (
    select id, parent_id from public.organization_unit where tenant_id = new.tenant_id and id = v_unit
    union all
    select u.id, u.parent_id from public.organization_unit u join ancestors a on a.parent_id = u.id
    where u.tenant_id = new.tenant_id
  ) select exists(select 1 from ancestors where id = v_city) into v_in_scope;
  if not v_in_scope then raise exception 'Snapshot hazard is outside the SitRep city'; end if;
  if not exists(
    select 1 from public.incident_hazard ih
    join public.situation_report_incident si on si.tenant_id = ih.tenant_id and si.incident_id = ih.incident_id
    where ih.tenant_id = new.tenant_id and ih.hazard_version_id = new.hazard_version_id and si.situation_report_version_id = v_sitrep
  ) then raise exception 'Snapshot hazard is not linked to a covered incident'; end if;
  if new.disposition = 'included' and (v_state <> 'submitted' or not v_verified or v_assessed > v_cutoff) then
    raise exception 'Included hazard version must be submitted, verified, and at or before the snapshot cutoff';
  end if;
  return new;
end
$$;

create trigger snapshot_hazard_eligibility before insert or update on public.snapshot_hazard_version
for each row execute function public.enforce_snapshot_hazard_eligibility();

create function public.enforce_sitrep_lineage()
returns trigger
language plpgsql
set search_path = pg_catalog, public
as $$
declare
  v_sitrep_version uuid;
  v_report_version uuid;
begin
  select situation_report_version_id into v_sitrep_version from public.sitrep_data_point
  where tenant_id = new.tenant_id and id = new.sitrep_data_point_id;
  select report_version_id into v_report_version from public.report_effect_item
  where tenant_id = new.tenant_id and id = new.report_effect_item_id;
  if not exists(
    select 1 from public.sitrep_source_snapshot ss
    join public.snapshot_barangay_report sr on sr.tenant_id = ss.tenant_id and sr.snapshot_id = ss.id
    where ss.tenant_id = new.tenant_id and ss.situation_report_version_id = v_sitrep_version
      and sr.report_version_id = v_report_version and sr.disposition = 'included'
  ) then raise exception 'SitRep data-point lineage must come from an included exact Barangay report version';
  end if;
  return new;
end
$$;

create trigger sitrep_lineage_guard before insert or update on public.sitrep_data_point_source
for each row execute function public.enforce_sitrep_lineage();

create function public.guard_sitrep_indirect_child()
returns trigger
language plpgsql
set search_path = pg_catalog, public
as $$
declare
  v_old_owner uuid;
  v_new_owner uuid;
  v_state public.sitrep_state;
begin
  if tg_op <> 'INSERT' then
    v_old_owner := (to_jsonb(old) ->> tg_argv[0])::uuid;
    if tg_argv[1] = 'data_point' then
      select sv.state into v_state from public.sitrep_data_point p
      join public.situation_report_version sv on sv.tenant_id = p.tenant_id and sv.id = p.situation_report_version_id
      where p.tenant_id = old.tenant_id and p.id = v_old_owner for update of sv;
    else
      select sv.state into v_state from public.sitrep_content_item c
      join public.situation_report_version sv on sv.tenant_id = c.tenant_id and sv.id = c.situation_report_version_id
      where c.tenant_id = old.tenant_id and c.id = v_old_owner for update of sv;
    end if;
    if v_state <> 'draft' then raise exception 'Finalized SitRep child content is immutable'; end if;
  end if;
  if tg_op <> 'DELETE' then
    v_new_owner := (to_jsonb(new) ->> tg_argv[0])::uuid;
    if tg_op = 'INSERT' or new.tenant_id <> old.tenant_id or v_new_owner <> v_old_owner then
      if tg_argv[1] = 'data_point' then
        select sv.state into v_state from public.sitrep_data_point p
        join public.situation_report_version sv on sv.tenant_id = p.tenant_id and sv.id = p.situation_report_version_id
        where p.tenant_id = new.tenant_id and p.id = v_new_owner for update of sv;
      else
        select sv.state into v_state from public.sitrep_content_item c
        join public.situation_report_version sv on sv.tenant_id = c.tenant_id and sv.id = c.situation_report_version_id
        where c.tenant_id = new.tenant_id and c.id = v_new_owner for update of sv;
      end if;
      if v_state <> 'draft' then raise exception 'Finalized SitRep child content is immutable'; end if;
    end if;
  end if;
  return case when tg_op = 'DELETE' then old else new end;
end
$$;

create trigger sitrep_data_point_source_immutable before insert or update or delete on public.sitrep_data_point_source
for each row execute function public.guard_sitrep_indirect_child('sitrep_data_point_id', 'data_point');
create trigger sitrep_content_evidence_immutable before insert or update or delete on public.sitrep_content_evidence
for each row execute function public.guard_sitrep_indirect_child('sitrep_content_item_id', 'content_item');

create function public.prevent_change()
returns trigger
language plpgsql
set search_path = pg_catalog, public
as $$
begin
  raise exception '% is append-only', tg_table_name;
end
$$;

create trigger information_source_immutable before update or delete on public.information_source
for each row execute function public.prevent_change();
create trigger evidence_immutable before update or delete on public.evidence
for each row execute function public.prevent_change();


create function public.guard_incident_hazard_change()
returns trigger
language plpgsql
set search_path = pg_catalog, public
as $$
declare
  v_incident uuid;
  v_tenant uuid;
begin
  if tg_op = 'UPDATE' and (new.tenant_id is distinct from old.tenant_id
      or new.incident_id is distinct from old.incident_id
      or new.hazard_version_id is distinct from old.hazard_version_id) then
    raise exception 'Incident-hazard identity cannot change; remove and recreate a draft link';
  end if;
  if tg_op = 'DELETE' then v_incident := old.incident_id; v_tenant := old.tenant_id;
  else v_incident := new.incident_id; v_tenant := new.tenant_id; end if;
  perform 1 from public.incident
  where tenant_id = v_tenant and id = v_incident for update;
  if exists(
    select 1 from public.incident_report r join public.incident_report_version v
      on v.tenant_id = r.tenant_id and v.report_id = r.id
    where r.tenant_id = v_tenant
      and r.incident_id = v_incident and v.state = 'submitted'
  ) then raise exception 'Incident-hazard membership is immutable after incident reporting begins';
  end if;
  return case when tg_op = 'DELETE' then old else new end;
end
$$;

create trigger incident_hazard_immutable_after_submission before insert or update or delete on public.incident_hazard
for each row execute function public.guard_incident_hazard_change();

create function public.validate_sitrep_override()
returns trigger
language plpgsql
set search_path = pg_catalog, public
as $$
declare
  v_state public.sitrep_state;
  v_hash text;
  v_original jsonb;
  v_city uuid;
begin
  select sv.state, p.derivation_hash,
         jsonb_build_object('numeric_value', p.numeric_value, 'text_value', p.text_value, 'value_state', p.value_state),
         sr.city_unit_id
  into v_state, v_hash, v_original, v_city
  from public.sitrep_data_point p
  join public.situation_report_version sv on sv.tenant_id = p.tenant_id and sv.id = p.situation_report_version_id
  join public.situation_report sr on sr.tenant_id = sv.tenant_id and sr.id = sv.situation_report_id
  where p.tenant_id = new.tenant_id and p.id = new.sitrep_data_point_id for update of sv;
  if v_state <> 'draft' then raise exception 'A derived-value override must be completed while the SitRep is draft'; end if;
  if new.original_derivation_hash is distinct from v_hash or new.original_value <> v_original then
    raise exception 'Override original value/hash does not match the derived data point';
  end if;
  if not public.has_active_role(new.tenant_id, new.requested_by_account_id, v_city, array['sitrep_preparer'::public.role_code]) then
    raise exception 'Override requester lacks SitRep preparer role';
  end if;
  if not public.has_active_role(new.tenant_id, new.approved_by_account_id, v_city, array['drrm_verifier'::public.role_code, 'sitrep_approver'::public.role_code]) then
    raise exception 'Override approver lacks DRRM verification or approval role';
  end if;
  return new;
end
$$;

create trigger sitrep_override_gate before insert on public.sitrep_value_override
for each row execute function public.validate_sitrep_override();

create function public.validate_sitrep_decision()
returns trigger
language plpgsql
set search_path = pg_catalog, public
as $$
declare
  v_state public.sitrep_state;
  v_preparer uuid;
  v_city uuid;
  v_required_role public.role_code;
  v_review_actor uuid;
begin
  select sv.state, sv.prepared_by_account_id, sr.city_unit_id
  into v_state, v_preparer, v_city
  from public.situation_report_version sv
  join public.situation_report sr on sr.tenant_id = sv.tenant_id and sr.id = sv.situation_report_id
  where sv.tenant_id = new.tenant_id and sv.id = new.situation_report_version_id for update of sv;
  if v_state <> 'under_review' then raise exception 'SitRep decisions require an under-review version'; end if;
  if new.decided_by_account_id = v_preparer then raise exception 'SitRep preparer cannot review or approve the same version'; end if;
  v_required_role := case when new.stage = 'approval' then 'sitrep_approver' else 'drrm_verifier' end;
  if not public.has_active_role(new.tenant_id, new.decided_by_account_id, v_city, array[v_required_role]) then
    raise exception 'Decision maker lacks required active role for the SitRep city';
  end if;
  if new.stage = 'approval' then
    select decided_by_account_id into v_review_actor from public.sitrep_decision
    where tenant_id = new.tenant_id and situation_report_version_id = new.situation_report_version_id
      and stage = 'review' and decision = 'accepted';
    if v_review_actor is null then raise exception 'Accepted review is required before approval'; end if;
    if v_review_actor = new.decided_by_account_id then raise exception 'Review and approval must be performed by different accounts'; end if;
  end if;
  return new;
end
$$;

create trigger sitrep_decision_gate before insert on public.sitrep_decision
for each row execute function public.validate_sitrep_decision();

create function public.validate_sitrep_export()
returns trigger
language plpgsql
set search_path = pg_catalog, public
as $$
declare
  v_state public.sitrep_state;
  v_hash text;
  v_city uuid;
begin
  select sv.state, sv.content_hash, sr.city_unit_id into v_state, v_hash, v_city
  from public.situation_report_version sv
  join public.situation_report sr on sr.tenant_id = sv.tenant_id and sr.id = sv.situation_report_id
  where sv.tenant_id = new.tenant_id and sv.id = new.situation_report_version_id for update of sv;
  if not found then raise exception 'Export requires an existing SitRep version'; end if;
  if not public.has_active_role(new.tenant_id, new.generated_by_account_id, v_city,
      array['sitrep_preparer'::public.role_code, 'drrm_verifier'::public.role_code, 'sitrep_approver'::public.role_code]) then
    raise exception 'Exporter lacks an active SitRep role for the city';
  end if;
  if new.content_hash !~ '^[0-9a-f]{64}$' then
    raise exception 'Export requires a SHA-256 content hash';
  end if;
  -- Draft previews carry the hash of the rendered draft; finalized exports use the database-frozen hash.
  if v_state <> 'draft' and new.content_hash is distinct from v_hash then
    raise exception 'Export hash must match the exact SitRep version';
  end if;
  if not new.watermarked and (v_state not in ('approved', 'released') or not exists(
    select 1 from public.sitrep_decision d where d.tenant_id = new.tenant_id
      and d.situation_report_version_id = new.situation_report_version_id
      and d.stage = 'approval' and d.decision = 'accepted'
  )) then raise exception 'A clean export requires an approved exact SitRep version';
  end if;
  if v_state in ('draft', 'under_review') and not new.watermarked then
    raise exception 'Draft and under-review exports must be watermarked';
  end if;
  return new;
end
$$;

create trigger sitrep_export_gate before insert on public.sitrep_export
for each row execute function public.validate_sitrep_export();
create trigger sitrep_export_append_only before update or delete on public.sitrep_export
for each row execute function public.prevent_change();

create trigger profile_review_append_only before update or delete on public.profile_review_decision
for each row execute function public.prevent_change();
create trigger hazard_review_append_only before update or delete on public.hazard_review_decision
for each row execute function public.prevent_change();
create trigger report_review_append_only before update or delete on public.report_review_decision
for each row execute function public.prevent_change();
create trigger sitrep_decision_append_only before update or delete on public.sitrep_decision
for each row execute function public.prevent_change();
create trigger sitrep_override_append_only before update or delete on public.sitrep_value_override
for each row execute function public.prevent_change();
create trigger audit_event_append_only before update or delete on public.audit_event
for each row execute function public.prevent_change();

-- Field-level immutability follows the containing submitted version.
create trigger profile_population_immutable before insert or update or delete on public.profile_population
for each row execute function public.guard_version_child_change('profile_version', 'profile_version_id');
create trigger profile_demographic_immutable before insert or update or delete on public.profile_demographic
for each row execute function public.guard_version_child_change('profile_version', 'profile_version_id');
create trigger profile_housing_immutable before insert or update or delete on public.profile_housing
for each row execute function public.guard_version_child_change('profile_version', 'profile_version_id');
create trigger profile_hazard_exposure_immutable before insert or update or delete on public.profile_hazard_exposure
for each row execute function public.guard_version_child_change('profile_version', 'profile_version_id');

create trigger hazard_characteristic_immutable before insert or update or delete on public.hazard_characteristic
for each row execute function public.guard_version_child_change('hazard_version', 'hazard_version_id');

create function public.guard_exposed_group()
returns trigger language plpgsql set search_path = pg_catalog, public as $$
declare v_state text;
begin
  if tg_op = 'UPDATE' and (old.tenant_id, old.exposure_id, old.group_name) is distinct from (new.tenant_id, new.exposure_id, new.group_name) then
    raise exception 'Exposure group identity cannot be reassigned';
  end if;
  select v.state::text into v_state from public.profile_hazard_exposure e
  join public.profile_version v on v.tenant_id = e.tenant_id and v.id = e.profile_version_id
  where e.tenant_id = coalesce(new.tenant_id, old.tenant_id) and e.id = coalesce(new.exposure_id, old.exposure_id)
  for update of v;
  if v_state is distinct from 'draft' then raise exception 'Submitted exposure groups are immutable'; end if;
  return case when tg_op = 'DELETE' then old else new end;
end
$$;
create trigger profile_exposed_group_immutable before insert or update or delete on public.profile_exposed_group
for each row execute function public.guard_exposed_group();

create function public.check_sitrep_detail()
returns trigger language plpgsql set search_path = pg_catalog, public as $$
begin
  if tg_op = 'UPDATE' and (old.tenant_id, old.content_item_id) is distinct from (new.tenant_id, new.content_item_id) then
    raise exception 'SitRep detail ownership cannot be reassigned';
  end if;
  if tg_table_name = 'sitrep_recommendation' and new.related_issue_content_item_id is not null and not exists(
    select 1 from public.sitrep_content_item own
    join public.sitrep_content_item issue on issue.tenant_id = own.tenant_id
      and issue.situation_report_version_id = own.situation_report_version_id
    where own.tenant_id = new.tenant_id and own.id = new.content_item_id and issue.id = new.related_issue_content_item_id
  ) then raise exception 'Recommendation must reference an issue in the same SitRep version'; end if;
  return new;
end
$$;

create function public.check_sitrep_detail_total()
returns trigger language plpgsql set search_path = pg_catalog, public as $$
declare v_id uuid; v_tenant uuid; v_kind public.sitrep_content_kind; v_exists boolean;
begin
  if tg_table_name = 'sitrep_content_item' then
    v_id := coalesce(new.id, old.id); v_tenant := coalesce(new.tenant_id, old.tenant_id);
  else
    v_id := coalesce(new.content_item_id, old.content_item_id); v_tenant := coalesce(new.tenant_id, old.tenant_id);
  end if;
  select kind into v_kind from public.sitrep_content_item where tenant_id = v_tenant and id = v_id;
  if not found then return null; end if;
  execute format('select exists(select 1 from public.%I where tenant_id=$1 and content_item_id=$2)', 'sitrep_' || v_kind::text)
    into v_exists using v_tenant, v_id;
  if not v_exists then raise exception 'SitRep content requires its matching typed detail: %', v_kind; end if;
  return null;
end
$$;
create constraint trigger sitrep_detail_total after insert or update on public.sitrep_content_item
deferrable initially deferred for each row execute function public.check_sitrep_detail_total();

create function public.sitrep_structured_payload(p_tenant uuid, p_version uuid)
returns jsonb language plpgsql stable set search_path = pg_catalog, public as $$
declare v_kind public.sitrep_content_kind; v_detail jsonb; v_result jsonb := '{}'::jsonb;
begin
  foreach v_kind in array enum_range(null::public.sitrep_content_kind) loop
    execute format('select coalesce(jsonb_agg(to_jsonb(d) order by d.content_item_id), ''[]''::jsonb)
      from public.%I d join public.sitrep_content_item c on c.tenant_id=d.tenant_id and c.id=d.content_item_id
      where c.tenant_id=$1 and c.situation_report_version_id=$2', 'sitrep_' || v_kind::text)
      into v_detail using p_tenant, p_version;
    v_result := v_result || jsonb_build_object(v_kind::text, v_detail);
  end loop;
  return v_result;
end
$$;

create trigger incident_overview_detail_identity before insert or update on public.sitrep_incident_overview
for each row execute function public.check_sitrep_detail();
create trigger incident_overview_detail_immutable before insert or update or delete on public.sitrep_incident_overview
for each row execute function public.guard_sitrep_indirect_child('content_item_id', 'content_item');
create constraint trigger incident_overview_detail_total after insert or update or delete on public.sitrep_incident_overview
deferrable initially deferred for each row execute function public.check_sitrep_detail_total();

create trigger geographic_coverage_detail_identity before insert or update on public.sitrep_geographic_coverage
for each row execute function public.check_sitrep_detail();
create trigger geographic_coverage_detail_immutable before insert or update or delete on public.sitrep_geographic_coverage
for each row execute function public.guard_sitrep_indirect_child('content_item_id', 'content_item');
create constraint trigger geographic_coverage_detail_total after insert or update or delete on public.sitrep_geographic_coverage
deferrable initially deferred for each row execute function public.check_sitrep_detail_total();

create trigger hazard_condition_detail_identity before insert or update on public.sitrep_hazard_condition
for each row execute function public.check_sitrep_detail();
create trigger hazard_condition_detail_immutable before insert or update or delete on public.sitrep_hazard_condition
for each row execute function public.guard_sitrep_indirect_child('content_item_id', 'content_item');
create constraint trigger hazard_condition_detail_total after insert or update or delete on public.sitrep_hazard_condition
deferrable initially deferred for each row execute function public.check_sitrep_detail_total();

create trigger chronology_detail_identity before insert or update on public.sitrep_chronology
for each row execute function public.check_sitrep_detail();
create trigger chronology_detail_immutable before insert or update or delete on public.sitrep_chronology
for each row execute function public.guard_sitrep_indirect_child('content_item_id', 'content_item');
create constraint trigger chronology_detail_total after insert or update or delete on public.sitrep_chronology
deferrable initially deferred for each row execute function public.check_sitrep_detail_total();

create trigger preparedness_measure_detail_identity before insert or update on public.sitrep_preparedness_measure
for each row execute function public.check_sitrep_detail();
create trigger preparedness_measure_detail_immutable before insert or update or delete on public.sitrep_preparedness_measure
for each row execute function public.guard_sitrep_indirect_child('content_item_id', 'content_item');
create constraint trigger preparedness_measure_detail_total after insert or update or delete on public.sitrep_preparedness_measure
deferrable initially deferred for each row execute function public.check_sitrep_detail_total();

create trigger exposure_summary_detail_identity before insert or update on public.sitrep_exposure_summary
for each row execute function public.check_sitrep_detail();
create trigger exposure_summary_detail_immutable before insert or update or delete on public.sitrep_exposure_summary
for each row execute function public.guard_sitrep_indirect_child('content_item_id', 'content_item');
create constraint trigger exposure_summary_detail_total after insert or update or delete on public.sitrep_exposure_summary
deferrable initially deferred for each row execute function public.check_sitrep_detail_total();

create trigger related_incident_detail_identity before insert or update on public.sitrep_related_incident
for each row execute function public.check_sitrep_detail();
create trigger related_incident_detail_immutable before insert or update or delete on public.sitrep_related_incident
for each row execute function public.guard_sitrep_indirect_child('content_item_id', 'content_item');
create constraint trigger related_incident_detail_total after insert or update or delete on public.sitrep_related_incident
deferrable initially deferred for each row execute function public.check_sitrep_detail_total();

create trigger displaced_population_detail_identity before insert or update on public.sitrep_displaced_population
for each row execute function public.check_sitrep_detail();
create trigger displaced_population_detail_immutable before insert or update or delete on public.sitrep_displaced_population
for each row execute function public.guard_sitrep_indirect_child('content_item_id', 'content_item');
create constraint trigger displaced_population_detail_total after insert or update or delete on public.sitrep_displaced_population
deferrable initially deferred for each row execute function public.check_sitrep_detail_total();

create trigger lifeline_status_detail_identity before insert or update on public.sitrep_lifeline_status
for each row execute function public.check_sitrep_detail();
create trigger lifeline_status_detail_immutable before insert or update or delete on public.sitrep_lifeline_status
for each row execute function public.guard_sitrep_indirect_child('content_item_id', 'content_item');
create constraint trigger lifeline_status_detail_total after insert or update or delete on public.sitrep_lifeline_status
deferrable initially deferred for each row execute function public.check_sitrep_detail_total();

create trigger class_work_suspension_detail_identity before insert or update on public.sitrep_class_work_suspension
for each row execute function public.check_sitrep_detail();
create trigger class_work_suspension_detail_immutable before insert or update or delete on public.sitrep_class_work_suspension
for each row execute function public.guard_sitrep_indirect_child('content_item_id', 'content_item');
create constraint trigger class_work_suspension_detail_total after insert or update or delete on public.sitrep_class_work_suspension
deferrable initially deferred for each row execute function public.check_sitrep_detail_total();

create trigger calamity_declaration_detail_identity before insert or update on public.sitrep_calamity_declaration
for each row execute function public.check_sitrep_detail();
create trigger calamity_declaration_detail_immutable before insert or update or delete on public.sitrep_calamity_declaration
for each row execute function public.guard_sitrep_indirect_child('content_item_id', 'content_item');
create constraint trigger calamity_declaration_detail_total after insert or update or delete on public.sitrep_calamity_declaration
deferrable initially deferred for each row execute function public.check_sitrep_detail_total();

create trigger preemptive_evacuation_detail_identity before insert or update on public.sitrep_preemptive_evacuation
for each row execute function public.check_sitrep_detail();
create trigger preemptive_evacuation_detail_immutable before insert or update or delete on public.sitrep_preemptive_evacuation
for each row execute function public.guard_sitrep_indirect_child('content_item_id', 'content_item');
create constraint trigger preemptive_evacuation_detail_total after insert or update or delete on public.sitrep_preemptive_evacuation
deferrable initially deferred for each row execute function public.check_sitrep_detail_total();

create trigger response_action_detail_identity before insert or update on public.sitrep_response_action
for each row execute function public.check_sitrep_detail();
create trigger response_action_detail_immutable before insert or update or delete on public.sitrep_response_action
for each row execute function public.guard_sitrep_indirect_child('content_item_id', 'content_item');
create constraint trigger response_action_detail_total after insert or update or delete on public.sitrep_response_action
deferrable initially deferred for each row execute function public.check_sitrep_detail_total();

create trigger assistance_provided_detail_identity before insert or update on public.sitrep_assistance_provided
for each row execute function public.check_sitrep_detail();
create trigger assistance_provided_detail_immutable before insert or update or delete on public.sitrep_assistance_provided
for each row execute function public.guard_sitrep_indirect_child('content_item_id', 'content_item');
create constraint trigger assistance_provided_detail_total after insert or update or delete on public.sitrep_assistance_provided
deferrable initially deferred for each row execute function public.check_sitrep_detail_total();

create trigger issue_concern_detail_identity before insert or update on public.sitrep_issue_concern
for each row execute function public.check_sitrep_detail();
create trigger issue_concern_detail_immutable before insert or update or delete on public.sitrep_issue_concern
for each row execute function public.guard_sitrep_indirect_child('content_item_id', 'content_item');
create constraint trigger issue_concern_detail_total after insert or update or delete on public.sitrep_issue_concern
deferrable initially deferred for each row execute function public.check_sitrep_detail_total();

create trigger recommendation_detail_identity before insert or update on public.sitrep_recommendation
for each row execute function public.check_sitrep_detail();
create trigger recommendation_detail_immutable before insert or update or delete on public.sitrep_recommendation
for each row execute function public.guard_sitrep_indirect_child('content_item_id', 'content_item');
create constraint trigger recommendation_detail_total after insert or update or delete on public.sitrep_recommendation
deferrable initially deferred for each row execute function public.check_sitrep_detail_total();

-- Level-specific relations preserve separate module names without duplicating
-- common fields, validation logic, or history tables. These are views, not tables.
create view public.purok_profile with (security_invoker = true) as
select * from public.profile where level = 'purok';
create view public.barangay_profile with (security_invoker = true) as
select * from public.profile where level = 'barangay';
create view public.purok_incident_report with (security_invoker = true) as
select * from public.incident_report where level = 'purok';
create view public.barangay_incident_report with (security_invoker = true) as
select * from public.incident_report where level = 'barangay';
create view public.purok_profile_verification with (security_invoker = true) as
select d.* from public.profile_review_decision d join public.profile_version v on v.tenant_id=d.tenant_id and v.id=d.profile_version_id
join public.profile p on p.tenant_id=v.tenant_id and p.id=v.profile_id where p.level='purok';
create view public.barangay_profile_verification with (security_invoker = true) as
select d.* from public.profile_review_decision d join public.profile_version v on v.tenant_id=d.tenant_id and v.id=d.profile_version_id
join public.profile p on p.tenant_id=v.tenant_id and p.id=v.profile_id where p.level='barangay';
create view public.purok_report_verification with (security_invoker = true) as
select d.* from public.report_review_decision d join public.incident_report_version v on v.tenant_id=d.tenant_id and v.id=d.report_version_id
join public.incident_report r on r.tenant_id=v.tenant_id and r.id=v.report_id where r.level='purok';
create view public.barangay_report_verification with (security_invoker = true) as
select d.* from public.report_review_decision d join public.incident_report_version v on v.tenant_id=d.tenant_id and v.id=d.report_version_id
join public.incident_report r on r.tenant_id=v.tenant_id and r.id=v.report_id where r.level='barangay';

create function public.current_account_id(p_tenant_id uuid)
returns uuid
language sql
stable
security definer
set search_path = pg_catalog, public
as $$
  select a.id from public.account a
  where a.tenant_id = p_tenant_id and a.auth_user_id = auth.uid() and a.status = 'active'
$$;

create function public.is_active_tenant_member(p_tenant_id uuid)
returns boolean
language sql
stable
security definer
set search_path = pg_catalog, public
as $$
  select exists (
    select 1 from public.account a
    where a.tenant_id = p_tenant_id and a.auth_user_id = auth.uid() and a.status = 'active'
  )
$$;

revoke all on function public.current_account_id(uuid) from public;
revoke all on function public.is_active_tenant_member(uuid) from public;
grant execute on function public.current_account_id(uuid) to authenticated;
grant execute on function public.is_active_tenant_member(uuid) to authenticated;

do $$
declare v_table text;
begin
  foreach v_table in array array[
    'organization_unit','account','purok_account','barangay_account','drrm_account','role_assignment',
'information_source','evidence','profile','profile_version',
    'profile_review_decision','profile_version_evidence','barangay_profile_source','hazard_type','hazard_record','hazard_version',
    'hazard_review_decision','hazard_version_evidence','incident_type','incident','incident_hazard','incident_report',
    'incident_report_version','report_version_source','report_effect_item','affected_population','casualty_summary',
    'damage_assessment','report_review_decision','barangay_report_source','report_version_evidence',
    'situation_report','situation_report_incident','situation_report_version','situation_report_section',
    'sitrep_source_snapshot','snapshot_barangay_report','snapshot_hazard_version','sitrep_data_point',
    'sitrep_data_point_source','sitrep_value_override','sitrep_content_item','sitrep_content_evidence',
    'sitrep_decision','sitrep_signatory','sitrep_annex','sitrep_export','audit_event',
'profile_population','profile_demographic','profile_housing','profile_hazard_exposure','profile_exposed_group','hazard_characteristic','evacuation_center','sitrep_incident_overview','sitrep_geographic_coverage','sitrep_hazard_condition','sitrep_chronology','sitrep_preparedness_measure','sitrep_exposure_summary','sitrep_related_incident','sitrep_displaced_population','sitrep_lifeline_status','sitrep_class_work_suspension','sitrep_calamity_declaration','sitrep_preemptive_evacuation','sitrep_response_action','sitrep_assistance_provided','sitrep_issue_concern','sitrep_recommendation'
  ] loop
    execute format('alter table public.%I enable row level security', v_table);
    execute format('alter table public.%I force row level security', v_table);
  end loop;
end
$$;

alter table public.tenant enable row level security;
alter table public.tenant force row level security;
create policy own_tenant_read on public.tenant for select to authenticated
using (public.is_active_tenant_member(id));

create policy tenant_geography_read on public.organization_unit for select to authenticated
using (public.is_active_tenant_member(tenant_id));
create policy own_account_read on public.account for select to authenticated
using (id = public.current_account_id(tenant_id));
create policy own_purok_subtype_read on public.purok_account for select to authenticated
using (account_id = public.current_account_id(tenant_id));
create policy own_barangay_subtype_read on public.barangay_account for select to authenticated
using (account_id = public.current_account_id(tenant_id));
create policy own_drrm_subtype_read on public.drrm_account for select to authenticated
using (account_id = public.current_account_id(tenant_id));
create policy tenant_hazard_type_catalog_read on public.hazard_type for select to authenticated
using (public.is_active_tenant_member(tenant_id));
create policy tenant_incident_type_catalog_read on public.incident_type for select to authenticated
using (public.is_active_tenant_member(tenant_id));

-- All remaining tenant tables intentionally have no direct browser policy yet.
-- Their scoped policies/RPCs must be added with the first vertical application slice;
-- until then RLS fails closed instead of exposing sibling jurisdictions or restricted evidence.

create index organization_unit_parent_idx on public.organization_unit(tenant_id, parent_id);
create index role_assignment_scope_idx on public.role_assignment(tenant_id, account_id, unit_id, role);
create index profile_version_queue_idx on public.profile_version(tenant_id, state, submitted_at);
create index hazard_version_queue_idx on public.hazard_version(tenant_id, state, submitted_at);
create index incident_report_version_queue_idx on public.incident_report_version(tenant_id, state, submitted_at);
create index report_effect_version_idx on public.report_effect_item(tenant_id, report_version_id, kind);
create index sitrep_version_state_idx on public.situation_report_version(tenant_id, state, as_of_at);
create unique index snapshot_one_included_report_version_per_series
on public.snapshot_barangay_report(tenant_id, snapshot_id, report_id)
where disposition = 'included';
create unique index snapshot_one_included_hazard_version_per_series
on public.snapshot_hazard_version(tenant_id, snapshot_id, hazard_record_id)
where disposition = 'included';

comment on table public.incident_report_version is
  'Purok versions are always Initial; Barangay versions may be Initial, Progress, Terminal, or Final. Submitted content is immutable.';
comment on table public.affected_population is
  'Family and person totals have independent states so a known count is never inferred from an unknown value.';
comment on table public.sitrep_content_item is
  'DRRM-owned formal Situation Report content. Population, casualty, and damage remain derived data points with source lineage.';
comment on function public.valid_count_state(bigint, public.value_state) is
  'Preserves the semantic difference between reported zero, unknown, not applicable, and non-final values.';

commit;
