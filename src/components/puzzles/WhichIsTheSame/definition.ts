import type { PuzzleDefinition } from '../../../types/puzzle';
import { GRID_COLS, GRID_ROWS } from '../../../types/puzzle';
import WhichIsTheSame, { type WhichIsTheSameConfig } from './index';
import WhichIsTheSameConfigBar from './WhichIsTheSameConfigBar';

export const puzzleDefinition: PuzzleDefinition<WhichIsTheSameConfig> = {
  type: 'whichisthesame',
  label: 'Which Is the Same?',
  icon: '👀',
  category: 'thinking',
  ageConfig: {
    '2-3': { difficulty: 'easy', choices: 3 },
    '6-7': { difficulty: 'hard', flipped: true },
  },
  component: WhichIsTheSame,
  docs: () => import('./docs'),
  configComponent: WhichIsTheSameConfigBar,
  defaultWidth: 6,
  defaultHeight: 6,
  resizable: {
    width: true,
    height: true,
    minWidth: 4,
    maxWidth: GRID_COLS,
    minHeight: 1,
    maxHeight: GRID_ROWS,
  },
  defaultConfig: {
    difficulty: 'medium',
    choices: 4,
    flipped: false,
  },
};
