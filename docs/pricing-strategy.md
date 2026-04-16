# Estrategia de pricing — WavePanel

Documento interno de decisiones de precios y reestructuración propuesta (abril 2026).

## Decisión: collapsar módulos en 3 tiers

El sistema actual (Básico 29€ + add-ons de 19-29€/mes) tiene 3 problemas:
1. **Decisión fatigante** para el cliente (¿qué módulos necesito?)
2. **Percepción de precio alto** al sumar módulos (29+19+19 = 67€)
3. **Complejo de facturar** y mantener matriz precio-característica

### Nueva estructura

| Plan | Precio | Target |
|---|---|---|
| **Esencial** | 39€/mes | Escuelas pequeñas, <100 reservas/mes, solo operativa básica |
| **Completo** | 89€/mes | 80% del mercado: e-commerce + camps + alojamiento + pagos |
| **Personalizado** | 2.900€ one-time | Escuelas grandes con requisitos específicos |

**Add-on único:** WhatsApp Business +29€/mes (tiene coste variable real por la API de Meta).

### Qué pasa con los módulos vendidos como add-ons

- **Tienda** se integra en Completo (vs +19€ add-on Básico)
- **Surf Camps & Alojamiento** se integra en Completo
- **WhatsApp** sigue siendo add-on para todos (el único con coste variable justificable)

El upgrade de Esencial → Completo queda en +50€/mes, que se justifica con: dominio propio + tienda + camps + pagos online + emails con marca. Valor percibido alto.

## Descuentos por periodo de facturación

| Periodo | Descuento | Racional |
|---|---|---|
| Mensual | 0% | Baseline |
| Trimestral (3m) | 5% | Pequeño empujón para compromiso mínimo |
| Semestral (6m) | 10% | Reduce churn en temporada baja |
| **Anual (12m)** | **17%** | "2 meses gratis" — cash upfront + lock-in |

### Ejemplo práctico Plan Completo

- Mensual: 89 × 12 = **1.068€/año**
- Trimestral: 89 × 0.95 × 12 = **1.015€/año** (ahorra 53€)
- Semestral: 89 × 0.90 × 12 = **961€/año** (ahorra 107€)
- Anual: 89 × 0.83 × 12 = **888€/año** (ahorra 180€)

El cliente ve "**ahorra 180€/año**" y decide en segundos.

### Mensaje en el checkout

```
[ ] Pago mensual — 89€/mes
[ ] Pago trimestral — 85€/mes (ahorras 53€/año)
[ ] Pago semestral — 80€/mes (ahorras 107€/año)
[x] Pago anual — 74€/mes (2 meses gratis · ahorras 180€/año) 🔥
```

El anual pre-seleccionado. Típico patrón de Notion/Figma/Linear.

## Precios add-on

| Módulo | Precio | Razón de mantenerlo separado |
|---|---|---|
| WhatsApp Business | +29€/mes | Meta cobra por conversación (~0,05€/mensaje). No todo cliente lo quiere. |

## Lo que elimino vs el sistema actual

| Antes | Ahora | Por qué |
|---|---|---|
| Plan Básico 29€ | Plan Esencial 39€ | Margen insuficiente a 29€. 39€ filtra "tire-kickers" que nunca convierten. |
| Plan Profesional 79€ | Plan Completo 89€ | Sube 10€ para cubrir coste de soporte real. Imperceptible para el cliente. |
| Add-on Tienda +19€ | Incluido en Completo | Simplifica, incentiva upgrade |
| Add-on Camps +19€ | Incluido en Completo | Simplifica, incentiva upgrade |
| 2.500€ + 100€/año hosting | — | Eliminado. Una sola opción Personalizado. Confunde y desincentiva cash upfront. |
| Plan Personalizado 2.900€ | 2.900€ (mantenido) | Ya validado con Entre Olas. Subiré a 3.500€ cuando tenga 3 clientes y testimonios. |

## Proyecciones con pricing nuevo

### Año 1 (Camino A puro, sin multi-tenant aún)

| Plan | Clientes | Revenue |
|---|---|---|
| Personalizado | 5 × 2.900€ | 14.500€ |
| Mantenimiento (año 2+) | — | 0€ |
| Esencial / Completo | 0 (aún no hay multi-tenant) | 0€ |
| **Total Y1** | | **~14.500€** |

Costes: ~500€ (infra + herramientas)
Beneficio Y1: **~14k€**

### Año 2 (multi-tenant ya construido)

| Plan | Clientes | Revenue |
|---|---|---|
| Personalizado | 7 × 3.500€ | 24.500€ |
| Completo anual | 15 × 888€ | 13.320€ |
| Completo mensual | 8 × 1.068€ | 8.544€ |
| Esencial anual | 10 × 388€ | 3.880€ |
| Esencial mensual | 8 × 468€ | 3.744€ |
| Add-on WhatsApp (30%) | 12 × 348€ | 4.176€ |
| Mantenimientos | 12 × 150€ | 1.800€ |
| **Total Y2** | | **~60k€** |

Costes: ~2.000€ (infra + servicios + posibles ads)
Beneficio Y2: **~58k€**

### Año 3 (consolidación)

Escalamiento a ~100 clientes mix → **130-180k€ ARR** posible.

## Riesgos del pricing

1. **Anual demasiado agresivo:** si el 80% elige anual, el MRR baja pero el ARR sube. Gestionar cashflow.
2. **Churn del Esencial:** clientes que "prueban" el más barato y se van a Excel. Aceptable si el Completo compensa.
3. **Cliente espera "14 días gratis":** el actual mensaje de la web dice "gratis 14 días". Hay que mantenerlo para no perder conversión.
4. **Cliente que compara con FareHarbor gratis:** educar en que el 6% de 30k€ son 1.800€/año vs 888€ nuestros.

## Próximos pasos

1. Confirmar esta estructura con Felipe
2. Actualizar `planes.html` y `comparativa.html` en la web con los nuevos precios
3. Actualizar el pitch deck (ya hecho con los números nuevos)
4. Actualizar el README y CLAUDE.md del repo
5. Cuando exista multi-tenant, configurar Stripe con los 4 planes × 4 periodos = 16 price IDs
