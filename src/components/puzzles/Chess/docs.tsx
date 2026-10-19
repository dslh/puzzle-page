import type { PuzzleDoc } from '../../../types/puzzleDoc';
import type { ChessConfig } from './index';

const docs: PuzzleDoc<ChessConfig> = {
  summary: (
    <>
      A position from a real chess game. Find the best move: checkmate in one, or a move
      that wins a piece. Draw an arrow to show it.
    </>
  ),

  ages: (
    <>
      Listed for 4–7, but only once they know how every piece moves. Mate also needs them
      to know what checkmate is. Having played matters more than age.
    </>
  ),
  time: <>2–10 minutes a puzzle</>,
  needs: <>A pencil. A real chess set helps.</>,
  reading: <>None, but it needs chess knowledge you may have to supply.</>,

  example: { seed: 2 },

  howItWorks: (
    <>
      <p>
        The puzzles come from Lichess, a free chess website, picked from the lowest-rated
        and most popular ones. The rating sets the difficulty.
      </p>
      <p>
        The king above the board shows whose move it is. The board is turned so that side
        is always at the bottom, playing up the page. There are no letters or numbers round
        the edge, so the answer is an arrow, not a written move.
      </p>
    </>
  ),

  sayAloud: [
    'It’s your move. You’re the side at the bottom.',
    'Can you trap their king so it can’t get away? Or take one of their pieces? Draw an arrow.',
  ],

  skills: [
    'How each chess piece moves',
    'Checking every move, not just the first idea',
    'Looking from the other side',
    'Spotting what is unguarded',
  ],
  whyItMatters: (
    <p>
      Each puzzle asks “what happens if I move here?” and “what could they do back?”.
      Testing an idea before acting on it is a habit worth having well beyond chess.
    </p>
  ),

  settings: {
    mode: {
      label: 'Type',
      description: <p>What the best move does.</p>,
      options: [
        { label: 'Mate', description: <p>Checkmate in one move. Default.</p>, example: { config: { mode: 'mate' } } },
        {
          label: 'Capture',
          description: <p>A move that wins a piece. Easier for beginners who don’t yet know checkmate.</p>,
          example: { config: { mode: 'capture' } },
        },
        {
          label: 'Both',
          description: (
            <p>Either kind, and the page doesn’t say which. Tell them to look for checkmate first.</p>
          ),
        },
      ],
    },
    difficulty: {
      label: 'Difficulty',
      description: <p>The puzzle’s Lichess rating. All three are at the bottom of Lichess’s range.</p>,
      options: [
        { label: 'Easy', description: <p>The simplest puzzles (rated under 450).</p> },
        { label: 'Medium', description: <p>Rated 450–550.</p> },
        { label: 'Hard', description: <p>Rated 550–700. The move is less obvious.</p> },
      ],
    },
  },
  size: <p>The board is always 5×5 squares on the page, with one puzzle.</p>,

  easier: [
    'Capture, Easy.',
    'Set it up on a real board so they can try moves.',
    'Tell them which piece makes the move.',
  ],
  harder: [
    'Hard, or Both, so they don’t know which kind it is.',
    'Ask what the other side would do if they missed it.',
  ],
  mistakes: [
    {
      sign: 'Gives check but the king can escape',
      meaning: <>Common. Ask them to find every square the king could move to, one by one.</>,
    },
    {
      sign: 'Takes a piece that is guarded',
      meaning: <>Normal for beginners. Ask “can they take back?”</>,
    },
    {
      sign: 'Plays a move for the wrong side',
      meaning: <>Point to the king above the board: that side moves, from the bottom.</>,
    },
  ],
  beyondThePage: [
    'Play short games with just kings and pawns.',
    'Set up a king and a queen against a lone king and find checkmate together.',
  ],
};

export default docs;
