import type { UserRole } from "./user-role-enum";

export interface UserProfile {
  readonly id: string;
  readonly username: string;
  readonly name: string;
  readonly middleName: string;
  readonly lastName: string;
  readonly motherLastName: string;
  readonly email: string;
  readonly role: UserRole;
  readonly createdAt: string;
}