import { star } from './layout';
import { FINE, INK } from './SceneFrame';
import { Grounded, type PropArt } from './Props';

// The seaside's swappable objects, each drawn about the spot where it stands.

/** A rock pool holding a starfish, a little fish, or nothing. */
export function RockPool({ v, fill, outline }: PropArt) {
  return <Grounded width={84} outline={outline} tufts={false}>
    <path d="M-44 -6 Q-47 -24 -31 -25 Q-24 -38 -8 -31 Q4 -41 18 -31 Q36 -36 40 -19 Q50 -15 46 -6Z" fill={fill('#b9b4a4')} />
    <path d="M-30 -24 Q-24 -28 -18 -26 M10 -32 Q16 -34 20 -30" fill="none" strokeWidth={FINE} />
    <ellipse cy="-6" rx="40" ry="11" fill={fill('#c8dfe0')} />
    <path d="M-26 -4 Q-20 -1 -14 -4 M16 -2 Q22 1 28 -2" fill="none" strokeWidth={FINE} />
    {v === 0 && <path d={star(5, 11, 5, 4, -8)} fill={fill('#e8a27a')} strokeWidth="2" transform="matrix(1 0 0 .7 0 -2.4)" />}
    {v === 1 && <g><path d="M-4 -8 Q4 -15 12 -8 Q4 -1 -4 -8Z M12 -8 L19 -13 V-3Z" fill={fill('#f1c56b')} strokeWidth="2" /><circle cx="0" cy="-9" r="1.3" fill={INK} stroke="none" /></g>}
    <path d="M-48 2 Q-50 -10 -38 -10 Q-28 -10 -28 2Z" fill={fill('#a8a395')} />
  </Grounded>;
}

/** A sign for ice creams, showing one scoop, two, or one with a flake. */
export function IceCreamSign({ v, fill, outline }: PropArt) {
  return <Grounded width={46} outline={outline}>
    <path d="M-16 -10 L-22 0 M16 -10 L22 0" fill="none" strokeWidth="4" />
    <path d="M-21 -68 H21 V-10 H-21Z" fill={fill('#e9dcc0')} />
    <path d="M-16 -63 H16 V-15 H-16Z" fill={fill('#fbf8ed')} strokeWidth={FINE} />
    {v === 2 && <path d="M2 -48 L10 -60 L13 -58 L5 -46Z" fill={fill('#8a6a4f')} strokeWidth="2" />}
    {v === 1 && <circle cy="-52" r="8" fill={fill('#c7b3d6')} strokeWidth="2" />}
    <path d="M-8 -36 L0 -18 L8 -36Z" fill={fill('#d9b07c')} strokeWidth="2" />
    <path d="M-4 -32 L3 -24 M4 -34 L-3 -25" fill="none" strokeWidth="1.2" />
    <path d="M-9 -36 Q-11 -46 0 -48 Q11 -46 9 -36Z" fill={fill('#e8a7a0')} strokeWidth="2" />
  </Grounded>;
}

/** A starfish with a face: smiling, asleep, or surprised. */
export function Starfish({ v, fill, outline }: PropArt) {
  return <Grounded width={50} outline={outline}>
    <path d={star(5, 31, 14, 0, -30)} fill={fill('#e8a27a')} />
    <g fill={fill('#f4c9a6')} stroke="none">{[[-14, -40], [14, -40], [0, -52], [-11, -16], [11, -16]].map(([x, y]) => <circle key={x + ',' + y} cx={x} cy={y} r="2" />)}</g>
    {v === 1
      ? <path d="M-8 -34 Q-5 -31 -2 -34 M2 -34 Q5 -31 8 -34" fill="none" strokeWidth="1.8" />
      : <g><circle cx="-5" cy="-34" r="2" fill={INK} stroke="none" /><circle cx="5" cy="-34" r="2" fill={INK} stroke="none" /></g>}
    {v === 2
      ? <ellipse cy="-25" rx="3" ry="3.5" fill={INK} stroke="none" />
      : <path d="M-5 -27 Q0 -22 5 -27" fill="none" strokeWidth="1.8" />}
  </Grounded>;
}

/** A seal lifting its head, with a ball on its nose, nothing, or a fish. */
export function Seal({ v, fill, outline }: PropArt) {
  return <Grounded width={78} outline={outline}>
    <path d="M-36 -6 L-48 -13 L-46 0Z" fill={fill('#8f8c84')} strokeWidth="2.2" />
    <path d="M-38 -4 Q-30 -17 -8 -18 Q8 -20 14 -34 Q18 -46 28 -46 Q38 -46 38 -36 Q38 -29 31 -27 Q26 -14 24 0 H-31 Q-38 0 -38 -4Z" fill={fill('#a6a39a')} />
    <path d="M6 -8 Q14 -2 20 0 L2 0Z" fill={fill('#8f8c84')} strokeWidth="2.2" />
    <circle cx="29" cy="-39" r="1.8" fill={INK} stroke="none" /><circle cx="38" cy="-37" r="1.8" fill={INK} stroke="none" />
    <path d="M34 -33 L42 -31 M34 -32 L41 -28" fill="none" strokeWidth="1" />
    {v === 0 && <g><circle cx="39" cy="-51" r="8" fill={fill('#f1d27a')} strokeWidth="2.2" /><path d="M32 -53 Q39 -48 46 -53" fill="none" strokeWidth={FINE} /></g>}
    {v === 2 && <g><path d="M36 -36 Q42 -44 48 -38 Q42 -32 36 -36Z M48 -38 L54 -43 V-33Z" fill={fill('#8eaeb0')} strokeWidth="2" /></g>}
  </Grounded>;
}

/** A deckchair whose canvas has stripes down, stripes across, or spots. */
export function Deckchair({ v, fill, outline, accent }: PropArt & { accent: string }) {
  return <Grounded width={70} outline={outline}>
    <path d="M-30 0 L-22 -66 M30 0 L22 -66 M-36 -22 H36 M-38 0 L-30 -22 M38 0 L30 -22" fill="none" strokeWidth="4" />
    <path d="M-21 -64 H21 L26 -26 Q0 -18 -26 -26Z" fill={fill('#fbf8ed')} />
    {v === 0 && <path d="M-9 -64 H-1 L-1 -21 Q-6 -21 -11 -22Z M9 -64 H17 L21 -25 Q16 -24 11 -22Z" fill={fill(accent)} strokeWidth="2" />}
    {v === 1 && <path d="M-22 -54 H22 L23 -46 H-23Z M-24 -38 H24 L25 -30 H-25Z" fill={fill(accent)} strokeWidth="2" />}
    {v === 2 && <g fill={fill(accent)} strokeWidth="2">{[[-11, -54], [11, -54], [0, -42], [-13, -32], [13, -32]].map(([x, y]) => <circle key={x + ',' + y} cx={x} cy={y} r="4.5" />)}</g>}
    <path d="M-21 -64 H21 L26 -26 Q0 -18 -26 -26Z" fill="none" />
  </Grounded>;
}
