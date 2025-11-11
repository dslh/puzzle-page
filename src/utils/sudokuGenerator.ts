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

  // Randomly select 6-8 cells to be given (pre-filled)
  const randomValue = random ? random.next() : Math.random();
  const numGiven = 6 + Math.floor(randomValue * 3); // 6, 7, or 8

  const positions: Array<[number, number]> = [];
  for (let row = 0; row < 4; row++) {
    for (let col = 0; col < 4; col++) {
      positions.push([row, col]);
    }
  }

  // Shuffle positions using Fisher-Yates
  for (let i = positions.length - 1; i > 0; i--) {
    const randomValue = random ? random.next() : Math.random();
    const j = Math.floor(randomValue * (i + 1));
    [positions[i], positions[j]] = [positions[j], positions[i]];
  }

  // Mark first numGiven positions as given
  for (let i = 0; i < numGiven; i++) {
    const [row, col] = positions[i];
    grid[row][col].isGiven = true;
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
