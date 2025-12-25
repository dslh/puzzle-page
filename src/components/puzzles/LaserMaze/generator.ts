// Direction the laser is traveling
export type Direction = 'up' | 'down' | 'left' | 'right';

// Mirror type: forward slash or backslash
export type MirrorType = '/' | '\\' | null;

// A point in the laser path
export interface PathPoint {
  x: number;
  y: number;
}

// Exit point with emoji label
export interface ExitPoint {
  side: 'left' | 'right';
  position: number; // Row index
  emoji: string;
  isCorrectExit: boolean;
}

// Entry point configuration
export interface EntryPoint {
  side: 'top';
  position: number; // Column index
  emoji: string;
}

// Complete puzzle data
export interface LaserMazePuzzle {
  mirrors: MirrorType[][]; // 2D grid of mirrors [row][col]
  entry: EntryPoint;
  exits: ExitPoint[];
  solutionPath: PathPoint[];
  correctExitEmoji: string;
  gridSize: number; // Internal mirror grid dimension
}

// Seeded random number generator
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

// Mirror reflection logic
function reflectDirection(dir: Direction, mirror: MirrorType): Direction {
  if (mirror === null) return dir;

  if (mirror === '/') {
    // Forward slash: → becomes ↑, ↓ becomes ←, ← becomes ↓, ↑ becomes →
    switch (dir) {
      case 'right':
        return 'up';
      case 'down':
        return 'left';
      case 'left':
        return 'down';
      case 'up':
        return 'right';
    }
  } else {
    // Backslash: → becomes ↓, ↓ becomes →, ← becomes ↑, ↑ becomes ←
    switch (dir) {
      case 'right':
        return 'down';
      case 'down':
        return 'right';
      case 'left':
        return 'up';
      case 'up':
        return 'left';
    }
  }
}

interface SimulationResult {
  path: PathPoint[];
  exitSide: 'left' | 'right' | 'top' | 'bottom' | null;
  exitPosition: number;
  reflectionCount: number;
}

// Simulate laser path through the mirror grid
function simulateLaserPath(
  mirrors: MirrorType[][],
  entryCol: number,
  maxSteps: number = 1000
): SimulationResult {
  const path: PathPoint[] = [];
  const gridSize = mirrors.length;
  let reflectionCount = 0;

  let x = entryCol;
  let y = 0;
  let dir: Direction = 'down';

  // Track visited states to detect loops
  const visited = new Set<string>();

  for (let step = 0; step < maxSteps; step++) {
    const state = `${x},${y},${dir}`;
    if (visited.has(state)) {
      // Loop detected
      return { path, exitSide: null, exitPosition: -1, reflectionCount };
    }
    visited.add(state);

    // Check bounds and handle exits
    if (x < 0) return { path, exitSide: 'left', exitPosition: y, reflectionCount };
    if (x >= gridSize) return { path, exitSide: 'right', exitPosition: y, reflectionCount };
    if (y < 0) return { path, exitSide: 'top', exitPosition: x, reflectionCount };
    if (y >= gridSize) return { path, exitSide: 'bottom', exitPosition: x, reflectionCount };

    path.push({ x, y });

    // Reflect off mirror at current position
    const mirror = mirrors[y][x];
    if (mirror) {
      dir = reflectDirection(dir, mirror);
      reflectionCount++;
    }

    // Move in current direction
    switch (dir) {
      case 'up':
        y--;
        break;
      case 'down':
        y++;
        break;
      case 'left':
        x--;
        break;
      case 'right':
        x++;
        break;
    }
  }

  // Max steps exceeded (shouldn't happen with loop detection)
  return { path, exitSide: null, exitPosition: -1, reflectionCount };
}

// Emoji sets
const ENTRY_EMOJI = '🚀';
// Need enough emojis for all positions on both sides (up to 6 + 6 = 12)
const EXIT_EMOJIS = [
  '🪐', '⭐', '🌙', '☀️', '🌍', '💫',
  '🌟', '✨', '🔮', '🎯', '💎', '🎪',
];

