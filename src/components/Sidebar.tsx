import { useState, useCallback } from 'react';
import type { DragEvent } from 'react';
import { SIDEBAR_ENTRIES, type SidebarEntry } from './puzzles';
import { useDragConfig } from '../contexts/DragConfigContext';
import { PUZZLE_CATEGORIES } from '../types/puzzle';
import styles from './Sidebar.module.css';

export default function Sidebar() {
  // Generic config state: maps sidebar entry key to its current config.
  // Keyed by entry, not puzzle type, so a puzzle listed twice (e.g. Matching
  // under Thinking and Reading) keeps a separate config for each listing.
  const [configs, setConfigs] = useState<Record<string, unknown>>(() => {
    const initial: Record<string, unknown> = {};
    for (const entry of SIDEBAR_ENTRIES) {
      if (entry.config !== undefined) {
        initial[entry.key] = entry.config;
      }
    }
    return initial;
  });

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
        <div className={styles.icon}>{entry.icon}</div>
        <div className={styles.label}>{entry.label}</div>
        <div className={styles.hint}>Drag to grid</div>
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
      <h2 className={styles.title}>Puzzles</h2>
      {PUZZLE_CATEGORIES.map(category => {
        const entries = SIDEBAR_ENTRIES.filter(entry => entry.category === category.id);
        if (entries.length === 0) return null;
        return (
          <section key={category.id} className={styles.category}>
            <h3 className={styles.categoryTitle}>{category.label}</h3>
            <div className={styles.puzzleList}>
              {entries.map(renderEntry)}
            </div>
          </section>
        );
      })}
      <div className={styles.instructions}>
        <p>Drag puzzles onto the grid to create your custom puzzle page.</p>
        <p>Green highlight = valid placement</p>
        <p>Red highlight = invalid (overlap or out of bounds)</p>
      </div>
    </aside>
  );
}
