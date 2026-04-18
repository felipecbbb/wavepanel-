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

El template (`wavepanel-template/supabase/`) tiene el schema en archivos planos:
- `schema.sql` → tablas base (profiles, products, orders, etc.)
- `migration-*.sql` → incrementales (activities, payments, coupons, bonos, reservation-system, etc.)

**NO usar `supabase db push`**: estos archivos no siguen el formato timestamp de
`supabase/migrations/` que espera la CLI. Aplicarlos manualmente en orden:

```bash
# URL de conexión: Settings → Database → Connection string → URI
export DB_URL="postgresql://postgres:[PASSWORD]@db.xxxxxxxxx.supabase.co:5432/postgres"

cd ~/Code/wavepanel-template/supabase

# 1. Schema base
psql "$DB_URL" -f schema.sql

# 2. Migraciones en orden alfabético (para en el primer fallo)
for f in migration-*.sql; do
  echo "→ $f"
  psql "$DB_URL" -f "$f" || { echo "FAIL en $f"; break; }
done
```

> **TODO (pendiente):** convertir estos archivos a migraciones CLI-compatibles
> (prefijo timestamp en `supabase/migrations/`) para que `supabase db push`
> funcione directo. Mientras tanto, aplicar con `psql` en orden es la ruta probada.

## E. Seed de datos básicos del cliente

Poblar actividades base, packs y (opcional) productos:

```bash
psql "$DB_URL" -f ~/Code/wavepanel/kit/tools/seed-activities.sql
```

Ajusta precios/nombres en `seed-activities.sql` **antes de ejecutar** si el
cliente tiene tarifas distintas a los defaults. El equipo humano (staff) NO
se seedea: aparece como contenido estático en las páginas del template
(no hay tabla `instructores` en el schema).

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

Las policies vienen aplicadas por el schema; verificar que están activas:

- `profiles`: usuario solo lee/edita su propia row (role='client' por defecto)
- `orders` / `bookings` / `class_enrollments`: usuario solo ve las suyas
- `products`: lectura pública, escritura solo role='admin'
- `bonos`: usuario solo ve los suyos (créditos pre-pagados)
- `activities` / `activity_packs`: lectura pública, escritura solo admin
- `surf_camps`: lectura pública, escritura solo admin

Si una tabla aparece sin RLS habilitado: `alter table X enable row level security;`

## I. Edge Functions

El template trae 3 Edge Functions en `supabase/functions/`:
- `create-checkout` — genera sesiones de Stripe Checkout
- `stripe-webhook` — procesa eventos de Stripe (pago OK, reembolso, etc.)
- `send-email` — envía transaccionales vía Resend

```bash
cd ~/Code/wavepanel-template

# Deploy de las 3 functions al proyecto del cliente
supabase functions deploy create-checkout --project-ref xxxxxxxxx
supabase functions deploy stripe-webhook  --project-ref xxxxxxxxx
supabase functions deploy send-email      --project-ref xxxxxxxxx

# Secrets que las functions necesitan (sustituye por los del cliente)
supabase secrets set --project-ref xxxxxxxxx \
  STRIPE_SECRET_KEY=sk_live_... \
  STRIPE_WEBHOOK_SECRET=whsec_... \
  RESEND_API_KEY=re_... \
  EMAIL_FROM=reservas@cliente.com \
  EMAIL_FROM_NAME="Nombre Cliente" \
  EMAIL_NOTIFY_ADMIN=admin@cliente.com
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
- [ ] Datos básicos (actividades + packs) seeded
- [ ] Edge Functions deployadas
- [ ] Test desde frontend cargando datos OK
