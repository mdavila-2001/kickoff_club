import { createContext, useContext } from 'react';

export interface LayoutContextValue {
  readonly isExpanded: boolean;
  readonly toggleSidebar: () => void;
}

export const LayoutContext = createContext<LayoutContextValue | null>(null);

export const useLayout = (): LayoutContextValue => {
  const context = useContext(LayoutContext);

  if (context === null) {
    throw new Error('useLayout debe consumirse dentro de un <Layout>');
  }

  return context;
};
