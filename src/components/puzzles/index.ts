import { puzzleDefinition as maze } from './Maze/definition';
import { puzzleDefinition as sudoku } from './Sudoku/definition';
import { puzzleDefinition as whichDoesntBelong } from './WhichDoesntBelong/definition';
import { puzzleDefinition as patternSequence } from './PatternSequence/definition';
import { puzzleDefinition as matching } from './Matching/definition';

/**
 * Registry of all available puzzle types
 * Each puzzle definition contains metadata and the component to render it
 */
export const PUZZLE_DEFINITIONS = [
  maze,
  sudoku,
  whichDoesntBelong,
  patternSequence,
  matching,
] as const;

/**
 * Get puzzle definition by type
 */
export function getPuzzleDefinition(type: string) {
  return PUZZLE_DEFINITIONS.find(def => def.type === type);
}
