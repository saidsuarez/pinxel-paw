# Security Notes

## Secret handling

- Never place passwords, Supabase service role keys, or other secrets in URLs, screenshots, commits, issue descriptions, or Vercel preview comments.
- Keep local secrets only in `.env.local`; this file must stay ignored by git.
- Configure production and preview secrets directly in Vercel Project Settings > Environment Variables.
- `SUPABASE_SERVICE_ROLE_KEY` must only be used from server-only code. Do not expose it through `NEXT_PUBLIC_*` variables.

## Required rotation after exposure

The first setup flow exposed temporary credentials in chat/context. Rotate these before relying on production data:

1. Change the affected test/admin user passwords in Supabase Auth.
2. Rotate the Supabase service role key from Supabase Project Settings > API.
3. Update the rotated `SUPABASE_SERVICE_ROLE_KEY` in Vercel and local `.env.local`.
4. Redeploy Vercel after updating secrets.

## Current app safeguards

- Sensitive forms use POST semantics so form values are not encoded into the browser URL.
- Auth errors shown to users are generic to avoid leaking internal provider details or confirming whether an email exists.
- Public NFC pages read through `get_public_pet_profile(token)`, a sanitized RPC that only returns public fields allowed by the pet privacy settings.
- Base tables for pets, owner profiles, records, and profile settings are not publicly selectable through RLS.
- Customer pet updates cannot change protected fields like owner, NFC token, NFC enabled state, or creation timestamp.
- Pet photo uploads are restricted to the authenticated user's own Storage folder.

## Remaining follow-up

- Add a stricter Content Security Policy after confirming every required external asset domain.
- Consider moving pet photos to a private bucket with signed URLs if photo URLs should not be publicly reachable by direct link.
- Upgrade Next.js when a safe patch is available for the current `postcss` advisory path.
