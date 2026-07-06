import { useState } from 'react';
import type { SubmitEvent } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { InputField } from '../components/atoms/InputField/InputField';
import { Button } from '../components/atoms/Button/Button';
import { apiClient, ApiError } from '../services/api/apiClient';
import { API_ROUTES } from '../services/api/routes';
import { toast } from '../store/useToastStore';
import heroImage from '../assets/hero.png';
import styles from './RegisterPage.module.css';

interface RegisterUserDto {
  readonly username: string;
  readonly email: string;
  readonly password: string;
  readonly name: string;
  readonly middleName?: string;
  readonly lastName: string;
  readonly motherLastName?: string;
}

interface RegisterResponse {
  readonly id: string;
  readonly username: string;
  readonly email: string;
}

interface FormErrors {
  readonly username?: string;
  readonly email?: string;
  readonly password?: string;
  readonly confirmPassword?: string;
  readonly name?: string;
  readonly middleName?: string;
  readonly lastName?: string;
  readonly motherLastName?: string;
}

const USERNAME_REGEX = /^\w{4,20}$/;
const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const MIN_PASSWORD_LENGTH = 8;
const MIN_NAME_LENGTH = 2;

export const RegisterPage = () => {
  const [username, setUsername] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [name, setName] = useState('');
  const [middleName, setMiddleName] = useState('');
  const [lastName, setLastName] = useState('');
  const [motherLastName, setMotherLastName] = useState('');
  const [errors, setErrors] = useState<FormErrors>({});
  const [isLoading, setIsLoading] = useState(false);

  const navigate = useNavigate();

  const passwordsMismatch = confirmPassword.length > 0 && confirmPassword !== password;

  const validate = (): boolean => {
    const nextErrors: {
      username?: string;
      email?: string;
      password?: string;
      confirmPassword?: string;
      name?: string;
      middleName?: string;
      lastName?: string;
      motherLastName?: string;
    } = {};

    if (!USERNAME_REGEX.test(username.trim())) {
      nextErrors.username =
        'El usuario debe tener entre 4 y 20 caracteres (letras, números o guion bajo).';
    }
    if (!EMAIL_REGEX.test(email.trim())) {
      nextErrors.email = 'Ingresa un correo electrónico válido.';
    }
    if (password.length < MIN_PASSWORD_LENGTH) {
      nextErrors.password = `La contraseña debe tener al menos ${MIN_PASSWORD_LENGTH} caracteres.`;
    }
    if (confirmPassword !== password || confirmPassword.length === 0) {
      nextErrors.confirmPassword = 'Las contraseñas no coinciden.';
    }
    if (name.trim().length < MIN_NAME_LENGTH) {
      nextErrors.name = 'Ingresa tu nombre.';
    }
    if (lastName.trim().length < MIN_NAME_LENGTH) {
      nextErrors.lastName = 'Ingresa tu apellido.';
    }

    // Campos opcionales: solo se validan si el usuario escribió algo
    const trimmedMiddleName = middleName.trim();
    if (trimmedMiddleName.length > 0 && trimmedMiddleName.length < MIN_NAME_LENGTH) {
      nextErrors.middleName = 'El segundo nombre es demasiado corto.';
    }
    const trimmedMotherLastName = motherLastName.trim();
    if (trimmedMotherLastName.length > 0 && trimmedMotherLastName.length < MIN_NAME_LENGTH) {
      nextErrors.motherLastName = 'El apellido materno es demasiado corto.';
    }

    setErrors(nextErrors);
    return Object.keys(nextErrors).length === 0;
  };

  const handleSubmit = async (event: SubmitEvent<HTMLFormElement>): Promise<void> => {
    event.preventDefault();
    if (isLoading) return;

    if (!validate()) {
      toast.error('Verifique los campos');
      return;
    }

    setIsLoading(true);

    const trimmedMiddleName = middleName.trim();
    const trimmedMotherLastName = motherLastName.trim();

    // Los opcionales vacíos se omiten del payload en lugar de enviarse como ''
    const payload: RegisterUserDto = {
      username: username.trim(),
      email: email.trim(),
      password,
      name: name.trim(),
      lastName: lastName.trim(),
      ...(trimmedMiddleName.length > 0 ? { middleName: trimmedMiddleName } : {}),
      ...(trimmedMotherLastName.length > 0 ? { motherLastName: trimmedMotherLastName } : {}),
    };

    try {
      await apiClient<RegisterResponse>(API_ROUTES.auth.register, {
        method: 'POST',
        body: JSON.stringify(payload),
      });

      toast.success('Cuenta creada con éxito. Inicia sesión para continuar.');
      navigate('/login', { replace: true });
    } catch (error) {
      if (error instanceof ApiError && error.status === 409) {
        toast.error('El nombre de usuario o el correo ya están registrados.');
      } else if (error instanceof ApiError) {
        toast.error(error.message);
      } else {
        toast.error('Error inesperado al crear la cuenta.');
      }
      setIsLoading(false);
    }
  };

  return (
    <div className={styles.registerRoot}>
      {/* Panel izquierdo: branding (oculto en móvil) */}
      <aside className={styles.brandPanel} aria-hidden="true">
        <img src={heroImage} alt="" className={styles.brandImage} />
        <div className={styles.dotPattern} />
        <div className={styles.gradientOverlay} />
        <div className={styles.brandContent}>
          <span className={styles.wordmark}>KickOff Club</span>
          <h1 className={styles.brandTitle}>Entra a la cancha</h1>
          <p className={styles.brandSubtitle}>
            Crea tu cuenta, arma tu quiniela del Mundial 2026 y demuestra quién sabe más
            de fútbol en tu grupo.
          </p>
        </div>
      </aside>

      {/* Panel derecho: formulario */}
      <main className={styles.formPanel}>
        <header className={styles.formHeader}>
          <h2 className={styles.formTitle}>Crea tu cuenta</h2>
          <p className={styles.formSubtitle}>
            Únete a la quiniela y empieza a pronosticar los partidos del Mundial.
          </p>
        </header>

        <form className={styles.registerForm} onSubmit={handleSubmit} noValidate>
          <div className={styles.nameRow}>
            <InputField
              label="Nombre"
              placeholder="Marcelo"
              value={name}
              onChange={(event) => setName(event.target.value)}
              error={errors.name}
              autoComplete="given-name"
              disabled={isLoading}
            />
            <InputField
              label="Segundo nombre"
              placeholder="Andrés"
              value={middleName}
              onChange={(event) => setMiddleName(event.target.value)}
              error={errors.middleName}
              autoComplete="additional-name"
              disabled={isLoading}
            />
          </div>

          <div className={styles.nameRow}>
            <InputField
              label="Apellido"
              placeholder="Dávila"
              value={lastName}
              onChange={(event) => setLastName(event.target.value)}
              error={errors.lastName}
              autoComplete="family-name"
              disabled={isLoading}
            />
            <InputField
              label="Apellido materno"
              placeholder="Rojas"
              value={motherLastName}
              onChange={(event) => setMotherLastName(event.target.value)}
              error={errors.motherLastName}
              disabled={isLoading}
            />
          </div>

          <InputField
            label="Nombre de usuario"
            placeholder="golazo10"
            value={username}
            onChange={(event) => setUsername(event.target.value)}
            error={errors.username}
            autoComplete="username"
            maxLength={20}
            disabled={isLoading}
          />

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

          <div className={styles.passwordGroup}>
            <div className={styles.nameRow}>
              <InputField
                label="Contraseña"
                type="password"
                placeholder="••••••••"
                value={password}
                onChange={(event) => setPassword(event.target.value)}
                error={errors.password}
                autoComplete="new-password"
                disabled={isLoading}
              />
              <InputField
                label="Confirmar contraseña"
                type="password"
                placeholder="••••••••"
                value={confirmPassword}
                onChange={(event) => setConfirmPassword(event.target.value)}
                error={errors.confirmPassword}
                autoComplete="new-password"
                disabled={isLoading}
              />
            </div>

            {passwordsMismatch && (
              <p id="passwordError" className={styles.passwordError} aria-live="polite">
                Las contraseñas no coinciden.
              </p>
            )}
          </div>

          <Button type="submit" variant="gold" size="lg" isLoading={isLoading}>
            Crear cuenta
          </Button>
        </form>

        <p className={styles.footerText}>
          ¿Ya tienes una cuenta?{' '}
          <Link to="/login" className={styles.footerLink}>
            Inicia sesión
          </Link>
        </p>
      </main>
    </div>
  );
};

RegisterPage.displayName = 'RegisterPage';
