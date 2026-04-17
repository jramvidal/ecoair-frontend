import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../environments/environment'; // IMPORTANTE: Importamos el entorno

@Injectable({
  providedIn: 'root'
})
export class StationsService {
  // Usamos la URL base del entorno y añadimos el endpoint correspondiente
  private apiUrl = `${environment.apiUrl}/stations`;
  private favoritesUrl = `${environment.apiUrl}/user-favorites`; 
  private alertsUrl = `${environment.apiUrl}/alerts`;

  constructor(private http: HttpClient) { }

  getStations(): Observable<any[]> {
    return this.http.get<any[]>(this.apiUrl);
  }

  getAlertCount(userId: number): Observable<{count: number}> {
    // Corregido para usar la variable de entorno también aquí
    return this.http.get<{count: number}>(`${environment.apiUrl}/alerts-log/count/${userId}`);
  }

  getStationHistory(stationId: number, limit: number = 30): Observable<any[]> {
    return this.http.get<any[]>(`${this.apiUrl}/${stationId}/history?limit=${limit}`);
  }

  getUserAlerts(userId: number): Observable<any[]> {
    return this.http.get<any[]>(`${this.alertsUrl}/user/${userId}`);
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

  addFavorite(userId: number, stationId: number, alias: string): Observable<any> {
    return this.http.post(this.favoritesUrl, { userId, stationId, alias });
  }

  getFavorites(userId: number): Observable<any[]> {
    return this.http.get<any[]>(`${this.favoritesUrl}/user/${userId}`);
  }

  removeFavorite(id: number): Observable<any> {
    return this.http.delete(`${this.favoritesUrl}/${id}`);
  }
}