import type { PuzzleDoc } from '../../../types/puzzleDoc';

const docs: PuzzleDoc = {
  summary: (
    <>
      Rows of five pictures. Four go together and one doesn’t. Find the one that doesn’t
      belong, cross it out, and say why.
    </>
  ),

  ages: (
    <>
      2–6. At 2–3, do one row together: you name the pictures, they point. From four,
      they can cross it out and tell you why.
    </>
  ),
  time: <>1–2 minutes a row</>,
  needs: <>A pencil, or just a finger</>,
  reading: <>None</>,

  example: { seed: 9, height: 3 },

  howItWorks: (
    <>
      <p>
        Each row takes four pictures from one group, such as farm animals, fruit or
        vehicles, and one from a different group. The order is mixed up.
      </p>
      <p>
        There are 30 groups, and some sit close together: birds and farm animals, fruit
        and vegetables, weather and space. Now and then a row can be argued two ways. If
        their reason makes sense, it counts.
      </p>
      <p>The dots at the top are a reminder of the idea: four the same, one different.</p>
    </>
  ),

  sayAloud: [
    'Four of these go together. One is the odd one. Which one?',
    'Why doesn’t it go with the others?',
  ],

  skills: [
    'Sorting things into groups',
    'Naming things',
    'Explaining a choice',
    'Knowing about the world',
  ],
  whyItMatters: (
    <p>
      Spotting what things have in common is how children build ideas like “animal” or
      “food”. Saying why is the most useful part. It turns a guess into a reason.
    </p>
  ),

  settings: {},
  size: (
    <p>
      Each square of height adds a row, up to 14. Each row is a new set of pictures. The
      width is fixed.
    </p>
  ),

  easier: [
    'One or two rows.',
    'Name every picture together first.',
    'Tell them the group: “Four of these are things you eat.”',
  ],
  harder: [
    'Six rows or more.',
    'Ask them to name the group the four belong to.',
    'Ask for another thing that would fit with the four.',
  ],
  mistakes: [
    {
      sign: 'Picks one for its colour or shape',
      meaning: <>A fair reason at this age. Ask “is there a different way they go together?”</>,
    },
    {
      sign: 'Doesn’t know what a picture is',
      meaning: <>Common with small emoji. Name it for them; that’s not giving the answer away.</>,
    },
    {
      sign: 'Points to one but can’t say why',
      meaning: <>Normal for young ones. Give them the words: “Is it because it’s not an animal?”</>,
    },
  ],
  beyondThePage: [
    'Put three spoons and a sock on the table. What’s the odd one?',
    'Sort the shopping into food and not food.',
  ],
};

export default docs;
