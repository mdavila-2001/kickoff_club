export interface LeaderboardEntry {
  readonly userId: string;
  readonly username: string;
  readonly totalPoints: number;
  readonly position: number;
}

export interface UserGroupPosition {
  readonly currentPosition: number;
  readonly points: number;
}

export interface LeagueGroup {
  readonly id: string;
  readonly name: string;
  readonly inviteCode: string;
  readonly leaderboard: readonly LeaderboardEntry[];
  readonly userPosition: UserGroupPosition;
}
