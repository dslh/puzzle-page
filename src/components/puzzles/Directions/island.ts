import type { ArtName } from './art';
import type { Point, SeededRandom } from './generator';

/*
 * The treasure island: which squares are sea, forest, mountain or a landmark,
 * and the icons that draw them. Every one of those squares is blocked - only
 * the blank sand can be walked on - so the map reads the same way whatever is
 * drawn on it.
 */

/** One icon on the map, centred at (x, y) and scaled to fit `size`, all in mm. */
export interface Stamp {
  icon: ArtName;
  x: number;
  y: number;
  size: number;
}

export interface Island {
  sea: Set<string>;
  /** Every square that can't be walked on: sea, terrain and landmarks. */
  blocked: Set<string>;
  /** What stands on each blocked land square. */
  features: Map<string, Feature>;
}

type Feature = 'forest' | 'mountain' | { landmark: ArtName };

/** Share of the free land squares that get trees or mountains. */
const TERRAIN_DENSITY = 0.3;
const LANDMARKS: ArtName[] = ['hut', 'tent', 'skullRock', 'stones', 'campfire', 'well', 'cave'];
/** Only by the sea. */
const COASTAL_LANDMARKS: ArtName[] = ['lighthouse'];
const MOUNTAINS: ArtName[] = ['rocks', 'mountains', 'peaks', 'rocksTall', 'rocksLow'];

const key = (p: Point) => `${p.x},${p.y}`;
const NEIGHBOURS = [
  { x: 0, y: -1 },
  { x: 1, y: 0 },
  { x: 0, y: 1 },
  { x: -1, y: 0 },
];

/**
 * Lays out the island around a route. `keepClear` squares (the route) stay
 * walkable sand; `landmarks` squares each get a landmark, all different.
 */
export function buildIsland(
  rng: SeededRandom,
  cols: number,
  rows: number,
  keepClear: Set<string>,
  landmarks: Point[]
): Island {
  const inMap = (p: Point) => p.x >= 0 && p.y >= 0 && p.x < cols && p.y < rows;
  const onEdge = (p: Point) => p.x === 0 || p.y === 0 || p.x === cols - 1 || p.y === rows - 1;
  const features = new Map<string, Feature>();
  const sea = new Set<string>();
  const taken = (k: string) => keepClear.has(k) || sea.has(k) || features.has(k);

  // Landmarks first: in follow mode they mark where the usual mistakes end
  const names = rng.shuffle(LANDMARKS);
  landmarks.forEach((p, i) => {
    const coastal = onEdge(p) && rng.next() < 0.3;
    features.set(key(p), { landmark: coastal ? COASTAL_LANDMARKS[0] : names[i % names.length] });
  });

  // Bays: runs of sea squares eaten in from the edge
  const edgeSquares: Point[] = [];
  for (let y = 0; y < rows; y++) {
    for (let x = 0; x < cols; x++) if (onEdge({ x, y })) edgeSquares.push({ x, y });
  }
  const bayCount = Math.round((cols * rows) / 12);
  // A corner bay gives the compass somewhere to sit
  const corners = rng.shuffle([
    { x: 0, y: 0 },
    { x: cols - 1, y: 0 },
    { x: 0, y: rows - 1 },
    { x: cols - 1, y: rows - 1 },
  ]);
  const corner = cols >= 5 && rows >= 5 ? corners.find(c => !taken(key(c))) : undefined;
  const seeds = [...(corner ? [corner] : []), ...rng.shuffle(edgeSquares)];
  for (let b = 0, s = 0; b < bayCount && s < seeds.length; s++) {
    let p = seeds[s];
    if (taken(key(p))) continue;
    b++;
    const size = rng.nextIntRange(1, 4);
    for (let i = 0; i < size; i++) {
      sea.add(key(p));
      const next = rng.shuffle(NEIGHBOURS)
        .map(d => ({ x: p.x + d.x, y: p.y + d.y }))
        .find(q => inMap(q) && !taken(key(q)));
      if (!next) break;
      p = next;
    }
  }

  // Terrain in clumps: forests spread any way, mountains tend to run in a line
  const free: Point[] = [];
  for (let y = 0; y < rows; y++) {
    for (let x = 0; x < cols; x++) if (!taken(key({ x, y }))) free.push({ x, y });
  }
  const target = Math.round(free.length * TERRAIN_DENSITY);
  let placed = 0;
  for (const start of rng.shuffle(free)) {
    if (placed >= target) break;
    if (taken(key(start))) continue;
    const kind = rng.next() < 0.6 ? 'forest' : 'mountain';
    const size = Math.min(target - placed, rng.nextIntRange(1, kind === 'forest' ? 4 : 3));
    const heading = rng.pick(NEIGHBOURS);
    let p = start;
    for (let i = 0; i < size; i++) {
      features.set(key(p), kind);
      placed++;
      const options = (kind === 'mountain' && rng.next() < 0.7 ? [heading] : rng.shuffle(NEIGHBOURS))
        .map(d => ({ x: p.x + d.x, y: p.y + d.y }))
        .filter(q => inMap(q) && !taken(key(q)));
      if (options.length === 0) break;
      p = options[0];
    }
  }

  return { sea, blocked: new Set([...sea, ...features.keys()]), features };
}

