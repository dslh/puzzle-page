import type { PuzzleDefinition } from '../../../types/puzzle';
import { GRID_COLS, GRID_ROWS } from '../../../types/puzzle';
import SecretCode, { type SecretCodeConfig } from './index';
import SecretCodeConfigBar from './SecretCodeConfigBar';

export const puzzleDefinition: PuzzleDefinition<SecretCodeConfig> = {
  type: 'secretcode',
  label: 'Secret Code',
  icon: '🕵️',
  category: 'reading',
  component: SecretCode,
  configComponent: SecretCodeConfigBar,
  defaultWidth: 6,
  defaultHeight: 7,
  defaultConfig: {
    mode: 'cipher',
    letterCase: 'upper',
    decoys: false,
    customWordsText: '',
  },
  resizable: {
    width: true,
    height: true,
    minWidth: 3,
    maxWidth: GRID_COLS,
    minHeight: 3,
    maxHeight: GRID_ROWS,
  },
};
