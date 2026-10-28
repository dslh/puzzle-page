// Shared timing for the editor's script-driven animations. The CSS ones use
// the matching custom properties in index.css.

/** Arrivals decelerate into place. Matches --ease-out. */
export const EASE_OUT = 'cubic-bezier(0.16, 1, 0.3, 1)';
/** Exits speed up as they go. Matches --ease-in. */
export const EASE_IN = 'cubic-bezier(0.4, 0, 1, 1)';
/** How long a removed puzzle takes to fade from the sheet. */
export const EXIT_MS = 150;

export const reducedMotion = () => window.matchMedia('(prefers-reduced-motion: reduce)').matches;
