// Life cycle stages that have no emoji, drawn to sit beside Noto Color Emoji:
// flat fills in a 128×128 box, no outlines, colours taken from Noto's own
// frog, leaf, caterpillar and ladybird.

import type { ReactElement } from 'react';

const FROG_GREEN = '#B7D019';
const FROG_DARK = '#9DB516';
const FROG_SPOT = '#70853C';
const TADPOLE = '#5D5B3E';
const LEAF = '#8BC12D';
const LEAF_DARK = '#589622';
const INK = '#2F2F2F';
const TWIG = '#865B51';

function SpawnEgg({ x, y }: { x: number; y: number }) {
  return (
    <g transform={`translate(${x} ${y})`}>
      <circle r="15" fill="#A9D6EC" />
      <circle cx="-1.3" cy="-1.3" r="13.3" fill="#DDF1FA" />
      <circle cx="0.5" cy="0.5" r="5" fill={INK} />
      <circle cx="-5.5" cy="-6" r="2.6" fill="#fff" />
    </g>
  );
}

const SPAWN: [number, number][] = [
  [64, 24], [38, 34], [90, 36], [20, 60], [50, 54], [78, 58],
  [106, 62], [34, 84], [63, 82], [92, 88], [48, 108], [78, 110],
];

function Tadpole() {
  return (
    <>
      <path fill="#B9B691" d="M60,50 C76,46 86,58 100,55 C110,53 116,46 122,47 C119,60 110,72 98,74 C84,76 76,80 60,78 Z" />
      <path fill="none" stroke={TADPOLE} strokeWidth="7" strokeLinecap="round" d="M60,64 C78,62 90,68 120,49" />
      <ellipse cx="42" cy="64" rx="27" ry="21" fill={TADPOLE} />
      <ellipse cx="45" cy="73" rx="18" ry="9" fill="#77744F" />
      <ellipse cx="34" cy="51" rx="9" ry="4" fill="#77744F" transform="rotate(-18 34 51)" />
      <circle cx="29" cy="58" r="6.5" fill="#fff" />
      <circle cx="27.5" cy="58.5" r="4" fill={INK} />
      <circle cx="26.5" cy="57" r="1.3" fill="#fff" />
      <path d="M16,70 C19,73 23,73 26,71" fill="none" stroke={INK} strokeWidth="2" strokeLinecap="round" />
    </>
  );
}

/** Side on, facing left, sitting on a line near y = 113. */
function Frog() {
  return (
    <>
      <path fill={FROG_DARK} d="M100,102 L58,106 C52,107 50,111 54,113 L104,112 Z" />
      <path fill={FROG_GREEN} d="M16,72 C16,58 28,44 44,42 C56,40 66,45 76,47 C96,51 110,64 110,82 C110,96 98,104 84,104 L50,104 C33,104 17,90 16,72 Z" />
      <path fill="#E1EC8A" d="M22,82 C28,96 40,103 56,103 L68,103 C58,96 50,90 46,80 Z" />
      <path fill={FROG_DARK} d="M68,100 C64,80 80,66 96,70 C110,74 113,94 104,104 Z" />
      <ellipse cx="68" cy="54" rx="5" ry="3.5" fill={FROG_SPOT} />
      <ellipse cx="86" cy="60" rx="4" ry="3" fill={FROG_SPOT} />
      <ellipse cx="60" cy="66" rx="3.2" ry="2.4" fill={FROG_SPOT} />
      <circle cx="41" cy="44" r="11" fill={FROG_GREEN} />
      <circle cx="41" cy="45" r="7" fill={INK} />
      <circle cx="38.8" cy="42.8" r="2.2" fill="#fff" />
      <circle cx="21" cy="62" r="1.6" fill={FROG_SPOT} />
      <path d="M17,74 C28,79 40,79 54,74" fill="none" stroke={FROG_SPOT} strokeWidth="2.6" strokeLinecap="round" />
      <path d="M44,88 L40,108 L32,110" fill="none" stroke={FROG_DARK} strokeWidth="7" strokeLinecap="round" strokeLinejoin="round" />
      <circle cx="30" cy="110" r="3" fill={FROG_DARK} />
      <circle cx="52" cy="112.5" r="3" fill={FROG_DARK} />
    </>
  );
}

