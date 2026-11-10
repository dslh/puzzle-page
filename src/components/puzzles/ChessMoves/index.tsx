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

type Point = [number, number];

/** Each move's corners, start to landing. Knight hops go two then one, the way children are taught to count them. */
function routeMoves(board: Board & { mode: 'collect' }, centre: (square: number) => Point): Point[][] {
  const { route, n, piece } = board;
  return route.slice(1).map((square, i) => {
    const from = centre(route[i]), to = centre(square);
    if (piece !== 'knight') return [from, to];
    const corner: Point = Math.abs(square % n - route[i] % n) === 2 ? [to[0], from[1]] : [from[0], to[1]];
    return [from, corner, to];
  });
}

function routePath(moves: Point[][]): string {
  return moves.map((points, i) => points.slice(i ? 1 : 0).map(([x, y], j) => `${i || j ? 'L' : 'M'}${x} ${y}`).join('')).join('');
}

/**
 * An arrowhead at the end of every move, just short of where it lands, so a
 * route that doubles back still reads in order.
 */
function routeArrows(moves: Point[][], size: number, gap: number): string {
  return moves.map(points => {
    const [fx, fy] = points[points.length - 2], [tx, ty] = points[points.length - 1];
    const length = Math.hypot(tx - fx, ty - fy);
    const ux = (tx - fx) / length, uy = (ty - fy) / length;
    const x = tx - ux * gap, y = ty - uy * gap;
    const wing = (side: number) => `${x - size * (ux - side * uy * 0.75)} ${y - size * (uy + side * ux * 0.75)}`;
    return `M${wing(1)}L${x} ${y}L${wing(-1)}`;
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
  const route = board.mode === 'collect' ? routeMoves(board, centre) : [];
  const arrowSize = Math.min(2, square * 0.16), arrowGap = Math.min(2.6, square * 0.2);

  return <g data-chess-board={index} data-piece={board.piece}>
    {Array.from({ length: n * n }, (_, s) => {
      const x = s % n, y = Math.floor(s / n);
      return <rect key={s} x={x0 + x * square} y={y0 + y * square} width={square} height={square} fill={(x + y) % 2 ? 'var(--board-dark)' : 'var(--board-light)'} />;
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
      <path d={routePath(route)} />
      <path d={routeArrows(route, arrowSize, arrowGap)} />
      {board.route.slice(1).map((s, i) => { const [cx, cy] = centre(s); return <circle key={i} cx={cx} cy={cy} r={0.9} fill={EXAMPLE_INK} />; })}
    </g>}
    {board.mode === 'collect' && !example && showAnswers && <g>
      <AnswerPath d={routePath(route)} width={0.5} />
      <AnswerPath d={routeArrows(route, arrowSize, arrowGap)} width={0.5} dashed={false} />
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
