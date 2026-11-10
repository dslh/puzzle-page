import { FINE, INK } from './SceneFrame';
import { Grounded, Robin, type PropArt } from './Props';

// The garden's swappable objects, each drawn about the spot where it stands.

/** A garden gnome; the hat is straight, flopped over, or has a bobble. */
export function Gnome({ v, fill, outline }: PropArt) {
  return <Grounded width={44} outline={outline}>
    <path d="M20 0 Q19 -10 28 -10 Q36 -10 34 0Z" fill={fill('#c7c2b2')} strokeWidth="2" />
    <path d="M-12 -2 V-9 H-1 V1 H-16 Q-17 -2 -12 -2Z M12 -2 V-9 H1 V1 H16 Q17 -2 12 -2Z" fill={fill('#8a6a4f')} strokeWidth="2" />
    <path d="M-13 -8 Q-16 -30 -9 -36 H9 Q16 -30 13 -8Z" fill={fill('#7d9cc0')} />
    <path d="M-14 -18 H14" fill="none" strokeWidth="3" /><rect x="-3" y="-21" width="6" height="6" fill={fill('#f1d27a')} strokeWidth="1.5" />
    <circle cx="-15" cy="-25" r="4" fill={fill('#f2cfb3')} strokeWidth="2" /><circle cx="15" cy="-25" r="4" fill={fill('#f2cfb3')} strokeWidth="2" />
    <circle cy="-44" r="9" fill={fill('#f2cfb3')} strokeWidth="2" />
    <path d="M-10 -42 Q-13 -26 0 -19 Q13 -26 10 -42 Q5 -37 0 -40 Q-5 -37 -10 -42Z" fill={fill('#fbf8ed')} strokeWidth="2" />
    <circle cy="-42" r="3" fill={fill('#e8a7a0')} strokeWidth="1.5" />
    <circle cx="-4" cy="-46" r="1.3" fill={INK} stroke="none" /><circle cx="4" cy="-46" r="1.3" fill={INK} stroke="none" />
    {[<path key="straight" d="M-12 -49 Q-5 -60 0 -76 Q5 -60 12 -49Z" fill={fill('#cc6b5c')} />,
      <path key="flopped" d="M-12 -49 Q-8 -64 3 -69 Q15 -73 18 -59 Q12 -62 8 -59 Q9 -54 12 -49Z" fill={fill('#cc6b5c')} />,
      <g key="bobble"><path d="M-12 -49 Q-5 -57 0 -67 Q5 -57 12 -49Z" fill={fill('#cc6b5c')} /><circle cy="-70" r="5" fill={fill('#fbf8ed')} strokeWidth="2" /></g>][v]}
    <path d="M-13 -49 H13" fill="none" strokeWidth="2.5" />
  </Grounded>;
}

/** A snail with its shell: a spiral, spots or stripes. */
export function Snail({ v, fill, outline }: PropArt) {
  return <Grounded width={74} outline={outline}>
    <path d="M-34 0 Q-38 -7 -30 -9 L-29 -22 Q-26 -31 -19 -26 Q-15 -20 -14 -10 H24 Q36 -8 38 0Z" fill={fill('#d8c6a8')} />
    <path d="M-27 -26 L-33 -40 M-20 -27 L-20 -42" fill="none" strokeWidth="2" />
    <circle cx="-33" cy="-41" r="2.5" fill={INK} stroke="none" /><circle cx="-20" cy="-43" r="2.5" fill={INK} stroke="none" />
    <path d="M-27 -15 Q-24 -12 -21 -15" fill="none" strokeWidth={FINE} />
    <circle cx="6" cy="-30" r="22" fill={fill('#d9a86e')} />
    {[<path key="spiral" d="M6 -30 a3 3 0 0 1 6 0 a6 6 0 0 1 -12 0 a9 9 0 0 1 18 0 a12 12 0 0 1 -24 0 a15 15 0 0 1 30 0" fill="none" strokeWidth="2" />,
      <g key="spots" fill={fill('#a7764c')} strokeWidth={FINE}>{[[-3, -40], [14, -38], [6, -26], [-8, -24], [18, -22]].map(([x, y]) => <circle key={x} cx={x} cy={y} r="4" />)}</g>,
      <path key="stripes" d="M-10 -45 Q-2 -30 -10 -15 M2 -51 Q10 -30 2 -9 M14 -50 Q22 -30 14 -10" fill="none" strokeWidth="2" />][v]}
  </Grounded>;
}

