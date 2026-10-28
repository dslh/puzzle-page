import { useSyncExternalStore } from 'react';

/**
 * Touch screens and narrow windows: the sidebar becomes a drawer, puzzles are
 * added with a tap, and a tapped puzzle's controls open in a sheet along the
 * bottom of the screen instead of on hover. Keep in step with the
 * `(hover: none), (max-width: 900px)` media queries in the CSS.
 */
export const COMPACT_QUERY = '(hover: none), (max-width: 900px)';

/**
 * Wide windows with a mouse: the selected puzzle's controls sit in a panel
 * docked on the right, beside the sheet. Wide enough that the sheet keeps
 * its full size alongside the sidebar and the panel. Narrower, they open in
 * the bottom sheet as on a phone.
 */
export const DOCK_QUERY = '(hover: hover) and (min-width: 1400px)';

function useMediaQuery(query: string): boolean {
  return useSyncExternalStore(
    onChange => {
      const list = window.matchMedia(query);
      list.addEventListener('change', onChange);
      return () => list.removeEventListener('change', onChange);
    },
    () => window.matchMedia(query).matches,
  );
}

export function useCompactLayout(): boolean {
  return useMediaQuery(COMPACT_QUERY);
}

export function useDockedPanel(): boolean {
  return useMediaQuery(DOCK_QUERY);
}
