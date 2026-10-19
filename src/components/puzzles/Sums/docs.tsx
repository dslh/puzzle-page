import type { PuzzleDoc } from '../../../types/puzzleDoc';
import type { SumsConfig } from './index';

const docs: PuzzleDoc<SumsConfig> = {
  summary: (
    <>
      A page of short number sums like 3 + 4 = ▢ and 7 − 2 = ▢. Work each one out and
      write the answer in the box.
    </>
  ),

  ages: <>4–7. Start with <em>+</em> alone; <em>−</em> and <em>Both</em> once adding feels easy.</>,
  time: <>5 minutes</>,
  needs: <>A pencil. Fingers or a few small toys help.</>,
  reading: <>None, beyond the numbers and the + and − signs.</>,

  example: { seed: 2 },

  howItWorks: (
    <>
      <p>
        Every number stays at 9 or under: sums never total more than 9 and take-aways
        never start above 9. Nothing adds or takes away 0, and no answer is 0.
      </p>
      <p>
        There are 36 adding sums and 36 take-aways. A page uses them all before any
        repeats.
      </p>
    </>
  ),

  sayAloud: [
    'Three add four. Hold up three fingers, then four more. How many altogether?',
    'Seven take away two. Start with seven, put two down. How many are left?',
  ],

  skills: [
    'Adding within 10',
    'Taking away within 10',
    'Reading + and −',
    'Writing numbers',
  ],
  whyItMatters: (
    <p>
      Small sums done often become facts they just know, which frees their attention for
      bigger sums later. Mixing the two signs also checks they read the sign, not just
      the numbers.
    </p>
  ),

  settings: {
    mode: {
      label: 'Sums',
      description: <p>Which kind of sum the page holds.</p>,
      options: [
        {
          label: '+',
          description: <p>Adding only. The place to start.</p>,
          example: { config: { mode: 'add' } },
        },
        {
          label: '−',
          description: <p>Taking away only. Answers are always 1 or more.</p>,
          example: { config: { mode: 'subtract' } },
        },
        {
          label: 'Both',
          description: <p>Adding and taking away jumbled together. Default.</p>,
          example: { config: { mode: 'both' } },
        },
      ],
    },
  },
  size: (
    <p>
      Size changes how many, not how hard. Each sum takes two squares across, so width 4
      gives two a row and width 10 gives five. Height is the number of rows. An odd width
      leaves a square spare.
    </p>
  ),

  easier: [
    'Choose +.',
    'Keep it small: 4×2 is four sums.',
    'Use toys or fingers for every sum.',
  ],
  harder: [
    'Choose Both.',
    'Make it 10 wide and tall: up to 70 sums.',
    'No fingers: ask them how they knew.',
  ],
  mistakes: [
    {
      sign: 'Adds when it says take away',
      meaning: <>Common when the signs are mixed. Ask them to say the sum out loud first.</>,
    },
    {
      sign: 'One out',
      meaning: <>Normal when counting on. They counted the number they started from. Start on the next one.</>,
    },
    {
      sign: 'Numbers backwards',
      meaning: <>Normal at this age. Praise the right answer.</>,
    },
  ],
  beyondThePage: [
    'Three grapes on the plate, add two more: how many now? Eat one: how many left?',
    'Roll two dice and add the spots.',
  ],

  atSchool: (
    <>
      Adding and taking away within 10 is Year 1 maths, which expects them to read and
      write +, − and =. Reception aims for number bonds to 5, and some to 10.
    </>
  ),
};

export default docs;
