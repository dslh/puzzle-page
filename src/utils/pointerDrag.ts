// How far a pointer must travel before a press becomes a drag, so a tap
// still selects
const DRAG_THRESHOLD_PX = 4;

interface PointerDragHandlers {
  /** Each move once the drag has started. */
  onMove: (e: PointerEvent) => void;
  /** The pointer was lifted (`e`) or the browser took it back (`null`). Only
      called if the drag started. */
  onEnd: (e: PointerEvent | null) => void;
}

/**
 * Follows one pointer from a pointerdown until it lifts. Works the same for
 * mouse, touch and pen. Listens on the window, so the pressed element can
 * re-render or move away under the pointer.
 *
 * While a drag is under way, `<body>` carries `data-pointer-drag`; CSS uses
 * it to stop text selection and to get the bottom sheet out of the way.
 */
export function trackPointerDrag(start: { pointerId: number; clientX: number; clientY: number }, handlers: PointerDragHandlers) {
  let started = false;

  const handleMove = (e: PointerEvent) => {
    if (e.pointerId !== start.pointerId) return;
    if (!started) {
      if (Math.hypot(e.clientX - start.clientX, e.clientY - start.clientY) < DRAG_THRESHOLD_PX) return;
      started = true;
      document.body.dataset.pointerDrag = '';
    }
    handlers.onMove(e);
  };

  const finish = (e: PointerEvent, cancelled: boolean) => {
    if (e.pointerId !== start.pointerId) return;
    window.removeEventListener('pointermove', handleMove);
    window.removeEventListener('pointerup', handleUp);
    window.removeEventListener('pointercancel', handleCancel);
    if (!started) return;
    delete document.body.dataset.pointerDrag;
    handlers.onEnd(cancelled ? null : e);
    if (!cancelled) swallowNextClick();
  };

  const handleUp = (e: PointerEvent) => finish(e, false);
  const handleCancel = (e: PointerEvent) => finish(e, true);

  window.addEventListener('pointermove', handleMove);
  window.addEventListener('pointerup', handleUp);
  window.addEventListener('pointercancel', handleCancel);
}

// Lifting the pointer after a drag still fires a click, on whatever the
// press and release had in common - often the page, which would deselect
// the puzzle just moved. The click follows pointerup in the same task, so a
// zero timeout is enough to catch it and no later one.
function swallowNextClick() {
  const swallow = (e: MouseEvent) => {
    e.stopPropagation();
    e.preventDefault();
  };
  window.addEventListener('click', swallow, { capture: true, once: true });
  setTimeout(() => window.removeEventListener('click', swallow, { capture: true }), 0);
}
