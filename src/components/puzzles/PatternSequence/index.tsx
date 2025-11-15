import { useMemo } from 'react';
import { generatePatternSequence, type PatternType } from './generator';
import styles from './PatternSequence.module.css';

// Seeded random number generator (matching the one in generator.ts)
class SeededRandom {
  private seed: number;

  constructor(seed: number) {
    this.seed = seed;
  }

  next(): number {
    this.seed = (this.seed * 9301 + 49297) % 233280;
    return this.seed / 233280;
  }
}

interface PatternSequenceProps {
  gridHeight?: number; // Number of grid cells (rows) allocated
  seed: number;
}

export default function PatternSequence({ gridHeight = 1, seed }: PatternSequenceProps) {
  // Generate one pattern per row with mixed types
  const patterns = useMemo(() => {
    const masterRng = new SeededRandom(seed);

    return Array.from({ length: gridHeight }, (_, i) => {
      // Use master RNG to determine pattern type for better mixing
      const type: PatternType = masterRng.next() < 0.5 ? 'alternating' : 'repeating';
      // Use a unique seed for each pattern's content
      return generatePatternSequence(seed + i * 1000, type);
    });
  }, [gridHeight, seed]);

  const renderCircle = (color: string | null, index: number) => {
    const radius = 20;
    const diameter = radius * 2;

    if (color === null) {
      // Empty circle outline (for kids to fill in)
      return (
        <svg
          key={index}
          width={diameter}
          height={diameter}
          className={styles.circle}
        >
          <circle
            cx={radius}
            cy={radius}
            r={radius - 2}
            fill="white"
            stroke="black"
            strokeWidth="2"
          />
        </svg>
      );
    } else {
      // Filled colored circle
      return (
        <svg
          key={index}
          width={diameter}
          height={diameter}
          className={styles.circle}
        >
          <circle
            cx={radius}
            cy={radius}
            r={radius - 2}
            fill={color}
            stroke="black"
            strokeWidth="1"
          />
        </svg>
      );
    }
  };

  return (
    <div className={styles.container}>
      {patterns.map((pattern, rowIndex) => (
        <div key={rowIndex} className={styles.row}>
          <div className={styles.circlesContainer}>
            {pattern.colors.map((color, index) => renderCircle(color, index))}
          </div>
        </div>
      ))}
    </div>
  );
}
