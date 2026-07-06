import React, { useMemo, useState } from 'react';
import { Header } from '../Header/Header';
import { Sidebar, type NavNode } from '../Sidebar/Sidebar';
import { LayoutContext } from './LayoutContext';
import styles from './Layout.module.css';

export interface LayoutProps extends React.HTMLAttributes<HTMLDivElement> {
  readonly children: React.ReactNode;
  readonly userActionSlot?: React.ReactNode;
  readonly headerSlot?: React.ReactNode;
  readonly navigationTree?: readonly NavNode[];
}

export const Layout = ({
  children,
  userActionSlot,
  headerSlot,
  navigationTree = [],
  className = '',
  ...props
}: LayoutProps) => {
  const [isExpanded, setIsExpanded] = useState(true);

  const contextValue = useMemo(
    () => ({
      isExpanded,
      toggleSidebar: () => setIsExpanded((prev) => !prev),
    }),
    [isExpanded]
  );

  const rootClasses = [styles.layoutRoot, className].filter(Boolean).join(' ');

  return (
    <LayoutContext.Provider value={contextValue}>
      <div id="layout-root" className={rootClasses} {...props}>
        <Sidebar navigationTree={navigationTree} />

        <Header userActionSlot={userActionSlot}>{headerSlot}</Header>

        <main id="main-content" className={styles.mainContent}>
          {children}
        </main>
      </div>
    </LayoutContext.Provider>
  );
};

Layout.displayName = 'Layout';
