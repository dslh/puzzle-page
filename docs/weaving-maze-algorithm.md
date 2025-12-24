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

  // Bridge information (null if no bridge passes through this cell)
  bridge: BridgeInfo | null;

  // Used during generation
  visited: boolean;
}
```

### BridgeInfo

```typescript
interface BridgeInfo {
  // Direction the bridge travels through this cell
  direction: 'horizontal' | 'vertical';

  // Is this cell an endpoint of the bridge, or a middle segment?
  isEndpoint: boolean;
}
```

### Grid

```typescript
interface Grid {
  width: number;
  height: number;
  cells: Cell[][];

  // Quick lookup: cells that have bridges passing through them
  bridgeCells: Set<Cell>;
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
    rng = SeededRandom(seed)

    // Start at top-left
    start = grid.cells[0][0]
    start.visited = true
    stack = [start]

    while stack is not empty:
        current = stack.top()

        // Try to find an unvisited neighbor (standard DFS)
        neighbors = getUnvisitedNeighbors(current, grid)

        if neighbors is not empty:
            // Standard maze carving
            next = randomChoice(neighbors, rng)
            connect(current, next)
            next.visited = true
            stack.push(next)

        else:
            // Dead end - look for bridge opportunities
            bridgeTarget = findBridgeOpportunity(current, grid, rng)

            if bridgeTarget exists:
                createBridge(current, bridgeTarget, grid)
                bridgeTarget.visited = true
                stack.push(bridgeTarget)
            else:
                // True dead end, backtrack
                stack.pop()

    return grid
```

### Finding Bridge Opportunities

A bridge opportunity exists when:
1. There's a straight line of cells between `current` and an unvisited cell
2. ALL intermediate cells have passages running **perpendicular** to the bridge direction
3. None of the intermediate cells are already bridge endpoints

```
function findBridgeOpportunity(current, grid, rng):
    opportunities = []

    for each direction in [North, South, East, West]:
        target = scanForBridgeTarget(current, direction, grid)
        if target exists:
            opportunities.append({direction, target})

    if opportunities is empty:
        return null

    return randomChoice(opportunities, rng)
```

### Scanning for Bridge Targets

```
function scanForBridgeTarget(start, direction, grid):
    // Direction we're scanning (e.g., East)
    // Perpendicular direction (e.g., North-South for an East scan)
    perpendicular = getPerpendicularAxis(direction)

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
                bridgeOver: bridgeCells
            }

        // Cell is visited - can we bridge over it?
        if canBridgeOver(cell, perpendicular):
            bridgeCells.append(cell)
        else:
            // Obstacle - can't bridge here
            return null
```

### Checking if a Cell Can Be Bridged Over

```
function canBridgeOver(cell, bridgeDirection):
    // Cell must have a passage perpendicular to bridge direction
    if bridgeDirection == 'horizontal':
        // Horizontal bridge needs vertical passage underneath
        hasPerpendicularPassage = cell.connections.north or cell.connections.south
    else:
        // Vertical bridge needs horizontal passage underneath
        hasPerpendicularPassage = cell.connections.east or cell.connections.west

    if not hasPerpendicularPassage:
        return false

    // Cell must not already be a bridge endpoint
    // (Middle segments of existing bridges are OK to cross over)
    if cell.bridge and cell.bridge.isEndpoint:
        return false

    // Cell must not already have a bridge in the SAME direction
    // (Can't stack bridges going the same way)
    if cell.bridge and cell.bridge.direction == bridgeDirection:
        return false

    return true
```

### Creating a Bridge

```
function createBridge(start, bridgeInfo, grid):
    {target, bridgeOver} = bridgeInfo
    direction = getDirection(start, target)

    // Mark start as bridge endpoint
    start.bridge = {
        direction: direction,
        isEndpoint: true
    }

    // Mark intermediate cells as bridge middle segments
    for cell in bridgeOver:
        if cell.bridge is null:
            cell.bridge = {
                direction: direction,
                isEndpoint: false
            }
        // If cell already has a bridge (perpendicular), it becomes a double-crossing
        // The existing bridge info is preserved; this is handled in rendering

    // Mark target as bridge endpoint
    target.bridge = {
        direction: direction,
        isEndpoint: true
    }

    // Create logical connections for pathfinding
    // (The bridge connects start to target, but does NOT connect to intermediate cells)
    connectBridge(start, target, direction)
```

## Rendering Considerations

When rendering, cells with `bridge` info need special treatment:

1. **Bridge endpoints**: Draw the path entering/exiting the cell, connecting to the bridge
2. **Bridge middle segments**:
   - Draw the underlying passage (perpendicular to bridge)
   - Draw the bridge passing over with side-rails but no end caps
3. **Double crossings**: A cell where two bridges cross (rare but possible with this algorithm)
   - Render as a 4-way crossing with appropriate layering

## Properties

This algorithm guarantees:

- **Single solution**: It's a spanning tree algorithm - exactly one path between any two cells
- **All cells reachable**: DFS visits every cell before completing
- **Organic bridge placement**: Bridges appear where needed, not randomly placed
- **Multi-cell bridges**: Natural support for bridges spanning many parallel passages
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
    │     ↓     │
    │     F   · │  (· = unvisited)
    └───────────┘

Step 9: At F, dead end. Scan for bridges...
        East scan: D has N-S passage ✓, E has N-S passage ✓, unvisited cell at (4,2) ✓
        Bridge opportunity found!

Step 10: Create bridge F →→→ G (over D and E's passages)
    ┌───────────┐
    │ A → B → C │
    │     ↓     │
    │     D → E │
    │     ↓   ↓ │
    │     F ═══ G │  (═ = bridge)
    └───────────┘

Continue DFS from G...
```

## Variations

### Controlling Bridge Frequency

Add a probability check before accepting bridge opportunities:

```
if randomFloat(rng) > BRIDGE_PROBABILITY:
    continue  // Skip this opportunity, keep looking or backtrack
```

### Minimum Bridge Length

Only accept bridges that span at least N cells:

```
if bridgeOver.length < MIN_BRIDGE_LENGTH:
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
