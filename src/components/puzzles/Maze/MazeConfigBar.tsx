import type { MazeConfig } from './index';
import type { GridShape } from './grids';
import { MAZE_THEMES, themeId } from './themes';
import { OUTLINES } from './concentric';
import type { Grain, Turns } from './generator';
import styles from './MazeConfigBar.module.css';

const GRID_SHAPES: { group: string; shapes: [GridShape, string][] }[] = [
  {
    group: 'Tiled',
    shapes: [
      ['square', 'Squares'],
      ['hex', 'Hexagons'],
      ['triangle', 'Triangles'],
      ['rhombille', 'Rhombuses'],
      ['snubsquare', 'Squares + triangles'],
      ['cairo', 'Pentagons'],
      ['voronoi', 'Crazy paving'],
    ],
  },
  {
    group: 'Rings',
    shapes: [
      ['circle', 'Circle'],
      ['hexring', 'Hexagon'],
      ['octring', 'Octagon'],
      ['star', 'Star'],
      ['heart', 'Heart'],
    ],
  },
];

/** [option, label on tilings, label on rings, tooltip] */
const GRAINS: [Grain, string, string, string][] = [
  ['across', 'Across', 'Round', 'Passages mostly run across (round, on rings)'],
  ['even', 'Even', 'Even', 'Passages run every way'],
  ['down', 'Down', 'Out', 'Passages mostly run up and down (out from the middle, on rings)'],
];

const TURNS: [Turns, string, string][] = [
  ['straight', 'Long runs', 'Passages tend to carry straight on'],
  ['mixed', 'Mixed', 'Straight runs and turns'],
  ['zigzag', 'Zig-zag', 'Passages tend to turn at every cell'],
];

interface MazeConfigBarProps {
  value: MazeConfig;
  onChange: (config: MazeConfig) => void;
  /** Filling the gaps, where rings have no outline to follow (they come out as squares) */
  fill?: boolean;
}

export default function MazeConfigBar({ value, onChange, fill }: MazeConfigBarProps) {
  const gridShape = fill && value.gridShape in OUTLINES ? 'square' : value.gridShape;
  const ratio = value.cellSizeRatio;
  const branchiness = value.branchiness;
  const theme = value.theme;
  const curvyWalls = value.curvyWalls;
  const grain = value.grain ?? 'even';
  const turns = value.turns ?? 'mixed';
  // Rings run out from the middle and round it, not down and across
  const rings = gridShape in OUTLINES;

  return (
    <div className={styles.configContainer}>
      <select
        className={styles.select}
        value={gridShape}
        onChange={(e) => onChange({ ...value, gridShape: e.target.value as GridShape })}
        title="Grid shape"
      >
        {GRID_SHAPES.filter(({ group }) => !fill || group !== 'Rings').map(({ group, shapes }) => (
          <optgroup key={group} label={group}>
            {shapes.map(([shape, label]) => (
              <option key={shape} value={shape}>
                {label}
              </option>
            ))}
          </optgroup>
        ))}
      </select>
      <div className={styles.buttonBar}>
        <button
          type="button"
          className={`${styles.button} ${ratio === 2 ? styles.selected : ''}`}
          onClick={() => onChange({ ...value, cellSizeRatio: 2 })}
          title="Larger cells (easier)"
        >
          Large
        </button>
        <button
          type="button"
          className={`${styles.button} ${ratio === 3 ? styles.selected : ''}`}
          onClick={() => onChange({ ...value, cellSizeRatio: 3 })}
          title="Medium cells"
        >
          Medium
        </button>
        <button
          type="button"
          className={`${styles.button} ${ratio === 4 ? styles.selected : ''}`}
          onClick={() => onChange({ ...value, cellSizeRatio: 4 })}
          title="Smaller cells (harder)"
        >
          Small
        </button>
      </div>
      <div className={styles.buttonBar}>
        <button
          type="button"
          className={`${styles.button} ${branchiness === 'low' ? styles.selected : ''}`}
          onClick={() => onChange({ ...value, branchiness: 'low' })}
          title="Long corridors, few branches"
        >
          Windy
        </button>
        <button
          type="button"
          className={`${styles.button} ${branchiness === 'medium' ? styles.selected : ''}`}
          onClick={() => onChange({ ...value, branchiness: 'medium' })}
          title="Balanced corridors and branches"
        >
          Mixed
        </button>
        <button
          type="button"
          className={`${styles.button} ${branchiness === 'high' ? styles.selected : ''}`}
          onClick={() => onChange({ ...value, branchiness: 'high' })}
          title="Many branches, shorter corridors"
        >
          Branchy
        </button>
      </div>
      <div className={styles.buttonBar}>
        {GRAINS.map(([option, across, round, title]) => (
          <button
            key={option}
            type="button"
            className={`${styles.button} ${grain === option ? styles.selected : ''}`}
            onClick={() => onChange({ ...value, grain: option })}
            title={title}
          >
            {rings ? round : across}
          </button>
        ))}
      </div>
      <div className={styles.buttonBar}>
        {TURNS.map(([option, label, title]) => (
          <button
            key={option}
            type="button"
            className={`${styles.button} ${turns === option ? styles.selected : ''}`}
            onClick={() => onChange({ ...value, turns: option })}
            title={title}
          >
            {label}
          </button>
        ))}
      </div>
      <div className={styles.buttonBar}>
        <button
          type="button"
          className={`${styles.button} ${!curvyWalls ? styles.selected : ''}`}
          onClick={() => onChange({ ...value, curvyWalls: false })}
          title="Straight walls"
        >
          Straight
        </button>
        <button
          type="button"
          className={`${styles.button} ${curvyWalls ? styles.selected : ''}`}
          onClick={() => onChange({ ...value, curvyWalls: true })}
          title="Walls drawn as flowing curves"
        >
          Curvy
        </button>
      </div>
      <select
        className={styles.select}
        value={theme}
        onChange={(e) => onChange({ ...value, theme: e.target.value })}
        title="Start and finish"
      >
        <option value="random">Random pair</option>
        {MAZE_THEMES.map((t) => (
          <option key={themeId(t)} value={themeId(t)}>
            {t.start} → {t.end}
          </option>
        ))}
      </select>
    </div>
  );
}
