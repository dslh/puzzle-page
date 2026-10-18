import type { PuzzleDefinition } from '../../../types/puzzle';
import { GRID_COLS, GRID_ROWS } from '../../../types/puzzle';
import InitialSounds, { type InitialSoundsConfig } from './index';
import InitialSoundsConfigBar from './InitialSoundsConfigBar';

export const puzzleDefinition: PuzzleDefinition<InitialSoundsConfig> = {
  type: 'initialsounds',
  label: 'Initial Sounds',
  icon: '🔤',
  category: 'reading',
  ages: ['4-5', '6-7'],
  component: InitialSounds,
  configComponent: InitialSoundsConfigBar,
  defaultWidth: 6,
  defaultHeight: 4,
  defaultConfig: {
    mode: 'circle',
    letterCase: 'lower',
    lettersText: '',
  },
  resizable: {
    width: true,
    height: true,
    minWidth: 2,
    maxWidth: GRID_COLS,
    minHeight: 2,
    maxHeight: GRID_ROWS,
  },
};
