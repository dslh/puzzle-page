# Weaving Maze Generation Algorithm

A graph-based DFS algorithm that generates weaving mazes with a **guaranteed single solution**. Bridges emerge organically during generation when the algorithm would otherwise hit a dead end.

## Key Concept

Unlike traditional mazes where paths cannot cross, a weaving maze allows paths to **bridge over** existing passages. This creates more complex, interesting mazes while maintaining the "perfect maze" property (exactly one solution).

A bridge can span **multiple cells** if several parallel passages line up:

```
Before bridge:                After bridge:

    ║   ║   ║                     ║   ║   ║
A · · · · · · · B             A═══════════════B
    ║   ║   ║                     ║   ║   ║
                              (bridge passes over three vertical passages)
```

Bridges always form clean plus-sign crossings: a straight bridge over a straight passage.

## Data Structures

### Cell

```typescript
interface Cell {
  x: number;
  y: number;

  // Standard connections to adjacent cells (passages)
  connections: {
    north: boolean;
    south: boolean;
    east: boolean;
    west: boolean;
  };

  // Used during generation
  visited: boolean;
}
```

### Bridge

A bridge is a first-class object connecting two cells while passing over intermediate cells:

```typescript
interface Bridge {
  // Endpoint cells (where the bridge connects to the maze)
  start: {x: number, y: number};
  end: {x: number, y: number};

  // Direction the bridge travels
  direction: 'horizontal' | 'vertical';

  // Cells the bridge passes over (in order from start to end)
  segments: {x: number, y: number}[];
}
```

### Grid

```typescript
interface Grid {
  width: number;
  height: number;
  cells: Cell[][];

  // All bridges in the maze
  bridges: Bridge[];
}
```

### Algorithm State

```typescript
interface GeneratorState {
  grid: Grid;
  stack: Cell[];           // DFS stack
  current: Cell;           // Current cell being processed
  rng: SeededRandom;       // For deterministic generation
}
```

## Algorithm

### Main Loop

```
function generateWeavingMaze(width, height, seed):
    grid = initializeGrid(width, height)
    grid.bridges = []
    rng = SeededRandom(seed)

    // Start at top-left
    start = grid.cells[0][0]
    start.visited = true
    stack = [start]

    while stack is not empty:
        current = stack.top()

        // Prefer bridges - creates more interesting weaving mazes
        bridgeResult = findBridgeOpportunity(current, grid, rng)

        if bridgeResult exists:
            createBridge(current, bridgeResult, grid)
            bridgeResult.target.visited = true
            stack.push(bridgeResult.target)

        else:
            // No bridge available - try direct neighbor
            neighbors = getUnvisitedNeighbors(current, grid)

            if neighbors is not empty:
                next = randomChoice(neighbors, rng)
                connect(current, next)
                next.visited = true
                stack.push(next)
            else:
                // No moves available, backtrack
                stack.pop()

    return grid
```

### Finding Bridge Opportunities

A bridge opportunity exists when:
1. There's a straight line of cells between `current` and an unvisited cell
2. ALL intermediate cells have **straight passages perpendicular** to the bridge direction
3. NO intermediate cells have passages parallel to the bridge direction

```
function findBridgeOpportunity(current, grid, rng):
    opportunities = []

    for each direction in [North, South, East, West]:
        result = scanForBridgeTarget(current, direction, grid)
        if result exists:
            opportunities.append(result)

    if opportunities is empty:
        return null

    return randomChoice(opportunities, rng)
```

### Scanning for Bridge Targets

```
function scanForBridgeTarget(start, direction, grid):
    // Determine bridge orientation from scan direction
    bridgeDirection = isHorizontal(direction) ? 'horizontal' : 'vertical'

    x, y = start.x, start.y
    bridgeCells = []  // Cells we'd bridge over

    while true:
        // Move one step in scan direction
        x, y = step(x, y, direction)

        // Out of bounds?
        if not inBounds(x, y, grid):
            return null

        cell = grid.cells[y][x]

        // Found an unvisited cell - valid bridge target!
        if not cell.visited:
            if bridgeCells is empty:
                // Adjacent unvisited cell - not a bridge, just normal connection
                return null
            return {
                target: cell,
                segments: bridgeCells,
                direction: bridgeDirection
            }

        // Cell is visited - can we bridge over it?
        if canBridgeOver(cell, bridgeDirection):
            bridgeCells.append(cell)
        else:
            // Obstacle - can't bridge here
            return null
```

