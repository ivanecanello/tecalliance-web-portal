import { computed, inject, Injectable, signal } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { catchError, map, Observable, of } from 'rxjs';
import { AuthState, User } from "../models/types";
import { environment } from '../../environments/environment';

@Injectable({
  providedIn: 'root',
})
export class AuthService {
  private readonly http = inject(HttpClient);
  private readonly API_URL = environment.apiUrl;

  private authState = signal<AuthState>({
    isAuthenticated: false,
    user: null,
    loading: false,
    error: null,
  });

  readonly isAuthenticated = computed(() => this.authState().isAuthenticated);
  readonly currentUser = computed(() => this.authState().user);
  readonly isLoading = computed(() => this.authState().loading);
  readonly error = computed(() => this.authState().error);

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
