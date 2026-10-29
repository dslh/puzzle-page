import { SeededRandom } from '../../../utils/random';

/**
 * Who Goes Where? - a line-up logic puzzle. A few animals each live in one
 * of a row of houses, and a handful of picture clues say where. The child
 * works out who goes where by elimination.
 *
 * Clues are generated from a hidden answer and chosen so that:
 * - exactly one arrangement fits them all,
 * - a child can get there one step at a time (a clue places an animal, or
 *   rules a house out, or there is only one left) with no "suppose that..."
 *   case-splitting,
 * - no clue is spare: take any one away and the puzzle stops being solvable,
 * - the mix of clue kinds suits the level.
 */

export type Level = 'easy' | 'medium' | 'hard';

export interface Animal {
  emoji: string;
  name: string;
}

export interface House {
  /** CSS colour of the walls */
  colour: string;
  /** For the words clues: "the red house" */
  name: string;
}

export type Clue =
  /** The animal lives in this house */
  | { kind: 'in'; animal: number; house: number }
  /** The animal does not live in this house */
  | { kind: 'not'; animal: number; house: number }
  /** The first animal's house is just left of the second's */
  | { kind: 'leftOf'; animal: number; other: number };

export interface WhoGoesWherePuzzle {
  animals: Animal[];
  houses: House[];
  /** The animals in the order they are shown to choose from */
  lineUp: number[];
  clues: Clue[];
  /** solution[house] = animal */
  solution: number[];
}

/** Animal faces that read clearly small, with the name a child would use. */
export const ANIMALS: Animal[] = [
  { emoji: '🐶', name: 'dog' },
  { emoji: '🐱', name: 'cat' },
  { emoji: '🐭', name: 'mouse' },
  { emoji: '🐰', name: 'rabbit' },
  { emoji: '🦊', name: 'fox' },
  { emoji: '🐻', name: 'bear' },
  { emoji: '🐼', name: 'panda' },
  { emoji: '🐨', name: 'koala' },
  { emoji: '🐯', name: 'tiger' },
  { emoji: '🦁', name: 'lion' },
  { emoji: '🐮', name: 'cow' },
  { emoji: '🐷', name: 'pig' },
  { emoji: '🐸', name: 'frog' },
  { emoji: '🐵', name: 'monkey' },
  { emoji: '🐔', name: 'chicken' },
  { emoji: '🐧', name: 'penguin' },
];

export const HOUSES: House[] = [
  { colour: '#ef7b7b', name: 'red' },
  { colour: '#6fb1ea', name: 'blue' },
  { colour: '#7fc98a', name: 'green' },
  { colour: '#f7d060', name: 'yellow' },
];

/** What each level allows, as counts of each kind of clue. */
interface LevelRules {
  kinds: Clue['kind'][];
  min: Partial<Record<Clue['kind'], number>>;
  max: Partial<Record<Clue['kind'], number>>;
}

const LEVEL_RULES: Record<Level, LevelRules> = {
  // Mostly "lives in" clues, so the format is the only new thing
  easy: { kinds: ['in', 'not'], min: {}, max: { not: 1 } },
  // "Does not live in" clues, so every answer is reached by ruling out
  medium: { kinds: ['in', 'not'], min: { not: 2 }, max: { in: 1 } },
  // Adds the "next door" clue, which depends on another animal
  hard: { kinds: ['in', 'not', 'leftOf'], min: { leftOf: 1, not: 1 }, max: {} },
};

const MAX_CLUES = 5;

function permutations(n: number): number[][] {
  if (n === 0) return [[]];
  const result: number[][] = [];
  for (const rest of permutations(n - 1)) {
    for (let i = 0; i <= rest.length; i++) {
      result.push([...rest.slice(0, i), n - 1, ...rest.slice(i)]);
    }
  }
  return result;
}

/** Does this arrangement (house -> animal) satisfy the clue? */
function holds(clue: Clue, arrangement: number[]): boolean {
  const houseOf = (animal: number) => arrangement.indexOf(animal);
  switch (clue.kind) {
    case 'in':
      return arrangement[clue.house] === clue.animal;
    case 'not':
      return arrangement[clue.house] !== clue.animal;
    case 'leftOf':
      return houseOf(clue.animal) + 1 === houseOf(clue.other);
  }
}

function solutions(clues: Clue[], all: number[][]): number[][] {
  return all.filter(arrangement => clues.every(clue => holds(clue, arrangement)));
}

/**
 * The steps a child can take, applied until nothing changes. Returns the
 * houses still possible for each animal; solved when every set is one house.
 */
function childSolve(clues: Clue[], n: number): number[][] {
  const possible: number[][] = Array.from({ length: n }, () => Array.from({ length: n }, (_, h) => h));
  const ruleOut = (animal: number, house: number): boolean => {
    const before = possible[animal].length;
    possible[animal] = possible[animal].filter(h => h !== house);
    return possible[animal].length < before;
  };

  let changed = true;
  while (changed) {
    changed = false;
    for (const clue of clues) {
      if (clue.kind === 'in') {
        for (const h of [...possible[clue.animal]]) if (h !== clue.house) changed = ruleOut(clue.animal, h) || changed;
      } else if (clue.kind === 'not') {
        changed = ruleOut(clue.animal, clue.house) || changed;
      } else {
        // Each must sit next to a house the other could still be in
        for (const h of [...possible[clue.animal]]) {
          if (!possible[clue.other].includes(h + 1)) changed = ruleOut(clue.animal, h) || changed;
        }
        for (const h of [...possible[clue.other]]) {
          if (!possible[clue.animal].includes(h - 1)) changed = ruleOut(clue.other, h) || changed;
        }
      }
    }
    // An animal with one house left takes it from the others
    for (let a = 0; a < n; a++) {
      if (possible[a].length !== 1) continue;
      for (let b = 0; b < n; b++) if (b !== a) changed = ruleOut(b, possible[a][0]) || changed;
    }
    // A house only one animal could be in is that animal's
    for (let h = 0; h < n; h++) {
      const candidates = possible.map((set, a) => (set.includes(h) ? a : -1)).filter(a => a >= 0);
      if (candidates.length !== 1) continue;
      const a = candidates[0];
      for (const other of [...possible[a]]) if (other !== h) changed = ruleOut(a, other) || changed;
    }
  }
  return possible;
}

