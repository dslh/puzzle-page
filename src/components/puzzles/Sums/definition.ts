import type { PuzzleDefinition } from '../../../types/puzzle';
import { GRID_COLS, GRID_ROWS } from '../../../types/puzzle';
import Sums, { type SumsConfig } from './index';
import SumsConfigBar from './SumsConfigBar';

export const puzzleDefinition: PuzzleDefinition<SumsConfig> = {
  type: 'sums',
  label: 'Sums',
  icon: '➕',
  component: Sums,
  configComponent: SumsConfigBar,
  defaultWidth: 4,
  defaultHeight: 3,
  defaultConfig: {
    mode: 'both',
  },
  resizable: {
    width: true,
    height: true,
    minWidth: 2,
    maxWidth: GRID_COLS,
    minHeight: 1,
    maxHeight: GRID_ROWS,
  },
};
