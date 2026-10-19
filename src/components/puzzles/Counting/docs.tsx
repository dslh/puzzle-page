import type { PuzzleDoc } from '../../../types/puzzleDoc';

const docs: PuzzleDoc = {
  summary: (
    <>
      Rows of the same picture repeated, each with a box at the end. Count the row and
      write the number.
    </>
  ),

  ages: <>4–6. Narrow for four-year-olds (up to 6 a row), wide for 6–7 (up to 12).</>,
  time: <>2–5 minutes</>,
  needs: <>A pencil</>,
  reading: <>None</>,

  example: { seed: 8 },

  howItWorks: (
    <p>
      Each row picks a picture and repeats it a random number of times, in a plain line
      rather than groups, so the child counts instead of recognising a pattern like dice
      dots.
    </p>
  ),

  sayAloud: [
    'How many in this row? Touch each one as you count.',
    'Write how many in the box.',
  ],

  skills: [
    'Counting each thing once',
    'The last number is how many',
    'Writing numbers',
  ],
  whyItMatters: (
    <p>
      Counting properly means touching each thing once, keeping the numbers in step, and
      knowing the last number said is the total. That last idea often takes longest.
      With small rows, watch for them knowing “three” at a glance.
    </p>
  ),

  settings: {},
  size: (
    <p>
      Size is the difficulty. Width sets the row: from three fewer than the width to two
      more (width 4 gives 1–6, width 10 gives 7–12). Height is the number of rows.
    </p>
  ),

  easier: [
    'Keep it 3–4 wide.',
    'Cross off each picture as it’s counted.',
    'You write the number if forming it is the hard part.',
  ],
  harder: [
    'Make it 8–10 wide.',
    'Ask for the total of two rows.',
    'Which row has most, and by how many?',
  ],
  mistakes: [
    {
      sign: 'One or two out',
      meaning: <>Counted one twice or skipped one, often where the row wraps. Crossing off fixes it.</>,
    },
    {
      sign: 'Counts correctly but can’t say how many',
      meaning: <>The last number isn’t yet the total for them. Ask “so how many?” and point back to it.</>,
    },
    {
      sign: 'Numbers backwards',
      meaning: <>Normal at this age. Praise the count.</>,
    },
  ],
  beyondThePage: [
    'Count stairs out loud.',
    'Lay the table: one fork each, then count the forks.',
  ],

  atSchool: (
    <>
      The Reception Early Learning Goal covers numbers to 10 and seeing up to 5 at a
      glance; reading and writing numbers to 20 is Year 1.
    </>
  ),
};

export default docs;
