import React, { useState, useRef } from 'react';
import { Trophy, LogOut, ChevronDown, User, Shield } from 'lucide-react';
import styles from './NavbarSuite.module.css';

export interface UserSessionDTO {
  id: string;
  username: string;
  role: 'ADMIN' | 'USER';
}

export interface TenantSummaryDTO {
  id: string;
  name: string;
}

export interface NavbarSuiteProps extends React.HTMLAttributes<HTMLElement> {
  user: UserSessionDTO | null;
  activeTenant: TenantSummaryDTO | null;
  currentRoute: string;
  onLogout: () => Promise<void>;
  onNavigate: (route: string) => void;
}

const USER_LINKS = [
  { label: 'Dashboard', path: '/dashboard' },
  { label: 'Mis Grupos', path: '/groups' },
  { label: 'Partidos', path: '/matches' },
  { label: 'Sedes', path: '/venues' },
  { label: 'Mis Pronósticos', path: '/predictions' },
  { label: 'Clasificación', path: '/rankings' },
  { label: 'Mi Perfil', path: '/profile' },
];

const ADMIN_LINKS = [
  { label: 'Gestión de Partidos', path: '/admin/matches' },
  { label: 'Sincronización', path: '/admin/sync' },
];

export const NavbarSuite = ({
  user,
  activeTenant,
  currentRoute,
  onLogout,
  onNavigate,
  className = '',
  ...props
}: NavbarSuiteProps) => {
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Escape') {
      setIsDropdownOpen(false);
      const button = dropdownRef.current?.querySelector('button');
      if (button instanceof HTMLElement) {
        button.focus();
      }
    }
  };

  const handleBlur = (e: React.FocusEvent) => {
    if (dropdownRef.current && !dropdownRef.current.contains(e.relatedTarget as Node)) {
      setIsDropdownOpen(false);
    }
  };

  const handleLinkClick = (e: React.MouseEvent, path: string) => {
    e.preventDefault();
    onNavigate(path);
  };

  const handleLoginClick = (e: React.MouseEvent) => {
    e.preventDefault();
    onNavigate('/login');
  };

  const handleLogoutClick = async () => {
    setIsDropdownOpen(false);
    await onLogout();
  };

  const navbarClasses = [styles.navbar, className].filter(Boolean).join(' ');

  // Render simplified guest view
  if (!user) {
    return (
      <nav className={navbarClasses} aria-label="Navegación principal" {...props}>
        <div className={styles.brand} onClick={(e) => handleLinkClick(e, '/')} role="button" tabIndex={0}>
          <div className={styles.brandIconWrapper}>
            <Trophy className={styles.brandIcon} aria-hidden="true" />
          </div>
          <span className={styles.brandName}>KickOff Club</span>
        </div>

        <button
          type="button"
          className={styles.loginButton}
          onClick={handleLoginClick}
        >
          Iniciar Sesión
        </button>
      </nav>
    );
  }

  // Determine navigation items according to role
  const navItems = user.role === 'ADMIN' ? [...USER_LINKS, ...ADMIN_LINKS] : USER_LINKS;

  return (
    <nav className={navbarClasses} aria-label="Navegación principal" {...props}>
      <div className={styles.leftSection}>
        <div className={styles.brand} onClick={(e) => handleLinkClick(e, '/dashboard')} role="button" tabIndex={0}>
          <div className={styles.brandIconWrapper}>
            <Trophy className={styles.brandIcon} aria-hidden="true" />
          </div>
          <span className={styles.brandName}>KickOff Club</span>
        </div>

        {activeTenant && (
          <div className={styles.tenantBadge} aria-label={`Organización: ${activeTenant.name}`}>
            <span className={styles.tenantDot} />
            <span className={styles.tenantName}>{activeTenant.name}</span>
          </div>
        )}
      </div>

      <ul className={styles.navList}>
        {navItems.map((item) => {
          const isActive = currentRoute === item.path;
          return (
            <li key={item.path} className={styles.navItem}>
              <a
                href={item.path}
                className={`${styles.navLink} ${isActive ? styles.activeLink : ''}`}
                onClick={(e) => handleLinkClick(e, item.path)}
                aria-current={isActive ? 'page' : undefined}
              >
                {item.label}
              </a>
            </li>
          );
        })}
      </ul>

      <div
        ref={dropdownRef}
        className={styles.userSection}
        onKeyDown={handleKeyDown}
        onBlur={handleBlur}
      >
        <button
          type="button"
          className={`${styles.profileTrigger} ${isDropdownOpen ? styles.profileTriggerActive : ''}`}
          onClick={() => setIsDropdownOpen((prev) => !prev)}
          aria-haspopup="true"
          aria-expanded={isDropdownOpen}
          aria-label="Menú de usuario"
        >
          <div className={styles.avatar}>
            {user.role === 'ADMIN' ? (
              <Shield className={styles.userIcon} size={16} aria-hidden="true" />
            ) : (
              <User className={styles.userIcon} size={16} aria-hidden="true" />
            )}
          </div>
          <span className={styles.username}>{user.username}</span>
          <ChevronDown
            size={14}
            className={`${styles.chevron} ${isDropdownOpen ? styles.chevronRotated : ''}`}
            aria-hidden="true"
          />
        </button>

        {isDropdownOpen && (
          <div className={styles.dropdown} role="menu" aria-label="Opciones de usuario">
            <div className={styles.dropdownHeader}>
              <span className={styles.dropdownUser}>{user.username}</span>
              <span className={styles.dropdownRole}>{user.role}</span>
            </div>
            <div className={styles.dropdownDivider} />
            <button
              type="button"
              className={styles.logoutButton}
              onClick={handleLogoutClick}
              role="menuitem"
            >
              <LogOut size={16} className={styles.logoutIcon} aria-hidden="true" />
              <span>Cerrar sesión</span>
            </button>
          </div>
        )}
      </div>
    </nav>
  );
};

NavbarSuite.displayName = 'NavbarSuite';
