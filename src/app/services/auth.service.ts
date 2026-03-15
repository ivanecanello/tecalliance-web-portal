import { computed, inject, Injectable, signal } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { catchError, map, Observable, of, tap } from 'rxjs';
import { AuthState, User } from "../models/types";

@Injectable({
  providedIn: 'root',
})
export class AuthService {
  private readonly http = inject(HttpClient);
  private readonly API_URL = 'https://jsonplaceholder.typicode.com';

  private authState = signal<AuthState>({
    isAuthenticated: false,
    user: null,
    loading: false,
    error: null,
  });

  // I expose the computed todos as signal states
  isAuthenticated = computed(() => this.authState().isAuthenticated);
  currentUser = computed(() => this.authState().user);
  isLoading = computed(() => this.authState().loading);
  error = computed(() => this.authState().error);

  // Adding a validation for the email format using a regular expression
  private validateEmailFormat(email: string): boolean {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
  }

  authenticate(email: string): Observable<boolean> {
    if (!this.validateEmailFormat(email)) {
      this.authState.update(state => ({
        ...state,
        error: 'Please enter a valid email',
        isAuthenticated: false,
      }));
      return of(false);
    }

    this.authState.update(state => ({
      ...state,
      loading: true,
      error: null,
    }));

    return this.http
      .get<User[]>(`${this.API_URL}/users`)
      .pipe(
        map(users => {
          const user = users?.find(u => u.email === email);

          if (user) {
            this.authState.update(state => ({
              ...state,
              isAuthenticated: true,
              user,
              loading: false,
              error: null,
            }));
            return true;
          } else {
            this.authState.update(state => ({
              ...state,
              error: 'The entered email is not valid',
              loading: false,
              isAuthenticated: false,
            }));
            return false;
          }
        }),
        catchError(() => {
          this.authState.update(state => ({
            ...state,
            error: 'Error connecting to server',
            loading: false,
          }));
          return of(false);
        })
      );
  }

  logout(): void {
    this.authState.set({
      isAuthenticated: false,
      user: null,
      loading: false,
      error: null,
    });
  }

  clearError(): void {
    this.authState.update(state => ({
      ...state,
      error: null,
    }));
  }
}
