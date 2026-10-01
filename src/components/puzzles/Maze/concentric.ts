import type { Grid, GridCell, Point } from './grids';

/**
 * Concentric mazes: rings of cells around a centre cell, each ring a scaled
 * copy of one outline (a circle, a star, ...). Rays from the centre divide a
 * ring into sectors, and a sector splits in two as the rings get bigger, so
 * the cells stay roughly the same width all the way out. The maze runs from
 * the top-left of the rim to the bottom-right, like the tiled ones.
 *
 * Any outline works as long as it is star-shaped about the origin: every ray
 * from the centre must cross it exactly once. A circle is drawn as a polygon
 * with enough sides that nobody can tell.
 */

export interface OutlineSpec {
  /** Corners of the outline, star-shaped about the origin. Any order. */
  vertices: Point[];
  /** The outline's rotational symmetry; the first ring gets a multiple of this many sectors. */
  symmetry: number;
  /**
   * Width of the rings where the outline comes closest to the centre, in
   * square cells. Rings are scaled copies of the outline, so a shape whose
   * tips reach much further out than its notches has to accept narrower
   * notches to get a worthwhile number of rings in.
   */
  ringWidth: number;
}
/** Width to aim for in the first ring's cells, in square cells. */
const FIRST_RING_WIDTH = 1.2;
/** A sector splits in two when its outer edge gets longer than this. */
const MAX_CELL_WIDTH = 1.5;
/** Sides for the polygon that stands in for a circle. */
const CIRCLE_SIDES = 90;
/** Notch radius of the star, relative to its points. Fatter stars make roomier mazes. */
const STAR_INNER_RADIUS = 0.6;

const TAU = 2 * Math.PI;
/** Angles closer than this are the same angle */
const EPSILON = 1e-9;

export const OUTLINES = {
  circle: regularPolygon(CIRCLE_SIDES, 0, 1),
  // Rotated so the bottom is a flat side rather than a point
  hexring: regularPolygon(6, 0, 6),
  octring: regularPolygon(8, Math.PI / 8, 8),
  // Points reach 1 / 0.6 further than notches, so the notches go narrow
  star: starOutline(5, STAR_INNER_RADIUS, 0.6),
  // The cleft is 0.6 of the way out; this is a 3-ring heart on a 4x4 Large
  heart: heartOutline(0.65),
} satisfies Record<string, OutlineSpec>;

function regularPolygon(sides: number, rotation: number, symmetry: number): OutlineSpec {
  const vertices: Point[] = [];
  for (let i = 0; i < sides; i++) {
    const angle = rotation + (TAU * i) / sides;
    vertices.push({ x: Math.cos(angle), y: Math.sin(angle) });
  }
  return { vertices, symmetry, ringWidth: 0.85 };
}

/** A star with one point straight up. */
function starOutline(points: number, innerRadius: number, ringWidth: number): OutlineSpec {
  const vertices: Point[] = [];
  for (let i = 0; i < points * 2; i++) {
    const angle = -Math.PI / 2 + (Math.PI * i) / points;
    const radius = i % 2 === 0 ? 1 : innerRadius;
    vertices.push({ x: radius * Math.cos(angle), y: radius * Math.sin(angle) });
  }
  return { vertices, symmetry: points, ringWidth };
}

/**
 * A heart built from two round lobes joined to the point by curves that leave
 * each lobe along its tangent: convex all the way round except at the cleft,
 * and with a shallow cleft so the rings don't pinch there. The lobes are unit
 * circles centred at (±lobeOffset, 0), the point is at (0, -depth), and the
 * lower curves leave the lobes `exit` below horizontal and meet at the point
 * `halfAngle` either side of vertical.
 *
 * Centred at (0, centreY): every ray from there crosses the outline once, and
 * it is the point on the axis that keeps the rings widest at the cleft.
 */