/** A straw beehive on a stand, with two, three or one bee about it. */
export function Beehive({ v, fill, outline }: PropArt) {
  const bees = [[[16, -68], [34, -58]], [[16, -68], [34, -58], [25, -44]], [[34, -58]]][v];
  return <Grounded width={52} outline={outline}>
    <path d="M-20 0 V-12 M20 0 V-12" fill="none" strokeWidth="4" />
    <path d="M-26 -16 H26 V-11 H-26Z" fill={fill('#b39373')} strokeWidth="2" />
    <path d="M-22 -16 Q-25 -53 0 -56 Q25 -53 22 -16Z" fill={fill('#e3c27a')} />
    <path d="M-23 -26 Q0 -21 23 -26 M-22 -36 Q0 -31 22 -36 M-17 -46 Q0 -42 17 -46" fill="none" strokeWidth={FINE} />
    <path d="M-6 -16 Q0 -27 6 -16Z" fill={INK} />
    {bees.map(([x, y]) => <g key={x} transform={`translate(${x} ${y})`}>
      <ellipse cx="-2" cy="-5" rx="3.5" ry="4.5" fill={fill('#fbf8ed')} strokeWidth="1.2" /><ellipse cx="3" cy="-5" rx="3.5" ry="4.5" fill={fill('#fbf8ed')} strokeWidth="1.2" />
      <ellipse rx="6.5" ry="4.5" fill={fill('#f1d27a')} strokeWidth="1.5" />
      <path d="M-1 -4 V4 M3 -4 V4" fill="none" strokeWidth="1.6" />
    </g>)}
  </Grounded>;
}

/** A rabbit sitting up; its ears both up, one flopped, or both flopped. */
export function Rabbit({ v, fill, outline, fur }: PropArt & { fur: string }) {
  // Lop ears hang down over the head, so they are drawn after it.
  const ears = [[-14, 12], [-14, -150], [-140, -165]][v];
  const ear = (angle: number, i: number) => <g key={i} transform={`rotate(${angle} ${8 + i * 7} -42)`}>
    <ellipse cx={8 + i * 7} cy="-54" rx="5.5" ry="13" fill={fur} strokeWidth="2.2" />
    <ellipse cx={8 + i * 7} cy="-53" rx="2" ry="8" fill={fill('#e8b5ad')} stroke="none" />
  </g>;
  return <Grounded width={58} outline={outline}>
    <circle cx="-27" cy="-14" r="7" fill={fill('#fbf8ed')} strokeWidth="2" />
    <ellipse cx="-6" cy="-19" rx="23" ry="19" fill={fur} />
    <ellipse cx="-2" cy="-3" rx="15" ry="4.5" fill={fur} strokeWidth="2" />
    <path d="M13 -18 Q18 -6 14 -2 Q10 0 9 -6" fill={fur} strokeWidth="2" />
    {ears.map((angle, i) => Math.abs(angle) < 90 && ear(angle, i))}
    <circle cx="14" cy="-34" r="13" fill={fur} />
    {ears.map((angle, i) => Math.abs(angle) >= 90 && ear(angle, i))}
    <circle cx="20" cy="-36" r="1.7" fill={INK} stroke="none" />
    <path d="M24 -32 L27 -33 L25 -30Z" fill={fill('#e8a7a0')} strokeWidth="1.2" />
    <path d="M22 -29 L32 -27 M22 -28 L31 -24" fill="none" strokeWidth="1" />
  </Grounded>;
}

