# Kit de clonación · Plan Personalizado WavePanel

Proceso reproducible para entregar el Plan Personalizado (2.500€-2.900€) a una nueva escuela en **1-2 días** en lugar de 1-2 semanas.

> **Estrategia Camino A (decidida 2026-04-01):** mientras no haya multi-tenant, cada cliente tiene su propio repo + su propio Supabase + su propio Vercel. Este kit estandariza ese flujo.

## Flujo end-to-end

```
0. Cliente firma + paga 50% (1.450€)
1. Le envías el cuestionario (0-questionnaire.md) → recibes datos brand
2. Ejecutas el script de clone+rebrand (1-clone-and-rebrand.sh) → repo nuevo
3. Creas Supabase del cliente (2-supabase-setup.md) → datos aislados
4. Conectas Vercel + dominio (3-vercel-deploy.md) → URL en vivo
5. Configuras Stripe del cliente (4-stripe-setup.md) → cobros
6. Configuras Resend para transaccionales (5-email-resend.md) → emails con marca
7. Entrega + formación (6-handoff.md) → cobras 50% restante
```

Cada paso tiene su markdown. Síguelos en orden.

## Tiempo estimado por paso

| Paso | Tiempo |
|---|---|
| 0. Cuestionario (cliente lo rellena async) | 0min tuyo, 30min cliente |
| 1. Clone + rebrand | 5-10 min |
| 2. Supabase setup + migraciones + seed | 20-30 min |
| 3. Vercel + dominio | 15 min (esperando DNS hasta 24h) |
| 4. Stripe (cliente conecta su cuenta) | 10 min tuyo + asíncrono cliente |
| 5. Resend + verificación dominio | 15 min |
| 6. Formación al equipo (videollamada) | 1-2h |
| **Total tuyo** | **~3-5h activas + esperas** |

## Archivos

```
kit/
├── 0-questionnaire.md          Cuestionario para el cliente
├── 1-clone-and-rebrand.sh      Script principal (uno solo)
├── 2-supabase-setup.md         Checklist Supabase
├── 3-vercel-deploy.md          Checklist Vercel + dominio
├── 4-stripe-setup.md           Checklist Stripe
├── 5-email-resend.md           Checklist Resend (transaccionales)
├── 6-handoff.md                Qué entregar y cómo formar al cliente
├── templates/
│   ├── school.config.example.js   Config base con todos los placeholders
│   └── env.example                Plantilla .env del cliente
└── tools/
    ├── replace-brand.sh           Sustituye "Entre Olas" → nuevo nombre
    └── seed-activities.sql        SQL para popular actividades base
```

## Cómo usarlo

**Primer cliente:** sigue cada paso manualmente, anota fricciones en este README.
**Segundo cliente:** mejora los scripts según lo aprendido.
**Quinto cliente:** plantéate construir el multi-tenant porque ya tienes señal real.

## Dependencias

- `gh` autenticado (GitHub CLI)
- `supabase` CLI autenticado
- `vercel` CLI (opcional, también se puede hacer en web)
- Acceso al repo de Entre Olas como template (`~/Desktop/entreolasur/` o donde lo tengas)
- Acceso a una cuenta de Stripe del cliente
