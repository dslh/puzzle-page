import { CYCLES, CYCLE_IDS, type Cycle, type CycleId, type Stage } from './cycles';

export type LifeCyclesTask = 'number' | 'missing';
export type LifeCyclesChoice = 'mixed' | CycleId;

/** A stage as drawn in a jumbled row, with its place in the cycle (1 first). */
export interface PlacedStage {
  stage: Stage;
  place: number;
}

export interface NumberRow {
  cycle: CycleId;
  stages: PlacedStage[];
}

export interface MissingCircle {
  cycle: CycleId;
  stages: Stage[];
  /** Index of the stage left blank for the child to draw. */
  missing: number;
}

export type LifeCyclesPuzzle =
  | { task: 'number'; rows: NumberRow[] }
  | { task: 'missing'; circles: MissingCircle[]; across: boolean };

class SeededRandom {
  private seed: number;

  constructor(seed: number) {
    this.seed = seed;
  }

  next(): number {
    this.seed = (this.seed * 9301 + 49297) % 233280;
    return this.seed / 233280;
  }

  nextInt(max: number): number {
    return Math.floor(this.next() * max);
  }

  shuffle<T>(array: T[]): T[] {
    const result = [...array];
    for (let i = result.length - 1; i > 0; i--) {
      const j = this.nextInt(i + 1);
      [result[i], result[j]] = [result[j], result[i]];
    }
    return result;
  }
}

/** A row of jumbled stages needs about two grid cells: picture, then box. */
const ROW_CELLS = 2;

function stagesOf(id: CycleId): Stage[] {
  return (CYCLES[id] as Cycle).stages;
}

/**
 * True if reading the order left to right goes round the cycle, starting
 * anywhere. A cycle has no end, so "tadpole, froglet, frog, frogspawn" is
 * already in order and no puzzle at all.
 */
function goesRound(order: number[]): boolean {
  const n = order.length;
  return order.every((place, i) => i === 0 || place === (order[i - 1] + 1) % n);
}

function jumble(rng: SeededRandom, n: number): number[] {
  const inOrder = Array.from({ length: n }, (_, i) => i);
  let order = rng.shuffle(inOrder);
  // At least 4 stages, so most shuffles qualify; this rarely loops twice
  while (goesRound(order)) order = rng.shuffle(inOrder);
  return order;
}

function pickCycles(rng: SeededRandom, choice: LifeCyclesChoice, count: number): CycleId[] {
  if (choice !== 'mixed') return [choice];
  return rng.shuffle(CYCLE_IDS).slice(0, count);
}

export function generateLifeCycles(
  gridWidth: number,
  gridHeight: number,
  seed: number,
  task: LifeCyclesTask,
  choice: LifeCyclesChoice,
): LifeCyclesPuzzle {
  const rng = new SeededRandom(seed);

  if (task === 'number') {
    const count = Math.max(1, Math.floor(gridHeight / ROW_CELLS));
    const rows = pickCycles(rng, choice, count).map(cycle => {
      const stages = stagesOf(cycle);
      return {
        cycle,
        stages: jumble(rng, stages.length).map(i => ({ stage: stages[i], place: i + 1 })),
      };
    });
    return { task, rows };
  }

  // Each circle wants a square, so as many as fit along the longer side
  const across = gridWidth >= gridHeight;
  const long = Math.max(gridWidth, gridHeight);
  const short = Math.min(gridWidth, gridHeight);
  const count = Math.max(1, Math.floor(long / short));
  const circles = pickCycles(rng, choice, count).map(cycle => {
    const stages = stagesOf(cycle);
    return { cycle, stages, missing: rng.nextInt(stages.length) };
  });
  return { task, circles, across };
}
