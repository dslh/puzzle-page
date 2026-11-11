import { Band, FINE, INK } from './SceneFrame';
import { Grounded, type PropArt } from './Props';

// The castle's swappable objects, each drawn about where it stands.

const GOLD = '#e5c25e';

/** A knight's helmet with one tall feather, three, or none. */
export function Helmet({ v, fill, outline, accent }: PropArt & { accent: string }) {
  return <Grounded width={46} outline={outline}>
    {v === 0 && <path d="M2 -42 Q-6 -66 14 -80 Q12 -62 20 -54 Q14 -46 8 -42Z" fill={fill(accent)} strokeWidth="2.2" />}
    {v === 1 && <g fill={fill(accent)} strokeWidth="2.2">
      <path d="M-2 -42 Q-22 -52 -20 -72 Q-10 -60 2 -46Z" />
      <path d="M2 -42 Q20 -50 24 -70 Q10 -62 -1 -46Z" />
      <path d="M-3 -42 Q-6 -64 2 -82 Q8 -64 4 -42Z" />
    </g>}
    <path d="M-22 0 V-22 Q-22 -46 0 -46 Q22 -46 22 -22 V0Z" fill={fill('#c9cdca')} />
    {!outline && <path d="M-15 -26 Q-15 -39 -4 -40" fill="none" stroke="#fff" strokeOpacity=".6" strokeWidth="3" />}
    <path d="M0 -46 V-24" fill="none" strokeWidth={FINE} />
    <path d="M-18 -24 H18 V-17 H-18Z" fill={fill('#5e5a50')} strokeWidth="2.2" />
    <g fill={INK} stroke="none">{[-12, -6, 6, 12].map(x => <circle key={x} cx={x} cy="-8" r="1.5" />)}</g>
  </Grounded>;
}

/** A wishing well, its bucket hanging from the rope or gone. */
export function Well({ v, fill, outline }: PropArt) {
  return <Grounded width={56} outline={outline}>
    <Band d="M-21 -32 V-70 M21 -32 V-70" colour={fill('#b39373')} width={9} />
    <path d="M-32 -66 L0 -88 L32 -66Z" fill={fill('#c97c62')} />
    <path d="M-21 -56 H21 M21 -56 H28 V-49" fill="none" strokeWidth="3" />
    <path d={v === 0 ? 'M0 -56 V-47' : 'M0 -56 V-50 Q4 -46 1 -44'} fill="none" strokeWidth={FINE} />
    {v === 0 && <g><path d="M-7 -47 H7 L5 -36 H-5Z" fill={fill('#a6bbb0')} strokeWidth="2.2" /><path d="M-6 -47 Q0 -55 6 -47" fill="none" strokeWidth={FINE} /></g>}
    <path d="M-27 0 V-30 H27 V0Z" fill={fill('#d6d0c1')} />
    <path d="M-30 -30 H30 V-36 H-30Z" fill={fill('#c6bfae')} strokeWidth="2.2" />
    <path d="M-27 -15 H27 M-12 -30 V-15 M10 -30 V-15 M-1 -15 V0 M18 -15 V0 M-18 -15 V0" fill="none" strokeWidth={FINE} />
  </Grounded>;
}

/** A frog wearing a crown, with nothing on its head, or with a fly there. */
export function Frog({ v, fill, outline }: PropArt) {
  const green = fill('#a6bd88');
  return <Grounded width={52} outline={outline}>
    <ellipse cx="-19" cy="-8" rx="10" ry="8" fill={green} /><ellipse cx="19" cy="-8" rx="10" ry="8" fill={green} />
    <path d="M-19 -3 Q-26 -30 -8 -33 H8 Q26 -30 19 -3 Q0 4 -19 -3Z" fill={green} />
    <path d="M-11 -4 Q0 -1 11 -4 Q8 -15 0 -15 Q-8 -15 -11 -4Z" fill={fill('#e3e8c8')} strokeWidth={FINE} />
    <circle cx="-10" cy="-34" r="7.5" fill={green} /><circle cx="10" cy="-34" r="7.5" fill={green} />
    <circle cx="-10" cy="-35" r="2.6" fill={INK} stroke="none" /><circle cx="10" cy="-35" r="2.6" fill={INK} stroke="none" />
    <path d="M-12 -21 Q0 -14 12 -21" fill="none" strokeWidth={FINE} />
    <path d="M-12 -1 l-5 3 M-12 -1 l-1 4 M12 -1 l5 3 M12 -1 l1 4" fill="none" strokeWidth={FINE} />
    {v === 0 && <path d="M-9 -40 V-54 L-4.5 -47 L0 -56 L4.5 -47 L9 -54 V-40Z" fill={fill(GOLD)} strokeWidth="2" />}
    {v === 2 && <g transform="translate(0 -45)" strokeWidth="1.2">
      <ellipse cx="-3.5" cy="-4" rx="3" ry="4.5" transform="rotate(-25 -3.5 -4)" fill={fill('#eef4f4')} />
      <ellipse cx="3.5" cy="-4" rx="3" ry="4.5" transform="rotate(25 3.5 -4)" fill={fill('#eef4f4')} />
      <ellipse rx="3.5" ry="2.6" fill={INK} stroke="none" />
    </g>}
  </Grounded>;
}

