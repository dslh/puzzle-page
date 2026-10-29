import { useMemo } from 'react';
import { clueInWords, generateWhoGoesWhere, type Clue, type Level, type WhoGoesWherePuzzle } from './generator';
import House from './House';
import type { PuzzleProps } from '../../../types/puzzle';
import { CELL_SIZE_MM } from '../../../types/puzzle';
import styles from './WhoGoesWhere.module.css';

export interface WhoGoesWhereConfig {
  level: Level;
  houses: 3 | 4;
  clues: 'pictures' | 'words';
}

const PADDING_MM = 2;
/** The clue box's border, padding and gap, added to its contents' height */
const CLUE_BOX_EXTRA_MM = 5;
const CLUE_HOUSE_MM = 17;
const CLUE_GAP_MM = 3;
const WORDS_LINE_MM = 7;
const MIN_ANIMAL_MM = 9;
const MAX_ANIMAL_MM = 14;
const MIN_LINE_SPACE_MM = 6;
const MAX_HOUSE_MM = 40;
const HOUSE_GAP_MM = 4;

function clueWidth(clue: Clue): number {
  return clue.kind === 'leftOf' ? CLUE_HOUSE_MM * 2 + 1 : CLUE_HOUSE_MM;
}

function PictureClue({ clue, puzzle }: { clue: Clue; puzzle: WhoGoesWherePuzzle }) {
  const size = { width: `${CLUE_HOUSE_MM}mm`, height: `${CLUE_HOUSE_MM}mm` };
  if (clue.kind === 'leftOf') {
    return (
      <div className={styles.clue}>
        <House animal={puzzle.animals[clue.animal].emoji} style={size} />
        <House animal={puzzle.animals[clue.other].emoji} style={size} />
      </div>
    );
  }
  const house = puzzle.houses[clue.house];
  return (
    <div className={styles.clue}>
      <House
        colour={house.colour}
        number={clue.house + 1}
        animal={puzzle.animals[clue.animal].emoji}
        crossed={clue.kind === 'not'}
        style={size}
      />
    </div>
  );
}

export default function WhoGoesWhere({ gridWidth, gridHeight, seed, config }: PuzzleProps<WhoGoesWhereConfig>) {
  const level = config?.level ?? 'easy';
  const houseCount = config?.houses ?? 3;
  const clueStyle = config?.clues ?? 'pictures';

  const puzzle = useMemo(() => generateWhoGoesWhere(seed, houseCount, level), [seed, houseCount, level]);

  const width = gridWidth * CELL_SIZE_MM - PADDING_MM * 2;
  const height = gridHeight * CELL_SIZE_MM - PADDING_MM * 2;

  // How tall the clues come out, so the houses can take what is left
  let clueHeight: number;
  if (clueStyle === 'words') {
    clueHeight = puzzle.clues.length * WORDS_LINE_MM + CLUE_BOX_EXTRA_MM;
  } else {
    const inner = width - CLUE_BOX_EXTRA_MM;
    let rows = 1;
    let used = 0;
    for (const clue of puzzle.clues) {
      const w = clueWidth(clue) + (used > 0 ? CLUE_GAP_MM : 0);
      if (used > 0 && used + w > inner) {
        rows++;
        used = clueWidth(clue);
      } else {
        used += w;
      }
    }
    clueHeight = rows * CLUE_HOUSE_MM + (rows - 1) * CLUE_GAP_MM + CLUE_BOX_EXTRA_MM;
  }
  const houseByWidth = (width - (houseCount - 1) * HOUSE_GAP_MM) / houseCount;
  const houseByHeight = height - clueHeight - MIN_ANIMAL_MM * 1.2 - MIN_LINE_SPACE_MM;
  const houseSize = Math.max(10, Math.min(MAX_HOUSE_MM, houseByWidth, houseByHeight));
  const animalSize = Math.max(MIN_ANIMAL_MM, Math.min(MAX_ANIMAL_MM, houseSize * 0.4));

  return (
    <div className={styles.container} style={{ padding: `${PADDING_MM}mm` }}>
      <div className={styles.clues} style={{ gap: `${CLUE_GAP_MM}mm` }}>
        {clueStyle === 'words' ? (
          <ol className={styles.words} style={{ lineHeight: `${WORDS_LINE_MM}mm` }}>
            {puzzle.clues.map((clue, i) => (
              <li key={i}>{clueInWords(clue, puzzle)}</li>
            ))}
          </ol>
        ) : (
          puzzle.clues.map((clue, i) => <PictureClue key={i} clue={clue} puzzle={puzzle} />)
        )}
      </div>
      <div className={styles.lineUp} style={{ fontSize: `${animalSize}mm`, height: `${animalSize * 1.2}mm` }}>
        {puzzle.lineUp.map(animal => (
          <span key={animal} className={styles.animal}>
            {puzzle.animals[animal].emoji}
          </span>
        ))}
      </div>
      <div className={styles.houses} style={{ gap: `${HOUSE_GAP_MM}mm` }}>
        {puzzle.houses.map((house, i) => (
          <House
            key={i}
            colour={house.colour}
            number={i + 1}
            open
            style={{ width: `${houseSize}mm`, height: `${houseSize}mm` }}
          />
        ))}
      </div>
    </div>
  );
}
