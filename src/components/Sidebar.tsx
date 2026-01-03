import { useState, useCallback } from 'react';
import type { DragEvent } from 'react';
import { PUZZLE_DEFINITIONS } from './puzzles';
import { useDragConfig } from '../contexts/DragConfigContext';
import type { PuzzleType } from '../types/puzzle';
import styles from './Sidebar.module.css';

export default function Sidebar() {
  // Generic config state: maps puzzle type to its current config
  // Initialized from defaultConfig for each puzzle that has one
  const [configs, setConfigs] = useState<Record<string, unknown>>(() => {
    const initial: Record<string, unknown> = {};
    for (const puzzle of PUZZLE_DEFINITIONS) {
      if (puzzle.defaultConfig !== undefined) {
        initial[puzzle.type] = puzzle.defaultConfig;
      }
    }
    return initial;
  });

  const { setDragConfig } = useDragConfig();

  const handleConfigChange = useCallback((puzzleType: PuzzleType, newConfig: unknown) => {
    setConfigs(prev => ({
      ...prev,
      [puzzleType]: newConfig,
    }));
  }, []);

  const handleDragStart = (e: DragEvent<HTMLDivElement>, type: PuzzleType, width: number, height: number) => {
    e.dataTransfer.effectAllowed = 'copy';

    // Simplified dataTransfer format - no config in string
    // Format: puzzle/{type}/{width}/{height}
    e.dataTransfer.setData(`puzzle/${type}/${width}/${height}`, '');

    // Pass config via context instead
    const currentConfig = configs[type];
    if (currentConfig !== undefined) {
      setDragConfig({ puzzleType: type, config: currentConfig });
    }
  };

  const handleDragEnd = () => {
    // Clear drag config when drag ends (whether dropped or cancelled)
    setDragConfig(null);
  };

  return (
    <aside className={styles.sidebar}>
      <h2 className={styles.title}>Puzzles</h2>
      <div className={styles.puzzleList}>
        {PUZZLE_DEFINITIONS.map((puzzle) => {
          const ConfigComponent = puzzle.configComponent;
          const currentConfig = configs[puzzle.type];

          return (
            <div
              key={puzzle.type}
              className={styles.puzzleItem}
              draggable
              onDragStart={(e) => handleDragStart(e, puzzle.type, puzzle.defaultWidth, puzzle.defaultHeight)}
              onDragEnd={handleDragEnd}
            >
              <div className={styles.icon}>{puzzle.icon}</div>
              <div className={styles.label}>{puzzle.label}</div>
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
                        onChange={(newConfig) => handleConfigChange(puzzle.type, newConfig)}
                      />
                    );
                  })()}
                </div>
              )}
            </div>
          );
        })}
      </div>
      <div className={styles.instructions}>
        <p>Drag puzzles onto the grid to create your custom puzzle page.</p>
        <p>Green highlight = valid placement</p>
        <p>Red highlight = invalid (overlap or out of bounds)</p>
      </div>
    </aside>
  );
}
