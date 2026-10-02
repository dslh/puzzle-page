import type { Wall } from './generator';
import type { Point } from './grids';

/**
 * Curvy walls: the same walls, drawn as flowing lines rather than straight
 * pieces. Walls that follow on from one another are joined into runs, and
 * each run is drawn as one smooth curve. Where three or more walls meet, the
 * runs still arrive at the corner itself, so the maze branches where it always
 * did.
 */

/** A line of walls joined end to end, or a closed loop of them. */
export interface WallRun {
  points: Point[];
  closed: boolean;
}

/** Wall ends closer together than this are the same corner. */
const SNAP = 1e-4;

const cornerKey = (p: Point): string => `${Math.round(p.x / SNAP)},${Math.round(p.y / SNAP)}`;

/**
 * Join walls into runs. A run carries on through every corner where exactly
 * two walls meet, and stops at a loose end or where walls branch.
 */
export function wallRuns(walls: Wall[]): WallRun[] {
  // The walls at each corner, as the corners they lead to. A wall can be
  // listed twice (once from the cell on either side); it is still one wall.
  const corners = new Map<string, { point: Point; links: Set<string> }>();
  const corner = (p: Point) => {
    const key = cornerKey(p);
    if (!corners.has(key)) corners.set(key, { point: p, links: new Set() });
    return key;
  };
  for (const wall of walls) {
    const from = corner(wall.from);
    const to = corner(wall.to);
    if (from === to) continue;
    corners.get(from)!.links.add(to);
    corners.get(to)!.links.add(from);
  }

  const used = new Set<string>();
  // Each wall goes into one run only
  const claim = (a: string, b: string): boolean => {
    const wall = a < b ? `${a} ${b}` : `${b} ${a}`;
    if (used.has(wall)) return false;
    used.add(wall);
    return true;
  };

  // Follow a run from `start` along its wall to `next`, and on through
  // corners that only have one other way out
  const follow = (start: string, next: string): WallRun => {
    const keys = [start];
    let previous = start;
    let current = next;
    for (;;) {
      keys.push(current);
      const links = corners.get(current)!.links;
      if (links.size !== 2 || current === start) break;
      const onward = [...links].find((key) => key !== previous)!;
      if (!claim(current, onward)) break;
      previous = current;
      current = onward;
    }
    // Back where it began, with no junction on the way: a loop
    const closed = corners.get(start)!.links.size === 2 && keys[keys.length - 1] === start;
    if (closed) keys.pop();
    return { points: keys.map((key) => corners.get(key)!.point), closed };
  };

  const runs: WallRun[] = [];
  const startFrom = (canStart: (links: Set<string>) => boolean) => {
    for (const [key, { links }] of corners) {
      if (!canStart(links)) continue;
      for (const next of links) {
        if (claim(key, next)) runs.push(follow(key, next));
      }
    }
  };
  // Runs between loose ends and junctions first; whatever is left is loops
  startFrom((links) => links.size !== 2);
  startFrom(() => true);
  return runs;
}

const midpoint = (a: Point, b: Point): Point => ({ x: (a.x + b.x) / 2, y: (a.y + b.y) / 2 });

/**
 * SVG path for a run. The curve passes through the middle of each wall and
 * bends towards each corner without reaching it. Cutting corners like this,
 * rather than threading a curve through them, means the line can never swing
 * out wider than the straight walls did.
 */
export function curvePath({ points, closed }: WallRun): string {
  const at = (p: Point) => `${p.x.toFixed(2)} ${p.y.toFixed(2)}`;
  const count = points.length;

  if (closed) {
    let path = `M ${at(midpoint(points[count - 1], points[0]))}`;
    points.forEach((p, i) => {
      path += ` Q ${at(p)} ${at(midpoint(p, points[(i + 1) % count]))}`;
    });
    return `${path} Z`;
  }

  let path = `M ${at(points[0])} L ${at(midpoint(points[0], points[1]))}`;
  for (let i = 1; i < count - 1; i++) {
    path += ` Q ${at(points[i])} ${at(midpoint(points[i], points[i + 1]))}`;
  }
  return `${path} L ${at(points[count - 1])}`;
}
