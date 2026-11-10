import { useId, useMemo } from 'react';
import type { PuzzleProps } from '../../../types/puzzle';
import { CELL_SIZE_MM } from '../../../types/puzzle';
import AnswerPath from '../../AnswerPath';
import { PIECE_IMAGES } from '../ChessMoves/pieces';
import { routeArrows, routeMoves, routePath } from '../ChessMoves/route';
import { InlineIcon, MapIcon } from '../Directions/MapIcon';
import { CAPTION_MM, generateTreasureChess, type PieceChoice, type Pickup, type TreasureLength, type TreasurePiece } from './generator';
import styles from './TreasureChess.module.css';

export interface TreasureChessConfig {
  piece: PieceChoice;
  length: TreasureLength;
  /** How many things to land on before the chest: 0 to 3. */
  collect: number;
  showMoves: boolean;
}

/** Room for the prompt across the puzzle, in mm: the padding comes off. */
const promptWidth = (gridWidth: number) => gridWidth * CELL_SIZE_MM - 4;

/**
 * What the parent reads out. It shrinks to fit at the minimum width of 4,
 * which leaves about 70mm.
 */
function Prompt({ piece, pickup, collect, width }: { piece: TreasurePiece; pickup: Pickup; collect: number; width: number }) {
  // Roughly: half an em a letter, and an icon about two letters wide
  const ems = 0.5 * (collect ? 32 + piece.length : 17 + piece.length) + (collect ? 4 : 2);
  const fontSize = Math.min(4, width / ems);
  return (
    <div className={styles.prompt} style={{ fontSize: `${fontSize}mm` }}>
      {collect
        ? <>Move the {piece} to every <InlineIcon icon={pickup} />, then <InlineIcon icon="chest" />.</>
        : <>Move the {piece} to the <InlineIcon icon="chest" />.</>}
    </div>
  );
}

export default function TreasureChess({ showAnswers = false, gridWidth, gridHeight, seed, config }: PuzzleProps<TreasureChessConfig>) {
  const pieceChoice = config?.piece ?? 'rook';
  const length = config?.length ?? 'medium';
  const collect = config?.collect ?? 0;
  const showMoves = config?.showMoves ?? true;
  const clipId = useId();

  const puzzle = useMemo(
    () => generateTreasureChess(gridWidth, gridHeight, seed, pieceChoice, length, collect, showMoves),
    [gridWidth, gridHeight, seed, pieceChoice, length, collect, showMoves]
  );

  const { cols, rows, cellMm, piece, route, coast, echoes } = puzzle;
  const width = cols * cellMm;
  const height = rows * cellMm;
  const moves = route.length - 1;
  const centre = (s: number): [number, number] => [(s % cols + 0.5) * cellMm, (Math.floor(s / cols) + 0.5) * cellMm];
  const [px, py] = centre(puzzle.start);

  // The dark squares of a chess board, on land only: the coast clips them
  const darkSquares = Array.from({ length: cols * rows }, (_, s) => s)
    .filter(s => (s % cols + Math.floor(s / cols)) % 2 === 1 && !puzzle.sea.has(s))
    .map(s => `M${(s % cols) * cellMm} ${Math.floor(s / cols) * cellMm}h${cellMm}v${cellMm}h${-cellMm}Z`)
    .join('');

  const answer = showAnswers ? routeMoves(route, cols, piece, centre) : [];

  return (
    <div className={styles.container} data-piece={piece}>
      <Prompt piece={piece} pickup={puzzle.pickup} collect={puzzle.pickups.length} width={promptWidth(gridWidth)} />

      <div className={styles.mapArea}>
        <svg
          className={styles.map}
          width={`${width}mm`}
          height={`${height}mm`}
          viewBox={`0 0 ${width} ${height}`}
        >
          <defs>
            <clipPath id={`${clipId}-map`}>
              <rect width={width} height={height} />
            </clipPath>
            <clipPath id={`${clipId}-land`}>
              {coast.map((d, i) => <path key={i} d={d} />)}
            </clipPath>
          </defs>
          <g clipPath={`url(#${clipId}-map)`}>
            <rect width={width} height={height} className={styles.sea} />
            {coast.map((d, i) => <path key={i} d={d} className={styles.land} />)}
            <path d={darkSquares} className={styles.dark} clipPath={`url(#${clipId}-land)`} />
            {echoes.map((d, i) => <path key={i} d={d} className={styles.echo} />)}
            {coast.map((d, i) => <path key={i} d={d} className={styles.coast} />)}
            {puzzle.stamps.map((stamp, i) => <MapIcon key={i} {...stamp} />)}
            <image href={PIECE_IMAGES[piece]} x={px - cellMm * 0.42} y={py - cellMm * 0.42} width={cellMm * 0.84} height={cellMm * 0.84} />
            {showAnswers && <>
              <AnswerPath d={routePath(answer)} width={0.6} />
              <AnswerPath d={routeArrows(answer, Math.min(2.4, cellMm * 0.16), Math.min(3, cellMm * 0.2))} width={0.6} dashed={false} />
              {route.slice(1).map((s, i) => {
                const [cx, cy] = centre(s);
                return <circle key={i} cx={cx} cy={cy} r={1} fill="var(--answer-ink)" />;
              })}
            </>}
          </g>
          <rect width={width} height={height} className={styles.border} />
        </svg>
      </div>

      {showMoves && (
        <div className={styles.caption} style={{ height: `${CAPTION_MM}mm` }}>
          Can you do it in {moves} {moves === 1 ? 'move' : 'moves'}?
        </div>
      )}
    </div>
  );
}
