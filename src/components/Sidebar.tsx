import { useState } from 'react';
import type { DragEvent } from 'react';
import { SIDEBAR_ENTRIES, isEntryForAge, startingConfig, type SidebarEntry } from './puzzles';
import { useDragConfig } from '../contexts/DragConfigContext';
import HelpButton from './help/HelpButton';
import ProfilePicker from './ProfilePicker';
import Backup from './Backup';
import { AGE_BANDS, PUZZLE_CATEGORIES } from '../types/puzzle';
import { activeChild, activeSlot, lastRating, updateSlot, type Store } from '../profiles/store';
import type { StoreChange } from '../profiles/useStore';
import { useCompactLayout } from '../utils/useCompactLayout';
import styles from './Sidebar.module.css';

interface SidebarProps {
  store: Store;
  onChange: StoreChange;
  canSave: boolean;
  /** Puts the entry's puzzle in the first space it fits; false if none. */
  onAdd: (entry: SidebarEntry, config: unknown) => boolean;
  /** Drawer state, for narrow screens; ignored where the sidebar always shows. */
  open: boolean;
  onClose: () => void;
}

const RATING_NOTES = { easy: 'Too easy last time', hard: 'Too hard last time' } as const;

const sameConfig = (a: unknown, b: unknown) => JSON.stringify(a) === JSON.stringify(b);

