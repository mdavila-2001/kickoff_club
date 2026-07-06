import type { UserRole } from '../../../types';
import type { NavNode } from './Sidebar';

/*
 * Menús planos (solo entradas principales) derivados de "Proyecto Final.md":
 * - USER cubre los requisitos 4-25 (perfil, grupos, partidos,
 *   pronósticos, clasificación y dashboard).
 * - ADMIN hereda el menú de usuario y añade la gestión de
 *   partidos y sincronización (requisitos 26-32).
 * Las acciones secundarias (crear grupo, unirse con código, registrar
 * partido) viven como botones dentro de sus páginas, no en el sidebar.
 */
export const USER_NAVIGATION: readonly NavNode[] = [
  { label: 'Dashboard', path: '/dashboard', icon: 'dashboard' },
  { label: 'Mis Grupos', path: '/groups', icon: 'groups' },
  { label: 'Partidos', path: '/matches', icon: 'calendar' },
  { label: 'Mis Pronósticos', path: '/predictions', icon: 'predictions' },
  { label: 'Mi Perfil', path: '/profile', icon: 'profile' },
];

export const ADMIN_NAVIGATION: readonly NavNode[] = [
  { label: 'Panel Principal', path: '/dashboard', icon: 'admin' },
  { label: 'Partidos', path: '/admin/matches', icon: 'calendar' },
];

export const getNavigationForRole = (role?: UserRole): readonly NavNode[] =>
  role === 'ADMIN' ? ADMIN_NAVIGATION : USER_NAVIGATION;
