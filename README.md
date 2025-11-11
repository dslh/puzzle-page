# Puzzle Page Generator

A React app for generating printable puzzle pages suitable for 4-5 year olds.

## Features

- **Maze Puzzles**: Randomly generated mazes using recursive backtracking algorithm
- **Print-Ready**: A4-optimized layout with clean black & white design
- **No Dependencies**: Pure frontend app with no persistence or authentication required

## Tech Stack

- React + TypeScript
- Vite
- CSS Modules

## Getting Started

```bash
# Install dependencies
npm install

# Run development server
npm run dev

# Build for production
npm run build
```

## Usage

1. Click "Generate New Puzzles" to create fresh puzzle variations
2. Click "Print Page" to print the current puzzle page

## Project Structure

```
src/
├── components/puzzles/    # Puzzle components
│   ├── Maze.tsx
│   └── Maze.module.css
├── utils/                 # Puzzle generation algorithms
│   └── mazeGenerator.ts
├── App.tsx               # Main app component
└── App.module.css        # App styles
```

## License

MIT
