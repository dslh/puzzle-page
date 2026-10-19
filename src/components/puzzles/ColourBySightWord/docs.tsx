import type { PuzzleDoc } from '../../../types/puzzleDoc';
import type { ColourBySightWordConfig } from './index';

const docs: PuzzleDoc<ColourBySightWordConfig> = {
  summary: (
    <>
      A grid of squares, each with a short word in it. A key says which colour goes
      with each word. Colour every square and a picture appears.
    </>
  ),

  ages: (
    <>
      4–7, once they know a few common words. Start with <em>2</em> colours.
    </>
  ),
  time: <>10–15 minutes</>,
  needs: <>Coloured pencils or crayons in the colours the key names</>,
  reading: (
    <>
      Yes: that’s the point. Read the colour names in the key with them; the page prints
      in black and white.
    </>
  ),

  example: { seed: 2 },

  howItWorks: (
    <>
      <p>
        The words are common words like “the”, “said” and “was”, from the Dolch lists.
        Most can’t be sounded out or drawn, so the child has to read them. There are 8
        pictures: a house, fish, boat, star, tree, cat, flower and heart.
      </p>
      <p>
        The background takes a word too, so every square gets coloured. Words that
        look alike, like “was” and “saw” or “the” and “she”, are kept off the same sheet.
        A colour word, like “blue”, is always coloured that colour.
      </p>
    </>
  ),

  sayAloud: [
    'Read the word in this square. Find it in the key. What colour is it?',
    'Colour all the squares with that word. What do you think the picture is?',
  ],

  skills: [
    'Reading common words on sight',
    'Using a key',
    'Colouring inside a line',
  ],
  whyItMatters: (
    <p>
      Words like “the” and “said” turn up in every book, and many don’t follow the
      phonics rules. Reading them dozens of times in one sheet helps them stick.
    </p>
  ),

  settings: {
    colourCount: {
      label: 'Colours',
      description: <p>How many words and colours, one of them for the background.</p>,
      options: [
        {
          label: '2',
          description: <p>Background and one shape: a plain outline picture. Easiest.</p>,
          example: { config: { colourCount: 2 } },
        },
        {
          label: '3',
          description: <p>Adds a second part, such as a roof. Default.</p>,
          example: { config: { colourCount: 3 } },
        },
        {
          label: '4',
          description: <p>Adds small details, such as windows. Hardest.</p>,
          example: { config: { colourCount: 4 } },
        },
      ],
    },
    letterCase: {
      label: 'Case',
      description: <p>Lower or upper case words. “I” is always a capital.</p>,
      options: [
        { label: 'abc', description: <p>Lower case, as in books. Default.</p> },
        {
          label: 'ABC',
          description: <p>Capitals.</p>,
          example: { config: { letterCase: 'upper' } },
        },
      ],
    },
    customWordsText: {
      label: 'Words',
      description: (
        <p>
          Type words, e.g. this week’s tricky words, and they are used first. Look-alike
          words you type are kept in. A narrow puzzle quietly leaves out long words.
        </p>
      ),
      options: [
        {
          label: 'the, said, was',
          description: <p>Three tricky words from Reception.</p>,
          example: { config: { customWordsText: 'the, said, was' } },
        },
      ],
    },
  },
  size: (
    <p>
      The picture is always 6–9 squares a side, so size only changes how big the
      squares are. Bigger squares are easier to colour. Narrow puzzles use shorter
      words: at 4 wide, 3–4 letters.
    </p>
  ),

  easier: [
    '2 colours.',
    'Read the key words together first.',
    'Colour one word at a time, all over the sheet.',
  ],
  harder: [
    '4 colours.',
    'Type in this week’s words.',
    'Ask them to guess the picture halfway.',
  ],
  mistakes: [
    {
      sign: 'A whole part comes out the wrong colour',
      meaning: <>One misread word. Normal. Read that word with them and patch over it.</>,
    },
    {
      sign: 'Colours by guessing the picture',
      meaning: <>A good sign they spot the shape. Still ask them to read each square.</>,
    },
  ],
  beyondThePage: [
    'Write the words on cards and hide them round the room to find and read.',
    'Spot the words in a bedtime story.',
  ],

  atSchool: (
    <>
      Reception and Year 1 teach “tricky” or common exception words to read on sight.
      The Dolch words are an American list, so type in the one they bring home.
    </>
  ),
};

export default docs;
