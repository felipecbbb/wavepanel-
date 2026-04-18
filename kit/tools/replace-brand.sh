#!/bin/bash
# replace-brand.sh
# Sustituye los strings de Entre Olas por los del nuevo cliente en TODOS los .html, .js, .css del repo destino.
# Lee los valores de variables de entorno (que el script padre 1-clone-and-rebrand.sh exporta).
#
# Uso (manual):
#   export BRAND_NAME="Somo Natural Surf"
#   export EMAIL_PRIMARY="hola@somonatural.com"
#   ... (ver 1-clone-and-rebrand.sh para la lista completa)
#   ./replace-brand.sh /ruta/al/repo

set -euo pipefail

REPO="${1:-.}"

if [ ! -d "$REPO" ]; then
  echo "❌ No existe $REPO"
  exit 1
fi

cd "$REPO"

# Función helper para sed in-place portable (macOS y linux)
replace() {
  local pattern="$1"
  local replacement="$2"
  if [ -z "$replacement" ]; then return; fi
  echo "  · '$pattern' → '$replacement'"
  # Buscamos en .html, .js, .css, .json, .md
  find . \
    -type f \
    \( -name "*.html" -o -name "*.js" -o -name "*.css" -o -name "*.json" -o -name "*.md" -o -name "*.svg" \) \
    ! -path "./node_modules/*" \
    ! -path "./.git/*" \
    ! -path "./dist/*" \
    ! -path "./dist-ssr/*" \
    -exec sed -i '' "s|$pattern|$replacement|g" {} \; 2>/dev/null || true
}

echo "→ Sustituyendo emails y dominios primero (antes que el brand slug)..."
# IMPORTANTE: el orden importa. Si el replace genérico "entreolasurf" corre antes,
# `entreolasurf@gmail.com` se convierte en `nuevo-slug@gmail.com` — feo.
# Por eso sustituimos primero los emails y dominios completos.
replace "entreolasurf@gmail.com"    "${EMAIL_PRIMARY:-hola@entreolasurf.com}"
replace "info@entreolasurf.com"     "${EMAIL_PRIMARY:-info@entreolasurf.com}"
replace "reservas@entreolasurf.com" "${EMAIL_RESERVAS:-${EMAIL_PRIMARY:-reservas@entreolasurf.com}}"
replace "hola@entreolasurf.com"     "${EMAIL_PRIMARY:-hola@entreolasurf.com}"
replace "entreolasurf.com"          "${DOMAIN:-entreolasurf.com}"

echo
echo "→ Sustituyendo nombres de marca..."
replace "Entre Olas Surf"   "${BRAND_NAME:-Entre Olas Surf}"
replace "Entre Olas"        "${BRAND_NAME:-Entre Olas}"
replace "EntreOlas"         "${BRAND_NAME_SHORT:-EntreOlas}"
replace "entreolasurf"      "$(echo "${BRAND_NAME:-entreolasurf}" | tr '[:upper:] ' '[:lower:]-')"
replace "entreolas"         "$(echo "${BRAND_NAME_SHORT:-entreolas}" | tr '[:upper:] ' '[:lower:]-')"

echo
echo "→ Sustituyendo teléfono y WhatsApp..."
# El template contiene el teléfono de Entre Olas en 4 formatos + un placeholder.
# Los sustituimos por los del cliente (PHONE con espacios, WHATSAPP sin espacios).
# BSD sed no soporta alternancia (|) ni cuantificadores con espacios de forma fiable;
# usamos strings exactos para evitar matches parciales.

# Formatos del cliente derivados de $PHONE y $WHATSAPP
CLIENT_PHONE_SPACED="${PHONE:-+34 600 000 000}"                              # "+34 611 222 333"
CLIENT_PHONE_COMPACT="${WHATSAPP:-+34600000000}"                             # "+34611222333"
CLIENT_PHONE_WAME="$(echo "${WHATSAPP:-+34600000000}" | tr -d '+ ')"         # "34611222333"
# Teléfono sin prefijo país, con espacios (para tel: y display): "611 222 333"
CLIENT_PHONE_LOCAL_SPACED="$(echo "$CLIENT_PHONE_SPACED" | sed 's/^+34 //')"
# Teléfono sin prefijo país, sin espacios: "611222333"
CLIENT_PHONE_LOCAL_COMPACT="$(echo "$CLIENT_PHONE_COMPACT" | sed 's/^+34//')"

