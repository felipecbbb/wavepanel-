export const FPS = 30;

export const COLORS = {
  bg: '#fffdf7',
  sand: '#f3ecdd',
  yellow: '#FFCC01',
  paper: '#ffffff',
  navy: '#0f2f39',
  navySoft: '#214a57',
  text: '#2d3d45',
  muted: '#64757d',
  line: '#d7d0c2',
} as const;

export const SCENES = {
  intro: { start: 0, duration: 90 },          // 0:00 – 0:03  (3s)
  calendar: { start: 90, duration: 150 },     // 0:03 – 0:08  (5s)
  newReservation: { start: 240, duration: 150 },  // 0:08 – 0:13 (5s)
  clientList: { start: 390, duration: 135 },  // 0:13 – 0:17.5 (4.5s)
  dashboard: { start: 525, duration: 165 },   // 0:17.5 – 0:23 (5.5s)
  outro: { start: 690, duration: 90 },        // 0:23 – 0:26 (3s)
} as const;

export const TOTAL_DURATION =
  SCENES.outro.start + SCENES.outro.duration;
