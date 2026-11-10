import { version, type Feature } from './generator';
import { sceneLayout } from './layout';
import SceneFrame, { Band, FAR, FINE, INK, LINE, type SceneProps } from './SceneFrame';

const COLOURS = ['#cf8773', '#83a9a7', '#d5af61', '#a39ab6'];
const WOOD = '#b39a75';

export default function Seaside(props: SceneProps) {
  const { scene, second, outline, aspect } = props;
  const layout = sceneLayout(aspect, scene);
  const { width, height, dx, dy, transform } = layout;
  const fill = (colour: string) => outline ? '#fff' : colour;
  const v = (key: Feature) => version(scene, key, second);
  const accent = COLOURS[scene.palette];
  // The sea rises to meet the sky on tall panels, rather than leaving sky.
  const sea = 180 + dy * .3;
  return (
    <SceneFrame {...props} layout={layout} paper="#f8f5e9">
      <g strokeWidth={LINE}>
      <g transform={scene.backgroundFlipped ? `translate(${width} 0) scale(-1 1)` : undefined}>
        {/* A far headland across the bay, behind the boat. */}
        <path d={`M4 ${sea - 26} Q${width * .1} ${sea - 34} ${width * .2} ${sea - 26} Q${width * .3} ${sea - 22} ${width * .38} ${sea - 2} V${sea + 4} H4Z`} fill={fill('#cfd9c2')} stroke={FAR} strokeWidth={FINE} />
      </g>
      {/* Shallow water, a curving tideline and warm sand. */}
      <path d={`M4 ${sea} Q${width * .5} ${sea - 10} ${width - 4} ${sea} V${height - 16} Q${width - 4} ${height - 2} ${width - 19} ${height - 2} H19 Q4 ${height - 2} 4 ${height - 16}Z`} fill={fill('#c8dfe0')} stroke="none" />
      <path d={`M4 ${267 + dy * .52} Q${width * .24} ${238 + dy * .52} ${width * .51} ${267 + dy * .52} T${width - 4} ${257 + dy * .52} V${height - 16} Q${width - 4} ${height - 2} ${width - 19} ${height - 2} H19 Q4 ${height - 2} 4 ${height - 16}Z`} fill={fill('#f0dfb6')} stroke="none" />
      <path d={`M4 ${260 + dy * .52} Q${width * .24} ${231 + dy * .52} ${width * .51} ${260 + dy * .52} T${width - 4} ${250 + dy * .52}`} fill="none" stroke={outline ? INK : '#fffdf0'} strokeWidth="3" />
      <path d={`M4 ${sea} Q${width * .5} ${sea - 10} ${width - 4} ${sea}`} fill="none" stroke={outline ? INK : '#9fbfc1'} strokeWidth={FINE} />
      {/* Little waves, spread across the open water. */}
      <g fill="none" stroke={outline ? '#9a9a90' : '#9fbfc1'} strokeWidth={FINE}>
        {[[.18, .3], [.42, .55], [.6, .25], [.08, .7], [.86, .62], [.33, .82]].map(([x, y]) => <path key={x} transform={`translate(${x * width} ${sea + 12 + y * (dy * .22 + 40)})`} d="M-10 0 Q-5 -4 0 0 Q5 -4 10 0" />)}
      </g>
      <g transform="translate(55 49)"><circle r="21" fill={fill('#efd080')} strokeWidth="2.5" />{Array.from({ length: 10 }, (_, i) => <path key={i} d="M0 -28 V-34" transform={`rotate(${i * 36})`} />)}</g>
      {Array.from({ length: scene.clouds }, (_, i) => <path key={i} transform={`translate(${321 + i * 87 + dx * (.5 + i * .12)} ${39 + i % 2 * 12 + dy * .15})`} d="M0 12 Q-5 -1 9 0 Q11 -17 29 -8 Q40 -17 49 0 Q66 -3 65 12Z" fill={fill('#fffdf5')} strokeWidth="2.2" />)}
      {/* A gull gliding above the sailing boat. */}
      <g transform={transform('kite')}><g transform={`translate(244 103) scale(${v('kite') === 1 ? -1 : 1} 1)`}>
        <path d="M-16 5 L-29 -1 L-23 12 L-12 10 Q4 21 17 8 Q27 3 20 -6 Q12 -12 7 -2 L-2 0Z" fill={fill('#fffdf5')} />
        <path d="M23 -2 L30 1 L22 3Z" fill={fill('#d4a45d')} /><circle cx="17" cy="-3" r="1.6" fill={INK} stroke="none" /><path d="M-6 5 Q-10 -16 -28 -26 Q-3 -24 6 1" fill={fill('#fffdf5')} strokeWidth="2.2" />
        {v('kite') === 2 && <path d="M27 2 Q22 10 27 18 Q32 10 27 2Z M27 18 L23 24 H31Z" fill={fill('#94b3af')} strokeWidth="2" />}
      </g></g>
      {/* Lighthouse and striped parasol on the shore. */}
      <g transform={transform('cottage')}>
        {/* A headland joins the beach and supports every shore structure. */}
        <path d="M282 278 Q292 254 331 250 Q378 248 402 250 Q427 249 438 242 L511 242 Q539 251 548 278Z" fill={fill('#f0dfb6')} stroke="none" />
        <path d="M442 258 L450 247 H506 L517 260 L505 269 H443Z" fill={fill('#b6b5a5')} strokeWidth="2.2" /><path d="M462 262 h8 M488 255 h7" fill="none" strokeWidth={FINE} />
        <path d="M450 258 L457 140 H491 L501 258Z" fill={fill('#fff8e6')} />
        <path d="M455 164 H493 L495 180 H454Z M451 220 H498 L499 235 H451Z" fill={fill(accent)} />
        <path d="M450 141 H499 V147 H450Z M455 115 H494 V140 H455Z" fill={fill('#d6e6df')} />
        <path d={scene.style === 0 ? 'M450 115 L474 96 L499 115Z' : 'M450 115 Q474 80 499 115Z'} fill={fill(accent)} />
        <path d="M468 118 V137 M482 118 V137" fill="none" strokeWidth="2" /><path d="M449 258 H504" fill="none" />
        <path d="M472 103 V73" fill="none" />
        <path d={['M472 76 H499 L491 87 L499 98 H472Z', 'M472 76 L499 87 L472 98Z', 'M472 76 H497 V96 H472Z'][v('chimney')]} fill={fill('#e7bd65')} />
        {[<circle key="round" cx="474" cy="198" r="12" fill={fill('#aac6c9')} />,
          <rect key="square" x="462" y="186" width="24" height="24" fill={fill('#aac6c9')} />,
          <path key="arch" d="M463 210 V195 Q463 185 474 185 Q485 185 485 195 V210Z" fill={fill('#aac6c9')} />][v('window')]}
        <path d="M464 198 H484 M474 188 V208" fill="none" strokeWidth={FINE} />
        {/* The lifebuoy's stand is a capped post with a hook, so it reads without the ring. */}
        <Band d="M401 266 V220" colour={fill(WOOD)} width={9} />
        <path d="M395 214 H407 L405 220 H397Z" fill={fill(accent)} strokeWidth="2" /><path d="M401 228 h-6" fill="none" strokeWidth="2.5" />
        {v('door') === 0 && <g><circle cx="401" cy="240" r="14" fill={fill('#e8b48c')} /><circle cx="401" cy="240" r="7" fill={fill('#f0dfb6')} /><path d="M401 226 V233 M387 240 H394 M401 247 V254 M408 240 H415" strokeWidth="2.5" /></g>}
        <Band d="M342 215 V270" colour={fill('#f2ead6')} width={8} />
        <path d={scene.decoration === 0 ? 'M298 214 Q342 143 386 214 Q375 206 364 214 Q353 206 342 214 Q331 206 320 214 Q309 206 298 214Z' : 'M298 214 L342 178 L386 214 Q375 206 364 214 Q353 206 342 214 Q331 206 320 214 Q309 206 298 214Z'} fill={fill(COLOURS[(scene.palette + 1) % 4])} />
        <path d="M342 178 Q321 193 320 213 M342 178 V213 M342 178 Q362 193 364 213" fill="none" strokeWidth={FINE} />
      </g>
      {/* A small sailing boat: its stripe is a shape, not a colour-only change. */}
      <g transform={transform('tree')}><g transform={scene.detail === 2 ? 'translate(200 0) scale(-1 1)' : undefined}>
        <path d="M39 230 H166 L147 254 H65Z" fill={fill(accent)} />
        <path d="M48 238 H159" fill="none" strokeWidth={FINE} /><path d="M100 232 V99" fill="none" />
        <path d={scene.style === 2 ? 'M93 111 Q79 176 46 213 H93Z' : 'M93 111 L48 213 H93Z'} fill={fill('#fff9e5')} />
        <path d="M107 118 L153 213 H107Z" fill={fill('#e7c578')} />
        {[<path key="stripe" d="M107 164 H129 L136 180 H107Z" fill={fill('#86b1b2')} />,
          <circle key="circle" cx="121" cy="182" r="10" fill={fill('#86b1b2')} />,
          <path key="triangle" d="M111 192 H133 L122 172Z" fill={fill('#86b1b2')} />][v('fruit')]}
        {Array.from({ length: scene.detail + 1 }, (_, i) => <circle key={i} cx={80 + i * 23} cy="242" r="3.5" fill={fill('#fff9e5')} />)}
        <path d="M40 262 Q70 269 96 262 M117 263 Q143 269 169 262" fill="none" strokeWidth={FINE} />
      </g></g>
      {/* A beach hut, complete with steps and a little name plaque. */}
      <g transform={transform('birdhouse')}>
        <path d="M185 270 Q193 252 204 241 H265 Q280 250 285 270Z" fill={fill('#f0dfb6')} stroke="none" />
        <path d="M207 179 H263 V246 H207Z" fill={fill(COLOURS[(scene.palette + 2) % 4])} />
        <path d={scene.style === 1 ? 'M201 180 Q235 128 269 180Z' : 'M201 180 L235 149 L269 180Z'} fill={fill('#f5e3b8')} />
        <path d="M213 183 V243 M221 183 V243 M249 183 V243 M257 183 V243" fill="none" strokeWidth={FINE} />
        <path d={v('birdhouse') === 1 ? 'M225 244 V205 Q235 180 245 205 V244Z' : 'M225 244 V198 H245 V244Z'} fill={fill('#fdf3d9')} />
        {v('birdhouse') === 2 && <circle cx="235" cy="210" r="5.5" fill={fill('#aac6c9')} strokeWidth="2" />}
        <circle cx="240" cy="224" r="1.5" fill={INK} /><path d="M216 249 H254 M220 254 H250" strokeWidth="3" />
        {scene.decoration === 2 && <path d="M230 170 Q225 165 230 163 L235 167 L240 163 Q245 165 240 170 L235 174Z" fill={fill(accent)} strokeWidth="1.2" />}
      </g>
      {/* Sandcastle with a flag, crab, bucket and a ball on a folded towel. */}
      <g transform={transform('flower')}>
        <path d="M31 352 V322 H42 V329 H52 V322 H79 V329 H89 V322 H101 V352Z" fill={fill('#d8b67c')} />
        <path d="M55 351 V339 Q66 325 77 339 V351 M27 354 H106 M65 323 V277" fill="none" /><path d="M36 334 h6 M88 330 h6" fill="none" strokeWidth={FINE} />
        <path d={['M65 279 H86 V296 H65Z', 'M65 279 L89 288 L65 299Z', 'M65 279 H90 L82 288 L90 297 H65Z'][v('flower')]} fill={fill(accent)} />
        {scene.style === 1 && <path d="M39 339 H48 M83 339 H92 M45 346 H54 M78 346 H87" strokeWidth="1.3" />}
      </g>
      <g transform={transform('cat')}><g transform="translate(178 328)">
        <path d="M-20 -2 L-35 -9 L-43 -5 M-21 5 L-36 6 L-40 14 M-17 11 L-27 19 M20 -2 L35 -9 L43 -5 M21 5 L36 6 L40 14 M17 11 L27 19" fill="none" strokeWidth="2.5" />
        <path d="M-17 -8 L-28 -23 M17 -8 L29 -23" fill="none" strokeWidth="4" />
        <path d="M-29 -22 Q-45 -29 -34 -40 L-29 -31 L-23 -40 Q-15 -26 -29 -22Z" fill={fill('#ce8e78')} />
        {v('cat') === 0 ? <path d="M29 -22 Q14 -29 23 -40 L29 -31 L35 -40 Q45 -26 29 -22Z" fill={fill('#ce8e78')} /> : <ellipse cx="29" cy="-29" rx="10" ry="11" fill={fill('#ce8e78')} />}
        <ellipse rx="24" ry="15" fill={fill('#ce8e78')} /><path d="M-10 -11 L-10 -21 M10 -11 L10 -21" strokeWidth="2.2" /><circle cx="-10" cy="-23" r="4" fill={fill('#fff8e3')} strokeWidth="2" /><circle cx="10" cy="-23" r="4" fill={fill('#fff8e3')} strokeWidth="2" /><circle cx="-10" cy="-23" r="1.5" fill={INK} stroke="none" /><circle cx="10" cy="-23" r="1.5" fill={INK} stroke="none" /><path d="M-5 3 Q0 8 5 3" fill="none" strokeWidth={FINE} />
      </g></g>
      <g transform={transform('can')}>
        {v('can') === 0 && <g transform="rotate(16 309 326)"><Band d="M309 334 V300" colour={fill(WOOD)} width={8} /><path d="M301 286 H317 V298 Q309 309 301 298Z" fill={fill('#94b3af')} strokeWidth="2.2" /></g>}
        {v('can') === 2 && <g transform="rotate(16 309 326)"><Band d="M309 334 V298" colour={fill(WOOD)} width={8} /><path d="M298 296 Q298 282 309 282 Q320 282 320 296 Q309 312 298 296Z" fill={fill('#efe6cf')} strokeWidth="2.2" /><path d="M303 286 L306 301 M309 283 V304 M315 286 L312 301 M299 292 H319" fill="none" strokeWidth="1.2" /></g>}
        <path d="M267 318 L274 354 H311 L318 318Z" fill={fill(accent)} /><ellipse cx="292" cy="318" rx="25" ry="6" fill={fill('#f7e7be')} /><path d="M268 324 Q289 285 316 324" fill="none" strokeWidth="2.5" />
        {scene.detail === 2 && <path d="M277 339 H308 M277 345 H308" fill="none" strokeWidth={FINE} />}
      </g>
      <g transform={transform('pond')}>
        <path d="M420 346 L526 340 L552 367 L439 373Z" fill={fill('#c9b6b0')} />
        {Array.from({ length: 3 }, (_, i) => <path key={i} d={`M${433 + i * 29} 347 L${452 + i * 29} 369`} fill="none" strokeWidth={scene.decoration === 1 ? 5 : FINE} />)}
        <circle cx="481" cy="323" r="29" fill={fill('#f7e6ad')} />
        {[<g key="segments" fill="none" strokeWidth="2.5"><path d="M481 294 Q455 323 481 352 Q506 323 481 294 M452 323 H510" /></g>,
          <g key="dots" fill={fill(accent)}><circle cx="472" cy="312" r="6" /><circle cx="493" cy="324" r="6" /><circle cx="470" cy="338" r="6" /></g>,
          <g key="stripes" fill="none" strokeWidth="2.5"><path d="M456 311 Q481 318 506 311 M455 335 Q481 342 507 335" /></g>][v('duck')]}
      </g>
      {[[24, 305], [127, 367], [349, 364], [569, 285]].map(([x, y], i) => <g key={x} transform={`translate(${x / 600 * width} ${y / 390 * height})`} strokeWidth={FINE}><path d={scene.detail === i % 3 ? 'M-7 0 Q-10 -14 0 -13 Q11 -13 7 0Z M0 -12 V0 M-5 -9 L-2 0 M5 -9 L2 0' : 'M-5 0 L0 -5 L5 0 M-3 5 L2 4'} fill={fill('#f2e3c2')} /></g>)}
      </g>
    </SceneFrame>
  );
}
