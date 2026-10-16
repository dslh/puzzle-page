/**
 * Homes mode: animals and the places they live.
 *
 * A line is only gradeable if the animal has exactly one sensible home among
 * the homes on the page - and that is a property of the whole set, not of any
 * one pair. An owl lives in a tree, but put a nest beside the tree and the
 * child who draws owl to nest isn't wrong. So each animal lists its best home
 * plus every other home a child could reasonably pick (`alsoFits`), and the
 * generator never shows an animal next to a second home it fits.
 *
 * Left out for want of an emoji for the home: cave (bear, bat), hive (bee),
 * pond (frog, duck), stable, kennel, anthill, savanna (lion, giraffe).
 */

export type HomeId =
  | 'sea'
  | 'desert'
  | 'snow'
  | 'nest'
  | 'web'
  | 'jungle'
  | 'woods'
  | 'burrow'
  | 'farm'
  | 'house';

export interface Home {
  id: HomeId;
  emoji: string;
  name: string;
}

export interface HomeAnimal {
  emoji: string;
  name: string;
  home: HomeId;
  /** Other homes a child could fairly match this animal to. */
  alsoFits?: HomeId[];
}

export const HOMES: Home[] = [
  { id: 'sea', emoji: '🌊', name: 'sea' },
  { id: 'desert', emoji: '🏜️', name: 'desert' },
  // A snowflake reads as "cold and icy" more surely than 🧊, which is an ice
  // cube, or 🏔️, which puts the polar bear up a mountain.
  { id: 'snow', emoji: '❄️', name: 'snow and ice' },
  { id: 'nest', emoji: '🪺', name: 'nest' },
  { id: 'web', emoji: '🕸️', name: 'web' },
  { id: 'jungle', emoji: '🌴', name: 'jungle' },
  { id: 'woods', emoji: '🌳', name: 'woods' },
  { id: 'burrow', emoji: '🕳️', name: 'burrow' },
  // No barn emoji; the tractor is the clearest "farm".
  { id: 'farm', emoji: '🚜', name: 'farm' },
  { id: 'house', emoji: '🏠', name: 'house' },
];

export const HOME_ANIMALS: HomeAnimal[] = [
  { emoji: '🐟', name: 'fish', home: 'sea' },
  { emoji: '🐠', name: 'tropical fish', home: 'sea' },
  { emoji: '🐙', name: 'octopus', home: 'sea' },
  { emoji: '🐳', name: 'whale', home: 'sea' },
  { emoji: '🐬', name: 'dolphin', home: 'sea' },
  { emoji: '🦈', name: 'shark', home: 'sea' },
  { emoji: '🪼', name: 'jellyfish', home: 'sea' },

  { emoji: '🐪', name: 'camel', home: 'desert' },
  { emoji: '🐫', name: 'camel', home: 'desert' },
  { emoji: '🦂', name: 'scorpion', home: 'desert' },

  { emoji: '🐻‍❄️', name: 'polar bear', home: 'snow' },
  // Both spend half their lives swimming.
  { emoji: '🐧', name: 'penguin', home: 'snow', alsoFits: ['sea'] },
  { emoji: '🦭', name: 'seal', home: 'snow', alsoFits: ['sea'] },

  { emoji: '🐦', name: 'bird', home: 'nest', alsoFits: ['woods'] },

  { emoji: '🕷️', name: 'spider', home: 'web', alsoFits: ['house'] },

  { emoji: '🐅', name: 'tiger', home: 'jungle' },
  { emoji: '🐒', name: 'monkey', home: 'jungle', alsoFits: ['woods'] },
  { emoji: '🦍', name: 'gorilla', home: 'jungle' },
  { emoji: '🦜', name: 'parrot', home: 'jungle', alsoFits: ['nest', 'woods'] },
  { emoji: '🦥', name: 'sloth', home: 'jungle', alsoFits: ['woods'] },

  { emoji: '🐿️', name: 'squirrel', home: 'woods' },
  { emoji: '🦉', name: 'owl', home: 'woods', alsoFits: ['nest'] },
  { emoji: '🦌', name: 'deer', home: 'woods' },

  { emoji: '🐇', name: 'rabbit', home: 'burrow', alsoFits: ['farm', 'house'] },
  { emoji: '🦡', name: 'badger', home: 'burrow', alsoFits: ['woods'] },

  { emoji: '🐄', name: 'cow', home: 'farm' },
  { emoji: '🐖', name: 'pig', home: 'farm' },
  { emoji: '🐑', name: 'sheep', home: 'farm' },
  { emoji: '🐐', name: 'goat', home: 'farm' },
  { emoji: '🐓', name: 'chicken', home: 'farm', alsoFits: ['nest'] },
  { emoji: '🐴', name: 'horse', home: 'farm' },

  { emoji: '🐶', name: 'dog', home: 'house', alsoFits: ['farm'] },
  { emoji: '🐱', name: 'cat', home: 'house', alsoFits: ['farm'] },
  { emoji: '🐹', name: 'hamster', home: 'house' },
];
