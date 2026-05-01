create or replace function public.get_public_pet_profile(token text)
returns jsonb
language plpgsql
stable
security definer
set search_path = public
as $$
declare
  profile jsonb;
begin
  select jsonb_build_object(
    'pet', jsonb_build_object(
      'id', p.id,
      'name', p.name,
      'species', p.species,
      'breed', p.breed,
      'sex', p.sex,
      'birth_date', p.birth_date,
      'color', p.color,
      'weight', p.weight,
      'photo_url', case when coalesce(s.show_pet_photo, true) then p.photo_url else null end,
      'public_token', p.public_token
    ),
    'owner', case
      when coalesce(s.show_owner_name, false)
        or coalesce(s.show_owner_phone, false)
      then jsonb_build_object(
        'full_name', case when coalesce(s.show_owner_name, false) then pr.full_name else null end,
        'phone', case when coalesce(s.show_owner_phone, false) then pr.phone else null end
      )
      else null
    end,
    'settings', jsonb_build_object(
      'show_pet_photo', coalesce(s.show_pet_photo, true),
      'show_owner_name', coalesce(s.show_owner_name, false),
      'show_owner_phone', coalesce(s.show_owner_phone, false),
      'show_emergency_contact', coalesce(s.show_emergency_contact, true),
      'show_vaccination_status', coalesce(s.show_vaccination_status, true),
      'show_allergies', coalesce(s.show_allergies, true),
      'show_medical_notes', coalesce(s.show_medical_notes, false)
    ),
    'records', (
      select coalesce(
        jsonb_agg(
          jsonb_build_object(
            'id', public_records.id,
            'record_type', public_records.record_type,
            'title', public_records.title,
            'date', public_records.date,
            'next_due_date', public_records.next_due_date
          )
          order by public_records.date desc
        ),
        '[]'::jsonb
      )
      from (
        select vr.id, vr.record_type, vr.title, vr.date, vr.next_due_date
        from public.veterinary_records vr
        where vr.pet_id = p.id
          and (
            (vr.record_type = 'vacuna' and coalesce(s.show_vaccination_status, true))
            or (vr.record_type = 'alergia' and coalesce(s.show_allergies, true))
          )
        order by vr.date desc
        limit 8
      ) public_records
    )
  )
  into profile
  from public.pets p
  left join public.public_profile_settings s on s.pet_id = p.id
  left join public.profiles pr on pr.user_id = p.owner_id
  where p.public_token = token
    and p.nfc_enabled = true
    and p.is_public_enabled = true;

  return profile;
end;
$$;

revoke all on function public.get_public_pet_profile(text) from public;
grant execute on function public.get_public_pet_profile(text) to anon, authenticated;

create or replace function public.prevent_customer_pet_sensitive_update()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  if public.is_admin() then
    return new;
  end if;

  if new.owner_id is distinct from old.owner_id
    or new.public_token is distinct from old.public_token
    or new.nfc_enabled is distinct from old.nfc_enabled
    or new.created_at is distinct from old.created_at
  then
    raise exception 'Only admins can update protected pet fields.';
  end if;

  return new;
end;
$$;

drop trigger if exists pets_prevent_customer_sensitive_update on public.pets;
create trigger pets_prevent_customer_sensitive_update
before update on public.pets
for each row execute function public.prevent_customer_pet_sensitive_update();

drop policy if exists "profiles_public_contact_for_enabled_pet" on public.profiles;

drop policy if exists "pets_select_own_admin_or_public" on public.pets;
drop policy if exists "pets_select_own_or_admin" on public.pets;
create policy "pets_select_own_or_admin"
on public.pets for select
using (owner_id = auth.uid() or public.is_admin());

drop policy if exists "records_select_owner_admin_or_safe_public" on public.veterinary_records;
drop policy if exists "records_select_owner_or_admin" on public.veterinary_records;
create policy "records_select_owner_or_admin"
on public.veterinary_records for select
using (
  public.is_admin()
  or exists (
    select 1 from public.pets p
    where p.id = veterinary_records.pet_id
      and p.owner_id = auth.uid()
  )
);

drop policy if exists "settings_select_owner_admin_or_public_pet" on public.public_profile_settings;
drop policy if exists "settings_select_owner_or_admin" on public.public_profile_settings;
create policy "settings_select_owner_or_admin"
on public.public_profile_settings for select
using (
  public.is_admin()
  or exists (
    select 1 from public.pets p
    where p.id = public_profile_settings.pet_id
      and p.owner_id = auth.uid()
  )
);

drop policy if exists "pet_photos_authenticated_upload" on storage.objects;
drop policy if exists "pet_photos_owner_update" on storage.objects;
drop policy if exists "pet_photos_owner_upload" on storage.objects;
drop policy if exists "pet_photos_owner_update_or_admin" on storage.objects;
drop policy if exists "pet_photos_owner_delete_or_admin" on storage.objects;

create policy "pet_photos_owner_upload"
on storage.objects for insert
with check (
  bucket_id = 'pet-photos'
  and auth.role() = 'authenticated'
  and (storage.foldername(name))[1] = auth.uid()::text
);

create policy "pet_photos_owner_update_or_admin"
on storage.objects for update
using (
  bucket_id = 'pet-photos'
  and auth.role() = 'authenticated'
  and ((storage.foldername(name))[1] = auth.uid()::text or public.is_admin())
)
with check (
  bucket_id = 'pet-photos'
  and auth.role() = 'authenticated'
  and ((storage.foldername(name))[1] = auth.uid()::text or public.is_admin())
);

create policy "pet_photos_owner_delete_or_admin"
on storage.objects for delete
using (
  bucket_id = 'pet-photos'
  and auth.role() = 'authenticated'
  and ((storage.foldername(name))[1] = auth.uid()::text or public.is_admin())
);
