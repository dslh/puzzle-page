import type { PuzzleDefinition } from '../../../types/puzzle';
import { GRID_COLS, GRID_ROWS } from '../../../types/puzzle';
import DrawTheOtherHalf, { type DrawTheOtherHalfConfig } from './index';
import DrawTheOtherHalfConfigBar from './DrawTheOtherHalfConfigBar';

export const puzzleDefinition: PuzzleDefinition<DrawTheOtherHalfConfig> = {
  type: 'drawtheotherhalf',
  label: 'Draw the Other Half',
  icon: '🦋',
  category: 'writing',
  ages: ['4-5', '6-7'],
  ageConfig: {
    // A stretch at four or five: give them the line to trace
    '4-5': { help: 'dotted' },
    '6-7': { level: 'medium', help: 'none' },
  },
  component: DrawTheOtherHalf,
  docs: () => import('./docs'),
  configComponent: DrawTheOtherHalfConfigBar,
  defaultWidth: 6,
  defaultHeight: 5,
  defaultConfig: {
    subject: 'shape',
    level: 'easy',
    help: 'corners',
    mirror: 'vertical',
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
