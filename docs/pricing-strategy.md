# Estrategia de pricing — WavePanel

Documento interno de decisiones de precios y análisis competitivo con datos verificados Q2 2026.

## Cliente piloto real

**Entre Olas Surf**
- Localización: Playa de Roche, Conil de la Frontera, Cádiz
- URL: [entreolasurf.com](https://entreolasurf.com)
- Contacto: +34 634 46 61 30 · entreolasurf@gmail.com
- RRSS: Instagram + TikTok @entreolasurf
- Servicios: clases grupales (desde 35€), privadas (desde 69€), Surf Camp +18 con villa privada y pensión completa, yoga, paddle, surfskate, alquiler de material, merchandising
- Estado: primer cliente pagando del Plan Personalizado (2.900€)

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
| **Personalizado** | 2.900€ one-time | Escuelas grandes con requisitos específicos (caso Entre Olas) |

**Add-on único:** WhatsApp Business +29€/mes (tiene coste variable real por la API de Meta).

## Descuentos por periodo de facturación

| Periodo | Descuento | Racional |
|---|---|---|
| Mensual | 0% | Baseline |
| Trimestral (3m) | 5% | Pequeño empujón para compromiso mínimo |
| Semestral (6m) | 10% | Reduce churn en temporada baja |
| **Anual (12m)** | **17%** | "2 meses gratis" — cash upfront + lock-in |

### Ejemplo Plan Completo

- Mensual: 89 × 12 = **1.068€/año**
- Trimestral: 89 × 0.95 × 12 = **1.015€/año** (ahorra 53€)
- Semestral: 89 × 0.90 × 12 = **961€/año** (ahorra 107€)
- **Anual: 89 × 0.83 × 12 = 888€/año** (ahorra 180€)

Mensaje en checkout: **"2 meses gratis si pagas el año"**, anual pre-seleccionado.

## Análisis competitivo verificado (consultado abril 2026)

### Verticales de surf

| Competidor | Origen | Precio | Comisión | Incluye web | Fuente |
|---|---|---|---|---|---|
| **BukyApp** | España (Corralejo + Ourense) | No público (quote-only) | No declarado | No | [bukyapp.com](https://bukyapp.com) |
| **Bloowatch** | España (Getxo, Bizkaia) | No público | No declarado | No | [bloowatch.com](https://bloowatch.com) |
| **Anolla** | Internacional | Free + usage-based | Variable | No | [anolla.com](https://anolla.com) |
| **Bookinglayer** | Internacional (fuerte en camps) | Desde $265/mes | 0% | No | [bookinglayer.com](https://bookinglayer.com) |

### Genéricos de tours/actividades

| Competidor | Precio | Comisión | Notas |
|---|---|---|---|
| **Bookeo Classes** | $14.95 (200 res) / $39.95 (1k res) / $79.95 (ilim) / $119.95 (Large) | 0% | El más barato sin comisión. Sin web pública. |
| **Rezdy** | $49 / $99 / $249 | **3% online + $0.70-1/offline** | 21 días prueba gratis |
| **Checkfront** | €99/mes (plan único) | **3% online** | Transparente. Sin tiers. |
| **Trekksoft** | €49 / Accelerate (recomendado) / $275 Ultimate | **2-3% online + €0.50-1.50/offline** | 4 tiers. Caro al acumular. |
| **FareHarbor** | 0€ subscripción (o $499/mes con web) | **6-8% booking fee** variable (cliente absorbe o paga) | Propiedad de Booking Holdings. Las comisiones más altas del mercado. |
| **Peek Pro** | 0€ subscripción | **6-8% variable** + merchant 2.3%+$0.30/ticket | Comisiones opacas, fluctuantes |
| **Bókun** (TripAdvisor) | $0 (Free, 1 user) / $49 Start / $149 Plus / $499 Premium | 1-1.5% según plan | Free plan sólo para Viator |

### Coste total comparado (escenario real)

**Escuela con 30.000€/año en reservas online**, asumiendo que absorbe todas las comisiones:

| Plataforma | Suscripción/año | Comisión (30k€) | **Total/año** | Web pública |
|---|---|---|---|---|
| **WavePanel Completo anual** | **888€** | **0€** | **888€** | **✅ Incluida** |
| Bookeo Standard | ~960€ | 0€ | ~960€ | ❌ |
| Bókun Start | ~555€ | 450€ (1.5%) | ~1.005€ | ❌ |
| Rezdy Foundation | ~555€ | 900€ (3%) | ~1.455€ | ❌ |
| Trekksoft Starter | ~588€ | 900€ (3%) | ~1.488€ | ❌ |
| FareHarbor (solo booking) | 0€ | 1.800€ (6%) | ~1.800€ | ❌ |
| Checkfront | €1.188 | 900€ (3%) | ~2.088€ | ❌ |
| Rezdy Expansion | ~2.820€ | 900€ (3%) | ~3.720€ | ❌ |
| Bookinglayer | ~3.005€ | 0€ | ~3.005€ | ❌ |
| FareHarbor + Website | ~5.665€ | 1.800€ | ~7.465€ | ✅ (pero cara) |

**Conclusión:** WavePanel es **la opción más barata del mercado** para una escuela con volumen real, y la única que incluye web pública completa en su precio base.

**Conversión:** 1 USD ≈ 0.88 EUR en abril 2026.

## Por qué ganamos

1. **Vertical surf real** (genéricos como Bookeo/Rezdy no entienden camps ni alojamiento)
2. **Web pública incluida** (competencia sólo da widget)
3. **0% comisión por reserva** (vs 2.9-8% de FareHarbor/Peek/Checkfront/Rezdy)
4. **Precios transparentes** (vs BukyApp, Bloowatch quote-only)
5. **Castellano nativo + cumplimiento español** (RGPD, IVA, Redsys)
6. **Precio ancla agresivo** con 17% descuento anual

## Debilidades a reconocer

- Sin multi-tenant funcional **todavía** (solo se puede servir Plan Personalizado de verdad)
- Marca nueva, sin reconocimiento de marca aún
- 1 cliente de referencia — necesitamos 3-5 para prueba social
- Felipe solo como equipo — cuello de botella en soporte y onboarding

## Proyecciones con pricing nuevo

### Año 1 (2026 · Camino A puro, sin multi-tenant)

| Plan | Clientes | Revenue |
|---|---|---|
| Personalizado | 4-6 × 2.900€ | 12.000-17.400€ |
| Completo/Esencial | 0 (sin infra aún) | 0€ |
| Mantenimientos | 0 (empiezan año 2) | 0€ |
| **Total Y1** | | **12-17k€** |

Costes: ~400€/año · Beneficio Y1: **~12-17k€**

### Año 2 (2027 · multi-tenant construido)

| Plan | Clientes | Revenue |
|---|---|---|
| Personalizado (nuevos) | 5-8 × 3.000€ | 15.000-24.000€ |
| Completo anual | 12 × 888€ | 10.656€ |
| Completo mensual | 6 × 1.068€ | 6.408€ |
| Esencial anual | 8 × 388€ | 3.104€ |
| Esencial mensual | 5 × 468€ | 2.340€ |
| WhatsApp add-on (30% attach) | 10 × 348€ | 3.480€ |
| Mantenimientos recurrentes | 8 × 150€ | 1.200€ |
| **Total Y2** | | **~45-55k€** |

Costes: ~1.500€/año · Beneficio Y2: **~45-55k€**

### Año 3 (2028 · consolidación + expansión)

- 50+ clientes mix, posible expansión Portugal/Francia
- **110-180k€ ARR** posible

## Riesgos

1. **Anual demasiado agresivo:** si el 80% elige anual, MRR baja pero ARR sube. Gestionar cashflow.
2. **Churn del Esencial:** clientes que "prueban" el más barato y se van a Excel. Aceptable si Completo compensa.
3. **Expectativa "14 días gratis":** mantener para no perder conversión.
4. **Cliente compara con FareHarbor "gratis":** educar con cálculo de coste real (6% de 30k€ = 1.800€/año).
5. **BukyApp/Bloowatch sin precio público:** riesgo de que sean más baratos y nos maten en ventas si publican. Mitigación: ventaja competitiva por web pública + vertical completo.

## Próximos pasos

1. Confirmar nueva estructura en `planes.html` y `comparativa.html`
2. Actualizar el pitch deck (✓ hecho)
3. Preparar guion de venta con el cálculo "30k€/año → ahorras X€ vs Y"
4. Cuando exista multi-tenant, configurar Stripe con 4 planes × 4 periodos = 16 price IDs

## Fuentes consultadas (abril 2026)

- [bukyapp.com/motor-de-reservas-de-surf](https://www.bukyapp.com/motor-de-reservas-de-surf)
- [bloowatch.com/en/management-booking-surfschool](https://www.bloowatch.com/en/management-booking-surfschool)
- [anolla.com/en/surfing-software](https://anolla.com/en/surfing-software)
- [bookinglayer.com/surf-camp-reservation-software](https://bookinglayer.com/surf-camp-reservation-software)
- [bookeo.com pricing](https://www.bookeo.com/pricing/)
- [rezdy.com/pricing](https://www.rezdy.com/pricing/)
- [checkfront.com/pricing](https://www.checkfront.com/pricing)
- [trekksoft.com/en/pricing](https://www.trekksoft.com/en/pricing)
- [bokun.io/pricing](https://www.bokun.io/pricing)
- FareHarbor y Peek Pro pricing vía [bokun.io/fareharbor-pricing](https://www.bokun.io/fareharbor-pricing), [captainbook.io/blog/fareharbor-pricing-fees-explained](https://www.captainbook.io/blog/fareharbor-pricing-fees-explained)
- Tamaño mercado: [marketdataforecast.com/market-reports/europe-surfboard-market](https://www.marketdataforecast.com/market-reports/europe-surfboard-market)
- Listado camps España: [wavecamps.com/europe/spain](https://wavecamps.com/europe/spain/)
