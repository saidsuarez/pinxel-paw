# Paw Pinxel

MVP web para registros veterinarios digitales con NFC, construido con Next.js 15, TypeScript, Tailwind CSS, shadcn-style components y Supabase.

## Features

- Login, signup, logout y recuperación de contraseña con Supabase Auth.
- Panel cliente para mascotas y registros veterinarios.
- Panel admin básico para usuarios, mascotas y registros.
- CRUD inicial de mascotas y creación de registros médicos.
- Perfil público NFC en `/p/[publicToken]`.
- Privacidad pública configurable por mascota.
- Fotos de mascotas en Supabase Storage bucket `pet-photos`.
- RLS inicial para clientes, admin y vista pública.

## Stack

- Next.js 15 App Router
- TypeScript
- Tailwind CSS
- React Hook Form
- Zod
- Supabase Auth, Database y Storage
- Vercel

## Project Structure

```txt
src/
  app/
  components/
  hooks/
  lib/
  services/
  types/
  validations/
docs/
supabase/
.env.example
```

## Local Setup

```bash
npm install
cp .env.example .env.local
npm run dev
```

Set `.env.local`:

```bash
NEXT_PUBLIC_SUPABASE_URL=
NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY=
NEXT_PUBLIC_APP_URL=http://localhost:3000
SUPABASE_SERVICE_ROLE_KEY=
```

Run the database schema in Supabase:

```txt
supabase/schema.sql
```

## MVP Flow

1. Admin creates a customer in `/admin/users`.
2. Admin creates a pet in `/pets/new`.
3. The app generates `public_token`, for example `bruna-8F3K2`.
4. Admin programs the NFC sticker with:

```txt
https://paw.pinxel.co/p/bruna-8F3K2
```

5. Customer logs in and updates pet data, records and public privacy.

Customers cannot create or delete pets. Pinxel/admin controls how many pets a customer can manage by creating the purchased records first.

## Deployment

Deploy to Vercel and add the same environment variables. Configure the production domain as:

```txt
paw.pinxel.co
```

Do not expose `SUPABASE_SERVICE_ROLE_KEY` in client code.

## Initial Admin

Use this email for the first admin account:

```txt
tienda@pinxel.co
```
