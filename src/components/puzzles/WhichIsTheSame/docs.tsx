import type { PuzzleDoc } from '../../../types/puzzleDoc';
import type { WhichIsTheSameConfig } from './index';

const docs: PuzzleDoc<WhichIsTheSameConfig> = {
  summary: (
    <>
      Each row starts with a picture in a box. Find the one in the row that is exactly the
      same, and circle it.
    </>
  ),

  ages: (
    <>
      2–7. At 2–3 it starts on Easy with 3 choices. Pointing, or a dab with a dot marker or
      sticker, counts as much as a circle.
    </>
  ),
  time: <>2–5 minutes</>,
  needs: <>A pencil, crayon or dot marker</>,
  reading: <>None</>,

  example: { seed: 8 },

  howItWorks: (
    <>
      <p>
        Only one picture in each row matches the boxed one. The Level setting decides how
        close the wrong ones are. They might be other kinds of thing, the same kind of thing,
        or near-twins like 😀 and 😃.
      </p>
      <p>
        Flipped adds the same picture facing the other way, so they have to check which way
        it faces. The boxed picture is sometimes flipped too, so the answer isn’t always
        the “normal” one.
      </p>
      <p>Wider puzzles have bigger pictures. Taller puzzles have more rows.</p>
    </>
  ),

  sayAloud: [
    'Look at the picture in the box. Can you find one just like it?',
    'Is it the same? Look again. What’s different?',
    'Flipped: find the one facing the same way. Which way is the nose pointing?',
  ],

  skills: [
    'Looking carefully',
    'Spotting same and different',
    'Noticing which way something faces',
  ],
  whyItMatters: (
    <p>
      Seeing small differences is the close looking that later helps them tell letters apart.
      Flipped goes further. Young children see a dog facing left as the same dog, and that’s
      normal. Reading is the first time it matters, for letters like “b” and “d”.
    </p>
  ),

  settings: {
    difficulty: {
      label: 'Level',
      description: <p>How close the wrong pictures are to the boxed one.</p>,
      options: [
        {
          label: 'Easy',
          description: <p>The wrong pictures are other kinds of thing, like a car among fruit.</p>,
          example: { config: { difficulty: 'easy', flipped: false }, height: 2 },
        },
        {
          label: 'Medium',
          description: <p>The wrong pictures are the same kind of thing, such as all animals.</p>,
          example: { config: { difficulty: 'medium', flipped: false }, height: 2 },
        },
        {
          label: 'Hard',
          description: (
            <p>
              The wrong pictures nearly match: smiley faces, moons, clocks. Some differ only
              in colour (red and green apples), so print in colour.
            </p>
          ),
          example: { config: { difficulty: 'hard', flipped: false }, height: 2 },
        },
        {
          label: 'Mixed',
          description: <p>Easy rows at the top, Hard at the bottom.</p>,
        },
      ],
    },
    choices: {
      label: 'Choices',
      description: <p>How many pictures to pick from in each row. More choices means smaller pictures.</p>,
      options: [
        { label: '3', description: <p>Big pictures. Best at 2–3.</p> },
        { label: '4', description: <p>The default.</p> },
        { label: '5', description: <p>More to check before they pick.</p> },
      ],
    },
    flipped: {
      label: 'Flipped',
      description: (
        <p>
          Adds the boxed picture facing the other way. From 4 choices it also adds it upside
          down. Only pictures that clearly face one way are used. It starts on at 6–7. Leave
          it off at 2–3.
        </p>
      ),
      options: [
        { label: 'Off', description: <p>Only the matching picture is the same picture.</p> },
        {
          label: 'On',
          description: <p>The answer is the one facing the same way.</p>,
          example: { config: { flipped: true }, height: 2 },
        },
      ],
    },
  },
  size: (
    <p>
      Width sets how big the pictures are. Height sets how many rows: a 6×6 puzzle with 4
      choices has 5 rows.
    </p>
  ),

  easier: [
    'Easy, with 3 choices.',
    'Fewer rows: make it shorter.',
    'Name the boxed picture together first.',
  ],
  harder: [
    'Hard, or Flipped on.',
    '5 choices.',
    'Ask them to say what’s different about each wrong one.',
  ],
  mistakes: [
    {
      sign: 'Circles one that is the same kind of thing',
      meaning: <>Normal. “Dog” matched “dog”. Point to each in turn and ask “is it just the same?”</>,
    },
    {
      sign: 'Circles the first picture that’s close',
      meaning: <>Common. Ask them to check every picture before they choose.</>,
    },
    {
      sign: 'Flipped: picks the one facing the wrong way',
      meaning: <>Normal until about 6. Ask which way the nose or the front is pointing.</>,
    },
    {
      sign: 'Hard: mixes up two faces',
      meaning: <>The differences are small. Ask them to look at just the eyes, then just the mouth.</>,
    },
  ],
  beyondThePage: [
    'Hold up a toy and ask them to find one just like it in the toy box.',
    'Snap with picture cards.',
    'Find the matching sock in the washing.',
  ],

  atSchool: (
    <>
      Looking closely and talking about same and different comes before telling letters
      apart in Reception phonics. Spotting “b” and “d” is a Key Stage 1 job.
    </>
  ),
};

export default docs;
