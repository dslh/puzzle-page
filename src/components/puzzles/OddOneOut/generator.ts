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
    emojis: ['🐶', '🐱', '🐭', '🐹', '🐰', '🦊', '🐻', '🐼', '🐨', '🐯', '🦁', '🐮', '🐷', '🐸', '🐵', '🐔', '🐧', '🐦', '🦆', '🦉', '🦇', '🐺', '🐗', '🐴', '🦄', '🦓', '🦒', '🐘', '🦛', '🦏', '🐪', '🦘', '🦬', '🐄', '🐖', '🐑', '🐐', '🦌', '🐿️', '🦔', '🦡', '🦥', '🦨', '🐓', '🦃', '🦚', '🦜', '🦩'],
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
    emojis: ['🚗', '🚕', '🚙', '🚌', '🚎', '🏎️', '🚓', '🚑', '🚒', '🚐', '🛻', '🚚', '🚛', '🚜', '🏍️', '🛵', '🚲', '🛴', '🚂', '🚁', '✈️', '🚀', '🛸', '⛵', '🚤', '🚃', '🚋', '🚄', '🚅', '🚇', '🚊', '🚝', '🚞', '🚍', '🚔', '🚖', '🚘', '🛺', '🛩️', '🚡', '🚠', '🛶', '🚢', '⛴️', '🛥️', '🛹', '🛼', '🪂'],
  },
  {
    name: 'Food',
    emojis: ['🍕', '🍔', '🍟', '🌭', '🥪', '🌮', '🌯', '🥗', '🍿', '🧂', '🥫', '🍝', '🍜', '🍲', '🍛', '🍣', '🍱', '🥟', '🍤', '🍙', '🍚', '🍘', '🍥', '🥮', '🍡', '🥐', '🥖', '🥨', '🥯', '🥞', '🧇', '🧀', '🍗', '🥩', '🥓', '🍳', '🍞', '🧁', '🍰', '🎂', '🍩', '🍪', '🍫', '🍬', '🍭', '🍮', '🍦', '🍨'],
  },
  {
    name: 'Sports',
    emojis: ['⚽', '🏀', '🏈', '⚾', '🥎', '🎾', '🏐', '🏉', '🥏', '🎱', '🏓', '🏸', '🏒', '🥍', '🏑', '🥌', '⛳', '🎿', '🛷', '🥊', '🎯', '🪃', '🏹', '🎣', '🤿', '🏆', '🥇', '🏅', '🎽', '⛸️', '🪁', '🥅', '🏏', '🎳', '🪀', '🛹', '🛼', '🏋️', '🤸', '⛹️', '🏊', '🚴', '🏄', '🤺', '🏇', '🧗', '🤾', '🚣'],
  },
  {
    name: 'Sea Life',
    emojis: ['🐳', '🐋', '🐬', '🦭', '🐟', '🐠', '🐡', '🦈', '🐙', '🐚', '🦀', '🦞', '🦐', '🦑', '🪼', '🐢', '🐊', '🦎', '🐍', '🦕', '🦖', '🐉', '🐲', '🦔', '🦦'],
  },
  {
    name: 'Nature',
    emojis: ['🌸', '🌹', '🌺', '🌻', '🌼', '🌷', '💐', '🌱', '🪴', '🌲', '🌳', '🌴', '🌵', '🍀', '☘️', '🍃', '🍂', '🍁', '🌾', '🌿', '🪻', '🪷', '💮', '🏵️', '🌈', '🥀', '🍄', '🪨', '🪵', '🌰', '🪹', '🌊', '🔥', '💧', '❄️', '☀️', '⛅', '🌧️', '⛈️', '🌪️', '☃️', '⛄', '⚡', '🌋', '🏔️', '🏝️', '🌙', '⭐'],
  },
];

/**
 * 'odd': every picture appears twice, apart from one on its own.
 * 'pair': every picture appears once, apart from one that appears twice.
 */
export type OddOneOutMode = 'odd' | 'pair';

export interface OddOneOutPuzzle {
  grid: string[][];
  /** The picture to find: the one on its own, or the one in the pair. */
  answer: string;
  themeName: string;
}

export function generateOddOneOut(size: 3 | 5 | 7, mode: OddOneOutMode, seed: number): OddOneOutPuzzle {
  const random = new SeededRandom(seed);
  const cellCount = size * size;

  // How many different pictures the grid needs: 12 pairs + 1 for a 5×5 odd
  // one out, or 23 singles + 1 pair for a 5×5 pair. A 7×7 pair needs 48, which
  // only some themes have; every theme has enough for the other grids.
  const distinctCount = mode === 'odd' ? (cellCount + 1) / 2 : cellCount - 1;
  const themes = EMOJI_THEMES.filter(t => t.emojis.length >= distinctCount);
  const theme = themes[random.nextInt(themes.length)];

  const selectedEmojis = random.shuffle(theme.emojis).slice(0, distinctCount);

  // Odd: the last picture appears once, the rest twice.
  // Pair: every picture appears once, and the first one again.
  let cells: string[];
  let answer: string;
  if (mode === 'odd') {
    answer = selectedEmojis[distinctCount - 1];
    cells = selectedEmojis.slice(0, -1).flatMap(e => [e, e]);
    cells.push(answer);
  } else {
    answer = selectedEmojis[0];
    cells = [...selectedEmojis, answer];
  }

  // Shuffle the positions
  const shuffledCells = random.shuffle(cells);

  // Convert to 2D grid
  const grid: string[][] = [];
  for (let row = 0; row < size; row++) {
    grid.push(shuffledCells.slice(row * size, (row + 1) * size));
  }

  return {
    grid,
    answer,
    themeName: theme.name,
  };
}
