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

There are currently 25 puzzle types - see **Existing Puzzles** below.

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
- **Collision detection**: AABB (axis-aligned bounding box) in `src/utils/placement.ts`

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
    ├── Sidebar (age switch; collapsible categories; one entry per definition + preset;
    │   │        a drawer on narrow screens)
    │   ├── + button (puts the puzzle in the first free space)
    │   └── Config UI (when puzzle.configComponent exists)
    ├── desk (green mat: toolbar with + Puzzles (narrow only) / count / Clear page / Print)
    │   └── GridLayout (drag/drop target + collision detection; zooms the sheet to fit)
            ├── Grid cells (19mm × 19mm visual grid)
            ├── PuzzleWrapper (for each PlacedPuzzle)
            │   ├── Drag handle (mouse; pointer events)
            │   ├── Reroll/delete buttons
            │   ├── Config UI (hover, when puzzle.configComponent exists)
            │   ├── Resize handles (when puzzle.resizable; big tabs on touch)
            │   └── Dynamic puzzle component
            └── Drag preview (while dragging in or moving)
    └── PuzzleSheet (compact layout: the selected puzzle's controls, along the bottom)
```

### Mobile / compact layout

`useCompactLayout` (`src/utils/useCompactLayout.ts`) is true on touch screens
and windows under 900px - `(hover: none), (max-width: 900px)`, mirrored in the
CSS. There:

- The sidebar is a drawer, opened from the toolbar's **+ Puzzles**.
- Puzzles are added with **+**, which `findFreeSpot` places reading the page
  like a book (the + also works on desktop). No room shows a toolbar notice.
- Tapping a puzzle selects it (`App.selectedId`), and its help, reroll, remove
  and config bar open in `PuzzleSheet`. Tapping the empty page deselects.
- The selected puzzle moves by dragging the puzzle itself, and resizes by
  tabs on its right and bottom edges. Only the selected one takes a drag
  (`touch-action: none`), so a swipe across the rest still scrolls the page.

The on-puzzle hover controls only appear under `(hover: hover)` and are hidden
under `(hover: none)`. Dragging a new puzzle in from the sidebar is still HTML5
drag and drop, so mouse-only; on touch, + covers it.

On screen the sheet is shrunk to fit with CSS `zoom` (`--sheet-scale`, set by
a `ResizeObserver` in `GridLayout`), under `@media screen` so print keeps exact
mm sizes. Anything that measures pixels must read the on-screen size, not
assume 72px a cell. The selection outline divides by `--sheet-scale` to stay
4px. Every config bar fits the sheet at 360px wide, since they're built for the
248px sidebar; keep new ones within that. The sheet scrolls sideways only as a
fallback.

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
  category: 'thinking', // a PUZZLE_CATEGORIES id - picks the sidebar group
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

### 6. Write its help page

Add `docs.tsx` beside the definition and point the definition at it with
`docs: () => import('./docs')`. See **Help pages** below. Without it, the
puzzle simply has no `?` button.

## Help pages

Each sidebar entry and each placed puzzle has a `?` button (`HelpButton`) that
opens a full-page `<dialog>` (`src/components/help/PuzzleHelp.tsx`) with the
puzzle's guide. The dialog is portalled to `<body>` so it sits outside the
draggable sidebar entry and the drop target, and it is hidden in print.

A guide is a `PuzzleDoc<TConfig>` (`src/types/puzzleDoc.ts`) default-exported
from the puzzle's `docs.tsx` and lazy-loaded, so guides cost nothing until
opened. Live examples are the puzzle component itself (`PuzzleExample`), drawn
from data (`ExampleSpec`), not screenshots: the main one uses the settings in
force where the help was opened, and each setting option can show a small one
with that option merged over them. "Show another" rerolls every example's seed
together.

`settings` is keyed on the config type, so **adding a config field does not
compile until its guide entry is written** - keep it that way.

Guides are written for a parent sitting beside one child: plain words, a short
script of what to say aloud, what it practises and why, easier / harder,
common slips and what they mean, ideas away from the page, and a brief "At
school" note (EYFS / KS1, England) that claims no more than the puzzle covers.
Keep them terse - about 400-900 words of source per puzzle, one job per
section, a sentence per slip or option; the user cut the first drafts by half.
Read the generator before describing a setting - several have effects the
config bar doesn't show.

**House style.** Follow the GOV.UK content design guidance
(https://www.gov.uk/guidance/content-design/writing-for-gov-uk) and its A-Z
style guide: sentences under about 25 words, the point first, "you" for the
reader, plain words, and a reading age of about 9. On top of that:

- Speak to the parent as "you"; the child is "they" / "them" ("ask them"),
  never "the student" or "the learner".
- Sounds go in slashes (/s/), letter names in quotes ("s"), as school phonics
  materials write them.
- Name settings and options exactly as the config bar prints them.
- "What to say" lines are for the child: no word a five-year-old wouldn't know.
- Say a slip is normal before saying what to do about it. Reassure, don't
  alarm.
- UK spelling and school terms: Reception, Year 1, EYFS, Key Stage 1.

The Laser Maze, Directions, Initial Sounds and Counting guides are the worked
examples of all this; match them. Every puzzle now has a guide; a new puzzle
needs one too. A guide that serves several sidebar entries (Matching, Ordering)
must read right from each, with the mode setting showing every option.

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

There are two kinds of drag:

- **Moving and resizing a placed puzzle** use pointer events, so mouse, touch
  and pen all work. `trackPointerDrag` (`src/utils/pointerDrag.ts`) follows
  the pointer on the window once it has moved 4px (so a tap still selects),
  sets `data-pointer-drag` on `<body>` meanwhile (stops text selection, hides
  `PuzzleSheet`), and swallows the click that follows the release. Moves live
  in `GridLayout.handleMoveStart`: the grabbed cell stays under the pointer,
  the target is clamped to the page, and the puzzle is drawn faintly where it
  was until it lands. Resizes live in `PuzzleWrapper.handleResizeStart`.
  Both measure cells from the sheet as drawn, so they hold at any zoom.
- **Dragging a new puzzle in from the sidebar** is HTML5 drag and drop, below.
  Moving it to pointer events too would retire the type-string trick and
  `DragConfigContext`, at the cost of drawing our own drag image.

Sidebar drag metadata is smuggled through the dataTransfer **type** string, not its
value. Browsers hide `getData()` during `dragover` for security, but the list of
types stays readable - so the payload is encoded into the type itself and read
back with `e.dataTransfer.types.find(t => t.startsWith('puzzle/'))`.

Format: `puzzle/{type}/{width}/{height}`, e.g. `puzzle/sudoku/3/3` (set in
`Sidebar.handleDragStart`).

**Parsing** (in `GridLayout.handleDragOver`): `parts[1]` type, `parts[2]` width,
`parts[3]` height.

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

AABB (axis-aligned bounding box), in one helper: `collides` in
`src/utils/placement.ts`. It bounds-checks against `GRID_COLS`/`GRID_ROWS` and
takes an `excludeId` so a puzzle being moved or resized doesn't collide with
itself. Callers: `GridLayout` (drop validation and the green/red highlight
during `dragover`), `App.handleResizePuzzle`, and `findFreeSpot` (tap to add).

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

Match existing button-bar pattern for config components. Colours come from the
custom properties on `:root` in `index.css` (cutting-mat green desk, graphite
ink, HB-pencil yellow for the selected option) - use them rather than hex
values:

```css
.buttonBar {
  display: flex;
  border: 2px solid var(--line);
  border-radius: var(--radius);
  overflow: hidden;
  background: var(--paper);
}

.button {
  flex: 1;
  padding: 6px 12px;
  font-size: 14px;
  font-weight: 600;
  border: none;
  border-right: 1px solid var(--line);
  background: var(--paper);
  color: var(--ink);
  cursor: pointer;
  transition: all 0.2s;
}

.button.selected {
  background: var(--pencil);
  color: var(--ink);
}
```

The app's own controls use Atkinson Hyperlegible Next (`--ui-font`); the
puzzles keep Playpen Sans (`--hand-font`, set on `body`). The global `button`
rules are wrapped in `:where()` so a module's `.button` always wins.

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

Registered in `src/components/puzzles/index.ts`. "Size" is the default
width×height in grid cells.

### Categories and presets

The sidebar is grouped by category, in `PUZZLE_CATEGORIES` order
(`src/types/puzzle.ts`). Within a category, entries keep registry order. Every
definition has a required `category`. A definition can also list `presets`:
extra sidebar entries for the same puzzle under another name and category, whose
`config` is merged over `defaultConfig`. `SIDEBAR_ENTRIES` in the registry
flattens definitions and presets into what the sidebar draws. A preset only
picks the starting config; the config bar still offers every option.
Categories start collapsed; each header shows how many entries it holds.

### Age switch

The sidebar has an age switch: All / 2–3 / 4–5 / 6–7 (`AGE_BANDS`), remembered
in `localStorage`. A definition or preset can give:

- `ages` - the bands it is listed under. Absent means every band. A preset
  without its own `ages` inherits the puzzle's.
- `ageConfig` - per-band changes merged over the base config.

`startingConfig` in the registry layers them: `defaultConfig`, the puzzle's
`ageConfig` for the band, the preset's `config`, the preset's `ageConfig` for
the band. "All" uses the base only. Switching age resets every sidebar entry to
its new starting config; puzzles already on the page are untouched.

The base defaults are pitched at the main audience (about five), so 4–5 rarely
needs overrides; the other bands carry them. Eleven entries suit 2–3 (Maze,
Roads, Pre-Writing Patterns, Dot Marker, Pattern Sequence, Matching shadows, Match the
Halves, Size Ordering, Which Doesn't Belong?, Odd One Out, Find the Pair); everything else is
`ages: ['4-5', '6-7']`. New toddler-level puzzles are planned. Keep overrides to settings you're sure of - the user tunes them.

| Category | Puzzles |
|---|---|
| Mazes & Paths | Maze, Weaving Maze, Laser Maze, Puzzle Maze, Directions, Roads *(preset)* |
| Reading & Phonics | Word / Letter / Rhyme Matching *(presets)*, Word Search, Colour by Sight Word, Initial Sounds, Secret Code |
| Writing | Handwriting, Letter Formation, Pre-Writing Patterns, Dot Marker |
| Numbers | Counting, Ordering, Sums, Take Away, More or Less |
| Thinking & Logic | Sudoku, Which Doesn't Belong?, Pattern Sequence, Matching (shadows), Match the Halves *(preset)*, Picture Scramble, Odd One Out, Find the Pair *(preset)*, Size Ordering *(preset)*, Chess |

The puzzles in registry order:

| Puzzle | `type` | Size | Resize | Config |
|---|---|---|---|---|
| Maze (4×4) | `maze` | 4×4 | both | grid shape (square / hex / triangle / rhombille / snub square / Cairo pentagon / Voronoi tilings; circle / hexagon / octagon / star / heart rings), cell size, branchiness, straight / curvy walls, start/finish pair |
| Weaving Maze | `weavingmaze` | 5×5 | both | cell size, crossing density, branchiness |
| Sudoku | `sudoku` | 3×3 | fixed | 3×3/4×4/5×5, colors / 1-5 / A-E / custom |
| Which Doesn't Belong? | `whichdoesntbelong` | 4×1 | height | - |
| Pattern Sequence | `patternsequence` | 8×3 | both (min width 5) | shapes / colours, pattern families (AB·ABC, AAB·ABB·AABB, ABCD·ABAC, growing, mirror), filled shapes, gap position |
| Matching | `matching` | 5×4 | both | worked example, pictures / words / letters (upper to lower case) / rhymes (shown as pictures, words or both) / homes (animal to where it lives) / halves (pictures cut down the middle; 2, 3 or one pair a row; any or different shapes), max word length, custom words, custom letters |
| Picture Scramble | `picturescramble` | 7×7 | both | image URL |
| Word Search | `wordsearch` | 5×6 | both | directions, word count, limited letters, custom words |
| Laser Maze | `lasermaze` | 5×5 | both | - |
| Odd One Out | `oddoneout` | 5×5 | fixed | odd one out / pair (all different but two), grid size |
| Counting | `counting` | 4×3 | both | - |
| Ordering | `ordering` | 4×3 | both | numbers / emoji |
| Chess Puzzle | `chess` | 5×5 | fixed | difficulty, mate / capture |
| Puzzle Maze | `puzzlemaze` | 4×4 | both (max 8×10) | emoji mode |
| Handwriting | `handwriting` | 6×4 | both | trace / copy / missing, case, custom words |
| Colour by Sight Word | `coloursightword` | 6×7 | both | colour count, case, custom words |
| Letter Formation | `letterformation` | 6×3 | both (min height 3) | letters / numbers, character, stroke guides, trace count per line |
| Sums | `sums` | 4×3 | both | + / − / both |
| Take Away | `takeaway` | 6×4 | both (min width 4) | blank answer / taken / mixed, worked example |
| More or Less | `moreorless` | 8×5 | both (min 5×2) | worked example |
| Initial Sounds | `initialsounds` | 6×4 | both | circle / write, case, limit to letters |
| Directions | `directions` | 6×7 | both (min 4×4) | follow / write / fix, arrows / `2 ➡️` / `2 right`, route length, spare boxes |
| Secret Code | `secretcode` | 6×7 | both (min 3×3) | code / sounds key, case, decoys, custom words |
| Pre-Writing Patterns | `prewriting` | 8×5 | both (min 4×2) | wide road / thin road / dotted, shapes, size, trace all / carry on |
| Dot Marker | `dotmarker` | 6×6 | both (min 3×3) | shape (circle / heart / star / square / triangle; house / fish / pumpkin / tree / cloud), small / medium / big dots, edge / filled, picture |

Ten of these carry notes worth reading before editing them:

- **Maze** - the generator and renderer are grid-shape-agnostic. `grids.ts`
  describes each cell by its outline and the neighbour across each side, so a
  new tiling is one more builder function there plus a dropdown entry. Tilings
  that don't fall into rows and columns (rhombille, snub square, Cairo) skip the
  neighbour bookkeeping: they list the polygons of one repeat, and
  `polygons.ts` fits the pattern to the area and pairs up cells that share a
  side. Voronoi (`voronoi.ts`) feeds the same helper, and is the only grid that
  draws on the RNG - it takes its points from the maze's own sequence before
  carving starts. The ring shapes (circle, star, heart, ...) all come from
  `concentric.ts`, which takes any outline that is star-shaped about the origin;
  a new ring shape is just an outline. Square mazes consume the RNG in the same
  order as before the shapes were added (neighbours listed top, right, bottom,
  left), so a seed still gives the same maze - keep that order. Curvy walls are
  a drawing option only (`curves.ts`): the same walls, joined into runs and
  drawn as corner-cutting curves, on any grid shape.
- **Chess** - `puzzleData.ts` is auto-generated from the Lichess puzzle database
  (mate-in-1 and capture puzzles filtered by popularity). Don't hand-edit it.
- **Weaving Maze** - the generation algorithm is written up in
  `docs/weaving-maze-algorithm.md`.
- **Matching (halves)** - pictures come from a hand-kept list,
  `halves.ts`, not the emoji categories. `shape` marks pictures whose outline
  alone tells them apart (for the "Different" setting, for black and white
  printing); round faces and fruit are in only by colour. Pictures sharing a
  `lookalike` key never share a page. The half is a fixed-width window on a
  1.4em box, so the cut stays central for emoji drawn wider than 1em.
- **Matching (homes)** - `habitats.ts` tags each animal with its home plus
  every other home a child could fairly pick (`alsoFits`), and the generator
  never shows an animal beside a second home it fits. That keeps every line
  gradeable, at the cost of capping puzzles at about 8 pairs. Homes without an
  emoji (cave, hive, pond, ...) are simply left out.
- **Initial Sounds** - the picture is the child's only clue, so a word is
  used only if its first letter makes its usual sound (no digraph starts, soft
  C/G, or long vowels) and its emoji can't plausibly be named with another
  letter. The second filter is a hand-kept `AMBIGUOUS_PICTURES` set in its
  generator; check new `wordList.ts` entries against it.
- **Directions** - a treasure island map (it covers the robot paths idea too,
  GitHub #18, #19). Routes are runs that each turn a corner and never cross
  themselves. They start from the ship, moored in a sea square on the edge,
  and the first run heads inland. The island (`island.ts`) is decided square by square - sea
  bays, clumps of trees and mountains, landmarks - and every drawn square is
  blocked, so only blank sand is walkable. In follow mode the landmarks sit
  where the usual slips end (a run turned the wrong way, or miscounted by
  one), so a wrong answer lands on something nameable. The coastline
  (`coast.ts`) is drawn afterwards as a contour of a distance field and never
  changes which squares are land. The line art is Kenney's Cartography Pack
  (CC0), pulled into `art.ts` by `scripts/extract-cartography-art.mjs`; don't
  hand-edit it, and add icons by sheet cell there. Write mode's boxes come from
  a BFS over the map, not from the generated route, so any shortest answer
  fits, and its length setting is the *answer's* run count - maps whose
  obstacles allow a shorter way are rejected. Fix mode only plants a mistake
  that has exactly one single-token fix. All of it is laid out against the mm
  constants at the top of `generator.ts`, mirrored in the CSS; the strip
  under the map takes one line of steps when the route fits, else two.
- **Secret Code** - pictures in a key stand for letters; the child decodes
  each word under it. Words are packed several to a row where the width
  allows, and chosen to reuse each other's letters (`orderBySharedLetters`)
  so key pictures come back. More words need more key letters, so the
  generator searches for the most words that fit together with their key,
  using the mm `LAYOUT` constants the component also draws with. The default "code" key uses a hand-picked `CIPHER_PICTURES` set
  (distinct in mono, never paired with a letter its name starts with). The
  "sounds" key reuses Initial Sounds' `isEligible`/`firstSoundLetter`, plus
  a few key-only extras for I, U and Y; Q and X have no picture, so words
  with them are skipped in that mode and named in the config bar.

- **Pre-Writing Patterns** - one centreline per row, drawn two ways. Dotted
  rows are a solid example, then dots (zero-length dashes with round caps) to
  trace, each run a whole number of repeats. A road is the same line stroked
  thick in ink, then thinner in white on top; it takes only the flowing
  shapes (`ROAD_PATTERNS`), since a road can't lift off or cross itself.
  Road waves and arch tops are stretched, and lowered if need be, so no bend
  is tighter than half the road's width - tighter pinches the inside edge to
  a point. Rows follow `PATTERNS` order, which is the order children usually
  manage the shapes. Start and end pictures come from Maze's `themes.ts`.

- **Dot Marker** - circle, heart and star are Maze's `OUTLINES`; the rest
  are its own, the round ones built from overlapping circles (`lobes`). Any
  vertex turning more than 25° is a corner and gets a dot, and the stretch
  between corners is shared out evenly by length, so the gaps stay even on
  the pointy shapes. Corners closer than a dot's width are thinned by
  `withoutOverlaps`, keeping points over dips and sharper over blunter. Parts
  too thin for dots (a stalk, a trunk) are `shapeExtras`, drawn as plain
  outline for colouring. A picture shape needs every feature about two dots
  across at the default size. Filled adds a honeycomb inside,
  offset only by whole or half spacings so symmetric shapes stay symmetric.
  The picture goes at the sampled spot furthest from every edge dot. Letters
  and numbers aren't star-shaped and need their own dot paths (GitHub #24).

**Shared data:** `WordSearch/wordList.ts` holds 234 emoji-paired 3-5 letter
words, imported by Word Search, Handwriting and Matching. Add words there rather
than starting a second list. Each entry carries three tags beyond the word and
its emoji, and puzzles filter on them:

- `rime` - a phonetic rime key. Two words rhyme **iff** their rime strings are
  equal. It is deliberately not a spelling suffix: `CAT`/`HAT` are `"at"` while
  `GOAT`/`BOAT` are `"oat"`, and `BEAR`/`PEAR` (`"air"`) are kept apart from
  `STAR`/`CAR` (`"ar"`). Grouping by trailing letters instead produces
  confidently wrong rhymes.
- `decodable` - the child can sound it out from regular letter-sound
  correspondences. False for `EIGHT`, `KEY`, `BEAR`.
- `pictureClue` (optional, defaults true) - the emoji alone identifies the word.
  False for the colour words, whose coloured squares are indistinguishable once
  printed in mono, and the number words, whose numeral keycaps can be read
  without decoding the word at all.

Matching is the one exception to the "unknown means allowed" rule below: its
right-hand column is a picture, so a custom word with no curated emoji cannot be
drawn at all. `Matching/generator.ts` resolves the field against `WORD_LIST` and
reports back the words it could not match, so the config bar can name them
rather than dropping them silently. A word that *does* resolve then bypasses the
length, decodability and picture-clue filters, as on every other puzzle.

**`WordEntry` vs `PuzzleWord`:** `WordEntry` is a curated list entry and is
always fully tagged. `PuzzleWord` is what generators actually handle - a curated
entry *or* a word a parent typed into a custom-words field, whose rime and
decodability are genuinely unknowable. Filter with `w.decodable !== false`, never
`=== true`: treating unknown as disallowed silently drops exactly the words a
parent chose on purpose.

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
it was generalised - it now initialises a `Record<string, unknown>` from each
sidebar entry's config (keyed by entry, so a puzzle listed twice keeps two
configs) and renders `configComponent` generically. No
per-puzzle code remains in the sidebar, and adding a configurable puzzle needs no
core changes.

The remaining known duplication is the `SeededRandom` LCG class, which is
copy-pasted into most generators. It is deliberate for now.

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
One implementation: `collides` in `src/utils/placement.ts`, used for drops,
the drag highlight, resizes and tap-to-add.

### Update drag/drop format
Only sidebar drags use it now. Encoding lives in `Sidebar.handleDragStart`;
parsing is in `GridLayout.handleDragOver`. Moves and resizes are pointer
events. Config goes through `DragConfigContext`, not the
format string. See **Drag & Drop Protocol** above.
