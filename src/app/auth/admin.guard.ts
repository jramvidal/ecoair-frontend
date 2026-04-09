import { Injectable } from '@angular/core';
import { CanActivate, Router } from '@angular/router';

@Injectable({
  providedIn: 'root'
})
export class AdminGuard implements CanActivate {
  
  constructor(private router: Router) {}

  canActivate(): boolean {
    // Retrieve the role stored during login.
    const role = localStorage.getItem('userRole');

    if (role === 'admin') {
      return true; // Access granted.
    }

    // Redirect to the map if the user is not an admin.
    console.warn('Acceso denegado: Se requiere rol de administrador');
    this.router.navigate(['/map']);
    return false;
  }
}