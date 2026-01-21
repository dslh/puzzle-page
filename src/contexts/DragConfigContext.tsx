/* eslint-disable react-refresh/only-export-components */
import { createContext, useContext, useState, type ReactNode } from 'react';
import type { PuzzleType } from '../types/puzzle';

interface DragConfig {
  puzzleType: PuzzleType;
  config: unknown;
}

interface DragConfigContextValue {
  dragConfig: DragConfig | null;
  setDragConfig: (config: DragConfig | null) => void;
}

const DragConfigContext = createContext<DragConfigContextValue | null>(null);

export function DragConfigProvider({ children }: { children: ReactNode }) {
  const [dragConfig, setDragConfig] = useState<DragConfig | null>(null);

  return (
    <DragConfigContext.Provider value={{ dragConfig, setDragConfig }}>
      {children}
    </DragConfigContext.Provider>
  );
}

export function useDragConfig() {
  const context = useContext(DragConfigContext);
  if (!context) {
    throw new Error('useDragConfig must be used within a DragConfigProvider');
  }
  return context;
}