/** A leaf on the slant, stalk bottom left, tip top right. */
function Leaf() {
  return (
    <>
      <path d="M22,108 L10,120" stroke={LEAF_DARK} strokeWidth="4" strokeLinecap="round" />
      <path fill={LEAF} d="M22,108 C24,70 52,28 116,14 C108,62 78,102 22,108 Z" />
      <path d="M22,108 C52,80 80,48 116,14" fill="none" stroke={LEAF_DARK} strokeWidth="3" strokeLinecap="round" />
      <g fill="none" stroke={LEAF_DARK} strokeWidth="2" strokeLinecap="round" opacity="0.7">
        <path d="M44,86 L38,66" /><path d="M44,86 L64,90" />
        <path d="M66,62 L64,42" /><path d="M66,62 L88,66" />
        <path d="M88,40 L88,26" /><path d="M88,40 L104,44" />
      </g>
    </>
  );
}

function ButterflyEgg({ x, y }: { x: number; y: number }) {
  return (
    <g transform={`translate(${x} ${y})`}>
      <ellipse rx="6.5" ry="7.8" fill="#E2C25A" />
      <ellipse cx="-1" cy="-1" rx="5.3" ry="6.5" fill="#FFF3C2" />
      <circle cx="-2.4" cy="-3.4" r="1.5" fill="#fff" />
    </g>
  );
}

function LadybirdEgg({ x, y }: { x: number; y: number }) {
  return (
    <g transform={`translate(${x} ${y})`}>
      <ellipse rx="4.6" ry="8" fill="#E8A21A" />
      <ellipse cx="-0.8" cy="-0.8" rx="3.6" ry="6.6" fill="#FFD54A" />
      <circle cx="-1.6" cy="-3.6" r="1.1" fill="#FFF3C2" />
    </g>
  );
}

const LADYBIRD_EGGS: [number, number][] = [
  [62, 62], [71, 60], [80, 58],
  [58, 76], [67, 74], [76, 72], [85, 70],
  [63, 88], [72, 86],
];

function SunflowerSeed({ x, y, angle }: { x: number; y: number; angle: number }) {
  return (
    <g transform={`translate(${x} ${y}) rotate(${angle})`}>
      <path fill="#3B3B3B" d="M0,-30 C14,-30 17,-8 10,14 C7,24 3,30 0,30 C-3,30 -7,24 -10,14 C-17,-8 -14,-30 0,-30 Z" />
      <g fill="none" stroke="#E6E1D3" strokeWidth="2.6" strokeLinecap="round">
        <path d="M0,-27 C1,-10 1,10 0,27" />
        <path d="M-6,-25 C-10,-10 -9,8 -4,24" />
        <path d="M6,-25 C10,-10 9,8 4,24" />
      </g>
      <path fill="#5A5A5A" d="M-8,-20 C-11,-12 -11,-2 -9,6 C-8,8 -6,7 -6,5 C-7,-3 -7,-12 -5,-19 C-4,-22 -7,-23 -8,-20 Z" />
    </g>
  );
}

