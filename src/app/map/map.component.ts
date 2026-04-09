import { Component, AfterViewInit, OnDestroy } from '@angular/core';
import { Router } from '@angular/router';
import * as L from 'leaflet';
import { StationsService } from '../stations.service';

@Component({
  selector: 'app-map',
  templateUrl: './map.component.html',
  styleUrls: ['./map.component.scss'],
})
export class MapComponent implements AfterViewInit, OnDestroy {
  private map!: L.Map;
  private userCondition: string | null = '';
  private stationsLayer = L.layerGroup();
  private userLocation: L.LatLng | null = null;
  private lastSyncedCenter: L.LatLng | null = null;
  private defaultView: L.LatLngExpression = [41.3597, 2.1003];

  constructor(
    private router: Router,
    private stationsService: StationsService,
  ) {
    this.userCondition = localStorage.getItem('healthCondition');
  }

  ngAfterViewInit(): void {
    this.initMap();
  }

  ngOnDestroy(): void {
    if (this.map) {
      this.map.remove();
    }
  }

  private initMap(): void {
    this.map = L.map('map').setView(this.defaultView, 13);
    
    L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
      maxZoom: 19,
      attribution: '© OpenStreetMap contributors',
    }).addTo(this.map);

    this.stationsLayer.addTo(this.map);
    this.map.locate({ setView: true, maxZoom: 14, enableHighAccuracy: true });

    this.map.on('locationfound', (e: L.LocationEvent) => {
      this.userLocation = e.latlng;
      this.lastSyncedCenter = e.latlng;
      L.marker(e.latlng, {
        icon: L.icon({
          iconUrl: 'https://raw.githubusercontent.com/pointhi/leaflet-color-markers/master/img/marker-icon-2x-blue.png',
          shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/0.7.7/images/marker-shadow.png',
          iconSize: [25, 41],
          iconAnchor: [12, 41],
        }),
      }).addTo(this.map).bindPopup('Estás aquí').openPopup();
      this.syncLocalData(e.latlng.lat, e.latlng.lng);
    });

    this.map.on('moveend', () => this.handleMapMove());
    this.map.on('locationerror', () => this.loadStations());
  }

  private handleMapMove(): void {
    const currentZoom = this.map.getZoom();
    const currentCenter = this.map.getCenter();
    if (currentZoom < 14) return;
    if (this.lastSyncedCenter && currentCenter.distanceTo(this.lastSyncedCenter) < 5000) return;
    this.lastSyncedCenter = currentCenter;
    const bounds = this.map.getBounds();
    this.stationsService.syncByBounds(
        bounds.getSouthWest().lat, bounds.getSouthWest().lng,
        bounds.getNorthEast().lat, bounds.getNorthEast().lng
    ).subscribe({ next: () => this.loadStations() });
  }

  private syncLocalData(lat: number, lon: number): void {
    this.stationsService.syncByCoords(lat, lon).subscribe({ next: () => this.loadStations() });
  }

  private loadStations(): void {
    this.stationsService.getStations().subscribe({
      next: (stations) => {
        this.stationsLayer.clearLayers();
        stations.forEach((st) => {
          
          const getPopupHtml = (station: any) => {
            const lastM = station.measurements && station.measurements.length > 0
                ? station.measurements[station.measurements.length - 1] : null;
            const aqi = lastM ? lastM.aqi : 0;
            const dateTimeStr = lastM ? new Date(lastM.timestamp).toLocaleString() : 'Sin datos';
            
            // Color logic for the popup text.
            let color = aqi > 50 ? (this.userCondition ? 'red' : 'orange') : 'green';
            let statusText = color === 'red' ? `Riesgo: ${this.userCondition}` : 'Calidad segura';

            return `
              <div style="min-width: 170px; font-family: sans-serif;">
                <h3 style="margin:0;">${station.name}</h3>
                <p style="margin:4px 0; font-size:0.8em; color:#666;">Act: ${dateTimeStr}</p>
                <p style="margin:8px 0;"><strong>AQI:</strong> ${aqi}</p>
                <p style="color:${color}; font-weight:bold; margin-bottom:10px;">${statusText}</p>
                <button id="btn-fav-${station.id}" style="width:100%; cursor:pointer; background:#3f51b5; color:white; border:none; padding:8px; border-radius:4px;">
                  ⭐ Guardar Favorito
                </button>
              </div>`;
          };

          if (st.lat && st.lon) {
            // --- Dynamic color mapping for the circular indicator. ---
            const lastM = st.measurements && st.measurements.length > 0 
                ? st.measurements[st.measurements.length - 1] : null;
            const aqi = lastM ? lastM.aqi : 0;
            let circleColor = aqi > 50 ? (this.userCondition ? 'red' : 'orange') : 'green';

            const circle = L.circle([st.lat, st.lon], { 
              color: circleColor, 
              fillColor: circleColor,
              fillOpacity: 0.4,
              radius: 1500 
            });

            circle.bindPopup(getPopupHtml(st));

            const bindButton = () => {
              const btn = document.getElementById(`btn-fav-${st.id}`);
              if (btn) {
                btn.onclick = (e) => {
                  e.stopPropagation();
                  this.handleFavorite(st.id, st.name);
                };
              }
            };

            circle.on('popupopen', () => {
              bindButton();

              this.stationsService.syncStationData(st.external_id).subscribe({
                next: () => {
                  this.stationsService.getStations().subscribe((all) => {
                    const fresh = all.find(s => s.id === st.id);
                    if (fresh) {
                      // Update popup content.
                      circle.setPopupContent(getPopupHtml(fresh));
                      
                      // Update the circle color to reflect changes in the AQI level.
                      const freshM = fresh.measurements[fresh.measurements.length - 1];
                      const freshAqi = freshM ? freshM.aqi : 0;
                      const freshColor = freshAqi > 50 ? (this.userCondition ? 'red' : 'orange') : 'green';
                      
                      circle.setStyle({ color: freshColor, fillColor: freshColor });

                      setTimeout(() => bindButton(), 10); 
                    }
                  });
                }
              });
            });

            this.stationsLayer.addLayer(circle);
          }
        });
      }
    });
  }

  handleFavorite(stationId: number, defaultName: string) {
    const userId = localStorage.getItem('userId');
    if (!userId) return alert('Inicia sesión primero');
    const alias = window.prompt('¿Qué nombre le pones a esta zona?', defaultName);
    if (alias) {
      this.stationsService.addFavorite(Number(userId), stationId, alias).subscribe({
        next: () => alert(`¡${alias} guardado!`),
        error: () => alert('Error al guardar.')
      });
    }
  }

  logout() {
    localStorage.clear();
    this.router.navigate(['/login']);
  }
}