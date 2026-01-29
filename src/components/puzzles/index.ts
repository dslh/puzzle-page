import { puzzleDefinition as maze } from './Maze/definition';
import { puzzleDefinition as weavingMaze } from './WeavingMaze/definition';
import { puzzleDefinition as sudoku } from './Sudoku/definition';
import { puzzleDefinition as whichDoesntBelong } from './WhichDoesntBelong/definition';
import { puzzleDefinition as patternSequence } from './PatternSequence/definition';
import { puzzleDefinition as matching } from './Matching/definition';
import { puzzleDefinition as pictureScramble } from './PictureScramble/definition';
import { puzzleDefinition as wordSearch } from './WordSearch/definition';
import { puzzleDefinition as laserMaze } from './LaserMaze/definition';
import { puzzleDefinition as oddOneOut } from './OddOneOut/definition';
import { puzzleDefinition as counting } from './Counting/definition';
import { puzzleDefinition as ordering } from './Ordering/definition';
import { puzzleDefinition as chess } from './Chess/definition';

/**
 * Registry of all available puzzle types
 * Each puzzle definition contains metadata and the component to render it
 */
export const PUZZLE_DEFINITIONS = [
  maze,
  weavingMaze,
  sudoku,
  whichDoesntBelong,
  patternSequence,
  matching,
  pictureScramble,
  wordSearch,
  laserMaze,
  oddOneOut,
  counting,
  ordering,
  chess,
] as const;

/**
 * Get puzzle definition by type
 */
export function getPuzzleDefinition(type: string) {
  return PUZZLE_DEFINITIONS.find(def => def.type === type);
}
