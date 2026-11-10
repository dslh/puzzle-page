import type { ReactNode } from 'react';
import type { BoardSize, ChessPiece, MovesMode, PieceChoice } from './generator';
import type { ChessMovesConfig } from './index';
import { PIECE_IMAGES } from './pieces';
import styles from './ChessMovesConfigBar.module.css';

interface ChessMovesConfigBarProps {
  value: ChessMovesConfig;
  onChange: (config: ChessMovesConfig) => void;
}

interface Option<T> { id: T; label: ReactNode; name?: string }

function Choice<T extends string | number | boolean>({ label, options, current, onPick }: {
  label: string; options: Option<T>[]; current: T; onPick: (id: T) => void;
}) {
  return <div className={styles.configGroup}>
    <span className={styles.label}>{label}</span>
    <div className={styles.buttonBar}>
      {options.map(option => <button key={String(option.id)} type="button"
        aria-label={option.name} title={option.name} aria-pressed={current === option.id}
        className={`${styles.button} ${current === option.id ? styles.selected : ''}`}
        onClick={() => onPick(option.id)}>{option.label}</button>)}
    </div>
  </div>;
}

const MODES: Option<MovesMode>[] = [{ id: 'where', label: 'Dot the moves' }, { id: 'collect', label: 'Collect stars' }];
const pieceOption = (id: ChessPiece, name: string): Option<PieceChoice> =>
  ({ id, name, label: <img src={PIECE_IMAGES[id]} alt="" className={styles.pieceIcon} /> });
const PIECE_OPTIONS: Option<PieceChoice>[] = [
  pieceOption('rook', 'Rook'),
  pieceOption('bishop', 'Bishop'),
  pieceOption('queen', 'Queen'),
  pieceOption('king', 'King'),
  pieceOption('knight', 'Knight'),
  { id: 'mixed', label: 'Mix', name: 'A different piece on each board' },
];
const SIZES: Option<BoardSize>[] = [{ id: 4, label: '4×4' }, { id: 5, label: '5×5' }, { id: 6, label: '6×6' }];
const STARS: Option<number>[] = [1, 2, 3, 4].map(id => ({ id, label: String(id) }));

export default function ChessMovesConfigBar({ value, onChange }: ChessMovesConfigBarProps) {
  const set = (change: Partial<ChessMovesConfig>) => onChange({ ...value, ...change });
  const collect = value.mode === 'collect';

  return (
    <div className={styles.configContainer}>
      <Choice label="Puzzle:" options={MODES} current={value.mode} onPick={mode => set({ mode })} />
      <Choice label="Piece:" options={PIECE_OPTIONS} current={value.piece} onPick={piece => set({ piece })} />
      <Choice label="Board:" options={SIZES} current={value.boardSize} onPick={boardSize => set({ boardSize })} />
      <Choice label="In the way:" options={[{ id: false, label: 'None' }, { id: true, label: 'Pawns' }]}
        current={value.blockers} onPick={blockers => set({ blockers })} />
      {collect && <Choice label="Stars:" options={STARS} current={value.stars} onPick={stars => set({ stars })} />}
      {collect && <Choice label="Fewest moves:" options={[{ id: true, label: 'Show' }, { id: false, label: 'Hide' }]}
        current={value.showMoves} onPick={showMoves => set({ showMoves })} />}
      <Choice label="Example:" options={[{ id: true, label: 'First board' }, { id: false, label: 'None' }]}
        current={value.workedExample} onPick={workedExample => set({ workedExample })} />
    </div>
  );
}
