import type { PuzzleDefinition } from '../../../types/puzzle';
import { GRID_COLS, GRID_ROWS } from '../../../types/puzzle';
import PatternSequence, { type PatternSequenceConfig } from './index';
import { DEFAULT_PATTERN_OPTIONS } from './generator';
import PatternSequenceConfigBar from './PatternSequenceConfigBar';

export const puzzleDefinition: PuzzleDefinition<PatternSequenceConfig> = {
  type: 'patternsequence',
  label: 'Pattern Sequence',
  icon: '🔢',
  component: PatternSequence,
  configComponent: PatternSequenceConfigBar,
  defaultWidth: 8,
  defaultHeight: 3,
  defaultConfig: DEFAULT_PATTERN_OPTIONS,
  resizable: {
    width: true,
    height: true,
    minWidth: 5,
    maxWidth: GRID_COLS,
    minHeight: 1,
    maxHeight: GRID_ROWS,
  },
};
