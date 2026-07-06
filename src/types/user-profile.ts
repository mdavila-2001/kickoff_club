import type { UserRole } from './user-role-enum';

export interface UserProfile {
  readonly id: string;
  readonly username: string;
  readonly name: string;
  readonly middleName: string | null;
  readonly lastName: string;
  readonly motherLastName: string | null;
  readonly email: string;
  readonly role: UserRole;
  readonly createdAt: string;
}