import type { PuzzleConfigProps } from '../../../types/puzzle';
import type { SpotTheDifferenceConfig } from './generator';
import styles from './SpotTheDifferenceConfigBar.module.css';

export default function SpotTheDifferenceConfigBar({ value, onChange }: PuzzleConfigProps<SpotTheDifferenceConfig>) {
  return (
    <div className={styles.controls}>
      <div className={styles.group} role="group" aria-label="Number of differences">
        <span>Differences</span>
        {([3, 5, 7] as const).map(count => <button key={count} type="button" aria-pressed={value.differences === count} onClick={() => onChange({ ...value, differences: count })}>{count}</button>)}
      </div>
      <label className={styles.check}><input type="checkbox" checked={value.outline} onChange={e => onChange({ ...value, outline: e.target.checked })} /> Black and white</label>
      <label className={styles.check}><input type="checkbox" checked={value.answers} onChange={e => onChange({ ...value, answers: e.target.checked })} /> Mark the answers</label>
      {value.answers && <p className={styles.note}>The answer circles will print too. Switch them off for your child’s page.</p>}
    </div>
  );
}
