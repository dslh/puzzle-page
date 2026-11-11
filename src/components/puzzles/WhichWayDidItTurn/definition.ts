import type { PuzzleDefinition } from '../../../types/puzzle';
import { GRID_COLS, GRID_ROWS } from '../../../types/puzzle';
import WhichWayDidItTurn, { type WhichWayDidItTurnConfig } from './index';
import WhichWayDidItTurnConfigBar from './WhichWayDidItTurnConfigBar';

export const puzzleDefinition: PuzzleDefinition<WhichWayDidItTurnConfig> = {
  type: 'whichwaydiditturn',
  label: 'Which Way Did It Turn?',
  icon: '↻',
  category: 'thinking',
  ages: ['4-5', '6-7'],
  component: WhichWayDidItTurn,
  configComponent: WhichWayDidItTurnConfigBar,
  docs: () => import('./docs'),
  defaultWidth: 6,
  defaultHeight: 6,
  defaultConfig: { workedExample: true, turns: ['clockwise'], shapes: 'blocks' },
  resizable: {
    width: true, height: true,
    minWidth: 4, maxWidth: GRID_COLS,
    minHeight: 2, maxHeight: GRID_ROWS,
  },
};
