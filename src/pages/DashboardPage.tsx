import { useState, useEffect, useCallback } from 'react';
import countries from 'i18n-iso-countries';
import esLocale from 'i18n-iso-countries/langs/es.json';
import enLocale from 'i18n-iso-countries/langs/en.json';

countries.registerLocale(esLocale);
countries.registerLocale(enLocale);
import { Link } from 'react-router-dom';
import { useAuthStore } from '../services/authStore';
import { apiClient, ApiError } from '../services/api/apiClient';
import { API_ROUTES } from '../services/api/routes';
import { UserRankRow } from '../components/molecules/UserRankRow/UserRankRow';
import { MatchCard } from '../components/molecules/MatchCard/MatchCard';
import { Skeleton } from '../components/atoms/Skeleton/Skeleton';
import { Button } from '../components/atoms/Button/Button';
import { toast } from '../store/useToastStore';
import { getCountryCode, getCountryName } from '../services/countryHelper';
import type { TournamentMatch, UserPrediction } from '../types';
import styles from './DashboardPage.module.css';
import { InputField } from '../components/atoms/InputField/InputField';

interface GroupRanking {
  readonly groupId: string;
  readonly groupName: string;
  readonly position: number;
  readonly accumulatedPoints: number;
}

interface DashboardSummary {
  readonly groupsCount: number;
  readonly pendingMatchesCount: number;
  readonly groupRankings: readonly GroupRanking[];
  readonly totalAccumulatedPoints: number;
}

const translateTeamName = (teamName: string): string => {
  if (!teamName) return '';
  const trimmed = teamName.trim();
  if (trimmed.toUpperCase() === 'USA') return 'Estados Unidos';
  // Intentar obtener el código ISO en inglés o en español
  const code = getCountryCode(trimmed, 'en') || getCountryCode(trimmed, 'es');
  if (code) {
    return getCountryName(code, 'es') || trimmed;
  }
  return trimmed;
};

