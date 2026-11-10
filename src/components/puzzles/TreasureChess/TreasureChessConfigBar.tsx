import type { ReactNode } from 'react';
import { PIECE_IMAGES } from '../ChessMoves/pieces';
import type { PieceChoice, TreasureLength, TreasurePiece } from './generator';
import type { TreasureChessConfig } from './index';
import styles from '../ChessMoves/ChessMovesConfigBar.module.css';

interface TreasureChessConfigBarProps {
  value: TreasureChessConfig;
  onChange: (config: TreasureChessConfig) => void;
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

const pieceOption = (id: TreasurePiece, name: string): Option<PieceChoice> =>
  ({ id, name, label: <img src={PIECE_IMAGES[id]} alt="" className={styles.pieceIcon} /> });
const PIECE_OPTIONS: Option<PieceChoice>[] = [
  pieceOption('rook', 'Rook'),
  pieceOption('bishop', 'Bishop'),
  pieceOption('knight', 'Knight'),
  pieceOption('queen', 'Queen'),
  { id: 'mixed', label: 'Mix', name: 'Any of the four, a new one each time' },
];
const LENGTHS: Option<TreasureLength>[] = [
  { id: 'short', label: 'Short', name: 'About 3 moves' },
  { id: 'medium', label: 'Medium', name: '4 moves' },
  { id: 'long', label: 'Long', name: '5 or 6 moves' },
];
const COLLECT: Option<number>[] = [
  { id: 0, label: 'None' },
  ...[1, 2, 3].map(id => ({ id, label: String(id), name: `${id} compass${id > 1 ? 'es' : ''} or flag${id > 1 ? 's' : ''} on the way` })),
];

export default function TreasureChessConfigBar({ value, onChange }: TreasureChessConfigBarProps) {
  const set = (change: Partial<TreasureChessConfig>) => onChange({ ...value, ...change });

  return (
    <div className={styles.configContainer}>
      <Choice label="Piece:" options={PIECE_OPTIONS} current={value.piece} onPick={piece => set({ piece })} />
      <Choice label="Length:" options={LENGTHS} current={value.length} onPick={length => set({ length })} />
      <Choice label="Collect:" options={COLLECT} current={value.collect} onPick={collect => set({ collect })} />
      <Choice label="Fewest moves:" options={[{ id: true, label: 'Show' }, { id: false, label: 'Hide' }]}
        current={value.showMoves} onPick={showMoves => set({ showMoves })} />
    </div>
  );
}
