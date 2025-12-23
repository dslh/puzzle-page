import React, { useMemo } from 'react';
import {
  generateWeavingMaze,
  type WeavingMaze as WeavingMazeType,
  type WeavingCell,
  type CrossingDensity,
} from './generator';
import type { PuzzleProps } from '../../../types/puzzle';
import styles from './WeavingMaze.module.css';

export interface WeavingMazeConfig {
  cellSizeRatio: 2 | 3 | 4;
  crossingDensity: CrossingDensity;
}

interface MazeTheme {
  start: string;
  end: string;
  startColor: string;
  endColor: string;
}

const MAZE_THEMES: MazeTheme[] = [
  { start: '🐭', end: '🧀', startColor: '#90EE90', endColor: '#FFB6C1' },
  { start: '🐕', end: '🦴', startColor: '#DEB887', endColor: '#F5F5DC' },
  { start: '🐝', end: '🌸', startColor: '#FFD700', endColor: '#FFB6C1' },
  { start: '🐱', end: '🐭', startColor: '#FFA07A', endColor: '#D3D3D3' },
  { start: '🚀', end: '🌙', startColor: '#87CEEB', endColor: '#F0E68C' },
  { start: '👶', end: '👩', startColor: '#FFE4E1', endColor: '#FFB6C1' },
  { start: '🐰', end: '🥕', startColor: '#F5F5DC', endColor: '#FFA500' },
  { start: '🐻', end: '🍯', startColor: '#DEB887', endColor: '#FFD700' },
  { start: '🐿️', end: '🌰', startColor: '#CD853F', endColor: '#8B4513' },
  { start: '🐞', end: '🍃', startColor: '#FF6347', endColor: '#90EE90' },
  { start: '🦋', end: '🌺', startColor: '#DA70D6', endColor: '#FF69B4' },
  { start: '🐨', end: '🌿', startColor: '#C0C0C0', endColor: '#90EE90' },
  { start: '🦊', end: '🏠', startColor: '#FF8C00', endColor: '#D2691E' },
  { start: '🐧', end: '🐟', startColor: '#B0E0E6', endColor: '#87CEEB' },
  { start: '🐌', end: '🥬', startColor: '#F4A460', endColor: '#90EE90' },
  { start: '🦔', end: '🍎', startColor: '#DEB887', endColor: '#FF6347' },
  { start: '🧚', end: '⭐', startColor: '#FFB6C1', endColor: '#FFD700' },
  { start: '🐉', end: '💎', startColor: '#90EE90', endColor: '#87CEEB' },
  { start: '🤖', end: '🔋', startColor: '#C0C0C0', endColor: '#90EE90' },
  { start: '👻', end: '🏚️', startColor: '#F0F0F0', endColor: '#8B4513' },
  { start: '🧙', end: '🔮', startColor: '#9370DB', endColor: '#DDA0DD' },
  { start: '🚗', end: '🏁', startColor: '#FF6347', endColor: '#000000' },
  { start: '⚽', end: '🥅', startColor: '#FFFFFF', endColor: '#90EE90' },
  { start: '🔑', end: '🔓', startColor: '#FFD700', endColor: '#C0C0C0' },
  { start: '🐜', end: '🧁', startColor: '#8B4513', endColor: '#FFB6C1' },
];

function seededRandom(seed: number): number {
  const x = Math.sin(seed) * 10000;
  return x - Math.floor(x);
}

function getMazeDimensions(
  gridWidth: number,
  gridHeight: number,
  ratio: number
): { width: number; height: number } {
  return {
    width: gridWidth * ratio - 2,
    height: gridHeight * ratio - 2,
  };
}

