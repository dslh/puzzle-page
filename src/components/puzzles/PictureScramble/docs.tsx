import type { PuzzleDoc } from '../../../types/puzzleDoc';
import type { PictureScrambleConfig } from './index';

// A small picture with a clear way up, for the live example
const SAMPLE_SVG = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 100">
<rect width="100" height="100" fill="#bfe3ff"/>
<rect y="70" width="100" height="30" fill="#7cc576"/>
<circle cx="18" cy="18" r="10" fill="#ffd23f"/>
<rect x="48" y="45" width="34" height="27" fill="#e4572e"/>
<path d="M44 46L65 26L86 46Z" fill="#8a4b2a"/>
<rect x="60" y="56" width="9" height="16" fill="#5a3a22"/>
<rect x="16" y="50" width="6" height="22" fill="#8a4b2a"/>
<circle cx="19" cy="44" r="12" fill="#2e8b3a"/>
</svg>`;
const SAMPLE_IMAGE = `data:image/svg+xml;base64,${btoa(SAMPLE_SVG)}`;

const docs: PuzzleDoc<PictureScrambleConfig> = {
  summary: (
    <>
      A picture you choose, cut into four pieces that are mixed up and turned round. Cut
      them out and put the picture back together.
    </>
  ),

  ages: <>4–7. Four-year-olds will need you to do the cutting.</>,
  time: <>5–10 minutes, plus cutting out</>,
  needs: <>Scissors. Glue and a sheet of paper if they want to stick it down.</>,
  reading: <>None. You explain it.</>,

  example: { seed: 3 },

  howItWorks: (
    <>
      <p>
        You upload a picture from your phone or computer. It is split into four quarters.
        The quarters are shuffled, and each is turned a random quarter, half or
        three-quarter turn, or left as it is.
      </p>
      <p>
        With no picture uploaded, the puzzle prints as an empty box saying “Upload an
        image”. Nothing is chosen for you. The picture stays in your browser; it isn’t
        sent anywhere.
      </p>
    </>
  ),

  sayAloud: [
    'This picture has been cut up and jumbled. Can you fix it?',
    'Turn the piece round until it looks the right way up. Where does it go?',
  ],

  skills: [
    'Turning shapes in your head',
    'Seeing how parts make a whole',
    'Cutting along a line',
  ],
  whyItMatters: (
    <p>
      Picturing how something looks when it’s turned is a skill used later in shape work,
      maps and reading diagrams. A familiar photo makes it a puzzle they want to finish.
    </p>
  ),

  settings: {
    imageUrl: {
      label: 'Upload Image',
      description: (
        <>
          <p>
            Choose any picture file. Use a photo they know: their face, a pet, a favourite
            toy. Pictures with an obvious way up (faces, houses, people standing) are
            easiest. Patterns, sky or sea are much harder.
          </p>
          <p>
            The picture is stretched to the puzzle’s shape, so a square photo in a square
            puzzle looks best. The ✕ button clears it.
          </p>
        </>
      ),
      options: [
        {
          label: 'A picture',
          description: <p>Here, a simple drawing of a house.</p>,
          example: { config: { imageUrl: SAMPLE_IMAGE } },
        },
      ],
    },
  },
  size: (
    <p>
      There are always four pieces. Making it bigger only makes the pieces bigger, which is
      easier to cut. Keep it square: in a long, thin puzzle the turned pieces overlap.
    </p>
  ),

  easier: [
    'A photo of their own face.',
    'You cut, they arrange.',
    'Tell them which piece goes top left.',
  ],
  harder: [
    'A busy picture with no clear way up.',
    'Solve it without cutting: point to where each piece goes and say which way to turn it.',
  ],
  mistakes: [
    {
      sign: 'Right places, but a piece upside down',
      meaning: <>The most common slip. Ask “does it look right?” and let them find it.</>,
    },
    {
      sign: 'Only slides pieces, never turns them',
      meaning: <>Normal at first. Show them that a piece can be turned.</>,
    },
  ],
  beyondThePage: [
    'Cut an old birthday card into four and rebuild it.',
    'Do a simple jigsaw together, talking about which edge goes where.',
  ],

  atSchool: (
    <>Quarter, half and three-quarter turns are Year 1 maths (“position and direction”).</>
  ),
};

export default docs;