function heartOutline(ringWidth: number): OutlineSpec {
  const lobeOffset = 0.8;
  const depth = 2.4;
  const exit = (30 * Math.PI) / 180;
  const halfAngle = (45 * Math.PI) / 180;
  const centreY = -0.62;
  const lobeSamples = 42;
  const curveSamples = 18;

  // Right half, in maths coordinates (y up): from the cleft over the lobe
  const right: Point[] = [];
  const cleftAngle = Math.acos(-lobeOffset);
  for (let i = 0; i <= lobeSamples; i++) {
    const a = cleftAngle - ((cleftAngle + exit) * i) / lobeSamples;
    right.push({ x: lobeOffset + Math.cos(a), y: Math.sin(a) });
  }
  // Then down to the point along a quadratic Bezier, whose control point is
  // where the lobe's tangent meets the line leaving the point
  const p0 = right[right.length - 1];
  const d0 = { x: -Math.sin(exit), y: -Math.cos(exit) };
  const p2 = { x: 0, y: -depth };
  const d2 = { x: Math.sin(halfAngle), y: Math.cos(halfAngle) };
  const det = -d0.x * d2.y + d0.y * d2.x;
  const s = (-(p2.x - p0.x) * d2.y + (p2.y - p0.y) * d2.x) / det;
  const p1 = { x: p0.x + s * d0.x, y: p0.y + s * d0.y };
  for (let i = 1; i <= curveSamples; i++) {
    const t = i / curveSamples;
    const u = 1 - t;
    right.push({
      x: u * u * p0.x + 2 * u * t * p1.x + t * t * p2.x,
      y: u * u * p0.y + 2 * u * t * p1.y + t * t * p2.y,
    });
  }

  // Mirror for the left half, leaving out the shared cleft and point
  const vertices = [...right];
  for (let i = right.length - 2; i >= 1; i--) vertices.push({ x: -right[i].x, y: right[i].y });

  // Move the origin to the centre, flip to screen coordinates, scale to radius 1
  const shifted = vertices.map((v) => ({ x: v.x, y: -(v.y - centreY) }));
  const radius = Math.max(...shifted.map((v) => Math.hypot(v.x, v.y)));
  return {
    vertices: shifted.map((v) => ({ x: v.x / radius, y: v.y / radius })),
    symmetry: 2,
    ringWidth,
  };
}

function distanceToSegment(p: Point, a: Point, b: Point): number {
  const dx = b.x - a.x;
  const dy = b.y - a.y;
  const t = Math.max(0, Math.min(1, ((p.x - a.x) * dx + (p.y - a.y) * dy) / (dx * dx + dy * dy)));
  return Math.hypot(p.x - a.x - t * dx, p.y - a.y - t * dy);
}

/**
 * An outline indexed by angle. Angles are measured from `origin` and run
 * 0..TAU, so a sector never has to wrap around.
 */
class Outline {
  private readonly angles: number[];
  private readonly points: Point[];
  private readonly origin: number;

  constructor(vertices: Point[], origin: number) {
    this.origin = origin;
    const sorted = vertices
      .map((p) => ({ p, u: this.angleOf(p) }))
      .sort((a, b) => a.u - b.u);
    // Repeat the last vertex a turn early and the first a turn late, so the
    // closing edge is there to find whichever side of it an angle falls
    const last = sorted[sorted.length - 1];
    this.points = [last.p, ...sorted.map((v) => v.p), sorted[0].p];
    this.angles = [last.u - TAU, ...sorted.map((v) => v.u), sorted[0].u + TAU];
  }

  /** Angle of a point from the origin direction, in 0..TAU */
  angleOf(p: Point): number {
    return (((Math.atan2(p.y, p.x) - this.origin) % TAU) + TAU) % TAU;
  }

  /** Where the ray at angle u crosses the outline */
  pointAt(u: number): Point {
    let i = 0;
    while (i < this.angles.length - 2 && this.angles[i + 1] <= u + EPSILON) i++;
    if (Math.abs(this.angles[i] - u) <= EPSILON) return this.points[i];

    const p = this.points[i];
    const q = this.points[i + 1];
    const d = { x: Math.cos(u + this.origin), y: Math.sin(u + this.origin) };
    // Point on pq that is parallel to d
    const t = (p.x * d.y - p.y * d.x) / ((p.x - q.x) * d.y - (p.y - q.y) * d.x);
    return { x: p.x + t * (q.x - p.x), y: p.y + t * (q.y - p.y) };
  }

  /** The outline from angle u1 round to u2, corners included */
  pathBetween(u1: number, u2: number): Point[] {
    const path = [this.pointAt(u1)];
    for (let i = 1; i < this.angles.length - 1; i++) {
      if (this.angles[i] > u1 + EPSILON && this.angles[i] < u2 - EPSILON) path.push(this.points[i]);
    }
    path.push(this.pointAt(u2));
    return path;
  }

  length(u1: number, u2: number): number {
    const path = this.pathBetween(u1, u2);
    let total = 0;
    for (let i = 1; i < path.length; i++) total += Math.hypot(path[i].x - path[i - 1].x, path[i].y - path[i - 1].y);
    return total;
  }

