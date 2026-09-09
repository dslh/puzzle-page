import type { PuzzleDefinition } from '../../../types/puzzle';
import { GRID_COLS, GRID_ROWS } from '../../../types/puzzle';
import ColourBySightWord, { type ColourBySightWordConfig } from './index';
import ColourBySightWordConfigBar from './ColourBySightWordConfigBar';

export const puzzleDefinition: PuzzleDefinition<ColourBySightWordConfig> = {
  type: 'coloursightword',
  label: 'Colour by Sight Word',
  icon: '🖍️',
  component: ColourBySightWord,
  configComponent: ColourBySightWordConfigBar,
  defaultWidth: 6,
  defaultHeight: 7,
  defaultConfig: {
    colourCount: 3,
    letterCase: 'lower',
    customWordsText: '',
  },
  resizable: {
    width: true,
    height: true,
    // Below 4x5 the cells get too small to print a readable word in
    minWidth: 4,
    maxWidth: GRID_COLS,
    minHeight: 5,
    maxHeight: GRID_ROWS,
  },
};
