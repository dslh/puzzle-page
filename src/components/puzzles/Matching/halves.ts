/**
 * Pictures for halves mode, where each is cut down the middle and the child
 * joins the two halves.
 *
 * Half a picture has to say which whole it came from, so this is a hand-kept
 * list rather than a category of emoji. Two tags keep a page fair:
 *
 * - `shape` - the outline alone tells it apart, so it survives a black and
 *   white printout. Round faces and fruit don't, but in colour they're the
 *   easiest of all, so they're in the default pool and out of "Different".
 * - `lookalike` - pictures sharing a key have halves that could be mistaken
 *   for each other (two orange round things, two dolphin shapes). A page
 *   never shows two from the same group.
 */
export interface HalfPicture {
  emoji: string;
  shape: boolean;
  lookalike?: string;
}

export const HALF_PICTURES: HalfPicture[] = [
  // Round, told apart by colour
  { emoji: '🍎', shape: false, lookalike: 'red-round' },
  { emoji: '🍓', shape: false, lookalike: 'red-round' },
  { emoji: '🍊', shape: false, lookalike: 'orange-round' },
  { emoji: '🏀', shape: false, lookalike: 'orange-round' },
  { emoji: '🎃', shape: false, lookalike: 'orange-round' },
  { emoji: '🍋', shape: false, lookalike: 'yellow-round' },
  { emoji: '😀', shape: false, lookalike: 'yellow-round' },
  { emoji: '🌞', shape: false, lookalike: 'yellow-round' },
  { emoji: '🍉', shape: false },
  { emoji: '🍇', shape: false },
  { emoji: '🥝', shape: false },
  { emoji: '🍩', shape: false, lookalike: 'brown-round' },
  { emoji: '🍪', shape: false, lookalike: 'brown-round' },
  { emoji: '🍔', shape: false, lookalike: 'brown-round' },
  { emoji: '⚽', shape: false },
  { emoji: '🌍', shape: false },
  { emoji: '🎁', shape: false },
  { emoji: '🌸', shape: false },
  { emoji: '🐱', shape: false, lookalike: 'cat-face' },
  { emoji: '🐯', shape: false, lookalike: 'cat-face' },
  { emoji: '🦁', shape: false, lookalike: 'cat-face' },
  { emoji: '🦊', shape: false, lookalike: 'cat-face' },
  { emoji: '🐶', shape: false, lookalike: 'brown-face' },
  { emoji: '🐻', shape: false, lookalike: 'brown-face' },
  { emoji: '🐵', shape: false, lookalike: 'brown-face' },
  { emoji: '🐭', shape: false, lookalike: 'pale-face' },
  { emoji: '🐰', shape: false, lookalike: 'pale-face' },
  { emoji: '🐨', shape: false, lookalike: 'pale-face' },
  { emoji: '🐷', shape: false },
  { emoji: '🐸', shape: false },
  { emoji: '🐼', shape: false },
  { emoji: '🐮', shape: false },

  // Told apart by outline alone
  { emoji: '🦒', shape: true, lookalike: 'long-neck' },
  { emoji: '🦙', shape: true, lookalike: 'long-neck' },
  { emoji: '🐘', shape: true },
  { emoji: '🦕', shape: true, lookalike: 'dinosaur' },
  { emoji: '🦖', shape: true, lookalike: 'dinosaur' },
  { emoji: '🐌', shape: true },
  { emoji: '🦋', shape: true },
  { emoji: '🐢', shape: true },
  { emoji: '🐙', shape: true },
  { emoji: '🦀', shape: true },
  { emoji: '🐳', shape: true, lookalike: 'sea' },
  { emoji: '🐬', shape: true, lookalike: 'sea' },
  { emoji: '🦈', shape: true, lookalike: 'sea' },
  { emoji: '🐊', shape: true, lookalike: 'long-low' },
  { emoji: '🦎', shape: true, lookalike: 'long-low' },
  { emoji: '🐓', shape: true, lookalike: 'bird' },
  { emoji: '🦜', shape: true, lookalike: 'bird' },
  { emoji: '🦩', shape: true },
  { emoji: '🐇', shape: true, lookalike: 'hopper' },
  { emoji: '🦘', shape: true, lookalike: 'hopper' },
  { emoji: '🐪', shape: true },
  { emoji: '🍌', shape: true },
  { emoji: '🍐', shape: true },
  { emoji: '🥕', shape: true },
  { emoji: '🍄', shape: true },
  { emoji: '🌵', shape: true },
  { emoji: '🌴', shape: true },
  { emoji: '🌲', shape: true },
  { emoji: '🌻', shape: true },
  { emoji: '⭐', shape: true },
  { emoji: '🌙', shape: true },
  { emoji: '🚀', shape: true },
  { emoji: '✈️', shape: true },
  { emoji: '⛵', shape: true },
  { emoji: '🚂', shape: true },
  { emoji: '🎸', shape: true },
  { emoji: '🔑', shape: true },
  { emoji: '⚓', shape: true },
  { emoji: '👑', shape: true },
  { emoji: '☂️', shape: true },
  { emoji: '🏰', shape: true },
  { emoji: '🎈', shape: true },
];
