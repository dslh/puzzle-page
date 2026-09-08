# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Quick Start

```bash
npm install
npm run dev      # Start Vite dev server at http://localhost:5173
npm run build    # TypeScript compile + Vite production build
npm run lint     # ESLint check
npm run preview  # Preview production build
```

No testing framework is configured.

## Project Overview

A React + TypeScript app for generating printable puzzle pages optimized for A4 paper (early years / early primary, roughly ages 4-7). Users drag puzzles from a sidebar onto a 10×14 grid, configure them, and print.

There are currently 15 puzzle types - see **Existing Puzzles** below.

## Core Architecture

### Definition-Owns-Component Pattern

The puzzle system uses a **registry-based architecture** where each puzzle type is self-contained and declaratively defined:

**Key files:**
- `src/types/puzzle.ts` - Core interfaces (`PuzzleDefinition`, `PlacedPuzzle`, `PuzzleProps`)
- `src/components/puzzles/index.ts` - Central registry (`PUZZLE_DEFINITIONS` array)
- `src/components/puzzles/{PuzzleName}/definition.ts` - Each puzzle exports `puzzleDefinition`

**Data flow:**
1. Each puzzle directory exports a complete `PuzzleDefinition<TConfig>` containing metadata + component reference
2. Registry aggregates all definitions into `PUZZLE_DEFINITIONS` array
3. `PuzzleWrapper` dynamically renders `definition.component` with standardized props
4. No switch statements needed - fully declarative

### Standard Props Interface

All puzzle components receive the same props:

```typescript
interface PuzzleProps<TConfig = unknown> {
  gridWidth: number;   // Grid cells allocated (width)
  gridHeight: number;  // Grid cells allocated (height)
  seed: number;        // For deterministic generation
  config?: TConfig;    // Optional puzzle-specific configuration
}
```

This enables:
- Consistent component interface across all puzzles
- Type-safe configuration via generic `TConfig` parameter
- Easy dynamic rendering without knowing component internals

### Grid System

- **Physical dimensions**: 10 columns × 14 rows (A4-optimized)
- **Cell size**: 19mm (`CELL_SIZE_MM` constant in `puzzle.ts`)
- **Coordinate system**: Grid cells (0-based), not pixels
- **Positioning**: CSS absolute positioning with mm units
- **Collision detection**: AABB (axis-aligned bounding box) algorithm in `GridLayout` and `App`

### State Management

Simple React hooks pattern - no Redux or external state library:

- **Single source of truth**: `App.tsx` maintains `PlacedPuzzle[]` array
- **Props drilling**: App → GridLayout/Sidebar → PuzzleWrapper → Puzzle Component
- **One Context**: `src/contexts/DragConfigContext.tsx` carries a puzzle's config
  from the sidebar to the drop target during a drag. It exists because
  `dataTransfer` payloads are unreadable during `dragover` (only the *type*
  string is visible), so config could not ride along in the drag data - see
  **Drag & Drop Protocol** below.
- **Callbacks**:
  - `onAddPuzzle` - Add new puzzle from sidebar
  - `onRemovePuzzle` - Delete button
  - `onRerollPuzzle` - Regenerate with new seed
  - `onUpdatePuzzle` - Move existing puzzle
  - `onResizePuzzle` - Change dimensions (with collision check)
  - `onConfigChange` - Update puzzle configuration

### Component Hierarchy

```
App (state holder)
└── DragConfigProvider
    ├── Sidebar
    │   └── Config UI (when puzzle.configComponent exists)
    └── GridLayout (drag/drop target + collision detection)
        ├── Grid cells (19mm × 19mm visual grid)
        ├── PuzzleWrapper (for each PlacedPuzzle)
        │   ├── Drag handle
        │   ├── Reroll/delete buttons
        │   ├── Config UI (hover, when puzzle.configComponent exists)
        │   ├── Resize handles (when puzzle.resizable)
        │   └── Dynamic puzzle component
        └── Drag preview (while dragging)
```

## Adding a New Puzzle

### 1. Create Puzzle Directory Structure

