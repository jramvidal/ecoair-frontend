import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms'; // Importar herramientas de formularios
import { AuthService } from '../auth.service';
import { Router } from '@angular/router';

@Component({
  selector: 'app-register',
  templateUrl: './register.component.html',
  styleUrls: ['./register.component.scss']
})
export class RegisterComponent implements OnInit {
  
  registerForm!: FormGroup;

  constructor(
    private fb: FormBuilder, 
    private authService: AuthService, 
    private router: Router
  ) {}

  ngOnInit(): void {
    this.initForm();
  }

  private initForm() {
    this.registerForm = this.fb.group({
      name: ['', Validators.required],
      email: ['', [Validators.required, Validators.email]],
      // Validación: min 8 caracteres, 1 mayúscula, 1 minúscula, 1 número
      password: ['', [
        Validators.required, 
        Validators.minLength(8),
        Validators.pattern(/^(?=.*[a-z])(?=.*[A-Z])(?=.*[0-9]).*$/)
      ]],
      confirmPassword: ['', Validators.required],
      condition: ['', Validators.required],
      sensitivity: ['', Validators.required]
    }, { 
      validators: this.passwordMatchValidator // Validador personalizado
    });
  }

  // Validador para comparar contraseñas
  passwordMatchValidator(g: FormGroup) {
    const password = g.get('password')?.value;
    const confirmPassword = g.get('confirmPassword')?.value;
    return password === confirmPassword ? null : { mismatch: true };
  }

  onRegister() {
    if (this.registerForm.invalid) return;

    const rawValue = this.registerForm.value;
    
    // Mapeamos al formato que espera tu Backend (NestJS)
    const payload = {
      name: rawValue.name,
      email: rawValue.email,
      password: rawValue.password, // Solo enviamos la contraseña una vez
      healthProfile: {
        condition: rawValue.condition,
        sensitivityLevel: rawValue.sensitivity
      }
    };

    this.authService.register(payload).subscribe({
      next: () => {
        alert('¡Registro exitoso!');
        this.router.navigate(['/login']);
      },
      error: (err) => {
        console.error('Error en registro:', err);
        alert('Error durante el registro.');
      }
    });
  }
}