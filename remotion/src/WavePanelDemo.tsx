import { AbsoluteFill, Sequence } from 'remotion';
import { SCENES, COLORS } from './constants';
import { Intro } from './scenes/Intro';
import { CalendarScene } from './scenes/CalendarScene';
import { NewReservationScene } from './scenes/NewReservationScene';
import { ClientListScene } from './scenes/ClientListScene';
import { DashboardScene } from './scenes/DashboardScene';
import { Outro } from './scenes/Outro';

export const WavePanelDemo = () => {
  return (
    <AbsoluteFill
      style={{
        backgroundColor: COLORS.bg,
        fontFamily:
          '"Manrope", -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif',
      }}
    >
      <Sequence from={SCENES.intro.start} durationInFrames={SCENES.intro.duration}>
        <Intro />
      </Sequence>
      <Sequence
        from={SCENES.calendar.start}
        durationInFrames={SCENES.calendar.duration}
      >
        <CalendarScene />
      </Sequence>
      <Sequence
        from={SCENES.newReservation.start}
        durationInFrames={SCENES.newReservation.duration}
      >
        <NewReservationScene />
      </Sequence>
      <Sequence
        from={SCENES.clientList.start}
        durationInFrames={SCENES.clientList.duration}
      >
        <ClientListScene />
      </Sequence>
      <Sequence
        from={SCENES.dashboard.start}
        durationInFrames={SCENES.dashboard.duration}
      >
        <DashboardScene />
      </Sequence>
      <Sequence from={SCENES.outro.start} durationInFrames={SCENES.outro.duration}>
        <Outro />
      </Sequence>
    </AbsoluteFill>
  );
};
