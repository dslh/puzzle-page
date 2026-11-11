# Puzzle Page Generator

A React app for building printable puzzle pages for young children (early years
and early primary, roughly ages 4-7). Drag puzzles from the sidebar onto an A4
page, tweak them, and print.

Live at https://puzzle-page.fly.dev

## Features

- **Drag-and-drop page layout**: the page is a 10×14 grid of 19mm cells. Drop
  puzzles onto it, move them around, and resize most of them.
- **Configurable puzzles**: most puzzles have options (difficulty, size, custom
  words, ...) that can be set in the sidebar before dragging, or by hovering
  over a puzzle already on the page.
- **Reroll**: every puzzle is generated from a seed, so the 🎲 button gives a
  fresh one without disturbing the rest of the page.
- **Print-ready**: laid out in millimetres for A4, with the sidebar and controls
  hidden when printing.
- **A profile per child**: their age, favourites, puzzles that aren't right
  yet, the settings you last used, and every page printed for them, ready to
  print again or rate (too easy / about right / too hard).
- **No backend**: a static frontend with no accounts. Pages and profiles are
  kept in your browser, with a backup file to save or move them.

## Puzzles

| Puzzle | Options |
|---|---|
| Maze | grid shape (square, hex or triangle tiling; circle, hexagon, octagon, star or heart rings), cell size, branchiness |
| Weaving Maze (paths cross over and under each other) | cell size, crossing density, branchiness |
| Puzzle Maze | emoji mode |
| Laser Maze | - |
| Sudoku | 3×3 / 4×4 / 5×5, with colours, numbers, letters or custom symbols |
| Which Doesn't Belong? | - |
| Odd One Out | grid size |
| Which Way Did It Turn? | clockwise / anticlockwise quarter-turns and half-turns, blocks / pointy / rounded shapes, first-row worked example |
| Pattern Sequence | shapes or colours; choose any of AB/ABC, AAB/ABB/AABB, ABCD/ABAC, growing and mirror patterns; filled shapes; gap position |
| Matching | pictures or words, max word length, custom words |
| Picture Scramble | image URL |
| Word Search | directions, word count, limited letters, custom words |
| Counting | - |
| Ordering | numbers or emoji |
| Sums | addition, subtraction or both |
| Take Away (cross out pictures to subtract) | blank the answer or the number taken, worked example |
| More or Less (compare two groups with > = <) | worked example |
| Initial Sounds (picture → first letter) | circle / write, case, limit to letters |
| Directions (robot or treasure map routes) | follow / write / fix the route, arrows or counted steps or words, theme, length, spare boxes |
| Where Can It Go? / Collect the Stars | one chess piece per small board: dot every square it can reach, or draw a route that lands on every star; piece, board size, pawns in the way, star count, fewest-moves hint |
| Chess Puzzle | difficulty, mate or capture |
| Handwriting | trace / copy / missing letters, case, custom words |
| Letter Formation | letter, stroke guides, trace letters per line |
| Colour by Sight Word | colour count, case, custom words |
| Spot the Difference | cottage garden / seaside / woodland camp / farmyard / playground / castle / surprise me, 3 / 5 / 7 differences, black and white |

## Answer keys

Use **Show answer key** beside Print to reveal answers across the page. Print
changes to **Print answer key**; key copies do not add to a child’s printed-page
history. Answers start hidden when reopening a page or switching child. The view
does not change seeds, settings or saved worksheets.

Marks use a lighter red for dashed circles, gently curved routes and text. Coloured symbols keep their actual
colour; dashed red borders distinguish revealed answers from givens. Answer
circles have slightly uneven loops with overlapping pen ends; their seeded
variation stays the same on screen and in print. Writing
activities show models where useful; tracing and dot-marker activities that
already supply the full model stay unchanged.

## Getting Started

```bash
npm install
npm run dev      # Dev server at http://localhost:5173
npm run build    # TypeScript compile + production build
npm run lint     # ESLint
npm run preview  # Preview the production build
```

Spot the Difference has focused generator and SVG checks:

```bash
node_modules/.bin/esbuild scripts/test-spot-the-difference.ts --bundle --platform=node --jsx=automatic --outfile=/tmp/spot-difference-test.cjs
node --test /tmp/spot-difference-test.cjs
```

Which Way Did It Turn? has focused geometry, generation and rendering checks:

```bash
node_modules/.bin/esbuild scripts/test-turns.ts --bundle --platform=node --jsx=automatic --loader:.css=empty --outfile=/tmp/puzzle-turn-tests.cjs
node --test /tmp/puzzle-turn-tests.cjs
```

Where Can It Go? and Collect the Stars have move, route and layout checks:

```bash
node_modules/.bin/esbuild scripts/test-chess-moves.ts --bundle --platform=node --jsx=automatic --loader:.css=empty --loader:.svg=text --outfile=/tmp/chess-moves-tests.cjs
node --test /tmp/chess-moves-tests.cjs
```

Answer routes and chess data have focused checks too:

```bash
node_modules/.bin/esbuild scripts/test-answer-keys.ts --bundle --platform=node --jsx=automatic --loader:.css=empty --outfile=/tmp/puzzle-answer-tests.cjs
node --test /tmp/puzzle-answer-tests.cjs
```

## Usage

1. Set any options on a puzzle in the sidebar, then drag it onto the page. Cells
   highlight green where it fits and red where it doesn't.
2. Hover over a placed puzzle to move it (⋮⋮ handle), reroll it (🎲), remove it
   (×), change its options, or resize it from its right and bottom edges.
3. Click "Print Page" to print, or "Clear Grid" to start again.

## Tech Stack

- React 19 + TypeScript
- Vite
- CSS Modules

## Project Structure

```
src/
├── App.tsx                    # Holds the list of placed puzzles
├── types/puzzle.ts            # PuzzleDefinition, PuzzleProps, grid constants
├── contexts/                  # DragConfigContext (config for a drag in progress)
└── components/
    ├── Sidebar.tsx            # Puzzle palette and per-puzzle options
    ├── GridLayout.tsx         # The page: drop target and collision detection
    ├── PuzzleWrapper.tsx      # Drag handle, buttons and resize handles
    └── puzzles/
        ├── index.ts           # Registry of every puzzle
        └── {PuzzleName}/      # One self-contained directory per puzzle
            ├── definition.ts  # Metadata, default size and config
            ├── index.tsx      # Component
            ├── generator.ts   # Seeded generation
            └── *.module.css
docs/                          # Notes on individual puzzles' algorithms
```

Each puzzle registers itself through its `definition.ts`, so adding one needs no
changes to the core. `CLAUDE.md` has the full architecture notes and a
step-by-step guide to adding a puzzle.

## Deployment

Built into a static nginx image (`Dockerfile`, `nginx.conf`) and hosted on
Fly.io (`fly.toml`):

```bash
fly deploy
```

## License

MIT
