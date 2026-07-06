import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { z } from 'zod';
import { Skeleton } from '../../atoms/Skeleton/Skeleton';
import { CountdownTimer } from '../../atoms/CountdownTimer/CountdownTimer';
import { InputField } from '../../atoms/InputField/InputField';
import styles from './MatchCard.module.css';

export type MatchStatus = 'UPCOMING' | 'LIVE' | 'FINISHED';

export interface TeamDTO {
  id: string;
  name: string;
  logoUrl: string;
}

export interface MatchDTO {
  id: string;
  homeTeam: TeamDTO;
  awayTeam: TeamDTO;
  status: MatchStatus;
  startTime: string;
  homeScore?: number;
  awayScore?: number;
}

export interface MatchCardProps extends React.HTMLAttributes<HTMLDivElement> {
  match: MatchDTO;
  initialPrediction?: { homeScore: number; awayScore: number } | null;
  onSavePrediction?: (matchId: string, homeScore: number, awayScore: number) => Promise<void>;
  isLoading?: boolean;
}

// Zod schema: enteros no negativos menores o iguales a 99
const scoreSchema = z.number()
  .int({ message: 'Debe ser entero' })
  .nonnegative({ message: 'No puede ser negativo' })
  .max(99, { message: 'Máximo 99' });

const validateScore = (val: string): boolean => {
  if (val.trim() === '') return false;
  const num = Number(val);
  if (Number.isNaN(num)) return false;
  const result = scoreSchema.safeParse(num);
  return result.success;
};

