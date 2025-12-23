import type { PuzzleDefinition } from '../../../types/puzzle';
import { GRID_COLS, GRID_ROWS } from '../../../types/puzzle';
import PictureScramble from './index';
import PictureScrambleConfigBar from './PictureScrambleConfigBar';
import type { PictureScrambleConfig } from './index';

export const puzzleDefinition: PuzzleDefinition<PictureScrambleConfig> = {
  type: 'picturescramble',
  label: 'Picture Scramble',
  icon: '🖼️',
  component: PictureScramble,
  defaultWidth: 7,
  defaultHeight: 7,
  resizable: {
    width: true,
    height: true,
    minWidth: 4,
    maxWidth: GRID_COLS,
    minHeight: 4,
    maxHeight: GRID_ROWS,
  },
  configComponent: PictureScrambleConfigBar,
  defaultConfig: {
    imageUrl: undefined,
  },
};
