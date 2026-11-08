import { useMemo } from 'react';
import type { PuzzleProps } from '../../../types/puzzle';
import { selectPuzzle, type Difficulty, type PuzzleMode } from './generator';
import { parseFEN, applyMove, type PieceType } from './fenParser';
import AnswerPath from '../../AnswerPath';
import styles from './Chess.module.css';

// Import piece SVGs
import kingLight from './pieces/king-light.svg';
import kingDark from './pieces/king-dark.svg';
import queenLight from './pieces/queen-light.svg';
import queenDark from './pieces/queen-dark.svg';
import rookLight from './pieces/rook-light.svg';
import rookDark from './pieces/rook-dark.svg';
import bishopLight from './pieces/bishop-light.svg';
import bishopDark from './pieces/bishop-dark.svg';
import knightLight from './pieces/knight-light.svg';
import knightDark from './pieces/knight-dark.svg';
import pawnLight from './pieces/pawn-light.svg';
import pawnDark from './pieces/pawn-dark.svg';

export interface ChessConfig {
  difficulty: Difficulty;
  mode: PuzzleMode;
}

// Map piece characters to SVG imports
const PIECE_IMAGES: Record<PieceType, string> = {
  // White pieces (uppercase)
  K: kingLight,
  Q: queenLight,
  R: rookLight,
  B: bishopLight,
  N: knightLight,
  P: pawnLight,
  // Black pieces (lowercase)
  k: kingDark,
  q: queenDark,
  r: rookDark,
  b: bishopDark,
  n: knightDark,
  p: pawnDark,
};

export default function Chess({ showAnswers = false, seed = 0, config }: PuzzleProps<ChessConfig>) {
  const difficulty = config?.difficulty ?? 'easy';
  const mode = config?.mode ?? 'mate';

  const puzzle = useMemo(() => selectPuzzle(seed, difficulty, mode), [seed, difficulty, mode]);
  const { board, activeColor } = useMemo(() => {
    const initialPosition = parseFEN(puzzle.fen);
    // Apply the setup move to get the actual puzzle position
    return applyMove(initialPosition, puzzle.setupMove);
  }, [puzzle]);

  const toMoveKing = activeColor === 'w' ? kingLight : kingDark;

  // Flip board when Black to move (show from Black's perspective)
  const displayBoard = useMemo(() => {
    if (activeColor === 'w') {
      return board;
    }
    // Reverse rows and columns for Black's view
    return board.map(row => [...row].reverse()).reverse();
  }, [board, activeColor]);

  const move = puzzle.solution[0];
  const at = (square: string) => {
    const col = square.charCodeAt(0) - 97, row = 8 - Number(square[1]);
    return activeColor === 'w' ? [col + 0.5, row + 0.5] : [7.5 - col, 7.5 - row];
  };
  const [x1, y1] = at(move.slice(0, 2)), [x2, y2] = at(move.slice(2, 4));
  const angle = Math.atan2(y2 - y1, x2 - x1);
  const arrow = `M${x2 - 0.3 * Math.cos(angle - 0.5)} ${y2 - 0.3 * Math.sin(angle - 0.5)}L${x2} ${y2}L${x2 - 0.3 * Math.cos(angle + 0.5)} ${y2 - 0.3 * Math.sin(angle + 0.5)}`;

  return (
    <div className={styles.container}>
      <div className={styles.turnIndicator}>
        <img src={toMoveKing} alt="To move" className={styles.turnIcon} />
        {showAnswers && <span className={styles.answerMove} data-answer="text">
          {move.slice(0, 2)} → {move.slice(2, 4)}{move[4] ? ` = ${move[4].toUpperCase()}` : ''}
        </span>}
      </div>
      <div className={styles.board}>
        {showAnswers && <svg className={styles.answerRoute} viewBox="0 0 8 8">
          <AnswerPath width={0.075} d={`M${x1} ${y1}L${x2} ${y2} ${arrow}`} />
        </svg>}
        {displayBoard.map((row, rowIndex) =>
          row.map((piece, colIndex) => {
            // Calculate original board position for consistent square colors
            const origRow = activeColor === 'w' ? rowIndex : 7 - rowIndex;
            const origCol = activeColor === 'w' ? colIndex : 7 - colIndex;
            const isLight = (origRow + origCol) % 2 === 0;
            const squareClass = isLight ? styles.lightSquare : styles.darkSquare;

            return (
              <div
                key={`${rowIndex}-${colIndex}`}
                className={`${styles.square} ${squareClass}`}
              >
                {piece && (
                  <img
                    src={PIECE_IMAGES[piece]}
                    alt={piece}
                    className={styles.piece}
                  />
                )}
              </div>
            );
          })
        )}
      </div>
    </div>
  );
}
