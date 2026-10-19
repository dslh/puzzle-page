import { useEffect, useRef, useState } from 'react';
import type { MouseEvent } from 'react';
import { AGE_BANDS, PUZZLE_CATEGORIES, type AgeBand, type PuzzleCategory } from '../../types/puzzle';
import type { ExampleSpec, PuzzleDoc, SettingDoc } from '../../types/puzzleDoc';
import type { AnyPuzzleDefinition } from '../puzzles';
import PuzzleExample from './PuzzleExample';
import styles from './PuzzleHelp.module.css';

/** What a puzzle's help is opened on: a sidebar entry, or a puzzle on the page. */
export interface HelpSubject {
  definition: AnyPuzzleDefinition;
  label: string;
  icon: string;
  category: PuzzleCategory;
  ages?: AgeBand[];
  /** The settings in force where the help was opened; examples start from them. */
  config: unknown;
}

interface PuzzleHelpProps {
  subject: HelpSubject;
  onClose: () => void;
}

// Screen size of one grid cell, for fitting examples into the dialog
const CELL_PX = 72;
const MAIN_EXAMPLE_PX = 680;
const OPTION_EXAMPLE_PX = 220;

type LoadState = { status: 'loading' } | { status: 'ready'; doc: PuzzleDoc } | { status: 'failed' };

