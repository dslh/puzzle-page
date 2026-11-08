import { sketchedLoop } from '../utils/sketchedLoop';

/** Shared by HTML answer overlays and circles within an existing puzzle SVG. */
export function CircleStroke({ seed, cx = 50, cy = 50, rx = 44, ry = 44, span = 0,
  width = 2.5, dash = '5 4', fixedStroke = false,
}: {
  seed: number | string;
  cx?: number; cy?: number; rx?: number; ry?: number; span?: number;
  width?: number; dash?: string; fixedStroke?: boolean;
}) {
  const { d, finish } = sketchedLoop(seed, { cx, cy, rx, ry, span });
  const vectorEffect = fixedStroke ? 'non-scaling-stroke' : undefined;
  return (
    <g fill="none" pointerEvents="none" aria-hidden="true">
      <path d={d} stroke="white" strokeWidth={fixedStroke ? '0.9mm' : width * 1.8}
        strokeLinecap="round" strokeLinejoin="round" vectorEffect={vectorEffect} />
      <path d={d} data-answer="path" stroke="var(--answer-ink)"
        strokeWidth={fixedStroke ? '0.45mm' : width} strokeDasharray={fixedStroke ? '1.2mm 1mm' : dash}
        vectorEffect={vectorEffect} />
      <path d={finish} data-answer-join stroke="var(--answer-ink)"
        strokeWidth={fixedStroke ? '0.45mm' : width} strokeLinecap="round" strokeLinejoin="round"
        vectorEffect={vectorEffect} />
    </g>
  );
}

/** Positioned over its marked host without changing the worksheet's layout. */
export default function AnswerCircle({ seed }: { seed: number | string }) {
  return (
    <svg data-answer-overlay viewBox="0 0 100 100" preserveAspectRatio="none" aria-hidden="true">
      <CircleStroke seed={seed} fixedStroke />
    </svg>
  );
}
