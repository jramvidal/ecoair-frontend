import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, tap } from 'rxjs';
import { environment } from '../environments/environment'; // IMPORTANTE: Importamos la configuración de entorno

@Injectable({
  providedIn: 'root',
})
export class AuthService {
  // Sustituimos la URL fija por la del entorno
  private apiUrl = `${environment.apiUrl}/users`;

  constructor(private http: HttpClient) {}

  register(userData: any): Observable<any> {
    return this.http.post(`${this.apiUrl}/register`, userData);
  }

  login(credentials: { email: string; password: string }): Observable<any> {
    return this.http.post(`${this.apiUrl}/login`, credentials).pipe(
      tap((user: any) => {
        // Guardamos los datos en localStorage al iniciar sesión
        localStorage.setItem('userId', user.id);
        localStorage.setItem('role', user.role);
        localStorage.setItem('userName', user.name);
        localStorage.setItem('token', 'token-ficticio-sesion-activa');

        if (user.healthProfile) {
          localStorage.setItem('healthCondition', user.healthProfile.condition);
        }
      }),
    );
  }

  // --- Método para obtener el ID del usuario logueado ---
  getUserId(): number | null {
    const id = localStorage.getItem('userId');
    return id ? parseInt(id, 10) : null;
  }

  logout() {
    localStorage.clear();
  }

  isLoggedIn(): boolean {
    return !!localStorage.getItem('token');
  }
}