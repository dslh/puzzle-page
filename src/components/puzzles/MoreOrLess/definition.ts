import type { PuzzleDefinition } from '../../../types/puzzle';
import { GRID_COLS, GRID_ROWS } from '../../../types/puzzle';
import MoreOrLess, { type MoreOrLessConfig } from './index';
import MoreOrLessConfigBar from './MoreOrLessConfigBar';

export const puzzleDefinition: PuzzleDefinition<MoreOrLessConfig> = {
  type: 'moreorless',
  label: 'More or Less',
  icon: '⚖️',
  component: MoreOrLess,
  configComponent: MoreOrLessConfigBar,
  // Width sets the difficulty: 8 cells gives up to 8 a side. Height is one row
  // for the key plus one per problem.
  defaultWidth: 8,
  defaultHeight: 5,
  defaultConfig: {
    workedExample: true,
  },
  resizable: {
    width: true,
    height: true,
    minWidth: 5,
    maxWidth: GRID_COLS,
    minHeight: 2,
    maxHeight: GRID_ROWS,
  },
};
