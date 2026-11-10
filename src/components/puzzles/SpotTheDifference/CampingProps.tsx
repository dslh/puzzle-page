import { Band, FINE, INK } from './SceneFrame';
import { Grounded, type PropArt } from './Props';

// The woodland camp's swappable objects, each drawn about where it stands.

const WOOD = '#a99270';

/** A campfire: burning, gone out to a wisp of smoke, or toasting a marshmallow. */
export function Campfire({ v, fill, outline }: PropArt) {
  return <Grounded width={80} outline={outline} tufts={false}>
    {v === 2 && <g><Band d="M46 -2 L14 -40" colour={fill(WOOD)} width={7} /><rect x="6" y="-52" width="11" height="13" rx="3" fill={fill('#fbf8ed')} strokeWidth="2" transform="rotate(-40 11 -45)" /></g>}
    <Band d="M-30 -8 L24 -24" colour={fill(WOOD)} width={12} />
    <Band d="M30 -8 L-24 -24" colour={fill(WOOD)} width={12} />
    {v === 1
      ? <path d="M-3 -24 Q-10 -33 -3 -41 Q4 -49 -3 -58 M7 -26 Q1 -35 7 -43" fill="none" strokeWidth={FINE} />
      : <g>
        <path d="M0 -14 Q-20 -22 -11 -43 Q-6 -35 -2 -39 Q-1 -54 8 -62 Q8 -48 14 -42 Q21 -31 14 -19 Q8 -12 0 -14Z" fill={fill('#eba65e')} />
        <path d="M2 -16 Q-8 -22 -2 -34 Q2 -28 5 -32 Q8 -26 10 -22 Q8 -15 2 -16Z" fill={fill('#f4d27a')} strokeWidth="2" />
      </g>}
    {[-34, -20, -6, 8, 22, 36].map((x, i) => <ellipse key={x} cx={x} cy={i % 2 ? -3 : -5} rx="8" ry="6" fill={fill(i % 2 ? '#b9b4a4' : '#a8a395')} strokeWidth="2.2" />)}
  </Grounded>;
}

/** A fox sitting up; its tail curled round its feet, held high, or trailing. */
export function Fox({ v, fill, outline }: PropArt) {
  const fur = fill('#d08a5a');
  const tails = [
    'M-10 -6 Q-34 -6 -40 -22 Q-44 -38 -33 -41 Q-30 -27 -14 -18Z',
    'M-12 -18 Q-32 -24 -36 -46 Q-38 -60 -29 -61 Q-24 -42 -10 -30Z',
    'M-10 -5 Q-28 1 -43 -1 Q-48 -9 -41 -12 Q-27 -11 -12 -16Z',
  ];
  const tips = ['M-40 -22 Q-44 -38 -33 -41 Q-33 -31 -37 -26Z', 'M-36 -46 Q-38 -60 -29 -61 Q-28 -52 -30 -47Z', 'M-43 -1 Q-48 -9 -41 -12 Q-38 -7 -39 -2Z'];
  return <Grounded width={50} outline={outline}>
    <path d={tails[v]} fill={fur} />
    <path d={tips[v]} fill={fill('#fbf8ed')} strokeWidth="2" />
    <path d="M-14 0 Q-22 -30 -6 -40 Q10 -46 13 -30 Q16 -12 12 0Z" fill={fur} />
    <path d="M3 -38 Q13 -24 8 -6 Q1 -20 3 -38Z" fill={fill('#fbf8ed')} strokeWidth="2" />
    <path d="M-4 0 V-8 M6 0 V-8" fill="none" strokeWidth="2" />
    <path d="M-4 -55 L-5 -68 L5 -60Z M8 -60 L13 -69 L16 -56Z" fill={fur} strokeWidth="2.2" />
    <path d="M-6 -46 Q-6 -58 6 -60 Q16 -60 18 -51 L31 -44 Q27 -37 14 -38 Q-4 -36 -6 -46Z" fill={fur} />
    <path d="M18 -45 L31 -44 Q27 -37 14 -38Z" fill={fill('#fbf8ed')} strokeWidth="2" />
    <circle cx="10" cy="-50" r="1.8" fill={INK} stroke="none" /><circle cx="31" cy="-44" r="2.2" fill={INK} stroke="none" />
  </Grounded>;
}

