import { useMemo } from 'react';
import { curvePath, wallRuns } from './curves';
import { clearance } from './concentric';
import { generateMaze, generateRegionMaze, type Grain, type Maze as MazeType, type Turns } from './generator';
import type { GridShape, Point } from './grids';
import { MAZE_THEMES, themeId } from './themes';
import type { PuzzleProps } from '../../../types/puzzle';
import { flowingPath } from '../../../utils/flowingPath';
import AnswerPath from '../../AnswerPath';
import styles from './Maze.module.css';

export interface MazeConfig {
  gridShape: GridShape;
  cellSizeRatio: 2 | 3 | 4;
  branchiness: 'low' | 'medium' | 'high';
  /** Who starts and where they are going: a themeId, or 'random' to let the seed pick. */
  theme: string;
  /** Draw the walls as flowing curves rather than straight lines. */
  curvyWalls: boolean;
  /** Which way the passages tend to run */
  grain: Grain;
  /** Whether the passages tend to run straight or zig-zag */
  turns: Turns;
  /** What the answer route draws: 'none', a shape's id ('heart', see hidden.ts) or 'word' */
  picture: string;
  /** The word it spells when picture is 'word' */
  word: string;
}

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

export default function Maze({ showAnswers = false, gridWidth = 4, gridHeight = 4, seed = 0, config, region }: PuzzleProps<MazeConfig>) {
  const gridShape = config?.gridShape ?? 'square';
  const ratio = config?.cellSizeRatio ?? 2;
  const branchiness = config?.branchiness ?? 'medium';
  const themeChoice = config?.theme ?? 'random';
  const curvyWalls = config?.curvyWalls ?? false;
  const grain = config?.grain ?? 'even';
  const turns = config?.turns ?? 'mixed';
  // Not in the gaps, which are no shape to centre a picture in
  const picture = region === undefined && config?.picture && config.picture !== 'none' ? config.picture : undefined;
  const word = config?.word ?? '';

  // Convert grid cells to maze cells
  const { width, height } = getMazeDimensions(gridWidth, gridHeight, ratio);

  // A filler fills the free squares of the whole page instead
  const maze: MazeType | null = useMemo(() => {
    return region !== undefined
      ? generateRegionMaze(region, ratio, seed, branchiness, gridShape, { grain, turns })
      : generateMaze(width, height, seed, branchiness, gridShape, { grain, turns, picture, word });
  }, [region, ratio, width, height, seed, branchiness, gridShape, grain, turns, picture, word]);

  const answerClearance = useMemo(() => maze ? Math.min(...maze.solution.map(index => {
    const cell = maze.cells[index];
    return clearance(cell.center, cell.corners);
  })) : 0, [maze]);

  const runs = useMemo(() => (maze && curvyWalls ? wallRuns(maze.walls) : []), [maze, curvyWalls]);

  const theme = useMemo(() => {
    const chosen = MAZE_THEMES.find((t) => themeId(t) === themeChoice);
    if (chosen) return chosen;
    const themeIndex = Math.floor(seededRandom(seed + 12345) * MAZE_THEMES.length);
    return MAZE_THEMES[themeIndex];
  }, [seed, themeChoice]);

  // No room for a maze in the gaps
  if (!maze) return null;

  // Calculate cell size dynamically based on available grid space
  // Grid cells are approximately 72px (19mm at 96 DPI)
  const GRID_CELL_SIZE_PX = 72;
  const wallThickness = 3;

  // Calculate the maximum cell size that fits in the available space. A
  // filler's maze is laid out on the page itself, so it is drawn to scale
  // over the whole page and its walls keep clear of the other puzzles.
  const availableWidth = gridWidth * GRID_CELL_SIZE_PX - wallThickness;
  const availableHeight = gridHeight * GRID_CELL_SIZE_PX - wallThickness;
  const cellSize = region !== undefined
    ? GRID_CELL_SIZE_PX / ratio
    : Math.floor(Math.min(availableWidth / maze.width, availableHeight / maze.height));
  const inset = region !== undefined ? 0 : wallThickness / 2;

  const svgWidth = maze.width * cellSize + 2 * inset;
  const svgHeight = maze.height * cellSize + 2 * inset;

  // Maze coordinates to SVG pixels
  const toPx = (point: Point): Point => ({
    x: point.x * cellSize + inset,
    y: point.y * cellSize + inset,
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
    <div className={region !== undefined ? styles.fillContainer : styles.mazeContainer}>
      <svg
        className={region !== undefined ? styles.fillSvg : styles.mazeSvg}
        width={region !== undefined ? '100%' : svgWidth}
        height={region !== undefined ? '100%' : svgHeight}
        viewBox={`0 0 ${svgWidth} ${svgHeight}`}
        xmlns="http://www.w3.org/2000/svg"
      >
        {/* A filler's own ground: paper under its cells, which is also what
            takes a click or tap, and what the selection glow follows */}
        {region !== undefined && maze.cells.map((cell, i) => (
          <polygon key={`ground-${i}`} points={outline(cell.corners)} fill="#fff" stroke="#fff" strokeWidth={1} pointerEvents="fill" />
        ))}

        {/* Draw cell backgrounds. Not with curvy walls: the tint is the cell's
            straight-sided shape and would show past the rounded corners. */}
        {!curvyWalls && (
          <>
            <polygon points={outline(startCell.corners)} fill={theme.startColor} opacity={0.5} />
            <polygon points={outline(endCell.corners)} fill={theme.endColor} opacity={0.5} />
          </>
        )}

        {/* Draw walls */}
        {curvyWalls
          ? runs.map((run, i) => (
              <path
                key={`run-${i}`}
                d={curvePath({ ...run, points: run.points.map(toPx) })}
                fill="none"
                stroke="#000"
                strokeWidth={wallThickness}
                strokeLinecap="round"
                strokeLinejoin="round"
              />
            ))
          : maze.walls.map((wall, i) => {
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

        {showAnswers && <AnswerPath width={Math.max(1.5, cellSize * 0.12)}
          d={flowingPath(maze.solution.map(index => toPx(maze.cells[index].center)), answerClearance * cellSize * 0.35, cellSize * 0.008)} />}
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
