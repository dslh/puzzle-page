import { AGE_BANDS, GRID_COLS, GRID_ROWS } from '../types/puzzle';
import type { AgeBand, AgeSetting, PlacedPuzzle } from '../types/puzzle';
import { getPuzzleDefinition } from '../components/puzzles';

/**
 * Everything the editor keeps between visits, in this browser only: one
 * profile per child, plus "Anyone" for a parent who hasn't made one. Each
 * holds its own page in progress and the settings it has learned.
 */

export type Rating = 'easy' | 'right' | 'hard';

/** A page as it was printed, kept so it can be printed again or rated. */
export interface SavedPage {
  id: string;
  printedAt: number;
  puzzles: PlacedPuzzle[];
  /** Keyed by the puzzle's id on this page. */
  ratings: Record<string, Rating>;
}

interface Slot {
  /**
   * Settings learned per sidebar entry: whatever was last chosen. An entry
   * with none starts from its age's starting config.
   */
  settings: Record<string, unknown>;
  page: PlacedPuzzle[];
}

export interface Child extends Slot {
  id: string;
  name: string;
  age: AgeBand;
  /** Sidebar entry keys */
  favourites: string[];
  notYet: string[];
  /** Newest first */
  history: SavedPage[];
}

export interface Anyone extends Slot {
  age: AgeSetting;
}

export interface Store {
  version: 1;
  children: Child[];
  /** The chosen child, or null for Anyone */
  activeId: string | null;
  anyone: Anyone;
}

const STORE_KEY = 'puzzle-page:store';
// Where the age switch was remembered before profiles
const LEGACY_AGE_KEY = 'puzzle-page:age';
// Plenty for a year of pages, and well inside the browser's storage limit
const HISTORY_LIMIT = 200;

export const RATINGS: { id: Rating; label: string }[] = [
  { id: 'easy', label: 'Too easy' },
  { id: 'right', label: 'About right' },
  { id: 'hard', label: 'Too hard' },
];

export function newId(): string {
  return `${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 8)}`;
}

export function newSeed(): number {
  return Date.now() + Math.floor(Math.random() * 1000);
}

function emptyStore(age: AgeSetting = 'all'): Store {
  return { version: 1, children: [], activeId: null, anyone: { age, settings: {}, page: [] } };
}

const isAgeBand = (value: unknown): value is AgeBand =>
  AGE_BANDS.some(band => band.id === value);

const isRecord = (value: unknown): value is Record<string, unknown> =>
  typeof value === 'object' && value !== null && !Array.isArray(value);

const stringList = (value: unknown): string[] =>
  Array.isArray(value) ? value.filter((v): v is string => typeof v === 'string') : [];

/**
 * Puzzles from storage or a backup file: unknown types and bad positions are
 * dropped, and configs are filled out with any settings added since they
 * were saved.
 */
function cleanPuzzles(value: unknown): PlacedPuzzle[] {
  if (!Array.isArray(value)) return [];
  return value.flatMap(item => {
    if (!isRecord(item) || typeof item.type !== 'string') return [];
    const definition = getPuzzleDefinition(item.type);
    const { x, y, width, height, seed } = item;
    if (!definition || ![x, y, width, height, seed].every(n => Number.isFinite(n))) return [];
    const puzzle = { x, y, width, height } as { x: number; y: number; width: number; height: number };
    if (puzzle.x < 0 || puzzle.y < 0 || puzzle.x + puzzle.width > GRID_COLS || puzzle.y + puzzle.height > GRID_ROWS) {
      return [];
    }
    const defaults = definition.defaultConfig as object | undefined;
    return [{
      id: typeof item.id === 'string' ? item.id : newId(),
      type: definition.type,
      entry: typeof item.entry === 'string' ? item.entry : undefined,
      ...puzzle,
      seed: seed as number,
      config: defaults && isRecord(item.config) ? { ...defaults, ...item.config } : defaults,
    }];
  });
}

function cleanRatings(value: unknown): Record<string, Rating> {
  if (!isRecord(value)) return {};
  return Object.fromEntries(Object.entries(value).filter(
    ([, rating]) => RATINGS.some(r => r.id === rating),
  )) as Record<string, Rating>;
}

