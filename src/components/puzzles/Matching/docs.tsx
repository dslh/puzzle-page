import type { PuzzleDoc } from '../../../types/puzzleDoc';
import type { MatchingConfig } from './index';

const docs: PuzzleDoc<MatchingConfig> = {
  summary: (
    <>
      Two columns. Draw a line from each thing on the left to its partner on the right:
      its shadow, its word, its small letter, a rhyme, or where it lives.
    </>
  ),

  ages: (
    <>
      2–7. <em>Pictures</em> (shadows) suits 2–4. <em>Words</em>, <em>Letters</em>,{' '}
      <em>Rhymes</em> and <em>Homes</em> suit 4–7.
    </>
  ),
  time: <>2–5 minutes</>,
  needs: <>A pencil or crayon</>,
  reading: (
    <>
      None for pictures, rhymes or homes. Words needs them to read the words; Letters
      needs letter names or sounds.
    </>
  ),

  example: { seed: 1 },

  howItWorks: (
    <>
      <p>
        One pair per row. The right column is shuffled, and each thing on the left has
        exactly one partner, so every line can be marked right or wrong.
      </p>
      <p>
        The same puzzle sits under several names in the sidebar. Each starts on a
        different <em>Match</em> setting; switch freely.
      </p>
    </>
  ),

  sayAloud: [
    'Find the one that goes with this. Draw a line to join them.',
    'This one’s done for you. Now you do the next one.',
  ],

  skills: [
    'Looking closely at shapes',
    'Matching capitals to small letters',
    'Reading short words',
    'Hearing rhymes',
  ],
  whyItMatters: (
    <p>
      Matching is how children sort what they know. Shadows train looking at shape,
      which later helps tell letters apart. The other modes check one piece of reading
      at a time.
    </p>
  ),

  settings: {
    mode: {
      label: 'Match',
      description: <p>What the two columns hold.</p>,
      options: [
        {
          label: 'Pictures',
          description: (
            <p>
              Pictures on the left, the same pictures as black shadows on the right, all
              from one group (animals, food, vehicles and so on). Some groups have
              look-alikes, such as two cars; check the outline.
            </p>
          ),
          example: { config: { mode: 'silhouette' } },
        },
        {
          label: 'Words',
          description: (
            <p>
              A printed word to match to its picture. Words are in capitals and chosen so
              they can be sounded out.
            </p>
          ),
          example: { config: { mode: 'word' } },
        },
        {
          label: 'Letters',
          description: (
            <p>
              Capital to small letter. Letters whose two cases look the same (“c”, “o”,
              “s” and others) are left out, as matching them is only about size.
            </p>
          ),
          example: { config: { mode: 'letter' } },
        },
        {
          label: 'Rhymes',
          description: (
            <p>
              Each word has exactly one rhyme on the other side. Rhymes go by sound, not
              spelling, so “rain” can pair with “plane”.
            </p>
          ),
          example: { config: { mode: 'rhyme' } },
        },
        {
          label: 'Homes',
          description: (
            <p>
              An animal and where it lives. An animal never appears next to a second home
              it could fairly go to. Only 6–8 pairs fit, however tall the puzzle.
            </p>
          ),
          example: { config: { mode: 'homes' } },
        },
      ],
    },
    maxWordLength: {
      label: 'Letters (Words only)',
      description: (
        <p>The longest word chosen: 3, 4 or 5 letters. Default 4. Typed-in words ignore it.</p>
      ),
    },
    customWordsText: {
      label: 'Custom (Words only)',
      description: (
        <p>
          Type words to use them first. Only words with a picture can be used; the bar
          names any it can’t draw.
        </p>
      ),
    },
    customLettersText: {
      label: 'Letters (Letters only)',
      description: (
        <p>
          Type letters to use only those, e.g. this week’s sounds. Any letter works here.
          Fewer letters than rows gives fewer pairs. Empty means a random mix.
        </p>
      ),
    },
    rhymeDisplay: {
      label: 'Show (Rhymes only)',
      description: <p>What each side shows.</p>,
      options: [
        {
          label: 'Pictures',
          description: <p>No reading: they say the words and listen. Default.</p>,
          example: { config: { mode: 'rhyme', rhymeDisplay: 'pictures' } },
        },
        {
          label: 'Words',
          description: <p>Words only, all ones they can sound out. Read, then listen.</p>,
          example: { config: { mode: 'rhyme', rhymeDisplay: 'words' } },
        },
        {
          label: 'Both',
          description: <p>Each picture with its word underneath.</p>,
          example: { config: { mode: 'rhyme', rhymeDisplay: 'both' } },
        },
      ],
    },
    workedExample: {
      label: 'Example',
      description: <p>Shown in every mode.</p>,
      options: [
        {
          label: 'First pair',
          description: <p>The first line is drawn for them, dashed. Default.</p>,
        },
        {
          label: 'None',
          description: <p>No help line, once they know what to do.</p>,
          example: { config: { workedExample: false } },
        },
      ],
    },
  },
  size: (
    <p>
      Height sets the number of pairs: one per row, from 4 up to 14. Width only spaces
      the columns. Homes stops at 6–8 pairs whatever the height.
    </p>
  ),

  easier: [
    'For 2–3: they point to the match and you draw the line, or they trace yours.',
    'Keep it 4 rows tall and leave First pair on.',
    'Name each picture together before they start.',
  ],
  harder: [
    'Make it taller.',
    'Words with 5 letters, or Rhymes showing Words.',
    'Turn the Example off.',
  ],
  mistakes: [
    {
      sign: 'Two lines go to the same picture',
      meaning: <>Common early on. Point out each picture gets one line, then look again.</>,
    },
    {
      sign: 'Joins “b” to “d”, or similar',
      meaning: <>Normal while letters are new. Trace the shape with a finger together.</>,
    },
    {
      sign: 'A rhyme matched by first sound (“cat” to “car”)',
      meaning: <>Say both slowly and ask if the ends sound the same.</>,
    },
  ],
  beyondThePage: [
    'Shadow games: hold toys in front of a torch and guess each one.',
    'Pair socks or shoes from a pile.',
  ],

  atSchool: (
    <>
      Rhyme, letter names and reading simple words are Reception phonics; matching capitals
      to small letters comes in Reception and Year 1.
    </>
  ),
};

export default docs;
