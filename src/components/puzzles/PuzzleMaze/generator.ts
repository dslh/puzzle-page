export type Direction = 'up' | 'down' | 'left' | 'right';

export const ALL_DIRECTIONS: Direction[] = ['down', 'up', 'left', 'right'];

export interface Cell {
  direction: Direction;
  isPath: boolean;
}

export type DirectionEmojis = Record<Direction, string>;

export interface PuzzleMazeData {
  grid: Cell[][];
  width: number;
  height: number;
  startX: number;
  endX: number;
  emojis: DirectionEmojis;
}

export type EmojiMode = 'circles' | 'random';

const CIRCLES_THEME: string[] = ['🔴', '🟠', '🟢', '🔵', '🟡', '🟣', '⚫', '⚪', '🟤'];

const EMOJI_THEMES: string[][] = [
  ['🐶', '🐱', '🐭', '🐰', '🐼', '🐨', '🦊', '🐸', '🐷', '🐵', '🦁', '🐯'],
  ['🍎', '🍌', '🍇', '🍊', '🍓', '🍉', '🍑', '🍒', '🍍', '🥝', '🍋', '🥥'],
  ['🚗', '🚕', '🚙', '🚌', '🚎', '🏎️', '🚓', '🚑', '🚒', '🚐', '🛻', '🚚'],
  ['⚽', '🏀', '🎾', '⚾', '🏐', '🏈', '🎱', '🏓', '🏸', '🏒', '🥏', '🎳'],
  ['🌸', '🌺', '🌻', '🌹', '🌷', '🌼', '💐', '🏵️', '🪷'],
  ['🍕', '🍔', '🌭', '🌮', '🍟', '🥪', '🥙', '🌯', '🥗', '🍝', '🍜', '🥘'],
  ['🐠', '🐟', '🐡', '🦈', '🐙', '🦀', '🐚', '🦞', '🦑', '🐬', '🐳', '🦭'],
  ['☀️', '🌙', '⭐', '☁️', '⛅', '🌈', '❄️', '⚡', '🌧️', '🌩️', '🌪️'],
  ['🐦', '🦅', '🦆', '🦉', '🦚', '🦜', '🐧', '🦩', '🕊️', '🦢'],
  ['🦋', '🐞', '🐝', '🐛', '🐜', '🦗', '🪲', '🦟'],
  ['🥕', '🥦', '🌽', '🥒', '🍅', '🥔', '🧅', '🧄', '🫑', '🥬'],
  ['🍰', '🎂', '🧁', '🍪', '🍩', '🍦', '🍨', '🍧', '🧇', '🥧'],
  ['🎸', '🎹', '🎺', '🎷', '🥁', '🎻', '🪕', '🪗'],
  ['🌲', '🌳', '🌴', '🎄', '🌱', '🪴', '🌿', '🍀', '🎋'],
  ['🌍', '🪐', '⭐', '✨', '💫', '🌟', '🚀', '🛸'],
  ['🦒', '🦓', '🦏', '🦛', '🐘', '🦘', '🦙', '🦌', '🐪', '🦣'],
  ['🎉', '🎊', '🎈', '🎁', '🎀', '🪅', '🎆', '🎇'],
];

/**
 * Simple seeded random number generator (LCG algorithm)
 */
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

  pick<T>(arr: T[]): T {
    return arr[this.nextInt(arr.length)];
  }
}

/**
 * Get the direction needed to move from (x1, y1) to (x2, y2)
 */
function getDirection(x1: number, y1: number, x2: number, y2: number): Direction {
  if (y2 > y1) return 'down';
  if (y2 < y1) return 'up';
  if (x2 > x1) return 'right';
  return 'left';
}

/**
 * Shuffle an array in place using the seeded RNG (Fisher-Yates).
 */
function shuffle<T>(arr: T[], rng: SeededRandom): T[] {
  for (let i = arr.length - 1; i > 0; i--) {
    const j = rng.nextInt(i + 1);
    [arr[i], arr[j]] = [arr[j], arr[i]];
  }
  return arr;
}

