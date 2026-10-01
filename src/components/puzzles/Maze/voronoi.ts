import type { Grid, Point } from './grids';
import { centroid, gridFromPolygons } from './polygons';

/**
 * Voronoi mazes: scatter points over the area and give each one the ground
 * that is nearer to it than to any other. The cells come out as irregular
 * polygons, like crazy paving, and are different for every seed.
 */

/**
 * Average distance between points, in square cells. More than 1 because an
 * irregular cell wastes some of its room on tight corners.
 */
const SITE_SPACING = 1.15;
/**
 * Raw random points make slivers and pinched cells. Moving each point to the
 * middle of its cell and starting again evens them out; a couple of rounds
 * leaves cells a pencil can get through that still look irregular.
 */
const RELAXATION_ROUNDS = 2;
/** Sides shorter than this are too tight a squeeze, so they are always walls. */
const MIN_GAP = 0.5;
/** A corner this close to a cutting line is on it. */
const TOLERANCE = 1e-9;

/**
 * The part of a convex cell that is nearer to site than to other. A corner
 * already on the line stays as it is: cutting along an existing side must not
 * move anything, or rounding error would leave a stray corner part-way along
 * it and the side would no longer match the neighbour's.
 */
function cutBack(cell: Point[], site: Point, other: Point): Point[] {
  const nx = other.x - site.x;
  const ny = other.y - site.y;
  const midX = (site.x + other.x) / 2;
  const midY = (site.y + other.y) / 2;
  // Negative on the site's side of the line half-way between the two
  const side = (p: Point) => (p.x - midX) * nx + (p.y - midY) * ny;

  const kept: Point[] = [];
  cell.forEach((a, i) => {
    const b = cell[(i + 1) % cell.length];
    const sa = side(a);
    const sb = side(b);
    if (sa <= TOLERANCE) kept.push(a);
    if ((sa < -TOLERANCE && sb > TOLERANCE) || (sa > TOLERANCE && sb < -TOLERANCE)) {
      const t = sa / (sa - sb);
      kept.push({ x: a.x + t * (b.x - a.x), y: a.y + t * (b.y - a.y) });
    }
  });
  return kept;
}

/** Each site's cell, clipped to the area. Sites are in rows of `cols`, roughly. */
function voronoiCells(sites: Point[], cols: number, width: number, height: number): Point[][] {
  return sites.map((site, i) => {
    let cell: Point[] = [
      { x: 0, y: 0 },
      { x: width, y: 0 },
      { x: width, y: height },
      { x: 0, y: height },
    ];
    // A site more than twice as far away as the cell's furthest corner cannot
    // cut anything off it. Squared, to compare with squared distances.
    let reach = Infinity;
    const cut = (other: Point) => {
      const distance = (other.x - site.x) ** 2 + (other.y - site.y) ** 2;
      if (other === site || distance >= reach) return;
      cell = cutBack(cell, site, other);
      reach = 4 * Math.max(...cell.map((p) => (p.x - site.x) ** 2 + (p.y - site.y) ** 2));
    };

    // The sites that started out alongside do most of the cutting, and once
    // they have, nearly all of the rest are out of reach. They come round
    // again with the rest, which changes nothing.
    for (const j of [i - 1, i + 1, i - cols, i + cols]) {
      if (sites[j]) cut(sites[j]);
    }
    sites.forEach(cut);
    return cell;
  });
}

export function buildVoronoiGrid(width: number, height: number, random: () => number): Grid {
  const cols = Math.max(2, Math.round(width / SITE_SPACING));
  const rows = Math.max(2, Math.round(height / SITE_SPACING));

  // One point somewhere in each square of a grid: random, but with no big
  // clumps or holes
  let sites: Point[] = [];
  for (let row = 0; row < rows; row++) {
    for (let col = 0; col < cols; col++) {
      sites.push({ x: ((col + random()) * width) / cols, y: ((row + random()) * height) / rows });
    }
  }
  for (let round = 0; round < RELAXATION_ROUNDS; round++) {
    sites = voronoiCells(sites, cols, width, height).map(centroid);
  }

  return gridFromPolygons(voronoiCells(sites, cols, width, height), MIN_GAP);
}
