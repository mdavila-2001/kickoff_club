import type { TournamentMatch } from './tournament-match';

export interface UserPrediction {
  readonly id: string;
  readonly userId: string;
  readonly matchId: string;
  readonly predictedHome: number;
  readonly predictedAway: number;
  readonly pointsEarned: number | null;
  readonly createdAt: string;
  readonly updatedAt: string;
  readonly match?: TournamentMatch;
}
