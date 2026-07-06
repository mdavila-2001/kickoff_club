import React, { useEffect, useState } from 'react';
import { apiClient, ApiError } from '../services/api/apiClient';
import { API_ROUTES } from '../services/api/routes';
import { useAuthStore } from '../services/authStore';
import { toast } from '../store/useToastStore';
import { InputField } from '../components/atoms/InputField/InputField';
import { Button } from '../components/atoms/Button/Button';
import { Skeleton } from '../components/atoms/Skeleton/Skeleton';
import { FormField } from '../components/molecules/FormField/FormField';
import type { UserProfile } from '../types';
import styles from './ProfilePage.module.css';

interface ProfileFormErrors {
  readonly name?: string;
  readonly lastName?: string;
  readonly username?: string;
}

const MIN_USERNAME_LENGTH = 3;

const buildInitials = (name: string, lastName: string): string => {
  const first = name.trim().charAt(0);
  const second = lastName.trim().charAt(0);
  return `${first}${second}` || '?';
};

export const ProfilePage = () => {
  const [name, setName] = useState<string>('');
  const [middleName, setMiddleName] = useState<string>('');
  const [lastName, setLastName] = useState<string>('');
  const [motherLastName, setMotherLastName] = useState<string>('');
  const [username, setUsername] = useState<string>('');
  const [email, setEmail] = useState<string>('');

  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);
  const [errors, setErrors] = useState<ProfileFormErrors>({});

  useEffect(() => {
    let isMounted = true;

    const loadProfile = async (): Promise<void> => {
      try {
        const profile = await apiClient<UserProfile>(API_ROUTES.users.me, {
          method: 'GET',
        });

        if (!isMounted) return;

        setName(profile.name);
        setMiddleName(profile.middleName ?? '');
        setLastName(profile.lastName);
        setMotherLastName(profile.motherLastName ?? '');
        setUsername(profile.username);
        setEmail(profile.email);
      } catch (err: unknown) {
        const message =
          err instanceof ApiError ? err.message : 'Error al cargar tu perfil.';
        toast.error(message);
      } finally {
        if (isMounted) {
          setIsLoading(false);
        }
      }
    };

    void loadProfile();

    return () => {
      isMounted = false;
    };
  }, []);

  const validateForm = (): ProfileFormErrors => {
    const validationErrors: {
      name?: string;
      lastName?: string;
      username?: string;
    } = {};

    if (!name.trim()) {
      validationErrors.name = 'El nombre es obligatorio.';
    }

    if (!lastName.trim()) {
      validationErrors.lastName = 'El apellido es obligatorio.';
    }

    if (!username.trim()) {
      validationErrors.username = 'El nombre de usuario es obligatorio.';
    } else if (username.trim().length < MIN_USERNAME_LENGTH) {
      validationErrors.username = `El nombre de usuario debe tener al menos ${MIN_USERNAME_LENGTH} caracteres.`;
    }

    return validationErrors;
  };

  const handleSaveProfile = async (e: React.FormEvent<HTMLFormElement>): Promise<void> => {
    e.preventDefault();

    if (isSubmitting) return;

    const validationErrors = validateForm();
    setErrors(validationErrors);

    if (Object.keys(validationErrors).length > 0) {
      return;
    }

    setIsSubmitting(true);

    try {
      const updatedUser = await apiClient<UserProfile>(API_ROUTES.users.me, {
        method: 'PATCH',
        body: JSON.stringify({
          name: name.trim(),
          middleName: middleName.trim(),
          lastName: lastName.trim(),
          motherLastName: motherLastName.trim(),
          username: username.trim(),
        }),
      });

      useAuthStore.getState().updateUserProfile(updatedUser);

      setName(updatedUser.name);
      setMiddleName(updatedUser.middleName ?? '');
      setLastName(updatedUser.lastName);
      setMotherLastName(updatedUser.motherLastName ?? '');
      setUsername(updatedUser.username);

      toast.success('¡Perfil actualizado con éxito!');
    } catch (err: unknown) {
      if (err instanceof ApiError && err.status === 409) {
        toast.error('El nombre de usuario ya está ocupado');
      } else {
        const message =
          err instanceof ApiError ? err.message : 'No se pudo actualizar el perfil.';
        toast.error(message);
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <section className={styles.profileRoot} aria-label="Mi perfil">
      <header className={styles.profileBanner}>
        <div className={styles.bannerPattern} />
        <div className={styles.bannerContent}>
          {isLoading ? (
            <Skeleton variant="circle" width="72px" height="72px" />
          ) : (
            <span className={styles.avatarCircle} aria-hidden="true">
              {buildInitials(name, lastName)}
            </span>
          )}

          <div>
            <h1 className={styles.bannerTitle}>Mi Perfil</h1>
            {isLoading ? (
              <Skeleton variant="text" width="180px" height="16px" />
            ) : (
              <p className={styles.bannerSubtitle}>
                <span className={styles.bannerUsername}>@{username}</span>
                {' · '}
                {email}
              </p>
            )}
          </div>
        </div>
      </header>

      <div className={styles.formCard}>
        <div className={styles.cardHeader}>
          <h2 className={styles.cardTitle}>Información Personal</h2>
          <p className={styles.cardHint}>
            Actualiza tu nombre y tu nombre de usuario. El correo electrónico no se
            puede modificar.
          </p>
        </div>

        <form className={styles.profileForm} onSubmit={handleSaveProfile} noValidate>
          <div className={styles.fieldsGrid}>
            <FormField label="Nombre" error={errors.name} isLoading={isLoading}>
              <InputField
                type="text"
                name="name"
                value={name}
                onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
                  setName(e.target.value)
                }
                placeholder="Tu nombre"
                autoComplete="given-name"
                disabled={isSubmitting}
              />
            </FormField>

            <FormField label="Segundo Nombre" isLoading={isLoading}>
              <InputField
                type="text"
                name="middleName"
                value={middleName}
                onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
                  setMiddleName(e.target.value)
                }
                placeholder="Opcional"
                autoComplete="additional-name"
                maxLength={50}
                disabled={isSubmitting}
              />
            </FormField>

            <FormField label="Apellido" error={errors.lastName} isLoading={isLoading}>
              <InputField
                type="text"
                name="lastName"
                value={lastName}
                onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
                  setLastName(e.target.value)
                }
                placeholder="Tu apellido"
                autoComplete="family-name"
                disabled={isSubmitting}
              />
            </FormField>

            <FormField label="Apellido Materno" isLoading={isLoading}>
              <InputField
                type="text"
                name="motherLastName"
                value={motherLastName}
                onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
                  setMotherLastName(e.target.value)
                }
                placeholder="Opcional"
                autoComplete="off"
                maxLength={50}
                disabled={isSubmitting}
              />
            </FormField>

            <FormField
              label="Nombre de Usuario"
              error={errors.username}
              isLoading={isLoading}
              className={styles.fullRow}
            >
              <InputField
                type="text"
                name="username"
                value={username}
                onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
                  setUsername(e.target.value)
                }
                placeholder="Tu nombre de usuario"
                autoComplete="username"
                minLength={MIN_USERNAME_LENGTH}
                disabled={isSubmitting}
              />
            </FormField>

            <FormField
              label="Correo Electrónico"
              isLoading={isLoading}
              className={styles.fullRow}
            >
              <InputField
                type="text"
                name="email"
                value={email}
                readOnly
                disabled
                autoComplete="email"
                aria-label="Correo electrónico (solo lectura)"
              />
            </FormField>
          </div>

          <div className={styles.formActions}>
            <Button
              type="submit"
              variant="gold"
              size="md"
              isLoading={isSubmitting}
              disabled={isLoading || isSubmitting}
            >
              Guardar Cambios
            </Button>
          </div>
        </form>
      </div>
    </section>
  );
};

ProfilePage.displayName = 'ProfilePage';
