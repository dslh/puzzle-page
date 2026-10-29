/**
 * Stroke-by-stroke construction of the 26 capital letters, the 26 lower-case
 * letters and the ten digits, for a letter formation exercise: each stroke
 * carries where the pen lands, which way it travels, and the order to do them in.
 *
 * Coordinates: x runs 0..advance, y runs 0 (cap line) to 100 (baseline), so a
 * letter scales by multiplying through. Height is always 100; `advance` varies
 * because I is narrow and W is wide, and stretching them all to one width looks
 * wrong.
 *
 * Authored by hand. `docs/letter-formation-research.md` records why: no
 * permissively-licensed source gives centrelines *with* stroke order for Latin
 * capitals. KanjiVG has the order but its share-alike licence is viral over
 * derivatives, so it was used only to check decomposition - how many strokes and
 * in what order - never as geometry. No coordinates here are copied, scaled or
 * traced from it.
 *
 * Two conventions applied throughout, both deliberate:
 *
 * - **Up-diagonals really go up.** The second stroke of V, the third of N, the
 *   third of M and the second and fourth of W all travel upward. Hershey (1967)
 *   and KanjiVG (2009-11) independently draw these downward - a digitising
 *   habit of "everything top-to-bottom", not how the letters are taught.
 * - **Verticals first.** B D E F H K L P R T all start with the downstroke,
 *   even where drawing the crossbar first might feel more natural (T). One rule
 *   the child can rely on across the whole set beats per-letter intuition.
 */

export interface Point {
  x: number;
  y: number;
}

export interface LetterStroke {
  /** Path data, in the letter's own 0..advance by 0..100 box. */
  d: string;
  /**
   * Where the pen lands. Always the path's opening M coordinates -
   * `validateLetterForms` enforces it, so the start dot can never drift away
   * from the stroke it belongs to.
   */
  start: Point;
  /** Direction of travel at the start, for orienting the arrow. Not normalised. */
  dir: Point;
  /** What the child is doing, phrased in the order they do it. */
  hint: string;
  /**
   * Nudge for the stroke-number badge only - the pen still lands on `start`.
   *
   * Nine capitals begin two strokes at the same point (the downstroke and the
   * stroke that leaves the same corner), so without this the second badge sits
   * exactly on top of the first and hides it. Moving the geometry to separate
   * them would teach the wrong thing; moving the label costs nothing.
   *
   * Offsets deliberately push badges outside the 0..advance by 0..100 box, so a
   * renderer must pad: measured worst cases need 22 units above the cap line
   * and 14 to the left of x=0 (badge radius included), or they clip.
   */
  labelOffset?: Point;
  /**
   * Extra arrows, with no badge, where the pen changes direction without
   * lifting - back up the stem of n, down the stem of a, round the corners of
   * z. Lower case only: capitals split those into numbered strokes. Each arrow
   * starts at `at`, which may sit beside the line rather than on it, so an
   * arrow up a retraced stem doesn't hide under the stroke.
   */
  turns?: { at: Point; dir: Point }[];
}

export interface LetterForm {
  char: string;
  /** Natural width. Height is always 100. */
  advance: number;
  strokes: LetterStroke[];
  /**
   * How high and low the ink reaches, where it leaves 0..100. Lower case sits
   * on a taller box: ascender line 0, x-height 50, baseline 100, descender
   * line 150. The model letter is cropped to this; practice lines keep the
   * whole box so every letter shares the rules.
   */
  top?: number;
  bottom?: number;
}