  /** The angle at which a fraction of the outline between u1 and u2 has gone by */
  angleAtFraction(u1: number, u2: number, fraction: number): number {
    const path = this.pathBetween(u1, u2);
    let remaining = this.length(u1, u2) * fraction;
    for (let i = 1; i < path.length; i++) {
      const a = path[i - 1];
      const b = path[i];
      const segment = Math.hypot(b.x - a.x, b.y - a.y);
      if (segment >= remaining) {
        const t = remaining / segment;
        const u = this.angleOf({ x: a.x + t * (b.x - a.x), y: a.y + t * (b.y - a.y) });
        // Keep it strictly inside the sector however the rounding falls
        return Math.min(Math.max(u, u1 + EPSILON), u2 - EPSILON);
      }
      remaining -= segment;
    }
    return (u1 + u2) / 2;
  }

  perimeter(): number {
    return this.length(0, TAU);
  }

  /** Distance from the centre to the nearest part of the outline */
  inradius(): number {
    let min = Infinity;
    for (let i = 1; i < this.points.length; i++) {
      min = Math.min(min, distanceToSegment({ x: 0, y: 0 }, this.points[i - 1], this.points[i]));
    }
    return min;
  }
}

/** Distance from a point to the nearest side of a polygon */
function clearance(p: Point, corners: Point[]): number {
  return Math.min(...corners.map((c, i) => distanceToSegment(p, c, corners[(i + 1) % corners.length])));
}

interface Sector {
  cell: number;
  from: number;
  to: number;
  parent: number;
  children: number[];
  /** Angle at which this sector's children part, when it has two */
  split?: number;
}

