import { useMemo } from 'react';
import { generateMaze, type Maze as MazeType } from '../../utils/mazeGenerator';
import styles from './Maze.module.css';

interface MazeProps {
  width?: number;
  height?: number;
  seed?: number;
}

export default function Maze({ width = 6, height = 6, seed = 0 }: MazeProps) {
  const maze: MazeType = useMemo(() => {
    return generateMaze(width, height, seed);
  }, [width, height, seed]);

  const cellSize = 35;
  const wallThickness = 3;
  const svgWidth = maze.width * cellSize + wallThickness;
  const svgHeight = maze.height * cellSize + wallThickness;

  return (
    <div className={styles.mazeContainer}>
      <h2 className={styles.mazeTitle}>Maze Puzzle</h2>
      <p>Help the mouse find the cheese!</p>
      <svg
        className={styles.mazeSvg}
        width={svgWidth}
        height={svgHeight}
        viewBox={`0 0 ${svgWidth} ${svgHeight}`}
        xmlns="http://www.w3.org/2000/svg"
      >
        {/* Draw cell backgrounds */}
        {maze.grid.map((row, y) =>
          row.map((cell, x) => {
            const isStart = x === maze.start.x && y === maze.start.y;
            const isEnd = x === maze.end.x && y === maze.end.y;

            if (!isStart && !isEnd) return null;

            return (
              <rect
                key={`bg-${x}-${y}`}
                x={x * cellSize + wallThickness / 2}
                y={y * cellSize + wallThickness / 2}
                width={cellSize}
                height={cellSize}
                fill={isStart ? '#90EE90' : '#FFB6C1'}
              />
            );
          })
        )}

        {/* Draw walls */}
        {maze.grid.map((row, y) =>
          row.map((cell, x) => {
            const walls = [];
            const offset = wallThickness / 2;

            if (cell.walls.top) {
              walls.push(
                <line
                  key={`top-${x}-${y}`}
                  x1={x * cellSize + offset}
                  y1={y * cellSize + offset}
                  x2={(x + 1) * cellSize + offset}
                  y2={y * cellSize + offset}
                  stroke="#000"
                  strokeWidth={wallThickness}
                  strokeLinecap="square"
                />
              );
            }

            if (cell.walls.right) {
              walls.push(
                <line
                  key={`right-${x}-${y}`}
                  x1={(x + 1) * cellSize + offset}
                  y1={y * cellSize + offset}
                  x2={(x + 1) * cellSize + offset}
                  y2={(y + 1) * cellSize + offset}
                  stroke="#000"
                  strokeWidth={wallThickness}
                  strokeLinecap="square"
                />
              );
            }

            if (cell.walls.bottom) {
              walls.push(
                <line
                  key={`bottom-${x}-${y}`}
                  x1={x * cellSize + offset}
                  y1={(y + 1) * cellSize + offset}
                  x2={(x + 1) * cellSize + offset}
                  y2={(y + 1) * cellSize + offset}
                  stroke="#000"
                  strokeWidth={wallThickness}
                  strokeLinecap="square"
                />
              );
            }

            if (cell.walls.left) {
              walls.push(
                <line
                  key={`left-${x}-${y}`}
                  x1={x * cellSize + offset}
                  y1={y * cellSize + offset}
                  x2={x * cellSize + offset}
                  y2={(y + 1) * cellSize + offset}
                  stroke="#000"
                  strokeWidth={wallThickness}
                  strokeLinecap="square"
                />
              );
            }

            return walls;
          })
        )}

        {/* Draw start marker (mouse) */}
        <text
          x={maze.start.x * cellSize + cellSize / 2 + wallThickness / 2}
          y={maze.start.y * cellSize + cellSize / 2 + wallThickness / 2}
          fontSize="24"
          textAnchor="middle"
          dominantBaseline="central"
        >
          🐭
        </text>

        {/* Draw end marker (cheese) */}
        <text
          x={maze.end.x * cellSize + cellSize / 2 + wallThickness / 2}
          y={maze.end.y * cellSize + cellSize / 2 + wallThickness / 2}
          fontSize="24"
          textAnchor="middle"
          dominantBaseline="central"
        >
          🧀
        </text>
      </svg>
    </div>
  );
}
