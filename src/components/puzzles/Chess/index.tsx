import { useMemo } from 'react';
import type { PuzzleProps } from '../../../types/puzzle';
import { selectPuzzle, type Difficulty } from './generator';
import { parseFEN, applyMove, type PieceType } from './fenParser';
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

export default function Chess({ seed = 0, config }: PuzzleProps<ChessConfig>) {
  const difficulty = config?.difficulty ?? 'easy';

  const { board, activeColor } = useMemo(() => {
    const puzzle = selectPuzzle(seed, difficulty);
    const initialPosition = parseFEN(puzzle.fen);
    // Apply the setup move to get the actual puzzle position
    return applyMove(initialPosition, puzzle.setupMove);
  }, [seed, difficulty]);

  const toMoveKing = activeColor === 'w' ? kingLight : kingDark;

  // Flip board when Black to move (show from Black's perspective)
  const displayBoard = useMemo(() => {
    if (activeColor === 'w') {
      return board;
    }
    // Reverse rows and columns for Black's view
    return board.map(row => [...row].reverse()).reverse();
  }, [board, activeColor]);

  return (
    <div className={styles.container}>
      <div className={styles.turnIndicator}>
        <img src={toMoveKing} alt="To move" className={styles.turnIcon} />
      </div>
      <div className={styles.board}>
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
