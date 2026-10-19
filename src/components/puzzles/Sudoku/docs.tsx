import type { PuzzleDoc } from '../../../types/puzzleDoc';
import type { SudokuConfig } from './index';

const docs: PuzzleDoc<SudokuConfig> = {
  summary: (
    <>
      A small grid with some squares filled in. Fill the empty ones so each colour, number
      or letter appears once in every row and once in every column.
    </>
  ),

  ages: <>4–7. Start with 3×3 colours; 5×5 suits confident six- and seven-year-olds.</>,
  time: <>5–10 minutes</>,
  needs: <>Coloured pencils for Colors, otherwise a pencil. Colors needs a colour printer.</>,
  reading: <>None. You explain the rule.</>,

  example: { seed: 3 },

  howItWorks: (
    <>
      <p>
        It’s a children’s sudoku: rows and columns only, with no smaller boxes to check.
        The filled squares are shaded.
      </p>
      <p>
        Every symbol is shown at least once. Then squares are filled in only until there
        is exactly one answer, so there are as few clues as possible.
      </p>
    </>
  ),

  sayAloud: [
    'Every row has one of each colour. Every line going down has one of each too.',
    'Look at this row. Which colour is missing? Put it in.',
  ],

  skills: [
    'Following a rule with two parts',
    'Working out what’s missing',
    'Checking across and down',
    'Not guessing',
  ],
  whyItMatters: (
    <p>
      They have to hold one rule in mind while checking two directions at once. Working out
      “it can’t be red, so it must be blue” is early logical reasoning.
    </p>
  ),

  settings: {
    size: {
      label: 'Size',
      description: <p>How many rows and columns, and so how many different symbols.</p>,
      options: [
        {
          label: '3×3',
          description: <p>Three symbols. A row with two filled is solved at once.</p>,
          example: { config: { size: 3 } },
        },
        {
          label: '4×4',
          description: <p>Four symbols. They often need to check a row and a column together.</p>,
          example: { config: { size: 4 } },
        },
        {
          label: '5×5',
          description: <p>Five symbols and more empty squares. Expect some rubbing out.</p>,
          example: { config: { size: 5 } },
        },
      ],
    },
    symbolType: {
      label: 'Symbols',
      description: <p>What goes in the squares. The puzzle is the same; only the look changes.</p>,
      options: [
        {
          label: 'Colors',
          description: (
            <p>
              Coloured dots: red, green, blue, then yellow and pink. Easiest to start with.
              Printed in black and white they all look grey.
            </p>
          ),
          example: { config: { symbolType: 'colors' } },
        },
        {
          label: '1-5',
          description: <p>Numbers. Good practice writing them.</p>,
          example: { config: { symbolType: 'numbers' } },
        },
        {
          label: 'A-E',
          description: <p>Capital letters.</p>,
          example: { config: { symbolType: 'letters' } },
        },
        {
          label: 'Custom',
          description: <p>Your own letters, typed into the box that appears.</p>,
          example: { config: { symbolType: 'custom', size: 3, customSymbols: 'DOG' } },
        },
      ],
    },
    customSymbols: {
      label: 'Custom letters',
      description: (
        <p>
          Type one letter for each symbol, up to the grid size. They turn into capitals. Use
          different letters, such as the letters of their name. If you type too few, numbers
          fill the gaps.
        </p>
      ),
    },
  },
  size: (
    <p>
      The puzzle always takes 3×3 squares on the page. The size setting above changes the
      grid, not the space it takes.
    </p>
  ),

  easier: [
    '3×3 with Colors.',
    'Point to one row and ask only what’s missing there.',
    'Put coloured counters on the squares before colouring in.',
  ],
  harder: [
    '4×4 or 5×5.',
    'Switch from Colors to 1-5 or A-E.',
    'Ask them to explain how they know a square.',
  ],
  mistakes: [
    {
      sign: 'Checks the row but not the column',
      meaning: <>Very common. Run a finger down the column with them before they fill it in.</>,
    },
    {
      sign: 'The same symbol twice in a row',
      meaning: <>Usually a quick guess. Ask them to read the row aloud and listen for the repeat.</>,
    },
    {
      sign: 'Gets stuck partway',
      meaning: <>Normal. Look for a row or column with only one gap, or a symbol that fits in only one place.</>,
    },
  ],
  beyondThePage: [
    'Lay out three rows of three toys, with no kind twice in a row or line.',
    'Play noughts and crosses. It’s also about checking across and down.',
  ],
};

export default docs;
