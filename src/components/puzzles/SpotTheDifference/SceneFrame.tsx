import type { ReactNode } from 'react';
import { CircleStroke } from '../../AnswerCircle';
import type { GeneratedScene } from './generator';
import { FEATURE_PART, type sceneLayout } from './layout';

export const INK = '#3d443d';
// Silhouettes take the heavier line and inner details the finer one, so each
// object reads as one shape first. Distant things are drawn lighter still.
export const LINE = 3;
export const FINE = 1.5;
export const FAR = '#8f9a8c';

/** Two birds far off: a pair of ticks in the sky. */
export function Birds({ x, y, scale = 1.35 }: { x: number; y: number; scale?: number }) {
  return (
    <g fill="none" strokeWidth={FINE} transform={`translate(${x} ${y}) scale(${scale})`}>
      <path d="M0 0 Q5 -6 10 0 Q15 -6 20 0" /><path d="M28 10 Q32 5 36 10 Q40 5 44 10" />
    </g>
  );
}

/** A stroke drawn as an outlined band of colour, like a tail or a pole. */
export function Band({ d, colour, width = 11 }: { d: string; colour: string; width?: number }) {
  return <g fill="none"><path d={d} stroke={INK} strokeWidth={width} /><path d={d} stroke={colour} strokeWidth={width - 6} /></g>;
}
export interface SceneProps {
  scene: GeneratedScene;
  second: boolean;
  outline: boolean;
  answers: boolean;
  aspect?: number;
}

export default function SceneFrame({ scene, second, outline, answers, layout, children, paper = '#fbf8ed' }: SceneProps & {
  layout: ReturnType<typeof sceneLayout>; children: ReactNode; paper?: string;
}) {
  const { width, height, transform } = layout;
  return (
    <svg viewBox={`0 0 ${width} ${height}`} role="img" aria-label={`${scene.theme}: ${second ? 'the picture with changes' : 'the original picture'}`}>
      <rect x="2" y="2" width={width - 4} height={height - 4} rx="15" fill={outline ? '#fff' : paper} stroke={INK} strokeWidth="2" />
      <g transform={scene.mirrored ? `translate(${width} 0) scale(-1 1)` : undefined} stroke={INK} strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
        {children}
        {second && answers && scene.changes.map(key => {
          const { x, y, radius } = scene.features[key];
          return <g key={key} transform={transform(FEATURE_PART[key])}>
            <CircleStroke seed={JSON.stringify([key, scene.variants, scene.placements])} cx={x} cy={y} rx={radius} ry={radius} width={3} dash="7 4" />
          </g>;
        })}
      </g>
    </svg>
  );
}
