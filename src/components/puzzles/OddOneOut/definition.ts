import type { PuzzleDefinition } from '../../../types/puzzle';
import OddOneOut, { type OddOneOutConfig } from './index';
import OddOneOutConfigBar from './OddOneOutConfigBar';

export const puzzleDefinition: PuzzleDefinition<OddOneOutConfig> = {
  type: 'oddoneout',
  label: 'Odd One Out',
  icon: '🔍',
  category: 'thinking',
  ageConfig: {
    '2-3': { size: 3 },
  },
  component: OddOneOut,
  configComponent: OddOneOutConfigBar,
  defaultWidth: 5,
  defaultHeight: 5,
  defaultConfig: {
    size: 5,
  },
};
