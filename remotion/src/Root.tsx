import { Composition } from 'remotion';
import { WavePanelDemo } from './WavePanelDemo';
import { WavePanelPromo } from './WavePanelPromo';
import { TOTAL_DURATION, PROMO_TOTAL, FPS } from './constants';

export const Root = () => {
  return (
    <>
      <Composition
        id="WavePanelDemo"
        component={WavePanelDemo}
        durationInFrames={TOTAL_DURATION}
        fps={FPS}
        width={1920}
        height={1080}
      />
      <Composition
        id="WavePanelPromo"
        component={WavePanelPromo}
        durationInFrames={PROMO_TOTAL}
        fps={FPS}
        width={1920}
        height={1080}
      />
    </>
  );
};
