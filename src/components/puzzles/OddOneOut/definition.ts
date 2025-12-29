import type { PuzzleDefinition } from '../../../types/puzzle';
import OddOneOut, { type OddOneOutConfig } from './index';
import OddOneOutConfigBar from './OddOneOutConfigBar';

export const puzzleDefinition: PuzzleDefinition<OddOneOutConfig> = {
  type: 'oddoneout',
  label: 'Odd One Out',
  icon: '🔍',
  component: OddOneOut,
  configComponent: OddOneOutConfigBar,
  defaultWidth: 5,
  defaultHeight: 5,
  defaultConfig: {
    size: 5,
  },
};
