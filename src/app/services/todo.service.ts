import { computed, inject, Injectable, signal } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { catchError, map, Observable, of, tap, throwError } from 'rxjs';
import { CreateTodoRequest, Todo, TodoState, UpdateTodoRequest } from "../models/types";

@Injectable({
  providedIn: 'root',
})
export class TodoService {
  private readonly http = inject(HttpClient);
  private readonly API_URL = 'https://jsonplaceholder.typicode.com';

  private todoState = signal<TodoState>({
    items: [],
    loading: false,
    error: null,
  });

  // I expose the computed todos as signal states
  todos = computed(() => this.todoState().items);
  isLoading = computed(() => this.todoState().loading);
  error = computed(() => this.todoState().error);

  fetchTodosByUserId(userId: number): Observable<void> {
    this.todoState.update(state => ({
      ...state,
      loading: true,
      error: null,
    }));

    return this.http
      .get<Todo[]>(`${this.API_URL}/todos?userId=${userId}`)
      .pipe(
        tap(todos => {
          this.todoState.update(state => ({
            ...state,
            items: todos || [],
            loading: false,
          }));
        }),
        map(() => void 0),
        catchError((err) => {
          this.todoState.update(state => ({
            ...state,
            error: 'Error loading todos',
            loading: false,
          }));
          return of(void 0);
        })
      );
  }

  addTodo(title: string, userId: number): Observable<void> {
    if (!title.trim() || title.length > 250) {
      this.todoState.update(state => ({
        ...state,
        error: 'Description must be between 1 and 250 characters',
      }));
      return throwError(() => new Error('Invalid title'));
    }

    const newTodo: CreateTodoRequest = {
      userId,
      title: title.trim(),
      completed: false,
    };

    return this.http
      .post<Todo>(`${this.API_URL}/todos`, newTodo)
      .pipe(
        tap(response => {
          if (response) {
            // For demo purposes, I'll add it locally as JSONPlaceholder doesn't persist
            this.todoState.update(state => ({
              ...state,
              items: [{ ...response, userId }, ...state.items],
              error: null,
            }));
          }
        }),
        map(() => void 0),
        catchError((err) => {
          this.todoState.update(state => ({
            ...state,
            error: 'Error creating todo',
          }));
          return throwError(() => err);
        })
      );
  }

  updateTodo(todoId: number, title: string, completed?: boolean): Observable<void> {
    if (!title.trim() || title.length > 250) {
      this.todoState.update(state => ({
        ...state,
        error: 'Description must be between 1 and 250 characters',
      }));
      return throwError(() => new Error('Invalid title'));
    }

    const updateRequest: UpdateTodoRequest = {
      title: title.trim(),
      ...(completed !== undefined && { completed }),
    };

    return this.http
      .patch<Todo>(`${this.API_URL}/todos/${todoId}`, updateRequest)
      .pipe(
        tap(response => {
          if (response) {
            this.todoState.update(state => ({
              ...state,
              items: state.items.map(t =>
                t.id === todoId
                  ? { ...t, title: response.title, completed: response.completed }
                  : t
              ),
              error: null,
            }));
          }
        }),
        map(() => void 0),
        catchError((err) => {
          this.todoState.update(state => ({
            ...state,
            error: 'Error updating todo',
          }));
          return throwError(() => err);
        })
      );
  }

  deleteTodo(todoId: number): Observable<void> {
    return this.http
      .delete(`${this.API_URL}/todos/${todoId}`)
      .pipe(
        tap(() => {
          this.todoState.update(state => ({
            ...state,
            items: state.items.filter(t => t.id !== todoId),
            error: null,
          }));
        }),
        map(() => void 0),
        catchError((err) => {
          this.todoState.update(state => ({
            ...state,
            error: 'Error deleting todo',
          }));
          return throwError(() => err);
        })
      );
  }

  toggleTodo(todoId: number): Observable<void> {
    const todo = this.todoState().items.find(t => t.id === todoId);
    if (!todo) return throwError(() => new Error('Todo not found'));

    return this.updateTodo(todoId, todo.title, !todo.completed);
  }

  clearError(): void {
    this.todoState.update(state => ({
      ...state,
      error: null,
    }));
  }
}
