# Supabase Setup

1. Create a Supabase project.
2. Open SQL Editor and run `supabase/schema.sql`.
3. In Authentication > URL Configuration, add:
   - `http://localhost:3000`
   - `https://paw.pinxel.co`
4. In Storage, confirm the public bucket `pet-photos` exists.
5. Create the first admin:
   - Sign up once from `/register`, or create a user in Supabase Auth.
   - Run:

```sql
update public.profiles
set role = 'admin'
where email = 'tienda@pinxel.co';
```

## Security Notes

- Customers can only read and update their own pets and records.
- Admin users can read and update operational data through RLS.
- Public NFC pages only expose enabled pets plus safe public record types: `vacuna` and `alergia`.
- `SUPABASE_SERVICE_ROLE_KEY` is only used in server actions for admin user creation. Never prefix it with `NEXT_PUBLIC_`.
