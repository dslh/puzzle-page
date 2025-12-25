import type { PuzzleDefinition } from '../../../types/puzzle';
import { GRID_COLS, GRID_ROWS } from '../../../types/puzzle';
import WordSearch, { type WordSearchConfig } from './index';
import WordSearchConfigBar from './WordSearchConfigBar';

export const puzzleDefinition: PuzzleDefinition<WordSearchConfig> = {
  type: 'wordsearch',
  label: 'Word Search',
  icon: '🔍',
  component: WordSearch,
  configComponent: WordSearchConfigBar,
  defaultWidth: 5,
  defaultHeight: 6,
  defaultConfig: {
    difficulty: 1,
    wordCount: 3,
    limitedLetters: false,
    customWordsText: '',
  },
  resizable: {
    width: true,
    height: true,
    minWidth: 4,
    maxWidth: GRID_COLS,
    minHeight: 5,
    maxHeight: GRID_ROWS,
  },
};
