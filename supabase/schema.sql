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

create policy "profiles_public_contact_for_enabled_pet"
on public.profiles for select
using (
  exists (
    select 1
    from public.pets p
    join public.public_profile_settings s on s.pet_id = p.id
    where p.owner_id = profiles.user_id
      and p.nfc_enabled = true
      and p.is_public_enabled = true
      and (s.show_owner_name = true or s.show_owner_phone = true)
  )
);

create policy "pets_select_own_admin_or_public"
on public.pets for select
using (
  owner_id = auth.uid()
  or public.is_admin()
  or (nfc_enabled = true and is_public_enabled = true)
);

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

create policy "records_select_owner_admin_or_safe_public"
on public.veterinary_records for select
using (
  public.is_admin()
  or exists (
    select 1 from public.pets p
    where p.id = veterinary_records.pet_id
      and p.owner_id = auth.uid()
  )
  or (
    record_type in ('vacuna', 'alergia')
    and exists (
      select 1
      from public.pets p
      join public.public_profile_settings s on s.pet_id = p.id
      where p.id = veterinary_records.pet_id
        and p.nfc_enabled = true
        and p.is_public_enabled = true
        and (
          (record_type = 'vacuna' and s.show_vaccination_status = true)
          or (record_type = 'alergia' and s.show_allergies = true)
        )
    )
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

create policy "settings_select_owner_admin_or_public_pet"
on public.public_profile_settings for select
using (
  public.is_admin()
  or exists (
    select 1 from public.pets p
    where p.id = public_profile_settings.pet_id
      and (
        p.owner_id = auth.uid()
        or (p.nfc_enabled = true and p.is_public_enabled = true)
      )
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

create policy "pet_photos_authenticated_upload"
on storage.objects for insert
with check (bucket_id = 'pet-photos' and auth.role() = 'authenticated');

create policy "pet_photos_owner_update"
on storage.objects for update
using (bucket_id = 'pet-photos' and auth.role() = 'authenticated');
