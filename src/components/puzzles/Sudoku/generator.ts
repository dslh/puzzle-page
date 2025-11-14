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

  // Collect all remaining positions
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

  // Add cells one at a time until the puzzle has a unique solution
  let positionIndex = 0;
  while (!hasUniqueSolution(grid)) {
    if (positionIndex >= remainingPositions.length) {
      // Safety: if we run out of cells, reveal all of them
      break;
    }
    const [row, col] = remainingPositions[positionIndex];
    grid[row][col].isGiven = true;
    positionIndex++;
  }

  return { grid, solution };
}

/**
 * Check if a puzzle has a unique solution
 */
function hasUniqueSolution(grid: SudokuCell[][]): boolean {
  // Create a working copy of the grid with only given values
  const workingGrid: (number | null)[][] = [];
  for (let row = 0; row < 4; row++) {
    workingGrid[row] = [];
    for (let col = 0; col < 4; col++) {
      workingGrid[row][col] = grid[row][col].isGiven ? grid[row][col].value : null;
    }
  }

  // Count solutions using backtracking
  let solutionCount = 0;

  function solve(row: number, col: number): void {
    // If we've found more than 1 solution, stop searching
    if (solutionCount > 1) return;

    // Move to next cell
    if (col === 4) {
      row++;
      col = 0;
    }

    // If we've filled all cells, we found a solution
    if (row === 4) {
      solutionCount++;
      return;
    }

    // Skip cells that are already given
    if (workingGrid[row][col] !== null) {
      solve(row, col + 1);
      return;
    }

    // Try each possible value (0, 1, 2, 3)
    for (let value = 0; value < 4; value++) {
      if (isValid(workingGrid, row, col, value)) {
        workingGrid[row][col] = value;
        solve(row, col + 1);
        workingGrid[row][col] = null;
      }
    }
  }

  solve(0, 0);
  return solutionCount === 1;
}

/**
 * Check if placing a value at a position is valid
 */
function isValid(grid: (number | null)[][], row: number, col: number, value: number): boolean {
  // Check row
  for (let c = 0; c < 4; c++) {
    if (grid[row][c] === value) return false;
  }

  // Check column
  for (let r = 0; r < 4; r++) {
    if (grid[r][col] === value) return false;
  }

  return true;
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
