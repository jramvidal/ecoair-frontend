import { ComponentFixture, TestBed } from '@angular/core/testing';
import { LoginComponent } from './login.component';
import { AuthService } from '../auth.service';
import { Router } from '@angular/router';
import { PushNotificationService } from '../push-notification.service';
import { of, throwError } from 'rxjs';
import { FormsModule } from '@angular/forms';
import { MatCardModule } from '@angular/material/card';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { NoopAnimationsModule } from '@angular/platform-browser/animations';

describe('LoginComponent', () => {
  let component: LoginComponent;
  let fixture: ComponentFixture<LoginComponent>;
  let authServiceSpy: jasmine.SpyObj<AuthService>;
  let routerSpy: jasmine.SpyObj<Router>;
  let pushServiceSpy: jasmine.SpyObj<PushNotificationService>;

  beforeEach(async () => {
    const authSpy = jasmine.createSpyObj('AuthService', ['login']);
    const navSpy = jasmine.createSpyObj('Router', ['navigate']);
    const pushSpy = jasmine.createSpyObj('PushNotificationService', ['requestPermissionAndGetToken']);

    await TestBed.configureTestingModule({
      declarations: [ LoginComponent ],
      imports: [
        FormsModule,
        MatCardModule,
        MatFormFieldModule,
        MatInputModule,
        NoopAnimationsModule // Required for material inputs in tests
      ],
      providers: [
        { provide: AuthService, useValue: authSpy },
        { provide: Router, useValue: navSpy },
        { provide: PushNotificationService, useValue: pushSpy }
      ]
    })
    .compileComponents();

    fixture = TestBed.createComponent(LoginComponent);
    component = fixture.componentInstance;
    
    authServiceSpy = TestBed.inject(AuthService) as jasmine.SpyObj<AuthService>;
    routerSpy = TestBed.inject(Router) as jasmine.SpyObj<Router>;
    pushServiceSpy = TestBed.inject(PushNotificationService) as jasmine.SpyObj<PushNotificationService>;
    
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should call authService and navigate to map on successful standard login', () => {
    const mockUser = { id: 1, name: 'Test', role: 'user' };
    authServiceSpy.login.and.returnValue(of(mockUser));

    component.loginData = { email: 'test@test.com', password: '123' };
    component.onLogin();

    expect(authServiceSpy.login).toHaveBeenCalledWith({ email: 'test@test.com', password: '123' });
    expect(routerSpy.navigate).toHaveBeenCalledWith(['/map']);
    expect(pushServiceSpy.requestPermissionAndGetToken).toHaveBeenCalled();
  });

  it('should navigate to admin dashboard on successful admin login', () => {
    const mockUser = { id: 2, name: 'Admin', role: 'admin' };
    authServiceSpy.login.and.returnValue(of(mockUser));

    component.loginData = { email: 'admin@test.com', password: '123' };
    component.onLogin();

    expect(routerSpy.navigate).toHaveBeenCalledWith(['/admin']);
  });

  it('should show an alert on login error', () => {
    spyOn(window, 'alert');
    authServiceSpy.login.and.returnValue(throwError(() => new Error('Auth failed')));

    component.onLogin();

    expect(window.alert).toHaveBeenCalledWith('Credenciales incorrectas. Verifica tu email y contraseña.');
  });
});
