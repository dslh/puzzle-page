import type { ReactNode } from 'react';
import { FINE, INK } from './SceneFrame';

// Shared pieces of the swappable objects. Each object is drawn about its own
// origin, the middle of where it stands, and placed by its scene; each scene
// keeps its own objects in {Scene}Props.tsx. `v` is the version of its change.
export interface PropArt { v: number; fill: (colour: string) => string; outline: boolean }

/** Stands an object on the ground: a soft shadow and two tufts of grass. */
export function Grounded({ width, outline, children, tufts = true }: { width: number; outline: boolean; children: ReactNode; tufts?: boolean }) {
  return <g>
    {!outline && <ellipse cy="1" rx={width / 2} ry="4" fill="#000" fillOpacity=".08" stroke="none" />}
    {children}
    {tufts && <path d={`M${-width / 2 - 4} 2 l-2 -7 M${-width / 2} 2 V-7 M${width / 2 + 2} 2 l1 -8 M${width / 2 + 6} 2 l3 -6`} fill="none" strokeWidth={FINE} />}
  </g>;
}

/** A robin, facing right, about 22 wide, standing at the origin. */
export function Robin({ fill }: { fill: PropArt['fill'] }) {
  return <g>
    <path d="M-6 -8 L-15 -5 L-13 -10Z" fill={fill('#8a6a4f')} strokeWidth="2" />
    <path d="M-8 -9 Q-8 -20 2 -20 Q10 -20 9 -12 Q8 -3 -2 -3 Q-8 -3 -8 -9Z" fill={fill('#a67c5b')} strokeWidth="2" />
    <path d="M9 -12 Q8 -4 0 -4 Q2 -11 9 -12Z" fill={fill('#d9795f')} stroke="none" />
    <path d="M8 -16 L13 -14 L8 -13Z" fill={INK} strokeWidth="1" />
    <circle cx="4" cy="-15" r="1.3" fill={INK} stroke="none" />
    <path d="M-2 -3 V1 M2 -3 V1" fill="none" strokeWidth="1.4" />
  </g>;
}

/** A hot-air balloon whose envelope has stripes, a zigzag band or spots. */
export function Balloon({ v, fill }: PropArt) {
  return <g>
    <path d="M238 89 L236 102 M250 89 L252 102" fill="none" strokeWidth={FINE} />
    <path d="M233 101 H255 L253 114 H235Z" fill={fill('#b39373')} strokeWidth="2.5" />
    <path d="M234 106 H254" fill="none" strokeWidth={FINE} />
    <path d="M218 62 Q216 31 244 30 Q272 31 270 62 Q267 79 253 90 H235 Q221 79 218 62Z" fill={fill('#e8a7a0')} />
    {v === 0 && <path d="M244 30 V90 M231 33 Q222 60 239 90 M257 33 Q266 60 249 90" fill="none" strokeWidth="2" />}
    {v === 1 && <path d="M218 52 L226 60 L234 52 L242 60 L250 52 L258 60 L270 50 L270 62 L258 72 L250 64 L242 72 L234 64 L226 72 L219 64Z" fill={fill('#f1d27a')} strokeWidth="2" />}
    {v === 2 && <g fill={fill('#f1d27a')} strokeWidth="2">{[[232, 48], [256, 48], [244, 64], [229, 70], [259, 70]].map(([x, y]) => <circle key={x + ',' + y} cx={x} cy={y} r="5" />)}</g>}
    <path d="M235 90 H253" fill="none" strokeWidth="2" />
  </g>;
}
