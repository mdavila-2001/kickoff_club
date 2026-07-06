import { useAuthStore } from '../authStore';

const BASE_URL = import.meta.env.VITE_API_URL;

interface RequestOptions extends RequestInit {
  readonly params?: Record<string, string>;
}

export class ApiError extends Error {
  readonly status: number;
  readonly data?: unknown;

  constructor(status: number, message: string, data?: unknown) {
    super(message);
    this.name = 'ApiError';
    this.status = status;
    this.data = data;
  }
}

export const apiClient = async <T>(
  endpoint: string,
  options: RequestOptions = {}
): Promise<T> => {
  const { params, headers, ...restOptions } = options;

  let url = `${BASE_URL}${endpoint}`;
  if (params) {
    const searchParams = new URLSearchParams(params);
    url += `?${searchParams.toString()}`;
  }

  // Obtener token desde Zustand de forma reactiva/inmediata
  const token = useAuthStore.getState().token;

  const defaultHeaders: Record<string, string> = {
    'Content-Type': 'application/json',
    ...(token ? { Authorization: `Bearer ${token}` } : {}),
  };

  const config: RequestInit = {
    headers: {
      ...defaultHeaders,
      ...headers,
    },
    ...restOptions,
  };

  try {
    const response = await fetch(url, config);

    if (!response.ok) {
      let errorData: { readonly message?: string } | null = null;
      try {
        errorData = await response.json() as { readonly message?: string };
      } catch {
        // Fallback si la respuesta no es un JSON válido
      }

      const errorMessage = errorData?.message || `Error HTTP! Estado: ${response.status}`;
      
      // Auto-limpieza en caso de no autorizado (Token expirado/inválido)
      if (response.status === 401) {
        useAuthStore.getState().logout();
      }

      throw new ApiError(response.status, errorMessage, errorData);
    }

    return (await response.json()) as T;
  } catch (error) {
    if (error instanceof ApiError) {
      throw error;
    }
    throw new ApiError(500, 'Error de red o conexión con el servidor de KickOff Club.');
  }
};
