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

// Find all possible intersection placements for a word
function findIntersectionPlacements(
  grid: string[][],
  word: string,
  directions: Direction[],
  gridSize: number
): Array<{ startX: number; startY: number; direction: Direction }> {
  const placements: Array<{ startX: number; startY: number; direction: Direction }> = [];

  // For each cell in the grid that has a letter
  for (let y = 0; y < gridSize; y++) {
    for (let x = 0; x < gridSize; x++) {
      const gridLetter = grid[y][x];
      if (gridLetter === '') continue;

      // For each position in the word that matches this letter
      for (let charIndex = 0; charIndex < word.length; charIndex++) {
        if (word[charIndex] !== gridLetter) continue;

        // Try each direction
        for (const direction of directions) {
          // Calculate starting position so word[charIndex] lands on (x, y)
          const startX = x - charIndex * direction.dx;
          const startY = y - charIndex * direction.dy;

          if (canPlaceWord(grid, word, startX, startY, direction, gridSize)) {
            placements.push({ startX, startY, direction });
          }
        }
      }
    }
  }

  return placements;
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

  // First, try to find placements that overlap with existing words
  const intersectionPlacements = findIntersectionPlacements(grid, word, shuffledDirs, gridSize);

  if (intersectionPlacements.length > 0) {
    // Shuffle and try intersection placements first
    const shuffledPlacements = random.shuffle(intersectionPlacements);
    const placement = shuffledPlacements[0];
    placeWord(grid, word, placement.startX, placement.startY, placement.direction);
    return {
      word,
      emoji: wordEntry.emoji,
      startX: placement.startX,
      startY: placement.startY,
      direction: placement.direction,
    };
  }

  // Fall back to random placement if no intersections found
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
  limitedLetters: boolean = false,
  customWordsText: string = ''
): WordSearchPuzzle {
  const random = new SeededRandom(seed);

  // Filter words that can fit in this grid size
  const maxWordLength = gridSize;

  // Parse custom words from text input, matching emoji from word list when possible
  const wordListMap = new Map(WORD_LIST.map(w => [w.word, w.emoji]));
  const validCustomWords: WordEntry[] = customWordsText
    .toUpperCase()
    .split(/[,\s]+/)
    .map(w => w.replace(/[^A-Z]/g, ''))
    .filter(w => w.length > 0 && w.length <= maxWordLength)
    .map(word => ({ word, emoji: wordListMap.get(word) ?? '' }));

  // Get available predefined words
  const availableWords = WORD_LIST.filter(w => w.word.length <= maxWordLength);

  // Sort custom words by length (longest first for better placement)
  validCustomWords.sort((a, b) => b.word.length - a.word.length);

  // Fill remaining slots with random predefined words if needed
  const remainingSlots = wordCount + 2 - validCustomWords.length; // +2 extra in case some fail
  let predefinedWords: WordEntry[] = [];
  if (remainingSlots > 0) {
    const shuffledWords = random.shuffle([...availableWords]);
    // Filter out any words that match custom words
    const customWordSet = new Set(validCustomWords.map(w => w.word));
    predefinedWords = shuffledWords
      .filter(w => !customWordSet.has(w.word))
      .slice(0, remainingSlots);
    // Sort predefined words by length
    predefinedWords.sort((a, b) => b.word.length - a.word.length);
  }

  // Custom words first, then predefined (ensures custom words are prioritized)
  const selectedWords: WordEntry[] = [...validCustomWords, ...predefinedWords];

  // Initialize empty grid
  const grid: string[][] = Array(gridSize)
    .fill(null)
    .map(() => Array(gridSize).fill(''));

  // Get available directions for this difficulty
  const availableDirections = DIRECTIONS_BY_DIFFICULTY[difficulty];

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
