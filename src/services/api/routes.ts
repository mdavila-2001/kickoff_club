export const API_ROUTES = {
  auth: {
    login: '/auth/login',
    register: '/auth/register',
  },
  groups: {
    base: '/groups',
    me: '/groups/me',
    join: (inviteCode: string) => `/groups/join/${inviteCode}`,
    participants: (id: string) => `/groups/${id}/participants`,
    leaderboard: (id: string) => `/groups/${id}/leaderboard`,
  },
  matches: {
    base: '/matches',
    detail: (id: string) => `/matches/${id}`,
    syncForce: '/matches/sync/force',
    syncSeason: '/matches/sync/season',
    syncDay: '/matches/sync/day',
  },
  predictions: {
    base: '/predictions',
    me: '/predictions/me',
  },
  users: {
    me: '/users/me',
  },
} as const;
