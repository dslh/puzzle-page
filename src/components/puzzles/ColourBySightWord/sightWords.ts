/**
 * Dolch sight words - the pre-primer and primer lists (about 90 words).
 *
 * These are the high-frequency words early readers are taught to recognise on
 * sight rather than sound out ("the", "and", "was"). They are deliberately NOT
 * the illustrated nouns in `WordSearch/wordList.ts`: most of them cannot be
 * drawn at all, which is exactly why they suit a colour-by-word sheet - there
 * is no picture cue, so the child has to actually read the cell.
 *
 * The Dolch lists were published in 1936 and are long out of copyright.
 */

/** Dolch pre-primer - the first 40, met in reception / kindergarten. */
export const DOLCH_PRE_PRIMER: readonly string[] = [
  'a', 'and', 'away', 'big', 'blue', 'can', 'come', 'down', 'find', 'for',
  'funny', 'go', 'help', 'here', 'I', 'in', 'is', 'it', 'jump', 'little',
  'look', 'make', 'me', 'my', 'not', 'one', 'play', 'red', 'run', 'said',
  'see', 'the', 'three', 'to', 'two', 'up', 'we', 'where', 'yellow', 'you',
];

/** Dolch primer - the next 52, met in year 1. */
export const DOLCH_PRIMER: readonly string[] = [
  'all', 'am', 'are', 'at', 'ate', 'be', 'black', 'brown', 'but', 'came',
  'did', 'do', 'eat', 'four', 'get', 'good', 'have', 'he', 'into', 'like',
  'must', 'new', 'no', 'now', 'on', 'our', 'out', 'please', 'pretty', 'ran',
  'ride', 'saw', 'say', 'she', 'so', 'soon', 'that', 'there', 'they', 'this',
  'too', 'under', 'want', 'was', 'well', 'went', 'what', 'white', 'who',
  'will', 'with', 'yes',
];

/**
 * Words that name a colour the child cannot actually use here: "white" leaves
 * nothing to colour in, and a "black" region would bury the word printed in it.
 * The other colour words (blue, red, yellow, brown) stay in - the generator
 * pins them to their own colour, so a cell reading "blue" is always coloured
 * blue rather than being set as a trap.
 */
const UNUSABLE_COLOUR_WORDS = new Set(['white', 'black']);

/** Every usable Dolch pre-primer + primer word, in list order. */
export const SIGHT_WORDS: readonly string[] = [
  ...DOLCH_PRE_PRIMER,
  ...DOLCH_PRIMER,
].filter(word => !UNUSABLE_COLOUR_WORDS.has(word));
