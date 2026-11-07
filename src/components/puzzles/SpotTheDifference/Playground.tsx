import type { Feature } from './generator';
import { sceneLayout } from './layout';
import SceneFrame, { INK, type SceneProps } from './SceneFrame';

const COLOURS = ['#cf927b', '#8faeab', '#c9ad6c', '#ab9bbb'];

export default function Playground(props: SceneProps) {
  const { scene, second, outline, aspect } = props;
  const layout = sceneLayout(aspect, scene);
  const { width, height, dx, dy, transform } = layout;
  const fill = (colour: string) => outline ? '#fff' : colour;
  const v = (key: Feature) => scene.variants[key] ^ Number(second && scene.changes.includes(key));
  const accent = COLOURS[scene.palette];
  return (
    <SceneFrame {...props} layout={layout} paper="#f9f6eb">
      <path d={`M4 ${229 + dy * .48} Q${width * .25} ${184 + dy * .48} ${width * .5} ${226 + dy * .48} Q${width * .75} ${187 + dy * .48} ${width - 4} ${230 + dy * .48} V${height - 16} Q${width - 4} ${height - 2} ${width - 19} ${height - 2} H19 Q4 ${height - 2} 4 ${height - 16}Z`} fill={fill('#dce5c9')} stroke="none" />
      <path d={`M4 ${280 + dy * .57} Q${width * .3} ${260 + dy * .57} ${width * .6} ${279 + dy * .57} T${width - 4} ${276 + dy * .57} V${height - 16} Q${width - 4} ${height - 2} ${width - 19} ${height - 2} H19 Q4 ${height - 2} 4 ${height - 16}Z`} fill={fill('#e8dcc4')} stroke="none" />
      <g transform={scene.backgroundFlipped ? `translate(${width} 0) scale(-1 1)` : undefined}>
        <g transform="translate(56 49)"><circle r="18" fill={fill('#f0d182')} />{Array.from({ length: 8 }, (_, i) => <path key={i} d="M0 -25 V-30" transform={`rotate(${i * 45})`} />)}</g>
        {Array.from({ length: scene.clouds }, (_, i) => <path key={i} transform={`translate(${335 + i * 80 + dx * (.5 + i * .15)} ${24 + i % 2 * 3}) scale(.75)`} d="M0 17 Q-5 0 10 0 Q13 -17 29 -8 Q44 -17 49 1 Q67 -3 68 17Z" fill={fill('#fffdf5')} strokeWidth="2" />)}
      </g>
      {/* A loose balloon with a long, continuous string and an optional bow. */}
      <g transform={transform('kite')}>
        <ellipse cx="244" cy="67" rx="21" ry="27" fill={fill(accent)} /><path d="M244 94 L240 99 H248Z" fill={fill(accent)} />
        <path d="M244 99 Q232 113 244 123 Q251 130 244 137" fill="none" strokeWidth="1.7" />
        {v('kite') === 0 && <path d="M240 114 L230 107 V120Z M240 114 L250 107 V120Z" fill={fill('#e4bd70')} />}
      </g>
      {/* A roofed play tower, its ladder and a slide that meets the ground. */}
      <g transform={transform('cottage')}>
        <path d="M389 262 V133 H397 V262 M448 262 V133 H456 V262" fill={fill('#b69c78')} />
        <path d="M398 136 H447 V176 H398Z" fill={fill(COLOURS[(scene.palette + 1) % 4])} />
        {v('window') === 0 ? <circle cx="422" cy="156" r="12" fill={fill('#f6edd5')} /> : <path d="M422 143 L435 156 L422 169 L409 156Z" fill={fill('#f6edd5')} />}
        <path d="M386 176 H459 V185 H386Z" fill={fill('#b69c78')} />
        <path d="M352 262 L380 175 M367 262 L395 175" fill="none" strokeWidth="5" />
        <path d="M375 190 H390 M362 232 H377 M355 253 H370" fill="none" strokeWidth="4" />
        {v('door') === 0 && <path d="M368 211 H383" fill="none" strokeWidth="4" />}
        <path d="M450 175 Q478 185 486 219 Q497 247 540 247 H554 V260 H535 Q491 260 474 233 Q459 197 445 194Z" fill={fill(accent)} />
        <path d="M452 183 Q471 192 479 222 Q492 253 539 253 H548" fill="none" strokeWidth="1.5" />
        <path d={scene.style === 1 ? 'M378 135 L394 109 L423 95 L452 109 L468 135Z' : scene.style === 2 ? 'M378 135 Q423 55 468 135Z' : 'M378 135 L423 95 L468 135Z'} fill={fill(COLOURS[(scene.palette + 2) % 4])} />
        <path d="M423 95 V49" fill="none" />
        {v('chimney') === 0 ? <path d="M423 53 H450 V78 H423Z" fill={fill('#dfb867')} /> : <path d="M423 53 L451 66 L423 79Z" fill={fill('#dfb867')} />}
        <path d="M383 264 H402 M443 264 H462 M347 264 H372" fill="none" strokeWidth="3" />
      </g>
      {/* A stable A-frame: both seat variants remain attached to both chains. */}
      <g transform={transform('tree')}>
        <path d="M26 272 L55 124 L78 272 M130 272 L154 124 L179 272" fill="none" strokeWidth="6" />
        <path d="M44 124 H165" fill="none" stroke={outline ? INK : '#a48c6e'} strokeWidth="8" />
        <path d="M85 125 V214 M119 125 V214" fill="none" strokeWidth="2" />
        {v('fruit') === 0 ? <path d="M77 214 H127 V222 H77Z" fill={fill(accent)} /> : <path d="M82 200 H122 V217 Q102 236 82 217Z" fill={fill(accent)} />}
        <circle cx="55" cy="125" r="2" fill={INK} /><circle cx="154" cy="125" r="2" fill={INK} />
        {scene.decoration === 1 && <path d="M33 236 H72 M137 236 H173" fill="none" strokeWidth="3" />}
      </g>
      {/* A climbing dome. Its crossbars stop at the curved outer frame. */}
      <g transform={transform('birdhouse')} fill="none" strokeWidth="3">
        <path d="M196 252 A39 58 0 0 1 274 252 M235 194 V252 M235 194 Q209 215 214 252 M235 194 Q261 215 256 252 M197 240 H273" />
        {v('birdhouse') === 0 && <path d="M201 225 H269" />}
        <path d="M192 253 H278" strokeWidth="4" />
      </g>
      {/* A sand bucket and spade; the motif changes in outline as well as colour. */}
      <g transform={transform('flower')}>
        <path d="M97 331 V302" fill="none" strokeWidth="4" /><path d="M92 288 H102 V297 Q97 306 92 297Z M90 331 H104 V341 Q97 352 90 341Z" fill={fill('#a6bbb0')} />
        <path d="M44 319 H89 L84 353 H49Z" fill={fill(accent)} /><ellipse cx="66" cy="319" rx="23" ry="5" fill={fill('#f0dfb8')} />
        <path d="M46 323 Q66 279 87 323" fill="none" />
        {v('flower') === 0 ? <circle cx="66" cy="337" r="9" fill={fill('#f8ebc9')} /> : <path d="M66 326 L69 333 L77 333 L71 339 L73 347 L66 343 L59 347 L61 339 L55 333 L63 333Z" fill={fill('#f8ebc9')} />}
      </g>
      {/* The toy may be a teddy or bunny; the bow is a separate difference. */}
      <g transform={transform('cat')} fill={fill(scene.detail === 1 ? '#d3c5af' : '#d4b18b')}>
        <ellipse cx="149" cy="328" rx="8" ry="12" transform="rotate(25 149 328)" /><ellipse cx="203" cy="328" rx="8" ry="12" transform="rotate(-25 203 328)" />
        <ellipse cx="176" cy="332" rx="21" ry="20" /><ellipse cx="163" cy="350" rx="10" ry="6" /><ellipse cx="189" cy="350" rx="10" ry="6" />
        {scene.playToy === 'bunny' ? <g><ellipse cx="165" cy="297" rx="7" ry="15" transform="rotate(-12 165 297)" /><ellipse cx="187" cy="297" rx="7" ry="15" transform="rotate(12 187 297)" /></g> : <g><circle cx="162" cy="294" r="8" /><circle cx="190" cy="294" r="8" /></g>}
        <circle cx="176" cy="310" r="19" /><ellipse cx="176" cy="316" rx="10" ry="7" fill={fill('#f2e2c7')} />
        <circle cx="169" cy="307" r="1.8" fill={INK} /><circle cx="183" cy="307" r="1.8" fill={INK} /><path d="M173 312 H179 L176 315Z" fill={INK} /><path d="M176 315 V318 M172 320 Q176 323 180 320" fill="none" strokeWidth="1.4" />
        {v('cat') === 0 && <g fill={fill(COLOURS[(scene.palette + 2) % 4])}><path d="M176 331 L165 325 V338Z M176 331 L187 325 V338Z" /><circle cx="176" cy="331" r="3" /></g>}
      </g>
      {/* Scooter or tricycle: both can carry the same little handlebar bell. */}
      <g transform={transform('can')}>
        <path d="M323 347 L308 301 M299 301 H319" fill="none" strokeWidth="4" />
        {scene.playRide === 'tricycle' ? <g>
          <circle cx="253" cy="338" r="7" fill={fill('#8e9c93')} /><path d="M253 338 L260 347" fill="none" strokeWidth="3" />
          <path d="M260 347 L276 322 L292 347 H260 M276 322 H298 L323 347 M292 347 L306 314" fill="none" strokeWidth="4" />
          <path d="M269 318 H286" strokeWidth="5" /><path d="M291 344 L286 350 M286 350 H280" fill="none" />
        </g> : <path d="M260 342 H310 L316 332" fill="none" strokeWidth="5" />}
        <circle cx="260" cy="347" r="9" fill={fill('#8e9c93')} /><circle cx="323" cy="347" r={scene.playRide === 'tricycle' ? 12 : 9} fill={fill('#8e9c93')} />
        <circle cx="260" cy="347" r="3" fill={fill('#f2deb1')} /><circle cx="323" cy="347" r="3" fill={fill('#f2deb1')} />
        {v('can') === 0 && <g><path d="M319 301 V296" fill="none" /><path d="M313 296 A6 6 0 0 1 325 296Z" fill={fill('#e0ba68')} /></g>}
      </g>
      {/* A timber sandpit anchors the foreground, independent of the play tower. */}
      <g transform={transform('pond')}>
        <path d="M414 319 L536 301 L567 354 L443 374Z" fill={fill('#b69e7c')} />
        <path d="M423 324 L531 309 L555 350 L448 366Z" fill={fill('#efddb0')} />
        <path d="M490 323 V282" fill="none" />
        {v('duck') === 0 ? <path d="M490 282 L515 291 L490 300Z" fill={fill(accent)} /> : <path d="M490 282 H513 V300 H490Z" fill={fill(accent)} />}
        <path d="M460 350 V322 H469 V329 H478 V322 H502 V329 H511 V322 H520 V350Z" fill={fill('#d3b17c')} />
        <path d="M483 350 V340 Q490 330 497 340 V350 M455 353 H525" fill="none" />
        {scene.decoration === 2 && <path d="M435 340 L441 337 M541 341 L545 345 M453 360 L459 359" strokeWidth="1.3" />}
      </g>
      {[[24, 290], [128, 370], [352, 360], [575, 290]].map(([x, y]) => <path key={x} transform={`translate(${x / 600 * width} ${y / 390 * height})`} d="M-5 0 L-7 -6 M0 0 V-8 M5 0 L7 -6" fill="none" strokeWidth="1.5" />)}
    </SceneFrame>
  );
}