```
src/components/puzzles/{PuzzleName}/
├── index.tsx              # React component (default export)
├── definition.ts          # Exports puzzleDefinition
├── generator.ts           # Deterministic generation algorithm
└── {PuzzleName}.module.css
```

### 2. Implement Puzzle Component

```typescript
// index.tsx
import type { PuzzleProps } from '../../../types/puzzle';

export default function YourPuzzle({ gridWidth, gridHeight, seed }: PuzzleProps) {
  const puzzle = useMemo(() =>
    generateYourPuzzle(gridWidth, gridHeight, seed),
    [gridWidth, gridHeight, seed]
  );

  return <div>/* render puzzle */</div>;
}
```

**Important:** Use `useMemo` with dependencies `[gridWidth, gridHeight, seed]` for performance.

### 3. Create Definition

```typescript
// definition.ts
import type { PuzzleDefinition } from '../../../types/puzzle';
import { GRID_COLS, GRID_ROWS } from '../../../types/puzzle';
import YourPuzzle from './index';

export const puzzleDefinition: PuzzleDefinition = {
  type: 'yourpuzzle',
  label: 'Your Puzzle',
  icon: '🎯',
  component: YourPuzzle,
  defaultWidth: 4,
  defaultHeight: 4,
  resizable: {
    width: true,
    height: true,
    minWidth: 2,
    maxWidth: GRID_COLS,
    minHeight: 2,
    maxHeight: GRID_ROWS,
  },
};
```

### 4. Register in Puzzle Registry

```typescript
// src/components/puzzles/index.ts
import { puzzleDefinition as yourPuzzle } from './YourPuzzle/definition';

export const PUZZLE_DEFINITIONS = [
  maze,
  sudoku,
  yourPuzzle, // Add here
  // ...
] as const;
```

### 5. Add to Type Union

```typescript
// src/types/puzzle.ts
export type PuzzleType = 'maze' | 'sudoku' | 'yourpuzzle' | /* ... */;
```

**That's it!** The puzzle automatically appears in the sidebar and can be placed on the grid.

## Adding Configuration to a Puzzle

