import { CELL_SIZE_MM } from '../../../types/puzzle';
import { OUTLINES } from '../Maze/concentric';
import type { Point } from '../Maze/grids';

export type DotShape = 'circle' | 'heart' | 'star' | 'square' | 'triangle';
export type DotSize = 'small' | 'big';
export type DotFill = 'outline' | 'filled';

export const SHAPES: { id: DotShape; label: string }[] = [
  { id: 'circle', label: 'Circle' },
  { id: 'heart', label: 'Heart' },
  { id: 'star', label: 'Star' },
  { id: 'square', label: 'Square' },
  { id: 'triangle', label: 'Triangle' },
];

/** Dot diameters in mm: a dot marker's dab is about 15-20mm across. */
const DOT_DIAMETER: Record<DotSize, number> = { small: 15, big: 20 };
/** Aim for dots this far apart, centre to centre, as a multiple of their diameter. */
const SPACING = 1.3;
/** Never closer than this, so no two dots touch. */
const MIN_SPACING = 1.1;
/** A vertex that turns more than this is a corner, and gets a dot of its own. */
const CORNER_TURN = (25 * Math.PI) / 180;
/** Clear space round the edge of the puzzle, in mm. */
const MARGIN = 2;
/** Interior dots stay this far (in spacings) from the outline's line. */
const INTERIOR_CLEARANCE = 0.8;

/** Something to talk about in the middle. */
const PICTURES = ['🐟', '🐱', '🐶', '🐰', '🐻', '🐸', '🐥', '🦋', '🐞', '🐢', '🐝', '🐧', '🦊', '🐷', '🐮'];

export interface DotMarkerPuzzle {
  width: number;
  height: number;
  /** The shape's outline, through the outline dots' centres. */
  outline: Point[];
  dots: Point[];
  radius: number;
  picture?: { emoji: string; at: Point; size: number };
}

class SeededRandom {
  private seed: number;
  constructor(seed: number) {
    this.seed = seed;
  }
  next(): number {
    this.seed = (this.seed * 9301 + 49297) % 233280;
    return this.seed / 233280;
  }
}

function polygon(sides: number): Point[] {
  // One corner straight up; a square is turned to sit flat
  const rotation = sides === 4 ? -Math.PI / 4 : -Math.PI / 2;
  return Array.from({ length: sides }, (_, i) => {
    const a = rotation + (2 * Math.PI * i) / sides;
    return { x: Math.cos(a), y: Math.sin(a) };
  });
}

/** Each shape's corners, going round in order, y down. */
export function shapeVertices(shape: DotShape): Point[] {
  switch (shape) {
    case 'square':
      return polygon(4);
    case 'triangle':
      return polygon(3);
    default:
      return OUTLINES[shape].vertices;
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
function outlineDots(outline: Point[], spacing: number, min: number): Point[] {
  const n = outline.length;
  const corners = outline
    .map((p, i) => (turnAt(outline[(i + n - 1) % n], p, outline[(i + 1) % n]) > CORNER_TURN ? i : -1))
    .filter(i => i >= 0);

  if (corners.length === 0) {
    const top = outline.reduce((best, p, i) => (p.y < outline[best].y ? i : best), 0);
    const loop = [...outline.slice(top), ...outline.slice(0, top + 1)];
    const length = pathLength(loop);
    const gaps = Math.max(3, gapsFor(length, spacing, min));
    return Array.from({ length: gaps }, (_, i) => pointAlong(loop, (length * i) / gaps));
  }

  const dots: Point[] = [];
  corners.forEach((start, k) => {
    const end = corners[(k + 1) % corners.length];
    const run: Point[] = [];
    for (let i = start; ; i = (i + 1) % n) {
      run.push(outline[i]);
      if (i === end && run.length > 1) break;
    }
    const length = pathLength(run);
    const gaps = gapsFor(length, spacing, min);
    for (let i = 0; i < gaps; i++) dots.push(pointAlong(run, (length * i) / gaps));
  });
  return dots;
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
  withPicture: boolean,
): DotMarkerPuzzle {
  const width = gridWidth * CELL_SIZE_MM;
  const height = gridHeight * CELL_SIZE_MM;
  const diameter = DOT_DIAMETER[size];
  const radius = diameter / 2;
  const spacing = diameter * SPACING;

  // Fit the outline's centreline so the dots on it, not the line, touch the margin
  const unit = shapeVertices(shape);
  const xs = unit.map(p => p.x);
  const ys = unit.map(p => p.y);
  const [minX, maxX, minY, maxY] = [Math.min(...xs), Math.max(...xs), Math.min(...ys), Math.max(...ys)];
  const room = 2 * (MARGIN + radius);
  const scale = Math.max(0.1, Math.min((width - room) / (maxX - minX), (height - room) / (maxY - minY)));
  const ox = width / 2 - ((minX + maxX) / 2) * scale;
  const oy = height / 2 - ((minY + maxY) / 2) * scale;
  const outline = unit.map(p => ({ x: ox + p.x * scale, y: oy + p.y * scale }));

  const dots = outlineDots(outline, spacing, diameter * MIN_SPACING);

  let picture: DotMarkerPuzzle['picture'];
  if (withPicture) {
    const { at, clearance } = roomiestSpot(outline, dots);
    // As big as the hole in the middle allows, short of the dots round it
    const hole = clearance - radius - 2;
    // Filled: about a dot's size, so it takes the place of a dot or two
    const cap = fill === 'filled' ? diameter * 1.1 : 40;
    const pictureSize = Math.min(hole * 1.5, cap);
    if (pictureSize >= 8) {
      const rng = new SeededRandom(seed);
      picture = { emoji: PICTURES[Math.floor(rng.next() * PICTURES.length)], at, size: pictureSize };
    }
  }

  if (fill === 'filled') {
    const keepOut = (p: Point) => picture !== undefined && dist(p, picture.at) < picture.size / 2 + radius + 1;
    dots.push(...interiorDots(outline, spacing, keepOut));
  }

  return { width, height, outline, dots, radius, picture };
}
