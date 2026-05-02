alter table public.pets
add column if not exists profile_theme text not null default 'azul';

do $$
begin
  if not exists (
    select 1
    from pg_constraint
    where conname = 'pets_profile_theme_check'
      and conrelid = 'public.pets'::regclass
  ) then
    alter table public.pets
    add constraint pets_profile_theme_check
    check (profile_theme in ('azul', 'rosado', 'morado', 'rojo', 'verde', 'naranja', 'pastel', 'tierra', 'neon', 'grafito'));
  end if;
end;
$$;

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
      'profile_theme', p.profile_theme,
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
