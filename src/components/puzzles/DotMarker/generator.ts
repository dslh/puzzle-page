import { CELL_SIZE_MM } from '../../../types/puzzle';
import { OUTLINES } from '../Maze/concentric';
import type { Point } from '../Maze/grids';
import { SeededRandom } from '../../../utils/random';

export type DotShape =
  | 'circle'
  | 'heart'
  | 'star'
  | 'square'
  | 'triangle'
  | 'house'
  | 'fish'
  | 'pumpkin'
  | 'tree'
  | 'cloud';
export type DotSize = 'small' | 'medium' | 'big';
export type DotFill = 'outline' | 'filled';

/** Plain shapes first, then pictures; the config bar gives each group a row. */
export const SHAPES: { id: DotShape; label: string; picture?: boolean }[] = [
  { id: 'circle', label: 'Circle' },
  { id: 'heart', label: 'Heart' },
  { id: 'star', label: 'Star' },
  { id: 'square', label: 'Square' },
  { id: 'triangle', label: 'Triangle' },
  { id: 'house', label: 'House', picture: true },
  { id: 'fish', label: 'Fish', picture: true },
  { id: 'pumpkin', label: 'Pumpkin', picture: true },
  { id: 'tree', label: 'Tree', picture: true },
  { id: 'cloud', label: 'Cloud', picture: true },
];

/**
 * Dot diameters in mm. A dot marker's dab is about 15-20mm across; round
 * stickers come in about 13mm and 19mm.
 */
const DOT_DIAMETER: Record<DotSize, number> = { small: 12, medium: 15, big: 20 };
/** Aim for dots this far apart, centre to centre, as a multiple of their diameter. */
const SPACING = 1.3;
/** Plan for dots no closer than this along the outline... */
const MIN_SPACING = 1.1;
/** ...and never let any two get closer than this, anywhere, so none touch. */
const CLEAR_SPACING = 1.05;
/** A vertex that turns more than this is a corner, and gets a dot of its own. */
const CORNER_TURN = (25 * Math.PI) / 180;
/** Clear space round the edge of the puzzle, in mm. */
const MARGIN = 2;
/** Interior dots stay this far (in spacings) from the outline's line. */
const INTERIOR_CLEARANCE = 0.8;

/** Something to talk about in the middle. */
export const PICTURES = [
  { emoji: '🐟', label: 'Fish' },
  { emoji: '🐱', label: 'Cat' },
  { emoji: '🐶', label: 'Dog' },
  { emoji: '🐰', label: 'Rabbit' },
  { emoji: '🐻', label: 'Bear' },
  { emoji: '🐸', label: 'Frog' },
  { emoji: '🐥', label: 'Chick' },
  { emoji: '🦋', label: 'Butterfly' },
  { emoji: '🐞', label: 'Ladybird' },
  { emoji: '🐢', label: 'Tortoise' },
  { emoji: '🐝', label: 'Bee' },
  { emoji: '🐧', label: 'Penguin' },
  { emoji: '🦊', label: 'Fox' },
  { emoji: '🐷', label: 'Pig' },
  { emoji: '🐮', label: 'Cow' },
];

/** One of the pictures' emoji, a random one, or none. */
export type DotPicture = 'random' | 'none' | string;

export interface DotMarkerPuzzle {
  width: number;
  height: number;
  /** The shape's outline, through the outline dots' centres. */
  outline: Point[];
  /** Parts drawn without dots, such as a pumpkin's stalk. */
  extras: Point[][];
  dots: Point[];
  radius: number;
  picture?: { emoji: string; at: Point; size: number };
}

function polygon(sides: number): Point[] {
  // One corner straight up; a square is turned to sit flat
  const rotation = sides === 4 ? -Math.PI / 4 : -Math.PI / 2;
  return Array.from({ length: sides }, (_, i) => {
    const a = rotation + (2 * Math.PI * i) / sides;
    return { x: Math.cos(a), y: Math.sin(a) };
  });
}

