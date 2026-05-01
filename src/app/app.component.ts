import { Component, OnInit, OnDestroy } from '@angular/core';
import { Router } from '@angular/router';
import { StationsService } from './stations.service';
import { AuthService } from './auth.service';
import { Subscription } from 'rxjs';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.scss']
})
export class AppComponent implements OnInit, OnDestroy {
  alertCount = 0;
  isLoggedIn = false;
  private intervalId: any;
  private authSub!: Subscription;

  constructor(
    private router: Router, 
    private stationsService: StationsService,
    private authService: AuthService
  ) {}

  get isAdmin(): boolean {
    return localStorage.getItem('role') === 'admin';
  }

  get userName(): string {
    return localStorage.getItem('userName') || 'Usuario';
  }

  ngOnInit() {
    // Escuchamos el estado de la sesión en tiempo real
    this.authSub = this.authService.isLoggedIn$.subscribe(status => {
      this.isLoggedIn = status;
      if (status) {
        this.updateAlertCount();
      }
    });

    this.intervalId = setInterval(() => {
      if (this.isLoggedIn) this.updateAlertCount();
    }, 20000);
  }

  ngOnDestroy() {
    if (this.intervalId) clearInterval(this.intervalId);
    if (this.authSub) this.authSub.unsubscribe();
  }

  updateAlertCount() {
    const userId = this.authService.getUserId();
    if (userId) {
      this.stationsService.getAlertCount(userId).subscribe({
        next: (res: any) => {
          if (res && typeof res.count === 'number') {
            this.alertCount = res.count;
          }
        }
      });
    }
  }

  logout() {
  this.authService.logout();
  this.alertCount = 0;
  // Redirigimos al mapa en lugar de al login
  this.router.navigate(['/map']); 
}
}