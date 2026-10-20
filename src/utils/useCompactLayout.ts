import { useSyncExternalStore } from 'react';

/**
 * Touch screens and narrow windows: the sidebar becomes a drawer, puzzles are
 * added with a tap, and a tapped puzzle's controls open in a sheet along the
 * bottom of the screen instead of on hover. Keep in step with the
 * `(hover: none), (max-width: 900px)` media queries in the CSS.
 */
export const COMPACT_QUERY = '(hover: none), (max-width: 900px)';

function subscribe(onChange: () => void) {
  const query = window.matchMedia(COMPACT_QUERY);
  query.addEventListener('change', onChange);
  return () => query.removeEventListener('change', onChange);
}

export function useCompactLayout(): boolean {
  return useSyncExternalStore(subscribe, () => window.matchMedia(COMPACT_QUERY).matches);
}
