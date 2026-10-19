import type { PuzzleDoc } from '../../../types/puzzleDoc';
import type { SecretCodeConfig } from './index';

const docs: PuzzleDoc<SecretCodeConfig> = {
  summary: (
    <>
      Words written in pictures. A key at the top says which letter each picture
      stands for. Write the letter under each picture, then read the word.
    </>
  ),

  ages: (
    <>
      4–7, once they know most letters. <em>Sounds</em> first; <em>Code</em> suits
      5–7.
    </>
  ),
  time: <>10–15 minutes</>,
  needs: <>A pencil</>,
  reading: <>None to start. They read the words once they’ve written them.</>,

  example: { seed: 3 },

  howItWorks: (
    <>
      <p>
        The key runs in alphabet order, a picture over each letter. Each word below is a
        row of pictures with a box under each. Words are 3–5 letters and can all be
        sounded out.
      </p>
      <p>
        Words are picked to share letters, so the same pictures come back and they start
        to remember them. A sheet holds as many words as fit with their key.
      </p>
    </>
  ),

  sayAloud: [
    'It’s a secret code. Find this picture in the key. Which letter is under it? Write it in the box.',
    'Now you’ve got all the letters. Sound them out. What’s the word?',
  ],

  skills: [
    'Writing letters',
    'Sounding out and blending',
    'Using a key',
    'Remembering a code',
  ],
  whyItMatters: (
    <p>
      They build each word letter by letter, then blend it, which is how phonics teaches
      reading. The mystery gives a reason to read it.
    </p>
  ),

  settings: {
    mode: {
      label: 'Key',
      description: <p>How the pictures relate to their letters.</p>,
      options: [
        {
          label: 'Code',
          description: (
            <p>
              Any picture can stand for any letter, and never one its name starts with,
              so they must look it up. Default.
            </p>
          ),
          example: { config: { mode: 'cipher' } },
        },
        {
          label: 'Sounds',
          description: (
            <p>
              Each picture starts with its letter (apple for “a”), so they can often work
              it out without the key. Easier. No pictures for “q” or “x”, so words with them
              are skipped. Ice, umbrella and yoyo stand in for “i”, “u” and “y”.
            </p>
          ),
          example: { config: { mode: 'phonics' } },
        },
      ],
    },
    letterCase: {
      label: 'Case',
      description: <p>How the letters in the key are printed.</p>,
      options: [
        { label: 'ABC', description: <p>Capitals. Default.</p> },
        {
          label: 'abc',
          description: <p>Lower case, as in books and as they’ll write.</p>,
          example: { config: { letterCase: 'lower' } },
        },
      ],
    },
    decoys: {
      label: 'Decoys',
      description: <p>Whether the key has letters no word uses.</p>,
      options: [
        { label: 'Off', description: <p>Every key letter is used somewhere. Default.</p> },
        {
          label: 'On',
          description: <p>Extra letters fill the key’s last row, so there is more to search.</p>,
          example: { config: { decoys: true } },
        },
      ],
    },
    customWordsText: {
      label: 'Words',
      description: (
        <p>
          Type words, e.g. their name or this week’s spellings, and they go first.
          Words that don’t fit are named on screen; make the puzzle bigger.
        </p>
      ),
      options: [
        {
          label: 'mum, dad',
          description: <p>Family words make a good first code.</p>,
          example: { config: { customWordsText: 'mum, dad' } },
        },
      ],
    },
  },
  size: (
    <p>
      Pictures stay the same size, so a bigger puzzle holds more words, not bigger
      ones. The default 6×7 holds about 10–13 words; 4×4 holds 3 or 4; 3×3 holds 2.
      Long typed-in words need a wide puzzle.
    </p>
  ),

  easier: [
    'Sounds, with Decoys off.',
    'Make it smaller, for fewer words.',
    'Do the first word together.',
  ],
  harder: [
    'Code, with Decoys on.',
    'Make it bigger.',
    'Ask them to write you a secret message with the same key.',
  ],
  mistakes: [
    {
      sign: 'Writes the picture’s first letter in Code mode',
      meaning: <>A sensible guess. Explain the key is the only clue in Code.</>,
    },
    {
      sign: 'Gets every letter, but can’t read the word',
      meaning: <>Normal: blending comes after knowing letters. Say the sounds with them, then faster.</>,
    },
    {
      sign: 'Letters written backwards',
      meaning: <>Normal until about seven. The key shows the right way round.</>,
    },
  ],
  beyondThePage: [
    'Make up a code together with stickers or drawings, and leave each other notes.',
    'Hide a treat and write where it is in code.',
  ],

  atSchool: (
    <>
      Reception and Year 1 phonics teach blending sounds to read simple words and
      writing the letter for each sound.
    </>
  ),
};

export default docs;