### Checking if a Cell Can Be Bridged Over

A cell can be bridged over only if it forms a clean plus-sign crossing:
- Must have a **complete straight passage** perpendicular to the bridge
- Must have **no passages** parallel to the bridge (which would be hidden underneath)

```
function canBridgeOver(cell, bridgeDirection):
    if bridgeDirection == 'horizontal':
        // Horizontal bridge needs complete vertical passage underneath
        hasPerpendicularPassage = cell.connections.north AND cell.connections.south
        // Must not have horizontal passages (would be hidden by bridge)
        hasParallelPassage = cell.connections.east OR cell.connections.west
    else:
        // Vertical bridge needs complete horizontal passage underneath
        hasPerpendicularPassage = cell.connections.east AND cell.connections.west
        // Must not have vertical passages (would be hidden by bridge)
        hasParallelPassage = cell.connections.north OR cell.connections.south

    return hasPerpendicularPassage AND NOT hasParallelPassage
```

### Creating a Bridge

```
function createBridge(start, bridgeResult, grid):
    bridge = Bridge {
        start: {x: start.x, y: start.y},
        end: {x: bridgeResult.target.x, y: bridgeResult.target.y},
        direction: bridgeResult.direction,
        segments: bridgeResult.segments.map(cell => {x: cell.x, y: cell.y})
    }

    grid.bridges.append(bridge)
```

Note: Bridges represent direct connections for pathfinding purposes. The bridge connects `start` to `end` but does NOT connect to intermediate segment cells.

## Rendering

Render the maze in two passes:

1. **Draw all cell passages**: For each cell, draw its north/south/east/west connections as normal passages.

2. **Draw all bridges**: For each bridge in `grid.bridges`:
   - Draw the bridge from `start` to `end` as an elevated passage
   - Over each `segment` cell, draw the bridge with side-rails (no end caps)
   - The underlying passage in segment cells remains visible beneath the bridge

Since bridges only cross straight perpendicular passages, every crossing forms a clean plus-sign shape.

## Properties

This algorithm guarantees:

- **Single solution**: It's a spanning tree algorithm - exactly one path between any two cells
- **All cells reachable**: DFS visits every cell before completing
- **Organic bridge placement**: Bridges appear where needed, not randomly placed
- **Multi-cell bridges**: Natural support for bridges spanning many parallel passages
- **Clean crossings**: Every bridge forms a plus-sign intersection
- **Deterministic**: Same seed produces same maze

## Complexity

- **Time**: O(W × H) - each cell visited at most once, bridge scans are bounded
- **Space**: O(W × H) - grid storage plus O(W + H) stack depth

## Example Trace

```
Grid: 5x5, generating...

Step 1-8: Normal DFS carves passages
    ┌───────────┐
    │ A → B → C │
    │     ↓     │
    │     D → E │
    │     ↓   ↓ │
    │     F   · │  (· = unvisited)
    └───────────┘

Step 9: At F, dead end (no unvisited neighbors).
        Scan for bridge opportunities...
        East scan finds cells with vertical passages, then unvisited cell G.
        Bridge opportunity found!

Step 10: Create bridge from F to G
    ┌───────────┐
    │ A → B → C │
    │     ↓     │
    │     D → E │
    │     ↓   ↓ │
    │     F ═══ G │  (═ = bridge passing over vertical passages)
    └───────────┘

    Bridge stored: {start: F, end: G, direction: 'horizontal', segments: [...]}

Continue DFS from G...
```

## Variations

### Controlling Bridge Frequency

The default algorithm prefers bridges whenever available. To reduce bridge frequency, add a coin-flip when both a bridge and direct neighbor are available:

```
bridgeResult = findBridgeOpportunity(current, grid, rng)
neighbors = getUnvisitedNeighbors(current, grid)

if bridgeResult exists AND neighbors is not empty:
    // Both options available - randomize
    if randomFloat(rng) < BRIDGE_PROBABILITY:
        take the bridge
    else:
        take a neighbor
else if bridgeResult exists:
    take the bridge
else if neighbors is not empty:
    take a neighbor
else:
    backtrack
```

### Minimum Bridge Length

Only accept bridges that span at least N cells:

```
if segments.length < MIN_BRIDGE_LENGTH:
    continue
```

### Maximum Bridge Length

Cap how far bridges can span:

```
function scanForBridgeTarget(start, direction, grid, maxLength = Infinity):
    // ... in the scan loop:
    if bridgeCells.length >= maxLength:
        return null
```
