import { useState } from 'react';
import { createPortal } from 'react-dom';
import PuzzleHelp, { type HelpSubject } from './PuzzleHelp';

interface HelpButtonProps {
  subject: HelpSubject;
  className?: string;
  tabIndex?: number;
}

/**
 * The "?" that opens a puzzle's help. Draws nothing for a puzzle without docs.
 * The dialog is portalled to the body so it sits outside the draggable sidebar
 * entry and the page's drop target.
 */
export default function HelpButton({ subject, className, tabIndex }: HelpButtonProps) {
  const [open, setOpen] = useState(false);
  if (!subject.definition.docs) return null;

  return (
    <>
      <button
        type="button"
        className={className}
        tabIndex={tabIndex}
        onClick={() => setOpen(true)}
        title={`How ${subject.label} works`}
        aria-label={`How ${subject.label} works`}
      >
        ?
      </button>
      {open && createPortal(<PuzzleHelp subject={subject} onClose={() => setOpen(false)} />, document.body)}
    </>
  );
}
