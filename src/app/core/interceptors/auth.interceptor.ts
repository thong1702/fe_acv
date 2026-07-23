import { HttpInterceptorFn, HttpErrorResponse } from '@angular/common/http';
import { inject, Injector } from '@angular/core';
import { AuthService } from '../services/auth.service';
import { catchError, switchMap, throwError } from 'rxjs';

export const authInterceptor: HttpInterceptorFn = (req, next) => {
  const injector = inject(Injector);
  const token = localStorage.getItem('auth_token');

  // Check if this request is a retry to avoid infinite refresh loops
  const isRetry = req.headers.has('X-Retry');

  // Attach token if present
  let authReq = req;
  if (token) {
    authReq = req.clone({
      setHeaders: {
        Authorization: `Bearer ${token}`
      }
    });
  }

  // Remove the temporary X-Retry header if present before forwarding
  if (isRetry) {
    authReq = authReq.clone({
      headers: authReq.headers.delete('X-Retry')
    });
  }

  return next(authReq).pipe(
    catchError((error) => {
      console.warn('[AuthInterceptor] Caught HTTP error:', error.status, req.url);
      
      // Intercept 401 Unauthorized (expired token)
      // Do not retry if this is already a retry or a request to login/refresh
      if (
        error instanceof HttpErrorResponse &&
        error.status === 401 &&
        !isRetry &&
        !req.url.includes('/auth/login') &&
        !req.url.includes('/auth/refresh')
      ) {
        console.log('[AuthInterceptor] 401 Unauthorized intercepted. Attempting token refresh...');
        
        // Resolve AuthService dynamically to break circular dependency
        const authService = injector.get(AuthService);
        
        return authService.refreshToken().pipe(
          switchMap((res) => {
            console.log('[AuthInterceptor] Refresh success. Retrying request with new token:', req.url);
            
            // Retry the original request with the new access token and X-Retry header
            const newAuthReq = req.clone({
              setHeaders: {
                Authorization: `Bearer ${res.token}`,
                'X-Retry': 'true'
              }
            });
            return next(newAuthReq);
          }),
          catchError((refreshErr) => {
            console.error('[AuthInterceptor] Refresh failed. Logging out...', refreshErr);
            authService.logout();
            return throwError(() => refreshErr);
          })
        );
      }

      return throwError(() => error);
    })
  );
};
