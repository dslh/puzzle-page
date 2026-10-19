import type { PuzzleDoc } from '../../../types/puzzleDoc';
import type { WeavingMazeConfig } from './index';

const docs: PuzzleDoc<WeavingMazeConfig> = {
  summary: (
    <>
      A maze of white paths that go over and under each other on bridges. Draw a line
      from the top-left picture to the bottom-right one.
    </>
  ),

  ages: <>4–7, once they can do an ordinary maze. Start on Large with Few crossings.</>,
  time: <>5–10 minutes</>,
  needs: <>A pencil</>,
  reading: <>None. Show them one bridge first.</>,

  example: { seed: 12 },

  howItWorks: (
    <>
      <p>
        The paths are drawn as white lanes, not gaps between walls. Where one lane
        crosses another, one goes straight over on a bridge and the other passes
        underneath. The shading at each tunnel mouth shows which is which.
      </p>
      <p>
        You can’t turn on a bridge or in a tunnel; you go straight across. There is
        exactly one route and no loops.
      </p>
    </>
  ),

  sayAloud: [
    'This path goes over a bridge. This one goes under it, like a tunnel.',
    'You can go over or under, but you can’t turn in the middle. Keep going straight.',
  ],

  skills: [
    'Pencil control',
    'Planning ahead',
    'Over and under',
    'Seeing in layers',
  ],
  whyItMatters: (
    <p>
      Reading a flat drawing as two layers is a step up in seeing space. And crossing
      isn’t joining: a new rule for what lines mean.
    </p>
  ),

  settings: {
    cellSizeRatio: {
      label: 'Cell size',
      description: <p>The biggest difference to difficulty. On the default 5×5:</p>,
      options: [
        {
          label: 'Large',
          description: <p>8×8 cells, usually 2–4 bridges. Default.</p>,
        },
        {
          label: 'Medium',
          description: <p>13×13 cells, usually 8–12 bridges.</p>,
          example: { config: { cellSizeRatio: 3 } },
        },
        {
          label: 'Small',
          description: <p>18×18 cells, with many bridges and narrow lanes.</p>,
          example: { config: { cellSizeRatio: 4 } },
        },
      ],
    },
    crossingDensity: {
      label: 'Crossings',
      description: (
        <p>
          How often the maze takes a bridge when it could step to the next square. The
          change is modest. Any setting can give a maze with no bridges: reroll it.
        </p>
      ),
      options: [
        { label: 'Few', description: <p>Fewer bridges. Start here.</p> },
        { label: 'Some', description: <p>Default.</p> },
        { label: 'Many', description: <p>A few more bridges.</p> },
      ],
    },
    branchiness: {
      label: 'Branches',
      description: <p>How the paths split.</p>,
      options: [
        {
          label: 'Windy',
          description: <p>Long winding lanes, few turnings. Also gives the most bridges.</p>,
          example: { config: { branchiness: 'low' } },
        },
        { label: 'Mixed', description: <p>Some long lanes, some side turnings. Default.</p> },
        {
          label: 'Branchy',
          description: <p>Lots of short dead ends, so more choices to make.</p>,
          example: { config: { branchiness: 'high' } },
        },
      ],
    },
  },
  size: (
    <p>
      Bigger means more cells, and more bridges, not wider lanes. On Large, each square
      of the page adds two cells across. Minimum 4×4.
    </p>
  ),

  easier: [
    'Large, Few, on a 4×4.',
    'Trace each bridge with your finger together before they start.',
    'Colour the bridges in first so they stand out.',
  ],
  harder: [
    'Medium or Small cells.',
    'A bigger maze: more bridges to read.',
    'Eyes only first: find the way, then draw it.',
  ],
  mistakes: [
    {
      sign: 'Turns at a crossing',
      meaning: (
        <>
          Very common at first: it looks like a crossroads. Remind them that a bridge
          and a tunnel only go straight.
        </>
      ),
    },
    {
      sign: 'Stops at a tunnel, thinking it’s a dead end',
      meaning: <>Point to the shading and show where the lane comes out on the other side.</>,
    },
    {
      sign: 'Line goes over the outline',
      meaning: <>Normal. The lanes are narrower than an ordinary maze’s. Try Large cells.</>,
    },
  ],
  beyondThePage: [
    'Build a toy car track with a bridge, and drive cars over and under it.',
    'Spot bridges and underpasses on a walk or a car journey.',
  ],

  atSchool: (
    <>
      “Over”, “under” and “through” are the position words of Reception and Year 1
      maths.
    </>
  ),
};

export default docs;
