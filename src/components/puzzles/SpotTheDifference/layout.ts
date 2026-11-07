import { CELL_SIZE_MM } from '../../../types/puzzle';
import type { Feature, GeneratedScene } from './generator';

const SCENE_ASPECT = 600 / 390;

export function pictureLayout(columns: number, rows: number) {
  const width = columns * CELL_SIZE_MM - 3;
  // Padding, the single-line heading and the gap below it (all in mm).
  const height = rows * CELL_SIZE_MM - 3 - 3.2 * 1.3 - 1.5;
  const acrossScale = Math.min((width - 2) / 2 / 600, height / 390);
  const stackedScale = Math.min(width / 600, (height - 2) / 2 / 390);
  const across = acrossScale >= stackedScale;
  return { across, aspect: across ? (width - 2) / 2 / height : width / ((height - 2) / 2) };
}

const ANCHORS = {
  // Grow the kite upwards and the birdhouse downwards, preserving their gap.
  kite: [244, 142, .4, .12],
  cottage: [435, 262, .78, .48],
  tree: [100, 272, .1, .48],
  birdhouse: [235, 149, .4, .48],
  flower: [66, 353, .08, .9],
  cat: [176, 351, .25, .86],
  can: [290, 350, .46, .9],
  pond: [490, 350, .82, .9],
} as const;

export type ScenePart = keyof typeof ANCHORS;
export const FEATURE_PART: Record<Feature, ScenePart> = {
  kite: 'kite', chimney: 'cottage', window: 'cottage', door: 'cottage',
  fruit: 'tree', birdhouse: 'birdhouse', flower: 'flower', cat: 'cat', can: 'can', duck: 'pond',
};

/** Extend the world and move its objects, preserving their proportions.
 * The same transforms position the illustration and its answer marks.
 */
export function sceneLayout(aspect = SCENE_ASPECT, scene?: GeneratedScene) {
  const width = Math.max(600, 390 * aspect);
  const height = Math.max(390, 600 / aspect);
  const dx = width - 600;
  const dy = height - 390;
  const scale = 1 + Math.min(.15, Math.max(dx / 600, dy / 390) * .35);
  const isForeground = (part: ScenePart) => ['flower', 'cat', 'can', 'pond'].includes(part);
  // Ground slots reserve physical space; do not inflate objects into neighbours
  // when a tall panel adds vertical space without adding horizontal room.
  const partScale = (part: ScenePart) => (isForeground(part) || scene?.placements[part] ? 1 : scale) * (scene?.placements[part]?.scale ?? 1);
  const mapping = (part: ScenePart) => {
    const [ax, ay, fx, fy] = ANCHORS[part];
    const placement = scene?.placements[part];
    const flipped = isForeground(part) ? scene?.foregroundFlipped : scene?.backgroundFlipped;
    const cx = placement ? placement.x + dx * (placement.x / 600) : ax + dx * fx;
    const cy = ay + dy * fy + (placement?.y ?? 0);
    return { ax, ay, cx: flipped ? width - cx : cx, cy,
      sx: partScale(part) * (flipped ? -1 : 1) * (placement?.flipped ? -1 : 1), sy: partScale(part) };
  };
  const point = (part: ScenePart, x: number, y: number) => {
    const { ax, ay, cx, cy, sx, sy } = mapping(part);
    return { x: cx + (x - ax) * sx, y: cy + (y - ay) * sy };
  };
  const transform = (part: ScenePart) => {
    const p = point(part, 0, 0);
    const { sx, sy } = mapping(part);
    return `translate(${p.x} ${p.y}) scale(${sx} ${sy})`;
  };
  return { width, height, dx, dy, scale, partScale, point, transform };
}
