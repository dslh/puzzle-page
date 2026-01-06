import type { PuzzleDefinition } from '../../../types/puzzle';
import { GRID_COLS, GRID_ROWS } from '../../../types/puzzle';
import Ordering, { type OrderingConfig } from './index';
import OrderingConfigBar from './OrderingConfigBar';

export const puzzleDefinition: PuzzleDefinition<OrderingConfig> = {
  type: 'ordering',
  label: 'Ordering',
  icon: '📊',
  component: Ordering,
  configComponent: OrderingConfigBar,
  defaultWidth: 4,
  defaultHeight: 3,
  defaultConfig: {
    mode: 'numbers',
  },
  resizable: {
    width: true,
    height: true,
    minWidth: 3,
    maxWidth: GRID_COLS,
    minHeight: 1,
    maxHeight: GRID_ROWS,
  },
};
