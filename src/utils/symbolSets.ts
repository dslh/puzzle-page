export interface SymbolSet {
  name: string;
  symbols: [string, string, string, string];
}

export const SYMBOL_SETS: SymbolSet[] = [
  {
    name: 'Animals',
    symbols: ['🐶', '🐱', '🐦', '🐠'],
  },
  {
    name: 'Shapes',
    symbols: ['⭐', '●', '▲', '■'],
  },
  {
    name: 'Fruits',
    symbols: ['🍎', '🍌', '🍇', '🍊'],
  },
  {
    name: 'Weather',
    symbols: ['☀️', '☁️', '🌙', '⚡'],
  },
  {
    name: 'Nature',
    symbols: ['🌸', '🌳', '🌈', '🦋'],
  },
  {
    name: 'Vehicles',
    symbols: ['🚗', '✈️', '🚂', '⛵'],
  },
];

/**
 * Get a symbol set by index, with wrapping
 */
export function getSymbolSet(index: number): SymbolSet {
  return SYMBOL_SETS[index % SYMBOL_SETS.length];
}
