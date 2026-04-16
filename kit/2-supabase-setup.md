# 2 · Setup Supabase del cliente

Cada cliente tiene **su propio proyecto Supabase**. Datos completamente aislados.

## A. Crear el proyecto

1. Entrar en [supabase.com/dashboard](https://supabase.com/dashboard)
2. **New project** → Org `WavePanel Clients` (o crear)
3. **Name:** `wavepanel-{slug-cliente}` (ej: `wavepanel-somo-natural`)
4. **Region:** Frankfurt (eu-central-1) — más cerca de España
5. **Pricing:** Free tier para empezar (500MB DB, 1GB storage). Subir a Pro (25$/mes) cuando supere límites.
6. **Database password:** generar fuerte y guardar en 1Password/Bitwarden — esto es del cliente

## B. Capturar credenciales

Settings → API:

- **Project URL:** `https://xxxxxxxxx.supabase.co`
- **Project API key (publishable / sb_publishable_…):** para el frontend
- **service_role key:** SOLO para Edge Functions / scripts admin

Ponlas en el `.env` del repo del cliente:

```bash
VITE_SUPABASE_URL=https://xxxxxxxxx.supabase.co
VITE_SUPABASE_ANON_KEY=sb_publishable_xxx
SUPABASE_SERVICE_ROLE_KEY=eyJ...   # solo backend/edge functions
```

## C. Linkar la CLI

```bash
cd /ruta/al/repo/cliente
supabase link --project-ref xxxxxxxxx
```

## D. Aplicar el schema base de Entre Olas

Tienes 2 opciones:

### Opción 1 — Migración limpia (recomendado)

Si tienes las migraciones SQL del template:

```bash
supabase db push --linked
```

### Opción 2 — Dump del template + restore

Si no tienes migraciones formales:

```bash
# 1. En el proyecto de Entre Olas, dump del schema (sin datos sensibles del cliente real)
supabase db dump --linked --schema public --data-only=false > schema.sql

# 2. Aplicar al proyecto del nuevo cliente
psql "postgresql://postgres:[PASSWORD]@db.xxxxxxxxx.supabase.co:5432/postgres" -f schema.sql
```

## E. Seed de datos básicos del cliente

Desde el cuestionario, crear las actividades, instructores y precios.

```bash
# Ejecutar el seed manual
psql "postgresql://postgres:[PASSWORD]@db.xxxxxxxxx.supabase.co:5432/postgres" -f kit/tools/seed-activities.sql
```

O por panel admin del cliente (si ya está accesible).

## F. Configurar Storage

Settings → Storage → crear buckets:

- `public` — acceso público (logos, imágenes web)
- `uploads` — acceso público
- `clientes` — privado (avatares, documentos)
- `firmas` — privado (PDFs de check-in firmados)

## G. Configurar Auth

Authentication → Providers → activar:
- Email (sin confirmación si quieres registro instantáneo)
- (Opcional) Google OAuth

Authentication → URL Configuration:
- **Site URL:** `https://{dominio-cliente}`
- **Redirect URLs:** `https://{dominio-cliente}/**`

## H. RLS (Row Level Security)

Ya viene del schema, pero verificar:
- `clientes`: usuario solo ve su propia row
- `reservas`: usuario solo ve sus reservas
- `productos`: lectura pública, escritura solo admin
- `bonos`: usuario solo ve los suyos

## I. Edge Functions (si el cliente las usa)

```bash
# Deploy todas
supabase functions deploy --project-ref xxxxxxxxx

# Configurar secrets del cliente
supabase secrets set --project-ref xxxxxxxxx \
  STRIPE_SECRET_KEY=sk_live_... \
  RESEND_API_KEY=re_... \
  EMAIL_FROM=reservas@cliente.com
```

## J. Verificar

```bash
# Probar que funciona desde el frontend
cd /ruta/repo/cliente
npm run dev
# Abre http://localhost:5173 y comprueba que carga datos
```

---

✅ **Hecho** cuando:
- [ ] Schema aplicado sin errores
- [ ] Buckets de Storage creados
- [ ] Auth configurada con dominio del cliente
- [ ] Datos básicos (actividades, instructores) seeded
- [ ] Edge Functions deployadas
- [ ] Test desde frontend cargando datos OK
