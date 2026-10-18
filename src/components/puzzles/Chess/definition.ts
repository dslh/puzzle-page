import type { PuzzleDefinition } from '../../../types/puzzle';
import Chess, { type ChessConfig } from './index';
import ChessConfigBar from './ChessConfigBar';

export const puzzleDefinition: PuzzleDefinition<ChessConfig> = {
  type: 'chess',
  label: 'Chess Puzzle',
  icon: '♟️',
  category: 'thinking',
  ages: ['4-5', '6-7'],
  component: Chess,
  configComponent: ChessConfigBar,
  defaultWidth: 5,
  defaultHeight: 5,
  defaultConfig: {
    difficulty: 'easy',
    mode: 'mate',
  },
};