export function generateLaserMaze(
  gridWidth: number,
  gridHeight: number,
  seed: number
): LaserMazePuzzle {
  const rng = new SeededRandom(seed);

  // Calculate internal grid size based on puzzle dimensions
  // Formula: mirrorGridSize = min(gridWidth, gridHeight) - 1, clamped to 3-6
  const mirrorGridSize = Math.min(Math.max(3, Math.min(gridWidth, gridHeight) - 1), 6);

  const MIN_REFLECTIONS = 4;

  let mirrors: MirrorType[][] = [];
  let solutionPath: PathPoint[] = [];
  let exitSide: 'left' | 'right' | null = null;
  let exitPosition = -1;
  let entryCol = 0;
  let attempts = 0;
  const maxAttempts = 500; // Increased since we're more selective

  // Keep regenerating until we get a valid puzzle with enough reflections
  while (attempts < maxAttempts) {
    mirrors = [];
    for (let y = 0; y < mirrorGridSize; y++) {
      mirrors[y] = [];
      for (let x = 0; x < mirrorGridSize; x++) {
        // ~80% chance of mirror for denser grids with more reflections
        if (rng.next() < 0.8) {
          mirrors[y][x] = rng.next() < 0.5 ? '/' : '\\';
        } else {
          mirrors[y][x] = null;
        }
      }
    }

    // Random entry point from top
    entryCol = rng.nextInt(mirrorGridSize);

    const result = simulateLaserPath(mirrors, entryCol, 1000);

    if (result.exitSide === 'left' || result.exitSide === 'right') {
      if (
        result.exitPosition >= 0 &&
        result.exitPosition < mirrorGridSize &&
        result.reflectionCount >= MIN_REFLECTIONS
      ) {
        solutionPath = result.path;
        exitSide = result.exitSide;
        exitPosition = result.exitPosition;
        break;
      }
    }
    attempts++;
  }

  // Fallback if we couldn't generate a valid puzzle
  if (!exitSide || exitPosition < 0) {
    // Create a zigzag puzzle with guaranteed 4+ reflections
    mirrors = Array(mirrorGridSize)
      .fill(null)
      .map(() => Array(mirrorGridSize).fill(null) as MirrorType[]);
    // Entry at column 0, create a zigzag path
    // Down -> right -> down -> right -> down -> exit right
    entryCol = 0;
    mirrors[0][0] = '\\'; // down -> right
    mirrors[0][1] = '/';  // right -> down
    mirrors[1][1] = '\\'; // down -> right
    mirrors[1][2] = '/';  // right -> down
    mirrors[2][2] = '\\'; // down -> right
    exitSide = 'right';
    exitPosition = 2;
    solutionPath = [
      { x: 0, y: 0 },
      { x: 1, y: 0 },
      { x: 1, y: 1 },
      { x: 2, y: 1 },
      { x: 2, y: 2 },
    ];
  }

  // Generate exit points on BOTH sides at every position
  const totalExits = mirrorGridSize * 2; // Left + right sides
  const shuffledEmojis = rng.shuffle([...EXIT_EMOJIS]).slice(0, totalExits);

  const exits: ExitPoint[] = [];
  let emojiIndex = 0;
  let correctExitEmoji = '';

  // Add exits on left side
  for (let pos = 0; pos < mirrorGridSize; pos++) {
    const isCorrect = exitSide === 'left' && pos === exitPosition;
    const emoji = shuffledEmojis[emojiIndex++];
    if (isCorrect) correctExitEmoji = emoji;
    exits.push({
      side: 'left',
      position: pos,
      emoji,
      isCorrectExit: isCorrect,
    });
  }

  // Add exits on right side
  for (let pos = 0; pos < mirrorGridSize; pos++) {
    const isCorrect = exitSide === 'right' && pos === exitPosition;
    const emoji = shuffledEmojis[emojiIndex++];
    if (isCorrect) correctExitEmoji = emoji;
    exits.push({
      side: 'right',
      position: pos,
      emoji,
      isCorrectExit: isCorrect,
    });
  }

  return {
    mirrors,
    entry: {
      side: 'top',
      position: entryCol,
      emoji: ENTRY_EMOJI,
    },
    exits,
    solutionPath,
    correctExitEmoji,
    gridSize: mirrorGridSize,
  };
}
