# 5 · Emails transaccionales con Resend

Cada cliente envía sus propios emails (confirmaciones, pagos, etc) desde su dominio, con su marca.

## A. Cuenta Resend del cliente

Opciones:

### Opción 1 — Cliente crea su cuenta (recomendado)
1. [resend.com](https://resend.com) → Sign up (free tier 3.000 emails/mes)
2. Cliente comparte la API key contigo

### Opción 2 — Cuenta tuya con sub-account por cliente
Si manejas muchos clientes, Resend Pro (20$/mes) permite team members o múltiples API keys.

## B. Verificar el dominio del cliente

Resend Dashboard → Domains → **+ Add Domain**

1. Dominio: `dominio-cliente.com`
2. Resend te muestra registros DNS para añadir donde el cliente tenga su dominio:

```
Tipo  Name        Valor
TXT   _resend     resend-verify=xxx
TXT   send.@      v=DKIM1; k=rsa; p=...
MX    send        feedback-smtp.eu-west-1.amazonaws.com
TXT   _dmarc      v=DMARC1; p=none
```

3. Esperar verificación (5min - 24h)
4. Una vez verificado: ✅ ya puedes enviar desde `cualquier@dominio-cliente.com`

> Si no verificas dominio: solo puedes enviar al email registrado de la cuenta Resend (modo testing).

## C. Configurar la API key

```bash
# Supabase secrets
supabase secrets set --project-ref xxxxxxxxx \
  RESEND_API_KEY=re_xxx \
  EMAIL_FROM=reservas@dominio-cliente.com \
  EMAIL_FROM_NAME="Nombre Escuela" \
  EMAIL_REPLY_TO=hola@dominio-cliente.com \
  EMAIL_NOTIFY_ADMIN=admin@dominio-cliente.com
```

## D. Plantillas de email

El template de Entre Olas trae 10+ Edge Functions de email. Verifica que cada una use las env vars correctas:

| Función | Cuándo se dispara | Plantilla actualizada |
|---|---|---|
| `send-reservation-confirm` | Tras reserva | ☐ |
| `send-payment-receipt` | Tras pago Stripe | ☐ |
| `send-class-reminder` | 24h antes (cron) | ☐ |
| `send-camp-deposit-paid` | Tras depósito camp | ☐ |
| `send-camp-checkin-link` | 7d antes camp | ☐ |
| `send-order-confirmation` | Tras compra tienda | ☐ |
| `send-order-shipped` | Cuando admin marca enviado | ☐ |
| `send-bono-purchased` | Tras compra bono | ☐ |
| `send-contact-form` | Form de contacto | ☐ |
| `send-admin-new-reservation` | Notificación al admin | ☐ |

Por cada plantilla:
- Reemplazar logo de Entre Olas → logo del cliente
- Reemplazar colores
- Reemplazar copy (nombre escuela, contacto, RRSS)
- Probar enviando a tu propio email primero

## E. Test end-to-end

Hacer una reserva real (con tarjeta test) y verificar:
- [ ] Cliente recibe confirmación de reserva
- [ ] Cliente recibe recibo de pago
- [ ] Admin recibe notificación interna
- [ ] Emails llevan logo y colores del cliente
- [ ] Reply-to apunta al cliente, no a Resend

---

✅ **Hecho** cuando:
- [ ] Dominio verificado en Resend
- [ ] API key configurada en Supabase secrets
- [ ] 10+ plantillas con marca del cliente
- [ ] Test E2E pasado
