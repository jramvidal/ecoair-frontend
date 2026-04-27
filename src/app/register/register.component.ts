import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
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
      password: ['', [
        Validators.required, 
        Validators.minLength(8),
        Validators.pattern(/^(?=.*[a-z])(?=.*[A-Z])(?=.*[0-9]).*$/) // Mayus, minus, número
      ]],
      confirmPassword: ['', Validators.required],
      condition: ['', Validators.required],
      sensitivity: ['', Validators.required]
    }, { 
      validators: this.passwordMatchValidator 
    });

    // Lógica para usuario Sano ("Ninguna")
    this.registerForm.get('condition')?.valueChanges.subscribe(value => {
      const sensitivityCtrl = this.registerForm.get('sensitivity');
      if (value === 'Ninguna') {
        sensitivityCtrl?.setValue('Baja');
        sensitivityCtrl?.disable(); // Se deshabilita pero mantiene el valor
      } else {
        sensitivityCtrl?.enable();
        if (sensitivityCtrl?.value === 'Baja' && value !== 'Ninguna') {
           sensitivityCtrl?.setValue(''); // Forzamos a elegir si no es sano
        }
      }
    });
  }

  passwordMatchValidator(g: FormGroup) {
    const p = g.get('password')?.value;
    const cp = g.get('confirmPassword')?.value;
    return p === cp ? null : { mismatch: true };
  }

  onRegister() {
    if (this.registerForm.invalid) return;

    // getRawValue() es CLAVE: incluye campos deshabilitados (como sensibilidad en sanos)
    const rawData = this.registerForm.getRawValue();

    const payload = {
      name: rawData.name,
      email: rawData.email,
      password: rawData.password,
      healthProfile: {
        condition: rawData.condition,
        sensitivityLevel: rawData.sensitivity 
      }
    };

    this.authService.register(payload).subscribe({
      next: () => {
        alert('¡Registro completado con éxito!');
        this.router.navigate(['/login']);
      },
      error: (err) => {
        console.error('Error:', err);
        alert('Hubo un error en el registro.');
      }
    });
  }
}