interface Circle {
  x: number;
  y: number;
  r: number;
}

const DEG = Math.PI / 180;

/**
 * Points round a circle, clockwise on screen (y down) from one angle to
 * another, close enough together that none of them counts as a corner.
 */
function arc(c: Circle, from: number, to: number, withEnd = true): Point[] {
  while (to < from) to += 2 * Math.PI;
  const steps = Math.max(1, Math.ceil((to - from) / (5 * DEG)));
  const points: Point[] = [];
  for (let i = 0; i <= (withEnd ? steps : steps - 1); i++) {
    const a = from + ((to - from) * i) / steps;
    points.push({ x: c.x + c.r * Math.cos(a), y: c.y + c.r * Math.sin(a) });
  }
  return points;
}

const angleOn = (c: Circle, p: Point) => Math.atan2(p.y - c.y, p.x - c.x);

/** Where two overlapping circles cross, the upper point (smaller y). */
function upperMeet(a: Circle, b: Circle): Point {
  const d = dist(a, b);
  const along = (d * d + a.r * a.r - b.r * b.r) / (2 * d);
  const across = Math.sqrt(a.r * a.r - along * along);
  const ux = (b.x - a.x) / d;
  const uy = (b.y - a.y) / d;
  const mid = { x: a.x + ux * along, y: a.y + uy * along };
  const p1 = { x: mid.x - uy * across, y: mid.y + ux * across };
  const p2 = { x: mid.x + uy * across, y: mid.y - ux * across };
  return p1.y < p2.y ? p1 : p2;
}

/**
 * Round lobes in a row, left to right over the top: the outline of
 * overlapping circles, with a dip wherever two meet. Starts on the first
 * circle at `from` and ends on the last at `to`.
 */
function lobes(circles: Circle[], from: number, to: number): Point[] {
  const meets = circles.slice(1).map((c, i) => upperMeet(circles[i], c));
  return circles.flatMap((c, i) =>
    arc(
      c,
      i === 0 ? from : angleOn(c, meets[i - 1]),
      i === circles.length - 1 ? to : angleOn(c, meets[i]),
      i === circles.length - 1,
    ),
  );
}

const mirrorX = (points: Point[]) => points.map(p => ({ x: -p.x, y: p.y }));

/** A house: a box with a pointed roof. */
function house(): Point[] {
  return [
    { x: 0, y: -1 },
    { x: 0.85, y: -0.2 },
    { x: 0.85, y: 0.9 },
    { x: -0.85, y: 0.9 },
    { x: -0.85, y: -0.2 },
  ];
}

/** A fish swimming left: an oval body and a forked tail. */
function fish(): Point[] {
  const body = { x: -0.3, y: 0, rx: 0.75, ry: 0.5 };
  const join = 35 * DEG;
  const points: Point[] = [];
  // From where the tail joins underneath, forward round the nose and back over the top
  const steps = 60;
  for (let i = 0; i <= steps; i++) {
    const a = -join - ((2 * Math.PI - 2 * join) * i) / steps;
    points.push({ x: body.x + body.rx * Math.cos(a), y: body.y - body.ry * Math.sin(a) });
  }
  points.push({ x: 1.05, y: -0.55 }, { x: 0.7, y: 0 }, { x: 1.05, y: 0.55 });
  return points;
}

/** A pumpkin: three round lobes, dipping where they meet. Its stalk is an extra. */
function pumpkin(): Point[] {
  const circles = [
    { x: -0.5, y: 0, r: 0.55 },
    { x: 0, y: 0, r: 0.62 },
    { x: 0.5, y: 0, r: 0.55 },
  ];
  // The bottom is the top turned over
  const top = lobes(circles, Math.PI, 0);
  const bottom = top
    .slice(1, -1)
    .map(p => ({ x: p.x, y: -p.y }))
    .reverse();
  return [...top, ...bottom];
}

