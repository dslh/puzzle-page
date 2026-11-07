import { CELL_SIZE_MM } from '../../../types/puzzle';
import type { Feature } from './generator';

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
export function sceneLayout(aspect = SCENE_ASPECT) {
  const width = Math.max(600, 390 * aspect);
  const height = Math.max(390, 600 / aspect);
  const dx = width - 600;
  const dy = height - 390;
  const scale = 1 + Math.min(.15, Math.max(dx / 600, dy / 390) * .35);
  const point = (part: ScenePart, x: number, y: number) => {
    const [ax, ay, fx, fy] = ANCHORS[part];
    return { x: ax + dx * fx + (x - ax) * scale, y: ay + dy * fy + (y - ay) * scale };
  };
  const transform = (part: ScenePart) => {
    const p = point(part, 0, 0);
    return `translate(${p.x} ${p.y}) scale(${scale})`;
  };
  return { width, height, dx, dy, scale, point, transform };
}
