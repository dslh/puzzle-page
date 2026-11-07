import { type Feature } from './generator';
import { sceneLayout } from './layout';
import SceneFrame, { INK, type SceneProps } from './SceneFrame';

const ROOFS = ['#c97c62', '#749399', '#a984a0', '#d9ac55'];

/** A little garden, composed in layers rather than a scatter of clip art.
 * Both pictures share the same scene. Only named feature switches can differ.
 */
export default function Garden(props: SceneProps) {
  const { scene, second, outline, aspect } = props;
  const layout = sceneLayout(aspect);
  const { width, height, dx, dy, transform } = layout;
  const fill = (colour: string) => outline ? '#fff' : colour;
  const variant = (key: Feature) => scene.variants[key] ^ Number(second && scene.changes.includes(key));
  return (
    <SceneFrame {...props} layout={layout}>
        {/* Quiet background: sky, distant hills and the lawn. */}
        <path d={`M4 ${237 + dy * .48} Q${width * .18} ${191 + dy * .48} ${width * .385} ${231 + dy * .48} Q${width * .647} ${174 + dy * .48} ${width - 4} ${231 + dy * .48} V${height - 16} Q${width - 4} ${height - 2} ${width - 19} ${height - 2} H19 Q4 ${height - 2} 4 ${height - 16}Z`} fill={fill('#e4ebce')} stroke="none" />
        <path d={`M4 ${277 + dy * .6} Q${width * .3} ${245 + dy * .6} ${width * .543} ${272 + dy * .6} T${width - 4} ${267 + dy * .6}`} fill="none" stroke={outline ? '#b2b2a4' : '#bfccaa'} />
        <g transform="translate(55 48)">
          {Array.from({ length: 12 }, (_, i) => <path key={i} d="M0 -26 V-32" transform={`rotate(${i * 30})`} />)}
          <circle r="19" fill={fill('#f4cc69')} />
          <path d="M-7 4 Q0 10 7 4" fill="none" /><circle cx="-6" cy="-3" r="1.2" fill={INK} /><circle cx="6" cy="-3" r="1.2" fill={INK} />
        </g>
        {Array.from({ length: scene.clouds }, (_, i) => <path key={i} transform={`translate(${325 + i * 97 + dx * (.5 + i * .12)} ${29 + (i % 2) * 19 + dy * .08}) scale(.8)`} d="M0 20 Q-8 6 7 5 Q9 -12 26 -6 Q42 -18 51 0 Q69 -2 68 13 Q82 23 65 27 H8 Q0 27 0 20Z" fill={fill('#fff')} strokeWidth="2" />)}
        {/* Kite: the two tails are deliberately different silhouettes. */}
        <g transform={transform('kite')}><g transform="translate(244 57)">
          <path d="M0 -29 L21 0 L0 28 L-21 0Z" fill={fill('#e4b469')} />
          <path d="M0 -29 V28 M-21 0 H21" fill="none" />
          <path d="M0 28 Q-16 46 1 59 Q17 72 0 85" fill="none" strokeWidth="1.8" />
          {variant('kite') === 0 && <g fill={fill('#bc7a79')}><path d="M-3 42 L-13 35 V49Z M-3 42 L7 35 V49Z" /><path d="M5 64 L-5 57 V71Z M5 64 L15 57 V71Z" /></g>}
        </g></g>
        {/* Low fence stays behind every foreground object. */}
        <g fill={fill('#f6e9ce')} transform={`translate(0 ${dy * .48})`}>
          <path d={`M5 229 H${width - 5} V239 H5Z`} />
          {Array.from({ length: Math.floor((width - 20) / 31) + 1 }, (_, i) => <path key={i} d={`M${i * 31 + 7} 254 V${scene.fence ? 217 : 214} l6 -7 6 7 V254Z`} />)}
        </g>
        {/* Cottage: chimney, roof, walls, door and window are separate regions. */}
        <g transform={transform('cottage')}>
        {variant('chimney') === 0 && <g fill={fill('#dbad91')}><path d="M459 127 V86 H481 V140Z" /><path d="M454 85 H486 V96 H454Z" /></g>}
        <path d="M347 161 H526 V262 H347Z" fill={fill(['#f3dfb0', '#ead5c1', '#e0e4ce', '#f2d6cb'][scene.palette])} />
        <path d={scene.style === 0 ? 'M329 164 L435 101 L541 164Z' : scene.style === 1 ? 'M329 164 L362 119 L435 97 L508 119 L541 164Z' : 'M329 164 Q373 143 435 101 Q497 143 541 164Z'} fill={fill(ROOFS[scene.roof])} />
        {scene.style === 0 && <path d="M345 153 L435 111 L524 153" fill="none" stroke={outline ? '#7e7e75' : '#fff5dc'} strokeWidth="2" />}
        {scene.style === 1 && <path d="M362 119 H508 M350 140 H520" fill="none" strokeWidth="1.2" />}
        <path d={scene.decoration === 0 ? 'M371 262 V207 Q390 177 409 207 V262Z' : 'M371 262 V191 H409 V262Z'} fill={fill('#93aaa0')} />
        {variant('door') === 0 && <circle cx="390" cy="213" r="9" fill={fill('#fff8d9')} />}
        <circle cx="400" cy="238" r="2.5" fill={INK} />
        {variant('window') === 0 ? <circle cx="474" cy="203" r="23" fill={fill('#d8e9e8')} /> : <rect x="451" y="180" width="46" height="46" rx="2" fill={fill('#d8e9e8')} />}
        <path d="M451 203 H497 M474 180 V226 M447 231 H501" fill="none" />
        {scene.decoration === 2 && <g fill={fill('#b6bd97')}><path d="M437 179 H445 V224 H437Z M503 179 H511 V224 H503Z" /><path d="M439 187 H443 M439 195 H443 M505 187 H509 M505 195 H509" strokeWidth="1" /></g>}
        <path d="M363 265 H419" strokeWidth="5" />
        </g>
        {Array.from({ length: scene.steppingStones }, (_, i) => {
          const start = layout.point('cottage', 391, 280);
          const progress = i / (scene.steppingStones - 1);
          return <ellipse key={i} cx={start.x + Math.sin(i * 2) * 13} cy={start.y + progress * (95 + dy * .4)} rx={13 + i * 2} ry="5" fill={fill('#ded7c6')} strokeWidth="1.5" />;
        })}
        {/* Apple tree, with generous white space around each apple. */}
        <g transform={transform('tree')}>
        <path d="M88 272 L94 150 H109 L116 272 M100 224 L73 193 M104 206 L129 179" fill={fill('#b39373')} />
        <path d={scene.tree === 0 ? 'M44 168 Q21 139 49 121 Q39 91 72 91 Q90 65 117 88 Q153 79 157 112 Q184 130 158 152 Q164 182 130 187 Q106 207 84 186 Q52 195 44 168Z' : 'M35 158 Q25 129 55 116 Q50 88 83 90 Q105 68 130 93 Q160 95 155 123 Q181 145 160 166 Q141 193 113 181 Q83 203 61 181 Q35 182 35 158Z'} fill={fill('#a8bf85')} />
        {(variant('fruit') === 0 ? [[67, 141], [130, 153]] : [[67, 141], [130, 153], [95, 115], [96, 175]]).map(([x, y]) => <g key={x + ',' + y} transform={`translate(${x} ${y})`}><path d="M0 -5 Q-11 -10 -10 2 Q-8 13 0 10 Q8 13 10 2 Q11 -10 0 -5Z" fill={fill('#cc7860')} /><path d="M0 -5 L2 -11" fill="none" /></g>)}
        </g>
        {/* Birdhouse on its own post, safely between the tree and cottage. */}
        <g transform={transform('birdhouse')}>
        <path d="M232 252 V198 H238 V252" fill={fill('#b39373')} />
        <path d="M215 170 H255 V204 H215Z" fill={fill('#dfb57c')} /><path d="M208 171 L235 149 L262 171Z" fill={fill(ROOFS[(scene.roof + 1) % 4])} />
        {variant('birdhouse') === 0 ? <circle cx="235" cy="183" r="8" fill={INK} /> : <path d="M226 190 L235 175 L244 190Z" fill={INK} />}
        <path d="M227 199 H243" strokeWidth="3" />
        </g>
        {/* Foreground flower bed. */}
        <g transform={transform('flower')}>
        <ellipse cx="70" cy="353" rx="43" ry="9" fill={fill('#dcc7a0')} strokeWidth="1.5" />
        <path d="M66 347 V311 M66 337 Q44 317 46 338 Q56 346 66 343 M66 328 Q86 308 86 328 Q77 337 66 335" fill={fill('#9fb586')} />
        {variant('flower') === 0 ? <g transform="translate(66 305)" fill={fill(scene.detail === 0 ? '#edc365' : '#f8e7d1')}>{Array.from({ length: scene.detail === 2 ? 6 : 8 }, (_, i) => <ellipse key={i} cy="-12" rx="6" ry="11" transform={`rotate(${i * 360 / (scene.detail === 2 ? 6 : 8)})`} />)}<circle r="8" fill={fill('#a78359')} /></g> : <path d="M47 285 L58 297 L66 282 L74 297 L85 285 Q89 319 66 321 Q43 319 47 285Z" fill={fill('#d9908d')} />}
        {Array.from({ length: scene.flowers }, (_, i) => <g key={i} transform={`translate(${32 + i * 24} 353)`}><path d="M0 0 V-10" /><path d="M-6 -12 Q-10 -23 0 -19 Q9 -24 7 -13 Q0 -7 -6 -12Z" fill={fill('#f4e5c1')} strokeWidth="1.5" /></g>)}
        </g>
        {/* A cat watching the duck. */}
        <g transform={transform('cat')}><g transform="translate(176 327)">
          {variant('cat') === 0 ? <path d="M12 12 Q46 13 38 -17 Q34 -28 30 -19" fill="none" stroke={INK} strokeWidth="9" /> : <path d="M12 12 Q48 25 43 4 Q39 -7 30 0" fill="none" stroke={INK} strokeWidth="9" />}
          <ellipse cx="0" cy="0" rx="20" ry="24" fill={fill(['#dcb887', '#b9b4a4', '#e5d5c2'][scene.detail])} />
          <path d="M-20 -26 L-22 -45 L-8 -36 Q0 -40 8 -36 L22 -45 L20 -26 Q19 -10 0 -10 Q-19 -10 -20 -26Z" fill={fill(['#dcb887', '#b9b4a4', '#e5d5c2'][scene.detail])} />
          {scene.detail === 1 && <path d="M-18 -3 L-9 0 M-19 6 L-10 8 M13 -4 L19 -7 M8 -35 L4 -29 M-4 -35 L-6 -29" fill="none" strokeWidth="3" />}
          {scene.detail === 2 && <path d="M-10 12 Q-16 -1 -6 -6 Q6 -9 6 7 L5 19Z" fill={fill('#9f8a74')} stroke="none" />}
          <path d="M-11 -26 l4 1 M7 -25 l4 -1 M-3 -20 L0 -17 L3 -20 M0 -17 V-14 M-17 -20 L-29 -23 M-17 -16 L-29 -15 M17 -20 L29 -23 M17 -16 L29 -15 M-10 15 V21 M2 15 V21" fill="none" strokeWidth="1.7" />
        </g></g>
        {/* Watering can beside the path. */}
        <g transform={transform('can')}><g transform="translate(290 328)" fill={fill('#8eaeb0')}>
          <path d="M-15 -9 Q-48 -30 -42 -4 Q-39 6 -18 4" fill="none" strokeWidth="5" />
          <path d="M8 -3 L31 -25 L36 -20 L19 13Z" />
          <path d="M-22 -15 H17 L22 21 Q0 29 -24 21Z" /><ellipse cx="-2" cy="-15" rx="20" ry="5" />
          {variant('can') === 0 && <path d="M27 -30 L41 -20 L45 -27 L30 -38Z" />}
          <path d="M-17 2 H10" fill="none" stroke={outline ? INK : '#e1eddf'} strokeWidth="2" />
        </g></g>
        {/* Pond and duck; only the duck turns, not the pond or reeds. */}
        <g transform={transform('pond')}>
        <path d="M432 302 Q475 282 535 303 Q575 322 547 350 Q520 369 457 358 Q405 350 415 325 Q419 311 432 302Z" fill={fill('#c7dfe0')} />
        <path d="M430 341 Q452 348 465 342 M502 352 Q529 357 543 341 M511 312 H535" fill="none" strokeWidth="1.6" />
        <g transform={`translate(477 324) scale(${variant('duck') === 0 ? 1 : -1} 1)`} fill={fill('#f4dfa0')}>
          <path d="M-23 2 L-31 -6 L-28 9 Q-9 29 17 11 Q25 4 20 -6 L14 -13 Q6 -20 2 -11 L3 0Z" />
          <path d="M17 -10 L30 -6 L18 -3Z" fill={fill('#dba15d')} /><circle cx="13" cy="-9" r="1.7" fill={INK} />
          <path d="M-17 5 Q-7 17 5 6" fill="none" />
        </g>
        <g fill={fill('#b0966a')}><path d="M559 330 V285 M568 334 V295" fill="none" /><rect x="555" y="278" width="8" height="20" rx="4" /><rect x="564" y="287" width="8" height="18" rx="4" /></g>
        </g>
        {/* A few grass marks knit the objects into the same place. */}
        {[ [23, 290], [130, 285], [211, 365], [335, 361], [555, 263] ].map(([x, y]) => <path key={x} d="M-6 0 L-8 -7 M0 0 V-10 M6 0 L9 -6" transform={`translate(${x / 600 * width} ${y / 390 * height})`} fill="none" strokeWidth="1.5" />)}
    </SceneFrame>
  );
}
