// FEN (Forsyth-Edwards Notation) parser for chess positions

export type PieceType = 'k' | 'q' | 'r' | 'b' | 'n' | 'p' | 'K' | 'Q' | 'R' | 'B' | 'N' | 'P';

export interface ParsedFEN {
  board: (PieceType | null)[][]; // 8x8, null = empty square
  activeColor: 'w' | 'b';
}

/**
 * Convert algebraic notation to board indices
 * e.g., "e4" -> { row: 4, col: 4 }
 */
function squareToIndices(square: string): { row: number; col: number } {
  const file = square.charCodeAt(0) - 'a'.charCodeAt(0); // a=0, h=7
  const rank = parseInt(square[1], 10); // 1-8
  return {
    row: 8 - rank, // rank 8 = row 0, rank 1 = row 7
    col: file,
  };
}

/**
 * Parse a FEN string into a board representation
 * FEN format: piece_placement active_color castling en_passant halfmove fullmove
 * Example: "rnbqkbnr/pppppppp/8/8/8/8/PPPPPPPP/RNBQKBNR w KQkq - 0 1"
 */
export function parseFEN(fen: string): ParsedFEN {
  const parts = fen.split(' ');
  const piecePlacement = parts[0];
  const activeColor = (parts[1] as 'w' | 'b') || 'w';

  const board: (PieceType | null)[][] = [];
  const ranks = piecePlacement.split('/');

  for (const rank of ranks) {
    const row: (PieceType | null)[] = [];
    for (const char of rank) {
      if (char >= '1' && char <= '8') {
        // Number indicates empty squares
        const emptyCount = parseInt(char, 10);
        for (let i = 0; i < emptyCount; i++) {
          row.push(null);
        }
      } else {
        // Piece character
        row.push(char as PieceType);
      }
    }
    board.push(row);
  }

  return { board, activeColor };
}

/**
 * Apply a move to a parsed FEN position
 * Move format: "e2e4" (from-to) or "d7d8q" (with promotion)
 */
export function applyMove(position: ParsedFEN, move: string): ParsedFEN {
  // Deep copy the board
  const newBoard = position.board.map(row => [...row]);

  const fromSquare = move.slice(0, 2);
  const toSquare = move.slice(2, 4);
  const promotion = move.length > 4 ? move[4] : null;

  const from = squareToIndices(fromSquare);
  const to = squareToIndices(toSquare);

  // Get the piece being moved
  let piece = newBoard[from.row][from.col];

  // Handle castling: king moves two squares horizontally
  const isKing = piece === 'K' || piece === 'k';
  const colDiff = to.col - from.col;
  if (isKing && Math.abs(colDiff) === 2) {
    // Castling - also move the rook
    if (colDiff > 0) {
      // Kingside: rook from h-file to f-file
      const rook = newBoard[from.row][7];
      newBoard[from.row][5] = rook;
      newBoard[from.row][7] = null;
    } else {
      // Queenside: rook from a-file to d-file
      const rook = newBoard[from.row][0];
      newBoard[from.row][3] = rook;
      newBoard[from.row][0] = null;
    }
  }

  // Handle promotion
  if (promotion && piece) {
    const isWhite = piece === piece.toUpperCase();
    piece = (isWhite ? promotion.toUpperCase() : promotion.toLowerCase()) as PieceType;
  }

  // Move the piece
  newBoard[to.row][to.col] = piece;
  newBoard[from.row][from.col] = null;

  // Toggle active color
  const newActiveColor = position.activeColor === 'w' ? 'b' : 'w';

  return {
    board: newBoard,
    activeColor: newActiveColor,
  };
}
