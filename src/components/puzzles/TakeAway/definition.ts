import type { PuzzleDefinition } from '../../../types/puzzle';
import { GRID_COLS, GRID_ROWS } from '../../../types/puzzle';
import TakeAway, { type TakeAwayConfig } from './index';
import TakeAwayConfigBar from './TakeAwayConfigBar';

export const puzzleDefinition: PuzzleDefinition<TakeAwayConfig> = {
  type: 'takeaway',
  label: 'Take Away',
  icon: '➖',
  component: TakeAway,
  configComponent: TakeAwayConfigBar,
  // Width sets the difficulty: 7 cells gives starting numbers up to 9
  defaultWidth: 7,
  defaultHeight: 4,
  defaultConfig: {
    blankMode: 'answer',
    workedExample: true,
  },
  resizable: {
    width: true,
    height: true,
    minWidth: 4,
    maxWidth: GRID_COLS,
    minHeight: 1,
    maxHeight: GRID_ROWS,
  },
};
