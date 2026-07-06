interface TeamCodes {
  readonly iso2: string;
  readonly fifa: string;
}

const TEAM_MAP: Readonly<Record<string, TeamCodes>> = {
  // ── Grupo A ──
  'united states': { iso2: 'us', fifa: 'USA' },
  'usa': { iso2: 'us', fifa: 'USA' },
  'mexico': { iso2: 'mx', fifa: 'MEX' },
  'canada': { iso2: 'ca', fifa: 'CAN' },

  // ── Sudamérica ──
  'argentina': { iso2: 'ar', fifa: 'ARG' },
  'brazil': { iso2: 'br', fifa: 'BRA' },
  'uruguay': { iso2: 'uy', fifa: 'URU' },
  'colombia': { iso2: 'co', fifa: 'COL' },
  'ecuador': { iso2: 'ec', fifa: 'ECU' },
  'paraguay': { iso2: 'py', fifa: 'PAR' },
  'chile': { iso2: 'cl', fifa: 'CHI' },
  'peru': { iso2: 'pe', fifa: 'PER' },
  'bolivia': { iso2: 'bo', fifa: 'BOL' },
  'venezuela': { iso2: 've', fifa: 'VEN' },

  // ── Europa ──
  'germany': { iso2: 'de', fifa: 'GER' },
  'france': { iso2: 'fr', fifa: 'FRA' },
  'spain': { iso2: 'es', fifa: 'ESP' },
  'england': { iso2: 'gb-eng', fifa: 'ENG' },
  'portugal': { iso2: 'pt', fifa: 'POR' },
  'netherlands': { iso2: 'nl', fifa: 'NED' },
  'belgium': { iso2: 'be', fifa: 'BEL' },
  'croatia': { iso2: 'hr', fifa: 'CRO' },
  'denmark': { iso2: 'dk', fifa: 'DEN' },
  'switzerland': { iso2: 'ch', fifa: 'SUI' },
  'austria': { iso2: 'at', fifa: 'AUT' },
  'serbia': { iso2: 'rs', fifa: 'SRB' },
  'poland': { iso2: 'pl', fifa: 'POL' },
  'ukraine': { iso2: 'ua', fifa: 'UKR' },
  'turkey': { iso2: 'tr', fifa: 'TUR' },
  'wales': { iso2: 'gb-wls', fifa: 'WAL' },
  'scotland': { iso2: 'gb-sct', fifa: 'SCO' },
  'italy': { iso2: 'it', fifa: 'ITA' },
  'slovenia': { iso2: 'si', fifa: 'SVN' },
  'albania': { iso2: 'al', fifa: 'ALB' },

  // ── África ──
  'morocco': { iso2: 'ma', fifa: 'MAR' },
  'senegal': { iso2: 'sn', fifa: 'SEN' },
  'nigeria': { iso2: 'ng', fifa: 'NGA' },
  'cameroon': { iso2: 'cm', fifa: 'CMR' },
  'egypt': { iso2: 'eg', fifa: 'EGY' },
  'south africa': { iso2: 'za', fifa: 'RSA' },
  'tunisia': { iso2: 'tn', fifa: 'TUN' },
  'ivory coast': { iso2: 'ci', fifa: 'CIV' },
  "cote d'ivoire": { iso2: 'ci', fifa: 'CIV' },
  'algeria': { iso2: 'dz', fifa: 'ALG' },
  'cabo verde': { iso2: 'cv', fifa: 'CPV' },
  'burkina faso': { iso2: 'bf', fifa: 'BFA' },
  'mauritania': { iso2: 'mr', fifa: 'MTN' },

  // ── Asia / Oceanía ──
  'japan': { iso2: 'jp', fifa: 'JPN' },
  'south korea': { iso2: 'kr', fifa: 'KOR' },
  'korea republic': { iso2: 'kr', fifa: 'KOR' },
  'australia': { iso2: 'au', fifa: 'AUS' },
  'iran': { iso2: 'ir', fifa: 'IRN' },
  'saudi arabia': { iso2: 'sa', fifa: 'KSA' },
  'qatar': { iso2: 'qa', fifa: 'QAT' },
  'indonesia': { iso2: 'id', fifa: 'IDN' },
  'uzbekistan': { iso2: 'uz', fifa: 'UZB' },
  'iraq': { iso2: 'iq', fifa: 'IRQ' },
  'china pr': { iso2: 'cn', fifa: 'CHN' },
  'china': { iso2: 'cn', fifa: 'CHN' },
  'new zealand': { iso2: 'nz', fifa: 'NZL' },
  'israel': { iso2: 'il', fifa: 'ISR' },

  // ── CONCACAF / Caribe ──
  'costa rica': { iso2: 'cr', fifa: 'CRC' },
  'honduras': { iso2: 'hn', fifa: 'HON' },
  'panama': { iso2: 'pa', fifa: 'PAN' },
  'jamaica': { iso2: 'jm', fifa: 'JAM' },
  'trinidad and tobago': { iso2: 'tt', fifa: 'TRI' },
};

const UNKNOWN_CODES: TeamCodes = { iso2: '', fifa: '???' };

const FLAG_CDN_BASE = 'https://flagcdn.com/w160';

export function getTeamCodes(teamName: string): TeamCodes {
  const key = teamName.trim().toLowerCase();
  return TEAM_MAP[key] ?? UNKNOWN_CODES;
}

export function getFifaCode(teamName: string): string {
  return getTeamCodes(teamName).fifa;
}

export function getIso2Code(teamName: string): string {
  return getTeamCodes(teamName).iso2;
}

export function getFlagUrl(teamName: string): string {
  const { iso2 } = getTeamCodes(teamName);
  if (!iso2) return '';
  return `${FLAG_CDN_BASE}/${iso2}.png`;
}
