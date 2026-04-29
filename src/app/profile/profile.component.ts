import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { AuthService } from '../auth.service';
import { Router } from '@angular/router';
import { MatSnackBar } from '@angular/material/snack-bar'; // Opcional para feedback visual

@Component({
  selector: 'app-profile',
  templateUrl: './profile.component.html',
  styleUrls: ['./profile.component.scss']
})
export class ProfileComponent implements OnInit {
  profileForm!: FormGroup;
  userName: string = '';

  constructor(
    private fb: FormBuilder,
    private authService: AuthService,
    private router: Router
  ) {}

  ngOnInit(): void {
    this.userName = localStorage.getItem('userName') || 'Usuario';
    this.initForm();
    this.loadUserData();
  }

  private initForm() {
    this.profileForm = this.fb.group({
      name: ['', Validators.required],
      email: [{ value: '', disabled: true }], 
      condition: ['', Validators.required],
      sensitivity: ['', Validators.required]
    });

    // Lógica para bloquear sensibilidad si es "Ninguna"
    this.profileForm.get('condition')?.valueChanges.subscribe(value => {
      const sensitivityCtrl = this.profileForm.get('sensitivity');
      if (value === 'Ninguna') {
        sensitivityCtrl?.setValue('Baja');
        sensitivityCtrl?.disable();
      } else {
        sensitivityCtrl?.enable();
      }
    });
  }

  private loadUserData() {
    const condition = localStorage.getItem('healthCondition') || 'Ninguna';
    this.profileForm.patchValue({
      name: localStorage.getItem('userName'),
      email: 'Usuario Identificado', // Puedes poner el email real si lo guardaste
      condition: condition,
      sensitivity: condition === 'Ninguna' ? 'Baja' : 'Media' 
    });
  }

  onUpdate() {
    if (this.profileForm.invalid) return;

    const userId = this.authService.getUserId();
    if (!userId) {
      this.router.navigate(['/login']);
      return;
    }

    // getRawValue incluye los campos deshabilitados (como el email o sensibilidad bloqueada)
    const updateData = this.profileForm.getRawValue();

    this.authService.updateProfile(userId, updateData).subscribe({
      next: (res) => {
        alert('Perfil actualizado con éxito. Tus alertas se ajustarán a tu nuevo perfil.');
        this.userName = res.name;
      },
      error: (err) => {
        console.error('Error actualizando perfil:', err);
        alert('Hubo un error al guardar los cambios.');
      }
    });
  }
}