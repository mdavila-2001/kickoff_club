import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useAuthStore } from '../services/authStore';
import { apiClient, ApiError } from '../services/api/apiClient';
import { API_ROUTES } from '../services/api/routes';
import { toast } from '../store/useToastStore';

import { Flag } from '../components/atoms/Flag/Flag';
import { Skeleton } from '../components/atoms/Skeleton/Skeleton';
import { InputField } from '../components/atoms/InputField/InputField';
import { Button } from '../components/atoms/Button/Button';

import { getFifaCode, getFlagUrl } from '../services/teamCodes';
import { getSpanishCountryName } from '../services/countryHelper';
import styles from './MatchDetailPage.module.css';

interface PredictionUser {
  readonly id: string;
  readonly username: string;
}

interface MatchPrediction {
  readonly id: string;
  readonly userId: string;
  readonly matchId: string;
  readonly predictedHome: number;
  readonly predictedAway: number;
  readonly pointsEarned: number | null;
  readonly createdAt: string;
  readonly updatedAt: string;
  readonly user: PredictionUser;
}

interface MatchStats {
  readonly total: number;
  readonly homeWinCount: number;
  readonly awayWinCount: number;
  readonly drawCount: number;
  readonly homeWinPct: number;
  readonly awayWinPct: number;
  readonly drawPct: number;
}

interface MatchDetailPayload {
  readonly id: string;
  readonly externalApiId: string | null;
  readonly homeTeam: string;
  readonly awayTeam: string;
  readonly dateTime: string;
  readonly phase: string;
  readonly status: 'PENDING' | 'ONGOING' | 'FINISHED';
  readonly homeScore: number | null;
  readonly awayScore: number | null;
  readonly stadium: string;
  readonly city: string;
  readonly homeTeamBadge: string | null;
  readonly awayTeamBadge: string | null;
  readonly stadiumImage: string | null;
  readonly predictions: readonly MatchPrediction[];
  readonly stats: MatchStats;
}

// Helpers for deterministic stadium metrics
function getStadiumCapacity(stadiumName: string): string {
  const name = stadiumName.toLowerCase();
  if (name.includes('azteca')) return '87,523';
  if (name.includes('lusail')) return '88,966';
  if (name.includes('maracana')) return '78,838';
  if (name.includes('wembley')) return '90,000';
  if (name.includes('camp nou')) return '99,354';
  if (name.includes('bernabeu')) return '81,044';
  
  let hash = 0;
  for (let i = 0; i < stadiumName.length; i++) {
    hash = (stadiumName.codePointAt(i) || 0) + ((hash << 5) - hash);
  }
  const capacity = 40000 + (Math.abs(hash) % 50000);
  return capacity.toLocaleString('en-US');
}

function getStadiumAltitude(stadiumName: string): string {
  const name = stadiumName.toLowerCase();
  if (name.includes('azteca')) return '2,200m';
  if (name.includes('lusail')) return '15m';
  if (name.includes('bernabeu') || name.includes('metropolitano')) return '667m';
  if (name.includes('camp nou')) return '12m';
  
  let hash = 0;
  for (let i = 0; i < stadiumName.length; i++) {
    hash = (stadiumName.codePointAt(i) || 0) + ((hash << 5) - hash);
  }
  const alt = Math.abs(hash) % 1500;
  return `${alt}m`;
}

function getStadiumWeather(stadiumName: string): { readonly temp: string; readonly icon: string; readonly text: string } {
  let hash = 0;
  for (let i = 0; i < stadiumName.length; i++) {
    hash = (stadiumName.codePointAt(i) || 0) + ((hash << 5) - hash);
  }
  const temp = 12 + (Math.abs(hash) % 18); // 12 to 30
  const conditions = [
    { text: 'Despejado', icon: 'wb_sunny' },
    { text: 'P. Nublado', icon: 'partly_cloudy_night' },
    { text: 'Nublado', icon: 'cloud' },
    { text: 'Llovizna', icon: 'rainy' },
  ] as const;
  const cond = conditions[Math.abs(hash) % conditions.length];
  return {
    temp: `${temp}°C`,
    icon: cond.icon,
    text: cond.text,
  };
}

const getGlowStyle = (teamName: string): React.CSSProperties => {
  const name = teamName.toLowerCase();
  if (name.includes('mexico')) return { boxShadow: '0 0 45px rgba(0, 99, 65, 0.45)' };
  if (name.includes('canada')) return { boxShadow: '0 0 45px rgba(255, 0, 0, 0.45)' };
  if (name.includes('usa') || name.includes('united states')) return { boxShadow: '0 0 45px rgba(0, 40, 104, 0.45)' };
  if (name.includes('argentina')) return { boxShadow: '0 0 45px rgba(116, 172, 223, 0.45)' };
  if (name.includes('brazil')) return { boxShadow: '0 0 45px rgba(255, 223, 0, 0.45)' };
  if (name.includes('germany')) return { boxShadow: '0 0 45px rgba(142, 145, 146, 0.3)' };
  if (name.includes('france')) return { boxShadow: '0 0 45px rgba(0, 35, 149, 0.45)' };
  return { boxShadow: '0 0 40px rgba(255, 215, 0, 0.2)' };
};

