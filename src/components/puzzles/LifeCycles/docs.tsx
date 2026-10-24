import type { PuzzleDoc } from '../../../types/puzzleDoc';
import type { LifeCyclesConfig } from './index';

const docs: PuzzleDoc<LifeCyclesConfig> = {
  summary: (
    <>
      How a living thing grows and changes, in pictures. Number the jumbled stages in
      order, or draw the stage missing from a circle.
    </>
  ),

  ages: (
    <>
      4–7. Start with <em>Number</em> and the first one shown. <em>Missing</em> and a
      blank first box suit 6–7.
    </>
  ),
  time: <>3–8 minutes</>,
  needs: <>A pencil, and coloured pencils for Missing</>,
  reading: <>None. Name the pictures for them.</>,

  example: { seed: 47 },

  howItWorks: (
    <>
      <p>
        Each row is one life cycle with its stages jumbled. They write 1 under the
        first stage, 2 under the next, and so on. Chicken, frog, butterfly, ladybird,
        sunflower, apple tree and people. The frog has five stages; the rest have four.
      </p>
      <p>
        A jumble is never already in order, even read from the middle. So
        “tadpole, froglet, frog, frogspawn” never comes up.
      </p>
    </>
  ),

  sayAloud: [
    'This is how a frog grows. Which picture comes first? Write 1 under it.',
    'What happens next? Find it and write 2.',
    'One picture is missing from the circle. What goes there? Draw it.',
  ],

  skills: [
    'How living things grow',
    'Putting things in order',
    'New words: tadpole, chrysalis, seedling',
    'Writing numbers 1 to 5',
  ],
  whyItMatters: (
    <p>
      Children see babies and grown-ups, but not often the stages between. Seeing
      that a caterpillar becomes a butterfly, or a seed a sunflower, starts them
      noticing how nature changes over time. Ordering is the same thinking as telling
      a story in order.
    </p>
  ),

  settings: {
    task: {
      label: 'Task',
      description: <p>What the child does.</p>,
      options: [
        {
          label: 'Number',
          description: (
            <p>
              Stages jumbled in a row with a box under each to number. Each row is two
              grid squares tall, so a taller puzzle shows more cycles.
            </p>
          ),
          example: { config: { task: 'number' }, width: 8, height: 2 },
        },
        {
          label: 'Missing',
          description: (
            <p>
              The cycle goes round a circle, joined by arrows, with one stage left as
              a dashed ring to draw. Any stage can be the missing one. Each circle
              needs a square, so a wide puzzle fits more.
            </p>
          ),
          example: { config: { task: 'missing' }, width: 4, height: 4 },
        },
      ],
    },
    cycle: {
      label: 'Cycle',
      description: (
        <p>
          Which life cycle. Picking one shows just that cycle, drawn as big as the
          puzzle allows.
        </p>
      ),
      options: [
        { label: 'Mixed', description: <p>A different cycle in every row or circle.</p> },
        { label: 'Chicken', description: <p>Egg, chick hatching, chick, hen.</p> },
        {
          label: 'Frog',
          description: <p>Frogspawn, tadpole, tadpole with legs, froglet (still a tail), frog.</p>,
          example: { config: { task: 'number', cycle: 'frog' }, width: 8, height: 2 },
        },
        {
          label: 'Butterfly',
          description: <p>Eggs on a leaf, caterpillar, chrysalis, butterfly.</p>,
          example: { config: { task: 'number', cycle: 'butterfly' }, width: 8, height: 2 },
        },
        {
          label: 'Ladybird',
          description: (
            <p>
              Eggs, larva, pupa, ladybird. The larva looks nothing like a ladybird,
              which surprises most grown-ups too.
            </p>
          ),
          example: { config: { task: 'number', cycle: 'ladybird' }, width: 8, height: 2 },
        },
        {
          label: 'Sunflower',
          description: <p>Seeds, seedling, young plant in bud, sunflower.</p>,
          example: { config: { task: 'number', cycle: 'sunflower' }, width: 8, height: 2 },
        },
        { label: 'Apple tree', description: <p>Seedling, tree, blossom, apple. The apple holds the seeds.</p> },
        { label: 'People', description: <p>Baby, girl, woman, grandma.</p> },
      ],
    },
    firstShown: {
      label: 'First',
      description: <p>Whether the first stage comes numbered. Number task only.</p>,
      options: [
        { label: 'Shown', description: <p>The first stage has a 1 in its box, so they know where to start.</p> },
        {
          label: 'Blank',
          description: (
            <p>
              They choose where to start. A cycle goes round, so starting at the frog
              and going on to the frogspawn is right too.
            </p>
          ),
        },
      ],
    },
  },
  size: (
    <p>
      In Number, the height sets how many cycles (one per two squares) and the width
      how big the pictures are. In Missing, each circle takes a square.
    </p>
  ),

  easier: [
    'Keep the first one shown.',
    'Pick one cycle you have talked about, or seen in a book.',
    'Do it out loud first, pointing, before writing anything.',
  ],
  harder: [
    'Use Missing, and ask them to name the stage they drew.',
    'Leave the first box blank.',
    'Ask what happens after the last picture. Where does the cycle go next?',
  ],
  mistakes: [
    {
      sign: 'Orders by size, smallest first',
      meaning: <>Normal, and it often works. But the pictures are all drawn the same size, so it can’t always. Ask “what does this one turn into?”</>,
    },
    {
      sign: 'Swaps the tadpole with legs and the froglet',
      meaning: <>Normal; they look alike. Look at the tail together: it gets shorter as the legs grow.</>,
    },
    {
      sign: 'Puts the butterfly before the chrysalis',
      meaning: <>Normal. The chrysalis is the surprising bit. Tell them the caterpillar goes inside and comes out a butterfly.</>,
    },
    {
      sign: 'Starts with the hen, not the egg',
      meaning: <>Fine if the rest goes round in order: hen, egg, chick. Praise it, then show where we usually start.</>,
    },
  ],
  beyondThePage: [
    'Grow a bean or sunflower seed in a jar and draw it each week.',
    'Look for frogspawn in a pond in spring, and tadpoles a few weeks later.',
    'Look at their baby photos. What could they do then that they can do now?',
  ],

  atSchool: (
    <>
      Reception explores change in the natural world, often with tadpoles or
      caterpillars in class. Year 2 learns that animals have young that grow into
      adults, and that seeds grow into plants. Naming the stages of insects and
      amphibians in detail comes in Year 5.
    </>
  ),
};

export default docs;
