import { provideZonelessChangeDetection, signal } from '@angular/core';
import { TestBed } from '@angular/core/testing';
import { Login } from './login';
import { Auth } from '../../services/auth';
describe('Login', () => {
  it('keeps email validation and registration mode switching', () => {
    const auth = { isLoading: signal(false), login: jasmine.createSpy() };
    TestBed.configureTestingModule({
      providers: [provideZonelessChangeDetection(), { provide: Auth, useValue: auth }],
    });
    const login = TestBed.runInInjectionContext(() => new Login());
    login.email.set('invalid');
    login.password.set('password');
    login.onLogin();
    expect(login.errorMessage()).toContain('valid email');
    expect(auth.login).not.toHaveBeenCalled();
    login.toggleMode();
    expect(login.isRegisterMode()).toBeTrue();
    expect(login.errorMessage()).toBe('');
  });
});
