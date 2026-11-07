import { useMemo } from 'react';
import type { PuzzleProps } from '../../../types/puzzle';
import { generateScene, type SpotTheDifferenceConfig } from './generator';
import Scene from './Scene';
import { pictureLayout } from './layout';
import styles from './SpotTheDifference.module.css';

export type { SpotTheDifferenceConfig } from './generator';

export default function SpotTheDifference({ seed, gridWidth, gridHeight, config }: PuzzleProps<SpotTheDifferenceConfig>) {
  const { differences = 3, outline = false, answers = false, scene: choice = 'garden' } = config ?? {};
  const scene = useMemo(() => generateScene(seed, differences, choice), [seed, differences, choice]);
  const { across, aspect } = pictureLayout(gridWidth, gridHeight);
  return (
    <div className={styles.puzzle}>
      <div className={styles.heading}>Find {differences} differences. Circle what has changed.</div>
      <div className={`${styles.pictures} ${across ? styles.across : styles.stacked}`}>
        <div className={styles.picture}><Scene scene={scene} second={false} outline={outline} answers={false} aspect={aspect} /></div>
        <div className={styles.picture}><Scene scene={scene} second outline={outline} answers={answers} aspect={aspect} /></div>
      </div>
    </div>
  );
}
