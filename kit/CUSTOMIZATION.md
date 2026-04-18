# Personalización manual · tras el rebrand automático

El script `1-clone-and-rebrand.sh` sustituye texto, emails, teléfono, dominio,
ciudad, provincia y colores CSS. **Lo siguiente queda fuera del alcance del
automatismo** y hay que hacerlo a mano antes de entregar.

Tiempo estimado: 45-90 min por cliente según cuánto contenido haya.

---

## 1. Activos visuales (obligatorios)

Borrados del template por ser Entre Olas específicos. Pide al cliente estos
archivos en el cuestionario y colócalos en las rutas esperadas.

### Logos
- [ ] `public/images/logo.svg` o `.png` — logo principal (alto ~64px)
- [ ] `public/images/logo-dark.svg` — variante sobre fondo claro
- [ ] `public/favicon.png` — favicon 32×32
- [ ] `public/apple-touch-icon.png` — iOS home screen 180×180
- [ ] Buscar `<link rel="icon">` y `<link rel="apple-touch-icon">` en todos los
      `.html` y actualizar paths si cambian.

### Hero e imágenes de página
- [ ] `public/images/hero.png` — hero home
- [ ] `public/images/hero-alquiler.webp` — hero de alquiler de material
- [ ] `public/images/header-services.png` — header de sección servicios
- [ ] `public/images/service-camp.png`, `service-yoga.png` — iconos de servicios

Si el cliente no tiene fotos aún, usa placeholders de Unsplash de surf /
océano hasta que las provea. Evita imágenes con watermark.

### OG image / redes sociales
- [ ] Crear OG image 1200×630 (resumen de la marca: logo + eslogan + foto)
- [ ] Guardar en `public/images/og.jpg`
- [ ] Verificar meta tags en `index.html`:
      ```html
      <meta property="og:image" content="https://{dominio}/images/og.jpg">
      <meta name="twitter:image" content="https://{dominio}/images/og.jpg">
      ```

---

## 2. Legal (crítico)

El rebrand sustituye la ciudad y provincia pero **no toca datos legales
específicos**. Revisar cada archivo y sustituir manualmente:

### `aviso-legal/index.html`
- [ ] NIF/CIF (actualmente `B12345678` placeholder)
- [ ] Razón social completa (p. ej. "Escuela Surf XYZ S.L.")
- [ ] Domicilio fiscal completo (calle, CP, provincia)
- [ ] Datos del responsable legal (nombre, DNI)
- [ ] Nº registro mercantil si aplica

### `politica-privacidad/index.html`
- [ ] Responsable del tratamiento (persona o entidad)
- [ ] Delegado de protección de datos (si hay)
- [ ] Email de contacto RGPD
- [ ] Fecha de última revisión

### `politica-cookies/index.html`
- [ ] Fecha de última revisión
- [ ] Lista de cookies de terceros (añadir/quitar según analytics real del cliente)

---

## 3. Contenido dinámico post-schema

Tras aplicar schema + seed (ver `2-supabase-setup.md`), poblar desde el admin
o con SQL adicional:

### Actividades (`activities` + related)
- [ ] Editar los precios default del seed si el cliente tiene tarifas
      distintas (ejecuta `UPDATE public.activity_packs SET price = X WHERE ...`)
- [ ] Subir fotos reales de cada actividad (`activity_photos`)
- [ ] Añadir testimonios reales (`activity_testimonials`)
- [ ] Rellenar FAQs (`activity_faqs`)

### Surf Camps
- [ ] No se seedean. El cliente los crea desde `/admin/` cuando tiene fechas
      confirmadas. Crear al menos uno como ejemplo durante la formación.

### Equipo / staff (estático)
- [ ] Editar sección "Nosotros" o similar en el HTML con fotos y bios del
      equipo real del cliente. El template NO tiene tabla de instructores.

### Productos de tienda (si aplica)
- [ ] El seed crea 3 productos de ejemplo (camiseta, sudadera, wax). Borrar o
      ajustar precios/stock real del cliente.
- [ ] Subir fotos reales de los productos.

---

## 4. Integraciones externas

### Google Maps
- [ ] En `contacto/index.html` hay un `<iframe>` de Google Maps apuntando a
      Playa de Roche. Sustituir por el embed del cliente:
      - Abrir Google Maps → buscar ubicación del cliente → "Compartir" →
        "Insertar un mapa" → copiar iframe completo
- [ ] Actualizar coordenadas en `school.config.js` (`location.coords`)

### Google Analytics / Plausible (opcional)
- [ ] Si el cliente usa analytics, añadir el snippet en `<head>` de cada
      página o en un `layout.js` común.
- [ ] Variable `VITE_PLAUSIBLE_DOMAIN` en `.env` si usa Plausible.

### Schema.org structured data
- [ ] Revisar `<script type="application/ld+json">` en `index.html` y
      actualizar nombre, dirección, teléfono, geo coordinates.

---

## 5. Emails transaccionales (Resend)

Ver `5-email-resend.md` en detalle. Lo relevante aquí:

- [ ] Plantillas HTML de Resend con logo + colores del cliente. El script
      NO las toca porque viven en Resend, no en el repo.
- [ ] Reply-to apunta al email del cliente, no a Resend ni a felipecbbb@.

---

## 6. Últimos checks antes de entregar

- [ ] Buscar "TODO", "xxx", "Lorem" en todo el repo: `grep -rn "TODO\|Lorem\|xxxxx" .`
- [ ] Lighthouse mobile > 80 (en la home al menos)
- [ ] Probar flujo completo: registro → reserva → pago → email → admin ve la reserva
- [ ] Verificar que no aparece ninguna referencia a "Entre Olas", "Roche", "Conil"
      o el teléfono `634 46 61 30`:
      ```bash
      grep -rln "Entre Olas\|Roche\|Conil\|634466130\|634 46 61 30" . \
        --include="*.html" --include="*.js" --include="*.css" \
        | grep -v node_modules
      ```
- [ ] Revisar que los meta tags de SEO (title, description) están en TODAS las
      páginas con el nombre del cliente, no placeholders.

---

✅ Completado → pasar a `6-handoff.md`.