function cleanChild(value: unknown): Child | null {
  if (!isRecord(value) || typeof value.name !== 'string' || !isAgeBand(value.age)) return null;
  return {
    id: typeof value.id === 'string' ? value.id : newId(),
    name: value.name.slice(0, 40),
    age: value.age,
    settings: isRecord(value.settings) ? value.settings : {},
    page: cleanPuzzles(value.page),
    favourites: stringList(value.favourites),
    notYet: stringList(value.notYet),
    history: (Array.isArray(value.history) ? value.history : []).flatMap(page => {
      if (!isRecord(page) || !Number.isFinite(page.printedAt)) return [];
      const puzzles = cleanPuzzles(page.puzzles);
      if (puzzles.length === 0) return [];
      return [{
        id: typeof page.id === 'string' ? page.id : newId(),
        printedAt: page.printedAt as number,
        puzzles,
        ratings: cleanRatings(page.ratings),
      }];
    }).slice(0, HISTORY_LIMIT),
  };
}

/** A store read from storage or a backup file; null if it isn't one. */
export function parseStore(value: unknown): Store | null {
  if (!isRecord(value) || value.version !== 1) return null;
  const children = (Array.isArray(value.children) ? value.children : [])
    .map(cleanChild)
    .filter((child): child is Child => child !== null);
  const anyone = isRecord(value.anyone) ? value.anyone : {};
  const anyoneAge = anyone.age === 'all' || isAgeBand(anyone.age) ? anyone.age : 'all';
  return {
    version: 1,
    children,
    activeId: children.some(c => c.id === value.activeId) ? value.activeId as string : null,
    anyone: {
      age: anyoneAge,
      settings: isRecord(anyone.settings) ? anyone.settings : {},
      page: cleanPuzzles(anyone.page),
    },
  };
}

export function loadStore(): Store {
  try {
    const stored = localStorage.getItem(STORE_KEY);
    if (stored) {
      const store = parseStore(JSON.parse(stored));
      if (store) return store;
    }
    const legacyAge = localStorage.getItem(LEGACY_AGE_KEY);
    if (isAgeBand(legacyAge)) return emptyStore(legacyAge);
  } catch {
    // Storage unavailable or unreadable: start afresh
  }
  return emptyStore();
}

/** False when the browser won't keep anything (private browsing, blocked storage). */
export function saveStore(store: Store): boolean {
  try {
    localStorage.setItem(STORE_KEY, JSON.stringify(store));
    return true;
  } catch {
    return false;
  }
}

export function activeChild(store: Store): Child | undefined {
  return store.children.find(child => child.id === store.activeId);
}

export function activeSlot(store: Store): Child | Anyone {
  return activeChild(store) ?? store.anyone;
}

/** The store with the active child (or Anyone) changed. */
export function updateSlot(store: Store, change: (slot: Child | Anyone) => Partial<Child>): Store {
  const child = activeChild(store);
  if (!child) {
    return { ...store, anyone: { ...store.anyone, ...change(store.anyone) } as Anyone };
  }
  return {
    ...store,
    children: store.children.map(c => c.id === child.id ? { ...c, ...change(c) } : c),
  };
}

export function updateChild(store: Store, id: string, change: (child: Child) => Partial<Child>): Store {
  return {
    ...store,
    children: store.children.map(c => c.id === id ? { ...c, ...change(c) } : c),
  };
}

// The same puzzles in the same places, whatever their ids
const sameLayout = (a: PlacedPuzzle[], b: PlacedPuzzle[]) => {
  const layout = (puzzles: PlacedPuzzle[]) => JSON.stringify(puzzles.map(p => (
    [p.type, p.entry, p.x, p.y, p.width, p.height, p.seed, p.config]
  )));
  return layout(a) === layout(b);
};

/**
 * Adds the active child's page to their history as it is printed. A page
 * printed before just moves to the top with today's date, keeping its ratings.
 */
export function recordPrint(store: Store): Store {
  const child = activeChild(store);
  if (!child || child.page.length === 0) return store;
  const earlier = child.history.find(page => sameLayout(page.puzzles, child.page));
  const page: SavedPage = earlier
    ? { ...earlier, printedAt: Date.now() }
    : { id: newId(), printedAt: Date.now(), puzzles: child.page, ratings: {} };
  return updateChild(store, child.id, c => ({
    history: [page, ...c.history.filter(p => p !== earlier)].slice(0, HISTORY_LIMIT),
  }));
}

/** A saved page's puzzles, ready to go on the page again; `reroll` gives new ones. */
export function copyPage(page: SavedPage, reroll: boolean): PlacedPuzzle[] {
  return page.puzzles.map(puzzle => ({
    ...puzzle,
    id: newId(),
    seed: reroll ? newSeed() : puzzle.seed,
  }));
}

/** How a sidebar entry's puzzle went the last time it was rated. */
export function lastRating(child: Child, entryKey: string): Rating | undefined {
  for (const page of child.history) {
    for (const puzzle of page.puzzles) {
      if (puzzle.entry === entryKey && page.ratings[puzzle.id]) return page.ratings[puzzle.id];
    }
  }
  return undefined;
}
