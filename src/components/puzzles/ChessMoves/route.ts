import type { ChessPiece } from './generator';

/*
 * Drawing a piece's route: Collect the Stars and Treasure Chess share it.
 * Squares are numbered `y * cols + x`, as in the generator.
 */

export type Point = [number, number];

export function starPath(cx: number, cy: number, r: number): string {
  return Array.from({ length: 10 }, (_, i) => {
    const angle = -Math.PI / 2 + i * Math.PI / 5;
    const radius = i % 2 ? r * 0.45 : r;
    return `${i ? 'L' : 'M'}${(cx + radius * Math.cos(angle)).toFixed(2)} ${(cy + radius * Math.sin(angle)).toFixed(2)}`;
  }).join('') + 'Z';
}

/** Each move's corners, start to landing. Knight hops go two then one, the way children are taught to count them. */
export function routeMoves(route: number[], cols: number, piece: ChessPiece, centre: (square: number) => Point): Point[][] {
  return route.slice(1).map((square, i) => {
    const from = centre(route[i]), to = centre(square);
    if (piece !== 'knight') return [from, to];
    const corner: Point = Math.abs(square % cols - route[i] % cols) === 2 ? [to[0], from[1]] : [from[0], to[1]];
    return [from, corner, to];
  });
}

export function routePath(moves: Point[][]): string {
  return moves.map((points, i) => points.slice(i ? 1 : 0).map(([x, y], j) => `${i || j ? 'L' : 'M'}${x} ${y}`).join('')).join('');
}

/**
 * An arrowhead at the end of every move, just short of where it lands, so a
 * route that doubles back still reads in order.
 */
export function routeArrows(moves: Point[][], size: number, gap: number): string {
  return moves.map(points => {
    const [fx, fy] = points[points.length - 2], [tx, ty] = points[points.length - 1];
    const length = Math.hypot(tx - fx, ty - fy);
    const ux = (tx - fx) / length, uy = (ty - fy) / length;
    const x = tx - ux * gap, y = ty - uy * gap;
    const wing = (side: number) => `${x - size * (ux - side * uy * 0.75)} ${y - size * (uy + side * ux * 0.75)}`;
    return `M${wing(1)}L${x} ${y}L${wing(-1)}`;
  }).join('');
}
