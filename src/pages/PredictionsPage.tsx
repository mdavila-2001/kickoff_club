import { useCallback, useEffect, useMemo, useState } from 'react';
import { apiClient, ApiError } from '../services/api/apiClient';
import { API_ROUTES } from '../services/api/routes';
import { toast, useToastStore } from '../store/useToastStore';
import { Button } from '../components/atoms/Button/Button';
import { Skeleton } from '../components/atoms/Skeleton/Skeleton';
import { MatchFixtureCard } from '../components/molecules/MatchFixtureCard/MatchFixtureCard';
import type { PredictionScores } from '../components/molecules/MatchFixtureCard/MatchFixtureCard';
import { PredictionSummary } from '../components/molecules/PredictionSummary/PredictionSummary';
import type { PredictionStatsDTO } from '../components/molecules/PredictionSummary/PredictionSummary';
import type { TournamentMatch, UserPrediction } from '../types';
import styles from './PredictionsPage.module.css';

const LOCK_REFRESH_INTERVAL_MS = 30_000;
const SKELETON_CARD_COUNT = 6;

const HTTP_KICKOFF_EXPIRED = 403;
const KICKOFF_EXPIRED_MESSAGE =
  'Error: El tiempo para apostar en este partido ha expirado';

const EXACT_HIT_POINTS = 3;
const OUTCOME_HIT_POINTS = 1;

const isMatchLocked = (match: TournamentMatch, now: number): boolean =>
  match.status !== 'PENDING' || Date.parse(match.dateTime) <= now;

const derivePredictionStats = (
  predictions: readonly UserPrediction[]
): PredictionStatsDTO => {
  const totalPredictions = predictions.length;

  let exactHits = 0;
  let outcomeHits = 0;

  predictions.forEach((prediction) => {
    if (prediction.pointsEarned === EXACT_HIT_POINTS) {
      exactHits += 1;
    } else if (prediction.pointsEarned === OUTCOME_HIT_POINTS) {
      outcomeHits += 1;
    }
  });

  const efficiencyPercentage =
    totalPredictions > 0 ? ((exactHits + outcomeHits) / totalPredictions) * 100 : 0;

  return { totalPredictions, exactHits, outcomeHits, efficiencyPercentage };
};

