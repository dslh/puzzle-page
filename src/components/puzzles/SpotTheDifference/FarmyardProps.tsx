import { FINE, INK } from './SceneFrame';
import { Grounded, type PropArt } from './Props';

// The farmyard's swappable objects, each drawn about where it stands.

/** A chick facing right, standing at the origin. */
function Chick({ fill }: { fill: PropArt['fill'] }) {
  return <g>
    <path d="M-2 0 V-3 M2 0 V-3" fill="none" strokeWidth="1.5" />
    <circle cy="-8" r="6" fill={fill('#f4d27a')} strokeWidth="2" />
    <circle cx="3" cy="-16" r="4.5" fill={fill('#f4d27a')} strokeWidth="2" />
    <path d="M7 -17 L11 -15.5 L7 -14Z" fill={fill('#dba15d')} strokeWidth="1" />
    <circle cx="4.5" cy="-17" r="1" fill={INK} stroke="none" />
  </g>;
}

/** A hen with two chicks, three, or one. */
export function Hen({ v, fill, outline }: PropArt) {
  const chicks = [[17, 41], [17, 29, 41], [29]][v];
  return <Grounded width={84} outline={outline}>
    <path d="M-18 -7 V0 M-8 -7 V0 M-21 0 H-15 M-11 0 H-5" fill="none" strokeWidth="2" />
    <path d="M-30 -28 L-40 -48 L-30 -42 L-31 -54 L-20 -36Z" fill={fill('#c79a6c')} strokeWidth="2.2" />
    <path d="M-2 -30 Q0 -40 4 -46 L14 -38 Q12 -30 6 -24Z" fill={fill('#dcb887')} strokeWidth="2.2" />
    <ellipse cx="-14" cy="-21" rx="22" ry="15" fill={fill('#dcb887')} />
    <path d="M2 -48 Q3 -56 7 -51 Q9 -57 12 -51 Q15 -55 15 -46Z" fill={fill('#cc6b5c')} strokeWidth="2" />
    <circle cx="8" cy="-42" r="9" fill={fill('#dcb887')} />
    <path d="M16 -44 L22 -41 L16 -38Z" fill={fill('#dba15d')} strokeWidth="1.5" />
    <path d="M14 -37 Q16 -31 12 -33Z" fill={fill('#cc6b5c')} strokeWidth="1.5" />
    <circle cx="10" cy="-44" r="1.6" fill={INK} stroke="none" />
    <path d="M-26 -24 Q-14 -10 -2 -22" fill="none" strokeWidth={FINE} />
    {chicks.map(x => <g key={x} transform={`translate(${x} 0)`}><Chick fill={fill} /></g>)}
  </Grounded>;
}

/** A hay bale with a cat curled up asleep on it, no cat, or a cat sitting up. */
export function HayBale({ v, fill, outline, fur }: PropArt & { fur: string }) {
  return <Grounded width={76} outline={outline}>
    <rect x="-37" y="-30" width="74" height="30" rx="4" fill={fill('#e3c27a')} />
    <path d="M-31 -21 h12 M-6 -24 h14 M18 -18 h12 M-28 -9 h14 M2 -11 h12" fill="none" strokeWidth={FINE} />
    <path d="M-16 -30 V0 M16 -30 V0" fill="none" strokeWidth="2.5" />
    {v === 0 && <g>
      <path d="M20 -34 Q28 -32 22 -29 H-4" fill="none" strokeWidth="2.2" />
      <ellipse cx="4" cy="-37" rx="18" ry="8" fill={fur} />
      <path d="M-18 -42 L-20 -51 L-13 -45Z M-8 -45 L-5 -52 L-3 -43Z" fill={fur} strokeWidth="2" />
      <circle cx="-12" cy="-39" r="8" fill={fur} />
      <path d="M-17 -40 Q-15 -38 -13 -40 M-10 -40 Q-8 -38 -6 -40" fill="none" strokeWidth="1.2" />
    </g>}
    {v === 2 && <g>
      <path d="M8 -32 Q24 -32 20 -46" fill="none" strokeWidth="2.5" />
      <ellipse cx="2" cy="-41" rx="11" ry="12" fill={fur} />
      <path d="M-6 -64 L-7 -74 L-1 -67Z M5 -67 L11 -74 L10 -64Z" fill={fur} strokeWidth="2" />
      <circle cx="2" cy="-60" r="9" fill={fur} />
      <circle cx="-1" cy="-61" r="1.4" fill={INK} stroke="none" /><circle cx="5" cy="-61" r="1.4" fill={INK} stroke="none" />
      <path d="M1 -57 L2 -56 L3 -57" fill="none" strokeWidth="1" />
    </g>}
  </Grounded>;
}

