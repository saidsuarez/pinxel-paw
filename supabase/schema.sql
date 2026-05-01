create extension if not exists "pgcrypto";

create type public.user_role as enum ('admin', 'customer');

create table public.profiles (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null unique references auth.users(id) on delete cascade,
  full_name text,
  email text not null,
  phone text,
  role public.user_role not null default 'customer',
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table public.pets (
  id uuid primary key default gen_random_uuid(),
  owner_id uuid not null references auth.users(id) on delete cascade,
  name text not null,
  species text not null,
  breed text,
  sex text,
  birth_date date,
  color text,
  weight numeric(6,2),
  photo_url text,
  public_token text not null unique,
  nfc_enabled boolean not null default true,
  is_public_enabled boolean not null default true,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table public.veterinary_records (
  id uuid primary key default gen_random_uuid(),
  pet_id uuid not null references public.pets(id) on delete cascade,
  record_type text not null,
  title text not null,
  description text,
  date date not null,
  veterinarian_name text,
  clinic_name text,
  next_due_date date,
  attachment_url text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table public.public_profile_settings (
  id uuid primary key default gen_random_uuid(),
  pet_id uuid not null unique references public.pets(id) on delete cascade,
  show_pet_photo boolean not null default true,
  show_owner_name boolean not null default false,
  show_owner_phone boolean not null default false,
  show_emergency_contact boolean not null default true,
  show_vaccination_status boolean not null default true,
  show_allergies boolean not null default true,
  show_medical_notes boolean not null default false,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index pets_owner_id_idx on public.pets(owner_id);
create index pets_public_token_idx on public.pets(public_token);
create index veterinary_records_pet_id_idx on public.veterinary_records(pet_id);

create or replace function public.set_updated_at()
returns trigger
language plpgsql
as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

create trigger profiles_set_updated_at before update on public.profiles
for each row execute function public.set_updated_at();

create trigger pets_set_updated_at before update on public.pets
for each row execute function public.set_updated_at();

create trigger veterinary_records_set_updated_at before update on public.veterinary_records
for each row execute function public.set_updated_at();

create trigger public_profile_settings_set_updated_at before update on public.public_profile_settings
for each row execute function public.set_updated_at();

create or replace function public.handle_new_user()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  insert into public.profiles (user_id, full_name, email, phone, role)
  values (
    new.id,
    new.raw_user_meta_data ->> 'full_name',
    new.email,
    new.raw_user_meta_data ->> 'phone',
    coalesce((new.raw_user_meta_data ->> 'role')::public.user_role, 'customer')
  );
  return new;
end;
$$;

create trigger on_auth_user_created
after insert on auth.users
for each row execute function public.handle_new_user();

create or replace function public.is_admin()
returns boolean
language sql
stable
security definer
set search_path = public
as $$
  select exists (
    select 1 from public.profiles
    where user_id = auth.uid()
    and role = 'admin'
  );
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

create trigger pets_prevent_customer_sensitive_update before update on public.pets
for each row execute function public.prevent_customer_pet_sensitive_update();

alter table public.profiles enable row level security;
alter table public.pets enable row level security;
alter table public.veterinary_records enable row level security;
alter table public.public_profile_settings enable row level security;

create policy "profiles_select_own_or_admin"
on public.profiles for select
using (user_id = auth.uid() or public.is_admin());

create policy "profiles_update_own_or_admin"
on public.profiles for update
using (user_id = auth.uid() or public.is_admin())
with check (user_id = auth.uid() or public.is_admin());

create policy "pets_select_own_or_admin"
on public.pets for select
using (owner_id = auth.uid() or public.is_admin());

create policy "pets_insert_admin_only"
on public.pets for insert
with check (public.is_admin());

create policy "pets_update_owner_or_admin"
on public.pets for update
using (owner_id = auth.uid() or public.is_admin())
with check (owner_id = auth.uid() or public.is_admin());

create policy "pets_delete_admin"
on public.pets for delete
using (public.is_admin());

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

create policy "records_insert_owner_or_admin"
on public.veterinary_records for insert
with check (
  public.is_admin()
  or exists (
    select 1 from public.pets p
    where p.id = veterinary_records.pet_id
      and p.owner_id = auth.uid()
  )
);

create policy "records_update_owner_or_admin"
on public.veterinary_records for update
using (
  public.is_admin()
  or exists (
    select 1 from public.pets p
    where p.id = veterinary_records.pet_id
      and p.owner_id = auth.uid()
  )
)
with check (
  public.is_admin()
  or exists (
    select 1 from public.pets p
    where p.id = veterinary_records.pet_id
      and p.owner_id = auth.uid()
  )
);

create policy "records_delete_admin"
on public.veterinary_records for delete
using (public.is_admin());

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

create policy "settings_insert_owner_or_admin"
on public.public_profile_settings for insert
with check (
  public.is_admin()
  or exists (
    select 1 from public.pets p
    where p.id = public_profile_settings.pet_id
      and p.owner_id = auth.uid()
  )
);

create policy "settings_update_owner_or_admin"
on public.public_profile_settings for update
using (
  public.is_admin()
  or exists (
    select 1 from public.pets p
    where p.id = public_profile_settings.pet_id
      and p.owner_id = auth.uid()
  )
)
with check (
  public.is_admin()
  or exists (
    select 1 from public.pets p
    where p.id = public_profile_settings.pet_id
      and p.owner_id = auth.uid()
  )
);

insert into storage.buckets (id, name, public)
values ('pet-photos', 'pet-photos', true)
on conflict (id) do nothing;

create policy "pet_photos_public_read"
on storage.objects for select
using (bucket_id = 'pet-photos');

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
