import { useState, useCallback } from 'react';
import type { DragEvent } from 'react';
import { SIDEBAR_ENTRIES, isEntryForAge, startingConfig, type SidebarEntry } from './puzzles';
import { useDragConfig } from '../contexts/DragConfigContext';
import HelpButton from './help/HelpButton';
import { AGE_BANDS, PUZZLE_CATEGORIES, type AgeSetting, type PuzzleCategory } from '../types/puzzle';
import styles from './Sidebar.module.css';

const AGE_STORAGE_KEY = 'puzzle-page:age';

function loadAge(): AgeSetting {
  try {
    const stored = localStorage.getItem(AGE_STORAGE_KEY);
    if (stored === 'all' || AGE_BANDS.some(band => band.id === stored)) {
      return stored as AgeSetting;
    }
  } catch {
    // Storage unavailable: fall through to the default
  }
  return 'all';
}

function startingConfigs(age: AgeSetting): Record<string, unknown> {
  const configs: Record<string, unknown> = {};
  for (const entry of SIDEBAR_ENTRIES) {
    const config = startingConfig(entry, age);
    if (config !== undefined) {
      configs[entry.key] = config;
    }
  }
  return configs;
}

export default function Sidebar() {
  const [age, setAge] = useState<AgeSetting>(loadAge);

  // Generic config state: maps sidebar entry key to its current config.
  // Keyed by entry, not puzzle type, so a puzzle listed twice (e.g. Matching
  // under Thinking and Reading) keeps a separate config for each listing.
  const [configs, setConfigs] = useState<Record<string, unknown>>(() => startingConfigs(age));

  // Switching age resets every entry to that age's starting config.
  const handleAgeChange = (newAge: AgeSetting) => {
    setAge(newAge);
    setConfigs(startingConfigs(newAge));
    try {
      localStorage.setItem(AGE_STORAGE_KEY, newAge);
    } catch {
      // Not remembered across visits, which is fine
    }
  };

  // Categories start collapsed. Configs live above, so closing a category
  // keeps whatever was set inside it.
  const [openCategories, setOpenCategories] = useState<Set<PuzzleCategory>>(() => new Set());

  const toggleCategory = (id: PuzzleCategory) => {
    setOpenCategories(prev => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  };

  const { setDragConfig } = useDragConfig();

  const handleConfigChange = useCallback((entryKey: string, newConfig: unknown) => {
    setConfigs(prev => ({
      ...prev,
      [entryKey]: newConfig,
    }));
  }, []);

  const handleDragStart = (e: DragEvent<HTMLDivElement>, entry: SidebarEntry) => {
    const { type, defaultWidth, defaultHeight } = entry.definition;
    e.dataTransfer.effectAllowed = 'copy';

    // Simplified dataTransfer format - no config in string
    // Format: puzzle/{type}/{width}/{height}
    e.dataTransfer.setData(`puzzle/${type}/${defaultWidth}/${defaultHeight}`, '');

    // Pass config via context instead
    const currentConfig = configs[entry.key];
    if (currentConfig !== undefined) {
      setDragConfig({ puzzleType: type, config: currentConfig });
    }
  };

  const handleDragEnd = () => {
    // Clear drag config when drag ends (whether dropped or cancelled)
    setDragConfig(null);
  };

  const renderEntry = (entry: SidebarEntry) => {
    const ConfigComponent = entry.definition.configComponent;
    const currentConfig = configs[entry.key];

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
          <span className={styles.label}>{entry.label}</span>
          <HelpButton
            className={styles.helpButton}
            subject={{ ...entry, config: currentConfig }}
          />
          <span className={styles.grip} aria-hidden="true" title="Drag onto the page" />
        </div>
        {ConfigComponent && currentConfig !== undefined && (
          <div className={styles.configSection}>
            {(() => {
              // Cast needed: registry aggregates heterogeneous puzzle types
              const Config = ConfigComponent as React.ComponentType<{
                value: unknown;
                onChange: (config: unknown) => void;
              }>;
              return (
                <Config
                  value={currentConfig}
                  onChange={(newConfig) => handleConfigChange(entry.key, newConfig)}
                />
              );
            })()}
          </div>
        )}
      </div>
    );
  };

  return (
    <aside className={styles.sidebar}>
      <h1 className={styles.title}>Puzzle page</h1>
      <div className={styles.ageSwitch} role="group" aria-labelledby="age-label">
        <span id="age-label" className={styles.ageLabel}>Child’s age</span>
        <div className={styles.ageButtons}>
          {[{ id: 'all', label: 'All' } as const, ...AGE_BANDS].map(option => (
            <button
              key={option.id}
              type="button"
              className={`${styles.ageButton} ${age === option.id ? styles.selected : ''}`}
              aria-pressed={age === option.id}
              onClick={() => handleAgeChange(option.id)}
            >
              {option.label}
            </button>
          ))}
        </div>
      </div>
      <p className={styles.instructions}>
        Drag a puzzle onto the page. The squares turn green where it fits and
        red where it would overlap.
      </p>
      {PUZZLE_CATEGORIES.map(category => {
        const entries = SIDEBAR_ENTRIES.filter(entry =>
          entry.category === category.id && isEntryForAge(entry, age)
        );
        if (entries.length === 0) return null;
        const isOpen = openCategories.has(category.id);
        return (
          <section key={category.id} className={styles.category} data-category={category.id}>
            <h3 className={styles.categoryTitle}>
              <button
                type="button"
                className={styles.categoryToggle}
                aria-expanded={isOpen}
                onClick={() => toggleCategory(category.id)}
              >
                <span className={styles.tab} aria-hidden="true" />
                <span className={styles.categoryLabel}>{category.label}</span>
                <span className={styles.count}>{entries.length}</span>
                <span className={`${styles.chevron} ${isOpen ? styles.open : ''}`} aria-hidden="true">›</span>
              </button>
            </h3>
            {isOpen && (
              <div className={styles.puzzleList}>
                {entries.map(renderEntry)}
              </div>
            )}
          </section>
        );
      })}
    </aside>
  );
}
