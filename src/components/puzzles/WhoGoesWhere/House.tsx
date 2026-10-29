import type { CSSProperties } from 'react';

interface HouseProps {
  /** Wall colour; a plain house when left out (the "next door" clue) */
  colour?: string;
  /** Painted on the roof */
  number?: number;
  /** Drawn in the doorway */
  animal?: string;
  /** A cross through the whole house: "not this one" */
  crossed?: boolean;
  /** An open white doorway to draw in */
  open?: boolean;
  style?: CSSProperties;
  className?: string;
}

/**
 * A house, square, drawn in a 100-unit box. The same drawing serves the big
 * houses in the row (open, numbered) and the small ones in the clues (with
 * the animal in the doorway, crossed out for a "not" clue).
 */
export default function House({ colour, number, animal, crossed, open, style, className }: HouseProps) {
  return (
    <svg viewBox="0 0 100 100" style={style} className={className} aria-hidden="true">
      <rect x="12" y="42" width="76" height="54" fill={colour ?? '#fff'} stroke="#333" strokeWidth="2.5" />
      <polygon points="2,44 50,6 98,44" fill={colour ? '#444' : '#fff'} stroke="#333" strokeWidth="2.5" strokeLinejoin="round" />
      {number !== undefined && (
        <text x="50" y="37" textAnchor="middle" fontSize="24" fontWeight="700" fill={colour ? '#fff' : '#333'}>
          {number}
        </text>
      )}
      {open && <rect x="26" y="54" width="48" height="42" fill="#fff" stroke="#333" strokeWidth="2" />}
      {animal && (
        <text x="50" y="69" textAnchor="middle" dominantBaseline="central" fontSize="50">
          {animal}
        </text>
      )}
      {crossed && (
        <g stroke="#d9342b" strokeWidth="8" strokeLinecap="round">
          <line x1="12" y1="12" x2="88" y2="92" />
          <line x1="88" y1="12" x2="12" y2="92" />
        </g>
      )}
    </svg>
  );
}
