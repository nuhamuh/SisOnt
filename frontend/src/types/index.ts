// Global types
export interface ApiResponse<T> {
  data: T;
  message: string;
  status: string;
}

export interface User {
  id: number;
  username: string;
  email: string;
}

export interface APIError {
  message: string;
  status: number;
} 