import type { PuzzleDefinition } from '../../../types/puzzle';
import { GRID_COLS, GRID_ROWS } from '../../../types/puzzle';
import LetterFormation, { type LetterFormationConfig } from './index';
import LetterFormationConfigBar from './LetterFormationConfigBar';

export const puzzleDefinition: PuzzleDefinition<LetterFormationConfig> = {
  type: 'letterformation',
  label: 'Letter Formation',
  icon: '✍️',
  component: LetterFormation,
  configComponent: LetterFormationConfigBar,
  defaultWidth: 6,
  defaultHeight: 4,
  defaultConfig: {
    letter: '',
    guides: true,
    traceCount: 3,
  },
  resizable: {
    width: true,
    height: true,
    // Below this the model letter and a practice line stop both fitting
    minWidth: 3,
    maxWidth: GRID_COLS,
    minHeight: 3,
    maxHeight: GRID_ROWS,
  },
};
