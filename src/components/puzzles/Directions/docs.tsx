import type { PuzzleDoc } from '../../../types/puzzleDoc';
import type { DirectionsConfig } from './index';

const docs: PuzzleDoc<DirectionsConfig> = {
  summary: (
    <>
      A treasure island in squares, with a ship at the edge. Follow a list of steps to
      find the treasure, write the steps yourself, or spot the one wrong step.
    </>
  ),

  ages: (
    <>
      4–7. Start with <em>Follow</em>, arrows and a short route. <em>Write</em> and{' '}
      <em>Fix</em> suit 6–7.
    </>
  ),
  time: <>5–10 minutes</>,
  needs: <>A pencil</>,
  reading: (
    <>
      Read the one-line prompt to them. With the words setting they also need “up”,
      “down”, “left”, “right”.
    </>
  ),

  example: { seed: 11 },

  howItWorks: (
    <>
      <p>
        Routes start at the ship and head inland. Only blank sand can be walked on;
        sea, trees, mountains and landmarks are all in the way. A route is a few
        straight lines of up to three squares, each turning a corner, never crossing
        itself.
      </p>
      <p>
        Directions mean up, down, left and right <strong>on the page</strong>, not
        turns made by someone walking the route.
      </p>
    </>
  ),

  sayAloud: [
    'Start at the ship. Each arrow means move one square that way.',
    'Finger on the ship. Do the first arrow. Where are you now? Keep going, then draw an X where you finish.',
  ],

  skills: [
    'Up, down, left and right',
    'Counting squares',
    'Following steps in order',
    'Early coding',
  ],
  whyItMatters: (
    <p>
      Each step is one instruction carried out in order, which is what coding is. The
      three tasks build up: follow the instructions, then write your own, then find the
      bug.
    </p>
  ),

  settings: {
    mode: {
      label: 'Task',
      description: <p>What the child does with the map.</p>,
      options: [
        {
          label: 'Follow',
          description: (
            <p>
              The steps are printed, the treasure hidden: follow and mark an X. Landmarks
              sit where the usual slips end, so a wrong answer lands somewhere you can
              name: “You’re at the hut. Let’s check the second arrow.”
            </p>
          ),
          example: { config: { mode: 'follow' } },
        },
        {
          label: 'Write',
          description: (
            <p>
              Ship and chest are both shown, with empty boxes below. The child writes
              the route, one step per box. There are as many boxes as the shortest route
              needs, and the terrain rules out anything shorter. Any shortest route
              counts.
            </p>
          ),
          example: { config: { mode: 'write' } },
        },
        {
          label: 'Fix',
          description: (
            <p>
              The steps are shown but one is wrong: circle it. Exactly one step can be
              changed to reach the chest, so there’s one answer. Ask what it should have
              been.
            </p>
          ),
          example: { config: { mode: 'fix' } },
        },
      ],
    },
    notation: {
      label: 'Steps',
      description: <p>How the steps are written. Examples shown in Follow mode.</p>,
      options: [
        {
          label: '➡️ ➡️',
          description: <p>One arrow per square. No counting, so the easiest.</p>,
          example: { config: { notation: 'arrows', mode: 'follow' } },
        },
        {
          label: '2 ➡️',
          description: <p>A number and an arrow per straight line. The child counts squares.</p>,
          example: { config: { notation: 'counts', mode: 'follow' } },
        },
        {
          label: '2 right',
          description: <p>The same in words. Reading practice too.</p>,
          example: { config: { notation: 'words', mode: 'follow' } },
        },
      ],
    },
    length: {
      label: 'Length',
      description: (
        <p>
          How many straight lines the route has (in Write mode, the answer’s). If the
          puzzle is too small for it, a shorter route is used quietly: make the puzzle
          bigger.
        </p>
      ),
      options: [
        { label: 'Short', description: <p>Two lines, one turn.</p> },
        { label: 'Medium', description: <p>Three lines. Default.</p> },
        { label: 'Long', description: <p>Five lines. Default for 6–7.</p> },
      ],
    },
    spareBoxes: {
      label: 'Boxes (Write only)',
      description: <p>Shown in the config bar only in Write mode.</p>,
      options: [
        {
          label: 'Exact',
          description: <p>Just enough boxes for the shortest route, which gives its length away.</p>,
        },
        {
          label: 'Spare',
          description: (
            <p>
              A few extra boxes, so the count is no clue. Leaving some empty is fine, and
              so is a slightly longer route that gets there.
            </p>
          ),
        },
      ],
    },
  },
  size: (
    <p>
      Squares stay 12–17 mm, so a bigger puzzle gives a bigger island with more in the
      way, not bigger squares. Width also sets how many steps fit under the map; words
      need the most room. Minimum 4×4.
    </p>
  ),

  easier: [
    'Follow, ➡️ ➡️ arrows, Short.',
    'Tick each arrow once it’s done.',
    'Move a coin along the squares instead of a finger.',
  ],
  harder: [
    'Counted steps or words, then Long.',
    'Write, then Fix.',
    'In Write, choose Spare boxes.',
  ],
  mistakes: [
    {
      sign: 'Ends one square short',
      meaning: <>They counted the starting square as a step. Count the hops, not the squares.</>,
    },
    {
      sign: 'Lands on a landmark',
      meaning: <>By design. Name it, then retrace the steps together to find the slip.</>,
    },
    {
      sign: 'Left and right swapped',
      meaning: <>Normal to about seven. It’s left and right on the paper; a mark on the left hand helps.</>,
    },
  ],
  beyondThePage: [
    'Be a robot: the child directs you across the kitchen to a hidden toy, then swap.',
    'Chalk a grid on the pavement and play it standing up.',
  ],

  atSchool: (
    <>
      Position and direction are Year 1–2 maths; writing and debugging simple
      instructions is Key Stage 1 computing (often done with Bee-Bot floor robots).
    </>
  ),
};

export default docs;