/** A goose beside one, two or three golden eggs. */
export function Goose({ v, fill, outline }: PropArt) {
  const white = fill('#f4f1e6');
  return <Grounded width={60} outline={outline}>
    <path d="M-20 -4 V0 H-14 M-8 -4 V0 H-2" fill="none" stroke={outline ? INK : '#d39a52'} strokeWidth="2.5" />
    <path d="M-34 -22 L-42 -30 L-37 -13Z" fill={white} strokeWidth="2.2" />
    <Band d="M-4 -26 Q2 -42 -1 -52" colour={white} width={11} />
    <path d="M-38 -16 Q-38 -33 -16 -33 Q2 -33 4 -19 Q2 -4 -16 -4 Q-36 -4 -38 -16Z" fill={white} />
    <path d="M-29 -19 Q-18 -11 -6 -18" fill="none" strokeWidth={FINE} />
    <circle cx="1" cy="-55" r="7" fill={white} />
    <path d="M7 -57 L16 -54 L7 -51Z" fill={fill('#d39a52')} strokeWidth="2" />
    <circle cx="3" cy="-57" r="1.6" fill={INK} stroke="none" />
    {[18, 28, 38].slice(0, v + 1).map(x => <ellipse key={x} cx={x} cy="-7" rx="5" ry="7" fill={fill(GOLD)} strokeWidth="2" />)}
  </Grounded>;
}

/** A treasure chest: shut and locked, open with coins, or open and empty. */
export function Chest({ v, fill, outline }: PropArt) {
  const wood = fill('#b98a5e');
  return <Grounded width={60} outline={outline}>
    {v !== 0 && <path d="M-28 -24 L-24 -52 Q0 -60 24 -52 L28 -24Z" fill={wood} />}
    {v === 1 && <g fill={fill(GOLD)} strokeWidth="1.8">
      {[[0, -33], [-14, -28], [-4, -29], [7, -28], [16, -27], [-9, -25], [10, -25]].map(([x, y]) => <ellipse key={x + ',' + y} cx={x} cy={y} rx="6" ry="3.5" />)}
    </g>}
    {v === 2 && <path d="M-26 -24 H26 V-29 H-26Z" fill={fill('#5e5a50')} strokeWidth="2" />}
    <path d="M-28 0 V-24 H28 V0Z" fill={wood} />
    {v === 0 && <path d="M-30 -23 V-32 Q0 -44 30 -32 V-23Z" fill={wood} />}
    <path d="M-20 0 V-24 H-15 V0Z M15 0 V-24 H20 V0Z" fill={fill(GOLD)} strokeWidth="2" />
    <path d="M-28 -12 H-20 M-15 -12 H15 M20 -12 H28" fill="none" strokeWidth={FINE} />
    {v === 0 && <g><path d="M-4 -24 Q-4 -31 0 -31 Q4 -31 4 -24" fill="none" strokeWidth="2" /><rect x="-6" y="-25" width="12" height="10" rx="2" fill={fill(GOLD)} strokeWidth="2" /><circle cx="0" cy="-20" r="1.3" fill={INK} stroke="none" /></g>}
  </Grounded>;
}

/** A crown on a cushion, with three points or five. */
export function CrownCushion({ v, fill, outline, accent }: PropArt & { accent: string }) {
  const points = v === 0 ? 3 : 5;
  const step = 32 / (points - 1);
  const crown = 'M-16 -16 V-40' + Array.from({ length: points - 1 }, (_, i) => ` L${-16 + (i + .5) * step} -28 L${-16 + (i + 1) * step} -40`).join('') + ' V-16Z';
  return <Grounded width={64} outline={outline}>
    <path d="M-31 -4 l-5 7 M31 -4 l5 7" fill="none" strokeWidth="2.5" />
    <path d="M-30 -2 Q-35 -16 -24 -19 Q0 -14 24 -19 Q35 -16 30 -2 Q0 3 -30 -2Z" fill={fill(accent)} />
    <path d={crown} fill={fill(GOLD)} strokeWidth="2.2" />
    <path d="M-16 -22 H16" fill="none" strokeWidth={FINE} />
    {Array.from({ length: points }, (_, i) => <circle key={i} cx={-16 + i * step} cy="-42" r="2.4" fill={fill('#f6edd5')} strokeWidth="1.5" />)}
  </Grounded>;
}
