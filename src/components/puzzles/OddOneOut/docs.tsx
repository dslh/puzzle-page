import type { PuzzleDoc } from '../../../types/puzzleDoc';
import type { OddOneOutConfig } from './index';

const docs: PuzzleDoc<OddOneOutConfig> = {
  summary: (
    <>
      A grid of pictures to search. In Odd one out, every picture has a twin except one:
      circle the one on its own. In Pair, every picture is different except two: circle
      the two that are the same.
    </>
  ),

  ages: (
    <>
      2–7. At 2–3 it starts at 3×3: nine pictures. Point to each one together and ask
      “is there another one like this?”
    </>
  ),
  time: <>2–10 minutes, depending on size</>,
  needs: <>A pencil. Coloured pencils help on bigger grids.</>,
  reading: <>None</>,

  example: { seed: 8 },

  howItWorks: (
    <>
      <p>
        Each puzzle takes one theme, such as animals, faces, fruit or vehicles. The
        pictures are shuffled and nudged off-centre a little so the grid doesn’t line up
        neatly.
      </p>
      <p>
        The two modes ask for opposite things. Odd one out is mostly pairs with one picture
        left over. Pair is mostly different pictures with one matching pair hidden among
        them.
      </p>
      <p>
        Some themes are harder than others. Faces and space (with its moon shapes) have
        many pictures that look alike, especially printed in black and white.
      </p>
    </>
  ),

  sayAloud: [
    'Odd one out: every picture has a twin, except one. Can you find the one on its own?',
    'Odd one out: find this one’s twin. Join them with a line, then find the next pair.',
    'Pair: all the pictures are different, but two are the same. Can you find them?',
    'Pair: look at this one. Is there another one like it? No? Cross it off and try the next.',
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
    mode: {
      label: 'Find',
      description: <p>What they are looking for. Both use the same grids and themes.</p>,
      options: [
        {
          label: 'Odd one out',
          description: <p>Every picture has a twin, except one. Find the one on its own.</p>,
          example: { config: { mode: 'odd', size: 3 } },
        },
        {
          label: 'Pair',
          description: (
            <p>
              Every picture is different, except two. Find the matching pair. Ticking off
              pairs doesn’t help here, so it needs a different way of searching.
            </p>
          ),
          example: { config: { mode: 'pair', size: 3 } },
        },
      ],
    },
    size: {
      label: 'Grid',
      description: <p>How many pictures. The puzzle takes the same space on the page.</p>,
      options: [
        {
          label: '3×3',
          description: <p>Nine pictures. Big and quick. Good for toddlers.</p>,
          example: { config: { size: 3 } },
        },
        {
          label: '5×5',
          description: <p>25 pictures. Default.</p>,
          example: { config: { size: 5 } },
        },
        {
          label: '7×7',
          description: (
            <p>
              49 small pictures. Needs patience and a system. In Pair, only the bigger themes
              have enough pictures: animals, faces, food, vehicles, sport and nature.
            </p>
          ),
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
      sign: 'Odd one out: circles one that does have a twin',
      meaning: <>Common in a busy grid. They missed its twin. Ask them to look for one more like it.</>,
    },
    {
      sign: 'Mixes up two pictures that look alike',
      meaning: <>Normal, especially with faces. Ask what’s different: the eyes? the mouth?</>,
    },
    {
      sign: 'Pair: circles two that only look alike',
      meaning: <>A fair guess with lookalike themes. Put them side by side and ask what’s different.</>,
    },
    {
      sign: 'Searches everywhere at once and gives up',
      meaning: <>Normal on a big grid. Show them how to go one picture at a time, crossing each off when it’s done.</>,
    },
  ],
  beyondThePage: [
    'Pairs (pelmanism) with a pack of cards or picture cards.',
    'Sort a pile of socks into pairs. Is there one left over?',
    'Lay out some toys with two the same. Can they spot the two?',
  ],
};

export default docs;
