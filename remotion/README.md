# WavePanel Demo Video (Remotion)

Proyecto Remotion que genera el vídeo demo de WavePanel (~26 segundos) mostrando el panel por dentro: calendario, creación de reserva, listado con estados, dashboard con métricas.

## Setup

```bash
cd saas-landing/remotion
npm install
```

## Desarrollo (preview interactivo)

```bash
npm run dev
```

Abre el Remotion Studio en el navegador. Edita los componentes en `src/scenes/` y ve los cambios en caliente.

## Render del vídeo final

```bash
npm run build
```

Exporta a `../assets/demo.mp4` (1920×1080, 30fps, h264). El `demo.html` ya lo referencia desde `/assets/demo.mp4`.

## Estructura

```
remotion/
├── src/
│   ├── index.ts              # registerRoot
│   ├── Root.tsx              # Composition config
│   ├── WavePanelDemo.tsx     # Orquestación de scenes
│   ├── constants.ts          # FPS, colores, timings
│   ├── components/
│   │   └── PanelChrome.tsx   # Browser + sidebar reutilizable
│   └── scenes/
│       ├── Intro.tsx         # 3s · title card
│       ├── CalendarScene.tsx # 5s · calendario animado
│       ├── NewReservationScene.tsx  # 5s · formulario typewriter
│       ├── ClientListScene.tsx      # 4.5s · tabla de reservas
│       ├── DashboardScene.tsx       # 5.5s · KPIs + chart de barras
│       └── Outro.tsx         # 3s · CTA final
├── package.json
├── remotion.config.ts
└── tsconfig.json
```

## Ajustar duraciones

Edita `src/constants.ts` → `SCENES`. Cada scene tiene `start` (frame en el que empieza) y `duration` (frames que dura). A 30fps, 30 frames = 1 segundo.

## Troubleshooting

- **Fuentes**: el vídeo usa Bebas Neue, Manrope y Space Grotesk. Remotion las cargará desde Google Fonts automáticamente la primera vez.
- **Performance de render**: añadir `--concurrency=4` o `--concurrency=8` al build si tienes CPU suficiente.
- **Codec alternativo**: cambiar `--codec=h264` a `--codec=vp8` si necesitas webm.