/** A fir tree: two tiers of branches. Its trunk is an extra. */
function tree(): Point[] {
  const right = [
    { x: 0.6, y: -0.15 },
    { x: 0.1, y: -0.15 },
    { x: 0.95, y: 0.55 },
  ];
  return [{ x: 0, y: -1 }, ...right, ...mirrorX(right).reverse()];
}

/** A cloud: four bumps on top of a flat bottom. Wide, like a real one. */
function cloud(): Point[] {
  return lobes(
    [
      { x: -0.8, y: 0.16, r: 0.36 },
      { x: -0.3, y: -0.12, r: 0.48 },
      { x: 0.32, y: -0.1, r: 0.46 },
      { x: 0.8, y: 0.16, r: 0.36 },
    ],
    Math.PI / 2,
    Math.PI / 2,
  );
}

/** Each shape's outline, going round in order, y down. Any size: it is fitted to the puzzle. */
export function shapeVertices(shape: DotShape): Point[] {
  switch (shape) {
    case 'square':
      return polygon(4);
    case 'triangle':
      return polygon(3);
    case 'house':
      return house();
    case 'fish':
      return fish();
    case 'pumpkin':
      return pumpkin();
    case 'tree':
      return tree();
    case 'cloud':
      return cloud();
    default:
      return OUTLINES[shape].vertices;
  }
}

/**
 * Parts of a picture too thin to carry dots: drawn in the same thick line,
 * behind the dots, for colouring in. Each one tucks under the outline so the
 * join is hidden.
 */
export function shapeExtras(shape: DotShape): Point[][] {
  switch (shape) {
    case 'pumpkin':
      return [
        [
          { x: -0.1, y: -0.55 },
          { x: -0.05, y: -1.0 },
          { x: 0.17, y: -1.0 },
          { x: 0.1, y: -0.55 },
        ],
      ];
    case 'tree':
      return [
        [
          { x: -0.2, y: 0.5 },
          { x: 0.2, y: 0.5 },
          { x: 0.2, y: 1.05 },
          { x: -0.2, y: 1.05 },
        ],
      ];
    default:
      return [];
  }
}

const dist = (a: Point, b: Point) => Math.hypot(a.x - b.x, a.y - b.y);
const lerp = (a: Point, b: Point, t: number): Point => ({ x: a.x + (b.x - a.x) * t, y: a.y + (b.y - a.y) * t });

function turnAt(prev: Point, p: Point, next: Point): number {
  const a1 = Math.atan2(p.y - prev.y, p.x - prev.x);
  const a2 = Math.atan2(next.y - p.y, next.x - p.x);
  let d = Math.abs(a2 - a1);
  if (d > Math.PI) d = 2 * Math.PI - d;
  return d;
}

/** The point a distance `at` along an open polyline. */
function pointAlong(path: Point[], at: number): Point {
  for (let i = 1; i < path.length; i++) {
    const len = dist(path[i - 1], path[i]);
    if (at <= len || i === path.length - 1) return lerp(path[i - 1], path[i], len ? Math.min(1, at / len) : 0);
    at -= len;
  }
  return path[path.length - 1];
}

const pathLength = (path: Point[]) => path.slice(1).reduce((sum, p, i) => sum + dist(path[i], p), 0);

/** How many equal gaps to cut a length into, aiming for `spacing` and never under `min`. */
const gapsFor = (length: number, spacing: number, min: number) =>
  Math.max(1, Math.min(Math.round(length / spacing), Math.floor(length / min)));

/**
 * Dots evenly spaced by length along a closed outline. Every corner gets a
 * dot, so the points of a star are marked, and the stretch between two
 * corners is shared out evenly. A shape with no corners (a circle) starts at
 * the top.
 */
