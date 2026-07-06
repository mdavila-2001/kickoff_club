import React, { useEffect, useState } from 'react';
import { toast } from '../store/useToastStore';
import { useAuthStore } from '../services/authStore';
import { apiClient, ApiError } from '../services/api/apiClient';
import { API_ROUTES } from '../services/api/routes';
import type { LeagueGroup, GroupParticipant } from '../types/league-group';

import { GroupSelectorCard } from '../components/molecules/GroupSelectorCard/GroupSelectorCard';
import type { GroupOptionDTO } from '../components/molecules/GroupSelectorCard/GroupSelectorCard';
import { LeaderboardTable } from '../components/organisms/LeaderboardTable/LeaderboardTable';
import type { LeaderboardRowDTO } from '../components/organisms/LeaderboardTable/LeaderboardTable';
import { Modal } from '../components/atoms/Modal/Modal';
import { Button } from '../components/atoms/Button/Button';
import { InputField } from '../components/atoms/InputField/InputField';
import { Skeleton } from '../components/atoms/Skeleton/Skeleton';

import styles from './GroupsPage.module.css';

type GroupFilter = 'all' | 'created' | 'joined';

export const GroupsPage: React.FC = () => {
  const user = useAuthStore((state) => state.user);

  // Core component states
  const [myGroups, setMyGroups] = useState<readonly LeagueGroup[]>([]);
  const [selectedGroupId, setSelectedGroupId] = useState<string | null>(null);
  const [leaderboardData, setLeaderboardData] = useState<readonly LeaderboardRowDTO[] | null>(null);
  
  // Loading states
  const [isLoadingGroups, setIsLoadingGroups] = useState<boolean>(true);
  const [isLoadingLeaderboard, setIsLoadingLeaderboard] = useState<boolean>(false);

  // Filter state
  const [filter, setFilter] = useState<GroupFilter>('all');

  // Modal & Form States (Creation)
  const [isCreateModalOpen, setIsCreateModalOpen] = useState<boolean>(false);
  const [newGroupName, setNewGroupName] = useState<string>('');
  const [isCreating, setIsCreating] = useState<boolean>(false);
  const [createdGroup, setCreatedGroup] = useState<LeagueGroup | null>(null);
  const [createError, setCreateError] = useState<string | null>(null);

  // Form States (Joining)
  const [inviteCodeInput, setInviteCodeInput] = useState<string>('');
  const [isJoining, setIsJoining] = useState<boolean>(false);

  
  useEffect(() => {
    if (!user) return;
    let active = true;

    const load = async () => {
      try {
        setIsLoadingGroups(true);
        const data = await apiClient<readonly LeagueGroup[]>(API_ROUTES.groups.me);
        if (!active) return;
        setMyGroups(data);
        
        // Auto-select first group if none is selected yet and we have groups
        if (data.length > 0 && !selectedGroupId) {
          setSelectedGroupId(data[0].id);
        }
      } catch (err) {
        console.error(err);
        toast.error('Error al cargar tus ligas privadas.');
      } finally {
        if (active) {
          setIsLoadingGroups(false);
        }
      }
    };

    void load();
    return () => {
      active = false;
    };
  }, [user, selectedGroupId]);

  // Fetch leaderboard when selectedGroupId changes
  useEffect(() => {
    if (!selectedGroupId) {
      Promise.resolve().then(() => {
        setLeaderboardData(null);
      });
      return;
    }

    let active = true;
    const fetchLeaderboard = async () => {
      try {
        setIsLoadingLeaderboard(true);
        const participants = await apiClient<readonly GroupParticipant[]>(
          API_ROUTES.groups.leaderboard(selectedGroupId)
        );
        if (!active) return;
        
        // Map GroupParticipant[] to LeaderboardRowDTO[]
        const mappedRows: readonly LeaderboardRowDTO[] = participants.map((p, index) => ({
          userId: p.userId,
          rank: index + 1,
          username: p.user?.username ?? 'Usuario',
          predictionsMade: 0, // Mocked as not returned by the API
          exactHits: 0, // Mocked as not returned by the API
          points: p.accumulatedPoints,
        }));
        
        setLeaderboardData(mappedRows);
      } catch (err) {
        console.error(err);
        toast.error('Error al cargar la clasificación del grupo.');
      } finally {
        if (active) {
          setIsLoadingLeaderboard(false);
        }
      }
    };

    void fetchLeaderboard();
    return () => {
      active = false;
    };
  }, [selectedGroupId]);

  // Handle group creation submit
  const handleCreateGroupSubmit = async (e: React.SyntheticEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (!newGroupName.trim()) {
      setCreateError('Por favor ingresa un nombre para la liga.');
      return;
    }

    try {
      setIsCreating(true);
      setCreateError(null);
      
      const resGroup = await apiClient<LeagueGroup>(API_ROUTES.groups.base, {
        method: 'POST',
        body: JSON.stringify({ name: newGroupName.trim() }),
      });
      
      setCreatedGroup(resGroup);
      toast.success('¡Liga privada creada con éxito!');
      
      // Refresh groups list and select new group
      const updatedGroups = await apiClient<readonly LeagueGroup[]>(API_ROUTES.groups.me);
      setMyGroups(updatedGroups);
      setSelectedGroupId(resGroup.id);
    } catch (err) {
      console.error(err);
      const message = err instanceof ApiError ? err.message : 'Error al crear la liga.';
      setCreateError(message);
    } finally {
      setIsCreating(false);
    }
  };

  // Handle group join submit
  const handleJoinGroupSubmit = async (e: React.SyntheticEvent<HTMLFormElement>) => {
    e.preventDefault();
    const cleanCode = inviteCodeInput.trim().toUpperCase();
    if (cleanCode.length !== 8) {
      toast.error('El código de invitación debe tener exactamente 8 caracteres.');
      return;
    }

    try {
      setIsJoining(true);
      await apiClient(API_ROUTES.groups.join(cleanCode), {
        method: 'POST',
      });

      toast.success('Te has unido a la liga exitosamente.');
      setInviteCodeInput('');
      
      // Refresh groups
      const updatedGroups = await apiClient<readonly LeagueGroup[]>(API_ROUTES.groups.me);
      setMyGroups(updatedGroups);
      
      // Select the joined group if we can find it in the updated list
      const joined = updatedGroups.find((g) => g.inviteCode.toUpperCase() === cleanCode);
      if (joined) {
        setSelectedGroupId(joined.id);
      }
    } catch (err) {
      console.error(err);
      const message = err instanceof ApiError ? err.message : 'No se pudo unir a la liga.';
      toast.error(message);
    } finally {
      setIsJoining(false);
    }
  };

  // Clipboard share helper
  const handleCopyCode = (code: string) => {
    navigator.clipboard.writeText(code)
      .then(() => toast.success('Código copiado al portapapeles.'))
      .catch(() => toast.error('No se pudo copiar el código.'));
  };

  // Filters logic
  const filteredGroups = myGroups.filter((group) => {
    if (!user) return false;
    if (filter === 'created') return group.creatorId === user.id;
    if (filter === 'joined') return group.creatorId !== user.id;
    return true;
  });

  // Map LeagueGroup[] to GroupOptionDTO[]
  const groupOptions: readonly GroupOptionDTO[] = filteredGroups.map((g) => ({
    id: g.id,
    name: g.name,
    code: g.inviteCode,
    memberCount: g.participants?.length ?? 0,
  }));

  const activeGroup = myGroups.find((g) => g.id === selectedGroupId);

  return (
    <div className={styles.pageContainer}>
      {/* LEFT COLUMN: LISTS & CREATION/JOINING */}
      <aside className={styles.leftColumn}>
        <div className={styles.sidebarCard}>
          <h2 className={styles.sectionTitle}>Mis Ligas Privadas</h2>
          
          <div className={styles.filterTabs}>
            <button 
              type="button"
              className={`${styles.filterTab} ${filter === 'all' ? styles.filterTabActive : ''}`}
              onClick={() => setFilter('all')}
            >
              Todas
            </button>
            <button 
              type="button"
              className={`${styles.filterTab} ${filter === 'created' ? styles.filterTabActive : ''}`}
              onClick={() => setFilter('created')}
            >
              Creadas
            </button>
            <button 
              type="button"
              className={`${styles.filterTab} ${filter === 'joined' ? styles.filterTabActive : ''}`}
              onClick={() => setFilter('joined')}
            >
              Unido
            </button>
          </div>

          {isLoadingGroups ? (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
              <Skeleton variant="rect" width="100%" height="52px" />
              <Skeleton variant="rect" width="100%" height="52px" />
            </div>
          ) : (
            <GroupSelectorCard 
              groups={groupOptions} 
              activeGroupId={selectedGroupId || ''} 
              onGroupChange={setSelectedGroupId}
              isLoading={isLoadingGroups}
            />
          )}
        </div>

        {/* JOIN LEAGUE CARD */}
        <div className={styles.sidebarCard}>
          <h3 className={styles.sectionTitle}>Unirse a una Liga</h3>
          <form onSubmit={handleJoinGroupSubmit} className={styles.joinForm}>
            <InputField 
              value={inviteCodeInput}
              onChange={(e) => setInviteCodeInput(e.target.value)}
              placeholder="Código de 8 dígitos"
              maxLength={8}
              disabled={isJoining}
              containerStyle={{ flex: 1 }}
            />
            <Button type="submit" variant="usa" isLoading={isJoining} disabled={inviteCodeInput.trim().length !== 8}>
              Unirse
            </Button>
          </form>
        </div>

        {/* CREATE LEAGUE TRIGGERS */}
        <Button 
          type="button" 
          variant="mex" 
          size="lg" 
          onClick={() => {
            setCreatedGroup(null);
            setNewGroupName('');
            setCreateError(null);
            setIsCreateModalOpen(true);
          }}
        >
          Crear Nueva Liga
        </Button>
      </aside>

      {/* RIGHT COLUMN: STANDINGS & LEAGUE INFO */}
      <main className={styles.rightColumn}>
        {isLoadingLeaderboard || isLoadingGroups ? (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
            <Skeleton variant="rect" width="100%" height="120px" />
            <Skeleton variant="rect" width="100%" height="300px" />
          </div>
        ) : activeGroup ? (
          <>
            {/* Header detail style matching visual premium spec */}
            <div className={styles.leaderboardHeaderCard}>
              <div className={styles.headerLeft}>
                <span className={styles.groupMetaTag}>Liga Privada</span>
                <h1 className={styles.groupName}>{activeGroup.name}</h1>
                <div className={styles.groupSubInfo}>
                  <span>Código de Invitación:</span>
                  <span className={styles.inviteBadge}>{activeGroup.inviteCode}</span>
                  <button 
                    type="button" 
                    className={styles.copyBtn}
                    onClick={() => handleCopyCode(activeGroup.inviteCode)}
                  >
                    Copiar Código
                  </button>
                </div>
              </div>
              
              <div className={styles.headerRight}>
                <div className={styles.statCard}>
                  <span className={styles.statVal}>{activeGroup.participants?.length ?? 0}</span>
                  <span className={styles.statLabel}>Participantes</span>
                </div>
              </div>
            </div>

            {/* Standings Render */}
            <LeaderboardTable 
              data={leaderboardData || []} 
              currentUserId={user?.id || null} 
              isLoading={isLoadingLeaderboard}
            />
          </>
        ) : (
          <div className={styles.noSelectionCard}>
            <div style={{ fontSize: '2.5rem' }}>🏆</div>
            <p className={styles.noSelectionText}>
              Selecciona una liga privada en el panel izquierdo para ver la tabla de clasificación o crea una nueva liga.
            </p>
          </div>
        )}
      </main>

      {/* CREATE LEAGUE MODAL */}
      <Modal
        isOpen={isCreateModalOpen}
        onClose={() => !isCreating && setIsCreateModalOpen(false)}
        title="Crear Nueva Liga Privada"
      >
        {!createdGroup ? (
          <form onSubmit={handleCreateGroupSubmit} className={styles.modalForm}>
            <p style={{ color: 'var(--text-muted)', fontSize: 'var(--font-size-sm)' }}>
              Crea una liga privada para competir con tus amigos. Se generará un código de invitación único.
            </p>
            
            <InputField 
              label="Nombre de la Liga"
              value={newGroupName}
              onChange={(e) => setNewGroupName(e.target.value)}
              placeholder="Ej: Amigos del Fútbol"
              disabled={isCreating}
              maxLength={100}
            />

            {createError && <p className={styles.errorText}>{createError}</p>}

            <div className={styles.formActions} style={{ display: 'flex', justifyContent: 'flex-end', gap: '1rem', marginTop: '1rem' }}>
              <Button type="button" variant="text" onClick={() => setIsCreateModalOpen(false)} disabled={isCreating}>
                Cancelar
              </Button>
              <Button type="submit" variant="usa" isLoading={isCreating}>
                Crear Liga
              </Button>
            </div>
          </form>
        ) : (
          <div className={styles.successModalContent}>
            <div style={{ fontSize: '3rem' }}>🎉</div>
            <h3 className={styles.successTitle}>¡Liga creada exitosamente!</h3>
            <p className={styles.successText}>
              Comparte este código de invitación con tus amigos para que puedan unirse a tu liga:
            </p>
            
            <div className={styles.codeDisplayBox}>
              {createdGroup.inviteCode}
            </div>

            <div style={{ display: 'flex', gap: '1rem', marginTop: '1rem' }}>
              <Button type="button" variant="text" onClick={() => setIsCreateModalOpen(false)}>
                Cerrar
              </Button>
              <Button type="button" variant="usa" onClick={() => handleCopyCode(createdGroup.inviteCode)}>
                Copiar Código
              </Button>
            </div>
          </div>
        )}
      </Modal>
    </div>
  );
};

GroupsPage.displayName = 'GroupsPage';
