/*
 * The island's coastline, traced around whichever squares are land.
 *
 * The coast never decides which squares are walkable - that's settled square
 * by square before this runs. It only has to look hand-drawn while keeping
 * every land square's middle on land and every sea square wholly at sea.
 *
 * It works on a field over the map, in square units: the distance to the
 * nearest sea "core" minus the distance to the nearest land core, plus a
 * little wobble. Land cores are the middle of each land square, sea cores are
 * whole sea squares plus a strip just inside the map's edge, so the coast runs
 * along the edge squares' outer part, leaving them walkable beach. The coast
 * is where the field crosses zero; the echo lines out to sea are other levels.
 */

export interface Wobble {
  /** Spatial frequencies, in waves per square, and phases of a few sine terms. */
  terms: { fx: number; fy: number; phase: number }[];
}

/** Land cores stop this far short of each side of their square. */
const CORE_INSET = 0.2;
/** Edge squares give up this much more on the side facing the map edge. */
const EDGE_INSET = 0.3;
/** The sea strip just inside the map edge is this deep. */
const EDGE_SEA = 0.2;
/**
 * The wobble's largest swing in the field. The field changes twice as fast as
 * the coast moves, so the coast shifts at most half this either way - never
 * past a land core's edge beside a sea square.
 */
const WOBBLE = 0.2;
/** Field levels for the echo lines, seaward of the coast. */
const ECHO_LEVELS = [-0.07, -0.14];
/** Field samples per square side. */
const SAMPLES = 10;

type Pt = [number, number];

/** Distance from a point to an axis-aligned box; zero inside it. */
function boxDistance(px: number, py: number, x0: number, y0: number, x1: number, y1: number) {
  const dx = Math.max(x0 - px, 0, px - x1);
  const dy = Math.max(y0 - py, 0, py - y1);
  return Math.hypot(dx, dy);
}

function makeField(cols: number, rows: number, sea: Set<string>, wobble: Wobble) {
  // A core reaches right across to a land neighbour, so a straight stretch of
  // coast doesn't dip in between every pair of squares
  const inset = (x: number, y: number) =>
    x < 0 || y < 0 || x >= cols || y >= rows ? EDGE_INSET : sea.has(`${x},${y}`) ? CORE_INSET : 0;
  const landCore = (x: number, y: number): [number, number, number, number] => [
    x + inset(x - 1, y),
    y + inset(x, y - 1),
    x + 1 - inset(x + 1, y),
    y + 1 - inset(x, y + 1),
  ];

  return (px: number, py: number) => {
    // Distance to the edge strip: zero inside it, else how far in from it
    let toSea = Math.max(0, Math.min(px - EDGE_SEA, py - EDGE_SEA, cols - EDGE_SEA - px, rows - EDGE_SEA - py));
    let toLand = Infinity;
    // Only the squares around matter: the field need only be exact near the
    // shore, and anywhere else just has to keep its sign
    const cx = Math.min(cols - 1, Math.floor(px));
    const cy = Math.min(rows - 1, Math.floor(py));
    for (let y = cy - 1; y <= cy + 1; y++) {
      for (let x = cx - 1; x <= cx + 1; x++) {
        if (x < 0 || y < 0 || x >= cols || y >= rows) continue;
        if (sea.has(`${x},${y}`)) {
          toSea = Math.min(toSea, boxDistance(px, py, x, y, x + 1, y + 1));
        } else {
          toLand = Math.min(toLand, boxDistance(px, py, ...landCore(x, y)));
        }
      }
    }
    if (toLand === Infinity) toLand = 2;
    const w = wobble.terms.reduce((sum, t) => sum + Math.sin(t.fx * px + t.fy * py + t.phase), 0);
    return toSea - toLand + (WOBBLE * w) / wobble.terms.length;
  };
}

