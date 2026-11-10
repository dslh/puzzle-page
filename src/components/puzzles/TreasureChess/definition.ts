import type { PuzzleDefinition } from '../../../types/puzzle';
import { GRID_COLS, GRID_ROWS } from '../../../types/puzzle';
import TreasureChess, { type TreasureChessConfig } from './index';
import TreasureChessConfigBar from './TreasureChessConfigBar';

export const puzzleDefinition: PuzzleDefinition<TreasureChessConfig> = {
  type: 'treasurechess',
  label: 'Treasure Chess',
  icon: '🏝️',
  category: 'mazes',
  ages: ['4-5', '6-7'],
  ageConfig: {
    '6-7': { piece: 'mixed', length: 'long' },
  },
  component: TreasureChess,
  docs: () => import('./docs'),
  configComponent: TreasureChessConfigBar,
  // The map fills whatever is left around the prompt and the caption, in
  // squares of 11-17mm, up to 10×12 of them.
  defaultWidth: 6,
  defaultHeight: 7,
  defaultConfig: {
    piece: 'rook',
    length: 'medium',
    collect: 0,
    showMoves: true,
  },
  resizable: {
    width: true,
    height: true,
    minWidth: 4,
    maxWidth: GRID_COLS,
    minHeight: 4,
    maxHeight: GRID_ROWS,
  },
};
