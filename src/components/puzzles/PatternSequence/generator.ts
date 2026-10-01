export type PatternStyle = 'colours' | 'shapes';

/** Groups of rules the parent switches on and off together */
export type PatternFamily = 'simple' | 'doubles' | 'four' | 'growing' | 'mirror';

/**
 * Shapes mode only. `mixed`: some shapes come filled in, and sometimes two
 * letters are the same shape told apart only by fill. `outline`: never filled.
 * `separate`: fill follows its own short repeat, out of step with the shapes.
 */
export type FillMode = 'mixed' | 'outline' | 'separate';

export type GapMode = 'end' | 'anywhere' | 'two';

export type Shape =
  | 'square'
  | 'circle'
  | 'rectangle'
  | 'star'
  | 'diamond'
  | 'hexagon'
  | 'triangle'
  | 'oval';

export type PatternItem =
  | { kind: 'colour'; colour: string }
  | { kind: 'shape'; shape: Shape; filled: boolean };

/**
 * How the sequence is built. A repeating rule is its core unit written as
 * letters (`AABB` = two of one thing, two of another, repeat); `growing` adds
 * one more B each time round: A B, A B B, A B B B, ...
 */
export type PatternRule =
  | 'AB'
  | 'ABC'
  | 'AAB'
  | 'ABB'
  | 'AABB'
  | 'ABCD'
  | 'ABAC'
  | 'growing'
  // Mirror rules: bounce (there and back, end not repeated) and reflected
  // (there and back, end doubled). Still plain repeating units.
  | 'ABCB'
  | 'ABCDCB'
  | 'ABBA'
  | 'ABCCBA';

export const RULES_BY_FAMILY: Record<PatternFamily, readonly PatternRule[]> = {
  simple: ['AB', 'ABC'],
  doubles: ['AAB', 'ABB', 'AABB'],
  four: ['ABCD', 'ABAC'],
  growing: ['growing'],
  mirror: ['ABCB', 'ABCDCB', 'ABBA', 'ABCCBA'],
};

const MIRROR_RULES: readonly PatternRule[] = RULES_BY_FAMILY.mirror;

export interface PatternOptions {
  style: PatternStyle;
  /** Which kinds of pattern rows may use; at least one */
  families: readonly PatternFamily[];
  /** Shapes mode only */
  fill: FillMode;
  gaps: GapMode;
}

export const DEFAULT_PATTERN_OPTIONS: PatternOptions = {
  style: 'shapes',
  families: ['simple', 'doubles', 'mirror'],
  fill: 'mixed',
  gaps: 'anywhere',
};

export interface PatternRow {
  items: PatternItem[];
  /** Indices into `items` the child has to fill in */
  blanks: number[];
  rule: PatternRule;
  /** The fill's own repeat, when it follows one separately from the shapes */
  fillRule?: FillRule;
}

type FillRule = 'AB' | 'AAB' | 'ABB';

// Seeded random number generator for reproducible puzzles
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

  pick<T>(array: readonly T[]): T {
    return array[this.nextInt(array.length)];
  }

  shuffle<T>(array: readonly T[]): T[] {
    const result = [...array];
    for (let i = result.length - 1; i > 0; i--) {
      const j = this.nextInt(i + 1);
      [result[i], result[j]] = [result[j], result[i]];
    }
    return result;
  }
}

// Available colors (matching Sudoku colors)
const COLORS = ['red', 'green', 'blue', 'yellow'];

export const SHAPES: readonly Shape[] = [
  'square',
  'circle',
  'rectangle',
  'star',
  'diamond',
  'hexagon',
  'triangle',
  'oval',
];

/** Index of the first item that may be blanked in a growing pattern (A B A B B A|B B B) */
const GROWING_FIRST_BLANK = 6;
const GROWING_MIN_LENGTH = 9;

function minLength(rule: PatternRule): number {
  if (rule === 'growing') return GROWING_MIN_LENGTH;
  // A mirror's turn-around is visible within one unit, and its 6-long units
  // could never be shown twice on a row, so one unit and a bit is enough
  if (MIRROR_RULES.includes(rule)) return rule.length + 3;
  // Two full repeats plus at least one more, so the unit is visible twice over
  return rule.length * 2 + 1;
}

function distinctLetters(rule: PatternRule): number {
  return rule === 'growing' ? 2 : new Set(rule).size;
}

