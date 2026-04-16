# WavePanel

SaaS de gestión para escuelas de surf, kite y deportes acuáticos. Web pública + captación de leads + panel demo.

> Producto independiente. Vive en `~/Desktop/wavepanel/`. NO mezclar con `~/Desktop/entreolasur/`, que ahora es el primer cliente del SaaS.

## Stack

- HTML estático + CSS custom + JS vanilla (sin build).
- **Hosting:** Vercel (auto-deploy en cada push a `main`).
- **Backend:** Supabase project `aloxbttkypvkcrethwex` (tabla `leads` + Edge Function `notify-lead`).
- **Email transaccional:** Resend (free tier).
- **Vídeo demo:** Remotion (`remotion/` → `assets/demo.mp4`).
- **Tipografías:** Bebas Neue, Manrope, Space Grotesk (Google Fonts).

## Estructura

```
wavepanel/
├── index.html · funcionalidades.html · planes.html · ...   (14 páginas)
├── modulos/
│   ├── core.html
│   ├── tienda.html
│   ├── surf-camps.html
│   └── whatsapp.html
├── legal/
│   ├── aviso-legal.html
│   ├── privacidad.html
│   └── cookies.html
├── assets/
│   ├── styles.css            CSS principal
│   ├── panel-mockups.css     Browser chrome, sidebar panel, testimonios, video frame
│   ├── main.js               Nav mobile
│   ├── leads.js              Bind form[data-wp-form] → Supabase REST
│   ├── supabase-config.js    URL + publishable key
│   ├── demo.mp4              Vídeo Remotion (3.2MB)
│   └── demo-poster.svg
├── remotion/                 Proyecto Remotion (npm install → npm run build)
├── supabase/
│   ├── config.toml           Linkado a aloxbttkypvkcrethwex
│   ├── migrations/           Schema de leads + triggers
│   └── functions/notify-lead/  Edge Function: lead → email vía Resend
├── vercel.json · sitemap.xml · robots.txt
├── CLAUDE.md                 Contexto para futuras sesiones de Claude
└── README.md
```

## Flujo de captación de leads

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

## Comandos comunes

```bash
# Push (en macOS, evitar prompt invisible de keychain)
gh auth setup-git && git push origin main

# Schema de Supabase
supabase db push --linked

# Edge Function deploy
supabase functions deploy notify-lead

# Render del vídeo demo (requiere Node + ffmpeg)
cd remotion && npm install && npm run build
```

## Estrategia comercial — Camino A

**No hay multi-tenant todavía.** Solo se vende el **Plan Personalizado** (2.500€-2.900€) clonando el repo de Entre Olas + Supabase nuevo por cliente. Los planes Básico (29€/mes) y Pro (79€/mes) están en lista de espera en la web — captamos leads pero no se pueden activar sin self-service.

Plan: vender 5+ Personalizados → con esa validación construir multi-tenant.

## Pendientes

- [ ] Comprar dominio (`wavepanel.app` recomendado, ~14€/año) y conectar en Vercel
- [ ] Verificar dominio en Resend → poder enviar emails desde `hola@wavepanel.app` a cualquier destinatario (ahora solo a `felipecabarro@gmail.com`)
- [ ] Screenshots reales del panel para reemplazar placeholders del hero
- [ ] OG image PNG (ahora SVG inline) para que se vea bien al compartir
- [ ] Cookie banner con consentimiento + Plausible o GA
- [ ] Completar NIF y domicilio en `legal/aviso-legal.html`
- [ ] Kit de clonación del Plan Personalizado (script + checklist) → escalar Camino A
- [ ] **🔒 Rotar secrets que se compartieron en chat:** Resend API key + Supabase service_role JWT
