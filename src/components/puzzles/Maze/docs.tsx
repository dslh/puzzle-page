import type { PuzzleDoc } from '../../../types/puzzleDoc';
import type { MazeConfig } from './index';

const docs: PuzzleDoc<MazeConfig> = {
  summary: (
    <>
      A classic maze. Draw a line from the picture at one corner to the picture at the
      other without crossing a wall.
    </>
  ),

  ages: (
    <>
      2–7. For 2–3, use Large and Windy (the 2–3 age switch picks these) and expect a finger, not a
      pencil. 6–7 starts on Medium.
    </>
  ),
  time: <>2–10 minutes</>,
  needs: <>A pencil or crayon</>,
  reading: <>None</>,

  example: { seed: 7 },

  howItWorks: (
    <>
      <p>
        The start is near the top left and the finish near the bottom right, each a
        picture: a mouse and its cheese, a bee and a flower. The outside wall has no
        gaps, so the route stays inside.
      </p>
      <p>
        There is exactly one way through and no loops. Every wrong turn is a dead end,
        so going back is always the fix.
      </p>
    </>
  ),

  sayAloud: [
    'Help the mouse get to the cheese. Your line can’t go through the black lines.',
    'If you get stuck, go back to where you had a choice and try the other way.',
  ],

  skills: [
    'Pencil control',
    'Planning ahead',
    'Trying again after a dead end',
    'Keeping eyes on a line',
  ],
  whyItMatters: (
    <p>
      Staying between two walls builds the pencil control handwriting needs. Bigger
      mazes add planning: spotting a dead end early, and backing up calmly when they
      don’t.
    </p>
  ),

  settings: {
    gridShape: {
      label: 'Grid shape',
      description: (
        <p>
          The shape of the cells. Odd shapes are harder: the way on is less obvious.
        </p>
      ),
      options: [
        {
          label: 'Squares',
          description: <p>The usual maze, with right-angle turns. Default, and the easiest to read.</p>,
          example: { config: { gridShape: 'square' } },
        },
        {
          label: 'Hexagons, Triangles',
          description: (
            <p>
              More (or fewer) ways out of each cell. Cells are drawn bigger to leave room
              for a pencil, so there are fewer.
            </p>
          ),
          example: { config: { gridShape: 'hex' } },
        },
        {
          label: 'Rhombuses, Squares + triangles, Pentagons',
          description: <p>Patterned tilings. Pretty, and harder to follow.</p>,
          example: { config: { gridShape: 'cairo' } },
        },
        {
          label: 'Crazy paving',
          description: <p>Uneven cells of all shapes, different every time. The hardest to read.</p>,
          example: { config: { gridShape: 'voronoi' } },
        },
        {
          label: 'Circle, Hexagon, Octagon, Star, Heart',
          description: (
            <p>
              Rings around a centre. The start and finish are both on the outside edge,
              not the middle.
            </p>
          ),
          example: { config: { gridShape: 'circle' } },
        },
      ],
    },
    cellSizeRatio: {
      label: 'Cell size',
      description: <p>The biggest difference to difficulty. On the default 4×4:</p>,
      options: [
        {
          label: 'Large',
          description: <p>6×6 cells. Wide paths for crayons and young hands. Default.</p>,
        },
        {
          label: 'Medium',
          description: <p>10×10 cells. Default for 6–7.</p>,
          example: { config: { cellSizeRatio: 3 } },
        },
        {
          label: 'Small',
          description: <p>14×14 cells, with narrow paths. Needs a sharp pencil.</p>,
          example: { config: { cellSizeRatio: 4 } },
        },
      ],
    },
    branchiness: {
      label: 'Branches',
      description: <p>How the paths split.</p>,
      options: [
        {
          label: 'Windy',
          description: (
            <p>
              Long winding corridors, few turnings. Fewer choices, though the route is
              long. Default for 2–3.
            </p>
          ),
          example: { config: { branchiness: 'low' } },
        },
        {
          label: 'Mixed',
          description: <p>Some long corridors, some side turnings. Default.</p>,
        },
        {
          label: 'Branchy',
          description: <p>Lots of short dead ends, so many more choices along the way.</p>,
          example: { config: { branchiness: 'high' } },
        },
      ],
    },
    theme: {
      label: 'Start and finish',
      description: (
        <p>
          The pair of pictures, such as 🐭 → 🧀 or 🚀 → 🌙. <em>Random pair</em> lets
          each maze pick its own. It changes nothing else.
        </p>
      ),
    },
    curvyWalls: {
      label: 'Walls',
      description: <p>A drawing style only. The maze itself is the same.</p>,
      options: [
        { label: 'Straight', description: <p>Straight walls. Default.</p> },
        {
          label: 'Curvy',
          description: (
            <p>
              The same walls drawn as soft curves. It drops the coloured patch behind the
              start and finish pictures.
            </p>
          ),
          example: { config: { curvyWalls: true } },
        },
      ],
    },
  },
  size: (
    <p>
      Bigger means more cells, not wider paths. On Large, each square of the page adds
      two cells across: 4×4 gives 6×6 cells, a full 10×14 page gives 18×26. Smaller cell
      sizes multiply that. Minimum 4×4.
    </p>
  ),

  easier: [
    'Large, Windy, 4×4.',
    'For 2–3: you draw the line while they point the way, or let them use a finger.',
    'Trace the route lightly first and let them go over it.',
  ],
  harder: [
    'Medium or Small cells, and a bigger maze.',
    'Branchy, or an odd shape like Crazy paving.',
    'Eyes only first: find the way, then draw it.',
  ],
  mistakes: [
    {
      sign: 'Line goes through a wall',
      meaning: (
        <>
          Normal, especially at first. Pencil control is still coming. Try Large cells,
          or a thick crayon and slower going.
        </>
      ),
    },
    {
      sign: 'Gets stuck in a dead end and gives up',
      meaning: <>Dead ends are part of it. Rub out back to the last choice and try the other way.</>,
    },
    {
      sign: 'Works backwards from the finish',
      meaning: <>A clever trick, not cheating. Mazes are often easier that way.</>,
    },
  ],
  beyondThePage: [
    'Build a maze of cushions and chairs for a toy to get through.',
    'Draw a maze for you to solve: start with three walls.',
  ],

  atSchool: (
    <>
      Mazes build the fine motor control that the Reception Early Learning Goal for
      physical development covers, ready for handwriting.
    </>
  ),
};

export default docs;
