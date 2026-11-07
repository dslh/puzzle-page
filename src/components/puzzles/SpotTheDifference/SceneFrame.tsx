import type { ReactNode } from 'react';
import type { GeneratedScene } from './generator';
import { FEATURE_PART, type sceneLayout } from './layout';

export const INK = '#3d443d';
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
          return <circle key={key} transform={transform(FEATURE_PART[key])} cx={x} cy={y} r={radius} fill="none" stroke={outline ? INK : '#b7463f'} strokeWidth="3" strokeDasharray="7 4" />;
        })}
      </g>
    </svg>
  );
}