function outlineDots(outline: Point[], spacing: number, min: number, clear: number): Point[] {
  const n = outline.length;
  const corners = outline
    .map((p, i) => (turnAt(outline[(i + n - 1) % n], p, outline[(i + 1) % n]) > CORNER_TURN ? i : -1))
    .filter(i => i >= 0);

  if (corners.length === 0) {
    const top = outline.reduce((best, p, i) => (p.y < outline[best].y - 1e-9 ? i : best), 0);
    const loop = [...outline.slice(top), ...outline.slice(0, top + 1)];
    const length = pathLength(loop);
    const gaps = Math.max(3, gapsFor(length, spacing, min));
    // When the top is a flat side rather than a corner, start halfway along it,
    // so the dots sit evenly either side of the middle
    const flat = Math.abs(loop[1].y - loop[0].y) < 1e-9 ? dist(loop[0], loop[1]) / 2 : 0;
    return Array.from({ length: gaps }, (_, i) => pointAlong(loop, (flat + (length * i) / gaps) % length));
  }

  // Which way round the outline goes, to tell points from dips
  const turning = Math.sign(
    outline.reduce((sum, a, i) => {
      const b = outline[(i + 1) % n];
      return sum + a.x * b.y - b.x * a.y;
    }, 0),
  );

  // Each corner's dot carries how much it matters: points before dips, sharper
  // first. Where two corners are too close for both, the one that matters
  // more keeps its dot.
  const sharpness = corners.map(c => {
    const [prev, p, next] = [outline[(c + n - 1) % n], outline[c], outline[(c + 1) % n]];
    const cross = (p.x - prev.x) * (next.y - p.y) - (p.y - prev.y) * (next.x - p.x);
    return turnAt(prev, p, next) + (Math.sign(cross) === turning ? Math.PI : 0);
  });
  const kept = withoutOverlaps(
    corners.map((c, k) => ({ at: outline[c], sharpness: sharpness[k] })),
    clear,
  ).map(k => corners[k]);

  // The stretches between the corners that kept their dots. A corner that lost
  // its dot is just part of a stretch, so the dots run evenly past it.
  const runs = kept.map((start, k) => {
    const end = kept[(k + 1) % kept.length];
    const points: Point[] = [];
    for (let i = start; ; i = (i + 1) % n) {
      points.push(outline[i]);
      if (i === end && points.length > 1) break;
    }
    const length = pathLength(points);
    return { points, length, gaps: gapsFor(length, spacing, min) };
  });

  const place = () =>
    runs.flatMap((run, r) =>
      Array.from({ length: run.gaps }, (_, i) => ({
        at: pointAlong(run.points, (run.length * i) / run.gaps),
        run: r,
        corner: i === 0,
      })),
    );

  // A dot between corners that touches one in the next stretch, round a sharp
  // corner, means its stretch has a dot too many: take one off and space the
  // rest out again, so the gaps stay even. Every crowded stretch goes down
  // together, so a mirror image's two sides stay alike.
  const neighbours = (a: number, b: number) => a !== b && [1, runs.length - 1].includes((a - b + runs.length) % runs.length);
  let dots = place();
  for (;;) {
    const crowded = new Set<number>();
    dots.forEach((a, i) =>
      dots.slice(i + 1).forEach(b => {
        if (dist(a.at, b.at) >= clear || !neighbours(a.run, b.run)) return;
        for (const d of [a, b]) if (!d.corner && runs[d.run].gaps > 1) crowded.add(d.run);
      }),
    );
    if (crowded.size === 0) break;
    crowded.forEach(r => runs[r].gaps--);
    dots = place();
  }
  // Anything still touching is where the outline folds back near itself, at
  // a notch; spacing out can't help there, so the dot is dropped
  return withoutOverlaps(dots.map(d => ({ at: d.at, sharpness: d.corner ? 1 : 0 })), clear).map(i => dots[i].at);
}

/**
 * Which dots to keep so none touch, as indexes in order: the ones that matter
 * most go first, and each is kept only if it is clear of those already kept.
 * A dot and its mirror image, when the shape has one, are kept or dropped
 * together.
 */