export default function WeavingMaze({
  gridWidth = 5,
  gridHeight = 5,
  seed = 0,
  config,
}: PuzzleProps<WeavingMazeConfig>) {
  const ratio = config?.cellSizeRatio ?? 2;
  const crossingDensity = config?.crossingDensity ?? 'medium';

  const { width, height } = getMazeDimensions(gridWidth, gridHeight, ratio);

  const maze: WeavingMazeType = useMemo(() => {
    return generateWeavingMaze(width, height, seed, crossingDensity);
  }, [width, height, seed, crossingDensity]);

  const theme = useMemo(() => {
    const themeIndex = Math.floor(
      seededRandom(seed + 12345) * MAZE_THEMES.length
    );
    return MAZE_THEMES[themeIndex];
  }, [seed]);

  const GRID_CELL_SIZE_PX = 72;
  const margin = 4;

  const availableWidth = gridWidth * GRID_CELL_SIZE_PX - margin * 2;
  const availableHeight = gridHeight * GRID_CELL_SIZE_PX - margin * 2;
  const cellSize = Math.floor(
    Math.min(availableWidth / maze.width, availableHeight / maze.height)
  );

  const pathWidth = Math.max(8, Math.floor(cellSize * 0.55));
  const borderWidth = 2;
  const gapSize = pathWidth + 6;

  const svgWidth = maze.width * cellSize + margin * 2;
  const svgHeight = maze.height * cellSize + margin * 2;
  const offset = margin;

  // Collect all path segments, separating under and over paths
  const underPaths: React.ReactNode[] = [];
  const overPaths: React.ReactNode[] = [];
  const borderPaths: React.ReactNode[] = [];

  maze.grid.forEach((row, y) => {
    row.forEach((cell, x) => {
      const cx = x * cellSize + cellSize / 2 + offset;
      const cy = y * cellSize + cellSize / 2 + offset;

      if (cell.crossing) {
        // Handle crossing cell - draw under paths with gap
        const overDir = cell.crossing.overDirection;

        if (overDir === 'vertical') {
          // Horizontal is under (draw with gap), vertical is over
          if (cell.connections.left) {
            const x1 = x * cellSize + offset;
            const x2 = cx - gapSize / 2;
            underPaths.push(
              <line
                key={`under-h-left-${x}-${y}`}
                x1={x1}
                y1={cy}
                x2={x2}
                y2={cy}
                stroke="#e0e0e0"
                strokeWidth={pathWidth}
                strokeLinecap="round"
              />
            );
            borderPaths.push(
              <line
                key={`border-h-left-top-${x}-${y}`}
                x1={x1}
                y1={cy - pathWidth / 2}
                x2={x2}
                y2={cy - pathWidth / 2}
                stroke="#666"
                strokeWidth={borderWidth}
              />,
              <line
                key={`border-h-left-bot-${x}-${y}`}
                x1={x1}
                y1={cy + pathWidth / 2}
                x2={x2}
                y2={cy + pathWidth / 2}
                stroke="#666"
                strokeWidth={borderWidth}
              />
            );
          }
          if (cell.connections.right) {
            const x1 = cx + gapSize / 2;
            const x2 = (x + 1) * cellSize + offset;
            underPaths.push(
              <line
                key={`under-h-right-${x}-${y}`}
                x1={x1}
                y1={cy}
                x2={x2}
                y2={cy}
                stroke="#e0e0e0"
                strokeWidth={pathWidth}
                strokeLinecap="round"
              />
            );
            borderPaths.push(
              <line
                key={`border-h-right-top-${x}-${y}`}
                x1={x1}
                y1={cy - pathWidth / 2}
                x2={x2}
                y2={cy - pathWidth / 2}
                stroke="#666"
                strokeWidth={borderWidth}
              />,
              <line
                key={`border-h-right-bot-${x}-${y}`}
                x1={x1}
                y1={cy + pathWidth / 2}
                x2={x2}
                y2={cy + pathWidth / 2}
                stroke="#666"
                strokeWidth={borderWidth}
              />
            );
          }
          // Vertical over path
          const y1 = y * cellSize + offset;
          const y2 = (y + 1) * cellSize + offset;
          overPaths.push(
            <line
              key={`over-v-${x}-${y}`}
              x1={cx}
              y1={y1}
              x2={cx}
              y2={y2}
              stroke="#e0e0e0"
              strokeWidth={pathWidth}
              strokeLinecap="round"
            />
          );
          overPaths.push(
            <line
              key={`border-over-v-left-${x}-${y}`}
              x1={cx - pathWidth / 2}
              y1={y1}
              x2={cx - pathWidth / 2}
              y2={y2}
              stroke="#666"
              strokeWidth={borderWidth}
            />,
            <line
              key={`border-over-v-right-${x}-${y}`}
              x1={cx + pathWidth / 2}
              y1={y1}
              x2={cx + pathWidth / 2}
              y2={y2}
              stroke="#666"
              strokeWidth={borderWidth}
            />
          );
        } else {
          // Vertical is under (draw with gap), horizontal is over
          if (cell.connections.top) {
            const y1 = y * cellSize + offset;
            const y2 = cy - gapSize / 2;
            underPaths.push(
              <line
                key={`under-v-top-${x}-${y}`}
                x1={cx}
                y1={y1}
                x2={cx}
                y2={y2}
                stroke="#e0e0e0"
                strokeWidth={pathWidth}
                strokeLinecap="round"
              />
            );
            borderPaths.push(
              <line
                key={`border-v-top-left-${x}-${y}`}
                x1={cx - pathWidth / 2}
                y1={y1}
                x2={cx - pathWidth / 2}
                y2={y2}
                stroke="#666"
                strokeWidth={borderWidth}
              />,
              <line
                key={`border-v-top-right-${x}-${y}`}
                x1={cx + pathWidth / 2}
                y1={y1}
                x2={cx + pathWidth / 2}
                y2={y2}
                stroke="#666"
                strokeWidth={borderWidth}
              />
            );
          }
          if (cell.connections.bottom) {
            const y1 = cy + gapSize / 2;
            const y2 = (y + 1) * cellSize + offset;
            underPaths.push(
              <line
                key={`under-v-bottom-${x}-${y}`}
                x1={cx}
                y1={y1}
                x2={cx}
                y2={y2}
                stroke="#e0e0e0"
                strokeWidth={pathWidth}
                strokeLinecap="round"
              />
            );
            borderPaths.push(
              <line
                key={`border-v-bot-left-${x}-${y}`}
                x1={cx - pathWidth / 2}
                y1={y1}
                x2={cx - pathWidth / 2}
                y2={y2}
                stroke="#666"
                strokeWidth={borderWidth}
              />,
              <line
                key={`border-v-bot-right-${x}-${y}`}
                x1={cx + pathWidth / 2}
                y1={y1}
                x2={cx + pathWidth / 2}
                y2={y2}
                stroke="#666"
                strokeWidth={borderWidth}
              />
            );
          }
          // Horizontal over path
          const x1 = x * cellSize + offset;
          const x2 = (x + 1) * cellSize + offset;
          overPaths.push(
            <line
              key={`over-h-${x}-${y}`}
              x1={x1}
              y1={cy}
              x2={x2}
              y2={cy}
              stroke="#e0e0e0"
              strokeWidth={pathWidth}
              strokeLinecap="round"
            />
          );
          overPaths.push(
            <line
              key={`border-over-h-top-${x}-${y}`}
              x1={x1}
              y1={cy - pathWidth / 2}
              x2={x2}
              y2={cy - pathWidth / 2}
              stroke="#666"
              strokeWidth={borderWidth}
            />,
            <line
              key={`border-over-h-bot-${x}-${y}`}
              x1={x1}
              y1={cy + pathWidth / 2}
              x2={x2}
              y2={cy + pathWidth / 2}
              stroke="#666"
              strokeWidth={borderWidth}
            />
          );
        }
      } else {
        // Regular cell - draw path segments from center to connected edges
        renderRegularCell(
          cell,
          x,
          y,
          cx,
          cy,
          cellSize,
          offset,
          pathWidth,
          borderWidth,
          underPaths,
          borderPaths
        );
      }
    });
  });

  return (
    <div className={styles.mazeContainer}>
      <svg
        className={styles.mazeSvg}
        width={svgWidth}
        height={svgHeight}
        viewBox={`0 0 ${svgWidth} ${svgHeight}`}
        xmlns="http://www.w3.org/2000/svg"
      >
        {/* Background for start/end cells */}
        <rect
          x={maze.start.x * cellSize + offset}
          y={maze.start.y * cellSize + offset}
          width={cellSize}
          height={cellSize}
          fill={theme.startColor}
          opacity={0.5}
        />
        <rect
          x={maze.end.x * cellSize + offset}
          y={maze.end.y * cellSize + offset}
          width={cellSize}
          height={cellSize}
          fill={theme.endColor}
          opacity={0.5}
        />

        {/* Layer 1: Under paths and regular paths */}
        <g className={styles.pathsUnder}>{underPaths}</g>

        {/* Layer 2: Border paths for under layer */}
        <g className={styles.pathBorders}>{borderPaths}</g>

        {/* Layer 3: Over paths at crossings (rendered on top) */}
        <g className={styles.pathsOver}>{overPaths}</g>

        {/* Start marker */}
        <text
          x={maze.start.x * cellSize + cellSize / 2 + offset}
          y={maze.start.y * cellSize + cellSize / 2 + offset}
          fontSize={Math.max(16, cellSize * 0.6)}
          textAnchor="middle"
          dominantBaseline="central"
        >
          {theme.start}
        </text>

        {/* End marker */}
        <text
          x={maze.end.x * cellSize + cellSize / 2 + offset}
          y={maze.end.y * cellSize + cellSize / 2 + offset}
          fontSize={Math.max(16, cellSize * 0.6)}
          textAnchor="middle"
          dominantBaseline="central"
        >
          {theme.end}
        </text>
      </svg>
    </div>
  );
}