/** A tortoise; its head out, tucked away, or out with a leaf to eat. */
export function Tortoise({ v, fill, outline }: PropArt) {
  return <Grounded width={70} outline={outline}>
    <path d="M-36 -9 L-44 -5 L-35 -4Z" fill={fill('#b5c48f')} strokeWidth="2" />
    {[-28, -14, 6, 18].map(x => <path key={x} d={`M${x - 5} -10 V-1 Q${x - 5} 1 ${x - 2} 1 H${x + 5} V-10`} fill={fill('#b5c48f')} strokeWidth="2" />)}
    {v !== 1 && <path d="M20 -15 Q28 -28 38 -27 Q46 -25 45 -17 Q43 -10 34 -11 L22 -8Z" fill={fill('#b5c48f')} />}
    {v !== 1 && <g><circle cx="38" cy="-21" r="1.6" fill={INK} stroke="none" /><path d="M40 -15 Q43 -15 44 -17" fill="none" strokeWidth="1.2" /></g>}
    {v === 1 && <path d="M23 -15 Q28 -17 29 -12 Q27 -9 23 -10Z" fill={fill('#b5c48f')} strokeWidth="2" />}
    {v === 2 && <g><path d="M44 -15 Q52 -12 47 -2 Q40 -6 44 -15Z" fill={fill('#9fb586')} strokeWidth="2" /><path d="M44 -15 L46 -6" fill="none" strokeWidth="1.2" /></g>}
    <path d="M-38 -8 Q-36 -46 -6 -46 Q24 -46 26 -8Z" fill={fill('#c8a36a')} />
    <path d="M-15 -36 L-6 -40 L3 -36 L3 -26 L-6 -22 L-15 -26Z M-15 -36 L-24 -32 M3 -36 L12 -32 M-15 -26 L-24 -14 M3 -26 L14 -14 M-6 -22 V-11 M-6 -40 V-46" fill={fill('#b28c55')} strokeWidth={FINE} />
    <path d="M-40 -9 H28 V-4 H-40Z" fill={fill('#b28c55')} strokeWidth="2" />
  </Grounded>;
}

/** A stone bird bath, with one robin, none, or two. */
export function BirdBath({ v, fill, outline }: PropArt) {
  return <Grounded width={36} outline={outline}>
    <path d="M-16 0 H16 L10 -8 H-10Z" fill={fill('#d6d0c0')} strokeWidth="2" />
    <path d="M-6 -8 V-30 H6 V-8" fill={fill('#d6d0c0')} />
    <path d="M-33 -38 H33 Q29 -28 0 -28 Q-29 -28 -33 -38Z" fill={fill('#d6d0c0')} />
    <ellipse cy="-38" rx="33" ry="4" fill={fill('#c7dfe0')} strokeWidth="2" />
    {v !== 1 && <g transform="translate(-20 -40)"><Robin fill={fill} /></g>}
    {v === 2 && <g transform="translate(21 -40) scale(-1 1)"><Robin fill={fill} /></g>}
  </Grounded>;
}

/** A pair of wellington boots: spotted, striped or plain. */
export function Wellies({ v, fill, outline }: PropArt) {
  return <Grounded width={70} outline={outline}>
    {[32, -10].map(x => <g key={x} transform={`translate(${x} 0)`}>
      <path d="M-26 0 V-50 H-8 V-16 Q-6 -9 2 -8 Q9 -6 9 0Z" fill={fill('#e3bf55')} />
      <path d="M-27 -50 H-7 V-44 H-27Z" fill={fill('#c99c3c')} strokeWidth="2" />
      <path d="M-26 0 H9" fill="none" strokeWidth="4" />
      {v === 0 && <g fill={fill('#fbf8ed')} strokeWidth={FINE}><circle cx="-20" cy="-35" r="3" /><circle cx="-13" cy="-26" r="3" /><circle cx="-20" cy="-16" r="3" /><circle cx="-4" cy="-6" r="2.5" /></g>}
      {v === 1 && <path d="M-26 -36 H-8 M-26 -28 H-8 M-26 -20 H-8" fill="none" strokeWidth="2.5" />}
    </g>)}
  </Grounded>;
}