export function buildConcentricGrid(spec: OutlineSpec, width: number, height: number): Grid {
  // Fit the outline's bounding box into the area
  const xs = spec.vertices.map((v) => v.x);
  const ys = spec.vertices.map((v) => v.y);
  const bounds = { x: Math.min(...xs), y: Math.min(...ys), w: Math.max(...xs) - Math.min(...xs), h: Math.max(...ys) - Math.min(...ys) };
  const scale = Math.min(width / bounds.w, height / bounds.h);

  // Ring boundaries sit at step, 2 * step, ..., levels * step
  const unit = new Outline(spec.vertices, 0);
  const levels = Math.max(2, Math.floor((scale * unit.inradius()) / spec.ringWidth));
  const step = scale / levels;

  // Sectors of the first ring; as many as make the cells about FIRST_RING_WIDTH
  // wide, rounded to the outline's symmetry. Angles are measured from half a
  // sector before straight down, so the top and bottom (a star's point, a
  // heart's cleft) sit in the middle of a cell rather than on a wall.
  const ideal = (unit.perimeter() * 2 * step) / FIRST_RING_WIDTH;
  const sectors = Math.max(3, Math.ceil(ideal / spec.symmetry) * spec.symmetry);
  const outline = new Outline(spec.vertices, Math.PI / 2 - Math.PI / sectors);

  // First pass: decide the sectors ring by ring. Cell 0 is the centre.
  const rings: Sector[][] = [];
  let nextCell = 1;
  rings.push(
    Array.from({ length: sectors }, (_, i) => ({
      cell: nextCell++,
      from: (TAU * i) / sectors,
      to: (TAU * (i + 1)) / sectors,
      parent: 0,
      children: [],
    }))
  );
  for (let ring = 1; ring < levels - 1; ring++) {
    const outer: Sector[] = [];
    for (const sector of rings[ring - 1]) {
      const edge = outline.length(sector.from, sector.to) * (ring + 2) * step;
      const splitAt = edge > MAX_CELL_WIDTH ? outline.angleAtFraction(sector.from, sector.to, 0.5) : undefined;
      const ranges = splitAt === undefined ? [[sector.from, sector.to]] : [[sector.from, splitAt], [splitAt, sector.to]];
      sector.split = splitAt;
      for (const [from, to] of ranges) {
        const child = { cell: nextCell++, from, to, parent: sector.cell, children: [] };
        sector.children.push(child.cell);
        outer.push(child);
      }
    }
    rings.push(outer);
  }

  const at = (radius: number, u: number): Point => {
    const p = outline.pointAt(u);
    return { x: p.x * radius, y: p.y * radius };
  };
  const along = (radius: number, u1: number, u2: number): Point[] =>
    outline.pathBetween(u1, u2).map((p) => ({ x: p.x * radius, y: p.y * radius }));

  // The middle of a sector is a poor place for a marker when the cell bends
  // round a point of the outline, so try a few spots and keep the one with
  // the most room around it.
  const roomiestPoint = (corners: Point[], sector: Sector, inner: number, outer: number): Point => {
    let best = { point: corners[0], room: -1 };
    for (const r of [0.3, 0.5, 0.7]) {
      for (const f of [0.2, 0.35, 0.5, 0.65, 0.8]) {
        const point = at(inner + r * (outer - inner), outline.angleAtFraction(sector.from, sector.to, f));
        const room = clearance(point, corners);
        if (room > best.room) best = { point, room };
      }
    }
    return best.point;
  };

  const cells: GridCell[] = [];

  // Centre cell: the inner edge of every first-ring sector, in order
  const centreCorners: Point[] = [];
  const centreNeighbors: number[] = [];
  for (const sector of rings[0]) {
    const edge = along(step, sector.from, sector.to);
    edge.pop(); // The next sector starts with this point
    centreCorners.push(...edge);
    centreNeighbors.push(...edge.map(() => sector.cell));
  }
  cells.push({ center: { x: 0, y: 0 }, corners: centreCorners, neighbors: centreNeighbors });

  // Ring cells, clockwise from the inner edge
  rings.forEach((ring, ringIndex) => {
    const inner = (ringIndex + 1) * step;
    const outer = (ringIndex + 2) * step;
    ring.forEach((sector, i) => {
      const corners: Point[] = [];
      const neighbors: number[] = [];
      // A run of corners whose sides all face the same neighbour. The last
      // corner is where the next run starts, so its side belongs to that run.
      const add = (points: Point[], neighbor: number) => {
        corners.push(...points.slice(0, -1));
        neighbors.push(...points.slice(0, -1).map(() => neighbor));
      };

      // Inner edge, then the radial wall out to the next sector
      add(along(inner, sector.from, sector.to), sector.parent);
      add([at(inner, sector.to), at(outer, sector.to)], ring[(i + 1) % ring.length].cell);
      // Outer edge back the other way, one run per child
      const outerRanges =
        sector.split === undefined ? [[sector.from, sector.to]] : [[sector.split, sector.to], [sector.from, sector.split]];
      outerRanges.forEach(([from, to], j) => {
        const child = sector.children.length === 0 ? -1 : sector.children[sector.children.length - 1 - j];
        add(along(outer, from, to).reverse(), child);
      });
      // Radial wall back in to the previous sector, closing the outline
      add([at(outer, sector.from), at(inner, sector.from)], ring[(i + ring.length - 1) % ring.length].cell);

      // That went round anticlockwise; turn it over so side i still runs from
      // corner i to corner i + 1
      corners.reverse();
      neighbors.reverse();
      neighbors.push(neighbors.shift()!);

      cells.push({ center: roomiestPoint(corners, sector, inner, outer), corners, neighbors });
    });
  });

  // Start and finish on the rim, as near top-left and bottom-right as the
  // outline allows: a cell in a sharp point (the bottom of a heart) has no
  // room for a marker. Such cells have well under half the room of the
  // roomiest; the cells either side of a point have about half or more.
  const outerRing = rings[rings.length - 1];
  const room = outerRing.map((s) => clearance(cells[s.cell].center, cells[s.cell].corners));
  const roomiest = Math.max(...room);
  const rimCell = (direction: number): number => {
    const target = outline.angleOf({ x: Math.cos(direction), y: Math.sin(direction) });
    return outerRing
      .filter((_, i) => room[i] >= 0.45 * roomiest)
      .map((s) => {
        const away = Math.abs((s.from + s.to) / 2 - target);
        return { cell: s.cell, away: Math.min(away, TAU - away) };
      })
      .reduce((a, b) => (b.away < a.away ? b : a)).cell;
  };
  const start = rimCell((-3 * Math.PI) / 4);
  const end = rimCell(Math.PI / 4);

  // Shift everything so the bounding box starts at the origin
  const shift = (p: Point): Point => ({ x: p.x - bounds.x * scale, y: p.y - bounds.y * scale });
  for (const cell of cells) {
    cell.center = shift(cell.center);
    cell.corners = cell.corners.map(shift);
  }

  return {
    cells,
    width: bounds.w * scale,
    height: bounds.h * scale,
    inradius: Math.min(clearance(cells[start].center, cells[start].corners), clearance(cells[end].center, cells[end].corners)),
    start,
    end,
  };
}
