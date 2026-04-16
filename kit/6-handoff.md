# 6 · Entrega y formación al cliente

Cuando el panel esté en vivo, cobras el 50% restante y formas al equipo.

## A. Antes de la entrega

Verifica que todo funciona en producción:

- [ ] Web pública carga sin errores
- [ ] Reserva online completa (formulario → pago Stripe → confirmación)
- [ ] Email transaccional llega
- [ ] Panel admin accesible y muestra la reserva
- [ ] Mobile responsive OK (probar en iPhone/Android)
- [ ] Performance: Lighthouse > 80 en mobile
- [ ] No hay placeholders ni "Lorem ipsum"
- [ ] Aviso legal con NIF y dirección del cliente
- [ ] Banner de cookies funciona

## B. Crear cuentas admin para el cliente

```bash
# Para cada miembro del equipo del cliente, crear usuario en Supabase Auth
# desde el panel del cliente o vía SQL admin
```

Asignar rol admin en su tabla de perfiles.

## C. Documentación que les envías

Crea un PDF o Notion compartido con:

### Quick start (1 página)
- Cómo entrar al panel: URL + email + password inicial
- Cómo hacer las primeras 3 cosas:
  1. Crear una nueva sesión en el calendario
  2. Ver una reserva entrante
  3. Crear un nuevo cliente manualmente

### Manual completo
Secciones:
1. **Dashboard** — qué significa cada métrica
2. **Calendario** — vistas, filtros, crear/editar/cancelar reservas
3. **Reservas** — estados, exportar, reasignar instructor
4. **Clientes** — ficha completa, historial, notas
5. **Actividades** — crear, editar precio, activar/desactivar
6. **Bonos y packs** (si activo)
7. **Surf Camps** (si activo): editar edición, gestionar inscritos, check-in
8. **Tienda** (si activo): productos, stock, pedidos
9. **Configuración** — logo, colores, info contacto
10. **Estadísticas** — interpretación

### Vídeos cortos (opcional pero ↑↑ valor)
- 2-3 min cada uno, screencast con Loom
- Topics: cómo crear sesión, cómo gestionar reserva, cómo ver stats

## D. Sesión de formación

**Videollamada de 1-2h** con el equipo del cliente:

Agenda sugerida:

| Min | Tema |
|---|---|
| 0-10 | Tour rápido del panel |
| 10-25 | Crear/editar/cancelar reservas en directo |
| 25-40 | Gestión de clientes y bonos |
| 40-55 | Surf camps y check-in (si aplica) |
| 55-70 | Tienda y pedidos (si aplica) |
| 70-85 | Estadísticas e informes |
| 85-100 | Configuración + dudas |
| 100-120 | Q&A libre |

Graba la sesión y se la envías. Es referencia para nuevos empleados.

## E. Soporte post-entrega

Acuerdo claro:

- **Bugs críticos** (web caída, no pueden cobrar): respuesta en <4h, fix gratis durante 90 días
- **Bugs menores:** lista priorizada, fix en próximo release
- **Cambios de diseño / nuevas features:** facturadas aparte (60-80€/h)
- **Soporte uso día a día:** WhatsApp / email, mejor esfuerzo

Documentarlo en el contrato.

## F. Facturación final

```
Plan Personalizado (2.900€ pago único OR 2.500€ + 100€/año)
- 50% al inicio:                  1.450€  ←  ya cobrado
- 50% a la entrega:               1.450€  ←  ahora
                                  ──────
Total facturado:                  2.900€
```

Si firmaron la opción 2.500€ + 100€/año:
- Cobra 1.250€ + 1.250€ = 2.500€
- En el aniversario, factura 100€ por hosting/mantenimiento

## G. Checklist de cierre

- [ ] Cliente firmó conformidad (email es suficiente)
- [ ] Factura final emitida y pagada
- [ ] Cliente tiene credenciales de admin
- [ ] Cliente tiene PDF/Notion con manual
- [ ] Sesión de formación completada
- [ ] Cliente apuntado a la comunidad WavePanel
- [ ] Tu CRM actualizado: cliente en estado "active"

## H. Pedirle un testimonio

Una semana después, pídele:
- Frase corta (1-2 párrafos) sobre la experiencia
- Foto o logo
- Permiso para usarlo en wavepanel.com (sección "Reseñas")

Esto te genera prueba social para el siguiente cliente.
