import type { PuzzleDefinition } from '../../../types/puzzle';
import SpotTheDifference, { type SpotTheDifferenceConfig } from './index';
import SpotTheDifferenceConfigBar from './SpotTheDifferenceConfigBar';

export const puzzleDefinition: PuzzleDefinition<SpotTheDifferenceConfig> = {
  type: 'spotthedifference',
  label: 'Spot the Difference',
  icon: '🔎',
  category: 'thinking',
  ages: ['4-5', '6-7'],
  ageConfig: { '6-7': { differences: 5 } },
  component: SpotTheDifference,
  configComponent: SpotTheDifferenceConfigBar,
  docs: () => import('./docs'),
  defaultConfig: { scene: 'garden', differences: 3, outline: false, answers: false },
  defaultWidth: 10,
  defaultHeight: 5,
  resizable: { width: true, height: true, minWidth: 6, maxWidth: 10, minHeight: 5, maxHeight: 14 },
};
