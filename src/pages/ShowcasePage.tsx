import React, { useState } from 'react';
import { Button } from '../components/atoms/Button/Button';
import { InputField } from '../components/atoms/InputField/InputField';
import { SelectField } from '../components/atoms/SelectField/SelectField';
import { RadioButton } from '../components/atoms/RadioButton/RadioButton';
import { RadioGroup } from '../components/atoms/RadioGroup/RadioGroup';
import { Badge } from '../components/atoms/Badge/Badge';
import { Flag } from '../components/atoms/Flag/Flag';
import { getFlagUrl, getFifaCode } from '../services/teamCodes';
import { Table } from '../components/atoms/Table/Table';
import type { ColumnConfig } from '../components/atoms/Table/Table';
import { Skeleton } from '../components/atoms/Skeleton/Skeleton';
import { FormField } from '../components/molecules/FormField/FormField';
import { MatchRow, type MatchDTO } from '../components/molecules/MatchRow/MatchRow';
import { MatchCard, type MatchDTO as CardMatchDTO } from '../components/molecules/MatchCard/MatchCard';
import { TeamDisplay } from '../components/molecules/TeamDisplay/TeamDisplay';
import { ScoreInput } from '../components/atoms/ScoreInput/ScoreInput';
import { UserRankRow, type UserRankDTO } from '../components/molecules/UserRankRow/UserRankRow';
import { CountdownTimer } from '../components/atoms/CountdownTimer/CountdownTimer';
import { LeaderboardTable, type LeaderboardRowDTO } from '../components/organisms/LeaderboardTable/LeaderboardTable';
import { NavbarSuite, type UserSessionDTO, type TenantSummaryDTO } from '../components/organisms/NavbarSuite/NavbarSuite';
import { GroupSelectorCard, type GroupOptionDTO } from '../components/molecules/GroupSelectorCard/GroupSelectorCard';
import { PredictionSummary, type PredictionStatsDTO } from '../components/molecules/PredictionSummary/PredictionSummary';
import { z } from 'zod';

const COUNTRY_OPTIONS = [
  { value: 'usa', label: 'Estados Unidos' },
  { value: 'mex', label: 'México' },
  { value: 'can', label: 'Canadá' },
];

const GROUP_OPTIONS = [
  { value: 'a', label: 'Grupo A' },
  { value: 'b', label: 'Grupo B' },
  { value: 'c', label: 'Grupo C' },
  { value: 'd', label: 'Grupo D' },
  { value: 'e', label: 'Grupo E' },
  { value: 'f', label: 'Grupo F' },
  { value: 'g', label: 'Grupo G' },
  { value: 'h', label: 'Grupo H' },
];

const POSITION_OPTIONS = [
  { value: 'gk', label: 'Portero' },
  { value: 'def', label: 'Defensa' },
  { value: 'mid', label: 'Mediocampista' },
  { value: 'fwd', label: 'Delantero' },
];

const ROLE_OPTIONS = [
  { value: 'admin', label: 'Administrador (USA)', accentColor: 'var(--primary-usa)' },
  { value: 'moderator', label: 'Moderador (MEX)', accentColor: 'var(--accent-mex)' },
  { value: 'user', label: 'Usuario Estándar (CAN)', accentColor: 'var(--accent-can)' },
];

const BROKEN_FLAG_URL = 'https://flagcdn.com/w160/invalido.png';

interface LeaderboardRow {
  readonly rank: number;
  readonly user: string;
  readonly points: number;
  readonly accuracy: string;
}

const LEADERBOARD_DATA: LeaderboardRow[] = [
  { rank: 1, user: 'golazo10', points: 87, accuracy: '92%' },
  { rank: 2, user: 'la_quiniela_mx', points: 81, accuracy: '88%' },
  { rank: 3, user: 'mapleLeafFan', points: 76, accuracy: '85%' },
  { rank: 4, user: 'futbolero_usa', points: 64, accuracy: '71%' },
  { rank: 5, user: 'tri_campeon', points: 58, accuracy: '66%' },
  { rank: 6, user: 'northSoccer', points: 51, accuracy: '60%' },
];

const LEADERBOARD_COLUMNS: ColumnConfig<LeaderboardRow>[] = [
  {
    key: 'rank',
    header: '#',
    align: 'center',
    render: (row) =>
      row.rank <= 3 ? (
        <strong style={{ color: 'var(--brand-gold)' }}>{row.rank}</strong>
      ) : (
        row.rank
      ),
  },
  { key: 'user', header: 'Usuario' },
  {
    key: 'points',
    header: 'Puntos',
    align: 'right',
    render: (row) => <strong>{row.points}</strong>,
  },
  { key: 'accuracy', header: 'Precisión', align: 'center' },
];

const EMPTY_LEADERBOARD: LeaderboardRow[] = [];

const RANKING_DATA: ReadonlyArray<{ rank: number; user: UserRankDTO; delta: number; isCurrentUser?: boolean }> = [
  {
    rank: 1,
    delta: 2,
    user: { id: 'u1', username: 'golazo10', totalPoints: 87, exactPredictionsCount: 14, efficiencyRate: 92 },
  },
  {
    rank: 2,
    delta: -1,
    user: { id: 'u2', username: 'la_quiniela_mx', totalPoints: 81, exactPredictionsCount: 11, efficiencyRate: 88 },
  },
  {
    rank: 3,
    delta: 0,
    isCurrentUser: true,
    user: { id: 'u3', username: 'mapleLeafFan', totalPoints: 76, exactPredictionsCount: 9, efficiencyRate: 85 },
  },
  {
    rank: 4,
    delta: 5,
    user: { id: 'u4', username: 'futbolero_de_corazon_usa_2026', totalPoints: 64, exactPredictionsCount: 7, efficiencyRate: 71 },
  },
];

const LEADERBOARD_TABLE_DATA: readonly LeaderboardRowDTO[] = [
  { userId: 'u1', rank: 1, username: 'golazo10', predictionsMade: 24, exactHits: 14, points: 87 },
  { userId: 'u2', rank: 2, username: 'la_quiniela_mx', predictionsMade: 24, exactHits: 11, points: 81 },
  { userId: 'u3', rank: 3, username: 'mapleLeafFan', predictionsMade: 22, exactHits: 9, points: 76 },
  { userId: 'u4', rank: 4, username: 'futbolero_de_corazon_usa_2026_edicion_especial', predictionsMade: 21, exactHits: 7, points: 64 },
  { userId: 'u5', rank: 5, username: 'tri_campeon', predictionsMade: 19, exactHits: 6, points: 58 },
  { userId: 'u6', rank: 6, username: 'northSoccer', predictionsMade: 18, exactHits: 5, points: 51 },
];

const EMPTY_LEADERBOARD_TABLE: readonly LeaderboardRowDTO[] = [];

const GROUP_SELECTOR_DATA: readonly GroupOptionDTO[] = [
  { id: 'g1', name: 'Los Cracks de la Oficina', code: 'GRP-A', memberCount: 12 },
  { id: 'g2', name: 'Familia Dávila', code: 'GRP-B', memberCount: 6 },
  { id: 'g3', name: 'Liga NUR', code: 'LIG-1', memberCount: 24 },
  { id: 'g4', name: 'Amigos del Barrio', code: 'GRP-C', memberCount: 1 },
];

const EMPTY_GROUPS: readonly GroupOptionDTO[] = [];

const PREDICTION_STATS: PredictionStatsDTO = {
  totalPredictions: 24,
  exactHits: 14,
  outcomeHits: 8,
  efficiencyPercentage: 92,
};

const IconSearch = () => (
  <svg xmlns="http://www.w3.org/2000/svg" width="1em" height="1em" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
    <circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/>
  </svg>
);
const IconArrow = () => (
  <svg xmlns="http://www.w3.org/2000/svg" width="1em" height="1em" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
    <line x1="5" y1="12" x2="19" y2="12"/><polyline points="12 5 19 12 12 19"/>
  </svg>
);
const IconPlus = () => (
  <svg xmlns="http://www.w3.org/2000/svg" width="1em" height="1em" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
    <line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/>
  </svg>
);
const IconTrash = () => (
  <svg xmlns="http://www.w3.org/2000/svg" width="1em" height="1em" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
    <polyline points="3 6 5 6 21 6"/><path d="M19 6l-1 14H6L5 6"/><path d="M10 11v6"/><path d="M14 11v6"/><path d="M9 6V4h6v2"/>
  </svg>
);
const IconStar = () => (
  <svg xmlns="http://www.w3.org/2000/svg" width="1em" height="1em" viewBox="0 0 24 24" fill="currentColor" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
    <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"/>
  </svg>
);

const formSchema = z.object({
  username: z.string().min(3, { message: 'El usuario debe tener al menos 3 caracteres' }),
  email: z.string().email({ message: 'El correo electrónico no es válido' }),
  age: z.coerce.number().min(18, { message: 'Debes ser mayor de 18 años para participar' }),
});

