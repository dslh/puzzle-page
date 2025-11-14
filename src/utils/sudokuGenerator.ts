/**
 * Simple seeded random number generator
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
}

export interface SudokuCell {
  value: number; // 0-3 index into symbol array
  isGiven: boolean; // true if pre-filled, false if player needs to fill
}

export interface Sudoku {
  grid: SudokuCell[][];
  solution: number[][]; // Complete solution for validation
}

/**
 * Generate a 4x4 sudoku puzzle with simplified rules
 * (each symbol appears once per row and column)
 */
export function generateSudoku(seed?: number): Sudoku {
  const random = seed ? new SeededRandom(seed) : null;

  // Generate a valid complete solution
  const solution = generateValidSolution(random);

  // Create puzzle grid by removing cells
  const grid: SudokuCell[][] = [];
  for (let row = 0; row < 4; row++) {
    grid[row] = [];
    for (let col = 0; col < 4; col++) {
      grid[row][col] = {
        value: solution[row][col],
        isGiven: false,
      };
    }
  }

  // Ensure at least one instance of each color (0, 1, 2, 3) is shown
  const colorPositions: Map<number, Array<[number, number]>> = new Map();

  // Group positions by color value
  for (let row = 0; row < 4; row++) {
    for (let col = 0; col < 4; col++) {
      const colorValue = solution[row][col];
      if (!colorPositions.has(colorValue)) {
        colorPositions.set(colorValue, []);
      }
      colorPositions.get(colorValue)!.push([row, col]);
    }
  }

  // Select one position for each color to ensure all colors appear
  const givenPositions: Set<string> = new Set();
  for (let color = 0; color < 4; color++) {
    const positions = colorPositions.get(color)!;
    const randomValue = random ? random.next() : Math.random();
    const selectedIndex = Math.floor(randomValue * positions.length);
    const [row, col] = positions[selectedIndex];
    grid[row][col].isGiven = true;
    givenPositions.add(`${row},${col}`);
  }

  // Randomly select additional cells to be given (total of 6-8)
  const randomValue = random ? random.next() : Math.random();
  const numGiven = 6 + Math.floor(randomValue * 3); // 6, 7, or 8
  const additionalNeeded = numGiven - 4; // We already have 4 colors shown

  if (additionalNeeded > 0) {
    const remainingPositions: Array<[number, number]> = [];
    for (let row = 0; row < 4; row++) {
      for (let col = 0; col < 4; col++) {
        if (!givenPositions.has(`${row},${col}`)) {
          remainingPositions.push([row, col]);
        }
      }
    }

    // Shuffle remaining positions using Fisher-Yates
    for (let i = remainingPositions.length - 1; i > 0; i--) {
      const randomValue = random ? random.next() : Math.random();
      const j = Math.floor(randomValue * (i + 1));
      [remainingPositions[i], remainingPositions[j]] = [remainingPositions[j], remainingPositions[i]];
    }

    // Mark additional positions as given
    for (let i = 0; i < additionalNeeded && i < remainingPositions.length; i++) {
      const [row, col] = remainingPositions[i];
      grid[row][col].isGiven = true;
    }
  }

  return { grid, solution };
}

/**
 * Generate a valid 4x4 sudoku solution
 */
function generateValidSolution(random: SeededRandom | null): number[][] {
  // Start with a valid base pattern and shuffle
  const solution: number[][] = [
    [0, 1, 2, 3],
    [1, 0, 3, 2],
    [2, 3, 0, 1],
    [3, 2, 1, 0],
  ];

  // Randomly swap rows and columns to create variety
  const numSwaps = 3 + Math.floor((random ? random.next() : Math.random()) * 5);

  for (let i = 0; i < numSwaps; i++) {
    const randomValue = random ? random.next() : Math.random();
    if (randomValue < 0.5) {
      // Swap two rows
      const row1 = Math.floor((random ? random.next() : Math.random()) * 4);
      const row2 = Math.floor((random ? random.next() : Math.random()) * 4);
      [solution[row1], solution[row2]] = [solution[row2], solution[row1]];
    } else {
      // Swap two columns
      const col1 = Math.floor((random ? random.next() : Math.random()) * 4);
      const col2 = Math.floor((random ? random.next() : Math.random()) * 4);
      for (let row = 0; row < 4; row++) {
        [solution[row][col1], solution[row][col2]] = [
          solution[row][col2],
          solution[row][col1],
        ];
      }
    }
  }

  return solution;
}
