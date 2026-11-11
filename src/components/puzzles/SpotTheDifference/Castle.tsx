import { version, type Feature } from './generator';
import { ridge, sceneLayout, star } from './layout';
import SceneFrame, { Band, FAR, FINE, INK, LINE, type SceneProps } from './SceneFrame';
import { Chest, CrownCushion, Frog, Goose, Helmet, Well } from './CastleProps';

const STONE = ['#e2d9c4', '#d9d6cc', '#e6d4c2', '#d6dbc9'];
const ROOFS = ['#c97c62', '#749399', '#a984a0', '#d9ac55'];
const COLOURS = ['#cf8773', '#83a9a7', '#d5af61', '#a39ab6'];
const DARK = '#5e5a50';

/** A wall from x0 to x1 standing on `bottom`, its top battlemented at `top`. */
function battlemented(x0: number, x1: number, top: number, bottom: number, height = 9) {
  const count = Math.max(2, Math.round((x1 - x0) / 13));
  const step = (x1 - x0) / (2 * count - 1);
  const edge = Array.from({ length: 2 * count - 1 }, (_, i) => {
    const y = i % 2 ? top : top - height;
    return `L${x0 + i * step} ${y} L${x0 + (i + 1) * step} ${y}`;
  }).join(' ');
  return `M${x0} ${bottom} ${edge} L${x1} ${bottom}Z`;
}

/** A fairy-tale castle by a pond, with a dragon overhead.
 * The tower's flag, window and gate are three separate changes, like the
 * cottage's chimney, window and door.
 */
