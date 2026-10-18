import type { PuzzleDefinition } from '../../../types/puzzle';
import { GRID_COLS, GRID_ROWS } from '../../../types/puzzle';
import Directions, { type DirectionsConfig } from './index';
import DirectionsConfigBar from './DirectionsConfigBar';

export const puzzleDefinition: PuzzleDefinition<DirectionsConfig> = {
  type: 'directions',
  label: 'Directions',
  icon: '🗺️',
  component: Directions,
  configComponent: DirectionsConfigBar,
  // The map fills whatever is left around the prompt and the strip of steps
  // (one or two lines), so the minimum leaves room for a 3×3 map.
  defaultWidth: 6,
  defaultHeight: 7,
  defaultConfig: {
    mode: 'follow',
    notation: 'arrows',
    length: 'medium',
    spareBoxes: false,
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
