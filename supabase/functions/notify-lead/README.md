# notify-lead Edge Function

Envía un email a Felipe cada vez que entra un lead nuevo en la tabla `leads`.

## Setup (una sola vez)

### 1. Cuenta en Resend
- Crear cuenta gratis en [resend.com](https://resend.com) (3.000 emails/mes free tier)
- Generar API key → guardarla
- (Opcional) Verificar el dominio `wavepanel.com` para enviar desde `hola@wavepanel.com`. Mientras tanto, los emails saldrán desde `wavepanel@resend.dev` (válido pero menos confiable visualmente).

### 2. Configurar secrets en Supabase

```bash
cd /tmp/wavepanel  # o donde tengas el repo
supabase secrets set RESEND_API_KEY=re_xxxxxxxxxxxx
supabase secrets set NOTIFY_EMAIL=felipecabarro@gmail.com
# Opcional, si tienes dominio verificado:
supabase secrets set FROM_EMAIL=hola@wavepanel.com
```

### 3. Desplegar la función

```bash
supabase functions deploy notify-lead
```

### 4. Trigger automático (opcional, alternativa al Webhook del Dashboard)

El proyecto incluye una migración `20260416133436_webhook_notify_lead.sql` que crea un trigger pg_net que invoca la función automáticamente al insertar un lead. Si prefieres usar el Webhook del Dashboard:

En Supabase Dashboard → **Database → Webhooks** → **Create a new webhook**:
- **Name**: `notify-lead-on-insert`
- **Table**: `public.leads`
- **Events**: ☑ Insert
- **Type**: Supabase Edge Functions
- **Function**: `notify-lead`

## Probar

Inserta un lead vía la web (formulario contacto o waitlist) y deberías recibir el email en menos de 5 segundos.

## Estructura del payload del webhook

Supabase envía a la función:

```json
{
  "type": "INSERT",
  "table": "leads",
  "schema": "public",
  "record": { "id": "...", "name": "...", "email": "...", ... },
  "old_record": null
}
```
