import { SeededRandom } from './random';

/** An open pen loop, including a short overshoot that crosses its starting arc. */
export function sketchedLoop(seed: number | string, {
  cx = 50, cy = 50, rx = 44, ry = 44, span = 0,
}: { cx?: number; cy?: number; rx?: number; ry?: number; span?: number } = {}): { d: string; finish: string } {
  let hash = 2166136261;
  for (const char of String(seed)) hash = Math.imul(hash ^ char.charCodeAt(0), 16777619);
  const random = new SeededRandom(hash);
  // Most pen joins sit near the top, with an occasional side or bottom join.
  const start = random.next() < 0.82 ? random.nextFloat(-0.14, 0.14) : random.next();
  const overshoot = random.nextFloat(0.045, 0.10);
  const hookSign = random.next() < 0.8 ? 1 : -1;
  const hookStrength = span ? 0.55 : 1;
  const outer = random.nextFloat(0.04, 0.07) * hookStrength;
  const inner = random.nextFloat(0.15, 0.24) * hookStrength;
  const phase = random.nextFloat(0, Math.PI * 2);
  const phase2 = random.nextFloat(0, Math.PI * 2);
  const stretchLimit = rx / (rx + span / 2);
  const tilt = random.nextFloat(-0.17, 0.17) * stretchLimit;
  const sx = 1 + random.nextFloat(-0.065, 0.065) * stretchLimit, sy = random.nextFloat(0.95, 1.05);
  const cap = Math.PI * Math.sqrt((rx * rx + ry * ry) / 2);
  const perimeter = 2 * span + 2 * cap;
  const base = (fraction: number) => {
    let distance = ((fraction % 1 + 1) % 1) * perimeter;
    if (span && distance < span) return { x: -span / 2 + distance, y: -ry };
    distance -= span;
    if (distance < cap) {
      const a = -Math.PI / 2 + distance / cap * Math.PI;
      return { x: span / 2 + rx * Math.cos(a), y: ry * Math.sin(a) };
    }
    distance -= cap;
    if (span && distance < span) return { x: span / 2 - distance, y: ry };
    distance -= span;
    const a = Math.PI / 2 + distance / cap * Math.PI;
    return { x: -span / 2 + rx * Math.cos(a), y: ry * Math.sin(a) };
  };
  const count = Math.ceil(64 * (1 + span / (Math.PI * (rx + ry))));
  const points = Array.from({ length: count + 1 }, (_, i) => {
    const t = i / count * (1 + overshoot);
    const a = (start + t) * Math.PI * 2;
    // Broad asymmetry makes a loose loop rather than a noisy, wiggly ellipse.
    // A deliberate pen flick then crosses the starting arc and curls away.
    const ramp = Math.max(0, Math.min(1, (t - 0.87) / 0.13));
    const end = Math.max(0, (t - 1) / overshoot);
    const ease = end * end * (3 - 2 * end);
    const tail = hookSign * (t <= 1 ? outer * ramp * ramp * (3 - 2 * ramp) : outer * (1 - ease) - inner * ease);
    const wobble = 0.065 * Math.sin(a + phase) + 0.04 * Math.sin(a * 2 + phase2) + 0.012 * Math.sin(a * 3 + phase) + tail;
    const p = base(start + t);
    const x = p.x * sx + (p.x / Math.max(rx + span / 2, 1)) * rx * wobble;
    const y = p.y * sy + (p.y / Math.max(ry, 1)) * ry * wobble;
    return { x: cx + x * Math.cos(tilt) - y * Math.sin(tilt), y: cy + x * Math.sin(tilt) + y * Math.cos(tilt) };
  });
  const at = (p: { x: number; y: number }) => `${p.x.toFixed(2)} ${p.y.toFixed(2)}`;
  const path = (first: number) => {
    let d = `M${at(points[first])}`;
    for (let i = first; i < points.length - 1; i++) {
      const a = points[Math.max(0, i - 1)], b = points[i], c = points[i + 1], e = points[Math.min(points.length - 1, i + 2)];
      d += `C${at({ x: b.x + (c.x - a.x) / 6, y: b.y + (c.y - a.y) / 6 })} ${at({ x: c.x - (e.x - b.x) / 6, y: c.y - (e.y - b.y) / 6 })} ${at(c)}`;
    }
    return d;
  };
  // Keep the short finishing gesture continuous so dashes cannot hide the hook.
  return { d: path(0), finish: path(Math.floor(count / (1 + overshoot))) };
}