export const DashboardPage = () => {
  const user = useAuthStore((state) => state.user);

  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const [summary, setSummary] = useState<DashboardSummary | null>(null);
  const [pendingMatches, setPendingMatches] = useState<readonly TournamentMatch[]>([]);
  const [predictions, setPredictions] = useState<readonly UserPrediction[]>([]);

  const [allMatches, setAllMatches] = useState<readonly TournamentMatch[]>([]);
  const [isSyncing, setIsSyncing] = useState(false);

  const loadPlayerData = useCallback(async () => {
    try {
      const [summaryRes, matchesRes, predictionsRes] = await Promise.all([
        apiClient<DashboardSummary>(API_ROUTES.dashboard.summary),
        apiClient<readonly TournamentMatch[]>(API_ROUTES.matches.base),
        apiClient<readonly UserPrediction[]>(API_ROUTES.predictions.me),
      ]);

      setSummary(summaryRes);
      setPredictions(predictionsRes);
      
      const pending = matchesRes.filter((m) => m.status === 'PENDING');
      setPendingMatches(pending);
    } catch (err: unknown) {
      const message = err instanceof ApiError ? err.message : 'Error al cargar datos del dashboard.';
      setError(message);
      toast.error(message);
    }
  }, []);

  const loadAdminData = useCallback(async () => {
    try {
      const matchesRes = await apiClient<readonly TournamentMatch[]>(API_ROUTES.matches.base);
      setAllMatches(matchesRes);
    } catch (err: unknown) {
      const message = err instanceof ApiError ? err.message : 'Error al cargar datos del monitor.';
      setError(message);
      toast.error(message);
    }
  }, []);

  useEffect(() => {
    if (!user) return;

    const init = async () => {
      setIsLoading(true);
      setError(null);
      if (user.role === 'USER') {
        await loadPlayerData();
      } else if (user.role === 'ADMIN') {
        await loadAdminData();
      }
      setIsLoading(false);
    };

    void init();
  }, [user, loadPlayerData, loadAdminData]);

  const handleSavePrediction = async (matchId: string, homeScore: number, awayScore: number): Promise<void> => {
    try {
      await apiClient<UserPrediction>(API_ROUTES.predictions.base, {
        method: 'POST',
        body: JSON.stringify({
          matchId,
          predictedHome: homeScore,
          predictedAway: awayScore,
        }),
      });

      toast.success('¡Predicción guardada exitosamente!');
      
      await loadPlayerData();
    } catch (err: unknown) {
      const message = err instanceof ApiError ? err.message : 'No se pudo guardar la predicción.';
      toast.error(message);
      throw err;
    }
  };

  // Forzar Sincronización API (Admin)
  const handleForceSync = async () => {
    if (isSyncing) return;
    setIsSyncing(true);
    try {
      const res = await apiClient<{ success: boolean; message: string; synchronized: number }>(
        API_ROUTES.matches.syncSeason,
        {
          method: 'POST',
          body: JSON.stringify({
            leagueId: '4429',
            season: '2026',
          }),
        }
      );
      await loadAdminData();
      toast.success(`${res.message}. Partidos sincronizados: ${res.synchronized}`);
    } catch (err: unknown) {
      const message = err instanceof ApiError ? err.message : 'Fallo en la sincronización.';
      toast.error(message);
    } finally {
      setIsSyncing(false);
    }
  };

  // ── RENDER SKELETONS ──
  if (isLoading) {
    return (
      <div className={styles.dashboardRoot}>
        <Skeleton variant="rect" width="100%" height="120px" />
        <div className={styles.metricsGrid}>
          <Skeleton variant="rect" width="100%" height="100px" />
          <Skeleton variant="rect" width="100%" height="100px" />
          <Skeleton variant="rect" width="100%" height="100px" />
        </div>
        <div className={styles.mainLayout}>
          <Skeleton variant="rect" width="100%" height="300px" />
          <Skeleton variant="rect" width="100%" height="300px" />
        </div>
      </div>
    );
  }

  if (error && !summary && allMatches.length === 0) {
    return (
      <div className={styles.dashboardRoot}>
        <p className={styles.errorText}>{error}</p>
        <Button onClick={() => globalThis.location.reload()}>Reintentar</Button>
      </div>
    );
  }

  if (user?.role === 'USER') {
    const formattedDate = new Date().toLocaleDateString('es-ES', {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    });

    return (
      <div className={styles.dashboardRoot}>
        <header className={styles.welcomeBanner}>
          <div className={styles.bannerPattern} />
          <div className={styles.bannerContent}>
            <div className={styles.syncIndicator}>
              <span className={styles.syncDot} />
              <span>Sincronización en vivo</span>
            </div>
            <h1 className={styles.welcomeTitle}>
              ¡Hola, <span className={styles.welcomeName}>{user.name}</span>!
            </h1>
            <p className={styles.welcomeDate}>{formattedDate}</p>
          </div>
        </header>

        {/* Métrica Row */}
        <section className={styles.metricsGrid} aria-label="Métricas del jugador">
          <div className={`${styles.metricCard} ${styles.borderGold}`}>
            <span className={styles.metricLabel}>Puntos Totales</span>
            <div className={styles.metricValueRow}>
              <span className={styles.metricValue}>
                {summary?.totalAccumulatedPoints.toLocaleString() ?? '0'}
              </span>
              <span className={`${styles.metricTrend} ${styles.trendUp}`}>
                <span>~+120</span>
              </span>
            </div>
            <span className={styles.metricSubtext}>Acumulados en ligas</span>
          </div>

          <div className={`${styles.metricCard} ${styles.borderBlue}`}>
            <span className={styles.metricLabel}>Ligas Activas</span>
            <div className={styles.metricValueRow}>
              <span className={styles.metricValue}>{summary?.groupsCount ?? '0'}</span>
            </div>
            <span className={styles.metricSubtext}>Grupos unidos</span>
          </div>

          <div className={`${styles.metricCard} ${styles.borderGreen}`}>
            <span className={styles.metricLabel}>Clasificación Global</span>
            <div className={styles.metricValueRow}>
              <span className={styles.metricValue}>
                {summary && summary.groupRankings.length > 0
                  ? `#${summary.groupRankings[0].position}`
                  : '—'}
              </span>
            </div>
            <span className={styles.metricSubtext}>Mejor posición en liga</span>
          </div>
        </section>

        <div className={styles.mainLayout}>
          <main className={styles.leftColumn}>
            <div className={styles.sectionHeader}>
              <h2 className={styles.sectionTitle}>Partidos Pendientes</h2>
              <Link to="/matches" className={styles.viewAllLink}>
                Ver Todos
              </Link>
            </div>

            <div className={styles.matchesList}>
              {pendingMatches.length === 0 ? (
                <div className={styles.emptyMatches}>
                  <p>No tienes partidos pendientes por pronosticar.</p>
                </div>
              ) : (
                pendingMatches.slice(0, 4).map((match) => {
                  const pred = predictions.find((p) => p.matchId === match.id);
                  const initialPrediction = pred
                    ? { homeScore: pred.predictedHome, awayScore: pred.predictedAway }
                    : null;
                  let cardStatus: 'UPCOMING' | 'LIVE' | 'FINISHED' = 'UPCOMING';
                  if (match.status === 'ONGOING') {
                    cardStatus = 'LIVE';
                  } else if (match.status === 'FINISHED') {
                    cardStatus = 'FINISHED';
                  }
                  const matchDTO = {
                    id: match.id,
                    homeTeam: {
                      id: 'home-' + match.id,
                      name: translateTeamName(match.homeTeam),
                      logoUrl: match.homeTeamBadge || '',
                    },
                    awayTeam: {
                      id: 'away-' + match.id,
                      name: translateTeamName(match.awayTeam),
                      logoUrl: match.awayTeamBadge || '',
                    },
                    status: cardStatus,
                    startTime: match.dateTime,
                    homeScore: match.homeScore ?? undefined,
                    awayScore: match.awayScore ?? undefined,
                  };

                  return (
                    <MatchCard
                      key={match.id}
                      match={matchDTO}
                      initialPrediction={initialPrediction}
                      onSavePrediction={handleSavePrediction}
                    />
                  );
                })
              )}
            </div>
          </main>

          <aside className={styles.rightColumn}>
            <h2 className={styles.sectionTitle}>Tus Ligas</h2>
            
            <div className={styles.leaguesCard}>
              {summary && summary.groupRankings.length > 0 ? (
                <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-sm)' }}>
                  {summary.groupRankings.map((ranking, index) => {
                    let deltaVal = 0;
                    if (index % 3 === 0) {
                      deltaVal = 1;
                    } else if (index % 3 === 1) {
                      deltaVal = -1;
                    }
                    const userSnapshot = {
                      id: ranking.groupId,
                      username: ranking.groupName,
                      totalPoints: ranking.accumulatedPoints,
                      exactPredictionsCount: 3,
                      efficiencyRate: 75,
                    };
                    return (
                      <UserRankRow
                        key={ranking.groupId}
                        rank={ranking.position}
                        userSnapshot={userSnapshot}
                        rankDelta={deltaVal}
                        isCurrentUser={true}
                      />
                    );
                  })}
                </div>
              ) : (
                <div className={styles.emptyLeagues}>
                  <p>Aún no formas parte de ninguna liga privada.</p>
                  <Link to="/groups" style={{ textDecoration: 'none' }}>
                    <Button variant="gold" size="sm">
                      Unirse o Crear Liga
                    </Button>
                  </Link>
                </div>
              )}
            </div>
          </aside>
        </div>
      </div>
    );
  }

  if (user?.role === 'ADMIN') {
    const liveMatchesCount = allMatches.filter((m) => m.status === 'ONGOING').length;

    return (
      <div className={styles.dashboardRoot}>
        <div className={styles.adminTitleRow}>
          <h1 className={styles.adminHeaderTitle}>Panel Principal</h1>
          <Button
            variant="usa"
            size="sm"
            onClick={handleForceSync}
            isLoading={isSyncing}
          >
            Forzar Sincronización API
          </Button>
        </div>

        <section className={styles.metricsGrid} aria-label="Métricas de administración">
          <div className={`${styles.metricCard} ${styles.borderBlue}`}>
            <span className={styles.metricLabel}>Partidos en el Sistema</span>
            <div className={styles.metricValueRow}>
              <span className={styles.metricValue}>{allMatches.length}</span>
            </div>
            <span className={styles.metricSubtext}>Registrados en base de datos</span>
          </div>

          <div className={`${styles.metricCard} ${styles.borderGreen}`}>
            <span className={styles.metricLabel}>Partidos en Vivo</span>
            <div className={styles.metricValueRow}>
              <span className={styles.metricValue}>{liveMatchesCount}</span>
            </div>
            <span className={styles.metricSubtext}>Actualmente jugándose</span>
          </div>

          <div className={`${styles.metricCard} ${styles.borderGold}`}>
            <span className={styles.metricLabel}>Estado de Sincronizador</span>
            <div className={styles.metricValueRow}>
              <span className={styles.metricValue} style={{ fontSize: 'var(--font-size-xl)' }}>
                Cron Activo
              </span>
            </div>
            <span className={styles.metricSubtext}>Intervalo de 20 min</span>
          </div>
        </section>

        <div className={styles.mainLayout}>
          <main className={styles.rightColumn} style={{ width: '100%', maxWidth: '100%' }}>
            <div className={styles.sectionHeader}>
              <h2 className={styles.sectionTitle}>Partidos</h2>
            </div>

            <div className={styles.monitorCard}>
              {allMatches.length === 0 ? (
                <p style={{ color: 'var(--text-muted)', textAlign: 'center' }}>
                  No hay partidos cargados en el monitor. Sincroniza o agrega uno nuevo.
                </p>
              ) : (
                [...allMatches].sort((a, b) => new Date(b.dateTime).getTime() - new Date(a.dateTime).getTime()).slice(0, 5).map((match) => {
                  let statusTagClass = styles.tagScheduled;
                  if (match.status === 'ONGOING') {
                    statusTagClass = styles.tagLive;
                  } else if (match.status === 'FINISHED') {
                    statusTagClass = styles.tagFt;
                  }

                  let statusLabel = '20:00';
                  if (match.status === 'ONGOING') {
                    statusLabel = 'En Vivo';
                  } else if (match.status === 'FINISHED') {
                    statusLabel = 'Fin';
                  } else if (match.dateTime) {
                    try {
                      const date = new Date(match.dateTime);
                      const today = new Date();
                      const isToday =
                        date.getDate() === today.getDate() &&
                        date.getMonth() === today.getMonth() &&
                        date.getFullYear() === today.getFullYear();

                      if (isToday) {
                        statusLabel = date.toLocaleTimeString('es-ES', {
                          hour: '2-digit',
                          minute: '2-digit',
                          hour12: false,
                        });
                      } else {
                        statusLabel = `${date.getDate()}/${date.getMonth() + 1}`;
                      }
                    } catch {
                      statusLabel = '20:00';
                    }
                  }

                  return (
                    <div key={match.id} className={styles.monitorRow}>
                      <div className={styles.monitorMatchInfo}>
                        <span className={`${styles.monitorStatusTag} ${statusTagClass}`}>
                          {statusLabel}
                        </span>
                        <div className={styles.monitorTeamsRow}>
                          {match.homeTeamBadge && (
                            <img
                              src={match.homeTeamBadge}
                              alt=""
                              className={styles.monitorBadge}
                            />
                          )}
                          <span>{translateTeamName(match.homeTeam)}</span>
                          {match.status === 'ONGOING' || match.status === 'FINISHED' ? (
                            <div className={styles.monitorScoreBox}>
                              <InputField
                                type="number"
                                className={styles.scoreInputSmall}
                                value={match.homeScore ?? 0}
                                disabled={true}
                                containerStyle={{ width: '36px', height: '28px' }}
                              />
                              <span>-</span>
                              <InputField
                                type="number"
                                className={styles.scoreInputSmall}
                                value={match.awayScore ?? 0}
                                disabled={true}
                                containerStyle={{ width: '36px', height: '28px' }}
                              />
                            </div>
                          ) : (
                            <span>vs</span>
                          )}
                          <span>{translateTeamName(match.awayTeam)}</span>
                          {match.awayTeamBadge && (
                            <img
                              src={match.awayTeamBadge}
                              alt=""
                              className={styles.monitorBadge}
                            />
                          )}
                        </div>
                      </div>
                    </div>
                  );
                })
              )}
            </div>
          </main>
        </div>
      </div>
    );
  }

  return null;
};

DashboardPage.displayName = 'DashboardPage';
