import React, { useId, useState } from 'react';
import { NavLink } from 'react-router-dom';
import {
  CalendarDays,
  ChevronDown,
  ClipboardList,
  Dot,
  LayoutDashboard,
  LogOut,
  MapPin,
  RefreshCw,
  Shield,
  Trophy,
  UserRound,
  Users,
} from 'lucide-react';
import { useAuthStore } from '../../../services/authStore';
import styles from './Sidebar.module.css';

export interface NavNode {
  readonly label: string;
  readonly path?: string;
  readonly icon?: string;
  readonly children?: readonly NavNode[];
}

export interface SidebarProps extends React.HTMLAttributes<HTMLElement> {
  readonly navigationTree: readonly NavNode[];
}

const NAV_ICONS: Record<string, React.ReactElement> = {
  dashboard: <LayoutDashboard size={18} className={styles.navIcon} aria-hidden="true" />,
  groups: <Users size={18} className={styles.navIcon} aria-hidden="true" />,
  calendar: <CalendarDays size={18} className={styles.navIcon} aria-hidden="true" />,
  predictions: <ClipboardList size={18} className={styles.navIcon} aria-hidden="true" />,
  ranking: <Trophy size={18} className={styles.navIcon} aria-hidden="true" />,
  profile: <UserRound size={18} className={styles.navIcon} aria-hidden="true" />,
  venues: <MapPin size={18} className={styles.navIcon} aria-hidden="true" />,
  admin: <Shield size={18} className={styles.navIcon} aria-hidden="true" />,
  sync: <RefreshCw size={18} className={styles.navIcon} aria-hidden="true" />,
};

const DEFAULT_NAV_ICON = <Dot size={18} className={styles.navIcon} aria-hidden="true" />;

const getNavIcon = (iconName?: string): React.ReactElement =>
  (iconName && NAV_ICONS[iconName]) || DEFAULT_NAV_ICON;

interface NavItemProps {
  readonly node: NavNode;
}

const NavItem = ({ node }: NavItemProps) => {
  const submenuId = useId();
  const [isOpen, setIsOpen] = useState(false);

  if (node.children && node.children.length > 0) {
    return (
      <li className={styles.navItem}>
        <button
          type="button"
          className={styles.navButton}
          onClick={() => setIsOpen((prev) => !prev)}
          aria-expanded={isOpen}
          aria-controls={submenuId}
          title={node.label}
        >
          {getNavIcon(node.icon)}
          <span className={styles.navLabel}>{node.label}</span>
          <ChevronDown
            size={14}
            className={`${styles.chevron} ${isOpen ? styles.chevronOpen : ''}`}
            aria-hidden="true"
          />
        </button>

        <ul id={submenuId} className={styles.submenu} hidden={!isOpen}>
          {node.children.map((child) => (
            <NavItem key={child.label} node={child} />
          ))}
        </ul>
      </li>
    );
  }

  return (
    <li className={styles.navItem}>
      <NavLink
        to={node.path ?? '#'}
        title={node.label}
        className={({ isActive }) =>
          [styles.navLink, isActive ? styles.navLinkActive : '']
            .filter(Boolean)
            .join(' ')
        }
      >
        {getNavIcon(node.icon)}
        <span className={styles.navLabel}>{node.label}</span>
      </NavLink>
    </li>
  );
};

export const Sidebar = ({
  navigationTree,
  className = '',
  ...props
}: SidebarProps) => {
  const logout = useAuthStore((state) => state.logout);

  const sidebarClasses = [
    styles.sidebar,
    styles.expanded,
    className,
  ]
    .filter(Boolean)
    .join(' ');

  return (
    <aside id="app-sidebar" className={sidebarClasses} {...props}>
      <div className={styles.brand}>
        <Trophy className={styles.brandMark} aria-hidden="true" />
        <span className={styles.navLabel}>KickOff Club</span>
      </div>

      <nav className={styles.navigation} aria-label="Navegación principal">
        <ul className={styles.navList}>
          {navigationTree.map((node) => (
            <NavItem key={node.label} node={node} />
          ))}
        </ul>
      </nav>

      <button
        type="button"
        className={styles.logoutButton}
        onClick={logout}
        aria-label="Cerrar sesión"
      >
        <LogOut size={18} aria-hidden="true" />
        <span>Cerrar sesión</span>
      </button>
    </aside>
  );
};

Sidebar.displayName = 'Sidebar';
