import type { PuzzleDefinition } from '../../../types/puzzle';
import { GRID_ROWS } from '../../../types/puzzle';
import Matching from './index';

export const puzzleDefinition: PuzzleDefinition = {
  type: 'matching',
  label: 'Matching',
  icon: '🔗',
  component: Matching,
  defaultWidth: 4,
  defaultHeight: 4,
  resizable: {
    width: false,
    height: true,
    minHeight: 4,
    maxHeight: GRID_ROWS,
  },
};
