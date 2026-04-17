# WavePanel — contexto para Claude

SaaS vertical para escuelas de surf, kite y deportes acuáticos. Repo y carpeta totalmente independientes de Entre Olas.

## Datos clave

- **Repo:** `github.com/felipecbbb/wavepanel-`
- **Carpeta:** `~/Code/wavepanel/` (NO usar `~/Desktop/...` — el Desktop tiene problemas de mmap que cuelgan git/rsync/mv)
- **Stack:** HTML estático + CSS + JS vanilla, sin build. Vercel para hosting.
- **Supabase del SaaS:** `aloxbttkypvkcrethwex` (separado del de Entre Olas)
- **Email transaccional:** Resend (free tier, key configurada como secret)

## Estructura

```
wavepanel/
├── index.html · funcionalidades.html · planes.html · ...   (14 páginas)
├── modulos/{core,tienda,surf-camps,whatsapp}.html
├── legal/{aviso-legal,privacidad,cookies}.html
├── assets/
│   ├── styles.css            CSS principal
│   ├── panel-mockups.css     Mockups del panel + testimonios + video frame
│   ├── main.js               Nav mobile
│   ├── leads.js              Bind de form[data-wp-form] → Supabase REST
│   ├── supabase-config.js    URL + publishable key (no secrets aquí)
│   ├── demo.mp4              Vídeo Remotion (3.2MB)
│   └── demo-poster.svg
├── remotion/                 Proyecto Remotion (npm install + npm run build)
│   └── src/scenes/*.tsx      6 escenas del vídeo demo
├── supabase/
│   ├── config.toml           Linkado a project ref aloxbttkypvkcrethwex
│   ├── migrations/*.sql      Schema de leads + triggers
│   └── functions/notify-lead/ Edge Function que envía email via Resend
├── vercel.json · sitemap.xml · robots.txt
└── README.md
```

## Camino A — estrategia actual

NO hay multi-tenant ni self-service todavía. Solo se vende el **Plan Personalizado (2.500€-2.900€)** clonando el **template de WavePanel** a un repo+Supabase nuevo por cliente. Los planes Básico (29€) y Pro (79€) están en lista de espera en la web.

## Tres carpetas distintas (no mezclar)

- `~/Code/wavepanel/` — este repo. Monorepo con dos piezas:
  - **Landing comercial** (raíz: `index.html`, `planes.html`, etc.) — HTML estático.
  - **SaaS multi-tenant** (`app/`) — Next.js 16 + Supabase SSR + Stripe. Signup/login/dashboard funcionales desde 2026-04-17. Sirve los planes Básico y Pro (los que hoy están en lista de espera).
- `~/Code/wavepanel-template/` — **código base** que se clona para cada cliente del Plan Personalizado. Snapshot inicial = copia de Entre Olas; se irá generalizando.
- `~/Desktop/entreolasur/` — **primer cliente en producción**. NO se toca al iterar el SaaS. Recibe features del template por cherry-pick explícito.

## Multi-tenant SaaS (app/)

- **URL producción:** `{slug}.wavepanel.app` (subdominio por tenant) + `wavepanel.app` (landing).
- **Dev:** `localhost:3001?tenant={slug}` (fallback sin /etc/hosts).
- **Schema:** tabla `schools` (slug, plan, trial_ends_at, stripe_*) + `school_members` (school_id, user_id, role). RLS filtra por school del user autenticado.
- **Signup:** client-side `auth.signUp` + RPC `create_school_with_owner` (SECURITY DEFINER). Crea trial de 14 días.
- **Stripe:** aún no integrado (Fase 2). Hoy las cuentas trial creadas no pueden convertirse a pagadas.

## Flujo de leads (probado E2E)

```
form[data-wp-form] → Supabase REST (anon insert leads)
                       ↓ trigger after-insert
                   pg_net.http_post
                       ↓
              Edge Function notify-lead
                       ↓
                 Resend → email a felipecabarro@gmail.com
```

Tipos de lead: `contact`, `demo_request`, `waitlist_basic`, `waitlist_pro`, `custom_quote`.
Los waitlist se generan desde URLs `?plan=basico&waitlist=1` que `contacto.html` interpreta.

## Pendientes conocidos

- **🔒 Rotar service_role JWT de Supabase** — el JWT legacy fue hardcodeado en migration `20260416133436_webhook_notify_lead.sql` y está en el git history del repo público. Settings → API → Reset legacy JWT secret. El archivo ya está saneado (requiere que el secret exista en Vault antes de aplicar).
- **Fase 2 del SaaS:** integrar Stripe Subscriptions (prices para Básico/Pro mensual+anual) + webhook que actualice `stripe_status` en `schools`.
- **Fase 3 del SaaS:** features del panel — reservas, clientes, actividades, calendario.
- Verificar dominio en Resend cuando se compre `wavepanel.app` → poder enviar a cualquier destinatario.
- Comprar dominio `wavepanel.app` y configurar en Vercel dos proyectos apuntando al mismo repo: landing (root) + app (`app/`, wildcard `*.wavepanel.app`).
- Generalizar `wavepanel-template/`: quitar branding Entre Olas, datos Supabase concretos, imágenes, copy específico → placeholders.
- Publicar `wavepanel-template` como repo en GitHub (privado al principio) y apuntar el kit allí en lugar de a una carpeta local.

## Comandos comunes

```bash
# Push (usar gh para evitar prompt de keychain en macOS)
gh auth setup-git && git push origin main

# Schema changes
supabase db push --linked

# Edge Function deploy
supabase functions deploy notify-lead

# Render del vídeo
cd remotion && npm run build
```
