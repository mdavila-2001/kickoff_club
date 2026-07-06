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
import { Modal } from '../../atoms/Modal/Modal';
import { Button } from '../../atoms/Button/Button';
import { apiClient } from '../../../services/api/apiClient';
import { API_ROUTES } from '../../../services/api/routes';
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
  const [isLogoutModalOpen, setIsLogoutModalOpen] = useState(false);
  const [isLoggingOut, setIsLoggingOut] = useState(false);

  const sidebarClasses = [
    styles.sidebar,
    styles.expanded,
    className,
  ]
    .filter(Boolean)
    .join(' ');

  const handleLogoutConfirm = async () => {
    setIsLoggingOut(true);
    try {
      // Call backend logout endpoint
      await apiClient(API_ROUTES.auth.logout, { method: 'POST' });
    } catch (error) {
      console.error('Error al notificar logout al servidor:', error);
    } finally {
      setIsLoggingOut(false);
      setIsLogoutModalOpen(false);
      // Clean local session state
      logout();
    }
  };

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
        onClick={() => setIsLogoutModalOpen(true)}
        aria-label="Cerrar sesión"
      >
        <LogOut size={18} aria-hidden="true" />
        <span>Cerrar sesión</span>
      </button>

      <Modal
        isOpen={isLogoutModalOpen}
        onClose={() => setIsLogoutModalOpen(false)}
        title="Confirmar Cerrar Sesión"
      >
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
          <p style={{ margin: 0, color: 'var(--text-muted)' }}>
            ¿Estás seguro de que deseas cerrar tu sesión en KickOff Club? Tendrás que iniciar sesión nuevamente para acceder a tus quinielas.
          </p>
          <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '0.75rem' }}>
            <Button
              variant="secondary"
              onClick={() => setIsLogoutModalOpen(false)}
              disabled={isLoggingOut}
            >
              Cancelar
            </Button>
            <Button
              variant="can"
              onClick={handleLogoutConfirm}
              isLoading={isLoggingOut}
            >
              Cerrar Sesión
            </Button>
          </div>
        </div>
      </Modal>
    </aside>
  );
};

Sidebar.displayName = 'Sidebar';
