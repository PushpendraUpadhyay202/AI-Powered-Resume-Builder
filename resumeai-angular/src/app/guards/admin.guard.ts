import { inject } from '@angular/core';
import { Router, CanActivateFn } from '@angular/router';
import { AuthService } from '../services/auth.service';

export const adminGuard: CanActivateFn = () => {
  const auth = inject(AuthService);
  const router = inject(Router);
  
  const user = auth.user();
  if (user && user.role === 'Admin') {
    return true;
  }
  
  // If not admin, redirect to dashboard
  return router.createUrlTree(['/dashboard']);
};
