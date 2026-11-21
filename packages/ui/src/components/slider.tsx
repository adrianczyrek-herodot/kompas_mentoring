'use client';

import { Slider as SliderPrimitive } from '@base-ui/react/slider';
import { cn } from '../lib/utils';

type SliderProps = SliderPrimitive.Root.Props & {
  /** One accessible name per thumb, e.g. ["Cena od", "Cena do"] (WAI-ARIA APG Slider). */
  thumbLabels: string[];
};

// 4 px track (track-off, 3.65 : 1), filled part in the selection accent (R04.2, K4), 20 px thumbs
// with a 44 px tap area (K1, P-T14). Arrow keys move by `step`, Page Up / Down by `largeStep`.
function Slider({ className, thumbLabels, ...props }: SliderProps) {
  return (
    <SliderPrimitive.Root
      data-slot="slider"
      className={cn('w-full data-disabled:cursor-not-allowed', className)}
      {...props}
    >
      <SliderPrimitive.Control className="flex h-target w-full touch-none items-center select-none">
        <SliderPrimitive.Track className="relative h-slider-track w-full rounded-round bg-track-off">
          <SliderPrimitive.Indicator className="rounded-round bg-track-on data-disabled:bg-border-disabled" />
          {thumbLabels.map((label, index) => (
            <SliderPrimitive.Thumb
              key={label}
              index={index}
              aria-label={label}
              className="relative size-slider-thumb rounded-round border-(length:--slider-thumb-border) border-track-on bg-surface-panel after:absolute after:top-1/2 after:left-1/2 after:size-target after:-translate-1/2 data-disabled:border-border-disabled data-disabled:bg-surface-disabled"
            />
          ))}
        </SliderPrimitive.Track>
      </SliderPrimitive.Control>
    </SliderPrimitive.Root>
  );
}

export { Slider, type SliderProps };
