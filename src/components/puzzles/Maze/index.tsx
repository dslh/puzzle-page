import { useMemo } from 'react';
import { generateMaze, type Maze as MazeType } from './generator';
import type { GridShape, Point } from './grids';
import type { PuzzleProps } from '../../../types/puzzle';
import styles from './Maze.module.css';

export interface MazeConfig {
  gridShape: GridShape;
  cellSizeRatio: 2 | 3 | 4;
  branchiness: 'low' | 'medium' | 'high';
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

// Simple seeded random number generator
function seededRandom(seed: number): number {
  const x = Math.sin(seed) * 10000;
  return x - Math.floor(x);
}

/**
 * Calculate maze dimensions, in square maze cells, from allocated grid cells
 * Formula: ratio:1 with margins
 * - Horizontal: 1 maze cell margin on each side (2 total)
 * - Vertical: 1.5 maze cells at top + 0.5 at bottom (2 total)
 *
 * Examples (ratio=2):
 * - 4x4 grid cells → 6x6 maze
 * - 5x5 grid cells → 8x8 maze
 *
 * Examples (ratio=3):
 * - 4x4 grid cells → 10x10 maze
 * - 5x5 grid cells → 13x13 maze
 *
 * Hex and triangle mazes are given the same area and fit as many of their own
 * cells into it as they can.
 */
function getMazeDimensions(gridWidth: number, gridHeight: number, ratio: number): { width: number; height: number } {
  return {
    width: gridWidth * ratio - 2,
    height: gridHeight * ratio - 2,
  };
}

export default function Maze({ gridWidth = 4, gridHeight = 4, seed = 0, config }: PuzzleProps<MazeConfig>) {
  const gridShape = config?.gridShape ?? 'square';
  const ratio = config?.cellSizeRatio ?? 2;
  const branchiness = config?.branchiness ?? 'medium';

  // Convert grid cells to maze cells
  const { width, height } = getMazeDimensions(gridWidth, gridHeight, ratio);

  const maze: MazeType = useMemo(() => {
    return generateMaze(width, height, seed, branchiness, gridShape);
  }, [width, height, seed, branchiness, gridShape]);

  const theme = useMemo(() => {
    const themeIndex = Math.floor(seededRandom(seed + 12345) * MAZE_THEMES.length);
    return MAZE_THEMES[themeIndex];
  }, [seed]);

  // Calculate cell size dynamically based on available grid space
  // Grid cells are approximately 72px (19mm at 96 DPI)
  const GRID_CELL_SIZE_PX = 72;
  const wallThickness = 3;

  // Calculate the maximum cell size that fits in the available space
  const availableWidth = gridWidth * GRID_CELL_SIZE_PX - wallThickness;
  const availableHeight = gridHeight * GRID_CELL_SIZE_PX - wallThickness;
  const cellSize = Math.floor(Math.min(availableWidth / maze.width, availableHeight / maze.height));

  const svgWidth = maze.width * cellSize + wallThickness;
  const svgHeight = maze.height * cellSize + wallThickness;

  // Maze coordinates to SVG pixels
  const toPx = (point: Point): Point => ({
    x: point.x * cellSize + wallThickness / 2,
    y: point.y * cellSize + wallThickness / 2,
  });

  const startCell = maze.cells[maze.start];
  const endCell = maze.cells[maze.end];
  const startCenter = toPx(startCell.center);
  const endCenter = toPx(endCell.center);

  // Shrink the markers when the cells are too small to hold them
  const markerSize = Math.min(24, 2 * maze.inradius * cellSize);

  const outline = (corners: Point[]) =>
    corners
      .map(toPx)
      .map((p) => `${p.x},${p.y}`)
      .join(' ');

  return (
    <div className={styles.mazeContainer}>
      <svg
        className={styles.mazeSvg}
        width={svgWidth}
        height={svgHeight}
        viewBox={`0 0 ${svgWidth} ${svgHeight}`}
        xmlns="http://www.w3.org/2000/svg"
      >
        {/* Draw cell backgrounds */}
        <polygon points={outline(startCell.corners)} fill={theme.startColor} opacity={0.5} />
        <polygon points={outline(endCell.corners)} fill={theme.endColor} opacity={0.5} />

        {/* Draw walls */}
        {maze.walls.map((wall, i) => {
          const from = toPx(wall.from);
          const to = toPx(wall.to);

          return (
            <line
              key={`wall-${i}`}
              x1={from.x}
              y1={from.y}
              x2={to.x}
              y2={to.y}
              stroke="#000"
              strokeWidth={wallThickness}
              strokeLinecap="round"
              strokeLinejoin="round"
            />
          );
        })}

        {/* Draw start marker */}
        <text
          x={startCenter.x}
          y={startCenter.y}
          fontSize={markerSize}
          textAnchor="middle"
          dominantBaseline="central"
        >
          {theme.start}
        </text>

        {/* Draw end marker */}
        <text
          x={endCenter.x}
          y={endCenter.y}
          fontSize={markerSize}
          textAnchor="middle"
          dominantBaseline="central"
        >
          {theme.end}
        </text>
      </svg>
    </div>
  );
}
