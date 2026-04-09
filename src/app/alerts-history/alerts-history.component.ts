import { Component, OnInit } from '@angular/core';
import { HttpClient } from '@angular/common/http';

@Component({
  selector: 'app-alerts-history',
  template: `
    <div style="padding: 20px; max-width: 600px; margin: 0 auto;">
      <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 10px;">
        <h2 style="color: #3f51b5; display: flex; align-items: center; gap: 10px; margin: 0;">
          <mat-icon>notifications_active</mat-icon> Historial de Alertas
        </h2>
        <button mat-button color="warn" *ngIf="alerts.length > 0" (click)="deleteAll()">
          <mat-icon>delete_sweep</mat-icon> Borrar todo
        </button>
      </div>
      <hr>
      
      <div *ngIf="alerts.length === 0" style="text-align: center; margin-top: 40px; color: #666;">
        <mat-icon style="font-size: 48px; width: 48px; height: 48px;">sentiment_satisfied</mat-icon>
        <p>Tu historial está vacío. ¡Buen trabajo!</p>
      </div>

      <mat-card *ngFor="let alert of alerts" 
                [style.background]="alert.is_read ? '#ffffff' : '#fff5f5'"
                [style.border-left]="alert.is_read ? '6px solid #ccc' : '6px solid #f44336'"
                style="margin-bottom: 15px; position: relative;">
        <mat-card-header>
          <mat-card-title style="font-size: 1em; font-weight: bold; padding-right: 30px;">
            <span *ngIf="!alert.is_read" style="color: #f44336; margin-right: 5px;">●</span>
            {{ alert.message }}
          </mat-card-title>
          <mat-card-subtitle style="font-size: 0.8em; margin-top: 5px;">
            <mat-icon style="font-size: 14px; vertical-align: middle; width:14px; height:14px;">schedule</mat-icon> 
            {{ alert.sent_at | date:'dd/MM/yyyy HH:mm' }}
          </mat-card-subtitle>
        </mat-card-header>

        <button mat-icon-button color="warn" 
                style="position: absolute; top: 8px; right: 8px;"
                (click)="deleteOne(alert.id)">
          <mat-icon style="font-size: 20px;">delete_outline</mat-icon>
        </button>
      </mat-card>
    </div>
  `
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
      this.http.get<any[]>(`http://localhost:3000/alerts-log/user/${userId}`).subscribe({
        next: (data) => {
          this.alerts = data;
          // Si hay alguna alerta sin leer, marcamos todas como leídas
          if (this.alerts.some(a => !a.is_read)) {
            this.markAsRead(userId);
          }
        },
        error: (err) => console.error('Error al cargar alertas', err)
      });
    }
  }

  deleteOne(id: number) {
    this.http.delete(`http://localhost:3000/alerts-log/${id}`).subscribe({
      next: () => {
        // Filtramos la lista local para que desaparezca al instante
        this.alerts = this.alerts.filter(a => a.id !== id);
      },
      error: (err) => console.error('Error al borrar alerta', err)
    });
  }

  deleteAll() {
    const userId = localStorage.getItem('userId');
    if (userId && confirm('¿Estás seguro de que quieres vaciar todo el historial?')) {
      this.http.delete(`http://localhost:3000/alerts-log/clear/${userId}`).subscribe({
        next: () => {
          this.alerts = [];
        },
        error: (err) => console.error('Error al vaciar historial', err)
      });
    }
  }

  markAsRead(userId: string) {
    this.http.patch(`http://localhost:3000/alerts-log/read/${userId}`, {}).subscribe({
      next: () => console.log('Notificaciones marcadas como leídas'),
      error: (err) => console.error('Error al actualizar lectura', err)
    });
  }
}