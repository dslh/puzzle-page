import type { ReactNode } from 'react';

/**
 * A live example in a puzzle's help page: the puzzle itself, drawn from a
 * config. Anything left out comes from the settings the help was opened with
 * and the definition's default size.
 */
export interface ExampleSpec<TConfig = unknown> {
  config?: Partial<TConfig>;
  width?: number;
  height?: number;
  seed?: number;
}

export interface SettingOptionDoc<TConfig = unknown> {
  /** As the config bar labels it, so a parent can find it there. */
  label: string;
  description: ReactNode;
  /** Drawn small beside the description, with this option switched on. */
  example?: ExampleSpec<TConfig>;
}

export interface SettingDoc<TConfig = unknown> {
  label: string;
  description: ReactNode;
  options?: SettingOptionDoc<TConfig>[];
}

/** A slip a child commonly makes, and what to do about it. */
export interface MistakeDoc {
  sign: ReactNode;
  meaning: ReactNode;
}

/**
 * Everything the help dialog says about a puzzle. Written for a parent sitting
 * beside one child, in plain words. Each puzzle keeps its own in `docs.tsx`,
 * loaded only when the help is opened.
 */
export interface PuzzleDoc<TConfig = unknown> {
  /** One or two sentences: what the child does. */
  summary: ReactNode;

  /** At a glance. */
  ages: ReactNode;
  time: ReactNode;
  needs: ReactNode;
  /** Can they do it alone, or does someone need to read it to them? */
  reading: ReactNode;

  /** The main example's seed and size; its config is the current one. */
  example?: Omit<ExampleSpec<TConfig>, 'config'>;

  howItWorks: ReactNode;
  /** What to say to the child, in the child's words. One paragraph each. */
  sayAloud: string[];

  /** What it practises, a few words each. */
  skills: string[];
  whyItMatters: ReactNode;

  /**
   * One entry per config field. Keyed on the config type, so a new setting
   * doesn't compile until it is written up here too.
   */
  settings: { [K in keyof TConfig]-?: SettingDoc<TConfig> };
  /** What making it bigger or smaller changes. */
  size: ReactNode;

  easier: ReactNode[];
  harder: ReactNode[];
  mistakes: MistakeDoc[];
  /** Things to do away from the page. */
  beyondThePage: ReactNode[];

  /** Where it meets what school teaches. Optional, and kept short. */
  atSchool?: ReactNode;
}
