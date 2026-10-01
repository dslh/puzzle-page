import type { MazeConfig } from './index';
import type { GridShape } from './grids';
import { MAZE_THEMES, themeId } from './themes';
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

interface MazeConfigBarProps {
  value: MazeConfig;
  onChange: (config: MazeConfig) => void;
}

export default function MazeConfigBar({ value, onChange }: MazeConfigBarProps) {
  const gridShape = value.gridShape;
  const ratio = value.cellSizeRatio;
  const branchiness = value.branchiness;
  const theme = value.theme;

  return (
    <div className={styles.configContainer}>
      <select
        className={styles.select}
        value={gridShape}
        onChange={(e) => onChange({ ...value, gridShape: e.target.value as GridShape })}
        title="Grid shape"
      >
        {GRID_SHAPES.map(({ group, shapes }) => (
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
