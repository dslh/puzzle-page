import { WORD_LIST, type WordEntry } from '../WordSearch/wordList';
import { SeededRandom } from '../../../utils/random';

export interface InitialSoundItem {
  word: string;
  emoji: string;
  /** The letter the word starts with, upper case. */
  letter: string;
  /** Three letters to choose from, upper case, the answer among them. */
  choices: string[];
}

export interface InitialSoundsPuzzle {
  items: InitialSoundItem[];
}

/**
 * The puzzle asks for the first *sound*, and a child answers by naming the
 * picture and listening. So a word only qualifies when its first letter makes
 * that letter's usual sound - otherwise the "right" letter can't be heard.
 */
const DIGRAPH_STARTS = ['SH', 'CH', 'TH', 'WH', 'PH', 'KN', 'WR', 'GN'];

// Vowels are taught by their short sound ("a" for apple), so only words that
// start with one qualify. ICE, EAR, OWL, EAGLE and ONE start with something else.
const SHORT_VOWEL_WORDS = new Set(['ANT', 'APPLE', 'EGG', 'OLIVE', 'OTTER']);

// G before E/I/Y is usually soft (GEM, GIANT), but not always.
const HARD_G_WORDS = new Set(['GIFT', 'GIRL']);

/**
 * Pictures that a child would plausibly name with a different first letter.
 * Matching and Word Search print the word beside the picture, so these are
 * fine there; here the picture is all the child has to go on.
 */
const AMBIGUOUS_PICTURES = new Set([
  // Animals with a commoner name
  'BUG', // caterpillar
  'HEN', // chicken
  'RAM', // sheep
  'RAT', // mouse
  'DOVE', // bird, pigeon
  'WOLF', // dog
  'BUNNY', // rabbit
  'GOOSE', // duck, bird
  'SQUID', // octopus
  // Food named by its container or by a broader word
  'HAM', // meat
  'NUT', // peanut
  'TEA', // cup
  'CANDY', // sweet
  'SOUP', // bowl
  'RICE', // bowl
  'PASTA', // spaghetti
  'SUSHI',
  'BACON',
  'BEANS',
  'SALAD',
  // Nature
  'LOG', // wood
  'WAVE', // sea, water
  'ROSE', // flower
  'TULIP', // flower
  'SEED', // plant
  'PLANT', // pot, flower
  'RAIN', // cloud, umbrella
  'ROCK', // stone
  'EARTH', // world, globe
  'COMET',
  'CORAL',
  'BEACH',
  // Objects
  'CAN', // tin
  'CAP', // hat
  'TIE', // shirt
  'GIFT', // present
  'LAMP', // light, bulb
  'MAIL', // post, letter
  'STOP', // sign
  'DROP', // water
  'TRUCK', // lorry
  'TAXI', // car
  'CANOE', // boat
  'MONEY', // bag
  'VEST', // jacket
  'PLATE', // knife and fork
  'PAINT', // palette
  'PAPER',
  'FLUTE', // recorder
  'NAIL', // hand
  // People and actions, which emoji show as a face or a figure
  'KING', // crown
  'WOMAN', // lady, mum
  'MOUTH', // lips
  'RUN', // boy, man
  'HUG', // smile, face
  'SLEEP', // face
  'CLAP', // hands
]);

export function firstSoundLetter(word: string): string | null {
  const first = word[0];
  if ('AEIOU'.includes(first)) return SHORT_VOWEL_WORDS.has(word) ? first : null;
  if (DIGRAPH_STARTS.some((d) => word.startsWith(d))) return null;
  if (/^C[EIY]/.test(word)) return null;
  if (/^G[EIY]/.test(word) && !HARD_G_WORDS.has(word)) return null;
  if (first === 'X') return null; // XYLOPHONE starts with a /z/
  return first;
}

export function isEligible(w: WordEntry): boolean {
  return (
    w.pictureClue !== false &&
    !AMBIGUOUS_PICTURES.has(w.word) &&
    firstSoundLetter(w.word) !== null
  );
}

/**
 * Letters that are easily mixed up, by shape (b/d/p, n/u) or by sound (c/k,
 * f/v, e/i, m/n). A distractor is never drawn from the answer's group: the
 * puzzle is about hearing the first sound, not a b/d reversal test.
 */
const CONFUSABLE_GROUPS = ['CKQ', 'BDPQ', 'MN', 'NU', 'FV', 'EI'];

function confusable(a: string, b: string): boolean {
  return CONFUSABLE_GROUPS.some((g) => g.includes(a) && g.includes(b));
}

// Distractors come from letters a child meets early. Q, X and Y rarely start a
// word in early phonics and would just be noise.
const DISTRACTOR_LETTERS = 'ABCDEFGHIJKLMNOPRSTUVWZ'.split('');

/** Upper case letters typed into the config field, deduplicated. */
export function parseLetters(text: string): string[] {
  return [...new Set(text.toUpperCase().replace(/[^A-Z]/g, '').split(''))];
}

function pickChoices(rng: SeededRandom, answer: string, preferred: string[]): string[] {
  const usable = (letters: string[]) =>
    letters.filter((l) => l !== answer && !confusable(l, answer));

  // A parent who limits the letters is working through a phonics sequence, so
  // the distractors should be letters the child knows too, when there are enough.
  let pool = usable(preferred);
  if (pool.length < 2) pool = usable(DISTRACTOR_LETTERS);

  const distractors = rng.shuffle(pool).slice(0, 2);
  return rng.shuffle([answer, ...distractors]);
}

export function generateInitialSounds(
  seed: number,
  count: number,
  lettersText: string
): InitialSoundsPuzzle {
  const rng = new SeededRandom(seed);
  const letters = parseLetters(lettersText);

  const byLetter = new Map<string, WordEntry[]>();
  for (const w of WORD_LIST) {
    if (!isEligible(w)) continue;
    const letter = firstSoundLetter(w.word)!;
    if (letters.length > 0 && !letters.includes(letter)) continue;
    byLetter.set(letter, [...(byLetter.get(letter) ?? []), w]);
  }

  if (byLetter.size === 0) return { items: [] };

  // Deal round-robin across letters, so a sheet practises many sounds rather
  // than mostly B and S, which have the most pictures. A letter drops out of
  // the rotation once its pictures are used up; only when every letter has run
  // dry are the decks reshuffled, so a small letter set on a big sheet repeats.
  const shuffleDecks = () =>
    new Map([...byLetter].map(([letter, words]) => [letter, rng.shuffle(words)]));
  let decks = shuffleDecks();

  const picked: WordEntry[] = [];
  let order: string[] = [];
  while (picked.length < count) {
    if (order.length === 0) {
      let live = [...decks.keys()].filter((l) => decks.get(l)!.length > 0);
      if (live.length === 0) {
        decks = shuffleDecks();
        live = [...decks.keys()];
      }
      order = rng.shuffle(live);
    }
    picked.push(decks.get(order.pop()!)!.pop()!);
  }

  const preferred = letters.length > 0 ? letters : DISTRACTOR_LETTERS;
  return {
    items: picked.map((w) => {
      const letter = firstSoundLetter(w.word)!;
      return {
        word: w.word,
        emoji: w.emoji,
        letter,
        choices: pickChoices(rng, letter, preferred),
      };
    }),
  };
}
