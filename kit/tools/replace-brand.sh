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

echo "→ Sustituyendo nombres de marca..."
replace "Entre Olas Surf"   "${BRAND_NAME:-Entre Olas Surf}"
replace "Entre Olas"        "${BRAND_NAME:-Entre Olas}"
replace "EntreOlas"         "${BRAND_NAME_SHORT:-EntreOlas}"
replace "entreolasurf"      "$(echo "${BRAND_NAME:-entreolasurf}" | tr '[:upper:] ' '[:lower:]-')"
replace "entreolas"         "$(echo "${BRAND_NAME_SHORT:-entreolas}" | tr '[:upper:] ' '[:lower:]-')"

echo
echo "→ Sustituyendo dominios y emails..."
replace "entreolasurf.com"  "${DOMAIN:-entreolasurf.com}"
replace "info@entreolasurf.com"     "${EMAIL_PRIMARY:-info@entreolasurf.com}"
replace "reservas@entreolasurf.com" "${EMAIL_RESERVAS:-${EMAIL_PRIMARY:-reservas@entreolasurf.com}}"
replace "hola@entreolasurf.com"     "${EMAIL_PRIMARY:-hola@entreolasurf.com}"

echo
echo "→ Sustituyendo teléfono y WhatsApp..."
# El template usa varios formatos, cubrimos los principales
replace "+34 [0-9]\{9\}"           "${PHONE:-+34 600 000 000}"
replace "wa.me/34[0-9]\{9\}"       "wa.me/$(echo "${WHATSAPP:-+34600000000}" | tr -d '+ ')"

echo
echo "→ Sustituyendo redes sociales..."
[ -n "${IG_URL:-}" ] && replace "https://www.instagram.com/entreolasurf" "$IG_URL"
[ -n "${IG_URL:-}" ] && replace "https://instagram.com/entreolasurf"    "$IG_URL"
[ -n "${FB_URL:-}" ] && replace "https://www.facebook.com/entreolasurf" "$FB_URL"

echo
echo "→ Sustituyendo dirección y ciudad..."
[ -n "${ADDRESS:-}" ] && replace "Pantín, A Coruña" "${ADDRESS}, ${CITY:-}"
[ -n "${CITY:-}" ]    && replace "Pantín"           "$CITY"
[ -n "${CITY:-}" ]    && replace "A Coruña"         "$CITY"

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
