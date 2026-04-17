import { Component, OnInit } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { environment } from '../../environments/environment'; // IMPORTADO

@Component({
  selector: 'app-alerts-history',
  templateUrl: './alerts-history.component.html',
  styleUrls: ['./alerts-history.component.scss']
})
export class AlertsHistoryComponent implements OnInit {
  alerts: any[] = [];

  constructor(private http: HttpClient) {}

  ngOnInit() {
    this.loadAlerts();
  }

  loadAlerts() {
    const userId = localStorage.getItem('userId');
    if (userId) {
      this.http.get<any[]>(`${environment.apiUrl}/alerts-log/user/${userId}`).subscribe({
        next: (data) => {
          this.alerts = data;
          if (this.alerts.some(a => !a.is_read)) {
            this.markAsRead(userId);
          }
        },
        error: (err) => console.error('Error al cargar alertas', err)
      });
    }
  }

  deleteOne(id: number) {
    this.http.delete(`${environment.apiUrl}/alerts-log/${id}`).subscribe({
      next: () => {
        this.alerts = this.alerts.filter(a => a.id !== id);
      },
      error: (err) => console.error('Error al borrar alerta', err)
    });
  }

  deleteAll() {
    const userId = localStorage.getItem('userId');
    if (userId && confirm('¿Estás seguro de que quieres vaciar todo el historial?')) {
      this.http.delete(`${environment.apiUrl}/alerts-log/clear/${userId}`).subscribe({
        next: () => {
          this.alerts = [];
        },
        error: (err) => console.error('Error al vaciar historial', err)
      });
    }
  }

  markAsRead(userId: string) {
    this.http.patch(`${environment.apiUrl}/alerts-log/read/${userId}`, {}).subscribe({
      next: () => console.log('Notificaciones marcadas como leídas'),
      error: (err) => console.error('Error al actualizar lectura', err)
    });
  }
}