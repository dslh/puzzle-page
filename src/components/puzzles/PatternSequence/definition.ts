import type { PuzzleDefinition } from '../../../types/puzzle';
import { GRID_ROWS } from '../../../types/puzzle';
import PatternSequence from './index';

export const puzzleDefinition: PuzzleDefinition = {
  type: 'patternsequence',
  label: 'Pattern Sequence',
  icon: '🔢',
  component: PatternSequence,
  defaultWidth: 6,
  defaultHeight: 2,
  resizable: {
    width: false,
    height: true,
    minHeight: 1,
    maxHeight: GRID_ROWS,
  },
};
