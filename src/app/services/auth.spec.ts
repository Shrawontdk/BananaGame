import { PLATFORM_ID, provideZonelessChangeDetection } from '@angular/core';
import { TestBed } from '@angular/core/testing';
import { Auth as FirebaseAuth } from '@angular/fire/auth';
import { Auth } from './auth';
describe('Auth SSR', () => {
  it('remains anonymous on the server without starting a browser auth listener', () => {
    TestBed.configureTestingModule({
      providers: [
        provideZonelessChangeDetection(),
        { provide: PLATFORM_ID, useValue: 'server' },
        { provide: FirebaseAuth, useValue: {} },
      ],
    });
    const auth = TestBed.inject(Auth);
    expect(auth.isBrowser).toBeFalse();
    expect(auth.isAuthenticated()).toBeFalse();
  });
});
