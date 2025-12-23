import { WORD_LIST, type WordEntry } from './wordList';

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

interface Direction {
  dx: number;
  dy: number;
}

// Directions available at each difficulty level
const DIRECTIONS_BY_DIFFICULTY: Record<number, Direction[]> = {
  1: [
    { dx: 1, dy: 0 },  // right
  ],
  2: [
    { dx: 1, dy: 0 },  // right
    { dx: 0, dy: 1 },  // down
  ],
  3: [
    { dx: 1, dy: 0 },  // right
    { dx: 0, dy: 1 },  // down
    { dx: 1, dy: 1 },  // diagonal down-right
  ],
  4: [
    { dx: 1, dy: 0 },  // right
    { dx: -1, dy: 0 }, // left
    { dx: 0, dy: 1 },  // down
    { dx: 0, dy: -1 }, // up
    { dx: 1, dy: 1 },  // diagonal down-right
    { dx: -1, dy: -1 }, // diagonal up-left
    { dx: 1, dy: -1 }, // diagonal up-right
    { dx: -1, dy: 1 }, // diagonal down-left
  ],
};

export interface PlacedWord {
  word: string;
  emoji: string;
  startX: number;
  startY: number;
  direction: Direction;
}

export interface WordSearchPuzzle {
  grid: string[][];
  words: PlacedWord[];
  gridSize: number;
}

function canPlaceWord(
  grid: string[][],
  word: string,
  startX: number,
  startY: number,
  direction: Direction,
  gridSize: number
): boolean {
  for (let i = 0; i < word.length; i++) {
    const x = startX + i * direction.dx;
    const y = startY + i * direction.dy;

    // Check bounds
    if (x < 0 || x >= gridSize || y < 0 || y >= gridSize) {
      return false;
    }

    // Check collision (empty or same letter is OK)
    const currentCell = grid[y][x];
    if (currentCell !== '' && currentCell !== word[i]) {
      return false;
    }
  }
  return true;
}

function placeWord(
  grid: string[][],
  word: string,
  startX: number,
  startY: number,
  direction: Direction
): void {
  for (let i = 0; i < word.length; i++) {
    const x = startX + i * direction.dx;
    const y = startY + i * direction.dy;
    grid[y][x] = word[i];
  }
}

function tryPlaceWord(
  grid: string[][],
  wordEntry: WordEntry,
  directions: Direction[],
  random: SeededRandom,
  gridSize: number
): PlacedWord | null {
  const word = wordEntry.word;
  const shuffledDirs = random.shuffle([...directions]);
  const attempts = 50;

  for (let attempt = 0; attempt < attempts; attempt++) {
    const direction = shuffledDirs[random.nextInt(shuffledDirs.length)];
    const startX = random.nextInt(gridSize);
    const startY = random.nextInt(gridSize);

    if (canPlaceWord(grid, word, startX, startY, direction, gridSize)) {
      placeWord(grid, word, startX, startY, direction);
      return {
        word,
        emoji: wordEntry.emoji,
        startX,
        startY,
        direction,
      };
    }
  }

  return null;
}

export function generateWordSearch(
  seed: number,
  difficulty: 1 | 2 | 3 | 4,
  wordCount: 3 | 4 | 5,
  gridSize: number,
  limitedLetters: boolean = false
): WordSearchPuzzle {
  const random = new SeededRandom(seed);

  // Filter words that can fit in this grid size
  const maxWordLength = gridSize;
  const availableWords = WORD_LIST.filter(w => w.word.length <= maxWordLength);

  // Initialize empty grid
  const grid: string[][] = Array(gridSize)
    .fill(null)
    .map(() => Array(gridSize).fill(''));

  // Get available directions for this difficulty
  const availableDirections = DIRECTIONS_BY_DIFFICULTY[difficulty];

  // Shuffle and select words from those that fit
  const shuffledWords = random.shuffle([...availableWords]);
  const selectedWords: WordEntry[] = shuffledWords.slice(0, wordCount + 2); // Select extra in case some fail

  // Sort by word length (longest first for better placement)
  selectedWords.sort((a, b) => b.word.length - a.word.length);

  const placedWords: PlacedWord[] = [];

  // Try to place each word until we have enough
  for (const wordEntry of selectedWords) {
    if (placedWords.length >= wordCount) break;

    const placed = tryPlaceWord(
      grid,
      wordEntry,
      availableDirections,
      random,
      gridSize
    );
    if (placed) {
      placedWords.push(placed);
    }
  }

  // Fill remaining cells with random letters
  // If limitedLetters is true, only use letters from the placed words
  const ALL_LETTERS = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ';
  const wordLetters = limitedLetters
    ? [...new Set(placedWords.flatMap(w => w.word.split('')))].join('')
    : ALL_LETTERS;
  const fillLetters = wordLetters.length > 0 ? wordLetters : ALL_LETTERS;

  for (let y = 0; y < gridSize; y++) {
    for (let x = 0; x < gridSize; x++) {
      if (grid[y][x] === '') {
        grid[y][x] = fillLetters[random.nextInt(fillLetters.length)];
      }
    }
  }

  return { grid, words: placedWords, gridSize };
}
