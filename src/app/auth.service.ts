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

  /**
   * Updates user profile data and syncs localStorage
   */
  updateProfile(userId: number, updateData: any): Observable<any> {
    return this.http.patch(`${this.apiUrl}/profile/${userId}`, updateData).pipe(
      tap((updatedUser: any) => {
        localStorage.setItem('userName', updatedUser.name);
        if (updatedUser.healthProfile) {
          localStorage.setItem('healthCondition', updatedUser.healthProfile.condition);
        }
      })
    );
  }

  getUserId(): number | null {
    const id = localStorage.getItem('userId');
    return id ? parseInt(id, 10) : null;
  }

  /**
   * Cleans only auth data without clearing the entire localStorage
   */
  logout() {
    localStorage.removeItem('token');
    localStorage.removeItem('userId');
    localStorage.removeItem('role');
    localStorage.removeItem('userName');
    localStorage.removeItem('healthCondition');
    
    this.loggedIn.next(false);
  }

  isLoggedIn(): boolean {
    return this.hasToken();
  }
}