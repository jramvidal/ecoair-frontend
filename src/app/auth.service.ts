import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, tap, BehaviorSubject } from 'rxjs';
import { environment } from '../environments/environment';

@Injectable({
  providedIn: 'root',
})
export class AuthService {
  private apiUrl = `${environment.apiUrl}/users`;
  private loggedIn = new BehaviorSubject<boolean>(this.hasToken());
  isLoggedIn$ = this.loggedIn.asObservable();

  constructor(private http: HttpClient) {}

  private hasToken(): boolean {
    return !!localStorage.getItem('token');
  }

  register(userData: any): Observable<any> {
    return this.http.post(`${this.apiUrl}/register`, userData);
  }

  login(credentials: { email: string; password: string }): Observable<any> {
    return this.http.post(`${this.apiUrl}/login`, credentials).pipe(
      tap((user: any) => {
        localStorage.setItem('userId', user.id);
        localStorage.setItem('role', user.role);
        localStorage.setItem('userName', user.name);
        localStorage.setItem('token', 'token-ficticio-sesion-activa');

        if (user.healthProfile) {
          localStorage.setItem('healthCondition', user.healthProfile.condition);
        }
        this.loggedIn.next(true);
      }),
    );
  }

  // --- NUEVO: Método para actualizar el perfil ---
  updateProfile(userId: number, updateData: any): Observable<any> {
    return this.http.patch(`${this.apiUrl}/profile/${userId}`, updateData).pipe(
      tap((updatedUser: any) => {
        // Actualizamos el localStorage con los nuevos datos recibidos
        localStorage.setItem('userName', updatedUser.name);
        if (updatedUser.healthProfile) {
          localStorage.setItem('healthCondition', updatedUser.healthProfile.condition);
        }
        // Opcional: Podrías emitir un evento si quieres que otros componentes se enteren
      })
    );
  }

  getUserId(): number | null {
    const id = localStorage.getItem('userId');
    return id ? parseInt(id, 10) : null;
  }

  logout() {
    localStorage.clear();
    this.loggedIn.next(false);
  }

  isLoggedIn(): boolean {
    return this.hasToken();
  }
}