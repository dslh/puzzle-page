import { SeededRandom } from '../../../utils/random';
import { PICTURES, type Picture } from './pictures';

export type ShapeLevel = 'easy' | 'medium' | 'hard';
export type HelpLevel = 'dotted' | 'corners' | 'none';
export type MirrorLine = 'vertical' | 'horizontal';
export type Subject = 'shape' | 'picture';

/** All layout in mm. The component draws with the same numbers. */
export const LAYOUT = {
  padding: 5,
  /** Least gap between grid dots; big puzzles spread them wider instead of adding more. */
  spacing: 10,
  /** Most dots out from the mirror line on each side, and along it. */
  maxOut: 6,
  maxAlong: 13,
  /** How far the dashed mirror line runs past the grid at each end. */
  mirrorOverhang: 4,
  /** Gap between the dots of the dotted answer. */
  traceGap: 2.5,
};

export type Point = [number, number];

export interface DrawTheOtherHalfPuzzle {
  width: number;
  height: number;
  spacing: number;
  /** Every grid dot, both sides. */
  dots: Point[];
  mirror: [Point, Point];
  /** The half that is drawn: for a shape, one line from the mirror line and back to it. */
  given: Point[][];
  /** The same lines mirrored: what the child draws. */
  answer: Point[][];
  /** Every corner of the answer off the mirror line, once each. */
  corners: Point[];
  /** Which picture, if it is one. */
  picture?: string;
}

/**
 * Grid points as [out, along]: dots out from the mirror line (0 is on it),
 * and dots along it.
 */
export type Lattice = [number, number];

const withSigns = ([a, b]: Lattice): Lattice[] => {
  const all: Lattice[] = [[a, b], [-a, b], [a, -b], [-a, -b]];
  return all.filter(([x, y], i) => all.findIndex(([p, q]) => p === x && q === y) === i);
};

const STRAIGHT: Lattice[] = [[1, 0], [-1, 0], [0, 1], [0, -1]];
const DIAGONAL: Lattice[] = withSigns([1, 1]);
const SLOPED: Lattice[] = [...withSigns([1, 2]), ...withSigns([2, 1])];

/**
 * Easy keeps to straight lines, since diagonals are what children find
 * hardest to mirror. Medium adds a diagonal or two; hard adds more, plus
 * slopes of two-along-one-out, over more lines.
 */
const LEVELS: Record<ShapeLevel, {
  directions: Lattice[];
  /** Straight lines are picked this many times as often as the rest. */
  straightWeight: number;
  segments: [number, number];
  minSlanted: number;
}> = {
  easy: { directions: STRAIGHT, straightWeight: 1, segments: [4, 6], minSlanted: 0 },
  medium: { directions: [...STRAIGHT, ...DIAGONAL], straightWeight: 2, segments: [5, 7], minSlanted: 1 },
  hard: { directions: [...STRAIGHT, ...DIAGONAL, ...SLOPED], straightWeight: 2, segments: [7, 10], minSlanted: 2 },
};

const isStraight = ([a, b]: Lattice) => a === 0 || b === 0;

function cross(o: Lattice, p: Lattice, q: Lattice): number {
  return Math.sign((p[0] - o[0]) * (q[1] - o[1]) - (p[1] - o[1]) * (q[0] - o[0]));
}

function onSegment(p: Lattice, q: Lattice, r: Lattice): boolean {
  return Math.min(p[0], q[0]) <= r[0] && r[0] <= Math.max(p[0], q[0])
    && Math.min(p[1], q[1]) <= r[1] && r[1] <= Math.max(p[1], q[1]);
}

/** True if the segments meet anywhere, ends and touching included. */
function segmentsMeet(a: Lattice, b: Lattice, c: Lattice, d: Lattice): boolean {
  const d1 = cross(c, d, a);
  const d2 = cross(c, d, b);
  const d3 = cross(a, b, c);
  const d4 = cross(a, b, d);
  if (d1 !== d2 && d3 !== d4 && d1 * d2 <= 0 && d3 * d4 <= 0) return true;
  return (d1 === 0 && onSegment(c, d, a))
    || (d2 === 0 && onSegment(c, d, b))
    || (d3 === 0 && onSegment(a, b, c))
    || (d4 === 0 && onSegment(a, b, d));
}

/** Would a new last segment from the path's end to `to` touch any earlier one but its neighbour? */
function crossesPath(path: Lattice[], to: Lattice): boolean {
  const from = path[path.length - 1];
  for (let i = 0; i + 2 < path.length; i++) {
    if (segmentsMeet(path[i], path[i + 1], from, to)) return true;
  }
  return false;
}

const parallel = ([a, b]: Lattice, [c, d]: Lattice) => a * d === b * c;

