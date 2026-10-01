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
- **No backend**: a static frontend with no accounts and no persistence. The
  page is gone when you reload, so print it first.

## Puzzles

| Puzzle | Options |
|---|---|
| Maze | square / hex / triangle grid, cell size, branchiness |
| Weaving Maze (paths cross over and under each other) | cell size, crossing density, branchiness |
| Puzzle Maze | emoji mode |
| Laser Maze | - |
| Sudoku | 3×3 / 4×4 / 5×5, with colours, numbers, letters or custom symbols |
| Which Doesn't Belong? | - |
| Odd One Out | grid size |
| Pattern Sequence | - |
| Matching | pictures or words, max word length, custom words |
| Picture Scramble | image URL |
| Word Search | directions, word count, limited letters, custom words |
| Counting | - |
| Ordering | numbers or emoji |
| Sums | addition, subtraction or both |
| Take Away (cross out pictures to subtract) | blank the answer or the number taken, worked example |
| Chess Puzzle | difficulty, mate or capture |
| Handwriting | trace / copy / missing letters, case, custom words |
| Letter Formation | letter, stroke guides, trace letters per line |
| Colour by Sight Word | colour count, case, custom words |

## Getting Started

```bash
npm install
npm run dev      # Dev server at http://localhost:5173
npm run build    # TypeScript compile + production build
npm run lint     # ESLint
npm run preview  # Preview the production build
```

There is no test suite.

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
