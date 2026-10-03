export type AuthRole = "admin" | "user";

export type AuthUser = {
  id: string;
  email: string;
  name: string;
  role: AuthRole;
};

export type UserDocument = {
  _id?: unknown;
  email: string;
  name: string;
  passwordHash: string;
  role: AuthRole;
  createdAt: Date;
  updatedAt: Date;
};

export type PasswordResetOtpDocument = {
  _id?: unknown;
  email: string;
  otpHash: string;
  expiresAt: Date;
  attempts: number;
  createdAt: Date;
  consumedAt?: Date;
  resetTokenHash?: string;
  resetTokenExpiresAt?: Date;
};

export type ApiResponse<T = unknown> = {
  ok: boolean;
  message: string;
  data?: T;
};
