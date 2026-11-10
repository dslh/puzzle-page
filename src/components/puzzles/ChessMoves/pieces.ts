import type { ChessPiece } from './generator';
import kingLight from '../Chess/pieces/king-light.svg';
import queenLight from '../Chess/pieces/queen-light.svg';
import rookLight from '../Chess/pieces/rook-light.svg';
import bishopLight from '../Chess/pieces/bishop-light.svg';
import knightLight from '../Chess/pieces/knight-light.svg';
import pawnLight from '../Chess/pieces/pawn-light.svg';

/** The Chess puzzle's white pieces: the child's side. */
export const PIECE_IMAGES: Record<ChessPiece, string> = {
  rook: rookLight, bishop: bishopLight, queen: queenLight, king: kingLight, knight: knightLight,
};
export const PAWN_IMAGE = pawnLight;
