import type { PuzzleDoc } from '../../../types/puzzleDoc';
import type { HandwritingConfig } from './index';

const docs: PuzzleDoc<HandwritingConfig> = {
  summary: (
    <>
      A picture and a short word on handwriting lines. Write over the grey word, copy it
      along the line, or fill in a missing letter.
    </>
  ),

  ages: (
    <>
      4–7. Start with <em>Trace</em>; <em>Copy</em> once letters come out the right way
      round. <em>Missing</em> suits readers.
    </>
  ),
  time: <>5–10 minutes</>,
  needs: <>A sharp pencil</>,
  reading: <>The picture gives the word. In Trace and Copy you can read it to them.</>,

  example: { seed: 4 },

  howItWorks: (
    <>
      <p>
        Each line has four rules. Small letters sit between the dashed line and the dark
        baseline. Tall letters (b, d, h, l) and capitals reach the top line. Tails (g, p, y)
        drop below the baseline.
      </p>
      <p>
        Words are 3–5 letters, picked from a list of words with pictures. The letters are
        printed, so there are no start dots or arrows. Watch where they start each letter.
      </p>
    </>
  ),

  sayAloud: [
    'What’s the picture? That’s the word. Let’s write it.',
    'Sit your letters on the dark line, like they’re sitting on a wall.',
  ],

  skills: [
    'Letter size and position on the line',
    'Spacing letters in a word',
    'Pencil control',
    'Spelling short words (Missing)',
  ],
  whyItMatters: (
    <p>
      Once letters are easy to write, a child can think about what they’re writing
      instead of how. Writing a word while saying it also helps it stick for spelling.
    </p>
  ),

  settings: {
    mode: {
      label: 'Task',
      description: <p>What the child does on each line.</p>,
      options: [
        {
          label: 'Trace',
          description: (
            <p>
              The word in light grey, to write over. It repeats along the line as often as
              it fits; with a long word on a narrow puzzle that may be just once. Default.
            </p>
          ),
          example: { config: { mode: 'trace' } },
        },
        {
          label: 'Copy',
          description: (
            <p>
              The word in black at the start of the line, with space to copy it. The space
              can be a little shorter than the word, so small letters help.
            </p>
          ),
          example: { config: { mode: 'copy' } },
        },
        {
          label: 'Missing',
          description: (
            <p>
              The word with one gap. The gap is a vowel where there is one (c_t), and never
              the first letter. This is spelling as much as handwriting.
            </p>
          ),
          example: { config: { mode: 'missing' } },
        },
      ],
    },
    letterCase: {
      label: 'Case',
      description: <p>Lower or upper case letters.</p>,
      options: [
        {
          label: 'abc',
          description: <p>Lower case: what school teaches first and what books use. Best for most children.</p>,
          example: { config: { letterCase: 'lower' } },
        },
        {
          label: 'ABC',
          description: <p>Capitals, all one height. Default, but capitals are mostly for names and sentence starts.</p>,
          example: { config: { letterCase: 'upper' } },
        },
      ],
    },
    customWordsText: {
      label: 'Words',
      description: (
        <>
          <p>
            Type your own words, e.g. their name or this week’s spellings. Separate them
            with spaces or commas. They’re used first, in the order typed, and the list
            fills any lines left.
          </p>
          <p>
            Words too long for the line are dropped without warning; widen the puzzle.
            Words with no picture in the list get a ✏️ instead.
          </p>
        </>
      ),
    },
  },
  size: (
    <p>
      Letters stay the same size: each grid row is one line, up to ten. Width sets the
      longest word. At 3 wide only 3-letter words fit; 4 wide fits all words, but Copy needs
      6 wide for 5-letter words. 10 wide gives 2–4 traced copies per line.
    </p>
  ),

  easier: [
    'Trace, with fewer lines.',
    'Type in words using letters they already know.',
    'Do one line together, saying each letter as you write it.',
  ],
  harder: [
    'Copy, then Missing.',
    'Fold the paper so they copy the word from memory.',
    'Write a short sentence with the word on plain paper.',
  ],
  mistakes: [
    {
      sign: 'Letters floating above the line or all one height',
      meaning: <>Normal at first. Trace a finger along the dark line and ask what sits on it.</>,
    },
    {
      sign: 'Starts letters at the bottom',
      meaning: <>Very common. Most letters start at the top; gently show where, then let them try.</>,
    },
    {
      sign: 'Holds the pencil in a fist',
      meaning: <>Common at four. Show a pinch between thumb and first finger, resting on the middle finger; a short pencil helps.</>,
    },
  ],
  beyondThePage: [
    'Write letters in sand, flour or shaving foam with a finger.',
    'Write the shopping list together: they do one word.',
  ],

  atSchool: (
    <>
      Year 1 teaches forming lower-case letters correctly, starting and finishing in the right
      place, often in families of letters made the same way (c, a, d, g, o). Year 2 starts
      joining.
    </>
  ),
};

export default docs;
