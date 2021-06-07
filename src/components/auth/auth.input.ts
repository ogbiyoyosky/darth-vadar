export interface CreateUserAccountInput {
  firstName: string;
  lastName: string;
  email: string;
  password: string;
  confirmPassword: string;
  refCode?: string;
}

export interface AuthJWTInput {
  id: number;
  email: string;
  role: string;
}

export interface LoginInput {
  email: string;
  password: string;
  rememberMe?: boolean;
}

export interface ChangePasswordInput {
  userId: number;
  currentPassword: string;
  newPassword: string;
  confirmPassword: string;
}

export interface ResetPasswordInput {
  resetToken: string;
  password: string;
  confirmPassword: string;
}
