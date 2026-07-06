import React, { useRef, useEffect } from 'react';
import { Skeleton } from '../../atoms/Skeleton/Skeleton';
import { Flag } from '../../atoms/Flag/Flag';
import styles from './MatchRow.module.css';

export interface MatchDTO {
  id: string;
  homeTeam: {
    id: string;
    name: string;
    flagUrl: string;
  };
  awayTeam: {
    id: string;
    name: string;
    flagUrl: string;
  };
  status: 'scheduled' | 'live' | 'finished';
  startTime: string;
}

export interface MatchRowProps extends React.HTMLAttributes<HTMLDivElement> {
  matchData: MatchDTO;
  initialHomeScore?: number | "";
  initialAwayScore?: number | "";
  isLocked?: boolean;
  isLoading?: boolean;
  onPredictionChange?: (matchId: string, homeScore: number, awayScore: number) => void;
}

export const MatchRow: React.FC<MatchRowProps> = ({
  matchData,
  initialHomeScore = "",
  initialAwayScore = "",
  isLocked = false,
  isLoading = false,
  onPredictionChange,
  className = '',
  ...props
}) => {
  const homeRef = useRef<HTMLInputElement>(null);
  const awayRef = useRef<HTMLInputElement>(null);

  // Sincroniza los valores iniciales provenientes del padre (uncontrolled sync)
  useEffect(() => {
    if (homeRef.current) {
      homeRef.current.value = initialHomeScore !== undefined && initialHomeScore !== null ? String(initialHomeScore) : '';
    }
  }, [initialHomeScore]);

  useEffect(() => {
    if (awayRef.current) {
      awayRef.current.value = initialAwayScore !== undefined && initialAwayScore !== null ? String(initialAwayScore) : '';
    }
  }, [initialAwayScore]);

  // Manejo del desenfoque (onBlur) para notificar cambios validados
  const handleBlur = () => {
    if (!onPredictionChange) return;

    const homeVal = homeRef.current?.value;
    const awayVal = awayRef.current?.value;

    // Solo dispara el evento si ambos campos contienen valores numéricos
    if (homeVal === undefined || awayVal === undefined || homeVal === '' || awayVal === '') {
      return;
    }

    const homeScore = Number(homeVal);
    const awayScore = Number(awayVal);

    // Valida enteros no negativos
    if (
      Number.isInteger(homeScore) &&
      Number.isInteger(awayScore) &&
      homeScore >= 0 &&
      awayScore >= 0
    ) {
      onPredictionChange(matchData.id, homeScore, awayScore);
    }
  };

  // 1. Renderiza el esqueleto estructural para mitigar CLS
  if (isLoading) {
    return (
      <div className={`${styles.rowContainer} ${className}`} {...props}>
        <Skeleton variant="rect" height="74px" width="100%" />
      </div>
    );
  }

  // Formatea la hora de inicio de forma limpia
  const formattedTime = (() => {
    try {
      const date = new Date(matchData.startTime);
      return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', hour12: false });
    } catch {
      return matchData.startTime;
    }
  })();

  // Determina el separador central (VS o Live dot)
  const isLive = matchData.status === 'live';

  return (
    <section
      className={`${styles.rowContainer} ${className}`}
      aria-label={`Partido de ${matchData.homeTeam.name} contra ${matchData.awayTeam.name}`}
      {...props}
    >
      <div className={`${styles.teamContainer} ${styles.homeTeam}`}>
        <span className={styles.teamName}>{matchData.homeTeam.name}</span>
        <Flag
          src={matchData.homeTeam.flagUrl}
          code={matchData.homeTeam.name}
          fallbackText={matchData.homeTeam.name.substring(0, 3).toUpperCase()}
          size="md"
          className={styles.homeFlag}
        />
      </div>

      {/* Marcador Local */}
      <div className={styles.scoreColHome}>
        {isLocked ? (
          <span
            className={styles.scoreValue}
            aria-label={`Marcador bloqueado de ${matchData.homeTeam.name}: ${initialHomeScore === "" ? '-' : initialHomeScore}`}
          >
            {initialHomeScore === "" ? '-' : initialHomeScore}
          </span>
        ) : (
          <input
            ref={homeRef}
            type="number"
            min="0"
            step="1"
            className={styles.scoreInput}
            onBlur={handleBlur}
            aria-label={`Predicción de goles para ${matchData.homeTeam.name}`}
          />
        )}
      </div>

      {/* Separador Central */}
      <div className={styles.separatorCol}>
        {isLive ? (
          <span
            style={{
              display: 'inline-block',
              width: '8px',
              height: '8px',
              backgroundColor: 'var(--live-dot)',
              borderRadius: '50%',
              boxShadow: '0 0 8px var(--live-dot)',
              marginBottom: '4px'
            }}
            aria-label="En Vivo"
          />
        ) : (
          <span className={styles.vsText} aria-hidden="true">VS</span>
        )}
        <span className={styles.timeText}>{formattedTime}</span>
      </div>

      {/* Marcador Visitante */}
      <div className={styles.scoreColAway}>
        {isLocked ? (
          <span
            className={styles.scoreValue}
            aria-label={`Marcador bloqueado de ${matchData.awayTeam.name}: ${initialAwayScore === "" ? '-' : initialAwayScore}`}
          >
            {initialAwayScore === "" ? '-' : initialAwayScore}
          </span>
        ) : (
          <input
            ref={awayRef}
            type="number"
            min="0"
            step="1"
            className={styles.scoreInput}
            onBlur={handleBlur}
            aria-label={`Predicción de goles para ${matchData.awayTeam.name}`}
          />
        )}
      </div>

      {/* Equipo Visitante */}
      <div className={`${styles.teamContainer} ${styles.awayTeam}`}>
        <Flag
          src={matchData.awayTeam.flagUrl}
          code={matchData.awayTeam.name}
          fallbackText={matchData.awayTeam.name.substring(0, 3).toUpperCase()}
          size="md"
          className={styles.awayFlag}
        />
        <span className={styles.teamName}>{matchData.awayTeam.name}</span>
      </div>
    </section>
  );
};

MatchRow.displayName = 'MatchRow';
