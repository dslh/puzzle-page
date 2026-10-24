import { CATEGORIES, clash } from '../WhichDoesntBelong/generator';
import { FACING, LOOKALIKES } from './lookalikes';

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

  pick<T>(array: T[]): T {
    return array[this.nextInt(array.length)];
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

export type SameDifficulty = 'easy' | 'medium' | 'hard' | 'mixed';
type Level = Exclude<SameDifficulty, 'mixed'>;

/** How a picture is turned: mirrored, upside down, or both (a vertical flip). */
export type Turn = 'none' | 'mirror' | 'upside' | 'upside-mirror';

export interface Picture {
  emoji: string;
  turn: Turn;
}

export interface SameRow {
  target: Picture;
  choices: Picture[];
  answer: number;
}

/**
 * Hands out items in a shuffled order, each once until all have had a turn,
 * skipping any that don't suit the row being built.
 */
class Deck<T> {
  private order: T[] = [];
  private items: T[];
  private random: SeededRandom;

  constructor(items: T[], random: SeededRandom) {
    this.items = items;
    this.random = random;
  }

  draw(suits: (item: T) => boolean): T | undefined {
    for (let pass = 0; pass < 2; pass++) {
      const index = this.order.findIndex(suits);
      if (index >= 0) return this.order.splice(index, 1)[0];
      this.order = this.random.shuffle(this.items);
    }
    return undefined;
  }
}

/** A target and the wrong pictures beside it, before any turning. */
interface Draft {
  target: string;
  others: string[];
}

function sameKind(
  random: SeededRandom,
  deck: Deck<string[]>,
  count: number,
  flipped: boolean
): Draft | undefined {
  const group = deck.draw(items =>
    items.length > count && (!flipped || items.some(item => FACING.has(item)))
  );
  if (!group) return undefined;
  const target = random.pick(flipped ? group.filter(item => FACING.has(item)) : group);
  const others = random.shuffle(group.filter(item => item !== target)).slice(0, count);
  return { target, others };
}

function unrelated(
  random: SeededRandom,
  deck: Deck<typeof CATEGORIES[number]>,
  count: number,
  flipped: boolean
): Draft {
  const category = deck.draw(c => !flipped || c.items.some(item => FACING.has(item)))!;
  const items = flipped ? category.items.filter(item => FACING.has(item)) : category.items;
  const target = random.pick(items);
  // One picture from each of several categories in other families
  const others = random
    .shuffle(CATEGORIES.filter(other => !clash(other, category)))
    .slice(0, count)
    .map(other => random.pick(other.items));
  return { target, others };
}

const LEVELS: Level[] = ['easy', 'medium', 'hard'];

/**
 * A sheet of rows, each a picture in a box and a row of choices with exactly
 * one the same. The level sets the wrong choices: easy are other kinds of
 * thing, medium the same kind (a Which Doesn't Belong? category), hard a
 * lookalike group. Flipped adds the target mirrored, and upside down from 4
 * choices up, and mirrors the boxed picture half the time, so the answer is
 * the one facing the same way.
 */
export function generateWhichIsTheSame(
  seed: number,
  rowCount: number,
  difficulty: SameDifficulty,
  choiceCount: number,
  flipped: boolean
): SameRow[] {
  const random = new SeededRandom(seed);
  const categories = new Deck(CATEGORIES, random);
  const groups = new Deck(LOOKALIKES, random);
  const categoryItems = new Deck(CATEGORIES.map(c => c.items), random);

  const turned = flipped ? (choiceCount >= 4 ? 2 : 1) : 0;
  const count = choiceCount - 1 - turned;

  const rows: SameRow[] = [];
  for (let i = 0; i < rowCount; i++) {
    // Mixed gets harder down the page, a third at each level
    const level = difficulty === 'mixed'
      ? LEVELS[Math.floor((i * LEVELS.length) / rowCount)]
      : difficulty;

    const draft =
      (level === 'hard' && sameKind(random, groups, count, flipped)) ||
      (level !== 'easy' && sameKind(random, categoryItems, count, flipped)) ||
      unrelated(random, categories, count, flipped);

    const turn: Turn = flipped && random.next() < 0.5 ? 'mirror' : 'none';
    const target = { emoji: draft.target, turn };
    const choices: Picture[] = [
      { ...target },
      ...draft.others.map(emoji => ({ emoji, turn: 'none' as Turn })),
    ];
    if (turned >= 1) {
      choices.push({ emoji: draft.target, turn: turn === 'mirror' ? 'none' : 'mirror' });
    }
    if (turned >= 2) {
      choices.push({ emoji: draft.target, turn: turn === 'mirror' ? 'upside-mirror' : 'upside' });
    }

    const shuffled = random.shuffle(choices);
    rows.push({
      target,
      choices: shuffled,
      answer: shuffled.indexOf(choices[0]),
    });
  }
  return rows;
}
