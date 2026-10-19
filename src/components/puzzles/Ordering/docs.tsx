import type { PuzzleDoc } from '../../../types/puzzleDoc';
import type { OrderingConfig } from './index';

const docs: PuzzleDoc<OrderingConfig> = {
  summary: (
    <>
      Rows of numbers, or of one picture in different sizes, all jumbled. Write 1 under
      the smallest, 2 under the next, and so on.
    </>
  ),

  ages: (
    <>
      2–7. Sizes (<em>Emoji</em>, listed as Size Ordering) from two, with you writing.
      Numbers (<em>123</em>) for 4–7.
    </>
  ),
  time: <>2–5 minutes</>,
  needs: <>A pencil</>,
  reading: <>None, beyond reading numbers to 20.</>,

  example: { seed: 4 },

  howItWorks: (
    <>
      <p>
        Each square holds a number or a picture, with a small dashed box under it. Nothing
        on the page says which end to start from, so tell them: smallest is 1 is the
        usual way.
      </p>
      <p>
        Every row is its own puzzle. Numbers in a row are all different; pictures in a
        row are all the same picture, all different sizes.
      </p>
    </>
  ),

  sayAloud: [
    'Find the smallest one. Write 1 under it.',
    'Now find the smallest one left. That’s 2. Keep going till they all have a number.',
  ],

  skills: [
    'Comparing: bigger and smaller',
    'Putting things in order',
    'Number order to 20',
    'Writing numbers',
  ],
  whyItMatters: (
    <p>
      Ordering means comparing over and over, and keeping track of which ones are done.
      With numbers, it shows whether they know that 12 comes after 9, not just how to
      count aloud.
    </p>
  ),

  settings: {
    mode: {
      label: 'Mode',
      description: <p>What goes in each square. Size Ordering starts on Emoji; Ordering on 123.</p>,
      options: [
        {
          label: '123',
          description: (
            <p>
              Different numbers from 1 to 20, whatever the width. A row of three might be
              4, 17, 9: they write 1, 3, 2.
            </p>
          ),
          example: { config: { mode: 'numbers' } },
        },
        {
          label: 'Emoji',
          description: (
            <p>
              One picture repeated in different sizes, from 3 to 12 mm. Two can be only
              1 mm apart, so if a row is too close to call, press reroll.
            </p>
          ),
          example: { config: { mode: 'emoji' } },
        },
      ],
    },
  },
  size: (
    <p>
      Width is the number of things in a row, 3–10, so it is the difficulty. Height is
      the number of rows.
    </p>
  ),

  easier: [
    'Make it 3 wide.',
    'For 2–3, Emoji and no writing: ask them to point to the biggest, then the smallest. Talk about it; you write the numbers.',
    'Cross off each one once it has a number.',
  ],
  harder: [
    'Make it 6–10 wide.',
    'Order from biggest to smallest instead.',
    'With 123, ask which numbers are missing between them.',
  ],
  mistakes: [
    {
      sign: 'Writes the numbers left to right, 1, 2, 3',
      meaning: <>Normal at first: they’re counting the squares. Point to one and ask “Is this the smallest?”</>,
    },
    {
      sign: 'Puts 12 before 9',
      meaning: <>They are going by the first digit. Count up from 9 together and see which you reach first.</>,
    },
    {
      sign: 'Two pictures get the same number',
      meaning: <>They looked about the same size. Fine if they really are close; reroll that one.</>,
    },
  ],
  beyondThePage: [
    'Line up teddies from smallest to biggest.',
    'Order the family’s shoes by size.',
  ],

  atSchool: (
    <>
      Comparing sizes is part of EYFS maths; ordering numbers to 20 is Year 1
      maths.
    </>
  ),
};

export default docs;
