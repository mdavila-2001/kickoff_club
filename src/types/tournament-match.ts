import type { TournamentMatchStatus } from './tournament-match-status';

export interface TournamentMatch {
  readonly id: string;
  readonly externalApiId: string | null;
  readonly homeTeam: string;
  readonly awayTeam: string;
  readonly dateTime: string;
  readonly phase: string;
  readonly status: TournamentMatchStatus;
  readonly homeScore: number | null;
  readonly awayScore: number | null;
  readonly stadium: string;
  readonly city: string;
  readonly homeTeamBadge: string | null;
  readonly awayTeamBadge: string | null;
  readonly updatedAt: string;
}