# Entre Olas (+34 634 46 61 30 en todas sus variantes) → cliente
replace "+34 634 46 61 30"  "$CLIENT_PHONE_SPACED"
replace "+34634466130"      "$CLIENT_PHONE_COMPACT"
replace "634 46 61 30"      "$CLIENT_PHONE_LOCAL_SPACED"
replace "634466130"         "$CLIENT_PHONE_LOCAL_COMPACT"

# Placeholder del template → cliente (por si el template genérico aún lo tiene)
replace "+34 600 000 000"   "$CLIENT_PHONE_SPACED"
replace "+34600000000"      "$CLIENT_PHONE_COMPACT"

# wa.me con el número de Entre Olas (seguridad: cubrimos el número crudo)
replace "wa.me/34634466130" "wa.me/$CLIENT_PHONE_WAME"
replace "wa.me/34600000000" "wa.me/$CLIENT_PHONE_WAME"

echo
echo "→ Sustituyendo redes sociales..."
[ -n "${IG_URL:-}" ] && replace "https://www.instagram.com/entreolasurf" "$IG_URL"
[ -n "${IG_URL:-}" ] && replace "https://instagram.com/entreolasurf"    "$IG_URL"
[ -n "${FB_URL:-}" ] && replace "https://www.facebook.com/entreolasurf" "$FB_URL"

echo
echo "→ Sustituyendo dirección y ciudad..."
# El template (Entre Olas) está en Playa de Roche, Conil de la Frontera, Cádiz.
# Sustituimos variantes en orden: las más específicas primero para evitar que
# "Roche" genérico mache antes de "Playa de Roche" completo.
[ -n "${ADDRESS:-}" ] && replace "Playa de Roche, Conil de la Frontera, Cádiz" "${ADDRESS}, ${CITY:-}, ${PROVINCE:-Cádiz}"
[ -n "${ADDRESS:-}" ] && replace "Playa de Roche, Conil de la Frontera"        "${ADDRESS}, ${CITY:-}"
[ -n "${CITY:-}" ]    && replace "Conil de la Frontera"                        "$CITY"
[ -n "${CITY:-}" ]    && replace "Playa de Roche"                              "$CITY"
[ -n "${CITY:-}" ]    && replace "Roche, Cádiz"                                "${CITY}, ${PROVINCE:-Cádiz}"
[ -n "${CITY:-}" ]    && replace "Roche"                                       "$CITY"
# Bare "Conil" (sin "de la Frontera") — aparece en placeholders, testimonios, meta descriptions
[ -n "${CITY:-}" ]    && replace "Conil"                                       "$CITY"
# Provincia — debe ir última para que no se ejecute antes de "Roche, Cádiz"
[ -n "${PROVINCE:-}" ] && replace "Cádiz" "$PROVINCE"

echo
echo "→ Actualizando colores CSS (variables)..."
if [ -n "${COLOR_PRIMARY:-}" ]; then
  replace "#FFCC01" "$COLOR_PRIMARY"
  replace "#f3c900" "$COLOR_PRIMARY"
fi
[ -n "${COLOR_NAVY:-}" ] && replace "#0f2f39" "$COLOR_NAVY"
[ -n "${COLOR_BG:-}" ]   && replace "#fffdf7" "$COLOR_BG"

echo
echo "✅ Sustituciones aplicadas."
echo "⚠️  Revisa manualmente:"
echo "    - Logo en /imagene/ o /public/uploads/  (sustituye los archivos)"
echo "    - Aviso legal: NIF, nombre legal, domicilio fiscal"
echo "    - Política de privacidad: nombre del responsable RGPD"
echo "    - Coordenadas Google Maps en contacto"
echo "    - Foto de hero y equipo"
