import { Component, OnInit } from '@angular/core';
import { StationsService } from '../stations.service';
import { Router } from '@angular/router';

@Component({
  selector: 'app-favorites',
  template: `
    <div style="padding: 20px; max-width: 600px; margin: 0 auto;">
      <h2 style="color: #3f51b5; display: flex; align-items: center; gap: 10px;">
        <mat-icon>star</mat-icon> Mis Lugares Favoritos
      </h2>
      <p style="color: #666; margin-bottom: 20px;">Gestiona las estaciones que estás vigilando.</p>
      
      <div *ngIf="favorites.length === 0" style="text-align: center; margin-top: 50px; color: #999;">
        <mat-icon style="font-size: 48px; width: 48px; height: 48px;">location_off</mat-icon>
        <p>No tienes estaciones favoritas guardadas.</p>
      </div>

      <mat-card *ngFor="let fav of favorites" style="margin-bottom: 15px; border-radius: 8px;">
        <mat-card-header>
          <div mat-card-avatar style="background-color: #e8eaf6; display: flex; align-items: center; justify-content: center; border-radius: 50%;">
            <mat-icon style="color: #3f51b5;">place</mat-icon>
          </div>
          <mat-card-title>{{ fav.alias }}</mat-card-title>
          <mat-card-subtitle>{{ fav.station.name }}</mat-card-subtitle>
        </mat-card-header>
        
        <mat-card-content style="margin-top: 10px;">
          <p *ngIf="fav.station.measurements?.length > 0">
            <strong>Calidad del aire actual:</strong> 
            <span [style.color]="fav.station.measurements[fav.station.measurements.length-1].aqi > 50 ? 'red' : 'green'">
               {{ fav.station.measurements[fav.station.measurements.length-1].aqi }} AQI
            </span>
          </p>
        </mat-card-content>

        <mat-card-actions align="end">
          <button mat-button color="warn" (click)="unfollow(fav.id)">
            <mat-icon>delete</mat-icon> DEJAR DE SEGUIR
          </button>
        </mat-card-actions>
      </mat-card>
    </div>
  `
})
export class FavoritesComponent implements OnInit {
  favorites: any[] = [];

  constructor(private stationsService: StationsService, private router: Router) {}

  ngOnInit(): void {
    this.loadFavorites();
  }

  loadFavorites() {
    const userId = localStorage.getItem('userId');
    if (userId) {
      this.stationsService.getFavorites(Number(userId)).subscribe({
        next: (data) => this.favorites = data,
        error: (err) => console.error('Error al cargar favoritos', err)
      });
    }
  }

  unfollow(id: number) {
    if (confirm('¿Seguro que quieres dejar de seguir esta estación?')) {
      this.stationsService.removeFavorite(id).subscribe({
        next: () => {
          // Filtramos la lista local para que desaparezca al instante sin recargar
          this.favorites = this.favorites.filter(f => f.id !== id);
        },
        error: (err) => alert('No se pudo eliminar el favorito.')
      });
    }
  }
}