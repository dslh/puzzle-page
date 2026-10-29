import type { PuzzleDefinition } from '../../../types/puzzle';
import { GRID_COLS } from '../../../types/puzzle';
import WhoGoesWhere, { type WhoGoesWhereConfig } from './index';
import WhoGoesWhereConfigBar from './WhoGoesWhereConfigBar';

export const puzzleDefinition: PuzzleDefinition<WhoGoesWhereConfig> = {
  type: 'whogoeswhere',
  label: 'Who Goes Where?',
  icon: '🏠',
  category: 'thinking',
  ages: ['4-5', '6-7'],
  ageConfig: {
    '6-7': { level: 'medium', houses: 4 },
  },
  component: WhoGoesWhere,
  docs: () => import('./docs'),
  configComponent: WhoGoesWhereConfigBar,
  defaultWidth: 6,
  defaultHeight: 4,
  resizable: {
    width: true,
    height: true,
    minWidth: 4,
    maxWidth: GRID_COLS,
    minHeight: 3,
    maxHeight: 7,
  },
  defaultConfig: {
    level: 'easy',
    houses: 3,
    clues: 'pictures',
  },
};
