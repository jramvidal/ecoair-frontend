import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, tap } from 'rxjs';

@Injectable({
  providedIn: 'root',
})
export class AuthService {
  private apiUrl = 'http://localhost:3000/users';

  constructor(private http: HttpClient) {}

  register(userData: any): Observable<any> {
    return this.http.post(`${this.apiUrl}/register`, userData);
  }

  login(credentials: { email: string; password: string }): Observable<any> {
    return this.http.post(`${this.apiUrl}/login`, credentials).pipe(
      tap((user: any) => {
        // Store the ID to identify the owner of the map favorite.
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

  logout() {
    localStorage.clear();
  }

  isLoggedIn(): boolean {
    return !!localStorage.getItem('token');
  }
}
