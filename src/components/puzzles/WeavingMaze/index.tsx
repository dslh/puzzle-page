import { useId, useMemo } from 'react';
import {
  generateWeavingMaze,
  type WeavingMaze as WeavingMazeType,
  type Bridge,
  type CrossingDensity,
  type Branchiness,
} from './generator';
import type { PuzzleProps } from '../../../types/puzzle';
import { MAZE_THEMES } from '../Maze/themes';
import styles from './WeavingMaze.module.css';

export interface WeavingMazeConfig {
  cellSizeRatio: 2 | 3 | 4;
  crossingDensity: CrossingDensity;
  branchiness: Branchiness;
}

const OUTLINE_COLOUR = '#000';
const CORRIDOR_COLOUR = '#fff';
/** Corridor width as a fraction of the cell. The remainder is the wall between corridors. */
const CORRIDOR_RATIO = 0.66;

type Dir = 'top' | 'right' | 'bottom' | 'left';
const DELTA: Record<Dir, { dx: number; dy: number }> = {
  top: { dx: 0, dy: -1 },
  right: { dx: 1, dy: 0 },
  bottom: { dx: 0, dy: 1 },
  left: { dx: -1, dy: 0 },
};

interface Point {
  x: number;
  y: number;
}

interface Segment {
  x1: number;
  y1: number;
  x2: number;
  y2: number;
}

/** A shaded rectangle at the mouth of a tunnel, fading away from the bridge above it. */
interface TunnelShade {
  x: number;
  y: number;
  width: number;
  height: number;
  /** Which edge of the rectangle is the dark one - the side touching the bridge. */
  darkEdge: Dir;
}

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

const key = (x: number, y: number) => `${x},${y}`;

/** Which cells have a bridge passing over them. */
function indexBridgedCells(bridges: Bridge[]): Map<string, Bridge> {
  const map = new Map<string, Bridge>();
  for (const bridge of bridges) {
    for (const seg of bridge.segments) {
      map.set(key(seg.x, seg.y), bridge);
    }
  }
  return map;
}

/** The directions in which each bridge endpoint leaves its cell along a bridge. */
function indexBridgeExits(bridges: Bridge[]): Map<string, Dir[]> {
  const map = new Map<string, Dir[]>();
  const add = (cell: Point, dir: Dir) => {
    const k = key(cell.x, cell.y);
    map.set(k, [...(map.get(k) ?? []), dir]);
  };
  for (const bridge of bridges) {
    if (bridge.direction === 'horizontal') {
      const startIsLeft = bridge.start.x < bridge.end.x;
      add(bridge.start, startIsLeft ? 'right' : 'left');
      add(bridge.end, startIsLeft ? 'left' : 'right');
    } else {
      const startIsTop = bridge.start.y < bridge.end.y;
      add(bridge.start, startIsTop ? 'bottom' : 'top');
      add(bridge.end, startIsTop ? 'top' : 'bottom');
    }
  }
  return map;
}

const segmentPath = (segments: Segment[]) =>
  segments.map((s) => `M${s.x1} ${s.y1}L${s.x2} ${s.y2}`).join('');

const circlePath = (centres: Point[], r: number) =>
  centres
    .map((c) => `M${c.x - r} ${c.y}a${r} ${r} 0 1 0 ${2 * r} 0a${r} ${r} 0 1 0 ${-2 * r} 0`)
    .join('');