export default function Castle(props: SceneProps) {
  const { scene, second, outline, aspect } = props;
  const layout = sceneLayout(aspect, scene);
  const { width, height, dx, dy, transform } = layout;
  const fill = (colour: string) => outline ? '#fff' : colour;
  const v = (key: Feature) => version(scene, key, second);
  const art = (key: Feature) => ({ v: v(key), fill, outline });
  const accent = COLOURS[scene.palette];
  const stone = fill(STONE[scene.palette]);
  const lawn = dy * .48;
  const { at: hill, line: hillLine } = ridge(width, 170 + dy * .3, 12, 2.2);
  const green = fill('#a6bd88');
  return (
    <SceneFrame {...props} layout={layout}>
      <g strokeWidth={LINE}>
        <g transform={scene.backgroundFlipped ? `translate(${width} 0) scale(-1 1)` : undefined}>
          {/* Far hills with a few trees and pointed rooftops of the village. */}
          <path d={`${hillLine} V${260 + lawn} H4Z`} fill={fill('#dce6cc')} stroke="none" />
          <path d={hillLine} fill="none" stroke={FAR} strokeWidth={FINE} />
          <g stroke={FAR} strokeWidth={FINE}>
            {[.04, .14, .24, .6, .7, .93].map((t, i) => {
              const x = t * width;
              const y = hill(x);
              return (i + scene.decoration) % 3 === 0
                ? <path key={t} d={`M${x - 10} ${y + 6} V${y - 8} L${x} ${y - 22} L${x + 10} ${y - 8} V${y + 6}Z`} fill={fill('#e9dccb')} />
                : <g key={t}><path d={`M${x} ${y + 4} V${y - 8}`} /><circle cx={x} cy={y - 16} r={9 + i % 3 * 2} fill={fill('#bccfa6')} /></g>;
            })}
          </g>
          <g transform="translate(52 46)">
            {Array.from({ length: 10 }, (_, i) => <path key={i} d="M0 -25 V-30" transform={`rotate(${i * 36})`} />)}
            <circle r="18" fill={fill('#f4cc69')} />
          </g>
          {[[92 + dx * .1, 104 + dy * .15], [362 + dx * .55, 28 + dy * .1], [540 + dx * .95, 92 + dy * .12]].slice(0, scene.clouds).map(([x, y]) =>
            <path key={x} transform={`translate(${x} ${y}) scale(.6)`} d="M0 20 Q-8 6 7 5 Q9 -12 26 -6 Q42 -18 51 0 Q69 -2 68 13 Q82 23 65 27 H8 Q0 27 0 20Z" fill={fill('#fff')} strokeWidth="3.4" />)}
        </g>
        {/* The near meadow rises over the far hills. */}
        <path d={`M4 ${240 + lawn} Q${width * .2} ${200 + lawn} ${width * .42} ${232 + lawn} Q${width * .7} ${186 + lawn} ${width - 4} ${236 + lawn} V${height - 16} Q${width - 4} ${height - 2} ${width - 19} ${height - 2} H19 Q4 ${height - 2} 4 ${height - 16}Z`} fill={fill('#e4ebce')} stroke="none" />
        <path d={`M4 ${280 + dy * .6} Q${width * .3} ${250 + dy * .6} ${width * .55} ${274 + dy * .6} T${width - 4} ${270 + dy * .6}`} fill="none" stroke={outline ? '#b2b2a4' : '#c9d5b4'} strokeWidth="2" />
        {/* A dragon flying past; what it breathes is the change. */}
        <g transform={transform('kite')}>
          <path d="M240 70 L226 34 L240 44 L248 30 L256 46 L262 64Z" fill={fill('#c98a74')} />
          <path d="M240 66 L238 44 M248 64 L248 36" fill="none" strokeWidth={FINE} />
          <Band d="M222 80 Q204 86 200 98 Q197 106 189 107" colour={green} width={10} />
          <path d="M191 106 L178 101 L183 115Z" fill={green} strokeWidth="2.2" />
          <path d="M232 66 L236 57 L240 65 M246 64 L250 55 L254 64" fill={fill('#e8d9a8')} strokeWidth="2" />
          <path d="M216 82 Q222 64 248 64 Q266 64 270 74 Q262 88 238 88 Q222 88 216 82Z" fill={green} />
          <path d="M226 84 Q244 92 264 79 M236 86 V81 M246 86 V80 M256 83 V78" fill="none" strokeWidth={FINE} />
          <path d="M232 87 l-3 8 M254 85 l3 8" fill="none" />
          <path d="M276 55 L273 44 L282 52Z" fill={fill('#e8d9a8')} strokeWidth="2" />
          <path d="M262 70 Q266 56 278 53 Q290 51 296 59 Q296 66 286 67 Q276 68 270 77Z" fill={green} />
          <circle cx="284" cy="58" r="1.9" fill={INK} stroke="none" />
          <path d="M292 63 Q288 64 285 63" fill="none" strokeWidth={FINE} />
          {v('kite') === 0 && <g fill={fill('#eceae2')} strokeWidth="2">{[[306, 58, 5], [317, 53, 6], [330, 49, 7]].map(([x, y, r]) => <circle key={x} cx={x} cy={y} r={r} />)}</g>}
          {v('kite') === 1 && <g strokeWidth="2">
            <path d="M296 62 Q312 48 332 55 Q323 60 330 66 Q312 74 296 64Z" fill={fill('#eaa35a')} />
            <path d="M299 63 Q310 57 320 61 Q311 66 299 64Z" fill={fill('#f2d27a')} strokeWidth={FINE} />
          </g>}
        </g>
        {/* The castle: a small tower, a gated wall and a tall tower with a flag. */}
        <g transform={transform('cottage')}>
          <path d={scene.style === 0 ? battlemented(342, 382, 150, 262) : 'M342 262 V152 H382 V262Z'} fill={stone} />
          {scene.style === 1 && <path d="M335 153 L362 104 L389 153Z" fill={fill(ROOFS[(scene.palette + 1) % 4])} />}
          {scene.style === 2 && <g><path d="M337 153 Q337 116 362 106 Q387 116 387 153Z" fill={fill(ROOFS[(scene.palette + 1) % 4])} /><path d="M362 106 V98" fill="none" strokeWidth="2.5" /><circle cx="362" cy="95" r="3.5" fill={fill('#e5c25e')} strokeWidth="2" /></g>}
          <path d="M359 170 H365 V186 H359Z" fill={fill(DARK)} strokeWidth="2" />
          {scene.decoration === 0 && <g fill={fill(accent)} strokeWidth="2.2">
            <path d="M347 196 H360 V226 L353.5 220 L347 226Z" /><path d="M364 196 H377 V226 L370.5 220 L364 226Z" />
          </g>}
          {scene.decoration === 1 && <g fill={fill('#9fb586')} strokeWidth={FINE}>
            {[[346, 250], [352, 240], [345, 230], [356, 230], [350, 221]].map(([x, y]) => <path key={x + ',' + y} d={`M${x} ${y} q-5 -7 2 -9 q7 2 2 9Z`} />)}
          </g>}
          <path d={battlemented(382, 460, 186, 262)} fill={stone} />
          <path d="M398 262 V226 Q398 203 421 203 Q444 203 444 226 V262" fill={fill('#cdc6b4')} />
          {[<g key="portcullis">
            <path d="M403 262 V226 Q403 208 421 208 Q439 208 439 226 V262Z" fill={fill(DARK)} />
            <path d="M412 210 V260 M421 208 V260 M430 210 V260 M405 222 H437 M403 238 H439 M403 252 H439" fill="none" stroke={outline ? INK : '#b7b3a6'} strokeWidth="3" />
          </g>,
          <g key="doors">
            <path d="M403 262 V226 Q403 208 421 208 Q439 208 439 226 V262Z" fill={fill('#b08a62')} />
            <path d="M421 208 V262 M412 211 V262 M430 211 V262" fill="none" strokeWidth={FINE} />
            <circle cx="416" cy="238" r="3" fill="none" strokeWidth="2" /><circle cx="426" cy="238" r="3" fill="none" strokeWidth="2" />
          </g>,
          <path key="open" d="M403 262 V226 Q403 208 421 208 Q439 208 439 226 V262Z" fill={fill(DARK)} />][v('door')]}
          <path d="M392 196 h10 M446 200 h8 M388 250 h7 M448 240 h8 M350 140 h9 M368 250 h8" fill="none" strokeWidth={FINE} />
          <path d="M460 262 V118 H512 V262Z" fill={stone} />
          <path d="M456 110 H516 V122 H456Z" fill={stone} strokeWidth="2.5" />
          <path d="M452 112 L486 62 L520 112Z" fill={fill(ROOFS[scene.palette])} />
          {scene.style !== 1 && <path d="M469 100 L486 74 L503 100" fill="none" strokeWidth={FINE} />}
          <path d="M486 62 V30" fill="none" strokeWidth="2.5" />
          <path d={['M486 32 L512 41 L486 50Z', 'M486 32 H514 L506 41 L514 50 H486Z', 'M486 32 Q498 28 508 34 Q518 40 528 36 L522 44 Q512 48 502 44 Q494 42 486 47Z'][v('chimney')]} fill={fill(accent)} />
          {[<path key="slit" d="M483 144 H489 V153 H495 V159 H489 V172 H483 V159 H477 V153 H483Z" fill={fill(DARK)} strokeWidth="2" />,
            <path key="arch" d="M476 170 V154 Q476 144 486 144 Q496 144 496 154 V170Z" fill={fill(DARK)} />,
            <circle key="round" cx="486" cy="158" r="11" fill={fill(DARK)} />][v('window')]}
          <path d="M483 200 H489 V222 H483Z" fill={fill(DARK)} strokeWidth="2" />
          <path d="M466 140 h8 M500 190 h8 M468 238 h9 M498 132 h7" fill="none" strokeWidth={FINE} />
          <path d="M334 262 H520" fill="none" strokeWidth="3" />
        </g>
        {/* A leafy tree with a nest in it: eggs, more eggs, or hatched chicks. */}
        <g transform={transform('tree')}>
          <path d="M82 273 Q92 264 92 236 Q93 206 88 178 L97 175 Q100 186 102 192 Q106 180 115 168 L123 174 Q110 198 111 234 Q112 264 126 273Z" fill={fill('#b39373')} />
          <path d={scene.tree === 0
            ? 'M40 160 Q22 132 48 118 Q42 90 72 92 Q88 70 112 86 Q146 78 152 106 Q180 122 160 150 Q166 180 132 184 Q108 200 86 184 Q50 192 40 160Z'
            : 'M50 176 Q28 160 40 136 Q30 108 56 98 Q64 72 96 78 Q124 66 140 92 Q166 100 160 130 Q174 156 150 172 Q136 194 108 184 Q80 196 50 176Z'} fill={fill('#a8bf85')} />
          {!outline && <path d="M60 116 Q60 100 80 102 Q94 88 112 100 Q130 98 134 112 Q116 110 102 118 Q82 110 60 116Z" fill="#c2d4a2" stroke="none" />}
          <g fill="none" strokeWidth={FINE}><path d="M52 150 q5 4 10 2 M140 140 q4 5 10 3 M118 170 q5 3 10 0 M74 170 q4 4 9 2" /></g>
          <path d="M96 150 L104 140 M114 148 L106 140" fill="none" strokeWidth="3" />
          {v('fruit') === 2
            ? <g>{[[97, 125], [111, 123]].map(([x, y]) => <g key={x}>
              <circle cx={x} cy={y} r="6.5" fill={fill('#e9d9a6')} strokeWidth="2" />
              <path d={`M${x - 3} ${y - 5} L${x} ${y - 13} L${x + 3} ${y - 5}Z`} fill={fill('#e2a35c')} strokeWidth="1.6" />
              <circle cx={x - 2.5} cy={y - 1} r="1.2" fill={INK} stroke="none" /><circle cx={x + 2.5} cy={y - 1} r="1.2" fill={INK} stroke="none" />
            </g>)}</g>
            : <g fill={fill('#e2ecee')} strokeWidth="2">{(v('fruit') === 0 ? [98, 110] : [93, 104, 115]).map(x => <ellipse key={x} cx={x} cy="128" rx="5" ry="7" />)}</g>}
          <path d="M85 131 Q87 145 104 145 Q121 145 123 131Z" fill={fill('#c9a46a')} />
          <path d="M89 136 L100 134 M106 139 L118 135 M92 141 L103 140" fill="none" strokeWidth={FINE} />
        </g>
        {/* A shield on a post, between the tree and the castle. */}
        <g transform={transform('birdhouse')}>
          <path d="M232 252 V160 H238 V252Z" fill={fill('#b39373')} />
          <circle cx="235" cy="156" r="5" fill={fill('#e5c25e')} strokeWidth="2" />
          <path d="M215 166 H255 V186 Q255 204 235 212 Q215 204 215 186Z" fill={fill(COLOURS[(scene.palette + 1) % 4])} />
          {[<path key="cross" d="M231 166 H239 V211 H231Z M215 182 H255 V190 H215Z" fill={fill('#f6edd5')} strokeWidth="2" />,
            <path key="chevron" d="M219 190 L235 176 L251 190 V198 L235 184 L219 198Z" fill={fill('#f6edd5')} strokeWidth="2" />,
            <path key="star" d={star(5, 13, 5.5, 235, 189)} fill={fill('#f6edd5')} strokeWidth="2" />,
            <path key="half" d="M235 166 H255 V186 Q255 204 235 212Z" fill={fill('#f6edd5')} strokeWidth="2" />][v('birdhouse')]}
          <path d="M224 252 Q235 246 246 252" fill={fill('#9fb586')} strokeWidth={FINE} />
        </g>
        <g transform={transform('flower')}><g transform="translate(66 353)">
          {scene.props.flower === 'well' ? <Well {...art('flower')} /> : <Helmet {...art('flower')} accent={COLOURS[(scene.palette + 2) % 4]} />}
        </g></g>
        <g transform={transform('cat')}><g transform="translate(176 351)">
          {scene.props.cat === 'goose' ? <Goose {...art('cat')} /> : <Frog {...art('cat')} />}
        </g></g>
        <g transform={transform('can')}><g transform="translate(290 350)">
          {scene.props.can === 'crown' ? <CrownCushion {...art('can')} accent={COLOURS[(scene.palette + 3) % 4]} /> : <Chest {...art('can')} />}
        </g></g>
        {/* A pond with a swan, followed by none, one or two cygnets. */}
        <g transform={transform('pond')}>
          <path d="M432 302 Q475 282 535 303 Q575 322 547 350 Q520 369 457 358 Q405 350 415 325 Q419 311 432 302Z" fill={fill('#c7dfe0')} />
          <path d="M430 344 Q452 351 465 345 M502 354 Q529 359 543 343" fill="none" strokeWidth={FINE} />
          <ellipse cx="540" cy="316" rx="11" ry="5" fill={fill('#a6bd88')} strokeWidth="2" />
          {[454, 432].slice(0, v('duck')).map(x => <g key={x} transform={`translate(${x} 336)`}>
            <ellipse rx="9" ry="6" fill={fill('#cfcac0')} strokeWidth="2" />
            <circle cx="7" cy="-8" r="4.5" fill={fill('#cfcac0')} strokeWidth="2" />
            <path d="M11 -9 L16 -7.5 L11 -6Z" fill={INK} strokeWidth="1" />
            <circle cx="8" cy="-9" r="1" fill={INK} stroke="none" />
          </g>)}
          <g transform="translate(505 324)" fill={fill('#fbfaf4')}>
            <Band d="M8 -4 Q1 -20 8 -32 Q12 -40 18 -37" colour={fill('#fbfaf4')} width={9} />
            <path d="M-26 2 Q-34 -12 -24 -16 Q-12 -6 4 -6 Q16 -6 16 4 Q12 16 -8 16 Q-24 14 -26 2Z" />
            <path d="M-20 0 Q-8 -10 6 0 Q-6 8 -20 0Z" strokeWidth="2" />
            <circle cx="18" cy="-37" r="5.5" />
            <path d="M22 -39 L31 -35 L22 -33Z" fill={fill('#e2a35c')} strokeWidth="2" />
            <circle cx="18.5" cy="-38.5" r="1.2" fill={INK} stroke="none" />
            <path d="M-26 22 Q-14 27 -2 23 M6 23 Q16 27 24 21" fill="none" strokeWidth={FINE} />
          </g>
          <g fill={fill('#b0966a')}><path d="M559 330 V285 M568 334 V295" fill="none" strokeWidth="2" /><rect x="555" y="278" width="8" height="20" rx="4" /><rect x="564" y="287" width="8" height="18" rx="4" /></g>
        </g>
        {[[23, 290], [130, 285], [211, 365], [335, 361], [380, 290]].map(([x, y]) => <path key={x} d="M-6 0 L-8 -7 M0 0 V-10 M6 0 L9 -6" transform={`translate(${x / 600 * width} ${y / 390 * height})`} fill="none" strokeWidth={FINE} />)}
      </g>
    </SceneFrame>
  );
}