export const LETTER_FORMS: LetterForm[] = [
  {
    char: 'A',
    advance: 70,
    strokes: [
      { d: 'M35,0 L6,100', start: { x: 35, y: 0 }, dir: { x: -29, y: 100 }, hint: 'slant down left', labelOffset: { x: -16, y: -3 } },
      { d: 'M35,0 L64,100', start: { x: 35, y: 0 }, dir: { x: 29, y: 100 }, hint: 'slant down right', labelOffset: { x: 16, y: -3 } },
      { d: 'M16,66 L54,66', start: { x: 16, y: 66 }, dir: { x: 1, y: 0 }, hint: 'slide right across' },
    ],
  },
  {
    char: 'B',
    advance: 64,
    strokes: [
      { d: 'M11,0 L11,100', start: { x: 11, y: 0 }, dir: { x: 0, y: 1 }, hint: 'pull down straight', labelOffset: { x: -15, y: 1 } },
      { d: 'M11,0 L34,0 A25,25 0 0 1 34,50 L11,50', start: { x: 11, y: 0 }, dir: { x: 1, y: 0 }, hint: 'around the top bump', labelOffset: { x: 2, y: -13 } },
      { d: 'M11,50 L36,50 A25,25 0 0 1 36,100 L11,100', start: { x: 11, y: 50 }, dir: { x: 1, y: 0 }, hint: 'around the bottom bump' },
    ],
  },
  {
    char: 'C',
    advance: 70,
    strokes: [
      { d: 'M60,22 A34,48 0 1 0 60,78', start: { x: 60, y: 22 }, dir: { x: -1, y: -0.6 }, hint: 'back, around and stop' },
    ],
  },
  {
    char: 'D',
    advance: 70,
    strokes: [
      { d: 'M11,0 L11,100', start: { x: 11, y: 0 }, dir: { x: 0, y: 1 }, hint: 'pull down straight', labelOffset: { x: -15, y: 1 } },
      { d: 'M11,0 L28,0 A34,50 0 0 1 28,100 L11,100', start: { x: 11, y: 0 }, dir: { x: 1, y: 0 }, hint: 'around and back', labelOffset: { x: 2, y: -13 } },
    ],
  },
  {
    char: 'E',
    advance: 60,
    strokes: [
      { d: 'M12,0 L12,100', start: { x: 12, y: 0 }, dir: { x: 0, y: 1 }, hint: 'pull down straight', labelOffset: { x: -15, y: 1 } },
      { d: 'M12,0 L55,0', start: { x: 12, y: 0 }, dir: { x: 1, y: 0 }, hint: 'slide right at the top', labelOffset: { x: 2, y: -13 } },
      { d: 'M12,50 L46,50', start: { x: 12, y: 50 }, dir: { x: 1, y: 0 }, hint: 'slide right in the middle' },
      { d: 'M12,100 L55,100', start: { x: 12, y: 100 }, dir: { x: 1, y: 0 }, hint: 'slide right at the bottom' },
    ],
  },
  {
    char: 'F',
    advance: 58,
    strokes: [
      { d: 'M12,0 L12,100', start: { x: 12, y: 0 }, dir: { x: 0, y: 1 }, hint: 'pull down straight', labelOffset: { x: -15, y: 1 } },
      { d: 'M12,0 L54,0', start: { x: 12, y: 0 }, dir: { x: 1, y: 0 }, hint: 'slide right at the top', labelOffset: { x: 2, y: -13 } },
      { d: 'M12,50 L45,50', start: { x: 12, y: 50 }, dir: { x: 1, y: 0 }, hint: 'slide right in the middle' },
    ],
  },
  {
    char: 'G',
    advance: 74,
    strokes: [
      { d: 'M63,22 A34,48 0 1 0 65,80 L65,58', start: { x: 63, y: 22 }, dir: { x: -1, y: -0.6 }, hint: 'back, around, then up' },
      { d: 'M65,58 L40,58', start: { x: 65, y: 58 }, dir: { x: -1, y: 0 }, hint: 'slide left into the middle' },
    ],
  },
  {
    char: 'H',
    advance: 70,
    strokes: [
      { d: 'M11,0 L11,100', start: { x: 11, y: 0 }, dir: { x: 0, y: 1 }, hint: 'pull down straight' },
      { d: 'M59,0 L59,100', start: { x: 59, y: 0 }, dir: { x: 0, y: 1 }, hint: 'pull down straight again' },
      { d: 'M11,50 L59,50', start: { x: 11, y: 50 }, dir: { x: 1, y: 0 }, hint: 'slide right to join them' },
    ],
  },
  {
    char: 'I',
    advance: 22,
    strokes: [
      { d: 'M11,0 L11,100', start: { x: 11, y: 0 }, dir: { x: 0, y: 1 }, hint: 'pull down straight' },
    ],
  },
  {
    char: 'J',
    advance: 50,
    strokes: [
      { d: 'M39,0 L39,74 A16,16 0 0 1 7,74', start: { x: 39, y: 0 }, dir: { x: 0, y: 1 }, hint: 'pull down, then hook left' },
    ],
  },
  {
    char: 'K',
    advance: 68,
    strokes: [
      { d: 'M11,0 L11,100', start: { x: 11, y: 0 }, dir: { x: 0, y: 1 }, hint: 'pull down straight' },
      { d: 'M62,0 L11,55', start: { x: 62, y: 0 }, dir: { x: -51, y: 55 }, hint: 'slant down into the middle' },
      { d: 'M11,55 L64,100', start: { x: 11, y: 55 }, dir: { x: 53, y: 45 }, hint: 'slant down and out' },
    ],
  },
  {
    char: 'L',
    advance: 54,
    strokes: [
      { d: 'M12,0 L12,100', start: { x: 12, y: 0 }, dir: { x: 0, y: 1 }, hint: 'pull down straight' },
      { d: 'M12,100 L52,100', start: { x: 12, y: 100 }, dir: { x: 1, y: 0 }, hint: 'slide right along the bottom' },
    ],
  },
  {
    char: 'M',
    advance: 84,
    strokes: [
      { d: 'M10,0 L10,100', start: { x: 10, y: 0 }, dir: { x: 0, y: 1 }, hint: 'pull down straight', labelOffset: { x: -15, y: 1 } },
      { d: 'M10,0 L42,62', start: { x: 10, y: 0 }, dir: { x: 32, y: 62 }, hint: 'slant down to the middle', labelOffset: { x: 2, y: -13 } },
      { d: 'M42,62 L74,0', start: { x: 42, y: 62 }, dir: { x: 32, y: -62 }, hint: 'slant back up' },
      { d: 'M74,0 L74,100', start: { x: 74, y: 0 }, dir: { x: 0, y: 1 }, hint: 'pull down straight' },
    ],
  },
  {
    char: 'N',
    advance: 74,
    strokes: [
      { d: 'M11,0 L11,100', start: { x: 11, y: 0 }, dir: { x: 0, y: 1 }, hint: 'pull down straight', labelOffset: { x: -15, y: 1 } },
      { d: 'M11,0 L63,100', start: { x: 11, y: 0 }, dir: { x: 52, y: 100 }, hint: 'slant down to the corner', labelOffset: { x: 2, y: -13 } },
      { d: 'M63,100 L63,0', start: { x: 63, y: 100 }, dir: { x: 0, y: -1 }, hint: 'push straight back up' },
    ],
  },
  {
    char: 'O',
    advance: 78,
    strokes: [
      { d: 'M39,3 A35,48 0 0 0 39,99 A35,48 0 0 0 39,3', start: { x: 39, y: 3 }, dir: { x: -1, y: 0.1 }, hint: 'back, around and close it up' },
    ],
  },
  {
    char: 'P',
    advance: 62,
    strokes: [
      { d: 'M11,0 L11,100', start: { x: 11, y: 0 }, dir: { x: 0, y: 1 }, hint: 'pull down straight', labelOffset: { x: -15, y: 1 } },
      { d: 'M11,0 L33,0 A27,27 0 0 1 33,54 L11,54', start: { x: 11, y: 0 }, dir: { x: 1, y: 0 }, hint: 'around the top bump', labelOffset: { x: 2, y: -13 } },
    ],
  },
  {
    char: 'Q',
    advance: 78,
    strokes: [
      { d: 'M39,3 A35,48 0 0 0 39,99 A35,48 0 0 0 39,3', start: { x: 39, y: 3 }, dir: { x: -1, y: 0.1 }, hint: 'back, around and close it up' },
      { d: 'M48,70 L76,104', start: { x: 48, y: 70 }, dir: { x: 28, y: 34 }, hint: 'slant a little tail out' },
    ],
  },
  {
    char: 'R',
    advance: 66,
    strokes: [
      { d: 'M11,0 L11,100', start: { x: 11, y: 0 }, dir: { x: 0, y: 1 }, hint: 'pull down straight', labelOffset: { x: -15, y: 1 } },
      { d: 'M11,0 L33,0 A26,26 0 0 1 33,52 L11,52', start: { x: 11, y: 0 }, dir: { x: 1, y: 0 }, hint: 'around the top bump', labelOffset: { x: 2, y: -13 } },
      { d: 'M33,52 L63,100', start: { x: 33, y: 52 }, dir: { x: 30, y: 48 }, hint: 'slant down and out' },
    ],
  },
  {
    char: 'S',
    advance: 64,
    strokes: [
      {
        d: 'M55,22 C52,4 14,1 13,26 C12,47 51,50 50,72 C49,96 13,97 9,79',
        start: { x: 55, y: 22 },
        dir: { x: -1, y: -0.5 },
        hint: 'back, curve down, then around',
      },
    ],
  },
  {
    char: 'T',
    advance: 68,
    strokes: [
      { d: 'M34,0 L34,100', start: { x: 34, y: 0 }, dir: { x: 0, y: 1 }, hint: 'pull down straight' },
      { d: 'M6,0 L62,0', start: { x: 6, y: 0 }, dir: { x: 1, y: 0 }, hint: 'slide right across the top' },
    ],
  },
  {
    char: 'U',
    advance: 70,
    strokes: [
      { d: 'M11,0 L11,68 A24,30 0 0 0 59,68 L59,0', start: { x: 11, y: 0 }, dir: { x: 0, y: 1 }, hint: 'down, around the bend, back up' },
    ],
  },
  {
    char: 'V',
    advance: 70,
    strokes: [
      { d: 'M8,0 L35,100', start: { x: 8, y: 0 }, dir: { x: 27, y: 100 }, hint: 'slant down to the point' },
      { d: 'M35,100 L62,0', start: { x: 35, y: 100 }, dir: { x: 27, y: -100 }, hint: 'slant back up' },
    ],
  },
  {
    char: 'W',
    advance: 94,
    strokes: [
      { d: 'M7,0 L26,100', start: { x: 7, y: 0 }, dir: { x: 19, y: 100 }, hint: 'slant down' },
      { d: 'M26,100 L47,18', start: { x: 26, y: 100 }, dir: { x: 21, y: -82 }, hint: 'slant back up' },
      { d: 'M47,18 L68,100', start: { x: 47, y: 18 }, dir: { x: 21, y: 82 }, hint: 'slant down again' },
      { d: 'M68,100 L87,0', start: { x: 68, y: 100 }, dir: { x: 19, y: -100 }, hint: 'slant back up' },
    ],
  },
  {
    char: 'X',
    advance: 68,
    strokes: [
      { d: 'M9,0 L59,100', start: { x: 9, y: 0 }, dir: { x: 50, y: 100 }, hint: 'slant down to the right' },
      { d: 'M59,0 L9,100', start: { x: 59, y: 0 }, dir: { x: -50, y: 100 }, hint: 'slant down to the left' },
    ],
  },
  {
    // Two strokes, the short left diagonal joining the long right one at the
    // middle. The long stroke bends at the join rather than running straight
    // on: a straight stroke leans as far below the join as above it, which
    // drags the tail sideways and splays the top asymmetrically - the letter
    // ends up looking italic beside the upright V, W and X.
    char: 'Y',
    advance: 68,
    strokes: [
      { d: 'M8,0 L34,52', start: { x: 8, y: 0 }, dir: { x: 26, y: 52 }, hint: 'slant down to the middle' },
      { d: 'M60,0 L34,52 L34,100', start: { x: 60, y: 0 }, dir: { x: -26, y: 52 }, hint: 'slant down to meet it, then straight down' },
    ],
  },
  {
    char: 'Z',
    advance: 64,
    strokes: [
      { d: 'M9,0 L56,0', start: { x: 9, y: 0 }, dir: { x: 1, y: 0 }, hint: 'slide right across the top' },
      { d: 'M56,0 L9,100', start: { x: 56, y: 0 }, dir: { x: -47, y: 100 }, hint: 'slant down to the left' },
      { d: 'M9,100 L56,100', start: { x: 9, y: 100 }, dir: { x: 1, y: 0 }, hint: 'slide right along the bottom' },
    ],
  },
];

