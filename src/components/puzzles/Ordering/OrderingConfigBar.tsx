import type { OrderingConfig } from './index';
import styles from './OrderingConfigBar.module.css';

interface OrderingConfigBarProps {
  value: OrderingConfig;
  onChange: (config: OrderingConfig) => void;
}

export default function OrderingConfigBar({ value, onChange }: OrderingConfigBarProps) {
  const mode = value.mode ?? 'numbers';

  return (
    <div className={styles.buttonBar}>
      <button
        type="button"
        className={`${styles.button} ${mode === 'numbers' ? styles.selected : ''}`}
        onClick={() => onChange({ ...value, mode: 'numbers' })}
      >
        123
      </button>
      <button
        type="button"
        className={`${styles.button} ${mode === 'emoji' ? styles.selected : ''}`}
        onClick={() => onChange({ ...value, mode: 'emoji' })}
      >
        Emoji
      </button>
    </div>
  );
}
