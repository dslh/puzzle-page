import type { PuzzleDoc } from '../../../types/puzzleDoc';

const docs: PuzzleDoc = {
  summary: (
    <>
      A torch shines into a box of mirrors. Each mirror bounces the light to one side.
      Follow it from mirror to mirror and circle the animal or thing it finds.
    </>
  ),

  ages: <>5–7. Four-year-olds can do it if you show the first bounce.</>,
  time: <>5–10 minutes</>,
  needs: <>A pencil. A ruler helps.</>,
  reading: <>None. You explain it.</>,

  example: { seed: 3 },

  howItWorks: (
    <>
      <p>
        The light enters through the gap at the top and goes straight until it meets a
        mirror. A mirror turns it a quarter turn, which way depending on the slant. It
        always leaves through an opening on one side, beside the answer. Every puzzle
        has at least five bounces, so guessing doesn’t work.
      </p>
      <p>
        A dot marks a square with no mirror: the light goes straight over it. Both
        sides of a mirror bounce, so the light can come back to a mirror, or cross its
        own path.
      </p>
    </>
  ),

  sayAloud: [
    'Light goes in a straight line until it hits a mirror, then it bounces.',
    'Put your finger on the torch and follow the light. What does it shine on? Circle it.',
  ],

  skills: [
    'Following a line with the eyes',
    'Applying one rule over and over',
    'Left and right, quarter turns',
    'Keeping your place',
  ],
  whyItMatters: (
    <p>
      A simple rule applied carefully many times without losing your place: the same
      attention that later carries a child through a multi-step sum. It’s also a playful
      first look at reflection.
    </p>
  ),

  settings: {},
  size: (
    <p>
      The box of mirrors is one square smaller than the puzzle’s shorter side: 4×4
      gives 3×3 mirrors (easiest), 5×5 gives 4×4, 7×7 or more gives 6×6 (hardest).
      Making it bigger than 7×7 only enlarges the squares.
    </p>
  ),

  easier: [
    'Shrink it to 4×4.',
    'Do the first bounce together, out loud.',
    'Lay a ruler along each straight stretch.',
  ],
  harder: [
    'Make it 7×7.',
    'Guess the answer first, then check.',
    'Eyes only, no finger, then check with a pencil.',
  ],
  mistakes: [
    {
      sign: 'Turns the wrong way at a mirror',
      meaning: (
        <>
          Ask which way the beam is <em>travelling</em>, then picture a ball bouncing
          off the slant. It never goes back the way it came.
        </>
      ),
    },
    {
      sign: 'Drifts into the next column',
      meaning: <>Normal on a long straight run. Count the squares, dots and mirrors, or lay a ruler along it.</>,
    },
    {
      sign: 'Circles the nearest picture to where they got lost',
      meaning: <>Drawing the line as they go lets them pick up where it stopped.</>,
    },
  ],
  beyondThePage: [
    'In a dark room, bounce a torch off a hand mirror onto a teddy.',
    'Roll a ball at a wall at a slant and watch which way it comes off.',
  ],

  atSchool: (
    <>
      Quarter turns are Year 1–2 maths (“position and direction”); light reflecting is
      Year 3 science.
    </>
  ),
};

export default docs;
