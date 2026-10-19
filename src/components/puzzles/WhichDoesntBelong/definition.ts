import type { PuzzleDefinition } from '../../../types/puzzle';
import { GRID_ROWS } from '../../../types/puzzle';
import WhichDoesntBelong from './index';

export const puzzleDefinition: PuzzleDefinition = {
  type: 'whichdoesntbelong',
  label: "Which Doesn't Belong?",
  icon: '🤔',
  category: 'thinking',
  component: WhichDoesntBelong,
  docs: () => import('./docs'),
  defaultWidth: 4,
  defaultHeight: 1,
  resizable: {
    width: false,
    height: true,
    minHeight: 1,
    maxHeight: GRID_ROWS,
  },
};