/**
 * The 26 lower-case letters, plain print with no exit flicks: single-storey a
 * and g, k with straight arms, f and t sitting on the baseline. On a 0..150 box
 * - ascender line 0, x-height 50, baseline 100, descender line 150.
 *
 * Unlike the capitals, each letter is one movement until the pencil really
 * lifts, which is only to cross f and t, dot i and j, and start the second
 * line of k, x and y. That is how lower case is taught, and the National
 * Curriculum asks for it ("starting and finishing in the right place"). Where
 * the pencil changes direction without lifting, `turns` adds an arrow instead
 * of a new number.
 *
 * The round letters (a c d e g o q s) start just under the x-height on the
 * right and go back anticlockwise; a d g q draw the bowl first, then the stem.
 */
const BOWL = 'M47,62 A20,25 0 1 0 50,75';
const HUMP = 'C16,57 24,50 33,50 C45,50 52,58 52,70 L52,100';
const BUMP = 'C16,57 24,50 33,50 C46,50 54,62 54,75 C54,89 45,100 33,100 C24,100 17,98 12,94';
const BOWL_START = { start: { x: 47, y: 62 }, dir: { x: -1, y: -0.75 } };

export const LOWER_FORMS: LetterForm[] = [
  {
    char: 'a',
    advance: 60,
    top: 50,
    strokes: [
      { d: `${BOWL} L50,50 L50,100`, ...BOWL_START, hint: 'back, around, up and down', turns: [{ at: { x: 63, y: 50 }, dir: { x: 0, y: 1 } }] },
    ],
  },
  {
    char: 'b',
    advance: 64,
    strokes: [
      { d: `M12,0 L12,100 L12,68 ${BUMP}`, start: { x: 12, y: 0 }, dir: { x: 0, y: 1 }, hint: 'down, back up and around', turns: [{ at: { x: 21, y: 98 }, dir: { x: 0, y: -1 } }] },
    ],
  },
  {
    char: 'c',
    advance: 56,
    top: 50,
    strokes: [
      { d: 'M48,62 A21,25 0 1 0 48,88', start: { x: 48, y: 62 }, dir: { x: -1, y: -0.75 }, hint: 'back, around and stop' },
    ],
  },
  {
    char: 'd',
    advance: 60,
    strokes: [
      { d: `${BOWL} L50,0 L50,100`, ...BOWL_START, hint: 'back, around, up tall and down', turns: [{ at: { x: 63, y: 2 }, dir: { x: 0, y: 1 } }] },
    ],
  },
  {
    char: 'e',
    advance: 58,
    top: 50,
    strokes: [
      {
        d: 'M10,75 L50,75 C50,60 42,50 30,50 C17,50 9,61 9,75 C9,90 19,100 31,100 C39,100 45,97 49,91',
        start: { x: 10, y: 75 },
        dir: { x: 1, y: 0 },
        hint: 'across, up and around',
      },
    ],
  },
  {
    char: 'f',
    advance: 52,
    strokes: [
      { d: 'M48,10 C44,3 37,0 31,0 C22,0 16,7 16,18 L16,100', start: { x: 48, y: 10 }, dir: { x: -4, y: -7 }, hint: 'over the top and down' },
      { d: 'M4,50 L40,50', start: { x: 4, y: 50 }, dir: { x: 1, y: 0 }, hint: 'slide right across' },
    ],
  },
  {
    char: 'g',
    advance: 60,
    top: 50,
    bottom: 150,
    strokes: [
      { d: `${BOWL} L50,50 L50,132 A17,17 0 0 1 16,132`, ...BOWL_START, hint: 'back, around, up, then down and hook', turns: [{ at: { x: 63, y: 50 }, dir: { x: 0, y: 1 } }] },
    ],
  },
  {
    char: 'h',
    advance: 64,
    strokes: [
      { d: `M12,0 L12,100 L12,68 ${HUMP}`, start: { x: 12, y: 0 }, dir: { x: 0, y: 1 }, hint: 'down, back up, over and down', turns: [{ at: { x: 21, y: 98 }, dir: { x: 0, y: -1 } }] },
    ],
  },
  {
    char: 'i',
    advance: 24,
    top: 25,
    strokes: [
      { d: 'M12,50 L12,100', start: { x: 12, y: 50 }, dir: { x: 0, y: 1 }, hint: 'pull down straight' },
      // A dot: no length, so the round cap draws it and there's no arrow
      { d: 'M12,30 L12,30', start: { x: 12, y: 30 }, dir: { x: 0, y: 0 }, hint: 'lift, and dot', labelOffset: { x: -15, y: 0 } },
    ],
  },
  {
    char: 'j',
    advance: 52,
    top: 25,
    bottom: 150,
    strokes: [
      { d: 'M40,50 L40,132 A17,17 0 0 1 6,132', start: { x: 40, y: 50 }, dir: { x: 0, y: 1 }, hint: 'pull down, then hook left' },
      { d: 'M40,30 L40,30', start: { x: 40, y: 30 }, dir: { x: 0, y: 0 }, hint: 'lift, and dot', labelOffset: { x: 15, y: 0 } },
    ],
  },
  {
    char: 'k',
    advance: 56,
    strokes: [
      { d: 'M12,0 L12,100', start: { x: 12, y: 0 }, dir: { x: 0, y: 1 }, hint: 'pull down straight' },
      { d: 'M46,50 L13,76 L48,100', start: { x: 46, y: 50 }, dir: { x: -33, y: 26 }, hint: 'slant in, then slant out', turns: [{ at: { x: 17, y: 79 }, dir: { x: 35, y: 24 } }] },
    ],
  },
  {
    char: 'l',
    advance: 24,
    strokes: [
      { d: 'M12,0 L12,100', start: { x: 12, y: 0 }, dir: { x: 0, y: 1 }, hint: 'pull down straight' },
    ],
  },
  {
    char: 'm',
    advance: 80,
    top: 50,
    strokes: [
      {
        d: 'M10,50 L10,100 L10,66 C13,56 18,50 26,50 C35,50 40,56 40,66 L40,100 L40,66 C43,56 48,50 56,50 C65,50 70,56 70,66 L70,100',
        start: { x: 10, y: 50 },
        dir: { x: 0, y: 1 },
        hint: 'down, back up, over, back up, over',
        turns: [
          { at: { x: 18, y: 98 }, dir: { x: 0, y: -1 } },
          { at: { x: 48, y: 98 }, dir: { x: 0, y: -1 } },
        ],
      },
    ],
  },
  {
    char: 'n',
    advance: 64,
    top: 50,
    strokes: [
      { d: `M12,50 L12,100 L12,68 ${HUMP}`, start: { x: 12, y: 50 }, dir: { x: 0, y: 1 }, hint: 'down, back up, over and down', turns: [{ at: { x: 21, y: 98 }, dir: { x: 0, y: -1 } }] },
    ],
  },
  {
    char: 'o',
    advance: 60,
    top: 50,
    strokes: [
      { d: 'M30,50 A21,25 0 0 0 30,100 A21,25 0 0 0 30,50', start: { x: 30, y: 50 }, dir: { x: -1, y: 0.1 }, hint: 'back, around and close it up' },
    ],
  },
  {
    char: 'p',
    advance: 64,
    top: 50,
    bottom: 150,
    strokes: [
      { d: `M12,50 L12,150 L12,68 ${BUMP}`, start: { x: 12, y: 50 }, dir: { x: 0, y: 1 }, hint: 'down, back up and around', turns: [{ at: { x: 21, y: 148 }, dir: { x: 0, y: -1 } }] },
    ],
  },
  {
    char: 'q',
    advance: 60,
    top: 50,
    bottom: 150,
    strokes: [
      { d: `${BOWL} L50,50 L50,150`, ...BOWL_START, hint: 'back, around, up, then down', turns: [{ at: { x: 63, y: 50 }, dir: { x: 0, y: 1 } }] },
    ],
  },
  {
    char: 'r',
    advance: 54,
    top: 50,
    strokes: [
      { d: 'M12,50 L12,100 L12,68 C16,57 24,50 34,50 C40,50 45,52 48,56', start: { x: 12, y: 50 }, dir: { x: 0, y: 1 }, hint: 'down, back up and over', turns: [{ at: { x: 21, y: 98 }, dir: { x: 0, y: -1 } }] },
    ],
  },
  {
    char: 's',
    advance: 52,
    top: 50,
    strokes: [
      {
        d: 'M44,61 C41.6,52 11.2,50.5 10.4,63 C9.6,73.5 40.8,75 40,86 C39.2,98 10.4,98.5 7.2,89.5',
        start: { x: 44, y: 61 },
        dir: { x: -1, y: -0.5 },
        hint: 'back, curve down, then around',
      },
    ],
  },
  {
    char: 't',
    advance: 44,
    top: 20,
    strokes: [
      { d: 'M18,20 L18,86 C18,95 23,100 30,100 C34,100 37,99 40,96', start: { x: 18, y: 20 }, dir: { x: 0, y: 1 }, hint: 'down, and curve at the bottom' },
      { d: 'M4,50 L36,50', start: { x: 4, y: 50 }, dir: { x: 1, y: 0 }, hint: 'slide right across' },
    ],
  },
  {
    char: 'u',
    advance: 62,
    top: 50,
    strokes: [
      {
        d: 'M12,50 L12,82 C12,94 20,100 31,100 C42,100 50,93 50,82 L50,50 L50,100',
        start: { x: 12, y: 50 },
        dir: { x: 0, y: 1 },
        hint: 'down, around, up and down',
        turns: [{ at: { x: 63, y: 50 }, dir: { x: 0, y: 1 } }],
      },
    ],
  },
  {
    char: 'v',
    advance: 62,
    top: 50,
    strokes: [
      { d: 'M8,50 L31,100 L54,50', start: { x: 8, y: 50 }, dir: { x: 23, y: 50 }, hint: 'slant down, slant up', turns: [{ at: { x: 34, y: 93 }, dir: { x: 23, y: -50 } }] },
    ],
  },
  {
    char: 'w',
    advance: 80,
    top: 50,
    strokes: [
      {
        d: 'M6,50 L23,100 L40,56 L57,100 L74,50',
        start: { x: 6, y: 50 },
        dir: { x: 17, y: 50 },
        hint: 'down, up, down, up',
        turns: [
          { at: { x: 26, y: 92 }, dir: { x: 17, y: -44 } },
          { at: { x: 43, y: 64 }, dir: { x: 17, y: 44 } },
          { at: { x: 60, y: 92 }, dir: { x: 17, y: -50 } },
        ],
      },
    ],
  },
  {
    char: 'x',
    advance: 60,
    top: 50,
    strokes: [
      { d: 'M9,50 L51,100', start: { x: 9, y: 50 }, dir: { x: 42, y: 50 }, hint: 'slant down to the right' },
      { d: 'M51,50 L9,100', start: { x: 51, y: 50 }, dir: { x: -42, y: 50 }, hint: 'slant down to the left' },
    ],
  },
  {
    char: 'y',
    advance: 68,
    top: 50,
    bottom: 150,
    strokes: [
      { d: 'M8,50 L34,100', start: { x: 8, y: 50 }, dir: { x: 26, y: 50 }, hint: 'slant down to the line' },
      { d: 'M60,50 L8,150', start: { x: 60, y: 50 }, dir: { x: -52, y: 100 }, hint: 'slant all the way down' },
    ],
  },
  {
    char: 'z',
    advance: 58,
    top: 50,
    strokes: [
      {
        d: 'M9,50 L49,50 L9,100 L49,100',
        start: { x: 9, y: 50 },
        dir: { x: 1, y: 0 },
        hint: 'across, slant down, across',
        turns: [
          { at: { x: 45, y: 55 }, dir: { x: -40, y: 50 } },
          { at: { x: 13, y: 100 }, dir: { x: 1, y: 0 } },
        ],
      },
    ],
  },
];

