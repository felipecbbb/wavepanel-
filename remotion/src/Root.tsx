import { Composition } from 'remotion';
import { WavePanelDemo } from './WavePanelDemo';
import { TOTAL_DURATION, FPS } from './constants';

export const Root = () => {
  return (
    <Composition
      id="WavePanelDemo"
      component={WavePanelDemo}
      durationInFrames={TOTAL_DURATION}
      fps={FPS}
      width={1920}
      height={1080}
    />
  );
};
