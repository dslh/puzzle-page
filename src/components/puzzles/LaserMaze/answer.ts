import type { LaserMazePuzzle, PathPoint } from './generator';

/**
 * Points in grid-cell units, with a separate contact on each face of a mirror.
 * Two reflections at the exact centre merge into a cross that looks like a
 * beam passing straight through the glass. Small offsets along the mirror
 * separate those elbows while keeping each contact on the glass itself.
 */
export function laserAnswerPoints(puzzle: LaserMazePuzzle): PathPoint[] {
  const hits = new Map<string, number>();
  for (const p of puzzle.solutionPath) if (puzzle.mirrors[p.y][p.x]) {
    const key = `${p.x},${p.y}`;
    hits.set(key, (hits.get(key) ?? 0) + 1);
  }
  const points = [{ x: puzzle.entry.position + 0.5, y: 0 }];
  for (let i = 0; i < puzzle.solutionPath.length; i++) {
    const here = puzzle.solutionPath[i];
    const mirror = puzzle.mirrors[here.y][here.x];
    if (!mirror) continue;
    const previous = puzzle.solutionPath[i - 1] ?? { x: here.x, y: -1 };
    // The incoming side is the sign of the mirror plane's normal.
    const side = Math.sign(previous.x - here.x + (mirror === '/' ? 1 : -1) * (previous.y - here.y));
    // Keep ordinary reflections on their exact grid centre.
    const offset = hits.get(`${here.x},${here.y}`)! > 1 ? side * 0.1 : 0;
    points.push({ x: here.x + 0.5 + offset, y: here.y + 0.5 + (mirror === '/' ? -offset : offset) });
  }
  const exit = puzzle.exits.find(e => e.isCorrectExit);
  if (exit) points.push({ x: exit.side === 'left' ? 0 : puzzle.gridSize, y: exit.position + 0.5 });
  return points;
}
