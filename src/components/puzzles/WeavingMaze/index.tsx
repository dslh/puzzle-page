import { useMemo } from 'react';
import {
  generateWeavingMaze,
  type WeavingMaze as WeavingMazeType,
  type WeavingCell,
  type Bridge,
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

interface PathSegment {
  x1: number;
  y1: number;
  x2: number;
  y2: number;
  key: string;
  linecap?: 'round' | 'butt';
}

// Find if a bridge passes over a given cell
function findBridgePassingOver(
  x: number,
  y: number,
  bridges: Bridge[]
): Bridge | null {
  for (const bridge of bridges) {
    for (const segment of bridge.segments) {
      if (segment.x === x && segment.y === y) {
        return bridge;
      }
    }
  }
  return null;
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
  const borderWidth = 3;
  const gapSize = pathWidth + borderWidth * 2 + 4;

  const svgWidth = maze.width * cellSize + margin * 2;
  const svgHeight = maze.height * cellSize + margin * 2;
  const offset = margin;

  // Collect path segments in layers
  const underSegments: PathSegment[] = [];
  const overSegments: PathSegment[] = [];

  // Collect regular cell path segments
  maze.grid.forEach((row, y) => {
    row.forEach((cell, x) => {
      const cx = x * cellSize + cellSize / 2 + offset;
      const cy = y * cellSize + cellSize / 2 + offset;

      const bridgeOver = findBridgePassingOver(x, y, maze.bridges);

      if (bridgeOver) {
        // This cell has a bridge passing over it - draw with gap
        const bridgeDir = bridgeOver.direction;

        if (bridgeDir === 'horizontal') {
          // Horizontal bridge passes over - vertical passages get gap
          if (cell.connections.top) {
            underSegments.push({
              x1: cx,
              y1: y * cellSize + offset,
              x2: cx,
              y2: cy - gapSize / 2,
              key: `under-v-top-${x}-${y}`,
              linecap: 'butt',
            });
          }
          if (cell.connections.bottom) {
            underSegments.push({
              x1: cx,
              y1: cy + gapSize / 2,
              x2: cx,
              y2: (y + 1) * cellSize + offset,
              key: `under-v-bottom-${x}-${y}`,
              linecap: 'butt',
            });
          }
          // Horizontal connections are under but continuous (no gap)
          if (cell.connections.left) {
            underSegments.push({
              x1: x * cellSize + offset,
              y1: cy,
              x2: cx,
              y2: cy,
              key: `path-left-${x}-${y}`,
            });
          }
          if (cell.connections.right) {
            underSegments.push({
              x1: cx,
              y1: cy,
              x2: (x + 1) * cellSize + offset,
              y2: cy,
              key: `path-right-${x}-${y}`,
            });
          }
        } else {
          // Vertical bridge passes over - horizontal passages get gap
          if (cell.connections.left) {
            underSegments.push({
              x1: x * cellSize + offset,
              y1: cy,
              x2: cx - gapSize / 2,
              y2: cy,
              key: `under-h-left-${x}-${y}`,
              linecap: 'butt',
            });
          }
          if (cell.connections.right) {
            underSegments.push({
              x1: cx + gapSize / 2,
              y1: cy,
              x2: (x + 1) * cellSize + offset,
              y2: cy,
              key: `under-h-right-${x}-${y}`,
              linecap: 'butt',
            });
          }
          // Vertical connections are under but continuous (no gap)
          if (cell.connections.top) {
            underSegments.push({
              x1: cx,
              y1: y * cellSize + offset,
              x2: cx,
              y2: cy,
              key: `path-top-${x}-${y}`,
            });
          }
          if (cell.connections.bottom) {
            underSegments.push({
              x1: cx,
              y1: cy,
              x2: cx,
              y2: (y + 1) * cellSize + offset,
              key: `path-bottom-${x}-${y}`,
            });
          }
        }
      } else {
        // Regular cell - draw path segments from center to connected edges
        collectRegularCellSegments(cell, x, y, cx, cy, cellSize, offset, underSegments);
      }
    });
  });

  // Collect bridge segments (over layer)
  maze.bridges.forEach((bridge, bridgeIndex) => {
    const startCx = bridge.start.x * cellSize + cellSize / 2 + offset;
    const startCy = bridge.start.y * cellSize + cellSize / 2 + offset;
    const endCx = bridge.end.x * cellSize + cellSize / 2 + offset;
    const endCy = bridge.end.y * cellSize + cellSize / 2 + offset;

    overSegments.push({
      x1: startCx,
      y1: startCy,
      x2: endCx,
      y2: endCy,
      key: `bridge-${bridgeIndex}`,
      linecap: 'butt',
    });
  });

  const renderSegments = (segments: PathSegment[], prefix: string) => (
    <>
      {/* Border layer (thicker, darker) */}
      {segments.map((seg) => (
        <line
          key={`${prefix}-border-${seg.key}`}
          x1={seg.x1}
          y1={seg.y1}
          x2={seg.x2}
          y2={seg.y2}
          stroke="#666"
          strokeWidth={pathWidth + borderWidth * 2}
          strokeLinecap={seg.linecap ?? 'round'}
          strokeLinejoin="round"
        />
      ))}
      {/* Fill layer (thinner, lighter) */}
      {segments.map((seg) => (
        <line
          key={`${prefix}-fill-${seg.key}`}
          x1={seg.x1}
          y1={seg.y1}
          x2={seg.x2}
          y2={seg.y2}
          stroke="#e0e0e0"
          strokeWidth={pathWidth}
          strokeLinecap={seg.linecap ?? 'round'}
          strokeLinejoin="round"
        />
      ))}
    </>
  );

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

        {/* Layer 1: Under paths (includes regular paths and under-segments at crossings) */}
        <g className={styles.pathsUnder}>
          {renderSegments(underSegments, 'under')}
        </g>

        {/* Layer 2: Over paths (bridges) */}
        <g className={styles.pathsOver}>
          {/* Side borders only (no end caps) */}
          {overSegments.map((seg) => {
            const isVertical = seg.x1 === seg.x2;
            const halfPath = pathWidth / 2;

            if (isVertical) {
              // Vertical bridge: draw left and right border lines
              return (
                <g key={`over-borders-${seg.key}`}>
                  <line
                    x1={seg.x1 - halfPath}
                    y1={seg.y1}
                    x2={seg.x2 - halfPath}
                    y2={seg.y2}
                    stroke="#666"
                    strokeWidth={borderWidth}
                  />
                  <line
                    x1={seg.x1 + halfPath}
                    y1={seg.y1}
                    x2={seg.x2 + halfPath}
                    y2={seg.y2}
                    stroke="#666"
                    strokeWidth={borderWidth}
                  />
                </g>
              );
            } else {
              // Horizontal bridge: draw top and bottom border lines
              return (
                <g key={`over-borders-${seg.key}`}>
                  <line
                    x1={seg.x1}
                    y1={seg.y1 - halfPath}
                    x2={seg.x2}
                    y2={seg.y2 - halfPath}
                    stroke="#666"
                    strokeWidth={borderWidth}
                  />
                  <line
                    x1={seg.x1}
                    y1={seg.y1 + halfPath}
                    x2={seg.x2}
                    y2={seg.y2 + halfPath}
                    stroke="#666"
                    strokeWidth={borderWidth}
                  />
                </g>
              );
            }
          })}
          {/* Fill layer */}
          {overSegments.map((seg) => (
            <line
              key={`over-fill-${seg.key}`}
              x1={seg.x1}
              y1={seg.y1}
              x2={seg.x2}
              y2={seg.y2}
              stroke="#e0e0e0"
              strokeWidth={pathWidth}
              strokeLinecap="butt"
            />
          ))}
        </g>

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

function collectRegularCellSegments(
  cell: WeavingCell,
  x: number,
  y: number,
  cx: number,
  cy: number,
  cellSize: number,
  offset: number,
  segments: PathSegment[]
) {
  if (cell.connections.top) {
    segments.push({
      x1: cx,
      y1: cy,
      x2: cx,
      y2: y * cellSize + offset,
      key: `path-top-${x}-${y}`,
    });
  }

  if (cell.connections.right) {
    segments.push({
      x1: cx,
      y1: cy,
      x2: (x + 1) * cellSize + offset,
      y2: cy,
      key: `path-right-${x}-${y}`,
    });
  }

  if (cell.connections.bottom) {
    segments.push({
      x1: cx,
      y1: cy,
      x2: cx,
      y2: (y + 1) * cellSize + offset,
      key: `path-bottom-${x}-${y}`,
    });
  }

  if (cell.connections.left) {
    segments.push({
      x1: cx,
      y1: cy,
      x2: x * cellSize + offset,
      y2: cy,
      key: `path-left-${x}-${y}`,
    });
  }
}
