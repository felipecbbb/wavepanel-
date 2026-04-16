import { AbsoluteFill, Sequence } from 'remotion';
import { PROMO, COLORS } from './constants';
import { PromoLogoReveal } from './scenes/promo/PromoLogoReveal';
import { PromoTitleCard } from './scenes/promo/PromoTitleCard';
import { PromoProblem } from './scenes/promo/PromoProblem';
import { PromoSolution } from './scenes/promo/PromoSolution';
import { PromoCalendar } from './scenes/promo/PromoCalendar';
import { PromoReservation } from './scenes/promo/PromoReservation';
import { PromoDashboard } from './scenes/promo/PromoDashboard';
import { PromoBenefits } from './scenes/promo/PromoBenefits';
import { PromoPricing } from './scenes/promo/PromoPricing';
import { PromoCTA } from './scenes/promo/PromoCTA';

export const WavePanelPromo = () => {
  return (
    <AbsoluteFill
      style={{
        backgroundColor: COLORS.navy,
        fontFamily: '"Manrope", -apple-system, sans-serif',
      }}
    >
      <Sequence from={PROMO.logoReveal.start} durationInFrames={PROMO.logoReveal.duration}>
        <PromoLogoReveal />
      </Sequence>
      <Sequence from={PROMO.titleCard.start} durationInFrames={PROMO.titleCard.duration}>
        <PromoTitleCard />
      </Sequence>
      <Sequence from={PROMO.problem.start} durationInFrames={PROMO.problem.duration}>
        <PromoProblem />
      </Sequence>
      <Sequence from={PROMO.solution.start} durationInFrames={PROMO.solution.duration}>
        <PromoSolution />
      </Sequence>
      <Sequence from={PROMO.calendar.start} durationInFrames={PROMO.calendar.duration}>
        <PromoCalendar />
      </Sequence>
      <Sequence from={PROMO.newReservation.start} durationInFrames={PROMO.newReservation.duration}>
        <PromoReservation />
      </Sequence>
      <Sequence from={PROMO.dashboard.start} durationInFrames={PROMO.dashboard.duration}>
        <PromoDashboard />
      </Sequence>
      <Sequence from={PROMO.benefits.start} durationInFrames={PROMO.benefits.duration}>
        <PromoBenefits />
      </Sequence>
      <Sequence from={PROMO.pricing.start} durationInFrames={PROMO.pricing.duration}>
        <PromoPricing />
      </Sequence>
      <Sequence from={PROMO.cta.start} durationInFrames={PROMO.cta.duration}>
        <PromoCTA />
      </Sequence>
    </AbsoluteFill>
  );
};
