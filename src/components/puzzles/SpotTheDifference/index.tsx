import { useMemo } from 'react';
import type { PuzzleProps } from '../../../types/puzzle';
import { generateScene, type SpotTheDifferenceConfig } from './generator';
import Scene from './Scene';
import styles from './SpotTheDifference.module.css';

export type { SpotTheDifferenceConfig } from './generator';

export default function SpotTheDifference({ seed, gridWidth, gridHeight, config }: PuzzleProps<SpotTheDifferenceConfig>) {
  const { differences = 3, outline = false, answers = false } = config ?? {};
  const scene = useMemo(() => generateScene(seed, differences), [seed, differences]);
  // Choose the arrangement that makes each picture largest, keeping its aspect.
  const availableHeight = gridHeight * 72 - 33;
  const availableWidth = gridWidth * 72 - 12;
  const across = Math.min((availableWidth - 10) / 2 / 600, availableHeight / 390)
    >= Math.min(availableWidth / 600, (availableHeight - 10) / 2 / 390);
  return (
    <div className={styles.puzzle}>
      <div className={styles.heading}>Find {differences} differences. Circle what has changed.</div>
      <div className={`${styles.pictures} ${across ? styles.across : styles.stacked}`}>
        <div className={styles.picture}><Scene scene={scene} second={false} outline={outline} answers={false} /></div>
        <div className={styles.picture}><Scene scene={scene} second outline={outline} answers={answers} /></div>
      </div>
    </div>
  );
}
