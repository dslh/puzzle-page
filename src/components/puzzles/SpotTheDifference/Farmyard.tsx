import type { Feature } from './generator';
import { ridge, sceneLayout } from './layout';
import SceneFrame, { Band, Birds, FAR, FINE, INK, LINE, type SceneProps } from './SceneFrame';

const PAINT = ['#bc7969', '#8ca8a0', '#c39b62', '#a195b0'];
const WOOD = '#b39a75';

export default function Farmyard(props: SceneProps) {
  const { scene, second, outline, aspect } = props;
  const layout = sceneLayout(aspect, scene);
  const { width, height, dx, dy, transform } = layout;
  const fill = (colour: string) => outline ? '#fff' : colour;
  const v = (key: Feature) => scene.variants[key] ^ Number(second && scene.changes.includes(key));
  const accent = PAINT[scene.palette];
  const far = ridge(width, 146 + dy * .3, 12, 2.2);
  return (
    <SceneFrame {...props} layout={layout} paper="#faf6e9">
      <g strokeWidth={LINE}>
        <g transform={scene.backgroundFlipped ? `translate(${width} 0) scale(-1 1)` : undefined}>
          {/* Far fields: a hedgerow line, round hay bales and a few trees. */}
          <path d={`${far.line} V${260 + dy * .48} H4Z`} fill={fill('#e6e4bf')} stroke="none" />
          <path d={far.line} fill="none" stroke={FAR} strokeWidth={FINE} />
          {[.07, .16, .62, .7, .9].map((t, i) => {
            const x = t * width;
            const y = far.at(x);
            return (i + scene.decoration) % 2
              ? <g key={t} stroke={FAR} strokeWidth={FINE}><path d={`M${x} ${y + 2} V${y - 12}`} /><circle cx={x} cy={y - 19} r="12" fill={fill('#bccda4')} /></g>
              : <g key={t} stroke={FAR} strokeWidth={FINE} transform={`translate(${x} ${y + 9})`}><circle r="7" fill={fill('#e2c98a')} /><path d="M0 -3 A3 3 0 1 1 -3 0" fill="none" /></g>;
          })}
          {Array.from({ length: scene.clouds }, (_, i) => <path key={i} transform={`translate(${340 + i * 80 + dx * (.5 + i * .15)} ${38 + i % 2 * 14 + dy * .2}) scale(.8)`} d="M0 15 Q-6 0 10 0 Q12 -17 28 -9 Q43 -18 49 0 Q69 -2 67 15Z" fill={fill('#fffdf5')} strokeWidth="2.2" />)}
          <Birds x={150 + dx * .2} y={24 + dy * .22} />
        </g>
        {/* Nearer fields, then a fenced yard shared by all the grounded objects. */}
        <path d={`M4 ${225 + dy * .48} Q${width * .24} ${166 + dy * .48} ${width * .5} ${220 + dy * .48} Q${width * .76} ${178 + dy * .48} ${width - 4} ${221 + dy * .48} V${height - 16} Q${width - 4} ${height - 2} ${width - 19} ${height - 2} H19 Q4 ${height - 2} 4 ${height - 16}Z`} fill={fill('#dce5c1')} stroke="none" />
        <path d={`M4 ${274 + dy * .6} Q${width * .45} ${244 + dy * .6} ${width - 4} ${273 + dy * .6} V${height - 16} Q${width - 4} ${height - 2} ${width - 19} ${height - 2} H19 Q4 ${height - 2} 4 ${height - 16}Z`} fill={fill('#e9dbba')} stroke="none" />
        <path d={`M4 ${274 + dy * .6} Q${width * .45} ${244 + dy * .6} ${width - 4} ${273 + dy * .6}`} fill="none" stroke={outline ? '#b2b2a4' : '#d6c69f'} strokeWidth="2" />
        <g transform={transform('kite')}><g transform="translate(244 96)">
          {v('kite') === 0 && Array.from({ length: 10 }, (_, i) => <path key={i} transform={`rotate(${i * 36})`} d="M0 -26 V-33" fill="none" />)}
          <circle r="19" fill={fill('#efd07d')} /><circle cx="-6" cy="-3" r="1.5" fill={INK} stroke="none" /><circle cx="6" cy="-3" r="1.5" fill={INK} stroke="none" /><path d="M-7 5 Q0 11 7 5" fill="none" strokeWidth="1.7" />
        </g></g>
        <g transform={`translate(0 ${dy * .48})`} fill={fill('#f2e8d0')} strokeWidth="2.2">
          <path d={`M5 227 H${width - 5} V235 H5Z M5 247 H${width - 5} V255 H5Z`} />
          {Array.from({ length: Math.ceil(width / 48) }, (_, i) => <path key={i} d={`M${18 + i * 48} 259 V218 l5 -5 5 5 V259Z`} />)}
        </g>
        {/* Barn fittings stay attached when the barn moves or changes size. */}
        <g transform={transform('cottage')}>
          <path d="M343 163 H530 V262 H343Z" fill={fill(accent)} />
          {!outline && <path d="M343 166 H530 V176 H343Z" fill="#000" fillOpacity=".08" stroke="none" />}
          <path d={scene.style === 1 ? 'M329 165 L367 120 L435 99 L503 120 L544 165Z' : 'M329 165 L435 101 L544 165Z'} fill={fill('#8e9d92')} />
          <path d={scene.style === 1 ? 'M367 120 H503' : 'M360 147 L435 103 L510 147'} fill="none" strokeWidth={FINE} />
          <path d="M351 177 V253 M361 177 V253 M437 177 V253 M447 177 V253 M508 177 V253 M520 177 V253" fill="none" strokeWidth={FINE} />
          <path d="M364 262 V198 H426 V262Z" fill={fill('#f4dfb3')} /><path d="M395 199 V261 M365 199 L394 260 M365 260 L394 199" fill="none" strokeWidth="2.2" />
          {v('door') === 0 && <path d="M398 201 L423 259 M398 259 L423 201" fill="none" strokeWidth="2.2" />}
          <path d="M358 264 H432" strokeWidth="4" />
          {v('window') === 0 ? <circle cx="476" cy="203" r="20" fill={fill('#cee1db')} /> : <rect x="456" y="183" width="40" height="40" fill={fill('#cee1db')} />}
          <path d="M456 203 H496 M476 183 V223" fill="none" strokeWidth="2" />
          <path d="M452 227 H500 V232 H452Z" fill={fill('#f4dfb3')} strokeWidth="2" />
          <path d={`M473 ${scene.style === 1 ? 104 : 116} V78`} fill="none" strokeWidth="2.2" />
          <g transform={v('chimney') ? 'translate(946 0) scale(-1 1)' : undefined}>
            <path d="M452 93 H496 M487 84 L498 93 L487 102" fill="none" strokeWidth="2.2" />
            <path d="M452 86 L462 93 L452 100Z" fill={fill('#e0bc70')} strokeWidth="2" />
          </g>
          {scene.decoration === 2 && <path d="M422 158 V139 Q435 121 448 139 V158Z" fill={fill('#f4dfb3')} />}
          {/* A robin on the roof and a hay bale by the wall: company, never a change. */}
          <g transform={`translate(388 ${scene.style === 1 ? 114 : 128})`} strokeWidth={FINE}>
            <path d="M-9 -2 L-15 -6 L-13 1Z" fill={fill('#8b7a66')} />
            <ellipse cx="0" cy="-3" rx="10" ry="7" fill={fill('#8b7a66')} /><ellipse cx="3" cy="-1" rx="5" ry="4" fill={fill('#d9866a')} stroke="none" />
            <circle cx="7" cy="-9" r="5" fill={fill('#8b7a66')} /><path d="M12 -9 L16 -8 L12 -6Z" fill={fill('#e0bc70')} /><circle cx="8" cy="-10" r="1" fill={INK} stroke="none" />
          </g>
          <g transform="translate(316 252)">
            <path d="M-20 10 V-8 Q-20 -14 -14 -14 H14 Q20 -14 20 -8 V10Z" fill={fill('#e7cf8e')} />
            <path d="M-20 -2 H20 M-12 -14 V10 M10 -14 V10" fill="none" strokeWidth={FINE} />
          </g>
        </g>
        {/* A compact orchard tree; the trunk forks up into the leaves. */}
        <g transform={transform('tree')}>
          <path d="M82 273 Q91 266 92 238 Q93 206 87 176 L96 173 Q100 182 102 188 Q105 178 114 166 L122 172 Q110 196 111 232 Q112 264 124 273Z" fill={fill('#b29370')} />
          <path d="M100 252 Q102 236 99 222" fill="none" strokeWidth={FINE} />
          <path d={scene.tree ? 'M36 165 Q22 135 48 119 Q43 89 75 91 Q99 65 123 89 Q156 82 161 116 Q185 135 161 160 Q163 188 132 188 Q100 209 76 187 Q47 198 36 165Z' : 'M37 159 Q20 125 52 112 Q46 81 79 86 Q102 63 125 89 Q160 86 157 117 Q184 136 160 164 Q151 193 122 185 Q92 207 72 185 Q43 190 37 159Z'} fill={fill(scene.decoration === 1 ? '#b5bf87' : '#a7bc87')} />
          {!outline && <path d="M62 116 Q60 98 82 100 Q96 84 114 97 Q134 95 136 111 Q118 109 104 117 Q84 109 62 116Z" fill="#c4d3a2" stroke="none" />}
          <g fill="none" strokeWidth={FINE}><path d="M50 150 q5 4 10 2 M142 136 q4 5 10 3 M117 174 q5 3 10 0" /></g>
          {(v('fruit') === 0 ? [[68, 144], [130, 155]] : [[68, 144], [130, 155], [102, 115], [99, 179]]).map(([x, y]) => <g key={x} transform={`translate(${x} ${y})`}>
            <path d="M0 -5 Q-12 -10 -10 3 Q-7 14 0 10 Q8 14 10 3 Q12 -10 0 -5Z" fill={fill('#d08a68')} strokeWidth="2" /><path d="M0 -5 L2 -12" fill="none" strokeWidth="2" />
          </g>)}
        </g>
        {/* A scarecrow guards the vegetable rows. Only its hat changes. */}
        <g transform={transform('birdhouse')}>
          <path d="M202 248 Q234 234 269 248 L272 257 Q236 244 198 258Z" fill={fill('#c5ad89')} strokeWidth="2" />
          {[209, 257].map(x => <path key={x} d={`M${x} 249 v-8 m0 3 l-7 -7 m7 7 l7 -8`} fill="none" strokeWidth={FINE} />)}
          <path d="M232 251 V180 H238 V251" fill={fill(WOOD)} strokeWidth="2.2" />
          <path d="M226 218 L222 240 H231 L235 224 L239 240 H248 L244 218Z" fill={fill('#8ea3b5')} strokeWidth="2.2" />
          <Band d="M207 197 H263" colour={WOOD} width={9} />
          <path d="M224 192 L208 194 L208 203 L224 203Z M246 192 L262 194 L262 203 L246 203Z" fill={fill(PAINT[(scene.palette + 1) % 4])} strokeWidth="2.2" />
          <path d="M224 192 H246 L250 220 H220Z" fill={fill(PAINT[(scene.palette + 1) % 4])} strokeWidth="2.2" />
          <path d="M229 205 H237 V212 H229Z" fill={fill('#e7cf8e')} strokeWidth={FINE} />
          <path d="M208 196 L201 192 M208 200 L200 201 M262 196 L269 192 M262 200 L270 201 M226 240 L224 245 M243 240 L246 245" fill="none" strokeWidth={FINE} />
          <circle cx="235" cy="182" r="12" fill={fill('#efcf94')} /><circle cx="231" cy="181" r="1.3" fill={INK} stroke="none" /><circle cx="239" cy="181" r="1.3" fill={INK} stroke="none" /><path d="M230 187 Q235 191 240 187" fill="none" strokeWidth={FINE} />
          <path d={v('birdhouse') === 0 ? 'M222 172 L226 153 H244 L248 172Z' : 'M222 172 L235 149 L248 172Z'} fill={fill('#d5b373')} /><path d="M216 173 H254" strokeWidth="4" />
        </g>
        {/* A harvest basket; the extra vegetable changes shape with the crop. */}
        <g transform={transform('flower')}>
          <path d="M31 326 Q66 319 101 326 L94 353 H38Z" fill={fill('#d1af77')} />
          <Band d="M39 327 Q38 288 66 288 Q95 288 94 327" colour={fill('#d1af77')} width={9} />
          {[50, 80, ...(v('flower') === 0 ? [65] : [])].map((x, i) => <g key={x} transform={`translate(${x} ${i === 2 ? 303 : 319})`} strokeWidth="2.2">
            {scene.detail === 1 ? <g><path d="M-8 -4 L0 13 L8 -4Z" fill={fill('#d5a065')} /><path d="M0 -4 V-16 M0 -6 L-7 -13 M0 -6 L7 -13" fill="none" strokeWidth={FINE} /></g> : <g><circle r="10" fill={fill('#d5b1a0')} /><path d="M0 -9 V-19 M0 -12 L-7 -17 M0 -12 L7 -17" fill="none" strokeWidth={FINE} /></g>}
          </g>)}
          <path d="M35 331 Q66 340 98 331 L94 353 H38Z" fill={fill('#d1af77')} /><path d="M40 341 H94 M49 337 L51 351 M65 338 V352 M81 337 L79 351" fill="none" strokeWidth={FINE} />
        </g>
        {/* A sheep or pig, with the same clear tail difference for either animal. */}
        <g transform={transform('cat')}>
          {v('cat') === 0 && <path d="M202 330 Q218 316 221 328 Q222 340 211 334" fill="none" strokeWidth="3" />}
          {v('cat') === 1 && <path d="M202 330 L219 323" fill="none" strokeWidth="3" />}
          {[156, 166, 186, 196].map(x => <rect key={x} x={x} y="338" width="8" height="17" rx="2" fill={fill(scene.livestock === 'sheep' ? '#7f776a' : '#d9a194')} strokeWidth="2.2" />)}
          {scene.livestock === 'sheep' ? <g>
            <path d="M152 313 Q149 303 160 304 Q167 294 177 302 Q190 296 195 307 Q207 307 205 319 Q215 329 203 337 Q202 349 190 346 Q179 354 170 346 Q156 350 153 339 Q142 336 148 326 Q141 317 152 313Z" fill={fill('#f5ecd8')} />
            <path d="M162 318 q4 -4 8 0 M180 312 q4 -4 8 0 M186 330 q4 -4 8 0 M168 334 q4 -4 8 0" fill="none" strokeWidth={FINE} />
            <path d="M143 315 L134 307 Q134 298 145 305 L151 310" fill={fill('#7f776a')} strokeWidth="2.2" />
            <path d="M141 313 Q147 307 155 313 L155 334 Q148 344 140 333Z" fill={fill('#7f776a')} strokeWidth="2.2" /><circle cx="145" cy="319" r="1.8" fill="#fff" stroke="none" />
          </g> : <g fill={fill('#d9a194')}>
            <ellipse cx="178" cy="329" rx="28" ry="20" /><path d="M146 318 L142 300 L154 309 L163 301 L164 320Z" strokeWidth="2.2" />
            <ellipse cx="151" cy="325" rx="17" ry="18" /><ellipse cx="140" cy="329" rx="9" ry="7" fill={fill('#ebbcac')} strokeWidth="2.2" /><path d="M137 327 V330 M142 327 V330" strokeWidth={FINE} /><circle cx="151" cy="319" r="1.8" fill={INK} stroke="none" />
          </g>}
        </g>
        {/* Wheelbarrow and an optional spade; no floating or disconnected tools. */}
        <g transform={transform('can')}>
          {v('can') === 0 && <g><Band d="M290 325 V292" colour={fill(WOOD)} width={8} /><path d="M283 279 H297 V287 Q290 298 283 287Z" fill={fill('#b1bcb0')} strokeWidth="2.2" /></g>}
          <Band d="M310 321 L333 307 M296 334 L309 353" colour={fill(WOOD)} width={8} />
          <path d="M268 332 L268 345" fill="none" strokeWidth="4" />
          <path d="M251 316 H315 L305 338 H267Z" fill={fill(PAINT[(scene.palette + 1) % 4])} /><path d="M258 322 H310" fill="none" strokeWidth={FINE} />
          <circle cx="268" cy="345" r="10" fill={fill('#89958b')} /><circle cx="268" cy="345" r="3" fill={fill('#e4d2a8')} strokeWidth="2" />
        </g>
        {/* Tractor: the large rear wheel has four or six visible spokes. */}
        <g transform={transform('pond')}>
          <path d="M441 314 V289 H487 V322 M438 285 H492" fill={fill(accent)} strokeWidth="4" />
          <path d="M451 294 H478 V315 H451Z" fill={fill('#d1e2db')} strokeWidth="2.2" /><path d="M465 295 V314" fill="none" strokeWidth={FINE} />
          <path d="M513 317 V294 H520 V317" fill={fill('#8e998f')} strokeWidth="2.2" />
          <path d="M436 318 H536 V340 H431Z" fill={fill(accent)} /><path d="M501 325 H524 M501 331 H524" fill="none" strokeWidth={FINE} /><path d="M537 332 H546" strokeWidth="5" />
          <circle cx="529" cy="348" r="17" fill={fill('#7d8980')} /><circle cx="529" cy="348" r="8" fill={fill('#e2c788')} strokeWidth="2.2" />
          <circle cx="447" cy="342" r="26" fill={fill('#7d8980')} /><circle cx="447" cy="342" r="17" fill={fill('#e2c788')} strokeWidth="2.2" />
          <g transform="translate(447 342)" fill="none" strokeWidth="2">
            {Array.from({ length: v('duck') === 0 ? 4 : 6 }, (_, i) => <path key={i} d="M0 -4 V-16" transform={`rotate(${i * 360 / (v('duck') === 0 ? 4 : 6)})`} />)}
          </g><circle cx="447" cy="342" r="4" fill={fill('#b09b6e')} strokeWidth="2" />
        </g>
        {[[24, 288], [126, 369], [352, 361], [574, 300]].map(([x, y]) => <path key={x} transform={`translate(${x / 600 * width} ${y / 390 * height})`} d="M-5 0 L-7 -6 M0 0 V-8 M5 0 L7 -6" fill="none" strokeWidth={FINE} />)}
      </g>
    </SceneFrame>
  );
}