export const MatchCard = React.memo(({
  match,
  initialPrediction = null,
  onSavePrediction,
  isLoading = false,
  className = '',
  ...props
}: MatchCardProps) => {
  const navigate = useNavigate();
  const [homePred, setHomePred] = useState<string>('');
  const [awayPred, setAwayPred] = useState<string>('');
  const [homeError, setHomeError] = useState(false);
  const [awayError, setAwayError] = useState(false);
  const [isSaving, setIsSaving] = useState(false);

  const handleCardClick = (e: React.MouseEvent) => {
    const target = e.target as HTMLElement;
    if (
      target.tagName === 'INPUT' ||
      target.tagName === 'BUTTON' ||
      target.closest('button') ||
      target.closest('input')
    ) {
      return;
    }
    navigate(`/matches/${match.id}`);
  };

  useEffect(() => {
    if (initialPrediction) {
      setHomePred(String(initialPrediction.homeScore));
      setAwayPred(String(initialPrediction.awayScore));
      setHomeError(false);
      setAwayError(false);
    } else {
      setHomePred('');
      setAwayPred('');
      setHomeError(false);
      setAwayError(false);
    }
  }, [initialPrediction]);

  const handleHomeChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = e.target.value;
    setHomePred(val);
    if (val.trim() === '') {
      setHomeError(false);
    } else {
      setHomeError(!validateScore(val));
    }
  };

  const handleAwayChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = e.target.value;
    setAwayPred(val);
    if (val.trim() === '') {
      setAwayError(false);
    } else {
      setAwayError(!validateScore(val));
    }
  };

  const handleBlur = (field: 'home' | 'away') => {
    if (field === 'home') {
      setHomeError(!validateScore(homePred));
    } else {
      setAwayError(!validateScore(awayPred));
    }
  };

  const handleSave = async () => {
    if (!onSavePrediction || homeError || awayError || homePred === '' || awayPred === '') return;
    
    setIsSaving(true);
    try {
      await onSavePrediction(match.id, Number(homePred), Number(awayPred));
    } catch (error) {
      console.error('Error guardando predicción:', error);
    } finally {
      setIsSaving(false);
    }
  };

  // Mitigación de CLS con loading estructural
  if (isLoading) {
    return (
      <div className={`${styles.cardContainer} ${className}`} {...props}>
        <div className={`${styles.skeletonTeam} ${styles.skeletonHome}`}>
          <Skeleton variant="text" width="60px" height="1rem" />
          <Skeleton variant="circle" width="44px" height="44px" />
        </div>
        <div className={styles.centerZone}>
          <Skeleton variant="rect" width="100px" height="1.5rem" />
          <Skeleton variant="rect" width="120px" height="48px" style={{ marginTop: '8px' }} />
        </div>
        <div className={`${styles.skeletonTeam} ${styles.skeletonAway}`}>
          <Skeleton variant="circle" width="44px" height="44px" />
          <Skeleton variant="text" width="60px" height="1rem" />
        </div>
      </div>
    );
  }

  // ── Strategy Pattern: Sub-renderizadores según match.status ──

  const renderUpcomingZone = () => {
    const isSubmitDisabled =
      homeError ||
      awayError ||
      homePred === '' ||
      awayPred === '' ||
      isSaving;

    return (
      <div className={styles.upcomingWrapper}>
        <CountdownTimer targetDate={match.startTime} />
        
        <div className={styles.scoreRow} style={{ marginTop: '6px' }}>
          <InputField
            type="number"
            value={homePred}
            onChange={handleHomeChange}
            onBlur={() => handleBlur('home')}
            className={`${styles.scoreInput} ${homeError ? styles.inputError : ''}`}
            placeholder="-"
            disabled={isSaving}
            aria-label={`Predicción goles local para ${match.homeTeam.name}`}
            containerStyle={{ width: '48px', height: '48px' }}
          />
          <span className={styles.colon} aria-hidden="true">:</span>
          <InputField
            type="number"
            value={awayPred}
            onChange={handleAwayChange}
            onBlur={() => handleBlur('away')}
            className={`${styles.scoreInput} ${awayError ? styles.inputError : ''}`}
            placeholder="-"
            disabled={isSaving}
            aria-label={`Predicción goles visitante para ${match.awayTeam.name}`}
            containerStyle={{ width: '48px', height: '48px' }}
          />
        </div>

        {onSavePrediction && (
          <button
            type="button"
            onClick={handleSave}
            disabled={isSubmitDisabled}
            className={styles.saveButton}
          >
            {isSaving ? 'Guardando...' : 'Guardar'}
          </button>
        )}
      </div>
    );
  };

  const renderLiveZone = () => {
    return (
      <div className={styles.upcomingWrapper}>
        <div className={styles.realScore}>
          <span>{match.homeScore ?? 0}</span>
          <span className={styles.colon} aria-hidden="true">:</span>
          <span>{match.awayScore ?? 0}</span>
        </div>
        
        <div className={`${styles.liveBadge} ${styles.livePulse}`}>
          <span className={styles.liveDot} />
          <span>En Vivo</span>
        </div>

        {/* Inputs de predicción bloqueados para reflejar estado transaccional */}
        <div className={styles.scoreRow} style={{ marginTop: '8px' }}>
          <InputField
            type="number"
            value={homePred}
            disabled
            className={styles.scoreInput}
            aria-label={`Predicción goles local bloqueada`}
            containerStyle={{ width: '48px', height: '48px' }}
          />
          <span className={styles.colon} aria-hidden="true">:</span>
          <InputField
            type="number"
            value={awayPred}
            disabled
            className={styles.scoreInput}
            aria-label={`Predicción goles visitante bloqueada`}
            containerStyle={{ width: '48px', height: '48px' }}
          />
        </div>
      </div>
    );
  };

  const renderFinishedZone = () => {
    const hasPred = initialPrediction !== null;

    return (
      <div className={styles.finishedWrapper}>
        <div className={styles.realScore}>
          <span>{match.homeScore ?? 0}</span>
          <span className={styles.colon} aria-hidden="true">:</span>
          <span>{match.awayScore ?? 0}</span>
        </div>

        <div style={{ color: 'var(--text-muted)', fontSize: '10px', textTransform: 'uppercase', letterSpacing: '0.05em', marginTop: '4px' }}>
          Finalizado
        </div>

        {hasPred && initialPrediction && (
          <div className={styles.userPredictionBadge}>
            Predicción: <span className={styles.userPredictionText}>{initialPrediction.homeScore} - {initialPrediction.awayScore}</span>
          </div>
        )}
      </div>
    );
  };

  const renderStatusZone = () => {
    switch (match.status) {
      case 'UPCOMING':
        return renderUpcomingZone();
      case 'LIVE':
        return renderLiveZone();
      case 'FINISHED':
        return renderFinishedZone();
      default:
        return null;
    }
  };

  return (
    <section
      className={`${styles.cardContainer} ${className}`}
      onClick={handleCardClick}
      style={{ cursor: 'pointer' }}
      aria-label={`Partido de ${match.homeTeam.name} contra ${match.awayTeam.name}`}
      {...props}
    >
      {/* Equipo Local */}
      <div className={`${styles.team} ${styles.homeTeam}`}>
        <span className={styles.teamName}>{match.homeTeam.name}</span>
        <div className={styles.logoWrapper}>
          <img src={match.homeTeam.logoUrl} alt={`Logo de ${match.homeTeam.name}`} className={styles.logo} />
        </div>
      </div>

      {/* Zona Central (Strategy) */}
      <div className={styles.centerZone}>
        <span className={styles.matchDate}>
          {new Date(match.startTime).toLocaleString('es-ES', {
            day: 'numeric',
            month: 'short',
            hour: '2-digit',
            minute: '2-digit',
            hour12: false,
          })}
        </span>
        {renderStatusZone()}
      </div>

      {/* Equipo Visitante */}
      <div className={`${styles.team} ${styles.awayTeam}`}>
        <div className={styles.logoWrapper}>
          <img src={match.awayTeam.logoUrl} alt={`Logo de ${match.awayTeam.name}`} className={styles.logo} />
        </div>
        <span className={styles.teamName}>{match.awayTeam.name}</span>
      </div>
    </section>
  );
}, (prevProps, nextProps) => {
  // Optimización profunda de propiedades críticas
  return (
    prevProps.isLoading === nextProps.isLoading &&
    prevProps.match.id === nextProps.match.id &&
    prevProps.match.status === nextProps.match.status &&
    prevProps.match.startTime === nextProps.match.startTime &&
    prevProps.match.homeScore === nextProps.match.homeScore &&
    prevProps.match.awayScore === nextProps.match.awayScore &&
    prevProps.initialPrediction?.homeScore === nextProps.initialPrediction?.homeScore &&
    prevProps.initialPrediction?.awayScore === nextProps.initialPrediction?.awayScore
  );
});

MatchCard.displayName = 'MatchCard';
