import { version, type Feature } from './generator';
import { ridge, sceneLayout } from './layout';
import SceneFrame, { Band, Birds, FAR, FINE, INK, LINE, type SceneProps } from './SceneFrame';

const ROOFS = ['#c97c62', '#749399', '#a984a0', '#d9ac55'];
const FUR = ['#dcb887', '#b9b4a4', '#e5d5c2'];
// Where the ground objects stand, in their own drawing coordinates.
const GROUND = {
  flower: [18, 115, 277, 365], cat: [132, 225, 280, 356],
  can: [245, 336, 277, 360], pond: [405, 573, 278, 375],
} as const;

/** A little garden, composed in layers rather than a scatter of clip art.
 * Both pictures share the same scene. Only named feature switches can differ.
 */
export default function Garden(props: SceneProps) {
  const { scene, second, outline, aspect } = props;
  const layout = sceneLayout(aspect, scene);
  const { width, height, dx, dy, transform } = layout;
  const fill = (colour: string) => outline ? '#fff' : colour;
  const variant = (key: Feature) => version(scene, key, second);
  const fur = fill(FUR[scene.detail]);
  const lawn = dy * .48;
  // The far hills roll gently behind the lawn; their trees sit on the line.
  const { at: hill, line: hillLine } = ridge(width, 166 + dy * .3);
  const stoneCount = scene.steppingStones + 3;
  const farTrees = [.05, .12, .3, .5, .58, .78, .86, .94].filter((_, i) => (i + scene.decoration) % 3 !== 0);
  return (
    <SceneFrame {...props} layout={layout}>
      <g strokeWidth={LINE}>
        <g transform={scene.backgroundFlipped ? `translate(${width} 0) scale(-1 1)` : undefined}>
          {/* Far hills with a few round trees: depth behind the fence. */}
          <path d={`${hillLine} V${260 + lawn} H4Z`} fill={fill('#dce6cc')} stroke="none" />
          <path d={hillLine} fill="none" stroke={FAR} strokeWidth={FINE} />
          {farTrees.map(t => {
            const x = t * width;
            const y = hill(x);
            const r = 11 + (t * 37 % 1) * 6;
            return <g key={t} stroke={FAR} strokeWidth={FINE}>
              <path d={`M${x} ${y + 2} V${y - r}`} />
              <circle cx={x} cy={y - r - 4} r={r} fill={fill('#bccfa6')} />
            </g>;
          })}
          <g transform="translate(55 48)">
            {Array.from({ length: 12 }, (_, i) => <path key={i} d="M0 -26 V-32" transform={`rotate(${i * 30})`} />)}
            <circle r="19" fill={fill('#f4cc69')} />
            <g strokeWidth={FINE}><path d="M-7 4 Q0 10 7 4" fill="none" /></g>
            <circle cx="-6" cy="-3" r="1.4" fill={INK} stroke="none" /><circle cx="6" cy="-3" r="1.4" fill={INK} stroke="none" />
          </g>
          {Array.from({ length: scene.clouds }, (_, i) => <path key={i} transform={`translate(${325 + i * 97 + dx * (.5 + i * .12)} ${29 + (i % 2) * 19 + dy * .2}) scale(.85)`} d="M0 20 Q-8 6 7 5 Q9 -12 26 -6 Q42 -18 51 0 Q69 -2 68 13 Q82 23 65 27 H8 Q0 27 0 20Z" fill={fill('#fff')} strokeWidth="2.2" />)}
          {/* Two birds far off, between the sun and the kite. */}
          <Birds x={112 + dx * .2} y={24 + dy * .22} />
        </g>
        {/* The near lawn rises over the far hills. */}
        <path d={`M4 ${237 + lawn} Q${width * .18} ${191 + lawn} ${width * .385} ${231 + lawn} Q${width * .647} ${174 + lawn} ${width - 4} ${231 + lawn} V${height - 16} Q${width - 4} ${height - 2} ${width - 19} ${height - 2} H19 Q4 ${height - 2} 4 ${height - 16}Z`} fill={fill('#e4ebce')} stroke="none" />
        <path d={`M4 ${277 + dy * .6} Q${width * .3} ${245 + dy * .6} ${width * .543} ${272 + dy * .6} T${width - 4} ${267 + dy * .6}`} fill="none" stroke={outline ? '#b2b2a4' : '#c9d5b4'} strokeWidth="2" />
        {/* Kite: the two tails are deliberately different silhouettes. */}
        <g transform={transform('kite')}><g transform="translate(244 57)">
          <path d="M0 -29 L21 0 L0 28 L-21 0Z" fill={fill('#e4b469')} />
          <path d="M0 -29 L21 0 L0 0Z M0 0 L-21 0 L0 28Z" fill={fill('#d39a52')} strokeWidth={FINE} />
          <path d="M0 28 Q-16 46 1 59 Q17 72 0 85" fill="none" strokeWidth={FINE} />
          {variant('kite') === 0 && <g fill={fill('#bc7a79')} strokeWidth="2"><path d="M-3 42 L-13 35 V49Z M-3 42 L7 35 V49Z" /><path d="M5 64 L-5 57 V71Z M5 64 L15 57 V71Z" /></g>}
          {variant('kite') === 2 && <g fill={fill('#8eaeb0')} strokeWidth="2"><path d="M-6 39 L5 43 L-4 51Z M8 58 L-3 62 L6 70Z M2 76 L13 80 L4 88Z" /></g>}
        </g></g>
        {/* Low fence stays behind every foreground object. */}
        <g fill={fill('#f6e9ce')} strokeWidth="2.2" transform={`translate(0 ${lawn})`}>
          <path d={`M5 229 H${width - 5} V239 H5Z`} />
          {Array.from({ length: Math.floor((width - 20) / 31) + 1 }, (_, i) => <path key={i} d={`M${i * 31 + 7} 254 V${scene.fence ? 217 : 214} l6 -7 6 7 V254Z`} />)}
        </g>
        {/* A border of bushes and flowers along the foot of the fence. */}
        <g transform={`translate(0 ${lawn})`}>
          {Array.from({ length: Math.ceil(width / 46) }, (_, i) => {
            const x = 18 + i * 46 + (i * 17 % 11);
            return i % 3 === 1
              ? <g key={i} strokeWidth={FINE}><path d={`M${x} 258 V246`} /><circle cx={x} cy="243" r="4.5" fill={fill(['#e8a7a0', '#f1d27a', '#c7b3d6'][(i + scene.palette) % 3])} /></g>
              : <path key={i} d={`M${x - 15} 259 Q${x - 16} 244 ${x - 5} 245 Q${x} 236 ${x + 8} 244 Q${x + 18} 244 ${x + 15} 259Z`} fill={fill(i % 2 ? '#b4c893' : '#a6bd88')} strokeWidth="2" />;
          })}
        </g>
        {/* Cottage: chimney, roof, walls, door and window are separate regions. */}
        <g transform={transform('cottage')}>
          {variant('chimney') === 0 && <g fill={fill('#dbad91')}><path d="M459 127 V86 H481 V140Z" /><path d="M454 85 H486 V96 H454Z" /><path d="M463 106 H471 M468 118 H477" fill="none" strokeWidth={FINE} /></g>}
          {variant('chimney') === 2 && <g fill={fill('#dbad91')}><path d="M464 82 H476 V93 H464Z" fill={fill('#cc8a6a')} /><path d="M454 120 V100 H488 V140Z" /><path d="M450 92 H492 V101 H450Z" /><path d="M460 110 H470 M474 122 H484" fill="none" strokeWidth={FINE} /></g>}
          <path d="M347 161 H526 V262 H347Z" fill={fill(['#f3dfb0', '#ead5c1', '#e0e4ce', '#f2d6cb'][scene.palette])} />
          {!outline && <path d="M347 164 H526 V174 H347Z" fill="#000" fillOpacity=".07" stroke="none" />}
          <g fill="none" strokeWidth={FINE}><path d="M356 184 H368 M360 240 H352 M418 182 H430 M512 246 H520 M508 174 H518" /></g>
          <path d={scene.style === 0 ? 'M329 164 L435 101 L541 164Z' : scene.style === 1 ? 'M329 164 L362 119 L435 97 L508 119 L541 164Z' : 'M329 164 Q373 143 435 101 Q497 143 541 164Z'} fill={fill(ROOFS[scene.roof])} />
          {scene.style === 0 && <path d="M353 153 L435 115 L517 153" fill="none" stroke={outline ? '#7e7e75' : '#fff5dc'} strokeWidth="2" />}
          {scene.style === 1 && <path d="M367 126 H503 M353 145 H517" fill="none" strokeWidth={FINE} />}
          {scene.style === 2 && <path d="M375 146 Q400 140 413 129 M457 129 Q470 140 495 146" fill="none" strokeWidth={FINE} />}
          <path d={scene.decoration === 0 ? 'M371 262 V207 Q390 177 409 207 V262Z' : 'M371 262 V191 H409 V262Z'} fill={fill('#93aaa0')} />
          {variant('door') === 0 && <g><circle cx="390" cy="214" r="11" fill={fill('#fff8d9')} /><path d="M379 214 H401 M390 203 V225" fill="none" strokeWidth={FINE} /></g>}
          {variant('door') === 2 && <path d="M390 225 Q376 214 379 207 Q383 200 390 206 Q397 200 401 207 Q404 214 390 225Z" fill={fill('#e8a7a0')} strokeWidth="2.5" />}
          {variant('door') === 3 && <g><path d="M380 204 H400 V224 H380Z" fill={fill('#fff8d9')} /><path d="M380 214 H400 M390 204 V224" fill="none" strokeWidth={FINE} /></g>}
          <circle cx="401" cy="240" r="2.6" fill={INK} stroke="none" />
          {[<circle key="round" cx="474" cy="203" r="23" fill={fill('#d8e9e8')} />,
            <rect key="square" x="451" y="180" width="46" height="46" rx="2" fill={fill('#d8e9e8')} />,
            <path key="arch" d="M453 226 V198 Q453 178 474 178 Q495 178 495 198 V226Z" fill={fill('#d8e9e8')} />,
            <path key="diamond" d="M474 177 L500 203 L474 229 L448 203Z" fill={fill('#d8e9e8')} />][variant('window')]}
          <path d={variant('window') === 2 ? 'M453 203 H495 M474 178 V226' : 'M451 203 H497 M474 180 V226'} fill="none" strokeWidth="2" />
          <path d="M447 229 H501 V234 H447Z" fill={fill('#fbf3df')} strokeWidth="2" />
          {scene.decoration === 2 && <g fill={fill('#b6bd97')} strokeWidth="2"><path d="M437 179 H445 V224 H437Z M503 179 H511 V224 H503Z" /><path d="M439 187 H443 M439 195 H443 M505 187 H509 M505 195 H509" strokeWidth="1" /></g>}
          {/* Doorstep and a pot plant beside the door. */}
          <path d="M364 262 H416 V268 H364Z" fill={fill('#d9cfbb')} strokeWidth="2" />
          <path d="M419 249 H435 L432 262 H422Z" fill={fill('#cc8a6a')} strokeWidth="2" />
          <path d="M427 249 Q418 238 421 232 Q427 238 427 249 Q430 234 437 233 Q437 243 427 249" fill={fill('#9fb586')} strokeWidth={FINE} />
        </g>
        {Array.from({ length: stoneCount }, (_, i) => {
          const start = layout.point('cottage', 391, 280);
          const progress = i / (stoneCount - 1);
          const cx = start.x + ((scene.foregroundFlipped ? width * .36 : width * .64) - start.x) * progress + Math.sin(i * 2) * 8;
          const cy = start.y + progress * (95 + dy * .4);
          // A stone that would peek out from under a ground object is left out.
          const hidden = (Object.entries(GROUND) as [keyof typeof GROUND, readonly number[]][]).some(([part, [left, right, top, bottom]]) => {
            const a = layout.point(part, left, top);
            const b = layout.point(part, right, bottom);
            return cx > Math.min(a.x, b.x) - 24 && cx < Math.max(a.x, b.x) + 24 && cy > a.y - 4 && cy < b.y + 10;
          });
          if (hidden) return null;
          return <g key={i}>
            <ellipse cx={cx} cy={cy} rx={12 + progress * 12} ry={4 + progress * 3} fill={fill('#e2dccd')} strokeWidth={FINE} />
            {!outline && <ellipse cx={cx - 2} cy={cy - 1} rx={6 + progress * 6} ry={1.4} fill="#fff" fillOpacity=".55" stroke="none" />}
          </g>;
        })}
        {/* Apple tree: the trunk forks up into the leaves, so no branch floats. */}
        <g transform={transform('tree')}>
          <path d="M80 273 Q90 266 91 238 Q92 206 86 176 L95 173 Q99 182 101 188 Q104 178 113 166 L121 172 Q109 196 110 232 Q111 264 124 273Z" fill={fill('#b39373')} />
          <path d="M99 252 Q101 236 98 222 M108 262 Q106 250 107 242" fill="none" strokeWidth={FINE} />
          <path d={scene.tree === 0 ? 'M44 168 Q21 139 49 121 Q39 91 72 91 Q90 65 117 88 Q153 79 157 112 Q184 130 158 152 Q164 182 130 187 Q106 207 84 186 Q52 195 44 168Z' : 'M35 158 Q25 129 55 116 Q50 88 83 90 Q105 68 130 93 Q160 95 155 123 Q181 145 160 166 Q141 193 113 181 Q83 203 61 181 Q35 182 35 158Z'} fill={fill('#a8bf85')} />
          {!outline && <path d="M62 120 Q60 101 82 103 Q96 86 114 100 Q134 98 136 114 Q118 112 104 120 Q84 112 62 120Z" fill="#c2d4a2" stroke="none" />}
          <g fill="none" strokeWidth={FINE}><path d="M52 150 q5 4 10 2 M140 132 q4 5 10 3 M118 172 q5 3 10 0 M76 172 q4 4 9 2" /></g>
          {[[[67, 141], [130, 153]], [[67, 141], [130, 153], [95, 115], [96, 175]], [[67, 141], [130, 153], [95, 115]]][variant('fruit')].map(([x, y]) => <g key={x + ',' + y} transform={`translate(${x} ${y})`}>
            <path d="M0 -5 Q-11 -10 -10 2 Q-8 13 0 10 Q8 13 10 2 Q11 -10 0 -5Z" fill={fill('#cc7860')} strokeWidth="2" />
            <path d="M0 -5 L2 -11" fill="none" strokeWidth="2" /><path d="M2 -9 Q8 -13 9 -8 Q5 -6 2 -9Z" fill={fill('#9fb586')} strokeWidth="1.2" />
          </g>)}
        </g>
        {/* Birdhouse on its own post, safely between the tree and cottage. */}
        <g transform={transform('birdhouse')}>
          <path d="M232 252 V198 H238 V252" fill={fill('#b39373')} />
          <path d="M215 170 H255 V204 H215Z" fill={fill('#dfb57c')} /><path d="M208 171 L235 149 L262 171Z" fill={fill(ROOFS[(scene.roof + 1) % 4])} />
          {[<circle key="round" cx="235" cy="183" r="8" fill={INK} />,
            <path key="triangle" d="M226 190 L235 175 L244 190Z" fill={INK} />,
            <path key="square" d="M228 176 H242 V190 H228Z" fill={INK} />,
            <path key="heart" d="M235 192 Q224 184 226 178 Q229 172 235 177 Q241 172 244 178 Q246 184 235 192Z" fill={INK} />][variant('birdhouse')]}
          <path d="M227 199 H243" strokeWidth="3" />
          <path d="M224 252 Q235 246 246 252" fill={fill('#9fb586')} strokeWidth={FINE} />
        </g>
        {/* Foreground flower bed, with a butterfly visiting. */}
        <g transform={transform('flower')}>
          <ellipse cx="70" cy="353" rx="43" ry="9" fill={fill('#dcc7a0')} strokeWidth="2" />
          <path d="M66 347 V311" fill="none" />
          <path d="M66 337 Q44 317 46 338 Q56 346 66 343 M66 328 Q86 308 86 328 Q77 337 66 335" fill={fill('#9fb586')} strokeWidth="2" />
          {variant('flower') === 2 ? <g strokeWidth="2">
            <path d="M66 312 Q64 284 84 284" fill="none" />
            {[[66, 296], [77, 287], [88, 296]].map(([x, y]) => <path key={x} d={`M${x - 7} ${y + 8} Q${x - 7} ${y - 4} ${x} ${y - 4} Q${x + 7} ${y - 4} ${x + 7} ${y + 8} L${x + 9} ${y + 11} H${x - 9}Z`} fill={fill('#a9b6dc')} />)}
          </g> : variant('flower') === 0 ? <g transform="translate(66 305)" fill={fill(scene.detail === 0 ? '#edc365' : '#f8e7d1')} strokeWidth="2">{Array.from({ length: scene.detail === 2 ? 6 : 8 }, (_, i) => <ellipse key={i} cy="-12" rx="6" ry="11" transform={`rotate(${i * 360 / (scene.detail === 2 ? 6 : 8)})`} />)}<circle r="8" fill={fill('#a78359')} /></g> : <path d="M47 285 L58 297 L66 282 L74 297 L85 285 Q89 319 66 321 Q43 319 47 285Z" fill={fill('#d9908d')} />}
          {Array.from({ length: scene.flowers }, (_, i) => <g key={i} transform={`translate(${32 + i * 24} 353)`} strokeWidth={FINE}><path d="M0 0 V-10" /><path d="M-6 -12 Q-10 -23 0 -19 Q9 -24 7 -13 Q0 -7 -6 -12Z" fill={fill('#f4e5c1')} /></g>)}
          <g transform="translate(104 284) rotate(14)" strokeWidth={FINE}>
            <path d="M0 0 Q-11 -12 -12 -3 Q-12 4 0 1 Q-9 9 -3 11 Q1 9 0 1" fill={fill('#c7b3d6')} />
            <path d="M0 0 Q11 -12 12 -3 Q12 4 0 1 Q9 9 3 11 Q-1 9 0 1" fill={fill('#c7b3d6')} />
            <path d="M0 -4 V8 M0 -4 L-3 -10 M0 -4 L3 -10" fill="none" />
          </g>
        </g>
        {/* A cat or dog watching the duck. The tail is outlined, not a solid stroke. */}
        <g transform={transform('cat')}><g transform="translate(176 327)">
          {(() => {
            const tail = variant('cat') === 1 ? 'M12 12 Q48 25 43 4 Q39 -7 30 0' : 'M12 12 Q46 13 38 -17 Q34 -28 30 -19';
            return <g><Band d={tail} colour={fur} />
              {variant('cat') === 2 && <path d="M41 -6 L31 -13 V1Z M41 -6 L51 -13 V1Z" fill={fill('#cc7860')} strokeWidth="2" />}
            </g>;
          })()}
          <ellipse cx="0" cy="0" rx="20" ry="24" fill={fur} />
          <path d="M-14 17 Q-15 25 -6 25 Q-1 25 -2 18 M14 17 Q15 25 6 25 Q1 25 2 18" fill={fur} strokeWidth="2" />
          {scene.pet === 'cat' ? <path d="M-20 -26 L-22 -45 L-8 -36 Q0 -40 8 -36 L22 -45 L20 -26 Q19 -10 0 -10 Q-19 -10 -20 -26Z" fill={fur} /> : <g fill={fur}>
            <path d="M-19 -28 Q-24 -41 -10 -39 Q0 -43 13 -38 Q25 -36 20 -23 Q18 -10 0 -10 Q-18 -10 -19 -28Z" />
            <path d="M-16 -36 Q-34 -38 -28 -18 Q-24 -10 -17 -22Z M16 -36 Q33 -38 28 -18 Q23 -10 17 -22Z" fill={fill('#a78359')} />
            <ellipse cy="-19" rx="10" ry="7" fill={fill('#f2dfbd')} strokeWidth="2" />
          </g>}
          {scene.pet === 'cat' && <path d="M-17 -39 L-12 -34 M17 -39 L12 -34" fill="none" strokeWidth={FINE} />}
          {scene.detail === 1 && <path d="M-18 -3 L-9 0 M-19 6 L-10 8 M13 -4 L19 -7 M8 -35 L4 -29 M-4 -35 L-6 -29" fill="none" strokeWidth="2.5" />}
          {scene.detail === 2 && <path d="M-10 12 Q-16 -1 -6 -6 Q6 -9 6 7 L5 19Z" fill={fill('#9f8a74')} stroke="none" />}
          <g fill="none" strokeWidth="1.7"><path d="M-11 -26 l4 1 M7 -25 l4 -1 M-3 -20 L0 -17 L3 -20 M0 -17 V-14" /></g>
          {scene.pet === 'cat' && <path d="M-17 -20 L-29 -23 M-17 -16 L-29 -15 M17 -20 L29 -23 M17 -16 L29 -15" fill="none" strokeWidth="1.2" />}
        </g></g>
        {/* Watering can beside the path. */}
        <g transform={transform('can')}><g transform="translate(290 328)" fill={fill('#8eaeb0')}>
          <path d="M-15 -9 Q-48 -30 -42 -4 Q-39 6 -18 4" fill="none" stroke={INK} strokeWidth="8" />
          <path d="M-15 -9 Q-48 -30 -42 -4 Q-39 6 -18 4" fill="none" stroke={fill('#8eaeb0')} strokeWidth="3" />
          <path d="M8 -3 L31 -25 L36 -20 L19 13Z" />
          <path d="M-22 -15 H17 L22 21 Q0 29 -24 21Z" /><ellipse cx="-2" cy="-15" rx="20" ry="5" />
          {variant('can') !== 1 && <g><path d="M26 -29 L40 -18 L47 -28 L33 -40Z" /><path d="M36 -31 l1 1 M41 -27 l1 1 M38 -24 l1 1" fill="none" strokeWidth="2" /></g>}
          {variant('can') === 2 && <g fill={fill('#c7dfe0')} strokeWidth="2">{[[47, -14], [53, -4], [43, -2]].map(([x, y]) => <path key={x} d={`M${x} ${y - 6} Q${x + 5} ${y + 1} ${x} ${y + 3} Q${x - 5} ${y + 1} ${x} ${y - 6}Z`} />)}</g>}
          <path d="M-17 2 H10" fill="none" stroke={outline ? INK : '#e1eddf'} strokeWidth="2" />
        </g></g>
        {/* Pond and duck; only the duck turns, not the pond or reeds. */}
        <g transform={transform('pond')}>
          <path d="M432 302 Q475 282 535 303 Q575 322 547 350 Q520 369 457 358 Q405 350 415 325 Q419 311 432 302Z" fill={fill('#c7dfe0')} />
          <path d="M430 341 Q452 348 465 342 M502 352 Q529 357 543 341" fill="none" strokeWidth={FINE} />
          <path d="M519 324 Q512 315 523 311 Q539 308 541 320 L530 322 L533 329 Q524 331 519 324Z" fill={fill('#a6bd88')} strokeWidth="2" />
          {variant('duck') === 2 ? <g transform="translate(477 324)" fill={fill('#f4dfa0')}>
            <path d="M-11 -6 L-24 -15 L-19 -2Z M11 -6 L24 -15 L19 -2Z" fill={fill('#dba15d')} strokeWidth="2" />
            <path d="M-15 12 Q-17 -2 -7 -9 Q-1 -14 3 -26 Q8 -14 13 -7 Q18 2 15 12Z" />
            <path d="M3 -20 Q2 -10 -3 -4" fill="none" strokeWidth={FINE} />
            <path d="M-26 15 Q-14 20 -2 16 M2 16 Q14 20 26 14" fill="none" strokeWidth={FINE} />
          </g> : <g transform={`translate(477 324) scale(${variant('duck') === 0 ? 1 : -1} 1)`} fill={fill('#f4dfa0')}>
            <path d="M-23 2 L-31 -6 L-28 9 Q-9 29 17 11 Q25 4 20 -6 L14 -13 Q6 -20 2 -11 L3 0Z" />
            <path d="M17 -10 L30 -6 L18 -3Z" fill={fill('#dba15d')} strokeWidth="2" /><circle cx="13" cy="-9" r="1.8" fill={INK} stroke="none" />
            <path d="M-17 5 Q-7 17 5 6" fill="none" strokeWidth="2" />
            <path d="M-26 20 Q-14 25 -2 21 M8 21 Q18 25 26 19" fill="none" strokeWidth={FINE} />
          </g>}
          <g fill={fill('#b0966a')}><path d="M559 330 V285 M568 334 V295" fill="none" strokeWidth="2" /><rect x="555" y="278" width="8" height="20" rx="4" /><rect x="564" y="287" width="8" height="18" rx="4" /></g>
        </g>
        {/* A few grass marks knit the objects into the same place. */}
        {[[23, 290], [130, 285], [211, 365], [335, 361], [555, 263]].map(([x, y]) => <path key={x} d="M-6 0 L-8 -7 M0 0 V-10 M6 0 L9 -6" transform={`translate(${x / 600 * width} ${y / 390 * height})`} fill="none" strokeWidth={FINE} />)}
      </g>
    </SceneFrame>
  );
}
