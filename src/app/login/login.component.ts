import { Component } from '@angular/core';
import { AuthService } from '../auth.service';
import { Router } from '@angular/router';

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
    private router: Router
  ) {}

  onLogin() {
    this.authService.login(this.loginData).subscribe({
      next: (user) => {
        // Store key data in browser storage.
        localStorage.setItem('userId', user.id.toString());
        localStorage.setItem('userRole', user.role); // 'admin' o 'user'
        localStorage.setItem('userName', user.name);

        alert('¡Bienvenido, ' + user.name + '!');
        
        // Smart redirection.
        if (user.role === 'admin') {
          this.router.navigate(['/admin']);
        } else {
          this.router.navigate(['/map']);
        }
      },
      error: (err) => {
        console.error('Fallo en el login:', err);
        alert('Credenciales incorrectas. Verifica tu email y contraseña.');
      }
    });
  }
}