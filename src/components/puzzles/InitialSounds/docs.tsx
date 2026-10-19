import type { PuzzleDoc } from '../../../types/puzzleDoc';
import type { InitialSoundsConfig } from './index';

const docs: PuzzleDoc<InitialSoundsConfig> = {
  summary: (
    <>
      Say the word for each picture, listen for its first sound, and circle that letter
      from three choices, or write it in a box.
    </>
  ),

  ages: (
    <>
      4–6, once they know a few letter sounds. <em>Circle</em> first, <em>Write</em>{' '}
      when they can form the letters.
    </>
  ),
  time: <>5 minutes</>,
  needs: <>A pencil</>,
  reading: <>None, beyond the letters. You may need to name a picture.</>,

  example: { seed: 5 },

  howItWorks: (
    <>
      <p>
        The picture is the only clue, so words are chosen carefully: the first letter
        must make its usual sound (so no sh, ch, soft c or g, or vowels saying their
        name), and the picture must not have an obvious other name (no hen, which might
        be “chicken”).
      </p>
      <p>
        The wrong letters never look or sound like the answer: no “d” or “p” with a “b” word,
        no “k” with a “c” word. It tests hearing the sound, not telling “b” from “d”. A sheet
        spreads itself across different sounds before repeating one.
      </p>
    </>
  ),

  sayAloud: [
    'What’s this? Say it slowly. What sound does it start with?',
    'Find the letter that makes that sound and circle it.',
  ],

  skills: [
    'Hearing the first sound in a word',
    'Matching sounds to letters',
    'Letter recognition',
  ],
  whyItMatters: (
    <p>
      Picking sounds out of a spoken word is what reading and spelling rest on, and the
      first sound is the easiest to hear. This is the start of phonics.
    </p>
  ),

  settings: {
    mode: {
      label: 'Task',
      description: <p>How the child answers.</p>,
      options: [
        {
          label: 'Circle',
          description: <p>Three letters to choose from. Recognising is easier than recalling, so start here.</p>,
          example: { config: { mode: 'circle' } },
        },
        {
          label: 'Write',
          description: <p>An empty box: recall the letter and form it. Harder, and good spelling practice.</p>,
          example: { config: { mode: 'write' } },
        },
      ],
    },
    letterCase: {
      label: 'Case',
      description: <p>Lower or upper case letters.</p>,
      options: [
        { label: 'abc', description: <p>Lower case: what phonics starts with and books use. Default.</p> },
        { label: 'ABC', description: <p>Capitals, if that’s what they know, say from their name.</p> },
      ],
    },
    lettersText: {
      label: 'Letters',
      description: (
        <>
          <p>
            Type letters to use only pictures starting with them, e.g. this week’s school
            sounds. The wrong choices come from the same letters too, where possible.
            Empty means all letters.
          </p>
          <p>
            No pictures start with “i”, “u”, “q”, “x” or “y”. “e”, “v”, “z”, “j”, “n”, “a”
            and “o” have only one or two each, so a sheet of just those repeats.
          </p>
        </>
      ),
      options: [
        {
          label: 's a t p',
          description: <p>The first four sounds most phonics schemes teach. Spaces or commas are fine.</p>,
          example: { config: { lettersText: 's a t p' } },
        },
      ],
    },
  },
  size: (
    <p>
      Each picture needs a 30 mm square, so size sets how many: the default 6×4 holds
      six, 2×2 holds one.
    </p>
  ),

  easier: [
    'Circle, with letters they know typed into Letters.',
    'Say the word for them, stretching the first sound: “sssss-un”.',
  ],
  harder: [
    'Write.',
    'Letters left empty.',
    'Ask for another word with the same first sound.',
  ],
  mistakes: [
    {
      sign: 'Picks a letter by its name, not its sound',
      meaning: <>“Gee” for jar. Use the sound, /j/, not the name. This fades.</>,
    },
    {
      sign: 'A “wrong” letter that fits another name for the picture',
      meaning: <>Ask what they called it. If the thinking is right, count it.</>,
    },
    {
      sign: 'Letters written backwards',
      meaning: <>Normal until about seven. Praise the sound.</>,
    },
  ],
  beyondThePage: [
    'I spy with sounds: “something beginning with /m/”.',
    'Find three things in the house starting with the sound of their name.',
  ],

  atSchool: (
    <>
      Reception phonics works through sounds in a set order, often s, a, t, p, i, n; the
      Letters setting follows along. The Early Learning Goal expects a sound for each
      letter by the end of Reception.
    </>
  ),
};

export default docs;
