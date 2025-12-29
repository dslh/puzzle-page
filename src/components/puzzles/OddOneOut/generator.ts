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

interface EmojiTheme {
  name: string;
  emojis: string[];
}

const EMOJI_THEMES: EmojiTheme[] = [
  {
    name: 'Animals',
    emojis: ['🐶', '🐱', '🐭', '🐹', '🐰', '🦊', '🐻', '🐼', '🐨', '🐯', '🦁', '🐮', '🐷', '🐸', '🐵', '🐔', '🐧', '🐦', '🦆', '🦉', '🦇', '🐺', '🐗', '🐴', '🦄'],
  },
  {
    name: 'Faces',
    emojis: ['😀', '😃', '😄', '😁', '😆', '😅', '🤣', '😂', '🙂', '😉', '😊', '😇', '🥰', '😍', '🤩', '😘', '😋', '😛', '😜', '🤪', '😝', '🤗', '🤔', '🤨', '😐', '😏', '🙄', '😬', '😌', '😴', '😎', '🤓', '🥳', '😕', '🙁', '😮', '😲', '😳', '🥺', '😢', '😭', '😤', '😡', '🥱', '😈', '🤡', '👻', '💀'],
  },
  {
    name: 'Space',
    emojis: ['🌍', '🌎', '🌏', '🪐', '💫', '⭐', '🌟', '✨', '☄️', '🌙', '🌛', '🌜', '🌝', '🌚', '🌑', '🌒', '🌓', '🌔', '🌕', '🌖', '🌗', '🌘', '🚀', '🛸', '🌌'],
  },
  {
    name: 'Insects',
    emojis: ['🐛', '🦋', '🐌', '🐞', '🐜', '🪲', '🐝', '🪳', '🦟', '🪰', '🪱', '🦗', '🕷', '🦂', '🦠', '🐚', '🪺', '🕸', '🐾', '🦎', '🐍', '🦀', '🦞', '🦐', '🦑'],
  },
  {
    name: 'Fruits',
    emojis: ['🍎', '🍐', '🍊', '🍋', '🍌', '🍉', '🍇', '🍓', '🫐', '🍒', '🍑', '🥭', '🍍', '🥝', '🥥', '🍏', '🍈', '🍅', '🫒', '🥑', '🍆', '🥔', '🥕', '🌽', '🥒'],
  },
  {
    name: 'Vehicles',
    emojis: ['🚗', '🚕', '🚙', '🚌', '🚎', '🏎️', '🚓', '🚑', '🚒', '🚐', '🛻', '🚚', '🚛', '🚜', '🏍️', '🛵', '🚲', '🛴', '🚂', '🚁', '✈️', '🚀', '🛸', '⛵', '🚤'],
  },
  {
    name: 'Food',
    emojis: ['🍕', '🍔', '🍟', '🌭', '🥪', '🌮', '🌯', '🥗', '🍿', '🧂', '🥫', '🍝', '🍜', '🍲', '🍛', '🍣', '🍱', '🥟', '🍤', '🍙', '🍚', '🍘', '🍥', '🥮', '🍡'],
  },
  {
    name: 'Sports',
    emojis: ['⚽', '🏀', '🏈', '⚾', '🥎', '🎾', '🏐', '🏉', '🥏', '🎱', '🏓', '🏸', '🏒', '🥍', '🏑', '🥌', '⛳', '🎿', '🛷', '🥊', '🎯', '🪃', '🏹', '🎣', '🤿'],
  },
  {
    name: 'Sea Life',
    emojis: ['🐳', '🐋', '🐬', '🦭', '🐟', '🐠', '🐡', '🦈', '🐙', '🐚', '🦀', '🦞', '🦐', '🦑', '🪼', '🐢', '🐊', '🦎', '🐍', '🦕', '🦖', '🐉', '🐲', '🦔', '🦦'],
  },
  {
    name: 'Nature',
    emojis: ['🌸', '🌹', '🌺', '🌻', '🌼', '🌷', '💐', '🌱', '🪴', '🌲', '🌳', '🌴', '🌵', '🍀', '☘️', '🍃', '🍂', '🍁', '🌾', '🌿', '🪻', '🪷', '💮', '🏵️', '🌈'],
  },
];

export interface OddOneOutPuzzle {
  grid: string[][];
  oddEmoji: string;
  themeName: string;
}

export function generateOddOneOut(size: 3 | 5 | 7, seed: number): OddOneOutPuzzle {
  const random = new SeededRandom(seed);

  // Select a random theme
  const theme = EMOJI_THEMES[random.nextInt(EMOJI_THEMES.length)];

  // Calculate how many cells and pairs we need
  const cellCount = size * size;
  const pairCount = (cellCount - 1) / 2; // e.g., 12 for 5×5 (25 cells = 12 pairs + 1 odd)

  // Shuffle emojis and pick enough for pairs + 1 odd
  const shuffledEmojis = random.shuffle(theme.emojis);
  const selectedEmojis = shuffledEmojis.slice(0, pairCount + 1);

  // The last selected emoji is the odd one (appears once)
  const oddEmoji = selectedEmojis[pairCount];

  // Create the flat array: each of the first pairCount emojis appears twice, odd appears once
  const cells: string[] = [];
  for (let i = 0; i < pairCount; i++) {
    cells.push(selectedEmojis[i], selectedEmojis[i]);
  }
  cells.push(oddEmoji);

  // Shuffle the positions
  const shuffledCells = random.shuffle(cells);

  // Convert to 2D grid
  const grid: string[][] = [];
  for (let row = 0; row < size; row++) {
    grid.push(shuffledCells.slice(row * size, (row + 1) * size));
  }

  return {
    grid,
    oddEmoji,
    themeName: theme.name,
  };
}
