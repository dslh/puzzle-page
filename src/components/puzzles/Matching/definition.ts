import type { PuzzleDefinition } from '../../../types/puzzle';
import { GRID_COLS, GRID_ROWS } from '../../../types/puzzle';
import Matching, { type MatchingConfig } from './index';
import MatchingConfigBar from './MatchingConfigBar';

export const puzzleDefinition: PuzzleDefinition<MatchingConfig> = {
  type: 'matching',
  label: 'Matching',
  icon: '🔗',
  component: Matching,
  configComponent: MatchingConfigBar,
  defaultWidth: 5,
  defaultHeight: 4,
  defaultConfig: {
    mode: 'silhouette',
    maxWordLength: 4,
  },
  resizable: {
    width: true,
    height: true,
    minWidth: 4,
    maxWidth: GRID_COLS,
    minHeight: 4,
    maxHeight: GRID_ROWS,
  },
};
