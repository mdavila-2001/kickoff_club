export interface TournamentMatch {
  readonly id: string;
  readonly homeTeam: {
    readonly name: string;
    readonly flagUrl: string;
  };
  readonly awayTeam: {
    readonly name: string;
    readonly flagUrl: string;
  };
  readonly venue: {
    readonly stadium: string;
    readonly city: string;
  };
  readonly group: string;
  readonly kickoffTime: string;
  readonly status: 'PENDING' | 'LIVE' | 'FINISHED';
  readonly result?: {
    readonly homeScore?: number;
    readonly awayScore?: number;
  };
}
