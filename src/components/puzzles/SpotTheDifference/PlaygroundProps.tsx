import { Band, FINE, INK } from './SceneFrame';
import { Grounded, type PropArt } from './Props';

// The playground's swappable objects, each drawn about where it stands.

/** A spring rider horse whose mane is spiky, bumpy, or missing. */
export function SpringHorse({ v, fill, outline, accent }: PropArt & { accent: string }) {
  const body = fill(accent);
  return <Grounded width={44} outline={outline}>
    <path d="M-16 0 H16 V-4 H-16Z" fill={fill('#a8a395')} strokeWidth="2.2" />
    <path d="M-7 -4 L7 -9 L-7 -14 L7 -19 L-7 -24" fill="none" strokeWidth="3" />
    <path d="M-24 -34 Q-38 -40 -35 -24" fill="none" strokeWidth="5" />
    <Band d="M-14 -28 L-21 -18 M12 -28 L19 -18" colour={body} width={9} />
    <path d="M10 -38 L18 -56 Q22 -62 30 -60 L38 -50 Q38 -44 32 -46 L25 -48 L23 -33Z" fill={body} />
    <path d="M21 -58 L20 -67 L26 -60Z" fill={body} strokeWidth="2" />
    <ellipse cx="-2" cy="-32" rx="24" ry="10" fill={body} />
    {/* The mane lies along the back of the neck, drawn over it. */}
    {v === 0 && <path d="M11 -37 L1 -45 L13 -44 L4 -51 L16 -50 L7 -58 L19 -57Z" fill={fill('#8a6a4f')} strokeWidth="2" />}
    {v === 1 && <path d="M11 -37 Q-1 -38 3 -45 Q-1 -52 9 -51 Q5 -60 16 -59 L19 -57Z" fill={fill('#8a6a4f')} strokeWidth="2" />}
    <circle cx="27" cy="-54" r="1.8" fill={INK} stroke="none" />
  </Grounded>;
}

/** A toy stegosaurus with pointed plates on its back, round plates, or none. */
export function Dinosaur({ v, fill, outline }: PropArt) {
  const green = fill('#a6bd88');
  const plates = [[-18, -30], [-6, -34], [6, -33], [16, -29]];
  return <Grounded width={72} outline={outline}>
    {[-18, -8, 6, 15].map(x => <rect key={x} x={x - 4} y="-14" width="9" height="14" rx="3" fill={green} strokeWidth="2.2" />)}
    {v === 0 && plates.map(([x, y]) => <path key={x} d={`M${x - 6} ${y + 4} L${x} ${y - 11} L${x + 6} ${y + 4}Z`} fill={fill('#d9b07c')} strokeWidth="2.2" />)}
    {v === 1 && plates.map(([x, y]) => <path key={x} d={`M${x - 6} ${y + 4} Q${x - 7} ${y - 9} ${x} ${y - 9} Q${x + 7} ${y - 9} ${x + 6} ${y + 4}Z`} fill={fill('#d9b07c')} strokeWidth="2.2" />)}
    <path d="M-22 -20 Q-38 -18 -44 -8 Q-32 -7 -20 -10Z" fill={green} />
    <path d="M18 -24 Q28 -27 34 -25 Q42 -23 42 -17 Q40 -11 32 -13 Q24 -12 18 -12Z" fill={green} />
    <ellipse cx="-2" cy="-20" rx="24" ry="14" fill={green} />
    <circle cx="34" cy="-20" r="1.8" fill={INK} stroke="none" /><path d="M35 -15 Q38 -14 40 -16" fill="none" strokeWidth="1.2" />
    <g fill={fill('#8fa873')} stroke="none"><circle cx="-10" cy="-20" r="3" /><circle cx="2" cy="-14" r="2.5" /><circle cx="8" cy="-24" r="2.5" /></g>
  </Grounded>;
}

/** A doll's pram with its hood up or folded down. */
export function Pram({ v, fill, outline, accent }: PropArt & { accent: string }) {
  return <Grounded width={58} outline={outline}>
    <path d="M-18 -8 L-12 -17 M14 -8 L8 -17" fill="none" strokeWidth="3" />
    <path d="M20 -38 L31 -57 M27 -57 H38" fill="none" strokeWidth="4" />
    <path d="M-30 -42 H22 Q24 -20 6 -16 H-12 Q-30 -20 -30 -42Z" fill={fill(accent)} />
    <path d="M-26 -36 H18" fill="none" strokeWidth={FINE} />
    {v === 0
      ? <g><path d="M-31 -42 Q-33 -70 -4 -66 L-2 -42Z" fill={fill(accent)} /><path d="M-26 -46 Q-23 -61 -5 -60 M-19 -44 Q-16 -54 -4 -54" fill="none" strokeWidth={FINE} /></g>
      : <path d="M-31 -42 Q-31 -51 -20 -51 L-16 -42Z" fill={fill(accent)} strokeWidth="2.5" />}
    {[-18, 14].map(x => <g key={x}><circle cx={x} cy="-8" r="8" fill={fill('#8e9c93')} /><circle cx={x} cy="-8" r="2.5" fill={fill('#f2deb1')} strokeWidth="1.8" /></g>)}
  </Grounded>;
}
