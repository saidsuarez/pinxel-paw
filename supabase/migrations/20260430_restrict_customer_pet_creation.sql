drop policy if exists "pets_insert_owner_or_admin" on public.pets;
drop policy if exists "pets_insert_admin_only" on public.pets;

create policy "pets_insert_admin_only"
on public.pets for insert
with check (public.is_admin());
