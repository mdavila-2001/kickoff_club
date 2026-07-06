import { memo, useState } from 'react';
import type { ChangeEvent } from 'react';
import { useNavigate } from 'react-router-dom';
import { Flag } from '../../atoms/Flag/Flag';
import { Badge } from '../../atoms/Badge/Badge';
import { getFifaCode, getFlagUrl } from '../../../services/teamCodes';
import { getSpanishCountryName } from '../../../services/countryHelper';
import type { TournamentMatch } from '../../../types';
import styles from './MatchFixtureCard.module.css';

export interface PredictionScores {
  readonly homeScore: number;
  readonly awayScore: number;
}

export interface MatchFixtureCardProps {
  readonly match: TournamentMatch;
  readonly savedPrediction: PredictionScores | null;
  readonly isLocked: boolean;
  /** Al incrementarse, la tarjeta descarta su edición local y re-sincroniza. */
  readonly resetSignal: number;
  readonly onPredictionChange: (matchId: string, scores: PredictionScores) => void;
  readonly onPredictionInvalidate: (matchId: string) => void;
}

/* ── Íconos SVG inline ──────────────────────────────────── */
const LockIcon = () => (
  <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
    <rect x="3" y="11" width="18" height="11" rx="2" ry="2" />
    <path d="M7 11V7a5 5 0 0 1 10 0v4" />
  </svg>
);

const PinIcon = () => (
  <svg className={styles.venueIcon} width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
    <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z" />
    <circle cx="12" cy="10" r="3" />
  </svg>
);

const CheckIcon = () => (
  <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
    <polyline points="20 6 9 17 4 12" />
  </svg>
);

/** Máscara de entrada: solo dígitos, máximo 2 caracteres. */
const sanitizeScore = (raw: string): string => raw.replace(/\D/g, '').slice(0, 2);

const formatKickoffTime = (isoDateTime: string): string =>
  new Date(isoDateTime).toLocaleTimeString('es-ES', {
    hour: '2-digit',
    minute: '2-digit',
    hour12: false,
  });

export const MatchFixtureCard = memo(
  ({
    match,
    savedPrediction,
    isLocked,
    resetSignal,
    onPredictionChange,
    onPredictionInvalidate,
  }: MatchFixtureCardProps) => {
    const navigate = useNavigate();
    const [homeValue, setHomeValue] = useState<string>(
      savedPrediction ? String(savedPrediction.homeScore) : ''
    );
    const [awayValue, setAwayValue] = useState<string>(
      savedPrediction ? String(savedPrediction.awayScore) : ''
    );

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

    const savedKey =
      savedPrediction === null
        ? ''
        : `${savedPrediction.homeScore}:${savedPrediction.awayScore}`;
    const [syncedKey, setSyncedKey] = useState<string>(savedKey);
    const [syncedReset, setSyncedReset] = useState<number>(resetSignal);

    if (syncedKey !== savedKey || syncedReset !== resetSignal) {
      setSyncedKey(savedKey);
      setSyncedReset(resetSignal);
      setHomeValue(savedPrediction ? String(savedPrediction.homeScore) : '');
      setAwayValue(savedPrediction ? String(savedPrediction.awayScore) : '');
    }

    const emitChange = (nextHome: string, nextAway: string): void => {
      if (nextHome === '' || nextAway === '') {
        onPredictionInvalidate(match.id);
        return;
      }

      const homeScore = Number.parseInt(nextHome, 10);
      const awayScore = Number.parseInt(nextAway, 10);

      if (Number.isInteger(homeScore) && Number.isInteger(awayScore)) {
        onPredictionChange(match.id, { homeScore, awayScore });
      }
    };

    const handleHomeChange = (event: ChangeEvent<HTMLInputElement>): void => {
      const next = sanitizeScore(event.target.value);
      setHomeValue(next);
      emitChange(next, awayValue);
    };

    const handleAwayChange = (event: ChangeEvent<HTMLInputElement>): void => {
      const next = sanitizeScore(event.target.value);
      setAwayValue(next);
      emitChange(homeValue, next);
    };

    const homeCode = getFifaCode(match.homeTeam);
    const awayCode = getFifaCode(match.awayTeam);
    const homeName = getSpanishCountryName(match.homeTeam);
    const awayName = getSpanishCountryName(match.awayTeam);
    const showRealScore = match.status === 'ONGOING' || match.status === 'FINISHED';

    const renderStatusIndicator = () => {
      if (match.status === 'ONGOING') {
        return <Badge variant="live">En Vivo</Badge>;
      }
      if (match.status === 'FINISHED') {
        return <Badge variant="finished">Finalizado</Badge>;
      }
      return <span className={styles.timeText}>{formatKickoffTime(match.dateTime)}</span>;
    };

    return (
      <article
        className={[styles.card, isLocked ? styles.cardLocked : ''].filter(Boolean).join(' ')}
        onClick={handleCardClick}
        style={{ cursor: 'pointer' }}
        aria-label={`Partido de ${homeName} contra ${awayName}`}
      >
        {isLocked && (
          <span className={styles.lockBadge}>
            <LockIcon />
            Bloqueado
          </span>
        )}

        <header className={styles.cardHeader}>
          <span className={styles.phaseLabel}>{match.phase}</span>
          {renderStatusIndicator()}
        </header>

        <div className={styles.matchBody}>
          <div className={styles.teamBlock}>
            <Flag
              src={match.homeTeamBadge ?? getFlagUrl(match.homeTeam)}
              code={homeCode}
              fallbackText={homeCode}
              size="md"
            />
            <span className={styles.teamName}>{homeName}</span>
          </div>

          <div className={styles.centerZone}>
            {showRealScore && (
              <div className={styles.realScore}>
                <span>{match.homeScore ?? 0}</span>
                <span className={styles.colon} aria-hidden="true">:</span>
                <span>{match.awayScore ?? 0}</span>
              </div>
            )}

            <div className={styles.scoreRow}>
              <input
                type="text"
                inputMode="numeric"
                autoComplete="off"
                placeholder="-"
                className={styles.scoreInput}
                value={homeValue}
                onChange={handleHomeChange}
                disabled={isLocked}
                aria-label={`Pronóstico de goles para ${homeName}`}
              />
              <span className={styles.colon} aria-hidden="true">:</span>
              <input
                type="text"
                inputMode="numeric"
                autoComplete="off"
                placeholder="-"
                className={styles.scoreInput}
                value={awayValue}
                onChange={handleAwayChange}
                disabled={isLocked}
                aria-label={`Pronóstico de goles para ${awayName}`}
              />
            </div>
          </div>

          <div className={styles.teamBlock}>
            <Flag
              src={match.awayTeamBadge ?? getFlagUrl(match.awayTeam)}
              code={awayCode}
              fallbackText={awayCode}
              size="md"
            />
            <span className={styles.teamName}>{awayName}</span>
          </div>
        </div>

        <footer className={styles.cardFooter}>
          <span className={styles.venue}>
            <PinIcon />
            {match.stadiumImage && (
              <img
                src={match.stadiumImage}
                alt={match.stadium}
                className={styles.stadiumThumb}
              />
            )}
            {match.stadium} · {match.city}
          </span>

          {savedPrediction && (
            <span className={styles.savedChip}>
              <CheckIcon />
              Pronóstico guardado
            </span>
          )}
        </footer>
      </article>
    );
  }
);

MatchFixtureCard.displayName = 'MatchFixtureCard';
