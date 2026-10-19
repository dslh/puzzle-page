import type { PuzzleDoc } from '../../../types/puzzleDoc';
import type { PuzzleMazeConfig } from './index';

const docs: PuzzleDoc<PuzzleMazeConfig> = {
  summary: (
    <>
      A grid of pictures, where each picture means a direction. Start at the top-left
      square and follow the pictures, one square at a time, to the way out.
    </>
  ),

  ages: <>4–7. Four-year-olds can do it if you read the key with them.</>,
  time: <>5–10 minutes</>,
  needs: <>A pencil</>,
  reading: <>None. Explain the key at the top.</>,

  example: { seed: 20 },

  howItWorks: (
    <>
      <p>
        The key at the top shows four pictures, each with an arrow: up, down, left or
        right. Go in at the arrow above the top-left square. Look at the picture you’re
        on, move one square that way, and repeat until a picture points out of the
        bottom-right corner.
      </p>
      <p>
        Every square points somewhere, so there are no dead ends. A slip doesn’t get
        them stuck; it takes them a different way to the same exit.
      </p>
    </>
  ),

  sayAloud: [
    'Each picture tells you which way to go. Look at the top to find out which way.',
    'Start here. What picture is it? Which way does it say? Move one square and draw a line.',
  ],

  skills: [
    'Up, down, left and right',
    'Using a key',
    'Following steps in order',
    'Keeping your place',
  ],
  whyItMatters: (
    <p>
      Each square is one instruction carried out in order, like a tiny program. Looking
      things up in a key is a step towards reading charts and maps.
    </p>
  ),

  settings: {
    emojiMode: {
      label: 'Pictures',
      description: <p>What the four direction pictures are.</p>,
      options: [
        {
          label: 'Circles',
          description: (
            <p>
              Four coloured circles. Easy to tell apart, but only on a colour printer: in
              black and white they look alike.
            </p>
          ),
          example: { config: { emojiMode: 'circles' } },
        },
        {
          label: 'Random',
          description: (
            <p>
              Four pictures from one set, such as animals or fruit. Some sets, like
              flowers or bugs, can look alike: reroll if so. Default.
            </p>
          ),
          example: { config: { emojiMode: 'random' } },
        },
      ],
    },
  },
  size: (
    <p>
      The squares stay small (half a page square), so a bigger puzzle means more of
      them and a longer route. The default 4×4 gives 8×7 squares; the largest, 8×10,
      gives 16×19. Minimum 3×3.
    </p>
  ),

  easier: [
    'Shrink it to 3×3.',
    'Draw a small arrow in each square you visit.',
    'Cut out the key and lay it beside their finger.',
  ],
  harder: [
    'Make it bigger.',
    'Fold the key away once they’ve learned it.',
    'Pick a square in the middle: where does it lead out?',
  ],
  mistakes: [
    {
      sign: 'Mixes up two pictures',
      meaning: <>Normal, and they still reach the exit, just by another way. Check the key together.</>,
    },
    {
      sign: 'Moves more than one square',
      meaning: <>Each picture is one step. A finger on each square helps.</>,
    },
    {
      sign: 'Left and right swapped',
      meaning: <>Normal to about seven. A mark on the left hand helps.</>,
    },
  ],
  beyondThePage: [
    'Make a key with toys (a teddy means step left) and direct each other round the room.',
    'Lay paper squares on the floor with arrows on and walk the route.',
  ],

  atSchool: (
    <>
      Position and direction are Year 1–2 maths; following a sequence of instructions
      is Key Stage 1 computing.
    </>
  ),
};

export default docs;
