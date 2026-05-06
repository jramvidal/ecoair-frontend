import { Component } from '@angular/core';
import { AuthService } from '../auth.service';
import { Router } from '@angular/router';
import { PushNotificationService } from '../push-notification.service';

@Component({
  selector: 'app-login',
  templateUrl: './login.component.html',
  styleUrls: ['./login.component.scss']
})
export class LoginComponent {
  loginData = {
    email: '',
    password: ''
  };

  constructor(
    private authService: AuthService,
    private router: Router,
    private pushNotificationService: PushNotificationService
  ) {}

  onLogin() {
    // Solicitamos permiso SÍNCRONAMENTE en el momento del click para satisfacer a iOS/Android.
    if ('Notification' in window && Notification.permission !== 'granted') {
      Notification.requestPermission();
    }

    this.authService.login(this.loginData).subscribe({
      next: (user) => {
        // --- Data saving ---
        localStorage.setItem('userId', user.id.toString());
        localStorage.setItem('userName', user.name);
        
        // We save the original role
        localStorage.setItem('userRole', user.role); 
        
        // If the role is "admin", it will store the text "true"; otherwise, it will store "false".
        localStorage.setItem('isAdmin', (user.role === 'admin').toString());

        if (user.role === 'admin') {
          this.router.navigate(['/admin']);
        } else {
          this.router.navigate(['/map']);
        }
        
        // Ahora que estamos logueados y el navegador nos ha dado permiso (o ya lo teníamos), enviamos el token al servidor
        this.pushNotificationService.requestPermissionAndGetToken();
      },
      error: (err) => {
        console.error('Fallo en el login:', err);
        alert('Credenciales incorrectas. Verifica tu email y contraseña.');
      }
    });
  }
}