import type { PuzzleDoc } from '../../../types/puzzleDoc';
import type { WhoGoesWhereConfig } from './index';

const docs: PuzzleDoc<WhoGoesWhereConfig> = {
  summary: (
    <>
      A few animals each live in one of the houses. The clues say where. Work out who goes
      where, and draw a line from each animal to its house.
    </>
  ),

  ages: (
    <>
      4–7. At 4–5 it starts on Easy with 3 houses, and you read the clues with them. At 6–7
      it starts on Medium with 4 houses.
    </>
  ),
  time: <>3–8 minutes</>,
  needs: <>A pencil</>,
  reading: <>None with picture clues. Words clues are short sentences for a reader.</>,

  example: { seed: 7 },

  howItWorks: (
    <>
      <p>
        Each clue is a small house with an animal in it. A plain one means the animal lives
        there. A crossed-out one means it does not. On Hard, two plain houses side by side
        mean those two are next door, in that order.
      </p>
      <p>
        The houses are numbered and coloured, so a clue’s little house can be found in the
        row. The clues are chosen so there is exactly one answer, every clue is needed, and
        it can be reached one step at a time: a clue places an animal, rules a house out,
        or leaves only one house for the last animal.
      </p>
      <p>
        The animals are lined up above the houses. They can draw a line from each to its
        house, draw the animal in the doorway, or put a sticker there.
      </p>
    </>
  ),

  sayAloud: [
    'This clue says the dog lives in the red house. Can you find the red house? Draw a line from the dog to it.',
    'This one has a cross. The cat does NOT live in the blue house. So which houses could the cat be in?',
    'Only one house is left. Who must live there?',
    'Hard: these two are next door. The dog is on the left and the fox is on the right. Where could they fit?',
  ],

  skills: [
    'Working things out from clues',
    'Ruling things out',
    'Holding two facts at once',
    'Checking an answer against every clue',
  ],
  whyItMatters: (
    <p>
      This is the first puzzle on the page that asks them to reason rather than look. “If not
      here, then there” and “only one is left” are the moves behind every later logic puzzle
      and a lot of maths. The crossed-out clue is the hard part. “Not” is a late idea, and
      it is normal for a four-year-old to put the cat in the crossed-out house.
    </p>
  ),

  settings: {
    level: {
      label: 'Level',
      description: <p>What kinds of clue are used.</p>,
      options: [
        {
          label: 'Easy',
          description: (
            <p>
              Clues mostly say where an animal lives, with at most one crossed-out clue. The
              last animal takes the last house.
            </p>
          ),
          example: { config: { level: 'easy' }, height: 3 },
        },
        {
          label: 'Medium',
          description: (
            <p>
              Clues mostly say where an animal does not live, so every answer is reached by
              ruling houses out. Usually one more clue than Easy.
            </p>
          ),
          example: { config: { level: 'medium' }, height: 3 },
        },
        {
          label: 'Hard',
          description: (
            <p>
              Adds a next-door clue, which only helps once they know where one of the two
              animals is. Some puzzles need them to notice a house only one animal could be
              in.
            </p>
          ),
          example: { config: { level: 'hard' }, height: 3 },
        },
      ],
    },
    houses: {
      label: 'Houses',
      description: <p>How many animals and houses. More houses means more clues to hold at once.</p>,
      options: [
        { label: '3', description: <p>Two or three clues. Start here.</p> },
        {
          label: '4',
          description: <p>Three or four clues. The default at 6–7.</p>,
          example: { config: { houses: 4 }, height: 3 },
        },
      ],
    },
    clues: {
      label: 'Clues',
      description: <p>Whether the clues are little pictures or sentences.</p>,
      options: [
        { label: 'Pictures', description: <p>Small houses with animals in them. No reading.</p> },
        {
          label: 'Words',
          description: (
            <p>
              Short sentences, like “The dog does not live in the red house.” For a reader,
              or for you to read aloud without the picture code.
            </p>
          ),
          example: { config: { clues: 'words' }, height: 3 },
        },
      ],
    },
  },
  size: (
    <p>
      Width sets how big the houses are, up to 4 cm. Height adds room between the animals
      and the houses for drawing lines. Below 4 cells tall the houses shrink.
    </p>
  ),

  easier: [
    'Easy with 3 houses, and read each clue aloud as they get to it.',
    'Cover the clues with your hand and show one at a time.',
    'Cross out a house on the page as soon as a clue rules it out.',
  ],
  harder: [
    'Medium, then Hard, then 4 houses.',
    'Words clues once they can read them.',
    'Ask them to check every clue against their answer at the end.',
  ],
  mistakes: [
    {
      sign: 'Puts the animal in the crossed-out house',
      meaning: (
        <>
          Normal at 4. The cross means “not here”. Say it aloud and ask which houses are
          left.
        </>
      ),
    },
    {
      sign: 'Guesses where a clue only rules one house out',
      meaning: (
        <>
          Common. Ask them to leave that animal for now and look at the next clue. The
          answer comes when the other houses fill up.
        </>
      ),
    },
    {
      sign: 'Stuck on the next-door clue',
      meaning: (
        <>
          It is the hard one. Ask which pairs of houses the two could fit in, then which
          pair the other clues allow.
        </>
      ),
    },
    {
      sign: 'Two animals in one house',
      meaning: <>They forgot that each house has one animal. Say so, and ask which one has to move.</>,
    },
  ],
  beyondThePage: [
    'Hide a toy under one of three cups and give clues: “It’s not under the red one.”',
    'Line up three teddies and ask them to sit them in the right order from clues.',
    'Guess Who, or a home-made version with family photos.',
  ],

  atSchool: (
    <>
      Reasoning from clues is not taught as such in Reception, though sorting and “not”
      come up in maths talk. In Key Stage 1 it appears as problem solving and reasoning in
      maths.
    </>
  ),
};

export default docs;
