import { ART, type ArtName } from './art';
import type { Stamp } from './island';
import styles from './MapIcon.module.css';

/*
 * Kenney's line art, drawn on the treasure island maps (Directions and
 * Treasure Chess) and in their prompts.
 */

/** Line weights, in mm, kept the same whatever size an icon is drawn at. */
const THICK_MM = 0.45;
const THIN_MM = 0.25;

/** An icon from the art set, drawn into an enclosing SVG in mm. */
export function MapIcon({ icon, x, y, size }: Stamp) {
  const { box, thick, thin } = ART[icon];
  const s = size / Math.max(box[2] - box[0], box[3] - box[1]);
  const tx = x - (s * (box[0] + box[2])) / 2;
  const ty = y - (s * (box[1] + box[3])) / 2;
  return (
    <g transform={`translate(${tx} ${ty}) scale(${s})`} className={styles.icon}>
      <path d={thick} strokeWidth={THICK_MM / s} />
      <path d={thin} strokeWidth={THIN_MM / s} />
    </g>
  );
}

/** An icon set into a line of text. */
export function InlineIcon({ icon }: { icon: ArtName }) {
  const { box, thick, thin } = ART[icon];
  // Drawn small, so heavier than the pack's own weights of 2 and 1
  return (
    <svg
      className={`${styles.icon} ${styles.inlineIcon}`}
      viewBox={`${box[0] - 2} ${box[1] - 2} ${box[2] - box[0] + 4} ${box[3] - box[1] + 4}`}
    >
      <path d={thick} strokeWidth={3.5} />
      <path d={thin} strokeWidth={2} />
    </svg>
  );
}
