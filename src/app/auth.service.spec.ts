import { TestBed } from '@angular/core/testing';
import { HttpClientTestingModule, HttpTestingController } from '@angular/common/http/testing';
import { AuthService } from './auth.service';
import { environment } from '../environments/environment';

describe('AuthService', () => {
  let service: AuthService;
  let httpMock: HttpTestingController;

  beforeEach(() => {
    TestBed.configureTestingModule({
      imports: [HttpClientTestingModule],
      providers: [AuthService]
    });
    service = TestBed.inject(AuthService);
    httpMock = TestBed.inject(HttpTestingController);

    // Clear localStorage before each test
    localStorage.clear();
  });

  afterEach(() => {
    httpMock.verify();
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });

  it('should correctly log in a user and set localStorage', () => {
    const dummyUser = { id: 1, role: 'user', name: 'John Doe', healthProfile: { condition: 'Asthma' } };

    service.login({ email: 'test@example.com', password: 'password' }).subscribe(user => {
      expect(user).toEqual(dummyUser);
      expect(localStorage.getItem('userId')).toBe('1');
      expect(localStorage.getItem('role')).toBe('user');
      expect(localStorage.getItem('userName')).toBe('John Doe');
      expect(localStorage.getItem('healthCondition')).toBe('Asthma');
      expect(localStorage.getItem('token')).toBe('token-ficticio-sesion-activa');
    });

    const req = httpMock.expectOne(`${environment.apiUrl}/users/login`);
    expect(req.request.method).toBe('POST');
    req.flush(dummyUser);
  });

  it('should clear localStorage on logout', () => {
    // Set some initial data
    localStorage.setItem('token', 'test-token');
    localStorage.setItem('userId', '1');

    service.logout();

    expect(localStorage.getItem('token')).toBeNull();
    expect(localStorage.getItem('userId')).toBeNull();
    expect(service.isLoggedIn()).toBeFalse();
  });
});