If your puzzle needs per-instance configuration (like Sudoku's size selector):

### 1. Define Config Type

```typescript
// In your puzzle's index.tsx
export interface YourPuzzleConfig {
  difficulty: 'easy' | 'medium' | 'hard';
}

export default function YourPuzzle({ config, seed, gridWidth, gridHeight }: PuzzleProps<YourPuzzleConfig>) {
  const difficulty = config?.difficulty ?? 'easy';
  // Use in puzzle generation
}
```

### 2. Create Config Component

```typescript
// {PuzzleName}ConfigBar.tsx
import type { YourPuzzleConfig } from './index';
import styles from './{PuzzleName}ConfigBar.module.css';

interface ConfigBarProps {
  value: YourPuzzleConfig;
  onChange: (config: YourPuzzleConfig) => void;
}

export default function YourPuzzleConfigBar({ value, onChange }: ConfigBarProps) {
  return (
    <div className={styles.buttonBar}>
      <button
        className={value.difficulty === 'easy' ? styles.selected : ''}
        onClick={() => onChange({ difficulty: 'easy' })}
      >
        Easy
      </button>
      {/* more buttons */}
    </div>
  );
}
```

**Important:** Config components receive and return the **full config object**, not individual properties.

### 3. Update Definition

```typescript
import YourPuzzleConfigBar from './YourPuzzleConfigBar';

export const puzzleDefinition: PuzzleDefinition<YourPuzzleConfig> = {
  // ... other properties
  configComponent: YourPuzzleConfigBar,
  defaultConfig: {
    difficulty: 'medium',
  },
};
```

The config UI will automatically:
- Appear on hover over placed puzzles (centered over puzzle)
- Be available in sidebar if you add state management there (see `Sidebar.tsx` for Sudoku example)

## Key Patterns & Conventions

### Seeded Random Generation

All puzzles use **deterministic generation** via seed parameter:

```typescript
// Custom SeededRandom class (LCG algorithm)
class SeededRandom {
  private seed: number;
  constructor(seed: number) { this.seed = seed; }
  next(): number {
    this.seed = (this.seed * 9301 + 49297) % 233280;
    return this.seed / 233280;
  }
}

const rng = new SeededRandom(seed);
const value = rng.next(); // 0-1 float
```

This allows:
- **Deterministic output**: Same seed always produces same puzzle
- **Rerolling**: Generate new puzzle by changing seed only
- **Consistency**: Puzzle doesn't change when resized (unless seed changes)

### Drag & Drop Protocol

Drag metadata is smuggled through the dataTransfer **type** string, not its
value. Browsers hide `getData()` during `dragover` for security, but the list of
types stays readable - so the payload is encoded into the type itself and read
back with `e.dataTransfer.types.find(t => t.startsWith('puzzle/'))`.

Format: `puzzle/{type}/{width}/{height}[/{puzzleId}]`

- New puzzle from sidebar: `puzzle/sudoku/3/3` (set in `Sidebar.handleDragStart`)
- Existing puzzle being moved: `puzzle/sudoku/3/3/puzzle-id-123` (set in
  `PuzzleWrapper.handleDragStart`)

**Parsing** (in `GridLayout.handleDragOver`): `parts[1]` type, `parts[2]` width,
`parts[3]` height, `parts[4]` puzzleId - absent for new puzzles.

**Config does not travel in the string.** It used to (as trailing
`/{configJson}` segments), but was moved out in commit 02b0ad6 when sidebar
config was generalised to every puzzle type. `Sidebar` now writes the config into
`DragConfigContext` on drag start and clears it on drag end; `GridLayout` reads
it on drop, falling back to `definition.defaultConfig`:

```typescript
const config = dragConfig?.puzzleType === dragData.type
  ? dragConfig.config
  : definition?.defaultConfig;
```

### Collision Detection

AABB (axis-aligned bounding box), in two implementations:

1. `GridLayout.checkCollision` - one helper covering both drop validation and the
   green/red cell highlight during `dragover`. Also bounds-checks against
   `GRID_COLS`/`GRID_ROWS`, and takes an `excludeId` so a puzzle being moved
   doesn't collide with itself.
2. `App.handleResizePuzzle` - the same test again, inline, for resizes.

These two are duplicates of each other. Worth folding into a shared helper if a
third caller ever appears.

```typescript
// Check if two rectangles overlap
const xOverlap = x1 < x2 + w2 && x1 + w1 > x2;
const yOverlap = y1 < y2 + h2 && y1 + h1 > y2;
const collision = xOverlap && yOverlap;
```

### CSS Modules Pattern

All components use scoped CSS Modules:
- Import: `import styles from './Component.module.css'`
- Usage: `className={styles.myClass}`
- No global styles except `index.css`

Match existing button-bar pattern for config components:

```css
.buttonBar {
  display: flex;
  border: 2px solid #ddd;
  border-radius: 4px;
  overflow: hidden;
  background: white;
}

.button {
  flex: 1;
  padding: 6px 12px;
  font-size: 14px;
  font-weight: 600;
  border: none;
  border-right: 1px solid #ddd;
  background: white;
  cursor: pointer;
  transition: all 0.2s;
}

.button.selected {
  background: #2196f3;
  color: white;
}
```

## Technology Stack

- **React 19.2.0** + **TypeScript 5.9.3** (strict mode)
- **Vite 7.2.2** (dev server + build tool)
- **CSS Modules** (scoped styling)
- **ESLint** (TypeScript + React plugins)
- No testing framework
- No state management library (React hooks + one Context for drag config)
- No routing (single page app)
- Deployed as a static nginx image - see `Dockerfile`, `nginx.conf`, `fly.toml`

## Important Constants

```typescript
// src/types/puzzle.ts
export const GRID_COLS = 10;      // Grid columns
export const GRID_ROWS = 14;      // Grid rows
export const CELL_SIZE_MM = 19;   // Physical cell size for print
```

## Print Optimization

- All layout uses **mm units** for accurate A4 printing
- `window.print()` triggers browser print dialog
- CSS rule example: `width: ${puzzle.width * CELL_SIZE_MM}mm`
- Print styles in `@media print` blocks (sidebar hidden, etc.)

## Existing Puzzles

Registered in `src/components/puzzles/index.ts`, in sidebar order. "Size" is the
default width×height in grid cells.

| Puzzle | `type` | Size | Resize | Config |
|---|---|---|---|---|
| Maze (4×4) | `maze` | 4×4 | both | cell size, branchiness |
| Weaving Maze | `weavingmaze` | 5×5 | both | cell size, crossing density, branchiness |
| Sudoku | `sudoku` | 3×3 | fixed | 3×3/4×4/5×5, colors / 1-5 / A-E / custom |
| Which Doesn't Belong? | `whichdoesntbelong` | 4×1 | height | - |
| Pattern Sequence | `patternsequence` | 6×2 | height | - |
| Matching | `matching` | 4×4 | height | - |
| Picture Scramble | `picturescramble` | 7×7 | both | image URL |
| Word Search | `wordsearch` | 5×6 | both | directions, word count, limited letters, custom words |
| Laser Maze | `lasermaze` | 5×5 | both | - |
| Odd One Out | `oddoneout` | 5×5 | fixed | grid size |
| Counting | `counting` | 4×3 | both | - |
| Ordering | `ordering` | 4×3 | both | numbers / emoji |
| Chess Puzzle | `chess` | 5×5 | fixed | difficulty, mate / capture |
| Puzzle Maze | `puzzlemaze` | 4×4 | both (max 8×10) | emoji mode |
| Handwriting | `handwriting` | 6×4 | both | trace / copy / missing, case, custom words |

Two of these carry notes worth reading before editing them:

- **Chess** - `puzzleData.ts` is auto-generated from the Lichess puzzle database
  (mate-in-1 and capture puzzles filtered by popularity). Don't hand-edit it.
- **Weaving Maze** - the generation algorithm is written up in
  `docs/weaving-maze-algorithm.md`.

**Shared data:** `WordSearch/wordList.ts` holds ~120 emoji-paired 3-4 letter
words and is imported by both Word Search and Handwriting. Add words there rather
than starting a second list.

## Architecture Decisions

### Why Definition-Owns-Component?

- **Single source of truth**: All puzzle metadata in one place
- **Easy registration**: Just import and add to array
- **Type-safe**: TypeScript enforces required properties
- **Discoverable**: Can iterate over definitions programmatically
- **No switch statements**: Dynamic rendering via `definition.component`
- **Extensible**: Adding puzzles doesn't require core changes

### When to Abstract Further

The config system has already been through this cycle. `Sidebar.tsx` once held
Sudoku-specific config code; with enough configurable puzzles to see the pattern,
it was generalised - it now initialises a `Record<PuzzleType, unknown>` from each
definition's `defaultConfig` and renders `configComponent` generically. No
per-puzzle code remains in the sidebar, and adding a configurable puzzle needs no
core changes.

The remaining known duplication is the collision test (see above) and the
`SeededRandom` LCG class, which is copy-pasted into most generators. Both are
deliberate for now.

**Rule:** Duplication < Wrong Abstraction

## Common Tasks

### Add a puzzle without configuration
Follow "Adding a New Puzzle" section above. Minimal changes, no core modifications needed.

### Add a puzzle with configuration
Follow "Adding Configuration to a Puzzle" section. Config component is optional and self-contained.

### Change grid dimensions
Update constants in `src/types/puzzle.ts` (`GRID_COLS`, `GRID_ROWS`). All components reference these.

### Modify existing puzzle
Edit files in `src/components/puzzles/{PuzzleName}/`. Changes to generator/component don't affect other puzzles.

### Debug collision detection
Two implementations: `GridLayout.checkCollision` (drop + hover highlight) and the
inline check in `App.handleResizePuzzle`. Same AABB algorithm; fix both.

### Update drag/drop format
Encoding lives in `Sidebar.handleDragStart` (new puzzles) and
`PuzzleWrapper.handleDragStart` (moves); parsing is in
`GridLayout.handleDragOver`. Config goes through `DragConfigContext`, not the
format string. See **Drag & Drop Protocol** above.
