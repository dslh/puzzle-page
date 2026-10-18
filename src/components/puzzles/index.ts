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
import { puzzleDefinition as puzzleMaze } from './PuzzleMaze/definition';
import { puzzleDefinition as handwriting } from './Handwriting/definition';
import { puzzleDefinition as colourBySightWord } from './ColourBySightWord/definition';
import { puzzleDefinition as letterFormation } from './LetterFormation/definition';
import { puzzleDefinition as sums } from './Sums/definition';
import { puzzleDefinition as takeAway } from './TakeAway/definition';
import { puzzleDefinition as moreOrLess } from './MoreOrLess/definition';
import { puzzleDefinition as initialSounds } from './InitialSounds/definition';
import { puzzleDefinition as directions } from './Directions/definition';
import { puzzleDefinition as secretCode } from './SecretCode/definition';
import type { PuzzleCategory, PuzzlePreset } from '../../types/puzzle';

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
  puzzleMaze,
  handwriting,
  colourBySightWord,
  letterFormation,
  sums,
  takeAway,
  moreOrLess,
  initialSounds,
  directions,
  secretCode,
] as const;

export type AnyPuzzleDefinition = typeof PUZZLE_DEFINITIONS[number];

/**
 * One item in the sidebar: a puzzle under a name, in a category, with the
 * config it starts from. Every puzzle gets one for its definition, plus one
 * per preset.
 */
export interface SidebarEntry {
  key: string;
  definition: AnyPuzzleDefinition;
  label: string;
  icon: string;
  category: PuzzleCategory;
  config: unknown;
}

export const SIDEBAR_ENTRIES: SidebarEntry[] = PUZZLE_DEFINITIONS.flatMap(definition => [
  {
    key: definition.type,
    definition,
    label: definition.label,
    icon: definition.icon,
    category: definition.category,
    config: definition.defaultConfig,
  },
  ...(definition.presets ?? []).map((preset: PuzzlePreset<unknown>) => ({
    key: `${definition.type}:${preset.id}`,
    definition,
    label: preset.label,
    icon: preset.icon ?? definition.icon,
    category: preset.category,
    config: { ...(definition.defaultConfig as object), ...(preset.config as object) },
  })),
]);

/**
 * Get puzzle definition by type
 */
export function getPuzzleDefinition(type: string) {
  return PUZZLE_DEFINITIONS.find(def => def.type === type);
}
