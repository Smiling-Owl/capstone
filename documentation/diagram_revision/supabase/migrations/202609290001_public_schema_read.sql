begin;

-- Public visitors may read published schema versions; annotation data remains member-only.
revoke all on public.workbench_annotations from anon;
revoke all on public.workbench_schema_versions from anon;
revoke all on public.workbench_annotations from public;
revoke all on public.workbench_schema_versions from public;
grant select (id, name, published_at, snapshot) on public.workbench_schema_versions to anon;

create policy workbench_schema_public_read
on public.workbench_schema_versions
for select to anon
using (true);

commit;
