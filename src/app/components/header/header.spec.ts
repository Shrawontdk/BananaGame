import { TestBed } from '@angular/core/testing';
import { signal, provideZonelessChangeDetection } from '@angular/core';
import { of } from 'rxjs';
import { HeaderComponent } from './header';
import { Auth } from '../../services/auth';
import { GameStateService } from '../../services/game-state-service';
describe('Header', () => {
  it('signs out and clears local state without resetting the saved race', () => {
    const auth = {
      currentUser: signal({ username: 'driver@example.com' }),
      logout: jasmine.createSpy().and.returnValue(of(undefined)),
    };
    const state = { clearSession: jasmine.createSpy(), resetGame: jasmine.createSpy() };
    TestBed.configureTestingModule({
      providers: [
        provideZonelessChangeDetection(),
        { provide: Auth, useValue: auth },
        { provide: GameStateService, useValue: state },
      ],
    });
    const header = TestBed.runInInjectionContext(() => new HeaderComponent());
    header.onLogout();
    expect(auth.logout).toHaveBeenCalled();
    expect(state.clearSession).toHaveBeenCalled();
    expect(state.resetGame).not.toHaveBeenCalled();
    expect(header.name()).toBe('driver');
  });
});
