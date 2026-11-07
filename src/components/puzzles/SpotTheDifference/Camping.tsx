import type { Feature } from './generator';
import { sceneLayout } from './layout';
import SceneFrame, { INK, type SceneProps } from './SceneFrame';

const TENTS = ['#c49869', '#86a5a0', '#c18876', '#b1a2ba'];

export default function Camping(props: SceneProps) {
  const { scene, second, outline, aspect } = props;
  const layout = sceneLayout(aspect, scene);
  const { width, height, dy, transform } = layout;
  const fill = (colour: string) => outline ? '#fff' : colour;
  const v = (key: Feature) => scene.variants[key] ^ Number(second && scene.changes.includes(key));
  return (
    <SceneFrame {...props} layout={layout} paper="#edf0e8">
      {/* A quiet clearing, with a distant ridge of trees. */}
      <path d={`M4 ${234 + dy * .48} Q${width * .3} ${190 + dy * .48} ${width * .5} ${226 + dy * .48} T${width - 4} ${226 + dy * .48} V${height - 16} Q${width - 4} ${height - 2} ${width - 19} ${height - 2} H19 Q4 ${height - 2} 4 ${height - 16}Z`} fill={fill('#d8dfc1')} stroke="none" />
      {Array.from({ length: 7 + scene.decoration }, (_, i) => <path key={i} transform={`translate(${28 + i * (width - 56) / (6 + scene.decoration)} ${226 + dy * .48})`} d="M0 -66 L-15 -39 H-8 L-25 -17 H-13 L-31 0 H31 L13 -17 H25 L8 -39 H15Z" fill={fill(i % 2 ? '#b8c7af' : '#c9d2b9')} strokeWidth="1.2" />)}
      {Array.from({ length: 7 + scene.clouds }, (_, i) => <path key={i} transform={`translate(${44 + (i * 83 % 515) / 600 * width} ${29 + i % 3 * 19 + dy * .05})`} d={scene.detail === 1 && i % 2 ? 'M-4 0 H4 M0 -4 V4' : 'M0 -5 L2 -1 L6 0 L2 2 L0 6 L-2 2 L-5 0 L-2 -1Z'} fill={fill('#e8d7a2')} strokeWidth="1.2" />)}
      <g transform={transform('kite')}>
        {v('kite') === 0 ? <path d="M256 76 A27 27 0 1 0 267 119 Q237 123 239 98 Q240 82 256 76Z" fill={fill('#f1ddb0')} /> : <circle cx="244" cy="100" r="26" fill={fill('#f1ddb0')} />}
      </g>
      {/* The tent, pitched beside a tree stump. */}
      <g transform={transform('cottage')}>
        <path d="M329 262 L390 119 H437 L541 262Z" fill={fill(TENTS[scene.palette])} />
        <path d={scene.style === 2 ? 'M329 262 Q356 173 390 119 Q423 177 455 262Z' : 'M329 262 L390 119 L455 262Z'} fill={fill('#e5cf9b')} />
        <path d="M390 119 H437 M455 262 H541 M331 258 L316 273 M534 258 L551 273 M316 268 V278 M551 268 V278" fill="none" />
        <path d="M437 120 V77" />
        {v('chimney') === 0 ? <path d="M437 80 H476 L466 91 L476 102 H437Z" fill={fill('#d29b78')} /> : <path d="M437 80 L477 91 L437 102Z" fill={fill('#d29b78')} />}
        {v('door') === 0 ? <path d="M363 261 L390 195 L420 261Z" fill={fill('#6c8276')} /> : <path d="M363 261 L390 195 L420 261Z M390 195 V260" fill={fill('#e5cf9b')} />}
        <path d="M360 263 H424" strokeWidth="4" />
        {v('window') === 0 ? <circle cx="474" cy="210" r="14" fill={fill('#eaf0de')} /> : <path d="M460 224 L474 195 L488 224Z" fill={fill('#eaf0de')} />}
        <path d="M474 199 V222" strokeWidth="1.5" />
        {scene.style === 1 && <path d="M428 150 L449 178 M445 150 L466 178 M459 168 L467 178" fill="none" strokeWidth="1.3" />}
        <path d="M324 234 V259 Q300 267 279 258 V232" fill={fill('#b29a77')} /><ellipse cx="301" cy="232" rx="23" ry="8" fill={fill('#dac6a0')} /><ellipse cx="301" cy="232" rx="13" ry="4" fill="none" strokeWidth="1.4" /><path d="M287 242 V252 M312 239 V254" strokeWidth="1.3" />
      </g>
      {/* An owl perched in the hollow of an old tree. */}
      <g transform={transform('tree')}>
        <path d="M57 273 Q68 233 59 175 L62 108 L83 103 L100 132 L122 101 L145 111 L139 176 Q132 229 146 273Z" fill={fill('#b5a080')} />
        <path d={scene.style === 2 ? 'M100 48 L66 82 H79 L45 114 H63 L27 140 H173 L137 114 H155 L121 82 H134Z' : scene.tree === 0 ? 'M33 123 Q12 97 43 79 Q44 48 75 57 Q97 33 122 58 Q160 49 164 81 Q190 105 160 124 Q143 152 113 136 Q81 161 61 137 Q35 144 33 123Z' : 'M27 125 Q17 99 39 88 Q29 64 57 59 Q68 34 95 50 Q128 36 141 60 Q177 61 167 89 Q185 112 160 128 Q139 150 116 137 Q80 156 61 136Z'} fill={fill(scene.decoration === 2 ? '#b7bd8c' : '#9eb499')} />
        <ellipse cx="101" cy="170" rx="32" ry="43" fill={fill('#7c806a')} />
        <path d="M77 168 L77 135 L90 144 Q101 137 113 144 L125 135 V168 Q127 198 101 199 Q75 198 77 168Z" fill={fill('#d4b789')} />
        <path d="M81 174 Q87 187 95 190 M122 174 Q116 187 108 190" fill="none" strokeWidth="1.5" />
        {v('fruit') === 0 ? <g><circle cx="91" cy="159" r="9" fill={fill('#fff7dc')} /><circle cx="112" cy="159" r="9" fill={fill('#fff7dc')} /><circle cx="91" cy="159" r="3" fill={INK} /><circle cx="112" cy="159" r="3" fill={INK} /></g> : <path d="M83 159 Q91 169 99 159 M104 159 Q112 169 120 159" fill="none" strokeWidth="2.8" />}
        <path d="M97 172 L102 179 L107 172Z" fill={fill('#d9a65d')} /><path d="M84 204 H128 M92 201 V207 M99 201 V207" strokeWidth="3" />
      </g>
      {/* A wooden trail sign. */}
      <g transform={transform('birdhouse')}>
        <path d="M232 249 V160 H239 V249" fill={fill('#a99270')} />
        <path transform={v('birdhouse') ? 'translate(470 0) scale(-1 1)' : undefined} d="M207 169 H248 L263 183 L248 197 H207Z" fill={fill('#dfc79b')} />
        <path d="M221 185 L229 177 L237 185 M225 185 H235" fill="none" strokeWidth="1.6" />
        {scene.detail === 2 && <path d="M214 220 H258 L267 229 L258 238 H214Z" fill={fill('#c1b492')} />}
      </g>
      {/* Toadstools growing at the edge of the clearing. */}
      <g transform={transform('flower')}>
        <path d="M59 317 L56 350 Q66 354 76 350 L72 317Z" fill={fill('#f8ebcf')} />
        <path d={scene.style === 0 ? 'M36 320 Q44 279 66 285 Q90 280 98 320Z' : 'M36 320 Q65 266 98 320Z'} fill={fill('#c98c78')} />
        {(v('flower') === 0 ? [[53, 309], [79, 308]] : [[53, 309], [79, 308], [66, 294]]).map(([x, y]) => <circle key={x} cx={x} cy={y} r="4" fill={fill('#fff4d9')} />)}
        <path d="M27 353 V340 M18 340 Q27 316 38 340Z" fill={fill('#b1b28c')} />
        {scene.decoration === 1 && <path d="M99 351 V338 M88 338 Q99 315 110 338Z" fill={fill('#b1b28c')} />}
      </g>
      {/* A hedgehog sniffing about beside the lantern. */}
      <g transform={transform('cat')}><g transform={`translate(178 332) scale(${v('cat') ? -1 : 1} 1)`}>
        <path d="M-28 9 L-34 -3 L-25 -5 L-29 -17 L-18 -17 L-17 -28 L-8 -24 L0 -34 L7 -25 L18 -27 L21 -17 L31 -15 L28 -5 L36 2 L28 13Z" fill={fill(scene.detail === 0 ? '#a58b70' : '#b59d7b')} />
        <path d="M-24 13 Q-20 -8 -7 -9 L5 -1 L26 12Z" fill={fill('#e6ceb0')} />
        <circle cx="-25" cy="10" r="3.5" fill={INK} />
        <circle cx="-13" cy="3" r="2" fill={INK} /><path d="M-10 15 L-15 18 M16 15 L20 18 M-14 -17 L-11 -13 M0 -24 L1 -18 M14 -18 L12 -13 M25 -7 L21 -5" fill="none" strokeWidth="1.7" />
      </g></g>
      {/* Lantern with a removable carrying loop. */}
      <g transform={transform('can')}>
        {v('can') === 0 && <path d="M286 303 V290 Q300 270 314 290 V303" fill="none" strokeWidth="4" />}
        <path d="M282 313 H318 L322 346 H278Z" fill={fill('#f1dda5')} />
        <path d="M278 310 H322 L312 299 H288Z M277 348 H323 V355 H277Z" fill={fill('#8ba39c')} />
        <path d="M285 315 L283 345 M315 315 L317 345" fill="none" />
        <path d="M299 340 Q285 327 301 319 Q297 328 306 332 Q311 339 299 340Z" fill={fill('#d6aa65')} strokeWidth="1.4" />
      </g>
      {/* A picnic blanket, mug and a packed snack. */}
      <g transform={transform('pond')}>
        <path d="M421 326 L520 318 L560 361 L450 373Z" fill={fill(TENTS[(scene.palette + 1) % 4])} />
        <g fill="none" strokeWidth="1.2"><path d="M437 325 L467 371 M463 323 L495 367 M491 321 L525 364 M431 342 L535 335 M440 356 L548 348" />{scene.decoration === 1 && <path d="M431 330 L460 372 M449 324 L480 370 M476 322 L509 366" />}</g>
        <path d="M472 311 V338 Q486 346 500 338 V311Z" fill={fill('#f8edcf')} />
        {v('duck') === 0 && <path d="M501 316 Q524 311 517 332 Q512 339 501 331" fill="none" strokeWidth="4" />}
        <ellipse cx="486" cy="311" rx="14" ry="5" fill={fill('#b29b7c')} />
        <path d={scene.detail === 1 ? 'M440 329 L456 315 L468 333Z' : 'M440 329 L456 317 L468 333 L451 345Z'} fill={fill('#dfc195')} /><path d="M445 333 L457 324 L464 332" fill="none" strokeWidth="1.3" />
      </g>
      {[[26, 281], [127, 368], [353, 356], [572, 293]].map(([x, y]) => <path key={x} transform={`translate(${x / 600 * width} ${y / 390 * height})`} d="M-7 1 L-8 -8 M0 1 L2 -12 M7 1 L11 -7" fill="none" strokeWidth="1.5" />)}
    </SceneFrame>
  );
}
