import type { PuzzleDoc } from '../../../types/puzzleDoc';
import type { DotMarkerConfig } from './index';

const docs: PuzzleDoc<DotMarkerConfig> = {
  summary: (
    <>
      Big circles set round a simple shape. They dab each one with a dot marker, cover it
      with a sticker, or colour it in.
    </>
  ),

  ages: <>2–3, and 4–5 with smaller dots.</>,
  time: <>5 minutes</>,
  needs: <>Dot markers, round stickers or a chunky crayon</>,
  reading: <>None.</>,

  example: { seed: 2 },

  howItWorks: (
    <>
      <p>
        One shape fills the puzzle, with a circle at every corner and evenly spaced ones
        between. A thick line joins them, so the shape still shows once the dots are covered.
      </p>
      <p>
        Each dab should land inside a circle. There is no order and no wrong answer: a dot
        that misses is still a dot.
      </p>
    </>
  ),

  sayAloud: [
    'What shape is this? It’s a heart! Can you put a dot in every circle?',
    'Who is in the middle? Let’s give them lots of dots.',
    'How many dots did you make? Let’s count them together.',
  ],

  skills: [
    'Hand–eye coordination',
    'Aiming and stopping',
    'Naming shapes',
    'Counting, as a bonus',
  ],
  whyItMatters: (
    <p>
      Landing a marker inside a circle takes aim and a controlled stop. That is the start of
      pencil control. Dabbing is easier than drawing a line, so a child can manage it long
      before they can trace.
    </p>
  ),

  settings: {
    shape: {
      label: 'Shape',
      description: <p>The shape the dots go round: plain shapes on the top row, pictures below. Heart is the default.</p>,
      options: [
        { label: 'Circle', description: <p>No corners. The easiest to follow round.</p>, example: { config: { shape: 'circle' } } },
        { label: 'Heart', description: <p>Default. A dot at the point and the dip.</p> },
        { label: 'Star', description: <p>A dot on every point, so five to find.</p>, example: { config: { shape: 'star' } } },
        { label: 'Square', description: <p>Four corners, four straight sides.</p>, example: { config: { shape: 'square' } } },
        {
          label: 'Triangle',
          description: <p>Three corners. Takes less space, so fewer dots.</p>,
          example: { config: { shape: 'triangle' } },
        },
        { label: 'House', description: <p>A box with a pointed roof.</p>, example: { config: { shape: 'house' } } },
        {
          label: 'Fish',
          description: <p>Wider than it is tall, so give it a wide puzzle.</p>,
          example: { config: { shape: 'fish' }, width: 8, height: 5 },
        },
        { label: 'Pumpkin', description: <p>Three round lobes and a stalk.</p>, example: { config: { shape: 'pumpkin' } } },
        { label: 'Tree', description: <p>A fir tree with two tiers of branches.</p>, example: { config: { shape: 'tree' } } },
        {
          label: 'Cloud',
          description: <p>Four bumps on a flat bottom. Also best in a wide puzzle.</p>,
          example: { config: { shape: 'cloud' }, width: 8, height: 5 },
        },
      ],
    },
    size: {
      label: 'Dots',
      description: <p>How big each circle is.</p>,
      options: [
        {
          label: 'Small',
          description: <p>About 12mm. For small round stickers, or colouring in with a crayon.</p>,
          example: { config: { size: 'small' } },
        },
        { label: 'Medium', description: <p>About 15mm. More dots, closer aim.</p>, example: { config: { size: 'medium' } } },
        { label: 'Big', description: <p>About 20mm, the size of a dot marker’s dab. Default.</p> },
      ],
    },
    fill: {
      label: 'Where',
      description: <p>Whether the dots stay on the edge.</p>,
      options: [
        { label: 'Edge', description: <p>Dots round the edge only. Default.</p> },
        {
          label: 'Filled',
          description: <p>Dots all over the inside too, and a smaller picture. More to do, and more to count.</p>,
          example: { config: { fill: 'filled', size: 'medium' } },
        },
      ],
    },
    picture: {
      label: 'Picture',
      description: (
        <p>
          A picture in the middle, chosen at random. “Show another” picks a new one. It is
          left out if the shape is too small to hold it.
        </p>
      ),
      options: [
        { label: 'On', description: <p>Something to talk about. Default.</p> },
        { label: 'Off', description: <p>Just the dots.</p>, example: { config: { picture: false } } },
      ],
    },
  },
  size: (
    <p>
      The shape grows to fill the puzzle, but the dots stay the same size. A bigger puzzle
      just has more of them.
    </p>
  ),

  easier: [
    'Dots Big, Where Edge, and a Circle.',
    'Use stickers: peeling and placing is easier than aiming a marker.',
  ],
  harder: [
    'Dots Small, Where Filled.',
    'Ask for one colour on the edge and another inside.',
    'Count the dots before they start, then check at the end.',
  ],
  mistakes: [
    {
      sign: 'Dabs land between the circles',
      meaning: <>Normal at two. Say “find a circle” and let them look before they dab.</>,
    },
    {
      sign: 'Scrubs the marker round instead of dabbing',
      meaning: <>Common. Show them “up, down, lift”, like a bouncing ball.</>,
    },
    {
      sign: 'Skips circles',
      meaning: <>Normal. Point to an empty one and ask “does this one need a dot?”</>,
    },
    {
      sign: 'Counts the same dot twice',
      meaning: <>Very common. Go round the edge together from the top, touching each one.</>,
    },
  ],
  beyondThePage: [
    'Press a finger dipped in paint into circles drawn on paper.',
    'Put stickers on the spots of a ladybird you drew together.',
  ],

  atSchool: (
    <>
      Physical Development in the EYFS: hand–eye coordination and early control of a tool.
      Naming the shape and counting the dots touch on Mathematics, but this puzzle doesn’t
      teach them on its own.
    </>
  ),
};

export default docs;
