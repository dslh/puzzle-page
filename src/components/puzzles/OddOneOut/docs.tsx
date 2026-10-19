import type { PuzzleDoc } from '../../../types/puzzleDoc';
import type { OddOneOutConfig } from './index';

const docs: PuzzleDoc<OddOneOutConfig> = {
  summary: (
    <>
      A grid of pictures where every picture has a twin, except one. Find the picture
      that has no match and circle it.
    </>
  ),

  ages: (
    <>
      2–7. At 2–3 it starts at 3×3: nine pictures. Point to each one together and ask
      “where’s the other one?”
    </>
  ),
  time: <>2–10 minutes, depending on size</>,
  needs: <>A pencil. Coloured pencils help on bigger grids.</>,
  reading: <>None</>,

  example: { seed: 8 },

  howItWorks: (
    <>
      <p>
        Each puzzle takes one theme, such as animals, faces, fruit or vehicles. Every
        picture appears twice, apart from one, and they are shuffled. The pictures are
        nudged off-centre a little so the grid doesn’t line up neatly.
      </p>
      <p>
        Some themes are harder than others. Faces and space (with its moon shapes) have
        many pictures that look alike, especially printed in black and white.
      </p>
    </>
  ),

  sayAloud: [
    'Every picture has a twin, except one. Can you find the one on its own?',
    'Find this one’s twin. Join them with a line, then find the next pair.',
  ],

  skills: [
    'Looking carefully',
    'Spotting same and different',
    'Working through a grid without losing your place',
  ],
  whyItMatters: (
    <p>
      Telling apart things that look nearly the same is the close looking that later helps
      with letters like “b” and “d”. Ticking off pairs one by one also teaches them to work in order
      rather than hunt at random.
    </p>
  ),

  settings: {
    size: {
      label: 'Grid',
      description: <p>How many pictures. The puzzle takes the same space on the page.</p>,
      options: [
        {
          label: '3×3',
          description: <p>Nine pictures, four pairs. Big and quick. Good for toddlers.</p>,
          example: { config: { size: 3 } },
        },
        {
          label: '5×5',
          description: <p>25 pictures, twelve pairs. Default.</p>,
          example: { config: { size: 5 } },
        },
        {
          label: '7×7',
          description: <p>49 small pictures, 24 pairs. Needs patience and a system.</p>,
          example: { config: { size: 7 } },
        },
      ],
    },
  },
  size: <p>The puzzle is a fixed 5×5 squares on the page. Use the Grid setting to change the difficulty.</p>,

  easier: [
    '3×3.',
    'Name each picture as you find its twin.',
    'Colour each pair the same colour as it’s found.',
  ],
  harder: [
    '7×7.',
    'Find it by looking only, no pencil, then check.',
    'Time them, then try to beat it on a new one.',
  ],
  mistakes: [
    {
      sign: 'Circles one that does have a twin',
      meaning: <>Common in a busy grid. They missed its twin. Ask them to look for one more like it.</>,
    },
    {
      sign: 'Mixes up two pictures that look alike',
      meaning: <>Normal, especially with faces. Ask what’s different: the eyes? the mouth?</>,
    },
    {
      sign: 'Searches everywhere at once and gives up',
      meaning: <>Show them how to go one picture at a time, crossing off each pair.</>,
    },
  ],
  beyondThePage: [
    'Pairs (pelmanism) with a pack of cards or picture cards.',
    'Sort a pile of socks into pairs. Is there one left over?',
  ],
};

export default docs;
