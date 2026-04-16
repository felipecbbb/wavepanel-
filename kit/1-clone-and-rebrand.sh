#!/bin/bash
# 1-clone-and-rebrand.sh
# Clona el repo template (Entre Olas) a una nueva carpeta, lo renombra
# y aplica el rebrand a partir de un school.config.js
#
# Uso:
#   ./1-clone-and-rebrand.sh <school-slug> <ruta/a/school.config.js>
# Ejemplo:
#   ./1-clone-and-rebrand.sh somo-natural ./somo.config.js

set -euo pipefail

SCHOOL_SLUG="${1:-}"
CONFIG_FILE="${2:-}"
TEMPLATE_REPO="${WAVEPANEL_TEMPLATE:-$HOME/Desktop/entreolasur}"
DEST_BASE="${WAVEPANEL_CLIENTS:-$HOME/Code/clientes}"

if [ -z "$SCHOOL_SLUG" ] || [ -z "$CONFIG_FILE" ]; then
  echo "Uso: $0 <school-slug> <ruta/a/school.config.js>"
  echo "Ejemplo: $0 somo-natural ./somo.config.js"
  exit 1
fi

if [ ! -d "$TEMPLATE_REPO" ]; then
  echo "❌ No encuentro el template en $TEMPLATE_REPO"
  echo "   Define WAVEPANEL_TEMPLATE=ruta/al/repo o asegúrate de tener entreolasur en ~/Desktop/"
  exit 1
fi

if [ ! -f "$CONFIG_FILE" ]; then
  echo "❌ No encuentro el config file: $CONFIG_FILE"
  exit 1
fi

DEST="$DEST_BASE/$SCHOOL_SLUG"

if [ -d "$DEST" ]; then
  echo "❌ Ya existe $DEST. Borra primero o usa otro slug."
  exit 1
fi

echo "→ Creando $DEST..."
mkdir -p "$DEST_BASE"

echo "→ Copiando template (excluye node_modules, dist, .git)..."
rsync -a \
  --exclude='node_modules' \
  --exclude='dist' \
  --exclude='dist-ssr' \
  --exclude='.git' \
  --exclude='.env' \
  --exclude='.env.local' \
  --exclude='supabase/.temp' \
  --exclude='supabase/.branches' \
  "$TEMPLATE_REPO/" "$DEST/"

echo "→ Copiando school.config.js..."
cp "$CONFIG_FILE" "$DEST/school.config.js"

echo "→ Copiando .env de plantilla..."
KIT_DIR="$(cd "$(dirname "$0")" && pwd)"
cp "$KIT_DIR/templates/env.example" "$DEST/.env.example"

echo "→ Inicializando git limpio..."
cd "$DEST"
git init -q
git add .gitignore 2>/dev/null || echo "(sin .gitignore en template, considera añadir uno)"

# Extraer valores del config (con node si está disponible)
if command -v node &>/dev/null; then
  echo "→ Extrayendo valores del config..."
  eval "$(node -e "
    import('./school.config.js').then(m => {
      const c = m.default;
      const out = {
        BRAND_NAME: c.brand.name,
        BRAND_NAME_SHORT: c.brand.nameShort,
        BRAND_LEGAL: c.brand.legalName,
        BRAND_NIF: c.brand.nif,
        EMAIL_PRIMARY: c.contact.emailPrimary,
        EMAIL_RESERVAS: c.contact.emailReservas,
        PHONE: c.contact.phone,
        WHATSAPP: c.contact.whatsapp,
        DOMAIN: c.deploy.primaryDomain,
        IG_URL: c.social.instagram,
        FB_URL: c.social.facebook,
        ADDRESS: c.location.address,
        CITY: c.location.city,
        COLOR_PRIMARY: c.brandColors.primary,
        COLOR_NAVY: c.brandColors.navy,
        COLOR_BG: c.brandColors.bg,
      };
      Object.entries(out).forEach(([k,v]) => console.log('export ' + k + '=' + JSON.stringify(v||'')));
    });
  " 2>/dev/null || echo '')"
fi

echo "→ Aplicando sustituciones globales (find/replace)..."
KIT_DIR_ABS="$KIT_DIR"
bash "$KIT_DIR_ABS/tools/replace-brand.sh" "$DEST"

echo "→ Renombrando package.json..."
if [ -f package.json ]; then
  sed -i '' "s/\"entreolasurf-ecommerce\"/\"$SCHOOL_SLUG\"/" package.json 2>/dev/null || true
fi

echo "→ Limpiando node_modules y dist..."
rm -rf node_modules dist dist-ssr

echo
echo "✅ Listo. Repo creado en: $DEST"
echo
echo "Siguientes pasos:"
echo "  1. cd $DEST"
echo "  2. cp .env.example .env  (y rellena con las keys del cliente)"
echo "  3. npm install"
echo "  4. Sigue 2-supabase-setup.md  → crea Supabase del cliente"
echo "  5. npm run dev  → comprueba localmente"
echo "  6. Sigue 3-vercel-deploy.md  → push a GitHub + Vercel"
