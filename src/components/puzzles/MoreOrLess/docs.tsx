import type { PuzzleDoc } from '../../../types/puzzleDoc';
import type { MoreOrLessConfig } from './index';

const docs: PuzzleDoc<MoreOrLessConfig> = {
  summary: (
    <>
      Each row has two groups of pictures with a box between. Count both and write &gt;,
      = or &lt; in the box.
    </>
  ),

  ages: <>4–7. Four-year-olds can say “more” or “same” while you write the sign.</>,
  time: <>5 minutes</>,
  needs: <>A pencil</>,
  reading: <>None. The three signs are printed at the top as a reminder.</>,

  example: { seed: 3 },

  howItWorks: (
    <>
      <p>
        The groups are spread out on purpose, in different patterns on each side: one
        scattered, one in loose lines, one in huddles. The bigger group doesn’t look
        bigger, so they have to count.
      </p>
      <p>
        The two sides differ by four at most, and about one row in four is equal. Each
        side is a different picture, so they can’t just match them up.
      </p>
    </>
  ),

  sayAloud: [
    'Count this side. Now count that side. Which has more?',
    'The open side of the sign always faces the side with more.',
  ],

  skills: [
    'Counting a scattered group',
    'More, fewer, the same',
    'The >, < and = signs',
  ],
  whyItMatters: (
    <p>
      Comparing two amounts is the start of much of maths. Scattered groups mean they
      can’t judge by eye, so they need a way to count without missing one or counting one
      twice.
    </p>
  ),

  settings: {
    workedExample: {
      label: 'Example',
      description: <p>Whether the first row comes done.</p>,
      options: [
        {
          label: 'First row',
          description: <p>The first row has its sign filled in, and is never equal. Default.</p>,
          example: { config: { workedExample: true } },
        },
        {
          label: 'None',
          description: <p>Every row is for them.</p>,
          example: { config: { workedExample: false } },
        },
      ],
    },
  },
  size: (
    <p>
      Width is the difficulty: it sets the most pictures on a side. Width 5 gives up to 4,
      6 up to 5, the default 8 up to 8, and 10 up to 11. One row always uses the most.
      Height gives one row per square, less one for the signs at the top.
    </p>
  ),

  easier: [
    'Make it 5 wide.',
    'Cross off each picture as it’s counted.',
    'Write the two counts beside each group first.',
  ],
  harder: [
    'Make it 10 wide.',
    'Ask “how many more?” for each row.',
  ],
  mistakes: [
    {
      sign: 'Sign the wrong way round',
      meaning: <>Very common. The open side faces the bigger number. Some children like a crocodile that eats the bigger group.</>,
    },
    {
      sign: 'Picks the side that looks bigger',
      meaning: <>The layouts are meant to fool the eye. Ask them to count both sides.</>,
    },
    {
      sign: 'Miscounts a huddle',
      meaning: <>Crossing off as they go fixes it.</>,
    },
  ],
  beyondThePage: [
    'Share sweets into two piles. Who has more? Make it fair.',
    'Grab a handful of pasta each and compare.',
  ],

  atSchool: (
    <>
      Comparing amounts to 10 is a Reception Early Learning Goal. “More than” and “less
      than” are Year 1 words; the &gt; and &lt; signs are Year 2.
    </>
  ),
};

export default docs;
