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
  presets: [
    {
      id: 'findthepair',
      label: 'Find the Pair',
      icon: '🧦',
      category: 'thinking',
      config: { mode: 'pair' },
    },
  ],
  component: OddOneOut,
  docs: () => import('./docs'),
  configComponent: OddOneOutConfigBar,
  defaultWidth: 5,
  defaultHeight: 5,
  defaultConfig: {
    mode: 'odd',
    size: 5,
  },
};
