import React, { createContext, useContext, ReactNode } from 'react';

type CopilotContextType = {
  openCopilot: () => void;
  closeCopilot: () => void;
  minimizeCopilot: () => void;
  restoreCopilot: () => void;
  isOpen: boolean;
  isMinimized: boolean;
};

const CopilotContext = createContext<CopilotContextType | undefined>(undefined);

export function useCopilot() {
  const ctx = useContext(CopilotContext);
  if (!ctx) throw new Error('useCopilot must be used within a CopilotProvider');
  return ctx;
}

export function CopilotProvider({
  children,
  openCopilot,
  closeCopilot,
  minimizeCopilot,
  restoreCopilot,
  isOpen,
  isMinimized,
}: {
  children: ReactNode;
  openCopilot: () => void;
  closeCopilot: () => void;
  minimizeCopilot: () => void;
  restoreCopilot: () => void;
  isOpen: boolean;
  isMinimized: boolean;
}) {
  return (
    <CopilotContext.Provider value={{ openCopilot, closeCopilot, minimizeCopilot, restoreCopilot, isOpen, isMinimized }}>
      {children}
    </CopilotContext.Provider>
  );
}
