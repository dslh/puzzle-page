import type { PuzzleDoc } from '../../../types/puzzleDoc';
import type { TakeAwayConfig } from './index';

const docs: PuzzleDoc<TakeAwayConfig> = {
  summary: (
    <>
      Each row shows a line of animals or vehicles and a take-away sum. Cross some out,
      count, and write the missing number.
    </>
  ),

  ages: <>4–7. Start with <em>7−4=▢</em> and the worked example.</>,
  time: <>5–10 minutes</>,
  needs: <>A pencil</>,
  reading: <>None, beyond the numbers and the − sign.</>,

  example: { seed: 6 },

  howItWorks: (
    <>
      <p>
        The pictures in a row match the first number, so the child can cross out instead
        of working it in their head. From 10 up, the pictures are split into fives to make
        counting easier.
      </p>
      <p>
        Most rows take some away and leave some. Now and then one takes away nothing, or
        takes away everything, so the answer is 0. No two rows on a page are the same sum.
      </p>
    </>
  ),

  sayAloud: [
    'Seven take away four. Cross out four of them.',
    'Now count the ones that are left. Write how many in the box.',
  ],

  skills: [
    'Taking away',
    'Counting what’s left',
    'Reading a take-away sum',
    'Taking away nothing, or everything',
  ],
  whyItMatters: (
    <p>
      Crossing out links the sum to something they can see and touch. Once that link is
      solid, they can drop the pictures and work with the numbers alone.
    </p>
  ),

  settings: {
    blankMode: {
      label: 'Blank',
      description: <p>Which number they work out.</p>,
      options: [
        {
          label: '7−4=▢',
          description: <p>How many are left. Cross out, then count the rest. Start here.</p>,
          example: { config: { blankMode: 'answer' } },
        },
        {
          label: '7−▢=3',
          description: (
            <p>
              How many were taken. Cross out until 3 are left, then count the crosses.
              Harder: they have to plan.
            </p>
          ),
          example: { config: { blankMode: 'taken' } },
        },
        {
          label: 'Mix',
          description: <p>Each row picks one at random, so they must read every sum.</p>,
          example: { config: { blankMode: 'mixed' } },
        },
      ],
    },
    workedExample: {
      label: 'Example',
      description: <p>Whether the first row comes done.</p>,
      options: [
        {
          label: 'First row',
          description: <p>The first row has its crosses and answer filled in. Default.</p>,
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
      Width is the difficulty: it sets the biggest starting number. Width 4 gives up to 5,
      the default 6 up to 9, 8 up to 14, and 10 up to 19. One row always uses the biggest;
      the others start up to five below it. Height is the number of rows.
    </p>
  ),

  easier: [
    'Make it 4 or 5 wide (up to 5 or 7).',
    'Keep the worked example and do the next row together.',
  ],
  harder: [
    'Make it 8–10 wide, into the teens.',
    'Choose 7−▢=3, then Mix.',
    'Ask them to answer before crossing out, then check.',
  ],
  mistakes: [
    {
      sign: 'Writes how many were crossed out',
      meaning: <>A common mix-up. Ask “how many are <em>left</em>?” and point to the ones not crossed.</>,
    },
    {
      sign: 'Stuck on a 0 row',
      meaning: <>Normal: taking away nothing, or everything, feels like a trick. Act it out with toys.</>,
    },
    {
      sign: 'One out on a long row',
      meaning: <>Lost their place. Counting in the groups of five helps.</>,
    },
  ],
  beyondThePage: [
    'Five biscuits on a plate. You eat two. How many left?',
    'Sing “Five Little Ducks” and count who comes back.',
  ],

  atSchool: (
    <>
      Taking away with objects is part of Reception maths; reading and writing
      take-away sums within 20, including missing numbers like 7 − ▢ = 3, is Year 1.
    </>
  ),
};

export default docs;
