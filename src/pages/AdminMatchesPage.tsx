import React, { useEffect, useState } from 'react';
import { toast } from 'react-hot-toast';
import countries from 'i18n-iso-countries';
import esLocale from 'i18n-iso-countries/langs/es.json';
import enLocale from 'i18n-iso-countries/langs/en.json';

import { apiClient, ApiError } from '../services/api/apiClient';
import { API_ROUTES } from '../services/api/routes';
import type { TournamentMatch } from '../types/tournament-match';
import type { TournamentMatchStatus } from '../types/tournament-match-status';

import { Table } from '../components/atoms/Table/Table';
import type { ColumnConfig } from '../components/atoms/Table/Table';
import { Button } from '../components/atoms/Button/Button';
import { Modal } from '../components/atoms/Modal/Modal';
import { InputField } from '../components/atoms/InputField/InputField';
import { ScoreInput } from '../components/atoms/ScoreInput/ScoreInput';
import { Flag } from '../components/atoms/Flag/Flag';
import { getFlagUrl, getFifaCode } from '../services/teamCodes';

import styles from './AdminMatchesPage.module.css';

countries.registerLocale(esLocale);
countries.registerLocale(enLocale);

const PAGE_SIZE = 15;

export const AdminMatchesPage: React.FC = () => {
  const [matches, setMatches] = useState<TournamentMatch[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  const [currentPage, setCurrentPage] = useState(1);

  const [isFormModalOpen, setIsFormModalOpen] = useState(false);
  const [isScoreModalOpen, setIsScoreModalOpen] = useState(false);
  const [selectedMatch, setSelectedMatch] = useState<TournamentMatch | null>(null);

  const [homeTeamEs, setHomeTeamEs] = useState('');
  const [awayTeamEs, setAwayTeamEs] = useState('');
  const [matchDate, setMatchDate] = useState('');
  const [matchTime, setMatchTime] = useState('');
  const [phase, setPhase] = useState('Fase de Grupos');
  const [stadium, setStadium] = useState('');
  const [city, setCity] = useState('');
  const [formError, setFormError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Form state (Score)
  const [homeScore, setHomeScore] = useState<number>(0);
  const [awayScore, setAwayScore] = useState<number>(0);
  const [isFinishing, setIsFinishing] = useState(false);

  const fetchMatches = async () => {
    try {
      const data = await apiClient<TournamentMatch[]>(API_ROUTES.matches.base);
      const sorted = [...data].sort((a, b) => new Date(b.dateTime).getTime() - new Date(a.dateTime).getTime());
      setMatches(sorted);
    } catch (err) {
      console.error(err);
      toast.error('Error al cargar los partidos');
    }
  };

  useEffect(() => {
    let active = true;
    const load = async () => {
      try {
        const data = await apiClient<TournamentMatch[]>(API_ROUTES.matches.base);
        if (!active) return;
        const sorted = [...data].sort((a, b) => new Date(b.dateTime).getTime() - new Date(a.dateTime).getTime());
        setMatches(sorted);
      } catch (err) {
        console.error(err);
        toast.error('Error al cargar los partidos');
      } finally {
        if (active) {
          setIsLoading(false);
        }
      }
    };

    void load();
    return () => {
      active = false;
    };
  }, []);

  const openCreateModal = () => {
    setSelectedMatch(null);
    setHomeTeamEs('');
    setAwayTeamEs('');
    setMatchDate('');
    setMatchTime('');
    setPhase('Fase de Grupos');
    setStadium('');
    setCity('');
    setHomeScore(0);
    setAwayScore(0);
    setFormError(null);
    setIsFormModalOpen(true);
  };

  const openEditModal = (match: TournamentMatch) => {
    setSelectedMatch(match);
    
    // Convert to Spanish for the form
    const homeIso = countries.getAlpha2Code(match.homeTeam, 'en') || 'US';
    const awayIso = countries.getAlpha2Code(match.awayTeam, 'en') || 'US';
    
    setHomeTeamEs(countries.getName(homeIso, 'es') || match.homeTeam);
    setAwayTeamEs(countries.getName(awayIso, 'es') || match.awayTeam);
    
    // Handle Local Date from UTC
    const localDate = new Date(match.dateTime);
    setMatchDate(localDate.toLocaleDateString('en-CA')); // YYYY-MM-DD
    setMatchTime(localDate.toLocaleTimeString('en-GB', { hour: '2-digit', minute: '2-digit' })); // HH:MM

    setHomeScore(match.homeScore ?? 0);
    setAwayScore(match.awayScore ?? 0);
    setPhase(match.phase);
    setStadium(match.stadium);
    setCity(match.city);
    setFormError(null);
    setIsFormModalOpen(true);
  };

  const openScoreModal = (match: TournamentMatch) => {
    setSelectedMatch(match);
    setHomeScore(match.homeScore ?? 0);
    setAwayScore(match.awayScore ?? 0);
    setFormError(null);
    setIsFinishing(false);
    setIsScoreModalOpen(true);
  };

  const handleSaveMatch = async (e: React.FormEvent) => {
    e.preventDefault();
    setFormError(null);

    if (!homeTeamEs || !awayTeamEs || !matchDate || !matchTime || !stadium || !city || !phase) {
      setFormError('Por favor completa todos los campos.');
      return;
    }

    const homeCode = countries.getAlpha2Code(homeTeamEs, 'es');
    const awayCode = countries.getAlpha2Code(awayTeamEs, 'es');

    if (!homeCode) {
      setFormError(`No se reconoce el país local: "${homeTeamEs}"`);
      return;
    }
    if (!awayCode) {
      setFormError(`No se reconoce el país visitante: "${awayTeamEs}"`);
      return;
    }

    const homeTeamEn = countries.getName(homeCode, 'en');
    const awayTeamEn = countries.getName(awayCode, 'en');

    if (homeTeamEn === awayTeamEn) {
      setFormError('El equipo local y visitante deben ser diferentes.');
      return;
    }

    setIsSubmitting(true);
    try {
      // Local to UTC
      const localDateTime = new Date(`${matchDate}T${matchTime}`);
      const dateTimeISO = localDateTime.toISOString();

      const payload: Record<string, unknown> = {
        homeTeam: homeTeamEn,
        awayTeam: awayTeamEn,
        dateTime: dateTimeISO,
        phase,
        stadium,
        city,
      };

      if (selectedMatch) {
        if (selectedMatch.status === 'ONGOING') {
          payload.homeScore = homeScore;
          payload.awayScore = awayScore;
        }

        await apiClient(`${API_ROUTES.matches.base}/${selectedMatch.id}`, {
          method: 'PATCH',
          body: JSON.stringify(payload),
        });
        toast.success('Partido actualizado');
      } else {
        await apiClient(API_ROUTES.matches.base, {
          method: 'POST',
          body: JSON.stringify(payload),
        });
        toast.success('Partido creado');
      }

      setIsFormModalOpen(false);
      fetchMatches();
    } catch (err: unknown) {
      console.error(err);
      const message = err instanceof ApiError ? err.message : 'Error al guardar el partido.';
      setFormError(message);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleUpdateScore = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedMatch) return;

    setIsSubmitting(true);
    setFormError(null);
    
    try {
      const payload: Record<string, unknown> = {
        homeScore,
        awayScore,
      };
      
      if (isFinishing) {
        payload.status = 'FINISHED';
      }

      await apiClient(`${API_ROUTES.matches.base}/${selectedMatch.id}`, {
        method: 'PATCH',
        body: JSON.stringify(payload),
      });

      toast.success('Resultados actualizados');
      setIsScoreModalOpen(false);
      fetchMatches();
    } catch (err: unknown) {
      console.error(err);
      const message = err instanceof ApiError ? err.message : 'Error al actualizar resultado.';
      setFormError(message);
    } finally {
      setIsSubmitting(false);
    }
  };

  // Pagination logic
  const totalPages = Math.ceil(matches.length / PAGE_SIZE);
  const currentMatches = matches.slice((currentPage - 1) * PAGE_SIZE, currentPage * PAGE_SIZE);

  const formatTeamName = (englishName: string) => {
    const code = countries.getAlpha2Code(englishName, 'en');
    return code ? countries.getName(code, 'es') || englishName : englishName;
  };

  const columns: ColumnConfig<TournamentMatch>[] = [
    {
      key: 'dateTime',
      header: 'Fecha/Hora',
      render: (m) => new Date(m.dateTime).toLocaleString('es-ES', { dateStyle: 'short', timeStyle: 'short' })
    },
    {
      key: 'match',
      header: 'Partido',
      render: (m) => (
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
          <Flag 
            src={m.homeTeamBadge || getFlagUrl(m.homeTeam)} 
            code={getFifaCode(m.homeTeam) || 'USA'} 
            size="sm" 
            fallbackText={m.homeTeam.substring(0, 3).toUpperCase()} 
          />
          <span>{formatTeamName(m.homeTeam)}</span>
          <span style={{ color: 'var(--text-muted)' }}>vs</span>
          <Flag 
            src={m.awayTeamBadge || getFlagUrl(m.awayTeam)} 
            code={getFifaCode(m.awayTeam) || 'USA'} 
            size="sm" 
            fallbackText={m.awayTeam.substring(0, 3).toUpperCase()} 
          />
          <span>{formatTeamName(m.awayTeam)}</span>
        </div>
      )
    },
    {
      key: 'phase',
      header: 'Fase',
    },
    {
      key: 'status',
      header: 'Estado',
      render: (m) => {
        const statusColors: Record<TournamentMatchStatus, string> = {
          PENDING: 'var(--text-muted)',
          ONGOING: 'var(--success)',
          FINISHED: 'var(--text-primary)',
        };
        const statusText: Record<TournamentMatchStatus, string> = {
          PENDING: 'Programado',
          ONGOING: 'En Vivo',
          FINISHED: 'Finalizado',
        };
        return <span style={{ color: statusColors[m.status], fontWeight: 500 }}>{statusText[m.status]}</span>;
      }
    },
    {
      key: 'score',
      header: 'Res',
      align: 'center',
      render: (m) => m.status !== 'PENDING' ? `${m.homeScore ?? '-'} : ${m.awayScore ?? '-'}` : '- : -'
    },
    {
      key: 'actions',
      header: 'Acciones',
      align: 'right',
      render: (m) => (
        <div style={{ display: 'flex', gap: '0.5rem', justifyContent: 'flex-end' }}>
          <Button 
            variant="text" 
            size="sm" 
            onClick={() => openEditModal(m)}
            disabled={m.status === 'FINISHED'}
          >
            Editar
          </Button>
          {m.status === 'ONGOING' && (
            <Button variant="usa" size="sm" onClick={() => openScoreModal(m)}>
              Resultados
            </Button>
          )}
        </div>
      )
    }
  ];

  return (
    <div className={styles.pageContainer}>
      <header className={styles.header}>
        <div>
          <h1 className={styles.title}>Gestión de Partidos</h1>
          <p className={styles.subtitle}>Administra los encuentros, fechas y resultados oficiales.</p>
        </div>
        <Button variant="usa" onClick={openCreateModal}>+ Nuevo Partido</Button>
      </header>

      <section className={styles.tableSection}>
        {isLoading ? (
          <div style={{ textAlign: 'center', padding: '2rem', color: 'var(--text-muted)' }}>Cargando partidos...</div>
        ) : (
          <>
            <Table columns={columns} data={currentMatches} emptyMessage="No hay partidos registrados" />
            
            {totalPages > 1 && (
              <div style={{ display: 'flex', justifyContent: 'center', gap: '1rem', marginTop: '1.5rem', alignItems: 'center' }}>
                <Button 
                  variant="text" 
                  size="sm" 
                  disabled={currentPage === 1}
                  onClick={() => setCurrentPage(p => p - 1)}
                >
                  Anterior
                </Button>
                <span style={{ color: 'var(--text-muted)', fontSize: '0.875rem' }}>
                  Página {currentPage} de {totalPages}
                </span>
                <Button 
                  variant="text" 
                  size="sm" 
                  disabled={currentPage === totalPages}
                  onClick={() => setCurrentPage(p => p + 1)}
                >
                  Siguiente
                </Button>
              </div>
            )}
          </>
        )}
      </section>

      {/* CREATE / EDIT MODAL */}
      <Modal 
        isOpen={isFormModalOpen} 
        onClose={() => !isSubmitting && setIsFormModalOpen(false)}
        title={selectedMatch ? "Editar Partido" : "Nuevo Partido"}
      >
        <form onSubmit={handleSaveMatch} className={styles.modalForm}>
          <div className={styles.formGrid}>
            <InputField
              label="Equipo Local"
              value={homeTeamEs}
              onChange={(e) => setHomeTeamEs(e.target.value)}
              disabled={isSubmitting}
              placeholder="Ej: Brasil"
            />
            <InputField
              label="Equipo Visitante"
              value={awayTeamEs}
              onChange={(e) => setAwayTeamEs(e.target.value)}
              disabled={isSubmitting}
              placeholder="Ej: Francia"
            />
          </div>
          
          <div className={styles.formGrid}>
            <InputField
              label="Fecha (Local)"
              type="date"
              value={matchDate}
              onChange={(e) => setMatchDate(e.target.value)}
              disabled={isSubmitting}
            />
            <InputField
              label="Hora (Local)"
              type="time"
              value={matchTime}
              onChange={(e) => setMatchTime(e.target.value)}
              disabled={isSubmitting}
            />
          </div>

          <InputField
            label="Fase de Competición"
            value={phase}
            onChange={(e) => setPhase(e.target.value)}
            disabled={isSubmitting}
          />

          <div className={styles.formGrid}>
            <InputField
              label="Estadio"
              value={stadium}
              onChange={(e) => setStadium(e.target.value)}
              disabled={isSubmitting}
            />
            <InputField
              label="Ciudad"
              value={city}
              onChange={(e) => setCity(e.target.value)}
              disabled={isSubmitting}
            />
          </div>

          {selectedMatch?.status === 'ONGOING' && (
            <div className={styles.formGrid}>
              <InputField
                label="Goles Local"
                type="number"
                value={homeScore}
                onChange={(e) => setHomeScore(Number(e.target.value))}
                disabled={isSubmitting}
                min={0}
              />
              <InputField
                label="Goles Visitante"
                type="number"
                value={awayScore}
                onChange={(e) => setAwayScore(Number(e.target.value))}
                disabled={isSubmitting}
                min={0}
              />
            </div>
          )}

          {formError && <p className={styles.errorText}>{formError}</p>}

          <div className={styles.formActions}>
            <Button type="button" variant="text" onClick={() => setIsFormModalOpen(false)} disabled={isSubmitting}>
              Cancelar
            </Button>
            <Button type="submit" variant="usa" isLoading={isSubmitting}>
              Guardar
            </Button>
          </div>
        </form>
      </Modal>

      {/* UPDATE SCORE MODAL */}
      <Modal 
        isOpen={isScoreModalOpen} 
        onClose={() => !isSubmitting && setIsScoreModalOpen(false)}
        title="Actualizar Resultados"
      >
        {selectedMatch && (
          <form onSubmit={handleUpdateScore} className={styles.modalForm}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '2rem', margin: '1rem 0' }}>
              <div style={{ textAlign: 'center' }}>
                <Flag 
                  src={selectedMatch.homeTeamBadge || getFlagUrl(selectedMatch.homeTeam)} 
                  code={getFifaCode(selectedMatch.homeTeam) || 'USA'} 
                  size="md" 
                  fallbackText={selectedMatch.homeTeam.substring(0, 3).toUpperCase()} 
                />
                <div style={{ marginTop: '0.5rem', fontWeight: 500 }}>{formatTeamName(selectedMatch.homeTeam)}</div>
                <ScoreInput 
                  value={homeScore} 
                  onChange={setHomeScore} 
                  disabled={isSubmitting} 
                  min={0}
                  ariaLabel="Goles local"
                />
              </div>
              
              <span style={{ fontSize: '1.5rem', color: 'var(--text-muted)' }}>-</span>
              
              <div style={{ textAlign: 'center' }}>
                <Flag 
                  src={selectedMatch.awayTeamBadge || getFlagUrl(selectedMatch.awayTeam)} 
                  code={getFifaCode(selectedMatch.awayTeam) || 'USA'} 
                  size="md" 
                  fallbackText={selectedMatch.awayTeam.substring(0, 3).toUpperCase()} 
                />
                <div style={{ marginTop: '0.5rem', fontWeight: 500 }}>{formatTeamName(selectedMatch.awayTeam)}</div>
                <ScoreInput 
                  value={awayScore} 
                  onChange={setAwayScore} 
                  disabled={isSubmitting} 
                  min={0}
                  ariaLabel="Goles visitante"
                />
              </div>
            </div>

            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginTop: '1rem' }}>
              <input 
                type="checkbox" 
                id="finishMatch" 
                checked={isFinishing} 
                onChange={(e) => setIsFinishing(e.target.checked)}
                disabled={isSubmitting}
              />
              <label htmlFor="finishMatch">Finalizar partido (Marcar como FINISHED)</label>
            </div>

            {formError && <p className={styles.errorText}>{formError}</p>}

            <div className={styles.formActions}>
              <Button type="button" variant="text" onClick={() => setIsScoreModalOpen(false)} disabled={isSubmitting}>
                Cancelar
              </Button>
              <Button type="submit" variant="usa" isLoading={isSubmitting}>
                Actualizar
              </Button>
            </div>
          </form>
        )}
      </Modal>

    </div>
  );
};
