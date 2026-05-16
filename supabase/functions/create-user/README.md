# create-user

Edge Function para que jefe/admin cree usuarios reales de Supabase Auth.

## Desplegar

```bash
supabase functions deploy create-user
```

## Secrets

```bash
supabase secrets set SUPABASE_URL=https://TU_PROYECTO.supabase.co
supabase secrets set SUPABASE_SERVICE_ROLE_KEY=TU_SERVICE_ROLE_KEY
```

No pongas la SERVICE_ROLE_KEY en Vercel ni en React.
