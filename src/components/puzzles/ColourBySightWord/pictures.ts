/**
 * Hand-authored pixel pictures revealed by colouring the grid correctly.
 *
 * Encoding - one character per cell, every row the same length:
 *   '.'  background (region 0)
 *   '1'  main foreground region
 *   '2'  secondary region
 *   '3'  detail region
 *
 * Regions are numbered roughly largest-first because lower colour counts merge
 * downwards: at 3 colours region 3 becomes region 2, and at 2 colours every
 * foreground region collapses into region 1, leaving a clean silhouette. Every
 * picture uses all three regions so any colour count is available on any
 * picture.
 *
 * Keep these small (roughly 6x6 to 9x9). Each cell has to hold a printed word,
 * so a taller picture means smaller type.
 */
export interface Picture {
  name: string;
  rows: string[];
}

export const PICTURES: Picture[] = [
  {
    // Pitched roof (2), walls (1), two windows and a door (3)
    name: 'house',
    rows: [
      '...22...',
      '..2222..',
      '.222222.',
      '22222222',
      '.111111.',
      '.131131.',
      '.113311.',
      '.113311.',
    ],
  },
  {
    // Body (1), dorsal/ventral fins and tail fan (2), eye (3)
    name: 'fish',
    rows: [
      '...22....',
      '..11111.2',
      '.13111122',
      '.11111122',
      '..11111.2',
      '...22....',
    ],
  },
  {
    // Hull (1), mast and sail (2), waves (3)
    name: 'boat',
    rows: [
      '..2......',
      '..222....',
      '..2222...',
      '..22222..',
      '111111111',
      '.1111111.',
      '33.333.33',
    ],
  },
  {
    // Outer points (1), inner face (2), the two lower legs (3)
    name: 'star',
    rows: [
      '...1...',
      '..121..',
      '1122211',
      '.12221.',
      '..222..',
      '..3.3..',
      '.3...3.',
    ],
  },
  {
    // Canopy (1), trunk and roots (2), fruit (3)
    name: 'tree',
    rows: [
      '..111..',
      '.13111.',
      '1111311',
      '1131111',
      '.11131.',
      '...2...',
      '...2...',
      '..222..',
    ],
  },
  {
    // Head and pointed ears (1), eyes (2), nose and mouth (3)
    name: 'cat',
    rows: [
      '1.....1',
      '11...11',
      '1111111',
      '1221221',
      '1113111',
      '.13331.',
      '..111..',
    ],
  },
  {
    // Petals (1), stem and leaves (2), centre (3)
    name: 'flower',
    rows: [
      '..111..',
      '.11311.',
      '1133311',
      '.11311.',
      '..111..',
      '...2...',
      '.22222.',
      '...2...',
    ],
  },
  {
    // Three horizontal bands, so it colours up like a striped heart
    name: 'heart',
    rows: [
      '.11.11.',
      '1111111',
      '1222221',
      '.33333.',
      '..333..',
      '...3...',
    ],
  },
];
