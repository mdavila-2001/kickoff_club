/**
 * Contratos de Interfaz y Tipado Estricto de TypeScript
 * para la Quiniela Mundial 2026.
 * Todos los campos son inmutables (readonly) para evitar efectos secundarios.
 */

/**
 * Perfil de usuario y sesión actual.
 */
export interface UserPerfil {
  readonly id: string;
  readonly name: string;
  readonly email: string;
  readonly role: 'USER' | 'ADMIN';
  readonly createdAt: string; // ISO 8601 Date
  readonly accumulatedPoints: number;
}

/**
 * Detalle geográfico y estructural de un estadio.
 */
export interface StadiumDetails {
  readonly name: string;
  readonly city: string;
  readonly capacity: number;
  readonly coordinates: {
    readonly latitude: number;
    readonly longitude: number;
  };
}

export type MatchStatus = 'PENDING' | 'LIVE' | 'FINISHED';

export type TournamentStage = 'GROUPS' | 'ROUND_OF_16' | 'QUARTERS' | 'SEMIFINALS' | 'FINAL';

/**
 * Datos oficiales de un partido en el torneo.
 */
export interface TournamentMatch {
  readonly id: string;
  readonly homeTeam: {
    readonly name: string;
    readonly flagUrl: string;
    readonly code: string; // ISO 3166-1 alpha-3
  };
  readonly awayTeam: {
    readonly name: string;
    readonly flagUrl: string;
    readonly code: string;
  };
  readonly stadium: StadiumDetails;
  readonly groupName: string; // e.g., 'A', 'B'
  readonly kickoffTime: string; // ISO 8601 Date string
  readonly status: MatchStatus;
  readonly homeScore?: number; // Solo definido si status !== 'PENDING'
  readonly awayScore?: number;
  readonly stage: TournamentStage;
}

export type PredictionLockState = 'EDITABLE' | 'LOCKED';

/**
 * Pronóstico guardado por un usuario.
 */
export interface UserPrediction {
  readonly id: string;
  readonly matchId: string;
  readonly userId: string;
  readonly predictedHomeScore: number;
  readonly predictedAwayScore: number;
  readonly pointsEarned?: number; // Calculado tras finalizar el partido
  readonly lockStatus: PredictionLockState; // 'LOCKED' si kickoffTime <= tiempo actual del servidor
  readonly updatedAt: string;
}

/**
 * Clasificación de un participante dentro del grupo.
 */
export interface LeaderboardEntry {
  readonly userId: string;
  readonly userName: string;
  readonly points: number;
  readonly rank: number;
  readonly exactScoresCount: number; // Criterio de desempate
}

/**
 * Liga de quiniela privada entre usuarios.
 */
export interface LeagueGroup {
  readonly id: string;
  readonly name: string;
  readonly invitationCode: string;
  readonly creatorId: string;
  readonly createdAt: string;
  readonly membersCount: number;
  readonly leaderboard: readonly LeaderboardEntry[];
}
