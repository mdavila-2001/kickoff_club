import { useCallback, useEffect, useMemo, useState } from 'react';
import type { ChangeEvent } from 'react';
import { apiClient, ApiError } from '../services/api/apiClient';
import { API_ROUTES } from '../services/api/routes';
import { toast } from '../store/useToastStore';
import { Button } from '../components/atoms/Button/Button';
import { Skeleton } from '../components/atoms/Skeleton/Skeleton';
import { SelectField } from '../components/atoms/SelectField/SelectField';
import type { SelectOption } from '../components/atoms/SelectField/SelectField';
import { MatchFixtureCard } from '../components/molecules/MatchFixtureCard/MatchFixtureCard';
import type { PredictionScores } from '../components/molecules/MatchFixtureCard/MatchFixtureCard';
import type { TournamentMatch, TournamentMatchStatus, UserPrediction } from '../types';
import styles from './MatchesPage.module.css';

type StatusFilter = '' | TournamentMatchStatus;

interface DaySection {
  readonly key: string;
  readonly label: string;
  readonly matches: readonly TournamentMatch[];
}

const LOCK_REFRESH_INTERVAL_MS = 30_000;
const SKELETON_CARD_COUNT = 6;

const STATUS_OPTIONS: readonly SelectOption[] = [
  { value: '', label: 'Todos los estados' },
  { value: 'PENDING', label: 'Pendiente' },
  { value: 'ONGOING', label: 'En vivo' },
  { value: 'FINISHED', label: 'Finalizado' },
];

const toLocalDateKey = (isoDateTime: string): string => {
  const date = new Date(isoDateTime);
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');
  return `${date.getFullYear()}-${month}-${day}`;
};

const formatDayLabel = (dateKey: string): string => {
  const label = new Date(`${dateKey}T00:00:00`).toLocaleDateString('es-ES', {
    weekday: 'long',
    day: 'numeric',
    month: 'long',
  });
  return label.charAt(0).toUpperCase() + label.slice(1);
};

const isMatchLocked = (match: TournamentMatch, now: number): boolean =>
  match.status !== 'PENDING' || Date.parse(match.dateTime) <= now;