export const ShowcasePage: React.FC = () => {
  const [role, setRole] = useState('user');
  const [standaloneChecked, setStandaloneChecked] = useState(false);

  // Estados para demostración del FormField y validación Zod
  const [formData, setFormData] = useState({ username: '', email: '', age: '' });
  const [formErrors, setFormErrors] = useState<Record<string, string>>({});
  const [isFormLoading, setIsFormLoading] = useState(false);
  const [isTeamLoading, setIsTeamLoading] = useState(false);

  // Estados para la demostración de UserRankRow
  const [isRankLoading, setIsRankLoading] = useState(false);

  // Estados para la demostración de LeaderboardTable
  const [isLeaderboardLoading, setIsLeaderboardLoading] = useState(false);

  // Estados para la demostración de GroupSelectorCard
  const [activeGroupId, setActiveGroupId] = useState('g1');
  const [isGroupLoading, setIsGroupLoading] = useState(false);

  // Estados para la demostración de PredictionSummary
  const [isSummaryLoading, setIsSummaryLoading] = useState(false);

  // Estados para la demostración de CountdownTimer (fechas fijadas al montar)
  const [isCountdownLoading, setIsCountdownLoading] = useState(false);
  const [expireCount, setExpireCount] = useState(0);
  const [countdownTargets] = useState(() => {
    const now = Date.now();
    return {
      far: new Date(now + 40 * 24 * 60 * 60 * 1000),
      hours: new Date(now + 5 * 60 * 60 * 1000),
      critical: new Date(now + 10 * 60 * 1000),
      imminent: new Date(now + 15 * 1000),
    };
  });

  const [isScoreLoading, setIsScoreLoading] = useState(false);
  const [scoreHome, setScoreHome] = useState<number>(2);
  const [scoreAway, setScoreAway] = useState<number>(1);

  const [cardMatches] = useState<CardMatchDTO[]>(() => {
    const now = Date.now();
    return [
      {
        id: 'mc1',
        homeTeam: { id: 't_usa', name: 'Estados Unidos', logoUrl: getFlagUrl('United States') },
        awayTeam: { id: 't_mex', name: 'México', logoUrl: getFlagUrl('Mexico') },
        status: 'UPCOMING',
        startTime: new Date(now + 2 * 60 * 60 * 1000).toISOString(),
      },
      {
        id: 'mc2',
        homeTeam: { id: 't_can', name: 'Canadá', logoUrl: getFlagUrl('Canada') },
        awayTeam: { id: 't_ger', name: 'Alemania', logoUrl: getFlagUrl('Germany') },
        status: 'LIVE',
        startTime: new Date(now - 1 * 60 * 60 * 1000).toISOString(),
        homeScore: 2,
        awayScore: 1,
      },
      {
        id: 'mc3',
        homeTeam: { id: 't_bra', name: 'Brasil', logoUrl: getFlagUrl('Brazil') },
        awayTeam: { id: 't_arg', name: 'Argentina', logoUrl: getFlagUrl('Argentina') },
        status: 'FINISHED',
        startTime: new Date(now - 5 * 60 * 60 * 1000).toISOString(),
        homeScore: 0,
        awayScore: 3,
      }
    ];
  });

  const [cardPredictions, setCardPredictions] = useState<Record<string, { homeScore: number; awayScore: number } | null>>({
    mc1: null,
    mc2: { homeScore: 2, awayScore: 2 },
    mc3: { homeScore: 1, awayScore: 2 },
  });

  const [cardLogs, setCardLogs] = useState<string[]>([]);
  const [isCardLoading, setIsCardLoading] = useState(false);

  const handleSaveCardPrediction = async (matchId: string, homeScore: number, awayScore: number) => {
    await new Promise((resolve) => setTimeout(resolve, 800));

    setCardPredictions((prev) => ({
      ...prev,
      [matchId]: { homeScore, awayScore },
    }));

    const match = cardMatches.find((m) => m.id === matchId);
    const homeName = match?.homeTeam.name || 'Local';
    const awayName = match?.awayTeam.name || 'Visitante';

    setCardLogs((prev) => [
      `[${new Date().toLocaleTimeString()}] Predicción guardada para ${homeName} vs ${awayName}: ${homeScore} - ${awayScore}`,
      ...prev.slice(0, 4),
    ]);
  };

  const handleInputChange = (field: string, value: string) => {
    const nextData = { ...formData, [field]: value };
    setFormData(nextData);

    const result = formSchema.safeParse(nextData);
    if (result.success) {
      setFormErrors((prev) => ({ ...prev, [field]: '' }));
    } else {
      const issues = result.error.issues;
      const matchingIssue = issues.find(i => i.path[0] === field);
      setFormErrors((prev) => ({ 
        ...prev, 
        [field]: matchingIssue ? matchingIssue.message : '' 
      }));
    }
  };

  // Estados para la demostración de MatchRow
  const initialMatches: MatchDTO[] = [
    {
      id: 'm1',
      homeTeam: { id: 't1', name: 'Estados Unidos', flagUrl: getFlagUrl('United States') },
      awayTeam: { id: 't2', name: 'México', flagUrl: getFlagUrl('Mexico') },
      status: 'scheduled',
      startTime: '2026-06-15T18:00:00Z',
    },
    {
      id: 'm2',
      homeTeam: { id: 't3', name: 'Canadá', flagUrl: getFlagUrl('Canada') },
      awayTeam: { id: 't4', name: 'Alemania', flagUrl: getFlagUrl('Germany') },
      status: 'live',
      startTime: '2026-06-15T21:00:00Z',
    },
    {
      id: 'm3',
      homeTeam: { id: 't5', name: 'Brasil', flagUrl: getFlagUrl('Brazil') },
      awayTeam: { id: 't6', name: 'Argentina', flagUrl: getFlagUrl('Argentina') },
      status: 'finished',
      startTime: '2026-06-14T15:00:00Z',
    }
  ];

  const [matches] = useState<MatchDTO[]>(initialMatches);
  const [matchPredictions, setMatchPredictions] = useState<Record<string, { home: number | ""; away: number | "" }>>({
    m1: { home: "", away: "" },
    m2: { home: 1, away: 0 },
    m3: { home: 2, away: 1 }
  });
  const [matchLogs, setMatchLogs] = useState<string[]>([]);
  const [isMatchLoading, setIsMatchLoading] = useState(false);

  // Estados para la demostración de NavbarSuite
  const [navRoute, setNavRoute] = useState('/dashboard');
  const [navUser, setNavUser] = useState<UserSessionDTO | null>({ id: 'u1', username: 'quinielero_pro', role: 'USER' });
  const [navTenant, setNavTenant] = useState<TenantSummaryDTO | null>({ id: 't1', name: 'Liga Furia 2026' });
  const [navLogs, setNavLogs] = useState<string[]>([]);

  const handleNavLogout = async () => {
    setNavLogs((prev) => [`[${new Date().toLocaleTimeString()}] Evento onLogout disparado (Cerrando sesión del usuario...)`, ...prev.slice(0, 4)]);
    setNavUser(null);
  };

  const handleNavNavigate = (route: string) => {
    setNavRoute(route);
    setNavLogs((prev) => [`[${new Date().toLocaleTimeString()}] Navegando a la ruta: ${route}`, ...prev.slice(0, 4)]);
  };

  const handlePredictionChange = (matchId: string, homeScore: number, awayScore: number) => {
    setMatchPredictions(prev => ({
      ...prev,
      [matchId]: { home: homeScore, away: awayScore }
    }));
    
    const match = initialMatches.find(m => m.id === matchId);
    const homeTeamName = match?.homeTeam.name || 'Local';
    const awayTeamName = match?.awayTeam.name || 'Visitante';
    
    setMatchLogs(prev => [
      `[${new Date().toLocaleTimeString()}] Guardando predicción para ${homeTeamName} vs ${awayTeamName}: ${homeScore} - ${awayScore}`,
      ...prev.slice(0, 4)
    ]);
  };

  return (
    <div style={{ padding: '2rem', maxWidth: '1200px', margin: '0 auto', textAlign: 'left', fontFamily: 'var(--font-body)' }}>
      <header style={{ borderBottom: '1px solid var(--border-color)', paddingBottom: '1rem', marginBottom: '2rem' }}>
        <h1 style={{ fontFamily: 'var(--font-display)', fontSize: 'var(--font-size-3xl)', color: 'var(--brand-gold)', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
          KickOff Club - Showcase de Componentes
        </h1>
        <p style={{ color: 'var(--text-muted)', fontSize: 'var(--font-size-sm)', marginTop: '0.5rem' }}>
          Auditoría visual de los componentes atómicos del proyecto de la Quiniela Mundial 2026.
        </p>
      </header>

      <main style={{ display: 'flex', flexDirection: 'column', gap: '2.5rem' }}>
        <section style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
          <h2 style={{ fontFamily: 'var(--font-display)', fontSize: 'var(--font-size-xl)', color: 'var(--text-main)', borderBottom: '1px solid var(--border-color)', paddingBottom: '0.5rem' }}>
            Componente: Button (Átomo)
          </h2>

          <div>
            <h3 style={{ fontSize: 'var(--font-size-sm)', color: 'var(--text-muted)', marginBottom: '0.75rem' }}>Variantes (Tema WC 2026)</h3>
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: '1rem' }}>
              <Button variant="usa">USA Primary</Button>
              <Button variant="mex">MEX Accent</Button>
              <Button variant="can">CAN Accent</Button>
              <Button variant="gold">Gold Theme</Button>
              <Button variant="secondary">Secondary</Button>
              <Button variant="text">Text Button</Button>
            </div>
          </div>

          <div>
            <h3 style={{ fontSize: 'var(--font-size-sm)', color: 'var(--text-muted)', marginBottom: '0.75rem' }}>Tamaños (Sizes)</h3>
            <div style={{ display: 'flex', alignItems: 'center', flexWrap: 'wrap', gap: '1rem' }}>
              <Button size="sm" variant="usa">Pequeño (SM)</Button>
              <Button size="md" variant="usa">Mediano (MD)</Button>
              <Button size="lg" variant="usa">Grande (LG)</Button>
            </div>
          </div>

          <div>
            <h3 style={{ fontSize: 'var(--font-size-sm)', color: 'var(--text-muted)', marginBottom: '0.75rem' }}>Radios de Borde (Border Radius)</h3>
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: '1rem' }}>
              <Button radius="sm" variant="secondary">Radio SM</Button>
              <Button radius="md" variant="secondary">Radio MD</Button>
              <Button radius="lg" variant="secondary">Radio LG</Button>
              <Button radius="full" variant="secondary">Radio Full</Button>
            </div>
          </div>

          <div>
            <h3 style={{ fontSize: 'var(--font-size-sm)', color: 'var(--text-muted)', marginBottom: '0.75rem' }}>Estados Especiales</h3>
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: '1rem' }}>
              <Button isLoading variant="usa">Cargando</Button>
              <Button isLoading variant="gold">Cargando Gold</Button>
              <Button disabled variant="usa">Deshabilitado USA</Button>
              <Button disabled variant="secondary">Deshabilitado Sec</Button>
            </div>
          </div>

          {/* ── Íconos ────────────────────────────────────────── */}
          <div>
            <h3 style={{ fontSize: 'var(--font-size-sm)', color: 'var(--text-muted)', marginBottom: '0.75rem' }}>Con Íconos</h3>
            <div style={{ display: 'flex', flexWrap: 'wrap', alignItems: 'center', gap: '1rem' }}>
              <Button variant="usa" iconLeft={<IconSearch />}>Buscar</Button>
              <Button variant="gold" iconRight={<IconArrow />}>Continuar</Button>
              <Button variant="mex" iconLeft={<IconStar />} iconRight={<IconArrow />}>Favorito</Button>
              <Button variant="secondary" iconLeft={<IconPlus />} radius="full">Agregar</Button>
              <Button variant="can" iconLeft={<IconTrash />} size="sm">Eliminar</Button>
            </div>
          </div>

          <div>
            <h3 style={{ fontSize: 'var(--font-size-sm)', color: 'var(--text-muted)', marginBottom: '0.75rem' }}>Solo Ícono (Icon-Only)</h3>
            <div style={{ display: 'flex', flexWrap: 'wrap', alignItems: 'center', gap: '1rem' }}>
              <Button variant="usa" iconLeft={<IconSearch />} iconOnly aria-label="Buscar" size="sm" />
              <Button variant="gold" iconLeft={<IconStar />} iconOnly aria-label="Favorito" size="md" />
              <Button variant="secondary" iconLeft={<IconPlus />} iconOnly aria-label="Agregar" size="md" radius="full" />
              <Button variant="mex" iconLeft={<IconTrash />} iconOnly aria-label="Eliminar" size="lg" />
            </div>
          </div>
        </section>

        <section style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
          <h2 style={{ fontFamily: 'var(--font-display)', fontSize: 'var(--font-size-xl)', color: 'var(--text-main)', borderBottom: '1px solid var(--border-color)', paddingBottom: '0.5rem' }}>
            Componente: InputField (Átomo)
          </h2>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))', gap: '1.5rem' }}>
            <InputField
              label="Nombre de Usuario"
              placeholder="Ej. golazo10"
            />
            <InputField
              label="Contraseña"
              type="password"
              placeholder="••••••••"
            />
            <InputField
              label="Edad"
              type="number"
              placeholder="18"
            />
            <InputField
              label="Correo Electrónico"
              defaultValue="usuario@invalid"
              error="Por favor ingresa un correo electrónico válido"
            />
            <InputField
              label="Campo Deshabilitado"
              disabled
              placeholder="No editable"
            />
            <InputField
              label="Subir Archivo"
              type="file"
            />
          </div>
        </section>

        <section style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
          <h2 style={{ fontFamily: 'var(--font-display)', fontSize: 'var(--font-size-xl)', color: 'var(--text-main)', borderBottom: '1px solid var(--border-color)', paddingBottom: '0.5rem' }}>
            Componente: SelectField (Átomo)
          </h2>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))', gap: '1.5rem' }}>
            <SelectField
              label="País Sede"
              options={COUNTRY_OPTIONS}
              placeholder="Selecciona un país..."
            />
            <SelectField
              label="Grupo del Mundial"
              options={GROUP_OPTIONS}
              placeholder="Elige un grupo..."
            />
            <SelectField
              label="Posición del Jugador"
              options={POSITION_OPTIONS}
              defaultValue="mid"
            />
            <SelectField
              label="Categoría (con error)"
              options={POSITION_OPTIONS}
              placeholder="Selecciona..."
              error="Debes seleccionar una categoría válida"
            />
            <SelectField
              label="Select Deshabilitado"
              options={COUNTRY_OPTIONS}
              disabled
              defaultValue="mex"
            />
          </div>
        </section>

        <section style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
          <h2 style={{ fontFamily: 'var(--font-display)', fontSize: 'var(--font-size-xl)', color: 'var(--text-main)', borderBottom: '1px solid var(--border-color)', paddingBottom: '0.5rem' }}>
            Componente: RadioButton y RadioGroup (Átomos)
          </h2>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))', gap: '2rem' }}>
            <div>
              <h3 style={{ fontSize: 'var(--font-size-sm)', color: 'var(--text-muted)', marginBottom: '0.75rem' }}>RadioButton (Átomo Standalone)</h3>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                <RadioButton
                  label="Opción USA (Personalizada)"
                  accentColor="var(--primary-usa)"
                  checked={standaloneChecked}
                  onChange={() => setStandaloneChecked(true)}
                />
                <RadioButton
                  label="Opción Predeterminada (Gold)"
                  checked={!standaloneChecked}
                  onChange={() => setStandaloneChecked(false)}
                />
              </div>
            </div>

            <div>
              <h3 style={{ fontSize: 'var(--font-size-sm)', color: 'var(--text-muted)', marginBottom: '0.75rem' }}>RadioGroup (Vertical)</h3>
              <RadioGroup
                name="user-role-vertical"
                label="Selecciona un Rol de Usuario"
                options={ROLE_OPTIONS}
                selectedValue={role}
                onChange={setRole}
                direction="vertical"
              />
            </div>

            <div>
              <h3 style={{ fontSize: 'var(--font-size-sm)', color: 'var(--text-muted)', marginBottom: '0.75rem' }}>RadioGroup (Horizontal)</h3>
              <RadioGroup
                name="user-role-horizontal"
                label="Selecciona un Rol de Usuario"
                options={ROLE_OPTIONS}
                selectedValue={role}
                onChange={setRole}
                direction="horizontal"
              />
            </div>
          </div>
        </section>

        <section style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
          <h2 style={{ fontFamily: 'var(--font-display)', fontSize: 'var(--font-size-xl)', color: 'var(--text-main)', borderBottom: '1px solid var(--border-color)', paddingBottom: '0.5rem' }}>
            Componente: Badge (Átomo)
          </h2>

          <div style={{ display: 'flex', flexWrap: 'wrap', gap: '1rem' }}>
            <Badge variant="live">En Vivo</Badge>
            <Badge variant="upcoming">Próximamente</Badge>
            <Badge variant="finished">Finalizado</Badge>
            <Badge variant="exact">Exacto (+3 pts)</Badge>
            <Badge variant="winner">Ganador (+1 pt)</Badge>
            <Badge variant="missed">Fallado (0 pts)</Badge>
          </div>
        </section>

        <section style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
          <h2 style={{ fontFamily: 'var(--font-display)', fontSize: 'var(--font-size-xl)', color: 'var(--text-main)', borderBottom: '1px solid var(--border-color)', paddingBottom: '0.5rem' }}>
            Componente: Flag (Átomo) — usando teamCodes utility
          </h2>

          <div>
            <h3 style={{ fontSize: 'var(--font-size-sm)', color: 'var(--text-muted)', marginBottom: '0.75rem' }}>Tamaños (SM / MD / LG) — getFlagUrl('United States')</h3>
            <div style={{ display: 'flex', alignItems: 'center', flexWrap: 'wrap', gap: '1rem' }}>
              <Flag src={getFlagUrl('United States')} code={getFifaCode('United States')} fallbackText={getFifaCode('United States')} size="sm" />
              <Flag src={getFlagUrl('United States')} code={getFifaCode('United States')} fallbackText={getFifaCode('United States')} size="md" />
              <Flag src={getFlagUrl('United States')} code={getFifaCode('United States')} fallbackText={getFifaCode('United States')} size="lg" />
            </div>
          </div>

          <div>
            <h3 style={{ fontSize: 'var(--font-size-sm)', color: 'var(--text-muted)', marginBottom: '0.75rem' }}>Geometrías (Circle vs Shield)</h3>
            <div style={{ display: 'flex', alignItems: 'center', flexWrap: 'wrap', gap: '1rem' }}>
              <Flag src={getFlagUrl('Mexico')} code={getFifaCode('Mexico')} fallbackText={getFifaCode('Mexico')} size="lg" shape="circle" />
              <Flag src={getFlagUrl('Mexico')} code={getFifaCode('Mexico')} fallbackText={getFifaCode('Mexico')} size="lg" shape="shield" />
              <Flag src={getFlagUrl('Canada')} code={getFifaCode('Canada')} fallbackText={getFifaCode('Canada')} size="lg" shape="circle" />
              <Flag src={getFlagUrl('Canada')} code={getFifaCode('Canada')} fallbackText={getFifaCode('Canada')} size="lg" shape="shield" />
              <Flag src={getFlagUrl('Germany')} code={getFifaCode('Germany')} fallbackText={getFifaCode('Germany')} size="lg" shape="circle" />
              <Flag src={getFlagUrl('Germany')} code={getFifaCode('Germany')} fallbackText={getFifaCode('Germany')} size="lg" shape="shield" />
              <Flag src={getFlagUrl('Bolivia')} code={getFifaCode('Bolivia')} fallbackText={getFifaCode('Bolivia')} size="lg" shape="circle" />
              <Flag src={getFlagUrl('Bolivia')} code={getFifaCode('Bolivia')} fallbackText={getFifaCode('Bolivia')} size="lg" shape="shield" />
              <Flag src={getFlagUrl('Brazil')} code={getFifaCode('Brazil')} fallbackText={getFifaCode('Brazil')} size="lg" shape="circle" />
              <Flag src={getFlagUrl('Brazil')} code={getFifaCode('Brazil')} fallbackText={getFifaCode('Brazil')} size="lg" shape="shield" />
            </div>
          </div>

          <div>
            <h3 style={{ fontSize: 'var(--font-size-sm)', color: 'var(--text-muted)', marginBottom: '0.75rem' }}>Estado de Error (Fallback sin ícono roto)</h3>
            <div style={{ display: 'flex', alignItems: 'center', flexWrap: 'wrap', gap: '1rem' }}>
              <Flag src={BROKEN_FLAG_URL} code="USA" fallbackText="USA" size="sm" />
              <Flag src={BROKEN_FLAG_URL} code="MEX" fallbackText="MEX" size="md" />
              <Flag src={BROKEN_FLAG_URL} code="CAN" fallbackText="CAN" size="lg" shape="shield" />
            </div>
          </div>

          <div>
            <h3 style={{ fontSize: 'var(--font-size-sm)', color: 'var(--text-muted)', marginBottom: '0.75rem' }}>Simulación de datos de API — getFlagUrl(event.strHomeTeam)</h3>
            <div style={{ display: 'inline-flex', alignItems: 'center', gap: '1rem', padding: '0.75rem 1.25rem', backgroundColor: 'var(--bg-surface)', border: '1px solid var(--border-color)', borderRadius: 'var(--radius-card)' }}>
              <Flag src={getFlagUrl('Bolivia')} code={getFifaCode('Bolivia')} fallbackText={getFifaCode('Bolivia')} size="lg" />
              <span style={{ fontFamily: 'var(--font-display)', fontSize: 'var(--font-size-xl)', color: 'var(--text-main)' }}>{getFifaCode('Bolivia')} 6 - 1 {getFifaCode('Argentina')}</span>
              <Flag src={getFlagUrl('Argentina')} code={getFifaCode('Argentina')} fallbackText={getFifaCode('Argentina')} size="lg" />
              <Badge variant="live">En Vivo</Badge>
            </div>
          </div>
        </section>

        <section style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
          <h2 style={{ fontFamily: 'var(--font-display)', fontSize: 'var(--font-size-xl)', color: 'var(--text-main)', borderBottom: '1px solid var(--border-color)', paddingBottom: '0.5rem' }}>
            Table Component (Genérico)
          </h2>

          <div>
            <h3 style={{ fontSize: 'var(--font-size-sm)', color: 'var(--text-muted)', marginBottom: '0.75rem' }}>Leaderboard de la Quiniela (con cell renderers para el Top 3)</h3>
            <Table columns={LEADERBOARD_COLUMNS} data={LEADERBOARD_DATA} />
          </div>

          <div>
            <h3 style={{ fontSize: 'var(--font-size-sm)', color: 'var(--text-muted)', marginBottom: '0.75rem' }}>Estado Vacío (emptyMessage)</h3>
            <Table
              columns={LEADERBOARD_COLUMNS}
              data={EMPTY_LEADERBOARD}
              emptyMessage="Aún no hay participantes en la quiniela"
            />
          </div>
        </section>

        <section style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
          <h2 style={{ fontFamily: 'var(--font-display)', fontSize: 'var(--font-size-xl)', color: 'var(--text-main)', borderBottom: '1px solid var(--border-color)', paddingBottom: '0.5rem' }}>
            Componente: Skeleton (Átomo)
          </h2>

          <div>
            <h3 style={{ fontSize: 'var(--font-size-sm)', color: 'var(--text-muted)', marginBottom: '0.75rem' }}>Variantes Geométricas (text / circle / rect)</h3>
            <div style={{ display: 'flex', alignItems: 'flex-start', flexWrap: 'wrap', gap: '2rem' }}>
              <div style={{ width: '200px' }}>
                <Skeleton variant="text" width="100%" />
                <Skeleton variant="text" width="80%" />
                <Skeleton variant="text" width="60%" />
              </div>
              <Skeleton variant="circle" width="56px" height="56px" />
              <Skeleton variant="rect" width="200px" height="72px" />
            </div>
          </div>

          <div>
            <h3 style={{ fontSize: 'var(--font-size-sm)', color: 'var(--text-muted)', marginBottom: '0.75rem' }}>Animaciones (shimmer / pulse / none)</h3>
            <div style={{ display: 'flex', alignItems: 'center', flexWrap: 'wrap', gap: '2rem' }}>
              <Skeleton animation="shimmer" width="180px" height="48px" />
              <Skeleton animation="pulse" width="180px" height="48px" />
              <Skeleton animation="none" width="180px" height="48px" />
            </div>
          </div>

          <div>
            <h3 style={{ fontSize: 'var(--font-size-sm)', color: 'var(--text-muted)', marginBottom: '0.75rem' }}>Uso en Contexto (Tarjeta de Partido en Carga)</h3>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem', width: '340px', padding: '1rem 1.25rem', backgroundColor: 'var(--bg-surface)', border: '1px solid var(--border-color)', borderRadius: 'var(--radius-card)' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
                <Skeleton variant="circle" width="40px" height="40px" />
                <div style={{ flex: 1 }}>
                  <Skeleton variant="text" width="70%" />
                  <Skeleton variant="text" width="40%" />
                </div>
                <Skeleton variant="circle" width="40px" height="40px" />
              </div>
              <Skeleton variant="rect" width="100%" height="36px" />
            </div>
          </div>
        </section>

        <section style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
          <h2 style={{ fontFamily: 'var(--font-display)', fontSize: 'var(--font-size-xl)', color: 'var(--text-main)', borderBottom: '1px solid var(--border-color)', paddingBottom: '0.5rem' }}>
            Componente: FormField (Molécula Decoplada - A11y & Zod)
          </h2>

          <div style={{ display: 'flex', gap: '1rem', alignItems: 'center', marginBottom: '0.5rem' }}>
            <Button
              variant="usa"
              onClick={() => setIsFormLoading((prev) => !prev)}
            >
              Alternar Estado de Carga (Skeletons)
            </Button>
            <span style={{ color: 'var(--text-muted)', fontSize: 'var(--font-size-sm)' }}>
              Estado actual: <strong>{isFormLoading ? 'CARGANDO' : 'LISTO'}</strong>
            </span>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))', gap: '2rem' }}>
            {/* Formulario Interactivo con Zod */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem', padding: '1.5rem', backgroundColor: 'var(--bg-surface)', border: '1px solid var(--border-color)', borderRadius: 'var(--radius-card)' }}>
              <h3 style={{ fontSize: 'var(--font-size-md)', color: 'var(--brand-gold)', marginBottom: '0.5rem', fontFamily: 'var(--font-display)', textTransform: 'uppercase' }}>
                Registro Participante (Validación Zod Real-Time)
              </h3>

              <FormField
                label="Usuario"
                error={formErrors.username}
                isLoading={isFormLoading}
              >
                <input
                  type="text"
                  placeholder="Ej. golazo10"
                  value={formData.username}
                  onChange={(e) => handleInputChange('username', e.target.value)}
                  style={{
                    backgroundColor: 'var(--bg-main)',
                    border: formErrors.username ? '1px solid var(--danger)' : '1px solid var(--border-color)',
                    borderRadius: 'var(--radius-md)',
                    color: 'var(--text-main)',
                    fontFamily: 'var(--font-body)',
                    fontSize: 'var(--font-size-md)',
                    padding: '0.75rem 1rem',
                    width: '100%',
                    boxSizing: 'border-box',
                    outline: 'none',
                    transition: 'var(--transition-fast)',
                  }}
                />
              </FormField>

              <FormField
                label="Correo Electrónico"
                error={formErrors.email}
                isLoading={isFormLoading}
              >
                <input
                  type="email"
                  placeholder="usuario@dominio.com"
                  value={formData.email}
                  onChange={(e) => handleInputChange('email', e.target.value)}
                  style={{
                    backgroundColor: 'var(--bg-main)',
                    border: formErrors.email ? '1px solid var(--danger)' : '1px solid var(--border-color)',
                    borderRadius: 'var(--radius-md)',
                    color: 'var(--text-main)',
                    fontFamily: 'var(--font-body)',
                    fontSize: 'var(--font-size-md)',
                    padding: '0.75rem 1rem',
                    width: '100%',
                    boxSizing: 'border-box',
                    outline: 'none',
                    transition: 'var(--transition-fast)',
                  }}
                />
              </FormField>

              <FormField
                label="Edad mínima para participar"
                error={formErrors.age}
                isLoading={isFormLoading}
              >
                <input
                  type="number"
                  placeholder="18"
                  value={formData.age}
                  onChange={(e) => handleInputChange('age', e.target.value)}
                  style={{
                    backgroundColor: 'var(--bg-main)',
                    border: formErrors.age ? '1px solid var(--danger)' : '1px solid var(--border-color)',
                    borderRadius: 'var(--radius-md)',
                    color: 'var(--text-main)',
                    fontFamily: 'var(--font-body)',
                    fontSize: 'var(--font-size-md)',
                    padding: '0.75rem 1rem',
                    width: '100%',
                    boxSizing: 'border-box',
                    outline: 'none',
                    transition: 'var(--transition-fast)',
                  }}
                />
              </FormField>
            </div>

            {/* Demostración con otros controles (Textarea, Select) */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem', padding: '1.5rem', backgroundColor: 'var(--bg-surface)', border: '1px solid var(--border-color)', borderRadius: 'var(--radius-card)' }}>
              <h3 style={{ fontSize: 'var(--font-size-md)', color: 'var(--brand-gold)', marginBottom: '0.5rem', fontFamily: 'var(--font-display)', textTransform: 'uppercase' }}>
                Compatibilidad con otros controles (Inversión de Control)
              </h3>

              <FormField
                label="Comentarios del Partido"
                error={undefined}
                isLoading={isFormLoading}
              >
                <textarea
                  placeholder="Opina sobre el rendimiento de las selecciones..."
                  rows={3}
                  style={{
                    backgroundColor: 'var(--bg-main)',
                    border: '1px solid var(--border-color)',
                    borderRadius: 'var(--radius-md)',
                    color: 'var(--text-main)',
                    fontFamily: 'var(--font-body)',
                    fontSize: 'var(--font-size-md)',
                    padding: '0.75rem 1rem',
                    width: '100%',
                    boxSizing: 'border-box',
                    outline: 'none',
                    resize: 'none',
                    transition: 'var(--transition-fast)',
                  }}
                />
              </FormField>

              <FormField
                label="Selecciona tu Grupo Favorito"
                error={undefined}
                isLoading={isFormLoading}
              >
                <select
                  defaultValue=""
                  style={{
                    backgroundColor: 'var(--bg-main)',
                    border: '1px solid var(--border-color)',
                    borderRadius: 'var(--radius-md)',
                    color: 'var(--text-main)',
                    fontFamily: 'var(--font-body)',
                    fontSize: 'var(--font-size-md)',
                    padding: '0.75rem 1rem',
                    width: '100%',
                    boxSizing: 'border-box',
                    outline: 'none',
                    transition: 'var(--transition-fast)',
                  }}
                >
                  <option value="" disabled>Selecciona un grupo...</option>
                  <option value="a">Grupo A</option>
                  <option value="b">Grupo B</option>
                  <option value="c">Grupo C</option>
                </select>
              </FormField>
            </div>

            {/* Demostración de A11y Inspección */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem', padding: '1.5rem', backgroundColor: 'var(--bg-surface)', border: '1px solid var(--border-color)', borderRadius: 'var(--radius-card)', justifyContent: 'center' }}>
              <h3 style={{ fontSize: 'var(--font-size-md)', color: 'var(--text-main)', fontFamily: 'var(--font-display)', textTransform: 'uppercase', marginBottom: '0.25rem' }}>
                Auditoría de Accesibilidad (WCAG)
              </h3>
              <p style={{ color: 'var(--text-muted)', fontSize: 'var(--font-size-sm)', lineHeight: '1.5' }}>
                Al inspeccionar los elementos de arriba, notarás:
              </p>
              <ul style={{ color: 'var(--text-muted)', fontSize: 'var(--font-size-sm)', paddingLeft: '1.2rem', display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                <li>La etiqueta <code style={{ color: 'var(--brand-gold)' }}>&lt;label&gt;</code> vinculada vía <code style={{ color: 'var(--brand-gold)' }}>htmlFor</code> al <code style={{ color: 'var(--brand-gold)' }}>id</code> único del input.</li>
                <li>Si hay error, el input recibe <code style={{ color: 'var(--accent-can)' }}>aria-invalid="true"</code> y <code style={{ color: 'var(--accent-can)' }}>aria-describedby="[id]-error"</code>.</li>
                <li>El contenedor de error tiene el rol <code style={{ color: 'var(--brand-gold)' }}>role="alert"</code> y <code style={{ color: 'var(--brand-gold)' }}>aria-live="polite"</code>.</li>
                <li>En estado de carga, el input se sustituye por un <code style={{ color: 'var(--brand-gold)' }}>Skeleton</code> de 40px preservando las dimensiones para evitar CLS.</li>
              </ul>
            </div>
          </div>
        </section>

        <section style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
          <h2 style={{ fontFamily: 'var(--font-display)', fontSize: 'var(--font-size-xl)', color: 'var(--text-main)', borderBottom: '1px solid var(--border-color)', paddingBottom: '0.5rem' }}>
            Componente: MatchRow (Molécula de Partido - Rendimiento & A11y)
          </h2>

          <div style={{ display: 'flex', gap: '1rem', alignItems: 'center', marginBottom: '0.5rem', flexWrap: 'wrap' }}>
            <Button
              variant="mex"
              onClick={() => setIsMatchLoading((prev) => !prev)}
            >
              Alternar Carga de Partidos (Skeleton)
            </Button>
            <span style={{ color: 'var(--text-muted)', fontSize: 'var(--font-size-sm)' }}>
              Estado: <strong>{isMatchLoading ? 'CARGANDO' : 'COMPLETADO'}</strong>
            </span>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr', gap: '1.5rem', maxWidth: '800px' }}>
            {/* 1. Partido Programado (Modificable) */}
            <div>
              <h3 style={{ fontSize: 'var(--font-size-sm)', color: 'var(--text-muted)', marginBottom: '0.5rem' }}>
                Partido Programado (Editable - Guarda al perder foco onBlur)
              </h3>
              <MatchRow
                matchData={matches[0]}
                initialHomeScore={matchPredictions.m1.home}
                initialAwayScore={matchPredictions.m1.away}
                isLoading={isMatchLoading}
                onPredictionChange={handlePredictionChange}
              />
            </div>

            {/* 2. Partido En Vivo */}
            <div>
              <h3 style={{ fontSize: 'var(--font-size-sm)', color: 'var(--text-muted)', marginBottom: '0.5rem' }}>
                Partido En Vivo (Editable - Demostración con marcador por defecto)
              </h3>
              <MatchRow
                matchData={matches[1]}
                initialHomeScore={matchPredictions.m2.home}
                initialAwayScore={matchPredictions.m2.away}
                isLoading={isMatchLoading}
                onPredictionChange={handlePredictionChange}
              />
            </div>

            {/* 3. Partido Finalizado / Bloqueado */}
            <div>
              <h3 style={{ fontSize: 'var(--font-size-sm)', color: 'var(--text-muted)', marginBottom: '0.5rem' }}>
                Partido Bloqueado o Finalizado (isLocked = true - Semántica span sin inputs)
              </h3>
              <MatchRow
                matchData={matches[2]}
                initialHomeScore={matchPredictions.m3.home}
                initialAwayScore={matchPredictions.m3.away}
                isLocked={true}
                isLoading={isMatchLoading}
                onPredictionChange={handlePredictionChange}
              />
            </div>
          </div>

          {/* Log de Predicciones */}
          <div style={{ maxWidth: '800px', padding: '1rem', backgroundColor: 'var(--bg-surface)', border: '1px solid var(--border-color)', borderRadius: 'var(--radius-card)', marginTop: '0.5rem' }}>
            <h3 style={{ fontSize: 'var(--font-size-sm)', color: 'var(--brand-gold)', marginBottom: '0.5rem', fontFamily: 'var(--font-display)', textTransform: 'uppercase' }}>
              Log de Transacciones (Prediction Pipeline)
            </h3>
            {matchLogs.length === 0 ? (
              <p style={{ color: 'var(--text-muted)', fontSize: 'var(--font-size-xs)', fontStyle: 'italic' }}>
                Modifica los goles arriba y haz click afuera para disparar el evento onBlur...
              </p>
            ) : (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '0.25rem' }}>
                {matchLogs.map((log) => (
                  <code key={log} style={{ color: 'var(--text-main)', fontSize: 'var(--font-size-xs)', display: 'block' }}>
                    {log}
                  </code>
                ))}
              </div>
            )}
          </div>
        </section>

        <section style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
          <h2 style={{ fontFamily: 'var(--font-display)', fontSize: 'var(--font-size-xl)', color: 'var(--text-main)', borderBottom: '1px solid var(--border-color)', paddingBottom: '0.5rem' }}>
            Componente: TeamDisplay (Molécula)
          </h2>

          <div style={{ display: 'flex', gap: '1rem', alignItems: 'center', marginBottom: '0.5rem', flexWrap: 'wrap' }}>
            <Button
              variant="gold"
              onClick={() => setIsTeamLoading((prev) => !prev)}
            >
              Alternar Estado de Carga (Skeletons)
            </Button>
            <span style={{ color: 'var(--text-muted)', fontSize: 'var(--font-size-sm)' }}>
              Estado: <strong>{isTeamLoading ? 'CARGANDO' : 'LISTO'}</strong>
            </span>
          </div>

          <div>
            <h3 style={{ fontSize: 'var(--font-size-sm)', color: 'var(--text-muted)', marginBottom: '0.75rem' }}>Alineaciones (left / right) — reduce la ventana a menos de 480px para ver el shortName</h3>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem', maxWidth: '400px' }}>
              <TeamDisplay
                name="Estados Unidos"
                shortName={getFifaCode('United States')}
                flagUrl={getFlagUrl('United States')}
                alignment="left"
                isLoading={isTeamLoading}
              />
              <TeamDisplay
                name="México"
                shortName={getFifaCode('Mexico')}
                flagUrl={getFlagUrl('Mexico')}
                alignment="right"
                isLoading={isTeamLoading}
              />
            </div>
          </div>

          <div>
            <h3 style={{ fontSize: 'var(--font-size-sm)', color: 'var(--text-muted)', marginBottom: '0.75rem' }}>Uso en Contexto (Fila de Partido: local a la izquierda, visitante a la derecha)</h3>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: '1rem', maxWidth: '500px', padding: '0.75rem 1.25rem', backgroundColor: 'var(--bg-surface)', border: '1px solid var(--border-color)', borderRadius: 'var(--radius-card)' }}>
              <TeamDisplay
                name="Canadá"
                shortName={getFifaCode('Canada')}
                flagUrl={getFlagUrl('Canada')}
                alignment="left"
                isLoading={isTeamLoading}
                style={{ flex: 1, minWidth: 0 }}
              />
              <span style={{ fontFamily: 'var(--font-display)', fontSize: 'var(--font-size-xl)', color: 'var(--text-main)', flexShrink: 0 }}>
                2 - 2
              </span>
              <TeamDisplay
                name="Brasil"
                shortName={getFifaCode('Brazil')}
                flagUrl={getFlagUrl('Brazil')}
                alignment="right"
                isLoading={isTeamLoading}
                style={{ flex: 1, minWidth: 0 }}
              />
            </div>
          </div>

          <div>
            <h3 style={{ fontSize: 'var(--font-size-sm)', color: 'var(--text-muted)', marginBottom: '0.75rem' }}>Truncado con Ellipsis (contenedor estrecho de 140px)</h3>
            <div style={{ width: '140px', padding: '0.5rem 0.75rem', backgroundColor: 'var(--bg-surface)', border: '1px solid var(--border-color)', borderRadius: 'var(--radius-card)' }}>
              <TeamDisplay
                name="Estados Unidos de América"
                shortName={getFifaCode('United States')}
                flagUrl={getFlagUrl('United States')}
                alignment="left"
                isLoading={isTeamLoading}
              />
            </div>
          </div>
        </section>

        <section style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
          <h2 style={{ fontFamily: 'var(--font-display)', fontSize: 'var(--font-size-xl)', color: 'var(--text-main)', borderBottom: '1px solid var(--border-color)', paddingBottom: '0.5rem' }}>
            Componente: ScoreInput (Átomo)
          </h2>

          <div style={{ display: 'flex', gap: '1rem', alignItems: 'center', marginBottom: '0.5rem', flexWrap: 'wrap' }}>
            <Button
              variant="usa"
              onClick={() => setIsScoreLoading((prev) => !prev)}
            >
              Alternar Estado de Carga (Skeletons)
            </Button>
            <span style={{ color: 'var(--text-muted)', fontSize: 'var(--font-size-sm)' }}>
              Estado: <strong>{isScoreLoading ? 'CARGANDO' : 'LISTO'}</strong>
            </span>
          </div>

          <div>
            <h3 style={{ fontSize: 'var(--font-size-sm)', color: 'var(--text-muted)', marginBottom: '0.75rem' }}>
              Predicción Editable (flush en onBlur / Enter — intenta escribir "-", "+", ".", "," o "e")
            </h3>
            <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', flexWrap: 'wrap' }}>
              <div style={{ display: 'inline-flex', alignItems: 'center', gap: '0.75rem', padding: '0.75rem 1.25rem', backgroundColor: 'var(--bg-surface)', border: '1px solid var(--border-color)', borderRadius: 'var(--radius-card)' }}>
                <TeamDisplay
                  name="México"
                  shortName={getFifaCode('Mexico')}
                  flagUrl={getFlagUrl('Mexico')}
                  alignment="left"
                  isLoading={isScoreLoading}
                />
                <ScoreInput
                  value={scoreHome}
                  onChange={setScoreHome}
                  isLoading={isScoreLoading}
                  ariaLabel="Goles de México"
                />
                <span style={{ color: 'var(--text-muted)', fontFamily: 'var(--font-display)' }}>vs</span>
                <ScoreInput
                  value={scoreAway}
                  onChange={setScoreAway}
                  isLoading={isScoreLoading}
                  ariaLabel="Goles de Estados Unidos"
                />
                <TeamDisplay
                  name="Estados Unidos"
                  shortName={getFifaCode('United States')}
                  flagUrl={getFlagUrl('United States')}
                  alignment="right"
                  isLoading={isScoreLoading}
                />
              </div>
              <span style={{ color: 'var(--text-muted)', fontSize: 'var(--font-size-sm)' }}>
                Estado del padre: <strong style={{ color: 'var(--brand-gold)' }}>{scoreHome} - {scoreAway}</strong>
              </span>
            </div>
          </div>

          <div>
            <h3 style={{ fontSize: 'var(--font-size-sm)', color: 'var(--text-muted)', marginBottom: '0.75rem' }}>
              Estado Bloqueado (isLocked — span estático sin input)
            </h3>
            <div style={{ display: 'inline-flex', alignItems: 'center', gap: '0.75rem', padding: '0.75rem 1.25rem', backgroundColor: 'var(--bg-surface)', border: '1px solid var(--border-color)', borderRadius: 'var(--radius-card)' }}>
              <ScoreInput value={3} isLocked ariaLabel="Goles de Canadá (partido finalizado)" />
              <span style={{ color: 'var(--text-muted)', fontFamily: 'var(--font-display)' }}>vs</span>
              <ScoreInput value={0} isLocked ariaLabel="Goles de Brasil (partido finalizado)" />
              <Badge variant="finished">Finalizado</Badge>
            </div>
          </div>
        </section>

        <section style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
          <h2 style={{ fontFamily: 'var(--font-display)', fontSize: 'var(--font-size-xl)', color: 'var(--text-main)', borderBottom: '1px solid var(--border-color)', paddingBottom: '0.5rem' }}>
            Componente: UserRankRow (Molécula)
          </h2>

          <div style={{ display: 'flex', gap: '1rem', alignItems: 'center', marginBottom: '0.5rem', flexWrap: 'wrap' }}>
            <Button
              variant="can"
              onClick={() => setIsRankLoading((prev) => !prev)}
            >
              Alternar Estado de Carga (Skeletons)
            </Button>
            <span style={{ color: 'var(--text-muted)', fontSize: 'var(--font-size-sm)' }}>
              Estado: <strong>{isRankLoading ? 'CARGANDO' : 'LISTO'}</strong>
            </span>
          </div>

          <div>
            <h3 style={{ fontSize: 'var(--font-size-sm)', color: 'var(--text-muted)', marginBottom: '0.75rem' }}>
              Ranking de la Quiniela — fila 3 con aria-current (usuario logueado) y username largo (ellipsis)
            </h3>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem', maxWidth: '640px' }}>
              {RANKING_DATA.map((entry) => (
                <UserRankRow
                  key={entry.user.id}
                  rank={entry.rank}
                  userSnapshot={entry.user}
                  rankDelta={entry.delta}
                  isCurrentUser={entry.isCurrentUser}
                  isLoading={isRankLoading}
                />
              ))}
            </div>
          </div>
        </section>

        <section style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
          <h2 style={{ fontFamily: 'var(--font-display)', fontSize: 'var(--font-size-xl)', color: 'var(--text-main)', borderBottom: '1px solid var(--border-color)', paddingBottom: '0.5rem' }}>
            Componente: CountdownTimer (Átomo)
          </h2>

          <div style={{ display: 'flex', gap: '1rem', alignItems: 'center', marginBottom: '0.5rem', flexWrap: 'wrap' }}>
            <Button
              variant="mex"
              onClick={() => setIsCountdownLoading((prev) => !prev)}
            >
              Alternar Estado de Carga (Skeletons)
            </Button>
            <span style={{ color: 'var(--text-muted)', fontSize: 'var(--font-size-sm)' }}>
              Estado: <strong>{isCountdownLoading ? 'CARGANDO' : 'LISTO'}</strong>
            </span>
          </div>

          <div>
            <h3 style={{ fontSize: 'var(--font-size-sm)', color: 'var(--text-muted)', marginBottom: '0.75rem' }}>Formatos por Rango de Tiempo (días / horas / crítico &lt; 15 min)</h3>
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: '1rem' }}>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem', padding: '1rem 1.25rem', backgroundColor: 'var(--bg-surface)', border: '1px solid var(--border-color)', borderRadius: 'var(--radius-card)' }}>
                <span style={{ color: 'var(--text-muted)', fontSize: 'var(--font-size-xs)', textTransform: 'uppercase' }}>Inauguración del Mundial</span>
                <CountdownTimer targetDate={countdownTargets.far} isLoading={isCountdownLoading} style={{ fontSize: 'var(--font-size-xl)' }} />
              </div>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem', padding: '1rem 1.25rem', backgroundColor: 'var(--bg-surface)', border: '1px solid var(--border-color)', borderRadius: 'var(--radius-card)' }}>
                <span style={{ color: 'var(--text-muted)', fontSize: 'var(--font-size-xs)', textTransform: 'uppercase' }}>Próximo Partido</span>
                <CountdownTimer targetDate={countdownTargets.hours} isLoading={isCountdownLoading} style={{ fontSize: 'var(--font-size-xl)' }} />
              </div>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem', padding: '1rem 1.25rem', backgroundColor: 'var(--bg-surface)', border: '1px solid var(--border-color)', borderRadius: 'var(--radius-card)' }}>
                <span style={{ color: 'var(--text-muted)', fontSize: 'var(--font-size-xs)', textTransform: 'uppercase' }}>Cierre de Predicciones (Crítico)</span>
                <CountdownTimer targetDate={countdownTargets.critical} isLoading={isCountdownLoading} style={{ fontSize: 'var(--font-size-xl)' }} />
              </div>
            </div>
          </div>

          <div>
            <h3 style={{ fontSize: 'var(--font-size-sm)', color: 'var(--text-muted)', marginBottom: '0.75rem' }}>Expiración Única (onExpire se dispara exactamente una vez al llegar a 00:00)</h3>
            <div style={{ display: 'inline-flex', alignItems: 'center', gap: '1rem', padding: '0.75rem 1.25rem', backgroundColor: 'var(--bg-surface)', border: '1px solid var(--border-color)', borderRadius: 'var(--radius-card)' }}>
              <CountdownTimer
                targetDate={countdownTargets.imminent}
                isLoading={isCountdownLoading}
                onExpire={() => setExpireCount((prev) => prev + 1)}
                style={{ fontSize: 'var(--font-size-xl)' }}
              />
              <span style={{ color: 'var(--text-muted)', fontSize: 'var(--font-size-sm)' }}>
                Callback onExpire ejecutado: <strong style={{ color: expireCount > 0 ? 'var(--brand-gold)' : 'var(--text-main)' }}>{expireCount}</strong> {expireCount === 1 ? 'vez' : 'veces'}
              </span>
              {expireCount > 0 && <Badge variant="finished">Expirado</Badge>}
            </div>
          </div>
        </section>

        <section style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
          <h2 style={{ fontFamily: 'var(--font-display)', fontSize: 'var(--font-size-xl)', color: 'var(--text-main)', borderBottom: '1px solid var(--border-color)', paddingBottom: '0.5rem' }}>
            Componente: MatchCard (Molécula de Tarjeta de Partido - Zod & Strategy)
          </h2>

          <div style={{ display: 'flex', gap: '1rem', alignItems: 'center', marginBottom: '0.5rem', flexWrap: 'wrap' }}>
            <Button
              variant="usa"
              onClick={() => setIsCardLoading((prev) => !prev)}
            >
              Alternar Carga de Tarjetas (Skeleton)
            </Button>
            <span style={{ color: 'var(--text-muted)', fontSize: 'var(--font-size-sm)' }}>
              Estado: <strong>{isCardLoading ? 'CARGANDO' : 'LISTO'}</strong>
            </span>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(320px, 1fr))', gap: '2rem' }}>
            {/* 1. Partido UPCOMING */}
            <div>
              <h3 style={{ fontSize: 'var(--font-size-sm)', color: 'var(--text-muted)', marginBottom: '0.5rem' }}>
                Partido Programado (Editable - Validación Zod & Countdown)
              </h3>
              <MatchCard
                match={cardMatches[0]}
                initialPrediction={cardPredictions.mc1}
                onSavePrediction={handleSaveCardPrediction}
                isLoading={isCardLoading}
              />
            </div>

            {/* 2. Partido LIVE */}
            <div>
              <h3 style={{ fontSize: 'var(--font-size-sm)', color: 'var(--text-muted)', marginBottom: '0.5rem' }}>
                Partido En Vivo (Inputs Bloqueados & Marcador Real)
              </h3>
              <MatchCard
                match={cardMatches[1]}
                initialPrediction={cardPredictions.mc2}
                isLoading={isCardLoading}
              />
            </div>

            {/* 3. Partido FINISHED */}
            <div>
              <h3 style={{ fontSize: 'var(--font-size-sm)', color: 'var(--text-muted)', marginBottom: '0.5rem' }}>
                Partido Finalizado (Predicción Histórica Compilada)
              </h3>
              <MatchCard
                match={cardMatches[2]}
                initialPrediction={cardPredictions.mc3}
                isLoading={isCardLoading}
              />
            </div>
          </div>

          {/* Log de Predicciones */}
          <div style={{ maxWidth: '800px', padding: '1rem', backgroundColor: 'var(--bg-surface)', border: '1px solid var(--border-color)', borderRadius: 'var(--radius-card)', marginTop: '0.5rem' }}>
            <h3 style={{ fontSize: 'var(--font-size-sm)', color: 'var(--brand-gold)', marginBottom: '0.5rem', fontFamily: 'var(--font-display)', textTransform: 'uppercase' }}>
              Log de Transacciones (Prediction Card Pipeline)
            </h3>
            {cardLogs.length === 0 ? (
              <p style={{ color: 'var(--text-muted)', fontSize: 'var(--font-size-xs)', fontStyle: 'italic' }}>
                Introduce una predicción válida (0-99) en el primer partido y haz click en "Guardar" para registrar la transacción...
              </p>
            ) : (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '0.25rem' }}>
                {cardLogs.map((log) => (
                  <code key={log} style={{ color: 'var(--text-main)', fontSize: 'var(--font-size-xs)', display: 'block' }}>
                    {log}
                  </code>
                ))}
              </div>
            )}
          </div>
        </section>

        <section style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
          <h2 style={{ fontFamily: 'var(--font-display)', fontSize: 'var(--font-size-xl)', color: 'var(--text-main)', borderBottom: '1px solid var(--border-color)', paddingBottom: '0.5rem' }}>
            Componente: LeaderboardTable (Organismo)
          </h2>

          <div style={{ display: 'flex', gap: '1rem', alignItems: 'center', marginBottom: '0.5rem', flexWrap: 'wrap' }}>
            <Button
              variant="gold"
              onClick={() => setIsLeaderboardLoading((prev) => !prev)}
            >
              Alternar Estado de Carga (Skeletons)
            </Button>
            <span style={{ color: 'var(--text-muted)', fontSize: 'var(--font-size-sm)' }}>
              Estado: <strong>{isLeaderboardLoading ? 'CARGANDO' : 'LISTO'}</strong>
            </span>
          </div>

          <div>
            <h3 style={{ fontSize: 'var(--font-size-sm)', color: 'var(--text-muted)', marginBottom: '0.75rem' }}>
              Clasificación completa — podio con oro/plata/bronce, usuario actual resaltado (mapleLeafFan) y username largo con ellipsis
            </h3>
            <div style={{ maxWidth: '760px' }}>
              <LeaderboardTable
                data={LEADERBOARD_TABLE_DATA}
                currentUserId="u3"
                isLoading={isLeaderboardLoading}
              />
            </div>
          </div>

          <div>
            <h3 style={{ fontSize: 'var(--font-size-sm)', color: 'var(--text-muted)', marginBottom: '0.75rem' }}>
              Estado Vacío (sin registros y sin carga)
            </h3>
            <div style={{ maxWidth: '760px' }}>
              <LeaderboardTable data={EMPTY_LEADERBOARD_TABLE} />
            </div>
          </div>
        </section>

        <section style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
          <h2 style={{ fontFamily: 'var(--font-display)', fontSize: 'var(--font-size-xl)', color: 'var(--text-main)', borderBottom: '1px solid var(--border-color)', paddingBottom: '0.5rem' }}>
            Componente: GroupSelectorCard (Molécula)
          </h2>

          <div style={{ display: 'flex', gap: '1rem', alignItems: 'center', marginBottom: '0.5rem', flexWrap: 'wrap' }}>
            <Button
              variant="usa"
              onClick={() => setIsGroupLoading((prev) => !prev)}
            >
              Alternar Estado de Carga (Skeletons)
            </Button>
            <span style={{ color: 'var(--text-muted)', fontSize: 'var(--font-size-sm)' }}>
              Estado: <strong>{isGroupLoading ? 'CARGANDO' : 'LISTO'}</strong>
            </span>
          </div>

          <div>
            <h3 style={{ fontSize: 'var(--font-size-sm)', color: 'var(--text-muted)', marginBottom: '0.75rem' }}>
              Selector Interactivo (radiogroup WAI-ARIA — haz Tab hasta el grupo activo y navega con las flechas del teclado)
            </h3>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem', maxWidth: '640px' }}>
              <GroupSelectorCard
                groups={GROUP_SELECTOR_DATA}
                activeGroupId={activeGroupId}
                onGroupChange={setActiveGroupId}
                isLoading={isGroupLoading}
              />
              <span style={{ color: 'var(--text-muted)', fontSize: 'var(--font-size-sm)' }}>
                Grupo activo en el estado del padre:{' '}
                <strong style={{ color: 'var(--brand-gold)' }}>
                  {GROUP_SELECTOR_DATA.find((group) => group.id === activeGroupId)?.name ?? '—'}
                </strong>
              </span>
            </div>
          </div>

          <div>
            <h3 style={{ fontSize: 'var(--font-size-sm)', color: 'var(--text-muted)', marginBottom: '0.75rem' }}>
              Estado Vacío (usuario sin grupos)
            </h3>
            <div style={{ maxWidth: '640px' }}>
              <GroupSelectorCard
                groups={EMPTY_GROUPS}
                activeGroupId=""
                onGroupChange={setActiveGroupId}
              />
            </div>
          </div>
        </section>

        <section style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
          <h2 style={{ fontFamily: 'var(--font-display)', fontSize: 'var(--font-size-xl)', color: 'var(--text-main)', borderBottom: '1px solid var(--border-color)', paddingBottom: '0.5rem' }}>
            Componente: NavbarSuite (Organismo)
          </h2>

          <div style={{ display: 'flex', gap: '1rem', alignItems: 'center', marginBottom: '0.5rem', flexWrap: 'wrap' }}>
            <Button
              variant="secondary"
              onClick={() => setNavUser(null)}
            >
              Simular Invitado (User: null)
            </Button>
            <Button
              variant="usa"
              onClick={() => setNavUser({ id: 'u1', username: 'quinielero_pro', role: 'USER' })}
            >
              Simular Usuario (Role: USER)
            </Button>
            <Button
              variant="gold"
              onClick={() => setNavUser({ id: 'u2', username: 'admin_kickoff', role: 'ADMIN' })}
            >
              Simular Administrador (Role: ADMIN)
            </Button>
            <Button
              variant="mex"
              onClick={() => setNavTenant((prev) => (prev ? null : { id: 't1', name: 'Liga Furia 2026' }))}
            >
              {navTenant ? 'Remover Organización' : 'Asignar Organización'}
            </Button>
          </div>

          <div style={{ border: '1px dashed rgba(255, 255, 255, 0.1)', padding: '1rem', borderRadius: 'var(--radius-md)', backgroundColor: '#05070C' }}>
            <h3 style={{ fontSize: 'var(--font-size-sm)', color: 'var(--text-muted)', marginBottom: '0.75rem' }}>
              Previsualización del Navbar (Estado de Simulación Activa)
            </h3>
            <NavbarSuite
              user={navUser}
              activeTenant={navTenant}
              currentRoute={navRoute}
              onLogout={handleNavLogout}
              onNavigate={handleNavNavigate}
            />
          </div>

          <div>
            <h3 style={{ fontSize: 'var(--font-size-sm)', color: 'var(--text-muted)', marginBottom: '0.5rem' }}>
              Registro de Transacciones de Navegación / Autenticación:
            </h3>
            <div style={{ padding: '0.75rem', borderRadius: 'var(--radius-sm)', backgroundColor: 'var(--bg-main)', border: '1px solid var(--border-color)', minHeight: '60px' }}>
              {navLogs.length === 0 ? (
                <p style={{ color: 'var(--text-muted)', fontSize: 'var(--font-size-xs)', fontStyle: 'italic', margin: 0 }}>
                  Interactúa con el Navbar (cambia de enlaces o abre el dropdown y haz click en "Cerrar sesión") para ver los logs...
                </p>
              ) : (
                <div style={{ display: 'flex', flexDirection: 'column', gap: '0.25rem' }}>
                  {navLogs.map((log) => (
                    <code key={log} style={{ color: 'var(--text-main)', fontSize: 'var(--font-size-xs)', display: 'block' }}>
                      {log}
                    </code>
                  ))}
                </div>
              )}
            </div>
          </div>
        </section>

        <section style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
          <h2 style={{ fontFamily: 'var(--font-display)', fontSize: 'var(--font-size-xl)', color: 'var(--text-main)', borderBottom: '1px solid var(--border-color)', paddingBottom: '0.5rem' }}>
            Componente: PredictionSummary (Molécula)
          </h2>

          <div style={{ display: 'flex', gap: '1rem', alignItems: 'center', marginBottom: '0.5rem', flexWrap: 'wrap' }}>
            <Button
              variant="mex"
              onClick={() => setIsSummaryLoading((prev) => !prev)}
            >
              Alternar Estado de Carga (Skeletons)
            </Button>
            <span style={{ color: 'var(--text-muted)', fontSize: 'var(--font-size-sm)' }}>
              Estado: <strong>{isSummaryLoading ? 'CARGANDO' : 'LISTO'}</strong>
            </span>
          </div>

          <div>
            <h3 style={{ fontSize: 'var(--font-size-sm)', color: 'var(--text-muted)', marginBottom: '0.75rem' }}>
              Resumen de Rendimiento (2 columnas en móvil, 4 en escritorio — Plenos destacado en verde, Efectividad tabular)
            </h3>
            <div style={{ maxWidth: '760px' }}>
              <PredictionSummary stats={PREDICTION_STATS} isLoading={isSummaryLoading} />
            </div>
          </div>

          <div>
            <h3 style={{ fontSize: 'var(--font-size-sm)', color: 'var(--text-muted)', marginBottom: '0.75rem' }}>
              Sin Datos (stats = null — guiones sin romper la grilla)
            </h3>
            <div style={{ maxWidth: '760px' }}>
              <PredictionSummary stats={null} />
            </div>
          </div>
        </section>
      </main>
    </div>
  );
};
