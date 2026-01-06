import type { SudokuConfig } from './index';
import styles from './SudokuConfigBar.module.css';

interface SudokuConfigBarProps {
  value: SudokuConfig;
  onChange: (config: SudokuConfig) => void;
}

export default function SudokuConfigBar({ value, onChange }: SudokuConfigBarProps) {
  const size = value.size;
  const symbolType = value.symbolType ?? 'colors';
  const customSymbols = value.customSymbols ?? '';

  const handleSizeChange = (newSize: 3 | 4 | 5) => {
    onChange({ ...value, size: newSize });
  };

  const handleSymbolTypeChange = (newType: 'colors' | 'numbers' | 'letters' | 'custom') => {
    onChange({ ...value, symbolType: newType });
  };

  const handleCustomSymbolsChange = (newSymbols: string) => {
    onChange({ ...value, customSymbols: newSymbols });
  };

  return (
    <div className={styles.configContainer}>
      <div className={styles.configRow}>
        <div className={styles.buttonBar}>
          <button
            type="button"
            className={`${styles.button} ${size === 3 ? styles.selected : ''}`}
            onClick={() => handleSizeChange(3)}
          >
            3×3
          </button>
          <button
            type="button"
            className={`${styles.button} ${size === 4 ? styles.selected : ''}`}
            onClick={() => handleSizeChange(4)}
          >
            4×4
          </button>
          <button
            type="button"
            className={`${styles.button} ${size === 5 ? styles.selected : ''}`}
            onClick={() => handleSizeChange(5)}
          >
            5×5
          </button>
        </div>
      </div>

      <div className={styles.configRow}>
        <div className={styles.buttonBar}>
          <button
            type="button"
            className={`${styles.button} ${symbolType === 'colors' ? styles.selected : ''}`}
            onClick={() => handleSymbolTypeChange('colors')}
          >
            Colors
          </button>
          <button
            type="button"
            className={`${styles.button} ${symbolType === 'numbers' ? styles.selected : ''}`}
            onClick={() => handleSymbolTypeChange('numbers')}
          >
            1-5
          </button>
          <button
            type="button"
            className={`${styles.button} ${symbolType === 'letters' ? styles.selected : ''}`}
            onClick={() => handleSymbolTypeChange('letters')}
          >
            A-E
          </button>
          <button
            type="button"
            className={`${styles.button} ${symbolType === 'custom' ? styles.selected : ''}`}
            onClick={() => handleSymbolTypeChange('custom')}
          >
            Custom
          </button>
        </div>
      </div>

      {symbolType === 'custom' && (
        <div className={styles.configRow}>
          <input
            type="text"
            className={styles.textInput}
            value={customSymbols}
            onChange={(e) => handleCustomSymbolsChange(e.target.value.toUpperCase())}
            placeholder={`Enter ${size} letters...`}
            maxLength={size}
          />
        </div>
      )}
    </div>
  );
}
