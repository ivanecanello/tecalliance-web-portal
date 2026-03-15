export interface User {
  id: number;
  name: string;
  email: string;
  phone?: string;
  website?: string;
}

export interface Todo {
  id: number;
  userId: number;
  title: string;
  completed: boolean;
}

export interface CreateTodoRequest {
  userId: number;
  title: string;
  completed?: boolean;
}

export interface UpdateTodoRequest {
  title: string;
  completed?: boolean;
}

export interface AuthState {
  isAuthenticated: boolean;
  user: User | null;
  loading: boolean;
  error: string | null;
}

export interface TodoState {
  items: Todo[];
  loading: boolean;
  error: string | null;
}
