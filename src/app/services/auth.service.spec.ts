import { describe, it, expect, beforeEach } from 'vitest';
import { AuthService } from './auth.service';
import { HttpClientTestingModule, HttpTestingController } from '@angular/common/http/testing';
import { TestBed } from '@angular/core/testing';

describe('AuthService', () => {
  let service: AuthService;
  let httpMock: HttpTestingController;

  beforeEach(() => {
    TestBed.configureTestingModule({
      imports: [HttpClientTestingModule],
      providers: [AuthService],
    });

    service = TestBed.inject(AuthService);
    httpMock = TestBed.inject(HttpTestingController);
  });

  it('should authenticate user with valid email', () => {
    const mockEmail = 'Bret@april.biz';
    const mockUsers = [
      {
        id: 1,
        name: 'Bret',
        email: 'Bret@april.biz',
        username: 'Bret',
        phone: '1-770-736-8031',
        website: 'hildegard.org',
      },
    ];

    service.authenticate(mockEmail).subscribe((result) => {
      expect(result).toBe(true);
      expect(service.isAuthenticated()).toBe(true);
      expect(service.currentUser()?.email).toBe(mockEmail);
      expect(service.error()).toBeNull();
    });

    const req = httpMock.expectOne('https://jsonplaceholder.typicode.com/users');
    expect(req.request.method).toBe('GET');
    req.flush(mockUsers);

    httpMock.verify();
  });

  it('should fail authentication with invalid email format', () => {
    const invalidEmail = 'invalid-email';

    service.authenticate(invalidEmail).subscribe((result) => {
      expect(result).toBe(false);
      expect(service.isAuthenticated()).toBe(false);
      expect(service.error()).toBe('Please enter a valid email');
    });

    httpMock.expectNone('https://jsonplaceholder.typicode.com/users');
  });
});