export default function Sidebar({ store, onChange, canSave, onAdd, open, onClose }: SidebarProps) {
  const compact = useCompactLayout();
  const child = activeChild(store);
  const slot = activeSlot(store);
  const age = slot.age;
  const ageText = age === 'all' ? '' : AGE_BANDS.find(band => band.id === age)?.label;

  // Categories start collapsed, and so does each entry's settings
  const [openCategories, setOpenCategories] = useState<Set<string>>(() => new Set());
  const [openSettings, setOpenSettings] = useState<Set<string>>(() => new Set());

  const toggle = (set: Set<string>, id: string) => {
    const next = new Set(set);
    if (next.has(id)) next.delete(id);
    else next.add(id);
    return next;
  };

  // An entry starts from its age's settings, with whatever was last chosen
  // for this child over them. Merged, so settings added since still default.
  const configFor = (entry: SidebarEntry): unknown => {
    const starting = startingConfig(entry, age);
    const learned = slot.settings[entry.key];
    if (starting === undefined || typeof learned !== 'object' || learned === null) return starting;
    return { ...starting, ...learned };
  };

  const setLearned = (entryKey: string, config: unknown | undefined) => {
    onChange(updateSlot(store, s => {
      const settings = { ...s.settings };
      if (config === undefined) delete settings[entryKey];
      else settings[entryKey] = config;
      return { settings };
    }));
  };

  const setList = (list: 'favourites' | 'notYet', entryKey: string, on: boolean, undoMessage?: string) => {
    if (!child) return;
    onChange(updateSlot(store, () => ({
      [list]: on
        ? [...child[list].filter(k => k !== entryKey), entryKey]
        : child[list].filter(k => k !== entryKey),
    })), undoMessage);
  };

  const { setDragConfig } = useDragConfig();

  const handleDragStart = (e: DragEvent<HTMLDivElement>, entry: SidebarEntry) => {
    const { type, defaultWidth, defaultHeight } = entry.definition;
    e.dataTransfer.effectAllowed = 'copy';

    // Simplified dataTransfer format - no config in string
    // Format: puzzle/{type}/{width}/{height}
    e.dataTransfer.setData(`puzzle/${type}/${defaultWidth}/${defaultHeight}`, '');

    // Pass config and the entry via context instead
    setDragConfig({ puzzleType: type, entryKey: entry.key, config: configFor(entry) });
  };

  const handleDragEnd = () => {
    // Clear drag config when drag ends (whether dropped or cancelled)
    setDragConfig(null);
  };

  const renderEntry = (entry: SidebarEntry, place: string) => {
    const ConfigComponent = entry.definition.configComponent;
    const currentConfig = configFor(entry);
    const hasConfig = ConfigComponent && currentConfig !== undefined;
    const learned = entry.key in slot.settings
      && !sameConfig(currentConfig, startingConfig(entry, age));
    const rating = child && lastRating(child, entry.key);
    const note = rating === 'easy' || rating === 'hard' ? RATING_NOTES[rating] : null;
    const favourite = child?.favourites.includes(entry.key) ?? false;
    const settingsId = `${place}:${entry.key}`;
    const settingsOpen = openSettings.has(settingsId);

    return (
      <div
        key={entry.key}
        className={styles.puzzleItem}
        draggable
        onDragStart={(e) => handleDragStart(e, entry)}
        onDragEnd={handleDragEnd}
      >
        <div className={styles.entryHead}>
          <span className={styles.icon}>{entry.icon}</span>
          <span className={styles.label}>
            {entry.label}
            {note && <span className={styles.note}>{note}</span>}
          </span>
          {child && (
            <button
              type="button"
              className={`${styles.starButton} ${favourite ? styles.starred : ''}`}
              aria-pressed={favourite}
              aria-label={`Favourite: ${entry.label}`}
              title={favourite ? `Take ${entry.label} out of ${child.name}’s favourites` : `Add ${entry.label} to ${child.name}’s favourites`}
              onClick={() => setList('favourites', entry.key, !favourite)}
            >
              <svg viewBox="0 0 24 24" aria-hidden="true">
                <path d="M12 3.2l2.7 5.6 6.1.8-4.5 4.2 1.1 6.1L12 17l-5.4 2.9 1.1-6.1-4.5-4.2 6.1-.8z" />
              </svg>
            </button>
          )}
          <HelpButton
            className={styles.helpButton}
            subject={{ ...entry, config: currentConfig }}
          />
          <button
            type="button"
            className={styles.addButton}
            onClick={() => onAdd(entry, currentConfig ?? entry.definition.defaultConfig)}
            title={`Add ${entry.label} to the page`}
            aria-label={`Add ${entry.label} to the page`}
          >
            +
          </button>
          <span className={styles.grip} aria-hidden="true" title="Drag onto the page" />
        </div>
        {(hasConfig || child) && (
          <button
            type="button"
            className={styles.settingsToggle}
            aria-expanded={settingsOpen}
            onClick={() => setOpenSettings(toggle(openSettings, settingsId))}
          >
            {hasConfig ? 'Settings' : 'More'}
            {learned && <span className={styles.changed}> · changed</span>}
            <span className={`${styles.chevron} ${styles.small} ${settingsOpen ? styles.open : ''}`} aria-hidden="true">›</span>
          </button>
        )}
        {settingsOpen && (
          <div className={styles.configSection}>
            {hasConfig && (() => {
              // Cast needed: registry aggregates heterogeneous puzzle types
              const Config = ConfigComponent as React.ComponentType<{
                value: unknown;
                onChange: (config: unknown) => void;
              }>;
              return (
                <Config
                  value={currentConfig}
                  onChange={(newConfig) => setLearned(entry.key, newConfig)}
                />
              );
            })()}
            {(learned || child) && (
              <div className={styles.settingsFoot}>
                {learned && (
                  <button type="button" className={styles.link} onClick={() => setLearned(entry.key, undefined)}>
                    {ageText ? `Back to age ${ageText} settings` : 'Back to the usual settings'}
                  </button>
                )}
                {child && (
                  <button
                    type="button"
                    className={styles.link}
                    onClick={() => setList('notYet', entry.key, true, `Moved ${entry.label} to Not yet`)}
                  >
                    Not yet for {child.name}
                  </button>
                )}
              </div>
            )}
          </div>
        )}
      </div>
    );
  };

  const hidden = new Set(child?.notYet ?? []);
  const listed = SIDEBAR_ENTRIES.filter(entry => isEntryForAge(entry, age) && !hidden.has(entry.key));
  const favourites = child
    ? child.favourites.flatMap(key => listed.filter(entry => entry.key === key))
    : [];
  const notYet = child
    ? child.notYet.flatMap(key => SIDEBAR_ENTRIES.filter(entry => entry.key === key))
    : [];

  return (
    <aside className={`${styles.sidebar} ${open ? styles.open : ''}`}>
      <div className={styles.titleRow}>
        <h1 className={styles.title}>Puzzle page</h1>
        <button type="button" className={styles.closeButton} onClick={onClose} aria-label="Close puzzle list">
          ×
        </button>
      </div>
      <ProfilePicker store={store} onChange={onChange} />
      <h2 className={styles.listHeading}>Puzzles</h2>
      <p className={styles.instructions}>
        {compact
          ? 'Tap + to add a puzzle. It goes in the first space on the page where it fits.'
          : 'Drag a puzzle onto the page, or click + to put it in the first space it fits. The squares turn green where it fits, red where it would overlap.'}
      </p>
      {child && favourites.length > 0 && (
        <section className={styles.category} data-category="favourites">
          <h3 className={styles.sectionTitle}>
            <span className={styles.tab} aria-hidden="true" />
            {child.name}’s favourites
          </h3>
          <div className={styles.puzzleList}>
            {favourites.map(entry => renderEntry(entry, 'favourites'))}
          </div>
        </section>
      )}
      {PUZZLE_CATEGORIES.map(category => {
        const entries = listed.filter(entry => entry.category === category.id);
        if (entries.length === 0) return null;
        const isOpen = openCategories.has(category.id);
        return (
          <section key={category.id} className={styles.category} data-category={category.id}>
            <h3 className={styles.categoryTitle}>
              <button
                type="button"
                className={styles.categoryToggle}
                aria-expanded={isOpen}
                onClick={() => setOpenCategories(toggle(openCategories, category.id))}
              >
                <span className={styles.tab} aria-hidden="true" />
                <span className={styles.categoryLabel}>{category.label}</span>
                <span className={styles.count}>
                  {entries.length}<span className={styles.visuallyHidden}> puzzles</span>
                </span>
                <span className={`${styles.chevron} ${isOpen ? styles.open : ''}`} aria-hidden="true">›</span>
              </button>
            </h3>
            {isOpen && (
              <div className={styles.puzzleList}>
                {entries.map(entry => renderEntry(entry, category.id))}
              </div>
            )}
          </section>
        );
      })}
      {child && notYet.length > 0 && (
        <section className={styles.category} data-category="notyet">
          <h3 className={styles.categoryTitle}>
            <button
              type="button"
              className={styles.categoryToggle}
              aria-expanded={openCategories.has('notyet')}
              onClick={() => setOpenCategories(toggle(openCategories, 'notyet'))}
            >
              <span className={styles.tab} aria-hidden="true" />
              <span className={styles.categoryLabel}>Not yet for {child.name}</span>
              <span className={styles.count}>
                {notYet.length}<span className={styles.visuallyHidden}> puzzles</span>
              </span>
              <span className={`${styles.chevron} ${openCategories.has('notyet') ? styles.open : ''}`} aria-hidden="true">›</span>
            </button>
          </h3>
          {openCategories.has('notyet') && (
            <div className={styles.puzzleList}>
              {notYet.map(entry => (
                <div key={entry.key} className={`${styles.puzzleItem} ${styles.resting}`}>
                  <div className={styles.entryHead}>
                    <span className={styles.icon}>{entry.icon}</span>
                    <span className={styles.label}>{entry.label}</span>
                    <button
                      type="button"
                      className={styles.bringBack}
                      onClick={() => setList('notYet', entry.key, false)}
                    >
                      Bring back
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </section>
      )}
      <Backup store={store} onChange={onChange} canSave={canSave} />
    </aside>
  );
}
