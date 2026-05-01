import { Component, AfterViewInit, OnDestroy, OnInit, ElementRef } from '@angular/core';
import { Router } from '@angular/router';
import * as L from 'leaflet';
import { Subscription } from 'rxjs';
import { StationsService } from '../stations.service';
import { AuthService } from '../auth.service';

@Component({
  selector: 'app-map',
  templateUrl: './map.component.html',
  styleUrls: ['./map.component.scss'],
})
export class MapComponent implements AfterViewInit, OnDestroy, OnInit {
  private map!: L.Map;
  private stationsLayer = L.layerGroup();
  private defaultView: L.LatLngExpression = [41.3597, 2.1003];
  private resizeObserver: ResizeObserver | null = null;
  private authSub!: Subscription;

  showSummaryCard = false;
  showWelcome = false; // Controla la visibilidad del cuadro de bienvenida
  userName: string | null = '';
  favoriteDetails: any[] = [];
  userFavorites: any[] = [];
  isAnyContaminated = false;

  constructor(
    private router: Router, 
    private stationsService: StationsService,
    private authService: AuthService,
    private elRef: ElementRef 
  ) {
    this.userName = localStorage.getItem('userName');
  }

  ngOnInit(): void {
    this.authSub = this.authService.isLoggedIn$.subscribe(isLoggedIn => {
      if (isLoggedIn) {
        // Si el usuario está logueado, ocultamos el cuadro de bienvenida por si acaso
        this.showWelcome = false;

        const userId = localStorage.getItem('userId');
        if (userId) {
          this.showSummaryCard = true;
          this.userName = localStorage.getItem('userName');
          this.loadDashboardAndFavorites(Number(userId), true);
        }
      } else {
        // Si el usuario se desloguea o entra como invitado:
        this.showSummaryCard = false;
        this.userName = '';
        this.userFavorites = [];
        this.favoriteDetails = [];
        this.isAnyContaminated = false;
        
        if (this.map) {
          this.loadStations();
        }

        // Comprobamos si el invitado ya vio el mensaje anteriormente
        const hasSeenWelcome = localStorage.getItem('welcomeSeen');
        if (!hasSeenWelcome) {
          this.showWelcome = true;
        }
      }
    });
  }

  ngAfterViewInit(): void {
    this.initMap();

    this.resizeObserver = new ResizeObserver(() => {
      if (this.map) {
        this.map.invalidateSize();
      }
    });
    this.resizeObserver.observe(this.elRef.nativeElement);
  }

  ngOnDestroy(): void {
    if (this.authSub) {
      this.authSub.unsubscribe();
    }
    if (this.resizeObserver) {
      this.resizeObserver.disconnect();
    }
    if (this.map) {
      this.map.remove();
    }
  }

  closeWelcome(): void {
    this.showWelcome = false;
    localStorage.setItem('welcomeSeen', 'true');
  }