export default function WeavingMaze({
  gridWidth = 5,
  gridHeight = 5,
  seed = 0,
  config,
}: PuzzleProps<WeavingMazeConfig>) {
  const ratio = config?.cellSizeRatio ?? 2;
  const crossingDensity = config?.crossingDensity ?? 'medium';
  const branchiness = config?.branchiness ?? 'medium';

  const { width, height } = getMazeDimensions(gridWidth, gridHeight, ratio);

  const maze: WeavingMazeType = useMemo(() => {
    return generateWeavingMaze(width, height, seed, crossingDensity, branchiness);
  }, [width, height, seed, crossingDensity, branchiness]);

  const theme = useMemo(() => {
    const themeIndex = Math.floor(seededRandom(seed + 12345) * MAZE_THEMES.length);
    return MAZE_THEMES[themeIndex];
  }, [seed]);

  const GRID_CELL_SIZE_PX = 72;
  const margin = 4;

  const availableWidth = gridWidth * GRID_CELL_SIZE_PX - margin * 2;
  const availableHeight = gridHeight * GRID_CELL_SIZE_PX - margin * 2;
  const cellSize = Math.floor(
    Math.min(availableWidth / maze.width, availableHeight / maze.height)
  );

  // Geometry. Corridors are white with a dark outline, like the regular maze's
  // walls, so the picture is mostly white space and prints cleanly.
  const corridorWidth = Math.round(cellSize * CORRIDOR_RATIO);
  const outline = cellSize >= 36 ? 2.5 : cellSize >= 24 ? 2 : 1.5;
  const halfCorridor = corridorWidth / 2;
  const halfOuter = halfCorridor + outline;
  // White gap between the end of a tunnel's outline and the bridge's outline.
  const clearance = Math.max(2, Math.round(cellSize * 0.08));
  // A passage running under a bridge stops this far short of the crossing's centre.
  const tunnelReach = Math.min(halfOuter + clearance, cellSize / 2);
  // How far the shading at a tunnel mouth extends along the passage.
  const shadeLength = corridorWidth * 0.8;

  const svgWidth = maze.width * cellSize + margin * 2;
  const svgHeight = maze.height * cellSize + margin * 2;
  const offset = margin;

  const centreOf = (x: number, y: number): Point => ({
    x: x * cellSize + cellSize / 2 + offset,
    y: y * cellSize + cellSize / 2 + offset,
  });

  const bridgedCells = indexBridgedCells(maze.bridges);
  const bridgeExits = indexBridgeExits(maze.bridges);

  // Corridors: one segment per connection between two cells, running centre to
  // centre. Where an end lies in a bridged cell the segment stops short, leaving
  // the tunnel mouth open. Nodes are discs at every unbridged cell that has a
  // passage, giving rounded corners and dead ends.
  const corridors: Segment[] = [];
  const nodes: Point[] = [];
  const shades: TunnelShade[] = [];

  maze.grid.forEach((row, y) => {
    row.forEach((cell, x) => {
      const here = centreOf(x, y);
      const bridgedHere = bridgedCells.has(key(x, y));

      if (!bridgedHere) {
        const exits = bridgeExits.get(key(x, y)) ?? [];
        const hasPassage =
          cell.connections.top ||
          cell.connections.right ||
          cell.connections.bottom ||
          cell.connections.left ||
          exits.length > 0;
        if (hasPassage) nodes.push(here);

        // Stub from the cell centre to where the bridge begins at the cell
        // boundary, overlapping a little under the bridge so there is no seam.
        for (const dir of exits) {
          const { dx, dy } = DELTA[dir];
          const reach = cellSize / 2 + outline;
          corridors.push({
            x1: here.x,
            y1: here.y,
            x2: here.x + dx * reach,
            y2: here.y + dy * reach,
          });
        }
      }

      // Each connection once: the cell to the right and the cell below.
      const pairs: Array<{ dir: Dir; on: boolean }> = [
        { dir: 'right', on: cell.connections.right },
        { dir: 'bottom', on: cell.connections.bottom },
      ];
      for (const { dir, on } of pairs) {
        if (!on) continue;
        const { dx, dy } = DELTA[dir];
        const nx = x + dx;
        const ny = y + dy;
        if (nx >= maze.width || ny >= maze.height) continue;
        const there = centreOf(nx, ny);
        const bridgedThere = bridgedCells.has(key(nx, ny));

        const startPull = bridgedHere ? tunnelReach : 0;
        const endPull = bridgedThere ? tunnelReach : 0;
        // A passage squeezed between two bridges in adjacent cells may have
        // almost nothing left to draw; a sliver just looks like a stray mark.
        if (cellSize - startPull - endPull < outline * 2) continue;
        corridors.push({
          x1: here.x + dx * startPull,
          y1: here.y + dy * startPull,
          x2: there.x - dx * endPull,
          y2: there.y - dy * endPull,
        });

        // Shade the tunnel mouths so the passage visibly dips under the bridge.
        // The shading may not run past the far end of this segment.
        const available = cellSize - startPull - endPull;
        const length = Math.min(shadeLength, available / 2);
        if (length > 0) {
          if (bridgedHere) {
            shades.push(tunnelShade(here, dir, tunnelReach, length, halfCorridor));
          }
          if (bridgedThere) {
            shades.push(tunnelShade(there, opposite(dir), tunnelReach, length, halfCorridor));
          }
        }
      }
    });
  });

  // Bridges span only the cells they pass over, from cell boundary to cell
  // boundary. The endpoint cells join them with ordinary corridor stubs.
  const bridgeSpans: Segment[] = maze.bridges.map((bridge) => {
    if (bridge.direction === 'horizontal') {
      const y = centreOf(0, bridge.start.y).y;
      const left = Math.min(bridge.start.x, bridge.end.x) + 1;
      const right = Math.max(bridge.start.x, bridge.end.x);
      return { x1: left * cellSize + offset, y1: y, x2: right * cellSize + offset, y2: y };
    }
    const x = centreOf(bridge.start.x, 0).x;
    const top = Math.min(bridge.start.y, bridge.end.y) + 1;
    const bottom = Math.max(bridge.start.y, bridge.end.y);
    return { x1: x, y1: top * cellSize + offset, x2: x, y2: bottom * cellSize + offset };
  });

  const bridgeSides: Segment[] = bridgeSpans.flatMap((span) => {
    const d = halfCorridor + outline / 2;
    if (span.y1 === span.y2) {
      return [
        { x1: span.x1, y1: span.y1 - d, x2: span.x2, y2: span.y2 - d },
        { x1: span.x1, y1: span.y1 + d, x2: span.x2, y2: span.y2 + d },
      ];
    }
    return [
      { x1: span.x1 - d, y1: span.y1, x2: span.x2 - d, y2: span.y2 },
      { x1: span.x1 + d, y1: span.y1, x2: span.x2 + d, y2: span.y2 },
    ];
  });

  const start = centreOf(maze.start.x, maze.start.y);
  const end = centreOf(maze.end.x, maze.end.y);
  const markerSize = Math.max(14, Math.round(corridorWidth * 0.85));
  const gradientId = `weave-shade-${useId().replace(/[^a-zA-Z0-9]/g, "")}`;

  return (
    <div className={styles.mazeContainer}>
      <svg
        className={styles.mazeSvg}
        width={svgWidth}
        height={svgHeight}
        viewBox={`0 0 ${svgWidth} ${svgHeight}`}
        xmlns="http://www.w3.org/2000/svg"
      >
        <defs>
          <linearGradient id={`${gradientId}-top`} x1="0" y1="0" x2="0" y2="1">
            <stop offset="0" stopColor="#000" stopOpacity="0.16" />
            <stop offset="1" stopColor="#000" stopOpacity="0" />
          </linearGradient>
          <linearGradient id={`${gradientId}-bottom`} x1="0" y1="1" x2="0" y2="0">
            <stop offset="0" stopColor="#000" stopOpacity="0.16" />
            <stop offset="1" stopColor="#000" stopOpacity="0" />
          </linearGradient>
          <linearGradient id={`${gradientId}-left`} x1="0" y1="0" x2="1" y2="0">
            <stop offset="0" stopColor="#000" stopOpacity="0.16" />
            <stop offset="1" stopColor="#000" stopOpacity="0" />
          </linearGradient>
          <linearGradient id={`${gradientId}-right`} x1="1" y1="0" x2="0" y2="0">
            <stop offset="0" stopColor="#000" stopOpacity="0.16" />
            <stop offset="1" stopColor="#000" stopOpacity="0" />
          </linearGradient>
        </defs>

        {/* Corridor outlines */}
        <path
          d={segmentPath(corridors)}
          fill="none"
          stroke={OUTLINE_COLOUR}
          strokeWidth={corridorWidth + outline * 2}
          strokeLinecap="butt"
        />
        <path d={circlePath(nodes, halfOuter)} fill={OUTLINE_COLOUR} />

        {/* Corridor interiors */}
        <path
          d={segmentPath(corridors)}
          fill="none"
          stroke={CORRIDOR_COLOUR}
          strokeWidth={corridorWidth}
          strokeLinecap="butt"
        />
        <path d={circlePath(nodes, halfCorridor)} fill={CORRIDOR_COLOUR} />

        {/* Start and finish pads */}
        <circle cx={start.x} cy={start.y} r={halfCorridor} fill={theme.startColor} opacity={0.5} />
        <circle cx={end.x} cy={end.y} r={halfCorridor} fill={theme.endColor} opacity={0.5} />

        {/* Tunnel mouths */}
        {shades.map((s, i) => (
          <rect
            key={`shade-${i}`}
            x={s.x}
            y={s.y}
            width={s.width}
            height={s.height}
            fill={`url(#${gradientId}-${s.darkEdge})`}
          />
        ))}

        {/* Bridges, drawn over everything they cross */}
        <path
          d={segmentPath(bridgeSpans)}
          fill="none"
          stroke={CORRIDOR_COLOUR}
          strokeWidth={corridorWidth}
          strokeLinecap="butt"
        />
        <path
          d={segmentPath(bridgeSides)}
          fill="none"
          stroke={OUTLINE_COLOUR}
          strokeWidth={outline}
          strokeLinecap="butt"
        />

        {/* Start and finish markers */}
        <text
          x={start.x}
          y={start.y}
          fontSize={markerSize}
          textAnchor="middle"
          dominantBaseline="central"
        >
          {theme.start}
        </text>
        <text
          x={end.x}
          y={end.y}
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

function opposite(dir: Dir): Dir {
  switch (dir) {
    case 'top':
      return 'bottom';
    case 'bottom':
      return 'top';
    case 'left':
      return 'right';
    case 'right':
      return 'left';
  }
}

/**
 * The shaded rectangle just outside a tunnel mouth. `centre` is the bridged
 * cell's centre and `dir` the direction the passage leaves it in; the dark edge
 * is the one nearest the bridge.
 */
function tunnelShade(
  centre: Point,
  dir: Dir,
  tunnelReach: number,
  length: number,
  halfCorridor: number
): TunnelShade {
  switch (dir) {
    case 'top':
      return {
        x: centre.x - halfCorridor,
        y: centre.y - tunnelReach - length,
        width: halfCorridor * 2,
        height: length,
        darkEdge: 'bottom',
      };
    case 'bottom':
      return {
        x: centre.x - halfCorridor,
        y: centre.y + tunnelReach,
        width: halfCorridor * 2,
        height: length,
        darkEdge: 'top',
      };
    case 'left':
      return {
        x: centre.x - tunnelReach - length,
        y: centre.y - halfCorridor,
        width: length,
        height: halfCorridor * 2,
        darkEdge: 'right',
      };
    case 'right':
      return {
        x: centre.x + tunnelReach,
        y: centre.y - halfCorridor,
        width: length,
        height: halfCorridor * 2,
        darkEdge: 'left',
      };
  }
}
