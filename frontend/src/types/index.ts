export interface Card {
  id: number;
  title: string;
  subtitle?: string;
  image_path?: string;
  description?: string;
  created_at: string;
  updated_at: string;
}

export interface User {
  id: number;
  username: string;
}

export interface AuthStatus {
  authenticated: boolean;
  user?: User;
}

export interface LoginCredentials {
  username: string;
  password: string;
}

export interface CardFormData {
  title: string;
  subtitle: string;
  description: string;
  image?: File;
}

export interface ApiResponse<T> {
  data?: T;
  error?: string;
  message?: string;
}

export interface CreateCardRequest {
  title: string;
  subtitle?: string;
  description?: string;
  image?: File;
}

export interface UpdateCardRequest extends CreateCardRequest {
  id: number;
} 