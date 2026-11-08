import type { PuzzleConfigProps } from '../../../types/puzzle';
import { SCENES, type SceneChoice, type SpotTheDifferenceConfig } from './generator';
import styles from './SpotTheDifferenceConfigBar.module.css';

export default function SpotTheDifferenceConfigBar({ value, onChange }: PuzzleConfigProps<SpotTheDifferenceConfig>) {
  return (
    <div className={styles.controls}>
      <label className={styles.group}>Scene
        <select aria-label="Scene" value={value.scene ?? 'garden'} onChange={e => onChange({ ...value, scene: e.target.value as SceneChoice })}>
          <option value="random">Surprise me</option>
          {SCENES.map(scene => <option key={scene.id} value={scene.id}>{scene.label}</option>)}
        </select>
      </label>
      <div className={styles.group} role="group" aria-label="Number of differences">
        <span>Differences</span>
        {([3, 5, 7] as const).map(count => <button key={count} type="button" aria-pressed={value.differences === count} onClick={() => onChange({ ...value, differences: count })}>{count}</button>)}
      </div>
      <label className={styles.check}><input type="checkbox" checked={value.outline} onChange={e => onChange({ ...value, outline: e.target.checked })} /> Black and white</label>
    </div>
  );
}