function withoutOverlaps(dots: { at: Point; sharpness: number }[], min: number): number[] {
  const partner = mirrorPartners(dots.map(d => d.at));
  const kept: Point[] = [];
  const keep = new Set<number>();
  const order = dots.map((_, i) => i).sort((a, b) => dots[b].sharpness - dots[a].sharpness);
  for (const i of order) {
    if (keep.has(i)) continue;
    const pair = [...new Set([i, partner[i]])].map(j => dots[j].at);
    const clear = pair.every(p => kept.every(k => dist(p, k) >= min)) && (pair.length === 1 || dist(pair[0], pair[1]) >= min);
    if (clear) {
      kept.push(...pair);
      keep.add(i).add(partner[i]);
    }
  }
  return dots.map((_, i) => i).filter(i => keep.has(i));
}

/**
 * Each dot's mirror image across the middle, upright or sideways, if every dot
 * has one; otherwise each dot is its own.
 */
function mirrorPartners(points: Point[]): number[] {
  const xs = points.map(p => p.x);
  const ys = points.map(p => p.y);
  const cx = (Math.min(...xs) + Math.max(...xs)) / 2;
  const cy = (Math.min(...ys) + Math.max(...ys)) / 2;
  for (const flip of [(p: Point) => ({ x: 2 * cx - p.x, y: p.y }), (p: Point) => ({ x: p.x, y: 2 * cy - p.y })]) {
    const partners = points.map(p => points.findIndex(q => dist(q, flip(p)) < 0.5));
    if (partners.every(j => j >= 0)) return partners;
  }
  return points.map((_, i) => i);
}

function inside(p: Point, poly: Point[]): boolean {
  let hit = false;
  for (let i = 0, j = poly.length - 1; i < poly.length; j = i++) {
    const a = poly[i];
    const b = poly[j];
    if (a.y > p.y !== b.y > p.y && p.x < ((b.x - a.x) * (p.y - a.y)) / (b.y - a.y) + a.x) hit = !hit;
  }
  return hit;
}

function distanceToOutline(p: Point, poly: Point[]): number {
  let best = Infinity;
  for (let i = 0; i < poly.length; i++) {
    const a = poly[i];
    const b = poly[(i + 1) % poly.length];
    const dx = b.x - a.x;
    const dy = b.y - a.y;
    const t = Math.max(0, Math.min(1, ((p.x - a.x) * dx + (p.y - a.y) * dy) / (dx * dx + dy * dy)));
    best = Math.min(best, Math.hypot(p.x - a.x - t * dx, p.y - a.y - t * dy));
  }
  return best;
}

/**
 * Where a picture fits best: the spot inside the shape furthest from every
 * dot, and how far that is. The samples are symmetric about the middle, so a
 * symmetric shape keeps its picture on the centreline.
 */
function roomiestSpot(poly: Point[], dots: Point[]): { at: Point; clearance: number } {
  const xs = poly.map(p => p.x);
  const ys = poly.map(p => p.y);
  const [minX, maxX, minY, maxY] = [Math.min(...xs), Math.max(...xs), Math.min(...ys), Math.max(...ys)];
  const cx = (minX + maxX) / 2;
  const steps = 40;
  let best = { at: { x: cx, y: (minY + maxY) / 2 }, clearance: 0 };
  let bestScore = -Infinity;
  for (let i = 0; i <= steps; i++) {
    for (let j = 0; j <= steps; j++) {
      const p = { x: minX + ((maxX - minX) * i) / steps, y: minY + ((maxY - minY) * j) / steps };
      if (!inside(p, poly)) continue;
      const clearance = Math.min(...dots.map(d => dist(d, p)));
      // A little pull to the middle breaks near-ties, so a symmetric shape
      // keeps its picture on the centreline
      const score = clearance - 0.05 * Math.abs(p.x - cx);
      if (score > bestScore) {
        bestScore = score;
        best = { at: p, clearance };
      }
    }
  }
  return best;
}

/**
 * Fill the inside with a honeycomb of dots, the same spacing as the outline.
 * A few offsets are tried and the one that fits most dots wins. Sideways,
 * only whole and half spacings from the middle are tried, so a symmetric
 * shape always gets a symmetric fill.
 */
