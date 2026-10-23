import type { PuzzleDefinition } from '../../../types/puzzle';
import { GRID_COLS, GRID_ROWS } from '../../../types/puzzle';
import PreWriting, { type PreWritingConfig } from './index';
import { DEFAULT_PATTERNS } from './generator';
import PreWritingConfigBar from './PreWritingConfigBar';

export const puzzleDefinition: PuzzleDefinition<PreWritingConfig> = {
  type: 'prewriting',
  label: 'Pre-Writing Patterns',
  icon: '〰️',
  category: 'writing',
  ageConfig: {
    // Too young to follow dots or carry a pattern on: steer down a road instead
    '2-3': { line: 'wide', patterns: ['across', 'waves', 'arches'], size: 'large' },
    '6-7': { patterns: ['waves', 'arches', 'zigzags', 'loops'], size: 'small' },
  },
  presets: [
    {
      id: 'roads',
      label: 'Roads',
      icon: '🚗',
      category: 'mazes',
      config: { line: 'wide', patterns: ['across', 'waves', 'arches'] },
      ages: ['2-3', '4-5'],
      ageConfig: {
        '4-5': { line: 'narrow', patterns: ['waves', 'arches', 'zigzags'] },
      },
    },
  ],
  component: PreWriting,
  docs: () => import('./docs'),
  configComponent: PreWritingConfigBar,
  defaultWidth: 8,
  defaultHeight: 5,
  defaultConfig: {
    line: 'dotted',
    patterns: DEFAULT_PATTERNS,
    size: 'medium',
    finish: 'continue',
  },
  resizable: {
    width: true,
    height: true,
    minWidth: 4,
    maxWidth: GRID_COLS,
    minHeight: 2,
    maxHeight: GRID_ROWS,
  },
};
