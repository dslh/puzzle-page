# Product

<!-- impeccable:product-schema 1 -->

## Platform

web

## Users

Parents making printable activity sheets at home for their own young children,
roughly ages 2-7 (toddler, Reception, Key Stage 1, England). The parent works
the editor alone, usually in a few spare minutes, then prints the sheet and
sits beside one child while they do it. The maintainer's own two children
(about 2.5 and 5-7 as of October 2026) are the test bed, not the audience
limit.

Children never touch the editor. Only the printed page reaches them.

## Product Purpose

Puzzle Page builds an A4 sheet of age-pitched puzzles - mazes, phonics,
handwriting, number work, logic - that a parent drags onto a grid, tunes and
prints. Success is a fresh, well-pitched page printed fast: a few minutes from
opening the site to a sheet in the child's hands.

## Positioning

Every puzzle is generated, not picked from a stock of worksheets: seeded, so
the 🎲 reroll gives a new one of the same kind and level without disturbing the
rest of the page. A parent mixes many puzzle types on one sheet, at the child's
level, and never runs out. Each puzzle carries a parent-facing guide with what
to say, what it practises and what common slips mean.

## Operating Context

- Used at home, on a laptop or a phone/tablet; the compact layout is a
  first-class path, not a fallback.
- Output is a printed A4 page, laid out in millimetres; most parents print in
  colour, so mono-safe picking is an option rather than the default.
- The page is done with a pencil or pen by one child, with a parent next to
  them reading the guide's "What to say" lines aloud.
- School context is England: EYFS and KS1 terms, UK spelling, phonics
  conventions (/s/ for sounds, "s" for letter names).

## Capabilities and Constraints

- 28 puzzle types grouped into sidebar categories, with presets and an age
  switch (All / 2-3 / 4-5 / 6-7) that sets each entry's starting config.
- 10 × 14 grid of 19 mm cells; drag, move, resize, reroll, configure, print.
- Static React + TypeScript frontend on Vite, deployed to Fly.io as an nginx
  image. No accounts today.
- Puzzle help guides follow GOV.UK content design: plain words, reading age
  about 9, terse (400-900 words of source each).
- **Profiles and saving (decided October 2026):** a profile per child holds
  their age band (not a birthday), learned per-puzzle settings, favourite and
  "Not yet" puzzles, their page in progress, a history of printed pages, and
  how each puzzle went (too easy / about right / too hard). Choosing a child
  sets the age; "Anyone" keeps the plain age choice for parents without a
  profile. Everything is kept on this device only, with a backup file to save
  and load; no accounts, no server. A page belongs to one child.
- **Open:** whether the product stays free, ad-free and backend-free was not
  confirmed either way.

## Brand Commitments

- Name: Puzzle Page.
- Voice to parents: plain, reassuring, second person; the child is "they".
  Say a slip is normal before saying what to do about it.

## Evidence on Hand

- Live site: https://puzzle-page.fly.dev
- Per-puzzle guides in `src/components/puzzles/*/docs.tsx`; Laser Maze,
  Directions, Initial Sounds and Counting are the reference examples.
- Research notes in `docs/`.
- No testimonials, usage numbers, school endorsements or press. Don't invent
  them.

## Product Principles

1. **The printed page is the product.** The editor serves the sheet; nothing
   on screen matters if the print is wrong.
2. **Fast to a good page.** Sensible age-pitched defaults first; tuning is
   there when wanted, never required.
3. **Pitched for one real child.** Difficulty, wording and pictures fit the
   age band honestly; claim no more learning than a puzzle delivers.
4. **Written for the parent beside them.** Every guide and label is for an
   adult with a child at their elbow, in plain UK English.

## Accessibility & Inclusion

- Editor UI uses Atkinson Hyperlegible Next for legibility; puzzles use a
  handwriting-style face suited to early readers.
- Children who cannot yet read must still be able to do the age-2-3 puzzles
  from pictures alone.
