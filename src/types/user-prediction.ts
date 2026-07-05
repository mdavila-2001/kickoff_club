export interface UserPrediction {
  readonly id: string;
  readonly matchId: string;
  readonly predictedHomeScore: number;
  readonly predictedAwayScore: number;
  readonly pointsEarned: number | null;
  readonly scoringOutcome: 'EXACT' | 'OUTCOME' | 'MISS' | null;
  readonly isEditable: boolean;
}
