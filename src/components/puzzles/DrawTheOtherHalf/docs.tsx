import type { PuzzleDoc } from '../../../types/puzzleDoc';
import type { DrawTheOtherHalfConfig } from './index';

const docs: PuzzleDoc<DrawTheOtherHalfConfig> = {
  summary: (
    <>
      Half a shape or picture on a dot grid, beside a dashed mirror line. They draw the
      other half so it matches on both sides.
    </>
  ),

  ages: <>5–7. Four-year-olds can try it with Help on Dotted.</>,
  time: <>5 minutes</>,
  needs: <>A pencil, and a ruler if they like</>,
  reading: <>None.</>,

  example: { seed: 4 },

  howItWorks: (
    <>
      <p>
        The shape starts on the mirror line, goes out and comes back to it. They copy each
        line onto the other side, flipped, so the two halves make one closed shape. There is
        one right answer, and it never crosses itself.
      </p>
      <p>
        A picture works the same way, but may have lines inside it too, like a window or an
        eye. Every line runs from dot to dot, so there is still one right answer.
      </p>
      <p>
        The trick is counting. A corner three dots from the mirror line on one side is three
        dots from it on the other. Lines going out on one side go out on the other too.
      </p>
    </>
  ),

  sayAloud: [
    'This is a magic mirror. Can you draw what the mirror would show?',
    'Find where the line touches the mirror. Start your line there too.',
    'How many dots from the mirror is this corner? Count the same on your side.',
  ],

  skills: [
    'Seeing that two sides match',
    'Counting along a grid',
    'Careful copying',
    'Drawing straight lines between dots',
  ],
  whyItMatters: (
    <p>
      Spotting things that match on both sides helps with shapes, patterns and letters later.
      Copying across a line, rather than straight down, makes them check every corner. Joining
      dots in straight lines is good pencil control.
    </p>
  ),

  settings: {
    subject: {
      label: 'Draw',
      description: <p>What the half is.</p>,
      options: [
        {
          label: 'Shape',
          description: <p>A made-up shape, new every time. Default.</p>,
          example: { config: { subject: 'shape' } },
        },
        {
          label: 'Picture',
          description: (
            <p>
              A simple picture, such as a house, rocket, owl or cat. There are about five at
              each level, so they come round again. Across uses only the ones that still look
              right on their side.
            </p>
          ),
          example: { config: { subject: 'picture' } },
        },
      ],
    },
    level: {
      label: 'Level',
      description: <p>How many lines, how far out they go, and whether any slant.</p>,
      options: [
        {
          label: 'Easy',
          description: <p>Straight lines only. A shape has four to six. Default.</p>,
          example: { config: { level: 'easy' } },
        },
        {
          label: 'Medium',
          description: <p>More lines, some slanting corner to corner.</p>,
          example: { config: { level: 'medium' } },
        },
        {
          label: 'Hard',
          description: <p>Lots of lines, more slants, some of them steep.</p>,
          example: { config: { level: 'hard' } },
        },
      ],
    },
    help: {
      label: 'Help',
      description: <p>How much of the missing half is shown.</p>,
      options: [
        {
          label: 'Dotted',
          description: <p>The whole missing half as small dots to trace. For a first go, or for four-year-olds.</p>,
          example: { config: { help: 'dotted' } },
        },
        {
          label: 'Corners',
          description: <p>A big dot at each corner. They join the dots in order. Default.</p>,
          example: { config: { help: 'corners' } },
        },
        {
          label: 'None',
          description: <p>Just the grid. They count every corner themselves.</p>,
          example: { config: { help: 'none' } },
        },
      ],
    },
    mirror: {
      label: 'Mirror',
      description: <p>Which way the mirror line runs.</p>,
      options: [
        {
          label: 'Down',
          description: <p>Down the middle. They draw on the right. Default.</p>,
        },
        {
          label: 'Across',
          description: <p>Across the middle. They draw underneath. Usually harder, as it’s less familiar.</p>,
          example: { config: { mirror: 'horizontal' } },
        },
      ],
    },
  },
  size: (
    <>
      <p>
        A bigger puzzle gives more dots, so shapes reach further from the mirror line. Dots are
        at least 1cm apart. Past about six dots each side, they spread out instead.
      </p>
      <p>
        A picture spreads its dots to fill the puzzle. A small puzzle only fits the smaller
        pictures, and may give an easier one than the level asks for. Below 4 by 4 squares,
        or in a thin strip, no picture fits and you get a shape.
      </p>
    </>
  ),

  easier: [
    'Level Easy, Help Dotted.',
    'Hold a small mirror on the dashed line so they can see the answer.',
  ],
  harder: [
    'Level Hard, Help None, Mirror Across.',
    'Ask them to draw a half for you to finish.',
  ],
  mistakes: [
    {
      sign: 'Copies the shape the same way round, not flipped',
      meaning: <>Very common. Ask “does this line go towards the mirror or away from it?”</>,
    },
    {
      sign: 'A corner is one dot out',
      meaning: <>Normal. Count the dots from the mirror together, touching each one.</>,
    },
    {
      sign: 'Slants go the wrong way',
      meaning: <>Normal; slants are the hardest part. Go back to Easy, or try Help Dotted for a while.</>,
    },
    {
      sign: 'Starts away from the mirror line',
      meaning: <>Common. Point to where the line touches the mirror and say “start here”.</>,
    },
  ],
  beyondThePage: [
    'Fold paper, paint on one side, press and open it: a butterfly.',
    'Look for things that match on both sides: faces, leaves, doors.',
    'Build half a shape with blocks and ask them to build the other half.',
  ],

  atSchool: (
    <>
      Shape and pattern in Reception and Key Stage 1, where matching sides are talked about
      informally. Lines of symmetry are taught properly in Year 4; this puzzle doesn’t claim
      to teach them.
    </>
  ),
};

export default docs;
