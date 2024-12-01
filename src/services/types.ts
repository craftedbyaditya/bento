export interface Project {
  project_id: number;
  project_name: string;
  role_id: number;
  role_name: string;
}

export interface User {
  id: number;
  firstName: string;
  lastName: string;
  email: string;
  imageUrl?: string;
  projects: Project[];
}

export interface LoginRequest {
  email: string;
  password: string;
}

export interface LoginResponse {
  message: string;
  data: User;
}

export interface ApiResponse<T> {
  message: string;
  data: T;
}