/**
 * The ten digits, on the same 0..advance by 0..100 box and conventions as the
 * capitals. Formations follow Zaner-Bloser's digit descriptions, the same spec
 * the capitals were checked against.
 *
 * The two digits with real regional variants are drawn plainly: 1 has no flag
 * (it is a single downstroke, like I) and 4 is open-topped ("down, across,
 * lift, down") rather than the closed printed form, which children cannot
 * easily make with a vertical-first stroke.
 */
export const NUMBER_FORMS: LetterForm[] = [
  {
    char: '0',
    advance: 62,
    strokes: [
      { d: 'M31,3 A26,48 0 0 0 31,99 A26,48 0 0 0 31,3', start: { x: 31, y: 3 }, dir: { x: -1, y: 0.1 }, hint: 'back, around and close it up' },
    ],
  },
  {
    char: '1',
    advance: 30,
    strokes: [
      { d: 'M15,0 L15,100', start: { x: 15, y: 0 }, dir: { x: 0, y: 1 }, hint: 'pull down straight' },
    ],
  },
  {
    char: '2',
    advance: 64,
    strokes: [
      {
        d: 'M9,24 C12,-4 54,-6 54,24 C54,44 30,64 9,100 L57,100',
        start: { x: 9, y: 24 },
        dir: { x: 0.3, y: -1 },
        hint: 'over the top, slant down, slide right',
      },
    ],
  },
  {
    char: '3',
    advance: 66,
    strokes: [
      {
        d: 'M10,14 C22,-4 54,-2 54,24 C54,42 40,48 28,48 C44,48 58,58 58,74 C58,100 20,104 8,86',
        start: { x: 10, y: 14 },
        dir: { x: 1, y: -1.2 },
        hint: 'around to the middle, then around again',
      },
    ],
  },
  {
    char: '4',
    advance: 68,
    strokes: [
      { d: 'M10,0 L10,62 L62,62', start: { x: 10, y: 0 }, dir: { x: 0, y: 1 }, hint: 'pull down, then slide right' },
      { d: 'M46,0 L46,100', start: { x: 46, y: 0 }, dir: { x: 0, y: 1 }, hint: 'pull down straight through' },
    ],
  },
  {
    char: '5',
    advance: 64,
    strokes: [
      {
        d: 'M14,0 L12,44 C26,34 56,36 56,68 C56,100 18,104 8,86',
        start: { x: 14, y: 0 },
        dir: { x: 0, y: 1 },
        hint: 'pull down, then around the tummy',
        labelOffset: { x: -15, y: 1 },
      },
      { d: 'M14,0 L54,0', start: { x: 14, y: 0 }, dir: { x: 1, y: 0 }, hint: 'slide right for the hat', labelOffset: { x: 2, y: -13 } },
    ],
  },
  {
    char: '6',
    advance: 66,
    strokes: [
      {
        d: 'M50,4 C30,10 10,40 10,68 C10,90 22,100 34,100 C48,100 58,88 58,72 C58,56 46,46 34,46 C22,46 12,54 10,66',
        start: { x: 50, y: 4 },
        dir: { x: -1, y: 0.4 },
        hint: 'curve down, then around the loop',
      },
    ],
  },
  {
    char: '7',
    advance: 64,
    strokes: [
      { d: 'M8,0 L58,0 L24,100', start: { x: 8, y: 0 }, dir: { x: 1, y: 0 }, hint: 'slide right, then slant down' },
    ],
  },
  {
    char: '8',
    advance: 66,
    strokes: [
      {
        d: 'M50,16 C46,-2 12,0 13,24 C14,44 54,50 54,74 C54,98 12,100 12,76 C12,54 50,40 50,16',
        start: { x: 50, y: 16 },
        dir: { x: -1, y: -1 },
        hint: 'make an S, then slant back up',
      },
    ],
  },
  {
    char: '9',
    advance: 64,
    strokes: [
      {
        d: 'M54,22 C54,10 44,2 32,2 C20,2 10,13 10,27 C10,41 20,52 32,52 C44,52 54,42 54,27 L54,100',
        start: { x: 54, y: 22 },
        dir: { x: 0, y: -1 },
        hint: 'back around the circle, then pull down',
      },
    ],
  },
];

export const LETTER_FORMS_BY_CHAR: Record<string, LetterForm> = Object.fromEntries(
  [...LETTER_FORMS, ...LOWER_FORMS, ...NUMBER_FORMS].map(form => [form.char, form])
);

/** Case matters: "a" is the lower-case form, "A" the capital. */
export function getLetterForm(char: string): LetterForm | undefined {
  return LETTER_FORMS_BY_CHAR[char];
}
