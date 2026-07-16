import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, BehaviorSubject, tap, catchError, of, throwError, shareReplay } from 'rxjs';
import { environment } from '../constants/environment';
import { AuthResponse, User } from '../models/models';

@Injectable({
  providedIn: 'root'
})
export class AuthService {
  private http = inject(HttpClient);
  private tokenKey = 'auth_token';
  private refreshTokenKey = 'refresh_token';
  private currentUserSubject = new BehaviorSubject<User | null>(null);
  
  public currentUser$ = this.currentUserSubject.asObservable();

  constructor() {
    this.loadCurrentUser();
  }

  login(credentials: { username: string; password: String }): Observable<AuthResponse> {
    return this.http.post<AuthResponse>(`${environment.authUrl}/login`, credentials).pipe(
      tap(response => {
        if (response && response.token) {
          localStorage.setItem(this.tokenKey, response.token);
          if (response.refreshToken) {
            localStorage.setItem(this.refreshTokenKey, response.refreshToken);
          }
          this.currentUserSubject.next({
            username: response.username,
            role: response.role,
            enabled: true,
            email: ''
          });
        }
      })
    );
  }

  logout(): void {
    localStorage.removeItem(this.tokenKey);
    localStorage.removeItem(this.refreshTokenKey);
    this.currentUserSubject.next(null);
  }

  getToken(): string | null {
    return localStorage.getItem(this.tokenKey);
  }

  isLoggedIn(): boolean {
    return !!this.getToken();
  }

  isAdmin(): boolean {
    const user = this.currentUserSubject.value;
    return user?.role === 'ADMIN';
  }

  getRole(): 'ADMIN' | 'EDITOR' | null {
    const user = this.currentUserSubject.value;
    return user ? user.role : null;
  }

  private refreshUserRequest$: Observable<User> | null = null;
  private refreshInProgress$: Observable<AuthResponse> | null = null;

  fetchCurrentUser(): Observable<User> {
    console.log('[AuthService] fetchCurrentUser() called. Token exists:', !!this.getToken());
    if (!this.getToken()) {
      return throwError(() => new Error('No token found'));
    }
    if (this.refreshUserRequest$) {
      console.log('[AuthService] fetchCurrentUser() returning existing in-flight request');
      return this.refreshUserRequest$;
    }

    console.log('[AuthService] fetchCurrentUser() making new HTTP GET request to /auth/me');
    this.refreshUserRequest$ = this.http.get<User>(`${environment.authUrl}/me`).pipe(
      tap(user => {
        console.log('[AuthService] fetchCurrentUser() HTTP success:', user);
        this.currentUserSubject.next(user);
        this.refreshUserRequest$ = null;
      }),
      catchError(err => {
        console.error('[AuthService] fetchCurrentUser() HTTP error. Logging out...', err);
        this.logout();
        this.refreshUserRequest$ = null;
        return throwError(() => err);
      }),
      shareReplay(1)
    );
    return this.refreshUserRequest$;
  }

  getRefreshToken(): string | null {
    return localStorage.getItem(this.refreshTokenKey);
  }

  refreshToken(): Observable<AuthResponse> {
    console.log('[AuthService] refreshToken() called. Token exists:', !!this.getRefreshToken());
    if (this.refreshInProgress$) {
      console.log('[AuthService] refreshToken() returning existing in-flight refresh request');
      return this.refreshInProgress$;
    }

    const token = this.getRefreshToken();
    if (!token) {
      return throwError(() => new Error('No refresh token found to perform refresh'));
    }

    console.log('[AuthService] refreshToken() making HTTP POST /auth/refresh');
    this.refreshInProgress$ = this.http.post<AuthResponse>(`${environment.authUrl}/refresh`, { token }).pipe(
      tap(response => {
        console.log('[AuthService] refreshToken() HTTP success. New tokens saved:', !!response.token);
        if (response && response.token) {
          localStorage.setItem(this.tokenKey, response.token);
          if (response.refreshToken) {
            localStorage.setItem(this.refreshTokenKey, response.refreshToken);
          }
          this.currentUserSubject.next({
            username: response.username,
            role: response.role,
            enabled: true,
            email: ''
          });
        }
        this.refreshInProgress$ = null;
      }),
      catchError(err => {
        console.error('[AuthService] refreshToken() HTTP error. Logging out...', err);
        this.refreshInProgress$ = null;
        this.logout();
        return throwError(() => err);
      }),
      shareReplay(1)
    );

    return this.refreshInProgress$;
  }

  private loadCurrentUser(): void {
    const token = this.getToken();
    if (token) {
      this.fetchCurrentUser().subscribe({
        error: () => this.logout()
      });
    }
  }
}
