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
  defaultHeight: 3,
  defaultConfig: {
    letter: '',
    guides: true,
    traceCount: 3,
  },
  resizable: {
    width: true,
    height: true,
    minWidth: 3,
    maxWidth: GRID_COLS,
    // The default and the minimum: model letter plus a single practice line
    minHeight: 3,
    maxHeight: GRID_ROWS,
  },
};
