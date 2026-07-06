import type { UserProfile } from './user-profile';

export interface LeagueGroup {
  readonly id: string;
  readonly name: string;
  readonly inviteCode: string;
  readonly creatorId: string;
  readonly createdAt: string;
  readonly participants?: readonly GroupParticipant[];
}

export interface GroupParticipant {
  readonly id: string;
  readonly groupId: string;
  readonly userId: string;
  readonly accumulatedPoints: number;
  readonly user?: UserProfile;
  readonly predictionsMade?: number;
  readonly exactHits?: number;
}
