import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { LoginComponent } from './login/login.component';
import { RegisterComponent } from './register/register.component';
import { MapComponent } from './map/map.component';
import { AlertsHistoryComponent } from './alerts-history/alerts-history.component';
import { FavoritesComponent } from './favorites/favorites.component';
import { AdminPanelComponent } from './admin-panel/admin-panel.component';
import { StatisticsComponent } from './statistics/statistics.component';
import { AdminGuard } from './auth/admin.guard';

const routes: Routes = [
  { path: 'login', component: LoginComponent },
  { path: 'register', component: RegisterComponent },
  { path: 'map', component: MapComponent },
  { path: 'alerts', component: AlertsHistoryComponent },
  { path: 'favorites', component: FavoritesComponent },
  
  { path: 'statistics', component: StatisticsComponent }, 
  
  {
    path: 'admin',
    component: AdminPanelComponent,
    canActivate: [AdminGuard],
  },
  
  // Security redirects
  { path: '', redirectTo: '/login', pathMatch: 'full' },
  { path: '**', redirectTo: '/login' },
];

@NgModule({
  imports: [RouterModule.forRoot(routes)],
  exports: [RouterModule],
})
export class AppRoutingModule {}