/**
 * The icons that draw the island, plus the start and (if shown) the goal.
 * Edge squares lose their outer part to the sea strip, so their icons are
 * pulled inward and shrunk to stay on the sand.
 */
export function stampIsland(
  rng: SeededRandom,
  island: Island,
  cols: number,
  rows: number,
  cellMm: number,
  start: Point,
  goal: Point | undefined
): Stamp[] {
  const stamps: Stamp[] = [];
  const nearSea = (p: Point) =>
    p.x === 0 || p.y === 0 || p.x === cols - 1 || p.y === rows - 1 ||
    NEIGHBOURS.some(d => island.sea.has(key({ x: p.x + d.x, y: p.y + d.y })));

  /** The sand in a square, in squares: [x0, y0, x1, y1]. */
  const sand = (p: Point) => [
    p.x + (p.x === 0 ? 0.28 : 0.04),
    p.y + (p.y === 0 ? 0.28 : 0.04),
    p.x + 1 - (p.x === cols - 1 ? 0.28 : 0.04),
    p.y + 1 - (p.y === rows - 1 ? 0.28 : 0.04),
  ];
  const jitter = (amount: number) => (rng.next() - 0.5) * 2 * amount;

  /** One icon filling `fill` of the square's sand, nudged a little. */
  const single = (p: Point, icon: ArtName, fill: number, nudge = 0.04) => {
    const [x0, y0, x1, y1] = sand(p);
    const size = Math.min(x1 - x0, y1 - y0) * fill;
    stamps.push({
      icon,
      x: ((x0 + x1) / 2 + jitter(nudge)) * cellMm,
      y: ((y0 + y1) / 2 + jitter(nudge)) * cellMm,
      size: size * cellMm,
    });
  };

  // Sea: waves everywhere, the compass in a corner and a ship in another bay
  const seaSquares = [...island.sea].map(k => {
    const [x, y] = k.split(',').map(Number);
    return { x, y };
  });
  const isCorner = (p: Point) => (p.x === 0 || p.x === cols - 1) && (p.y === 0 || p.y === rows - 1);
  const compass = seaSquares.find(isCorner);
  const ship = rng.shuffle(seaSquares).find(p => p !== compass);
  for (const p of seaSquares) {
    const icon: ArtName = p === compass ? 'compass' : p === ship ? 'ship' : 'waves';
    stamps.push({
      icon,
      x: (p.x + 0.5) * cellMm,
      y: (p.y + 0.5) * cellMm,
      size: cellMm * (icon === 'waves' ? 0.75 : 0.8),
    });
  }

  for (const [k, feature] of island.features) {
    const [x, y] = k.split(',').map(Number);
    const p = { x, y };
    if (feature === 'mountain') {
      single(p, rng.pick(MOUNTAINS), 1);
    } else if (feature === 'forest') {
      const palms = nearSea(p);
      const tree = (): ArtName => (palms ? rng.pick(['palm', 'palmLarge'] as ArtName[]) : rng.pick(['pine', 'pineTall'] as ArtName[]));
      const [x0, y0, x1, y1] = sand(p);
      const w = x1 - x0;
      const h = y1 - y0;
      const layout = rng.nextInt(3);
      if (layout === 0) {
        single(p, palms ? 'palmLarge' : 'pines', 1);
      } else {
        // Two or three trees, overlapping a little
        const spots = layout === 2
          ? [[0.28, 0.3, 0.58], [0.74, 0.34, 0.58], [0.5, 0.7, 0.62]]
          : [[0.3, 0.36, 0.72], [0.7, 0.64, 0.72]];
        for (const [fx, fy, fs] of spots) {
          stamps.push({
            icon: tree(),
            x: (x0 + fx * w + jitter(0.03)) * cellMm,
            y: (y0 + fy * h + jitter(0.03)) * cellMm,
            size: Math.min(w, h) * fs * cellMm,
          });
        }
      }
    } else {
      single(p, feature.landmark, 0.85);
    }
  }

  single(start, 'flag', 0.8, 0);
  if (goal) single(goal, 'chest', 0.85, 0);
  return stamps;
}
