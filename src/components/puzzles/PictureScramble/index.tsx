import { useMemo } from 'react';
import { generateScramble } from './generator';
import type { PuzzleProps } from '../../../types/puzzle';
import styles from './PictureScramble.module.css';

export interface PictureScrambleConfig {
  imageUrl?: string;
}

function getQuadrantPosition(quadrantIndex: number): string {
  const positions = [
    '0% 0%',      // Top-left (quadrant 0)
    '100% 0%',    // Top-right (quadrant 1)
    '0% 100%',    // Bottom-left (quadrant 2)
    '100% 100%',  // Bottom-right (quadrant 3)
  ];
  return positions[quadrantIndex];
}

export default function PictureScramble({ showAnswers = false, seed, config }: PuzzleProps<PictureScrambleConfig>) {
  const puzzle = useMemo(() => generateScramble(seed), [seed]);
  const imageUrl = config?.imageUrl;

  return (
    <div className={styles.container}>
      {!imageUrl ? (
        <div className={styles.placeholder}>
          <div className={styles.placeholderText}>
            📷
            <br />
            Upload an image
            <br />
            to create a
            <br />
            picture scramble
          </div>
        </div>
      ) : (
        <div className={styles.grid}>
          {puzzle.quadrants.map((quadrant, displayIndex) => (
            <div
              key={displayIndex}
              className={styles.quadrant}
              style={{
                backgroundImage: `url(${imageUrl})`,
                backgroundPosition: getQuadrantPosition(quadrant.originalPosition),
                backgroundSize: '200% 200%',
                transform: `rotate(${quadrant.rotation}deg)`,
              }}
            >{showAnswers && <span className={styles.answer} data-answer="text" style={{ transform: `rotate(${-quadrant.rotation}deg)` }}>
              {['Top left', 'Top right', 'Bottom left', 'Bottom right'][quadrant.originalPosition]}
              {quadrant.rotation !== 0 && <><br />Turn {360 - quadrant.rotation}° clockwise</>}
            </span>}</div>
          ))}
        </div>
      )}
    </div>
  );
}
