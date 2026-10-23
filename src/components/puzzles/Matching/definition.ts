import type { PuzzleDefinition } from '../../../types/puzzle';
import { GRID_COLS, GRID_ROWS } from '../../../types/puzzle';
import Matching, { type MatchingConfig } from './index';
import MatchingConfigBar from './MatchingConfigBar';

export const puzzleDefinition: PuzzleDefinition<MatchingConfig> = {
  type: 'matching',
  label: 'Matching',
  icon: '🔗',
  category: 'thinking',
  component: Matching,
  docs: () => import('./docs'),
  configComponent: MatchingConfigBar,
  defaultWidth: 5,
  defaultHeight: 4,
  defaultConfig: {
    mode: 'silhouette',
    maxWordLength: 4,
    customWordsText: '',
    customLettersText: '',
    rhymeDisplay: 'pictures',
    halvesPairs: 'rows',
    distinctShapes: false,
    workedExample: true,
  },
  presets: [
    { id: 'words', label: 'Word Matching', icon: '🔤', category: 'reading', config: { mode: 'word' }, ages: ['4-5', '6-7'] },
    { id: 'letters', label: 'Letter Matching', icon: '🅰️', category: 'reading', config: { mode: 'letter' }, ages: ['4-5', '6-7'] },
    { id: 'rhymes', label: 'Rhyme Matching', icon: '🎵', category: 'reading', config: { mode: 'rhyme' }, ages: ['4-5', '6-7'] },
    {
      id: 'halves',
      label: 'Match the Halves',
      icon: '✂️',
      category: 'thinking',
      config: { mode: 'halves' },
      ages: ['2-3', '4-5'],
      ageConfig: { '2-3': { halvesPairs: 2 } },
    },
  ],
  resizable: {
    width: true,
    height: true,
    minWidth: 4,
    maxWidth: GRID_COLS,
    minHeight: 4,
    maxHeight: GRID_ROWS,
  },
};