/**
 * Generate a Puzzle Maze using a DFS spanning tree.
 *
 * 1. Build a random DFS tree rooted at the exit cell (bottom-right).
 *    Every cell gets a "parent" pointer — the direction toward its parent in the tree.
 * 2. The unique tree path from entrance (top-left) to exit (bottom-right) is the solution.
 *    All other cells' directions naturally feed into the tree, acting as distractors.
 * 3. The exit cell's direction is set to 'down' (pointing out of the grid).
 */
export function generatePuzzleMaze(
  width: number,
  height: number,
  seed: number,
  emojiMode: EmojiMode = 'random'
): PuzzleMazeData {
  const rng = new SeededRandom(seed);

  // Pick emoji theme based on mode
  const theme = emojiMode === 'circles' ? CIRCLES_THEME : rng.pick(EMOJI_THEMES);
  const picked: string[] = [];
  const available = [...theme];
  for (let i = 0; i < 4; i++) {
    const idx = rng.nextInt(available.length);
    picked.push(available[idx]);
    available.splice(idx, 1);
  }
  const emojis: DirectionEmojis = {
    down: picked[0],
    up: picked[1],
    left: picked[2],
    right: picked[3],
  };

  // Initialize parent direction grid (null = not yet visited)
  const parent: (Direction | null)[][] = [];
  for (let y = 0; y < height; y++) {
    parent[y] = [];
    for (let x = 0; x < width; x++) {
      parent[y][x] = null;
    }
  }

  // DFS from the exit cell (bottom-right) to build a spanning tree.
  // Each visited cell records the direction toward its parent.
  const exitX = width - 1;
  const exitY = height - 1;
  const startX = 0;

  // Mark exit as visited (root of tree — direction set to 'down' later)
  parent[exitY][exitX] = 'down'; // placeholder, will be the exit direction

  const stack: { x: number; y: number }[] = [{ x: exitX, y: exitY }];

  while (stack.length > 0) {
    const current = stack[stack.length - 1];
    const { x, y } = current;

    // Get unvisited neighbors in shuffled order
    const neighbors: { nx: number; ny: number }[] = [];
    if (y > 0) neighbors.push({ nx: x, ny: y - 1 });
    if (y < height - 1) neighbors.push({ nx: x, ny: y + 1 });
    if (x > 0) neighbors.push({ nx: x - 1, ny: y });
    if (x < width - 1) neighbors.push({ nx: x + 1, ny: y });
    shuffle(neighbors, rng);

    let found = false;
    for (const { nx, ny } of neighbors) {
      if (parent[ny][nx] === null) {
        // This neighbor's parent direction points back toward current cell
        parent[ny][nx] = getDirection(nx, ny, x, y);
        stack.push({ x: nx, y: ny });
        found = true;
        break;
      }
    }

    if (!found) {
      stack.pop();
    }
  }

  // Build the grid from the parent pointers
  const grid: Cell[][] = [];

  // Trace the solution path from entrance to exit by following parent pointers
  const pathSet = new Set<string>();
  let cx = startX;
  let cy = 0;
  while (!(cx === exitX && cy === exitY)) {
    pathSet.add(`${cx},${cy}`);
    const dir = parent[cy][cx]!;
    switch (dir) {
      case 'up': cy--; break;
      case 'down': cy++; break;
      case 'left': cx--; break;
      case 'right': cx++; break;
    }
  }
  pathSet.add(`${exitX},${exitY}`);

  for (let y = 0; y < height; y++) {
    grid[y] = [];
    for (let x = 0; x < width; x++) {
      grid[y][x] = {
        direction: parent[y][x]!,
        isPath: pathSet.has(`${x},${y}`),
      };
    }
  }

  return {
    grid,
    width,
    height,
    startX,
    endX: exitX,
    emojis,
  };
}