export const PredictionsPage = () => {
  const [predictedMatches, setPredictedMatches] = useState<readonly TournamentMatch[]>([]);
  const [myPredictions, setMyPredictions] = useState<Readonly<Record<string, UserPrediction>>>({});
  const [dirtyPredictions, setDirtyPredictions] = useState<Readonly<Record<string, PredictionScores>>>({});

  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [isSaving, setIsSaving] = useState<boolean>(false);

  const [resetSignal, setResetSignal] = useState<number>(0);
  const [nowTick, setNowTick] = useState<number>(() => Date.now());

  useEffect(() => {
    const timer = setInterval(() => setNowTick(Date.now()), LOCK_REFRESH_INTERVAL_MS);
    return () => clearInterval(timer);
  }, []);

  useEffect(() => {
    let active = true;

    const loadHistory = async (): Promise<void> => {
      setIsLoading(true);
      try {
        const [predictions, matches] = await Promise.all([
          apiClient<readonly UserPrediction[]>(API_ROUTES.predictions.me),
          apiClient<readonly TournamentMatch[]>(API_ROUTES.matches.base),
        ]);
        if (!active) return;

        const byMatchId: Record<string, UserPrediction> = {};
        predictions.forEach((prediction) => {
          byMatchId[prediction.matchId] = prediction;
        });

        const filtered = matches.filter((match) => byMatchId[match.id] !== undefined);

        setMyPredictions(byMatchId);
        setPredictedMatches(filtered);
      } catch (error) {
        if (!active) return;
        const message =
          error instanceof ApiError ? error.message : 'Error al cargar tus pronósticos.';
        toast.error(message);
      } finally {
        if (active) {
          setIsLoading(false);
        }
      }
    };

    void loadHistory();
    return () => {
      active = false;
    };
  }, []);

  const stats = useMemo<PredictionStatsDTO>(
    () => derivePredictionStats(Object.values(myPredictions)),
    [myPredictions]
  );

  const sortedMatches = useMemo<readonly TournamentMatch[]>(
    () =>
      [...predictedMatches].sort(
        (a, b) => Date.parse(a.dateTime) - Date.parse(b.dateTime)
      ),
    [predictedMatches]
  );

  const dirtyCount = Object.keys(dirtyPredictions).length;

  const handlePredictionChange = useCallback(
    (matchId: string, scores: PredictionScores): void => {
      setDirtyPredictions((prev) => {
        const saved = myPredictions[matchId];

        if (
          saved &&
          saved.predictedHome === scores.homeScore &&
          saved.predictedAway === scores.awayScore
        ) {
          if (prev[matchId] === undefined) return prev;
          return Object.fromEntries(
            Object.entries(prev).filter(([key]) => key !== matchId)
          );
        }

        return { ...prev, [matchId]: scores };
      });
    },
    [myPredictions]
  );

  const handlePredictionInvalidate = useCallback((matchId: string): void => {
    setDirtyPredictions((prev) => {
      if (prev[matchId] === undefined) return prev;
      return Object.fromEntries(Object.entries(prev).filter(([key]) => key !== matchId));
    });
  }, []);

  const handleDiscard = (): void => {
    setDirtyPredictions({});
    setResetSignal((prev) => prev + 1);
  };

  const handleSaveAll = async (): Promise<void> => {
    const entries = Object.entries(dirtyPredictions);
    if (entries.length === 0 || isSaving) return;

    setIsSaving(true);
    try {
      const results = await Promise.allSettled(
        entries.map(([matchId, scores]) =>
          apiClient<UserPrediction>(API_ROUTES.predictions.base, {
            method: 'POST',
            body: JSON.stringify({
              matchId,
              predictedHome: scores.homeScore,
              predictedAway: scores.awayScore,
            }),
          })
        )
      );

      const savedPredictions: UserPrediction[] = [];
      const retriableMatchIds: string[] = [];
      const expiredMatchIds: string[] = [];

      results.forEach((result, index) => {
        const entry = entries[index];
        if (!entry) return;

        if (result.status === 'fulfilled') {
          savedPredictions.push(result.value);
          return;
        }

        const reason = result.reason;
        const isKickoffExpired =
          reason instanceof ApiError && reason.status === HTTP_KICKOFF_EXPIRED;

        if (isKickoffExpired) {
          expiredMatchIds.push(entry[0]);
        } else {
          retriableMatchIds.push(entry[0]);
        }
      });

      if (savedPredictions.length > 0) {
        setMyPredictions((prev) => {
          const next: Record<string, UserPrediction> = { ...prev };
          savedPredictions.forEach((prediction) => {
            next[prediction.matchId] = prediction;
          });
          return next;
        });
      }

      setDirtyPredictions((prev) => {
        const next: Record<string, PredictionScores> = {};
        retriableMatchIds.forEach((matchId) => {
          const pending = prev[matchId];
          if (pending) {
            next[matchId] = pending;
          }
        });
        return next;
      });

      if (expiredMatchIds.length > 0) {
        useToastStore.getState().showToast(KICKOFF_EXPIRED_MESSAGE, 'error');
      }

      const totalFailed = retriableMatchIds.length + expiredMatchIds.length;

      if (totalFailed === 0) {
        toast.success(`¡Cambios guardados! ${savedPredictions.length} pronóstico(s) actualizados.`);
      } else if (savedPredictions.length > 0 && retriableMatchIds.length > 0) {
        toast.warning(
          `Se guardaron ${savedPredictions.length} de ${entries.length} pronósticos. Reintenta los restantes.`
        );
      } else if (savedPredictions.length === 0 && retriableMatchIds.length > 0) {
        toast.error('No se pudieron guardar los cambios. Inténtalo de nuevo.');
      }
    } finally {
      setIsSaving(false);
    }
  };

  const renderSkeletons = () => (
    <div className={styles.skeletonGrid} aria-label="Cargando pronósticos">
      {Array.from({ length: SKELETON_CARD_COUNT }, (_, index) => (
        <Skeleton key={index} variant="rect" height="200px" />
      ))}
    </div>
  );

  return (
    <div className={styles.pageRoot}>
      <header className={styles.pageHeader}>
        <div>
          <h1 className={styles.pageTitle}>Mis Pronósticos</h1>
          <p className={styles.pageSubtitle}>
            Historial completo de tus predicciones y su rendimiento oficial.
          </p>
        </div>
      </header>

      <section className={styles.summaryBlock} aria-label="Resumen del rendimiento">
        <div className={styles.summaryHeader}>
          <h2 className={styles.summaryHeading}>Rendimiento</h2>

        </div>
        <PredictionSummary stats={stats} isLoading={isLoading} />
      </section>

      <section className={styles.listSection} aria-label="Listado histórico de pronósticos">
        <h2 className={styles.listHeader}>Partidos pronosticados</h2>

        {isLoading ? (
          renderSkeletons()
        ) : sortedMatches.length === 0 ? (
          <p className={styles.emptyState}>
            Todavía no registraste pronósticos. Visita el calendario para hacer tu primera predicción.
          </p>
        ) : (
          <div className={styles.matchesGrid}>
            {sortedMatches.map((match) => {
              const saved = myPredictions[match.id];
              if (!saved) return null;

              return (
                <MatchFixtureCard
                  key={match.id}
                  match={match}
                  savedPrediction={{
                    homeScore: saved.predictedHome,
                    awayScore: saved.predictedAway,
                  }}
                  pointsEarned={saved.pointsEarned}
                  isLocked={isMatchLocked(match, nowTick)}
                  resetSignal={resetSignal}
                  onPredictionChange={handlePredictionChange}
                  onPredictionInvalidate={handlePredictionInvalidate}
                />
              );
            })}
          </div>
        )}
      </section>

      <div
        id="floating-action-bar"
        className={[styles.fab, dirtyCount > 0 ? styles.fabVisible : ''].filter(Boolean).join(' ')}
        role="toolbar"
        aria-label="Acciones de pronósticos pendientes"
        aria-hidden={dirtyCount === 0}
      >
        <span className={styles.fabText}>
          <span className={styles.fabCount}>{dirtyCount}</span>{' '}
          {dirtyCount === 1 ? 'cambio sin guardar' : 'cambios sin guardar'}
        </span>
        <Button variant="text" size="sm" onClick={handleDiscard} disabled={isSaving}>
          Descartar
        </Button>
        <Button variant="gold" size="sm" onClick={handleSaveAll} isLoading={isSaving}>
          Guardar Jornada
        </Button>
      </div>
    </div>
  );
};

PredictionsPage.displayName = 'PredictionsPage';
