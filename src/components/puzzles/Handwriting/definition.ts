import type { PuzzleDefinition } from '../../../types/puzzle';
import { GRID_COLS, GRID_ROWS } from '../../../types/puzzle';
import Handwriting, { type HandwritingConfig } from './index';
import HandwritingConfigBar from './HandwritingConfigBar';

export const puzzleDefinition: PuzzleDefinition<HandwritingConfig> = {
  type: 'handwriting',
  label: 'Handwriting',
  icon: '✏️',
  component: Handwriting,
  configComponent: HandwritingConfigBar,
  defaultWidth: 6,
  defaultHeight: 4,
  defaultConfig: {
    mode: 'trace',
    letterCase: 'lower',
    customWordsText: '',
  },
  resizable: {
    width: true,
    height: true,
    minWidth: 3,
    maxWidth: GRID_COLS,
    minHeight: 2,
    maxHeight: GRID_ROWS,
  },
};
