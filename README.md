# WavePanel — Landing SaaS

Sitio web estático para vender el SaaS WavePanel: software de gestión para escuelas de surf, kite y deportes acuáticos.

## Estructura

```
saas-landing/
├── index.html              Home
├── funcionalidades.html    Todas las funcionalidades
├── modulos.html            Overview de módulos
├── modulos/
│   ├── core.html
│   ├── tienda.html
│   ├── surf-camps.html
│   └── whatsapp.html
├── como-funciona.html      Onboarding y proceso
├── planes.html             Precios y planes
├── comparativa.html        Tabla comparativa + vs otros
├── demo.html               Capturas del panel
├── comunidad.html          Sobre la comunidad
├── contacto.html           Formulario de contacto
├── legal/
│   ├── aviso-legal.html
│   ├── privacidad.html
│   └── cookies.html
├── assets/
│   ├── styles.css          CSS compartido
│   └── main.js             Nav toggle mobile
├── vercel.json             Config deploy
├── robots.txt
├── sitemap.xml
└── README.md
```

## Stack

- HTML estático puro (sin build)
- CSS custom con variables
- Fonts: Bebas Neue, Manrope, Space Grotesk (Google Fonts)
- Vercel para hosting

## Deploy

```bash
vercel --prod
```

O conectar el repo de GitHub a Vercel y desplegar en cada push a `main`.

## Dominio

Configurar en Vercel → Settings → Domains: `wavepanel.com` (pendiente).

## TODO

- [ ] Screenshots reales del panel (reemplazar placeholders en `demo.html` y hero)
- [ ] Formulario: conectar a Edge Function o Formspree/Basin para recibir emails
- [ ] Favicon/OG image en PNG (ahora SVG inline)
- [ ] Completar NIF y domicilio en aviso legal
- [ ] Añadir Plausible o Google Analytics cuando haya cookie banner
- [ ] Cookie banner con consentimiento
