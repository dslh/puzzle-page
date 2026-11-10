import type { PuzzleDoc } from '../../../types/puzzleDoc';
import type { ChessMovesConfig } from './index';

const docs: PuzzleDoc<ChessMovesConfig> = {
  summary: <>Small chess boards with one piece each. They dot every square it can move to, or draw its route to land on every star.</>,
  ages: <>Ages 4–7. No chess needed: you show them how one piece moves, then they try it.</>,
  time: <>5 to 10 minutes</>,
  needs: <>A pencil. A real chess piece helps.</>,
  reading: <>Read the line at the top to them. Nothing else needs reading.</>,
  example: { seed: 12 },
  howItWorks: <>
    <p>This is how chess clubs start young children: one piece at a time, on a small board, long before a real game. Show them the piece’s move first, with a real piece if you have one.</p>
    <p><strong>Dot the moves</strong> (Where Can It Go?): each board has one piece. They put a dot on every square it could move to in one go.</p>
    <p><strong>Collect stars</strong> (Collect the Stars): they draw the piece’s route, one move at a time, until it has landed on every star. Passing over a star does not count. It must stop there. Under each board is the fewest moves it can be done in.</p>
    <p>White pawns can stand in the way. These are the player’s own pieces. A piece cannot land on them or slide past them. The knight jumps, so it can hop over them, but it still cannot land on one.</p>
    <p>How each piece moves:</p>
    <ul>
      <li>Rook: straight along a row or column, as far as it likes.</li>
      <li>Bishop: along a diagonal, as far as it likes. It stays on one colour.</li>
      <li>Queen: like a rook or a bishop.</li>
      <li>King: one square any way.</li>
      <li>Knight: two squares straight, then one to the side, like a capital L.</li>
    </ul>
  </>,
  sayAloud: [
    'The rook goes in straight lines, like a train on a track. Where can it get to?',
    'Put a dot on every square it can stop on.',
    'Can it get past its own pawn? No, the pawn is in the way.',
    'The knight goes two, then turns and goes one. Let’s count it with your finger.',
    'Hop on every star. Can you do it in four moves?',
  ],
  skills: ['How each chess piece moves', 'Rows, columns and diagonals', 'Planning a route', 'Counting moves'],
  whyItMatters: <p>Each chess piece is a small rule to follow exactly. Learning them one at a time, before any games, is how most children’s chess courses begin. The stars add planning: thinking a few moves ahead before drawing.</p>,
  settings: {
    mode: {
      label: 'Puzzle',
      description: <p>What they do on each board.</p>,
      options: [
        { label: 'Dot the moves', description: <p>Dot every square the piece can reach in one move. Default for Where Can It Go?</p>, example: { config: { mode: 'where' } } },
        { label: 'Collect stars', description: <p>Draw a route that lands on every star. Default for Collect the Stars.</p>, example: { config: { mode: 'collect' }, width: 8, height: 5 } },
      ],
    },
    piece: {
      label: 'Piece',
      description: <p>Which piece is on the boards. The pawn is left out: it only goes one way, so it makes a dull board.</p>,
      options: [
        { label: 'Rook', description: <p>The easiest to start with. Default.</p>, example: { config: { piece: 'rook' } } },
        { label: 'Bishop', description: <p>Diagonals are harder to see than rows.</p>, example: { config: { piece: 'bishop' } } },
        { label: 'Queen', description: <p>Rook and bishop together, so lots of dots.</p>, example: { config: { piece: 'queen' } } },
        { label: 'King', description: <p>Only one square, but in every direction.</p>, example: { config: { piece: 'king' } } },
        { label: 'Knight', description: <p>The one most children find hardest. Try it last.</p>, example: { config: { piece: 'knight' } } },
        { label: 'Mix', description: <p>A different piece on each board. Default for 6–7 in Where Can It Go?</p>, example: { config: { piece: 'mixed' } } },
      ],
    },
    boardSize: {
      label: 'Board',
      description: <p>How many squares across. Smaller boards give fewer dots and shorter routes. Smaller boards also fit more on the page.</p>,
      options: [
        { label: '4×4', description: <p>Quick, with few squares to check.</p>, example: { config: { boardSize: 4 } } },
        { label: '5×5', description: <p>Default.</p>, example: { config: { boardSize: 5 } } },
        { label: '6×6', description: <p>Longer lines and routes.</p>, example: { config: { boardSize: 6 } } },
      ],
    },
    blockers: {
      label: 'In the way',
      description: <p>Whether some of their own pawns stand on the board.</p>,
      options: [
        { label: 'None', description: <p>An empty board. Default up to 5.</p>, example: { config: { blockers: false } } },
        { label: 'Pawns', description: <p>One to four pawns. In Dot the moves, at least one always stands where the piece could have gone. Default for 6–7 in Where Can It Go?</p>, example: { config: { blockers: true } } },
      ],
    },
    stars: {
      label: 'Stars',
      description: <p>Collect stars only. How many stars on each board. The route is never more than three moves longer than the number of stars, and never just one move.</p>,
      options: [
        { label: '1', description: <p>One target. Good for the knight.</p> },
        { label: '2', description: <p>Default.</p> },
        { label: '3', description: <p>Now the order matters. Default for 6–7.</p> },
        { label: '4', description: <p>The most planning.</p> },
      ],
    },
    showMoves: {
      label: 'Fewest moves',
      description: <p>Collect stars only. Whether each board says the fewest moves it can be done in.</p>,
      options: [
        { label: 'Show', description: <p>“Can you do it in 4 moves?” A longer route still collects every star. Default.</p> },
        { label: 'Hide', description: <p>Any route that lands on every star is right.</p> },
      ],
    },
    workedExample: {
      label: 'Example',
      description: <p>Whether the first board comes done in grey. Only when there is more than one board.</p>,
      options: [
        { label: 'First board', description: <p>Its dots or its route are drawn for you to talk through. Default.</p> },
        { label: 'None', description: <p>Every board is for them.</p> },
      ],
    },
  },
  size: <p>The page fits as many boards as it can, up to six, with squares big enough to draw in. Bigger puzzles add boards and keep the ones already there. A small puzzle holds one large board.</p>,
  easier: [
    'Stay with the rook until it is easy, then try one new piece at a time.',
    'Use 4×4 boards.',
    'Let them move a real piece across the printed board before dotting.',
    'In Collect stars, start with one star and hide the move count.',
  ],
  harder: [
    'Turn on Pawns, so they must stop in front of their own pieces.',
    'Choose Mix, so each board needs a different rule.',
    'Add stars, and ask them to beat or match the move count.',
  ],
  mistakes: [
    { sign: 'Dots only the squares next to the piece', meaning: <>Very common at first. Slide a finger all the way along the line with them.</> },
    { sign: 'Dots the square a pawn is on, or past it', meaning: <>Normal. Ask “Can it jump over its own pawn?” and let them find where it must stop.</> },
    { sign: 'Knight lands one square off', meaning: <>The knight is hard for everyone. Count it aloud: “one, two, turn, one.”</> },
    { sign: 'Draws through a star without stopping', meaning: <>A fair guess. Remind them the piece has to land on the star to collect it.</> },
    { sign: 'Uses more moves than the count', meaning: <>Still right: every star is collected. Ask if they can find a shorter way.</> },
  ],
  beyondThePage: [
    'Put one piece on a real board with sweets on some squares. They may eat the ones they land on.',
    'Play “rook tag” across the kitchen tiles, moving only in straight lines.',
    'Hide a toy on a chessboard. Give clues like “a knight’s move from the king”.',
  ],
  atSchool: <>Not taught in class, but it uses the position and direction words from Reception and Year 1 maths: rows, columns, across, up, down and diagonal.</>,
};

export default docs;
