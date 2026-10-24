import { useMemo } from 'react';
import { generateWhichIsTheSame, type Picture, type SameDifficulty } from './generator';
import type { PuzzleProps } from '../../../types/puzzle';
import { CELL_SIZE_MM } from '../../../types/puzzle';
import styles from './WhichIsTheSame.module.css';

export interface WhichIsTheSameConfig {
  difficulty: SameDifficulty;
  choices: 3 | 4 | 5;
  flipped: boolean;
}

const PADDING_MM = 2;
const ROW_GAP_MM = 2;
const MAX_SLOT_MM = 32;
// The box, the choices, and a little extra for the gap between them
const SLOT_EXTRA = 1.4;

function PictureSlot({ picture }: { picture: Picture }) {
  return (
    <span className={`${styles.picture} ${styles[picture.turn] ?? ''}`}>{picture.emoji}</span>
  );
}

export default function WhichIsTheSame({ gridWidth, gridHeight, seed, config }: PuzzleProps<WhichIsTheSameConfig>) {
  const difficulty = config?.difficulty ?? 'medium';
  const choiceCount = config?.choices ?? 4;
  const flipped = config?.flipped ?? false;

  // Pictures as big as the width allows, then as many rows as fit
  const width = gridWidth * CELL_SIZE_MM - PADDING_MM * 2;
  const height = gridHeight * CELL_SIZE_MM - PADDING_MM * 2;
  const widest = Math.min(MAX_SLOT_MM, width / (choiceCount + SLOT_EXTRA));
  const rowCount = Math.max(1, Math.floor((height + ROW_GAP_MM) / (widest + ROW_GAP_MM)));
  const slot = Math.min(widest, (height + ROW_GAP_MM) / rowCount - ROW_GAP_MM);

  const rows = useMemo(
    () => generateWhichIsTheSame(seed, rowCount, difficulty, choiceCount, flipped),
    [seed, rowCount, difficulty, choiceCount, flipped]
  );

  return (
    <div
      className={styles.container}
      style={{ padding: `${PADDING_MM}mm`, gap: `${ROW_GAP_MM}mm`, fontSize: `${slot * 0.62}mm` }}
    >
      {rows.map((row, rowIndex) => (
        <div key={rowIndex} className={styles.row} style={{ height: `${slot}mm` }}>
          <div className={styles.target} style={{ width: `${slot}mm`, height: `${slot}mm` }}>
            <PictureSlot picture={row.target} />
          </div>
          <div className={styles.choices}>
            {row.choices.map((choice, index) => (
              <div key={index} className={styles.choice} style={{ width: `${slot}mm` }}>
                <PictureSlot picture={choice} />
              </div>
            ))}
          </div>
        </div>
      ))}
    </div>
  );
}