export const MatchesPage = () => {
  const [matches, setMatches] = useState<readonly TournamentMatch[]>([]);
  const [myPredictions, setMyPredictions] = useState<Readonly<Record<string, UserPrediction>>>({});
  const [dirtyPredictions, setDirtyPredictions] = useState<Readonly<Record<string, PredictionScores>>>({});

  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [isSaving, setIsSaving] = useState<boolean>(false);

  const [phaseFilter, setPhaseFilter] = useState<string>('');
  const [dateFilter, setDateFilter] = useState<string>('');
  const [statusFilter, setStatusFilter] = useState<StatusFilter>('');

  const [knownPhases, setKnownPhases] = useState<readonly string[]>([]);
  const [resetSignal, setResetSignal] = useState<number>(0);
  const [nowTick, setNowTick] = useState<number>(() => Date.now());

  useEffect(() => {
    const timer = setInterval(() => setNowTick(Date.now()), LOCK_REFRESH_INTERVAL_MS);
    return () => clearInterval(timer);
  }, []);

  useEffect(() => {
    let active = true;

    const loadPredictions = async (): Promise<void> => {
      try {
        const predictions = await apiClient<readonly UserPrediction[]>(API_ROUTES.predictions.me);
        if (!active) return;

        const byMatchId: Record<string, UserPrediction> = {};
        predictions.forEach((prediction) => {
          byMatchId[prediction.matchId] = prediction;
        });
        setMyPredictions(byMatchId);
      } catch (error) {
        const message =
          error instanceof ApiError ? error.message : 'Error al cargar tus pronósticos.';
        toast.error(message);
      }
    };

    void loadPredictions();
    return () => {
      active = false;
    };
  }, []);

  useEffect(() => {
    let active = true;

    const loadMatches = async (): Promise<void> => {
      setIsLoading(true);
      try {
        const params: Record<string, string> = {};
        if (phaseFilter) params.phase = phaseFilter;
        if (dateFilter) params.date = dateFilter;
        if (statusFilter) params.status = statusFilter;

        const data = await apiClient<readonly TournamentMatch[]>(API_ROUTES.matches.base, {
          params: Object.keys(params).length > 0 ? params : undefined,
        });
        if (!active) return;

        setMatches(data);
        setKnownPhases((prev) =>
          Array.from(new Set([...prev, ...data.map((match) => match.phase)])).sort()
        );
      } catch (error) {
        if (!active) return;
        const message =
          error instanceof ApiError ? error.message : 'Error al cargar el calendario.';
        toast.error(message);
      } finally {
        if (active) {
          setIsLoading(false);
        }
      }
    };

    void loadMatches();
    return () => {
      active = false;
    };
  }, [phaseFilter, dateFilter, statusFilter]);

  const visibleMatches = useMemo(() => {
    return matches.filter((match) => {
      if (phaseFilter && match.phase !== phaseFilter) return false;
      if (dateFilter && toLocalDateKey(match.dateTime) !== dateFilter) return false;
      if (statusFilter && match.status !== statusFilter) return false;
      return true;
    });
  }, [matches, phaseFilter, dateFilter, statusFilter]);

  const daySections = useMemo((): readonly DaySection[] => {
    const sorted = [...visibleMatches].sort(
      (a, b) => Date.parse(a.dateTime) - Date.parse(b.dateTime)
    );

    const grouped = new Map<string, TournamentMatch[]>();
    sorted.forEach((match) => {
      const key = toLocalDateKey(match.dateTime);
      const bucket = grouped.get(key);
      if (bucket) {
        bucket.push(match);
      } else {
        grouped.set(key, [match]);
      }
    });

    return Array.from(grouped.entries()).map(([key, dayMatches]) => ({
      key,
      label: formatDayLabel(key),
      matches: dayMatches,
    }));
  }, [visibleMatches]);

  const predictedCount = useMemo(
    () =>
      visibleMatches.filter(
        (match) => myPredictions[match.id] !== undefined || dirtyPredictions[match.id] !== undefined
      ).length,
    [visibleMatches, myPredictions, dirtyPredictions]
  );

  const dirtyCount = Object.keys(dirtyPredictions).length;
  const hasActiveFilters = phaseFilter !== '' || dateFilter !== '' || statusFilter !== '';

  const phaseOptions = useMemo(
    (): readonly SelectOption[] => [
      { value: '', label: 'Todas las fases' },
      ...knownPhases.map((phase) => ({ value: phase, label: phase })),
    ],
    [knownPhases]
  );

  const handlePredictionChange = useCallback(
    (matchId: string, scores: PredictionScores): void => {
      setDirtyPredictions((prev) => {
        const saved = myPredictions[matchId];

        // Si el valor coincide con lo ya persistido, no hay nada que guardar.
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
      const failedMatchIds: string[] = [];

      results.forEach((result, index) => {
        const entry = entries[index];
        if (!entry) return;

        if (result.status === 'fulfilled') {
          savedPredictions.push(result.value);
        } else {
          failedMatchIds.push(entry[0]);
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

      // Solo los fallidos permanecen pendientes de guardar.
      setDirtyPredictions((prev) => {
        const next: Record<string, PredictionScores> = {};
        failedMatchIds.forEach((matchId) => {
          const pending = prev[matchId];
          if (pending) {
            next[matchId] = pending;
          }
        });
        return next;
      });

      if (failedMatchIds.length === 0) {
        toast.success(`¡Jornada guardada! ${savedPredictions.length} pronóstico(s) registrados.`);
      } else if (savedPredictions.length > 0) {
        toast.warning(
          `Se guardaron ${savedPredictions.length} de ${entries.length} pronósticos. Reintenta los restantes.`
        );
      } else {
        toast.error('No se pudo guardar la jornada. Inténtalo de nuevo.');
      }
    } finally {
      setIsSaving(false);
    }
  };

  const renderSkeletons = () => (
    <section className={styles.daySection} aria-label="Cargando partidos">
      <Skeleton variant="text" width="220px" height="1.25rem" />
      <div className={styles.matchesGrid}>
        {Array.from({ length: SKELETON_CARD_COUNT }, (_, index) => (
          <Skeleton key={index} variant="rect" height="180px" />
        ))}
      </div>
    </section>
  );

  return (
    <div className={styles.pageRoot}>
      <header className={styles.pageHeader}>
        <div>
          <h1 className={styles.pageTitle}>Calendario Mundial 2026</h1>
          <p className={styles.pageSubtitle}>
            Registra tus pronósticos antes del pitazo inicial de cada partido.
          </p>
        </div>

        <div className={styles.progressBox}>
          <span className={styles.progressLabel}>
            Progreso
            <span className={styles.progressCount}>
              {predictedCount}/{visibleMatches.length}
            </span>
          </span>
          <div
            className={styles.progressTrack}
            role="progressbar"
            aria-valuemin={0}
            aria-valuemax={visibleMatches.length}
            aria-valuenow={predictedCount}
            aria-label="Progreso de pronósticos"
          >
            <div
              className={styles.progressFill}
              style={{
                width:
                  visibleMatches.length > 0
                    ? `${(predictedCount / visibleMatches.length) * 100}%`
                    : '0%',
              }}
            />
          </div>
        </div>
      </header>

      <div className={styles.toolbar}>
        <SelectField
          label="Fase"
          options={phaseOptions}
          value={phaseFilter}
          onChange={(event: ChangeEvent<HTMLSelectElement>) => setPhaseFilter(event.target.value)}
          disabled={isLoading && knownPhases.length === 0}
        />

        <div className={styles.dateFieldContainer}>
          <label className={styles.dateFieldLabel} htmlFor="matches-date-filter">
            Fecha
          </label>
          <input
            id="matches-date-filter"
            type="date"
            className={styles.dateInput}
            value={dateFilter}
            onChange={(event: ChangeEvent<HTMLInputElement>) => setDateFilter(event.target.value)}
          />
        </div>

        <SelectField
          label="Estado"
          options={STATUS_OPTIONS}
          value={statusFilter}
          onChange={(event: ChangeEvent<HTMLSelectElement>) =>
            setStatusFilter(event.target.value as StatusFilter)
          }
        />

        <Button variant="text" onClick={() => {
          setPhaseFilter('');
          setDateFilter('');
          setStatusFilter('');
        }} disabled={!hasActiveFilters}>
          Limpiar filtros
        </Button>
      </div>

      {isLoading ? (
        renderSkeletons()
      ) : daySections.length === 0 ? (
        <p className={styles.emptyState}>
          No hay partidos que coincidan con los filtros seleccionados.
        </p>
      ) : (
        daySections.map((section) => (
          <section key={section.key} className={styles.daySection}>
            <h2 className={styles.dayHeader}>{section.label}</h2>
            <div className={styles.matchesGrid}>
              {section.matches.map((match) => {
                const saved = myPredictions[match.id];
                return (
                  <MatchFixtureCard
                    key={match.id}
                    match={match}
                    savedPrediction={
                      saved
                        ? { homeScore: saved.predictedHome, awayScore: saved.predictedAway }
                        : null
                    }
                    isLocked={isMatchLocked(match, nowTick)}
                    resetSignal={resetSignal}
                    onPredictionChange={handlePredictionChange}
                    onPredictionInvalidate={handlePredictionInvalidate}
                  />
                );
              })}
            </div>
          </section>
        ))
      )}

      {/* Barra de acción flotante para el guardado masivo */}
      <div
        className={[styles.fab, dirtyCount > 0 ? styles.fabVisible : ''].filter(Boolean).join(' ')}
        role="toolbar"
        aria-label="Acciones de pronósticos pendientes"
        aria-hidden={dirtyCount === 0}
      >
        <span className={styles.fabText}>
          <span className={styles.fabCount}>{dirtyCount}</span>{' '}
          {dirtyCount === 1 ? 'pronóstico sin guardar' : 'pronósticos sin guardar'}
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

MatchesPage.displayName = 'MatchesPage';
