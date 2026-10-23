import type { PuzzleDoc } from '../../../types/puzzleDoc';
import type { PreWritingConfig } from './index';

const docs: PuzzleDoc<PreWritingConfig> = {
  summary: (
    <>
      Rows of lines and shapes for early pencil control. Either drive along a road from one
      picture to another, or trace a dotted pattern and carry it on.
    </>
  ),

  ages: <>2–3 for the wide road, 4–6 for the dotted patterns.</>,
  time: <>5 minutes</>,
  needs: <>A thick crayon for the roads, a pencil for the dots</>,
  reading: <>None.</>,

  example: { seed: 3 },

  howItWorks: (
    <>
      <p>
        <strong>Roads.</strong> Each row is a road from a picture on the left to one on the
        right. They draw a line along it without touching the edges. There are no turnings
        and no dead ends, so they can’t go wrong, only wobble.
      </p>
      <p>
        <strong>Dotted.</strong> Each row starts with one solid example. Then come dots to
        trace, starting at the black dot. With <strong>Carry on</strong>, the dots stop
        partway and they continue the pattern on their own.
      </p>
      <p>
        Rows go from easier shapes at the top to harder ones below. Children usually manage
        lines down first, then across, then circles, crosses, and last the zigzags and
        curves.
      </p>
    </>
  ),

  sayAloud: [
    'Who is this? Can you help them get to the end? Stay on the road!',
    'Put your pencil on the big dot. Follow the little dots all the way along.',
    'Now you keep going. Make it go up and down, just like the dots.',
  ],

  skills: [
    'Pencil control',
    'Going from left to right',
    'The shapes letters are made of',
    'Watching the line while drawing',
  ],
  whyItMatters: (
    <p>
      Every letter is built from these shapes: down lines, circles, arches and loops. Steady
      shapes first makes letters easier later. Starting on the left also builds the habit of
      reading and writing from left to right.
    </p>
  ),

  settings: {
    line: {
      label: 'Line',
      description: <p>What they follow. Roads take only the flowing shapes.</p>,
      options: [
        {
          label: 'Wide',
          description: <p>A wide road, with lots of room to steer. Best for a two-year-old with a fist grip.</p>,
          example: { config: { line: 'wide', patterns: ['across', 'waves', 'arches'] } },
        },
        {
          label: 'Thin',
          description: <p>A thinner road: less room, so more control. A step between Wide and Dotted.</p>,
          example: { config: { line: 'narrow', patterns: ['waves', 'arches', 'zigzags'] } },
        },
        {
          label: 'Dotted',
          description: <p>A solid example, then dots to trace. Default in Pre-Writing Patterns.</p>,
          example: { config: { line: 'dotted' } },
        },
      ],
    },
    patterns: {
      label: 'Shapes',
      description: (
        <p>
          Tap a shape to add or remove it. Each row takes the next one, easiest first. If
          there are more shapes than rows, “Show another” picks a different few. With a road,
          circles, crosses, down lines and loops are greyed out, since a road can’t cross
          itself or lift off the page.
        </p>
      ),
      options: [
        { label: 'Down lines', description: <p>The easiest. Top to bottom.</p> },
        { label: 'Across lines', description: <p>Left to right. A straight road.</p> },
        { label: 'Circles', description: <p>Start at the top and go round anticlockwise, like c and o.</p> },
        { label: 'Crosses', description: <p>Down, then across.</p> },
        { label: 'Waves', description: <p>Gentle curves up and down.</p> },
        { label: 'Arches', description: <p>Up and over, like n and m.</p> },
        { label: 'Zigzags', description: <p>Sharp turns: stop, change direction, go.</p> },
        {
          label: 'Loops',
          description: <p>The hardest. Up, round and back down, as in joined writing.</p>,
          example: { config: { line: 'dotted', patterns: ['loops'] } },
        },
      ],
    },
    size: {
      label: 'Size',
      description: <p>How tall the shapes are. Bigger is easier. Medium is the default.</p>,
      options: [
        { label: 'Small', description: <p>About letter height, for a child who is nearly writing.</p> },
        { label: 'Medium', description: <p>Default.</p> },
        { label: 'Large', description: <p>Big arm movements. Good for crayons.</p> },
      ],
    },
    finish: {
      label: 'End',
      description: <p>Dotted only. A road always runs end to end.</p>,
      options: [
        { label: 'Trace all', description: <p>Dots the whole way. Start here.</p>, example: { config: { line: 'dotted', finish: 'trace' } } },
        { label: 'Carry on', description: <p>Dots for half the row, then they carry on alone. Default.</p> },
      ],
    },
  },
  size: (
    <p>
      Shapes stay the same size. A taller puzzle gives more rows; a wider one makes each row
      longer. A wide road takes about two grid squares of height per row.
    </p>
  ),

  easier: [
    'Line Wide, Size Large, and only Across lines and Waves.',
    'Run a finger along it first, then the crayon.',
  ],
  harder: [
    'Line Dotted, Size Small, with Zigzags and Loops.',
    'Carry on, then ask them to make their own row of the pattern underneath.',
  ],
  mistakes: [
    {
      sign: 'Goes off the road on the bends',
      meaning: <>Normal. They’re looking at the crayon, not ahead. Say “where is the road going next?”</>,
    },
    {
      sign: 'Starts on the right',
      meaning: <>Common. Point to the picture or the big dot and say “we start here”.</>,
    },
    {
      sign: 'Zigzags come out as waves',
      meaning: <>Normal at first. Stopping at each point is the hard part; say “stop, turn” at each one.</>,
    },
    {
      sign: 'Circles go clockwise',
      meaning: <>Very common. It matters later for c, a, d and o, so show them once, gently.</>,
    },
  ],
  beyondThePage: [
    'Draw the shapes in sand, shaving foam or with water on a fence.',
    'Drive a toy car along a road of masking tape on the floor.',
  ],

  atSchool: (
    <>
      Physical Development in the EYFS: by the end of Reception, most children hold a pencil
      well and draw shapes with control. These are the shapes before letters; this puzzle
      doesn’t teach the letters themselves.
    </>
  ),
};

export default docs;
