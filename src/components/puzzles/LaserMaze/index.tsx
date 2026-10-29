import { useMemo } from 'react';
import { generateLaserMaze, type LaserMazePuzzle } from './generator';
import type { PuzzleProps } from '../../../types/puzzle';
import { CELL_SIZE_MM } from '../../../types/puzzle';
import styles from './LaserMaze.module.css';

// Everything is laid out in mm (the SVG's user unit), so line weights print
// the same at every size.
const EDGE_MM = 2;
const PICTURE_GAP_MM = 1.5;
const WALL_MM = 0.9;
const MIRROR_MM = 1.9; // ink outline; the glass inside is MIRROR_GLASS_MM
const MIRROR_GLASS_MM = 1;
const DOT_MM = 0.8;

const clamp = (v: number, lo: number, hi: number) => Math.min(hi, Math.max(lo, v));
const pictureSize = (cell: number) => clamp(cell * 0.55, 6, 10);
const torchSize = (cell: number) => clamp(cell * 0.85, 9, 15);
const beamLength = (cell: number) => clamp(cell * 0.35, 3, 7);

/** The square cell size that fits the box, its side pictures and the torch band. */
function fitCell(width: number, height: number, n: number) {
  let cell = Math.min(width, height) / (n + 1);
  // Margins grow with the cell, so settle on a size in a few passes.
  for (let i = 0; i < 4; i++) {
    const side = EDGE_MM + pictureSize(cell) + PICTURE_GAP_MM;
    const top = EDGE_MM + torchSize(cell) + beamLength(cell);
    cell = Math.min((width - 2 * side) / n, (height - top - EDGE_MM) / n);
  }
  return cell;
}

/** A torch pointing down, its lens centred on (x, y). */
function Torch({ x, y, size }: { x: number; y: number; size: number }) {
  const bodyW = size * 0.36;
  const bodyH = size * 0.58;
  const headW = size * 0.66;
  const headH = size * 0.3;
  const lensH = size * 0.12;
  const headTop = y - lensH - headH;
  const bodyTop = headTop - bodyH;
  return (
    <g>
      <rect
        className={styles.torchBody}
        x={x - bodyW / 2}
        y={bodyTop}
        width={bodyW}
        height={bodyH + size * 0.05}
        rx={bodyW * 0.3}
      />
      <rect
        className={styles.torchSwitch}
        x={x - bodyW * 0.2}
        y={bodyTop + bodyH * 0.3}
        width={bodyW * 0.4}
        height={bodyH * 0.3}
        rx={bodyW * 0.1}
      />
      <path
        className={styles.torchHead}
        d={`M ${x - bodyW / 2} ${headTop} L ${x + bodyW / 2} ${headTop}
            L ${x + headW / 2} ${headTop + headH} L ${x - headW / 2} ${headTop + headH} Z`}
      />
      <rect
        className={styles.torchLens}
        x={x - headW / 2}
        y={y - lensH}
        width={headW}
        height={lensH}
        rx={lensH * 0.4}
      />
    </g>
  );
}

export default function LaserMaze({ gridWidth, gridHeight, seed }: PuzzleProps) {
  const puzzle: LaserMazePuzzle = useMemo(() => {
    return generateLaserMaze(gridWidth, gridHeight, seed);
  }, [gridWidth, gridHeight, seed]);

  const { gridSize: n, mirrors, entry, exits } = puzzle;

  const width = gridWidth * CELL_SIZE_MM;
  const height = gridHeight * CELL_SIZE_MM;
  const cell = fitCell(width, height, n);
  const picture = pictureSize(cell);
  const torch = torchSize(cell);
  const beam = beamLength(cell);
  const box = cell * n;

  // Centre the torch band, box and bottom edge as one block.
  const blockHeight = torch + beam + box;
  const left = (width - box) / 2;
  const top = (height - blockHeight) / 2 + torch + beam;
  const right = left + box;
  const bottom = top + box;

  const openingHalf = cell * 0.25;
  const entryX = left + (entry.position + 0.5) * cell;
  const rowY = (row: number) => top + (row + 0.5) * cell;

  // Walls, broken by the opening at the top and one beside every row.
  const walls = [
    `M ${left} ${top} L ${entryX - openingHalf} ${top}`,
    `M ${entryX + openingHalf} ${top} L ${right} ${top}`,
    `M ${left} ${bottom} L ${right} ${bottom}`,
  ];
  for (const x of [left, right]) {
    let from = top;
    for (let row = 0; row < n; row++) {
      walls.push(`M ${x} ${from} L ${x} ${rowY(row) - openingHalf}`);
      from = rowY(row) + openingHalf;
    }
    walls.push(`M ${x} ${from} L ${x} ${bottom}`);
  }

  const reach = cell * 0.36; // half a mirror's width and height

  return (
    <div className={styles.container}>
      <svg
        className={styles.svg}
        width={`${width}mm`}
        height={`${height}mm`}
        viewBox={`0 0 ${width} ${height}`}
        xmlns="http://www.w3.org/2000/svg"
      >
        {/* The torch's light, spreading to the opening */}
        <path
          className={styles.beam}
          d={`M ${entryX - torch * 0.33} ${top - beam} L ${entryX + torch * 0.33} ${top - beam}
              L ${entryX + openingHalf} ${top} L ${entryX - openingHalf} ${top} Z`}
        />
        <Torch x={entryX} y={top - beam} size={torch} />

        <path className={styles.wall} d={walls.join(' ')} strokeWidth={WALL_MM} />

        {mirrors.map((row, y) =>
          row.map((mirror, x) => {
            const cx = left + (x + 0.5) * cell;
            const cy = top + (y + 0.5) * cell;
            if (!mirror) {
              // A dot in each empty square, for counting along a row
              return <circle key={`${x}-${y}`} className={styles.dot} cx={cx} cy={cy} r={DOT_MM} />;
            }
            const dy = mirror === '/' ? reach : -reach;
            const d = `M ${cx - reach} ${cy + dy} L ${cx + reach} ${cy - dy}`;
            return (
              <g key={`${x}-${y}`}>
                <path className={styles.mirrorEdge} d={d} strokeWidth={MIRROR_MM} />
                <path className={styles.mirrorGlass} d={d} strokeWidth={MIRROR_GLASS_MM} />
              </g>
            );
          })
        )}

        {exits.map(exit => {
          const offset = PICTURE_GAP_MM + picture / 2;
          return (
            <text
              key={`${exit.side}-${exit.position}`}
              className={styles.picture}
              x={exit.side === 'left' ? left - offset : right + offset}
              y={rowY(exit.position)}
              fontSize={picture}
              textAnchor="middle"
              dominantBaseline="central"
            >
              {exit.emoji}
            </text>
          );
        })}
      </svg>
    </div>
  );
}