const unit = (from: Lattice, to: Lattice): Lattice => {
  const du = to[0] - from[0];
  const dv = to[1] - from[1];
  const g = gcd(Math.abs(du), Math.abs(dv));
  return [du / g, dv / g];
};

function gcd(a: number, b: number): number {
  return b === 0 ? a : gcd(b, a % b);
}

/** Area between the path and the mirror line: chunky shapes read as shapes. */
function area(path: Lattice[]): number {
  let sum = 0;
  for (let i = 0; i < path.length; i++) {
    const [x1, y1] = path[i];
    const [x2, y2] = path[(i + 1) % path.length];
    sum += x1 * y2 - x2 * y1;
  }
  return Math.abs(sum) / 2;
}

/**
 * One try at a path: out from the mirror line, a walk that never touches
 * itself or comes back to the line, then one segment home. Null if it gets
 * stuck or comes out too small.
 */
function tryPath(rng: SeededRandom, level: ShapeLevel, out: number, along: number): Lattice[] | null {
  const { directions, straightWeight, segments: [lo, hi], minSlanted } = LEVELS[level];
  const weighted = directions.flatMap(d => Array<Lattice>(isStraight(d) ? straightWeight : 1).fill(d));
  const segments = lo + rng.nextInt(hi - lo + 1);
  const maxLength = Math.max(2, Math.round(Math.max(out, along) * 0.5));

  const path: Lattice[] = [[0, rng.nextInt(along)]];
  let last: Lattice | null = null;

  for (let s = 0; s < segments - 1; s++) {
    const [u, v] = path[path.length - 1];
    let placed = false;
    for (let tries = 0; tries < 12 && !placed; tries++) {
      const dir = weighted[rng.nextInt(weighted.length)];
      if (last && parallel(dir, last)) continue;
      if (s === 0 && dir[0] <= 0) continue;
      const length = 1 + rng.nextInt(maxLength);
      const to: Lattice = [u + dir[0] * length, v + dir[1] * length];
      if (to[0] < 1 || to[0] > out || to[1] < 0 || to[1] >= along) continue;
      if (crossesPath(path, to)) continue;
      path.push(to);
      last = dir;
      placed = true;
    }
    if (!placed) return null;
  }

  // Home to the mirror line, by any direction this level allows
  const [u, v] = path[path.length - 1];
  const homes = directions
    .filter(([du]) => du < 0 && u % -du === 0)
    .map(([du, dv]): Lattice => [0, v + (dv * u) / -du])
    .filter(to => to[1] >= 0 && to[1] < along && to[1] !== path[0][1])
    .filter(to => !(last && parallel(unit([u, v], to), last)))
    .filter(to => !crossesPath(path, to));
  if (homes.length === 0) return null;
  path.push(homes[rng.nextInt(homes.length)]);

  // Must fill a fair part of the space, and use the level's slants
  const furthest = Math.max(...path.map(p => p[0]));
  const vs = path.map(p => p[1]);
  if (furthest < Math.ceil(out * 0.6)) return null;
  if (Math.max(...vs) - Math.min(...vs) < Math.ceil((along - 1) * 0.4)) return null;
  let slanted = 0;
  for (let i = 1; i < path.length; i++) {
    if (!isStraight(unit(path[i - 1], path[i]))) slanted++;
  }
  if (slanted < minSlanted) return null;
  return path;
}

const LEVEL_ORDER: ShapeLevel[] = ['easy', 'medium', 'hard'];

/** How far out and how far down a picture reaches, in dots. */
const extent = (picture: Picture): Lattice => {
  const points = picture.lines.flat();
  return [Math.max(...points.map(p => p[0])), Math.max(...points.map(p => p[1]))];
};

/**
 * A picture of the level that fits, or the nearest level that has one
 * (easier first). Null if none fits at all.
 */
function choosePicture(rng: SeededRandom, level: ShapeLevel, out: number, along: number, sideways: boolean): Picture | null {
  const fits = PICTURES.filter(p => {
    const [u, v] = extent(p);
    return u <= out && v < along && (!sideways || p.sideways);
  });
  const at = LEVEL_ORDER.indexOf(level);
  const nearest = [...LEVEL_ORDER].sort((a, b) => {
    const da = LEVEL_ORDER.indexOf(a) - at;
    const db = LEVEL_ORDER.indexOf(b) - at;
    return Math.abs(da) - Math.abs(db) || da - db;
  });
  for (const l of nearest) {
    const pool = fits.filter(p => p.level === l);
    if (pool.length) return rng.pick(pool);
  }
  return null;
}