function isSolvedByChild(clues: Clue[], n: number): boolean {
  return childSolve(clues, n).every(set => set.length === 1);
}

/** Every true clue of the allowed kinds about this arrangement. */
function allClues(solution: number[], kinds: Clue['kind'][]): Clue[] {
  const n = solution.length;
  const clues: Clue[] = [];
  for (let house = 0; house < n; house++) {
    for (let animal = 0; animal < n; animal++) {
      const kind = solution[house] === animal ? 'in' : 'not';
      if (kinds.includes(kind)) clues.push({ kind, animal, house });
    }
  }
  if (kinds.includes('leftOf')) {
    for (let house = 0; house + 1 < n; house++) {
      clues.push({ kind: 'leftOf', animal: solution[house], other: solution[house + 1] });
    }
  }
  return clues;
}

function* combinations<T>(items: T[], k: number, start = 0): Generator<T[]> {
  if (k === 0) {
    yield [];
    return;
  }
  for (let i = start; i <= items.length - k; i++) {
    for (const rest of combinations(items, k - 1, i + 1)) yield [items[i], ...rest];
  }
}

function fitsLevel(clues: Clue[], rules: LevelRules): boolean {
  const count = (kind: Clue['kind']) => clues.filter(c => c.kind === kind).length;
  for (const kind of ['in', 'not', 'leftOf'] as const) {
    if (count(kind) < (rules.min[kind] ?? 0)) return false;
    if (count(kind) > (rules.max[kind] ?? Infinity)) return false;
  }
  return true;
}

/**
 * Put the clues in the order a child would use them: at each step, the clue
 * that gets furthest from where they are. Ties keep the sampled order.
 */
function orderClues(clues: Clue[], n: number): Clue[] {
  const remaining = [...clues];
  const ordered: Clue[] = [];
  const openness = (set: Clue[]) => childSolve(set, n).reduce((sum, houses) => sum + houses.length, 0);
  while (remaining.length > 0) {
    let best = 0;
    let bestScore = Infinity;
    remaining.forEach((clue, i) => {
      const score = openness([...ordered, clue]);
      if (score < bestScore) {
        bestScore = score;
        best = i;
      }
    });
    ordered.push(remaining.splice(best, 1)[0]);
  }
  return ordered;
}

/**
 * The fewest clues that pin the arrangement down, solvable step by step and
 * within the level's mix. Subsets are tried in a seeded order, so a seed
 * always gives the same clues.
 */
function chooseClues(random: SeededRandom, solution: number[], level: Level): Clue[] | null {
  const n = solution.length;
  const rules = LEVEL_RULES[level];
  const pool = random.shuffle(allClues(solution, rules.kinds));
  const all = permutations(n);
  for (let k = 2; k <= MAX_CLUES; k++) {
    for (const clues of combinations(pool, k)) {
      if (!fitsLevel(clues, rules)) continue;
      if (solutions(clues, all).length !== 1) continue;
      if (!isSolvedByChild(clues, n)) continue;
      const spare = clues.some((_, i) => solutions(clues.filter((__, j) => j !== i), all).length === 1);
      if (spare) continue;
      return orderClues(clues, n);
    }
  }
  return null;
}

export function generateWhoGoesWhere(seed: number, houseCount: 3 | 4, level: Level): WhoGoesWherePuzzle {
  const random = new SeededRandom(seed);
  const animals = random.shuffle(ANIMALS).slice(0, houseCount);
  const houses = random.shuffle(HOUSES).slice(0, houseCount);
  const lineUp = random.shuffle(animals.map((_, i) => i));

  // Every arrangement has a clue set at every level, but try again rather
  // than trust it
  for (let attempt = 0; attempt < 20; attempt++) {
    const solution = random.shuffle(animals.map((_, i) => i));
    const clues = chooseClues(random, solution, level);
    if (clues) return { animals, houses, lineUp, clues, solution };
  }
  const solution = animals.map((_, i) => i);
  return {
    animals,
    houses,
    lineUp,
    clues: solution.slice(0, -1).map((animal, house) => ({ kind: 'in', animal, house })),
    solution,
  };
}

/** The clue in words, for readers. */
export function clueInWords(clue: Clue, puzzle: WhoGoesWherePuzzle): string {
  const animal = puzzle.animals[clue.animal].name;
  switch (clue.kind) {
    case 'in':
      return `The ${animal} lives in the ${puzzle.houses[clue.house].name} house.`;
    case 'not':
      return `The ${animal} does not live in the ${puzzle.houses[clue.house].name} house.`;
    case 'leftOf':
      return `The ${animal} lives next door to the ${puzzle.animals[clue.other].name}, on the left.`;
  }
}