export const ART = {
  frogspawn: (
    <>{SPAWN.map(([x, y]) => <SpawnEgg key={`${x},${y}`} x={x} y={y} />)}</>
  ),

  tadpole: <Tadpole />,

  tadpoleLegs: (
    <>
      <Tadpole />
      <g fill="none" stroke={TADPOLE} strokeWidth="6" strokeLinecap="round" strokeLinejoin="round">
        <path d="M58,76 L68,92 L52,98" />
        <path d="M52,98 L46,96 M52,98 L47,102" />
      </g>
    </>
  ),

  // A smaller frog that still has its tail
  froglet: (
    <g transform="translate(14 18) scale(0.8)">
      <Frog />
      <path fill={FROG_DARK} d="M104,70 C118,66 130,58 136,46 C140,66 126,86 106,92 Z" />
    </g>
  ),

  frog: <Frog />,

  butterflyEggs: (
    <>
      <Leaf />
      <ButterflyEgg x={58} y={70} />
      <ButterflyEgg x={72} y={62} />
      <ButterflyEgg x={76} y={78} />
      <ButterflyEgg x={90} y={56} />
    </>
  ),

  // A jade chrysalis with gold dots, hanging from a twig
  chrysalis: (
    <>
      <path fill={TWIG} d="M6,18 C6,14 9,12 14,12 L114,12 C119,12 122,14 122,18 C122,22 119,24 114,24 L14,24 C9,24 6,22 6,18 Z" />
      <path fill={TWIG} d="M88,14 C94,8 100,4 106,4 C104,8 98,12 94,16 Z" />
      <path fill="#6B463E" d="M14,21 L114,21 C119,21 121,20 122,18 C122,22 119,24 114,24 L14,24 C9,24 6,22 6,18 C7,20 10,21 14,21 Z" />
      <rect x="61" y="23" width="6" height="9" rx="2" fill={INK} />
      <path fill={LEAF} d="M64,30 C49,34 40,52 42,72 C44,94 54,110 64,118 C74,110 84,94 86,72 C88,52 79,34 64,30 Z" />
      <path fill="#72AA22" d="M64,30 C79,34 88,52 86,72 C84,94 74,110 64,118 C70,104 74,90 74,72 C74,52 70,38 64,30 Z" />
      <path fill="#B5DD6A" d="M52,44 C46,54 46,70 48,82 C50,86 54,84 53,78 C51,66 52,54 56,46 C57,42 54,41 52,44 Z" />
      <path d="M44,54 C56,60 72,60 84,54" fill="none" stroke={INK} strokeWidth="2.4" strokeLinecap="round" />
      <g fill="#F4C430">
        <circle cx="48" cy="56" r="2.6" /><circle cx="57" cy="58.6" r="2.6" /><circle cx="66" cy="59.2" r="2.6" />
        <circle cx="75" cy="58" r="2.6" /><circle cx="82" cy="55" r="2.4" />
        <circle cx="54" cy="96" r="2.4" /><circle cx="74" cy="96" r="2.4" /><circle cx="64" cy="38" r="2.2" />
      </g>
    </>
  ),

  ladybirdEggs: (
    <>
      <Leaf />
      {LADYBIRD_EGGS.map(([x, y]) => <LadybirdEgg key={`${x},${y}`} x={x} y={y} />)}
    </>
  ),

  // From above, head on the left
  ladybirdLarva: (
    <>
      <g fill="none" stroke={INK} strokeWidth="3.6" strokeLinecap="round" strokeLinejoin="round">
        <path d="M32,54 L26,40 L20,38" /><path d="M42,51 L42,36 L37,32" /><path d="M52,52 L58,38 L56,32" />
        <path d="M32,74 L26,88 L20,90" /><path d="M42,77 L42,92 L37,96" /><path d="M52,76 L58,90 L56,96" />
      </g>
      <g fill="#4A4A52">
        <ellipse cx="118" cy="64" rx="7" ry="4.5" />
        <ellipse cx="108" cy="64" rx="9" ry="7.5" />
        <ellipse cx="97" cy="64" rx="10" ry="10" />
        <ellipse cx="85" cy="64" rx="10" ry="12.5" />
        <ellipse cx="73" cy="64" rx="10" ry="14" />
        <ellipse cx="61" cy="64" rx="10" ry="14.5" />
      </g>
      <ellipse cx="44" cy="64" rx="13" ry="15" fill="#3E3E46" />
      <ellipse cx="24" cy="64" rx="9" ry="9" fill={INK} />
      <g fill="#FE6014">
        <ellipse cx="44" cy="55" rx="6" ry="4" /><ellipse cx="44" cy="73" rx="6" ry="4" />
        <ellipse cx="73" cy="54" rx="4.6" ry="3.6" /><ellipse cx="73" cy="74" rx="4.6" ry="3.6" />
        <circle cx="61" cy="64" r="3" />
      </g>
      <g fill="#6E6E78">
        <circle cx="61" cy="55" r="1.8" /><circle cx="61" cy="73" r="1.8" />
        <circle cx="85" cy="56" r="1.8" /><circle cx="85" cy="72" r="1.8" /><circle cx="85" cy="64" r="1.8" />
        <circle cx="97" cy="58" r="1.6" /><circle cx="97" cy="70" r="1.6" />
        <circle cx="108" cy="64" r="1.4" />
        <circle cx="20" cy="60" r="1.6" /><circle cx="20" cy="68" r="1.6" />
      </g>
    </>
  ),

  // On a leaf, with the larva's old skin bunched up at its tail
  ladybirdPupa: (
    <>
      <path fill={LEAF} d="M4,100 C30,86 98,86 124,100 C98,116 30,116 4,100 Z" />
      <path d="M8,100 L120,100" stroke={LEAF_DARK} strokeWidth="2.5" strokeLinecap="round" />
      <g transform="rotate(-14 64 74)">
        <path fill="#4A4A52" d="M92,84 C98,78 108,78 114,82 C112,88 104,92 96,90 Z" />
        <path d="M100,80 L108,74 M104,86 L114,88" stroke="#4A4A52" strokeWidth="2.5" strokeLinecap="round" />
        <path fill="#F28C28" d="M24,78 C24,58 42,48 62,48 C84,48 98,62 98,80 C98,92 86,96 62,96 C38,96 24,92 24,78 Z" />
        <path fill="#D9701C" d="M26,84 C34,92 46,94 62,94 C82,94 96,92 98,82 C98,92 86,96 62,96 C38,96 26,94 26,84 Z" />
        <path fill="#F9B465" d="M36,62 C42,55 50,52 58,52 C61,52 61,55 58,56 C50,58 44,62 40,67 C38,69 34,66 36,62 Z" />
        <g fill="none" stroke="#C9671A" strokeWidth="2" strokeLinecap="round">
          <path d="M50,50 C46,62 46,82 50,95" /><path d="M68,49 C64,62 64,82 68,96" /><path d="M84,54 C80,66 80,82 84,94" />
        </g>
        <g fill={INK}>
          <circle cx="38" cy="78" r="4.6" /><circle cx="58" cy="68" r="4.6" /><circle cx="59" cy="86" r="4.2" />
          <circle cx="76" cy="64" r="4.2" /><circle cx="77" cy="82" r="4.2" /><circle cx="90" cy="74" r="3.4" />
        </g>
      </g>
    </>
  ),

  sunflowerSeeds: (
    <>
      <SunflowerSeed x={38} y={74} angle={-28} />
      <SunflowerSeed x={90} y={74} angle={26} />
      <SunflowerSeed x={64} y={60} angle={2} />
    </>
  ),

  // A young sunflower, still in bud
  sunflowerBud: (
    <>
      <path d="M64,124 C62,96 66,64 64,36" fill="none" stroke={LEAF_DARK} strokeWidth="7" strokeLinecap="round" />
      <path fill={LEAF} d="M63,100 C50,84 28,84 14,94 C28,108 50,110 63,100 Z" />
      <path d="M63,100 C46,94 32,94 20,95" fill="none" stroke={LEAF_DARK} strokeWidth="2" strokeLinecap="round" />
      <path fill={LEAF} d="M65,80 C78,64 100,64 114,74 C100,88 78,90 65,80 Z" />
      <path d="M65,80 C82,74 96,74 108,75" fill="none" stroke={LEAF_DARK} strokeWidth="2" strokeLinecap="round" />
      <path fill={LEAF} d="M64,58 C56,48 42,46 32,52 C40,62 54,64 64,58 Z" />
      <path fill="#F9C21A" d="M56,22 C58,14 62,10 64,8 C66,10 70,14 72,22 Z" />
      <path fill="#72AA22" d="M64,14 L70,22 L80,20 L76,30 L82,38 L72,40 L64,46 L56,40 L46,38 L52,30 L48,20 L58,22 Z" />
      <circle cx="64" cy="31" r="11" fill={LEAF} />
      <path fill="#B5DD6A" d="M58,26 C60,23 63,22 65,22 C66,22 66,24 65,24 C62,25 60,27 59,29 C58,30 57,28 58,26 Z" />
    </>
  ),
} satisfies Record<string, ReactElement>;

export type ArtId = keyof typeof ART;
