import type { Point } from '../Maze/grids';

/** Spacing helpers shared by the shapes (generator.ts) and the letters (letters.ts). */

/** Aim for dots this far apart, centre to centre, as a multiple of their diameter. */
export const SPACING = 1.3;
/** Plan for dots no closer than this along the outline... */
export const MIN_SPACING = 1.1;
/** ...and never let any two get closer than this, anywhere, so none touch. */
export const CLEAR_SPACING = 1.05;
/** Clear space round the edge of the puzzle, in mm. */
export const MARGIN = 2;
/** A vertex that turns more than this is a corner, and gets a dot of its own. */
export const CORNER_TURN = (25 * Math.PI) / 180;

export const dist = (a: Point, b: Point) => Math.hypot(a.x - b.x, a.y - b.y);
export const lerp = (a: Point, b: Point, t: number): Point => ({ x: a.x + (b.x - a.x) * t, y: a.y + (b.y - a.y) * t });

export function turnAt(prev: Point, p: Point, next: Point): number {
  const a1 = Math.atan2(p.y - prev.y, p.x - prev.x);
  const a2 = Math.atan2(next.y - p.y, next.x - p.x);
  let d = Math.abs(a2 - a1);
  if (d > Math.PI) d = 2 * Math.PI - d;
  return d;
}

/** The point a distance `at` along an open polyline. */
export function pointAlong(path: Point[], at: number): Point {
  for (let i = 1; i < path.length; i++) {
    const len = dist(path[i - 1], path[i]);
    if (at <= len || i === path.length - 1) return lerp(path[i - 1], path[i], len ? Math.min(1, at / len) : 0);
    at -= len;
  }
  return path[path.length - 1];
}

export const pathLength = (path: Point[]) => path.slice(1).reduce((sum, p, i) => sum + dist(path[i], p), 0);

/** How many equal gaps to cut a length into, aiming for `spacing` and never under `min`. */
export const gapsFor = (length: number, spacing: number, min: number) =>
  Math.max(1, Math.min(Math.round(length / spacing), Math.floor(length / min)));

/**
 * Which dots to keep so none touch, as indexes in order: the ones that matter
 * most go first, and each is kept only if it is clear of those already kept.
 * A dot and its mirror image, when the shape has one, are kept or dropped
 * together.
 */
export function withoutOverlaps(dots: { at: Point; sharpness: number }[], min: number): number[] {
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
export function mirrorPartners(points: Point[]): number[] {
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
