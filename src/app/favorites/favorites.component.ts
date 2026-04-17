import { Component, OnInit } from '@angular/core';
import { StationsService } from '../stations.service';
import { Router } from '@angular/router';

@Component({
  selector: 'app-favorites',
  templateUrl: './favorites.component.html',
  styleUrls: ['./favorites.component.scss']
})
export class FavoritesComponent implements OnInit {
  favorites: any[] = [];

  constructor(private stationsService: StationsService, private router: Router) {}

  ngOnInit(): void {
    this.loadFavorites();
  }

  getAqiColor(aqi: number): string {
    if (!aqi) return '#999';
    return aqi < 50 ? '#2e7d32' : '#f44336';
  }

  loadFavorites() {
    const userId = localStorage.getItem('userId');
    if (userId) {
      this.stationsService.getFavorites(Number(userId)).subscribe({
        next: (data) => {
          this.favorites = data.map(fav => ({
            ...fav,
            currentAqi: (fav.station.measurements && fav.station.measurements.length > 0) 
                         ? fav.station.measurements[0].aqi 
                         : 0
          }));
        },
        error: (err) => console.error('Error al cargar favoritos', err)
      });
    }
  }

  unfollow(id: number) {
    if (confirm('¿Seguro que quieres dejar de seguir esta estación?')) {
      this.stationsService.removeFavorite(id).subscribe({
        next: () => {
          this.favorites = this.favorites.filter(f => f.id !== id);
        },
        error: (err) => alert('No se pudo eliminar el favorito.')
      });
    }
  }
}