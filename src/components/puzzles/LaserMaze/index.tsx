import { useMemo } from 'react';
import { generateLaserMaze, type LaserMazePuzzle } from './generator';
import type { PuzzleProps } from '../../../types/puzzle';
import styles from './LaserMaze.module.css';

const GRID_CELL_SIZE_PX = 72; // 19mm at 96 DPI

export default function LaserMaze({ gridWidth, gridHeight, seed }: PuzzleProps) {
  const puzzle: LaserMazePuzzle = useMemo(() => {
    return generateLaserMaze(gridWidth, gridHeight, seed);
  }, [gridWidth, gridHeight, seed]);

  // Calculate dimensions
  const { gridSize, mirrors, entry, exits } = puzzle;

  // Layout calculations
  const padding = 40; // Space for exit labels
  const availableWidth = gridWidth * GRID_CELL_SIZE_PX - padding * 2;
  const availableHeight = gridHeight * GRID_CELL_SIZE_PX - padding * 2;
  const cellSize = Math.floor(Math.min(availableWidth / gridSize, availableHeight / gridSize));

  const gridPixelSize = cellSize * gridSize;
  const svgWidth = gridWidth * GRID_CELL_SIZE_PX;
  const svgHeight = gridHeight * GRID_CELL_SIZE_PX;

  // Center the grid
  const gridOffsetX = (svgWidth - gridPixelSize) / 2;
  const gridOffsetY = padding;

  const wallThickness = 3;
  const mirrorThickness = 2;

  // Entry opening dimensions
  const entryX = gridOffsetX + entry.position * cellSize + cellSize / 2;
  const entryOpeningHalf = cellSize * 0.3;

  return (
    <div className={styles.container}>
      <svg
        className={styles.svg}
        width={svgWidth}
        height={svgHeight}
        viewBox={`0 0 ${svgWidth} ${svgHeight}`}
        xmlns="http://www.w3.org/2000/svg"
      >
        {/* Grid background */}
        <rect
          x={gridOffsetX}
          y={gridOffsetY}
          width={gridPixelSize}
          height={gridPixelSize}
          fill="white"
          stroke="none"
        />

        {/* Walls with entry opening at top */}
        {/* Top wall - left segment */}
        <line
          x1={gridOffsetX}
          y1={gridOffsetY}
          x2={entryX - entryOpeningHalf}
          y2={gridOffsetY}
          stroke="#333"
          strokeWidth={wallThickness}
          strokeLinecap="round"
        />
        {/* Top wall - right segment */}
        <line
          x1={entryX + entryOpeningHalf}
          y1={gridOffsetY}
          x2={gridOffsetX + gridPixelSize}
          y2={gridOffsetY}
          stroke="#333"
          strokeWidth={wallThickness}
          strokeLinecap="round"
        />
        {/* Bottom wall */}
        <line
          x1={gridOffsetX}
          y1={gridOffsetY + gridPixelSize}
          x2={gridOffsetX + gridPixelSize}
          y2={gridOffsetY + gridPixelSize}
          stroke="#333"
          strokeWidth={wallThickness}
          strokeLinecap="round"
        />
        {/* Left wall */}
        <line
          x1={gridOffsetX}
          y1={gridOffsetY}
          x2={gridOffsetX}
          y2={gridOffsetY + gridPixelSize}
          stroke="#333"
          strokeWidth={wallThickness}
          strokeLinecap="round"
        />
        {/* Right wall */}
        <line
          x1={gridOffsetX + gridPixelSize}
          y1={gridOffsetY}
          x2={gridOffsetX + gridPixelSize}
          y2={gridOffsetY + gridPixelSize}
          stroke="#333"
          strokeWidth={wallThickness}
          strokeLinecap="round"
        />

        {/* Draw mirrors */}
        {mirrors.map((row, y) =>
          row.map((mirror, x) => {
            if (!mirror) return null;

            const cx = gridOffsetX + x * cellSize + cellSize / 2;
            const cy = gridOffsetY + y * cellSize + cellSize / 2;
            const mirrorLength = cellSize * 0.7;

            let x1, y1, x2, y2;
            if (mirror === '/') {
              // Forward slash: bottom-left to top-right
              x1 = cx - mirrorLength / 2;
              y1 = cy + mirrorLength / 2;
              x2 = cx + mirrorLength / 2;
              y2 = cy - mirrorLength / 2;
            } else {
              // Backslash: top-left to bottom-right
              x1 = cx - mirrorLength / 2;
              y1 = cy - mirrorLength / 2;
              x2 = cx + mirrorLength / 2;
              y2 = cy + mirrorLength / 2;
            }

            return (
              <line
                key={`mirror-${x}-${y}`}
                x1={x1}
                y1={y1}
                x2={x2}
                y2={y2}
                stroke="#333"
                strokeWidth={mirrorThickness}
                strokeLinecap="round"
              />
            );
          })
        )}

        {/* Entry point arrow */}
        {(() => {
          const entryY = gridOffsetY;
          const arrowLength = 25;
          const arrowHeadSize = 8;

          return (
            <g>
              {/* Arrow line */}
              <line
                x1={entryX}
                y1={entryY - arrowLength}
                x2={entryX}
                y2={entryY + 2}
                stroke="#e74c3c"
                strokeWidth={3}
              />
              {/* Arrow head */}
              <polygon
                points={`
                  ${entryX},${entryY + 2}
                  ${entryX - arrowHeadSize / 2},${entryY - arrowHeadSize + 2}
                  ${entryX + arrowHeadSize / 2},${entryY - arrowHeadSize + 2}
                `}
                fill="#e74c3c"
              />
              {/* Entry emoji */}
              <text
                x={entryX}
                y={entryY - arrowLength - 8}
                fontSize="18"
                textAnchor="middle"
                dominantBaseline="middle"
              >
                {entry.emoji}
              </text>
            </g>
          );
        })()}

        {/* Exit points */}
        {exits.map((exit, i) => {
          const exitY = gridOffsetY + exit.position * cellSize + cellSize / 2;
          let exitX: number;
          let textAnchor: 'start' | 'end';
          let labelOffset: number;

          if (exit.side === 'left') {
            exitX = gridOffsetX;
            textAnchor = 'end';
            labelOffset = -15;
          } else {
            exitX = gridOffsetX + gridPixelSize;
            textAnchor = 'start';
            labelOffset = 15;
          }

          return (
            <g key={`exit-${i}`}>
              {/* Exit opening in wall */}
              <line
                x1={exitX}
                y1={exitY - cellSize * 0.3}
                x2={exitX}
                y2={exitY + cellSize * 0.3}
                stroke="white"
                strokeWidth={wallThickness + 2}
              />
              {/* Exit emoji label */}
              <text
                x={exitX + labelOffset}
                y={exitY}
                fontSize="20"
                textAnchor={textAnchor}
                dominantBaseline="middle"
              >
                {exit.emoji}
              </text>
            </g>
          );
        })}

      </svg>
    </div>
  );
}
