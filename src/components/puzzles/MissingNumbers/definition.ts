import type { PuzzleDefinition } from '../../../types/puzzle';
import { GRID_COLS, GRID_ROWS } from '../../../types/puzzle';
import MissingNumbers, { type MissingNumbersConfig } from './index';
import MissingNumbersConfigBar from './MissingNumbersConfigBar';

export const puzzleDefinition: PuzzleDefinition<MissingNumbersConfig> = {
  type: 'missingnumbers',
  label: 'Missing Numbers',
  icon: '💯',
  category: 'numbers',
  ageConfig: {
    '6-7': { layout: 'square', range: 100 },
  },
  ages: ['4-5', '6-7'],
  component: MissingNumbers,
  docs: () => import('./docs'),
  configComponent: MissingNumbersConfigBar,
  // One box a grid cell: width is the length of a track, or the columns of
  // the 100 square; height is the number of tracks, or its rows
  defaultWidth: 6,
  defaultHeight: 4,
  defaultConfig: {
    layout: 'track',
    range: 20,
    step: 1,
    direction: 'forwards',
    gaps: 'some',
  },
  resizable: {
    width: true,
    height: true,
    minWidth: 4,
    maxWidth: GRID_COLS,
    minHeight: 1,
    maxHeight: GRID_ROWS,
  },
};
