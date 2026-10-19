import type { PuzzleDoc } from '../../../types/puzzleDoc';
import type { LetterFormationConfig } from './index';

const docs: PuzzleDoc<LetterFormationConfig> = {
  summary: (
    <>
      One capital letter or number, with numbered dots and arrows showing where each line
      starts and which way it goes. Then write over grey copies and fill the line.
    </>
  ),

  ages: <>4–6, or older for a letter or number that keeps coming out wrong.</>,
  time: <>5 minutes</>,
  needs: <>A pencil</>,
  reading: <>None. Say the letter’s name and sound for them.</>,

  example: { seed: 2 },

  howItWorks: (
    <>
      <p>
        The big letter at the top shows the order: dot 1 is where the pencil goes down
        first, and the arrow shows which way to go. Each practice line starts with grey
        letters to trace, then space to write on their own.
      </p>
      <p>
        Letters with a straight-down line start with it (B, D, E, F, H, K, L, P, R, T).
        Lines that go up, like the second line of V, are drawn going up. If school teaches
        a letter another way, go with school.
      </p>
    </>
  ),

  sayAloud: [
    'Put your pencil on dot 1. Which way does the arrow go?',
    'Now dot 2. Trace the grey ones, then do some all by yourself.',
  ],

  skills: [
    'Where to start a letter',
    'Which way to move the pencil',
    'Capitals and numbers 0–9',
    'Pencil control',
  ],
  whyItMatters: (
    <p>
      A letter started in the wrong place can look fine but goes slowly and is hard to join
      later. Habits set early are hard to change, so it’s worth getting the start right.
    </p>
  ),

  settings: {
    set: {
      label: 'Write',
      description: <p>Letters or numbers. Switching resets the choice to ? (random).</p>,
      options: [
        { label: 'ABC', description: <p>Capital letters. Default.</p> },
        {
          label: '123',
          description: <p>The numbers 0–9.</p>,
          example: { config: { set: 'numbers', letter: '' } },
        },
      ],
    },
    letter: {
      label: 'Letter / Number',
      description: (
        <p>
          Pick one, e.g. the first letter of their name. <strong>?</strong> picks one at
          random and “Show another” changes it; with a letter chosen, rerolling does nothing.
        </p>
      ),
      options: [
        {
          label: 'S',
          description: <p>A hard one: one stroke that changes direction twice.</p>,
          example: { config: { set: 'letters', letter: 'S' } },
        },
      ],
    },
    traceCount: {
      label: 'Trace',
      description: (
        <p>
          How many grey letters start each line: 1, 2 or 3 (default). Fewer means more
          writing on their own. A narrow puzzle may fit fewer wide letters, like W.
        </p>
      ),
      options: [
        { label: '1', description: <p>One to trace, then on their own.</p>, example: { config: { traceCount: 1 } } },
        { label: '3', description: <p>Three to trace. Default.</p>, example: { config: { traceCount: 3 } } },
      ],
    },
    guides: {
      label: '1→',
      description: <p>The numbered dots and arrows on the big letter. On by default.</p>,
      options: [
        { label: 'On', description: <p>Start points and directions shown.</p> },
        {
          label: 'Off',
          description: <p>Just the letter. A check: can they remember where to start?</p>,
          example: { config: { guides: false } },
        },
      ],
    },
  },
  size: (
    <p>
      Letters on the practice lines stay about 14 mm tall. The default 6×3 gives one line;
      each extra row adds about one more (6×5 gives three). Width adds space to write after
      the grey letters.
    </p>
  ),

  easier: [
    'Trace 3, and say the stroke out loud: “down, then across”.',
    'Draw the letter big in the air first, finger following the arrows.',
  ],
  harder: [
    'Trace 1, with the 1→ guides off.',
    'Make it taller for more lines, and ask them to circle their best one.',
    'Write it from memory, eyes shut, then check the dots.',
  ],
  mistakes: [
    {
      sign: 'Starts at the bottom and goes up',
      meaning: <>Very common, and the letter may look fine. Put their pencil on dot 1 and go together.</>,
    },
    {
      sign: 'Letters or numbers backwards (J, S, 3, 7)',
      meaning: <>Normal until about seven. Point to which way the arrow goes; don’t worry.</>,
    },
    {
      sign: 'Holds the pencil in a fist',
      meaning: <>Common at four. Show a pinch between thumb and first finger, resting on the middle finger.</>,
    },
  ],
  beyondThePage: [
    'Write the letter on their back with your finger; they guess it.',
    'Make it with play dough, starting where dot 1 would be.',
  ],

  atSchool: (
    <>
      Year 1 expects capital letters and the numbers 0–9 to be formed correctly. Lower case
      comes first at school, taught in families of similar letters; this puzzle only does
      capitals.
    </>
  ),
};

export default docs;
