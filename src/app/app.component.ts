import { Component, OnInit, OnDestroy } from '@angular/core';
import { Router } from '@angular/router';
import { StationsService } from './stations.service';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.scss']
})
export class AppComponent implements OnInit, OnDestroy {
  alertCount = 0;
  private intervalId: any;

  constructor(private router: Router, private stationsService: StationsService) {}

  // Sensor to show/hide the admin panel.
  get isAdmin(): boolean {
    return localStorage.getItem('isAdmin') === 'true';
  }

  ngOnInit() {
    this.updateAlertCount();
    // Refresh every 30 seconds (same as your backup).
    this.intervalId = setInterval(() => this.updateAlertCount(), 30000);
  }

  ngOnDestroy() {
    if (this.intervalId) clearInterval(this.intervalId);
  }

  updateAlertCount() {
    const userId = localStorage.getItem('userId');
    if (userId) {
      this.stationsService.getAlertCount(Number(userId)).subscribe({
        next: (res: any) => {
          // We ensure the value is assigned as a number.
          this.alertCount = res.count || 0;
          console.log('🔔 Valor asignado a la campana:', this.alertCount);
        },
        error: () => this.alertCount = 0
      });
    }
  }

  logout() {
    localStorage.clear();
    this.alertCount = 0;
    this.router.navigate(['/login']);
  }
}