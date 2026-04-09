import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class StationsService {
  private apiUrl = 'http://localhost:3000/stations';
  private favoritesUrl = 'http://localhost:3000/user-favorites'; 

  constructor(private http: HttpClient) { }

  getStations(): Observable<any[]> {
    return this.http.get<any[]>(this.apiUrl);
  }

  syncByCoords(lat: number, lon: number): Observable<any> {
    return this.http.post(`${this.apiUrl}/sync/coords`, { lat, lon });
  }

  syncByBounds(swLat: number, swLon: number, neLat: number, neLon: number): Observable<any> {
    return this.http.post(`${this.apiUrl}/sync/bounds`, { swLat, swLon, neLat, neLon });
  }

  syncStationData(externalId: string): Observable<any> {
    return this.http.post(`${this.apiUrl}/sync/@${externalId}`, {});
  }

  // --- FAVORITES SECTION ---

  addFavorite(userId: number, stationId: number, alias: string): Observable<any> {
    return this.http.post(this.favoritesUrl, { userId, stationId, alias });
  }

  // Retrieve all favorites for a user
  getFavorites(userId: number): Observable<any[]> {
    return this.http.get<any[]>(`${this.favoritesUrl}/user/${userId}`);
  }

  // Remove a favorite
  removeFavorite(id: number): Observable<any> {
    return this.http.delete(`${this.favoritesUrl}/${id}`);
  }
}