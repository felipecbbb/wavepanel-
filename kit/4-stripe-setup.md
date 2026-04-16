# 4 · Configurar Stripe del cliente

Cada cliente cobra a SU cuenta de Stripe directamente. WavePanel NO toca el dinero (cero comisión por reserva).

## A. Cliente crea/configura su cuenta Stripe

Si el cliente no tiene cuenta:

1. [stripe.com/es](https://stripe.com/es) → Registrarse
2. Activar la cuenta (necesita NIF, IBAN, datos del negocio)
3. Activar pagos en EUR
4. Verificar email + identidad (Stripe pide documentación)

Plazo: 1-3 días hábiles para que Stripe apruebe la cuenta.

## B. Capturar las keys

Cliente → Stripe Dashboard → Developers → API keys:

- **Publishable key:** `pk_live_xxx` (frontend)
- **Secret key:** `sk_live_xxx` (backend / Edge Functions)

> Importante: usar las claves **live**, no las de **test**, una vez verificada la cuenta.

Añadirlas a:

```bash
# .env del repo del cliente
VITE_STRIPE_PUBLIC_KEY=pk_live_xxx

# Variables de entorno en Vercel (Production)
VITE_STRIPE_PUBLIC_KEY=pk_live_xxx

# Secrets en Supabase del cliente
supabase secrets set --project-ref xxxxxxxxx STRIPE_SECRET_KEY=sk_live_xxx
```

## C. Configurar webhook de Stripe → Supabase

Stripe necesita avisar a Supabase cuando un pago se completa.

1. Stripe Dashboard → Developers → Webhooks → **+ Add endpoint**
2. **Endpoint URL:** `https://xxxxxxxxx.supabase.co/functions/v1/stripe-webhook`
3. **Events to listen:**
   - `checkout.session.completed`
   - `payment_intent.succeeded`
   - `payment_intent.payment_failed`
   - `charge.refunded`
4. Copiar el **Signing secret** (`whsec_xxx`)
5. Añadirlo a Supabase:
   ```bash
   supabase secrets set --project-ref xxxxxxxxx STRIPE_WEBHOOK_SECRET=whsec_xxx
   ```

## D. Configurar productos (opcional)

Si las actividades del cliente se mapean a productos de Stripe:

- Crear productos en Stripe Dashboard → Products
- O dejarlo dinámico (cada reserva crea su PaymentIntent on-the-fly desde la Edge Function)

WavePanel usa el modelo dinámico por defecto.

## E. Configurar políticas

Stripe Dashboard → Settings → Public details:
- Logo del cliente
- Statement descriptor (qué aparece en el extracto bancario): `WAVE-{ESCUELA}` (max 22 chars)
- Refund policy URL

## F. Tax (IVA)

Si el cliente cobra IVA:

Stripe Tax → Settings:
- Activar Stripe Tax
- Configurar país y tipo de IVA aplicable
- O calcular IVA manualmente en el código (más control)

## G. Probar

Modo test primero:
- Cambiar a `pk_test_xxx` y `sk_test_xxx`
- Hacer una reserva con tarjeta de prueba `4242 4242 4242 4242`
- Verificar que llega a Stripe Dashboard → Payments
- Verificar que se crea la reserva en Supabase

Cuando funcione, cambiar a live keys.

---

✅ **Hecho** cuando:
- [ ] Cuenta Stripe del cliente verificada y activa
- [ ] Keys live configuradas en Vercel y Supabase
- [ ] Webhook configurado y probado
- [ ] Reserva de prueba completada y reflejada en Stripe + Supabase
- [ ] Logo y datos del cliente en Stripe Dashboard