  private initMap(): void {
    this.map = L.map('map').setView(this.defaultView, 13);
    
    L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
      maxZoom: 19,
      attribution: '© OpenStreetMap contributors',
    }).addTo(this.map);

    this.stationsLayer.addTo(this.map);

    this.map.on('locationfound', (e: L.LocationEvent) => {
      L.circleMarker(e.latlng, {
        radius: 8,
        fillColor: '#3f51b5',
        color: '#fff',
        weight: 2,
        fillOpacity: 1
      }).addTo(this.map).bindPopup('Tu ubicación actual');

      this.stationsService.syncByCoords(e.latlng.lat, e.latlng.lng).subscribe({ 
        next: () => this.loadStations() 
      });
    });

    this.map.on('locationerror', (err) => {
      this.loadStations(); 
    });

    setTimeout(() => {
      this.map.invalidateSize();
      this.map.locate({ 
        setView: true, 
        maxZoom: 14,
        enableHighAccuracy: true 
      });
    }, 500);

    this.map.on('moveend', () => this.handleMapMove());
  }


  loadDashboardAndFavorites(userId: number, updateMap: boolean = false) {
    this.stationsService.getFavorites(userId).subscribe(favs => {
      this.userFavorites = favs;
      this.favoriteDetails = [];
      this.isAnyContaminated = false;
      
      favs.slice(0, 3).forEach(fav => {
        this.stationsService.getStationHistory(fav.station.id, 24).subscribe(history => {
          if (history && history.length > 0) {
            const lastM = history[0];
            const avgAqi = Math.round(history.reduce((acc, curr) => acc + curr.aqi, 0) / history.length);
            if (lastM.aqi >= 50) this.isAnyContaminated = true;

            this.favoriteDetails.push({
              name: fav.alias || fav.station.name,
              currentAqi: lastM.aqi,
              averageAqi: avgAqi,
              pm25: lastM.pm25,
              no2: lastM.no2
            });
          }
        });
      });
      if (this.map && updateMap) this.loadStations();
    });
  }

  getAqiColor(aqi: number): string {
    if (aqi < 50) return '#4caf50'; 
    if (aqi < 100) return '#ff9800'; 
    return '#f44336'; 
  }

  closeCard() { this.showSummaryCard = false; }

  private handleMapMove(): void {
    if (this.map.getZoom() < 14) return;
    const bounds = this.map.getBounds();
    this.stationsService.syncByBounds(
      bounds.getSouthWest().lat, bounds.getSouthWest().lng,
      bounds.getNorthEast().lat, bounds.getNorthEast().lng
    ).subscribe({ next: () => this.loadStations() });
  }

  private loadStations(): void {
    this.stationsService.getStations().subscribe(stations => {
      this.stationsLayer.clearLayers();
      
      stations.forEach(st => {
        if (st.lat && st.lon) {
          const getPopupHtml = (station: any) => {
            const lastM = station.measurements?.[0];
            const aqi = lastM ? lastM.aqi : 0;
            const dateTimeStr = lastM ? new Date(lastM.timestamp).toLocaleString() : 'Sin datos';
            const statusText = aqi < 50 ? 'Estado: Aire Limpio' : 'Estado: Aire Excesivamente Contaminado';
            const statusColor = aqi < 50 ? '#2e7d32' : '#f44336';
            const isFav = this.userFavorites.some(f => f.station.id === station.id);

            const baseBtnStyle = `
              width: 100%; cursor: pointer; border: none; padding: 12px;
              border-radius: 4px; font-family: 'Roboto', sans-serif; font-size: 13px;
              font-weight: 500; text-transform: uppercase; letter-spacing: 0.5px;
              box-shadow: 0px 3px 5px rgba(0,0,0,0.2);
              transition: background-color 250ms; margin-top: 10px; 
              display: flex; align-items: center; justify-content: center; gap: 8px;
              box-sizing: border-box;
            `;

            let actionHtml = '';
            if (this.authService.isLoggedIn()) {
              actionHtml = isFav 
                ? `<button id="btn-unfav-${station.id}" style="${baseBtnStyle} background-color: #f44336; color: white;">× DEJAR DE SEGUIR</button>`
                : `<button id="btn-fav-${station.id}" style="${baseBtnStyle} background-color: #2e7d32; color: white;"><span>⭐</span> GUARDAR FAVORITO</button>`;
            } else {
              actionHtml = `
                <div style="background-color: #f1f8e9; border-left: 4px solid #43a047; padding: 10px; margin-top: 12px; border-radius: 4px;">
                  <p style="margin: 0; color: #2e7d32; font-size: 12px; line-height: 1.4;">
                    <strong>¿Te interesa esta zona?</strong><br>
                    Regístrate para guardar favoritos y recibir alertas de salud personalizadas.
                  </p>
                </div>`;
            }

            return `
              <div style="width: 100%; min-width: 260px; font-family: 'Roboto', sans-serif; padding: 10px; box-sizing: border-box;">
                <h3 style="margin: 0 0 4px 0; color: #333; font-size: 16px;">${station.name}</h3>
                <p style="margin: 0 0 12px 0; font-size: 11px; color: #777;">Actualizado: ${dateTimeStr}</p>
                <div style="display: flex; align-items: baseline; gap: 8px; margin-bottom: 4px;">
                  <span style="font-size: 28px; font-weight: bold;">${aqi}</span>
                  <span style="font-size: 12px; color: #888; text-transform: uppercase;">AQI</span>
                </div>
                <p style="color: ${statusColor}; font-weight: 600; font-size: 14px;">${statusText}</p>
                ${actionHtml}
              </div>`;
          };

          const lastM = st.measurements?.[0];
          const aqi = lastM?.aqi || 0;
          const isFav = this.userFavorites.some(f => f.station.id === st.id);
          const color = aqi >= 50 ? '#f44336' : '#2e7d32';

          const circle = L.circle([st.lat, st.lon], { 
            color: isFav ? '#FFD600' : color, 
            weight: isFav ? 5 : 1,
            fillColor: color, 
            fillOpacity: 0.4, 
            radius: 1500 
          });

          circle.bindPopup(getPopupHtml(st), { minWidth: 280, maxWidth: 300 });

          circle.on('popupopen', () => {
            if (this.authService.isLoggedIn()) {
              const btnFav = document.getElementById(`btn-fav-${st.id}`);
              if (btnFav) btnFav.onclick = () => this.handleFavorite(st.id, st.name);
              const btnUnfav = document.getElementById(`btn-unfav-${st.id}`);
              if (btnUnfav) btnUnfav.onclick = () => this.handleRemoveFavorite(st.id);
            }
            this.stationsService.syncStationData(st.external_id).subscribe();
          });

          circle.addTo(this.stationsLayer);
        }
      });
    });
  }

  handleFavorite(stationId: number, defaultName: string) {
    const userId = localStorage.getItem('userId');
    const alias = window.prompt('Nombre para este favorito:', defaultName);
    if (alias && userId) {
      this.stationsService.addFavorite(Number(userId), stationId, alias).subscribe(() => {
        this.loadDashboardAndFavorites(Number(userId), true);
      });
    }
  }

  handleRemoveFavorite(stationId: number) {
    const userId = localStorage.getItem('userId');
    const fav = this.userFavorites.find(f => f.station.id === stationId);
    if (fav && userId) {
      this.stationsService.removeFavorite(fav.id).subscribe(() => {
        this.loadDashboardAndFavorites(Number(userId), true);
      });
    }
  }

  logout() {
    this.authService.logout();
    this.router.navigate(['/map']);
  }
}