import type { PuzzleDoc } from '../../../types/puzzleDoc';
import type { WordSearchConfig } from './index';

const docs: PuzzleDoc<WordSearchConfig> = {
  summary: (
    <>
      A square of letters with a few words hidden in it. The words to find are listed
      underneath, each with a picture. Find each one and ring it.
    </>
  ),

  ages: (
    <>
      4–7. Start with → and 3 words. Diagonals and ✱ suit 6–7.
    </>
  ),
  time: <>5–10 minutes</>,
  needs: <>A pencil, or coloured pencils to ring each word in its own colour</>,
  reading: (
    <>
      None needed: they can match letter by letter. The pictures say what each word
      is.
    </>
  ),

  example: { seed: 4 },

  howItWorks: (
    <>
      <p>
        Words are 3–5 letters, in capitals, from the same picture word list as the other
        puzzles. Where it can, each word is laid across an earlier one, sharing a
        letter. The rest of the square is filled with random letters.
      </p>
      <p>
        A child who can’t read yet can still find a word by its first letter, then check
        the next. A reader spots the whole word.
      </p>
    </>
  ),

  sayAloud: [
    'Look at the first word. What letter does it start with? Find that letter in the box.',
    'Is the next letter beside it? Then draw a ring round the whole word.',
  ],

  skills: [
    'Letter recognition',
    'Matching letters in order',
    'Looking carefully, row by row',
    'Keeping going',
  ],
  whyItMatters: (
    <p>
      Hunting letter by letter makes them look at every letter in order, which is what
      spelling needs. Seeing the same word again and again helps them know it on sight.
    </p>
  ),

  settings: {
    difficulty: {
      label: 'Directions',
      description: <p>Which ways the words can run.</p>,
      options: [
        {
          label: '→',
          description: <p>Left to right only, like reading. Default.</p>,
          example: { config: { difficulty: 1 } },
        },
        {
          label: '→↓',
          description: <p>Across or down.</p>,
          example: { config: { difficulty: 2 } },
        },
        {
          label: '→↓↘',
          description: <p>Across, down, or diagonally down to the right.</p>,
          example: { config: { difficulty: 3 } },
        },
        {
          label: '✱',
          description: (
            <p>
              Any of eight ways, including backwards and upwards. Much harder: the word no
              longer reads left to right.
            </p>
          ),
          example: { config: { difficulty: 4 } },
        },
      ],
    },
    wordCount: {
      label: 'Words',
      description: (
        <p>
          How many words to hide: 3, 4 or 5. On ✱ in the smallest square, a 5-word
          sheet sometimes comes out with 4.
        </p>
      ),
    },
    limitedLetters: {
      label: 'ABC',
      description: (
        <p>
          When on, the filler letters come only from the hidden words. Every letter
          looks like a possible start, so it is harder. Off by default.
        </p>
      ),
      options: [
        {
          label: 'On',
          description: <p>Only the hidden words’ letters.</p>,
          example: { config: { limitedLetters: true } },
        },
      ],
    },
    customWordsText: {
      label: 'Custom',
      description: (
        <>
          <p>
            Type words, e.g. this week’s spellings, and they are hidden first. A note on
            the puzzle (on screen, not printed) names any it left out: too long for the
            square, or no room.
          </p>
          <p>
            Words from the puzzle’s list get their picture; others are listed without
            one, so read those to them.
          </p>
        </>
      ),
    },
  },
  size: (
    <p>
      The square is as many letters across as the puzzle is wide, but one fewer than it
      is tall, from 5×5 to 9×9. The default 5×6 gives 5×5; 10×10 gives 9×9. A bigger
      square hides the same number of words among more letters.
    </p>
  ),

  easier: [
    '→ with 3 words, and ABC off.',
    'Tell them the first letter’s row.',
    'Cross each word off the list once it’s found.',
  ],
  harder: [
    '→↓↘, then ✱.',
    'A bigger square, with ABC on.',
    'Cover the pictures and read the list.',
  ],
  mistakes: [
    {
      sign: 'Rings the first matching letter, then gives up',
      meaning: <>Normal at first. Show them it may take a few tries: check the next letter, then move on.</>,
    },
    {
      sign: 'Finds most of a word, with one letter wrong',
      meaning: <>Spell it out together, pointing to each letter in the list and then the square.</>,
    },
    {
      sign: 'Can’t find a backwards word on ✱',
      meaning: <>Expected. Tell them to look for the last letter too.</>,
    },
  ],
  beyondThePage: [
    'Hunt for a word on cereal boxes, signs or a page of a book.',
    'Make one for them on squared paper with their name hidden in it.',
  ],

  atSchool: (
    <>
      Recognising letters and reading simple words is Reception and Year 1 phonics. Typed-in
      spellings let it follow school’s weekly list.
    </>
  ),
};

export default docs;
