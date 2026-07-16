import { inject } from '@angular/core';
import { CanActivateFn, Router } from '@angular/router';
import { AuthService } from '../services/auth.service';
import { map, catchError } from 'rxjs/operators';
import { of } from 'rxjs';

export const authGuard: CanActivateFn = (route, state) => {
  const authService = inject(AuthService);
  const router = inject(Router);

  console.log('[AuthGuard] Checking route:', state.url);
  console.log('[AuthGuard] Is logged in (has token):', authService.isLoggedIn());
  console.log('[AuthGuard] Current user role in memory:', authService.getRole());

  if (authService.isLoggedIn()) {
    const requiredRole = route.data?.['role'];

    // If user state is already loaded in memory, resolve synchronously
    if (authService.getRole()) {
      if (requiredRole === 'ADMIN' && !authService.isAdmin()) {
        console.log('[AuthGuard] Role mismatch, redirecting to dashboard');
        router.navigate(['/admin/dashboard']);
        return false;
      }
      console.log('[AuthGuard] Allowed synchronously');
      return true;
    }

    // Otherwise, fetch/wait for current user session from API (handles page refresh)
    console.log('[AuthGuard] User state missing. Fetching user info...');
    return authService.fetchCurrentUser().pipe(
      map(user => {
        console.log('[AuthGuard] Fetch user success:', user);
        if (requiredRole === 'ADMIN' && user.role !== 'ADMIN') {
          console.log('[AuthGuard] Role mismatch after fetch, redirecting to dashboard');
          router.navigate(['/admin/dashboard']);
          return false;
        }
        console.log('[AuthGuard] Allowed asynchronously');
        return true;
      }),
      catchError((err) => {
        console.error('[AuthGuard] Fetch user failed:', err);
        router.navigate(['/admin/login']);
        return of(false);
      })
    );
  }

  // Redirect to login page if no token is stored
  console.log('[AuthGuard] No token found, redirecting to login');
  router.navigate(['/admin/login']);
  return false;
};
