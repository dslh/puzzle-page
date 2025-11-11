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

  return (
    <div className={styles.mazeContainer}>
      <h2 className={styles.mazeTitle}>Maze Puzzle</h2>
      <p>Help the mouse find the cheese!</p>
      <div
        className={styles.mazeGrid}
        style={{
          gridTemplateColumns: `repeat(${maze.width}, 35px)`,
          gridTemplateRows: `repeat(${maze.height}, 35px)`,
        }}
      >
        {maze.grid.map((row, y) =>
          row.map((cell, x) => {
            const isStart = x === maze.start.x && y === maze.start.y;
            const isEnd = x === maze.end.x && y === maze.end.y;

            const cellClasses = [
              styles.cell,
              cell.walls.top && styles.topWall,
              cell.walls.right && styles.rightWall,
              cell.walls.bottom && styles.bottomWall,
              cell.walls.left && styles.leftWall,
              isStart && styles.start,
              isEnd && styles.end,
            ]
              .filter(Boolean)
              .join(' ');

            return <div key={`${x}-${y}`} className={cellClasses} />;
          })
        )}
      </div>
    </div>
  );
}