export const MatchDetailPage = () => {
  const { id } = useParams<{ readonly id: string }>();
  const navigate = useNavigate();
  const user = useAuthStore((state) => state.user);

  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [match, setMatch] = useState<MatchDetailPayload | null>(null);

  // Predictions states
  const [homePred, setHomePred] = useState<string>('');
  const [awayPred, setAwayPred] = useState<string>('');

  const fetchMatchDetail = async (): Promise<MatchDetailPayload | null> => {
    if (!id) return null;
    try {
      return await apiClient<MatchDetailPayload>(API_ROUTES.matches.detail(id));
    } catch (err: unknown) {
      console.error(err);
      const message = err instanceof ApiError ? err.message : 'Error al cargar los detalles del partido.';
      toast.error(message);
      navigate('/matches');
      return null;
    }
  };

  const applyMatchData = (data: MatchDetailPayload) => {
    setMatch(data);
    const myPrediction = data.predictions.find((p) => p.userId === user?.id);
    if (myPrediction) {
      setHomePred(String(myPrediction.predictedHome));
      setAwayPred(String(myPrediction.predictedAway));
    } else {
      setHomePred('');
      setAwayPred('');
    }
  };

  useEffect(() => {
    let active = true;

    const load = async () => {
      const data = await fetchMatchDetail();
      if (!active) return;
      if (data) {
        applyMatchData(data);
      }
      setIsLoading(false);
    };

    void load();
    return () => { active = false; };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [id, user?.id]);

  const handleSavePrediction = async (e: React.SyntheticEvent) => {
    e.preventDefault();
    if (!id || homePred === '' || awayPred === '') return;

    try {
      setIsSaving(true);
      await apiClient(API_ROUTES.predictions.base, {
        method: 'POST',
        body: JSON.stringify({
          matchId: id,
          predictedHome: Number.parseInt(homePred, 10),
          predictedAway: Number.parseInt(awayPred, 10),
        }),
      });
      toast.success('¡Pronóstico guardado con éxito!');
      const data = await fetchMatchDetail();
      if (data) {
        applyMatchData(data);
      }
    } catch (err: unknown) {
      console.error(err);
      const message = err instanceof ApiError ? err.message : 'No se pudo guardar el pronóstico.';
      toast.error(message);
    } finally {
      setIsSaving(false);
    }
  };

  const renderStatusBadge = (status: 'PENDING' | 'ONGOING' | 'FINISHED') => {
    if (status === 'ONGOING') {
      return (
        <div className={styles.liveBadge}>
          <span className={styles.liveDot} />
          <span>En Vivo</span>
        </div>
      );
    }
    if (status === 'FINISHED') {
      return (
        <div className={styles.upcomingBadge} style={{ backgroundColor: 'rgba(53,52,52,0.6)', borderColor: 'var(--border-color)' }}>
          <span>Finalizado</span>
        </div>
      );
    }
    return (
      <div className={styles.upcomingBadge}>
        <span>Por Jugar</span>
      </div>
    );
  };

  const renderPointsBadge = (points: number | null) => {
    if (points === null) {
      return <span className={`${styles.pointsBadge} ${styles.pointsGray}`}>-</span>;
    }
    const label = points === 3 ? 'Pleno (+3 pts)' : `Acierto (+${points} pts)`;
    const badgeClass = `${styles.pointsBadge} ${points > 0 ? styles.pointsGold : styles.pointsGray}`;
    return <span className={badgeClass}>{label}</span>;
  };


  if (isLoading) {
    return (
      <div className={styles.pageRoot}>
        <div className={styles.skeletonContainer}>
          <Skeleton variant="text" width="200px" height="2rem" />
          <div className={styles.gridContainer}>
            <div className={styles.leftPanel}>
              <Skeleton variant="rect" width="100%" height="250px" />
              <Skeleton variant="rect" width="100%" height="100px" />
            </div>
            <div className={styles.rightPanel}>
              <Skeleton variant="rect" width="100%" height="450px" />
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (!match) return null;

  const homeCode = getFifaCode(match.homeTeam);
  const awayCode = getFifaCode(match.awayTeam);
  const homeName = getSpanishCountryName(match.homeTeam);
  const awayName = getSpanishCountryName(match.awayTeam);

  const showRealScore = match.status === 'ONGOING' || match.status === 'FINISHED';
  
  // Find logged-in user's prediction score
  const myPred = match.predictions.find((p) => p.userId === user?.id);

  const renderPredictionSection = () => {
    if (match.status === 'PENDING') {
      return (
        <div className={styles.predictionWrapper}>
          <form onSubmit={handleSavePrediction} className={styles.predictionBox}>
            <h3 className={styles.predictionTitle}>
              <span className="material-symbols-outlined" style={{ fontVariationSettings: "'FILL' 1" }}>sports_soccer</span>
              {' '}Registrar tu Pronóstico
            </h3>
            <div className={styles.predictionInputRow}>
              <InputField
                type="number"
                value={homePred}
                onChange={(e) => setHomePred(e.target.value.replace(/\D/g, '').slice(0, 2))}
                placeholder="-"
                disabled={isSaving}
                containerStyle={{ width: '64px', height: '64px' }}
                className={styles.scoreInput}
              />
              <span style={{ fontSize: '1.5rem', fontWeight: 700 }}>:</span>
              <InputField
                type="number"
                value={awayPred}
                onChange={(e) => setAwayPred(e.target.value.replace(/\D/g, '').slice(0, 2))}
                placeholder="-"
                disabled={isSaving}
                containerStyle={{ width: '64px', height: '64px' }}
                className={styles.scoreInput}
              />
            </div>

            <Button type="submit" variant="gold" isLoading={isSaving} disabled={homePred === '' || awayPred === ''}>
              Guardar Pronóstico
            </Button>
          </form>
        </div>
      );
    }

    if (myPred) {
      return (
        <div className={styles.predictionWrapper}>
          <div className={styles.predictionSavedBadge}>
            <span className="material-symbols-outlined">check_circle</span>
            <span>
              Tu pronóstico: <strong>{myPred.predictedHome} - {myPred.predictedAway}</strong>
            </span>
          </div>
        </div>
      );
    }

    return null;
  };

  const renderPredictionsTable = () => {
    if (match.status === 'PENDING') {
      return (
        <div className={styles.emptyPredictions}>
          <span className={`material-symbols-outlined ${styles.lockIcon}`}>lock</span>
          <p>Las predicciones de la comunidad se revelarán una vez que inicie el partido.</p>
        </div>
      );
    }

    if (match.predictions.length === 0) {
      return (
        <div className={styles.emptyPredictions}>
          <p>Nadie registró predicciones para este partido.</p>
        </div>
      );
    }

    return (
      <table className={styles.predictionsTable}>
        <thead>
          <tr>
            <th className={styles.th}>Usuario</th>
            <th className={styles.th}>Predicción</th>
            <th className={styles.th}>Puntos Obtenidos</th>
          </tr>
        </thead>
        <tbody>
          {match.predictions.map((p) => (
            <tr key={p.id} className={styles.tr}>
              <td className={`${styles.td} ${styles.tdUsername}`}>{p.user.username}</td>
              <td className={`${styles.td} ${styles.tdPrediction}`}>
                {p.predictedHome} - {p.predictedAway}
              </td>
              <td className={styles.td}>
                {renderPointsBadge(p.pointsEarned)}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    );
  };

  // Stadium metrics
  const capacity = getStadiumCapacity(match.stadium);
  const altitude = getStadiumAltitude(match.stadium);
  const weather = getStadiumWeather(match.stadium);

  // Background cover image fallback
  const stadiumCover = match.stadiumImage || 'https://images.unsplash.com/photo-1508098682722-e99c43a406b2?q=80&w=1200';

  return (
    <div className={styles.pageRoot}>
      <div className={styles.gridContainer}>
        {/* LEFT PANEL: 5 Columns Match details */}
        <section className={styles.leftPanel} aria-label="Información principal y marcadores">
          <div className={styles.broadcastHeader}>
            {renderStatusBadge(match.status)}
            <span className={styles.phaseLabel}>{match.phase} • Kickoff</span>
          </div>

          <div className={styles.matchupContainer}>
            <div className={styles.teamRow}>
              <Flag
                src={match.homeTeamBadge ?? getFlagUrl(match.homeTeam)}
                code={homeCode}
                fallbackText={homeCode}
                className={styles.flagWrapper}
                style={getGlowStyle(match.homeTeam)}
              />
              <div className={styles.teamInfo}>
                <h2 className={styles.teamCode}>{homeName}</h2>
              </div>
              {showRealScore && (
                <div className={styles.scoreText}>{match.homeScore ?? 0}</div>
              )}
            </div>

            <div className={styles.vsDividerRow}>
              <div className={styles.vsBadge}>vs</div>
            </div>

            <div className={styles.teamRow}>
              <Flag
                src={match.awayTeamBadge ?? getFlagUrl(match.awayTeam)}
                code={awayCode}
                fallbackText={awayCode}
                className={styles.flagWrapper}
                style={getGlowStyle(match.awayTeam)}
              />
              <div className={styles.teamInfo}>
                <h2 className={styles.teamCode}>{awayName}</h2>
              </div>
              {showRealScore && (
                <div className={styles.scoreText}>{match.awayScore ?? 0}</div>
              )}
            </div>
          </div>

          {renderPredictionSection()}

          {/* Points earned spotlight badge */}
          {match.status === 'FINISHED' && myPred && myPred.pointsEarned !== null && myPred.pointsEarned > 0 && (
            <div className={styles.badgePointsCard}>
              <div className={styles.badgeIconWrapper}>
                <span className="material-symbols-outlined" style={{ fontVariationSettings: "'FILL' 1" }}>military_tech</span>
              </div>
              <div className={styles.badgeTextContainer}>
                <h3 className={styles.badgeHeadline}>
                  {myPred.pointsEarned === 3 ? '¡Acierto Perfecto!' : '¡Acierto de Ganador!'}
                </h3>
                <p className={styles.badgeDescription}>
                  Has sumado <span className={styles.boldText}>+{myPred.pointsEarned} Puntos</span> en tus clasificaciones gracias a este resultado.
                </p>
              </div>
            </div>
          )}
        </section>

        {/* RIGHT PANEL: 7 Columns Stadium Background */}
        <section className={styles.rightPanel} aria-label="Detalles de la sede y estadio">
          <div className={styles.stadiumBg} style={{ backgroundImage: `url('${stadiumCover}')` }} />
          <div className={styles.stadiumOverlay} />

          <div className={styles.venueCard}>
            <div className={styles.venueTextInfo}>
              <div className={styles.venueMeta}>
                <span className="material-symbols-outlined" style={{ fontVariationSettings: "'FILL' 1", fontSize: '1.25rem' }}>location_on</span>
                <span>Estadio Anfitrión</span>
              </div>
              <h3 className={styles.venueName}>{match.stadium}</h3>
              <p className={styles.venueLocation}>{match.city} • Altitud: {altitude}</p>
            </div>

            <div className={styles.venueStats}>
              <div className={styles.venueStatCard}>
                <p className={styles.statLabel}>Capacidad</p>
                <p className={styles.statValue}>{capacity}</p>
              </div>
              <div className={styles.venueStatCard}>
                <p className={styles.statLabel}>Clima</p>
                <p className={styles.statValue} style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '4px' }}>
                  {weather.temp}
                  <span className="material-symbols-outlined" style={{ fontSize: '1.1rem' }}>{weather.icon}</span>
                </p>
              </div>
            </div>
          </div>
        </section>

        {/* BOTTOM SECTION: Community statistics and Leaderboard */}
        <div className={styles.bottomSection}>
          <div className={styles.insightCard}>
            <h3 className={styles.sectionTitle}>
              <span className="material-symbols-outlined">analytics</span>
              Tendencias de la Comunidad ({match.stats.total} pronósticos)
            </h3>

            <div className={styles.distributionContainer}>
              {/* Home Win */}
              <div className={styles.distributionItem}>
                <div className={styles.distributionLabel}>
                  <span>Gana {homeName}</span>
                  <span>{match.stats.homeWinPct}%</span>
                </div>
                <div className={styles.progressBarTrack}>
                  <div className={`${styles.progressBarFill} ${styles.fillHome}`} style={{ width: `${match.stats.homeWinPct}%` }} />
                </div>
              </div>

              {/* Draw */}
              <div className={styles.distributionItem}>
                <div className={styles.distributionLabel}>
                  <span>Empate</span>
                  <span>{match.stats.drawPct}%</span>
                </div>
                <div className={styles.progressBarTrack}>
                  <div className={`${styles.progressBarFill} ${styles.fillDraw}`} style={{ width: `${match.stats.drawPct}%` }} />
                </div>
              </div>

              {/* Away Win */}
              <div className={styles.distributionItem}>
                <div className={styles.distributionLabel}>
                  <span>Gana {awayName}</span>
                  <span>{match.stats.awayWinPct}%</span>
                </div>
                <div className={styles.progressBarTrack}>
                  <div className={`${styles.progressBarFill} ${styles.fillAway}`} style={{ width: `${match.stats.awayWinPct}%` }} />
                </div>
              </div>
            </div>
          </div>

          <div className={styles.predictionsTableWrapper}>
            <h3 className={styles.sectionTitle} style={{ padding: 'var(--space-lg) var(--space-lg) 0 var(--space-lg)', margin: 0 }}>
              <span className="material-symbols-outlined">people</span>
              {' '}Predicciones de la Comunidad
            </h3>

            {renderPredictionsTable()}
          </div>
        </div>
      </div>
    </div>
  );
};

MatchDetailPage.displayName = 'MatchDetailPage';
