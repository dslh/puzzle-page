import type { PuzzleDoc } from '../../../types/puzzleDoc';
import type { MissingNumbersConfig } from './index';

const docs: PuzzleDoc<MissingNumbersConfig> = {
  summary: (
    <>
      Numbers in order with some boxes left empty. Write the missing numbers, on a
      number track or a piece of the 100 square.
    </>
  ),

  ages: (
    <>
      4–7. Start with a track up to 20 in 1s. The 100 square and counting in 2s, 5s
      and 10s suit 6–7.
    </>
  ),
  time: <>3–8 minutes</>,
  needs: <>A pencil</>,
  reading: <>None</>,

  example: { seed: 5 },

  howItWorks: (
    <>
      <p>
        The first two boxes of every track are filled in, so they can see the step
        and which way it counts before the first gap. Tracks often cross a ten, as
        29 to 30, because that is where the slips are.
      </p>
      <p>
        The 100 square slice is a window on a 100 square, starting anywhere. Its
        top left four boxes are always filled in, and every gap has a number beside
        it, above or below.
      </p>
    </>
  ),

  sayAloud: [
    'Say the numbers along the row. What number goes in the empty box?',
    'On the square: going along is one more. Going down is ten more.',
  ],

  skills: [
    'Number order',
    'One more and one less',
    'Ten more and ten less',
    'Counting in 2s, 5s and 10s',
    'Writing numbers',
  ],
  whyItMatters: (
    <p>
      Knowing what comes next, from any number, is the base of adding and taking
      away. The 100 square shows how our numbers are built: the ones repeat along
      each row and the tens go up by one each row down.
    </p>
  ),

  settings: {
    layout: {
      label: 'Layout',
      description: <p>How the numbers are laid out.</p>,
      options: [
        {
          label: 'Track',
          description: <p>One row of boxes a line. Each row starts at a different number.</p>,
          example: { config: { layout: 'track' }, width: 6, height: 1 },
        },
        {
          label: '100 square',
          description: (
            <p>
              Part of a 100 square, 1 to 10 on the top row. It always counts in 1s,
              so Count in and Count are hidden.
            </p>
          ),
          example: { config: { layout: 'square', range: 100 }, width: 5, height: 3 },
        },
      ],
    },
    range: {
      label: 'Up to',
      description: (
        <p>
          The biggest number used. On the 100 square it also limits the rows: up to 20
          gives only two rows.
        </p>
      ),
      options: [
        { label: '20', description: <p>The Reception range.</p> },
        { label: '50', description: <p>A step on, crossing the tens up to 50.</p> },
        { label: '100', description: <p>The whole 100 square. Year 1 and up.</p> },
      ],
    },
    step: {
      label: 'Count in',
      description: (
        <p>
          The jump between boxes, on a track only. Counts start at 0 or a multiple of
          the jump, so 5s go 5, 10, 15, never 3, 8, 13. A short range can make the
          track shorter: 10s up to 20 is only 0, 10, 20.
        </p>
      ),
      options: [
        { label: '1s', description: <p>Counting along.</p> },
        { label: '2s', description: <p>Even numbers: 2, 4, 6.</p>, example: { config: { layout: 'track', step: 2 }, width: 6, height: 1 } },
        { label: '5s', description: <p>The 5 times table.</p> },
        { label: '10s', description: <p>Choose up to 100, or the track is short.</p> },
      ],
    },
    direction: {
      label: 'Count',
      description: <p>Which way a track counts, on a track only.</p>,
      options: [
        { label: 'Forwards', description: <p>Numbers get bigger along the row.</p> },
        {
          label: 'Backwards',
          description: <p>Numbers get smaller, like a countdown. Harder.</p>,
          example: { config: { layout: 'track', direction: 'backwards' }, width: 6, height: 1 },
        },
      ],
    },
    gaps: {
      label: 'Gaps',
      description: <p>How many boxes are left empty.</p>,
      options: [
        {
          label: 'Few',
          description: <p>About a quarter of the boxes. Good to start with.</p>,
        },
        {
          label: 'Some',
          description: <p>About half. On a track, gaps never sit side by side.</p>,
        },
        {
          label: 'Lots',
          description: (
            <p>
              Most of the boxes. Track gaps can sit side by side, so they count on
              more than one.
            </p>
          ),
        },
      ],
    },
  },
  size: (
    <p>
      One box is one grid square. Width is the length of a track or the columns of
      the square. Height is the number of tracks or the rows.
    </p>
  ),

  easier: [
    'Use a short track with Few gaps.',
    'Let them say the numbers out loud along the row first.',
    'Have a real number track or 100 square to look at.',
  ],
  harder: [
    'Count backwards.',
    'Use the 100 square with Lots of gaps.',
    'Ask them to count in 10s from 3: 3, 13, 23.',
  ],
  mistakes: [
    {
      sign: '29, 20 or 29, 210',
      meaning: <>Normal. Crossing a ten is hard. Ask “what comes after 9?” and then look at the tens.</>,
    },
    {
      sign: '31 for 13',
      meaning: <>Normal, as we say the teen numbers backwards. Point to which row 13 sits in on the square.</>,
    },
    {
      sign: 'Counts in 1s on a 2s track',
      meaning: <>They didn’t check the first two boxes. Ask “how much bigger is each one?”</>,
    },
    {
      sign: 'Numbers written backwards',
      meaning: <>Normal at this age. Praise the right number.</>,
    },
  ],
  beyondThePage: [
    'Count up and down the stairs.',
    'Count in 2s with socks, and in 5s with fingers.',
    'Walk along a street: the house numbers on one side go up in 2s.',
  ],

  atSchool: (
    <>
      Reception counts beyond 20 and knows one more and one less to 10. Year 1 counts
      to 100 forwards and backwards, and in 2s, 5s and 10s. Year 2 counts in 10s from
      any number, which is the step down the 100 square.
    </>
  ),
};

export default docs;