function interiorDots(outline: Point[], spacing: number, keepOut: (p: Point) => boolean): Point[] {
  const xs = outline.map(p => p.x);
  const ys = outline.map(p => p.y);
  const [minX, maxX, minY, maxY] = [Math.min(...xs), Math.max(...xs), Math.min(...ys), Math.max(...ys)];
  const cx = (minX + maxX) / 2;
  const rowGap = (spacing * Math.sqrt(3)) / 2;
  const clearance = spacing * INTERIOR_CLEARANCE;

  let best: Point[] = [];
  for (const fy of [0, 0.5, 0.25, 0.75]) {
    for (const fx of [0, 0.5]) {
      const found: Point[] = [];
      for (let row = 0, y = minY + fy * rowGap; y <= maxY; row++, y += rowGap) {
        const shift = cx + (fx + (row % 2) / 2) * spacing;
        const first = shift - Math.ceil((shift - minX) / spacing) * spacing;
        for (let x = first; x <= maxX; x += spacing) {
          const p = { x, y };
          if (inside(p, outline) && distanceToOutline(p, outline) >= clearance && !keepOut(p)) found.push(p);
        }
      }
      if (found.length > best.length) best = found;
    }
  }
  return best;
}

export function generateDotMarker(
  gridWidth: number,
  gridHeight: number,
  seed: number,
  shape: DotShape,
  size: DotSize,
  fill: DotFill,
  pictureChoice: DotPicture,
): DotMarkerPuzzle {
  const width = gridWidth * CELL_SIZE_MM;
  const height = gridHeight * CELL_SIZE_MM;
  const diameter = DOT_DIAMETER[size];
  const radius = diameter / 2;
  const spacing = diameter * SPACING;

  // Fit the outline's centreline so the dots on it, not the line, touch the
  // margin. The extras count too, with the same room to spare.
  const unit = shapeVertices(shape);
  const unitExtras = shapeExtras(shape);
  const xs = [unit, ...unitExtras].flat().map(p => p.x);
  const ys = [unit, ...unitExtras].flat().map(p => p.y);
  const [minX, maxX, minY, maxY] = [Math.min(...xs), Math.max(...xs), Math.min(...ys), Math.max(...ys)];
  const room = 2 * (MARGIN + radius);
  const scale = Math.max(0.1, Math.min((width - room) / (maxX - minX), (height - room) / (maxY - minY)));
  const ox = width / 2 - ((minX + maxX) / 2) * scale;
  const oy = height / 2 - ((minY + maxY) / 2) * scale;
  const place = (p: Point) => ({ x: ox + p.x * scale, y: oy + p.y * scale });
  const outline = unit.map(place);
  const extras = unitExtras.map(extra => extra.map(place));

  const dots = outlineDots(outline, spacing, diameter * MIN_SPACING, diameter * CLEAR_SPACING);

  let picture: DotMarkerPuzzle['picture'];
  if (pictureChoice !== 'none') {
    const { at, clearance } = roomiestSpot(outline, dots);
    // As big as the hole in the middle allows, short of the dots round it
    const hole = clearance - radius - 2;
    // Filled: about a dot's size, so it takes the place of a dot or two
    const cap = fill === 'filled' ? diameter * 1.1 : 40;
    const pictureSize = Math.min(hole * 1.5, cap);
    if (pictureSize >= 8) {
      const rng = new SeededRandom(seed);
      const emoji =
        pictureChoice === 'random' ? PICTURES[Math.floor(rng.next() * PICTURES.length)].emoji : pictureChoice;
      picture = { emoji, at, size: pictureSize };
    }
  }

  if (fill === 'filled') {
    const keepOut = (p: Point) => picture !== undefined && dist(p, picture.at) < picture.size / 2 + radius + 1;
    dots.push(...interiorDots(outline, spacing, keepOut));
  }

  return { width, height, outline, extras, dots, radius, picture };
}
