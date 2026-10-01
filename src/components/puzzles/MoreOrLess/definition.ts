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
  // Width sets the difficulty: 6 cells gives up to 9 a side. Height is one row
  // for the key plus two per problem.
  defaultWidth: 6,
  defaultHeight: 7,
  defaultConfig: {
    layout: 'mixed',
    workedExample: true,
  },
  resizable: {
    width: true,
    height: true,
    minWidth: 5,
    maxWidth: GRID_COLS,
    minHeight: 3,
    maxHeight: GRID_ROWS,
  },
};
