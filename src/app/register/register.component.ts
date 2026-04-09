import { Component } from '@angular/core';
import { AuthService } from '../auth.service';
import { Router } from '@angular/router';

@Component({
  selector: 'app-register', 
  templateUrl: './register.component.html',
  styleUrls: ['./register.component.scss']
})
export class RegisterComponent { 
  
  userData = {
    name: '',
    email: '',
    password: '',
    condition: '',
    sensitivity: ''
  };

  constructor(
    private authService: AuthService, 
    private router: Router
  ) {}

  onRegister() {
    const payload = {
      name: this.userData.name,
      email: this.userData.email,
      password: this.userData.password,
      healthProfile: {
        condition: this.userData.condition,
        sensitivityLevel: this.userData.sensitivity // Mapeo a DB
      }
    };

    this.authService.register(payload).subscribe({
      next: () => {
        alert('Registration successful!');
        this.router.navigate(['/login']);
      },
      error: (err) => {
        console.error('Registration error:', err);
        alert('Error during registration.');
      }
    });
  }
}