/** A few good tries, keeping the chunkiest; a box if every try fails. */
function choosePath(rng: SeededRandom, level: ShapeLevel, out: number, along: number): Lattice[] {
  let best: Lattice[] | null = null;
  let found = 0;
  for (let attempt = 0; attempt < 600 && found < 3; attempt++) {
    const path = tryPath(rng, level, out, along);
    if (!path) continue;
    found++;
    if (!best || area(path) > area(best)) best = path;
  }
  if (best) return best;
  const top = Math.floor((along - 1) * 0.2);
  const bottom = along - 1 - top;
  const reach = Math.max(1, out - 1);
  return [[0, top], [reach, top], [reach, bottom], [0, bottom]];
}

export function generateDrawTheOtherHalf(
  gridWidth: number,
  gridHeight: number,
  seed: number,
  level: ShapeLevel,
  mirror: MirrorLine,
  subject: Subject,
  cellMm: number,
): DrawTheOtherHalfPuzzle {
  const width = gridWidth * cellMm;
  const height = gridHeight * cellMm;
  const rng = new SeededRandom(seed);
  const { padding, maxOut, maxAlong } = LAYOUT;

  // Lay the grid out as if the mirror line runs down; turn it after for across
  const vertical = mirror === 'vertical';
  const roomAcross = (vertical ? width : height) - 2 * padding;
  const roomAlong = (vertical ? height : width) - 2 * padding;
  const fit = (spacing: number) => [
    Math.max(1, Math.floor(roomAcross / (2 * spacing) + 1e-6)),
    Math.max(2, Math.floor(roomAlong / spacing + 1e-6) + 1),
  ];
  let spacing = Math.max(LAYOUT.spacing, roomAcross / (2 * maxOut), roomAlong / (maxAlong - 1));
  let [out, along] = fit(spacing);

  let lines: Lattice[][];
  // Pictures are picked from the most dots that fit, then spread the dots to fill the space
  const [mostOut, mostAlong] = fit(LAYOUT.spacing);
  const picture = subject === 'picture'
    ? choosePicture(rng, level, Math.min(mostOut, maxOut), Math.min(mostAlong, maxAlong), !vertical)
    : null;
  if (picture) {
    // A spare dot round the picture where there's room
    const [pictureOut, pictureAlong] = extent(picture);
    spacing = Math.max(LAYOUT.spacing, Math.min(roomAcross / (2 * (pictureOut + 1)), roomAlong / (pictureAlong + 2)));
    [out, along] = fit(spacing);
    const shift = Math.floor((along - 1 - pictureAlong) / 2);
    lines = picture.lines.map(line => line.map(([u, v]): Lattice => [u, v + shift]));
  } else {
    lines = [choosePath(rng, level, out, along)];
  }

  const centreAcross = (vertical ? width : height) / 2;
  const startAlong = ((vertical ? height : width) - (along - 1) * spacing) / 2;
  // The given half is on the left, or on top
  const toMm = ([u, v]: Lattice, side: number): Point => {
    const across = centreAcross + side * u * spacing;
    const alongMm = startAlong + v * spacing;
    return vertical ? [across, alongMm] : [alongMm, across];
  };

  const dots: Point[] = [];
  for (let u = -out; u <= out; u++) {
    for (let v = 0; v < along; v++) dots.push(toMm([Math.abs(u), v], Math.sign(u)));
  }

  const overhang = LAYOUT.mirrorOverhang;
  const mirrorEnds: [Point, Point] = vertical
    ? [[centreAcross, startAlong - overhang], [centreAcross, startAlong + (along - 1) * spacing + overhang]]
    : [[startAlong - overhang, centreAcross], [startAlong + (along - 1) * spacing + overhang, centreAcross]];

  return {
    width,
    height,
    spacing,
    dots,
    mirror: mirrorEnds,
    given: lines.map(line => line.map(p => toMm(p, -1))),
    answer: lines.map(line => line.map(p => toMm(p, 1))),
    corners: [...new Map(lines.flat().filter(([u]) => u > 0).map(p => [p.join(), p])).values()]
      .map(p => toMm(p, 1)),
    picture: picture?.id,
  };
}

/** Dots along each line of the answer, a whole number to a line so every corner gets one. */
export function traceDots(answer: Point[]): Point[] {
  const dots: Point[] = [answer[0]];
  for (let i = 1; i < answer.length; i++) {
    const [x1, y1] = answer[i - 1];
    const [x2, y2] = answer[i];
    const steps = Math.max(1, Math.round(Math.hypot(x2 - x1, y2 - y1) / LAYOUT.traceGap));
    for (let k = 1; k <= steps; k++) {
      dots.push([x1 + ((x2 - x1) * k) / steps, y1 + ((y2 - y1) * k) / steps]);
    }
  }
  return dots;
}
