import { Component, OnInit } from '@angular/core';
import { StationsService } from '../stations.service';
import { AuthService } from '../auth.service';
import { ChartOptions } from 'chart.js';

@Component({
  selector: 'app-statistics',
  templateUrl: './statistics.component.html',
  styleUrls: ['./statistics.component.scss']
})
export class StatisticsComponent implements OnInit {
  favorites: any[] = [];
  chartsData: any[] = [];

  public lineChartOptions: ChartOptions<'line'> = {
    responsive: true,
    maintainAspectRatio: false,
    scales: {
      y: { 
        beginAtZero: true, 
        title: { display: true, text: 'AQI' }
      },
      x: { 
        ticks: { autoSkip: true, maxTicksLimit: 8 }
      }
    },
    plugins: {
      legend: { display: false }
    }
  };

  constructor(
    private stationsService: StationsService,
    private authService: AuthService
  ) {}

  ngOnInit(): void {
    this.loadFavoritesAndHistory();
  }

  // Function to determine the color based on the AQI level.
  private getAqiColor(aqi: number, alpha: number = 1): string {
    if (aqi <= 50) return `rgba(46, 125, 50, ${alpha})`;    // Verde (Bueno)
    if (aqi <= 100) return `rgba(255, 160, 0, ${alpha})`;   // Naranja (Moderado)
    return `rgba(211, 47, 47, ${alpha})`;                   // Rojo (Insalubre)
  }

  loadFavoritesAndHistory() {
    const userId = this.authService.getUserId();
    if (!userId) return;

    this.stationsService.getFavorites(userId).subscribe({
      next: (favs) => {
        this.favorites = favs;
        this.chartsData = [];

        this.favorites.forEach(fav => {
          // We request the last 24 measurements (representing 24h if the cron runs hourly).
          this.stationsService.getStationHistory(fav.station.id, 24).subscribe({
            next: (history) => {
              const dataSorted = [...history].reverse();
              
              // 1. Calculation of the average.
              const sum = dataSorted.reduce((acc, curr) => acc + curr.aqi, 0);
              const average = dataSorted.length > 0 ? Math.round(sum / dataSorted.length) : 0;

              // 2. Determine color based on the average.
              const themeColor = this.getAqiColor(average);
              const themeColorAlpha = this.getAqiColor(average, 0.1);

              const chartConfig = {
                stationName: fav.alias || fav.station.name,
                lastAqi: dataSorted[dataSorted.length - 1]?.aqi || 0,
                averageAqi: average,
                color: themeColor,
                data: {
                  labels: dataSorted.map(h => 
                    new Date(h.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
                  ),
                  datasets: [{
                    data: dataSorted.map(h => h.aqi),
                    label: 'AQI',
                    borderColor: themeColor,
                    backgroundColor: themeColorAlpha,
                    fill: true,
                    tension: 0.3,
                    pointRadius: 3,
                    pointBackgroundColor: themeColor
                  }]
                }
              };
              this.chartsData.push(chartConfig);
            }
          });
        });
      }
    });
  }
}