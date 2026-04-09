import { Component, OnInit, OnDestroy } from '@angular/core';
import { Router } from '@angular/router';
import { HttpClient } from '@angular/common/http';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.scss']
})
export class AppComponent implements OnInit, OnDestroy {
  alertCount: number = 0;
  userRole: string | null = null; // Store the user role for menu navigation.
  private intervalId: any;

  constructor(private router: Router, private http: HttpClient) {}

  ngOnInit() {
    // Fetch initial data.
    this.updateAlertCount();
    
    // Refresh cycle every 30 seconds.
    this.intervalId = setInterval(() => {
      this.updateAlertCount();
    }, 30000);
  }

  ngOnDestroy() {
    if (this.intervalId) {
      clearInterval(this.intervalId);
    }
  }

  updateAlertCount() {
    const userId = localStorage.getItem('userId');
    // Retrieve the role from localStorage (stored during login).
    this.userRole = localStorage.getItem('userRole');

    if (userId) {
      this.http.get<{count: number}>(`http://localhost:3000/alerts-log/count/${userId}`).subscribe({
        next: (res) => this.alertCount = res.count,
        error: () => console.log('Esperando login para contar alertas...')
      });
    } else {
      this.alertCount = 0;
      this.userRole = null;
    }
  }

  logout() {
    // Clear all session data.
    localStorage.clear();
    this.alertCount = 0;
    this.userRole = null;
    this.router.navigate(['/login']);
  }
}