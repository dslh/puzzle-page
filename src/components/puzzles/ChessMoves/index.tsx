import { useMemo } from 'react';
import type { PuzzleProps } from '../../../types/puzzle';
import { CELL_SIZE_MM } from '../../../types/puzzle';
import AnswerPath from '../../AnswerPath';
import { CAPTION, generateBoards, movesLayout, type Board, type BoardSize, type MovesMode, type PieceChoice } from './generator';
import { PAWN_IMAGE, PIECE_IMAGES } from './pieces';
import styles from './ChessMoves.module.css';

export interface ChessMovesConfig {
  mode: MovesMode;
  piece: PieceChoice;
  boardSize: BoardSize;
  blockers: boolean;
  stars: number;
  showMoves: boolean;
  workedExample: boolean;
}

// Pale enough that a pencil dot shows on either colour.
const LIGHT = '#f6ecdc';
const DARK = '#dcc3a0';
const EXAMPLE_INK = '#7a7f86';

function instruction(mode: MovesMode, piece: PieceChoice): string {
  const who = piece === 'mixed' ? 'each piece' : `the ${piece}`;
  return mode === 'where'
    ? `Put a dot on every square ${who} can move to.`
    : `Move ${who} to land on every star.`;
}

function starPath(cx: number, cy: number, r: number): string {
  return Array.from({ length: 10 }, (_, i) => {
    const angle = -Math.PI / 2 + i * Math.PI / 5;
    const radius = i % 2 ? r * 0.45 : r;
    return `${i ? 'L' : 'M'}${(cx + radius * Math.cos(angle)).toFixed(2)} ${(cy + radius * Math.sin(angle)).toFixed(2)}`;
  }).join('') + 'Z';
}

/** Knight hops go two then one, the way children are taught to count them. */
function routePath(board: Board & { mode: 'collect' }, centre: (square: number) => [number, number]): string {
  const { route, n, piece } = board;
  return route.map((square, i) => {
    const [x, y] = centre(square);
    if (i === 0) return `M${x} ${y}`;
    if (piece !== 'knight') return `L${x} ${y}`;
    const from = route[i - 1];
    const dx = square % n - from % n;
    const [fx, fy] = centre(from);
    const [cx, cy] = Math.abs(dx) === 2 ? [x, fy] : [fx, y];
    return `L${cx} ${cy}L${x} ${y}`;
  }).join('');
}

function BoardView({ board, index, x0, y0, square, example, showAnswers, showMoves }: {
  board: Board; index: number; x0: number; y0: number; square: number;
  example: boolean; showAnswers: boolean; showMoves: boolean;
}) {
  const { n } = board;
  const side = n * square;
  const centre = (s: number): [number, number] => [x0 + (s % n + 0.5) * square, y0 + (Math.floor(s / n) + 0.5) * square];
  const pieceAt = (s: number, href: string, key: string) => {
    const [cx, cy] = centre(s);
    return <image key={key} href={href} x={cx - square * 0.45} y={cy - square * 0.45} width={square * 0.9} height={square * 0.9} />;
  };
  const moves = board.mode === 'collect' ? board.route.length - 1 : 0;

  return <g data-chess-board={index} data-piece={board.piece}>
    {Array.from({ length: n * n }, (_, s) => {
      const x = s % n, y = Math.floor(s / n);
      return <rect key={s} x={x0 + x * square} y={y0 + y * square} width={square} height={square} fill={(x + y) % 2 ? DARK : LIGHT} />;
    })}
    <rect x={x0} y={y0} width={side} height={side} fill="none" stroke="#3a3f45" strokeWidth={0.5} />
    {board.mode === 'collect' && board.stars.map(s => {
      const [cx, cy] = centre(s);
      return <path key={`star${s}`} data-star d={starPath(cx, cy, square * 0.36)} fill="#f5c542" stroke="#a87b12" strokeWidth={0.3} strokeLinejoin="round" />;
    })}
    {board.blockers.map(s => pieceAt(s, PAWN_IMAGE, `pawn${s}`))}
    {pieceAt(board.at, PIECE_IMAGES[board.piece], 'piece')}

    {board.mode === 'where' && (example || showAnswers) && board.reach.map(s => {
      const [cx, cy] = centre(s);
      return example
        ? <circle key={`dot${s}`} data-worked-example cx={cx} cy={cy} r={square * 0.13} fill={EXAMPLE_INK} />
        : <circle key={`dot${s}`} data-answer-dot cx={cx} cy={cy} r={square * 0.13} fill="var(--answer-ink)" stroke="white" strokeWidth={square * 0.04} />;
    })}

    {board.mode === 'collect' && example && <g data-worked-example fill="none" stroke={EXAMPLE_INK} strokeWidth={0.6} strokeLinecap="round" strokeLinejoin="round">
      <path d={routePath(board, centre)} />
      {board.route.slice(1).map((s, i) => { const [cx, cy] = centre(s); return <circle key={i} cx={cx} cy={cy} r={0.9} fill={EXAMPLE_INK} />; })}
    </g>}
    {board.mode === 'collect' && !example && showAnswers && <g>
      <AnswerPath d={routePath(board, centre)} width={0.5} />
      {board.route.slice(1).map((s, i) => { const [cx, cy] = centre(s); return <circle key={i} cx={cx} cy={cy} r={0.9} fill="var(--answer-ink)" />; })}
    </g>}

    {board.mode === 'collect' && (example || showMoves) && <text
      x={x0 + side / 2} y={y0 + side + CAPTION - 1.2} textAnchor="middle" fontSize={2.8}
      fill={example ? EXAMPLE_INK : undefined}>
      {example ? `Example: ${moves} ${moves === 1 ? 'move' : 'moves'}` : `Can you do it in ${moves} ${moves === 1 ? 'move' : 'moves'}?`}
    </text>}
  </g>;
}

export default function ChessMoves({ gridWidth, gridHeight, seed, config, showAnswers = false }: PuzzleProps<ChessMovesConfig>) {
  const mode = config?.mode ?? 'where';
  const piece = config?.piece ?? 'rook';
  const boardSize = config?.boardSize ?? 5;
  const blockers = config?.blockers ?? false;
  const stars = config?.stars ?? 2;
  const showMoves = config?.showMoves ?? true;
  const workedExample = config?.workedExample ?? true;

  const layout = movesLayout(gridWidth, gridHeight, boardSize, mode, CELL_SIZE_MM);
  const count = layout.origins.length;
  const boards = useMemo(
    () => generateBoards(seed, count, { mode, piece, boardSize, blockers, stars }),
    [seed, count, mode, piece, boardSize, blockers, stars],
  );
  const text = instruction(mode, piece);
  const fontSize = Math.min(3.1, (layout.width - 6) / (text.length * 0.5));

  return <svg className={styles.puzzle} viewBox={`0 0 ${layout.width} ${layout.height}`} role="img" aria-label={text}>
    <text x={layout.width / 2} y={5.5} textAnchor="middle" fontSize={fontSize}>{text}</text>
    {boards.map((board, index) => <BoardView key={index} board={board} index={index}
      x0={layout.origins[index][0]} y0={layout.origins[index][1]} square={layout.square}
      example={workedExample && index === 0 && count > 1} showAnswers={showAnswers}
      showMoves={showMoves} />)}
  </svg>;
}