function renderRegularCell(
  cell: WeavingCell,
  x: number,
  y: number,
  cx: number,
  cy: number,
  cellSize: number,
  offset: number,
  pathWidth: number,
  borderWidth: number,
  paths: React.ReactNode[],
  borders: React.ReactNode[]
) {
  // Draw path from center to each connected direction
  if (cell.connections.top) {
    const y1 = y * cellSize + offset;
    paths.push(
      <line
        key={`path-top-${x}-${y}`}
        x1={cx}
        y1={cy}
        x2={cx}
        y2={y1}
        stroke="#e0e0e0"
        strokeWidth={pathWidth}
        strokeLinecap="round"
      />
    );
    borders.push(
      <line
        key={`border-top-left-${x}-${y}`}
        x1={cx - pathWidth / 2}
        y1={cy}
        x2={cx - pathWidth / 2}
        y2={y1}
        stroke="#666"
        strokeWidth={borderWidth}
      />,
      <line
        key={`border-top-right-${x}-${y}`}
        x1={cx + pathWidth / 2}
        y1={cy}
        x2={cx + pathWidth / 2}
        y2={y1}
        stroke="#666"
        strokeWidth={borderWidth}
      />
    );
  }

  if (cell.connections.right) {
    const x2 = (x + 1) * cellSize + offset;
    paths.push(
      <line
        key={`path-right-${x}-${y}`}
        x1={cx}
        y1={cy}
        x2={x2}
        y2={cy}
        stroke="#e0e0e0"
        strokeWidth={pathWidth}
        strokeLinecap="round"
      />
    );
    borders.push(
      <line
        key={`border-right-top-${x}-${y}`}
        x1={cx}
        y1={cy - pathWidth / 2}
        x2={x2}
        y2={cy - pathWidth / 2}
        stroke="#666"
        strokeWidth={borderWidth}
      />,
      <line
        key={`border-right-bot-${x}-${y}`}
        x1={cx}
        y1={cy + pathWidth / 2}
        x2={x2}
        y2={cy + pathWidth / 2}
        stroke="#666"
        strokeWidth={borderWidth}
      />
    );
  }

  if (cell.connections.bottom) {
    const y2 = (y + 1) * cellSize + offset;
    paths.push(
      <line
        key={`path-bottom-${x}-${y}`}
        x1={cx}
        y1={cy}
        x2={cx}
        y2={y2}
        stroke="#e0e0e0"
        strokeWidth={pathWidth}
        strokeLinecap="round"
      />
    );
    borders.push(
      <line
        key={`border-bottom-left-${x}-${y}`}
        x1={cx - pathWidth / 2}
        y1={cy}
        x2={cx - pathWidth / 2}
        y2={y2}
        stroke="#666"
        strokeWidth={borderWidth}
      />,
      <line
        key={`border-bottom-right-${x}-${y}`}
        x1={cx + pathWidth / 2}
        y1={cy}
        x2={cx + pathWidth / 2}
        y2={y2}
        stroke="#666"
        strokeWidth={borderWidth}
      />
    );
  }

  if (cell.connections.left) {
    const x1 = x * cellSize + offset;
    paths.push(
      <line
        key={`path-left-${x}-${y}`}
        x1={cx}
        y1={cy}
        x2={x1}
        y2={cy}
        stroke="#e0e0e0"
        strokeWidth={pathWidth}
        strokeLinecap="round"
      />
    );
    borders.push(
      <line
        key={`border-left-top-${x}-${y}`}
        x1={cx}
        y1={cy - pathWidth / 2}
        x2={x1}
        y2={cy - pathWidth / 2}
        stroke="#666"
        strokeWidth={borderWidth}
      />,
      <line
        key={`border-left-bot-${x}-${y}`}
        x1={cx}
        y1={cy + pathWidth / 2}
        x2={x1}
        y2={cy + pathWidth / 2}
        stroke="#666"
        strokeWidth={borderWidth}
      />
    );
  }
}
