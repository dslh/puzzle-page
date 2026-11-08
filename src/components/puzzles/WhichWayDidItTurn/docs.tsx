import type { PuzzleDoc } from '../../../types/puzzleDoc';
import type { WhichWayDidItTurnConfig } from './index';

const docs: PuzzleDoc<WhichWayDidItTurnConfig> = {
  summary: <>Look at the boxed picture and imagine turning it in the arrow’s direction. Circle the picture it becomes.</>,
  ages: <>Try with ages 4–7, with you explaining the turn. Start when they can match a picture facing the same way.</>,
  time: <>A few minutes</>,
  needs: <>A pencil. A paper shape can help.</>,
  reading: <>Read the instruction together. They do not need to read the choices.</>,
  example: { seed: 31 },
  howItWorks: <>
    <p>Each row has one boxed shape, a turning arrow and three choices. The arrow shows a quarter-turn clockwise or anticlockwise, or a half-turn. Each arrow starts at the top of a guide circle. Its dark curve shows how far to turn and which way to go. You choose which turns can appear.</p>
    <p>All three choices are the same shape. Exactly one has made the right turn. For quarter-turns, the wrong pictures stay still or turn the other way. For half-turns, they make quarter-turns instead.</p>
    <p>The first row comes circled as a guide. Look at it together, then let them try the next row. Point out a long side or a corner they can follow as it turns.</p>
    <p>All four pictures in a row share the same colour, so colour does not give away the answer. Nothing is flipped over. Each shape stays the same size in every picture.</p>
  </>,
  sayAloud: [
    'Look at this picture. Turn it this way, like the arrow.',
    'Which picture will it look like? Circle that one.',
    'Let’s follow this long side as it turns.',
  ],
  skills: ['Imagining quarter-turns and half-turns', 'Following a shape’s corners and sides', 'Comparing the same shape facing different ways'],
  whyItMatters: <p>This gives them practice imagining how a familiar shape looks after a turn. Moving a paper shape first links the printed arrow to a movement they can see.</p>,
  settings: {
    turns: {
      label: 'Turns (choose one or more)',
      description: <p>Switch on any turns you want to include. At least one stays on. With several on, each row chooses one.</p>,
      options: [
        { label: '↻ ¼', description: <p>A quarter-turn clockwise, like a clock’s hands. Default.</p>, example: { config: { turns: ['clockwise'] } } },
        { label: '↺ ¼', description: <p>A quarter-turn anticlockwise, the other way round.</p>, example: { config: { turns: ['anticlockwise'] } } },
        { label: '½ turn', description: <p>A half-turn. The arrow makes a half-circle. Turning either way gives the same answer.</p>, example: { config: { turns: ['half'] } } },
      ],
    },
    shapes: {
      label: 'Shapes',
      description: <p>Choose a family of silhouettes, or mix them. All choices in a row use the same shape and size.</p>,
      options: [
        { label: 'Blocks', description: <p>Twelve shapes made from three, four or five joined squares. Default.</p>, example: { config: { shapes: 'blocks' } } },
        { label: 'Pointy', description: <p>Ten shapes with sharp corners, including triangles, a pennant and a crown.</p>, example: { config: { shapes: 'pointy' } } },
        { label: 'Rounded', description: <p>Ten soft outlines, including a drop, a mushroom, a mitten and a whale.</p>, example: { config: { shapes: 'rounded' } } },
        { label: 'Mix', description: <p>Draw from all three families.</p>, example: { config: { shapes: 'mixed' } } },
      ],
    },
    workedExample: {
      label: 'Example',
      description: <p>Whether the first row comes done. This changes the marks, not the questions.</p>,
      options: [
        { label: 'First row', description: <p>The first row’s correct picture is circled in grey. Default. Explain that row together before starting.</p>, example: { config: { workedExample: true } } },
        { label: 'None', description: <p>Every row is for them. Use this once the rule is familiar.</p>, example: { config: { workedExample: false } } },
      ],
    },
  },
  size: <p>The pictures stay at a comfortable printed size. Making the puzzle taller adds rows; extra width gives the row more room. Existing rows keep their shapes, turns and answer positions when resized. The smallest size has two rows, leaving one to try after the example.</p>,
  easier: [
    'Keep First row on and explain why that picture is circled.',
    'Cut a matching shape from scrap paper. Turn it beside the boxed picture, then compare.',
    'Let them turn the page to check their prediction. Cover the choices while turning, then put the page back to compare.',
  ],
  harder: [
    'Include both quarter-turn directions, then add half-turns.',
    'Choose None so every row is for them.',
    'Ask them to predict where a corner will go before looking at the choices.',
    'Ask how they ruled out each wrong picture.',
  ],
  mistakes: [
    { sign: 'Chooses the unchanged picture', meaning: <>A normal first step: they have recognised the shape. Move a paper copy through the turn together.</> },
    { sign: 'Turns the other way', meaning: <>A common mix-up. Trace the arrow with a finger, then move the paper shape in that direction.</> },
    { sign: 'Finds it hard to keep track', meaning: <>Normal when imagining a movement. Follow just one distinctive corner and let them check with a paper shape.</> },
  ],
  beyondThePage: [
    'Make an L from toy bricks laid flat. Predict what it will look like after a quarter-turn, then check.',
    'Draw a shape on a card. Take turns moving it and describing which way it turned.',
  ],
  atSchool: <>This practises the language of position and turning used in early maths. Use it to talk about clockwise and anticlockwise quarter-turns and half-turns.</>,
};

export default docs;
