import type { PuzzleDoc } from '../../../types/puzzleDoc';
import type { TreasureChessConfig } from './index';

const docs: PuzzleDoc<TreasureChessConfig> = {
  summary: (
    <>
      A chess piece lands on a treasure island. They draw its route to the treasure
      chest, using only the moves that piece is allowed to make.
    </>
  ),

  ages: (
    <>
      4–7, once they know how the piece moves. Where Can It Go? is the place to learn
      that first.
    </>
  ),
  time: <>5–10 minutes</>,
  needs: <>A pencil. A real chess piece helps.</>,
  reading: <>Read the line at the top to them. Nothing else needs reading.</>,

  example: { seed: 7 },

  howItWorks: (
    <>
      <p>
        The island is a chess board: pale and dark green squares on the sand. The piece
        starts beside the ship. Trees, rocks, huts and the sea are in the way. A piece
        stops before them and can’t slide past. The knight jumps, so it hops over them,
        but it still can’t land on one.
      </p>
      <p>
        They draw one line per move, from square to square, until the piece lands on
        the chest. With Collect on, the piece must first land on every compass or flag.
        Passing over one doesn’t count.
      </p>
      <p>
        The trees and rocks always make the route longer than it would be on open sand,
        so the island is part of the puzzle. (Not always for the knight: it has so many
        ways round that the trees seldom matter.)
      </p>
    </>
  ),

  sayAloud: [
    'The rook has sailed to the island. It wants the treasure! It can only move like a rook.',
    'Can it go straight there? What’s in the way?',
    'Draw a line for each move. Where does it stop?',
    'Can you do it in four moves?',
  ],

  skills: [
    'How chess pieces move',
    'Rows, columns and diagonals',
    'Planning a few moves ahead',
    'Counting moves',
  ],
  whyItMatters: (
    <p>
      Knowing a piece’s move is one thing; using it to get somewhere is the next step.
      Finding a way round what’s in the way means thinking ahead before drawing.
    </p>
  ),

  settings: {
    piece: {
      label: 'Piece',
      description: <p>Which piece hunts for the treasure. The king is left out: one square at a time makes a slow trip.</p>,
      options: [
        { label: 'Rook', description: <p>Straight lines. The easiest. Default.</p>, example: { config: { piece: 'rook' } } },
        {
          label: 'Bishop',
          description: <p>Diagonals. It stays on one colour, so the chest is always on its colour too.</p>,
          example: { config: { piece: 'bishop' } },
        },
        { label: 'Knight', description: <p>Jumps over trees and rocks. The hardest to count.</p>, example: { config: { piece: 'knight' } } },
        { label: 'Queen', description: <p>Straight and diagonal, so more ways round.</p>, example: { config: { piece: 'queen' } } },
        { label: 'Mix', description: <p>One of the four, a new one each time. Default for 6–7.</p> },
      ],
    },
    length: {
      label: 'Length',
      description: <p>The fewest moves it takes, plus one for each thing to collect.</p>,
      options: [
        { label: 'Short', description: <p>About 3 moves.</p>, example: { config: { length: 'short' } } },
        { label: 'Medium', description: <p>4 moves. Default.</p>, example: { config: { length: 'medium' } } },
        { label: 'Long', description: <p>5 or 6 moves. Default for 6–7.</p>, example: { config: { length: 'long' } } },
      ],
    },
    collect: {
      label: 'Collect',
      description: (
        <p>
          Things the piece must land on before the chest. Each map has either compasses
          or flags.
        </p>
      ),
      options: [
        { label: 'None', description: <p>Straight to the chest. Default.</p> },
        { label: '1', description: <p>One stop on the way.</p>, example: { config: { collect: 1 } } },
        { label: '2', description: <p>Now the order matters.</p>, example: { config: { collect: 2 } } },
        { label: '3', description: <p>The most planning. Pair it with Short.</p>, example: { config: { collect: 3, length: 'short' } } },
      ],
    },
    showMoves: {
      label: 'Fewest moves',
      description: <p>Whether the puzzle says the fewest moves it can be done in.</p>,
      options: [
        { label: 'Show', description: <p>“Can you do it in 4 moves?” A longer route that gets there is still right. Default.</p> },
        { label: 'Hide', description: <p>Any route that reaches the chest is right.</p> },
      ],
    },
  },
  size: (
    <p>
      Squares stay 11–17 mm, so a bigger puzzle gives a bigger island, up to 10 by 12
      squares. Then the squares grow instead. Minimum 4×4.
    </p>
  ),

  easier: [
    'Rook, Short, nothing to collect.',
    'Let them move a real piece across the map before drawing.',
    'Hide the move count, so any route is right.',
  ],
  harder: [
    'Bishop, then knight.',
    'Add things to collect.',
    'Ask them to match the move count, then try Long.',
  ],
  mistakes: [
    {
      sign: 'Slides through a tree or rock',
      meaning: <>Very common at first. Ask “Can it get past the tree?” and let them find where it stops.</>,
    },
    {
      sign: 'Bishop or rook stops one square early',
      meaning: <>Normal. It can go as far as it likes, so a long slide is fine.</>,
    },
    {
      sign: 'Knight lands one square off',
      meaning: <>The knight is hard for everyone. Count it aloud: “one, two, turn, one.”</>,
    },
    {
      sign: 'Uses more moves than the count',
      meaning: <>Still right if every move is allowed. Ask if they can find a shorter way.</>,
    },
  ],
  beyondThePage: [
    'Lay cushions on a real chessboard as trees. Hide a sweet for the piece to reach.',
    'Swap: they draw an island, you find the route.',
  ],

  atSchool: (
    <>
      Not taught in class, but it uses Year 1–2 position and direction work: rows,
      columns, across, up and down.
    </>
  ),
};

export default docs;