/** A squirrel on a stump, holding an acorn, nothing, or a pine cone. */
export function Squirrel({ v, fill, outline }: PropArt) {
  const fur = fill('#b9774f');
  return <Grounded width={56} outline={outline}>
    <path d="M-16 0 V-16 H24 V0Z" fill={fill(WOOD)} />
    <ellipse cx="4" cy="-16" rx="20" ry="4.5" fill={fill('#dcc89f')} strokeWidth="2.2" />
    <path d="M-1 -10 Q2 -6 6 -10 M8 -14 Q11 -11 14 -14" fill="none" strokeWidth={FINE} />
    <path d="M-2 -24 Q-26 -26 -24 -48 Q-22 -67 -6 -64 Q-15 -56 -12 -46 Q-10 -36 0 -32Z" fill={fur} />
    <ellipse cx="6" cy="-32" rx="11" ry="14" fill={fur} />
    <path d="M4 -42 Q14 -34 10 -21 Q4 -30 4 -42Z" fill={fill('#efd9b8')} strokeWidth="2" />
    <path d="M6 -59 L7 -68 L12 -60Z" fill={fur} strokeWidth="2" />
    <circle cx="12" cy="-51" r="9" fill={fur} />
    <circle cx="15" cy="-53" r="1.6" fill={INK} stroke="none" /><circle cx="21" cy="-49" r="1.4" fill={INK} stroke="none" />
    {v === 0 && <g><ellipse cx="19" cy="-34" rx="5" ry="6" fill={fill('#c79a5e')} strokeWidth="2" /><path d="M13 -38 Q19 -44 25 -38Z" fill={fill('#8a6a4f')} strokeWidth="2" /></g>}
    {v === 2 && <g><ellipse cx="20" cy="-34" rx="5.5" ry="8" fill={fill('#a7764c')} strokeWidth="2" /><path d="M15 -37 L20 -34 L25 -37 M15 -31 L20 -28 L25 -31" fill="none" strokeWidth="1.2" /></g>}
    <path d="M10 -36 Q16 -34 15 -30" fill={fur} strokeWidth="2" />
  </Grounded>;
}

/** A rucksack: a front pocket, no pocket, or a pocket with a badge. */
export function Rucksack({ v, fill, outline, accent }: PropArt & { accent: string }) {
  return <Grounded width={52} outline={outline}>
    <path d="M-18 -60 Q-18 -68 -8 -68 H8 Q18 -68 18 -60 L22 -4 Q22 0 16 0 H-16 Q-22 0 -22 -4Z" fill={fill(accent)} />
    <path d="M-19 -58 Q0 -48 19 -58 L19 -64 Q18 -68 8 -68 H-8 Q-18 -68 -19 -64Z" fill={fill(accent)} strokeWidth="2.5" />
    <path d="M0 -53 V-46" fill="none" strokeWidth="2.5" />
    <path d="M22 -40 H29 V-4 H22" fill={fill('#c7dfe0')} strokeWidth="2.2" />
    {v !== 1 && <path d="M-13 -34 H13 V-8 H-13Z" fill={fill(accent)} strokeWidth="2.5" />}
    {v !== 1 && <path d="M-13 -28 H13" fill="none" strokeWidth={FINE} />}
    {v === 2 && <path d="M0 -24 L2 -19 H7 L3 -16 L5 -11 L0 -14 L-5 -11 L-3 -16 L-7 -19 H-2Z" fill={fill('#f1d27a')} strokeWidth="1.5" />}
  </Grounded>;
}

/** A pile of logs, three or six of them. */
export function LogPile({ v, fill, outline }: PropArt) {
  const logs = v === 0 ? [[-12, -11], [12, -11], [0, -31]] : [[-23, -11], [0, -11], [23, -11], [-12, -31], [12, -31], [0, -51]];
  return <Grounded width={70} outline={outline}>
    {logs.map(([x, y]) => <g key={x + ',' + y}>
      <circle cx={x} cy={y} r="11" fill={fill('#dcc89f')} />
      <circle cx={x} cy={y} r="5" fill="none" strokeWidth={FINE} />
    </g>)}
  </Grounded>;
}
