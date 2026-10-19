import type { PuzzleDoc } from '../../../types/puzzleDoc';
import type { PatternSequenceConfig } from './index';

const docs: PuzzleDoc<PatternSequenceConfig> = {
  summary: (
    <>
      Rows of shapes or colours that repeat. Work out the pattern and fill in the gap: draw
      the missing shape, or colour the empty circle.
    </>
  ),

  ages: (
    <>
      2–7. At 2–3 it starts as two or three colours taking turns, with the gap at the end. Say the colours
      together, then let them colour the circle, or point to the crayon while you do it.
    </>
  ),
  time: <>5 minutes</>,
  needs: <>A pencil for shapes. Red, green, blue and yellow crayons for colours.</>,
  reading: <>None</>,

  example: { seed: 1 },

  howItWorks: (
    <>
      <p>
        Each row follows a rule, written in letters: AB is red, blue, red, blue; AAB is
        star, star, square. Rows on a sheet don’t repeat the rule of the row above.
      </p>
      <p>
        A gap never comes before the pattern has been shown once, so the answer can always
        be checked against something earlier in the row. In shapes, the gap is a dashed box,
        not an outline, so the shape isn’t given away.
      </p>
    </>
  ),

  sayAloud: [
    'Let’s say it: red, blue, red, blue. What comes next?',
    'Find the empty box. What should go there? Draw it.',
  ],

  skills: [
    'Spotting a repeating pattern',
    'Saying what comes next',
    'Naming shapes and colours',
    'Drawing simple shapes',
  ],
  whyItMatters: (
    <p>
      Seeing a rule and carrying it on is the root of a lot of maths, from counting in twos
      to times tables. Saying the pattern aloud helps most children hear it.
    </p>
  ),

  settings: {
    style: {
      label: 'Style',
      description: <p>What the pattern is made of.</p>,
      options: [
        {
          label: 'Shapes',
          description: <p>Black outlines, eight shapes. Draw the missing one. Only needs a pencil. Default.</p>,
          example: { config: { style: 'shapes' } },
        },
        {
          label: 'Colours',
          description: (
            <p>Coloured circles. Colour in the empty one. Easiest, but needs a colour printer.</p>
          ),
          example: { config: { style: 'colours' } },
        },
      ],
    },
    families: {
      label: 'Patterns',
      description: (
        <p>
          Which rules rows can use. Switch on as many as you like; one always stays on. Default:
          AB ABC, AAB ABB and Mirror.
        </p>
      ),
      options: [
        {
          label: 'AB ABC',
          description: <p>Two or three things taking turns. Start here.</p>,
          example: { config: { families: ['simple'] } },
        },
        {
          label: 'AAB ABB',
          description: <p>One thing twice, then another (also AABB).</p>,
          example: { config: { families: ['doubles'] } },
        },
        {
          label: 'ABCD ABAC',
          description: <p>Four-long repeats, so harder to see.</p>,
          example: { config: { families: ['four'] } },
        },
        {
          label: 'Growing',
          description: <p>One more each time: A B, A B B, A B B B. Counting, not repeating.</p>,
          example: { config: { families: ['growing'] } },
        },
        {
          label: 'Mirror',
          description: <p>There and back, like ABCB or ABBA.</p>,
          example: { config: { families: ['mirror'] } },
        },
      ],
    },
    fill: {
      label: 'Filled',
      description: <p>Shapes only: whether some shapes are coloured in black.</p>,
      options: [
        {
          label: 'Some',
          description: (
            <p>
              Some shapes are filled. Sometimes two parts of a pattern are the same shape, told
              apart only by being filled. Default.
            </p>
          ),
          example: { config: { style: 'shapes', fill: 'mixed' } },
        },
        {
          label: 'None',
          description: <p>Outlines only. Easiest.</p>,
          example: { config: { style: 'shapes', fill: 'outline' } },
        },
        {
          label: 'Own pattern',
          description: (
            <p>
              Filling follows its own repeat, out of step with the shapes. They track two
              patterns at once. Hard.
            </p>
          ),
          example: { config: { style: 'shapes', fill: 'separate' } },
        },
      ],
    },
    gaps: {
      label: 'Gaps',
      description: <p>Where the blanks go.</p>,
      options: [
        { label: 'End', description: <p>“What comes next?” Easiest.</p> },
        { label: 'Anywhere', description: <p>One gap, at the end or in the middle. Default.</p> },
        { label: 'Two', description: <p>Two gaps a row: the last two, or one in the middle and the end.</p> },
      ],
    },
  },
  size: (
    <p>
      Height is the number of rows. Width sets how long each row is, up to 12, and so which
      patterns fit: width 5 gives 6 items and only AB, width 6–7 adds the three-long ones,
      and width 8 or more is needed for four-long, Growing and the longer Mirror patterns.
    </p>
  ),

  easier: [
    'Colours, AB ABC only, Gaps End.',
    'Say the row aloud together, clapping each one.',
    'Fewer rows.',
  ],
  harder: [
    'Switch on ABCD ABAC and Growing.',
    'Filled: Own pattern, Gaps: Two.',
    'Ask them to make up a pattern for you to finish.',
  ],
  mistakes: [
    {
      sign: 'Copies the item just before the gap',
      meaning: <>Common at first. Say the whole row aloud from the start and let them hear it.</>,
    },
    {
      sign: 'Right shape, but forgets to fill it in',
      meaning: <>They’ve seen the shape pattern but not the filling. Ask “is it empty or coloured in?”</>,
    },
    {
      sign: 'Wobbly shapes',
      meaning: <>Fine. A star that’s clearly a star counts.</>,
    },
  ],
  beyondThePage: [
    'Thread beads or stack blocks in a pattern and ask what comes next.',
    'Clap and stamp a pattern: clap, clap, stamp. Can they carry it on?',
  ],

  atSchool: (
    <>
      Copying, continuing and making repeating patterns is part of Reception maths in
      Development Matters, the EYFS guidance.
    </>
  ),
};

export default docs;
