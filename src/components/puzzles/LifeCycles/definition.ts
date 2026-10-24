import type { PuzzleDefinition } from '../../../types/puzzle';
import { GRID_COLS, GRID_ROWS } from '../../../types/puzzle';
import LifeCycles, { type LifeCyclesConfig } from './index';
import LifeCyclesConfigBar from './LifeCyclesConfigBar';

export const puzzleDefinition: PuzzleDefinition<LifeCyclesConfig> = {
  type: 'lifecycles',
  label: 'Life Cycles',
  icon: '🦋',
  category: 'science',
  ages: ['4-5', '6-7'],
  ageConfig: {
    '6-7': { firstShown: false },
  },
  component: LifeCycles,
  docs: () => import('./docs'),
  configComponent: LifeCyclesConfigBar,
  // Number: a cycle a row, two cells tall. Missing: a circle a square
  defaultWidth: 8,
  defaultHeight: 4,
  defaultConfig: {
    task: 'number',
    cycle: 'mixed',
    firstShown: true,
  },
  resizable: {
    width: true,
    height: true,
    minWidth: 4,
    maxWidth: GRID_COLS,
    minHeight: 2,
    maxHeight: GRID_ROWS,
  },
};