/** A goat whose horns curve back, stand straight up, or have not grown. */
export function Goat({ v, fill, outline }: PropArt) {
  const coat = fill('#ece4d4');
  return <Grounded width={70} outline={outline}>
    {[-22, -12, 6, 15].map(x => <rect key={x} x={x - 3} y="-20" width="7" height="20" rx="2" fill={fill('#a39b8b')} strokeWidth="2.2" />)}
    <path d="M-27 -34 L-35 -45 L-28 -32Z" fill={coat} strokeWidth="2.2" />
    {v === 0 && <path d="M22 -54 Q18 -67 8 -65" fill="none" strokeWidth="5" />}
    {v === 1 && <path d="M22 -55 L23 -67 M27 -55 L30 -66" fill="none" strokeWidth="4" />}
    <path d="M10 -34 L18 -50 L29 -47 L22 -26Z" fill={coat} />
    <ellipse cx="-4" cy="-27" rx="26" ry="13" fill={coat} />
    <path d="M18 -50 Q24 -58 31 -53 L40 -40 Q40 -34 34 -36 L26 -42Z" fill={coat} />
    <path d="M20 -50 L9 -47 L18 -45Z" fill={coat} strokeWidth="2" />
    <path d="M34 -36 L33 -27 L30 -36" fill={fill('#a39b8b')} strokeWidth="1.8" />
    <circle cx="27" cy="-49" r="1.7" fill={INK} stroke="none" />
    <path d="M-16 -32 q4 -3 8 0 M0 -22 q4 -3 8 0" fill="none" strokeWidth={FINE} />
  </Grounded>;
}

/** Two milk churns; the near one's lid is on, or off and showing the opening. */
export function MilkChurns({ v, fill, outline }: PropArt) {
  const churn = (lid: boolean) => <g>
    <path d="M-16 0 V-34 Q-16 -40 -10 -44 V-54 H10 V-44 Q16 -40 16 -34 V0Z" fill={fill('#c3cac4')} />
    <path d="M-16 -8 H16 M-16 -30 H16" fill="none" strokeWidth={FINE} />
    <path d="M-10 -44 Q-20 -46 -17 -36 M10 -44 Q20 -46 17 -36" fill="none" strokeWidth="3" />
    {lid ? <g><path d="M-12 -54 H12 V-57 Q0 -65 -12 -57Z" fill={fill('#aab3ac')} strokeWidth="2.2" /><circle cy="-62" r="2.6" fill={fill('#aab3ac')} strokeWidth="1.8" /></g>
      : <ellipse cy="-54" rx="9" ry="3" fill={INK} />}
  </g>;
  return <Grounded width={70} outline={outline}>
    <g transform="translate(-22 0) scale(.8)">{churn(true)}</g>
    <g transform="translate(12 0)">{churn(v === 0)}</g>
  </Grounded>;
}

/** A pumpkin whose stalk has a curly tendril, nothing, or a leaf. */
export function Pumpkin({ v, fill, outline }: PropArt) {
  const orange = fill('#e0a05c');
  return <Grounded width={86} outline={outline}>
    <ellipse cx="-30" cy="-12" rx="13" ry="12" fill={orange} />
    <path d="M-30 -24 V-29" fill="none" strokeWidth="3" />
    <ellipse cx="10" cy="-21" rx="31" ry="21" fill={orange} />
    <path d="M10 -42 Q-6 -21 10 0 M10 -42 Q26 -21 10 0 M-6 -38 Q-26 -21 -6 -3 M26 -38 Q46 -21 26 -3" fill="none" strokeWidth={FINE} />
    <path d="M7 -40 L8 -50 H14 L13 -40Z" fill={fill('#9b9a6a')} strokeWidth="2.2" />
    {v === 0 && <path d="M13 -46 Q24 -52 26 -44 Q27 -37 21 -39 Q19 -43 22 -44" fill="none" strokeWidth="2" />}
    {v === 2 && <g><path d="M13 -47 Q26 -60 34 -47 Q24 -40 13 -47Z" fill={fill('#a6bd88')} strokeWidth="2.2" /><path d="M14 -47 Q24 -50 32 -47" fill="none" strokeWidth="1.2" /></g>}
  </Grounded>;
}
