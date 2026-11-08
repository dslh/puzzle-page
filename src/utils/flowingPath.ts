export interface InkPoint { x: number; y: number }

/**
 * A restrained pen stroke: round bends inside a small radius and bow straight
 * runs very slightly. Endpoints stay exact; no randomness changes on rerender.
 * Keep radius below the corridor's clearance when following a maze.
 */
export function flowingPath(points: readonly InkPoint[], radius = 0, bow = 0): string {
  if (!points.length) return '';
  const point = (p: InkPoint) => `${p.x} ${p.y}`;
  const toward = (a: InkPoint, b: InkPoint, distance: number): InkPoint => {
    const length = Math.hypot(b.x - a.x, b.y - a.y);
    return length ? { x: a.x + (b.x - a.x) * distance / length, y: a.y + (b.y - a.y) * distance / length } : a;
  };
  let last = points[0];
  let d = `M${point(last)}`;
  const strokeTo = (to: InkPoint, index: number) => {
    const dx = to.x - last.x, dy = to.y - last.y;
    const length = Math.hypot(dx, dy);
    if (!length) return;
    const sway = Math.min(bow, length * 0.035) * (index % 2 ? 1 : -1);
    const nx = -dy / length * sway, ny = dx / length * sway;
    d += `C${last.x + dx / 3 + nx} ${last.y + dy / 3 + ny} ${last.x + dx * 2 / 3 + nx} ${last.y + dy * 2 / 3 + ny} ${point(to)}`;
    last = to;
  };
  for (let i = 1; i < points.length - 1; i++) {
    const prev = points[i - 1], corner = points[i], next = points[i + 1];
    const distance = Math.min(radius, Math.hypot(corner.x - prev.x, corner.y - prev.y) * 0.22,
      Math.hypot(next.x - corner.x, next.y - corner.y) * 0.22);
    const before = toward(corner, prev, distance), after = toward(corner, next, distance);
    strokeTo(before, i);
    if (distance) d += `Q${point(corner)} ${point(after)}`;
    last = after;
  }
  if (points.length > 1) strokeTo(points[points.length - 1], points.length);
  return d;
}