export default function PuzzleHelp({ subject, onClose }: PuzzleHelpProps) {
  const { definition, label, icon, category, ages, config } = subject;
  const dialogRef = useRef<HTMLDialogElement>(null);
  const [load, setLoad] = useState<LoadState>({ status: 'loading' });
  // Every example shares one seed, so "Show another" redraws them together
  const [seed, setSeed] = useState<number | null>(null);

  useEffect(() => {
    dialogRef.current?.showModal();
  }, []);

  useEffect(() => {
    let cancelled = false;
    // Cast needed: registry aggregates heterogeneous puzzle types
    const loadDocs = definition.docs as (() => Promise<{ default: PuzzleDoc }>) | undefined;
    loadDocs?.()
      .then(module => { if (!cancelled) setLoad({ status: 'ready', doc: module.default }); })
      .catch(() => { if (!cancelled) setLoad({ status: 'failed' }); });
    return () => { cancelled = true; };
  }, [definition]);

  // A click that lands on the dialog itself, not its sheet, is on the backdrop
  const handleClick = (e: MouseEvent<HTMLDialogElement>) => {
    if (e.target === e.currentTarget) dialogRef.current?.close();
  };

  const categoryLabel = PUZZLE_CATEGORIES.find(c => c.id === category)?.label;
  const ageLabels = (ages ?? AGE_BANDS.map(band => band.id))
    .map(id => AGE_BANDS.find(band => band.id === id)?.label);

  const doc = load.status === 'ready' ? load.doc : null;
  const currentSeed = seed ?? doc?.example?.seed ?? 1;

  const example = (spec: ExampleSpec | undefined, maxPx: number) => {
    const width = spec?.width ?? doc?.example?.width ?? definition.defaultWidth;
    const height = spec?.height ?? doc?.example?.height ?? definition.defaultHeight;
    const exampleConfig = spec?.config ? { ...(config as object), ...spec.config } : config;
    const scale = Math.min(1, maxPx / (width * CELL_PX));
    return {
      scale,
      node: (
        <PuzzleExample
          definition={definition}
          config={exampleConfig}
          width={width}
          height={height}
          seed={spec?.seed ?? currentSeed}
          scale={scale}
        />
      ),
    };
  };

  return (
    <dialog
      ref={dialogRef}
      className={styles.dialog}
      onClose={onClose}
      onClick={handleClick}
      // React bubbles portal events up its own tree, which runs through the
      // draggable sidebar entry: keep a drag of selected text from reaching it
      onDragStart={e => e.stopPropagation()}
      onDragEnd={e => e.stopPropagation()}
      aria-labelledby="puzzle-help-title"
    >
      <article className={styles.sheet} data-category={category}>
        <header className={styles.header}>
          <span className={styles.headerIcon} aria-hidden="true">{icon}</span>
          <div className={styles.headerText}>
            <h2 id="puzzle-help-title" className={styles.title}>{label}</h2>
            <div className={styles.chips}>
              <span className={`${styles.chip} ${styles.categoryChip}`}>{categoryLabel}</span>
              {ageLabels.map(age => (
                <span key={age} className={styles.chip}>Ages {age}</span>
              ))}
            </div>
          </div>
          <button
            type="button"
            className={styles.closeButton}
            onClick={() => dialogRef.current?.close()}
            aria-label="Close"
          >
            ×
          </button>
        </header>

        {load.status === 'loading' && <p className={styles.status}>Loading…</p>}
        {load.status === 'failed' && (
          <p className={styles.status}>This guide couldn’t be loaded. Check your connection and try again.</p>
        )}

        {doc && (
          <>
            <p className={styles.summary}>{doc.summary}</p>

            <dl className={styles.glance}>
              <div><dt>Ages</dt><dd>{doc.ages}</dd></div>
              <div><dt>Time</dt><dd>{doc.time}</dd></div>
              <div><dt>You’ll need</dt><dd>{doc.needs}</dd></div>
              <div><dt>Reading</dt><dd>{doc.reading}</dd></div>
            </dl>

            <MainExample
              {...example(undefined, MAIN_EXAMPLE_PX)}
              onReroll={() => setSeed(Math.floor(Math.random() * 1_000_000))}
            />

            <section className={styles.section}>
              <h3>How it works</h3>
              <div className={styles.prose}>{doc.howItWorks}</div>
            </section>

            <section className={styles.section}>
              <h3>What to say</h3>
              <div className={styles.sayAloud}>
                {doc.sayAloud.map((line, i) => <p key={i}>“{line}”</p>)}
              </div>
            </section>

            <section className={styles.section}>
              <h3>What it practises</h3>
              <ul className={styles.skills}>
                {doc.skills.map(skill => <li key={skill}>{skill}</li>)}
              </ul>
              <div className={styles.prose}>{doc.whyItMatters}</div>
            </section>

            {Object.keys(doc.settings).length > 0 && (
              <section className={styles.section}>
                <h3>Settings</h3>
                <p className={styles.sectionNote}>
                  Set these in the sidebar before dragging the puzzle out, or hover over a
                  puzzle on the page to change it there. The examples start from your
                  current settings.
                </p>
                {(Object.values(doc.settings) as SettingDoc[]).map(setting => (
                  <div key={setting.label} className={styles.setting}>
                    <h4>{setting.label}</h4>
                    <div className={styles.prose}>{setting.description}</div>
                    {setting.options && (
                      <div
                        className={`${styles.options} ${
                          setting.options.some(option => option.example) ? '' : styles.compactOptions
                        }`}
                      >
                        {setting.options.map(option => (
                          <div key={option.label} className={styles.option}>
                            {option.example && (
                              <div className={styles.optionExample}>
                                {example(option.example, OPTION_EXAMPLE_PX).node}
                              </div>
                            )}
                            <div className={styles.optionText}>
                              <span className={styles.optionLabel}>{option.label}</span>
                              <div className={styles.prose}>{option.description}</div>
                            </div>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                ))}
              </section>
            )}

            <section className={styles.section}>
              <h3>Size</h3>
              <div className={styles.prose}>{doc.size}</div>
            </section>

            <section className={styles.section}>
              <h3>Helping</h3>
              <div className={styles.twoUp}>
                <div>
                  <h4>To make it easier</h4>
                  <ul>{doc.easier.map((item, i) => <li key={i}>{item}</li>)}</ul>
                </div>
                <div>
                  <h4>To make it harder</h4>
                  <ul>{doc.harder.map((item, i) => <li key={i}>{item}</li>)}</ul>
                </div>
              </div>
              {doc.mistakes.length > 0 && (
                <>
                  <h4>Common slips</h4>
                  <dl className={styles.mistakes}>
                    {doc.mistakes.map((mistake, i) => (
                      <div key={i}>
                        <dt>{mistake.sign}</dt>
                        <dd>{mistake.meaning}</dd>
                      </div>
                    ))}
                  </dl>
                </>
              )}
            </section>

            <section className={styles.section}>
              <h3>Away from the page</h3>
              <ul>{doc.beyondThePage.map((item, i) => <li key={i}>{item}</li>)}</ul>
            </section>

            {doc.atSchool && (
              <aside className={styles.atSchool}>
                <h3>At school</h3>
                <div className={styles.prose}>{doc.atSchool}</div>
              </aside>
            )}
          </>
        )}
      </article>
    </dialog>
  );
}

function MainExample({ node, scale, onReroll }: { node: React.ReactNode; scale: number; onReroll: () => void }) {
  return (
    <figure className={styles.mainExample}>
      {node}
      <figcaption className={styles.exampleCaption}>
        <span>
          {scale === 1 ? 'Printed size' : `Shown at ${Math.round(scale * 100)}% of printed size`}
          {' · '}your current settings
        </span>
        <button type="button" className={styles.rerollButton} onClick={onReroll}>
          🎲 Show another
        </button>
      </figcaption>
    </figure>
  );
}