/** The letter sequence for a rule, as indices 0 (A), 1 (B), ... */
function letterSequence(rule: PatternRule, length: number): number[] {
  const out: number[] = [];
  if (rule === 'growing') {
    for (let bs = 1; out.length < length; bs++) {
      out.push(0);
      for (let b = 0; b < bs; b++) out.push(1);
    }
    return out.slice(0, length);
  }
  for (let i = 0; i < length; i++) {
    out.push(rule.charCodeAt(i % rule.length) - 65);
  }
  return out;
}

function pickColours(rng: SeededRandom, count: number): PatternItem[] {
  return rng.shuffle(COLORS).slice(0, count).map((colour) => ({ kind: 'colour', colour }));
}

function pickShapes(rng: SeededRandom, count: number, fill: FillMode): PatternItem[] {
  const items: PatternItem[] = rng
    .shuffle(SHAPES)
    .slice(0, count)
    .map((shape) => ({ kind: 'shape', shape, filled: false }));

  if (fill === 'mixed') {
    if (count >= 2 && rng.next() < 0.5) {
      // Two letters the same shape, told apart only by being coloured in
      const shape = (items[0] as { shape: Shape }).shape;
      items[1] = { kind: 'shape', shape, filled: true };
    } else {
      for (const item of items) {
        if (item.kind === 'shape' && rng.next() < 0.25) item.filled = true;
      }
    }
  }
  return items;
}

/**
 * A fill repeat whose length differs from the shape unit's, so the two drift
 * against each other rather than one being a relabelling of the other.
 */
function pickFillRule(rng: SeededRandom, shapeUnit: number): FillRule {
  return shapeUnit % 3 === 0 ? 'AB' : rng.pick(['AAB', 'ABB'] as const);
}

function pickBlanks(rng: SeededRandom, first: number, length: number, gaps: GapMode): number[] {
  const last = length - 1;
  if (gaps === 'end' || last <= first) return [last];

  if (gaps === 'anywhere') {
    return [rng.nextInt(length - first) + first]; // first..last
  }
  // Two: either "what comes next, and next" or one gap plus the end
  if (rng.next() < 0.4) return [last - 1, last];
  return [rng.nextInt(last - first) + first, last];
}

function enabledRules({ style, families }: PatternOptions): PatternRule[] {
  const maxLetters = style === 'colours' ? COLORS.length : SHAPES.length;
  return (families.length > 0 ? families : (['simple'] as const))
    .flatMap((f) => RULES_BY_FAMILY[f])
    .filter((r) => distinctLetters(r) <= maxLetters);
}

/** The fewest items a row needs for at least one enabled rule to be solvable */
export function requiredRowLength(options: PatternOptions): number {
  return Math.min(...enabledRules(options).map(minLength));
}

/**
 * Generate `rows` rows, each `length` items long, drawing rules from the
 * enabled families. Rows avoid repeating the previous row's rule. Rules too
 * long for `length` are skipped; if none of the enabled ones fit, the shortest
 * is used anyway.
 */
export function generatePatternRows(
  seed: number,
  rows: number,
  length: number,
  options: PatternOptions
): PatternRow[] {
  const { style, gaps } = options;
  const fill: FillMode = style === 'shapes' ? options.fill : 'outline';
  const rng = new SeededRandom(seed);

  const enabled = enabledRules(options);
  let rules = enabled.filter((r) => minLength(r) <= length);
  if (rules.length === 0) {
    const shortest = Math.min(...enabled.map(minLength));
    rules = enabled.filter((r) => minLength(r) === shortest);
  }

  const result: PatternRow[] = [];
  let previous: PatternRule | null = null;
  for (let r = 0; r < rows; r++) {
    const candidates = rules.length > 1 ? rules.filter((x) => x !== previous) : rules;
    const rule = rng.pick(candidates);
    previous = rule;

    const letters = distinctLetters(rule);
    const palette =
      style === 'colours' ? pickColours(rng, letters) : pickShapes(rng, letters, fill);
    const items = letterSequence(rule, length).map((l) => ({ ...palette[l] }));

    // Never blank anything before the first full unit, so every blank has a
    // visible twin earlier in the row to check against
    let first = rule === 'growing' ? GROWING_FIRST_BLANK : rule.length;

    // A growing pattern has no fixed unit to drift against, so it stays plain
    let fillRule: FillRule | undefined;
    if (fill === 'separate' && rule !== 'growing') {
      fillRule = pickFillRule(rng, rule.length);
      const filledLetter = rng.nextInt(2);
      letterSequence(fillRule, length).forEach((l, i) => {
        const item = items[i];
        if (item.kind === 'shape') item.filled = l === filledLetter;
      });
      first = Math.max(first, fillRule.length);
    }

    const blanks = pickBlanks(rng, first, length, gaps);
    result.push({ items, blanks, rule, fillRule });
  }
  return result;
}
