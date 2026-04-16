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

// ── Promo composition timings (75s · 2250 frames) ──────────
// Apple-style cinematic pacing.
export const PROMO = {
  logoReveal:     { start: 0,    duration: 90  }, // 3s
  titleCard:      { start: 90,   duration: 150 }, // 5s
  problem:        { start: 240,  duration: 270 }, // 9s
  solution:       { start: 510,  duration: 150 }, // 5s
  calendar:       { start: 660,  duration: 270 }, // 9s
  newReservation: { start: 930,  duration: 270 }, // 9s
  dashboard:      { start: 1200, duration: 270 }, // 9s
  benefits:       { start: 1470, duration: 360 }, // 12s
  pricing:        { start: 1830, duration: 240 }, // 8s
  cta:            { start: 2070, duration: 180 }, // 6s
} as const;

export const PROMO_TOTAL = PROMO.cta.start + PROMO.cta.duration; // 2250 = 75s
