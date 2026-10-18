import type { PuzzleDefinition } from '../../../types/puzzle';
import { GRID_COLS, GRID_ROWS } from '../../../types/puzzle';
import Ordering, { type OrderingConfig } from './index';
import OrderingConfigBar from './OrderingConfigBar';

export const puzzleDefinition: PuzzleDefinition<OrderingConfig> = {
  type: 'ordering',
  label: 'Ordering',
  icon: '📊',
  category: 'numbers',
  ages: ['4-5', '6-7'],
  component: Ordering,
  configComponent: OrderingConfigBar,
  defaultWidth: 4,
  defaultHeight: 3,
  defaultConfig: {
    mode: 'numbers',
  },
  presets: [
    { id: 'sizes', label: 'Size Ordering', category: 'thinking', config: { mode: 'emoji' }, ages: ['2-3', '4-5', '6-7'] },
  ],
  resizable: {
    width: true,
    height: true,
    minWidth: 3,
    maxWidth: GRID_COLS,
    minHeight: 1,
    maxHeight: GRID_ROWS,
  },
};
