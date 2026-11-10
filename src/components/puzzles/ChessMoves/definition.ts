import type { PuzzleDefinition } from '../../../types/puzzle';
import { GRID_COLS, GRID_ROWS } from '../../../types/puzzle';
import ChessMoves, { type ChessMovesConfig } from './index';
import ChessMovesConfigBar from './ChessMovesConfigBar';

export const puzzleDefinition: PuzzleDefinition<ChessMovesConfig> = {
  type: 'chessmoves',
  label: 'Where Can It Go?',
  icon: '♜',
  category: 'thinking',
  ages: ['4-5', '6-7'],
  component: ChessMoves,
  configComponent: ChessMovesConfigBar,
  docs: () => import('./docs'),
  defaultWidth: 6,
  defaultHeight: 6,
  defaultConfig: {
    mode: 'where',
    piece: 'rook',
    boardSize: 5,
    blockers: false,
    stars: 2,
    showMoves: true,
    workedExample: true,
  },
  ageConfig: { '6-7': { piece: 'mixed', blockers: true } },
  presets: [{
    id: 'collect',
    label: 'Collect the Stars',
    icon: '⭐',
    category: 'thinking',
    config: { mode: 'collect' },
    defaultWidth: 8,
    defaultHeight: 5,
    ageConfig: { '6-7': { piece: 'knight', stars: 3 } },
  }],
  resizable: {
    width: true, height: true,
    minWidth: 4, maxWidth: GRID_COLS,
    minHeight: 4, maxHeight: GRID_ROWS,
  },
};
