// Pictures for the dot grid: hand-kept, left-right symmetric by construction.
// Only one half is stored, as lines between grid dots in [out, along]: dots out
// from the mirror line (0 is on it) and dots down it from the top. Every line
// is drawn on the given side and mirrored for the answer.
//
// Levels follow the random shapes: easy is straight lines only, medium adds
// corner-to-corner slants, hard adds steep ones (one along two) and reaches
// further out. Draw new ones with the same rule; nothing checks it but eye.

import type { Lattice, ShapeLevel } from './generator';

export interface Picture {
  id: string;
  level: ShapeLevel;
  /** Still a picture turned on its side, for the Across mirror. */
  sideways?: boolean;
  lines: Lattice[][];
}

export const PICTURES: Picture[] = [
  // Easy: straight lines only
  {
    id: 'present',
    level: 'easy',
    sideways: true,
    lines: [
      [[0, 1], [3, 1], [3, 6], [0, 6]],
      [[0, 3], [3, 3]],
      [[1, 3], [1, 6]],
      [[1, 1], [1, 0], [2, 0], [2, 1]],
    ],
  },
  {
    id: 'robot',
    level: 'easy',
    lines: [
      [[0, 0], [1, 0], [1, 1]],
      [[0, 1], [3, 1], [3, 4], [0, 4]],
      [[1, 2], [2, 2], [2, 3], [1, 3], [1, 2]],
      [[2, 4], [2, 7], [0, 7]],
      [[2, 5], [3, 5], [3, 6], [2, 6]],
      [[1, 7], [1, 8]],
    ],
  },
  {
    id: 'trophy',
    level: 'easy',
    lines: [
      [[0, 0], [3, 0], [3, 3], [1, 3], [1, 5], [2, 5], [2, 6], [0, 6]],
      [[3, 1], [4, 1], [4, 2], [3, 2]],
    ],
  },
  {
    id: 'tower',
    level: 'easy',
    lines: [
      [[0, 0], [1, 0], [1, 1], [2, 1], [2, 0], [3, 0], [3, 2], [2, 2], [2, 6], [3, 6], [3, 7], [0, 7]],
      [[0, 4], [1, 4], [1, 7]],
    ],
  },
  {
    id: 'bus',
    level: 'easy',
    lines: [
      [[0, 0], [3, 0], [3, 6], [0, 6]],
      [[0, 1], [2, 1], [2, 3], [0, 3]],
      [[1, 4], [2, 4], [2, 5], [1, 5], [1, 4]],
      [[2, 6], [2, 7], [3, 7], [3, 6]],
    ],
  },
  {
    id: 'table',
    level: 'easy',
    lines: [
      [[0, 0], [3, 0], [3, 4], [2, 4], [2, 1], [0, 1]],
    ],
  },
  {
    id: 'bone',
    level: 'easy',
    sideways: true,
    lines: [
      [[0, 1], [1, 1], [1, 0], [2, 0], [2, 2], [1, 2], [1, 6], [2, 6], [2, 8], [1, 8], [1, 7], [0, 7]],
    ],
  },

  // Medium: some corner-to-corner slants
  {
    id: 'house',
    level: 'medium',
    lines: [
      [[0, 0], [4, 4], [4, 8], [0, 8]],
      [[0, 4], [4, 4]],
      [[0, 6], [1, 6], [1, 8]],
      [[2, 5], [3, 5], [3, 6], [2, 6], [2, 5]],
    ],
  },
  {
    id: 'tree',
    level: 'medium',
    lines: [
      [[0, 0], [2, 2], [1, 2], [3, 4], [2, 4], [4, 6], [1, 6], [1, 8], [0, 8]],
    ],
  },
  {
    id: 'rocket',
    level: 'medium',
    sideways: true,
    lines: [
      [[0, 0], [2, 2], [2, 5], [3, 6], [3, 8], [2, 7], [0, 7]],
      [[0, 3], [1, 3], [1, 4], [0, 4]],
      [[1, 7], [0, 8]],
    ],
  },
  {
    id: 'crown',
    level: 'medium',
    lines: [
      [[0, 0], [2, 2], [4, 0], [4, 5], [0, 5]],
      [[0, 3], [4, 3]],
      [[0, 1], [1, 2], [0, 3]],
    ],
  },
  {
    id: 'fish',
    level: 'medium',
    sideways: true,
    lines: [
      [[0, 0], [2, 2], [2, 4], [0, 6], [2, 8], [0, 8]],
      [[1, 2], [1, 3]],
    ],
  },
  {
    id: 'owl',
    level: 'medium',
    lines: [
      [[0, 1], [2, 1], [3, 0], [3, 6], [2, 7], [0, 7]],
      [[1, 2], [2, 2], [2, 3], [1, 3], [1, 2]],
      [[1, 3], [0, 4]],
      [[3, 3], [2, 4], [3, 5]],
      [[1, 7], [1, 8]],
    ],
  },
  {
    id: 'arrow',
    level: 'medium',
    sideways: true,
    lines: [
      [[0, 0], [3, 3], [1, 3], [1, 6], [0, 6]],
    ],
  },
  {
    id: 'gem',
    level: 'medium',
    sideways: true,
    lines: [
      [[0, 0], [2, 0], [3, 1], [0, 4]],
      [[0, 1], [3, 1]],
      [[1, 0], [1, 1], [0, 4]],
    ],
  },
  {
    id: 'heart',
    level: 'medium',
    sideways: true,
    lines: [
      [[0, 1], [1, 0], [2, 0], [3, 1], [3, 2], [0, 5]],
    ],
  },

  // Hard: steep slants, further out
  {
    id: 'butterfly',
    level: 'hard',
    sideways: true,
    lines: [
      [[0, 1], [1, 2], [1, 6], [0, 7]],
      [[1, 3], [2, 1], [4, 1], [5, 3], [3, 4], [4, 6], [2, 7], [1, 6]],
      [[0, 1], [1, 0]],
      [[2, 2], [3, 2], [3, 3], [2, 2]],
    ],
  },
  {
    id: 'cat',
    level: 'hard',
    lines: [
      [[0, 2], [1, 2], [2, 0], [3, 2], [4, 4], [4, 5], [3, 7], [2, 8], [0, 8]],
      [[1, 4], [2, 4], [2, 5], [1, 5], [1, 4]],
      [[0, 6], [1, 6], [0, 7]],
      [[3, 6], [5, 5]],
      [[3, 6], [5, 7]],
    ],
  },
  {
    id: 'plane',
    level: 'hard',
    sideways: true,
    lines: [
      [[0, 0], [1, 1], [1, 3], [5, 5], [5, 6], [1, 6], [1, 7], [3, 8], [0, 8]],
    ],
  },
  {
    id: 'spaceship',
    level: 'hard',
    lines: [
      [[0, 1], [1, 1], [2, 3], [4, 4], [5, 5], [4, 6], [0, 6]],
      [[2, 3], [0, 3]],
      [[1, 6], [2, 8]],
      [[2, 5], [3, 5]],
    ],
  },
];
