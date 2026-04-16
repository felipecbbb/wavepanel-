# 3 · Vercel + dominio del cliente

## A. Subir el repo a GitHub

```bash
cd /ruta/al/repo/cliente

# Crear repo privado en la org del cliente o en tu cuenta
gh repo create wavepanel-{slug-cliente} --private --source=. --remote=origin

# Push inicial
git add -A
git commit -m "Initial commit — clonado desde plantilla WavePanel"
git push -u origin main
```

## B. Conectar a Vercel

1. [vercel.com/new](https://vercel.com/new) → Import GitHub repo
2. **Framework preset:** Vite (lo detecta solo)
3. **Build command:** `npm run build`
4. **Output directory:** `dist`
5. **Install command:** `npm install`

### Variables de entorno

Añadir en Settings → Environment Variables:

```
VITE_SUPABASE_URL
VITE_SUPABASE_ANON_KEY
VITE_STRIPE_PUBLIC_KEY
```

(NO añadir las `SECRET_*` aquí — esas van solo en Supabase Edge Functions)

6. **Deploy** → URL temporal `wavepanel-cliente.vercel.app`

## C. Conectar el dominio del cliente

### Si el cliente compra el dominio él mismo

Settings → Domains → Add `dominio-cliente.com`

Vercel te dirá los registros DNS a añadir donde tenga el dominio (Hostinger, GoDaddy, OVH, IONOS…):

```
Tipo  Name  Valor
A     @     76.76.21.21
CNAME www   cname.vercel-dns.com
```

Tiempo de propagación DNS: 1-24h.

### Si lo gestionas tú

- Compra en Namecheap/Porkbun/etc (~10-15€/año .com)
- Configura los DNS arriba
- Cobra el coste al cliente

## D. Subdominio del panel admin (opcional)

Si quieres `panel.dominio-cliente.com` separado del público:

1. Vercel → Add domain `panel.dominio-cliente.com`
2. Cliente DNS: `CNAME panel cname.vercel-dns.com`

O simplemente acceder al admin via `dominio-cliente.com/admin`.

## E. HTTPS y certificados

Vercel los gestiona automáticamente vía Let's Encrypt. Sin acción manual.

## F. Webhooks de Supabase ↔ Vercel

Si usas Supabase para revalidar paths cuando cambian datos:

- Vercel → Settings → Deploy Hooks → crear hook
- Copiar URL y guardarla en Supabase como secret o usar en triggers

## G. Verificación final

- [ ] `https://dominio-cliente.com` carga
- [ ] Logo y colores son los del cliente
- [ ] Formularios envían a Supabase del cliente
- [ ] Reservas se ven en el panel admin
- [ ] HTTPS activo (candado verde)
- [ ] Variables de entorno cargadas (en build logs no aparecen errores de `VITE_SUPABASE_URL is undefined`)

---

## Coste recurrente para el cliente

- **Vercel Hobby:** gratis hasta 100GB bandwidth/mes (suficiente para una escuela típica)
- **Vercel Pro:** 20$/mes si supera (improbable salvo escuelas grandes)
- **Dominio:** ~10-15€/año
- **Supabase Free:** 0€ hasta 500MB DB, después 25$/mes Pro

Total típico para una escuela pequeña: **0-25$/mes** (que el cliente paga directamente, NO por WavePanel).