/** Marching squares: the field's crossings of `level`, joined into polylines. */
function contour(values: number[][], level: number): { points: Pt[]; closed: boolean }[] {
  const ny = values.length;
  const nx = values[0].length;
  const segments: [Pt, Pt][] = [];
  const cross = (x0: number, y0: number, v0: number, x1: number, y1: number, v1: number): Pt => {
    const t = (level - v0) / (v1 - v0);
    return [x0 + t * (x1 - x0), y0 + t * (y1 - y0)];
  };

  for (let j = 0; j < ny - 1; j++) {
    for (let i = 0; i < nx - 1; i++) {
      const a = values[j][i];
      const b = values[j][i + 1];
      const c = values[j + 1][i + 1];
      const d = values[j + 1][i];
      // Crossings on the cell's top, right, bottom and left sides
      const edges: Pt[] = [];
      if ((a > level) !== (b > level)) edges.push(cross(i, j, a, i + 1, j, b));
      if ((b > level) !== (c > level)) edges.push(cross(i + 1, j, b, i + 1, j + 1, c));
      if ((d > level) !== (c > level)) edges.push(cross(i, j + 1, d, i + 1, j + 1, c));
      if ((a > level) !== (d > level)) edges.push(cross(i, j, a, i, j + 1, d));
      if (edges.length === 2) {
        segments.push([edges[0], edges[1]]);
      } else if (edges.length === 4) {
        // Saddle: pair the crossings by the value in the middle
        const mid = (a + b + c + d) / 4 > level;
        if (mid === a > level) {
          segments.push([edges[0], edges[1]], [edges[2], edges[3]]);
        } else {
          segments.push([edges[0], edges[3]], [edges[1], edges[2]]);
        }
      }
    }
  }

  // Join segments that share an end
  const id = ([x, y]: Pt) => `${Math.round(x * 1000)},${Math.round(y * 1000)}`;
  const byEnd = new Map<string, number[]>();
  segments.forEach(([p, q], s) => {
    for (const k of [id(p), id(q)]) byEnd.set(k, [...(byEnd.get(k) ?? []), s]);
  });
  const used = new Set<number>();
  const lines: { points: Pt[]; closed: boolean }[] = [];

  const extend = (points: Pt[]) => {
    for (;;) {
      const next = (byEnd.get(id(points[points.length - 1])) ?? []).find(s => !used.has(s));
      if (next === undefined) return;
      used.add(next);
      const [p, q] = segments[next];
      points.push(id(p) === id(points[points.length - 1]) ? q : p);
    }
  };

  for (let s = 0; s < segments.length; s++) {
    if (used.has(s)) continue;
    used.add(s);
    const points = [...segments[s]];
    extend(points);
    const closed = id(points[0]) === id(points[points.length - 1]);
    if (!closed) {
      points.reverse();
      extend(points);
    }
    lines.push({ points: closed ? points.slice(0, -1) : points, closed });
  }
  return lines;
}

/** Chaikin corner cutting: rounds off the marching-squares steps. */
function smooth(points: Pt[], closed: boolean, rounds = 2): Pt[] {
  let pts = points;
  for (let r = 0; r < rounds; r++) {
    const out: Pt[] = closed ? [] : [pts[0]];
    const n = closed ? pts.length : pts.length - 1;
    for (let i = 0; i < n; i++) {
      const [x0, y0] = pts[i];
      const [x1, y1] = pts[(i + 1) % pts.length];
      out.push([0.75 * x0 + 0.25 * x1, 0.75 * y0 + 0.25 * y1], [0.25 * x0 + 0.75 * x1, 0.25 * y0 + 0.75 * y1]);
    }
    if (!closed) out.push(pts[pts.length - 1]);
    pts = out;
  }
  return pts;
}

function toPath(points: Pt[], closed: boolean, scale: number): string {
  const f = (v: number) => (Math.round(v * scale * 100) / 100).toString();
  return points.map(([x, y], i) => `${i === 0 ? 'M' : 'L'}${f(x)} ${f(y)}`).join(' ') + (closed ? ' Z' : '');
}

/**
 * SVG path data, in mm, for the coast (closed loops, one per island) and the
 * echo lines (may run off the map; clip them).
 */
export function traceCoast(cols: number, rows: number, cellMm: number, sea: Set<string>, wobble: Wobble) {
  const field = makeField(cols, rows, sea, wobble);
  const values: number[][] = [];
  for (let j = 0; j <= rows * SAMPLES; j++) {
    const row: number[] = [];
    for (let i = 0; i <= cols * SAMPLES; i++) row.push(field(i / SAMPLES, j / SAMPLES));
    values.push(row);
  }

  const scale = cellMm / SAMPLES;
  const trace = (level: number) =>
    contour(values, level)
      .filter(line => line.points.length > 3)
      .map(({ points, closed }) => toPath(smooth(points, closed), closed, scale));

  return { coast: trace(0), echoes: ECHO_LEVELS.flatMap(trace) };
}
