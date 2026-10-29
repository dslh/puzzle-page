import type { PuzzleDefinition } from '../../../types/puzzle';
import { GRID_COLS, GRID_ROWS } from '../../../types/puzzle';
import DotMarker, { type DotMarkerConfig } from './index';
import DotMarkerConfigBar from './DotMarkerConfigBar';

export const puzzleDefinition: PuzzleDefinition<DotMarkerConfig> = {
  type: 'dotmarker',
  label: 'Dot Marker',
  icon: '🔴',
  category: 'writing',
  ages: ['2-3', '4-5'],
  ageConfig: {
    // Steadier hands: smaller dots, and more of them
    '4-5': { size: 'medium', fill: 'filled' },
  },
  presets: [
    {
      // A name or a letter they're learning: room for a short name in big dots
      id: 'letters',
      label: 'Dot Letters',
      icon: '🔠',
      category: 'writing',
      config: { shape: 'letters' },
      defaultWidth: 10,
      defaultHeight: 10,
    },
  ],
  component: DotMarker,
  docs: () => import('./docs'),
  configComponent: DotMarkerConfigBar,
  defaultWidth: 6,
  defaultHeight: 6,
  defaultConfig: {
    shape: 'heart',
    size: 'big',
    fill: 'outline',
    picture: 'random',
    text: '',
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
