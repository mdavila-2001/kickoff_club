import { useState } from 'react';
import type { SubmitEvent } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { InputField } from '../components/atoms/InputField/InputField';
import { Button } from '../components/atoms/Button/Button';
import { apiClient, ApiError } from '../services/api/apiClient';
import { API_ROUTES } from '../services/api/routes';
import { useAuthStore } from '../services/authStore';
import { toast } from '../store/useToastStore';
import type { UserProfile } from '../types';
import heroImage from '../assets/login-hero.png';
import styles from './LoginPage.module.css';

interface LoginResponse {
  readonly accessToken: string;
  readonly user: UserProfile;
}

interface FormErrors {
  readonly email?: string;
  readonly password?: string;
}

const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const MIN_PASSWORD_LENGTH = 6;

export const LoginPage = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [errors, setErrors] = useState<FormErrors>({});
  const [isLoading, setIsLoading] = useState(false);

  const setAuth = useAuthStore((state) => state.setAuth);
  const navigate = useNavigate();

  const validate = (): boolean => {
    const nextErrors: { email?: string; password?: string } = {};

    if (!EMAIL_REGEX.test(email.trim())) {
      nextErrors.email = 'Ingresa un correo electrónico válido.';
    }
    if (password.length < MIN_PASSWORD_LENGTH) {
      nextErrors.password = `La contraseña debe tener al menos ${MIN_PASSWORD_LENGTH} caracteres.`;
    }

    setErrors(nextErrors);
    return Object.keys(nextErrors).length === 0;
  };

  const handleSubmit = async (event: SubmitEvent<HTMLFormElement>): Promise<void> => {
    event.preventDefault();
    if (isLoading || !validate()) return;

    setIsLoading(true);
    try {
      const { accessToken, user } = await apiClient<LoginResponse>(API_ROUTES.auth.login, {
        method: 'POST',
        body: JSON.stringify({ email: email.trim(), password }),
      });

      setAuth(user, accessToken);
      navigate('/dashboard', { replace: true });
    } catch (error) {
      if (error instanceof ApiError && error.status === 401) {
        toast.error('Credenciales inválidas');
      } else if (error instanceof ApiError) {
        toast.error(error.message);
      } else {
        toast.error('Error inesperado al iniciar sesión.');
      }
      setIsLoading(false);
    }
  };

  return (
    <div className={styles.loginRoot}>
      {/* Panel izquierdo: branding (oculto en móvil) */}
      <aside className={styles.brandPanel} aria-hidden="true">
        <img src={heroImage} alt="" className={styles.brandImage} />
        <div className={styles.dotPattern} />
        <div className={styles.gradientOverlay} />
        <div className={styles.brandContent}>
          <span className={styles.wordmark}>KickOff Club</span>
          <h1 className={styles.brandTitle}>Desata tu juego</h1>
          <p className={styles.brandSubtitle}>
            Conecta con jugadores, sigue tus estadísticas y domina la clasificación en la
            comunidad definitiva de fútbol.
          </p>
        </div>
      </aside>

      {/* Panel derecho: formulario */}
      <main className={styles.formPanel}>
        <header className={styles.formHeader}>
          <h2 className={styles.formTitle}>Bienvenido de nuevo</h2>
          <p className={styles.formSubtitle}>
            Inicia sesión para acceder a tu dashboard y tus partidos.
          </p>
        </header>

        <form className={styles.loginForm} onSubmit={handleSubmit} noValidate>
          <InputField
            label="Correo electrónico"
            placeholder="jugador@kickoffclub.com"
            value={email}
            onChange={(event) => setEmail(event.target.value)}
            error={errors.email}
            inputMode="email"
            autoComplete="email"
            disabled={isLoading}
          />

          <InputField
            label="Contraseña"
            type="password"
            placeholder="••••••••"
            value={password}
            onChange={(event) => setPassword(event.target.value)}
            error={errors.password}
            autoComplete="current-password"
            disabled={isLoading}
          />


          <Button type="submit" variant="usa" size="lg" isLoading={isLoading}>
            Iniciar sesión
          </Button>
        </form>

        <p className={styles.footerText}>
          ¿No tienes una cuenta?{' '}
          <Link to="/register" className={styles.footerLink}>
            Regístrate ahora
          </Link>
        </p>
      </main>
    </div>
  );
};

LoginPage.displayName = 'LoginPage';
