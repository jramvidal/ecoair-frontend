import { Component, OnInit } from '@angular/core';
import { HttpClient } from '@angular/common/http';

@Component({
  selector: 'app-admin-panel',
  templateUrl: './admin-panel.component.html',
  styleUrls: ['./admin-panel.component.scss']
})
export class AdminPanelComponent implements OnInit {
  thresholds: any[] = [];
  cronFrequency: string = '';
  loading: boolean = false;

  constructor(private http: HttpClient) {}

  ngOnInit() {
    this.loadThresholds();
    this.loadCronStatus();
  }

  loadThresholds() {
    this.http.get<any[]>('http://localhost:3000/alerts-log/thresholds').subscribe(res => {
      this.thresholds = res;
    });
  }

  loadCronStatus() {
    this.http.get<any>('http://localhost:3000/stations/cron/status').subscribe(res => {
      this.cronFrequency = res.frequency;
    });
  }

  updateThreshold(t: any) {
    this.http.patch(`http://localhost:3000/alerts-log/thresholds/${t.id}`, t).subscribe(() => {
      alert('Umbral actualizado con éxito');
    });
  }

  setCron(minutes: number) {
    this.loading = true;
    this.http.post('http://localhost:3000/stations/cron/frequency', { minutes }).subscribe((res: any) => {
      this.cronFrequency = res.frequency;
      this.loading = false;
    });
  }
}