import React from 'react';
import { Menu } from 'lucide-react';
import { useLayout } from '../Layout/LayoutContext';
import styles from './Header.module.css';

export interface HeaderProps extends React.HTMLAttributes<HTMLElement> {
  readonly userActionSlot?: React.ReactNode;
  readonly children?: React.ReactNode;
}

export const Header = ({
  userActionSlot,
  children,
  className = '',
  ...props
}: HeaderProps) => {
  const { isExpanded, toggleSidebar } = useLayout();

  const headerClasses = [styles.header, className].filter(Boolean).join(' ');

  return (
    <header className={headerClasses} {...props}>
      <button
        type="button"
        className={styles.menuButton}
        onClick={toggleSidebar}
        aria-expanded={isExpanded}
        aria-controls="app-sidebar"
        aria-label={
          isExpanded ? 'Contraer menú de navegación' : 'Expandir menú de navegación'
        }
      >
        <Menu size={20} aria-hidden="true" />
      </button>

      <div className={styles.slotArea}>{children}</div>

      {userActionSlot && <div className={styles.userActions}>{userActionSlot}</div>}
    </header>
  );
};

Header.displayName = 'Header';
