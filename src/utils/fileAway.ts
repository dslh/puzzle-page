import { reducedMotion } from './motion';

const FLIGHT_MS = 640;

/**
 * After a child's page is printed: a copy of the sheet is lifted off the
 * desk and dropped into the Printed button, which gives a small bump as it
 * lands - so the parent sees where the page went. The sheet itself stays put.
 * With reduced motion, or the button scrolled out of sight, only the button
 * answers.
 */
export function fileAway(sheet: HTMLElement | null, target: HTMLElement | null) {
  if (!target) return;
  const bump = () => {
    target.animate(
      reducedMotion()
        ? [{ backgroundColor: 'var(--pencil)' }, {}]
        : [{ transform: 'scale(1)' }, { transform: 'scale(1.14)', offset: 0.35 }, { transform: 'scale(1)' }],
      { duration: reducedMotion() ? 600 : 360, easing: 'cubic-bezier(0.33, 1, 0.68, 1)' },
    );
  };

  const to = target.getBoundingClientRect();
  if (!sheet || reducedMotion() || to.bottom < 0 || to.top > window.innerHeight) {
    bump();
    return;
  }

  // The copy sits in a box the size the sheet is drawn at, and the box is
  // what flies
  const from = sheet.getBoundingClientRect();
  const ghost = document.createElement('div');
  ghost.setAttribute('aria-hidden', 'true');
  Object.assign(ghost.style, {
    position: 'fixed',
    left: `${from.left}px`,
    top: `${from.top}px`,
    width: `${from.width}px`,
    height: `${from.height}px`,
    overflow: 'hidden',
    pointerEvents: 'none',
    zIndex: '400',
    transformOrigin: '0 0',
    borderRadius: '2px',
  });
  const copy = sheet.cloneNode(true) as HTMLElement;
  ghost.appendChild(copy);
  document.body.appendChild(ghost);
  // Out of the desk it may not pick up the sheet's zoom; match what was drawn
  const drawn = copy.getBoundingClientRect().width;
  if (drawn) copy.style.zoom = String(Number(getComputedStyle(copy).zoom || 1) * from.width / drawn);

  // Lands about the height of the button, A4 shape kept, over its middle
  const scale = (to.height * 1.1) / from.height;
  const dx = to.left + to.width / 2 - (from.left + (from.width * scale) / 2);
  const dy = to.top + to.height / 2 - (from.top + (from.height * scale) / 2);
  const flight = ghost.animate(
    [
      { transform: 'none', boxShadow: '0 8px 24px rgba(0, 0, 0, 0.25)', opacity: 1 },
      {
        transform: `translate(${from.width * 0.02}px, ${-from.height * 0.03}px) scale(0.96)`,
        boxShadow: '0 22px 48px rgba(0, 0, 0, 0.35)',
        opacity: 1,
        offset: 0.2,
      },
      // The easing runs over the whole flight, so this is most of the way there
      { opacity: 1, offset: 0.93 },
      { transform: `translate(${dx}px, ${dy}px) scale(${scale})`, boxShadow: '0 1px 2px rgba(0, 0, 0, 0.3)', opacity: 0 },
    ],
    { duration: FLIGHT_MS, easing: 'cubic-bezier(0.55, 0, 0.2, 1)', fill: 'forwards' },
  );
  flight.finished.then(() => {
    ghost.remove();
    bump();
  }, () => ghost.remove());
}
